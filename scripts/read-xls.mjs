import fs from "node:fs";

const FREESECT = 0xffffffff;
const ENDOFCHAIN = 0xfffffffe;

function readU16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readU32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function sectorOffset(sector, sectorSize) {
  return 512 + sector * sectorSize;
}

function readSector(buffer, sector, sectorSize) {
  return buffer.subarray(sectorOffset(sector, sectorSize), sectorOffset(sector, sectorSize) + sectorSize);
}

function readDirectoryName(entry) {
  const byteLength = entry.readUInt16LE(64);
  return entry.subarray(0, Math.max(0, byteLength - 2)).toString("utf16le");
}

function readChain(buffer, fat, startSector, sectorSize) {
  const chunks = [];
  let sector = startSector;
  const seen = new Set();
  while (sector !== ENDOFCHAIN && sector !== FREESECT && !seen.has(sector)) {
    seen.add(sector);
    chunks.push(readSector(buffer, sector, sectorSize));
    sector = fat[sector];
  }
  return Buffer.concat(chunks);
}

export function parseCompoundFile(buffer) {
  const sectorSize = 1 << readU16(buffer, 30);
  const firstDirectorySector = readU32(buffer, 48);
  const difat = [];
  for (let offset = 76; offset < 512; offset += 4) {
    const sector = readU32(buffer, offset);
    if (sector !== FREESECT) difat.push(sector);
  }

  const fat = [];
  for (const sector of difat) {
    const fatSector = readSector(buffer, sector, sectorSize);
    for (let offset = 0; offset < fatSector.length; offset += 4) {
      fat.push(readU32(fatSector, offset));
    }
  }

  const directoryStream = readChain(buffer, fat, firstDirectorySector, sectorSize);
  const entries = [];
  for (let offset = 0; offset < directoryStream.length; offset += 128) {
    const entry = directoryStream.subarray(offset, offset + 128);
    const name = readDirectoryName(entry);
    if (!name) continue;
    entries.push({
      name,
      type: entry.readUInt8(66),
      startSector: readU32(entry, 116),
      size: Number(entry.readBigUInt64LE(120))
    });
  }

  const workbookEntry = entries.find((entry) => ["Workbook", "Book"].includes(entry.name));
  if (!workbookEntry) throw new Error("Workbook stream not found");

  return readChain(buffer, fat, workbookEntry.startSector, sectorSize).subarray(0, workbookEntry.size);
}

function decodeXlsString(buffer, state) {
  const charCount = readU16(buffer, state.offset);
  state.offset += 2;
  const flags = buffer[state.offset++];
  const isUtf16 = (flags & 0x01) !== 0;
  const hasRich = (flags & 0x08) !== 0;
  const hasExtended = (flags & 0x04) !== 0;
  const richRuns = hasRich ? readU16(buffer, state.offset) : 0;
  if (hasRich) state.offset += 2;
  const extendedSize = hasExtended ? readU32(buffer, state.offset) : 0;
  if (hasExtended) state.offset += 4;
  const byteLength = charCount * (isUtf16 ? 2 : 1);
  const raw = buffer.subarray(state.offset, state.offset + byteLength);
  state.offset += byteLength;
  if (hasRich) state.offset += richRuns * 4;
  if (hasExtended) state.offset += extendedSize;
  return isUtf16 ? raw.toString("utf16le") : raw.toString("latin1");
}

function rkValue(raw) {
  const multiplied = raw & 0x01;
  const integer = raw & 0x02;
  let value;
  if (integer) {
    value = raw >> 2;
  } else {
    const tmp = Buffer.alloc(8);
    tmp.writeUInt32LE(raw & 0xfffffffc, 4);
    value = tmp.readDoubleLE(0);
  }
  return multiplied ? value / 100 : value;
}

export function parseWorkbook(workbook) {
  const sharedStrings = [];
  const sstParts = [];
  const sheets = [];
  let offset = 0;
  while (offset + 4 <= workbook.length) {
    const type = readU16(workbook, offset);
    const length = readU16(workbook, offset + 2);
    const data = workbook.subarray(offset + 4, offset + 4 + length);

    if (type === 0x0085) {
      const sheetOffset = readU32(data, 0);
      const nameLength = data[6];
      const flags = data[7];
      const rawName = data.subarray(8, 8 + nameLength * ((flags & 0x01) ? 2 : 1));
      sheets.push({
        name: (flags & 0x01) ? rawName.toString("utf16le") : rawName.toString("latin1"),
        offset: sheetOffset
      });
    }

    if (type === 0x00fc) {
      sstParts.push(data);
    } else if (type === 0x003c && sstParts.length > 0) {
      sstParts.push(data.subarray(1));
    }

    offset += 4 + length;
  }

  if (sstParts.length > 0) {
    const sst = Buffer.concat(sstParts);
    const state = { offset: 8 };
    const uniqueCount = readU32(sst, 4);
    for (let i = 0; i < uniqueCount && state.offset < sst.length; i += 1) {
      sharedStrings.push(decodeXlsString(sst, state));
    }
  }

  return sheets.map((sheet, index) => ({
    ...sheet,
    rows: parseSheet(workbook, sheet.offset, sheets[index + 1]?.offset ?? workbook.length, sharedStrings)
  }));
}

function setCell(rows, row, col, value) {
  if (value === undefined || value === null || value === "") return;
  rows[row] ??= [];
  rows[row][col] = String(value).trim();
}

function parseSheet(workbook, start, end, sharedStrings) {
  const rows = [];
  let offset = start;
  while (offset + 4 <= end && offset + 4 <= workbook.length) {
    const type = readU16(workbook, offset);
    const length = readU16(workbook, offset + 2);
    const data = workbook.subarray(offset + 4, offset + 4 + length);
    if (type === 0x000a) break;

    if (type === 0x00fd && data.length >= 10) {
      setCell(rows, readU16(data, 0), readU16(data, 2), sharedStrings[readU32(data, 6)] ?? "");
    } else if (type === 0x0203 && data.length >= 14) {
      setCell(rows, readU16(data, 0), readU16(data, 2), data.readDoubleLE(6));
    } else if (type === 0x027e && data.length >= 10) {
      setCell(rows, readU16(data, 0), readU16(data, 2), rkValue(readU32(data, 6)));
    } else if (type === 0x0204 && data.length >= 8) {
      const row = readU16(data, 0);
      const col = readU16(data, 2);
      const state = { offset: 6 };
      setCell(rows, row, col, decodeXlsString(data, state));
    } else if (type === 0x00bd && data.length >= 6) {
      const row = readU16(data, 0);
      const firstCol = readU16(data, 2);
      for (let pos = 6, col = firstCol; pos + 6 <= data.length; pos += 6, col += 1) {
        setCell(rows, row, col, rkValue(readU32(data, pos + 2)));
      }
    }

    offset += 4 + length;
  }
  return rows.filter(Boolean);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: node scripts/read-xls.mjs <file.xls>");

  const workbook = parseCompoundFile(fs.readFileSync(file));
  const sheets = parseWorkbook(workbook);
  process.stdout.write(JSON.stringify(sheets, null, 2));
}

import { prisma } from "@/lib/prisma";
import { getAvailabilityConnector } from "./connectors";
import type { AvailabilitySourceRecord, NormalizedAvailabilitySlot } from "./types";

const SOURCE_TIMEOUT_MS = 12_000;
const CONCURRENCY = 5;

function slotSignature(slot: {
  externalKey: string;
  date: Date;
  startAt: Date | null;
  endAt: Date | null;
  status: string;
  precision: string;
}) {
  return [
    slot.externalKey,
    slot.date.toISOString().slice(0, 10),
    slot.startAt?.toISOString() ?? "",
    slot.endAt?.toISOString() ?? "",
    slot.status,
    slot.precision,
  ].join("|");
}

function normalizedSignature(slot: NormalizedAvailabilitySlot) {
  return slotSignature({
    externalKey: slot.externalKey,
    date: slot.date,
    startAt: slot.startAt ?? null,
    endAt: slot.endAt ?? null,
    status: slot.status,
    precision: slot.precision,
  });
}

function isDue(lastCheckedAt: Date | null, frequencyMinutes: number, now: Date) {
  if (!lastCheckedAt) return true;
  return now.getTime() - lastCheckedAt.getTime() >= Math.max(60, frequencyMinutes) * 60_000;
}

async function syncSource(source: AvailabilitySourceRecord) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  const checkedAt = new Date();

  try {
    const connector = getAvailabilityConnector(source);
    const payload = await connector.fetch(source, controller.signal);
    const slots = await connector.normalize(payload, source);
    const existing = await prisma.availabilitySlot.findMany({
      where: { sourceId: source.id },
      select: { externalKey: true, date: true, startAt: true, endAt: true, status: true, precision: true },
      orderBy: [{ date: "asc" }, { externalKey: "asc" }],
    });

    const oldFingerprint = existing.map(slotSignature).sort().join("\n");
    const newFingerprint = slots.map(normalizedSignature).sort().join("\n");
    const changed = oldFingerprint !== newFingerprint;

    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.deleteMany({ where: { sourceId: source.id } });
      if (slots.length) {
        await tx.availabilitySlot.createMany({
          data: slots.map((slot) => ({
            sourceId: source.id,
            externalKey: slot.externalKey,
            date: slot.date,
            startAt: slot.startAt ?? null,
            endAt: slot.endAt ?? null,
            status: slot.status,
            precision: slot.precision,
            checkedAt,
            sourceUpdatedAt: slot.sourceUpdatedAt ?? null,
            rawReference: slot.rawReference ?? null,
          })),
        });
      }
      await tx.availabilitySource.update({
        where: { id: source.id },
        data: {
          lastCheckedAt: checkedAt,
          lastSuccessAt: checkedAt,
          lastChangedAt: changed ? checkedAt : undefined,
          lastError: null,
        },
      });
    });

    return { sourceId: source.id, ok: true as const, changed, slots: slots.length };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : "Unknown availability sync error";
    await prisma.availabilitySource.update({
      where: { id: source.id },
      data: { lastCheckedAt: checkedAt, lastError: message },
    });
    return { sourceId: source.id, ok: false as const, changed: false, slots: 0, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runAvailabilitySync() {
  const startedAt = new Date();
  const run = await prisma.availabilitySyncRun.create({ data: { startedAt } });
  const allActive = await prisma.availabilitySource.findMany({ where: { active: true }, orderBy: { targetSlug: "asc" } });
  const dueSources = allActive.filter((source) => isDue(source.lastCheckedAt, source.syncFrequencyMinutes, startedAt));
  const results: Awaited<ReturnType<typeof syncSource>>[] = [];

  for (let index = 0; index < dueSources.length; index += CONCURRENCY) {
    const chunk = dueSources.slice(index, index + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map((source) => syncSource(source as AvailabilitySourceRecord)));
    results.push(...chunkResults);
  }

  const successfulSources = results.filter((result) => result.ok).length;
  const failedSources = results.length - successfulSources;
  const completedAt = new Date();

  await prisma.availabilitySyncRun.update({
    where: { id: run.id },
    data: {
      completedAt,
      status: failedSources === 0 ? "success" : successfulSources === 0 && failedSources > 0 ? "failed" : "partial",
      checkedSources: results.length,
      successfulSources,
      failedSources,
      metadata: {
        activeSources: allActive.length,
        skippedNotDue: allActive.length - dueSources.length,
        changedSources: results.filter((result) => result.changed).length,
      },
    },
  });

  return {
    runId: run.id,
    activeSources: allActive.length,
    checkedSources: results.length,
    successfulSources,
    failedSources,
    changedSources: results.filter((result) => result.changed).length,
    results,
  };
}

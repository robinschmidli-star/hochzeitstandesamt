import fs from "node:fs";
import path from "node:path";
import * as topojson from "topojson-client";
import { geoIdentity, geoPath } from "d3-geo";

const outputFile = process.argv[2] ?? "lib/swiss-map-paths.ts";

const cantonByBfsId = {
  1: "ZH",
  2: "BE",
  3: "LU",
  4: "UR",
  5: "SZ",
  6: "OW",
  7: "NW",
  8: "GL",
  9: "ZG",
  10: "FR",
  11: "SO",
  12: "BS",
  13: "BL",
  14: "SH",
  15: "AR",
  16: "AI",
  17: "SG",
  18: "GR",
  19: "AG",
  20: "TG",
  21: "TI",
  22: "VD",
  23: "VS",
  24: "NE",
  25: "GE",
  26: "JU"
};

const topo = JSON.parse(fs.readFileSync("node_modules/swiss-maps/2026/ch-combined.json", "utf8"));
const cantons = topojson.feature(topo, topo.objects.cantons);
const projection = geoIdentity().reflectY(true).fitSize([1000, 700], cantons);
const pathGenerator = geoPath(projection);

const paths = cantons.features.map((feature) => {
  const code = cantonByBfsId[feature.id];
  const centroid = pathGenerator.centroid(feature).map((value) => Number(value.toFixed(1)));
  const bounds = pathGenerator.bounds(feature).flat().map((value) => Number(value.toFixed(1)));
  return {
    code,
    d: pathGenerator(feature),
    label: centroid,
    bounds
  };
});

const content = `export type SwissCantonPath = {
  code: string;
  d: string;
  label: number[];
  bounds: number[];
};

export const swissCantonPaths = ${JSON.stringify(paths, null, 2)} satisfies SwissCantonPath[];
`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, content);
console.log(`Wrote ${paths.length} canton paths to ${outputFile}.`);

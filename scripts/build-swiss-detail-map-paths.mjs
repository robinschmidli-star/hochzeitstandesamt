import fs from "node:fs";
import * as topojson from "topojson-client";
import { geoIdentity, geoPath } from "d3-geo";

const outputFile = process.argv[2] ?? "lib/swiss-detail-map-paths.ts";

const topo = JSON.parse(fs.readFileSync("node_modules/swiss-maps/2026/ch-combined.json", "utf8"));
const country = topojson.feature(topo, topo.objects.country);
const projection = geoIdentity().reflectY(true).fitSize([1000, 700], country);
const path = geoPath(projection);

const toPaths = (objectName) =>
  topojson
    .feature(topo, topo.objects[objectName])
    .features.map((feature, index) => ({
      id: feature.id ?? index,
      d: path(feature)
    }))
    .filter((shape) => shape.d);

const municipalityPaths = toPaths("municipalities");
const lakePaths = toPaths("lakes");

const content = `export type SwissDetailMapPath = {
  id: string | number;
  d: string;
};

export const swissMunicipalityPaths = ${JSON.stringify(municipalityPaths, null, 2)} satisfies SwissDetailMapPath[];

export const swissLakePaths = ${JSON.stringify(lakePaths, null, 2)} satisfies SwissDetailMapPath[];
`;

fs.writeFileSync(outputFile, content);
console.log(
  `Wrote ${municipalityPaths.length} municipality paths and ${lakePaths.length} lake paths to ${outputFile}.`
);

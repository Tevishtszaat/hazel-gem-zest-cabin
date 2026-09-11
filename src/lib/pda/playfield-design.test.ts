import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cellsToRows,
  dumpPlayfieldDoc,
  loadPlayfieldDoc,
  preflightPlayfield,
  randomPoiPath,
  rowsToCells,
  RANDOM_POI_COLS,
} from "./playfield-design.ts";
import { playfieldFromText } from "./playfield.ts";

const sample = `PlayfieldType: Planet
PlanetType: Temperate
Gravity: -8.25
POIs:
  Random:
    - GroupName: AbandonedMine
      CountMinMax: [1, 2]
      DroneProb: 0.1
      TroopTransport: False
  Fixed:
    - Name: Outpost
      Prefab: BA_OutpostAkua
      Pos: [-10, 12, 4]
RandomResources:
  - Name: IronResource
    CountMinMax: [3, 5]
CreatureSpawning:
  - Biome: Islands
    Entities:
      - Name: TotalHorrors
        Period: Day
        Amount: 2
`;

describe("playfield designer", () => {
  it("roundtrips POI lists through yaml cells", () => {
    const doc = loadPlayfieldDoc(sample)!;
    const path = randomPoiPath(doc);
    assert.deepEqual(path, ["POIs", "Random"]);
    const rows = (doc.POIs as { Random: Record<string, unknown>[] }).Random;
    const cells = rowsToCells(rows, RANDOM_POI_COLS);
    assert.equal(cells[0]?.GroupName, "AbandonedMine");
    assert.equal(cells[0]?.CountMinMax, "1, 2");
    cells[0]!.CountMinMax = "2, 4";
    const next = cellsToRows(cells, RANDOM_POI_COLS, rows);
    assert.deepEqual(next[0]?.CountMinMax, [2, 4]);
    assert.equal(next[0]?.GroupName, "AbandonedMine");
    const dumped = dumpPlayfieldDoc({ ...doc, POIs: { ...(doc.POIs as object), Random: next } });
    assert.match(dumped, /GroupName: AbandonedMine/);
    assert.match(dumped, /CountMinMax:/);
    assert.match(dumped, /2/);
    assert.match(dumped, /4/);
  });

  it("flags inverted counts and missing names", () => {
    const bad = playfieldFromText(
      "Playfields/Akua/playfield.yaml",
      `PlayfieldType: Planet
POIs:
  Random:
    - GroupName: JunkT1
      CountMinMax: [5, 1]
CreatureSpawning:
  - Biome: Grove
    Entities:
      - Period: Night
`,
    );
    const issues = preflightPlayfield(bad);
    assert.ok(issues.some((i) => i.code === "range"));
    assert.ok(issues.some((i) => i.code === "creature"));
    assert.ok(issues.some((i) => i.code === "gravity"));
  });
});

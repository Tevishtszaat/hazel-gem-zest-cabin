import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPairs, parsePairs, parseRandomPreset, parseWeights, presetFileName, writeRandomPreset } from "./random-preset.ts";
import { classifyScenarioPath } from "./scenario-index.ts";

const SAMPLE = `---
GenerationParams:
  MapScale: 1.0
  PlanetCountProbs:
    - '0 : 0.7,  1 : 0.3' # 1 - Gas Planets
  PlanetLists:
    - 'Jupiter:0.45, Saturn:0.55' # 1 Gas
  POICountProbs: '0 : 0.4,  1 : 0.6'
  POIs: 'SpaceEmpty:0.2, POIExploreT1:0.8'
  PlanetTypes:
      - Name: Jupiter
        Color: [0.2, 0.5, 0.6]
        Placement:
            - HabitableTemperate
        MoonProb: '2:0.5, 3:0.5'
        MoonType: [EdenMoonBarren]
        Climate: Barren
        Playfields:
            - GasGiant, 1
  OrbitTypes:
      - Name: DefaultOrbit
        HasOrbit: false
        Playfields:
            - EdenSpaceG_Orbit
`;

describe("random presets", () => {
  it("classifies RandomPresets yaml and keeps star-class file names", () => {
    assert.equal(
      classifyScenarioPath("Ascension-Reborn/RandomPresets/SolarSystemConfig_MainHotT1.yaml"),
      "randomPreset",
    );
    assert.equal(presetFileName("MainHot"), "SolarSystemConfig_MainHot.yaml");
  });

  it("reads count rows, planet lists, and type playfields", () => {
    const doc = parseRandomPreset(SAMPLE);
    assert.equal(doc.scalars[0]?.key, "MapScale");
    assert.equal(doc.countRows[0]?.comment, "1 - Gas Planets");
    assert.equal(parsePairs(doc.countRows[0]!.raw)[1]?.prob, "0.3");
    assert.equal(parseWeights(doc.listRows[0]!.raw)[0]?.name, "Jupiter");
    assert.equal(doc.types[0]?.name, "Jupiter");
    assert.equal(doc.types[0]?.placement, "HabitableTemperate");
    assert.equal(doc.types[0]?.playfields[0]?.name, "GasGiant");
    assert.equal(doc.types[1]?.section, "OrbitTypes");
    const back = parseRandomPreset(writeRandomPreset(doc));
    assert.equal(back.countRows.length, 1);
    assert.equal(back.types[0]?.moonType, "[EdenMoonBarren]");
    assert.equal(formatPairs(parsePairs("0 : 1")), "0 : 1");
  });
});

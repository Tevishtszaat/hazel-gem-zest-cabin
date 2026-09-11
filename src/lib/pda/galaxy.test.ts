import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEcfObjects } from "./ecf.ts";
import {
  applyZoneDrag,
  auToSectors,
  fieldToHex,
  hexToField,
  luminosityOf,
  parseRange,
  parseSectorBodies,
  parseStarMix,
  physicsHabitableAU,
  solarFlux,
  starZoneSpans,
  writeStarMix,
  zoneAtDistance,
  zoneHandleList,
  zoneWarnings,
} from "./galaxy.ts";
import { fileMatchesKind } from "./import-kinds.ts";

describe("galaxy habitable zones", () => {
  it("parses sector ranges and inverse-square flux", () => {
    assert.deepEqual(parseRange("64, 69"), { min: 64, max: 69 });
    assert.equal(solarFlux(1, 10).toFixed(2), "1.00");
    assert.ok(solarFlux(1, 66) < 0.03);
    const hz = physicsHabitableAU(1);
    assert.ok(hz.inner > 0.9 && hz.inner < 1);
    assert.equal(auToSectors(1), 10);
  });

  it("maps G-type generation bands and flags temperate vs physics HZ", () => {
    const star = parseEcfObjects(`{ GalaxyConfig Name: G Type Star
  StarClass: G
  Luminosity: 1
  InnerSystem: "5, 56"
  HabitableHot: "57, 63"
  HabitableTemperate: "64, 69"
  HabitableCold: "70, 75"
  OuterSystem: "76, 132"
}
`)[0]!;
    assert.equal(luminosityOf(star), 1);
    const spans = starZoneSpans(star);
    assert.equal(spans[2]?.key, "HabitableTemperate");
    assert.equal(zoneAtDistance(star, 66)?.label, "Temperate");
    assert.equal(zoneAtDistance(star, 12)?.label, "Inner");
    const warns = zoneWarnings(star);
    assert.ok(warns.some((w) => /physics HZ/i.test(w)));
  });

  it("reads playfield distances from Sectors.yaml", () => {
    const bodies = parseSectorBodies(`
- Name: Ellyon
  StarClass: G
  Playfields:
    - ['0, 0, 0', Ellyon, Sun]
    - ['66, 0, 0', Akua, Planet]
    - ['12, 0, 0', TooCloseLava, Planet]
`);
    const akua = bodies.find((b) => b.name === "Akua");
    assert.ok(akua);
    assert.equal(akua.distance, 66);
    assert.equal(akua.starClass, "G");
    assert.equal(akua.kind.trim(), "Planet");
  });

  it("round-trips region star mix and shared zone handles", () => {
    const general = parseEcfObjects(`{ GalaxyConfig Name: General
  { Child StarRegion_2
    Name: Inner Sphere
    StarClass_1: G, param1: "Prob=0.4, ClusterProb=0"
    StarClass_2: K, param1: "Prob=0.4, ClusterProb=0"
    StarClass_3: M, param1: "Prob=0.2, SpawnAmount=8"
  }
}
`)[0]!;
    const mix = parseStarMix(general.children?.[0]?.fields ?? {});
    assert.equal(mix.length, 3);
    assert.equal(mix[0]?.starClass, "G");
    assert.equal(mix[0]?.prob, "0.4");
    assert.equal(mix[2]?.spawnAmount, "8");
    const written = writeStarMix({}, mix);
    assert.match(written.StarClass_1!, /G, param1:/);
    assert.match(written.StarClass_3!, /SpawnAmount=8/);

    const star = parseEcfObjects(`{ GalaxyConfig Name: G Type Star
  InnerSystem: "5, 56"
  HabitableHot: "57, 63"
  HabitableTemperate: "64, 69"
  HabitableCold: "70, 75"
  OuterSystem: "76, 132"
}
`)[0]!;
    const spans = starZoneSpans(star);
    const join = zoneHandleList(spans).find((h) => h.kind === "join");
    assert.ok(join);
    const moved = applyZoneDrag(spans, join, 50);
    assert.equal(moved[0]?.max, 50);
    assert.equal(moved[1]?.min, 51);
    assert.equal(fieldToHex("1,0,0"), "#ff0000");
    assert.equal(hexToField("#ffffff"), "1,1,1");
  });

  it("matches GalaxyConfig on its own import slot", () => {
    assert.equal(fileMatchesKind("Configuration/GalaxyConfig.ecf", "galaxy"), true);
    assert.equal(fileMatchesKind("Configuration/GalaxyConfig.ecf", "configs"), true);
    assert.equal(fileMatchesKind("Configuration/ItemsConfig.ecf", "galaxy"), false);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEcfObjects } from "./ecf.ts";
import {
  applyOrbitFixes,
  applyZoneDrag,
  axisMax,
  auToSectors,
  diagnoseOrbits,
  fieldToHex,
  hexToField,
  luminosityForFlux,
  luminosityOf,
  luminosityWindowForBody,
  systemLuminosityWindow,
  overlayBodies,
  parseRange,
  parseSectorBodies,
  parseStarMix,
  placeBodyLabels,
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
    const star = { kind: "GalaxyConfig", plus: false, name: "G Type Star", fields: { StarClass: "G" } };
    const overlay = overlayBodies(star, bodies);
    assert.ok(!overlay.some((b) => b.name === "Ellyon"));
    const packed = overlayBodies(star, [
      ...bodies,
      { system: "Ellyon", starClass: "G", name: "AkuaOrbit", kind: "Space", coords: [66, 1, 0], distance: 66.01 },
      { system: "Ellyon", starClass: "G", name: "AkuaMoon", kind: "Moon", coords: [67, 0, 0], distance: 67 },
    ]);
    const { placed, hidden } = placeBodyLabels(packed, (s) => s * 4, 64, 4);
    assert.ok(placed.length >= 2);
    const xs = placed.filter((p) => p.lane === 0).map((p) => p.x);
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i]! - xs[i - 1]! >= 64);
    assert.equal(typeof hidden, "number");
    const scaled = axisMax(
      { kind: "GalaxyConfig", plus: false, name: "G Type Star", fields: { StarClass: "G", OuterSystem: "76, 132" } },
      [...packed, { system: "Ellyon", name: "Laboratorio", kind: "Space", coords: [59264, 0, 0], distance: 59264 }],
    );
    assert.ok(scaled < 400, `scale should ignore 59264 outlier, got ${scaled}`);
    assert.ok(scaled >= 132);
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

  it("suggests luminosity min/max from planet distance using inverse-square", () => {
    assert.equal(luminosityForFlux(1, 10).toFixed(2), "1.00");
    const temp = luminosityWindowForBody("temperate", 10);
    assert.ok(temp);
    assert.equal(temp?.suggest.toFixed(2), "1.00");
    assert.ok((temp?.suggestMax ?? 0) >= 1);
    assert.ok((temp?.min ?? 1) < 1);
    const star = parseEcfObjects(`{ GalaxyConfig Name: G Type Star
  StarClass: G
  Luminosity: 1
  HabitableTemperate: "64, 69"
}
`)[0]!;
    const sys = systemLuminosityWindow(star, [
      { system: "Ellyon", name: "Akua", kind: "Planet", playfieldType: "Temperate", coords: [10, 0, 0], distance: 10 },
      { system: "Ellyon", name: "Ash", kind: "Planet", playfieldType: "Lava", coords: [5, 0, 0], distance: 5 },
    ]);
    assert.ok(sys);
    assert.equal(sys?.bodies.length, 2);
    assert.ok((sys?.suggestMax ?? 0) > 0);
    assert.ok((sys?.max ?? 0) >= (sys?.suggestMax ?? 99) || sys?.conflict);
  });

  it("diagnoses lava/ice planets and stray moons, then rewrites Sectors.yaml", () => {
    const star = parseEcfObjects(`{ GalaxyConfig Name: G Type Star
  StarClass: G
  InnerSystem: "5, 56"
  HabitableHot: "57, 63"
  HabitableTemperate: "64, 69"
  HabitableCold: "70, 75"
  OuterSystem: "76, 132"
}
`)[0]!;
    const yaml = `
- Name: Ellyon
  StarClass: G
  Playfields:
    - ['0, 0, 0', Ellyon, Sun]
    - ['66, 0, 0', TooCloseLava, Planet, Lava]
    - ['12, 0, 0', Snowdrift, Planet, Snow]
    - ['66, 0, 0', Akua, Planet, Temperate]
    - ['400, 0, 0', AkuaMoon, Moon]
    - ['59264, 0, 0', Laboratorio, Planet, Barren]
`;
    const bodies = parseSectorBodies(yaml);
    assert.equal(bodies.find((b) => b.name === "TooCloseLava")?.playfieldType, "Lava");
    const issues = diagnoseOrbits(star, overlayBodies(star, bodies));
    const lava = issues.find((i) => i.body.name === "TooCloseLava");
    const snow = issues.find((i) => i.body.name === "Snowdrift");
    const moon = issues.find((i) => i.body.name === "AkuaMoon");
    const lab = issues.find((i) => i.body.name === "Laboratorio");
    const akua = issues.find((i) => i.body.name === "Akua");
    assert.ok(lava);
    assert.equal(lava?.expectedZone, "InnerSystem");
    assert.ok((lava?.suggestedDistance ?? 99) <= 56);
    assert.ok(snow);
    assert.equal(snow?.expectedZone, "HabitableCold");
    assert.ok((snow?.suggestedDistance ?? 0) >= 70);
    assert.ok(moon);
    assert.equal(moon?.expectedZone, "parent");
    assert.ok((moon?.suggestedDistance ?? 0) < 80);
    assert.ok(lab);
    assert.equal(lab?.expectedZone, "OuterSystem");
    assert.equal(akua, undefined);
    const next = applyOrbitFixes(yaml, issues.map((i) => ({ name: i.body.name, coords: i.suggested })));
    const moved = parseSectorBodies(next);
    assert.ok((moved.find((b) => b.name === "TooCloseLava")?.distance ?? 99) <= 56);
    assert.ok((moved.find((b) => b.name === "Laboratorio")?.distance ?? 0) <= 132);
    assert.match(next, /TooCloseLava/);
  });
});

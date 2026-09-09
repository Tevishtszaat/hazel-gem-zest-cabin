import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEcfObjects } from "./ecf.ts";
import {
  luminosityOf,
  parseRange,
  parseSectorBodies,
  physicsHabitableAU,
  solarFlux,
  starZoneSpans,
  zoneAtDistance,
  zoneWarnings,
  auToSectors,
} from "./galaxy.ts";

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
});

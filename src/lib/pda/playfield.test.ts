import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bundlePlayfields,
  classifyPlayfieldKind,
  isPlayfieldBasename,
  patchYamlField,
  playfieldFromText,
  yamlScalars,
} from "./playfield.ts";
import { classifyScenarioPath, collectCatalogTexts } from "./scenario-index.ts";

describe("playfield yaml variants", () => {
  it("classifies planet, orbit, and space file names", () => {
    assert.equal(isPlayfieldBasename("playfield.yaml"), true);
    assert.equal(isPlayfieldBasename("playfield_dynamic.yaml"), true);
    assert.equal(isPlayfieldBasename("space_dynamic.yaml"), true);
    assert.equal(classifyScenarioPath("Playfields/Akua/playfield.yaml"), "playfieldYaml");
    assert.equal(classifyScenarioPath("Playfields/Akua Orbit/playfield_dynamic.yaml"), "playfieldYaml");
    assert.equal(classifyScenarioPath("Content/Playfields/OpenSpace/space_dynamic.yaml"), "playfieldYaml");
  });

  it("detects planet vs orbit vs space from PlayfieldType and file variant", () => {
    const planet = playfieldFromText(
      "Playfields/Akua/playfield.yaml",
      `PlayfieldType: Planet
PlanetType: Temperate
Gravity: -8.25
AtmosphereO2: 0.1
AtmosphereBreathable: False
`,
    );
    assert.equal(planet.kind, "planet");
    assert.equal(planet.fields.Gravity, "-8.25");
    const moon = playfieldFromText(
      "Playfields/Akua Moon/playfield.yaml",
      `PlayfieldType: Planet
PlanetType: Moon
Gravity: -1.6
`,
    );
    assert.equal(moon.kind, "moon");
    const orbit = playfieldFromText(
      "Playfields/Akua Orbit/playfield_dynamic.yaml",
      `PlayfieldType: Space
PlanetType: Space
Skybox: [SunFlareWhiteSpace, SkyboxStarsBlack]
`,
    );
    assert.equal(orbit.kind, "orbit");
    const space = playfieldFromText(
      "Playfields/DeepSpace/space_dynamic.yaml",
      `PlayfieldType: Space
PlanetType: Space
PvP: True
`,
    );
    assert.equal(space.kind, "space");
    assert.equal(classifyPlayfieldKind({ PlayfieldType: "Planet" }, "Lava", "playfield"), "planet");
  });

  it("patches scalars without wiping the rest of the yaml", () => {
    const src = `# Atmosphere and Sky
Gravity: -8.25
PvP: False
`;
    const next = patchYamlField(src, "Gravity", "-9.81");
    assert.match(next, /Gravity: -9.81/);
    assert.match(next, /PvP: False/);
    assert.match(next, /# Atmosphere/);
    const scalars = yamlScalars(next);
    assert.equal(scalars.Gravity, "-9.81");
  });

  it("keeps every playfield file as its own catalog text", () => {
    const files = [
      {
        path: "S/Playfields/Akua/playfield.yaml",
        text: "PlayfieldType: Planet\nPlanetType: Temperate\nGravity: -8\n",
      },
      {
        path: "S/Playfields/Akua Orbit/playfield_dynamic.yaml",
        text: "PlayfieldType: Space\nPlanetType: Space\n",
      },
    ];
    const texts = collectCatalogTexts(files);
    assert.equal(texts.filter((t) => t.role === "playfieldYaml").length, 2);
    const bundles = bundlePlayfields(texts);
    assert.equal(bundles.length, 2);
    assert.ok(bundles.some((b) => b.kind === "planet"));
    assert.ok(bundles.some((b) => b.kind === "orbit"));
  });
});

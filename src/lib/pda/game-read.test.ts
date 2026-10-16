import assert from "node:assert/strict";
import test from "node:test";
import * as yaml from "js-yaml";
import { parseCsv, stringifyCsv } from "./csv.ts";
import { parseDialogueDoc, serializeDialogues } from "./dialogues.ts";
import { parseEcfObjects, stringifyEcfObjects } from "./ecf.ts";
import { formatYamlValue } from "./playfield.ts";
import { parseRandomPreset, writeRandomPreset } from "./random-preset.ts";
import { formatPlayfield, parseVolumeSystems, patchPlayfield } from "./volume.ts";

const load = (yaml as { load: (text: string) => unknown }).load ?? (yaml as unknown as { default: { load: (text: string) => unknown } }).default.load;

test("Empyrion can read sector playfields that contain spaces, hashes, and colons", () => {
  const lines = [
    formatPlayfield("  ", { local: [0, 0, 0], name: "Akua #2", kind: "Planet", playfieldType: "Temperate", quoted: true }),
    formatPlayfield("  ", { local: [-12, 0, 4], name: "Sector: Alpha", kind: "Moon", playfieldType: "Moon Desert", quoted: true }),
    formatPlayfield("  ", { local: [8, 1, 2], name: "Pearl's Eye", kind: "AscArcticWater", quoted: false }),
  ];
  const doc = load(`Playfields:\n${lines.join("\n")}\n`) as { Playfields: string[][] };
  assert.deepEqual(doc.Playfields[0], ["0, 0, 0", "Akua #2", "Planet", "Temperate"]);
  assert.deepEqual(doc.Playfields[1], ["-12, 0, 4", "Sector: Alpha", "Moon", "Moon Desert"]);
  assert.equal(doc.Playfields[2]?.[3], "Pearl's Eye");
  const systems = parseVolumeSystems(`Sectors:\n- Name: Pearl\n  Playfields:\n${lines.join("\n")}\n`);
  assert.equal(systems[0]?.bodies[0]?.name, "Akua #2");
  assert.equal(systems[0]?.bodies[1]?.name, "Sector: Alpha");
  assert.deepEqual(systems[0]?.bodies[1]?.local, [-12, 0, 4]);
});

test("a patched sector line stays valid YAML for the game", () => {
  const yamlText = `Sectors:
- Name: Pearl
  Coordinates: [0, 0, 0]
  Playfields:
  - ['0, 0, 0', Pearls Eye, AscArcticWater]
`;
  const body = parseVolumeSystems(yamlText)[0]?.bodies[0];
  assert.ok(body);
  const next = patchPlayfield(yamlText, body!, { ...body!, name: "Pearls Eye #1", kind: "Planet", playfieldType: "Asc Arctic", local: [120, 0, 40] });
  const doc = load(next) as { Sectors: { Playfields: string[][] }[] };
  assert.deepEqual(doc.Sectors[0]?.Playfields[0], ["120, 0, 40", "Pearls Eye #1", "Planet", "Asc Arctic"]);
});

test("Empyrion ECF keeps hashes, commas, and quotes without backslash escapes", () => {
  const text = stringifyEcfObjects([
    {
      kind: "Item",
      plus: true,
      name: 'Core "A"',
      id: "5",
      fields: { Description: 'a "hot" # core, really', Mass: "1" },
    },
    {
      kind: "Faction",
      plus: false,
      name: "Talon",
      fields: { Abbrev: "TLN" },
    },
  ]);
  assert.doesNotMatch(text, /\\"/);
  assert.match(text, /Description: "a 'hot' # core, really"/);
  const back = parseEcfObjects(text);
  assert.equal(back[0]?.name, "Core 'A'");
  assert.equal(back[0]?.fields.Description, "a 'hot' # core, really");
  assert.equal(back[1]?.name, "Talon");
  assert.equal(back[0]?.id, "5");
});

test("playfield yaml values survive YamlDotNet-style load", () => {
  const fields = [
    `Biome: ${formatYamlValue("Lava\nWorld")}`,
    `PlanetType: ${formatYamlValue("yes")}`,
    `Description: ${formatYamlValue('Hot #1 "core"')}`,
    `Gravity: ${formatYamlValue("1.2")}`,
    `UseDayNight: ${formatYamlValue("true")}`,
  ];
  const doc = load(`Playfield:\n  ${fields.join("\n  ")}\n`) as { Playfield: Record<string, string> };
  assert.equal(doc.Playfield.Biome, "Lava\nWorld");
  assert.equal(doc.Playfield.PlanetType, "yes");
  assert.equal(doc.Playfield.Description, 'Hot #1 "core"');
  assert.equal(doc.Playfield.Gravity, 1.2);
  assert.equal(doc.Playfield.UseDayNight, true);
  assert.match(formatYamlValue("yes"), /^"/);
});

test("random preset files with hashes still parse as YAML", () => {
  const doc = parseRandomPreset(`---
GenerationParams:
  MapScale: 1.0
  PlanetCountProbs:
    - '0 : 1'
  PlanetLists:
    - 'Temperate:1'
  POICountProbs: '0 : 1'
  POIs: 'SpaceEmpty:1'
  PlanetTypes:
      - Name: Hot
        Climate: Barren
        Playfields:
            - GasGiant, 1
`);
  doc.types[0]!.name = "Hot #1";
  doc.types[0]!.playfields[0]!.name = "Gas: Giant";
  const text = writeRandomPreset(doc);
  const loaded = load(text) as { GenerationParams: { PlanetTypes: { Name: string; Playfields: string[] }[] } };
  assert.equal(loaded.GenerationParams.PlanetTypes[0]?.Name, "Hot #1");
  assert.equal(loaded.GenerationParams.PlanetTypes[0]?.Playfields[0], "Gas: Giant");
});

test("dialogue files do not emit escapes the game ECF reader rejects", () => {
  const text = serializeDialogues([
    {
      name: 'Trader "Bob"',
      npcName: "Bob",
      output: 'Say "hello"',
      comment: "",
      barkingState: "",
      requiredStates: "",
      variables: [{ index: 1, name: "Flag", param1: "1, 2" }],
      fields: {},
      options: [{ index: 1, text: "Bye #1", next: "End: Now", iff: "", execute: "if (true) { x = 1; } ]]>" }],
      nexts: [],
    },
  ]);
  assert.doesNotMatch(text, /\\"/);
  assert.doesNotMatch(text, /\]\]>\]\]>/);
  const back = parseDialogueDoc(text);
  assert.equal(back.states[0]?.name, "Trader 'Bob'");
  assert.equal(back.states[0]?.output, "Say 'hello'");
  assert.equal(back.states[0]?.options[0]?.text, "Bye #1");
  assert.equal(back.states[0]?.options[0]?.next, "End: Now");
  assert.match(back.states[0]?.options[0]?.execute || "", /\]\] >/);
});

test("localization csv stays one row per key so Empyrion does not split lines", () => {
  const text = stringifyCsv({
    languages: ["English", "German"],
    rows: { txt_hello: { English: 'Hello, "captain"\nWelcome', German: "Hallo" } },
  });
  assert.equal(text.trim().split("\n").length, 2);
  const parsed = parseCsv(text);
  assert.equal(parsed.rows.txt_hello?.English, 'Hello, "captain"\nWelcome');
  assert.equal(parsed.rows.txt_hello?.German, "Hallo");
});

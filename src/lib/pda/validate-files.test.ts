import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog } from "./scenario-index.ts";
import { applyEcfFix, validateCatalog } from "./validate-files.ts";
import { fillLocalizationEnglish } from "./csv.ts";
import { renameSectorBody } from "./galaxy.ts";

describe("file-kind debug", () => {
  it("flags duplicate item ids and can reassign", () => {
    const catalog = {
      ...emptyCatalog(),
      folderName: "S",
      indexedAt: 1,
      texts: [
        {
          role: "items",
          path: "ItemsConfig.ecf",
          text: `{ Item Id: 10, Name: Alpha
}
{ Item Id: 10, Name: Beta
}
`,
        },
      ],
      files: [{ role: "items", path: "ItemsConfig.ecf", count: 2 }],
      entries: [
        { kind: "item" as const, name: "Alpha", source: "items" },
        { kind: "item" as const, name: "Beta", source: "items" },
      ],
    };
    const issues = validateCatalog(catalog, "items");
    const dup = issues.find((i) => i.code === "duplicate-id" && i.source === "items");
    assert.ok(dup);
    assert.equal(dup?.fixes[0]?.type, "ecf-set");
    const next = applyEcfFix(catalog.texts[0]!.text, "Beta", "Id", "11");
    assert.match(next, /Name: Beta/);
    assert.match(next, /Id: 11/);
  });

  it("accepts the engine faction Player on a block", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [
        {
          role: "blocks",
          path: "BlocksConfig.ecf",
          text: `{ Block Name: CPUExtenderHVT3
  Faction: Player
}
{ Block Name: AlienCore
  Faction: NotAFaction
}
`,
        },
      ],
      files: [{ role: "blocks", path: "BlocksConfig.ecf", count: 2 }],
      entries: [
        { kind: "block" as const, name: "CPUExtenderHVT3", source: "blocks" },
        { kind: "block" as const, name: "AlienCore", source: "blocks" },
        { kind: "faction" as const, name: "Talon", source: "factions" },
      ],
    };
    const issues = validateCatalog(catalog, "blocks");
    assert.equal(issues.some((i) => i.message.includes("CPUExtenderHVT3") && i.message.includes("Player")), false);
    assert.ok(issues.some((i) => i.code === "faction" && i.message.includes("NotAFaction")));
  });

  it("suggests moving a planet into its star band", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [
        {
          role: "galaxy",
          path: "GalaxyConfig.ecf",
          text: `{ GalaxyConfig Name: G Type Star
  StarClass: G
  InnerSystem: "5, 56"
  HabitableHot: "57, 63"
  HabitableTemperate: "64, 69"
  HabitableCold: "70, 75"
  OuterSystem: "76, 132"
}
`,
        },
        {
          role: "sectors",
          path: "Sectors.yaml",
          text: `- Name: System
  StarClass: G
  Playfields:
    - ['4, 0, 0', Akua, Planet, Temperate]
`,
        },
      ],
      files: [
        { role: "galaxy", path: "GalaxyConfig.ecf", count: 1 },
        { role: "sectors", path: "Sectors.yaml", count: 1 },
      ],
      entries: [{ kind: "playfield" as const, name: "Akua", source: "playfields" }],
    };
    const issues = validateCatalog(catalog, "galaxy");
    const hit = issues.find((i) => i.code === "orbit" && i.message.includes("Akua"));
    assert.ok(hit);
    assert.match(hit?.message ?? "", /Temperate band/);
    assert.equal(hit?.fixes[0]?.type, "orbit-move");
    assert.match(hit?.fixes[0]?.label ?? "", /Move to Temperate/);
  });

  it("suggests English text for empty localization keys", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [
        {
          role: "localization",
          path: "Localization.csv",
          text: "Key,English,German\nAlpha,,Hallo\nEden_TreasureBox,,\n",
        },
      ],
      files: [{ role: "localization", path: "Localization.csv", count: 2 }],
      entries: [{ kind: "item" as const, name: "Alpha", source: "items" }],
    };
    const issues = validateCatalog(catalog, "localization");
    const alpha = issues.find((i) => i.path === "Alpha");
    const box = issues.find((i) => i.path === "Eden_TreasureBox");
    const all = issues.find((i) => i.path === "Localization.csv");
    assert.match(alpha?.message ?? "", /Hallo/);
    assert.equal(alpha?.fixes[0]?.label, "Copy German into English");
    assert.match(box?.fixes[0]?.label ?? "", /Eden Treasure Box/);
    assert.equal(all?.fixes[0]?.label, "Fill every empty English cell");
    const filled = fillLocalizationEnglish(catalog.texts[0]!.text);
    assert.match(filled, /Alpha,Hallo,Hallo/);
    assert.match(filled, /Eden_TreasureBox,Eden Treasure Box,/);
  });

  it("offers the closest playfield folder for a sector body", () => {
    const yaml = `- Name: System
  Playfields:
    - ['10, 0, 0', Creative Sector, Space, Space]
    - ['12, 0, 0', Atlantis, Planet, Temperate]
    - ['14, 0, 0', Nowhere, Planet, Barren]
`;
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "sectors", path: "Sectors.yaml", text: yaml }],
      files: [{ role: "sectors", path: "Sectors.yaml", count: 1 }],
      entries: [
        { kind: "playfield" as const, name: "CreativeSector", source: "Playfields/CreativeSector" },
        { kind: "playfield" as const, name: "AtlantisBase", source: "Playfields/AtlantisBase" },
        { kind: "playfield" as const, name: "Akua", source: "Playfields/Akua" },
      ],
    };
    const issues = validateCatalog(catalog, "sectors");
    const creative = issues.find((i) => i.value === "Creative Sector");
    const atlantis = issues.find((i) => i.value === "Atlantis");
    const nowhere = issues.find((i) => i.value === "Nowhere");
    assert.equal(creative?.fixes[0]?.label, "Use CreativeSector");
    assert.equal(creative?.recommend, "fix");
    assert.equal(atlantis?.fixes[0]?.label, "Use AtlantisBase");
    assert.equal(nowhere?.fixes.length, 0);
    const renamed = renameSectorBody(yaml, "Creative Sector", "CreativeSector");
    assert.match(renamed, /CreativeSector, Space/);
    assert.doesNotMatch(renamed, /Creative Sector/);
  });
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { extractEcfRecords } from "./ecf.ts";
import { classifyScenarioPath, collectCatalogTexts, indexScenario, lookupCatalog, mergeCatalog, suggestionsFor } from "./scenario-index.ts";
import { importPda } from "./yaml-import.ts";
import { validateProject } from "./validate.ts";

const sampleDir = path.resolve("public/samples/tutorial");

function readAll(dir: string, prefix = ""): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (fs.statSync(full).isDirectory()) out.push(...readAll(full, rel));
    else out.push({ path: `Tutorial/${rel}`, text: fs.readFileSync(full, "utf8") });
  }
  return out;
}

describe("scenario folder index", () => {
  it("classifies Empyrion scenario paths", () => {
    assert.equal(classifyScenarioPath("Reforged Eden/Extras/PDA/PDA.yaml"), "pdaYaml");
    assert.equal(classifyScenarioPath("Content/Configuration/Dialogues.ecf"), "dialogues");
    assert.equal(classifyScenarioPath("Content/Configuration/Dialogues.csv"), "dialoguesCsv");
    assert.equal(classifyScenarioPath("lines.csv", "dialoguesCsv"), "dialoguesCsv");
    assert.equal(classifyScenarioPath("Content/Configuration/Templates.ecf"), "templates");
    assert.equal(classifyScenarioPath("Content/Configuration/DefReputation.ecf"), "reputation");
    assert.equal(classifyScenarioPath("Content/Configuration/FactionWarfare.ecf"), "warfare");
    assert.equal(classifyScenarioPath("Content/Configuration/GalaxyConfig.ecf"), "galaxy");
    assert.equal(classifyScenarioPath("Content/Configuration/Containers.ecf"), "containers");
    assert.equal(classifyScenarioPath("Content/Configuration/LootGroups.ecf"), "lootgroups");
    assert.equal(classifyScenarioPath("Content/Configuration/TraderNPCConfig.ecf"), "traders");
    assert.equal(classifyScenarioPath("Content/Configuration/MaterialConfig.ecf"), "materials");
    assert.equal(classifyScenarioPath("Content/Configuration/StatusEffects.ecf"), "statuseffects");
    assert.equal(classifyScenarioPath("Content/Configuration/GlobalDefsConfig.ecf"), "globaldefs");
    assert.equal(classifyScenarioPath("Content/Configuration/BlockGroupsConfig.ecf"), "blockgroups");
    assert.equal(classifyScenarioPath("Content/Configuration/BlockShapesWindow.ecf"), "blockshapes");
    assert.equal(classifyScenarioPath("Content/Configuration/BlockShapeWindow.ecf"), "blockshapes");
    assert.equal(classifyScenarioPath("Content/Configuration/Animations.ecf"), "animations");
    assert.equal(classifyScenarioPath("Content/Configuration/BAIConfig.ecf"), "baiconfig");
    assert.equal(classifyScenarioPath("Content/Configuration/EGroupsConfig.ecf"), "egroups");
    assert.equal(classifyScenarioPath("Content/Configuration/Config.ecf"), null);
    assert.equal(classifyScenarioPath("Prefabs/DroneBaseT1.epb"), "poi");
    assert.equal(classifyScenarioPath("Playfields/Akua/playfield.yaml"), "playfieldYaml");
    assert.equal(classifyScenarioPath("Content/Sectors.yaml"), "sectors");
    assert.equal(classifyScenarioPath("Content/Sectors/Sectors.yaml"), "sectors");
    assert.equal(classifyScenarioPath("Content/sector.yaml"), "sectors");
    assert.equal(classifyScenarioPath("Content/Sectors/CustomPlayfields.yaml"), "sectors");
    assert.equal(classifyScenarioPath("Extras/PDA/readfirst.jpg"), "picture");
    assert.equal(classifyScenarioPath("Content/Items/GoldCoins.png"), "itemPicture");
    assert.equal(
      classifyScenarioPath("Ascension-Reborn/SharedData/Content/Bundles/ItemIcons/GoldCoins.png"),
      "itemPicture",
    );
    assert.equal(classifyScenarioPath("SharedData/Content/Bundles/ItemIcons/Pistol.png"), "itemPicture");
    assert.equal(classifyScenarioPath("Content/Bundles/ItemIcons/GeneratorMS.png"), "itemPicture");
    assert.equal(classifyScenarioPath("ItemIcons/ConstructorSurvival.jpg"), "itemPicture");
    assert.equal(classifyScenarioPath("SharedData/Content/Items/Pistol.png"), "itemPicture");
    assert.equal(classifyScenarioPath("Reforged Eden/SharedData/Content/Blocks/GeneratorMS.png"), "itemPicture");
    assert.equal(classifyScenarioPath("Content/Blocks/ConstructorSurvival.jpg"), "itemPicture");
    assert.equal(classifyScenarioPath("Playfields/Akua/minimap.png"), null);
    assert.equal(classifyScenarioPath("shot.png", "pdaImages"), "picture");
    assert.equal(
      classifyScenarioPath("SharedData/Content/Gui/LoadingScreens/Load01.jpg"),
      "wallpaper",
    );
    assert.equal(
      classifyScenarioPath("Ascension-Reborn/SharedData/Content/Gui/Textures/LoadingScreens/02.png"),
      "wallpaper",
    );
    assert.equal(classifyScenarioPath("SharedData/LoadingScreenshots/orbit.jpg"), "wallpaper");
    assert.equal(classifyScenarioPath("SharedData/Content/Bundles/ItemIcons/LoadingScreenIcon.png"), "itemPicture");
    assert.equal(classifyScenarioPath("custom.yaml", "pdaYaml"), "pdaYaml");
    assert.equal(classifyScenarioPath("readme.txt"), null);
  });

  it("extracts ECF header names including +Item and Entity", () => {
    const records = extractEcfRecords(`
{ Item Id: 1, Name: MeleePlayer
}
{ +Item Id: 2, Name: Flashlight
  { Child 0
    Class: Ranged
  }
}
{ +Entity Name: AlienBug01, Ref: AlienTemplate
  Faction: Predator
}
`);
    assert.deepEqual(
      records.map((r) => `${r.kind}:${r.name}`),
      ["Item:MeleePlayer", "Item:Flashlight", "Entity:AlienBug01"],
    );
  });

  it("indexes the bundled tutorial folder and resolves PDA names", () => {
    const indexed = indexScenario(readAll(sampleDir));
    assert.ok(indexed.pda?.yamlText);
    assert.ok(indexed.catalog.entries.some((e) => e.kind === "item" && e.name === "GoldCoins"));
    assert.equal(lookupCatalog(indexed.catalog, "GoldCoins")?.label, "Gold Coins");
    assert.ok(lookupCatalog(indexed.catalog, "AlienBug01"));
    assert.ok(lookupCatalog(indexed.catalog, "Talon"));
    assert.ok(lookupCatalog(indexed.catalog, "Sathium Freighter Mission"));
    assert.ok(lookupCatalog(indexed.catalog, "Artifacts"));
    assert.ok(lookupCatalog(indexed.catalog, "GeneratorMS"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "containers"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "lootgroups"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "traders"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "sectors"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "eclass"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "statuseffects"));
    const hits = suggestionsFor(indexed.catalog, ["entity"], "alien");
    assert.ok(hits.some((h) => h.name === "AlienBug01"));

    const project = importPda(indexed.pda!);
    const issues = validateProject(project, indexed.catalog);
    assert.ok(issues.some((i) => i.message.includes("GoldCoins") === false || i.level));
    const unknown = issues.filter((i) => /not in the loaded scenario/i.test(i.message));
    assert.equal(unknown.filter((i) => i.message.includes("GoldCoins")).length, 0);
    assert.equal(unknown.filter((i) => i.message.includes("AlienBug01")).length, 0);
  });

  it("merges a second import without dropping the first catalog", () => {
    const a = indexScenario([{ path: "S/Configuration/Factions.ecf", text: "{ Faction Name: Talon\n}\n" }]);
    const b = indexScenario([{ path: "S/Prefabs/Outpost.epb" }]);
    const merged = mergeCatalog(a.catalog, b.catalog);
    assert.ok(lookupCatalog(merged, "Talon"));
    assert.ok(lookupCatalog(merged, "Outpost"));
  });

  it("indexes EPB GroupName separately from the prefab file name", () => {
    const indexed = indexScenario([
      {
        path: "S/Prefabs/BA_CivilFarm.epb",
        meta: { fileName: "BA_CivilFarm", groupName: "CivilSettlement", spawnName: "Farm" },
      },
    ]);
    assert.ok(lookupCatalog(indexed.catalog, "BA_CivilFarm"));
    assert.ok(lookupCatalog(indexed.catalog, "CivilSettlement"));
    const farm = indexed.catalog.entries.find((e) => e.name === "BA_CivilFarm");
    assert.equal(farm?.poiGroup, "CivilSettlement");
    assert.equal(farm?.label, "Farm");
  });

  it("keeps Sectors.yaml as catalog text even when the worker would strip bodies", () => {
    const yaml = `GalaxyMode: true
SolarSystems:
- Name: Ellyon
  StarClass: G
  Playfields:
    - ['66, 0, 0', Akua, Planet]
`;
    const files = [
      { path: "Ascension-Reborn/Content/Sectors.yaml", text: yaml },
      { path: "Ascension-Reborn/Content/Configuration/GalaxyConfig.ecf", text: "{ GalaxyConfig Name: G Type Star\n  StarClass: G\n}\n" },
      { path: "Ascension-Reborn/Content/Sectors/notes.yaml", text: "Name: notes\n" },
    ];
    const indexed = indexScenario(files);
    assert.ok(indexed.catalog.texts.some((t) => t.role === "sectors" && t.text.includes("Akua")));
    const collected = collectCatalogTexts(files);
    const sectors = collected.find((t) => t.role === "sectors");
    assert.ok(sectors?.text.includes("Akua"));
    assert.equal(sectors?.path, "Ascension-Reborn/Content/Sectors.yaml");
    const merged = mergeCatalog(
      { ...indexed.catalog, texts: [{ role: "sectors", path: "old/Sectors.yaml", text: "Sectors: []\n" }] },
      { folderName: "x", files: [], entries: [], texts: collected, indexedAt: 1 },
    );
    assert.match(merged.texts.find((t) => t.role === "sectors")?.text || "", /Akua/);
  });
});

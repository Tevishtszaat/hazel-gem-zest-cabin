import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { extractEcfRecords } from "./ecf.ts";
import { classifyScenarioPath, indexScenario, lookupCatalog, mergeCatalog, suggestionsFor } from "./scenario-index.ts";
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
    assert.equal(classifyScenarioPath("Content/Configuration/ItemsConfig.ecf"), "items");
    assert.equal(classifyScenarioPath("Prefabs/DroneBaseT1.epb"), "poi");
    assert.equal(classifyScenarioPath("Playfields/Akua/playfield.yaml"), "playfieldYaml");
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
});

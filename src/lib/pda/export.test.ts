import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportSlots } from "./export-files.ts";
import { emptyCatalog } from "./scenario-index.ts";
import { blankProject, newAction, newChapter, newTask } from "./yaml-import.ts";

describe("export slots", () => {
  it("offers items, blocks, tokens, and localization as their own files", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "Start";
    ch.tasks = [newTask()];
    ch.tasks[0]!.actions = [newAction()];
    project.chapters = [ch];
    const catalog = {
      ...emptyCatalog(),
      folderName: "Demo",
      texts: [
        { role: "items", path: "Configuration/ItemsConfig.ecf", text: `{ +Item Id: 1, Name: GoldCoins\n  StackSize: 10\n}\n` },
        { role: "blocks", path: "Configuration/BlocksConfig.ecf", text: `{ +Block Id: 2, Name: SteelBlock\n  HitPoints: 400\n}\n` },
        { role: "templates", path: "Configuration/Templates.ecf", text: `{ Template Name: SteelBlock\n  CraftTime: 4\n  { Child Inputs\n    SteelIngot: 2\n  }\n}\n` },
        { role: "tokens", path: "Configuration/TokenConfig.ecf", text: `{ +Token Id: 3, Name: MissionToken }\n` },
        { role: "reputation", path: "Configuration/DefReputation.ecf", text: `{ Reputation Name: "Human:1"\n  Zirax: 8500\n}\n` },
        { role: "warfare", path: "Configuration/FactionWarfare.ecf", text: `{ Element Name: FactionSettings\n  Faction: Zirax\n}\n` },
        { role: "galaxy", path: "Configuration/GalaxyConfig.ecf", text: `{ GalaxyConfig Name: General\n  StarCount: "80, 120"\n}\n` },
        { role: "localization", path: "Localization.csv", text: "KEY,English\nItems_GoldCoins,Gold Coins\n" },
        { role: "dialogues", path: "Configuration/Dialogues.ecf", text: `{ +Dialogue Name: TC_Start\n  Output: txt_tc_start\n}\n` },
        { role: "dialoguesCsv", path: "Configuration/Dialogues.csv", text: "KEY,English\ntxt_tc_start,The Talon remember their debts.\n" },
      ],
      files: [
        { role: "items", path: "Configuration/ItemsConfig.ecf", count: 1 },
        { role: "blocks", path: "Configuration/BlocksConfig.ecf", count: 1 },
        { role: "templates", path: "Configuration/Templates.ecf", count: 1 },
        { role: "tokens", path: "Configuration/TokenConfig.ecf", count: 1 },
        { role: "reputation", path: "Configuration/DefReputation.ecf", count: 1 },
        { role: "warfare", path: "Configuration/FactionWarfare.ecf", count: 1 },
        { role: "galaxy", path: "Configuration/GalaxyConfig.ecf", count: 1 },
        { role: "localization", path: "Localization.csv", count: 1 },
        { role: "dialogues", path: "Configuration/Dialogues.ecf", count: 1 },
        { role: "dialoguesCsv", path: "Configuration/Dialogues.csv", count: 1 },
      ],
    };
    const slots = exportSlots(project, catalog);
    const byId = Object.fromEntries(slots.map((s) => [s.id, s]));
    assert.equal(byId.items?.ready, true);
    assert.equal(byId.items?.filename, "ItemsConfig.ecf");
    assert.match(byId.items!.build(), /GoldCoins/);
    assert.equal(byId.blocks?.ready, true);
    assert.match(byId.blocks!.build(), /SteelBlock/);
    assert.equal(byId.templates?.ready, true);
    assert.match(byId.templates!.build(), /SteelIngot/);
    assert.equal(byId.tokens?.ready, true);
    assert.match(byId.tokens!.build(), /MissionToken/);
    assert.equal(byId.reputation?.ready, true);
    assert.match(byId.reputation!.build(), /Human:1/);
    assert.equal(byId.warfare?.ready, true);
    assert.match(byId.warfare!.build(), /Zirax/);
    assert.equal(byId.galaxy?.ready, true);
    assert.match(byId.galaxy!.build(), /StarCount/);
    assert.equal(byId.localization?.ready, true);
    assert.match(byId.localization!.build(), /Gold Coins/);
    assert.equal(byId.pdaYaml?.ready, true);
    assert.match(byId.pdaYaml!.build(), /Start/);
    assert.equal(byId.dialogues?.ready, true);
    assert.match(byId.dialogues!.build(), /TC_Start/);
    assert.equal(byId.dialoguesCsv?.ready, true);
    assert.equal(byId.dialoguesCsv?.filename, "Dialogues.csv");
    assert.match(byId.dialoguesCsv!.build(), /txt_tc_start/);
    assert.doesNotMatch(byId.dialoguesCsv!.build(), /Gold Coins/);
  });
});

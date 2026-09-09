import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  gotoTarget,
  isGotoReset,
  mergeForeignDialogues,
  parseDialogueDoc,
  parseDialogues,
  serializeDialogueDoc,
  serializeDialogues,
} from "./dialogues.ts";
import { BLOCK_STATS, blockIdentity, compareObjects, floatingBlocks, similarBlocks } from "./config-stats.ts";
import { extractEcfRecords, parseEcfObjects, stringifyEcfObjects } from "./ecf.ts";
import { iconCandidates, iconLookupKeys } from "./image-store.ts";
import { indexScenario } from "./scenario-index.ts";

const sampleDir = path.resolve("public/samples/tutorial");

describe("library parsers", () => {
  it("parses item properties from tutorial ItemsConfig", () => {
    const text = fs.readFileSync(path.join(sampleDir, "Configuration/ItemsConfig.ecf"), "utf8");
    const items = parseEcfObjects(text);
    const gold = items.find((i) => i.name === "GoldCoins");
    assert.ok(gold);
    assert.equal(gold.id, "100");
    assert.equal(gold.fields.StackSize, "10000");
    assert.equal(gold.fields.Category, "Components");
  });

  it("keeps extractEcfRecords compatible", () => {
    const text = `{ +Item Id: 2, Name: Flashlight
  { Child 0
    Class: Ranged
  }
}
{ +Entity Name: AlienBug01, Ref: AlienTemplate
  Faction: Predator
}
`;
    assert.deepEqual(
      extractEcfRecords(text).map((r) => `${r.kind}:${r.name}`),
      ["Item:Flashlight", "Entity:AlienBug01"],
    );
  });

  it("parses variables, nexts, and round-trips a full dialogue", () => {
    const text = `{ +Dialogue Name: TC_Start
  NPCName: "Talon Chief"
  Comment: "Greeting"
  BarkingState: TC_Bark
  RequiredStates: "TC_RepuBad, TC_TalkingOk"
  Variable_1: "FoodCounter", param1: int
  Variable_2: "TalkCount", param1: dbstate_int
  Execute_1: "TalkCount = TalkCount + 1"
  Next_1: TC_RepuBad
  NextIf_1: "GetReputation(Faction.Talon) < Reputation.NeutralMin"
  Next_2: TC_DefaultEntry
  Output: dlgTCGreetings
  Option_1: dlgTCTellMeStory
  OptionNext_1: TC_Story
  Option_2: Bye
  OptionNext_2: End
}
`;
    const states = parseDialogues(text);
    assert.equal(states.length, 1);
    const s = states[0]!;
    assert.equal(s.npcName, "Talon Chief");
    assert.equal(s.comment, "Greeting");
    assert.equal(s.barkingState, "TC_Bark");
    assert.equal(s.variables.length, 2);
    assert.equal(s.variables[0]?.name, "FoodCounter");
    assert.equal(s.variables[1]?.param1, "dbstate_int");
    assert.equal(s.nexts.length, 2);
    assert.equal(s.nexts[0]?.next, "TC_RepuBad");
    assert.equal(s.nexts[0]?.execute, "TalkCount = TalkCount + 1");
    assert.equal(s.options.length, 2);
    const back = parseDialogues(serializeDialogues(states));
    assert.equal(back[0]?.variables[1]?.name, "TalkCount");
    assert.equal(back[0]?.options[1]?.next, "End");
    assert.equal(back[0]?.requiredStates.includes("TC_TalkingOk"), true);
  });

  it("parses functions, CDATA execute, GotoAndReset, and merges foreign states", () => {
    const text = `{ +Dialogue Name: Home_Start
  Option_1: Stay
  OptionNext_1: End
  Option_2: Leave
  OptionNext_2: GotoAndReset:Other_Init
}
{ +Function Name: Heal
  Execute: <![CDATA[Player.Health = 100]]>
}
`;
    const doc = parseDialogueDoc(text);
    assert.equal(doc.functions[0]?.name, "Heal");
    assert.equal(doc.functions[0]?.execute, "Player.Health = 100");
    assert.equal(isGotoReset(doc.states[0]!.options[1]!.next), true);
    assert.equal(gotoTarget(doc.states[0]!.options[1]!.next), "Other_Init");
    const merged = mergeForeignDialogues({ states: [], functions: [] }, doc, "FX_", ["Home_Start"]);
    assert.equal(merged.states[0]?.name, "FX_Home_Start");
    assert.equal(merged.states[0]?.options[1]?.next, "GotoAndReset:Other_Init");
    const out = serializeDialogueDoc(doc);
    assert.match(out, /CDATA/);
    assert.match(out, /Function Name: Heal/);
  });

  it("compares block stats in the same category", () => {
    const a = { kind: "Block", plus: true, name: "GenA", fields: { Category: "Devices", HitPoints: "100", Mass: "20" } };
    const b = { kind: "Block", plus: true, name: "GenB", fields: { Category: "Devices", HitPoints: "150", Mass: "18" } };
    const rows = compareObjects(a, b, BLOCK_STATS);
    const hp = rows.find((r) => r.key === "HitPoints");
    assert.equal(hp?.delta, 50);
    assert.equal(similarBlocks([a, b], a)[0]?.name, "GenB");
  });

  it("treats +Block Name and Block Name as floating ids", () => {
    const text = fs.readFileSync(path.join(sampleDir, "Configuration/BlocksConfig.ecf"), "utf8");
    const blocks = parseEcfObjects(text);
    const numeric = blocks.find((b) => b.name === "GeneratorMS");
    const plusFloat = blocks.find((b) => b.name === "TutorialFloatCore");
    const baseFloat = blocks.find((b) => b.name === "TutorialBaseFloat");
    assert.equal(numeric?.id, "400");
    assert.equal(blockIdentity(numeric!).kind, "numeric");
    assert.equal(blockIdentity(numeric!).label, "400");
    assert.equal(plusFloat?.id, undefined);
    assert.equal(plusFloat?.plus, true);
    assert.equal(blockIdentity(plusFloat!).kind, "floating");
    assert.equal(blockIdentity(plusFloat!).label, "+TutorialFloatCore");
    assert.equal(baseFloat?.plus, false);
    assert.equal(blockIdentity(baseFloat!).label, "TutorialBaseFloat");
    assert.equal(floatingBlocks(blocks).length, 2);
    const back = stringifyEcfObjects([plusFloat!, baseFloat!]);
    assert.match(back, /\{\s*\+Block Name: TutorialFloatCore/);
    assert.match(back, /\{\s*Block Name: TutorialBaseFloat/);
    assert.doesNotMatch(back, /Id:/);
  });

  it("prefers CustomIcon over the item name for icon lookup", () => {
    const keys = iconCandidates("LaserPistolT2", { CustomIcon: "Pistol" });
    assert.ok(keys[0] && keys[0].toLowerCase().startsWith("pistol"));
    assert.ok(iconLookupKeys("SharedData/Content/Items/GoldCoins.png").some((k) => k.toLowerCase() === "goldcoins.png"));
  });

  it("stores config texts on scenario index", () => {
    const files = [
      {
        path: "Tutorial/Configuration/ItemsConfig.ecf",
        text: fs.readFileSync(path.join(sampleDir, "Configuration/ItemsConfig.ecf"), "utf8"),
      },
      {
        path: "Tutorial/Localization.csv",
        text: fs.readFileSync(path.join(sampleDir, "Localization.csv"), "utf8"),
      },
    ];
    const indexed = indexScenario(files);
    assert.ok(indexed.catalog.texts.some((t) => t.role === "items"));
    assert.ok(indexed.catalog.texts.some((t) => t.role === "localization"));
    assert.ok(indexed.catalog.entries.some((e) => e.name === "GoldCoins" && e.label === "Gold Coins"));
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  unusedNumericIds,
  blockIdentity,
  floatingBlocks,
  entityByName,
  classFieldValue,
  fieldIndex,
  matchesClassFilter,
  groupByEntityType,
} from "./config-stats.ts";
import { extractEcfRecords, parseEcfObjects, stringifyEcfObjects } from "./ecf.ts";

describe("templates and unused ids", () => {
  it("round-trips Templates.ecf child inputs", () => {
    const raw = `{ +Template Name: GoldIngot
  OutputCount: 10
  CraftTime: 5
  Target: "SmallC,Furn"
  { Child Inputs
    GoldOre: 5
  }
}
`;
    const docs = parseEcfObjects(raw);
    assert.equal(docs[0]?.name, "GoldIngot");
    assert.equal(docs[0]?.fields.CraftTime, "5");
    assert.equal(docs[0]?.children?.[0]?.name, "Inputs");
    assert.equal(docs[0]?.children?.[0]?.fields.GoldOre, "5");
    const back = stringifyEcfObjects(docs);
    assert.match(back, /Child Inputs/);
    assert.match(back, /GoldOre: 5/);
    const again = parseEcfObjects(back);
    assert.equal(again[0]?.children?.[0]?.fields.GoldOre, "5");
  });

  it("keeps nested Child 0 on items", () => {
    const text = `{ +Item Id: 2, Name: Flashlight
  { Child 0
    Class: Ranged
  }
}
`;
    const item = parseEcfObjects(text)[0];
    assert.equal(item?.name, "Flashlight");
    assert.equal(item?.children?.[0]?.name, "0");
    assert.equal(item?.children?.[0]?.fields.Class, "Ranged");
    assert.match(stringifyEcfObjects([item!]), /Child 0/);
  });

  it("lists empty item and block ids so they can be claimed", () => {
    const unused = unusedNumericIds([3, 63, 100]);
    assert.ok(unused.ids.includes(1));
    assert.ok(unused.ids.includes(4));
    assert.ok(unused.ranges.some((r) => r.from === 4 && r.to === 62));
    assert.equal(unused.next, 101);
  });

  it("treats +Block Name and Block Name as floating ids", () => {
    const blocks = parseEcfObjects(`{ Block Id: 400, Name: GeneratorMS }
{ +Block Name: TutorialFloatCore
  Category: Devices
}
{ Block Name: TutorialBaseFloat
  Category: Devices
}
`);
    assert.equal(blockIdentity(blocks[0]!).kind, "numeric");
    assert.equal(blockIdentity(blocks[0]!).label, "400");
    assert.equal(blocks[1]?.plus, true);
    assert.equal(blocks[1]?.id, undefined);
    assert.equal(blockIdentity(blocks[1]!).label, "+TutorialFloatCore");
    assert.equal(blocks[2]?.plus, false);
    assert.equal(blockIdentity(blocks[2]!).label, "TutorialBaseFloat");
    assert.equal(floatingBlocks(blocks).map((b) => blockIdentity(b).label).join(","), "+TutorialFloatCore,TutorialBaseFloat");
    const back = stringifyEcfObjects(blocks.slice(1));
    assert.match(back, /\{\s*\+Block Name: TutorialFloatCore/);
    assert.match(back, /\{\s*Block Name: TutorialBaseFloat/);
    assert.doesNotMatch(back, /Id:/);
  });

  it("treats +Item Name and Item Name as floating ids", () => {
    const items = parseEcfObjects(`{ Item Id: 100, Name: GoldCoins }
{ +Item Name: TutorialFloatItem
  Category: Components
}
{ Item Name: TutorialNamedLoot
  Category: Components
}
`);
    assert.equal(blockIdentity(items[0]!).kind, "numeric");
    assert.equal(items[1]?.plus, true);
    assert.equal(items[1]?.id, undefined);
    assert.equal(blockIdentity(items[1]!).label, "+TutorialFloatItem");
    assert.equal(items[2]?.plus, false);
    assert.equal(blockIdentity(items[2]!).label, "TutorialNamedLoot");
    const back = stringifyEcfObjects(items.slice(1));
    assert.match(back, /\{\s*\+Item Name: TutorialFloatItem/);
    assert.match(back, /\{\s*Item Name: TutorialNamedLoot/);
    assert.doesNotMatch(back, /Id:/);
  });

  it("keeps GalaxyConfig nested territories and DefReputation rows", () => {
    const galaxy = parseEcfObjects(`{ GalaxyConfig, Name: General
  StarCount: "15000, 20000"
  { Child Territory_1
    Faction: Zirax
    Center: "130, 0, 206"
    Radius: 75
  }
}
`);
    assert.equal(galaxy[0]?.name, "General");
    assert.equal(galaxy[0]?.children?.[0]?.name, "Territory_1");
    assert.equal(galaxy[0]?.children?.[0]?.fields.Faction, "Zirax");
    const back = stringifyEcfObjects(galaxy);
    assert.match(back, /Territory_1/);
    assert.match(back, /Zirax/);

    const rep = parseEcfObjects(`{ Reputation Name: "Human:1"
  Zirax: 8500
  Talon: 16500
}
`);
    assert.equal(rep[0]?.name, "Human:1");
    assert.equal(rep[0]?.fields.Zirax, "8500");
  });

  it("parses nameless container ids, loot params, and numeric animation keys", () => {
    const containers = parseEcfObjects(`{ +Container Id: 1
  Count: 1
  { Child Items
    Name_0: GoldCoins, param1: 0.8, param2: "1,5"
  }
}
`);
    assert.equal(containers[0]?.id, "1");
    assert.equal(containers[0]?.name, "");
    assert.equal(containers[0]?.plus, true);
    assert.equal(containers[0]?.children?.[0]?.fields.Name_0, 'GoldCoins, param1: 0.8, param2: "1,5"');
    const recs = extractEcfRecords(`{ +Container Id: 1
  Count: 1
}
`);
    assert.equal(recs[0]?.name, "1");
    const back = stringifyEcfObjects(containers);
    assert.match(back, /Name_0: GoldCoins, param1: 0.8/);
    assert.doesNotMatch(back, /Name_0: "/);

    const anim = parseEcfObjects(`{ Animation
  0: 0
  1: 0.16, param1: 0.3, param2: 0
}
`);
    assert.equal(anim[0]?.fields["0"], "0");
    assert.match(anim[0]?.fields["1"] ?? "", /0\.16/);
  });

  it("resolves EClass EntityType through Ref templates", () => {
    const entities = parseEcfObjects(`{ Entity Name: AlienTemplate
  EntityType: Animal
  Class: Enemy
  Parent: Enemies
  Faction: Predator
}
{ +Entity Name: AlienBug01, Ref: AlienTemplate
  Faction: Predator
}
{ +Entity Name: DroneSmallFast01Rocket
  EntityType: EnemyDrone
  Class: MeshDrone
  Parent: Drones
  Faction: Zirax
}
`);
    const byName = entityByName(entities);
    const bug = entities.find((e) => e.name === "AlienBug01")!;
    assert.equal(classFieldValue(bug, "EntityType", byName), "Animal");
    assert.equal(classFieldValue(bug, "Class", byName), "Enemy");
    assert.equal(classFieldValue(bug, "Parent", byName), "Enemies");
    assert.equal(classFieldValue(bug, "Ref", byName), "AlienTemplate");
    assert.deepEqual(fieldIndex(entities, "EntityType", byName), ["Animal", "EnemyDrone"]);
    assert.equal(
      matchesClassFilter(bug, { EntityType: "Animal", Class: "all", Parent: "all", Faction: "all", Ref: "all" }, byName),
      true,
    );
    assert.equal(
      matchesClassFilter(bug, { EntityType: "EnemyDrone", Class: "all", Parent: "all", Faction: "all", Ref: "all" }, byName),
      false,
    );
    const groups = groupByEntityType(entities, byName).map((g) => g.key);
    assert.ok(groups.includes("Animal"));
    assert.ok(groups.includes("EnemyDrone"));
  });
});

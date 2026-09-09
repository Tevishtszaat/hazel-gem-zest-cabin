import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unusedNumericIds } from "./config-stats.ts";
import { parseEcfObjects, stringifyEcfObjects } from "./ecf.ts";

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
});

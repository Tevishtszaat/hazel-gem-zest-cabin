import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog } from "./scenario-index.ts";
import { validateCatalog } from "./validate-files.ts";

describe("syntax debug", () => {
  it("flags unclosed ECF blocks", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "dialogues", path: "Dialogues.ecf", text: "{ Dialogue Name: Hello\n  NPCName: Bob\n" }],
      files: [{ role: "dialogues", path: "Dialogues.ecf", count: 1 }],
      entries: [{ kind: "dialogue" as const, name: "Hello", source: "dialogues" }],
    };
    const issues = validateCatalog(catalog, "dialogues");
    assert.ok(issues.some((i) => i.code === "syntax" && /unclosed/i.test(i.message)));
  });

  it("flags unmatched braces in items", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "items", path: "ItemsConfig.ecf", text: "{ Item Name: A\n}\n}\n" }],
      files: [{ role: "items", path: "ItemsConfig.ecf", count: 1 }],
      entries: [{ kind: "item" as const, name: "A", source: "items" }],
    };
    const issues = validateCatalog(catalog, "items");
    assert.ok(issues.some((i) => i.code === "syntax" && /Unmatched/i.test(i.message)));
  });

  it("flags broken playfield YAML", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [
        {
          role: "playfieldYaml",
          path: "Playfields/X/playfield_static.yaml",
          text: "Playfield:\n  Type: Planet\n  Bad: [unterminated\n",
        },
      ],
      files: [{ role: "playfieldYaml", path: "Playfields/X/playfield_static.yaml", count: 1 }],
      entries: [{ kind: "playfield" as const, name: "X", source: "playfields" }],
    };
    const issues = validateCatalog(catalog, "playfields");
    assert.ok(issues.some((i) => i.source === "playfields" && i.code === "syntax"));
  });

  it("flags PDA.csv column mismatches", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "pdaCsv", path: "PDA.csv", text: "KEY,English\ntxt_a,Hello,extra\n" }],
      files: [{ role: "pdaCsv", path: "PDA.csv", count: 1 }],
      entries: [],
    };
    const issues = validateCatalog(catalog, "pda");
    assert.ok(issues.some((i) => i.source === "pda" && (i.code === "syntax" || i.code === "csv-columns")));
  });
});

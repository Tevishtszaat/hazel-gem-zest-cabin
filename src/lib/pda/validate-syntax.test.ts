import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog } from "./scenario-index.ts";
import { validateCatalog } from "./validate-files.ts";
import { padCsvColumns } from "./validate-syntax.ts";

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

  it("does not flag a blank PDA.csv line", () => {
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "pdaCsv", path: "PDA.csv", text: "KEY,English\ntxt_a,Hello\n\n" }],
      files: [{ role: "pdaCsv", path: "PDA.csv", count: 1 }],
      entries: [],
    };
    const issues = validateCatalog(catalog, "pda");
    assert.equal(issues.filter((i) => i.code === "csv-columns").length, 0);
  });

  it("pads a short PDA.csv row with the missing commas", () => {
    const text = "KEY,English,German\nOnlyKey\nKeep,Hello,Tag\n";
    assert.equal(padCsvColumns(text), "KEY,English,German\nOnlyKey,,\nKeep,Hello,Tag\n");
    assert.equal(padCsvColumns(text, 2), "KEY,English,German\nOnlyKey,,\nKeep,Hello,Tag\n");
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "pdaCsv", path: "PDA.csv", text: "KEY,English\nOnlyKey\n" }],
      files: [{ role: "pdaCsv", path: "PDA.csv", count: 1 }],
      entries: [],
    };
    const issues = validateCatalog(catalog, "pda");
    const hit = issues.find((i) => i.path === "PDA.csv:2");
    assert.equal(hit?.fixes[0]?.type, "csv-pad");
    assert.equal(hit?.fixes[0]?.label, "Add 1 comma");
    assert.equal(hit?.recommend, "fix");
  });

  it("offers the same comma pad for a short Localization.csv row", () => {
    const text = "Key,English,German\nBait,Grub Worms\n";
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "localization", path: "Localization.csv", text }],
      files: [{ role: "localization", path: "Localization.csv", count: 1 }],
      entries: [{ kind: "item" as const, name: "Bait", source: "items" }],
    };
    const issues = validateCatalog(catalog, "localization");
    const hit = issues.find((i) => i.code === "csv-columns" && i.path === "Localization.csv:2");
    assert.ok(hit);
    assert.equal(hit?.fixes[0]?.type, "csv-pad");
    assert.equal(hit?.fixes[0] && "role" in hit.fixes[0] ? hit.fixes[0].role : "", "localization");
    assert.equal(padCsvColumns(text), "Key,English,German\nBait,Grub Worms,\n");
  });

  it("treats a one-column Dialogues.csv row as missing commas", () => {
    const header = ["Key", ...Array.from({ length: 17 }, (_, i) => `Lang${i}`)].join(",");
    const text = `${header}\ntxt_fish_bite\n`;
    const path = "Ascension-Reborn/Content/Configuration/Dialogues.csv";
    const catalog = {
      ...emptyCatalog(),
      indexedAt: 1,
      texts: [{ role: "dialoguesCsv", path, text }],
      files: [{ role: "dialoguesCsv", path, count: 1 }],
      entries: [{ kind: "dialogue" as const, name: "Hello", source: "dialogues" }],
    };
    const issues = validateCatalog(catalog, "dialogues");
    const hit = issues.find((i) => i.path === `${path}:2`);
    assert.ok(hit);
    assert.match(hit?.message ?? "", /Add 17 commas/);
    assert.equal(hit?.fixes[0]?.type, "csv-pad");
    assert.equal(hit?.fixes[0] && "role" in hit.fixes[0] ? hit.fixes[0].role : "", "dialoguesCsv");
    assert.equal(padCsvColumns(text, 2), `${header}\ntxt_fish_bite,${",".repeat(16)}\n`);
  });
});

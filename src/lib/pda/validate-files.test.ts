import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog } from "./scenario-index.ts";
import { applyEcfFix, validateCatalog } from "./validate-files.ts";

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
});

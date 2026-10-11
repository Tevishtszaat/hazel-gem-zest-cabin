import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { axisExportZip } from "./export-files.ts";

describe("axis export", () => {
  it("packs configs into an axisexport folder without renaming them", () => {
    const zip = axisExportZip([
      { name: "PDA.yaml", text: "chapters: []\n" },
      { name: "Content/Configuration/BlocksConfig.ecf", text: "{ Block Name: Core }\n" },
    ]);
    const text = new TextDecoder().decode(zip);
    assert.match(text, /axisexport\/PDA\.yaml/);
    assert.match(text, /axisexport\/BlocksConfig\.ecf/);
    assert.match(text, /chapters: \[\]/);
    assert.equal(text.includes("PDA (1)"), false);
    assert.equal(zip[0], 0x50);
    assert.equal(zip[1], 0x4b);
  });
});

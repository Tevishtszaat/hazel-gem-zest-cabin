import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bbcodeToHtml, decodePdaEscapes, stripBbcode } from "./bbcode.ts";

describe("Empyrion BBCode", () => {
  it("renders colored bold chapter titles", () => {
    const html = bbcodeToHtml("[c][ff0000][b]READ FIRST: Empyriopedia[/b][-][/c]");
    assert.match(html, /style="color:#ff0000"/);
    assert.match(html, /<strong>READ FIRST: Empyriopedia<\/strong>/);
    assert.equal(html.includes("[c]"), false);
    assert.equal(html.includes("[ff0000]"), false);
  });

  it("turns \\n and [u] into line breaks and underline", () => {
    const src =
      "Unlike the JOURNEYBOOK, the [c][00ff2a]EMPYRIOPEDIA [-][/c]tracks progress.\\n\\n[u]CONTENT[/u]\\nThe Empyriopedia";
    const html = bbcodeToHtml(src);
    assert.match(html, /color:#00ff2a/);
    assert.match(html, /EMPYRIOPEDIA/);
    assert.match(html, /<u>CONTENT<\/u>/);
    assert.ok(html.includes("<br/><br/>"));
    assert.equal(html.includes("\\n"), false);
  });

  it("strips tags for compact labels", () => {
    assert.equal(stripBbcode("[c][ff0000][b]READ FIRST: Empyriopedia[/b][-][/c]"), "READ FIRST: Empyriopedia");
  });

  it("decodes PDA CSV escapes", () => {
    assert.equal(decodePdaEscapes("line1\\nline2"), "line1\nline2");
  });
});

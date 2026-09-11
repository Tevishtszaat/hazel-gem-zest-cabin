import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { parseCsv } from "./csv.ts";
import { exportYaml } from "./yaml-export.ts";
import { sourceReadMode } from "./folder-files.ts";
import { applyCsvText, importPda, sanitizeYamlSource } from "./yaml-import.ts";

const sampleDir = path.resolve("public/samples/tutorial");

describe("real Empyrion tutorial import", () => {
  it("loads the eWPDA tutorial YAML + CSV with resolved titles", () => {
    const yamlText = fs.readFileSync(path.join(sampleDir, "PDA.yaml"), "utf8");
    const csvText = fs.readFileSync(path.join(sampleDir, "PDA.csv"), "utf8");
    const project = importPda({
      yamlText,
      csvText,
      yamlName: "PDA.yaml",
      csvName: "PDA.csv",
    });
    assert.equal(project.creator, "RexXxuS");
    assert.equal(project.chapters.length, 32);
    assert.ok(project.lastImport);
    assert.equal(project.lastImport?.tasks, 139);
    assert.equal(project.lastImport?.actions, 505);
    assert.equal(project.chapters[0]?.chapterTitle, "Invader vs Defender FAQ");
    assert.equal(project.chapters[0]?.titleKey, "txt_Ceiu0");
    assert.equal(project.chapters[1]?.chapterTitle, "10 Tips for GETTING STARTED");
    assert.ok((project.lastImport?.resolved ?? 0) >= 300);
    const pest = project.chapters.find((c) => c.chapterTitle.includes("Pest Control"));
    assert.ok(pest);
    assert.equal(pest?.rewards.some((r) => r.type === "Reputation"), true);
    assert.equal(pest?.hideTasks, true);
    const activated = project.chapters.find((c) => c.extra.ChapterActivation);
    assert.ok(activated);
    const fire = project.chapters
      .flatMap((c) => c.tasks)
      .find((t) => t.taskTitle === "Fire Brigade");
    assert.ok(Array.isArray(fire?.extra.OnCompletePlayfieldOps));
  });

  it("round-trips extra fields through export", () => {
    const yamlText = fs.readFileSync(path.join(sampleDir, "PDA.yaml"), "utf8");
    const csvText = fs.readFileSync(path.join(sampleDir, "PDA.csv"), "utf8");
    const project = importPda({ yamlText, csvText });
    const out = exportYaml(project);
    assert.match(out, /ChapterTitle: txt_Ceiu0/);
    assert.match(out, /HideTasks: true/);
    assert.match(out, /OnCompletePlayfieldOps:/);
    assert.match(out, /ChapterActivation:/);
  });
});

describe("messy YAML recovery", () => {
  it("strips BOM and tabs then parses mixed lists", () => {
    const messy =
      "\uFEFFCreator: Test\nChapters:\n\t- ChapterTitle: txt_hello\n\t  Category: Tutorial\n\t  AutoActivateOnGameStart: True\n\t  Tasks:\n\t  - TaskTitle: First job\n\t    Actions:\n\t    - ActionTitle: Open PDA\n\t      Check: WindowOpened\n\t      Names: [ Pda, Player ]\n\t      AllowManualCompletion: true\n";
    const { text, notes } = sanitizeYamlSource(messy);
    assert.ok(notes.some((n) => /BOM/.test(n.message)));
    assert.ok(notes.some((n) => /tabs/i.test(n.message)));
    const csv = "KEY,English\ntxt_hello,Welcome aboard\n";
    const project = importPda({ yamlText: text, csvText: csv });
    assert.equal(project.chapters[0]?.chapterTitle, "Welcome aboard");
    assert.equal(project.chapters[0]?.autoActivateOnGameStart, true);
    assert.equal(project.chapters[0]?.tasks[0]?.actions[0]?.names, "Pda, Player");
  });
});

describe("csv", () => {
  it("parses quoted multiline-safe rows and 18 language columns", () => {
    const header =
      "KEY,English,Deutsch,Français,Italiano,Spanish,Portuguese (Euro),Portuguese (Brazil),Polish,Russian,Japanese,Chinese (simplified),Chinese (traditional),Korean,Turkish,Greek,Dutch,Vietnamese";
    const row = 'txt_x,"Hello, world",Hallo,,,,,,,,,,,,,,';
    const table = parseCsv(`${header}\n${row}\n`);
    assert.equal(table.languages.length, 17);
    assert.equal(table.rows.txt_x?.English, "Hello, world");
  });
});

describe("csv merge", () => {
  it("resolves keys after a later PDA.csv import", () => {
    const project = importPda({
      yamlText: "Creator: Test\nChapters:\n  - ChapterTitle: txt_hello\n    Category: FAQ\n    Tasks: []\n",
    });
    assert.equal(project.chapters[0]?.chapterTitle, "txt_hello");
    applyCsvText(project, "KEY,English\ntxt_hello,Welcome aboard\n");
    assert.equal(project.chapters[0]?.chapterTitle, "Welcome aboard");
    assert.equal(project.chapters[0]?.titleKey, "txt_hello");
  });
});

describe("import read modes", () => {
  it("reads playfield yaml as text so the editor can patch planet/orbit/space files", () => {
    assert.equal(sourceReadMode("playfieldYaml"), "text");
    assert.equal(sourceReadMode("poi"), "path");
    assert.equal(sourceReadMode("itemPicture"), "blob");
    assert.equal(sourceReadMode("picture"), "blob");
    assert.equal(sourceReadMode("wallpaper"), "blob");
    assert.equal(sourceReadMode("items"), "text");
    assert.equal(sourceReadMode("galaxy"), "text");
  });
});

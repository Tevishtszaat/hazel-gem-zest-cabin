import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog, type ScenarioCatalog } from "./scenario-index.ts";
import { blankProject, newAction, newChapter, newTask } from "./yaml-import.ts";
import { validateProject } from "./validate.ts";

function catalog(names: { kind: ScenarioCatalog["entries"][number]["kind"]; name: string }[]): ScenarioCatalog {
  return {
    ...emptyCatalog(),
    folderName: "Test",
    indexedAt: 1,
    entries: names.map((n) => ({ ...n, source: "test" })),
    files: [{ role: "items", path: "ItemsConfig.ecf", count: names.length }],
  };
}

describe("validateProject debug diagnostics", () => {
  it("recommends deleting untitled chapters and tasks", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "";
    ch.tasks = [newTask()];
    ch.tasks[0]!.taskTitle = "";
    ch.tasks[0]!.actions = [newAction()];
    project.chapters = [ch];
    const issues = validateProject(project);
    assert.ok(issues.some((i) => i.code === "empty-title" && i.kind === "chapter" && i.recommend === "delete"));
    assert.ok(issues.some((i) => i.code === "empty-title" && i.kind === "task" && i.fixes.some((f) => f.type === "delete")));
  });

  it("counts HUD wrap on visible text, not BBCode tags", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "Intro";
    const tk = newTask();
    tk.taskTitle = "[c][ff0000][b]Hi[/b][-][/c]";
    tk.actions = [newAction()];
    ch.tasks = [tk];
    project.chapters = [ch];
    const issues = validateProject(project);
    assert.equal(issues.filter((i) => i.code === "hud-wrap").length, 0);
  });

  it("suggests a catalog correction for unknown names", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "Hunt";
    const tk = newTask();
    tk.taskTitle = "Coins";
    const ac = newAction();
    ac.actionTitle = "Collect";
    ac.check = "InventoryContains";
    ac.names = "GoldCoin";
    tk.actions = [ac];
    ch.tasks = [tk];
    project.chapters = [ch];
    const issues = validateProject(project, catalog([{ kind: "item", name: "GoldCoins" }]));
    const hit = issues.find((i) => i.code === "unknown-name");
    assert.ok(hit);
    assert.ok(hit.suggestions.includes("GoldCoins"));
    assert.ok(hit.fixes.some((f) => f.type === "set" && f.value.includes("GoldCoins")));
    assert.ok(hit.fixes.some((f) => f.type === "delete"));
  });

  it("treats *** section headers without tasks as review, not hard errors", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "*** Fishing Missions ***";
    ch.tasks = [];
    project.chapters = [ch];
    const issues = validateProject(project);
    const hit = issues.find((i) => i.code === "empty-chapter");
    assert.equal(hit?.level, "warning");
    assert.equal(hit?.recommend, "review");
    assert.ok(hit?.fixes.some((f) => f.type === "delete"));
  });
});

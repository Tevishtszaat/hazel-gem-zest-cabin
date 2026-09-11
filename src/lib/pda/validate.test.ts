import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCatalog, type ScenarioCatalog } from "./scenario-index.ts";
import { blankProject, newAction, newChapter, newTask } from "./yaml-import.ts";
import { validateProject } from "./validate.ts";
import { problemIgnoreKey, visibleProblems } from "./problems.ts";

function catalog(names: { kind: ScenarioCatalog["entries"][number]["kind"]; name: string; label?: string }[]): ScenarioCatalog {
  return {
    ...emptyCatalog(),
    folderName: "Test",
    indexedAt: 1,
    entries: names.map((n) => ({ kind: n.kind, name: n.name, label: n.label, source: "test" })),
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

  it("cross-references Localization.csv display names to item/block ids", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "Hunt";
    const tk = newTask();
    tk.taskTitle = "Coins";
    const ac = newAction();
    ac.actionTitle = "Collect";
    ac.check = "InventoryContains";
    ac.names = "Gold Coins";
    tk.actions = [ac];
    ch.tasks = [tk];
    ch.rewards = [{ item: "Gold Coins", type: "Item", count: 1, faction: "" }];
    project.chapters = [ch];
    const issues = validateProject(project, catalog([{ kind: "item", name: "GoldCoins", label: "Gold Coins" }]));
    const names = issues.filter((i) => i.code === "loca-name");
    assert.ok(names.length >= 2);
    assert.ok(names.every((i) => i.suggestions.includes("GoldCoins")));
    assert.equal(issues.filter((i) => i.code === "unknown-name").length, 0);
    assert.equal(issues.filter((i) => i.code === "unknown-reward").length, 0);
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

describe("debug ignore filters", () => {
  it("hides wrap/length issues unless asked", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "Intro";
    const tk = newTask();
    tk.taskTitle = "This title is definitely longer than twenty six";
    tk.actions = [newAction()];
    ch.tasks = [tk];
    project.chapters = [ch];
    const issues = validateProject(project);
    assert.ok(issues.some((i) => i.code === "hud-wrap"));
    assert.equal(visibleProblems(issues, []).filter((i) => i.code === "hud-wrap").length, 0);
    assert.ok(visibleProblems(issues, [], { includeLength: true }).some((i) => i.code === "hud-wrap"));
  });

  it("parks ignored errors until restored", () => {
    const project = blankProject();
    const ch = newChapter();
    ch.chapterTitle = "";
    ch.tasks = [newTask()];
    project.chapters = [ch];
    const issues = validateProject(project);
    const empty = issues.find((i) => i.code === "empty-title");
    assert.ok(empty);
    const key = problemIgnoreKey(empty);
    const hidden = visibleProblems(issues, [key]);
    assert.equal(hidden.some((i) => i.code === "empty-title"), false);
    assert.ok(visibleProblems(issues, [key], { includeIgnored: true }).some((i) => i.code === "empty-title"));
  });
});

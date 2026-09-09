import * as yaml from "js-yaml";
import { APP_NAME } from "../brand.ts";
import { stringifyCsv, upsertCsv } from "./csv.ts";
import type { ActionNode, ChapterNode, PdaProject, Reward, TaskNode } from "./types.ts";

export function exportYaml(project: PdaProject): string {
  const chapters = project.chapters.map((ch) => chapterToYaml(ch, project));
  const doc: Record<string, unknown> = {
    Creator: project.creator || APP_NAME,
    ...project.extraRoot,
    Chapters: chapters,
  };
  return yaml.dump(doc, {
    lineWidth: 120,
    noRefs: true,
  });
}

export function exportCsv(project: PdaProject): string {
  const csv = {
    languages: project.csv.languages.length ? [...project.csv.languages] : ["English"],
    rows: { ...project.csv.rows },
  };
  const lang = project.language || csv.languages[0] || "English";
  const used = new Set(Object.keys(csv.rows));

  const put = (existingKey: string | undefined, prefix: string, text: string) => {
    if (existingKey) {
      upsertCsv(csv, existingKey, lang, text);
      return existingKey;
    }
    const key = slug(prefix, text, used);
    upsertCsv(csv, key, lang, text);
    return key;
  };

  for (const ch of project.chapters) {
    put(ch.titleKey, "ch_", ch.chapterTitle);
    if (ch.description) put(ch.descriptionKey, "chd_", ch.description);
    if (ch.preamble) put(ch.preambleKey, "chp_", ch.preamble);
    for (const tk of ch.tasks) {
      put(tk.titleKey, "tk_", tk.taskTitle);
      if (tk.startMessage) put(tk.startMessageKey, "tks_", tk.startMessage);
      for (const ac of tk.actions) {
        put(ac.titleKey, "ac_", ac.actionTitle);
        if (ac.description) put(ac.descriptionKey, "acd_", ac.description);
      }
    }
  }
  return stringifyCsv(csv);
}

function chapterToYaml(ch: ChapterNode, project: PdaProject): Record<string, unknown> {
  const node: Record<string, unknown> = {
    ChapterTitle: yamlString(ch.titleKey, ch.chapterTitle, project),
    Category: ch.category || "SoloMission",
  };
  if (ch.description) node.Description = yamlString(ch.descriptionKey, ch.description, project);
  if (ch.pictureFile) node.PictureFile = ch.pictureFile;
  if (ch.playerLevel) node.PlayerLevel = toNumberOrString(ch.playerLevel);
  if (ch.visibility) node.Visibility = ch.visibility;
  if (ch.autoActivateOnGameStart) node.AutoActivateOnGameStart = true;
  if (ch.hideTasks) node.HideTasks = true;
  if (ch.preamble) node.Preamble = yamlString(ch.preambleKey, ch.preamble, project);
  if (ch.completedMessage) node.CompletedMessage = ch.completedMessage;
  if (ch.activatable) node.Activatable = ch.activatable;
  if (ch.reputationLevel) node.ReputationLevel = toNumberOrString(ch.reputationLevel);
  const rewards = ch.rewards.filter((r) => r.item || r.type);
  if (rewards.length) node.Rewards = rewards.map(rewardToYaml);
  Object.assign(node, ch.extra);
  node.Tasks = ch.tasks.map((tk) => taskToYaml(tk, project));
  return node;
}

function taskToYaml(tk: TaskNode, project: PdaProject): Record<string, unknown> {
  const node: Record<string, unknown> = {
    TaskTitle: yamlString(tk.titleKey, tk.taskTitle, project),
  };
  if (tk.headline) node.Headline = tk.headline;
  if (tk.pictureFile) node.PictureFile = tk.pictureFile;
  if (tk.startDelay) node.StartDelay = toNumberOrString(tk.startDelay);
  if (tk.startMessage) node.StartMessage = yamlString(tk.startMessageKey, tk.startMessage, project);
  Object.assign(node, tk.extra);
  node.Actions = tk.actions.map((ac) => actionToYaml(ac, project));
  return node;
}

function actionToYaml(ac: ActionNode, project: PdaProject): Record<string, unknown> {
  const node: Record<string, unknown> = {
    ActionTitle: yamlString(ac.titleKey, ac.actionTitle, project),
  };
  if (ac.description) node.Description = yamlString(ac.descriptionKey, ac.description, project);
  if (ac.check) node.Check = ac.check;
  const names = splitList(ac.names);
  const types = splitList(ac.types);
  if (names.length) node.Names = names;
  if (types.length) node.Types = types;
  if (ac.amount !== "") node.Amount = toNumberOrString(ac.amount);
  if (ac.required) node.Required = ac.required;
  if (ac.allowManualCompletion) node.AllowManualCompletion = true;
  if (ac.completedMessage) node.CompletedMessage = ac.completedMessage;
  Object.assign(node, ac.extra);
  return node;
}

function rewardToYaml(r: Reward): Record<string, unknown> {
  const node: Record<string, unknown> = {};
  if (r.type) node.Type = r.type;
  if (r.item) node.Item = r.item;
  node.Count = r.count || 1;
  if (r.faction) {
    const factions = splitList(r.faction);
    node.Faction = factions.length === 1 ? factions[0] : factions;
  }
  return node;
}

function yamlString(key: string | undefined, text: string, project: PdaProject): string {
  if (key) return key;
  if (Object.keys(project.csv.rows).length === 0) return text;
  return text;
}

function splitList(value: string): string[] {
  return value
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumberOrString(value: string): string | number {
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function slug(prefix: string, text: string, used: Set<string>): string {
  const base =
    (text || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 28) || "item";
  let key = prefix + base;
  let n = 2;
  while (used.has(key)) {
    key = `${prefix}${base}_${n}`;
    n += 1;
  }
  used.add(key);
  return key;
}

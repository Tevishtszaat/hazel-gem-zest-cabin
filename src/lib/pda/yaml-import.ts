import * as yaml from "js-yaml";
import { APP_NAME } from "../brand.ts";
import { csvLookup, parseCsv } from "./csv.ts";
import { decodePdaEscapes } from "./bbcode.ts";
import {
  ACTION_KNOWN,
  CHAPTER_KNOWN,
  TASK_KNOWN,
  type ActionNode,
  type ChapterNode,
  type CsvTable,
  type ImportIssue,
  type ImportReport,
  type PdaProject,
  type Reward,
  type TaskNode,
} from "./types.ts";

export type ImportFiles = {
  yamlText: string;
  yamlName?: string;
  csvText?: string;
  csvName?: string;
  language?: string;
};

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id${Math.random().toString(16).slice(2)}`;
}

export function sanitizeYamlSource(src: string): { text: string; notes: ImportIssue[] } {
  const notes: ImportIssue[] = [];
  let text = src;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    notes.push({ level: "info", message: "Stripped UTF-8 BOM." });
  }
  if (text.includes("\r")) {
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }
  if (text.includes("\t")) {
    text = text.replace(/\t/g, "  ");
    notes.push({ level: "info", message: "Converted tabs to spaces." });
  }
  return { text, notes };
}

export function importPda(files: ImportFiles): PdaProject {
  const started = Date.now();
  const issues: ImportIssue[] = [];
  const { text, notes } = sanitizeYamlSource(files.yamlText);
  issues.push(...notes);

  let doc: unknown;
  try {
    doc = yaml.load(text, { json: true });
  } catch (err) {
    const mark = (err as { mark?: { line?: number; column?: number } }).mark;
    const where =
      mark && typeof mark.line === "number"
        ? ` line ${mark.line + 1}${typeof mark.column === "number" ? `, column ${mark.column + 1}` : ""}`
        : "";
    throw new Error(`YAML parse failed${where}: ${(err as Error).message}`);
  }

  if (!doc || typeof doc !== "object") {
    throw new Error("YAML did not contain a document object.");
  }

  const root = doc as Record<string, unknown>;
  const csv: CsvTable = files.csvText
    ? parseCsv(files.csvText)
    : { languages: ["English"], rows: {} };
  if (files.csvText && csv.languages.length === 0) {
    issues.push({ level: "warning", message: "CSV parsed but no language columns were found." });
  }

  const language =
    files.language && csv.languages.includes(files.language)
      ? files.language
      : csv.languages.includes("English")
        ? "English"
        : (csv.languages[0] ?? "English");

  const chaptersIn = asArray(root.Chapters ?? root.chapters);
  if (!chaptersIn.length) {
    issues.push({ level: "error", message: "No Chapters array found in YAML." });
  }

  let resolved = 0;
  const unresolvedKeys: string[] = [];
  const extraFields = new Set<string>();

  const resolve = (value: unknown): { text: string; key?: string } => {
    if (value == null) return { text: "" };
    const raw = String(value);
    const looked = csvLookup(csv, raw, language);
    if (looked != null) {
      resolved += 1;
      return { text: decodePdaEscapes(looked), key: raw };
    }
    if (looksLikeKey(raw)) {
      if (Object.keys(csv.rows).length) unresolvedKeys.push(raw);
      return { text: decodePdaEscapes(raw), key: raw };
    }
    return { text: decodePdaEscapes(raw) };
  };

  const chapters: ChapterNode[] = chaptersIn.map((rawCh, index) => {
    const ch = asRecord(rawCh);
    if (!ch) {
      issues.push({ level: "warning", message: `Chapter ${index + 1} was skipped (not an object).` });
      return emptyChapter(`Broken chapter ${index + 1}`);
    }
    const title = resolve(ch.ChapterTitle ?? ch.chapterTitle);
    const description = resolve(ch.Description ?? ch.description);
    const preamble = resolve(ch.Preamble);
    const extra = pickExtra(ch, CHAPTER_KNOWN, extraFields);
    const rewards = parseRewards(ch.Rewards);
    const tasks = asArray(ch.Tasks).map((rawTk, ti) => mapTask(rawTk, ti, title.text, resolve, extraFields, issues));
    if (!tasks.length) {
      issues.push({
        level: "warning",
        message: `Chapter “${title.text || index + 1}” has no tasks.`,
      });
    }
    return {
      id: uid(),
      chapterTitle: title.text || `Chapter ${index + 1}`,
      titleKey: title.key,
      description: description.text,
      descriptionKey: description.key,
      pictureFile: str(ch.PictureFile),
      category: str(ch.Category) || "SoloMission",
      playerLevel: str(ch.PlayerLevel || 1),
      visibility: str(ch.Visibility) || "Always",
      autoActivateOnGameStart: asBool(ch.AutoActivateOnGameStart),
      hideTasks: asBool(ch.HideTasks),
      preamble: preamble.text,
      preambleKey: preamble.key,
      completedMessage: str(ch.CompletedMessage),
      activatable: str(ch.Activatable),
      reputationLevel: str(ch.ReputationLevel),
      rewards,
      tasks,
      extra,
    };
  });

  const extraRoot: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(root)) {
    if (k === "Creator" || k === "Chapters" || k === "chapters") continue;
    extraRoot[k] = v;
    extraFields.add(`root.${k}`);
  }

  if (!files.csvText) {
    issues.push({
      level: "info",
      message: "No CSV imported. YAML keys will show as-is until you add PDA.csv.",
    });
  }

  const report: ImportReport = {
    yamlName: files.yamlName || "PDA.yaml",
    csvName: files.csvName || (files.csvText ? "PDA.csv" : "—"),
    chapters: chapters.length,
    tasks: chapters.reduce((n, c) => n + c.tasks.length, 0),
    actions: chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0),
    csvKeys: Object.keys(csv.rows).length,
    languages: csv.languages,
    resolved,
    unresolvedKeys: unique(unresolvedKeys).slice(0, 40),
    extraFields: [...extraFields].sort(),
    issues,
    durationMs: Date.now() - started,
  };

  const nameFromFile = (files.yamlName || "").replace(/\.(ya?ml)$/i, "") || chapters[0]?.chapterTitle || "Imported scenario";

  return {
    name: nameFromFile === "PDA" ? "Imported scenario" : nameFromFile,
    creator: str(root.Creator) || "Unknown",
    language,
    csv,
    chapters,
    extraRoot,
    lastImport: report,
  };
}

function mapTask(
  rawTk: unknown,
  index: number,
  chapterTitle: string,
  resolve: (v: unknown) => { text: string; key?: string },
  extraFields: Set<string>,
  issues: ImportIssue[],
): TaskNode {
  const tk = asRecord(rawTk);
  if (!tk) {
    issues.push({ level: "warning", message: `A task under “${chapterTitle}” was not an object.` });
    return emptyTask(`Broken task ${index + 1}`);
  }
  const title = resolve(tk.TaskTitle ?? tk.taskTitle);
  const startMessage = resolve(tk.StartMessage);
  const extra = pickExtra(tk, TASK_KNOWN, extraFields, "task");
  const actions = asArray(tk.Actions).map((rawAc, ai) => mapAction(rawAc, ai, title.text, resolve, extraFields, issues));
  if (!actions.length) {
    issues.push({
      level: "warning",
      message: `Task “${title.text || index + 1}” in “${chapterTitle}” has no actions.`,
    });
  }
  return {
    id: uid(),
    taskTitle: title.text || `Task ${index + 1}`,
    titleKey: title.key,
    headline: str(tk.Headline),
    pictureFile: str(tk.PictureFile),
    startDelay: str(tk.StartDelay),
    startMessage: startMessage.text,
    startMessageKey: startMessage.key,
    actions,
    extra,
  };
}

function mapAction(
  rawAc: unknown,
  index: number,
  taskTitle: string,
  resolve: (v: unknown) => { text: string; key?: string },
  extraFields: Set<string>,
  issues: ImportIssue[],
): ActionNode {
  const ac = asRecord(rawAc);
  if (!ac) {
    issues.push({ level: "warning", message: `An action under “${taskTitle}” was not an object.` });
    return emptyAction(`Broken action ${index + 1}`);
  }
  const title = resolve(ac.ActionTitle ?? ac.actionTitle);
  const description = resolve(ac.Description ?? ac.description);
  return {
    id: uid(),
    actionTitle: title.text || `Action ${index + 1}`,
    titleKey: title.key,
    description: description.text,
    descriptionKey: description.key,
    check: str(ac.Check),
    names: listToEdit(ac.Names),
    types: listToEdit(ac.Types),
    amount: ac.Amount == null ? "" : String(ac.Amount),
    required: str(ac.Required),
    allowManualCompletion: asBool(ac.AllowManualCompletion ?? ac.AllowManuelCompletion),
    completedMessage: str(ac.CompletedMessage),
    extra: pickExtra(ac, ACTION_KNOWN, extraFields, "action"),
  };
}

function parseRewards(raw: unknown): Reward[] {
  return asArray(raw).map((item) => {
    const r = asRecord(item) ?? {};
    const faction = r.Faction;
    return {
      item: str(r.Item),
      type: str(r.Type),
      count: Number(r.Count ?? 1) || 1,
      faction: Array.isArray(faction) ? faction.map(String).join(", ") : str(faction),
    };
  });
}

function pickExtra(
  rec: Record<string, unknown>,
  known: Set<string>,
  bag: Set<string>,
  prefix = "chapter",
): Record<string, unknown> {
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (known.has(k)) continue;
    extra[k] = v;
    bag.add(`${prefix}.${k}`);
  }
  return extra;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return null;
}

function str(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return /^(true|yes|1)$/i.test(value.trim());
  return false;
}

function listToEdit(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join(", ");
  if (value == null) return "";
  return String(value);
}

function looksLikeKey(raw: string): boolean {
  return /^(txt_|pda_|ch_|tk_|ac_|chp|tasktitle|acttitle|chptitle)/i.test(raw) || /^[A-Za-z0-9_]{4,40}$/.test(raw);
}

function unique(list: string[]): string[] {
  return [...new Set(list)];
}

function emptyChapter(title: string): ChapterNode {
  return {
    id: uid(),
    chapterTitle: title,
    description: "",
    pictureFile: "",
    category: "SoloMission",
    playerLevel: "1",
    visibility: "Always",
    autoActivateOnGameStart: false,
    hideTasks: false,
    preamble: "",
    completedMessage: "",
    activatable: "",
    reputationLevel: "",
    rewards: [],
    tasks: [],
    extra: {},
  };
}

function emptyTask(title: string): TaskNode {
  return {
    id: uid(),
    taskTitle: title,
    headline: "",
    pictureFile: "",
    startDelay: "",
    startMessage: "",
    actions: [],
    extra: {},
  };
}

function emptyAction(title: string): ActionNode {
  return {
    id: uid(),
    actionTitle: title,
    description: "",
    check: "",
    names: "",
    types: "",
    amount: "",
    required: "",
    allowManualCompletion: false,
    completedMessage: "",
    extra: {},
  };
}

export function newChapter(): ChapterNode {
  const t = emptyTask("New task");
  t.actions = [emptyAction("New action")];
  return {
    ...emptyChapter("New chapter"),
    tasks: [t],
  };
}

export function newTask(): TaskNode {
  const t = emptyTask("New task");
  t.actions = [emptyAction("New action")];
  return t;
}

export function newAction(): ActionNode {
  return emptyAction("New action");
}

export function blankProject(): PdaProject {
  return {
    name: "Untitled scenario",
    creator: APP_NAME,
    language: "English",
    csv: { languages: ["English"], rows: {} },
    chapters: [],
    extraRoot: {},
  };
}

export function rehydrateStrings(project: PdaProject) {
  const lang = project.language;
  const csv = project.csv;
  for (const ch of project.chapters) {
    if (ch.titleKey) ch.chapterTitle = csvLookup(csv, ch.titleKey, lang) || ch.chapterTitle;
    if (ch.descriptionKey) ch.description = csvLookup(csv, ch.descriptionKey, lang) || ch.description;
    if (ch.preambleKey) ch.preamble = csvLookup(csv, ch.preambleKey, lang) || ch.preamble;
    for (const tk of ch.tasks) {
      if (tk.titleKey) tk.taskTitle = csvLookup(csv, tk.titleKey, lang) || tk.taskTitle;
      if (tk.startMessageKey) tk.startMessage = csvLookup(csv, tk.startMessageKey, lang) || tk.startMessage;
      for (const ac of tk.actions) {
        if (ac.titleKey) ac.actionTitle = csvLookup(csv, ac.titleKey, lang) || ac.actionTitle;
        if (ac.descriptionKey) ac.description = csvLookup(csv, ac.descriptionKey, lang) || ac.description;
      }
    }
  }
}

export function applyCsvText(project: PdaProject, csvText: string, csvName?: string): PdaProject {
  const incoming = parseCsv(csvText);
  const languages = [...project.csv.languages];
  for (const lang of incoming.languages) if (!languages.includes(lang)) languages.push(lang);
  const rows = { ...project.csv.rows };
  for (const [key, rec] of Object.entries(incoming.rows)) {
    rows[key] = { ...(rows[key] ?? {}), ...rec };
  }
  project.csv = { languages, rows };
  if (csvName) {
    project.lastImport = {
      ...(project.lastImport ?? {
        yamlName: "—",
        csvName,
        chapters: project.chapters.length,
        tasks: 0,
        actions: 0,
        csvKeys: Object.keys(rows).length,
        languages,
        resolved: 0,
        unresolvedKeys: [],
        extraFields: [],
        issues: [],
        durationMs: 0,
      }),
      csvName,
      csvKeys: Object.keys(rows).length,
      languages,
    };
  }
  const preferred =
    project.language && languages.includes(project.language)
      ? project.language
      : languages.includes("English")
        ? "English"
        : (languages[0] ?? "English");
  project.language = preferred;
  rehydrateStrings(project);
  return project;
}

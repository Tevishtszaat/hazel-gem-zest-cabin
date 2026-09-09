import { parseEcfObjects } from "./ecf.ts";
import { csvLookup } from "./csv.ts";
import type { CsvTable } from "./types.ts";

export type DialogueOption = {
  index: number;
  text: string;
  next: string;
  iff: string;
  execute: string;
};

export type DialogueNext = {
  index: number;
  next: string;
  iff: string;
  execute: string;
};

export type DialogueVariable = {
  index: number;
  name: string;
  param1: string;
};

export type DialogueState = {
  name: string;
  npcName: string;
  output: string;
  comment: string;
  barkingState: string;
  requiredStates: string;
  variables: DialogueVariable[];
  fields: Record<string, string>;
  options: DialogueOption[];
  nexts: DialogueNext[];
};

const OPTION = /^Option_(\d+)$/;
const OPTION_NEXT = /^OptionNext_(\d+)$/;
const OPTION_IF = /^OptionIf_(\d+)$/;
const OPTION_EX = /^OptionExecute_(\d+)$/;
const NEXT = /^Next_(\d+)$/;
const NEXT_IF = /^NextIf_(\d+)$/;
const EXECUTE = /^Execute_(\d+)$/;
const VARIABLE = /^Variable_(\d+)$/;

export const VAR_TYPES = [
  "int",
  "dbstate_int",
  "dbplayer_int",
  "dbglobal_int",
  "dbglobalpf_int",
  "dbplayerpoi_int",
  "dbplayerpf_int",
  "dbplayerpfpoi_int",
  "dbglobalpoi_int",
  "dbstate_string",
  "dbplayer_string",
  "dbglobal_string",
  "dbglobalpoi_string",
];

export const SNIPPETS = [
  { label: "End", insert: "End" },
  { label: "AddItem", insert: "AddItem('GoldCoins', 1)" },
  { label: "RemoveItem", insert: "RemoveItem('GoldCoins', 1)" },
  { label: "HasItem", insert: "HasItem('GoldCoins', 1)" },
  { label: "GetReputation", insert: "GetReputation(Faction.Talon) < Reputation.FriendlyMin" },
  { label: "AddReputation", insert: "AddReputation(Faction.Talon, 10)" },
  { label: "OpenTraderWindow", insert: "OpenTraderWindow()" },
  { label: "IsPdaChapterActive", insert: "IsPdaChapterActive('ChapterTitle')" },
  { label: "IsPdaTaskActive", insert: "IsPdaTaskActive('TaskTitle')" },
  { label: "SetNPCName", insert: "SetNPCName('Name')" },
  { label: "SetSignal", insert: "SetSignal('SignalName', true)" },
  { label: "IsSignalSet", insert: "IsSignalSet('SignalName')" },
  { label: "OpenHtmlWindow", insert: "OpenHtmlWindow('https://')" },
  { label: "AddItemsFromContainer", insert: "AddItemsFromContainer('ContainerName')" },
  { label: "UnlockTechTreeItem", insert: "UnlockTechTreeItem('ItemName')" },
  { label: "CallLater", insert: "CallLater(5, FunctionName)" },
  { label: "GotoAndReset", insert: "GotoAndReset:State_Init" },
  { label: "{PlayerName}", insert: "{PlayerName}" },
  { label: "{NPCName}", insert: "{NPCName}" },
];

export type DialogueFunction = {
  name: string;
  execute: string;
  comment: string;
};

export type DialogueDoc = {
  states: DialogueState[];
  functions: DialogueFunction[];
};

export type DialogueClip =
  | { kind: "state"; payload: DialogueState }
  | { kind: "option"; payload: DialogueOption }
  | { kind: "next"; payload: DialogueNext }
  | { kind: "variable"; payload: DialogueVariable }
  | { kind: "function"; payload: DialogueFunction };

export function parseDialogues(text: string): DialogueState[] {
  return parseEcfObjects(text)
    .filter((obj) => /dialogue/i.test(obj.kind) && obj.name)
    .map(objectToDialogue);
}

function parseVariableValue(value: string): { name: string; param1: string } {
  const match = value.match(/^"?([^,"]+)"?\s*,?\s*(?:param1:\s*(.+))?$/i);
  if (!match) return { name: value.replace(/"/g, "").trim(), param1: "" };
  return { name: (match[1] ?? "").trim(), param1: (match[2] ?? "").trim() };
}

function objectToDialogue(obj: { name: string; fields: Record<string, string> }): DialogueState {
  const fields = { ...obj.fields };
  const npcName = fields.NPCName ?? "";
  const output = fields.Output ?? "";
  const comment = fields.Comment ?? "";
  const barkingState = fields.BarkingState ?? "";
  const requiredStates = fields.RequiredStates ?? "";
  delete fields.NPCName;
  delete fields.Output;
  delete fields.Comment;
  delete fields.BarkingState;
  delete fields.RequiredStates;
  const optionIdx = new Set<number>();
  const nextIdx = new Set<number>();
  const varIdx = new Set<number>();
  for (const key of Object.keys(fields)) {
    const o = key.match(OPTION) || key.match(OPTION_NEXT) || key.match(OPTION_IF) || key.match(OPTION_EX);
    if (o) optionIdx.add(Number(o[1]));
    const n = key.match(NEXT) || key.match(NEXT_IF);
    if (n) nextIdx.add(Number(n[1]));
    const e = key.match(EXECUTE);
    if (e) nextIdx.add(Number(e[1]));
    const v = key.match(VARIABLE);
    if (v) varIdx.add(Number(v[1]));
  }
  const variables = [...varIdx]
    .sort((a, b) => a - b)
    .map((index) => {
      const parsed = parseVariableValue(fields[`Variable_${index}`] ?? "");
      delete fields[`Variable_${index}`];
      return { index, name: parsed.name, param1: parsed.param1 };
    });
  const options = [...optionIdx]
    .sort((a, b) => a - b)
    .map((index) => {
      const text = fields[`Option_${index}`] ?? "";
      const next = fields[`OptionNext_${index}`] ?? "";
      const iff = fields[`OptionIf_${index}`] ?? "";
      const execute = fields[`OptionExecute_${index}`] ?? "";
      delete fields[`Option_${index}`];
      delete fields[`OptionNext_${index}`];
      delete fields[`OptionIf_${index}`];
      delete fields[`OptionExecute_${index}`];
      return { index, text, next, iff, execute };
    });
  const nexts = [...nextIdx]
    .sort((a, b) => a - b)
    .map((index) => {
      const next = fields[`Next_${index}`] ?? "";
      const iff = fields[`NextIf_${index}`] ?? "";
      const execute = fields[`Execute_${index}`] ?? "";
      delete fields[`Next_${index}`];
      delete fields[`NextIf_${index}`];
      delete fields[`Execute_${index}`];
      return { index, next, iff, execute };
    });
  return {
    name: obj.name,
    npcName,
    output,
    comment,
    barkingState,
    requiredStates,
    variables,
    fields,
    options,
    nexts,
  };
}

function quoteEcf(value: string) {
  if (value === "") return '""';
  if (/[\s,#:]/.test(value) || /[()"']/.test(value)) return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

export function serializeDialogues(states: DialogueState[]): string {
  return (
    states
      .map((state) => {
        const lines = [`{ +Dialogue Name: ${quoteEcf(state.name)}`];
        if (state.npcName) lines.push(`  NPCName: ${quoteEcf(state.npcName)}`);
        if (state.comment) lines.push(`  Comment: ${quoteEcf(state.comment)}`);
        if (state.barkingState) lines.push(`  BarkingState: ${state.barkingState}`);
        if (state.requiredStates) lines.push(`  RequiredStates: ${quoteEcf(state.requiredStates)}`);
        for (const variable of state.variables) {
          if (!variable.name) continue;
          const param = variable.param1 ? `, param1: ${variable.param1}` : "";
          lines.push(`  Variable_${variable.index}: "${variable.name}"${param}`);
        }
        if (state.output) lines.push(`  Output: ${quoteEcf(state.output)}`);
        for (const n of state.nexts) {
          if (n.next) lines.push(`  Next_${n.index}: ${n.next}`);
          if (n.iff) lines.push(`  NextIf_${n.index}: ${quoteEcf(n.iff)}`);
          if (n.execute) lines.push(emitCode(`Execute_${n.index}`, n.execute));
        }
        for (const opt of state.options) {
          if (opt.text) lines.push(`  Option_${opt.index}: ${quoteEcf(opt.text)}`);
          if (opt.next) lines.push(`  OptionNext_${opt.index}: ${opt.next}`);
          if (opt.iff) lines.push(`  OptionIf_${opt.index}: ${quoteEcf(opt.iff)}`);
          if (opt.execute) lines.push(emitCode(`OptionExecute_${opt.index}`, opt.execute));
        }
        for (const [key, value] of Object.entries(state.fields)) {
          if (value) lines.push(`  ${key}: ${quoteEcf(value)}`);
        }
        lines.push("}");
        return lines.join("\n");
      })
      .join("\n") + "\n"
  );
}

export function dialogueGroup(state: DialogueState) {
  const cut = state.name.indexOf("_");
  if (cut > 0) return state.name.slice(0, cut);
  if (state.npcName.trim()) return state.npcName.trim();
  return "Ungrouped";
}

export function looksLikeKey(value: string) {
  const v = value.trim();
  if (!v || /\s/.test(v) || v.length < 3) return false;
  return /^(txt_|dlg|dialogue_|ch_|task_|opt_)/i.test(v) || /^[A-Za-z][A-Za-z0-9_]*$/.test(v);
}

export function resolveDialogueText(value: string, loca?: CsvTable, pda?: CsvTable, language = "English") {
  if (!value) return "";
  if (!looksLikeKey(value)) return value;
  return (loca && csvLookup(loca, value, language)) || (pda && csvLookup(pda, value, language)) || value;
}

export function blankDialogue(name = "NewDialogue"): DialogueState {
  return {
    name,
    npcName: "",
    output: "Hello.",
    comment: "",
    barkingState: "",
    requiredStates: "",
    variables: [],
    fields: {},
    options: [{ index: 1, text: "Goodbye", next: "End", iff: "", execute: "" }],
    nexts: [],
  };
}

function emitCode(key: string, value: string) {
  return `  ${key}: <![CDATA[${value}]]>`;
}

export function parseDialogueDoc(text: string): DialogueDoc {
  const objects = parseEcfObjects(text);
  return {
    states: objects.filter((obj) => /dialogue/i.test(obj.kind) && obj.name).map(objectToDialogue),
    functions: objects
      .filter((obj) => /function/i.test(obj.kind) && obj.name)
      .map((obj) => ({
        name: obj.name,
        execute: obj.fields.Execute || obj.fields.Code || "",
        comment: obj.fields.Comment || "",
      })),
  };
}

export function serializeDialogueDoc(doc: DialogueDoc): string {
  const fns = doc.functions
    .filter((fn) => fn.name)
    .map((fn) => {
      const lines = [`{ +Function Name: ${quoteEcf(fn.name)}`];
      if (fn.comment) lines.push(`  Comment: ${quoteEcf(fn.comment)}`);
      if (fn.execute) lines.push(emitCode("Execute", fn.execute));
      lines.push("}");
      return lines.join("\n");
    });
  return `${serializeDialogues(doc.states)}${fns.length ? fns.join("\n") + "\n" : ""}`;
}

export function reindex<T extends { index: number }>(rows: T[]): T[] {
  return rows.map((row, i) => ({ ...row, index: i + 1 }));
}

export function isGotoReset(next: string) {
  return /^GotoAndReset:/i.test(next.trim());
}

export function gotoTarget(next: string) {
  return next.trim().replace(/^GotoAndReset:/i, "");
}

export function setGoto(next: string, on: boolean) {
  const target = gotoTarget(next) || "State_Init";
  return on ? `GotoAndReset:${target}` : target;
}

export function blankFunction(name = "NewFunction"): DialogueFunction {
  return { name, execute: "", comment: "" };
}

export function emptyDoc(): DialogueDoc {
  return { states: [], functions: [] };
}

export function uniqueDialogueName(states: { name: string }[], base: string) {
  if (!states.some((s) => s.name === base)) return base;
  let n = 2;
  while (states.some((s) => s.name === `${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

function rewriteNext(value: string, map: Map<string, string>) {
  if (!value) return value;
  if (isGotoReset(value)) {
    const t = gotoTarget(value);
    return `GotoAndReset:${map.get(t) ?? t}`;
  }
  return map.get(value) ?? value;
}

export function mergeForeignDialogues(
  base: DialogueDoc,
  extra: DialogueDoc,
  prefix: string,
  selected: string[],
): DialogueDoc {
  const pick = extra.states.filter((s) => selected.includes(s.name));
  const map = new Map<string, string>();
  const used = new Set(base.states.map((s) => s.name));
  for (const state of pick) {
    const name = uniqueDialogueName(
      [...base.states, ...[...map.values()].map((n) => ({ name: n }))],
      `${prefix}${state.name}`,
    );
    map.set(state.name, name);
    used.add(name);
  }
  const states = pick.map((state) => ({
    ...structuredClone(state),
    name: map.get(state.name) || state.name,
    barkingState: state.barkingState ? (map.get(state.barkingState) ?? state.barkingState) : "",
    options: state.options.map((o) => ({ ...o, next: rewriteNext(o.next, map) })),
    nexts: state.nexts.map((n) => ({ ...n, next: rewriteNext(n.next, map) })),
  }));
  const fnNames = new Set(base.functions.map((f) => f.name));
  const mergedFns = extra.functions.map((fn) => {
    let name = `${prefix}${fn.name}`;
    let n = 2;
    while (fnNames.has(name)) {
      name = `${prefix}${fn.name}_${n}`;
      n += 1;
    }
    fnNames.add(name);
    return { ...fn, name };
  });
  return {
    states: [...base.states, ...states],
    functions: [...base.functions, ...mergedFns],
  };
}

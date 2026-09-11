import { parseCsv, stringifyCsv } from "./csv.ts";
import {
  collectDialogueKeys,
  parseDialogueDoc,
  serializeDialogueDoc,
  type DialogueDoc,
  type DialogueState,
} from "./dialogues.ts";
import { parseEcfObjects, type EcfObject } from "./ecf.ts";
import { configMeta, type ConfigRole } from "./config-roles.ts";
import type { ScenarioCatalog } from "./scenario-index.ts";
import type { CsvTable } from "./types.ts";

export type { ConfigRole } from "./config-roles.ts";

export function catalogText(catalog: ScenarioCatalog, role: string) {
  const hits = (catalog.texts ?? []).filter((t) => t.role === role && t.text);
  if (!hits.length) return undefined;
  return hits.reduce((best, cur) => (cur.text.length >= best.text.length ? cur : best));
}

const parsedByRole = new Map<string, { text: string; objects: EcfObject[] }>();

export function objectsFor(catalog: ScenarioCatalog, role: ConfigRole): EcfObject[] {
  const text = catalogText(catalog, role)?.text;
  if (text) {
    const hit = parsedByRole.get(role);
    if (hit && hit.text === text) return hit.objects;
    const objects = parseEcfObjects(text);
    parsedByRole.set(role, { text, objects });
    return objects;
  }
  const meta = configMeta(role);
  const kind = meta?.catalogKind || meta?.kind.toLowerCase() || "item";
  return catalog.entries
    .filter((e) => e.kind === kind)
    .map((e) => ({
      kind: meta?.kind || kind,
      plus: Boolean(meta?.plus),
      name: e.name,
      fields: e.label ? { Label: e.label } : ({} as Record<string, string>),
    }));
}

const locaByText = new Map<string, CsvTable>();

export function localizationTable(catalog: ScenarioCatalog): CsvTable {
  const text = catalogText(catalog, "localization")?.text;
  if (!text) return { languages: ["English"], rows: {} };
  const hit = locaByText.get(text);
  if (hit) return hit;
  const table = parseCsv(text);
  locaByText.set(text, table);
  if (locaByText.size > 3) locaByText.delete(locaByText.keys().next().value!);
  return table;
}

export function dialogueStrings(catalog: ScenarioCatalog): CsvTable {
  return dialogueCsvTable(catalog);
}

export function dialogueCsvTable(catalog: ScenarioCatalog, doc?: DialogueDoc): CsvTable {
  const storedText = catalogText(catalog, "dialoguesCsv")?.text;
  const stored = storedText ? parseCsv(storedText) : { languages: [] as string[], rows: {} as CsvTable["rows"] };
  const loca = localizationTable(catalog);
  const keys = collectDialogueKeys(doc ?? dialogueDocFor(catalog));
  const languages = [...new Set([...stored.languages, ...loca.languages, "English"])].filter(Boolean);
  const rows: CsvTable["rows"] = { ...stored.rows };
  for (const key of keys) {
    if (rows[key]) continue;
    if (loca.rows[key]) rows[key] = { ...loca.rows[key]! };
    else {
      const rec: Record<string, string> = {};
      for (const lang of languages) rec[lang] = "";
      rows[key] = rec;
    }
  }
  return { languages: languages.length ? languages : ["English"], rows };
}

export function writeDialoguesCsv(catalog: ScenarioCatalog, doc?: DialogueDoc) {
  return stringifyCsv(dialogueCsvTable(catalog, doc));
}

export function dialogueDocFor(catalog: ScenarioCatalog): DialogueDoc {
  const text = catalogText(catalog, "dialogues")?.text;
  if (text) return parseDialogueDoc(text);
  return {
    states: catalog.entries
      .filter((e) => e.kind === "dialogue")
      .map((e) => ({
        name: e.name,
        npcName: "",
        output: "",
        comment: "",
        barkingState: "",
        requiredStates: "",
        variables: [],
        fields: {},
        options: [],
        nexts: [],
      })),
    functions: [],
  };
}

export function dialoguesFor(catalog: ScenarioCatalog): DialogueState[] {
  return dialogueDocFor(catalog).states;
}

export function writeDialogues(doc: DialogueDoc | DialogueState[]) {
  if (Array.isArray(doc)) return serializeDialogueDoc({ states: doc, functions: [] });
  return serializeDialogueDoc(doc);
}

export function writeLocalization(table: CsvTable) {
  return stringifyCsv(table);
}

export function locaLabel(table: CsvTable, name: string, language = "English") {
  const keys = [name, `Items_${name}`, `item_${name}`, `Block_${name}`, `Token_${name}`];
  for (const key of keys) {
    const rec = table.rows[key];
    if (!rec) continue;
    const value = rec[language] || rec.English || Object.values(rec).find(Boolean);
    if (value) return value;
  }
  return "";
}

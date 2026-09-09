import { parseCsv, stringifyCsv } from "./csv.ts";
import { parseDialogueDoc, serializeDialogueDoc, type DialogueDoc, type DialogueState } from "./dialogues.ts";
import { parseEcfObjects, type EcfObject } from "./ecf.ts";
import type { ScenarioCatalog } from "./scenario-index.ts";
import type { CsvTable } from "./types.ts";

export function catalogText(catalog: ScenarioCatalog, role: string) {
  return (catalog.texts ?? []).find((t) => t.role === role);
}

export function objectsFor(catalog: ScenarioCatalog, role: "items" | "blocks" | "tokens" | "factions"): EcfObject[] {
  const text = catalogText(catalog, role)?.text;
  if (text) return parseEcfObjects(text);
  const kind = role === "items" ? "item" : role === "blocks" ? "block" : role === "tokens" ? "token" : "faction";
  return catalog.entries
    .filter((e) => e.kind === kind)
    .map((e) => ({
      kind,
      plus: false,
      name: e.name,
      fields: e.label ? { Label: e.label } : ({} as Record<string, string>),
    }));
}

export function localizationTable(catalog: ScenarioCatalog): CsvTable {
  const text = catalogText(catalog, "localization")?.text;
  if (text) return parseCsv(text);
  return { languages: ["English"], rows: {} };
}

export function dialogueStrings(catalog: ScenarioCatalog): CsvTable {
  const loca = localizationTable(catalog);
  const extraText = catalogText(catalog, "dialoguesCsv")?.text;
  if (!extraText) return loca;
  const extra = parseCsv(extraText);
  return {
    languages: [...new Set([...loca.languages, ...extra.languages])],
    rows: { ...loca.rows, ...extra.rows },
  };
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

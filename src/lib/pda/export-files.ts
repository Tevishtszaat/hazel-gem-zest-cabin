import { stringifyEcfObjects } from "./ecf.ts";
import { CONFIG_METAS } from "./config-roles.ts";
import {
  catalogText,
  dialogueCsvTable,
  dialogueDocFor,
  localizationTable,
  objectsFor,
  writeDialogues,
  writeDialoguesCsv,
  writeLocalization,
} from "./library.ts";
import { catalogLoaded, type ScenarioCatalog } from "./scenario-index.ts";
import type { PdaProject } from "./types.ts";
import { exportCsv, exportYaml } from "./yaml-export.ts";

export type ExportSlot = {
  id: string;
  label: string;
  filename: string;
  mime: string;
  ready: boolean;
  detail: string;
  build: () => string;
};

function fileName(catalog: ScenarioCatalog, role: string, fallback: string) {
  const path = catalogText(catalog, role)?.path || catalog.files.find((f) => f.role === role)?.path;
  if (!path) return fallback;
  return path.split(/[\\/]/).pop() || fallback;
}

export function exportSlots(project: PdaProject, catalog: ScenarioCatalog): ExportSlot[] {
  const loca = localizationTable(catalog);
  const dialogues = dialogueDocFor(catalog);
  const dlgCsv = dialogueCsvTable(catalog, dialogues);
  const locaKeys = Object.keys(loca.rows).length;
  const dlgCsvKeys = Object.keys(dlgCsv.rows).length;
  const loaded = catalogLoaded(catalog);

  const slots: ExportSlot[] = [
    {
      id: "pdaYaml",
      label: "PDA.yaml",
      filename: "PDA.yaml",
      mime: "text/yaml",
      ready: project.chapters.length > 0,
      detail: project.chapters.length ? `${project.chapters.length} chapters` : "No chapters yet",
      build: () => exportYaml(project),
    },
    {
      id: "pdaCsv",
      label: "PDA.csv",
      filename: "PDA.csv",
      mime: "text/csv",
      ready: project.chapters.length > 0 || Object.keys(project.csv.rows).length > 0,
      detail: `${Object.keys(project.csv.rows).length} keys`,
      build: () => exportCsv(project),
    },
  ];

  for (const meta of CONFIG_METAS) {
    if (meta.format === "yaml") {
      const text = catalogText(catalog, meta.role)?.text ?? "";
      slots.push({
        id: meta.role,
        label: meta.label,
        filename: fileName(catalog, meta.role, meta.file),
        mime: "text/yaml",
        ready: text.trim().length > 0,
        detail: text.trim() ? `${text.split(/\r?\n/).length} lines` : loaded ? `No ${meta.file} loaded` : `Import ${meta.file}`,
        build: () => text,
      });
      continue;
    }
    const objects = objectsFor(catalog, meta.role);
    slots.push({
      id: meta.role,
      label: meta.label,
      filename: fileName(catalog, meta.role, meta.file),
      mime: "text/plain",
      ready: objects.length > 0,
      detail: objects.length
        ? `${objects.length} entries`
        : loaded
          ? `No ${meta.file} loaded`
          : `Import ${meta.file}`,
      build: () => stringifyEcfObjects(objects),
    });
  }

  slots.push(
    {
      id: "localization",
      label: "Localization",
      filename: fileName(catalog, "localization", "Localization.csv"),
      mime: "text/csv",
      ready: locaKeys > 0,
      detail: locaKeys ? `${locaKeys} keys · ${loca.languages.join(", ") || "English"}` : "Import Localization.csv",
      build: () => writeLocalization(loca),
    },
    {
      id: "dialogues",
      label: "Dialogues.ecf",
      filename: fileName(catalog, "dialogues", "Dialogues.ecf"),
      mime: "text/plain",
      ready: dialogues.states.length > 0,
      detail: dialogues.states.length ? `${dialogues.states.length} states` : "Import Dialogues.ecf",
      build: () => writeDialogues(dialogues),
    },
    {
      id: "dialoguesCsv",
      label: "Dialogues.csv",
      filename: fileName(catalog, "dialoguesCsv", "Dialogues.csv"),
      mime: "text/csv",
      ready: dlgCsvKeys > 0 || dialogues.states.length > 0,
      detail: dlgCsvKeys
        ? `${dlgCsvKeys} keys · ${dlgCsv.languages.join(", ") || "English"}`
        : dialogues.states.length
          ? "No txt_ keys yet"
          : "Import Dialogues.csv",
      build: () => writeDialoguesCsv(catalog, dialogues),
    },
  );

  return slots;
}

export function downloadText(name: string, text: string, type: string) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

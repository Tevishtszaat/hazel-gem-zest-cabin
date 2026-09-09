import { stringifyEcfObjects } from "./ecf.ts";
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
  const items = objectsFor(catalog, "items");
  const blocks = objectsFor(catalog, "blocks");
  const tokens = objectsFor(catalog, "tokens");
  const templates = objectsFor(catalog, "templates");
  const reputation = objectsFor(catalog, "reputation");
  const warfare = objectsFor(catalog, "warfare");
  const galaxy = objectsFor(catalog, "galaxy");
  const loca = localizationTable(catalog);
  const dialogues = dialogueDocFor(catalog);
  const dlgCsv = dialogueCsvTable(catalog, dialogues);
  const locaKeys = Object.keys(loca.rows).length;
  const dlgCsvKeys = Object.keys(dlgCsv.rows).length;
  const loaded = catalogLoaded(catalog);

  return [
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
    {
      id: "items",
      label: "Items",
      filename: fileName(catalog, "items", "ItemsConfig.ecf"),
      mime: "text/plain",
      ready: items.length > 0,
      detail: items.length ? `${items.length} items` : loaded ? "No ItemsConfig loaded" : "Import ItemsConfig.ecf",
      build: () => stringifyEcfObjects(items),
    },
    {
      id: "blocks",
      label: "Blocks",
      filename: fileName(catalog, "blocks", "BlocksConfig.ecf"),
      mime: "text/plain",
      ready: blocks.length > 0,
      detail: blocks.length ? `${blocks.length} blocks` : loaded ? "No BlocksConfig loaded" : "Import BlocksConfig.ecf",
      build: () => stringifyEcfObjects(blocks),
    },
    {
      id: "templates",
      label: "Templates",
      filename: fileName(catalog, "templates", "Templates.ecf"),
      mime: "text/plain",
      ready: templates.length > 0,
      detail: templates.length ? `${templates.length} recipes` : loaded ? "No Templates.ecf loaded" : "Import Templates.ecf",
      build: () => stringifyEcfObjects(templates),
    },
    {
      id: "tokens",
      label: "Tokens",
      filename: fileName(catalog, "tokens", "TokenConfig.ecf"),
      mime: "text/plain",
      ready: tokens.length > 0,
      detail: tokens.length ? `${tokens.length} tokens` : loaded ? "No TokenConfig loaded" : "Import TokenConfig.ecf",
      build: () => stringifyEcfObjects(tokens),
    },
    {
      id: "reputation",
      label: "DefReputation",
      filename: fileName(catalog, "reputation", "DefReputation.ecf"),
      mime: "text/plain",
      ready: reputation.length > 0,
      detail: reputation.length ? `${reputation.length} origins` : loaded ? "No DefReputation.ecf loaded" : "Import DefReputation.ecf",
      build: () => stringifyEcfObjects(reputation),
    },
    {
      id: "warfare",
      label: "FactionWarfare",
      filename: fileName(catalog, "warfare", "FactionWarfare.ecf"),
      mime: "text/plain",
      ready: warfare.length > 0,
      detail: warfare.length ? `${warfare.length} elements` : loaded ? "No FactionWarfare.ecf loaded" : "Import FactionWarfare.ecf",
      build: () => stringifyEcfObjects(warfare),
    },
    {
      id: "galaxy",
      label: "GalaxyConfig",
      filename: fileName(catalog, "galaxy", "GalaxyConfig.ecf"),
      mime: "text/plain",
      ready: galaxy.length > 0,
      detail: galaxy.length ? `${galaxy.length} entries` : loaded ? "No GalaxyConfig.ecf loaded" : "Import GalaxyConfig.ecf",
      build: () => stringifyEcfObjects(galaxy),
    },
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
  ];
}

export function downloadText(name: string, text: string, type: string) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

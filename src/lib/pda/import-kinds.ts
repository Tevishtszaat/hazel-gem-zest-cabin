import { classifyScenarioPath } from "./scenario-index.ts";

export type ImportKind =
  | "scenario"
  | "configs"
  | "localization"
  | "itemImages"
  | "pdaImages"
  | "pdaYaml"
  | "pdaCsv"
  | "dialogues"
  | "factions"
  | "sectors"
  | "playfields"
  | "blueprints";

export const IMPORT_SLOTS: {
  id: ImportKind;
  title: string;
  hint: string;
  accept: string;
  directory?: boolean;
}[] = [
  {
    id: "scenario",
    title: "Import scenario",
    hint: "Whole folder — PDA, configs, loca, SharedData/Content/Bundles/ItemIcons, sectors, playfields, prefabs.",
    accept: "",
    directory: true,
  },
  {
    id: "configs",
    title: "Import config files",
    hint: "ItemsConfig, BlocksConfig, EClassConfig, TokenConfig, EGroups.",
    accept: ".ecf",
  },
  {
    id: "localization",
    title: "Import Localization.csv",
    hint: "Item / block display names for autocomplete.",
    accept: ".csv",
  },
  {
    id: "itemImages",
    title: "Import item images",
    hint: "SharedData/Content/Bundles/ItemIcons (scenario) or Content/Bundles/ItemIcons (game). CustomIcon names resolve from here.",
    accept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
    directory: true,
  },
  {
    id: "pdaImages",
    title: "Import PDA images",
    hint: "Extras/PDA pictures for chapter art and {image.jpg} tags.",
    accept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
  },
  {
    id: "pdaYaml",
    title: "Import PDA.yaml",
    hint: "Chapters, tasks, and actions. Keeps the CSV you already loaded.",
    accept: ".yaml,.yml",
  },
  {
    id: "pdaCsv",
    title: "Import PDA.csv",
    hint: "Resolves txt_ keys without replacing the YAML tree.",
    accept: ".csv",
  },
  {
    id: "dialogues",
    title: "Import Dialogues",
    hint: "Dialogues.ecf and Dialogues.csv — NPC states, options, and translated lines.",
    accept: ".ecf,.csv",
  },
  {
    id: "factions",
    title: "Import Factions.ecf",
    hint: "Faction names for reputation rewards.",
    accept: ".ecf",
  },
  {
    id: "sectors",
    title: "Import Sectors.yaml",
    hint: "Playfield names for PlayfieldEntered and similar checks.",
    accept: ".yaml,.yml",
  },
  {
    id: "playfields",
    title: "Import playfields",
    hint: "Playfields folder (playfield.yaml in each planet/orbit).",
    accept: ".yaml,.yml",
    directory: true,
  },
  {
    id: "blueprints",
    title: "Import blueprints",
    hint: "Prefab .epb files — POI names for NearPoi / SpawnDrone.",
    accept: ".epb",
    directory: true,
  },
];

const ROLE_FOR_KIND: Record<Exclude<ImportKind, "scenario">, string[]> = {
  configs: ["items", "blocks", "eclass", "tokens", "egroups", "ecf"],
  localization: ["localization"],
  itemImages: ["itemPicture"],
  pdaImages: ["picture"],
  pdaYaml: ["pdaYaml"],
  pdaCsv: ["pdaCsv"],
  dialogues: ["dialogues", "dialoguesCsv"],
  factions: ["factions"],
  sectors: ["sectors"],
  playfields: ["playfieldYaml"],
  blueprints: ["poi"],
};

export function fileMatchesKind(path: string, kind: ImportKind): boolean {
  const role = classifyScenarioPath(path, kind);
  if (!role) return false;
  if (kind === "scenario") return true;
  return ROLE_FOR_KIND[kind].includes(role);
}

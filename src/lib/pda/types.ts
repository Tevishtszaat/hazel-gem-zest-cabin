export type Reward = {
  item: string;
  type: string;
  count: number;
  faction: string;
};

export type ActionNode = {
  id: string;
  actionTitle: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  check: string;
  names: string;
  types: string;
  amount: string;
  required: string;
  allowManualCompletion: boolean;
  completedMessage: string;
  extra: Record<string, unknown>;
};

export type TaskNode = {
  id: string;
  taskTitle: string;
  titleKey?: string;
  headline: string;
  pictureFile: string;
  startDelay: string;
  startMessage: string;
  startMessageKey?: string;
  actions: ActionNode[];
  extra: Record<string, unknown>;
};

export type ChapterNode = {
  id: string;
  chapterTitle: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  pictureFile: string;
  category: string;
  playerLevel: string;
  visibility: string;
  autoActivateOnGameStart: boolean;
  hideTasks: boolean;
  preamble: string;
  preambleKey?: string;
  completedMessage: string;
  activatable: string;
  reputationLevel: string;
  rewards: Reward[];
  tasks: TaskNode[];
  extra: Record<string, unknown>;
};

export type CsvTable = {
  languages: string[];
  rows: Record<string, Record<string, string>>;
};

export type ImportIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type ImportReport = {
  yamlName: string;
  csvName: string;
  chapters: number;
  tasks: number;
  actions: number;
  csvKeys: number;
  languages: string[];
  resolved: number;
  unresolvedKeys: string[];
  extraFields: string[];
  issues: ImportIssue[];
  durationMs: number;
};

export type PdaProject = {
  name: string;
  creator: string;
  language: string;
  csv: CsvTable;
  chapters: ChapterNode[];
  extraRoot: Record<string, unknown>;
  lastImport?: ImportReport;
};

export const CATEGORIES = [
  "SoloMission",
  "FactionMission",
  "Tutorial",
  "Knowledgebase",
  "FAQ",
  "TalonMission",
  "PolarisMission",
  "ZiraxMission",
] as const;

export const VISIBILITY = ["Always", "ByLevel", "WhenRewarded", "ChapterActivation"] as const;

export const CHECKS = [
  { id: "InventoryOpened", hint: "Names: inventory / device / Player" },
  { id: "InventoryEmptied", hint: "Names: inventory or device" },
  { id: "InventoryContains", hint: "Names: inventory; Types: items" },
  { id: "ToolbarContains", hint: "Types: items on toolbar" },
  { id: "DevicePowered", hint: "Names or Types: device / block" },
  { id: "ConstructionQueueContains", hint: "Names: constructor" },
  { id: "ItemsPickedUp", hint: "Types: ore / plants" },
  { id: "ItemsConsumed", hint: "Types: consumed items" },
  { id: "ItemsCrafted", hint: "Types: crafted; Names: constructor" },
  { id: "ItemsUnlocked", hint: "Types: unlocked items" },
  { id: "SubjectKilled", hint: "Names: NPC / fauna" },
  { id: "StructureSpawned", hint: "Names: Base, HV, SV, CV" },
  { id: "MainPowerSwitched", hint: "Names: Base, HV, SV, CV" },
  { id: "BlocksPlaced", hint: "Names: structure; Types: block" },
  { id: "BlocksRemoved", hint: "Names: structure; Types: block" },
  { id: "BlockDestroyed", hint: "Optional POI name + block type" },
  { id: "NearPoi", hint: "Names: POI group or filename" },
  { id: "NearUnit", hint: "Names: [POI, Unit]" },
  { id: "NearResource", hint: "Types: resource" },
  { id: "PoiDiscovered", hint: "Types / POI identifier" },
  { id: "ResourceDiscovered", hint: "Names: resource" },
  { id: "Signal", hint: "Names: signal* from blueprint" },
  { id: "WindowOpened", hint: "Names: Pda, Player, inventory window" },
  { id: "PlayfieldEntered", hint: "Names: playfield from Sectors.yaml" },
  { id: "PlayfieldTypeEntered", hint: "Names: playfield template" },
  { id: "ArmorEquipped", hint: "Types: armor item" },
] as const;

export const CHAPTER_KNOWN = new Set([
  "ChapterTitle",
  "Category",
  "Description",
  "PictureFile",
  "PlayerLevel",
  "Visibility",
  "Tasks",
  "Rewards",
  "AutoActivateOnGameStart",
  "Preamble",
  "HideTasks",
  "CompletedMessage",
  "Activatable",
  "ReputationLevel",
]);

export const TASK_KNOWN = new Set([
  "TaskTitle",
  "Headline",
  "PictureFile",
  "StartDelay",
  "StartMessage",
  "Actions",
  "Rewards",
]);

export const ACTION_KNOWN = new Set([
  "ActionTitle",
  "Description",
  "Check",
  "Names",
  "Types",
  "Amount",
  "Required",
  "AllowManualCompletion",
  "CompletedMessage",
]);

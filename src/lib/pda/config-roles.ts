export type ConfigRole =
  | "items"
  | "blocks"
  | "tokens"
  | "templates"
  | "factions"
  | "eclass"
  | "egroups"
  | "reputation"
  | "warfare"
  | "galaxy"
  | "containers"
  | "lootgroups"
  | "traders"
  | "materials"
  | "statuseffects"
  | "globaldefs"
  | "blockgroups"
  | "blockshapes"
  | "animations"
  | "baiconfig"
  | "sectors";

export type ConfigGroup = "catalog" | "world" | "loot" | "defs" | "text";

export type IdMode = "required" | "optional" | "none";

export type ConfigMeta = {
  role: ConfigRole;
  file: string;
  aliases?: string[];
  label: string;
  kind: string;
  plus: boolean;
  idMode: IdMode;
  format: "ecf" | "yaml";
  group: ConfigGroup;
  catalogKind?: string;
  stats: string[];
};

export const CONFIG_METAS: ConfigMeta[] = [
  {
    role: "items",
    file: "ItemsConfig.ecf",
    label: "Items",
    kind: "Item",
    plus: true,
    idMode: "required",
    format: "ecf",
    group: "catalog",
    catalogKind: "item",
    stats: [
      "Ref",
      "Category",
      "Group",
      "StackSize",
      "Mass",
      "Volume",
      "MarketPrice",
      "Durability",
      "UnlockCost",
      "CraftTime",
      "WeaponDmg",
      "Range",
      "FuelValue",
      "O2Value",
      "FoodValue",
      "Health",
      "CustomIcon",
    ],
  },
  {
    role: "blocks",
    file: "BlocksConfig.ecf",
    label: "Blocks",
    kind: "Block",
    plus: true,
    idMode: "optional",
    format: "ecf",
    group: "catalog",
    catalogKind: "block",
    stats: [
      "Ref",
      "Category",
      "Group",
      "Class",
      "HitPoints",
      "Mass",
      "Volume",
      "MarketPrice",
      "EnergyIn",
      "EnergyOut",
      "CPUIn",
      "CPUOut",
      "UnlockCost",
      "BlastRadius",
      "MaxCount",
      "IsAccessible",
      "Material",
      "CustomIcon",
    ],
  },
  {
    role: "templates",
    file: "Templates.ecf",
    label: "Templates",
    kind: "Template",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "catalog",
    catalogKind: "item",
    stats: ["CraftTime", "OutputCount", "Target", "BaseItem"],
  },
  {
    role: "tokens",
    file: "TokenConfig.ecf",
    label: "Tokens",
    kind: "Token",
    plus: true,
    idMode: "required",
    format: "ecf",
    group: "catalog",
    catalogKind: "token",
    stats: ["MarketPrice", "DropOnDeath", "CustomIcon"],
  },
  {
    role: "factions",
    file: "Factions.ecf",
    label: "Factions",
    kind: "Faction",
    plus: false,
    idMode: "required",
    format: "ecf",
    group: "world",
    catalogKind: "faction",
    stats: ["Abbrev", "Color", "IsNPC", "Hidden"],
  },
  {
    role: "eclass",
    file: "EClassConfig.ecf",
    label: "Entities",
    kind: "Entity",
    plus: true,
    idMode: "none",
    format: "ecf",
    group: "world",
    catalogKind: "entity",
    stats: [
      "Ref",
      "EntityType",
      "Class",
      "Parent",
      "Faction",
      "Prefab",
      "ModelType",
      "IsEnemy",
      "AllowInSpawners",
      "MaxHealth",
      "Mesh",
      "XpFactor",
      "LootListOnDeath",
      "ItemsOnEnterGame",
      "Weight",
      "VolumeCapacity",
    ],
  },
  {
    role: "egroups",
    file: "EGroupsConfig.ecf",
    label: "Spawn groups",
    kind: "EGroup",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "world",
    catalogKind: "group",
    stats: ["SpawnInSameDirection"],
  },
  {
    role: "reputation",
    file: "DefReputation.ecf",
    label: "Reputation",
    kind: "Reputation",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "world",
    stats: [],
  },
  {
    role: "warfare",
    file: "FactionWarfare.ecf",
    label: "Warfare",
    kind: "Element",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "world",
    stats: [
      "Faction",
      "ScenarioGroup",
      "Lvl1MinPrice",
      "Lvl1MaxPrice",
      "Lvl5MinPrice",
      "Lvl5MaxPrice",
      "Lvl10MinPrice",
      "Lvl10MaxPrice",
      "SDScenarioGroup",
      "SDProbabilityMin",
      "SDProbabilityMax",
      "SDPriceMin",
      "SDPriceMax",
    ],
  },
  {
    role: "galaxy",
    file: "GalaxyConfig.ecf",
    label: "Galaxy",
    kind: "GalaxyConfig",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "world",
    stats: [
      "StarCount",
      "Radius",
      "NebulaCount",
      "StarterSystemLYCoord",
      "StarterSystemName",
      "StarterSystemStarClass",
      "GalaxyMode",
      "SectorsPerLY",
    ],
  },
  {
    role: "containers",
    file: "Containers.ecf",
    label: "Containers",
    kind: "Container",
    plus: true,
    idMode: "required",
    format: "ecf",
    group: "loot",
    stats: ["Count", "Size", "SfxOpen", "SfxClose", "DestroyOnClose"],
  },
  {
    role: "lootgroups",
    file: "LootGroups.ecf",
    label: "Loot groups",
    kind: "LootGroup",
    plus: true,
    idMode: "none",
    format: "ecf",
    group: "loot",
    stats: ["Count"],
  },
  {
    role: "traders",
    file: "TraderNPCConfig.ecf",
    label: "Traders",
    kind: "Trader",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "loot",
    stats: ["SellingText", "SellingGoods", "Discount"],
  },
  {
    role: "materials",
    file: "MaterialConfig.ecf",
    label: "Materials",
    kind: "Material",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: ["collidable", "liquid", "lightopacity", "Mass", "damage_category", "surface_category", "stepsound"],
  },
  {
    role: "statuseffects",
    file: "StatusEffects.ecf",
    label: "Status effects",
    kind: "StatusEffect",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: ["Duration", "Type", "BuffIf", "DebuffIf", "Mutex", "Description", "Icon", "Actions"],
  },
  {
    role: "globaldefs",
    file: "GlobalDefsConfig.ecf",
    label: "Global defs",
    kind: "GlobalDef",
    plus: true,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: [],
  },
  {
    role: "blockgroups",
    file: "BlockGroupsConfig.ecf",
    label: "Block groups",
    kind: "BlockGroup",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: ["Color"],
  },
  {
    role: "blockshapes",
    file: "BlockShapesWindow.ecf",
    aliases: ["blockshapewindow.ecf"],
    label: "Block shapes",
    kind: "Shape",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: ["Index", "Group"],
  },
  {
    role: "animations",
    file: "Animations.ecf",
    label: "Animations",
    kind: "Animation",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: [],
  },
  {
    role: "baiconfig",
    file: "BAIConfig.ecf",
    label: "Base AI",
    kind: "Element",
    plus: false,
    idMode: "none",
    format: "ecf",
    group: "defs",
    stats: ["Count"],
  },
  {
    role: "sectors",
    file: "Sectors.yaml",
    aliases: ["sectors.yml"],
    label: "Sectors",
    kind: "Sectors",
    plus: false,
    idMode: "none",
    format: "yaml",
    group: "text",
    stats: [],
  },
];

const BY_ROLE = new Map(CONFIG_METAS.map((m) => [m.role, m]));
const BY_FILE = new Map<string, ConfigMeta>();
for (const meta of CONFIG_METAS) {
  BY_FILE.set(meta.file.toLowerCase(), meta);
  for (const alias of meta.aliases ?? []) BY_FILE.set(alias.toLowerCase(), meta);
}

export const CONFIG_TEXT_ROLES = new Set<string>([
  ...CONFIG_METAS.map((m) => m.role),
  "localization",
  "dialogues",
  "dialoguesCsv",
]);

export const ECF_ROLES = CONFIG_METAS.filter((m) => m.format === "ecf").map((m) => m.role);

export function configMeta(role: string): ConfigMeta | undefined {
  return BY_ROLE.get(role as ConfigRole);
}

export function configMetaByFile(basename: string): ConfigMeta | undefined {
  return BY_FILE.get(basename.toLowerCase());
}

export function isConfigRole(role: string): role is ConfigRole {
  return BY_ROLE.has(role as ConfigRole);
}

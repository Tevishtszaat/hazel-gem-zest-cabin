import * as yaml from "js-yaml";
import type { PlayfieldFile, PlayfieldKind } from "./playfield.ts";
import { resolveCatalogToken, type ScenarioCatalog } from "./scenario-index.ts";

export type YamlDoc = Record<string, unknown>;
export type YamlRow = Record<string, unknown>;
export type CellKind = "text" | "number" | "bool" | "pair" | "list";
export type Column = { key: string; label: string; kind: CellKind; options?: string[] };

export type PlayfieldIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  path: string;
  fixFrom?: string;
  fixTo?: string;
};

export const PLANET_TYPES = [
  "Temperate",
  "Barren",
  "Desert",
  "Lava",
  "Snow",
  "Moon",
  "Ocean",
  "Alien",
  "Nascent",
  "Arid",
  "MoonDesert",
  "Space",
];

export const RESOURCE_NAMES = [
  "IronResource",
  "CopperResource",
  "SiliconResource",
  "PromethiumResource",
  "CobaltResource",
  "MagnesiumResource",
  "NeodymiumResource",
  "SathiumResource",
  "ErestrumResource",
  "ZascosiumResource",
  "GoldResource",
];

export const RANDOM_POI_COLS: Column[] = [
  { key: "GroupName", label: "GroupName", kind: "text" },
  { key: "CountMinMax", label: "Count", kind: "pair" },
  { key: "DroneProb", label: "DroneProb", kind: "number" },
  { key: "DronesMinMax", label: "Drones", kind: "pair" },
  { key: "ReserveCount", label: "Reserve", kind: "number" },
  { key: "TroopTransport", label: "TroopTransport", kind: "bool" },
  { key: "SpawnPOINear", label: "Near", kind: "list" },
  { key: "SpawnPOINearRange", label: "NearRange", kind: "pair" },
];

export const FIXED_POI_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text" },
  { key: "Prefab", label: "Prefab", kind: "text" },
  { key: "Type", label: "Type", kind: "text" },
  { key: "Pos", label: "Pos", kind: "list" },
  { key: "Rot", label: "Rot", kind: "list" },
  { key: "InitPower", label: "Powered", kind: "bool" },
  { key: "Mode", label: "Mode", kind: "text", options: ["Survival", "Creative"] },
  { key: "Faction", label: "Faction", kind: "text" },
];

export const RANDOM_RESOURCE_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text", options: RESOURCE_NAMES },
  { key: "CountMinMax", label: "Count", kind: "pair" },
  { key: "SizeMinMax", label: "Size", kind: "pair" },
  { key: "DepthMinMax", label: "Depth", kind: "pair" },
  { key: "DroneProb", label: "DroneProb", kind: "number" },
  { key: "MaxDroneCount", label: "MaxDrones", kind: "number" },
];

export const FIXED_RESOURCE_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text", options: RESOURCE_NAMES },
  { key: "Pos", label: "Pos", kind: "list" },
  { key: "Radius", label: "Radius", kind: "number" },
];

export const BIOME_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text" },
  { key: "Color", label: "Color", kind: "list" },
  { key: "Texture", label: "Texture", kind: "text" },
  { key: "YScale", label: "YScale", kind: "number" },
];

export const ENTITY_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text" },
  { key: "Period", label: "Period", kind: "text", options: ["Day", "Night", "Always"] },
  { key: "Amount", label: "Amount", kind: "number" },
  { key: "Delay", label: "Delay", kind: "number" },
];

export const SPAWN_ZONE_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text" },
  { key: "CenterX", label: "CenterX", kind: "number" },
  { key: "Radius", label: "Radius", kind: "number" },
  { key: "DronesMinMax", label: "Drones", kind: "pair" },
];

export const ASTEROID_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text", options: RESOURCE_NAMES },
  { key: "CountMinMax", label: "Count", kind: "pair" },
  { key: "SizeMinMax", label: "Size", kind: "pair" },
];

export const SPACE_VESSEL_COLS: Column[] = [
  { key: "Name", label: "Name", kind: "text" },
  { key: "Prefab", label: "Prefab", kind: "text" },
  { key: "Factions", label: "Factions", kind: "list" },
  { key: "CountMinMax", label: "Count", kind: "pair" },
];

export function loadPlayfieldDoc(text: string): YamlDoc | null {
  try {
    const doc = yaml.load(text, { json: true });
    if (doc && typeof doc === "object" && !Array.isArray(doc)) return doc as YamlDoc;
    return {};
  } catch {
    return null;
  }
}

export function dumpPlayfieldDoc(doc: YamlDoc): string {
  return yaml.dump(doc, {
    lineWidth: 140,
    noRefs: true,
    skipInvalid: true,
  });
}

export function asRows(value: unknown): YamlRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) as YamlRow[];
}

export function getPath(doc: YamlDoc, path: string[]): unknown {
  let cur: unknown = doc;
  for (const key of path) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) return undefined;
    cur = (cur as YamlDoc)[key];
  }
  return cur;
}

export function setPath(doc: YamlDoc, path: string[], value: unknown): YamlDoc {
  const next = structuredClone(doc);
  let cur: YamlDoc = next;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const child = cur[key];
    if (!child || typeof child !== "object" || Array.isArray(child)) cur[key] = {};
    cur = cur[key] as YamlDoc;
  }
  const last = path[path.length - 1]!;
  if (value == null) delete cur[last];
  else cur[last] = value;
  return next;
}

export function randomPoiPath(doc: YamlDoc): string[] {
  if (getPath(doc, ["POIs", "Random"]) !== undefined) return ["POIs", "Random"];
  if (doc.RandomPOIs !== undefined) return ["RandomPOIs"];
  return ["POIs", "Random"];
}

export function fixedPoiPath(doc: YamlDoc): string[] {
  if (getPath(doc, ["POIs", "Fixed"]) !== undefined) return ["POIs", "Fixed"];
  if (doc.FixedPOIs !== undefined) return ["FixedPOIs"];
  return ["POIs", "Fixed"];
}

export function yamlCell(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function parseCell(raw: string, kind: CellKind): unknown {
  const v = raw.trim();
  if (kind === "bool") return /^(true|yes|1)$/i.test(v);
  if (kind === "number") {
    if (v === "") return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  if (kind === "pair" || kind === "list") {
    if (!v) return [];
    return v.split(/[,\s]+/).filter(Boolean).map((part) => {
      const n = Number(part);
      return Number.isFinite(n) ? n : part;
    });
  }
  if (/^(true|false)$/i.test(v)) return /^true$/i.test(v);
  return v;
}

export function rowsToCells(list: YamlRow[], cols: Column[]): Record<string, string>[] {
  return list.map((row) => {
    const rec: Record<string, string> = {};
    for (const col of cols) rec[col.key] = yamlCell(row[col.key]);
    return rec;
  });
}

export function cellsToRows(cells: Record<string, string>[], cols: Column[], previous: YamlRow[]): YamlRow[] {
  return cells.map((cell, i) => {
    const prev = { ...(previous[i] ?? {}) };
    for (const col of cols) {
      const raw = cell[col.key] ?? "";
      if (raw === "") {
        delete prev[col.key];
        continue;
      }
      prev[col.key] = parseCell(raw, col.kind);
    }
    return prev;
  });
}

export function catalogNames(catalog: ScenarioCatalog | undefined, kind: string): string[] {
  if (!catalog) return [];
  return [...new Set(catalog.entries.filter((e) => e.kind === kind).map((e) => e.name))].sort();
}

export type DesignerTab =
  | "basics"
  | "pois"
  | "resources"
  | "creatures"
  | "spawns"
  | "biomes"
  | "check"
  | "raw";

export function tabsForKind(kind: PlayfieldKind): { id: DesignerTab; label: string }[] {
  const planet = kind === "planet" || kind === "moon";
  const tabs: { id: DesignerTab; label: string }[] = [
    { id: "basics", label: "Basics" },
    { id: "pois", label: "POIs" },
    { id: "resources", label: planet ? "Resources" : "Asteroids" },
  ];
  if (planet) {
    tabs.push({ id: "creatures", label: "Creatures" });
    tabs.push({ id: "biomes", label: "Biomes" });
  }
  tabs.push({ id: "spawns", label: "Spawns" });
  tabs.push({ id: "check", label: "Pre-flight" });
  tabs.push({ id: "raw", label: "Raw YAML" });
  return tabs;
}

function pairOrder(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const a = Number(value[0]);
  const b = Number(value[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= b) return null;
  return `${a} > ${b}`;
}

export function preflightPlayfield(
  file: PlayfieldFile,
  catalog?: ScenarioCatalog,
): PlayfieldIssue[] {
  const issues: PlayfieldIssue[] = [];
  const doc = loadPlayfieldDoc(file.text);
  if (!doc) {
    issues.push({
      level: "error",
      code: "yaml",
      message: "YAML did not parse. Fix the Raw tab before using the lists.",
      path: file.path,
    });
    return issues;
  }
  const type = String(file.fields.PlayfieldType || getPath(doc, ["PlayfieldType"]) || "");
  const planet = file.kind === "planet" || file.kind === "moon";
  if (planet && type && type.toLowerCase() === "space") {
    issues.push({
      level: "error",
      code: "type",
      message: `${file.folder} looks like a ${file.kind} but PlayfieldType is Space.`,
      path: "PlayfieldType",
    });
  }
  if ((file.kind === "orbit" || file.kind === "space") && type.toLowerCase() === "planet") {
    issues.push({
      level: "error",
      code: "type",
      message: `${file.folder} is an orbit/space file with PlayfieldType Planet.`,
      path: "PlayfieldType",
    });
  }
  if (planet && file.fields.Gravity == null && getPath(doc, ["Gravity"]) == null) {
    issues.push({
      level: "warning",
      code: "gravity",
      message: "Planet/moon has no Gravity.",
      path: "Gravity",
    });
  }
  if (!planet && (file.fields.Gravity || getPath(doc, ["Gravity"]) != null)) {
    issues.push({
      level: "warning",
      code: "gravity",
      message: "Space/orbit files should not set Gravity.",
      path: "Gravity",
    });
  }

  const pois = catalogNames(catalog, "poi");
  const random = asRows(getPath(doc, randomPoiPath(doc)));
  const seen = new Set<string>();
  random.forEach((row, i) => {
    const name = String(row.GroupName ?? "").trim();
    if (!name) {
      issues.push({
        level: "error",
        code: "poi",
        message: `Random POI ${i + 1} has no GroupName.`,
        path: `POIs.Random[${i}]`,
      });
    } else if (seen.has(name.toLowerCase())) {
      issues.push({
        level: "warning",
        code: "poi",
        message: `Duplicate GroupName “${name}”.`,
        path: `POIs.Random[${i}]`,
      });
    } else seen.add(name.toLowerCase());
    if (name && catalog) {
      const hit = resolveCatalogToken(catalog, name, ["poi"]);
      if (!hit && pois.length) {
        issues.push({
          level: "warning",
          code: "poi",
          message: `GroupName “${name}” is not in imported Prefabs, EPB GroupName tags, or Localization.csv.`,
          path: `POIs.Random[${i}].GroupName`,
        });
      } else if (hit?.via === "file" && hit.entry.poiGroup) {
        issues.push({
          level: "warning",
          code: "poi-group",
          message: `“${name}” is the .epb file. Random POIs use GroupName ${hit.entry.poiGroup}.`,
          path: `POIs.Random[${i}].GroupName`,
          fixFrom: name,
          fixTo: hit.entry.poiGroup,
        });
      } else if (hit?.via === "label" && hit.entry.poiGroup) {
        issues.push({
          level: "warning",
          code: "loca-name",
          message: `“${name}” is the spawn/display name. GroupName is ${hit.entry.poiGroup}.`,
          path: `POIs.Random[${i}].GroupName`,
          fixFrom: name,
          fixTo: hit.entry.poiGroup,
        });
      } else if (hit && hit.via === "label") {
        issues.push({
          level: "warning",
          code: "loca-name",
          message: `“${name}” is the Localization.csv name. Prefab/group id is ${hit.entry.name}.`,
          path: `POIs.Random[${i}].GroupName`,
          fixFrom: name,
          fixTo: hit.entry.name,
        });
      }
    }
    const order = pairOrder(row.CountMinMax);
    if (order) {
      issues.push({
        level: "warning",
        code: "range",
        message: `“${name || i + 1}” CountMinMax is inverted (${order}).`,
        path: `POIs.Random[${i}].CountMinMax`,
      });
    }
  });

  asRows(getPath(doc, fixedPoiPath(doc))).forEach((row, i) => {
    if (!row.Prefab && !row.Name) {
      issues.push({
        level: "error",
        code: "poi",
        message: `Fixed POI ${i + 1} needs a Prefab or Name.`,
        path: `POIs.Fixed[${i}]`,
      });
      return;
    }
    const prefab = String(row.Prefab ?? "").trim();
    if (prefab && catalog) {
      const hit = resolveCatalogToken(catalog, prefab, ["poi"]);
      if (hit?.via === "group" && hit.entry.poiFile && hit.entry.poiFile.toLowerCase() !== prefab.toLowerCase()) {
        issues.push({
          level: "warning",
          code: "poi-file",
          message: `“${prefab}” is the GroupName. Fixed POIs use Prefab file ${hit.entry.poiFile}.`,
          path: `POIs.Fixed[${i}].Prefab`,
          fixFrom: prefab,
          fixTo: hit.entry.poiFile,
        });
      }
    }
  });

  const entities = catalogNames(catalog, "entity");
  asRows(getPath(doc, ["CreatureSpawning"])).forEach((biome, bi) => {
    const biomeName = String(biome.Biome ?? biome.Name ?? `Biome ${bi + 1}`);
    asRows(biome.Entities).forEach((ent, ei) => {
      const name = String(ent.Name ?? "").trim();
      if (!name) {
        issues.push({
          level: "error",
          code: "creature",
          message: `Creature ${ei + 1} in ${biomeName} has no Name.`,
          path: `CreatureSpawning[${bi}].Entities[${ei}]`,
        });
      } else if (catalog) {
        const hit = resolveCatalogToken(catalog, name, ["entity"]);
        if (entities.length && !hit) {
          issues.push({
            level: "warning",
            code: "creature",
            message: `Creature “${name}” is not in EClassConfig or Localization.csv.`,
            path: `CreatureSpawning[${bi}].Entities[${ei}].Name`,
          });
        } else if (hit && hit.via === "label") {
          issues.push({
            level: "warning",
            code: "loca-name",
            message: `“${name}” is the Localization.csv name. Entity id is ${hit.entry.name}.`,
            path: `CreatureSpawning[${bi}].Entities[${ei}].Name`,
          });
        }
      }
    });
  });

  asRows(getPath(doc, ["RandomResources"])).forEach((row, i) => {
    if (!String(row.Name ?? "").trim()) {
      issues.push({
        level: "error",
        code: "resource",
        message: `Random resource ${i + 1} has no Name.`,
        path: `RandomResources[${i}]`,
      });
    }
  });

  return issues;
}

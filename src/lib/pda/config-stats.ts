import type { EcfObject } from "./ecf.ts";
import { configMeta } from "./config-roles.ts";

export const ITEM_STATS = [
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
];

export const BLOCK_STATS = [
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
];

export const TOKEN_STATS = ["MarketPrice", "DropOnDeath", "CustomIcon"];

export const TEMPLATE_STATS = ["CraftTime", "OutputCount", "Target", "BaseItem"];

export const WARFARE_STATS = [
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
];

export const GALAXY_GENERAL_STATS = [
  "StarCount",
  "Radius",
  "NebulaCount",
  "NebulaColors1",
  "NebulaColors2",
  "NebulaColors3",
  "StarterSystemLYCoord",
  "StarterSystemName",
  "StarterSystemStarClass",
  "GalaxyMode",
  "SectorsPerLY",
];

export const TERRITORY_STATS = ["Faction", "Center", "Radius"];

export function statsFor(role: string) {
  return configMeta(role)?.stats ?? [];
}

export function objectLabel(obj: EcfObject): string {
  if (obj.id && /^\d+$/.test(obj.id.trim()) && obj.name) return obj.name;
  if (obj.name) return obj.name;
  if (obj.id) return `#${obj.id}`;
  return obj.kind || "entry";
}

export function objectKey(obj: EcfObject, index: number): string {
  return `${obj.kind}:${obj.id ?? ""}:${obj.name}:${index}`;
}

export const ENTITY_CLASS_KEYS = ["EntityType", "Class", "Parent", "Faction", "Ref"] as const;
export type EntityClassKey = (typeof ENTITY_CLASS_KEYS)[number];

export function entityByName(objects: EcfObject[]): Map<string, EcfObject> {
  const map = new Map<string, EcfObject>();
  for (const obj of objects) {
    if (obj.name) map.set(obj.name.toLowerCase(), obj);
  }
  return map;
}

export function resolvedField(
  obj: EcfObject,
  key: string,
  byName: Map<string, EcfObject>,
  seen?: Set<string>,
): string {
  const own = (obj.fields[key] ?? "").trim();
  if (own) return own;
  const ref = (obj.fields.Ref ?? "").trim();
  if (!ref) return "";
  const walk = seen ?? new Set<string>();
  const id = (obj.name || "").toLowerCase();
  if (id) {
    if (walk.has(id)) return "";
    walk.add(id);
  }
  const parent = byName.get(ref.toLowerCase());
  if (!parent || parent === obj) return "";
  return resolvedField(parent, key, byName, walk);
}

export function classFieldValue(obj: EcfObject, key: EntityClassKey, byName: Map<string, EcfObject>): string {
  if (key === "Ref") return (obj.fields.Ref ?? "").trim();
  return resolvedField(obj, key, byName);
}

export function fieldIndex(objects: EcfObject[], key: EntityClassKey, byName?: Map<string, EcfObject>): string[] {
  const map = byName ?? entityByName(objects);
  const set = new Set<string>();
  for (const obj of objects) {
    const value = classFieldValue(obj, key, map);
    if (value) set.add(value);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function matchesClassFilter(
  obj: EcfObject,
  filters: Record<EntityClassKey, string>,
  byName: Map<string, EcfObject>,
): boolean {
  for (const key of ENTITY_CLASS_KEYS) {
    const wanted = filters[key];
    if (!wanted || wanted === "all") continue;
    const got = classFieldValue(obj, key, byName);
    if (wanted === "__none") {
      if (got) return false;
    } else if (got !== wanted) return false;
  }
  return true;
}

export function entityGroupKey(obj: EcfObject, byName: Map<string, EcfObject>): string {
  return resolvedField(obj, "EntityType", byName) || resolvedField(obj, "Parent", byName) || "Unclassified";
}

export function entityClassLine(obj: EcfObject, byName: Map<string, EcfObject>): string {
  const type = resolvedField(obj, "EntityType", byName);
  const faction = resolvedField(obj, "Faction", byName);
  const klass = resolvedField(obj, "Class", byName);
  return [type, faction || klass].filter(Boolean).join(" · ");
}

export function groupByEntityType(
  objects: EcfObject[],
  byName: Map<string, EcfObject>,
): { key: string; rows: EcfObject[] }[] {
  const groups = new Map<string, EcfObject[]>();
  for (const obj of objects) {
    const key = entityGroupKey(obj, byName);
    const rows = groups.get(key);
    if (rows) rows.push(obj);
    else groups.set(key, [obj]);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, rows]) => ({ key, rows }));
}

export function numericIds(objects: EcfObject[]): number[] {
  return objects
    .map((obj) => Number(obj.id))
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
}

/** Empyrion treats Item/Block Name (with or without +) as a floating ID when Id is omitted. */
export function entryIdentity(obj: EcfObject): { kind: "numeric" | "floating"; label: string } {
  if (obj.id && /^\d+$/.test(obj.id.trim())) {
    return { kind: "numeric", label: obj.id.trim() };
  }
  const name = (obj.name || "unnamed").trim();
  return { kind: "floating", label: `${obj.plus ? "+" : ""}${name}` };
}

export const blockIdentity = entryIdentity;

export function floatingEntries(objects: EcfObject[]): EcfObject[] {
  return objects.filter((obj) => entryIdentity(obj).kind === "floating" && obj.name);
}

export const floatingBlocks = floatingEntries;


export function unusedNumericIds(
  used: number[],
  opts?: { pad?: number; limit?: number },
): { ids: number[]; ranges: { from: number; to: number; count: number }[]; total: number; next: number } {
  const pad = opts?.pad ?? 16;
  const limit = opts?.limit ?? 60;
  const set = new Set(used.filter((n) => Number.isInteger(n) && n > 0));
  const max = set.size ? Math.max(...set) : 0;
  const end = Math.max(max + pad, pad);
  const ids: number[] = [];
  const ranges: { from: number; to: number; count: number }[] = [];
  let run: number | null = null;
  let total = 0;
  for (let i = 1; i <= end; i++) {
    if (set.has(i)) {
      if (run != null) {
        ranges.push({ from: run, to: i - 1, count: i - run });
        run = null;
      }
      continue;
    }
    total += 1;
    if (ids.length < limit) ids.push(i);
    if (run == null) run = i;
  }
  if (run != null) ranges.push({ from: run, to: end, count: end - run + 1 });
  return { ids, ranges, total, next: max + 1 || 1 };
}

export function templateInputs(obj: EcfObject): { name: string; count: string }[] {
  const child = obj.children?.find((c) => /input/i.test(c.name)) ?? obj.children?.[0];
  if (!child) return [];
  return Object.entries(child.fields).map(([name, count]) => ({ name, count }));
}

export function withTemplateInputs(obj: EcfObject, rows: { name: string; count: string }[]): EcfObject {
  const fields: Record<string, string> = {};
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) continue;
    fields[name] = row.count.trim() || "1";
  }
  const inputs: EcfObject = { kind: "Child", plus: false, name: "Inputs", fields };
  const rest = (obj.children ?? []).filter((c) => !/input/i.test(c.name));
  return { ...obj, children: [inputs, ...rest] };
}

export function numericValue(value: string | undefined) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[^0-9.+-eE]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export type CompareRow = {
  key: string;
  left: string;
  right: string;
  delta: number | null;
};

export function compareObjects(left: EcfObject, right: EcfObject, prefer: string[]): CompareRow[] {
  const keys = [...new Set([...prefer, ...Object.keys(left.fields), ...Object.keys(right.fields)])].filter(
    (k) => k !== "Label",
  );
  return keys.map((key) => {
    const a = left.fields[key] ?? "";
    const b = right.fields[key] ?? "";
    const na = numericValue(a);
    const nb = numericValue(b);
    return {
      key,
      left: a,
      right: b,
      delta: na != null && nb != null ? nb - na : null,
    };
  });
}

export function similarBlocks(all: EcfObject[], block: EcfObject) {
  const cat = block.fields.Category;
  const group = block.fields.Group;
  return all.filter((other) => {
    if (other.name === block.name) return false;
    if (cat && other.fields.Category === cat) return true;
    if (group && other.fields.Group === group) return true;
    return false;
  });
}

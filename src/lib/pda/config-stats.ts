import type { EcfObject } from "./ecf.ts";

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
  "StarterSystemLYCoord",
  "StarterSystemName",
  "StarterSystemStarClass",
  "GalaxyMode",
  "SectorsPerLY",
];

export const TERRITORY_STATS = ["Faction", "Center", "Radius"];

export function statsFor(role: "items" | "blocks" | "tokens" | "templates") {
  if (role === "items") return ITEM_STATS;
  if (role === "tokens") return TOKEN_STATS;
  if (role === "templates") return TEMPLATE_STATS;
  return BLOCK_STATS;
}

export function numericIds(objects: EcfObject[]): number[] {
  return objects
    .map((obj) => Number(obj.id))
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
}

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

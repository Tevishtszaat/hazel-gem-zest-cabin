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

export function statsFor(role: "items" | "blocks" | "tokens") {
  if (role === "items") return ITEM_STATS;
  if (role === "tokens") return TOKEN_STATS;
  return BLOCK_STATS;
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

import type { CatalogText } from "./scenario-index.ts";

export type PlayfieldKind = "planet" | "moon" | "orbit" | "space" | "unknown";
export type PlayfieldVariant = "playfield" | "static" | "dynamic" | "space-dynamic" | "space-static";

export const PLAYFIELD_BASENAMES = [
  "playfield.yaml",
  "playfield.yml",
  "playfield_static.yaml",
  "playfield_static.yml",
  "playfield_dynamic.yaml",
  "playfield_dynamic.yml",
  "space_dynamic.yaml",
  "space_dynamic.yml",
  "space_static.yaml",
  "space_static.yml",
] as const;

export const SHARED_PLAYFIELD_KEYS = [
  "PlayfieldType",
  "PlanetType",
  "Biome",
  "Description",
  "PvP",
  "Difficulty",
  "AllowCV",
  "SunFlare",
];

export const PLANET_PLAYFIELD_KEYS = [
  ...SHARED_PLAYFIELD_KEYS,
  "Gravity",
  "AtmosphereO2",
  "AtmosphereBreathable",
  "AtmosphereEnabled",
  "AtmosphereDensity",
  "AtmosphereColor",
  "SkyColor",
  "Temperature",
  "TemperatureDay",
  "TemperatureNight",
  "DayLength",
  "Water",
  "WaterBlock",
  "SeaLevel",
  "ScaledRadius",
  "RealRadius",
  "Moons",
  "Seed",
  "UseFixed",
];

export const SPACE_PLAYFIELD_KEYS = [...SHARED_PLAYFIELD_KEYS, "Skybox", "AtmosphereEnabled"];

export type PlayfieldFile = {
  name: string;
  folder: string;
  path: string;
  variant: PlayfieldVariant;
  kind: PlayfieldKind;
  text: string;
  fields: Record<string, string>;
};

export type PlayfieldBundle = {
  folder: string;
  name: string;
  kind: PlayfieldKind;
  files: PlayfieldFile[];
};

export function isPlayfieldBasename(base: string) {
  return (PLAYFIELD_BASENAMES as readonly string[]).includes(base.toLowerCase());
}

export function playfieldVariant(path: string): PlayfieldVariant {
  const base = path.split(/[/\\]/).pop()?.toLowerCase() || "";
  if (base.startsWith("playfield_static")) return "static";
  if (base.startsWith("playfield_dynamic")) return "dynamic";
  if (base.startsWith("space_dynamic")) return "space-dynamic";
  if (base.startsWith("space_static")) return "space-static";
  return "playfield";
}

export function yamlScalars(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const re = /^([A-Za-z][\w]*)\s*:\s*(.*?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const key = m[1]!;
    const raw = m[2]!.replace(/#.*$/, "").trim();
    if (!raw || raw === "|" || raw === ">" || raw === "-") continue;
    fields[key] = raw.replace(/^['"]|['"]$/g, "");
  }
  return fields;
}

export function formatYamlValue(value: string) {
  const v = value.trim();
  if (!v) return '""';
  if (/^(true|false|null)$/i.test(v)) return v;
  if (/^-?\d+(\.\d+)?$/.test(v)) return v;
  if (v.startsWith("[") || v.startsWith("{")) return v;
  if (/[:#,{}[\]]/.test(v) || /\s/.test(v)) return `"${v.replace(/"/g, '\\"')}"`;
  return v;
}

export function patchYamlField(text: string, key: string, value: string): string {
  const re = new RegExp(`^([ \\t]*${key}\\s*:\\s*).*$`, "m");
  const next = `${key}: ${formatYamlValue(value)}`;
  if (re.test(text)) return text.replace(re, `$1${formatYamlValue(value)}`);
  return `${text.replace(/\s*$/, "")}\n${next}\n`;
}

export function classifyPlayfieldKind(fields: Record<string, string>, folder: string, variant: PlayfieldVariant): PlayfieldKind {
  const type = (fields.PlayfieldType || "").toLowerCase();
  const planet = (fields.PlanetType || "").toLowerCase();
  const biome = (fields.Biome || "").toLowerCase();
  const blob = `${type} ${planet} ${biome} ${folder}`.toLowerCase();
  if (/moon/.test(blob)) return "moon";
  if (type === "planet" || (planet && planet !== "space")) return "planet";
  if (type === "space" || planet === "space") {
    if (/orbit/.test(blob) || variant === "dynamic" || variant === "space-dynamic") {
      return /orbit/.test(folder.toLowerCase()) || /orbit/.test(blob) ? "orbit" : "space";
    }
    return /orbit/.test(blob) ? "orbit" : "space";
  }
  if (variant === "dynamic" || variant === "space-dynamic") return /orbit/.test(folder.toLowerCase()) ? "orbit" : "space";
  return "unknown";
}

export function playfieldFolder(path: string) {
  const parts = path.replace(/\\/g, "/").split("/");
  const file = parts.pop() || "";
  const folder = parts.pop() || file.replace(/\.[^.]+$/, "");
  return /^playfields?$/i.test(folder) ? file.replace(/\.[^.]+$/, "") : folder;
}

export function playfieldFromText(path: string, text: string): PlayfieldFile {
  const folder = playfieldFolder(path);
  const variant = playfieldVariant(path);
  const fields = yamlScalars(text);
  return {
    name: folder,
    folder,
    path,
    variant,
    kind: classifyPlayfieldKind(fields, folder, variant),
    text,
    fields,
  };
}

function rankVariant(variant: PlayfieldVariant) {
  if (variant === "static") return 0;
  if (variant === "playfield") return 1;
  if (variant === "space-static") return 2;
  if (variant === "dynamic") return 3;
  if (variant === "space-dynamic") return 4;
  return 5;
}

function rankKind(kind: PlayfieldKind) {
  if (kind === "planet") return 4;
  if (kind === "moon") return 3;
  if (kind === "orbit") return 2;
  if (kind === "space") return 1;
  return 0;
}

export function bundlePlayfields(texts: CatalogText[]): PlayfieldBundle[] {
  const groups = new Map<string, PlayfieldFile[]>();
  for (const text of texts) {
    if (text.role !== "playfieldYaml" || !text.text) continue;
    const file = playfieldFromText(text.path, text.text);
    const list = groups.get(file.folder) ?? [];
    list.push(file);
    groups.set(file.folder, list);
  }
  return [...groups.values()]
    .map((files) => {
      const kind = files.reduce((best, file) => (rankKind(file.kind) > rankKind(best) ? file.kind : best), "unknown" as PlayfieldKind);
      const folder = files[0]!.folder;
      return { folder, name: folder, kind, files: files.sort((a, b) => rankVariant(a.variant) - rankVariant(b.variant)) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function keysForKind(kind: PlayfieldKind) {
  if (kind === "planet" || kind === "moon") return PLANET_PLAYFIELD_KEYS;
  return SPACE_PLAYFIELD_KEYS;
}

export function kindLabel(kind: PlayfieldKind) {
  if (kind === "planet") return "Planet";
  if (kind === "moon") return "Moon";
  if (kind === "orbit") return "Orbit";
  if (kind === "space") return "Space";
  return "Unknown";
}

export function variantLabel(variant: PlayfieldVariant) {
  if (variant === "static") return "playfield_static.yaml";
  if (variant === "dynamic") return "playfield_dynamic.yaml";
  if (variant === "space-dynamic") return "space_dynamic.yaml";
  if (variant === "space-static") return "space_static.yaml";
  return "playfield.yaml";
}

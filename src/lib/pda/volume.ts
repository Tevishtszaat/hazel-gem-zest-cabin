import type { EcfObject } from "./ecf.ts";

export type Vec3 = [number, number, number];

export type VolumeBody = {
  name: string;
  kind: string;
  playfieldType?: string;
  local: Vec3;
  line: number;
  quoted: boolean;
};

export type VolumeSystem = {
  name: string;
  starClass: string;
  ly: Vec3;
  color: string;
  coordLine?: number;
  starClassLine?: number;
  nameLine?: number;
  playfieldsLine?: number;
  blockStart: number;
  blockEnd: number;
  bodies: VolumeBody[];
};

export type GalaxyRegion = {
  id: string;
  name: string;
  shape: "sphere" | "elliptical";
  inner: number;
  outer: number;
  color: string;
};

export type GalaxyTerritory = {
  id: string;
  faction: string;
  center: Vec3;
  radius: number;
  color: string;
};

export type GalaxyVolume = {
  inner: number;
  outer: number;
  sectorsPerLy: number;
  regions: GalaxyRegion[];
  territories: GalaxyTerritory[];
  nebulas: { key: string; stops: Vec3[] }[];
};

const FACTION_COLOR: Record<string, string> = {
  zirax: "#ff5a4a",
  talon: "#ff9a3c",
  polaris: "#3ec6ff",
  kriel: "#7dff6a",
  pirates: "#c58bff",
  trader: "#ffd15a",
  uch: "#f4f7ff",
  civilian: "#b7c0cc",
  alien: "#ff6ad5",
  player: "#4aa3ff",
};

function leading(line: string) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function nums(text: string): number[] {
  return text
    .split(/[, ]+/)
    .map((part) => Number(part))
    .filter((n) => Number.isFinite(n));
}

export function parseVec3(text: string | undefined, fallback: Vec3 = [0, 0, 0]): Vec3 {
  const n = nums(text || "");
  if (n.length < 3) return fallback;
  return [n[0]!, n[1]!, n[2]!];
}

function unquote(value: string) {
  const v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return v.slice(1, -1).trim();
  return v;
}

function splitFields(rest: string) {
  const out: string[] = [];
  let cur = "";
  let quote = "";
  for (const ch of rest) {
    if (quote) {
      if (ch === quote) quote = "";
      else cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.map(unquote).filter((part) => part && !/^~/.test(part));
}

export function parsePlayfieldLine(line: string): Omit<VolumeBody, "line"> | null {
  const start = line.indexOf("[");
  const end = line.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  const inner = line.slice(start + 1, end).trim();
  const quoted = inner.match(/^(['"])(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\1\s*,\s*([\s\S]*)$/);
  const numeric = inner.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*([\s\S]*)$/);
  if (!quoted && !numeric) return null;
  const local: Vec3 = quoted
    ? [Number(quoted[2]), Number(quoted[3]), Number(quoted[4])]
    : [Number(numeric![1]), Number(numeric![2]), Number(numeric![3])];
  if (local.some((n) => !Number.isFinite(n))) return null;
  const fields = splitFields((quoted ? quoted[5] : numeric![4]) || "");
  if (!fields[0]) return null;
  return {
    name: fields[0],
    kind: fields[1] || "Playfield",
    playfieldType: fields[2] || undefined,
    local,
    quoted: Boolean(quoted),
  };
}

function blankSystem(blockStart: number): VolumeSystem {
  return {
    name: "",
    starClass: "",
    ly: [0, 0, 0],
    color: "",
    blockStart,
    blockEnd: blockStart,
    bodies: [],
  };
}

function applySystemLine(system: VolumeSystem, index: number, line: string) {
  const trimmed = line.trim();
  const coords = trimmed.match(/^-\s*Coordinates:\s*\[([^\]]+)\]/i) || trimmed.match(/^Coordinates:\s*\[([^\]]+)\]/i);
  if (coords) {
    system.ly = parseVec3(coords[1]);
    system.coordLine = index;
    return;
  }
  const named = trimmed.match(/^(?:-\s*)?(SectorName|Name)\s*:\s*(.+)$/i);
  if (named) {
    system.name = unquote(named[2]!.replace(/\s+#.*$/, ""));
    system.nameLine = index;
    return;
  }
  const klass = trimmed.match(/^(?:-\s*)?StarClass\s*:\s*([^\s#]+)/i);
  if (klass) {
    system.starClass = unquote(klass[1]!);
    system.starClassLine = index;
    return;
  }
  const color = trimmed.match(/^Color\s*:\s*(.+)$/i);
  if (color) system.color = unquote(color[1]!.replace(/\s+#.*$/, ""));
}

export function parseVolumeSystems(yaml: string): VolumeSystem[] {
  const lines = yaml.split(/\r?\n/);
  const systems: VolumeSystem[] = [];
  let cur: VolumeSystem | null = null;
  let inPlayfields = false;
  const flush = (end: number) => {
    if (!cur) return;
    cur.blockEnd = end;
    if (!cur.name) {
      const sun = cur.bodies.find((body) => /sun|star/i.test(body.kind));
      cur.name = sun?.name || `System ${systems.length + 1}`;
    }
    systems.push(cur);
    cur = null;
    inPlayfields = false;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sectorStart = /^-\s+(Coordinates|Name|SectorName|StarClass)\s*:/i.test(trimmed) && leading(line) <= 2;
    if (sectorStart) {
      flush(i);
      cur = blankSystem(i);
      applySystemLine(cur, i, line);
      continue;
    }
    if (!cur) continue;
    if (/Playfields\s*:/i.test(trimmed) && !trimmed.startsWith("-")) {
      inPlayfields = true;
      cur.playfieldsLine = i;
      continue;
    }
    if (inPlayfields && trimmed.startsWith("-") && trimmed.includes("[")) {
      const body = parsePlayfieldLine(line);
      if (body) cur.bodies.push({ ...body, line: i });
      continue;
    }
    if (inPlayfields && leading(line) <= 2 && /^[A-Za-z]/.test(trimmed)) inPlayfields = false;
    if (!inPlayfields) applySystemLine(cur, i, line);
  }
  flush(lines.length);
  return systems;
}

function join(yaml: string, lines: string[]) {
  const nl = yaml.includes("\r\n") ? "\r\n" : "\n";
  return lines.join(nl);
}

export function formatTriple(v: Vec3) {
  const n = (x: number) => String(Math.round(x * 1000) / 1000);
  return `${n(v[0])}, ${n(v[1])}, ${n(v[2])}`;
}

export function formatPlayfield(indent: string, body: Pick<VolumeBody, "local" | "name" | "kind" | "playfieldType" | "quoted">) {
  const type = body.playfieldType ? `, ${body.playfieldType}` : "";
  if (body.quoted) return `${indent}- ['${formatTriple(body.local)}', ${body.name}, ${body.kind}${type}]`;
  return `${indent}- [${formatTriple(body.local)}, ${body.name}, ${body.kind}${type}]`;
}

export function patchVolumeLine(yaml: string, line: number, next: string) {
  const lines = yaml.split(/\r?\n/);
  if (!lines[line] && line !== lines.length) return yaml;
  lines[line] = next;
  return join(yaml, lines);
}

export function patchSystemCoordinates(yaml: string, system: VolumeSystem, ly: Vec3) {
  const lines = yaml.split(/\r?\n/);
  const triple = `[${formatTriple(ly)}]`;
  if (system.coordLine != null && lines[system.coordLine]) {
    lines[system.coordLine] = lines[system.coordLine]!.replace(/\[[^\]]+\]/, triple);
  } else {
    const indent = leading(lines[system.blockStart] || "") > 0 ? "" : "  ";
    lines.splice(system.blockStart + 1, 0, `${indent}Coordinates: ${triple}`);
  }
  return join(yaml, lines);
}

export function patchSystemStarClass(yaml: string, system: VolumeSystem, starClass: string) {
  const lines = yaml.split(/\r?\n/);
  const value = starClass.trim();
  if (system.starClassLine != null && lines[system.starClassLine]) {
    lines[system.starClassLine] = lines[system.starClassLine]!.replace(/StarClass\s*:\s*\S+/i, `StarClass: ${value}`);
  } else {
    lines.splice(system.blockStart + 1, 0, `  StarClass: ${value}`);
  }
  return join(yaml, lines);
}

export function patchPlayfield(yaml: string, body: VolumeBody, next: Pick<VolumeBody, "local" | "name" | "kind" | "playfieldType">) {
  const lines = yaml.split(/\r?\n/);
  const indent = (lines[body.line] || "").match(/^\s*/)?.[0] ?? "  ";
  lines[body.line] = formatPlayfield(indent, { ...next, quoted: body.quoted });
  return join(yaml, lines);
}

export function addPlayfield(yaml: string, system: VolumeSystem, body: Pick<VolumeBody, "local" | "name" | "kind" | "playfieldType">) {
  const lines = yaml.split(/\r?\n/);
  const last = system.bodies[system.bodies.length - 1];
  const at = (last?.line ?? system.playfieldsLine ?? system.blockStart) + 1;
  const sample = last ? (lines[last.line] || "") : "  - ['0, 0, 0', Sun, Sun]";
  const indent = sample.match(/^\s*/)?.[0] || "  ";
  const quoted = last ? last.quoted : true;
  lines.splice(at, 0, formatPlayfield(indent, { ...body, quoted }));
  return join(yaml, lines);
}

export function removePlayfield(yaml: string, body: VolumeBody) {
  const lines = yaml.split(/\r?\n/);
  lines.splice(body.line, 1);
  return join(yaml, lines);
}

function cssColor(text: string | undefined, fallback: string) {
  const n = nums(text || "");
  if (n.length < 3) return fallback;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round((v > 1 ? v / 255 : v) * 255)));
  return `rgb(${c(n[0]!)}, ${c(n[1]!)}, ${c(n[2]!)})`;
}

const REGION_PALETTE = ["#7eb6ff", "#ffd36a", "#ff8b6a", "#8dffb0", "#d2a6ff", "#6aefff"];

export function readGalaxyVolume(general: EcfObject | null | undefined): GalaxyVolume {
  const fields = general?.fields ?? {};
  const radius = nums(fields.Radius || "");
  const inner = radius.length >= 2 ? radius[0]! : 0;
  const outer = radius.length >= 2 ? radius[1]! : radius[0] || 1000;
  const sectorsPerLy = Number(fields.SectorsPerLY) || 100000;
  const regions: GalaxyRegion[] = [];
  const territories: GalaxyTerritory[] = [];
  for (const child of general?.children ?? []) {
    if (/starregion/i.test(child.name)) {
      const span = nums(child.fields.RadiusMinMax || "");
      regions.push({
        id: child.name,
        name: child.fields.Name || child.name,
        shape: /ellipt/i.test(child.fields.Shape || "") ? "elliptical" : "sphere",
        inner: span[0] ?? 0,
        outer: span[1] ?? span[0] ?? 0,
        color: cssColor(child.fields.LabelColor, REGION_PALETTE[regions.length % REGION_PALETTE.length]!),
      });
    }
    if (/territory/i.test(child.name)) {
      const faction = child.fields.Faction || child.fields.Name || child.name;
      const radiusLy = Number(String(child.fields.Radius || "").split(",")[0]);
      territories.push({
        id: child.name,
        faction,
        center: parseVec3(child.fields.Center),
        radius: Number.isFinite(radiusLy) ? radiusLy : 10,
        color: FACTION_COLOR[faction.toLowerCase()] || "#d7deea",
      });
    }
  }
  const nebulas = Object.keys(fields)
    .filter((key) => /^NebulaColors\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
    .map((key) => {
      const n = nums(fields[key] || "");
      const stops: Vec3[] = [];
      for (let i = 0; i + 2 < n.length; i += 3) stops.push([n[i]!, n[i + 1]!, n[i + 2]!]);
      return { key, stops };
    })
    .filter((nebula) => nebula.stops.length);
  return { inner, outer: Math.max(outer, 1), sectorsPerLy, regions, territories, nebulas };
}

export function starTint(starClass: string, color: string) {
  if (color) return cssColor(color, "#ffe7a3");
  const letter = starClass.trim().charAt(0).toUpperCase();
  if (letter === "O" || letter === "B") return "#9ecbff";
  if (letter === "A" || letter === "F") return "#f4f7ff";
  if (letter === "G") return "#ffe29a";
  if (letter === "K") return "#ffb15a";
  if (letter === "M") return "#ff6d4a";
  return "#fff4cf";
}

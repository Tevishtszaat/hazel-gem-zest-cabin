import type { EcfObject } from "./ecf.ts";

export type Vec3 = [number, number, number];

export type VolumeBody = {
  name: string;
  kind: string;
  playfieldType?: string;
  local: Vec3;
  line: number;
  quoted: boolean;
  coordLine?: number;
  nameLine?: number;
  kindLine?: number;
  typeLine?: number;
  entryEnd?: number;
  flowLocal?: Vec3;
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

function isStructuralKind(value: string) {
  return /^(sun|star|planet|moon|orbit|space|asteroid|gas|station|playfield)$/i.test(value.trim());
}

function inferKind(name: string, biome: string) {
  const text = `${name} ${biome}`;
  if (/moon/i.test(text)) return "Moon";
  if (/orbit/i.test(text)) return "Orbit";
  if (/\b(sun|star)\b/i.test(text)) return "Sun";
  if (/space|warp|station|asteroid/i.test(text)) return "Space";
  return "Planet";
}

function describeSlots(name: string, slot2 = "", slot3 = "") {
  const second = slot2.trim();
  const third = slot3.trim();
  if (!second) return { kind: "Playfield", playfieldType: third || undefined };
  if (isStructuralKind(second)) return { kind: second, playfieldType: third || undefined };
  return { kind: inferKind(name, second), playfieldType: third || second };
}

function tripleFrom(text: string): Vec3 | null {
  const n = nums(text);
  if (n.length < 3) return null;
  return [n[0]!, n[1]!, n[2]!];
}

function isZero(v: Vec3) {
  return v[0] === 0 && v[1] === 0 && v[2] === 0;
}

export function parsePlayfieldLine(line: string): Omit<VolumeBody, "line"> | null {
  const start = line.indexOf("[");
  const end = line.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  const inner = line.slice(start + 1, end).trim();
  const quoted = inner.match(/^(['"])(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\1\s*,\s*([\s\S]*)$/);
  const numeric = inner.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*([\s\S]*)$/);
  if (quoted || numeric) {
    const local: Vec3 = quoted
      ? [Number(quoted[2]), Number(quoted[3]), Number(quoted[4])]
      : [Number(numeric![1]), Number(numeric![2]), Number(numeric![3])];
    if (local.some((n) => !Number.isFinite(n))) return null;
    const fields = splitFields((quoted ? quoted[5] : numeric![4]) || "");
    if (!fields[0]) return null;
    let orbit = local;
    for (const field of fields) {
      const extra = tripleFrom(field);
      if (extra && isZero(orbit) && !isZero(extra)) orbit = extra;
    }
    return {
      name: fields[0],
      kind: fields[1] || "Playfield",
      playfieldType: fields[2] || undefined,
      local: orbit,
      quoted: Boolean(quoted),
    };
  }
  const fields = splitFields(inner);
  if (fields.length < 2) return null;
  const last = fields[fields.length - 1] || "";
  const trailing = tripleFrom(last);
  const numericTail = fields.length >= 5 && fields.slice(-3).every((field) => /^-?[\d.]+$/.test(field));
  let local: Vec3 | null = null;
  let head = fields;
  if (numericTail) {
    const tail = fields.slice(-3);
    local = [Number(tail[0]), Number(tail[1]), Number(tail[2])];
    head = fields.slice(0, -3);
  } else if (trailing && !/^[A-Za-z]/.test(last.trim())) {
    local = trailing;
    head = fields.slice(0, -1);
  }
  if (!local || local.some((n) => !Number.isFinite(n)) || !head[0]) return null;
  return {
    name: head[0],
    kind: head[1] || "Playfield",
    playfieldType: head[2] || undefined,
    local,
    quoted: false,
  };
}

function readDashTriple(lines: string[], start: number) {
  const found: number[] = [];
  let i = start;
  while (i < lines.length && found.length < 3) {
    const trimmed = (lines[i] || "").trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    const hit = trimmed.match(/^-\s*(-?[\d.]+)\s*$/);
    if (!hit) break;
    found.push(Number(hit[1]));
    i += 1;
  }
  if (found.length < 3 || found.some((n) => !Number.isFinite(n))) return null;
  return { local: [found[0], found[1], found[2]] as Vec3, next: i };
}

function applyBodyKey(body: VolumeBody, lineIndex: number, text: string) {
  const inline = text.match(/^(Coordinates|Pos|Position)\s*:\s*\[([^\]]+)\]/i);
  if (inline) {
    const local = tripleFrom(inline[2] || "");
    if (local) {
      body.local = local;
      body.coordLine = lineIndex;
    }
    return;
  }
  const named = text.match(/^(Name|SectorName)\s*:\s*(.+)$/i);
  if (named) {
    body.name = unquote(named[2]!.replace(/\s+#.*$/, ""));
    body.nameLine = lineIndex;
    return;
  }
  const typed = text.match(/^(PlayfieldType|PlanetType|Biome|Type)\s*:\s*(.+)$/i);
  if (typed) {
    body.playfieldType = unquote(typed[2]!.replace(/\s+#.*$/, ""));
    body.typeLine = lineIndex;
    if (!isStructuralKind(body.kind)) body.kind = inferKind(body.name, body.playfieldType || "");
    return;
  }
  const kind = text.match(/^Kind\s*:\s*(.+)$/i);
  if (kind) {
    body.kind = unquote(kind[1]!.replace(/\s+#.*$/, ""));
    body.kindLine = lineIndex;
  }
}

function readMapBody(lines: string[], start: number): { body: VolumeBody; next: number } | null {
  const base = leading(lines[start] || "");
  const body: VolumeBody = { name: "", kind: "Playfield", local: [0, 0, 0], line: start, quoted: false, nameLine: start };
  applyBodyKey(body, start, (lines[start] || "").trim().replace(/^-\s+/, ""));
  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] || "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    if (leading(line) <= base) break;
    if (/^(Coordinates|Pos|Position)\s*:$/i.test(trimmed)) {
      const triple = readDashTriple(lines, i + 1);
      if (triple) {
        body.local = triple.local;
        body.coordLine = i;
        i = triple.next;
        continue;
      }
    }
    applyBodyKey(body, i, trimmed);
    i += 1;
  }
  if (!body.name) return null;
  body.entryEnd = i;
  if (!isStructuralKind(body.kind)) body.kind = inferKind(body.name, body.playfieldType || "");
  return { body, next: i };
}

function readSeqBody(lines: string[], start: number): { body: VolumeBody; next: number } | null {
  const base = leading(lines[start] || "");
  const coordText = (lines[start] || "").trim().replace(/^-\s+-\s+/, "");
  const local = tripleFrom(unquote(coordText));
  if (!local) return null;
  const fields: string[] = [];
  const fieldLines: number[] = [];
  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] || "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    if (leading(line) <= base || !trimmed.startsWith("-")) break;
    fields.push(unquote(trimmed.replace(/^-\s+/, "").replace(/\s+#.*$/, "")));
    fieldLines.push(i);
    i += 1;
  }
  if (!fields[0]) return null;
  const described = describeSlots(fields[0], fields[1] || "", fields[2] || "");
  return {
    body: {
      name: fields[0],
      kind: described.kind,
      playfieldType: described.playfieldType,
      local,
      line: start,
      coordLine: start,
      nameLine: fieldLines[0],
      kindLine: fieldLines[1],
      typeLine: fieldLines[2],
      quoted: /^['"]/.test(coordText.trim()),
      entryEnd: i,
    },
    next: i,
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
    if (/^Coordinates\s*:$/i.test(trimmed)) {
      const triple = readDashTriple(lines, i + 1);
      if (triple) {
        if (inPlayfields) {
          const body = cur.bodies[cur.bodies.length - 1];
          if (body && isZero(body.local)) {
            body.local = triple.local;
            body.coordLine = i;
          }
        } else {
          cur.ly = triple.local;
          cur.coordLine = i;
        }
        i = triple.next - 1;
        continue;
      }
    }
    if (inPlayfields && /^\s*-\s+-\s+/.test(line)) {
      const seq = readSeqBody(lines, i);
      if (seq) {
        cur.bodies.push(seq.body);
        i = seq.next - 1;
        continue;
      }
    }
    if (inPlayfields && /^-\s+(Name|SectorName|Coordinates|Pos|Position)\s*:/i.test(trimmed)) {
      const map = readMapBody(lines, i);
      if (map) {
        cur.bodies.push(map.body);
        i = map.next - 1;
        continue;
      }
    }
    if (inPlayfields && trimmed.startsWith("-") && trimmed.includes("[")) {
      const body = parsePlayfieldLine(line);
      if (body) {
        const full: VolumeBody = { ...body, line: i };
        const follow = /^\s*(Coordinates|Pos|Position)\s*:/i.test((lines[i + 1] || "").trim()) ? i + 1 : -1;
        if (follow >= 0 && leading(lines[follow] || "") > leading(line)) {
          const inline = (lines[follow] || "").trim().match(/^(?:Coordinates|Pos|Position)\s*:\s*\[([^\]]+)\]/i);
          const nested = inline ? null : readDashTriple(lines, follow + 1);
          const local = inline ? tripleFrom(inline[1] || "") : nested?.local;
          if (local && (isZero(full.local) || !isZero(local))) {
            full.flowLocal = full.flowLocal ?? full.local;
            full.local = local;
            full.coordLine = follow;
          }
        }
        cur.bodies.push(full);
      }
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
  if (body.coordLine != null && lines[body.coordLine] && body.coordLine !== body.line) {
    lines[body.coordLine] = replaceCoordLine(lines[body.coordLine]!, next.local);
  } else if (body.coordLine != null && lines[body.line] && !lines[body.line]!.includes("[")) {
    lines[body.line] = replaceCoordLine(lines[body.line]!, next.local);
  }
  if (body.nameLine != null && lines[body.nameLine] && body.nameLine !== body.line) {
    lines[body.nameLine] = replaceYamlValue(lines[body.nameLine]!, next.name);
  }
  if (body.kindLine != null && lines[body.kindLine]) lines[body.kindLine] = replaceYamlValue(lines[body.kindLine]!, next.kind);
  if (body.typeLine != null && lines[body.typeLine]) lines[body.typeLine] = replaceYamlValue(lines[body.typeLine]!, next.playfieldType || "");
  if (lines[body.line]?.includes("[")) {
    const indent = (lines[body.line] || "").match(/^\s*/)?.[0] ?? "  ";
    const flow = body.flowLocal ?? (body.coordLine != null && body.coordLine !== body.line ? body.flowLocal : undefined);
    lines[body.line] = formatPlayfield(indent, {
      ...next,
      local: flow ?? next.local,
      quoted: body.quoted,
    });
  }
  return join(yaml, lines);
}

function replaceYamlValue(line: string, value: string) {
  return line.replace(/:\s*.+$/, `: ${value}`);
}

function replaceCoordLine(line: string, local: Vec3) {
  if (/\[[^\]]*\]/.test(line)) return line.replace(/\[[^\]]*\]/, `[${formatTriple(local)}]`);
  const indent = line.match(/^\s*/)?.[0] ?? "";
  if (/^-\s+-/.test(line.trim()) || line.trim().startsWith("- -")) return `${indent}- - ${formatTriple(local)}`;
  return line;
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
  const end = body.entryEnd ?? body.line + 1;
  lines.splice(body.line, Math.max(1, end - body.line));
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

export const STAR_CLASS_LEGEND = [
  { id: "class:OB", label: "O / B stars", color: "#9ecbff" },
  { id: "class:AF", label: "A / F stars", color: "#f4f7ff" },
  { id: "class:G", label: "G stars", color: "#ffe29a" },
  { id: "class:K", label: "K stars", color: "#ffb15a" },
  { id: "class:M", label: "M stars", color: "#ff6d4a" },
  { id: "class:other", label: "Other stars", color: "#fff4cf" },
];

export function starClassKey(starClass: string) {
  const letter = starClass.trim().charAt(0).toUpperCase();
  if (letter === "O" || letter === "B") return "class:OB";
  if (letter === "A" || letter === "F") return "class:AF";
  if (letter === "G" || letter === "K" || letter === "M") return `class:${letter}`;
  return "class:other";
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

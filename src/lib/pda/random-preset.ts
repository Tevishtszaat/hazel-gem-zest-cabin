export type ProbPair = { amount: string; prob: string };
export type Weight = { name: string; weight: string };
export type NamedRow = { comment: string; raw: string };
export type TypeBlock = {
  section: string;
  name: string;
  color: string;
  icon: string;
  climate: string;
  placement: string;
  moonProb: string;
  moonType: string;
  orbitType: string;
  moonOrbitType: string;
  distance: string;
  playfieldLevel: string;
  forceSizeClass: string;
  forcePlanetType: string;
  hasOrbit: string;
  hasTerrain: string;
  playerStart: string;
  playfields: Weight[];
};

export type RandomPresetDoc = {
  scalars: { key: string; value: string }[];
  countRows: NamedRow[];
  listRows: NamedRow[];
  poiCount: string;
  pois: string;
  types: TypeBlock[];
};

const LIST_KEYS = new Set(["PlanetCountProbs", "PlanetLists", "POICountProbs", "POIs"]);

export function parsePairs(raw: string): ProbPair[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [amount, prob] = part.split(":").map((bit) => bit.trim());
      return { amount: amount || "0", prob: prob || "0" };
    });
}

export function formatPairs(pairs: ProbPair[]) {
  return pairs.map((pair) => `${pair.amount} : ${pair.prob}`).join(",  ");
}

export function parseWeights(raw: string): Weight[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const split = part.split(":");
      const name = (split[0] || "").trim();
      const weight = (split[1] || "1").trim();
      return { name, weight };
    })
    .filter((row) => row.name);
}

export function formatWeights(rows: Weight[]) {
  return rows.map((row) => `${row.name}:${row.weight || "1"}`).join(", ");
}

function unquote(value: string) {
  const trimmed = value.trim().replace(/,?\s*$/, "");
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function emptyType(section: string, name: string): TypeBlock {
  return {
    section,
    name,
    color: "",
    icon: "",
    climate: "",
    placement: "",
    moonProb: "",
    moonType: "",
    orbitType: "",
    moonOrbitType: "",
    distance: "",
    playfieldLevel: "",
    forceSizeClass: "",
    forcePlanetType: "",
    hasOrbit: "",
    hasTerrain: "",
    playerStart: "",
    playfields: [],
  };
}

export function parseRandomPreset(text: string): RandomPresetDoc {
  const doc: RandomPresetDoc = { scalars: [], countRows: [], listRows: [], poiCount: "", pois: "", types: [] };
  let mode: "none" | "counts" | "lists" | "types" = "none";
  let section = "";
  let current: TypeBlock | null = null;
  let inPlayfields = false;
  let inPlacement = false;
  const finish = () => {
    if (current) doc.types.push(current);
    current = null;
    inPlayfields = false;
    inPlacement = false;
  };
  for (const line of text.split(/\r?\n/)) {
    const sectionHit = line.match(/^  ([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (sectionHit && !line.startsWith("   ")) {
      finish();
      const key = sectionHit[1]!;
      const rest = sectionHit[2] ?? "";
      if (key === "PlanetCountProbs") {
        mode = "counts";
        continue;
      }
      if (key === "PlanetLists") {
        mode = "lists";
        continue;
      }
      if (key === "POICountProbs") {
        mode = "none";
        doc.poiCount = unquote(rest.replace(/#.*$/, ""));
        continue;
      }
      if (key === "POIs") {
        mode = "none";
        doc.pois = unquote(rest.replace(/#.*$/, ""));
        continue;
      }
      if (/Types$/.test(key)) {
        mode = "types";
        section = key;
        continue;
      }
      mode = "none";
      if (!LIST_KEYS.has(key) && rest.trim() && !rest.trim().startsWith("#")) {
        doc.scalars.push({ key, value: rest.replace(/#.*$/, "").trim() });
      }
      continue;
    }
    if (mode === "counts" || mode === "lists") {
      const item = line.match(/^\s+-\s+(['"])([\s\S]*?)\1\s*(?:#\s*(.*))?$/);
      if (!item) continue;
      const row = { raw: item[2]!.trim(), comment: (item[3] || "").trim() };
      if (mode === "counts") doc.countRows.push(row);
      else doc.listRows.push(row);
      continue;
    }
    if (mode === "types") {
      const named = line.match(/^\s+-\s+Name:\s*(.+?)\s*$/);
      if (named && !/^\s+#/.test(line)) {
        finish();
        current = emptyType(section, named[1]!.replace(/#.*$/, "").trim());
        continue;
      }
      if (!current) continue;
      if (inPlayfields) {
        const play = line.match(/^\s+-\s+([^#]+?)\s*$/);
        if (play) {
          const bits = play[1]!.split(",");
          const name = bits[0]!.trim();
          const weight = (bits[1] || "1").trim();
          if (name) current.playfields.push({ name, weight });
          continue;
        }
      }
      if (inPlacement) {
        const place = line.match(/^\s+-\s+([^#]+?)\s*$/);
        if (place) {
          current.placement = current.placement ? `${current.placement}, ${place[1]!.trim()}` : place[1]!.trim();
          continue;
        }
      }
      const field = line.match(/^\s+([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
      if (!field) continue;
      inPlayfields = field[1] === "Playfields";
      inPlacement = field[1] === "Placement";
      const value = unquote((field[2] || "").replace(/#.*$/, "").trim());
      const map: Record<string, keyof TypeBlock> = {
        Color: "color",
        Icon: "icon",
        Climate: "climate",
        MoonProb: "moonProb",
        MoonType: "moonType",
        OrbitType: "orbitType",
        MoonOrbitType: "moonOrbitType",
        Distance: "distance",
        PlayfieldLevel: "playfieldLevel",
        ForceSizeClass: "forceSizeClass",
        ForcePlanetType: "forcePlanetType",
        HasOrbit: "hasOrbit",
        HasTerrain: "hasTerrain",
        PlayerStart: "playerStart",
      };
      const slot = map[field[1]!];
      if (slot && slot !== "playfields" && slot !== "section" && slot !== "name") {
        current[slot] = value as never;
      }
    }
  }
  finish();
  return doc;
}

function presetScalar(value: string) {
  const v = value.trim();
  if (!v) return '""';
  if (/^[[{]/.test(v) || /^['"]/.test(v)) return v;
  if (/^(true|false)$/i.test(v)) return v.toLowerCase();
  if (/^(yes|no|on|off|y|n|null)$/i.test(v)) return `"${v}"`;
  if (/[:#]/.test(v) || /\s/.test(v)) return `'${v.replace(/'/g, "''")}'`;
  return v;
}

function presetEntry(name: string, weight?: string) {
  const raw = weight && weight !== "1" ? `${name}, ${weight}` : name;
  return /[:#]/.test(raw) ? `'${raw.replace(/'/g, "''")}'` : raw;
}

function yamlList(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `            - ${presetScalar(part)}`)
    .join("\n");
}

function writeType(block: TypeBlock) {
  const lines = [`      - Name: ${presetScalar(block.name)}`];
  if (block.color) lines.push(`        Color: ${presetScalar(block.color)}`);
  if (block.icon) lines.push(`        Icon: ${presetScalar(block.icon)}`);
  if (block.distance) lines.push(`        Distance: ${presetScalar(block.distance)}`);
  if (block.placement) {
    lines.push("        Placement:");
    lines.push(yamlList(block.placement));
  }
  if (block.playerStart) lines.push(`        PlayerStart: ${presetScalar(block.playerStart)}`);
  if (block.moonProb) lines.push(`        MoonProb: '${block.moonProb.replace(/'/g, "''")}'`);
  if (block.moonType) lines.push(`        MoonType: ${block.moonType.startsWith("[") ? block.moonType : `[${block.moonType}]`}`);
  if (block.orbitType) lines.push(`        OrbitType: ${block.orbitType.startsWith("[") ? block.orbitType : `[${block.orbitType}]`}`);
  if (block.moonOrbitType) {
    lines.push(`        MoonOrbitType: ${block.moonOrbitType.startsWith("[") ? block.moonOrbitType : `[${block.moonOrbitType}]`}`);
  }
  if (block.climate) lines.push(`        Climate: ${presetScalar(block.climate)}`);
  if (block.playfieldLevel) lines.push(`        PlayfieldLevel: ${presetScalar(block.playfieldLevel)}`);
  if (block.forceSizeClass) lines.push(`        ForceSizeClass: ${presetScalar(block.forceSizeClass)}`);
  if (block.forcePlanetType) {
    lines.push(`        ForcePlanetType: ${block.forcePlanetType.startsWith("[") ? block.forcePlanetType : `[${block.forcePlanetType}]`}`);
  }
  if (block.hasOrbit) lines.push(`        HasOrbit: ${presetScalar(block.hasOrbit)}`);
  if (block.hasTerrain) lines.push(`        HasTerrain: ${presetScalar(block.hasTerrain)}`);
  if (block.playfields.length) {
    lines.push("        Playfields:");
    for (const play of block.playfields) lines.push(`            - ${presetEntry(play.name, play.weight)}`);
  }
  return lines.join("\n");
}

export function writeRandomPreset(doc: RandomPresetDoc): string {
  const lines = ["---", "GenerationParams:"];
  for (const scalar of doc.scalars) lines.push(`  ${scalar.key}: ${presetScalar(scalar.value)}`);
  lines.push("  PlanetCountProbs:");
  for (const row of doc.countRows) lines.push(`    - '${row.raw}'${row.comment ? ` # ${row.comment}` : ""}`);
  lines.push("  PlanetLists:");
  for (const row of doc.listRows) lines.push(`    - '${row.raw}'${row.comment ? ` # ${row.comment}` : ""}`);
  lines.push(`  POICountProbs: '${doc.poiCount}'`);
  lines.push(`  POIs: '${doc.pois}'`);
  const sections = [...new Set(doc.types.map((block) => block.section))];
  for (const section of sections) {
    lines.push(`  ${section}:`);
    for (const block of doc.types.filter((item) => item.section === section)) lines.push(writeType(block));
  }
  lines.push("");
  return lines.join("\n");
}

export function blankRandomPreset(star = "Custom"): string {
  return writeRandomPreset({
    scalars: [
      { key: "MapScale", value: "1.0" },
      { key: "SolarSystemSqueezeMinMax", value: "[0.005, 0.1]" },
      { key: "OneWayWarpProb", value: "0" },
      { key: "UniqueStarterPlanet", value: "false" },
    ],
    countRows: [{ raw: "0 : 0.5,  1 : 0.5", comment: "1 - Temperate" }],
    listRows: [{ raw: "Temperate:1", comment: "1 - Temperate" }],
    poiCount: "0 : 0.6,  1 : 0.4",
    pois: "SpaceEmpty:0.5, POIExploreT1:0.5",
    types: [
      {
        ...emptyType("PlanetTypes", "Temperate"),
        color: "[0.2, 0.7, 0.3]",
        placement: "HabitableTemperate",
        climate: "Temperate",
        playfieldLevel: "[1, 3]",
        moonProb: "0:0.6, 1:0.4",
        moonType: "MoonBarren",
        orbitType: "DefaultOrbit",
        playfields: [{ name: "Temperate", weight: "1" }],
      },
      {
        ...emptyType("OrbitTypes", "DefaultOrbit"),
        color: "[0.3, 0.3, 0.3]",
        hasOrbit: "false",
        hasTerrain: "false",
        playfieldLevel: "[1, 4]",
        playfields: [{ name: `${star}Orbit`, weight: "1" }],
      },
    ],
  });
}

export function presetFileName(name: string) {
  const clean = name.trim().replace(/\.ya?ml$/i, "").replace(/[^\w.-]+/g, "_");
  const base = clean || "SolarSystemConfig_Custom";
  return /solarsystemconfig/i.test(base) ? `${base}.yaml` : `SolarSystemConfig_${base}.yaml`;
}

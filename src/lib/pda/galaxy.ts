import type { EcfObject } from "./ecf.ts";

/** Empyrion internal scale: 1 AU = 10 sectors. Galaxy radius is in light-years. */
export const SECTORS_PER_AU = 10;

export const STAR_ZONE_KEYS = [
  "InnerSystem",
  "HabitableHot",
  "HabitableTemperate",
  "HabitableCold",
  "OuterSystem",
] as const;

export type StarZoneKey = (typeof STAR_ZONE_KEYS)[number];

export const STAR_ZONES: { key: StarZoneKey; label: string; hint: string; color: string }[] = [
  { key: "InnerSystem", label: "Inner", hint: "Lava / very hot", color: "#ea580c" },
  { key: "HabitableHot", label: "Hot", hint: "Arid / desert", color: "#fb7185" },
  { key: "HabitableTemperate", label: "Temperate", hint: "Earth-like generation", color: "#4ade80" },
  { key: "HabitableCold", label: "Cold", hint: "Snow / cold desert", color: "#22d3ee" },
  { key: "OuterSystem", label: "Outer", hint: "Barren / gas giants", color: "#60a5fa" },
];

export const STAR_STATS = [
  "StarClass",
  "Model",
  "Probability",
  "SizeClass",
  "Color",
  "LightColor",
  "SurfaceTemperature",
  "Mass",
  "Radius",
  "Luminosity",
  "ColorName",
  "Age",
  "InnerSystem",
  "HabitableHot",
  "HabitableTemperate",
  "HabitableCold",
  "OuterSystem",
  "HabitableZone",
  "GalaxySpawnRadius",
  "GalaxySpawnAmount",
  "ClusterProb",
  "ClusterRange",
  "Description",
];

export const STAR_REGION_STATS = ["Name", "Shape", "RadiusMinMax", "TotalSpawnCount", "UseDefaultStarDef", "Position", "FlattenFac"];

export type NumRange = { min: number; max: number };

export function parseRange(value?: string | null): NumRange | null {
  if (!value) return null;
  const parts = value.split(",").map((p) => Number(p.trim()));
  const nums = parts.filter((n) => Number.isFinite(n));
  if (!nums.length) {
    const n = Number(value);
    return Number.isFinite(n) ? { min: n, max: n } : null;
  }
  if (nums.length === 1) return { min: nums[0]!, max: nums[0]! };
  return { min: Math.min(nums[0]!, nums[1]!), max: Math.max(nums[0]!, nums[1]!) };
}

export function formatRange(range: NumRange) {
  return range.min === range.max ? String(range.min) : `${range.min}, ${range.max}`;
}

export function mid(range: NumRange) {
  return (range.min + range.max) / 2;
}

export function rgbFromField(value?: string): string {
  if (!value) return "#fbbf24";
  const nums = value.split(",").map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
  if (nums.length < 3) return "#fbbf24";
  const [r, g, b] = nums;
  const to = (n: number) => Math.round(Math.max(0, Math.min(1, n > 1 ? n / 255 : n)) * 255);
  return `rgb(${to(r!)}, ${to(g!)}, ${to(b!)})`;
}

export function luminosityOf(star: EcfObject): number {
  const n = Number(star.fields.Luminosity);
  return Number.isFinite(n) && n >= 0 ? n : 1;
}

/** Kopparapu-style conservative HZ in AU, scaled by sqrt(L / Lsun). */
export function physicsHabitableAU(luminosity: number): { inner: number; outer: number; optimisticInner: number; optimisticOuter: number } {
  const s = Math.sqrt(Math.max(luminosity, 0));
  return {
    inner: 0.95 * s,
    outer: 1.67 * s,
    optimisticInner: 0.75 * s,
    optimisticOuter: 1.77 * s,
  };
}

export function auToSectors(au: number) {
  return au * SECTORS_PER_AU;
}

export function sectorsToAu(sectors: number) {
  return sectors / SECTORS_PER_AU;
}

/** Relative solar flux vs Earth at 1 AU around Sol. Inverse-square. */
export function solarFlux(luminosity: number, sectors: number): number {
  const au = Math.max(sectorsToAu(Math.max(sectors, 0.01)), 0.01);
  return luminosity / (au * au);
}

export type ZoneSpan = { key: StarZoneKey; label: string; hint: string; color: string; min: number; max: number };

export function starZoneSpans(star: EcfObject): ZoneSpan[] {
  const out: ZoneSpan[] = [];
  for (const zone of STAR_ZONES) {
    const range = parseRange(star.fields[zone.key]);
    if (!range) continue;
    out.push({ ...zone, min: range.min, max: range.max });
  }
  return out;
}

export function axisMax(star: EcfObject, bodies: SystemBody[] = []): number {
  const spans = starZoneSpans(star);
  const physics = physicsHabitableAU(luminosityOf(star));
  const fromZones = spans.length ? Math.max(...spans.map((s) => s.max)) : 0;
  const fromBodies = bodies.length ? Math.max(...bodies.map((b) => b.distance)) : 0;
  const fromPhysics = auToSectors(physics.optimisticOuter);
  return Math.max(fromZones, fromBodies, fromPhysics, 20);
}

export function zoneAtDistance(star: EcfObject, sectors: number): ZoneSpan | null {
  return starZoneSpans(star).find((z) => sectors >= z.min && sectors <= z.max) ?? null;
}

export function zoneWarnings(star: EcfObject): string[] {
  const spans = starZoneSpans(star);
  const warnings: string[] = [];
  for (let i = 1; i < spans.length; i++) {
    const prev = spans[i - 1]!;
    const cur = spans[i]!;
    if (cur.min < prev.max) warnings.push(`${cur.label} overlaps ${prev.label} (${cur.min} < ${prev.max} sectors).`);
    else if (cur.min > prev.max + 1) warnings.push(`Gap between ${prev.label} and ${cur.label} (${prev.max}–${cur.min} sectors).`);
  }
  const L = luminosityOf(star);
  const physics = physicsHabitableAU(L);
  const temperate = spans.find((s) => s.key === "HabitableTemperate");
  if (temperate) {
    const midAu = sectorsToAu(mid({ min: temperate.min, max: temperate.max }));
    if (midAu < physics.inner * 0.7 || midAu > physics.outer * 1.4) {
      warnings.push(
        `Temperate band sits at ${midAu.toFixed(2)} AU; physics HZ for L=${L} is ${physics.inner.toFixed(2)}–${physics.outer.toFixed(2)} AU (${auToSectors(physics.inner).toFixed(0)}–${auToSectors(physics.outer).toFixed(0)} sectors).`,
      );
    }
  }
  return warnings;
}

export type SystemBody = {
  system: string;
  starClass?: string;
  name: string;
  kind: string;
  coords: [number, number, number];
  distance: number;
};

function dist(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Pull playfield positions out of Sectors.yaml (Sectors or SolarSystems). Distances are in sectors from the local origin. */
export function parseSectorBodies(yaml: string): SystemBody[] {
  const bodies: SystemBody[] = [];
  if (!yaml.trim()) return bodies;
  const blocks = yaml.split(/\n(?=\s*-\s+(?:Name:|Coordinates:))/);
  for (const block of blocks) {
    const nameMatch = block.match(/^\s*-?\s*Name:\s*(.+)$/m);
    const classMatch = block.match(/StarClass:\s*(\S+)/);
    const system = (nameMatch?.[1] || "System").replace(/['"]/g, "").trim();
    const starClass = classMatch?.[1]?.replace(/['"]/g, "");
    const origin: [number, number, number] = [0, 0, 0];
    const tupleRe = /\[\s*['"]?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*['"]?\s*,\s*([^,\]]+),\s*([^,\]]+)/g;
    let m: RegExpExecArray | null;
    while ((m = tupleRe.exec(block))) {
      const coords: [number, number, number] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const name = m[4]!.replace(/['"]/g, "").trim();
      const kind = m[5]!.replace(/['"]/g, "").trim();
      bodies.push({
        system,
        starClass,
        name,
        kind,
        coords,
        distance: dist(coords, origin),
      });
    }
  }
  if (bodies.length) return bodies;

  const loose = /\[\s*['"]?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*['"]?\s*,\s*([^,\]]+),\s*([^,\]]+)/g;
  let m: RegExpExecArray | null;
  while ((m = loose.exec(yaml))) {
    const coords: [number, number, number] = [Number(m[1]), Number(m[2]), Number(m[3])];
    bodies.push({
      system: "System",
      name: m[4]!.replace(/['"]/g, "").trim(),
      kind: m[5]!.replace(/['"]/g, "").trim(),
      coords,
      distance: dist(coords, [0, 0, 0]),
    });
  }
  return bodies;
}

export function bodiesForStar(star: EcfObject, bodies: SystemBody[]): SystemBody[] {
  const klass = (star.fields.StarClass || "").trim();
  if (!klass) return bodies.filter((b) => !/^sun|star/i.test(b.kind));
  const matched = bodies.filter((b) => (b.starClass || "").toLowerCase() === klass.toLowerCase());
  return (matched.length ? matched : bodies).filter((b) => !/^sun|star/i.test(b.kind) || b.distance > 0);
}

export function fluxLabel(flux: number) {
  if (!Number.isFinite(flux)) return "—";
  if (flux >= 100) return `${flux.toFixed(0)}×`;
  if (flux >= 10) return `${flux.toFixed(1)}×`;
  if (flux >= 1) return `${flux.toFixed(2)}×`;
  if (flux >= 0.01) return `${flux.toFixed(3)}×`;
  return flux.toExponential(1);
}

export function solarAdvice(flux: number) {
  if (flux >= 4) return "Harsh — panels clip; bases cook unless shielded.";
  if (flux >= 0.6) return "Strong solar — space bases and equatorial planets run well.";
  if (flux >= 0.25) return "Usable solar — expect night storage or extra panels.";
  if (flux >= 0.05) return "Weak solar — space bases starve; planets need weather luck.";
  return "Negligible sunlight — generators, not panels.";
}

export function isStarType(obj: EcfObject) {
  if (/galaxyconfig/i.test(obj.kind) && /^general$/i.test(obj.name)) return false;
  return Boolean(obj.fields.StarClass || obj.fields.Luminosity || obj.fields.HabitableTemperate || obj.fields.InnerSystem);
}

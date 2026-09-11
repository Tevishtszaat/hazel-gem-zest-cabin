import * as yaml from "js-yaml";
import { parseCsv } from "./csv.ts";
import { extractEcfRecords } from "./ecf.ts";
import { configMetaByFile, CONFIG_TEXT_ROLES } from "./config-roles.ts";
import { isPlayfieldBasename } from "./playfield.ts";
import type { ImportFiles } from "./yaml-import.ts";

export type CatalogKind =
  | "item"
  | "block"
  | "entity"
  | "faction"
  | "dialogue"
  | "token"
  | "group"
  | "poi"
  | "playfield"
  | "picture";

export type CatalogEntry = {
  kind: CatalogKind;
  name: string;
  label?: string;
  source: string;
  group?: "pda" | "item";
  poiGroup?: string;
  poiFile?: string;
};

export type CatalogFile = {
  role: string;
  path: string;
  count: number;
};

export type CatalogText = {
  role: string;
  path: string;
  text: string;
};

export type ScenarioCatalog = {
  folderName: string;
  files: CatalogFile[];
  entries: CatalogEntry[];
  texts: CatalogText[];
  indexedAt: number;
};

export type ScenarioSource = {
  path: string;
  text?: string;
  blob?: Blob;
  meta?: { groupName?: string; spawnName?: string; fileName?: string };
};

export type IndexedScenario = {
  catalog: ScenarioCatalog;
  pda?: ImportFiles;
};

export const BUILTIN_NAMES = new Set([
  "Player",
  "Pda",
  "Inventory",
  "BASE",
  "HV",
  "SV",
  "CV",
  "GV",
  "PlayerBike",
  "PlayerInventory",
  "SurvivalTool",
  "Start",
  "Destination",
  "NeedOne",
  "NeedAll",
]);

const KIND_FROM_ECF: Record<string, CatalogKind> = {
  item: "item",
  block: "block",
  entity: "entity",
  faction: "faction",
  dialogue: "dialogue",
  npcdialogue: "dialogue",
  token: "token",
  egroup: "group",
  entitygroup: "group",
  lootgroup: "group",
  trader: "entity",
  container: "item",
};

export function emptyCatalog(): ScenarioCatalog {
  return { folderName: "", files: [], entries: [], texts: [], indexedAt: 0 };
}

export function catalogLoaded(catalog: ScenarioCatalog | undefined | null): boolean {
  return Boolean(catalog && catalog.entries.length);
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

export function classifyScenarioPath(path: string, hint?: string): string | null {
  const p = normalizePath(path).toLowerCase();
  const base = p.split("/").pop() ?? "";
  if (base.startsWith("+backup") || p.includes("/backup/")) return null;
  if (hint === "pdaYaml" && /\.ya?ml$/.test(base) && !/sectors|playfield/.test(base)) return "pdaYaml";
  if (hint === "pdaCsv" && /\.csv$/.test(base) && base !== "localization.csv") return "pdaCsv";
  if (hint === "dialogues" && /\.ecf$/.test(base)) return "dialogues";
  if (hint === "dialoguesCsv" && /\.csv$/.test(base) && base !== "localization.csv" && base !== "pda.csv") return "dialoguesCsv";
  if (hint === "factions" && /\.ecf$/.test(base)) return "factions";
  if (hint === "galaxy" && /\.ecf$/.test(base) && /galaxy/.test(base)) return "galaxy";
  if (hint === "sectors" && /\.ya?ml$/.test(base) && base !== "playfield.yaml" && base !== "playfield.yml") return "sectors";
  if (hint === "localization" && /\.csv$/.test(base)) return "localization";
  if (base === "pda.yaml" || base === "pda.yml") return "pdaYaml";
  if (base === "pda.csv") return "pdaCsv";
  if (base === "localization.csv") return "localization";
  if (base === "sectors.yaml" || base === "sectors.yml" || base === "sector.yaml" || base === "sector.yml") return "sectors";
  if (
    /\.ya?ml$/.test(base) &&
    base !== "playfield.yaml" &&
    base !== "playfield.yml" &&
    /(?:^|\/)(?:content\/)?sectors?\//.test(p) &&
    !/\/playfields?\//.test(p)
  ) {
    return "sectors";
  }
  if (/\.ya?ml$/.test(base) && /^sectors?[-_.]/i.test(base)) return "sectors";
  if (isPlayfieldBasename(base)) return "playfieldYaml";
  if (base === "playfield.yaml" || base === "playfield.yml") return "playfieldYaml";
  if (base === "config.ecf" || base === "config_example.ecf") return null;
  const meta = configMetaByFile(base);
  if (meta) return meta.role;
  if (base === "dialogues.ecf") return "dialogues";
  if (base === "dialogues.csv") return "dialoguesCsv";
  if (hint === "dialogues" && /\.csv$/.test(base)) return "dialoguesCsv";
  if (base.endsWith(".ecf")) return hint === "configs" || hint === "scenario" ? "ecf" : "ecf";
  if (base.endsWith(".epb")) return "poi";
  if (/\.(png|jpe?g|webp|gif)$/.test(base)) {
    if (isLoadingScreenPath(p)) return "wallpaper";
    if (hint === "pdaImages" || /(?:^|\/)pda(?:\/|$)/.test(p) || /extras\/pda/.test(p)) return "picture";
    if (hint === "itemImages") return "itemPicture";
    if (isIconPath(p)) return "itemPicture";
    if (hint === "scenario") return null;
  }
  return null;
}

export function looksLikeSectorsYaml(text: string) {
  return (
    /^\s*GalaxyMode\s*:/m.test(text) ||
    /^\s*SolarSystems\s*:/m.test(text) ||
    /^\s*Sectors\s*:/m.test(text) ||
    /\n\s*Playfields\s*:/m.test(text)
  );
}

export function collectCatalogTexts(files: ScenarioSource[], hint?: string): CatalogText[] {
  const byRole = new Map<string, CatalogText>();
  const consider = (role: string, file: ScenarioSource) => {
    if (!file.text) return;
    const next: CatalogText = { role, path: normalizePath(file.path), text: file.text };
    const prev = byRole.get(role);
    if (!prev) {
      byRole.set(role, next);
      return;
    }
    const prevSectors = role === "sectors" ? looksLikeSectorsYaml(prev.text) : true;
    const nextSectors = role === "sectors" ? looksLikeSectorsYaml(next.text) : true;
    if (role === "sectors" && nextSectors && !prevSectors) byRole.set(role, next);
    else if (role === "sectors" && prevSectors && !nextSectors) return;
    else if (next.text.length >= prev.text.length) byRole.set(role, next);
  };
  for (const file of files) {
    const role = classifyScenarioPath(file.path, hint);
    if (file.text && role === "sectors" && !looksLikeSectorsYaml(file.text) && !/sectors\.ya?ml$/i.test(file.path)) {
      continue;
    }
    if (role && (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "pdaYaml" || role === "pdaCsv")) {
      consider(role, file);
    } else if (role === "playfieldYaml" && file.text) {
      byRole.set(`playfieldYaml:${normalizePath(file.path)}`, {
        role: "playfieldYaml",
        path: normalizePath(file.path),
        text: file.text,
      });
    } else if (file.text && looksLikeSectorsYaml(file.text) && /\.ya?ml$/i.test(file.path) && !/playfield/i.test(file.path)) {
      consider("sectors", file);
    }
  }
  return [...byRole.values()];
}

export function catalogLoadSummary(catalog: ScenarioCatalog) {
  const roles = (catalog.texts ?? []).map((t) => t.role);
  const has = (role: string) => roles.includes(role) || catalog.files.some((f) => f.role === role);
  const missing: string[] = [];
  if (!has("galaxy")) missing.push("GalaxyConfig.ecf");
  if (!catalog.texts?.some((t) => t.role === "sectors" && t.text)) missing.push("Sectors.yaml");
  if (!has("items")) missing.push("ItemsConfig.ecf");
  if (!has("blocks")) missing.push("BlocksConfig.ecf");
  if (!has("localization")) missing.push("Localization.csv");
  const playfields = (catalog.texts ?? []).filter((t) => t.role === "playfieldYaml" && t.text).length;
  const loaded = (catalog.texts ?? [])
    .filter((t) => t.text && t.role !== "playfieldYaml")
    .map((t) => `${t.path.split("/").pop()} (${Math.max(1, Math.round(t.text.length / 1024))} KB)`);
  if (playfields) loaded.push(`${playfields} playfield yaml`);
  return { missing, loaded };
}

export function isLoadingScreenPath(path: string) {
  const p = normalizePath(path).toLowerCase();
  if (!/\.(png|jpe?g|webp|gif)$/.test(p)) return false;
  if (/(?:^|\/)loading.?screens?(?:hots?)?(?:\/|$)/.test(p)) return true;
  if (/(?:^|\/)loadingscreenshots?(?:\/|$)/.test(p)) return true;
  if (/gui\/(?:textures\/)?loading(?:screens?)?(?:\/|$)/.test(p)) return true;
  if (/(?:^|\/)extras\/loading(?:screens?)?(?:\/|$)/.test(p)) return true;
  if (/shareddata/.test(p) && /(?:^|\/)screenshots?(?:\/|$)/.test(p)) return true;
  if (/shareddata/.test(p) && /(?:^|\/)(?:menu.?bg|mainmenu|menubackground|wallpaper)(?:\/|$)/.test(p)) return true;
  return false;
}

function isIconPath(p: string) {
  if (isLoadingScreenPath(p)) return false;
  if (/\/playfields?\//.test(p) || /\/prefabs?\//.test(p)) return false;
  if (/(?:^|\/)(?:itemicons?|blockicons?)(?:\/|$)/.test(p)) return true;
  if (/\/bundles\/(?:itemicons?|blockicons?|icons)(?:\/|$)/.test(p)) return true;
  if (/\/shareddata\/content\/bundles\//.test(p)) return true;
  return (
    /(?:^|\/)(?:shareddata\/)?(?:content\/)?(?:items?|itemicons|icons|blocks?)(?:\/|$)/.test(p) ||
    /\/content\/(?:items?|blocks?|icons|bundles)\//.test(p)
  );
}

function folderNameOf(files: ScenarioSource[]): string {
  const first = files[0]?.path ? normalizePath(files[0].path) : "";
  const top = first.split("/")[0] ?? "";
  if (top && files.every((f) => normalizePath(f.path).startsWith(`${top}/`) || normalizePath(f.path) === top)) {
    return top;
  }
  return top || "Scenario";
}

function addEntry(bag: CatalogEntry[], seen: Set<string>, entry: CatalogEntry) {
  const key = `${entry.kind}:${entry.name.toLowerCase()}`;
  if (seen.has(key)) return;
  seen.add(key);
  bag.push(entry);
}

function pickPda(files: ScenarioSource[], role: "pdaYaml" | "pdaCsv", hint?: string): ScenarioSource | undefined {
  const matches = files.filter((f) => classifyScenarioPath(f.path, hint) === role && f.text);
  if (!matches.length) return undefined;
  const extras = matches.find((f) => /extras\/pda\//i.test(normalizePath(f.path)));
  return extras ?? matches[0];
}

function parseSectors(text: string, source: string, bag: CatalogEntry[], seen: Set<string>) {
  let doc: unknown;
  try {
    doc = yaml.load(text, { json: true });
  } catch {
    return 0;
  }
  let count = 0;
  const walk = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      if (node.length >= 2 && typeof node[0] === "string" && typeof node[1] === "string") {
        const name = node[1].trim();
        if (name) {
          addEntry(bag, seen, { kind: "playfield", name, source });
          count += 1;
        }
      }
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    const named = rec.Name ?? rec.PlayfieldName ?? rec.PlanetName;
    if (typeof named === "string" && named.trim()) {
      addEntry(bag, seen, { kind: "playfield", name: named.trim(), source });
      count += 1;
    }
    Object.values(rec).forEach(walk);
  };
  walk(doc);
  return count;
}

function applyLocalization(entries: CatalogEntry[], loc: Record<string, string>) {
  const packedToLabel = new Map<string, string>();
  for (const [key, label] of Object.entries(loc)) {
    packedToLabel.set(compactToken(key.replace(/^(items?_|blocks?_|tokens?_|factions?_)/i, "")), label);
  }
  for (const entry of entries) {
    if (entry.label) continue;
    const keys = locaKeysForName(entry.name, entry.kind);
    for (const key of keys) {
      const label = loc[key];
      if (label) {
        entry.label = label;
        break;
      }
    }
    if (entry.label) continue;
    const packed = compactToken(entry.name);
    const label = packedToLabel.get(packed);
    if (label) entry.label = label;
  }
}

export function locaKeysForName(name: string, kind?: string) {
  const keys = [name, `Items_${name}`, `Item_${name}`, `item_${name}`, `Block_${name}`, `Blocks_${name}`, `Token_${name}`, `Faction_${name}`];
  if (kind === "block") keys.unshift(`Block_${name}`, `Blocks_${name}`);
  if (kind === "item") keys.unshift(`Items_${name}`, `Item_${name}`);
  if (kind === "token") keys.unshift(`Token_${name}`, `Items_${name}`);
  if (kind === "faction") keys.unshift(`Faction_${name}`);
  return [...new Set(keys)];
}

export function compactToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

let locaCache: { sig: string; rows: { key: string; name: string; label: string }[] } | null = null;

type CatalogIndex = {
  byKind: Map<CatalogKind, CatalogEntry[]>;
  name: Map<string, CatalogEntry>;
  label: Map<string, CatalogEntry>;
  file: Map<string, CatalogEntry>;
  group: Map<string, CatalogEntry>;
  packedName: Map<string, CatalogEntry>;
  packedLabel: Map<string, CatalogEntry>;
  locaLabel: Map<string, { name: string; label: string }>;
  locaKey: Map<string, { name: string; label: string }>;
  locaPacked: Map<string, { name: string; label: string }>;
};

let catalogIndex: CatalogIndex | null = null;
let catalogIndexRef: ScenarioCatalog | null = null;

function putMap(map: Map<string, CatalogEntry>, key: string, entry: CatalogEntry) {
  if (key && !map.has(key)) map.set(key, entry);
}

export function getCatalogIndex(catalog: ScenarioCatalog): CatalogIndex {
  if (catalogIndex && catalogIndexRef === catalog) return catalogIndex;
  const byKind = new Map<CatalogKind, CatalogEntry[]>();
  const name = new Map<string, CatalogEntry>();
  const label = new Map<string, CatalogEntry>();
  const file = new Map<string, CatalogEntry>();
  const group = new Map<string, CatalogEntry>();
  const packedName = new Map<string, CatalogEntry>();
  const packedLabel = new Map<string, CatalogEntry>();
  for (const entry of catalog.entries) {
    const list = byKind.get(entry.kind);
    if (list) list.push(entry);
    else byKind.set(entry.kind, [entry]);
    const kn = `${entry.kind}:${entry.name.toLowerCase()}`;
    putMap(name, kn, entry);
    if (entry.label) putMap(label, `${entry.kind}:${entry.label.toLowerCase()}`, entry);
    if (entry.poiFile) putMap(file, `${entry.kind}:${entry.poiFile.toLowerCase()}`, entry);
    if (entry.poiGroup) putMap(group, `${entry.kind}:${entry.poiGroup.toLowerCase()}`, entry);
    putMap(packedName, `${entry.kind}:${compactToken(entry.name)}`, entry);
    if (entry.label) putMap(packedLabel, `${entry.kind}:${compactToken(entry.label)}`, entry);
  }
  const locaLabel = new Map<string, { name: string; label: string }>();
  const locaKey = new Map<string, { name: string; label: string }>();
  const locaPacked = new Map<string, { name: string; label: string }>();
  for (const row of localizationLabels(catalog)) {
    const rec = { name: row.name, label: row.label };
    if (!locaLabel.has(row.label.toLowerCase())) locaLabel.set(row.label.toLowerCase(), rec);
    if (!locaKey.has(row.key.toLowerCase())) locaKey.set(row.key.toLowerCase(), rec);
    const packed = compactToken(row.label) || compactToken(row.name) || compactToken(row.key);
    if (packed && !locaPacked.has(packed)) locaPacked.set(packed, rec);
  }
  catalogIndex = { byKind, name, label, file, group, packedName, packedLabel, locaLabel, locaKey, locaPacked };
  catalogIndexRef = catalog;
  return catalogIndex;
}

export function localizationLabels(catalog: ScenarioCatalog | undefined): { key: string; name: string; label: string }[] {
  if (!catalog) return [];
  const text = (catalog.texts ?? []).find((t) => t.role === "localization" && t.text)?.text ?? "";
  const sig = `${catalog.indexedAt}:${catalog.entries.length}:${text.length}`;
  if (locaCache?.sig === sig) return locaCache.rows;
  const rows: { key: string; name: string; label: string }[] = [];
  if (text) {
    const table = parseCsv(text);
    const lang = table.languages.includes("English") ? "English" : table.languages[0];
    if (lang) {
      for (const [key, rec] of Object.entries(table.rows)) {
        const label = rec[lang]?.trim();
        if (!label) continue;
        const name = key.replace(/^(items?_|blocks?_|tokens?_|factions?_)/i, "");
        rows.push({ key, name, label });
      }
    }
  }
  for (const entry of catalog.entries) {
    if (entry.label) rows.push({ key: entry.name, name: entry.name, label: entry.label });
  }
  locaCache = { sig, rows };
  return rows;
}

export function resolveCatalogToken(
  catalog: ScenarioCatalog,
  token: string,
  kinds: CatalogKind[],
): { entry: CatalogEntry; via: "name" | "label" | "file" | "group" } | null {
  const needle = token.trim().toLowerCase();
  const packed = compactToken(token);
  if (!needle) return null;
  const index = getCatalogIndex(catalog);
  const pick = (map: Map<string, CatalogEntry>) => {
    for (const kind of kinds) {
      const hit = map.get(`${kind}:${needle}`);
      if (hit) return hit;
    }
    return null;
  };
  const byName = pick(index.name);
  if (byName) {
    if (byName.poiFile && byName.poiGroup && compactToken(byName.poiFile) === packed && compactToken(byName.poiGroup) !== packed) {
      return { entry: byName, via: "file" };
    }
    if (byName.poiGroup && compactToken(byName.poiGroup) === packed) return { entry: byName, via: "group" };
    return { entry: byName, via: "name" };
  }
  const byFile = pick(index.file);
  if (byFile) return { entry: byFile, via: byFile.poiGroup && byFile.poiGroup.toLowerCase() !== needle ? "file" : "name" };
  const byGroup = pick(index.group);
  if (byGroup) return { entry: byGroup, via: "group" };
  const byLabel = pick(index.label);
  if (byLabel) return { entry: byLabel, via: "label" };
  if (packed.length >= 3) {
    for (const kind of kinds) {
      const packedName = index.packedName.get(`${kind}:${packed}`);
      if (packedName) return { entry: packedName, via: "name" };
    }
    for (const kind of kinds) {
      const packedLabel = index.packedLabel.get(`${kind}:${packed}`);
      if (packedLabel) return { entry: packedLabel, via: "label" };
    }
  }
  const loca =
    index.locaLabel.get(needle) ||
    index.locaKey.get(needle) ||
    (packed.length >= 3 ? index.locaPacked.get(packed) : undefined);
  if (loca) {
    for (const kind of kinds) {
      const entry =
        index.name.get(`${kind}:${loca.name.toLowerCase()}`) || index.packedName.get(`${kind}:${compactToken(loca.name)}`);
      if (entry) return { entry, via: entry.name.toLowerCase() === needle ? "name" : "label" };
    }
  }
  return null;
}

export function stampLocalization(catalog: ScenarioCatalog): ScenarioCatalog {
  const loc: Record<string, string> = {};
  for (const row of localizationLabels(catalog)) {
    loc[row.key] = row.label;
    loc[row.name] = row.label;
  }
  applyLocalization(catalog.entries, loc);
  return catalog;
}

export function indexScenario(files: ScenarioSource[], hint?: string): IndexedScenario {
  const catalogFiles: CatalogFile[] = [];
  const entries: CatalogEntry[] = [];
  const texts: CatalogText[] = [];
  const seen = new Set<string>();
  const loc: Record<string, string> = {};

  for (const file of files) {
    const role = classifyScenarioPath(file.path, hint);
    if (!role) continue;
    const source = normalizePath(file.path).split("/").slice(-2).join("/");
    let count = 0;

    if (role === "poi") {
      const fileName = (file.path.split(/[/\\]/).pop() ?? "").replace(/\.epb$/i, "");
      if (fileName) {
        const meta = file.meta ?? { fileName };
        const groupName = (meta.groupName || "").trim();
        const spawnName = (meta.spawnName || "").trim();
        addEntry(entries, seen, {
          kind: "poi",
          name: fileName,
          label: spawnName || groupName || undefined,
          source,
          poiFile: fileName,
          poiGroup: groupName || undefined,
        });
        if (groupName && groupName.toLowerCase() !== fileName.toLowerCase()) {
          addEntry(entries, seen, {
            kind: "poi",
            name: groupName,
            label: spawnName || fileName,
            source,
            poiFile: fileName,
            poiGroup: groupName,
          });
        }
        count = groupName && groupName.toLowerCase() !== fileName.toLowerCase() ? 2 : 1;
      }
    } else if (role === "picture" || role === "itemPicture") {
      const name = file.path.split(/[/\\]/).pop() ?? "";
      if (name) {
        addEntry(entries, seen, {
          kind: "picture",
          name,
          source,
          group: role === "itemPicture" ? "item" : "pda",
        });
        count = 1;
      }
    } else if (role === "wallpaper") {
      count = 1;
    } else if (role === "playfieldYaml") {
      const parts = normalizePath(file.path).split("/");
      const folder = parts[parts.length - 2];
      if (folder && !/^playfields?$/i.test(folder)) {
        addEntry(entries, seen, { kind: "playfield", name: folder, source });
        count = 1;
      }
    } else if (role === "sectors" && file.text) {
      count = parseSectors(file.text, source, entries, seen);
    } else if (role === "localization" && file.text) {
      const table = parseCsv(file.text);
      const lang = table.languages.includes("English") ? "English" : table.languages[0];
      if (lang) {
        for (const [key, rec] of Object.entries(table.rows)) {
          const label = rec[lang]?.trim();
          if (label) loc[key] = label;
        }
      }
      count = Object.keys(loc).length;
    } else if (
      file.text &&
      role !== "localization" &&
      role !== "dialoguesCsv" &&
      role !== "sectors" &&
      (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "dialogues")
    ) {
      const records = extractEcfRecords(file.text);
      for (const rec of records) {
        const kind = KIND_FROM_ECF[rec.kind.toLowerCase()];
        if (!kind) continue;
        addEntry(entries, seen, { kind, name: rec.name, source });
        count += 1;
      }
    }

    if (file.text && (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "pdaYaml" || role === "pdaCsv" || role === "playfieldYaml")) {
      texts.push({ role, path: normalizePath(file.path), text: file.text });
    }

    if (count || role === "pdaYaml" || role === "pdaCsv" || texts.some((t) => t.path === normalizePath(file.path))) {
      catalogFiles.push({ role, path: normalizePath(file.path), count });
    }
  }

  applyLocalization(entries, loc);

  const yamlFile = pickPda(files, "pdaYaml", hint);
  const csvFile = pickPda(files, "pdaCsv", hint);
  const pda = yamlFile?.text
    ? {
        yamlText: yamlFile.text,
        yamlName: yamlFile.path.split(/[/\\]/).pop(),
        csvText: csvFile?.text,
        csvName: csvFile?.path.split(/[/\\]/).pop(),
      }
    : undefined;

  return {
    catalog: {
      folderName: folderNameOf(files),
      files: catalogFiles,
      entries,
      texts,
      indexedAt: Date.now(),
    },
    pda,
  };
}

export function catalogCounts(catalog: ScenarioCatalog) {
  const counts: Record<CatalogKind, number> = {
    item: 0,
    block: 0,
    entity: 0,
    faction: 0,
    dialogue: 0,
    token: 0,
    group: 0,
    poi: 0,
    playfield: 0,
    picture: 0,
  };
  for (const entry of catalog.entries) counts[entry.kind] += 1;
  return counts;
}

export function lookupCatalog(catalog: ScenarioCatalog, name: string): CatalogEntry | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return catalog.entries.find((e) => e.name.toLowerCase() === needle);
}

export function splitTokens(value: string): string[] {
  return value
    .split(/[,|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function suggestionsFor(
  catalog: ScenarioCatalog,
  kinds: CatalogKind[],
  query: string,
  limit = 12,
): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  const index = getCatalogIndex(catalog);
  const pool: CatalogEntry[] = [];
  for (const kind of kinds) {
    const list = index.byKind.get(kind);
    if (!list) continue;
    for (const entry of list) {
      if (entry.kind === "picture" && entry.group === "item") continue;
      pool.push(entry);
    }
  }
  if (!q) return pool.slice(0, limit);
  const cq = compactToken(q);
  const scored: { entry: CatalogEntry; score: number }[] = [];
  for (const entry of pool) {
    const name = entry.name.toLowerCase();
    const label = (entry.label ?? "").toLowerCase();
    const group = (entry.poiGroup ?? "").toLowerCase();
    const file = (entry.poiFile ?? "").toLowerCase();
    const cn = compactToken(name);
    let score = 0;
    if (name === q || group === q || file === q) score = 100;
    else if (name.startsWith(q) || q.startsWith(name) || group.startsWith(q) || file.startsWith(q)) score = 80;
    else if (label.startsWith(q)) score = 70;
    else if (name.includes(q) || group.includes(q) || file.includes(q)) score = 50;
    else if (label.includes(q)) score = 40;
    else if (cq.length >= 3 && cn && (cn.includes(cq) || cq.includes(cn))) score = 35;
    if (score) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
  return scored.slice(0, limit).map((x) => x.entry);
}

export function mergeCatalog(base: ScenarioCatalog, extra: ScenarioCatalog): ScenarioCatalog {
  const entries = base.entries.map((e) => ({ ...e }));
  const byKey = new Map<string, CatalogEntry>();
  for (const e of entries) byKey.set(`${e.kind}:${e.name.toLowerCase()}:${e.group ?? ""}`, e);
  for (const entry of extra.entries) {
    const key = `${entry.kind}:${entry.name.toLowerCase()}:${entry.group ?? ""}`;
    const existing = byKey.get(key);
    if (existing) {
      if (entry.label && !existing.label) existing.label = entry.label;
      if (entry.poiGroup && !existing.poiGroup) existing.poiGroup = entry.poiGroup;
      if (entry.poiFile && !existing.poiFile) existing.poiFile = entry.poiFile;
      continue;
    }
    const copy = { ...entry };
    byKey.set(key, copy);
    entries.push(copy);
  }
  const files = [...base.files];
  for (const file of extra.files) {
    if (!files.some((f) => f.path === file.path && f.role === file.role)) files.push(file);
    else {
      const i = files.findIndex((f) => f.path === file.path && f.role === file.role);
      if (i >= 0) files[i] = file;
    }
  }
  const texts = [...(base.texts ?? [])];
  for (const text of extra.texts ?? []) {
    if (!text.text) continue;
    if (text.role === "playfieldYaml") {
      const i = texts.findIndex((t) => t.role === "playfieldYaml" && t.path === text.path);
      if (i >= 0) texts[i] = text;
      else texts.push(text);
      continue;
    }
    const i = texts.findIndex((t) => t.role === text.role);
    if (i >= 0) {
      const cur = texts[i]!;
      texts[i] = text.text.length >= cur.text.length || text.path === cur.path ? text : cur;
    } else texts.push(text);
  }
  stampLocalization({ folderName: extra.folderName || base.folderName, files, entries, texts, indexedAt: Date.now() });
  return {
    folderName: extra.folderName || base.folderName,
    files,
    entries,
    texts,
    indexedAt: Date.now(),
  };
}

export function dropCatalogGroup(catalog: ScenarioCatalog, group: "pda" | "item"): ScenarioCatalog {
  return {
    ...catalog,
    entries: catalog.entries.filter((e) => !(e.kind === "picture" && e.group === group)),
    indexedAt: Date.now(),
  };
}

export const CHECK_NAME_KINDS: Record<string, CatalogKind[]> = {
  InventoryContains: ["item", "token"],
  ToolbarContains: ["item"],
  ItemsPickedUp: ["item"],
  ItemsConsumed: ["item"],
  ItemsCrafted: ["item"],
  ItemsUnlocked: ["item"],
  ArmorEquipped: ["item"],
  DevicePowered: ["block"],
  ConstructionQueueContains: ["block", "item"],
  BlocksPlaced: ["block"],
  BlocksRemoved: ["block"],
  BlockDestroyed: ["poi", "block"],
  NearPoi: ["poi"],
  PoiDiscovered: ["poi"],
  NearUnit: ["entity", "poi"],
  SubjectKilled: ["entity", "group"],
  PlayfieldEntered: ["playfield"],
  PlayfieldTypeEntered: ["playfield"],
  NearResource: ["item", "block"],
  ResourceDiscovered: ["item", "block"],
  Signal: ["poi"],
  WindowOpened: [],
  InventoryOpened: [],
  InventoryEmptied: [],
};

export const CHECK_TYPE_KINDS: Record<string, CatalogKind[]> = {
  InventoryContains: ["item", "token"],
  ToolbarContains: ["item"],
  ItemsPickedUp: ["item"],
  ItemsConsumed: ["item"],
  ItemsCrafted: ["item"],
  ItemsUnlocked: ["item"],
  ArmorEquipped: ["item"],
  DevicePowered: ["block"],
  BlocksPlaced: ["block"],
  BlocksRemoved: ["block"],
  BlockDestroyed: ["block"],
  NearResource: ["item", "block"],
  ResourceDiscovered: ["item", "block"],
};

import { unusedNumericIds } from "./config-stats.ts";
import { CONFIG_METAS } from "./config-roles.ts";
import { parseEcfObjects, stringifyEcfObjects, type EcfObject } from "./ecf.ts";
import {
  catalogText,
  dialogueDocFor,
  localizationTable,
  objectsFor,
} from "./library.ts";
import {
  diagnoseOrbits,
  formatCoords,
  groupSystems,
  isStarType,
  overlayBodies,
  parseSectorBodies,
  parseStarMix,
  STAR_ZONES,
  starZoneSpans,
} from "./galaxy.ts";
import { bundlePlayfields } from "./playfield.ts";
import { preflightPlayfield as preflightLists } from "./playfield-design.ts";
import {
  catalogLoaded,
  compactToken,
  ENGINE_FACTIONS,
  resolveCatalogToken,
  suggestionsFor,
  type ScenarioCatalog,
} from "./scenario-index.ts";
import { suggestEnglishText } from "./csv.ts";
import { scanTextSyntax } from "./validate-syntax.ts";
import type { Problem, ProblemFix } from "./validate.ts";

export const FILE_DEBUG_TABS = [
  { id: "all", label: "All files", href: "/debug" },
  { id: "pda", label: "PDA", href: "/" },
  { id: "items", label: "Items", href: "/library/items" },
  { id: "blocks", label: "Blocks", href: "/library/blocks" },
  { id: "templates", label: "Templates", href: "/library" },
  { id: "tokens", label: "Tokens", href: "/library" },
  { id: "dialogues", label: "Dialogues", href: "/dialogues" },
  { id: "factions", label: "Factions", href: "/library/factions" },
  { id: "playfields", label: "Playfields", href: "/library/playfields" },
  { id: "galaxy", label: "Galaxy", href: "/library/galaxy" },
  { id: "sectors", label: "Sectors", href: "/library" },
  { id: "localization", label: "Localization", href: "/library" },
] as const;

export type FileDebugId = (typeof FILE_DEBUG_TABS)[number]["id"];

export const FILE_SCAN_ORDER = FILE_DEBUG_TABS.map((tab) => tab.id).filter((id) => id !== "all");

const HREF: Record<string, string> = Object.fromEntries(FILE_DEBUG_TABS.map((t) => [t.id, t.href]));

const ECF_ROLES = ["items", "blocks", "templates", "tokens", "factions"] as const;

function hrefFor(source: string) {
  return HREF[source] || "/library";
}

export function applyEcfFix(text: string, name: string, field: string, value: string) {
  const objects = parseEcfObjects(text);
  const hit = objects.find((o) => o.name === name);
  if (!hit) return text;
  if (field === "Name") hit.name = value;
  else if (field === "Id") hit.id = value;
  else if (value === "") delete hit.fields[field];
  else hit.fields[field] = value;
  return stringifyEcfObjects(objects);
}

export function applyYamlReplace(text: string, from: string, to: string) {
  if (!from || from === to) return text;
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped), to);
}

export function validateCatalog(catalog: ScenarioCatalog | undefined, source: FileDebugId | "pda" = "all"): Problem[] {
  if (!catalog) return [];
  if (!catalogLoaded(catalog) && !(catalog.texts?.length)) return [];
  const issues: Problem[] = [];
  let n = 0;
  const push = (problem: Omit<Problem, "key">) => {
    n += 1;
    if (issues.filter((i) => i.source === problem.source).length >= 80) return;
    issues.push({ key: `${problem.source}:${problem.code}:${problem.path}:${n}`, ...problem });
  };

  if (source === "pda") {
    validateSyntax(catalog, "pda", push);
    return issues;
  }
  if (source === "all") return issues;

  validateSyntax(catalog, source, push);

  if (ECF_ROLES.includes(source as (typeof ECF_ROLES)[number])) {
    const objects = objectsFor(catalog, source as (typeof ECF_ROLES)[number]);
    if (objects.length) validateEcfRole(catalog, source as (typeof ECF_ROLES)[number], objects, push);
    return issues;
  }
  if (source === "dialogues") {
    try {
      validateDialogues(catalog, push);
    } catch (err) {
      push({
        id: null,
        kind: "file",
        source: "dialogues",
        href: "/dialogues",
        level: "error",
        code: "syntax",
        message: `Dialogues.ecf could not be parsed: ${err instanceof Error ? err.message : "parse failed"}`,
        path: "Dialogues.ecf",
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
    }
  }
  else if (source === "playfields") validatePlayfields(catalog, push);
  else if (source === "galaxy") validateGalaxy(catalog, push);
  else if (source === "sectors") validateGalaxy(catalog, push);
  else if (source === "localization") validateLocalization(catalog, push);
  return issues;
}

export function slimCatalogForSource(catalog: ScenarioCatalog, source: FileDebugId | "pda"): ScenarioCatalog {
  const roles = TEXT_ROLES[source] ?? [];
  let texts = (catalog.texts ?? []).filter((t) => roles.includes(t.role));
  if (source === "playfields") {
    texts = texts.filter((t) => (t.text?.length || 0) < 1_500_000).slice(0, 40);
  }
  return {
    folderName: catalog.folderName,
    files: catalog.files,
    indexedAt: catalog.indexedAt,
    entries: catalog.entries.map((e) => ({
      kind: e.kind,
      name: e.name,
      label: e.label,
      poiGroup: e.poiGroup,
      poiFile: e.poiFile,
      source: e.source,
    })),
    texts,
  };
}

const TEXT_ROLES: Record<string, string[]> = {
  items: ["items", "localization"],
  blocks: ["blocks"],
  templates: ["templates"],
  tokens: ["tokens", "localization"],
  factions: ["factions"],
  dialogues: ["dialogues", "dialoguesCsv"],
  playfields: ["playfieldYaml"],
  galaxy: ["galaxy", "sectors"],
  sectors: ["sectors"],
  localization: ["localization"],
  pda: ["pdaYaml", "pdaCsv"],
  all: [],
};

function validateSyntax(
  catalog: ScenarioCatalog,
  source: FileDebugId | "pda",
  push: (p: Omit<Problem, "key">) => void,
) {
  const roles = TEXT_ROLES[source] ?? [];
  for (const text of catalog.texts ?? []) {
    if (!text.text || !roles.includes(text.role)) continue;
    scanTextSyntax(text.role, text.path, text.text, push);
  }
}

function validateEcfRole(
  catalog: ScenarioCatalog,
  role: (typeof ECF_ROLES)[number],
  objects: EcfObject[],
  push: (p: Omit<Problem, "key">) => void,
) {
  const meta = CONFIG_METAS.find((m) => m.role === role);
  const kinds = meta?.catalogKind ? [meta.catalogKind as "item" | "block" | "token" | "faction"] : [];
  const used = objects.map((o) => Number(o.id)).filter((n) => Number.isInteger(n) && n > 0);
  const unused = unusedNumericIds(used);
  const byId = new Map<string, string[]>();
  const byName = new Map<string, number>();
  const nameSet = new Set(objects.map((o) => o.name.toLowerCase()));
  const pictures = new Set(
    [...catalog.entries, ...(catalog.game ?? [])]
      .filter((e) => e.kind === "picture")
      .flatMap((e) => {
        const base = e.name.toLowerCase();
        return [base, base.replace(/\.(png|jpe?g|webp|gif)$/i, "")];
      }),
  );
  const itemNames = new Set(
    [...catalog.entries, ...(catalog.game ?? [])]
      .filter((e) => e.kind === "item" || e.kind === "block")
      .map((e) => e.name.toLowerCase()),
  );

  for (const obj of objects) {
    const name = obj.name?.trim() || "";
    if (!name) {
      push({
        id: null,
        kind: "file",
        source: role,
        href: hrefFor(role),
        level: "error",
        code: "empty-name",
        message: `${meta?.label || role} entry has no Name.`,
        path: meta?.file || role,
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
      continue;
    }
    byName.set(name.toLowerCase(), (byName.get(name.toLowerCase()) || 0) + 1);
    if (obj.id && /^\d+$/.test(obj.id)) {
      const list = byId.get(obj.id) ?? [];
      list.push(name);
      byId.set(obj.id, list);
    }

    const icon = obj.fields.CustomIcon || obj.fields.UnlockIcon;
    if (icon && pictures.size) {
      const stem = icon.replace(/\.(png|jpe?g|webp|gif)$/i, "").toLowerCase();
      const hit = pictures.has(icon.toLowerCase()) || pictures.has(stem);
      if (!hit) {
        push({
          id: null,
          kind: "file",
          source: role,
          href: hrefFor(role),
          level: "warning",
          code: "icon",
          message: `${name} CustomIcon “${icon}” is not in imported ItemIcons.`,
          path: `${name}.CustomIcon`,
          recommend: "review",
          field: "CustomIcon",
          value: icon,
          suggestions: [],
          fixes: [],
        });
      }
    }

    const factionField = obj.fields.Faction || obj.fields.faction;
    if (factionField && role !== "factions" && catalog.entries.some((e) => e.kind === "faction")) {
      for (const token of factionField.split(/[,|]/).map((part) => part.trim()).filter(Boolean)) {
        if (ENGINE_FACTIONS.has(token.toLowerCase())) continue;
        if (resolveCatalogToken(catalog, token, ["faction"])) continue;
        const suggestions = suggestionsFor(catalog, ["faction"], token, 3).map((e) => e.name);
        push({
          id: null,
          kind: "file",
          source: role,
          href: hrefFor(role),
          level: "warning",
          code: "faction",
          message: `${name} Faction “${token}” is not in Factions.ecf.`,
          path: `${name}.Faction`,
          recommend: suggestions.length ? "fix" : "review",
          field: "Faction",
          value: token,
          suggestions,
          fixes: suggestions.slice(0, 2).map((s) => ({
            type: "ecf-set" as const,
            role,
            name,
            field: "Faction",
            value: s,
            label: `Use ${s}`,
          })),
        });
      }
    }

    const ref = obj.fields.Ref;
    if (ref && !nameSet.has(ref.toLowerCase()) && kinds.length) {
      const suggestions = suggestionsFor(catalog, kinds, ref, 3).map((e) => e.name);
      push({
        id: null,
        kind: "file",
        source: role,
        href: hrefFor(role),
        level: "warning",
        code: "ref",
        message: `${name} Ref “${ref}” is not in the loaded ${role}.`,
        path: `${name}.Ref`,
        recommend: suggestions.length ? "fix" : "review",
        field: "Ref",
        value: ref,
        suggestions,
        fixes: suggestions.slice(0, 2).map((s) => ({
          type: "ecf-set" as const,
          role,
          name,
          field: "Ref",
          value: s,
          label: `Use ${s}`,
        })),
      });
    }

    if (role === "templates") {
      const child = obj.children?.find((c) => /input/i.test(c.name)) ?? obj.children?.[0];
      for (const [ingredient] of Object.entries(child?.fields ?? {})) {
        if (!ingredient) continue;
        if (itemNames.has(ingredient.toLowerCase())) continue;
        const suggestions = suggestionsFor(catalog, ["item", "block"], ingredient, 3).map((e) => e.name);
        push({
          id: null,
          kind: "file",
          source: role,
          href: hrefFor(role),
          level: "warning",
          code: "ingredient",
          message: `Template ${name} uses “${ingredient}” which is not an item or block.`,
          path: `${name}.Inputs.${ingredient}`,
          recommend: suggestions.length ? "fix" : "review",
          value: ingredient,
          suggestions,
          fixes: [],
        });
      }
    }
  }

  for (const [id, names] of byId) {
    if (names.length < 2) continue;
    const next = String(unused.next || Number(id) + 1);
    push({
      id: null,
      kind: "file",
      source: role,
      href: hrefFor(role),
      level: "error",
      code: "duplicate-id",
      message: `Id ${id} is used by ${names.join(", ")}.`,
      path: `${meta?.file || role} Id ${id}`,
      recommend: "fix",
      value: id,
      suggestions: [next],
      fixes: names.slice(1).map((name) => ({
        type: "ecf-set" as const,
        role,
        name,
        field: "Id",
        value: next,
        label: `Give ${name} Id ${next}`,
      })),
    });
  }

  for (const [name, count] of byName) {
    if (count < 2) continue;
    push({
      id: null,
      kind: "file",
      source: role,
      href: hrefFor(role),
      level: "error",
      code: "duplicate-name",
      message: `${meta?.label || role} name “${name}” appears ${count} times.`,
      path: name,
      recommend: "review",
      suggestions: [],
      fixes: [],
    });
  }
}

function validateDialogues(catalog: ScenarioCatalog, push: (p: Omit<Problem, "key">) => void) {
  if (!catalog.texts.some((t) => t.role === "dialogues")) return;
  const doc = dialogueDocFor(catalog);
  const names = new Set(doc.states.map((s) => s.name.toLowerCase()));
  for (const state of doc.states) {
    if (!state.name) {
      push({
        id: null,
        kind: "file",
        source: "dialogues",
        href: "/dialogues",
        level: "error",
        code: "empty-name",
        message: "A dialogue state has no name.",
        path: "Dialogues.ecf",
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
      continue;
    }
    if (state.npcName && !resolveCatalogToken(catalog, state.npcName, ["entity", "faction"]) && state.npcName !== "Player") {
      const suggestions = suggestionsFor(catalog, ["entity"], state.npcName, 3).map((e) => e.name);
      push({
        id: null,
        kind: "file",
        source: "dialogues",
        href: "/dialogues",
        level: "warning",
        code: "npc",
        message: `${state.name} NPC “${state.npcName}” is not in EClassConfig.`,
        path: `${state.name}.NPCName`,
        recommend: suggestions.length ? "fix" : "review",
        value: state.npcName,
        suggestions,
        fixes: [],
      });
    }
    for (const opt of state.options) {
      if (opt.next && !names.has(opt.next.toLowerCase()) && opt.next.toLowerCase() !== "end") {
        push({
          id: null,
          kind: "file",
          source: "dialogues",
          href: "/dialogues",
          level: "warning",
          code: "next",
          message: `${state.name} option jumps to missing state “${opt.next}”.`,
          path: `${state.name}.OptionNext`,
          recommend: "review",
          value: opt.next,
          suggestions: [...names].slice(0, 4),
          fixes: [],
        });
      }
    }
    for (const next of state.nexts) {
      if (next.next && !names.has(next.next.toLowerCase()) && next.next.toLowerCase() !== "end") {
        push({
          id: null,
          kind: "file",
          source: "dialogues",
          href: "/dialogues",
          level: "warning",
          code: "next",
          message: `${state.name} Next “${next.next}” is not a dialogue state.`,
          path: `${state.name}.Next`,
          recommend: "review",
          value: next.next,
          suggestions: [],
          fixes: [],
        });
      }
    }
  }
}

function validatePlayfields(catalog: ScenarioCatalog, push: (p: Omit<Problem, "key">) => void) {
  const bundles = bundlePlayfields(catalog.texts ?? []);
  for (const bundle of bundles.slice(0, 80)) {
    for (const file of bundle.files) {
      const local = preflightLists(file, catalog);
      for (const issue of local) {
        const fixes: ProblemFix[] =
          issue.fixFrom && issue.fixTo
            ? [
                {
                  type: "yaml-replace",
                  role: "playfieldYaml",
                  path: file.path,
                  from: issue.fixFrom,
                  to: issue.fixTo,
                  label: `Use ${issue.fixTo}`,
                },
              ]
            : [];
        push({
          id: null,
          kind: "file",
          source: "playfields",
          href: "/library/playfields",
          level: issue.level,
          code: issue.code,
          message: `${bundle.name}: ${issue.message}`,
          path: `${file.path} · ${issue.path}`,
          recommend: fixes.length ? "fix" : "review",
          suggestions: issue.fixTo ? [issue.fixTo] : [],
          fixes,
          value: issue.fixFrom,
        });
      }
    }
  }
}

function playfieldChoices(catalog: ScenarioCatalog, query: string, limit = 3): string[] {
  const q = query.trim().toLowerCase();
  const cq = compactToken(q);
  const scored: { name: string; score: number }[] = [];
  const seen = new Set<string>();
  for (const entry of [...catalog.entries, ...(catalog.game ?? [])]) {
    if (entry.kind !== "playfield") continue;
    const name = entry.name.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key) || key === q) continue;
    seen.add(key);
    const cn = compactToken(name);
    let score = 0;
    if (cn && cq && cn === cq) score = 90;
    else if (cq.length >= 4 && cn.length >= 4 && (cn.includes(cq) || cq.includes(cn))) {
      const shorter = Math.min(cq.length, cn.length);
      const longer = Math.max(cq.length, cn.length);
      if (shorter / longer >= 0.62) score = 70;
    }
    if (score) scored.push({ name, score });
  }
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.slice(0, limit).map((row) => row.name);
}

function validateGalaxy(catalog: ScenarioCatalog, push: (p: Omit<Problem, "key">) => void) {
  const stars = objectsFor(catalog, "galaxy").filter((o) => isStarType(o));
  const sectorText = catalog.texts.find((t) => t.role === "sectors")?.text || "";
  if (stars.length) {
    for (const star of stars) {
      const mix = parseStarMix(star.fields);
      const sum = mix.reduce((n, row) => n + (Number(row.prob) || 0), 0);
      if (mix.length && sum && Math.abs(sum - 1) > 0.08 && Math.abs(sum - 100) > 8) {
        push({
          id: null,
          kind: "file",
          source: "galaxy",
          href: "/library/galaxy",
          level: "warning",
          code: "star-mix",
          message: `${star.name} StarClass mix probabilities sum to ${sum}, not 1 or 100.`,
          path: star.name,
          recommend: "review",
          suggestions: [],
          fixes: [],
        });
      }
    }
  }
  if (!sectorText) return;
  const bodies = parseSectorBodies(sectorText);
  const systems = groupSystems(bodies);
  const usableStars = stars.filter((star) => starZoneSpans(star).length);
  const fallbackStar = usableStars[0];
  for (const star of usableStars.slice(0, 8)) {
    const klass = (star.fields.StarClass || "").toLowerCase();
    const byClass = klass ? systems.find((s) => (s.starClass || "").toLowerCase() === klass) : undefined;
    const system = byClass || (star === fallbackStar ? systems.find((s) => !s.starClass) || systems[0] : undefined);
    if (!system) continue;
    const issues = diagnoseOrbits(star, overlayBodies(star, system.bodies));
    for (const issue of issues.slice(0, 40)) {
      const zone =
        issue.expectedZone === "parent"
          ? "its planet"
          : (STAR_ZONES.find((z) => z.key === issue.expectedZone)?.label ?? "its band");
      const coord = formatCoords(issue.suggested);
      const fixes: ProblemFix[] = issue.movable
        ? [
            {
              type: "orbit-move",
              role: "sectors",
              path: catalog.texts.find((t) => t.role === "sectors")?.path || "Sectors.yaml",
              name: issue.body.name,
              coords: issue.suggested,
              label: `Move to ${zone} (${coord})`,
            },
          ]
        : [];
      push({
        id: null,
        kind: "file",
        source: "galaxy",
        href: "/library/galaxy",
        level: "warning",
        code: "orbit",
        message: `${system.name}: ${issue.body.name} — ${issue.reason}`,
        path: `${system.name} · ${issue.body.name}`,
        recommend: fixes.length ? "fix" : "review",
        suggestions: fixes.length ? [`${zone} at ${issue.suggestedDistance.toFixed(0)} sectors`] : [],
        value: coord,
        fixes,
      });
    }
  }
  const playfields = new Set(
    [...catalog.entries, ...(catalog.game ?? [])].filter((e) => e.kind === "playfield").map((e) => e.name.toLowerCase()),
  );
  if (playfields.size) {
    const sectorPath = catalog.texts.find((t) => t.role === "sectors")?.path || "Sectors.yaml";
    const missing: string[] = [];
    for (const body of bodies) {
      const folder = (body.name || "").trim();
      if (!folder || /sun|star|asteroid/i.test(body.kind || "")) continue;
      if (playfields.has(folder.toLowerCase())) continue;
      missing.push(folder);
    }
    for (const folder of missing.slice(0, 16)) {
      const choices = playfieldChoices(catalog, folder, 3);
      push({
        id: null,
        kind: "file",
        source: "sectors",
        href: "/library/playfields",
        level: "warning",
        code: "playfield-missing",
        message: choices.length
          ? `${folder} is in Sectors.yaml but there is no Playfields folder with that name.`
          : `${folder} is in Sectors.yaml but no Playfields folder is close to that name.`,
        path: `Sectors.yaml · ${folder}`,
        recommend: choices.length ? "fix" : "review",
        suggestions: choices,
        value: folder,
        fixes: choices.map((name) => ({
          type: "sector-rename" as const,
          role: "sectors",
          path: sectorPath,
          from: folder,
          to: name,
          label: `Use ${name}`,
        })),
      });
    }
    if (missing.length > 16) {
      push({
        id: null,
        kind: "file",
        source: "sectors",
        href: "/library/playfields",
        level: "warning",
        code: "playfield-missing",
        message: `${missing.length} Sectors.yaml bodies have no Playfields folder.`,
        path: "Sectors.yaml",
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
    }
  }
}

function validateLocalization(catalog: ScenarioCatalog, push: (p: Omit<Problem, "key">) => void) {
  const table = localizationTable(catalog);
  const keys = Object.keys(table.rows);
  if (!keys.length) return;
  const file = catalogText(catalog, "localization");
  const path = file?.path || "Localization.csv";
  const languages = table.languages.length ? table.languages : ["English"];
  const empty: { key: string; text: string; from: string }[] = [];
  for (const key of keys) {
    const rec = table.rows[key] ?? {};
    const en = (rec.English || rec.english || "").trim();
    if (en) continue;
    empty.push({ key, ...suggestEnglishText(key, rec, languages) });
  }
  for (const row of empty.slice(0, 40)) {
    const from = row.from === "key" ? `the key “${row.text}”` : `${row.from} text`;
    push({
      id: null,
      kind: "file",
      source: "localization",
      href: "/library",
      level: "warning",
      code: "empty-loca",
      message: `Localization key “${row.key}” has no English text. Suggested ${from}: “${row.text}”.`,
      path: row.key,
      recommend: "fix",
      suggestions: [row.text],
      value: row.text,
      fixes: [
        {
          type: "loca-english",
          role: "localization",
          path,
          key: row.key,
          label: row.from === "key" ? `Use “${row.text}”` : `Copy ${row.from} into English`,
        },
      ],
    });
  }
  if (empty.length > 1) {
    push({
      id: null,
      kind: "file",
      source: "localization",
      href: "/library",
      level: "warning",
      code: "empty-loca",
      message: `${empty.length} Localization.csv keys have no English text.`,
      path: "Localization.csv",
      recommend: "fix",
      suggestions: empty.slice(0, 4).map((row) => row.text),
      fixes: [
        {
          type: "loca-english",
          role: "localization",
          path,
          key: "",
          label: "Fill every empty English cell",
        },
      ],
    });
  }
}

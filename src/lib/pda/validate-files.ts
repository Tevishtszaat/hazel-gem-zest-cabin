import { unusedNumericIds } from "./config-stats.ts";
import { CONFIG_METAS } from "./config-roles.ts";
import { parseEcfObjects, stringifyEcfObjects, type EcfObject } from "./ecf.ts";
import {
  dialogueDocFor,
  localizationTable,
  objectsFor,
} from "./library.ts";
import {
  diagnoseOrbits,
  groupSystems,
  isStarType,
  overlayBodies,
  parseSectorBodies,
  parseStarMix,
} from "./galaxy.ts";
import { bundlePlayfields } from "./playfield.ts";
import { preflightPlayfield as preflightLists } from "./playfield-design.ts";
import {
  catalogLoaded,
  resolveCatalogToken,
  suggestionsFor,
  type ScenarioCatalog,
} from "./scenario-index.ts";
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
    catalog.entries
      .filter((e) => e.kind === "picture")
      .flatMap((e) => {
        const base = e.name.toLowerCase();
        return [base, base.replace(/\.(png|jpe?g|webp|gif)$/i, "")];
      }),
  );
  const itemNames = new Set(
    catalog.entries.filter((e) => e.kind === "item" || e.kind === "block").map((e) => e.name.toLowerCase()),
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
  for (const star of stars.slice(0, 8)) {
    const klass = (star.fields.StarClass || star.name || "").toLowerCase();
    const system = systems.find((s) => (s.starClass || "").toLowerCase() === klass) ?? systems[0];
    if (!system) continue;
    const issues = diagnoseOrbits(star, overlayBodies(star, system.bodies));
    for (const issue of issues.slice(0, 20)) {
      push({
        id: null,
        kind: "file",
        source: "galaxy",
        href: "/library/galaxy",
        level: "warning",
        code: "orbit",
        message: `${system.name}: ${issue.body.name} — ${issue.reason}`,
        path: `${system.name} · ${issue.body.name}`,
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
    }
  }
  const playfields = new Set(catalog.entries.filter((e) => e.kind === "playfield").map((e) => e.name.toLowerCase()));
  if (playfields.size) {
    let missing = 0;
    const sample: string[] = [];
    for (const body of bodies) {
      const folder = (body.name || "").trim();
      if (!folder || /sun|star|asteroid/i.test(body.kind || "")) continue;
      if (playfields.has(folder.toLowerCase())) continue;
      missing += 1;
      if (sample.length < 4) sample.push(folder);
    }
    if (missing) {
      push({
        id: null,
        kind: "file",
        source: "sectors",
        href: "/library/playfields",
        level: "warning",
        code: "playfield-missing",
        message: `${missing} Sectors.yaml bodies have no Playfields folder${sample.length ? ` (e.g. ${sample.join(", ")})` : ""}.`,
        path: "Sectors.yaml",
        recommend: "review",
        suggestions: sample,
        fixes: [],
      });
    }
  }
}

function validateLocalization(catalog: ScenarioCatalog, push: (p: Omit<Problem, "key">) => void) {
  const table = localizationTable(catalog);
  if (!Object.keys(table.rows).length) return;
  let empty = 0;
  for (const [key, rec] of Object.entries(table.rows)) {
    const en = (rec.English || rec[table.languages[0] || "English"] || "").trim();
    if (!en) empty += 1;
    if (empty === 1) {
      push({
        id: null,
        kind: "file",
        source: "localization",
        href: "/library",
        level: "warning",
        code: "empty-loca",
        message: `Localization key “${key}” has no English text.`,
        path: key,
        recommend: "review",
        suggestions: [],
        fixes: [],
      });
    }
  }
  if (empty > 1) {
    push({
      id: null,
      kind: "file",
      source: "localization",
      href: "/library",
      level: "warning",
      code: "empty-loca",
      message: `${empty} Localization.csv keys have no English text.`,
      path: "Localization.csv",
      recommend: "review",
      suggestions: [],
      fixes: [],
    });
  }
}

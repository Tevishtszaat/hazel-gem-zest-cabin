import { stripBbcode } from "./bbcode.ts";
import {
  BUILTIN_NAMES,
  CHECK_NAME_KINDS,
  CHECK_TYPE_KINDS,
  catalogLoaded,
  splitTokens,
  suggestionsFor,
  type CatalogKind,
  type ScenarioCatalog,
} from "./scenario-index.ts";
import { CHECKS, type ActionNode, type ChapterNode, type PdaProject, type TaskNode } from "./types.ts";

export type NodeKind = "chapter" | "task" | "action" | "project";

export type ProblemFix =
  | { type: "set"; field: string; value: string; label: string }
  | { type: "clear"; field: string; label: string }
  | { type: "rewards"; rewards: ChapterNode["rewards"]; label: string }
  | { type: "delete"; label: string };

export type Problem = {
  key: string;
  id: string | null;
  kind: NodeKind;
  level: "error" | "warning";
  code: string;
  message: string;
  path: string;
  recommend: "fix" | "delete" | "review";
  field?: string;
  value?: string;
  suggestions: string[];
  fixes: ProblemFix[];
};

function kindPresent(catalog: ScenarioCatalog, kinds: CatalogKind[]) {
  return kinds.some((kind) => catalog.entries.some((e) => e.kind === kind));
}

function unknownIn(catalog: ScenarioCatalog, value: string, kinds: CatalogKind[]) {
  if (!kinds.length || !kindPresent(catalog, kinds)) return [];
  return splitTokens(value).filter((token) => {
    if (BUILTIN_NAMES.has(token)) return false;
    const needle = token.toLowerCase();
    return !catalog.entries.some((e) => kinds.includes(e.kind) && e.name.toLowerCase() === needle);
  });
}

function nearby(catalog: ScenarioCatalog | undefined, token: string, kinds: CatalogKind[], cache: Map<string, string[]>) {
  if (!catalog) return [];
  const key = `${kinds.join(",")}:${token.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const names = suggestionsFor(catalog, kinds, token, 4).map((e) => e.name);
  cache.set(key, names);
  return names;
}

function replaceToken(source: string, from: string, to: string) {
  return splitTokens(source)
    .map((part) => (part === from ? to : part))
    .join(", ");
}

function visibleLen(text: string) {
  return stripBbcode(text).length;
}

function looksLikeSection(title: string) {
  const t = stripBbcode(title).trim();
  return /^\*{2,}/.test(t) || /^\[[^\]]+\]$/.test(t) || /^[-–—]{3,}/.test(t);
}

function pathOf(ch: ChapterNode, tk?: TaskNode, ac?: ActionNode) {
  const parts = [ch.category || "PDA", stripBbcode(ch.chapterTitle) || "Untitled"];
  if (tk) parts.push(stripBbcode(tk.taskTitle) || "Task");
  if (ac) parts.push(stripBbcode(ac.actionTitle) || ac.check || "Action");
  return parts.join(" · ");
}

function tokenFixes(field: string, source: string, token: string, suggestions: string[]): ProblemFix[] {
  const fixes: ProblemFix[] = suggestions.map((name) => ({
    type: "set",
    field,
    value: replaceToken(source, token, name),
    label: `Use ${name}`,
  }));
  const next = splitTokens(source).filter((part) => part !== token);
  if (next.length !== splitTokens(source).length) {
    fixes.push({
      type: "set",
      field,
      value: next.join(", "),
      label: `Drop “${token}”`,
    });
  } else {
    fixes.push({ type: "clear", field, label: `Clear ${field}` });
  }
  return fixes;
}

export function validateProject(project: PdaProject, catalog?: ScenarioCatalog): Problem[] {
  const issues: Problem[] = [];
  const suggestCache = new Map<string, string[]>();
  let n = 0;
  const push = (problem: Omit<Problem, "key">) => {
    n += 1;
    issues.push({ key: `${problem.code}:${problem.id ?? "root"}:${n}`, ...problem });
  };

  if (!project.chapters.length) {
    push({
      id: null,
      kind: "project",
      level: "error",
      code: "empty",
      message: "Add a chapter to start a PDA journey.",
      path: "Project",
      recommend: "review",
      suggestions: [],
      fixes: [],
    });
    return issues;
  }

  const seenTitles = new Map<string, string>();

  project.chapters.forEach((ch, ci) => {
    const title = ch.chapterTitle.trim();
    const chPath = pathOf(ch);

    if (!title) {
      push({
        id: ch.id,
        kind: "chapter",
        level: "error",
        code: "empty-title",
        message: `Chapter ${ci + 1} has no title.`,
        path: chPath,
        recommend: "delete",
        field: "chapterTitle",
        suggestions: [],
        fixes: [
          { type: "set", field: "chapterTitle", value: `Chapter ${ci + 1}`, label: "Name it Chapter " + (ci + 1) },
          { type: "delete", label: "Delete chapter" },
        ],
      });
    }

    const dupKey = `${ch.category}::${stripBbcode(title).toLowerCase()}`;
    if (title && seenTitles.has(dupKey)) {
      push({
        id: ch.id,
        kind: "chapter",
        level: "warning",
        code: "duplicate-title",
        message: `Duplicate chapter title “${stripBbcode(title)}”.`,
        path: chPath,
        recommend: "delete",
        suggestions: [],
        fixes: [{ type: "delete", label: "Delete this copy" }],
      });
    } else if (title) {
      seenTitles.set(dupKey, ch.id);
    }

    if (!ch.tasks.length) {
      const section = looksLikeSection(ch.chapterTitle) || ch.hideTasks;
      push({
        id: ch.id,
        kind: "chapter",
        level: section ? "warning" : "error",
        code: "empty-chapter",
        message: section
          ? `“${stripBbcode(ch.chapterTitle) || "Chapter"}” looks like a section header with no tasks.`
          : `“${stripBbcode(ch.chapterTitle) || "Chapter"}” has no tasks.`,
        path: chPath,
        recommend: section ? "review" : "delete",
        suggestions: [],
        fixes: [{ type: "delete", label: "Delete chapter" }],
      });
    }

    if (catalogLoaded(catalog) && ch.pictureFile) {
      const pics = unknownIn(catalog!, ch.pictureFile, ["picture"]);
      if (pics.length) {
        const suggestions = nearby(catalog, ch.pictureFile, ["picture"], suggestCache);
        push({
          id: ch.id,
          kind: "chapter",
          level: "warning",
          code: "unknown-picture",
          message: `Picture “${ch.pictureFile}” is not in Extras/PDA.`,
          path: chPath,
          recommend: suggestions.length ? "fix" : "review",
          field: "pictureFile",
          value: ch.pictureFile,
          suggestions,
          fixes: [
            ...suggestions.map((name) => ({ type: "set" as const, field: "pictureFile", value: name, label: `Use ${name}` })),
            { type: "clear", field: "pictureFile", label: "Clear picture" },
          ],
        });
      }
    }

    ch.rewards.forEach((reward, ri) => {
      if (!catalogLoaded(catalog)) return;
      if (reward.item) {
        const miss = unknownIn(catalog!, reward.item, ["item", "token", "block"]);
        if (miss.length) {
          const suggestions = nearby(catalog, reward.item, ["item", "token", "block"], suggestCache);
          const next = ch.rewards.filter((_, i) => i !== ri);
          push({
            id: ch.id,
            kind: "chapter",
            level: "warning",
            code: "unknown-reward",
            message: `Reward “${reward.item}” is not in the loaded scenario items.`,
            path: chPath,
            recommend: suggestions.length ? "fix" : "delete",
            field: "rewards",
            value: reward.item,
            suggestions,
            fixes: [
              ...suggestions.slice(0, 3).map((name) => ({
                type: "rewards" as const,
                rewards: ch.rewards.map((r, i) => (i === ri ? { ...r, item: name } : r)),
                label: `Use ${name}`,
              })),
              { type: "rewards", rewards: next, label: `Remove reward ${reward.item}` },
            ],
          });
        }
      }
      if (reward.faction) {
        const miss = unknownIn(catalog!, reward.faction, ["faction"]);
        if (miss.length) {
          const suggestions = nearby(catalog, reward.faction, ["faction"], suggestCache);
          push({
            id: ch.id,
            kind: "chapter",
            level: "warning",
            code: "unknown-faction",
            message: `Faction “${reward.faction}” is not in Factions.ecf.`,
            path: chPath,
            recommend: suggestions.length ? "fix" : "review",
            value: reward.faction,
            suggestions,
            fixes: suggestions.slice(0, 3).map((name) => ({
              type: "rewards" as const,
              rewards: ch.rewards.map((r, i) => (i === ri ? { ...r, faction: name } : r)),
              label: `Use ${name}`,
            })),
          });
        }
      }
    });

    ch.tasks.forEach((tk, ti) => {
      const tkPath = pathOf(ch, tk);
      const visTitle = stripBbcode(tk.taskTitle);
      if (!tk.taskTitle.trim()) {
        push({
          id: tk.id,
          kind: "task",
          level: "error",
          code: "empty-title",
          message: `Task ${ti + 1} in “${stripBbcode(ch.chapterTitle)}” has no title.`,
          path: tkPath,
          recommend: "delete",
          field: "taskTitle",
          suggestions: [],
          fixes: [{ type: "delete", label: "Delete task" }],
        });
      }
      if (visTitle.length > 26) {
        const short = visTitle.slice(0, 26).trim();
        const hasBb = /\[[^\]]+\]/.test(tk.taskTitle);
        push({
          id: tk.id,
          kind: "task",
          level: "warning",
          code: "hud-wrap",
          message: `“${visTitle}” is ${visTitle.length} chars. HUD wraps after 26.`,
          path: tkPath,
          recommend: "fix",
          field: "taskTitle",
          value: tk.taskTitle,
          suggestions: hasBb ? [] : [short],
          fixes: hasBb
            ? []
            : [{ type: "set", field: "taskTitle", value: short, label: `Shorten to “${short}”` }],
        });
      }
      if (!tk.actions.length) {
        push({
          id: tk.id,
          kind: "task",
          level: "error",
          code: "empty-task",
          message: `Task “${visTitle || "untitled"}” has no actions.`,
          path: tkPath,
          recommend: "delete",
          suggestions: [],
          fixes: [{ type: "delete", label: "Delete task" }],
        });
      }
      if (catalogLoaded(catalog) && tk.pictureFile) {
        const pics = unknownIn(catalog!, tk.pictureFile, ["picture"]);
        if (pics.length) {
          const suggestions = nearby(catalog, tk.pictureFile, ["picture"], suggestCache);
          push({
            id: tk.id,
            kind: "task",
            level: "warning",
            code: "unknown-picture",
            message: `Picture “${tk.pictureFile}” is not in Extras/PDA.`,
            path: tkPath,
            recommend: suggestions.length ? "fix" : "review",
            field: "pictureFile",
            value: tk.pictureFile,
            suggestions,
            fixes: [
              ...suggestions.map((name) => ({ type: "set" as const, field: "pictureFile", value: name, label: `Use ${name}` })),
              { type: "clear", field: "pictureFile", label: "Clear picture" },
            ],
          });
        }
      }

      tk.actions.forEach((ac) => {
        const acPath = pathOf(ch, tk, ac);
        const visAction = stripBbcode(ac.actionTitle);
        if (!ac.actionTitle.trim()) {
          push({
            id: ac.id,
            kind: "action",
            level: "error",
            code: "empty-title",
            message: `An action under “${visTitle}” has no title.`,
            path: acPath,
            recommend: "delete",
            field: "actionTitle",
            suggestions: [],
            fixes: [{ type: "delete", label: "Delete action" }],
          });
        }
        if (visAction.length > 24) {
          const short = visAction.slice(0, 24).trim();
          const hasBb = /\[[^\]]+\]/.test(ac.actionTitle);
          push({
            id: ac.id,
            kind: "action",
            level: "warning",
            code: "hud-wrap",
            message: `“${visAction}” is ${visAction.length} chars. HUD wraps after 24.`,
            path: acPath,
            recommend: "fix",
            field: "actionTitle",
            value: ac.actionTitle,
            suggestions: hasBb ? [] : [short],
            fixes: hasBb
              ? []
              : [{ type: "set", field: "actionTitle", value: short, label: `Shorten to “${short}”` }],
          });
        }
        if (ac.check) {
          const meta = CHECKS.find((c) => c.id === ac.check);
          if (meta?.hint.includes("Names") && !ac.names.trim() && ac.check !== "ItemsUnlocked") {
            push({
              id: ac.id,
              kind: "action",
              level: "warning",
              code: "missing-names",
              message: `“${visAction}” (${ac.check}) usually needs Names.`,
              path: acPath,
              recommend: "review",
              field: "names",
              suggestions: [],
              fixes: [{ type: "delete", label: "Delete action" }],
            });
          }
        }
        if (catalogLoaded(catalog)) {
          const nameKinds = CHECK_NAME_KINDS[ac.check] ?? [];
          const typeKinds = CHECK_TYPE_KINDS[ac.check] ?? [];
          for (const token of unknownIn(catalog!, ac.names, nameKinds).slice(0, 4)) {
            const suggestions = nearby(catalog, token, nameKinds, suggestCache);
            push({
              id: ac.id,
              kind: "action",
              level: "warning",
              code: "unknown-name",
              message: `“${token}” is not in the loaded scenario (${ac.check} Names).`,
              path: acPath,
              recommend: suggestions.length ? "fix" : "delete",
              field: "names",
              value: token,
              suggestions,
              fixes: [...tokenFixes("names", ac.names, token, suggestions), { type: "delete", label: "Delete action" }],
            });
          }
          for (const token of unknownIn(catalog!, ac.types, typeKinds).slice(0, 3)) {
            const suggestions = nearby(catalog, token, typeKinds, suggestCache);
            push({
              id: ac.id,
              kind: "action",
              level: "warning",
              code: "unknown-type",
              message: `“${token}” is not in the loaded scenario (${ac.check} Types).`,
              path: acPath,
              recommend: suggestions.length ? "fix" : "delete",
              field: "types",
              value: token,
              suggestions,
              fixes: [...tokenFixes("types", ac.types, token, suggestions), { type: "delete", label: "Delete action" }],
            });
          }
        }
      });
    });
  });

  return issues;
}

export function counts(project: PdaProject) {
  const tasks = project.chapters.reduce((n, c) => n + c.tasks.length, 0);
  const actions = project.chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0);
  return { chapters: project.chapters.length, tasks, actions };
}

export function problemStats(issues: Problem[]) {
  return {
    total: issues.length,
    errors: issues.filter((i) => i.level === "error").length,
    warnings: issues.filter((i) => i.level === "warning").length,
    deletable: issues.filter((i) => i.recommend === "delete" && i.id).length,
  };
}

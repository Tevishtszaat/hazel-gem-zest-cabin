import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { problemIgnoreKey } from "@/lib/pda/problems.ts";
import { useProblems } from "@/lib/pda/use-problems.ts";
import { FILE_DEBUG_TABS } from "@/lib/pda/validate-files.ts";
import type { Problem, ProblemFix } from "@/lib/pda/validate.ts";
import { usePdaStore } from "@/store/pda-store.ts";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "error", label: "Errors" },
  { id: "warning", label: "Warnings" },
  { id: "delete", label: "Suggested delete" },
  { id: "titles", label: "Duplicate titles" },
  { id: "fix", label: "Suggested fix" },
  { id: "ignored", label: "Ignored" },
] as const;

export function DebugPage() {
  const applyBulk = usePdaStore((s) => s.applyBulk);
  const applyFileFix = usePdaStore((s) => s.applyFileFix);
  const jumpTo = usePdaStore((s) => s.jumpTo);
  const ignoreProblems = usePdaStore((s) => s.ignoreProblems);
  const unignoreProblems = usePdaStore((s) => s.unignoreProblems);
  const ignoredProblems = usePdaStore((s) => s.ignoredProblems);
  const navigate = useNavigate();
  const [file, setFile] = useState<(typeof FILE_DEBUG_TABS)[number]["id"]>("all");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [showLength, setShowLength] = useState(false);
  const { issues, stats, busy, raw, ignoredCount } = useProblems({
    includeLength: showLength || filter === "ignored",
    includeIgnored: filter === "ignored",
  });

  const visible = issues.filter((issue) => {
    const ignored = ignoredProblems.includes(problemIgnoreKey(issue));
    const source = issue.source ?? "pda";
    if (file !== "all" && source !== file) return false;
    if (filter === "ignored") return ignored;
    if (ignored) return false;
    if (filter === "error" && issue.level !== "error") return false;
    if (filter === "warning" && issue.level !== "warning") return false;
    if (filter === "delete" && (issue.recommend !== "delete" || issue.code === "duplicate-title")) return false;
    if (filter === "titles" && issue.code !== "duplicate-title") return false;
    if (filter === "fix" && issue.recommend !== "fix") return false;
    if (query) {
      const hay = `${issue.message} ${issue.path} ${issue.code} ${issue.value ?? ""}`.toLowerCase();
      if (!hay.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const selectedIds = visible.filter((issue) => issue.id && picked[issue.key]).map((issue) => issue.id!);
  const uniqueSelected = [...new Set(selectedIds)];
  const selectedKeys = visible.filter((issue) => picked[issue.key]).map((issue) => problemIgnoreKey(issue));

  const apply = (issue: Problem, fix: ProblemFix) => {
    if (fix.type === "ecf-set" || fix.type === "yaml-replace") {
      applyFileFix(fix);
    } else if (issue.id) {
      if (fix.type === "delete") applyBulk([], [issue.id]);
      else applyBulk([{ id: issue.id, patch: fixToPatch(fix) }]);
    }
    setPicked((p) => {
      const next = { ...p };
      delete next[issue.key];
      return next;
    });
  };

  const acceptIssues = (list: Problem[]) => {
    const patches: { id: string; patch: Record<string, unknown> }[] = [];
    for (const issue of list) {
      const fix = preferredFix(issue);
      if (!fix) continue;
      if (fix.type === "ecf-set" || fix.type === "yaml-replace") applyFileFix(fix);
      else if (issue.id) patches.push({ id: issue.id, patch: fixToPatch(fix) });
    }
    if (patches.length) applyBulk(patches);
    setPicked({});
  };

  const selectable = visible.filter((issue) => issue.id || issue.fixes.length);
  const suggestedFixes = visible.filter((issue) => issue.recommend === "fix" && preferredFix(issue));
  const selectedFixable = selectable.filter((issue) => picked[issue.key] && preferredFix(issue));
  const recommendedDeletes = visible.filter((i) => i.recommend === "delete" && i.id).map((i) => i.id!);
  const dupCount = issues.filter(
    (i) => i.code === "duplicate-title" && !ignoredProblems.includes(problemIgnoreKey(i)),
  ).length;

  const open = (issue: Problem) => {
    if (issue.href) {
      void navigate({ to: issue.href as "/" });
      return;
    }
    if (!issue.id) return;
    jumpTo(issue.id);
    void navigate({ to: "/" });
  };

  const ignoreVisibleSelected = () => {
    if (!selectedKeys.length) return;
    ignoreProblems(selectedKeys);
    setPicked({});
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col text-fg">
      <AppHeader />
      <main className="canvas-wash mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-medium tracking-tight">Debug</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            One debugger per file kind — PDA plus Items, Blocks, Dialogues, Playfields, Galaxy, and the rest. Ignore parks
            an issue so it stops counting.
            {busy ? " Rechecking in the background…" : ""}
          </p>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILE_DEBUG_TABS.map((tab) => {
            const count = issues.filter((i) => {
              const source = i.source ?? "pda";
              const ignored = ignoredProblems.includes(problemIgnoreKey(i));
              if (ignored && filter !== "ignored") return false;
              return tab.id === "all" || source === tab.id;
            }).length;
            return (
              <button
                key={tab.id}
                onClick={() => setFile(tab.id)}
                className={`h-8 rounded-sm px-3 text-xs ${
                  file === tab.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {tab.label}
                {count ? <span className="ml-1 text-subtle">{count}</span> : null}
              </button>
            );
          })}
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <Stat label="Issues" value={String(stats.total)} />
          <Stat label="Errors" value={String(stats.errors)} tone={stats.errors ? "danger" : undefined} />
          <Stat label="Warnings" value={String(stats.warnings)} tone={stats.warnings ? "warn" : undefined} />
          <Stat label="Ignored" value={String(ignoredCount)} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`h-8 rounded-sm px-3 text-xs ${
                filter === item.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {item.id === "titles" && dupCount ? ` (${dupCount})` : ""}
              {item.id === "delete" && stats.deletable ? ` (${stats.deletable})` : ""}
            </button>
          ))}
          <label className="flex h-8 items-center gap-2 px-2 text-xs text-muted">
            <input type="checkbox" checked={showLength} onChange={(e) => setShowLength(e.target.checked)} />
            Show wrap / length
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter message or path…"
            className="h-8 min-w-40 flex-1 rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!selectable.length}
            onClick={() => {
              const next: Record<string, boolean> = {};
              for (const issue of selectable) next[issue.key] = true;
              setPicked(next);
            }}
          >
            Select all
          </Button>
          <Button size="sm" variant="ghost" disabled={!Object.values(picked).some(Boolean)} onClick={() => setPicked({})}>
            Deselect all
          </Button>
          <Button size="sm" disabled={!selectedFixable.length} onClick={() => acceptIssues(selectedFixable)}>
            Accept selected ({selectedFixable.length})
          </Button>
          <Button size="sm" disabled={!suggestedFixes.length} onClick={() => acceptIssues(suggestedFixes)}>
            Accept all suggested ({suggestedFixes.length})
          </Button>
          {filter === "ignored" ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={!selectedKeys.length && !visible.length}
              onClick={() => {
                unignoreProblems(selectedKeys.length ? selectedKeys : visible.map(problemIgnoreKey));
                setPicked({});
              }}
            >
              Restore selected
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled={!selectedKeys.length} onClick={ignoreVisibleSelected}>
              Ignore selected ({selectedKeys.length})
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            disabled={!uniqueSelected.length}
            onClick={() => {
              applyBulk([], uniqueSelected);
              setPicked({});
            }}
          >
            Delete selected ({uniqueSelected.length})
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!recommendedDeletes.length}
            onClick={() => {
              applyBulk([], [...new Set(recommendedDeletes)]);
              setPicked({});
            }}
          >
            Delete all suggested ({[...new Set(recommendedDeletes)].length})
          </Button>
          {filter === "titles" ? (
            <Button size="sm" disabled={!suggestedFixes.length} onClick={() => acceptIssues(suggestedFixes)}>
              Rename all copies ({suggestedFixes.length})
            </Button>
          ) : null}
        </div>

        {!visible.length ? (
          <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-ok">
            {raw.length ? "Nothing matches this filter." : "No issues. Structure looks exportable."}
          </p>
        ) : (
          <ul className="space-y-2">
            {visible.slice(0, 400).map((issue) => {
              const key = problemIgnoreKey(issue);
              const ignored = ignoredProblems.includes(key);
              return (
                <li key={issue.key} className="rounded-md border border-border bg-surface p-3">
                  <div className="flex items-start gap-3">
                    {issue.id || issue.fixes.length ? (
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(picked[issue.key])}
                        onChange={(e) => setPicked((p) => ({ ...p, [issue.key]: e.target.checked }))}
                      />
                    ) : (
                      <span className="mt-1 size-4" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs uppercase tracking-[0.14em] ${
                            issue.level === "error" ? "text-danger" : "text-warn"
                          }`}
                        >
                          {issue.level === "error" ? "Error" : "Watch"}
                        </span>
                        <span className="text-xs text-subtle">{issue.source ?? issue.kind}</span>
                        {issue.recommend === "delete" ? (
                          <span className="text-xs text-danger">suggest delete</span>
                        ) : issue.recommend === "fix" ? (
                          <span className="text-xs text-ok">suggest fix</span>
                        ) : null}
                        {ignored ? <span className="text-xs text-subtle">ignored</span> : null}
                      </div>
                      <p className="mt-1 text-sm">{issue.message}</p>
                      <p className="mt-0.5 text-xs text-subtle">{issue.path}</p>
                      {issue.suggestions.length ? (
                        <p className="mt-1 text-xs text-muted">Close matches: {issue.suggestions.join(" · ")}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {issue.fixes.map((fix) => (
                          <button
                            key={fix.label}
                            className={`h-7 rounded-sm px-2 text-xs ${
                              fix.type === "delete"
                                ? "border border-danger/40 text-danger hover:bg-danger/10"
                                : "bg-elevated text-fg hover:bg-surface"
                            }`}
                            onClick={() => apply(issue, fix)}
                          >
                            {fix.label}
                          </button>
                        ))}
                        {ignored ? (
                          <button
                            className="h-7 rounded-sm px-2 text-xs text-muted hover:text-fg"
                            onClick={() => unignoreProblems([key])}
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            className="h-7 rounded-sm border border-border px-2 text-xs text-muted hover:text-fg"
                            onClick={() => ignoreProblems([key])}
                          >
                            Ignore
                          </button>
                        )}
                        {issue.id || issue.href ? (
                          <button className="h-7 rounded-sm px-2 text-xs text-muted hover:text-fg" onClick={() => open(issue)}>
                            Jump
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {visible.length > 400 ? (
          <p className="mt-3 text-xs text-subtle">Showing 400 of {visible.length}. Narrow the filter to see the rest.</p>
        ) : null}
      </main>
    </div>
  );
}

function preferredFix(issue: Problem): ProblemFix | null {
  return issue.fixes.find((fix) => fix.type !== "delete") ?? null;
}

function fixToPatch(fix: ProblemFix): Record<string, unknown> {
  if (fix.type === "clear") return { [fix.field]: "" };
  if (fix.type === "set") return { [fix.field]: fix.value };
  if (fix.type === "rewards") return { rewards: fix.rewards };
  return {};
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "danger" | "warn" }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-1 text-lg tabular-nums ${tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : ""}`}>
        {value}
      </p>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { BbText } from "@/components/editor/bb-text.tsx";
import { PdaImage } from "@/components/editor/pda-image.tsx";
import { counts, problemStats, validateProject } from "@/lib/pda/validate.ts";
import { catalogCounts, catalogLoaded } from "@/lib/pda/scenario-index.ts";
import { selectedContext, usePdaStore } from "@/store/pda-store.ts";

export function PreviewPane() {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const selected = usePdaStore((s) => s.selected);
  const ctx = selectedContext(project, selected);
  const ch = ctx?.chapter ?? project.chapters[0];
  const task = ctx && "task" in ctx ? ctx.task : ch?.tasks[0];
  const issues = validateProject(project, catalog);
  const stats = problemStats(issues);
  const report = project.lastImport;
  const n = counts(project);
  const indexed = catalogCounts(catalog);

  return (
    <div className="flex min-h-0 flex-col gap-3 overflow-auto p-3">
      <div className="rounded-lg bg-elevated p-1.5 shadow-[var(--shadow-border)]">
        <div className="rounded-md border border-border bg-bg p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">{ch?.category || "PDA"}</p>
          <BbText as="h3" className="mt-2 text-lg font-medium leading-snug" text={ch?.chapterTitle || "Nothing loaded"} inline />
          {ch?.pictureFile ? (
            <>
              <PdaImage name={ch.pictureFile} className="mt-3 max-h-40 w-full rounded-sm object-cover" />
              <p className="mt-2 text-xs text-subtle">Picture {ch.pictureFile}</p>
            </>
          ) : null}
          {ch?.description ? (
            <BbText as="div" className="mt-3 text-sm leading-relaxed text-muted" text={ch.description} />
          ) : (
            <p className="mt-3 text-sm text-subtle">No description.</p>
          )}
          <div className="mt-4 rounded-sm border border-border bg-surface p-3">
            <BbText className="text-sm font-medium text-task" text={task?.headline || task?.taskTitle || "No task"} inline />
            <ul className="mt-2 space-y-1 text-sm">
              {(task?.actions || []).map((a) => (
                <li key={a.id} className="flex gap-2 text-muted">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full border border-muted" />
                  <BbText className="min-w-0" text={a.actionTitle} inline />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Health</p>
        <p className="mt-1 text-sm tabular-nums text-muted">
          {n.chapters} chapters · {n.tasks} tasks · {n.actions} actions
        </p>
        {stats.total ? (
          <Link to="/debug" className="mt-2 block rounded-sm bg-elevated px-2 py-2 text-xs hover:bg-surface">
            <span className={stats.errors ? "text-danger" : "text-warn"}>
              {stats.errors} errors · {stats.warnings} warnings
            </span>
            <span className="mt-0.5 block text-subtle">Open debug to fix or delete entries</span>
          </Link>
        ) : (
          <p className="mt-2 text-xs text-ok">Structure looks exportable.</p>
        )}
      </div>

      {catalogLoaded(catalog) ? (
        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Scenario files</p>
          <p className="mt-1 text-sm">{catalog.folderName}</p>
          <p className="text-xs text-muted">
            {indexed.item} items · {indexed.block} blocks · {indexed.entity} NPCs · {indexed.faction} factions ·{" "}
            {indexed.dialogue} dialogues · {indexed.playfield} playfields · {indexed.poi} POIs · {indexed.picture}{" "}
            pictures
          </p>
        </div>
      ) : null}

      {report ? (
        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Last import</p>
          <p className="mt-1 text-sm">
            {report.yamlName}
            {report.csvName !== "—" ? ` + ${report.csvName}` : ""}
          </p>
          <p className="text-xs text-muted">
            {report.chapters} chapters · {report.resolved} CSV strings resolved · {report.csvKeys} keys ·{" "}
            {report.durationMs} ms
          </p>
        </div>
      ) : null}
    </div>
  );
}

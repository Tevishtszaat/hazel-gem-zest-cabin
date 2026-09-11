import { useState } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { BbText } from "@/components/editor/bb-text.tsx";
import { Inspector } from "@/components/editor/inspector.tsx";
import { PreviewPane } from "@/components/editor/preview-pane.tsx";
import { TreePane } from "@/components/editor/tree-pane.tsx";
import { counts } from "@/lib/pda/validate.ts";
import { catalogCounts, catalogLoaded } from "@/lib/pda/scenario-index.ts";
import { usePdaStore } from "@/store/pda-store.ts";

export function Workspace() {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const n = counts(project);
  const indexed = catalogCounts(catalog);
  const [tab, setTab] = useState<"tree" | "edit" | "preview">("tree");

  return (
    <div className="app-shell flex h-dvh flex-col text-fg">
      <AppHeader />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-bg/50 px-4 py-1.5 text-xs text-muted">
        <span className="min-w-0 truncate">
          <BbText className="font-medium text-fg" text={project.name} inline />
        </span>
        <span className="tabular-nums">
          {n.chapters} chapters · {n.tasks} tasks · {n.actions} actions
        </span>
        {catalogLoaded(catalog) ? (
          <span className="truncate" title={catalog.files.map((f) => f.path).join("\n")}>
            {catalog.folderName} · {indexed.item} items · {indexed.entity} NPCs · {indexed.playfield} playfields ·{" "}
            {indexed.poi} POIs
          </span>
        ) : (
          <span>No scenario folder indexed</span>
        )}
        <span className="ml-auto hidden sm:inline text-subtle">Autosave on this device</span>
      </div>

      <div className="flex gap-2 border-b border-border px-3 py-2 lg:hidden">
        {(["tree", "edit", "preview"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`h-10 flex-1 rounded-sm text-sm capitalize ${tab === id ? "bg-elevated text-fg" : "text-muted"}`}
          >
            {id === "tree" ? "Structure" : id === "edit" ? "Inspector" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(240px,300px)]">
        <section className={`min-h-0 border-r border-border ${tab === "tree" ? "flex" : "hidden"} lg:flex`}>
          <TreePane />
        </section>
        <section
          className={`min-h-0 overflow-auto border-r border-border canvas-wash ${tab === "edit" ? "block" : "hidden"} lg:block`}
        >
          <Inspector />
        </section>
        <section className={`min-h-0 bg-surface/40 ${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <PreviewPane />
        </section>
      </div>
    </div>
  );
}

import { IMPORT_SLOTS, type ImportKind } from "@/lib/pda/import-kinds.ts";
import { areaPercent, useImportProgress, type AreaSnap } from "@/store/import-progress.ts";

const SHORT: Record<ImportKind, string> = {
  scenario: "Scenario",
  configs: "Configs",
  localization: "Localization",
  itemImages: "Item icons",
  pdaImages: "PDA images",
  pdaYaml: "PDA.yaml",
  pdaCsv: "PDA.csv",
  dialogues: "Dialogues",
  dialoguesCsv: "Dialogues.csv",
  factions: "Factions",
  galaxy: "Galaxy",
  sectors: "Sectors",
  playfields: "Playfields",
  blueprints: "Blueprints",
};

export function AreaBar({ snap, compact }: { snap?: AreaSnap; compact?: boolean }) {
  if (!snap) return null;
  const pct = areaPercent(snap);
  const fill =
    snap.phase === "done" ? "area-bar-fill is-done" : snap.phase === "queued" ? "area-bar-fill is-queued" : "area-bar-fill";
  const label = snap.phase === "done" ? "Done" : snap.phase === "queued" ? `Queued ${snap.total}` : `${snap.done}/${snap.total}`;
  return (
    <div className={compact ? "mt-2" : ""}>
      <div className={`overflow-hidden rounded-full bg-elevated ring-1 ring-border ${compact ? "h-2.5" : "h-4"}`}>
        <div
          className={`h-full rounded-full ${fill}`}
          style={{ width: `${Math.max(snap.phase === "queued" ? 10 : 3, pct)}%` }}
        />
      </div>
      <p className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </p>
    </div>
  );
}

export function ImportProgressPanel() {
  const areas = useImportProgress((s) => s.areas);
  const rows = IMPORT_SLOTS.map((slot) => ({ slot, snap: areas[slot.id] })).filter((row) => row.snap);
  if (!rows.length) return null;
  const overall = rows.reduce((n, row) => n + areaPercent(row.snap!), 0) / rows.length;
  const working = rows.some((row) => row.snap!.phase !== "done");

  return (
    <section className="mb-4 rounded-lg border border-accent/35 bg-surface p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Import progress</p>
          <p className="mt-1 text-sm text-muted">
            {working ? "Each bar is one import area. Stay until they all turn green." : "All areas finished."}
          </p>
        </div>
        <p className="font-medium tabular-nums text-lg leading-none">{Math.round(overall)}%</p>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full ${working ? "area-bar-fill" : "area-bar-fill is-done"}`}
          style={{ width: `${Math.max(4, overall)}%` }}
        />
      </div>
      <div className="grid gap-2.5">
        {rows.map(({ slot, snap }) => {
          const pct = areaPercent(snap!);
          const fill =
            snap!.phase === "done"
              ? "area-bar-fill is-done"
              : snap!.phase === "queued"
                ? "area-bar-fill is-queued"
                : "area-bar-fill";
          return (
            <div key={slot.id} className="grid grid-cols-[7.5rem_1fr_2.6rem] items-center gap-3">
              <p className="truncate text-xs text-fg">{SHORT[slot.id]}</p>
              <div className="h-3.5 overflow-hidden rounded-full bg-elevated ring-1 ring-border">
                <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.max(snap!.phase === "queued" ? 8 : 3, pct)}%` }} />
              </div>
              <p className="text-right text-[11px] tabular-nums text-muted">{snap!.phase === "done" ? "Done" : `${pct}%`}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

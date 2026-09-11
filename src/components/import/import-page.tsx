import {
  Box,
  FileJson,
  FileSpreadsheet,
  FileUp,
  FolderOpen,
  Image as ImageIcon,
  Landmark,
  LoaderCircle,
  Map,
  MessageSquare,
  Package,
  ScrollText,
  Sun,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { filesFromDataTransfer, loadTutorialSources, sourcesFromFiles } from "@/lib/pda/folder-files.ts";
import { areaForRole, fileMatchesKind, IMPORT_SLOTS, type ImportKind } from "@/lib/pda/import-kinds.ts";
import { classifyScenarioPath, catalogCounts, catalogLoaded } from "@/lib/pda/scenario-index.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { beginBusy, endBusy, setBusyDetail, useBusyStore } from "@/store/busy-store.ts";
import { useImportProgress, type AreaSnap } from "@/store/import-progress.ts";

const ICONS: Record<ImportKind, ReactNode> = {
  scenario: <FolderOpen className="size-5" />,
  configs: <Package className="size-5" />,
  localization: <ScrollText className="size-5" />,
  itemImages: <Box className="size-5" />,
  pdaImages: <ImageIcon className="size-5" />,
  pdaYaml: <FileJson className="size-5" />,
  pdaCsv: <FileSpreadsheet className="size-5" />,
  dialogues: <MessageSquare className="size-5" />,
  dialoguesCsv: <FileSpreadsheet className="size-5" />,
  factions: <Landmark className="size-5" />,
  galaxy: <Sun className="size-5" />,
  sectors: <Map className="size-5" />,
  playfields: <Map className="size-5" />,
  blueprints: <Box className="size-5" />,
};

function tallyAreas(files: File[], kind: ImportKind) {
  const totals: Partial<Record<ImportKind, number>> = {};
  for (const file of files) {
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    if (!fileMatchesKind(path, kind)) continue;
    if (kind === "scenario") {
      totals.scenario = (totals.scenario || 0) + 1;
      const area = areaForRole(classifyScenarioPath(path, kind));
      if (area) totals[area] = (totals[area] || 0) + 1;
    } else {
      totals[kind] = (totals[kind] || 0) + 1;
    }
  }
  return totals;
}

function AreaBar({ snap }: { snap?: AreaSnap }) {
  if (!snap) return null;
  const pct = snap.total ? Math.round((snap.done / snap.total) * 100) : snap.phase === "done" ? 100 : 0;
  const fill =
    snap.phase === "done" ? "area-bar-fill is-done" : snap.phase === "queued" ? "area-bar-fill is-queued" : "area-bar-fill";
  const label =
    snap.phase === "done"
      ? "Done"
      : snap.phase === "queued"
        ? `Queued ${snap.total}`
        : `${snap.done}/${snap.total}`;
  return (
    <div className="mt-2">
      <div className="h-2 overflow-hidden rounded-full bg-elevated">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.max(snap.phase === "queued" ? 12 : 4, pct)}%` }} />
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}

function slotCount(kind: ImportKind, files: { role: string; count: number }[], pictures: { pda: number; item: number }) {
  const sum = (...roles: string[]) => files.filter((f) => roles.includes(f.role)).reduce((n, f) => n + (f.count || 1), 0);
  switch (kind) {
    case "scenario":
      return files.length;
    case "configs":
      return sum(
        "items",
        "blocks",
        "templates",
        "eclass",
        "tokens",
        "egroups",
        "reputation",
        "warfare",
        "galaxy",
        "factions",
        "containers",
        "lootgroups",
        "traders",
        "materials",
        "statuseffects",
        "globaldefs",
        "blockgroups",
        "blockshapes",
        "animations",
        "baiconfig",
        "ecf",
      );
    case "localization":
      return sum("localization");
    case "itemImages":
      return pictures.item;
    case "pdaImages":
      return pictures.pda;
    case "pdaYaml":
      return sum("pdaYaml");
    case "pdaCsv":
      return sum("pdaCsv");
    case "dialogues":
      return sum("dialogues");
    case "dialoguesCsv":
      return sum("dialoguesCsv");
    case "factions":
      return sum("factions");
    case "galaxy":
      return sum("galaxy");
    case "sectors":
      return sum("sectors");
    case "playfields":
      return sum("playfieldYaml", "playfield");
    case "blueprints":
      return sum("poi");
    default:
      return 0;
  }
}

export function ImportPage() {
  const catalog = usePdaStore((s) => s.catalog);
  const project = usePdaStore((s) => s.project);
  const ingest = usePdaStore((s) => s.ingestSources);
  const reset = usePdaStore((s) => s.reset);
  const clearImageSet = usePdaStore((s) => s.clearImageSet);
  const pdaPics = useMemo(
    () => catalog.entries.filter((e) => e.kind === "picture" && e.group !== "item").length,
    [catalog.entries],
  );
  const itemPics = useMemo(
    () => catalog.entries.filter((e) => e.kind === "picture" && e.group === "item").length,
    [catalog.entries],
  );
  const resetAreas = useImportProgress((s) => s.reset);
  const tickArea = useImportProgress((s) => s.tick);
  const areas = useImportProgress((s) => s.areas);
  const [busy, setBusy] = useState<ImportKind | "tutorial" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doneAt, setDoneAt] = useState<string | null>(null);
  const detail = useBusyStore((s) => s.detail);
  const pct = useBusyStore((s) => s.pct);
  const loading = useBusyStore((s) => s.load);

  const run = useCallback(
    async (kind: ImportKind | "tutorial", work: () => Promise<string>) => {
      setBusy(kind);
      setError(null);
      setStatus(null);
      setDoneAt(null);
      beginBusy("load", "Starting import…");
      try {
        const message = await work();
        useImportProgress.getState().finish();
        setStatus(message);
        setDoneAt(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      } finally {
        endBusy("load");
        setBusy(null);
      }
    },
    [],
  );

  const ingestFiles = useCallback(
    async (kind: ImportKind, files: File[]) => {
      resetAreas(tallyAreas(files, kind));
      setBusyDetail(`Reading 0/${files.length} files…`, 2);
      const sources = await sourcesFromFiles(
        files,
        (done, total, path) => {
          setStatus(`Reading ${done}/${total} · ${path.split("/").pop()}`);
          setBusyDetail(
            `Reading ${done}/${total} · ${path.split("/").pop() || ""}`,
            Math.round((done / Math.max(1, total)) * 20),
          );
          if (kind === "scenario") {
            tickArea("scenario");
            const area = areaForRole(classifyScenarioPath(path, kind));
            if (area) tickArea(area);
          } else {
            tickArea(kind);
          }
        },
        kind,
      );
      if (!sources.length) throw new Error("Nothing in that drop matched this slot.");
      setBusyDetail("Indexing scenario…", 22);
      return ingest(kind, sources);
    },
    [ingest, resetAreas, tickArea],
  );

  return (
    <div className="app-shell flex min-h-dvh flex-col text-fg">
      <AppHeader />

      <main className="canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-medium text-2xl tracking-tight">Import page</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Drop a whole scenario, or fill slots one at a time. Configs, localization, images, dialogues, factions,
              GalaxyConfig, sectors, playfields, and blueprints merge in — they do not wipe the PDA you already have
              open.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href="/Axis-2026-Creator-Particlewave-Windows.zip" download>
                Download for Windows
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <a href="/Axis-2026-Creator-Particlewave-Linux.zip" download>
                Download for Linux
              </a>
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() =>
                void run("tutorial", async () => {
                  setStatus("Loading bundled tutorial…");
                  return ingest("scenario", await loadTutorialSources());
                })
              }
            >
              {busy === "tutorial" ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Load tutorial
            </Button>
          </div>
        </div>

        <LoadedStrip />

        <div
          className="mb-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void run("scenario", async () => ingestFiles("scenario", await filesFromDataTransfer(e.dataTransfer)));
          }}
        >
          <FileUp className="mb-1 inline size-4" /> Drop a scenario folder anywhere here to load everything at once.
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {IMPORT_SLOTS.map((slot) => (
            <SlotCard
              key={slot.id}
              kind={slot.id}
              title={slot.title}
              hint={slot.hint}
              accept={slot.accept}
              directory={slot.directory}
              loaded={slotCount(slot.id, catalog.files, { pda: pdaPics, item: itemPics })}
              busy={busy === slot.id || (busy === "scenario" && Boolean(areas[slot.id]))}
              disabled={busy !== null}
              progress={areas[slot.id]}
              onFiles={(files) => void run(slot.id, () => ingestFiles(slot.id, files))}
            />
          ))}
        </div>

        {busy || loading ? (
          <div className="mt-4 rounded-md border border-accent/40 bg-surface px-4 py-3">
            <p className="text-sm text-fg">{detail || status || "Working…"}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-elevated">
              <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${Math.max(4, Math.min(100, pct ?? 8))}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">Stay on this page. A full scenario can take a few minutes — this bar is the live step.</p>
          </div>
        ) : null}
        {!busy && !loading && status ? (
          <p className="mt-4 rounded-md border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
            Done{doneAt ? ` at ${doneAt}` : ""}. {status}
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="secondary" disabled={busy !== null} onClick={() => void clearImageSet("pda")}>
            <Trash2 className="size-4" /> Clear PDA images
          </Button>
          <Button variant="secondary" disabled={busy !== null} onClick={() => void clearImageSet("item")}>
            <Trash2 className="size-4" /> Clear item images
          </Button>
          <Button variant="ghost" disabled={busy !== null} onClick={() => reset()}>
            Reset workshop
          </Button>
        </div>
      </main>
    </div>
  );
}

function LoadedStrip() {
  const catalog = usePdaStore((s) => s.catalog);
  const project = usePdaStore((s) => s.project);
  const n = catalogCounts(catalog);
  const pics = catalog.entries.filter((e) => e.kind === "picture");
  const pdaPics = pics.filter((e) => e.group !== "item").length;
  const itemPics = pics.filter((e) => e.group === "item").length;
  return (
    <div className="mb-4 grid gap-2 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4">
      <Stat label="PDA" value={`${project.chapters.length} chapters`} />
      <Stat label="CSV keys" value={String(Object.keys(project.csv.rows).length)} />
      <Stat
        label="Catalog"
        value={
          catalogLoaded(catalog)
            ? `${n.item} items · ${n.entity} NPCs · ${n.playfield} playfields · ${n.poi} POIs`
            : "Empty"
        }
      />
      <Stat label="Images" value={`${pdaPics} PDA · ${itemPics} item`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function SlotCard(props: {
  kind: ImportKind;
  title: string;
  hint: string;
  accept: string;
  directory?: boolean;
  loaded: number;
  busy: boolean;
  disabled: boolean;
  progress?: AreaSnap;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || !props.directory) return;
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
  }, [props.directory]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void filesFromDataTransfer(e.dataTransfer).then(props.onFiles);
      }}
      className={`flex min-h-24 cursor-pointer items-center gap-4 rounded-md border px-4 py-3 text-left transition-[box-shadow,background-color] duration-150 ${
        drag ? "border-accent bg-elevated" : "border-border bg-surface hover:bg-elevated/70"
      } ${props.disabled && !props.progress ? "pointer-events-none opacity-40" : props.disabled ? "pointer-events-none" : ""}`}
    >
      <span className="text-accent">{ICONS[props.kind]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{props.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{props.hint}</p>
        <AreaBar snap={props.progress} />
      </div>
      {props.busy && !props.progress ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin text-muted" />
      ) : props.progress?.phase === "done" ? (
        <span className="shrink-0 rounded-sm bg-ok/15 px-1.5 py-0.5 text-xs text-ok">Done</span>
      ) : props.loaded ? (
        <span className="shrink-0 rounded-sm bg-ok/15 px-1.5 py-0.5 text-xs text-ok">{props.loaded} loaded</span>
      ) : (
        <span className="shrink-0 text-xs text-subtle">Empty</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={props.accept || undefined}
        multiple
        className="hidden"
        onChange={(e) => {
          const list = e.target.files;
          if (list?.length) props.onFiles([...list]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

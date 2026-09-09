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
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { filesFromDataTransfer, loadTutorialSources, sourcesFromFiles } from "@/lib/pda/folder-files.ts";
import { IMPORT_SLOTS, type ImportKind } from "@/lib/pda/import-kinds.ts";
import { catalogCounts, catalogLoaded } from "@/lib/pda/scenario-index.ts";
import { usePdaStore } from "@/store/pda-store.ts";

const ICONS: Record<ImportKind, ReactNode> = {
  scenario: <FolderOpen className="size-5" />,
  configs: <Package className="size-5" />,
  localization: <ScrollText className="size-5" />,
  itemImages: <Box className="size-5" />,
  pdaImages: <ImageIcon className="size-5" />,
  pdaYaml: <FileJson className="size-5" />,
  pdaCsv: <FileSpreadsheet className="size-5" />,
  dialogues: <MessageSquare className="size-5" />,
  factions: <Landmark className="size-5" />,
  sectors: <Map className="size-5" />,
  playfields: <Map className="size-5" />,
  blueprints: <Box className="size-5" />,
};

function slotCount(kind: ImportKind, files: { role: string; count: number }[], pictures: { pda: number; item: number }) {
  const sum = (...roles: string[]) => files.filter((f) => roles.includes(f.role)).reduce((n, f) => n + (f.count || 1), 0);
  switch (kind) {
    case "scenario":
      return files.length;
    case "configs":
      return sum("items", "blocks", "eclass", "tokens", "egroups", "ecf");
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
    case "factions":
      return sum("factions");
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
  const pdaPics = catalog.entries.filter((e) => e.kind === "picture" && e.group !== "item").length;
  const itemPics = catalog.entries.filter((e) => e.kind === "picture" && e.group === "item").length;
  const [busy, setBusy] = useState<ImportKind | "tutorial" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (kind: ImportKind | "tutorial", work: () => Promise<string>) => {
      setBusy(kind);
      setError(null);
      setStatus(null);
      try {
        const message = await work();
        setStatus(message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const ingestFiles = useCallback(
    async (kind: ImportKind, files: File[]) => {
      const sources = await sourcesFromFiles(
        files,
        (done, total, path) => setStatus(`Reading ${done}/${total} · ${path.split("/").pop()}`),
        kind,
      );
      if (!sources.length) throw new Error("Nothing in that drop matched this slot.");
      return ingest(kind, sources);
    },
    [ingest],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <AppHeader />

      <main className="canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-medium text-2xl tracking-tight">Import page</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Drop a whole scenario, or fill slots one at a time. Configs, localization, images, dialogues, factions,
              sectors, playfields, and blueprints merge in — they do not wipe the PDA you already have open.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href="/Axis-2026-Creator-Particlewave-Windows.zip" download>
                Download for Windows
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
              busy={busy === slot.id}
              disabled={busy !== null}
              onFiles={(files) => void run(slot.id, () => ingestFiles(slot.id, files))}
            />
          ))}
        </div>

        {status ? <p className="mt-4 text-sm text-ok">{status}</p> : null}
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
      } ${props.disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <span className="text-accent">{ICONS[props.kind]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{props.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{props.hint}</p>
      </div>
      {props.busy ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin text-muted" />
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

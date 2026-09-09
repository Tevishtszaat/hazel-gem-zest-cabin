import { FileUp, FolderOpen, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { filesFromDataTransfer, loadTutorialSources, sourcesFromFiles } from "@/lib/pda/folder-files.ts";
import { catalogCounts } from "@/lib/pda/scenario-index.ts";
import { usePdaStore } from "@/store/pda-store.ts";

async function readPair(fileList: FileList | File[]) {
  const files = [...fileList];
  let yamlText = "";
  let yamlName = "";
  let csvText = "";
  let csvName = "";
  for (const file of files) {
    const text = await file.text();
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv") || name.includes("pda.csv")) {
      csvText = text;
      csvName = file.name;
    } else if (name.endsWith(".yaml") || name.endsWith(".yml") || name.includes("pda.yaml")) {
      yamlText = text;
      yamlName = file.name;
    } else if (!yamlText) {
      yamlText = text;
      yamlName = file.name;
    }
  }
  if (!yamlText) throw new Error("Drop a PDA.yaml (and optionally PDA.csv), or a whole scenario folder.");
  return { yamlText, yamlName, csvText, csvName };
}

function looksLikeFolder(files: File[]) {
  return files.some((file) => {
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";
    return rel.includes("/") || rel.includes("\\");
  });
}

export function ImportDialog() {
  const open = usePdaStore((s) => s.importOpen);
  const setOpen = usePdaStore((s) => s.setImportOpen);
  const importFiles = usePdaStore((s) => s.importFiles);
  const importScenario = usePdaStore((s) => s.importScenario);
  const reset = usePdaStore((s) => s.reset);
  const folderRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    const el = folderRef.current;
    if (!el) return;
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
  }, [open]);

  const run = useCallback(
    async (work: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      setProgress(null);
      try {
        await work();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [setOpen],
  );

  const ingestFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) throw new Error("No files selected.");
      if (looksLikeFolder(files) || files.length > 4) {
        const sources = await sourcesFromFiles(files, (done, total, path) => {
          setProgress(`Reading ${done}/${total} · ${path.split("/").pop()}`);
        });
        if (!sources.length) throw new Error("That folder had no PDA, ECF, sectors, or prefab files.");
        importScenario(sources);
        const catalog = usePdaStore.getState().catalog;
        const n = catalogCounts(catalog);
        setProgress(
          `${catalog.folderName || "Scenario"} · ${n.item} items · ${n.block} blocks · ${n.playfield} playfields · ${n.poi} POIs`,
        );
        return;
      }
      importFiles(await readPair(files));
    },
    [importFiles, importScenario],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-2xl">
        <h2 className="font-medium text-lg tracking-tight">Load a scenario</h2>
        <p className="mt-1 text-sm text-muted">
          Drop the whole scenario folder — Axis indexes <span className="text-fg">PDA.yaml</span>,{" "}
          <span className="text-fg">PDA.csv</span>, Items/Blocks/EClass/Factions/Dialogues ECF, Localization.csv,
          Sectors.yaml, playfields, and <span className="text-fg">.epb</span> prefabs so Names, Types, and rewards can
          autocomplete against real data.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void run(async () => {
              const files = await filesFromDataTransfer(e.dataTransfer);
              await ingestFiles(files);
            });
          }}
          className={`mt-4 grid cursor-pointer place-items-center rounded-lg border border-dashed px-4 py-10 text-center text-sm ${
            drag ? "border-accent text-fg" : "border-border text-muted"
          }`}
        >
          <FileUp className="mb-2 size-5" />
          Drop a scenario folder, or YAML + CSV
          <input
            type="file"
            accept=".yaml,.yml,.csv,.txt,.ecf"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              void run(async () => ingestFiles([...list]));
            }}
          />
        </label>

        {progress ? <p className="mt-3 text-xs text-muted">{progress}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => folderRef.current?.click()}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <FolderOpen className="size-4" />}
            Choose folder
          </Button>
          <input
            ref={folderRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              void run(async () => ingestFiles([...list]));
              e.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                setProgress("Loading bundled tutorial + configs…");
                importScenario(await loadTutorialSources());
              })
            }
          >
            Load tutorial scenario
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => reset()}>
            Start empty
          </Button>
          <Button variant="ghost" className="ml-auto" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Choose folder walks Configuration, Extras/PDA, Sectors, Playfields, and Prefabs. Binary blueprints are indexed
          by filename only.
        </p>
      </div>
    </div>
  );
}

import { FileUp, FolderOpen, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { ImportProgressPanel } from "@/components/import/import-progress-panel.tsx";
import { filesFromDataTransfer, loadTutorialSources, sourcesFromFiles } from "@/lib/pda/folder-files.ts";
import { areaForRole, fileMatchesKind } from "@/lib/pda/import-kinds.ts";
import { classifyScenarioPath } from "@/lib/pda/scenario-index.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { useImportProgress } from "@/store/import-progress.ts";

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

function tallyScenario(files: File[]) {
  const totals: Partial<Record<string, number>> = {};
  for (const file of files) {
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    if (!fileMatchesKind(path, "scenario")) continue;
    totals.scenario = (totals.scenario || 0) + 1;
    const area = areaForRole(classifyScenarioPath(path, "scenario"));
    if (area) totals[area] = (totals[area] || 0) + 1;
  }
  return totals;
}

export function ImportDialog() {
  const open = usePdaStore((s) => s.importOpen);
  const setOpen = usePdaStore((s) => s.setImportOpen);
  const importFiles = usePdaStore((s) => s.importFiles);
  const ingest = usePdaStore((s) => s.ingestSources);
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
        useImportProgress.getState().finish();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const ingestFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) throw new Error("No files selected.");
      if (looksLikeFolder(files) || files.length > 4) {
        const totals = tallyScenario(files);
        useImportProgress.getState().reset(totals);
        const sources = await sourcesFromFiles(
          files,
          (done, total, path) => {
            setProgress(`Reading ${done}/${total} · ${path.split("/").pop()}`);
            const prog = useImportProgress.getState();
            prog.tick("scenario");
            const area = areaForRole(classifyScenarioPath(path, "scenario"));
            if (area) prog.tick(area);
          },
          "scenario",
        );
        if (!sources.length) throw new Error("That folder had no PDA, ECF, sectors, or prefab files.");
        const message = await ingest("scenario", sources);
        setProgress(message);
        return;
      }
      importFiles(await readPair(files));
    },
    [importFiles, ingest],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-surface p-5 shadow-2xl">
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

        {busy ? <div className="mt-4"><ImportProgressPanel /></div> : null}
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
                await ingest("scenario", await loadTutorialSources());
              })
            }
          >
            Load tutorial scenario
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => reset()}>
            Start empty
          </Button>
          <Button variant="ghost" className="ml-auto" disabled={busy} onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Choose folder walks Configuration, Extras/PDA, Sectors, Playfields, and Prefabs. Bars below fill per area —
          wait until they turn green.
        </p>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { downloadText, exportSlots } from "@/lib/pda/export-files.ts";
import { usePdaStore } from "@/store/pda-store.ts";

export function ExportPage() {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const slots = useMemo(() => exportSlots(project, catalog), [project, catalog]);
  const [picked, setPicked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(slots.filter((s) => s.ready).map((s) => [s.id, true])),
  );

  const selected = slots.filter((s) => s.ready && picked[s.id]);

  const downloadOne = (id: string) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot?.ready) return;
    downloadText(slot.filename, slot.build(), slot.mime);
  };

  const downloadSelected = () => {
    for (const slot of selected) downloadText(slot.filename, slot.build(), slot.mime);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <AppHeader />
      <main className="canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-medium text-2xl tracking-tight">Export</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Download the files this workshop can edit. Drop them back into the scenario folder, replacing the
              originals.
            </p>
          </div>
          <Button disabled={!selected.length} onClick={downloadSelected}>
            Download selected ({selected.length})
          </Button>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot) => (
            <li key={slot.id} className="rounded-md border border-border bg-surface p-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  disabled={!slot.ready}
                  checked={Boolean(picked[slot.id]) && slot.ready}
                  onChange={(e) => setPicked((p) => ({ ...p, [slot.id]: e.target.checked }))}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{slot.label}</p>
                  <p className="mt-0.5 text-xs text-subtle">{slot.filename}</p>
                  <p className={`mt-1 text-xs ${slot.ready ? "text-muted" : "text-warn"}`}>{slot.detail}</p>
                </div>
                <Button size="sm" variant="secondary" disabled={!slot.ready} onClick={() => downloadOne(slot.id)}>
                  Download
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

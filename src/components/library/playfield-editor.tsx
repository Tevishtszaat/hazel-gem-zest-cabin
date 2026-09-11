import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  bundlePlayfields,
  keysForKind,
  kindLabel,
  patchYamlField,
  variantLabel,
  type PlayfieldKind,
} from "@/lib/pda/playfield.ts";
import { usePdaStore } from "@/store/pda-store.ts";

const KINDS: PlayfieldKind[] = ["planet", "moon", "orbit", "space", "unknown"];

export function PlayfieldEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const bundles = useMemo(
    () => bundlePlayfields(catalog.texts ?? []),
    [catalog.texts],
  );
  const [kind, setKind] = useState<"all" | PlayfieldKind>("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const visible = bundles.filter((bundle) => {
    if (kind !== "all" && bundle.kind !== kind) return false;
    if (!query.trim()) return true;
    return `${bundle.name} ${bundle.kind} ${bundle.files.map((f) => f.variant).join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });
  const selected = visible.find((b) => b.folder === picked) ?? visible[0];
  const current = selected?.files.find((f) => f.path === filePath) ?? selected?.files[0];

  const persist = (path: string, text: string) => setCatalogText("playfieldYaml", text, path);

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <p className="text-xs uppercase tracking-[0.14em] text-accent">Playfields</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter planet, orbit, space…"
            className="mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              className={`rounded-sm px-2 py-1 text-xs ${kind === "all" ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`}
              onClick={() => setKind("all")}
            >
              All ({bundles.length})
            </button>
            {KINDS.map((id) => {
              const n = bundles.filter((b) => b.kind === id).length;
              if (!n) return null;
              return (
                <button
                  key={id}
                  className={`rounded-sm px-2 py-1 text-xs ${kind === id ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`}
                  onClick={() => setKind(id)}
                >
                  {kindLabel(id)} ({n})
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
          {!visible.length ? (
            <p className="p-4 text-sm text-muted">
              Import the scenario Playfields folder. Planets use playfield.yaml or static/dynamic pairs. Orbits often
              only have playfield_dynamic.yaml. Open space uses space_dynamic.yaml.
            </p>
          ) : (
            visible.map((bundle) => (
              <button
                key={bundle.folder}
                onClick={() => {
                  setPicked(bundle.folder);
                  setFilePath(bundle.files[0]?.path ?? null);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  selected?.folder === bundle.folder ? "bg-elevated" : "hover:bg-elevated/50"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{bundle.name}</span>
                <span className="shrink-0 text-xs text-subtle">{kindLabel(bundle.kind)}</span>
              </button>
            ))
          )}
          </ScrollArea>
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-6">
        {selected && current ? (
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.14em] text-accent">{kindLabel(selected.kind)}</p>
            <h2 className="mt-1 text-xl font-medium tracking-tight">{selected.name}</h2>
            <p className="mt-1 text-xs text-subtle">
              {selected.kind === "planet" || selected.kind === "moon"
                ? "Planet/moon yaml: gravity, atmosphere, biome, temperatures."
                : selected.kind === "orbit"
                  ? "Orbit yaml: space playfield that wraps a planet. Usually playfield_dynamic.yaml."
                  : "Space sector yaml: open space / warp pocket. Usually space_dynamic.yaml."}
            </p>
            {selected.files.length > 1 ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {selected.files.map((file) => (
                  <button
                    key={file.path}
                    className={`rounded-sm border px-2 py-1 text-xs ${
                      current.path === file.path ? "border-accent bg-elevated" : "border-border text-muted hover:text-fg"
                    }`}
                    onClick={() => setFilePath(file.path)}
                  >
                    {variantLabel(file.variant)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-subtle">{variantLabel(current.variant)}</p>
            )}
            <Separator className="my-4" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {keysForKind(selected.kind).map((key) => (
                <label key={key} className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.12em] text-muted">{key}</span>
                  {key === "Description" ? (
                    <Textarea
                      rows={3}
                      value={current.fields[key] ?? ""}
                      onChange={(e) => persist(current.path, patchYamlField(current.text, key, e.target.value))}
                    />
                  ) : (
                    <Input
                      value={current.fields[key] ?? ""}
                      onChange={(e) => persist(current.path, patchYamlField(current.text, key, e.target.value))}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Raw {variantLabel(current.variant)}</p>
              <Textarea
                className="mt-2 min-h-64 font-mono text-xs"
                value={current.text}
                onChange={(e) => persist(current.path, e.target.value)}
              />
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const blob = new Blob([current.text], { type: "text/yaml;charset=utf-8" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = current.path.split(/[/\\]/).pop() || "playfield.yaml";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                Download this file
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Select a playfield.</p>
        )}
      </section>
    </div>
  );
}

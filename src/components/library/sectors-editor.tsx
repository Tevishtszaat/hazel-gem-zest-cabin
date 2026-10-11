import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { isStarType, starZoneSpans } from "@/lib/pda/galaxy.ts";
import { catalogText, objectsFor } from "@/lib/pda/library.ts";
import {
  addPlayfield,
  parseVolumeSystems,
  patchPlayfield,
  patchSystemCoordinates,
  patchSystemStarClass,
  readGalaxyVolume,
  removePlayfield,
  type VolumeBody,
  type VolumeSystem,
} from "@/lib/pda/volume.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { VolumeViewport } from "./volume-view.tsx";

export function SectorsEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const file = catalogText(catalog, "sectors");
  const yaml = file?.text || "";
  const systems = useMemo(() => parseVolumeSystems(yaml), [yaml]);
  const galaxy = useMemo(() => {
    const objects = objectsFor(catalog, "galaxy");
    const general = objects.find((obj) => /galaxyconfig/i.test(obj.kind) && /^general$/i.test(obj.name)) ?? null;
    return readGalaxyVolume(general);
  }, [catalog]);
  const stars = useMemo(() => objectsFor(catalog, "galaxy").filter(isStarType), [catalog]);
  const [query, setQuery] = useState("");
  const [space, setSpace] = useState<"galaxy" | "system">("galaxy");
  const [systemName, setSystemName] = useState("");
  const [bodyName, setBodyName] = useState("");
  const [rawOpen, setRawOpen] = useState(false);
  const [rawDraft, setRawDraft] = useState<string | null>(null);
  const system = systems.find((item) => item.name === systemName) ?? null;
  const shown = systems
    .filter((item) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.starClass.toLowerCase().includes(q) || item.bodies.some((body) => body.name.toLowerCase().includes(q));
    })
    .slice(0, 300);
  const star = stars.find((item) => (item.fields.StarClass || "").toLowerCase() === (system?.starClass || "").toLowerCase());
  const zones = star ? starZoneSpans(star) : [];

  function save(next: string) {
    setCatalogText("sectors", next, file?.path || "Sectors.yaml");
  }
  function openSystem(name: string, body?: string) {
    setSystemName(name);
    setBodyName(body || "");
    setSpace("system");
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-3">
          <p className="text-xs text-subtle">
            {systems.length} systems · {systems.reduce((n, item) => n + item.bodies.length, 0)} playfields
          </p>
          <Input className="mt-2 h-8" placeholder="Find a star, planet, or moon" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {shown.map((item) => (
            <button
              key={`${item.blockStart}-${item.name}`}
              className={`block w-full border-b border-border px-3 py-2 text-left hover:bg-surface ${item.name === systemName ? "bg-surface" : ""}`}
              onClick={() => openSystem(item.name)}
            >
              <span className="block text-sm">{item.name}</span>
              <span className="text-[11px] text-subtle">
                {item.starClass || "no class"} · {item.ly.join(", ")} LY · {item.bodies.length} bodies
              </span>
            </button>
          ))}
          {!systems.length ? <p className="p-3 text-sm text-muted">Import Sectors.yaml. Each sector needs Coordinates in light years and a Playfields list.</p> : null}
        </div>
        {system ? (
          <SystemForm
            system={system}
            bodyName={bodyName}
            onBody={setBodyName}
            onSave={save}
            yaml={yaml}
          />
        ) : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm">
          <button className="text-muted hover:text-fg" onClick={() => { setSpace("galaxy"); setBodyName(""); }}>
            Galaxy
          </button>
          {system ? (
            <>
              <span className="text-subtle">/</span>
              <button className="hover:text-fg" onClick={() => { setSpace("system"); setBodyName(""); }}>
                {system.name}
              </button>
            </>
          ) : null}
          {bodyName ? (
            <>
              <span className="text-subtle">/</span>
              <span>{bodyName}</span>
            </>
          ) : null}
          <Button className="ml-auto" size="sm" variant="secondary" onClick={() => setRawOpen((v) => !v)}>
            {rawOpen ? "Hide raw YAML" : "Raw YAML"}
          </Button>
        </div>
        <div className="min-h-0 flex-1 p-3">
          <VolumeViewport
            space={space}
            galaxy={galaxy}
            systems={systems}
            focusSystem={system?.name}
            focusBody={bodyName}
            zones={zones}
            onPick={(pick) => openSystem(pick.system, pick.body)}
          />
        </div>
        {rawOpen ? (
          <textarea
            className="h-48 shrink-0 border-t border-border bg-bg p-3 font-mono text-xs"
            value={rawDraft ?? yaml}
            onChange={(e) => setRawDraft(e.target.value)}
            onBlur={() => {
              if (rawDraft != null && rawDraft !== yaml) save(rawDraft);
              setRawDraft(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function SystemForm({
  system,
  bodyName,
  yaml,
  onBody,
  onSave,
}: {
  system: VolumeSystem;
  bodyName: string;
  yaml: string;
  onBody: (name: string) => void;
  onSave: (yaml: string) => void;
}) {
  const body = system.bodies.find((item) => item.name === bodyName) ?? null;
  return (
    <div className="max-h-[46%] overflow-auto border-t border-border p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{system.name}</p>
      <label className="mt-2 block text-xs text-subtle">
        Star class
        <Input className="mt-1 h-8" defaultValue={system.starClass} key={`${system.blockStart}-class`} onBlur={(e) => onSave(patchSystemStarClass(yaml, system, e.target.value))} />
      </label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(["X", "Y", "Z"] as const).map((axis, index) => (
          <label key={axis} className="text-xs text-subtle">
            {axis} LY
            <Input
              className="mt-1 h-8"
              defaultValue={String(system.ly[index])}
              key={`${system.blockStart}-${axis}`}
              onBlur={(e) => {
                const ly = [...system.ly] as [number, number, number];
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                ly[index] = n;
                onSave(patchSystemCoordinates(yaml, system, ly));
              }}
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-muted">Playfields</p>
        <Button
          className="ml-auto"
          size="sm"
          variant="secondary"
          onClick={() =>
            onSave(addPlayfield(yaml, system, { local: [100, 0, 0], name: "New body", kind: "Planet", playfieldType: "Temperate" }))
          }
        >
          Add
        </Button>
      </div>
      <ul className="mt-2 space-y-1">
        {system.bodies.map((item) => (
          <li key={item.line}>
            <button className={`w-full rounded-sm px-2 py-1 text-left text-xs ${item.name === bodyName ? "bg-surface text-fg" : "text-muted"}`} onClick={() => onBody(item.name)}>
              {item.name} · {item.kind} · {item.local.join(", ")}
            </button>
          </li>
        ))}
      </ul>
      {body ? <BodyForm yaml={yaml} body={body} onSave={onSave} /> : null}
    </div>
  );
}

function BodyForm({ yaml, body, onSave }: { yaml: string; body: VolumeBody; onSave: (yaml: string) => void }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {(["name", "kind", "playfieldType"] as const).map((key) => (
        <label key={key} className="text-xs text-subtle">
          {key === "playfieldType" ? "Type" : key}
          <Input
            className="mt-1 h-8"
            defaultValue={body[key] || ""}
            key={`${body.line}-${key}`}
            onBlur={(e) => onSave(patchPlayfield(yaml, body, { ...body, [key]: e.target.value }))}
          />
        </label>
      ))}
      {([0, 1, 2] as const).map((index) => (
        <label key={index} className="text-xs text-subtle">
          {["X", "Y", "Z"][index]} sec
          <Input
            className="mt-1 h-8"
            defaultValue={String(body.local[index])}
            key={`${body.line}-p${index}`}
            onBlur={(e) => {
              const local = [...body.local] as [number, number, number];
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              local[index] = n;
              onSave(patchPlayfield(yaml, body, { ...body, local }));
            }}
          />
        </label>
      ))}
      <Button className="col-span-2" size="sm" variant="ghost" onClick={() => onSave(removePlayfield(yaml, body))}>
        Remove playfield
      </Button>
    </div>
  );
}

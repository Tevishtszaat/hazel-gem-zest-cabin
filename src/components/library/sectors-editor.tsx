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
  STAR_CLASS_LEGEND,
  starTint,
  type GalaxyVolume,
  type VolumeBody,
  type VolumeSystem,
} from "@/lib/pda/volume.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { VolumeViewport, ZONE_FALLBACK, type ZoneRing } from "./volume-view.tsx";

const BODY_GROUPS = ["Suns", "Planets", "Moons", "Orbits", "Other"] as const;

function bodyGroup(kind: string, name = "", playfieldType = "") {
  const text = `${kind} ${name} ${playfieldType}`;
  if (/moon/i.test(text)) return "Moons";
  if (/\b(sun|star)\b/i.test(text)) return "Suns";
  if (/orbit/i.test(text)) return "Orbits";
  if (/space|warp|station|asteroid/i.test(text)) return "Other";
  if (/planet/i.test(text) || (playfieldType && !/space|orbit|sun/i.test(playfieldType)) || (kind && !/playfield/i.test(kind) && !/space|orbit|sun|warp/i.test(kind))) return "Planets";
  return "Other";
}

function bodyCounts(system: VolumeSystem) {
  let planets = 0;
  let moons = 0;
  for (const body of system.bodies) {
    if (/moon/i.test(`${body.kind} ${body.name}`)) moons += 1;
    else if (bodyGroup(body.kind, body.name, body.playfieldType) === "Planets") planets += 1;
  }
  return { planets, moons };
}

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
  const [group, setGroup] = useState<(typeof BODY_GROUPS)[number] | "All">("All");
  const [rawOpen, setRawOpen] = useState(false);
  const [rawDraft, setRawDraft] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const system = systems.find((item) => item.name === systemName) ?? null;
  const shown = systems
    .filter((item) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.starClass.toLowerCase().includes(q) || item.bodies.some((body) => body.name.toLowerCase().includes(q) || body.kind.toLowerCase().includes(q));
    })
    .slice(0, 300);
  const star = stars.find((item) => (item.fields.StarClass || "").toLowerCase() === (system?.starClass || "").toLowerCase());
  const zones = star ? starZoneSpans(star) : [];
  const body = system?.bodies.find((item) => item.name === bodyName) ?? null;

  function save(next: string) {
    setCatalogText("sectors", next, file?.path || "Sectors.yaml");
  }
  function openSystem(name: string, body?: string) {
    setSystemName(name);
    setBodyName(body || "");
    setSpace("system");
    if (body) {
      const found = systems.find((item) => item.name === name)?.bodies.find((item) => item.name === body);
      if (found) setGroup(bodyGroup(found.kind, found.name, found.playfieldType));
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-3">
          <p className="text-xs text-subtle">
            {systems.length} systems · {systems.reduce((n, item) => n + item.bodies.length, 0)} playfields
          </p>
          <Input className="mt-2 h-8" placeholder="Find a star, planet, or moon" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {shown.map((item) => {
            const counts = bodyCounts(item);
            return (
              <button
                key={`${item.blockStart}-${item.name}`}
                className={`block w-full border-b border-border px-3 py-2 text-left hover:bg-surface ${item.name === systemName ? "bg-surface" : ""}`}
                onClick={() => openSystem(item.name)}
              >
                <span className="block text-sm">{item.name}</span>
                <span className="text-[11px] text-subtle">
                  {item.starClass || "no class"} · {counts.planets} planets · {counts.moons} moons
                </span>
              </button>
            );
          })}
          {!systems.length ? <p className="p-3 text-sm text-muted">Import Sectors.yaml. Each sector needs Coordinates in light years and a Playfields list.</p> : null}
        </div>
      </aside>
      {system ? (
        <BodyList
          system={system}
          yaml={yaml}
          bodyName={bodyName}
          group={group}
          onGroup={setGroup}
          onBody={(name) => openSystem(system.name, name)}
          onSave={save}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm">
          <button className={space === "galaxy" ? "text-fg" : "text-muted hover:text-fg"} onClick={() => { setSpace("galaxy"); setBodyName(""); }}>
            Galaxy
          </button>
          {system ? (
            <>
              <span className="text-subtle">/</span>
              <button className={space === "system" && !bodyName ? "text-fg" : "text-muted hover:text-fg"} onClick={() => { setSpace("system"); setBodyName(""); }}>
                {system.name}
              </button>
            </>
          ) : null}
          {body ? (
            <>
              <span className="text-subtle">/</span>
              <span>
                {body.name}
                <span className="ml-2 text-xs text-subtle">{body.kind}</span>
              </span>
            </>
          ) : null}
          <Button className="ml-auto" size="sm" variant="secondary" onClick={() => setRawOpen((v) => !v)}>
            {rawOpen ? "Hide raw YAML" : "Raw YAML"}
          </Button>
        </div>
        <div className="relative min-h-0 flex-1 p-3">
          <VolumeViewport
            space={space}
            layer="galaxy"
            galaxy={galaxy}
            systems={systems}
            focusSystem={system?.name}
            focusBody={bodyName}
            zones={zones}
            hidden={hidden}
            onPick={(pick) => openSystem(pick.system, pick.body)}
          />
          <SectorLegend
            space={space}
            galaxy={galaxy}
            system={system}
            zones={zones}
            hidden={hidden}
            onChange={setHidden}
          />
        </div>
        {system && space === "system" ? (
          <div className="max-h-[42%] shrink-0 overflow-auto border-t border-border p-3">
            {body ? <BodyForm yaml={yaml} body={body} onSave={save} /> : <p className="text-sm text-muted">Pick a planet, moon, or other playfield. Drag the view, or click a body in the volume.</p>}
          </div>
        ) : null}
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

function BodyList({
  system,
  yaml,
  bodyName,
  group,
  onGroup,
  onBody,
  onSave,
}: {
  system: VolumeSystem;
  yaml: string;
  bodyName: string;
  group: (typeof BODY_GROUPS)[number] | "All";
  onGroup: (group: (typeof BODY_GROUPS)[number] | "All") => void;
  onBody: (name: string) => void;
  onSave: (yaml: string) => void;
}) {
  const counts = bodyCounts(system);
  const listed = system.bodies.filter((item) => group === "All" || bodyGroup(item.kind, item.name, item.playfieldType) === group);
  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-border">
      <div className="border-b border-border p-3">
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
        <p className="mt-2 text-[11px] text-subtle">
          {counts.planets} planets · {counts.moons} moons · {system.bodies.length} playfields
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {(["All", ...BODY_GROUPS] as const).map((name) => (
            <button
              key={name}
              className={`rounded-sm border px-2 py-0.5 text-[11px] ${group === name ? "border-accent text-fg" : "border-border text-muted"}`}
              onClick={() => onGroup(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <Button
          className="mt-2"
          size="sm"
          variant="secondary"
          onClick={() => onSave(addPlayfield(yaml, system, { local: [100, 0, 0], name: "New body", kind: group === "Moons" ? "Moon" : group === "Orbits" ? "Orbit" : "Planet", playfieldType: "Temperate" }))}
        >
          Add {group === "Moons" ? "moon" : group === "Orbits" ? "orbit" : "planet"}
        </Button>
      </div>
      <ul className="min-h-0 flex-1 overflow-auto">
        {listed.map((item) => (
          <li key={item.line}>
            <button className={`block w-full border-b border-border px-3 py-2 text-left ${item.name === bodyName ? "bg-surface" : "hover:bg-surface"}`} onClick={() => onBody(item.name)}>
              <span className="block text-sm">{item.name}</span>
              <span className="text-[11px] text-subtle">
                {item.kind}
                {item.playfieldType ? ` · ${item.playfieldType}` : ""} · {Math.round(Math.hypot(item.local[0], item.local[1], item.local[2]))} sec
              </span>
            </button>
          </li>
        ))}
        {!listed.length ? <li className="p-3 text-xs text-subtle">Nothing in {group}.</li> : null}
      </ul>
    </aside>
  );
}

function BodyForm({ yaml, body, onSave }: { yaml: string; body: VolumeBody; onSave: (yaml: string) => void }) {
  const distance = Math.round(Math.hypot(body.local[0], body.local[1], body.local[2]));
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">
        {bodyGroup(body.kind, body.name, body.playfieldType)} · {distance} sec from the star
        {body.coordLine != null ? " · Coordinates entry" : ""}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-6">
        {(["name", "kind", "playfieldType"] as const).map((key) => (
          <label key={key} className="text-xs text-subtle md:col-span-2">
            {key === "playfieldType" ? "Playfield type" : key === "kind" ? "Kind" : "Name"}
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
      </div>
      <p className="mt-2 text-[11px] text-subtle">Local position is in sectors from the star. 10 sectors is about 1 AU. Kind is Planet, Moon, Sun, Orbit, or Space.</p>
      <Button className="mt-2" size="sm" variant="ghost" onClick={() => onSave(removePlayfield(yaml, body))}>
        Remove this body
      </Button>
    </div>
  );
}

function LegendRow({
  id,
  color,
  ring,
  label,
  detail,
  hidden,
  onToggle,
  onOnly,
}: {
  id: string;
  color: string;
  ring?: boolean;
  label: string;
  detail?: string;
  hidden: boolean;
  onToggle: (id: string) => void;
  onOnly: (id: string) => void;
}) {
  return (
    <li className={`flex items-start gap-2 text-xs ${hidden ? "opacity-35" : ""}`}>
      <button type="button" className="flex min-w-0 flex-1 items-start gap-2 text-left" onClick={() => onToggle(id)}>
        <span className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border" style={{ background: ring ? "transparent" : color, borderColor: color }} />
        <span className="min-w-0">
          <span className="block truncate">{label}</span>
          {detail ? <span className="text-[10px] text-subtle">{detail}</span> : null}
        </span>
      </button>
      <button type="button" className="shrink-0 text-[10px] uppercase tracking-wide text-subtle hover:text-fg" onClick={() => onOnly(id)}>
        Only
      </button>
    </li>
  );
}

function SectorLegend({
  space,
  galaxy,
  system,
  zones,
  hidden,
  onChange,
}: {
  space: "galaxy" | "system";
  galaxy: GalaxyVolume;
  system: VolumeSystem | null;
  zones: ZoneRing[];
  hidden: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const rings = zones.length ? zones : ZONE_FALLBACK;
  const ids =
    space === "system"
      ? ["kind:sun", "kind:planet", "kind:moon", "kind:other", "path:orbit", ...rings.map((zone) => `zone:${zone.label}`)]
      : ["radius:outer", ...(galaxy.inner > 1 ? ["radius:inner"] : []), ...STAR_CLASS_LEGEND.map((item) => item.id)];
  const shown = ids.filter((id) => !hidden.has(id)).length;
  const toggle = (id: string) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };
  const only = (id: string) => {
    const next = new Set(hidden);
    for (const item of ids) {
      if (item === id) next.delete(item);
      else next.add(item);
    }
    onChange(next);
  };
  const starColor = system ? starTint(system.starClass, system.color) : "#ffe29a";
  return (
    <aside className="absolute bottom-6 right-6 top-6 z-10 flex w-52 flex-col overflow-hidden rounded-md border border-border bg-surface/90">
      <div className="border-b border-border p-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Legend</p>
        <p className="mt-1 text-[10px] text-subtle">
          Showing {shown} of {ids.length}
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="h-7 rounded-sm border border-border px-2 text-xs"
            onClick={() => {
              const next = new Set(hidden);
              for (const id of ids) next.delete(id);
              onChange(next);
            }}
          >
            All
          </button>
          <button type="button" className="h-7 rounded-sm border border-border px-2 text-xs" onClick={() => onChange(new Set([...hidden, ...ids]))}>
            None
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {space === "system" ? (
          <ul className="space-y-1.5">
            <LegendRow id="kind:sun" color={starColor} label="Star" hidden={hidden.has("kind:sun")} onToggle={toggle} onOnly={only} />
            <LegendRow id="kind:planet" color="#8ec8ff" label="Planets" hidden={hidden.has("kind:planet")} onToggle={toggle} onOnly={only} />
            <LegendRow id="kind:moon" color="#d5d8e0" label="Moons" hidden={hidden.has("kind:moon")} onToggle={toggle} onOnly={only} />
            <LegendRow id="kind:other" color="#b9a6ff" label="Orbits and other" hidden={hidden.has("kind:other")} onToggle={toggle} onOnly={only} />
            <LegendRow id="path:orbit" ring color="rgba(180,198,230,0.9)" label="Orbit paths" hidden={hidden.has("path:orbit")} onToggle={toggle} onOnly={only} />
            {rings.map((zone) => (
              <LegendRow
                key={zone.label}
                id={`zone:${zone.label}`}
                ring
                color={zone.color}
                label={zone.label}
                detail={`${Math.round(zone.min)}–${Math.round(zone.max)} sec`}
                hidden={hidden.has(`zone:${zone.label}`)}
                onToggle={toggle}
                onOnly={only}
              />
            ))}
          </ul>
        ) : (
          <ul className="space-y-1.5">
            <LegendRow id="radius:outer" ring color="rgba(150,186,255,0.95)" label="Galaxy radius" hidden={hidden.has("radius:outer")} onToggle={toggle} onOnly={only} />
            {galaxy.inner > 1 ? (
              <LegendRow id="radius:inner" ring color="rgba(255,220,160,0.95)" label="Inner radius" hidden={hidden.has("radius:inner")} onToggle={toggle} onOnly={only} />
            ) : null}
            {STAR_CLASS_LEGEND.map((item) => (
              <LegendRow key={item.id} id={item.id} color={item.color} label={item.label} hidden={hidden.has(item.id)} onToggle={toggle} onOnly={only} />
            ))}
          </ul>
        )}
        {space === "system" && !zones.length ? <p className="mt-2 text-[10px] text-subtle">Zone rings are defaults until this star class is in GalaxyConfig.</p> : null}
      </div>
    </aside>
  );
}

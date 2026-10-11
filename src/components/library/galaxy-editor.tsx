import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { GalaxyStarChart } from "@/components/library/galaxy-chart.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FieldNote } from "@/components/ui/field-note.tsx";
import { Input } from "@/components/ui/input.tsx";
import { GALAXY_GENERAL_STATS, TERRITORY_STATS } from "@/lib/pda/config-stats.ts";
import { stringifyEcfObjects, type EcfObject } from "@/lib/pda/ecf.ts";
import { noteForField } from "@/lib/pda/field-notes.ts";
import { catalogText, objectsFor } from "@/lib/pda/library.ts";
import { applyOrbitFixes, parseSectorBodies, STAR_MODELS, STAR_REGION_STATS, STAR_STATS, fieldToHex, hexToField, isStarType, parseStarMix, writeStarMix, type StarMix } from "@/lib/pda/galaxy.ts";
import { VolumeViewport } from "@/components/library/volume-view.tsx";
import { parseVolumeSystems, readGalaxyVolume, STAR_CLASS_LEGEND, type GalaxyVolume } from "@/lib/pda/volume.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Field({ label, note, area, children }: { label: string; note?: string; area?: string; children: ReactNode }) {
  const text = note || noteForField(label, area);
  return (
    <label className="relative block space-y-1">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
        <FieldNote label={label} note={text} />
      </span>
      {children}
    </label>
  );
}

export function GalaxyEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const objects = useMemo(() => objectsFor(catalog, "galaxy"), [catalog]);
  const persist = (next: EcfObject[]) => {
    setCatalogText("galaxy", stringifyEcfObjects(next), catalogText(catalog, "galaxy")?.path || "GalaxyConfig.ecf");
  };
  const fileName = catalogText(catalog, "galaxy")?.path.split(/[\\/]/).pop() || "GalaxyConfig.ecf";
  const sectorText = catalogText(catalog, "sectors");
  const bodies = useMemo(() => parseSectorBodies(sectorText?.text || ""), [sectorText?.text]);

  const general =
    objects.find((o) => /galaxyconfig/i.test(o.kind) && /^general$/i.test(o.name)) ??
    objects.find((o) => /galaxyconfig/i.test(o.kind) && !isStarType(o)) ??
    null;
  const generalIndex = general ? objects.indexOf(general) : -1;
  const children = general?.children ?? [];
  const territories = children.filter((c) => /territory/i.test(c.name));
  const regions = children.filter((c) => /starregion/i.test(c.name));
  const stars = objects.filter((o) => o !== general && isStarType(o));
  const [starName, setStarName] = useState(stars[0]?.name || "");
  const [regionName, setRegionName] = useState(regions[0]?.name || "");
  const [territoryName, setTerritoryName] = useState(territories[0]?.name || "");
  const star = stars.find((s) => s.name === starName) ?? stars[0];
  const region = regions.find((r) => r.name === regionName) ?? regions[0];
  const territory = territories.find((t) => t.name === territoryName) ?? territories[0];

  const patchGeneral = (mut: (obj: EcfObject) => EcfObject) => {
    if (generalIndex < 0) {
      persist([mut({ kind: "GalaxyConfig", plus: false, name: "General", fields: {}, children: [] }), ...objects]);
      return;
    }
    persist(
      objects.map((obj, i) =>
        i === generalIndex ? mut({ ...obj, fields: { ...obj.fields }, children: [...(obj.children ?? [])] }) : obj,
      ),
    );
  };

  const patchChild = (name: string, mut: (obj: EcfObject) => EcfObject) => {
    patchGeneral((cur) => ({
      ...cur,
      children: (cur.children ?? []).map((c) => (c.name === name ? mut({ ...c, fields: { ...c.fields } }) : c)),
    }));
  };

  const addTerritory = () => {
    const n = nextChildNumber(territories, "Territory_");
    patchGeneral((cur) => ({
      ...cur,
      children: [
        ...(cur.children ?? []),
        { kind: "Child", plus: false, name: `Territory_${n}`, fields: { Faction: "NewFaction", Center: "0, 0, 0", Radius: "20" } },
      ],
    }));
    setTerritoryName(`Territory_${n}`);
  };

  const addRegion = () => {
    const n = nextChildNumber(regions, "StarRegion_");
    patchGeneral((cur) => ({
      ...cur,
      children: [
        ...(cur.children ?? []),
        {
          kind: "Child",
          plus: false,
          name: `StarRegion_${n}`,
          fields: {
            Name: `Region ${n}`,
            Shape: "Sphere",
            RadiusMinMax: "0, 20",
            TotalSpawnCount: "10",
            UseDefaultStarDef: "false",
            NebulaSpawnCount: "0",
          },
        },
      ],
    }));
    setRegionName(`StarRegion_${n}`);
  };

  const addNebula = () => {
    const n = nebulaKeys.reduce((max, key) => Math.max(max, Number(key.replace(/\D/g, "")) || 0), 0) + 1;
    const key = `NebulaColors${n}`;
    patchGeneral((cur) => ({ ...cur, fields: { ...cur.fields, [key]: "1, 0.5, 0.2" } }));
    setNebulaKey(key);
  };

  const addStar = () => {
    const used = new Set(stars.map((s) => (s.fields.StarClass || s.name).toLowerCase()));
    let klass = "G";
    let n = 2;
    while (used.has(klass.toLowerCase())) {
      klass = `G${n}`;
      n += 1;
    }
    const obj: EcfObject = {
      kind: "GalaxyConfig",
      plus: false,
      name: `${klass} Type Star`,
      fields: {
        StarClass: klass,
        Model: "SunYellow",
        Probability: "0.2",
        SizeClass: "10",
        Color: "1,0.95,0.63",
        LightColor: "1,0.96,0.85",
        SurfaceTemperature: "5500, 6000",
        Mass: "1",
        Radius: "1",
        Luminosity: "1",
        ColorName: "Yellow",
        InnerSystem: "5, 56",
        HabitableHot: "57, 63",
        HabitableTemperate: "64, 69",
        HabitableCold: "70, 75",
        OuterSystem: "76, 132",
      },
    };
    persist([...objects, obj]);
    setStarName(obj.name);
  };

  const extraGeneral = Object.keys(general?.fields ?? {}).filter(
    (key) => !GALAXY_GENERAL_STATS.includes(key) && !/^NebulaColors\d+$/i.test(key),
  );
  const nebulaKeys = Object.keys(general?.fields ?? {})
    .filter((key) => /^NebulaColors\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));
  const [nebulaKey, setNebulaKey] = useState(nebulaKeys[0] || "");
  const nebula = nebulaKeys.includes(nebulaKey) ? nebulaKey : nebulaKeys[0] || "";
  const extraStar = star ? Object.keys(star.fields).filter((k) => !STAR_STATS.includes(k)) : [];
  const [volumeTab, setVolumeTab] = useState<"galaxy" | "regions" | "territories" | "all">("galaxy");
  const volumeSystems = useMemo(() => parseVolumeSystems(sectorText?.text || ""), [sectorText?.text]);
  const galaxyVolume = useMemo(() => readGalaxyVolume(general), [general]);

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={addStar}>
          Add star type
        </Button>
        <Button size="sm" variant="secondary" onClick={addRegion}>
          Add star region
        </Button>
        <Button size="sm" variant="secondary" onClick={addTerritory}>
          Add territory
        </Button>
        <Button size="sm" variant="secondary" onClick={addNebula}>
          Add nebula
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!objects.length}
          onClick={() => download(fileName, stringifyEcfObjects(objects))}
        >
          Export
        </Button>
        <p className="self-center text-xs text-subtle">
          {stars.length} star types · {regions.length} regions · {territories.length} territories
        </p>
      </div>

      {!objects.length ? (
        <p className="text-sm text-muted">
          Import GalaxyConfig.ecf. Star types carry Inner / Hot / Temperate / Cold / Outer ranges in sectors (10 sec = 1
          AU) plus Luminosity for solar flux.
        </p>
      ) : null}

      {objects.length && !sectorText?.text ? (
        <p className="mt-3 text-sm text-warn">
          GalaxyConfig is loaded, but Sectors.yaml was not kept as text — planet distances stay empty until that file is
          in the scenario drop (Content/Sectors.yaml) or imported on the Sectors slot.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["galaxy", "Galaxy"],
            ["regions", "Regions"],
            ["territories", "Territories"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setVolumeTab(id)}
            className={`h-8 rounded-md border px-3 text-sm ${volumeTab === id ? "border-accent bg-accent/15 text-fg" : "border-border text-muted hover:text-fg"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex h-[520px] gap-3">
        <div className="min-w-0 flex-1">
          <VolumeViewport space="galaxy" layer={volumeTab} galaxy={galaxyVolume} systems={volumeSystems} />
        </div>
        <VolumeLegend tab={volumeTab} galaxy={galaxyVolume} />
      </div>
      <p className="mt-2 text-xs text-subtle">
        {volumeTab === "regions"
          ? "Star regions only. Nested shells are RadiusMinMax from the galactic center, in light years."
          : volumeTab === "territories"
            ? "Faction spheres only. Each territory is Center and Radius in light years."
            : volumeTab === "all"
              ? "Galaxy disk, star regions, and territories together."
              : "Galaxy radius and nebula color, with Sectors.yaml stars as the bright points."}{" "}
        <Link to="/library/sectors" className="text-accent hover:underline">
          Open the sectors volume
        </Link>{" "}
        to zoom into a star, planet, or moon and edit it.
      </p>

      {star ? (
        <GalaxyStarChart
          star={star}
          bodies={bodies}
          starterName={general?.fields.StarterSystemName}
          onPatchStar={(fields) =>
            persist(
              objects.map((obj) => (obj.name === star.name ? { ...obj, fields: { ...obj.fields, ...fields } } : obj)),
            )
          }
          onFixOrbits={(fixes) => {
            const current = catalogText(catalog, "sectors");
            if (!current?.text) return;
            setCatalogText("sectors", applyOrbitFixes(current.text, fixes), current.path || "Sectors.yaml");
          }}
        />
      ) : null}

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Star types</h2>
      <div className="mt-2 max-w-xl">
        <select
          className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
          value={star?.name || ""}
          onChange={(e) => setStarName(e.target.value)}
        >
          {stars.map((s) => (
            <option key={s.name} value={s.name}>
              {s.fields.StarClass ? `${s.fields.StarClass} — ${s.name}` : s.name}
            </option>
          ))}
        </select>
      </div>
      {star ? (
        <div className="mt-3 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...STAR_STATS, ...extraStar].map((key) => (
            <Field key={key} label={key} area="star">
              {key === "Description" ? (
                <textarea
                  className="min-h-20 w-full rounded-sm border border-border bg-bg px-2 py-1.5 text-sm"
                  value={star.fields[key] ?? ""}
                  onChange={(e) =>
                    persist(
                      objects.map((obj) =>
                        obj.name === star.name ? { ...obj, fields: { ...obj.fields, [key]: e.target.value } } : obj,
                      ),
                    )
                  }
                />
              ) : key === "Model" ? (
                <select
                  className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
                  value={star.fields.Model || ""}
                  onChange={(e) =>
                    persist(
                      objects.map((obj) =>
                        obj.name === star.name ? { ...obj, fields: { ...obj.fields, Model: e.target.value } } : obj,
                      ),
                    )
                  }
                >
                  {star.fields.Model && !STAR_MODELS.includes(star.fields.Model as (typeof STAR_MODELS)[number]) ? (
                    <option value={star.fields.Model}>{star.fields.Model}</option>
                  ) : null}
                  {STAR_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : key === "Color" || key === "LightColor" ? (
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded-sm border border-border bg-bg"
                    value={fieldToHex(star.fields[key])}
                    onChange={(e) =>
                      persist(
                        objects.map((obj) =>
                          obj.name === star.name ? { ...obj, fields: { ...obj.fields, [key]: hexToField(e.target.value) } } : obj,
                        ),
                      )
                    }
                  />
                  <Input
                    value={star.fields[key] ?? ""}
                    onChange={(e) =>
                      persist(
                        objects.map((obj) =>
                          obj.name === star.name ? { ...obj, fields: { ...obj.fields, [key]: e.target.value } } : obj,
                        ),
                      )
                    }
                  />
                </div>
              ) : (
                <Input
                  value={star.fields[key] ?? ""}
                  onChange={(e) =>
                    persist(
                      objects.map((obj) =>
                        obj.name === star.name ? { ...obj, fields: { ...obj.fields, [key]: e.target.value } } : obj,
                      ),
                    )
                  }
                />
              )}
            </Field>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">Add a star type to edit habitable zones and luminosity.</p>
      )}

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">General</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...GALAXY_GENERAL_STATS, ...extraGeneral]
          .filter((key) => !/^NebulaColors\d+$/i.test(key))
          .map((key) => (
          <Field key={key} label={key} area="general">
            <Input
              value={general?.fields[key] ?? ""}
              onChange={(e) => patchGeneral((cur) => ({ ...cur, fields: { ...cur.fields, [key]: e.target.value } }))}
            />
          </Field>
        ))}
      </div>

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Nebulas</h2>
      <p className="mt-1 text-xs text-subtle">
        NebulaColors1 and up are color lists. A region’s NebulaColorIndex points at one of these.
      </p>
      {nebula ? (
        <div className="mt-2 max-w-4xl">
          <select
            className="h-10 w-full max-w-xl rounded-sm border border-border bg-bg px-2 text-sm"
            value={nebula}
            onChange={(e) => setNebulaKey(e.target.value)}
          >
            {nebulaKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <div className="mt-3">
            <Field label={nebula} note="Red, green, blue groups from 0 to 1. Several groups make a gradient. Example: 1, 0.3, 0,  0.8, 0, 0">
              <textarea
                className="min-h-20 w-full rounded-sm border border-border bg-bg px-2 py-1.5 font-mono text-sm"
                value={general?.fields[nebula] ?? ""}
                onChange={(e) => patchGeneral((cur) => ({ ...cur, fields: { ...cur.fields, [nebula]: e.target.value } }))}
              />
            </Field>
            <Button
              className="mt-2"
              size="sm"
              variant="ghost"
              onClick={() => {
                patchGeneral((cur) => {
                  const fields = { ...cur.fields };
                  delete fields[nebula];
                  return { ...cur, fields };
                });
                setNebulaKey(nebulaKeys.find((key) => key !== nebula) || "");
              }}
            >
              Remove nebula
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">No nebula colors yet. Add one to paint the galaxy.</p>
      )}

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Star regions</h2>
      <p className="mt-1 text-xs text-subtle">
        Where stars spawn (LY). Mix rows are StarClass_n + Prob — that is the actual fill, not the default star list.
      </p>
      <RegionEditor
        rows={regions}
        selected={region?.name || ""}
        onSelect={setRegionName}
        onChange={(name, col, value) => patchChild(name, (cur) => ({ ...cur, fields: { ...cur.fields, [col]: value } }))}
        onMix={(name, mix) => patchChild(name, (cur) => ({ ...cur, fields: writeStarMix(cur.fields, mix) }))}
        onRemove={(name) => {
          patchGeneral((cur) => ({ ...cur, children: (cur.children ?? []).filter((c) => c.name !== name) }));
          const next = regions.find((row) => row.name !== name);
          setRegionName(next?.name || "");
        }}
      />

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Territories</h2>
      <p className="mt-1 text-xs text-subtle">Faction spheres in LY. Other_n lets extra POI factions leak in from center to edge.</p>
      {!territories.length ? (
        <p className="mt-2 text-sm text-muted">None yet. Add a territory to place a faction sphere.</p>
      ) : (
        <>
          <div className="mt-2 max-w-xl">
            <select
              className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
              value={territory?.name || ""}
              onChange={(e) => setTerritoryName(e.target.value)}
            >
              {territories.map((row) => (
                <option key={row.name} value={row.name}>
                  {childLabel(row, row.fields.Faction || row.fields.Name)}
                </option>
              ))}
            </select>
          </div>
          {territory ? (
            <div className="mt-3 max-w-4xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-xs text-subtle">{territory.name}</span>
                <Button
                  className="ml-auto"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    patchGeneral((cur) => ({
                      ...cur,
                      children: (cur.children ?? []).filter((c) => c.name !== territory.name),
                    }));
                    const next = territories.find((row) => row.name !== territory.name);
                    setTerritoryName(next?.name || "");
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...TERRITORY_STATS, ...extraKeys(territory, TERRITORY_STATS)].map((col) => (
                  <Field key={col} label={col} area="territory">
                    <Input
                      value={territory.fields[col] ?? ""}
                      onChange={(e) =>
                        patchChild(territory.name, (cur) => ({ ...cur, fields: { ...cur.fields, [col]: e.target.value } }))
                      }
                    />
                  </Field>
                ))}
              </div>
              <div className="mt-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted">
                  Other factions
                  <FieldNote
                    label="Other factions"
                    note="Other_1 through Other_10. Each value is Faction, chance at the center, chance at the edge. Example: Zirax, 0.8, 0.1"
                  />
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.keys(territory.fields)
                    .filter((key) => /^Other_\d+$/i.test(key))
                    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)))
                    .map((key) => (
                      <Field key={key} label={key} note="Faction name, then center chance, then edge chance. Example: Polaris, 0.5, 0.1">
                        <Input
                          value={territory.fields[key] ?? ""}
                          onChange={(e) =>
                            patchChild(territory.name, (cur) => ({ ...cur, fields: { ...cur.fields, [key]: e.target.value } }))
                          }
                        />
                      </Field>
                    ))}
                </div>
                <Input
                  className="mt-2 h-8 max-w-xs"
                  placeholder="Add faction, then Enter"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const name = (e.target as HTMLInputElement).value.trim();
                    if (!name) return;
                    patchChild(territory.name, (cur) => {
                      const n = Object.keys(cur.fields).filter((key) => /^Other_/i.test(key)).length + 1;
                      return { ...cur, fields: { ...cur.fields, [`Other_${n}`]: name } };
                    });
                    (e.target as HTMLInputElement).value = "";
                  }}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function nextChildNumber(rows: EcfObject[], prefix: string) {
  const used = rows.map((row) => Number(row.name.slice(prefix.length))).filter((n) => Number.isFinite(n));
  return (used.length ? Math.max(...used) : 0) + 1;
}

function childLabel(row: EcfObject, display: string | undefined) {
  const name = display?.trim();
  if (name && name !== row.name) return `${name} — ${row.name}`;
  return name || row.name;
}

function extraKeys(row: EcfObject, known: readonly string[]) {
  return Object.keys(row.fields).filter((key) => !known.includes(key) && !/^Other_/i.test(key) && !/^StarClass_/i.test(key));
}

function RegionEditor({
  rows,
  selected,
  onSelect,
  onChange,
  onMix,
  onRemove,
}: {
  rows: EcfObject[];
  selected: string;
  onSelect: (name: string) => void;
  onChange: (name: string, col: string, value: string) => void;
  onMix: (name: string, mix: StarMix[]) => void;
  onRemove: (name: string) => void;
}) {
  const row = rows.find((item) => item.name === selected) ?? rows[0];
  if (!rows.length || !row) return <p className="mt-2 text-sm text-muted">None yet. Add a star region to place classes in LY.</p>;
  const mix = parseStarMix(row.fields);
  return (
    <div className="mt-2 max-w-4xl">
      <select
        className="h-10 w-full max-w-xl rounded-sm border border-border bg-bg px-2 text-sm"
        value={row.name}
        onChange={(e) => onSelect(e.target.value)}
      >
        {rows.map((item) => (
          <option key={item.name} value={item.name}>
            {childLabel(item, item.fields.Name)}
          </option>
        ))}
      </select>
      <div className="mt-3 rounded-md border border-border">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
          <span className="font-mono text-xs text-subtle">{row.name}</span>
          <span className="text-sm">{row.fields.Name || "Unnamed region"}</span>
          <span className="ml-auto text-xs text-subtle">{mix.length ? `${mix.length} classes` : "default mix"}</span>
          <Button size="sm" variant="ghost" onClick={() => onRemove(row.name)}>
            Remove
          </Button>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...STAR_REGION_STATS, ...extraKeys(row, STAR_REGION_STATS)].map((col) => (
            <Field key={col} label={col} area="region">
              <Input className="h-8" value={row.fields[col] ?? ""} onChange={(e) => onChange(row.name, col, e.target.value)} />
            </Field>
          ))}
        </div>
        <div className="overflow-auto px-3 pb-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-subtle">
            Star mix
            <FieldNote
              label="Star mix"
              note="Class is the star letter. Prob is that class’s share of this region and should add up to about 1. Cluster is the chance of a clump. Cluster range is how many extra stars, as minimum-maximum. Spawn amount is a fixed count when you set one."
            />
          </p>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.12em] text-subtle">
              <tr>
                <th className="py-1 pr-2">Class</th>
                <th className="py-1 pr-2">Prob</th>
                <th className="py-1 pr-2">Cluster</th>
                <th className="py-1 pr-2">Cluster range</th>
                <th className="py-1 pr-2">Spawn amount</th>
                <th className="py-1" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mix.map((entry, i) => (
                <tr key={`${row.name}-${entry.index}`}>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-24"
                      value={entry.starClass}
                      onChange={(e) =>
                        onMix(
                          row.name,
                          mix.map((item, j) => (j === i ? { ...item, starClass: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-20"
                      value={entry.prob}
                      onChange={(e) =>
                        onMix(
                          row.name,
                          mix.map((item, j) => (j === i ? { ...item, prob: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-20"
                      value={entry.clusterProb}
                      onChange={(e) =>
                        onMix(
                          row.name,
                          mix.map((item, j) => (j === i ? { ...item, clusterProb: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-28"
                      value={entry.clusterRange}
                      onChange={(e) =>
                        onMix(
                          row.name,
                          mix.map((item, j) => (j === i ? { ...item, clusterRange: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-24"
                      value={entry.spawnAmount}
                      onChange={(e) =>
                        onMix(
                          row.name,
                          mix.map((item, j) => (j === i ? { ...item, spawnAmount: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td className="py-1">
                    <Button size="sm" variant="ghost" onClick={() => onMix(row.name, mix.filter((_, j) => j !== i))}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            className="mt-2"
            size="sm"
            variant="secondary"
            onClick={() =>
              onMix(row.name, [
                ...mix,
                {
                  index: mix.length + 1,
                  starClass: "G",
                  spawnAmount: "",
                  prob: "0.2",
                  clusterProb: "0",
                  clusterRange: "0-0",
                },
              ])
            }
          >
            Add class
          </Button>
        </div>
      </div>
    </div>
  );
}

function stopColor(stop: [number, number, number]) {
  const c = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255);
  return `rgb(${c(stop[0])}, ${c(stop[1])}, ${c(stop[2])})`;
}

function Swatch({ color, ring }: { color: string; ring?: boolean }) {
  return (
    <span
      className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border"
      style={{ background: ring ? "transparent" : color, borderColor: color }}
    />
  );
}

function VolumeLegend({ tab, galaxy }: { tab: "galaxy" | "regions" | "territories" | "all"; galaxy: GalaxyVolume }) {
  const showGalaxy = tab === "galaxy" || tab === "all";
  const showRegions = tab === "regions" || tab === "all";
  const showTerritories = tab === "territories" || tab === "all";
  return (
    <aside className="w-56 shrink-0 overflow-auto rounded-md border border-border bg-surface/50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Legend</p>
      {showGalaxy ? (
        <section className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">Galaxy</p>
          <ul className="mt-1.5 space-y-1.5">
            <li className="flex items-start gap-2 text-xs">
              <Swatch ring color="rgba(150,186,255,0.95)" />
              <span>Outer radius</span>
            </li>
            {galaxy.inner > 1 ? (
              <li className="flex items-start gap-2 text-xs">
                <Swatch ring color="rgba(255,220,160,0.95)" />
                <span>Inner radius</span>
              </li>
            ) : null}
            {galaxy.nebulas.slice(0, 8).map((nebula) => (
              <li key={nebula.key} className="flex items-start gap-2 text-xs">
                <Swatch color={stopColor(nebula.stops[0] || [1, 1, 1])} />
                <span className="truncate">{nebula.key}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-subtle">Star class</p>
          <ul className="mt-1.5 space-y-1.5">
            {STAR_CLASS_LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs">
                <Swatch color={item.color} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10px] leading-4 text-subtle">A star Color field overrides the class tint.</p>
        </section>
      ) : null}
      {showRegions ? (
        <section className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">Regions</p>
          <ul className="mt-1.5 space-y-1.5">
            {galaxy.regions.length ? (
              galaxy.regions.map((region) => (
                <li key={region.id} className="flex items-start gap-2 text-xs">
                  <Swatch ring color={region.color} />
                  <span className="min-w-0">
                    <span className="block truncate">{region.name}</span>
                    <span className="text-[10px] text-subtle">
                      {region.inner}–{region.outer} LY
                    </span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-subtle">No star regions in this file.</li>
            )}
          </ul>
        </section>
      ) : null}
      {showTerritories ? (
        <section className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">Territories</p>
          <ul className="mt-1.5 space-y-1.5">
            {galaxy.territories.length ? (
              galaxy.territories.map((territory) => (
                <li key={territory.id} className="flex items-start gap-2 text-xs">
                  <Swatch ring color={territory.color} />
                  <span className="min-w-0">
                    <span className="block truncate">{territory.faction}</span>
                    <span className="text-[10px] text-subtle">{territory.id}</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-subtle">No territories in this file.</li>
            )}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}



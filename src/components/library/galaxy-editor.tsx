import { useMemo, useState, type ReactNode } from "react";
import { GalaxyStarChart } from "@/components/library/galaxy-chart.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { GALAXY_GENERAL_STATS, TERRITORY_STATS } from "@/lib/pda/config-stats.ts";
import { stringifyEcfObjects, type EcfObject } from "@/lib/pda/ecf.ts";
import { catalogText, objectsFor } from "@/lib/pda/library.ts";
import { parseSectorBodies, STAR_REGION_STATS, STAR_STATS, isStarType } from "@/lib/pda/galaxy.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
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
  const bodies = useMemo(() => parseSectorBodies(catalogText(catalog, "sectors")?.text || ""), [catalog]);

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
  const star = stars.find((s) => s.name === starName) ?? stars[0];

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
    const n = territories.length + 1;
    patchGeneral((cur) => ({
      ...cur,
      children: [
        ...(cur.children ?? []),
        { kind: "Child", plus: false, name: `Territory_${n}`, fields: { Faction: "NewFaction", Center: "0, 0, 0", Radius: "20" } },
      ],
    }));
  };

  const addRegion = () => {
    const n = regions.length + 1;
    patchGeneral((cur) => ({
      ...cur,
      children: [
        ...(cur.children ?? []),
        {
          kind: "Child",
          plus: false,
          name: `StarRegion_${n}`,
          fields: { Name: `Region ${n}`, Shape: "Sphere", RadiusMinMax: "0, 20", TotalSpawnCount: "10", UseDefaultStarDef: "true" },
        },
      ],
    }));
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

  const extraGeneral = Object.keys(general?.fields ?? {}).filter((k) => !GALAXY_GENERAL_STATS.includes(k));
  const extraStar = star ? Object.keys(star.fields).filter((k) => !STAR_STATS.includes(k)) : [];

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

      {star ? <GalaxyStarChart star={star} bodies={bodies} /> : null}

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
            <Field key={key} label={key}>
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
        {[...GALAXY_GENERAL_STATS, ...extraGeneral].map((key) => (
          <Field key={key} label={key}>
            <Input
              value={general?.fields[key] ?? ""}
              onChange={(e) => patchGeneral((cur) => ({ ...cur, fields: { ...cur.fields, [key]: e.target.value } }))}
            />
          </Field>
        ))}
      </div>

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Star regions</h2>
      <p className="mt-1 text-xs text-subtle">Where this class of star actually spawns in the galaxy (LY).</p>
      <ChildTable
        rows={regions}
        columns={STAR_REGION_STATS}
        onChange={(name, col, value) => patchChild(name, (cur) => ({ ...cur, fields: { ...cur.fields, [col]: value } }))}
        onRemove={(name) =>
          patchGeneral((cur) => ({ ...cur, children: (cur.children ?? []).filter((c) => c.name !== name) }))
        }
      />

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Territories</h2>
      <p className="mt-1 text-xs text-subtle">Faction spheres in LY. Other_n lets extra POI factions leak in from center to edge.</p>
      <div className="mt-2 overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-subtle">
            <tr>
              <th className="px-2 py-2">Id</th>
              {TERRITORY_STATS.map((col) => (
                <th key={col} className="px-2 py-2">
                  {col}
                </th>
              ))}
              <th className="px-2 py-2">Other factions</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {territories.map((row) => (
              <tr key={row.name}>
                <td className="px-2 py-1.5 font-mono text-xs text-subtle">{row.name}</td>
                {TERRITORY_STATS.map((col) => (
                  <td key={col} className="px-2 py-1.5">
                    <Input
                      className="h-8"
                      value={row.fields[col] ?? ""}
                      onChange={(e) => patchChild(row.name, (cur) => ({ ...cur, fields: { ...cur.fields, [col]: e.target.value } }))}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-xs text-muted">
                      {Object.entries(row.fields)
                        .filter(([k]) => /^Other_/i.test(k))
                        .map(([, v]) => v.split(",")[0].trim())
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                    <Input
                      className="h-8 w-28"
                      placeholder="Add faction"
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        const name = (e.target as HTMLInputElement).value.trim();
                        if (!name) return;
                        patchChild(row.name, (cur) => {
                          const n = Object.keys(cur.fields).filter((k) => /^Other_/i.test(k)).length + 1;
                          return { ...cur, fields: { ...cur.fields, [`Other_${n}`]: name } };
                        });
                        (e.target as HTMLInputElement).value = "";
                      }}
                    />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      patchGeneral((cur) => ({
                        ...cur,
                        children: (cur.children ?? []).filter((c) => c.name !== row.name),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChildTable({
  rows,
  columns,
  onChange,
  onRemove,
}: {
  rows: EcfObject[];
  columns: string[];
  onChange: (name: string, col: string, value: string) => void;
  onRemove: (name: string) => void;
}) {
  if (!rows.length) return <p className="mt-2 text-sm text-muted">None yet.</p>;
  return (
    <div className="mt-2 overflow-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="text-left text-xs uppercase tracking-[0.12em] text-subtle">
          <tr>
            <th className="px-2 py-2">Id</th>
            {columns.map((col) => (
              <th key={col} className="px-2 py-2">
                {col}
              </th>
            ))}
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="px-2 py-1.5 font-mono text-xs text-subtle">{row.name}</td>
              {columns.map((col) => (
                <td key={col} className="px-2 py-1.5">
                  <Input className="h-8" value={row.fields[col] ?? ""} onChange={(e) => onChange(row.name, col, e.target.value)} />
                </td>
              ))}
              <td className="px-2 py-1.5">
                <Button size="sm" variant="ghost" onClick={() => onRemove(row.name)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

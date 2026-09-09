import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { GALAXY_GENERAL_STATS, TERRITORY_STATS, WARFARE_STATS } from "@/lib/pda/config-stats.ts";
import { stringifyEcfObjects, type EcfObject } from "@/lib/pda/ecf.ts";
import { catalogText, objectsFor, type ConfigRole } from "@/lib/pda/library.ts";
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

function useConfig(role: ConfigRole, fileName: string) {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const objects = useMemo(() => objectsFor(catalog, role), [catalog, role]);
  const persist = (next: EcfObject[]) => {
    setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
  };
  return { catalog, objects, persist, fileName };
}

export function ReputationTable() {
  const { objects, persist, fileName } = useConfig("reputation", "DefReputation.ecf");
  const [newFaction, setNewFaction] = useState("");
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const obj of objects) for (const key of Object.keys(obj.fields)) set.add(key);
    return [...set];
  }, [objects]);

  const setCell = (name: string, faction: string, value: string) => {
    persist(objects.map((obj) => (obj.name === name ? { ...obj, fields: { ...obj.fields, [faction]: value } } : obj)));
  };

  const addRow = () => {
    const used = new Set(objects.map((o) => o.name));
    let n = objects.length + 1;
    let name = `Human:${n}`;
    while (used.has(name)) {
      n += 1;
      name = `Human:${n}`;
    }
    const fields: Record<string, string> = {};
    for (const col of columns) fields[col] = "16500";
    persist([...objects, { kind: "Reputation", plus: false, name, fields }]);
  };

  const addColumn = () => {
    const faction = newFaction.trim();
    if (!faction || columns.includes(faction)) return;
    persist(objects.map((obj) => ({ ...obj, fields: { ...obj.fields, [faction]: obj.fields[faction] ?? "16500" } })));
    setNewFaction("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <Button size="sm" onClick={addRow}>
          Add origin
        </Button>
        <Input
          className="h-8 w-40"
          value={newFaction}
          placeholder="New faction"
          onChange={(e) => setNewFaction(e.target.value)}
        />
        <Button size="sm" variant="secondary" disabled={!newFaction.trim()} onClick={addColumn}>
          Add faction column
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!objects.length}
          onClick={() => download(fileName, stringifyEcfObjects(objects))}
        >
          Export
        </Button>
        <p className="text-xs text-subtle">{objects.length} origins · {columns.length} factions</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!objects.length ? (
          <p className="text-sm text-muted">
            Import DefReputation.ecf, or add an origin row and faction columns. Values are starting reputation for that
            player origin vs each NPC faction.
          </p>
        ) : (
          <table className="w-max min-w-full text-sm">
            <thead className="sticky top-0 bg-bg text-left text-xs uppercase tracking-[0.12em] text-subtle">
              <tr>
                <th className="px-2 py-2">Origin</th>
                {columns.map((col) => (
                  <th key={col} className="px-2 py-2">
                    {col}
                  </th>
                ))}
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {objects.map((obj) => (
                <tr key={obj.name}>
                  <td className="px-2 py-1.5">
                    <Input
                      className="h-8 w-32 font-mono text-xs"
                      value={obj.name}
                      onChange={(e) =>
                        persist(objects.map((row) => (row.name === obj.name ? { ...row, name: e.target.value } : row)))
                      }
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-2 py-1.5">
                      <Input
                        className="h-8 w-24 font-mono text-xs"
                        value={obj.fields[col] ?? ""}
                        onChange={(e) => setCell(obj.name, col, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <Button size="sm" variant="ghost" onClick={() => persist(objects.filter((row) => row.name !== obj.name))}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function WarfareEditor() {
  const { objects, persist, fileName } = useConfig("warfare", "FactionWarfare.ecf");
  const factions = objects.filter((obj) => /factionsettings/i.test(obj.name) || obj.fields.Faction);
  const [picked, setPicked] = useState(0);
  const selected = factions[picked] ?? factions[0];
  const selectedIndex = selected ? objects.indexOf(selected) : -1;

  const addFaction = () => {
    const used = new Set(factions.map((f) => (f.fields.Faction || "").toLowerCase()));
    let name = "NewFaction";
    let n = 2;
    while (used.has(name.toLowerCase())) {
      name = `NewFaction${n}`;
      n += 1;
    }
    const obj: EcfObject = {
      kind: "Element",
      plus: false,
      name: "FactionSettings",
      fields: {
        Faction: name,
        ScenarioGroup: name,
        Lvl1MinPrice: "25",
        Lvl1MaxPrice: "40",
        Lvl5MinPrice: "110",
        Lvl5MaxPrice: "130",
        Lvl10MinPrice: "200",
        Lvl10MaxPrice: "232",
        SDScenarioGroup: `${name}SpaceDefense`,
        SDProbabilityMin: "0.20",
        SDProbabilityMax: "0.80",
        SDPriceMin: "30",
        SDPriceMax: "150",
      },
    };
    persist([...objects, obj]);
    setPicked(factions.length);
  };

  const patch = (mut: (obj: EcfObject) => EcfObject) => {
    if (selectedIndex < 0) return;
    persist(objects.map((obj, i) => (i === selectedIndex ? mut({ ...obj, fields: { ...obj.fields } }) : obj)));
  };

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="flex flex-wrap gap-2 border-b border-border p-2">
          <Button size="sm" onClick={addFaction}>
            Add faction
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!objects.length}
            onClick={() => download(fileName, stringifyEcfObjects(objects))}
          >
            Export
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {!factions.length ? (
            <p className="p-4 text-sm text-muted">Import FactionWarfare.ecf, or add a faction.</p>
          ) : (
            factions.map((obj, i) => (
              <button
                key={`${obj.fields.Faction || obj.name}-${i}`}
                onClick={() => setPicked(i)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm ${
                  factions[picked] === obj ? "bg-elevated" : "hover:bg-elevated/50"
                }`}
              >
                <span className="truncate">{obj.fields.Faction || obj.name}</span>
                <span className="font-mono text-xs text-subtle">{obj.fields.ScenarioGroup || ""}</span>
              </button>
            ))
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-6">
        {selected ? (
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-medium tracking-tight">{selected.fields.Faction || selected.name}</h2>
            <p className="mt-1 text-sm text-muted">Attack prices and space-defense settings for this faction.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {WARFARE_STATS.map((key) => (
                <Field key={key} label={key}>
                  <Input
                    value={selected.fields[key] ?? ""}
                    onChange={(e) => patch((cur) => ({ ...cur, fields: { ...cur.fields, [key]: e.target.value } }))}
                  />
                </Field>
              ))}
            </div>
            <Button
              className="mt-4"
              size="sm"
              variant="secondary"
              onClick={() => persist(objects.filter((_, i) => i !== selectedIndex))}
            >
              Remove faction
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">Select a faction.</p>
        )}
      </section>
    </div>
  );
}

export function GalaxyEditor() {
  const { objects, persist, fileName } = useConfig("galaxy", "GalaxyConfig.ecf");
  const general =
    objects.find((o) => /galaxyconfig/i.test(o.kind) && /^general$/i.test(o.name)) ??
    objects.find((o) => /galaxyconfig/i.test(o.kind)) ??
    null;
  const generalIndex = general ? objects.indexOf(general) : -1;
  const territories = (general?.children ?? []).filter((c) => /territory/i.test(c.name));
  const stars = objects.filter((o) => o !== general);
  const [starName, setStarName] = useState(stars[0]?.name || "");
  const star = stars.find((s) => s.name === starName) ?? stars[0];

  const patchGeneral = (mut: (obj: EcfObject) => EcfObject) => {
    if (generalIndex < 0) {
      persist([
        mut({
          kind: "GalaxyConfig",
          plus: false,
          name: "General",
          fields: {},
          children: [],
        }),
        ...objects,
      ]);
      return;
    }
    persist(objects.map((obj, i) => (i === generalIndex ? mut({ ...obj, fields: { ...obj.fields }, children: [...(obj.children ?? [])] }) : obj)));
  };

  const addTerritory = () => {
    const n = territories.length + 1;
    const child: EcfObject = {
      kind: "Child",
      plus: false,
      name: `Territory_${n}`,
      fields: { Faction: "NewFaction", Center: "0, 0, 0", Radius: "20" },
    };
    patchGeneral((cur) => ({ ...cur, children: [...(cur.children ?? []), child] }));
  };

  const patchTerritory = (name: string, mut: (obj: EcfObject) => EcfObject) => {
    patchGeneral((cur) => ({
      ...cur,
      children: (cur.children ?? []).map((c) => (c.name === name ? mut({ ...c, fields: { ...c.fields } }) : c)),
    }));
  };

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={addTerritory}>
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
        <p className="text-xs text-subtle">{territories.length} territories · {stars.length} star types</p>
      </div>
      {!objects.length && !general ? (
        <p className="text-sm text-muted">
          Import GalaxyConfig.ecf, then edit star counts, territories, and star types. Add a territory to place a new
          faction on the map.
        </p>
      ) : null}
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">General</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GALAXY_GENERAL_STATS.map((key) => (
          <Field key={key} label={key}>
            <Input
              value={general?.fields[key] ?? ""}
              onChange={(e) => patchGeneral((cur) => ({ ...cur, fields: { ...cur.fields, [key]: e.target.value } }))}
            />
          </Field>
        ))}
      </div>
      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Territories</h2>
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
            {territories.map((row) => {
              return (
                <tr key={row.name}>
                  <td className="px-2 py-1.5 font-mono text-xs text-subtle">{row.name}</td>
                  {TERRITORY_STATS.map((col) => (
                    <td key={col} className="px-2 py-1.5">
                      <Input
                        className="h-8"
                        value={row.fields[col] ?? ""}
                        onChange={(e) =>
                          patchTerritory(row.name, (cur) => ({ ...cur, fields: { ...cur.fields, [col]: e.target.value } }))
                        }
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
                          patchTerritory(row.name, (cur) => {
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
              );
            })}
          </tbody>
        </table>
      </div>
      {stars.length ? (
        <>
          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent">Star types</h2>
          <div className="mt-2 max-w-xl">
            <select
              className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
              value={star?.name || ""}
              onChange={(e) => setStarName(e.target.value)}
            >
              {stars.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {star ? (
            <div className="mt-3 grid max-w-3xl gap-3 sm:grid-cols-2">
              {Object.keys(star.fields).map((key) => (
                <Field key={key} label={key}>
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
                </Field>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

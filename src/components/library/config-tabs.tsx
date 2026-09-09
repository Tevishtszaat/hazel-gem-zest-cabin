import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { WARFARE_STATS } from "@/lib/pda/config-stats.ts";
import { stringifyEcfObjects, type EcfObject } from "@/lib/pda/ecf.ts";
import { catalogText, objectsFor, type ConfigRole } from "@/lib/pda/library.ts";
import { usePdaStore } from "@/store/pda-store.ts";

export { GalaxyEditor } from "./galaxy-editor.tsx";

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

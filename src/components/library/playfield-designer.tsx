import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import {
  ASTEROID_COLS,
  BIOME_COLS,
  ENTITY_COLS,
  FIXED_POI_COLS,
  FIXED_RESOURCE_COLS,
  PLANET_TYPES,
  RANDOM_POI_COLS,
  RANDOM_RESOURCE_COLS,
  SPACE_VESSEL_COLS,
  SPAWN_ZONE_COLS,
  asRows,
  catalogNames,
  cellsToRows,
  dumpPlayfieldDoc,
  fixedPoiPath,
  getPath,
  loadPlayfieldDoc,
  preflightPlayfield,
  randomPoiPath,
  rowsToCells,
  setPath,
  tabsForKind,
  type Column,
  type DesignerTab,
  type YamlDoc,
  type YamlRow,
} from "@/lib/pda/playfield-design.ts";
import { keysForKind, kindLabel, patchYamlField, type PlayfieldFile, type PlayfieldKind } from "@/lib/pda/playfield.ts";
import type { ScenarioCatalog } from "@/lib/pda/scenario-index.ts";

export function PlayfieldDesigner({
  file,
  kind,
  catalog,
  onChange,
}: {
  file: PlayfieldFile;
  kind: PlayfieldKind;
  catalog: ScenarioCatalog;
  onChange: (text: string) => void;
}) {
  const [tab, setTab] = useState<DesignerTab>("basics");
  const tabs = tabsForKind(kind);
  const doc = useMemo(() => loadPlayfieldDoc(file.text), [file.text]);
  const issues = useMemo(() => preflightPlayfield(file, catalog), [file, catalog]);
  const pois = catalogNames(catalog, "poi");
  const entities = catalogNames(catalog, "entity");
  const factions = catalogNames(catalog, "faction");
  const planet = kind === "planet" || kind === "moon";

  const rewrite = (next: YamlDoc) => onChange(dumpPlayfieldDoc(next));

  return (
    <div className="max-w-6xl">
      <p className="text-xs uppercase tracking-[0.14em] text-accent">{kindLabel(kind)}</p>
      <h2 className="mt-1 text-xl font-medium tracking-tight">{file.folder}</h2>
      <p className="mt-1 text-xs text-subtle">
        Empyrion Playfield Designer layout: lists for POIs, resources, creatures, biomes, plus a pre-flight check.
        Saving a list rewrites this YAML (comments on this file may drop). Basics still patch in place.
        {issues.length ? ` · ${issues.length} pre-flight note${issues.length === 1 ? "" : "s"}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-border pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`rounded-sm px-2 py-1 text-xs ${
              tab === item.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === "check" && issues.length ? ` (${issues.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "basics" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {keysForKind(kind).map((key) => {
            const options =
              key === "PlayfieldType"
                ? ["Planet", "Space"]
                : key === "PlanetType"
                  ? PLANET_TYPES
                  : key === "Water" || key === "WaterBlock"
                    ? ["WaterBlue", "WaterGreen", "WaterBrown"]
                    : /^(PvP|AtmosphereBreathable|AtmosphereEnabled|AllowCV|UseFixed)$/.test(key)
                      ? ["True", "False"]
                      : undefined;
            return (
              <label key={key} className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.12em] text-muted">{key}</span>
                {key === "Description" ? (
                  <Textarea
                    rows={3}
                    value={file.fields[key] ?? ""}
                    onChange={(e) => onChange(patchYamlField(file.text, key, e.target.value))}
                  />
                ) : options ? (
                  <Select
                    value={file.fields[key] || "unset"}
                    onValueChange={(value) => onChange(patchYamlField(file.text, key, value === "unset" ? "" : value))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={key} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">(empty)</SelectItem>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={file.fields[key] ?? ""}
                    onChange={(e) => onChange(patchYamlField(file.text, key, e.target.value))}
                  />
                )}
              </label>
            );
          })}
        </div>
      ) : null}

      {tab === "pois" && doc ? (
        <div className="mt-4 space-y-6">
          <YamlTable
            title="Random POIs"
            hint="Survival scatter. GroupName is the blueprint group from Prefabs."
            cols={RANDOM_POI_COLS.map((col) =>
              col.key === "GroupName" && pois.length ? { ...col, options: pois } : col,
            )}
            list={asRows(getPath(doc, randomPoiPath(doc)))}
            blank={{ GroupName: "NewPOI", CountMinMax: [1, 1], DroneProb: 0, TroopTransport: false }}
            onChange={(list) => rewrite(setPath(doc, randomPoiPath(doc), list))}
          />
          <YamlTable
            title="Fixed POIs"
            hint="Placed at Pos. Prefab is the .epb file name."
            cols={FIXED_POI_COLS.map((col) => {
              if (col.key === "Prefab" && pois.length) return { ...col, options: pois };
              if (col.key === "Faction" && factions.length) return { ...col, options: factions };
              return col;
            })}
            list={asRows(getPath(doc, fixedPoiPath(doc)))}
            blank={{ Name: "NewPOI", Prefab: "", Pos: [0, 0, 0], InitPower: true }}
            onChange={(list) => rewrite(setPath(doc, fixedPoiPath(doc), list))}
          />
        </div>
      ) : null}

      {tab === "resources" && doc ? (
        planet ? (
          <div className="mt-4 space-y-6">
            <YamlTable
              title="Random resources"
              cols={RANDOM_RESOURCE_COLS}
              list={asRows(getPath(doc, ["RandomResources"]))}
              blank={{ Name: "IronResource", CountMinMax: [1, 3], SizeMinMax: [5, 8], DepthMinMax: [0, 1] }}
              onChange={(list) => rewrite(setPath(doc, ["RandomResources"], list))}
            />
            <YamlTable
              title="Fixed resources"
              cols={FIXED_RESOURCE_COLS}
              list={asRows(getPath(doc, ["FixedResources"]))}
              blank={{ Name: "IronResource", Pos: [0, 0, 0], Radius: 8 }}
              onChange={(list) => rewrite(setPath(doc, ["FixedResources"], list))}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <YamlTable
              title="Asteroid resources"
              cols={ASTEROID_COLS}
              list={asRows(getPath(doc, ["AsteroidResources"]) || getPath(doc, ["RandomResources"]))}
              blank={{ Name: "IronResource", CountMinMax: [2, 4] }}
              onChange={(list) => rewrite(setPath(doc, getPath(doc, ["AsteroidResources"]) != null ? ["AsteroidResources"] : ["RandomResources"], list))}
            />
            <YamlTable
              title="Space vessels"
              cols={SPACE_VESSEL_COLS.map((col) =>
                col.key === "Prefab" && pois.length ? { ...col, options: pois } : col,
              )}
              list={asRows(getPath(doc, ["SpaceVessels"]) || getPath(doc, ["RandomPlanetVesselBase"]))}
              blank={{ Name: "Trader", CountMinMax: [0, 1] }}
              onChange={(list) => rewrite(setPath(doc, ["SpaceVessels"], list))}
            />
          </div>
        )
      ) : null}

      {tab === "creatures" && doc ? (
        <CreatureEditor
          list={asRows(getPath(doc, ["CreatureSpawning"]))}
          entityNames={entities}
          onChange={(list) => rewrite(setPath(doc, ["CreatureSpawning"], list))}
        />
      ) : null}

      {tab === "biomes" && doc ? (
        <div className="mt-4">
          <YamlTable
            title="Biomes"
            hint="Names here are what Creatures.Biome and POI biome filters point at."
            cols={BIOME_COLS}
            list={asRows(getPath(doc, ["Biomes"]) || getPath(doc, ["BiomeClusterData"]))}
            blank={{ Name: "NewBiome" }}
            onChange={(list) => rewrite(setPath(doc, getPath(doc, ["Biomes"]) != null || getPath(doc, ["BiomeClusterData"]) == null ? ["Biomes"] : ["BiomeClusterData"], list))}
          />
        </div>
      ) : null}

      {tab === "spawns" && doc ? (
        <div className="mt-4">
          <YamlTable
            title="Spawn zones"
            cols={SPAWN_ZONE_COLS}
            list={asRows(getPath(doc, ["SpawnZones"]))}
            blank={{ Name: "Zone", Radius: 500 }}
            onChange={(list) => rewrite(setPath(doc, ["SpawnZones"], list))}
          />
        </div>
      ) : null}

      {tab === "check" ? (
        <div className="mt-4 space-y-2">
          {!issues.length ? (
            <p className="rounded-md border border-border bg-surface px-4 py-6 text-sm text-ok">
              Pre-flight is clean for this file.
            </p>
          ) : (
            issues.map((issue, i) => (
              <div key={`${issue.code}-${i}`} className="rounded-md border border-border bg-surface p-3">
                <p className={`text-xs uppercase tracking-[0.14em] ${issue.level === "error" ? "text-danger" : "text-warn"}`}>
                  {issue.level}
                </p>
                <p className="mt-1 text-sm">{issue.message}</p>
                <p className="mt-0.5 text-xs text-subtle">{issue.path}</p>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "raw" || !doc ? (
        <div className="mt-4">
          {!doc ? <p className="mb-2 text-sm text-danger">YAML did not parse. Edit raw until it loads.</p> : null}
          <Textarea className="min-h-80 font-mono text-xs" value={file.text} onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : null}
    </div>
  );
}

function YamlTable({
  title,
  hint,
  cols,
  list,
  blank,
  onChange,
}: {
  title: string;
  hint?: string;
  cols: Column[];
  list: YamlRow[];
  blank: YamlRow;
  onChange: (list: YamlRow[]) => void;
}) {
  const cells = rowsToCells(list, cols);
  const setCell = (row: number, key: string, value: string) => {
    const next = cells.map((c) => ({ ...c }));
    next[row] = { ...next[row]!, [key]: value };
    onChange(cellsToRows(next, cols, list));
  };
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-accent">{title}</p>
          {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
        </div>
        <Button size="sm" variant="secondary" onClick={() => onChange([...list, { ...blank }])}>
          Add
        </Button>
      </div>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-elevated text-muted">
            <tr>
              {cols.map((col) => (
                <th key={col.key} className="px-2 py-1.5 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="w-10 px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {cells.map((cell, i) => (
              <tr key={i} className="border-t border-border">
                {cols.map((col) => (
                  <td key={col.key} className="px-1 py-1">
                    {col.options?.length ? (
                      <select
                        className="h-8 w-full min-w-28 rounded-sm border border-border bg-bg px-1 text-fg"
                        value={cell[col.key] || ""}
                        onChange={(e) => setCell(i, col.key, e.target.value)}
                      >
                        <option value="">{cell[col.key] ? cell[col.key] : "—"}</option>
                        {col.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="h-8 w-full min-w-24 rounded-sm border border-border bg-bg px-1 text-fg"
                        value={cell[col.key] ?? ""}
                        onChange={(e) => setCell(i, col.key, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="px-1 py-1">
                  <button className="text-xs text-danger" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {!cells.length ? (
              <tr>
                <td className="px-2 py-3 text-subtle" colSpan={cols.length + 1}>
                  None. Add a row.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreatureEditor({
  list,
  entityNames,
  onChange,
}: {
  list: YamlRow[];
  entityNames: string[];
  onChange: (list: YamlRow[]) => void;
}) {
  const [picked, setPicked] = useState(0);
  const biome = list[Math.min(picked, Math.max(0, list.length - 1))];
  const entities = asRows(biome?.Entities);
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="rounded-sm border border-border">
        {list.map((row, i) => (
          <button
            key={i}
            className={`block w-full truncate px-3 py-2 text-left text-sm ${i === picked ? "bg-elevated" : "hover:bg-elevated/50"}`}
            onClick={() => setPicked(i)}
          >
            {String(row.Biome ?? row.Name ?? `Biome ${i + 1}`)}
          </button>
        ))}
        <button
          className="block w-full px-3 py-2 text-left text-xs text-accent"
          onClick={() => {
            onChange([...list, { Biome: "NewBiome", Entities: [] }]);
            setPicked(list.length);
          }}
        >
          + Biome
        </button>
      </div>
      {biome ? (
        <div>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">Biome</span>
            <Input
              value={String(biome.Biome ?? biome.Name ?? "")}
              onChange={(e) =>
                onChange(list.map((row, i) => (i === picked ? { ...row, Biome: e.target.value } : row)))
              }
            />
          </label>
          <div className="mt-3">
            <YamlTable
              title="Entities"
              cols={ENTITY_COLS.map((col) =>
                col.key === "Name" && entityNames.length ? { ...col, options: entityNames } : col,
              )}
              list={entities}
              blank={{ Name: entityNames[0] || "AlienBug01", Period: "Always", Amount: 1, Delay: 0 }}
              onChange={(next) =>
                onChange(list.map((row, i) => (i === picked ? { ...row, Entities: next } : row)))
              }
            />
          </div>
          <Button
            className="mt-3"
            size="sm"
            variant="danger"
            onClick={() => {
              onChange(list.filter((_, i) => i !== picked));
              setPicked(0);
            }}
          >
            Remove biome
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">Add a biome to spawn creatures.</p>
      )}
    </div>
  );
}

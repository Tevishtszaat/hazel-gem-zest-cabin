import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { FieldNote } from "@/components/ui/field-note.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import {
  blankRandomPreset,
  parseRandomPreset,
  presetFileName,
  writeRandomPreset,
  type RandomPresetDoc,
  type TypeBlock,
} from "@/lib/pda/random-preset.ts";
import { usePdaStore } from "@/store/pda-store.ts";

const NOTES: Record<string, string> = {
  MapScale: "How far apart sectors sit. 1 is the usual spread. Example: 1.0",
  SolarSystemSqueezeMinMax: "How flat the system is, from 0 to 1. Lower is a thinner disk. Example: [0.005, 0.1]",
  OneWayWarpProb: "Chance a warp link only works one way. Example: 0",
  UniqueStarterPlanet: "True forces a unique starter planet. Example: false",
  Counts: "Each row is one slot, in the same order as Planet lists. Write amount : chance. The chances in a row should add to 1. Example: 0 : 0.5,  1 : 0.5",
  Lists: "Playfield type names for that same slot, with a weight. Example: Temperate:0.5, Swamp:0.5",
  POICount: "How many space POIs this system rolls. Example: 0 : 0.4,  1 : 0.6",
  POIs: "Which POI types fill those rolls. Example: POIExploreT1:0.5, POIMiningT1:0.5",
  Playfields: "Folder names under Playfields. A second number is the cumulative chance. The last one should be 1. Example: Temperate, 0.5",
};

function Note({ label }: { label: string }) {
  return <FieldNote label={label} note={NOTES[label] || `${label} is stored on the solar system preset.`} />;
}

export function RandomPresetEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const removeCatalogText = usePdaStore((s) => s.removeCatalogText);
  const files = useMemo(
    () => (catalog.texts ?? []).filter((text) => text.role === "randomPreset" && text.text),
    [catalog.texts],
  );
  const [picked, setPicked] = useState(files[0]?.path || "");
  const [draftName, setDraftName] = useState("SolarSystemConfig_Custom");
  const [rawMode, setRawMode] = useState(false);
  const [typeName, setTypeName] = useState("");
  const current = files.find((file) => file.path === picked) ?? files[0];
  const doc = useMemo(() => (current ? parseRandomPreset(current.text) : null), [current]);
  const selectedType = doc?.types.find((block) => `${block.section}:${block.name}` === typeName) ?? doc?.types[0];

  const save = (next: string) => {
    if (!current) return;
    setCatalogText("randomPreset", next, current.path);
  };
  const saveDoc = (next: RandomPresetDoc) => save(writeRandomPreset(next));

  const create = () => {
    const file = presetFileName(draftName);
    const path = `RandomPresets/${file}`;
    if (files.some((item) => item.path === path)) {
      setPicked(path);
      return;
    }
    setCatalogText("randomPreset", blankRandomPreset(file.replace(/\.yaml$/i, "")), path);
    setPicked(path);
  };

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="space-y-2 border-b border-border p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-accent">Random presets</p>
          <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="SolarSystemConfig_MainHot" />
          <Button size="sm" onClick={create}>
            New file
          </Button>
          <p className="text-xs text-subtle">{files.length} yaml files. SolarSystemConfig.yaml is the starter. SolarSystemConfig_Name.yaml is a star or faction preset.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {files.length ? (
            files.map((file) => (
              <button
                key={file.path}
                onClick={() => setPicked(file.path)}
                className={`block w-full truncate px-3 py-2 text-left text-sm ${current?.path === file.path ? "bg-elevated" : "hover:bg-elevated/50"}`}
              >
                {file.path.split("/").pop()}
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted">
              Import the scenario RandomPresets folder, or create a file here. Each yaml is one solar-system recipe.
            </p>
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-6">
        {!current || !doc ? (
          <p className="text-sm text-muted">Select a preset, or create one.</p>
        ) : (
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium">{current.path.split("/").pop()}</h2>
              <Button size="sm" variant="secondary" onClick={() => setRawMode((value) => !value)}>
                {rawMode ? "Form" : "Raw YAML"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const blob = new Blob([current.text], { type: "text/yaml;charset=utf-8" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = current.path.split("/").pop() || "SolarSystemConfig.yaml";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  removeCatalogText("randomPreset", current.path);
                  setPicked(files.find((file) => file.path !== current.path)?.path || "");
                }}
              >
                Remove
              </Button>
            </div>
            {rawMode ? (
              <Textarea className="mt-4 min-h-[480px] font-mono text-xs" value={current.text} onChange={(e) => save(e.target.value)} />
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {doc.scalars.map((scalar) => (
                    <label key={scalar.key} className="block space-y-1">
                      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted">
                        {scalar.key}
                        <Note label={scalar.key} />
                      </span>
                      <Input
                        value={scalar.value}
                        onChange={(e) =>
                          saveDoc({
                            ...doc,
                            scalars: doc.scalars.map((row) => (row.key === scalar.key ? { ...row, value: e.target.value } : row)),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <RowEditor
                  title="Planet counts"
                  note="Counts"
                  rows={doc.countRows}
                  kind="count"
                  onChange={(countRows) => saveDoc({ ...doc, countRows })}
                />
                <RowEditor
                  title="Planet lists"
                  note="Lists"
                  rows={doc.listRows}
                  kind="list"
                  onChange={(listRows) => saveDoc({ ...doc, listRows })}
                />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted">
                      POI counts
                      <Note label="POICount" />
                    </span>
                    <Input value={doc.poiCount} onChange={(e) => saveDoc({ ...doc, poiCount: e.target.value })} />
                  </label>
                  <label className="block space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted">
                      POI types
                      <Note label="POIs" />
                    </span>
                    <Input value={doc.pois} onChange={(e) => saveDoc({ ...doc, pois: e.target.value })} />
                  </label>
                </div>
                <h3 className="mt-8 text-xs uppercase tracking-[0.14em] text-accent">Planet, orbit, and station types</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    className="h-10 min-w-64 rounded-sm border border-border bg-bg px-2 text-sm"
                    value={selectedType ? `${selectedType.section}:${selectedType.name}` : ""}
                    onChange={(e) => setTypeName(e.target.value)}
                  >
                    {doc.types.map((block) => (
                      <option key={`${block.section}:${block.name}`} value={`${block.section}:${block.name}`}>
                        {block.section.replace("Types", "")} — {block.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const block = {
                        ...doc.types[0],
                        section: "PlanetTypes",
                        name: `NewType${doc.types.length + 1}`,
                        playfields: [{ name: "Temperate", weight: "1" }],
                      } as TypeBlock;
                      saveDoc({ ...doc, types: [...doc.types, block] });
                      setTypeName(`${block.section}:${block.name}`);
                    }}
                  >
                    Add type
                  </Button>
                </div>
                {selectedType ? (
                  <TypeForm
                    block={selectedType}
                    onChange={(block) =>
                      saveDoc({
                        ...doc,
                        types: doc.types.map((item) =>
                          item.section === selectedType.section && item.name === selectedType.name ? block : item,
                        ),
                      })
                    }
                    onRemove={() =>
                      saveDoc({
                        ...doc,
                        types: doc.types.filter((item) => !(item.section === selectedType.section && item.name === selectedType.name)),
                      })
                    }
                  />
                ) : (
                  <p className="mt-3 text-sm text-muted">This file has no type blocks yet.</p>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function RowEditor({
  title,
  note,
  rows,
  kind,
  onChange,
}: {
  title: string;
  note: string;
  rows: { comment: string; raw: string }[];
  kind: "count" | "list";
  onChange: (rows: { comment: string; raw: string }[]) => void;
}) {
  return (
    <div className="mt-6">
      <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-accent">
        {title}
        <Note label={note} />
      </p>
      <div className="mt-2 space-y-2">
        {rows.map((row, index) => (
          <div key={`${title}-${index}`} className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
            <Input
              value={row.comment}
              placeholder="Slot label"
              onChange={(e) => onChange(rows.map((item, i) => (i === index ? { ...item, comment: e.target.value } : item)))}
            />
            <Input
              value={row.raw}
              onChange={(e) => onChange(rows.map((item, i) => (i === index ? { ...item, raw: e.target.value } : item)))}
            />
            <Button size="sm" variant="ghost" onClick={() => onChange(rows.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button
        className="mt-2"
        size="sm"
        variant="secondary"
        onClick={() => onChange([...rows, { comment: `${rows.length + 1}`, raw: kind === "count" ? "0 : 1" : "Temperate:1" }])}
      >
        Add row
      </Button>
    </div>
  );
}

function TypeForm({ block, onChange, onRemove }: { block: TypeBlock; onChange: (block: TypeBlock) => void; onRemove: () => void }) {
  const set = (key: keyof TypeBlock, value: string) => onChange({ ...block, [key]: value });
  const fields: [keyof TypeBlock, string][] = [
    ["section", "Section"],
    ["name", "Name"],
    ["color", "Color"],
    ["icon", "Icon"],
    ["climate", "Climate"],
    ["placement", "Placement"],
    ["distance", "Distance"],
    ["moonProb", "MoonProb"],
    ["moonType", "MoonType"],
    ["orbitType", "OrbitType"],
    ["playfieldLevel", "PlayfieldLevel"],
    ["hasOrbit", "HasOrbit"],
    ["hasTerrain", "HasTerrain"],
  ];
  return (
    <div className="mt-4 rounded-md border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
            <Input value={String(block[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
          </label>
        ))}
      </div>
      <p className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted">
        Playfields
        <Note label="Playfields" />
      </p>
      {block.playfields.map((play, index) => (
        <div key={`${play.name}-${index}`} className="mt-2 flex gap-2">
          <Input
            value={play.name}
            onChange={(e) =>
              onChange({
                ...block,
                playfields: block.playfields.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)),
              })
            }
          />
          <Input
            className="w-24"
            value={play.weight}
            onChange={(e) =>
              onChange({
                ...block,
                playfields: block.playfields.map((row, i) => (i === index ? { ...row, weight: e.target.value } : row)),
              })
            }
          />
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...block, playfields: block.playfields.filter((_, i) => i !== index) })}>
            Remove
          </Button>
        </div>
      ))}
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onChange({ ...block, playfields: [...block.playfields, { name: "NewPlayfield", weight: "1" }] })}>
          Add playfield
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          Remove type
        </Button>
      </div>
    </div>
  );
}

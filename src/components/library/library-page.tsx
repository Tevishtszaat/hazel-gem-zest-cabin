import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { BbText } from "@/components/editor/bb-text.tsx";
import { ItemIcon } from "@/components/editor/pda-image.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import {
  blockIdentity,
  classFieldValue,
  compareObjects,
  ENTITY_CLASS_KEYS,
  entityByName,
  entityClassLine,
  fieldIndex,
  floatingBlocks,
  groupByEntityType,
  matchesClassFilter,
  numericIds,
  objectKey,
  objectLabel,
  resolvedField,
  similarBlocks,
  statsFor,
  templateInputs,
  unusedNumericIds,
  withTemplateInputs,
  type EntityClassKey,
} from "@/lib/pda/config-stats.ts";
import { configMeta, type ConfigGroup, type ConfigRole } from "@/lib/pda/config-roles.ts";
import { stringifyEcfObjects, type EcfObject } from "@/lib/pda/ecf.ts";
import {
  catalogText,
  locaLabel,
  localizationTable,
  objectsFor,
  writeLocalization,
} from "@/lib/pda/library.ts";
import { stringifyCsv, upsertCsv } from "@/lib/pda/csv.ts";
import type { CsvTable } from "@/lib/pda/types.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { warmImageCache } from "@/lib/pda/image-store.ts";

type Tab = ConfigRole | "compare" | "localization";

const GROUPS: { id: ConfigGroup; label: string }[] = [
  { id: "catalog", label: "Catalog" },
  { id: "world", label: "World" },
  { id: "loot", label: "Loot" },
  { id: "defs", label: "Defs" },
  { id: "text", label: "Text" },
];

const GROUP_TABS: Record<ConfigGroup, Tab[]> = {
  catalog: ["items", "blocks", "templates", "tokens", "compare"],
  world: ["factions", "eclass", "egroups", "reputation", "warfare", "galaxy"],
  loot: ["containers", "lootgroups", "traders"],
  defs: ["materials", "statuseffects", "globaldefs", "blockgroups", "blockshapes", "animations", "baiconfig"],
  text: ["localization", "sectors"],
};

const WORKSPACE: Partial<Record<Tab, "/library/galaxy" | "/library/reputation" | "/library/warfare">> = {
  galaxy: "/library/galaxy",
  reputation: "/library/reputation",
  warfare: "/library/warfare",
};

function tabLabel(id: Tab) {
  if (id === "compare") return "Compare";
  if (id === "localization") return "Localization";
  return configMeta(id)?.label || id;
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function LibraryPage() {
  const catalog = usePdaStore((s) => s.catalog);
  const [tab, setTab] = useState<Tab>("items");
  const [group, setGroup] = useState<ConfigGroup>("catalog");
  const [compareLeft, setCompareLeft] = useState<string | null>(null);
  const tabs = GROUP_TABS[group];
  const setGroupAndTab = (next: ConfigGroup) => {
    setGroup(next);
    if (!GROUP_TABS[next].includes(tab)) setTab(GROUP_TABS[next][0]!);
  };
  const meta = configMeta(tab);
  return (
    <div className="flex h-dvh flex-col overflow-x-hidden bg-bg text-fg">
      <AppHeader />
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Library</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Edit scenario configs. Items and tokens need numeric Ids. Blocks can use a number or a floating{" "}
            <span className="font-mono text-fg/80">+Block Name</span>.
          </p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3">
        {GROUPS.map((item) => (
          <button
            key={item.id}
            onClick={() => setGroupAndTab(item.id)}
            className={`relative h-9 shrink-0 px-3 text-xs uppercase tracking-[0.14em] ${
              group === item.id ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {item.label}
            {group === item.id ? <span className="absolute inset-x-2 bottom-0 h-px bg-accent" /> : null}
          </button>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3">
        {tabs.map((id) => {
            const href = WORKSPACE[id];
            const active = tab === id;
            const className = `relative h-10 shrink-0 px-3 text-sm ${active ? "text-fg" : "text-muted hover:text-fg"}`;
            if (href) {
              return (
                <Link key={id} to={href} className={className}>
                  {tabLabel(id)}
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-subtle">page</span>
                </Link>
              );
            }
            return (
              <button key={id} onClick={() => setTab(id)} className={className}>
                {tabLabel(id)}
                {active ? <span className="absolute inset-x-2 bottom-0 h-px bg-accent" /> : null}
              </button>
            );
          })}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "compare" ? (
          <BlockCompare initial={compareLeft} />
        ) : tab === "localization" ? (
          <LocaEditor />
        ) : tab === "sectors" ? (
          <YamlEditor role="sectors" fileName="Sectors.yaml" title="Sectors" />
        ) : meta ? (
          <ObjectBrowser
            key={meta.role}
            role={meta.role}
            title={meta.label}
            onCompare={
              meta.role === "blocks"
                ? (name) => {
                    setCompareLeft(name);
                    setGroup("catalog");
                    setTab("compare");
                  }
                : undefined
            }
          />
        ) : null}
      </div>
      {!catalog.texts?.length && !catalog.entries.length ? <p className="sr-only">Empty library</p> : null}
    </div>
  );
}

function ObjectBrowser({
  role,
  title,
  onCompare,
}: {
  role: ConfigRole;
  title: string;
  onCompare?: (name: string) => void;
}) {
  const meta = configMeta(role)!;
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const loca = useMemo(() => localizationTable(catalog), [catalog]);
  const language = usePdaStore((s) => s.project.language) || "English";
  const objects = useMemo(() => objectsFor(catalog, role), [catalog, role]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState<"all" | "missing" | "numeric" | "floating">("all");
  useEffect(() => {
    void warmImageCache();
  }, []);
  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const obj of objects) if (obj.fields.Category) set.add(obj.fields.Category);
    return [...set].sort();
  }, [objects]);
  const [cat, setCat] = useState("all");
  const [classFilter, setClassFilter] = useState<Record<EntityClassKey, string>>({
    EntityType: "all",
    Class: "all",
    Parent: "all",
    Faction: "all",
    Ref: "all",
  });
  const isEntities = role === "eclass";
  const byName = useMemo(() => entityByName(objects), [objects]);
  const classOptions = useMemo(() => {
    if (!isEntities) return null;
    return Object.fromEntries(ENTITY_CLASS_KEYS.map((key) => [key, fieldIndex(objects, key, byName)])) as Record<
      EntityClassKey,
      string[]
    >;
  }, [isEntities, objects, byName]);
  const q = query.trim().toLowerCase();
  const missingIds = objects.filter((obj) => !obj.id);
  const unused = useMemo(() => unusedNumericIds(numericIds(objects)), [objects]);
  const floats = useMemo(() => floatingBlocks(objects), [objects]);
  const usesNumericIds = meta.idMode === "required";
  const usesBlockIds = role === "blocks";
  const usesIds = usesNumericIds || usesBlockIds;
  const visible = objects.filter((obj, index) => {
    const ident = usesBlockIds ? blockIdentity(obj) : null;
    if (idFilter === "missing" && obj.id) return false;
    if (idFilter === "numeric" && ident?.kind !== "numeric") return false;
    if (idFilter === "floating" && ident?.kind !== "floating") return false;
    if (cat !== "all" && obj.fields.Category !== cat) return false;
    if (isEntities && !matchesClassFilter(obj, classFilter, byName)) return false;
    if (!q) return true;
    const label = locaLabel(loca, obj.name, language);
    const idText = ident?.label ?? obj.id ?? objectLabel(obj);
    const classText = isEntities
      ? ENTITY_CLASS_KEYS.map((key) => classFieldValue(obj, key, byName)).join(" ")
      : "";
    return `${objectLabel(obj)} ${obj.name} ${idText} ${label} ${obj.fields.Category ?? ""} ${classText} ${index}`
      .toLowerCase()
      .includes(q);
  });
  const selected = objects.find((o, i) => objectKey(o, i) === picked) ?? visible[0] ?? objects[0];
  const selectedIndex = selected ? objects.indexOf(selected) : -1;
  const hasText = Boolean(catalogText(catalog, role));
  const fileName = catalogText(catalog, role)?.path.split(/[\\/]/).pop() || meta.file;
  const kindName = objects[0]?.kind || meta.kind;

  const persist = (next: EcfObject[]) => {
    setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
  };

  const patch = (index: number, mut: (obj: EcfObject) => EcfObject) => {
    persist(
      objects.map((obj, i) => (i === index ? mut({ ...obj, fields: { ...obj.fields }, children: obj.children }) : obj)),
    );
  };

  const claim = (id?: number) => {
    const used = new Set(objects.map((o) => o.name.toLowerCase()).filter(Boolean));
    const floating = role === "blocks" && id == null;
    const skipId = meta.idMode === "none" || floating;
    const n = id ?? unused.next;
    let name = kindName === "Container" ? "" : skipId ? `New${kindName}` : `New${kindName}${n}`;
    let suffix = 2;
    while (name && used.has(name.toLowerCase())) {
      name = `New${kindName}${suffix}`;
      suffix += 1;
    }
    const fields: Record<string, string> = {};
    if (isEntities) {
      for (const key of ENTITY_CLASS_KEYS) {
        const value = classFilter[key];
        if (value && value !== "all" && value !== "__none") fields[key] = value;
      }
    }
    const obj: EcfObject = {
      kind: kindName,
      plus: meta.plus,
      name,
      id: skipId ? undefined : String(n),
      fields,
      children: role === "templates" ? [{ kind: "Child", plus: false, name: "Inputs", fields: {} }] : undefined,
    };
    persist([...objects, obj]);
    setPicked(objectKey(obj, objects.length));
  };

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${title.toLowerCase()}…`}
            className="h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
          />
          {cats.length && !isEntities ? (
            <select
              className="mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="all">All categories</option>
              {cats.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          ) : null}
          {isEntities && classOptions
            ? ENTITY_CLASS_KEYS.map((key) => (
                <select
                  key={key}
                  className="mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs"
                  value={classFilter[key]}
                  onChange={(e) => setClassFilter((prev) => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="all">All {key === "Ref" ? "templates" : key}</option>
                  {classOptions[key].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                  <option value="__none">Unclassified</option>
                </select>
              ))
            : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => claim()}>
              New {kindName}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!objects.length}
              onClick={() => download(fileName, stringifyEcfObjects(objects), "text/plain")}
            >
              Export
            </Button>
          </div>
          {usesIds ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <button
                className={idFilter === "all" ? "text-fg" : "text-muted hover:text-fg"}
                onClick={() => setIdFilter("all")}
              >
                All
              </button>
              {usesBlockIds ? (
                <>
                  <button
                    className={idFilter === "numeric" ? "text-fg" : "text-muted hover:text-fg"}
                    onClick={() => setIdFilter("numeric")}
                  >
                    Numeric ({objects.filter((o) => blockIdentity(o).kind === "numeric").length})
                  </button>
                  <button
                    className={idFilter === "floating" ? "text-fg" : "text-muted hover:text-fg"}
                    onClick={() => setIdFilter("floating")}
                  >
                    Floating ({floats.length})
                  </button>
                </>
              ) : (
                <button
                  className={idFilter === "missing" ? "text-fg" : "text-muted hover:text-fg"}
                  onClick={() => setIdFilter("missing")}
                >
                  No ID ({missingIds.length})
                </button>
              )}
            </div>
          ) : null}
          <p className="mt-2 text-xs text-subtle">
            {visible.length} / {objects.length}
            {usesNumericIds ? ` · ${unused.total} unused IDs` : ""}
            {usesBlockIds ? ` · ${floats.length} floating · ${unused.total} free numbers` : ""}
          </p>
        </div>
        {usesBlockIds && floats.length ? (
          <div className="border-b border-border p-2">
            <p className="text-xs uppercase tracking-[0.14em] text-accent">Floating IDs</p>
            <p className="mt-1 text-xs text-subtle">
              No number — the game treats <span className="font-mono">+Block Name</span> /{" "}
              <span className="font-mono">Block Name</span> as the ID.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {floats.slice(0, 24).map((obj) => {
                const ident = blockIdentity(obj);
                return (
                  <button
                    key={ident.label}
                    className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted hover:bg-elevated hover:text-fg"
                    onClick={() => {
                      setIdFilter("floating");
                      setPicked(objectKey(obj, objects.indexOf(obj)));
                    }}
                    title={obj.plus ? `{ +Block Name: ${obj.name} }` : `{ Block Name: ${obj.name} }`}
                  >
                    {ident.label}
                  </button>
                );
              })}
              {floats.length > 24 ? <span className="px-1 text-[11px] text-subtle">+{floats.length - 24}</span> : null}
            </div>
          </div>
        ) : null}
        {usesIds && unused.total ? (
          <div className="border-b border-border p-2">
            <p className="text-xs uppercase tracking-[0.14em] text-accent">Empty numeric IDs</p>
            <p className="mt-1 text-xs text-subtle">
              {usesBlockIds
                ? "Optional. Claim a number, or New Block to add a floating +Block Name."
                : `Claim a free Id to add a new ${kindName.toLowerCase()}.`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {unused.ranges.slice(0, 8).map((range) => (
                <button
                  key={`${range.from}-${range.to}`}
                  className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted hover:bg-elevated hover:text-fg"
                  onClick={() => claim(range.from)}
                  title={`${range.count} free · uses ${range.from}`}
                >
                  {range.from === range.to ? range.from : `${range.from}–${range.to}`}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {unused.ids.slice(0, 24).map((id) => (
                <button
                  key={id}
                  className="rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-muted hover:text-fg"
                  onClick={() => claim(id)}
                >
                  {id}
                </button>
              ))}
              {unused.total > 24 ? <span className="px-1 text-[11px] text-subtle">+{unused.total - 24}</span> : null}
            </div>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-auto">
          {!objects.length ? (
            <p className="p-4 text-sm text-muted">
              Import {fileName} from the Import page, or create a new {kindName.toLowerCase()} here.
            </p>
          ) : isEntities ? (
            groupByEntityType(visible.slice(0, 500), byName).map((group) => (
              <div key={group.key}>
                <p className="sticky top-0 z-10 bg-surface px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-accent">
                  {group.key}
                  <span className="ml-2 text-subtle">{group.rows.length}</span>
                </p>
                {group.rows.map((obj) => {
                  const index = objects.indexOf(obj);
                  const label = locaLabel(loca, obj.name, language) || objectLabel(obj);
                  const key = objectKey(obj, index);
                  const line = entityClassLine(obj, byName);
                  return (
                    <button
                      key={key}
                      onClick={() => setPicked(key)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                        selected && objectKey(selected, selectedIndex) === key ? "bg-elevated" : "hover:bg-elevated/50"
                      }`}
                    >
                      <ItemIcon name={obj.name} fields={obj.fields} className="size-6 rounded-sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{label}</span>
                        {line ? <span className="block truncate font-mono text-[11px] text-subtle">{line}</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            visible.slice(0, 500).map((obj) => {
              const index = objects.indexOf(obj);
              const label = locaLabel(loca, obj.name, language) || objectLabel(obj);
              const key = objectKey(obj, index);
              return (
                <button
                  key={key}
                  onClick={() => setPicked(key)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                    selected && objectKey(selected, selectedIndex) === key ? "bg-elevated" : "hover:bg-elevated/50"
                  }`}
                >
                  <ItemIcon name={obj.name} fields={obj.fields} className="size-6 rounded-sm" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {meta.idMode === "none" && role !== "blocks" ? (
                    obj.plus ? (
                      <span className="shrink-0 font-mono text-[11px] text-subtle">+{obj.kind}</span>
                    ) : null
                  ) : usesBlockIds ? (
                    <span
                      className={`shrink-0 font-mono text-xs ${
                        blockIdentity(obj).kind === "floating" ? "text-accent" : "text-subtle"
                      }`}
                    >
                      {blockIdentity(obj).label}
                    </span>
                  ) : (
                    <span className={`shrink-0 font-mono text-xs ${obj.id ? "text-subtle" : "text-warn"}`}>
                      {obj.id || "no id"}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-6">
        {selected && selectedIndex >= 0 ? (
          <ObjectDetail
            obj={selected}
            role={role}
            label={locaLabel(loca, selected.name, language)}
            thin={!hasText}
            onPatch={(mut) => patch(selectedIndex, mut)}
            onCompare={onCompare}
            inherit={isEntities ? (key) => resolvedField(selected, key, byName) : undefined}
          />
        ) : (
          <p className="text-sm text-muted">Select an entry.</p>
        )}
      </section>
    </div>
  );
}

function ObjectDetail({
  obj,
  role,
  label,
  thin,
  onPatch,
  onCompare,
  inherit,
}: {
  obj: EcfObject;
  role: ConfigRole;
  label: string;
  thin: boolean;
  onPatch: (mut: (obj: EcfObject) => EcfObject) => void;
  onCompare?: (name: string) => void;
  inherit?: (key: string) => string;
}) {
  const meta = configMeta(role);
  const preferred = statsFor(role);
  const extra = Object.keys(obj.fields).filter((k) => k !== "Label" && !preferred.includes(k));
  const [newKey, setNewKey] = useState("");
  const [newInput, setNewInput] = useState({ name: "", count: "1" });
  const inputs = role === "templates" ? templateInputs(obj) : [];
  const setField = (key: string, value: string) =>
    onPatch((cur) => ({ ...cur, fields: { ...cur.fields, [key]: value } }));
  const setInputs = (rows: { name: string; count: string }[]) => onPatch((cur) => withTemplateInputs(cur, rows));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start gap-4">
        <ItemIcon name={obj.name} fields={obj.fields} className="size-16 rounded-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.14em] text-accent">{obj.kind}</p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight">{label || objectLabel(obj)}</h2>
          <p className="mt-1 font-mono text-sm text-muted">
            {objectLabel(obj)}
            {obj.id ? ` · Id ${obj.id}` : meta?.idMode === "required" ? " · no id" : ""}
          </p>
          {role === "eclass" ? (
            <p className="mt-2 flex flex-wrap gap-1 text-[11px]">
              {ENTITY_CLASS_KEYS.map((key) => {
                const own = (obj.fields[key] ?? "").trim();
                const value = own || inherit?.(key) || "";
                if (!value) return null;
                return (
                  <span
                    key={key}
                    className={`rounded-sm px-1.5 py-0.5 font-mono ${own ? "bg-elevated text-fg" : "bg-bg text-subtle"}`}
                    title={own ? key : `${key} inherited from ${obj.fields.Ref || "Ref"}`}
                  >
                    {key}:{value}
                  </span>
                );
              })}
            </p>
          ) : null}
        </div>
        {onCompare ? (
          <Button size="sm" variant="secondary" onClick={() => onCompare(obj.name)}>
            Compare
          </Button>
        ) : null}
      </div>
      {thin ? (
        <p className="mt-4 text-sm text-muted">
          Names only until you re-import the config. Editing a field here will write a new {role} config into this
          workshop.
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <Input value={obj.name} onChange={(e) => onPatch((cur) => ({ ...cur, name: e.target.value }))} />
        </Field>
        {meta?.idMode === "none" && role !== "blocks" ? null : (
          <Field label={role === "blocks" ? "Numeric Id (optional)" : "Id"}>
            <Input
              value={obj.id ?? ""}
              placeholder={role === "blocks" ? "empty — Name is the floating ID" : "empty — assign an unused Id"}
              onChange={(e) => onPatch((cur) => ({ ...cur, id: e.target.value || undefined }))}
            />
          </Field>
        )}
        <div className="sm:col-span-2">
          <Field label="Header">
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-sm border border-border bg-bg px-3 font-mono text-sm"
              onClick={() => onPatch((cur) => ({ ...cur, plus: !cur.plus }))}
            >
              <span className="truncate">
                {`{ ${obj.plus ? "+" : ""}${obj.kind}${obj.id ? ` Id: ${obj.id}` : ""}${obj.name ? ` Name: ${obj.name}` : ""} }`}
              </span>
              <span className="ml-2 shrink-0 text-xs uppercase tracking-[0.12em] text-accent">
                {obj.plus ? `+${obj.kind}` : obj.kind}
              </span>
            </button>
          </Field>
        </div>
      </div>
      <h3 className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-accent">Stats</h3>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {preferred.map((key) => {
          const inherited = inherit && !(obj.fields[key] ?? "").trim() ? inherit(key) : "";
          return (
            <Field key={key} label={key}>
              <Input
                value={obj.fields[key] ?? ""}
                placeholder={inherited ? `from ${obj.fields.Ref || "template"}: ${inherited}` : undefined}
                onChange={(e) => setField(key, e.target.value)}
              />
            </Field>
          );
        })}
      </div>
      {extra.length ? (
        <>
          <h3 className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted">More fields</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {extra.map((key) => (
              <Field key={key} label={key}>
                <Input value={obj.fields[key] ?? ""} onChange={(e) => setField(key, e.target.value)} />
              </Field>
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Input
          className="h-8"
          value={newKey}
          placeholder="Add field name"
          onChange={(e) => setNewKey(e.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!newKey.trim()}
          onClick={() => {
            setField(newKey.trim(), "");
            setNewKey("");
          }}
        >
          Add field
        </Button>
      </div>
      {role === "templates" ? (
        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Child Inputs</h3>
          <div className="mt-2 space-y-2">
            {inputs.map((row, index) => (
              <div key={`${row.name}-${index}`} className="grid grid-cols-[1fr_80px_auto] gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => setInputs(inputs.map((r, i) => (i === index ? { ...r, name: e.target.value } : r)))}
                />
                <Input
                  value={row.count}
                  onChange={(e) => setInputs(inputs.map((r, i) => (i === index ? { ...r, count: e.target.value } : r)))}
                />
                <Button size="sm" variant="ghost" onClick={() => setInputs(inputs.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_80px_auto] gap-2">
              <Input
                value={newInput.name}
                placeholder="Ingredient name"
                onChange={(e) => setNewInput((s) => ({ ...s, name: e.target.value }))}
              />
              <Input value={newInput.count} onChange={(e) => setNewInput((s) => ({ ...s, count: e.target.value }))} />
              <Button
                size="sm"
                variant="secondary"
                disabled={!newInput.name.trim()}
                onClick={() => {
                  setInputs([...inputs, { name: newInput.name.trim(), count: newInput.count || "1" }]);
                  setNewInput({ name: "", count: "1" });
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ChildrenEditor obj={obj} onPatch={onPatch} />
      )}
    </div>
  );
}

function ChildrenEditor({
  obj,
  onPatch,
}: {
  obj: EcfObject;
  onPatch: (mut: (obj: EcfObject) => EcfObject) => void;
}) {
  const children = obj.children ?? [];
  const setChildren = (next: EcfObject[]) => onPatch((cur) => ({ ...cur, children: next }));
  const [newChild, setNewChild] = useState("Items");
  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Child blocks</h3>
      <p className="mt-1 text-xs text-subtle">Loot rows, sensors, modify stats — nested {`{ Child … }`}</p>
      <div className="mt-2 space-y-3">
        {children.map((child, index) => (
          <div key={`${child.name}-${index}`} className="rounded-sm border border-border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Input
                className="h-8 font-mono text-xs"
                value={child.name}
                onChange={(e) =>
                  setChildren(children.map((c, i) => (i === index ? { ...c, name: e.target.value } : c)))
                }
              />
              <Button size="sm" variant="ghost" onClick={() => setChildren(children.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(child.fields).map(([key, value]) => (
                <Field key={key} label={key}>
                  <Input
                    value={value}
                    onChange={(e) =>
                      setChildren(
                        children.map((c, i) =>
                          i === index ? { ...c, fields: { ...c.fields, [key]: e.target.value } } : c,
                        ),
                      )
                    }
                  />
                </Field>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => {
                const key = `Field_${Object.keys(child.fields).length}`;
                setChildren(
                  children.map((c, i) => (i === index ? { ...c, fields: { ...c.fields, [key]: "" } } : c)),
                );
              }}
            >
              Add field
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            className="h-8 w-40"
            value={newChild}
            placeholder="Child name"
            onChange={(e) => setNewChild(e.target.value)}
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!newChild.trim()}
            onClick={() => {
              setChildren([...children, { kind: "Child", plus: false, name: newChild.trim(), fields: {} }]);
              setNewChild("Items");
            }}
          >
            Add child
          </Button>
        </div>
      </div>
    </div>
  );
}

function YamlEditor({ role, fileName, title }: { role: string; fileName: string; title: string }) {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const text = catalogText(catalog, role)?.text ?? "";
  return (
    <div className="mx-auto h-full max-w-4xl overflow-auto p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted">{fileName} — YAML. Saved into this workshop on every keystroke.</p>
        </div>
        <Button size="sm" variant="secondary" disabled={!text.trim()} onClick={() => download(fileName, text, "text/yaml")}>
          Export
        </Button>
      </div>
      <Textarea
        className="min-h-[60vh] font-mono text-xs leading-5"
        value={text}
        placeholder={"Sectors:\n  - Coordinates: [0, 0, 0]\n    Playfields:\n      - ['0, 0, 0', My Planet, Planet]"}
        onChange={(e) => setCatalogText(role, e.target.value, catalogText(catalog, role)?.path || fileName)}
      />
    </div>
  );
}

function BlockCompare({ initial }: { initial: string | null }) {
  const catalog = usePdaStore((s) => s.catalog);
  const loca = useMemo(() => localizationTable(catalog), [catalog]);
  const language = usePdaStore((s) => s.project.language) || "English";
  const blocks = useMemo(() => objectsFor(catalog, "blocks"), [catalog]);
  const [leftName, setLeftName] = useState(initial || blocks[0]?.name || "");
  const [rightName, setRightName] = useState("");
  const left = blocks.find((b) => b.name === leftName) ?? blocks[0];
  const peers = left ? similarBlocks(blocks, left) : [];
  const pool = peers.length ? peers : blocks.filter((b) => b.name !== left?.name);
  const right = blocks.find((b) => b.name === rightName) || pool[0];
  const rows = left && right ? compareObjects(left, right, statsFor("blocks")) : [];

  useEffect(() => {
    if (initial) setLeftName(initial);
  }, [initial]);

  useEffect(() => {
    if (rightName && pool.some((p) => p.name === rightName)) return;
    setRightName(pool[0]?.name || "");
  }, [leftName, blocks]);

  if (!blocks.length) {
    return <p className="p-6 text-sm text-muted">Import BlocksConfig.ecf to compare blocks.</p>;
  }

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-auto border-r border-border p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-accent">
          {peers.length ? "Same category" : "All blocks"}
        </p>
        <p className="mt-1 text-xs text-subtle">{left?.fields.Category || left?.fields.Group || "Uncategorized"}</p>
        <div className="mt-3 space-y-1">
          {pool.length ? (
            pool.map((b) => (
              <button
                key={b.name}
                onClick={() => setRightName(b.name)}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm ${
                  right?.name === b.name ? "bg-elevated" : "hover:bg-elevated/50"
                }`}
              >
                <ItemIcon name={b.name} fields={b.fields} className="size-6" />
                <span className="truncate">{locaLabel(loca, b.name, language) || b.name}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">No other blocks in this category.</p>
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Block A">
            <select
              className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
              value={left?.name || ""}
              onChange={(e) => setLeftName(e.target.value)}
            >
              {blocks.map((b) => (
                <option key={b.name} value={b.name}>
                  {locaLabel(loca, b.name, language) || b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Block B">
            <select
              className="h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm"
              value={right?.name || ""}
              onChange={(e) => setRightName(e.target.value)}
            >
              {(pool.length ? pool : blocks.filter((b) => b.name !== left?.name)).map((b) => (
                <option key={b.name} value={b.name}>
                  {locaLabel(loca, b.name, language) || b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {left && right ? (
          <>
            <div className="mb-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ItemIcon name={left.name} fields={left.fields} className="size-10" />
                <div>
                  <p className="font-medium">{locaLabel(loca, left.name, language) || left.name}</p>
                  <p className="font-mono text-xs text-subtle">{left.name}</p>
                </div>
              </div>
              <span className="text-muted">vs</span>
              <div className="flex items-center gap-2">
                <ItemIcon name={right.name} fields={right.fields} className="size-10" />
                <div>
                  <p className="font-medium">{locaLabel(loca, right.name, language) || right.name}</p>
                  <p className="font-mono text-xs text-subtle">{right.name}</p>
                </div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.12em] text-subtle">
                <tr>
                  <th className="py-2">Stat</th>
                  <th className="py-2">A</th>
                  <th className="py-2">B</th>
                  <th className="py-2">Δ B−A</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.key} className={row.left !== row.right ? "bg-elevated/40" : ""}>
                    <td className="py-1.5 text-muted">{row.key}</td>
                    <td className="py-1.5 font-mono text-xs">{row.left || "—"}</td>
                    <td className="py-1.5 font-mono text-xs">{row.right || "—"}</td>
                    <td
                      className={`py-1.5 font-mono text-xs ${
                        row.delta == null || row.delta === 0
                          ? "text-subtle"
                          : row.delta > 0
                            ? "text-accent"
                            : "text-danger"
                      }`}
                    >
                      {row.delta == null || row.delta === 0 ? "—" : row.delta > 0 ? `+${row.delta}` : String(row.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function LocaEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const projectLang = usePdaStore((s) => s.project.language);
  const [table, setTable] = useState<CsvTable>(() => localizationTable(catalog));
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const language = table.languages.includes(projectLang) ? projectLang : table.languages[0] || "English";
  const [lang, setLang] = useState(language);
  const q = query.trim().toLowerCase();
  const keys = Object.keys(table.rows).filter((key) => {
    if (!q) return true;
    const rec = table.rows[key] ?? {};
    return key.toLowerCase().includes(q) || Object.values(rec).some((v) => v.toLowerCase().includes(q));
  });
  const selectedKey = picked && table.rows[picked] ? picked : keys[0] ?? null;
  const selected = selectedKey ? table.rows[selectedKey] : null;

  const commit = (next: CsvTable) => {
    setTable(next);
    setCatalogText(
      "localization",
      writeLocalization(next),
      catalogText(catalog, "localization")?.path || "Localization.csv",
    );
  };

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter keys or text…"
            className="h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              className="h-8 rounded-sm border border-border bg-surface px-2 text-xs"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {table.languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                let n = 1;
                let key = `txt_new_${n}`;
                while (table.rows[key]) {
                  n += 1;
                  key = `txt_new_${n}`;
                }
                const next = structuredClone(table);
                upsertCsv(next, key, lang, "");
                commit(next);
                setPicked(key);
              }}
            >
              Add key
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!Object.keys(table.rows).length}
              onClick={() => download("Localization.csv", stringifyCsv(table), "text/csv")}
            >
              Export
            </Button>
          </div>
          <p className="mt-2 text-xs text-subtle">
            {keys.length} / {Object.keys(table.rows).length} keys
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {!keys.length ? (
            <p className="p-4 text-sm text-muted">Import Localization.csv from the Import page.</p>
          ) : (
            keys.slice(0, 400).map((key) => (
              <button
                key={key}
                onClick={() => setPicked(key)}
                className={`block w-full truncate px-3 py-1.5 text-left text-sm ${
                  selectedKey === key ? "bg-elevated" : "hover:bg-elevated/50"
                }`}
              >
                <span className="font-mono text-xs text-subtle">{key}</span>
                <span className="mt-0.5 block truncate text-sm">{table.rows[key]?.[lang] || "—"}</span>
              </button>
            ))
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-5">
        {selectedKey && selected ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-accent">Localization key</p>
                <h2 className="mt-1 font-mono text-lg">{selectedKey}</h2>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  const next = structuredClone(table);
                  delete next.rows[selectedKey];
                  commit(next);
                  setPicked(null);
                }}
              >
                Delete
              </Button>
            </div>
            {table.languages.map((l) => (
              <Field key={l} label={l}>
                <Textarea
                  value={selected[l] ?? ""}
                  onChange={(e) => {
                    const next = structuredClone(table);
                    upsertCsv(next, selectedKey, l, e.target.value);
                    commit(next);
                  }}
                />
                {l === lang ? (
                  <BbText as="div" className="mt-2 text-sm leading-relaxed text-muted" text={selected[l] ?? ""} />
                ) : null}
              </Field>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-muted">Select a key, or import Localization.csv.</p>
        )}
      </section>
    </div>
  );
}

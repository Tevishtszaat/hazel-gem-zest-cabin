import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { BbText } from "@/components/editor/bb-text.tsx";
import { ItemIcon } from "@/components/editor/pda-image.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import { GalaxyEditor, ReputationTable, WarfareEditor } from "@/components/library/config-tabs.tsx";
import { compareObjects, numericIds, similarBlocks, statsFor, templateInputs, unusedNumericIds, withTemplateInputs } from "@/lib/pda/config-stats.ts";
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

type Tab = "items" | "blocks" | "templates" | "tokens" | "reputation" | "warfare" | "galaxy" | "compare" | "localization";

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
  const [compareLeft, setCompareLeft] = useState<string | null>(null);
  const tabs: { id: Tab; label: string }[] = [
    { id: "items", label: "Items" },
    { id: "blocks", label: "Blocks" },
    { id: "templates", label: "Templates" },
    { id: "tokens", label: "Tokens" },
    { id: "reputation", label: "Reputation" },
    { id: "warfare", label: "Warfare" },
    { id: "galaxy", label: "Galaxy" },
    { id: "compare", label: "Compare" },
    { id: "localization", label: "Localization" },
  ];
  return (
    <div className="flex h-dvh flex-col overflow-x-hidden bg-bg text-fg">
      <AppHeader />
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Library</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Edit items, blocks, templates, reputation, faction warfare, and galaxy config. Unused IDs show as empty
            slots you can claim.
          </p>
        </div>
      </div>
      <div className="flex gap-1 border-b border-border px-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`relative h-10 px-3 text-sm ${tab === item.id ? "text-fg" : "text-muted hover:text-fg"}`}
          >
            {item.label}
            {tab === item.id ? <span className="absolute inset-x-2 bottom-0 h-px bg-accent" /> : null}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "items" ? <ObjectBrowser role="items" title="Items" /> : null}
        {tab === "blocks" ? (
          <ObjectBrowser
            role="blocks"
            title="Blocks"
            onCompare={(name) => {
              setCompareLeft(name);
              setTab("compare");
            }}
          />
        ) : null}
        {tab === "tokens" ? <ObjectBrowser role="tokens" title="Tokens" /> : null}
        {tab === "templates" ? <ObjectBrowser role="templates" title="Templates" /> : null}
        {tab === "reputation" ? <ReputationTable /> : null}
        {tab === "warfare" ? <WarfareEditor /> : null}
        {tab === "galaxy" ? <GalaxyEditor /> : null}
        {tab === "compare" ? <BlockCompare initial={compareLeft} /> : null}
        {tab === "localization" ? <LocaEditor /> : null}
      </div>
      {!catalog.texts?.length && !catalog.entries.length ? (
        <p className="sr-only">Empty library</p>
      ) : null}
    </div>
  );
}

function ObjectBrowser({
  role,
  title,
  onCompare,
}: {
  role: "items" | "blocks" | "tokens" | "templates";
  title: string;
  onCompare?: (name: string) => void;
}) {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const loca = useMemo(() => localizationTable(catalog), [catalog]);
  const language = usePdaStore((s) => s.project.language) || "English";
  const objects = useMemo(() => objectsFor(catalog, role), [catalog, role]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState<"all" | "missing">("all");
  useEffect(() => {
    void warmImageCache();
  }, []);
  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const obj of objects) if (obj.fields.Category) set.add(obj.fields.Category);
    return [...set].sort();
  }, [objects]);
  const [cat, setCat] = useState("all");
  const q = query.trim().toLowerCase();
  const missingIds = objects.filter((obj) => !obj.id);
  const unused = useMemo(() => unusedNumericIds(numericIds(objects)), [objects]);
  const usesIds = role === "items" || role === "blocks" || role === "tokens";
  const visible = objects.filter((obj) => {
    if (idFilter === "missing" && obj.id) return false;
    if (cat !== "all" && obj.fields.Category !== cat) return false;
    if (!q) return true;
    const label = locaLabel(loca, obj.name, language);
    return `${obj.name} ${obj.id ?? ""} ${label} ${obj.fields.Category ?? ""}`.toLowerCase().includes(q);
  });
  const selected = objects.find((o) => o.name === picked) ?? visible[0];
  const hasText = Boolean(catalogText(catalog, role));
  const fileName =
    role === "items"
      ? "ItemsConfig.ecf"
      : role === "blocks"
        ? "BlocksConfig.ecf"
        : role === "templates"
          ? "Templates.ecf"
          : "TokenConfig.ecf";
  const kindName = role === "items" ? "Item" : role === "blocks" ? "Block" : role === "templates" ? "Template" : "Token";

  const persist = (next: EcfObject[]) => {
    setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
  };

  const patch = (name: string, mut: (obj: EcfObject) => EcfObject) => {
    persist(objects.map((obj) => (obj.name === name ? mut({ ...obj, fields: { ...obj.fields }, children: obj.children }) : obj)));
  };

  const claim = (id?: number) => {
    const used = new Set(objects.map((o) => o.name.toLowerCase()));
    let n = id ?? unused.next;
    let name = role === "templates" ? "NewTemplate" : `New${kindName}${n}`;
    let suffix = 2;
    while (used.has(name.toLowerCase())) {
      name = role === "templates" ? `NewTemplate${suffix}` : `New${kindName}${n}_${suffix}`;
      suffix += 1;
    }
    const obj: EcfObject = {
      kind: kindName,
      plus: true,
      name,
      id: role === "templates" ? undefined : String(n),
      fields: {},
      children: role === "templates" ? [{ kind: "Child", plus: false, name: "Inputs", fields: {} }] : undefined,
    };
    persist([...objects, obj]);
    setPicked(name);
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
          {cats.length ? (
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
              <button
                className={idFilter === "missing" ? "text-fg" : "text-muted hover:text-fg"}
                onClick={() => setIdFilter("missing")}
              >
                No ID ({missingIds.length})
              </button>
            </div>
          ) : null}
          <p className="mt-2 text-xs text-subtle">
            {visible.length} / {objects.length}
            {usesIds ? ` · ${unused.total} unused IDs` : ""}
          </p>
        </div>
        {usesIds && unused.total ? (
          <div className="border-b border-border p-2">
            <p className="text-xs uppercase tracking-[0.14em] text-accent">Empty IDs</p>
            <p className="mt-1 text-xs text-subtle">Claim a free Id to add a new {kindName.toLowerCase()}.</p>
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
          ) : (
            visible.slice(0, 500).map((obj) => {
              const label = locaLabel(loca, obj.name, language);
              return (
                <button
                  key={obj.name}
                  onClick={() => setPicked(obj.name)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                    selected?.name === obj.name ? "bg-elevated" : "hover:bg-elevated/50"
                  }`}
                >
                  <ItemIcon name={obj.name} fields={obj.fields} className="size-6 rounded-sm" />
                  <span className="min-w-0 flex-1 truncate">{label || obj.name}</span>
                  {role === "templates" ? null : (
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
        {selected ? (
          <ObjectDetail
            obj={selected}
            role={role}
            label={locaLabel(loca, selected.name, language)}
            thin={!hasText}
            onPatch={(mut) => patch(selected.name, mut)}
            onCompare={onCompare}
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
}: {
  obj: EcfObject;
  role: "items" | "blocks" | "tokens" | "templates";
  label: string;
  thin: boolean;
  onPatch: (mut: (obj: EcfObject) => EcfObject) => void;
  onCompare?: (name: string) => void;
}) {
  const preferred = statsFor(role);
  const extra = Object.keys(obj.fields).filter((k) => k !== "Label" && !preferred.includes(k));
  const [newKey, setNewKey] = useState("");
  const [newInput, setNewInput] = useState({ name: "", count: "1" });
  const inputs = role === "templates" ? templateInputs(obj) : [];
  const setField = (key: string, value: string) =>
    onPatch((cur) => ({ ...cur, fields: { ...cur.fields, [key]: value } }));
  const setInputs = (rows: { name: string; count: string }[]) =>
    onPatch((cur) => withTemplateInputs(cur, rows));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start gap-4">
        <ItemIcon name={obj.name} fields={obj.fields} className="size-16 rounded-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.14em] text-accent">{obj.kind}</p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight">{label || obj.name}</h2>
          <p className="mt-1 font-mono text-sm text-muted">
            {obj.name}
            {obj.id ? ` · Id ${obj.id}` : role === "templates" ? "" : " · no id"}
          </p>
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
        {role === "templates" ? null : (
          <Field label="Id">
            <Input
              value={obj.id ?? ""}
              placeholder="empty — assign an unused Id"
              onChange={(e) => onPatch((cur) => ({ ...cur, id: e.target.value || undefined }))}
            />
          </Field>
        )}
      </div>
      <h3 className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-accent">Stats</h3>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {preferred.map((key) => (
          <Field key={key} label={key}>
            <Input value={obj.fields[key] ?? ""} onChange={(e) => setField(key, e.target.value)} />
          </Field>
        ))}
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
                  onChange={(e) =>
                    setInputs(inputs.map((r, i) => (i === index ? { ...r, name: e.target.value } : r)))
                  }
                />
                <Input
                  value={row.count}
                  onChange={(e) =>
                    setInputs(inputs.map((r, i) => (i === index ? { ...r, count: e.target.value } : r)))
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInputs(inputs.filter((_, i) => i !== index))}
                >
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
              <Input
                value={newInput.count}
                onChange={(e) => setNewInput((s) => ({ ...s, count: e.target.value }))}
              />
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
      ) : null}
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
                        row.delta == null || row.delta === 0 ? "text-subtle" : row.delta > 0 ? "text-accent" : "text-danger"
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

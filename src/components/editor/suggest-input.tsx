import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import {
  BUILTIN_NAMES,
  catalogLoaded,
  lookupCatalog,
  splitTokens,
  suggestionsFor,
  type CatalogKind,
  type ScenarioCatalog,
} from "@/lib/pda/scenario-index.ts";

export function SuggestInput({
  value,
  onChange,
  catalog,
  kinds,
  placeholder,
  list = true,
}: {
  value: string;
  onChange: (value: string) => void;
  catalog: ScenarioCatalog;
  kinds: CatalogKind[];
  placeholder?: string;
  list?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const token = list ? (value.split(",").pop() ?? "").trim() : value.trim();
  const hits = useMemo(
    () => (catalogLoaded(catalog) && kinds.length ? suggestionsFor(catalog, kinds, token) : []),
    [catalog, kinds, token],
  );

  const apply = (name: string) => {
    if (!list) {
      onChange(name);
      setOpen(false);
      return;
    }
    const parts = value.split(",").map((p) => p.trim());
    parts[parts.length - 1] = name;
    onChange(parts.filter(Boolean).join(", "));
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) {
            e.preventDefault();
            apply(hits[0].name);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && hits.length ? (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg">
          {hits.map((hit) => (
            <li key={`${hit.kind}:${hit.name}`}>
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-elevated"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => apply(hit.name)}
              >
                <span className="truncate">{hit.label && hit.label !== hit.name ? `${hit.name} · ${hit.label}` : hit.name}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-subtle">{hit.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function TokenStatus({
  value,
  catalog,
  kinds,
}: {
  value: string;
  catalog: ScenarioCatalog;
  kinds: CatalogKind[];
}) {
  if (!catalogLoaded(catalog) || !kinds.length || !value.trim()) return null;
  const tokens = splitTokens(value);
  if (!tokens.length) return null;
  return (
    <ul className="flex flex-wrap gap-1 pt-1">
      {tokens.slice(0, 12).map((token) => {
        const hit = lookupCatalog(catalog, token);
        const builtin = BUILTIN_NAMES.has(token);
        const ok = Boolean(hit) || builtin || kinds.length === 0;
        return (
          <li
            key={token}
            className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] ${ok ? "bg-elevated text-muted" : "bg-danger/15 text-danger"}`}
            title={hit ? `${hit.kind} · ${hit.source}` : ok ? "Built-in" : "Not in loaded scenario files"}
          >
            {token}
            {hit?.kind ? ` · ${hit.kind}` : ok ? "" : " · missing"}
          </li>
        );
      })}
    </ul>
  );
}

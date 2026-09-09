import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import type { DialogueClip } from "@/lib/pda/dialogues.ts";
import { isGotoReset, setGoto } from "@/lib/pda/dialogues.ts";

const PALETTE_KEY = "pulsepda.dlg.palette";
const CLIP_KEY = "pulsepda.dlg.clip";
const BOOK_KEY = "pulsepda.dlg.bookmarks";
const SCROLL_KEY = "pulsepda.dlg.scroll";
const FILTER_KEY = "pulsepda.dlg.filter";

export const DEFAULT_PALETTE = [
  "fddc1e",
  "ffcc33",
  "e11d48",
  "22c55e",
  "38bdf8",
  "a78bfa",
  "fb923c",
  "ffffff",
  "019245",
  "fd9b00",
];

function lsGet(key: string) {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadPalette(): string[] {
  try {
    const raw = JSON.parse(lsGet(PALETTE_KEY) || "[]");
    if (Array.isArray(raw) && raw.length) return raw.map(String);
  } catch {
    /* ignore */
  }
  return DEFAULT_PALETTE;
}

export function savePalette(colors: string[]) {
  lsSet(PALETTE_KEY, JSON.stringify(colors));
}

export function loadClip(): DialogueClip | null {
  try {
    const raw = JSON.parse(lsGet(CLIP_KEY) || "null");
    if (raw && typeof raw.kind === "string") return raw as DialogueClip;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveClip(clip: DialogueClip) {
  lsSet(CLIP_KEY, JSON.stringify(clip));
}

export function loadBookmarks(): string[] {
  try {
    const raw = JSON.parse(lsGet(BOOK_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(names: string[]) {
  lsSet(BOOK_KEY, JSON.stringify(names));
}

export function loadFilter() {
  return lsGet(FILTER_KEY) || "";
}

export function saveFilter(q: string) {
  lsSet(FILTER_KEY, q);
}

export function loadScroll() {
  return Number(lsGet(SCROLL_KEY) || "0") || 0;
}

export function saveScroll(n: number) {
  lsSet(SCROLL_KEY, String(n));
}

export function FormatBar({
  onInsert,
  mode,
  onMode,
}: {
  onInsert: (open: string, close?: string) => void;
  mode: "bb" | "tmp";
  onMode: (m: "bb" | "tmp") => void;
}) {
  const [palette, setPalette] = useState(loadPalette);
  const [custom, setCustom] = useState("ffcc33");
  const wrap = (hex: string) => {
    const h = hex.replace("#", "");
    if (mode === "tmp") onInsert(`<color=#${h}>`, "</color>");
    else onInsert(`[c][${h}]`, "[-][/c]");
  };
  const buttons =
    mode === "tmp"
      ? [
          { label: "B", open: "<b>", close: "</b>" },
          { label: "I", open: "<i>", close: "</i>" },
          { label: "U", open: "<u>", close: "</u>" },
          { label: "Size", open: "<size=20>", close: "</size>" },
          { label: "Center", open: "<align=center>", close: "</align>" },
          { label: "\\n", open: "\\n" },
        ]
      : [
          { label: "B", open: "[b]", close: "[/b]" },
          { label: "I", open: "[i]", close: "[/i]" },
          { label: "U", open: "[u]", close: "[/u]" },
          { label: "{Player}", open: "{PlayerName}" },
          { label: "{NPC}", open: "{NPCName}" },
          { label: "@p", open: "@p3" },
          { label: "@w", open: "@w2" },
        ];
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={`h-6 rounded-sm border px-1.5 text-[10px] uppercase ${mode === "bb" ? "border-accent text-fg" : "border-border text-muted"}`}
          onClick={() => onMode("bb")}
        >
          BB
        </button>
        <button
          type="button"
          className={`h-6 rounded-sm border px-1.5 text-[10px] uppercase ${mode === "tmp" ? "border-accent text-fg" : "border-border text-muted"}`}
          onClick={() => onMode("tmp")}
        >
          TMP
        </button>
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            className="h-6 rounded-sm border border-border px-1.5 text-[10px] uppercase tracking-wide text-muted hover:text-fg"
            onClick={() => onInsert(b.open, b.close)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {palette.map((hex) => (
          <button
            key={hex}
            type="button"
            title={`#${hex}`}
            className="size-5 rounded-sm border border-border"
            style={{ background: `#${hex}` }}
            onClick={() => wrap(hex)}
            onContextMenu={(e) => {
              e.preventDefault();
              const next = palette.filter((c) => c !== hex);
              setPalette(next);
              savePalette(next);
            }}
          />
        ))}
        <input
          type="color"
          className="size-6 cursor-pointer bg-transparent"
          value={`#${custom}`}
          onChange={(e) => setCustom(e.target.value.replace("#", ""))}
        />
        <button
          type="button"
          className="h-6 rounded-sm border border-border px-1.5 text-[10px] text-muted hover:text-fg"
          onClick={() => {
            wrap(custom);
            if (!palette.includes(custom)) {
              const next = [...palette, custom].slice(-16);
              setPalette(next);
              savePalette(next);
            }
          }}
        >
          Use
        </button>
      </div>
    </div>
  );
}

export function CodeField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const html = useMemo(() => highlightCSharp(value), [value]);
  const lines = value.split("\n").length;
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <div className="flex items-center justify-between border-b border-border bg-elevated px-2 py-1 text-[10px] uppercase tracking-wide text-subtle">
        <span>Execute editor · C#</span>
        {/["']/.test(value) ? <span className="text-accent">CDATA on export</span> : null}
      </div>
      <div className="grid grid-cols-[2rem_minmax(0,1fr)]">
        <pre className="select-none bg-elevated/60 py-2 text-right font-mono text-[11px] leading-5 text-subtle">
          {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
        </pre>
        <Textarea
          className="min-h-28 rounded-none border-0 bg-transparent py-2 font-mono text-xs leading-5"
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {value ? (
        <pre
          className="max-h-24 overflow-auto border-t border-border bg-bg px-3 py-2 font-mono text-[11px] leading-5 text-muted"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function highlightCSharp(src: string) {
  const keywords = /\b(if|else|return|true|false|new|int|string|var|void|null|this|Player)\b/g;
  const fns =
    /\b(AddItem|RemoveItem|HasItem|GetReputation|AddReputation|OpenTraderWindow|IsPdaChapterActive|IsPdaTaskActive|SetNPCName|SetSignal|IsSignalSet|OpenHtmlWindow|CloseHtmlWindow|AddItemsFromContainer|UnlockTechTreeItem|IsTechTreeItemUnlocked|CallLater|GotoAndReset|GetFaction|GetStructure|IsBlockActive|SetBlockActive|LocF|GetInstanceTicket)\b/g;
  return escapeHtml(src)
    .replace(keywords, '<span style="color:#93c5fd">$1</span>')
    .replace(fns, '<span style="color:#7dd3c7">$1</span>')
    .replace(/('(?:\\'|[^'])*'|"(?:\\"|[^"])*")/g, '<span style="color:#fcd34d">$1</span>')
    .replace(/(\/\/.*)$/gm, '<span style="color:#6b7280">$1</span>');
}

export function GotoToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const on = isGotoReset(value);
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <input type="checkbox" checked={on} onChange={(e) => onChange(setGoto(value, e.target.checked))} />
      GotoAndReset
    </label>
  );
}

export function DragHandle({ children }: { children: ReactNode }) {
  return (
    <div draggable className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

export function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function ForeignImport({
  onMerge,
  onClose,
}: {
  onMerge: (text: string, prefix: string, selected: string[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [text, setText] = useState("");
  const [prefix, setPrefix] = useState("Foreign_");
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-md border border-border bg-surface p-4 shadow-xl">
        <p className="text-xs uppercase tracking-[0.14em] text-accent">Import foreign dialogues</p>
        <h3 className="mt-1 text-lg font-medium">Step {step} of 4</h3>
        {step === 1 ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">Pick a Dialogues.ecf from another scenario. Nothing is overwritten yet.</p>
            <input
              type="file"
              accept=".ecf,.txt"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setText(await file.text());
              }}
            />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-3 max-h-64 space-y-1 overflow-auto">
            {names.map((n) => (
              <label key={n} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(n)}
                  onChange={(e) =>
                    setSelected(e.target.checked ? [...selected, n] : selected.filter((x) => x !== n))
                  }
                />
                {n}
              </label>
            ))}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">Prefix renamed copies so they don’t collide with your states.</p>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </div>
        ) : null}
        {step === 4 ? (
          <p className="mt-3 text-sm text-muted">
            Merge {selected.length} states with prefix “{prefix}”. Existing dialogues stay put.
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {step > 1 ? (
            <Button size="sm" variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : null}
          <Button
            size="sm"
            disabled={step === 1 && !text}
            onClick={() => {
              if (step === 1) {
                const found = [...text.matchAll(/Dialogue Name:\s*"?([A-Za-z0-9_]+)"?/g)].map((m) => m[1]!);
                const uniq = [...new Set(found)];
                setNames(uniq);
                setSelected(uniq);
                setStep(2);
                return;
              }
              if (step < 4) {
                setStep(step + 1);
                return;
              }
              onMerge(text, prefix, selected);
              onClose();
            }}
          >
            {step === 4 ? "Merge" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useHotkeys(handlers: Record<string, (e: KeyboardEvent) => void>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey || e.metaKey ? "mod" : "",
        e.shiftKey ? "shift" : "",
        e.altKey ? "alt" : "",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");
      handlers[key]?.(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BbText } from "@/components/editor/bb-text.tsx";
import {
  CodeField,
  ForeignImport,
  FormatBar,
  GotoToggle,
  loadBookmarks,
  loadClip,
  loadFilter,
  loadScroll,
  reorder,
  saveBookmarks,
  saveClip,
  saveFilter,
  saveScroll,
} from "@/components/library/dialogue-tools.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input, Label, Textarea } from "@/components/ui/input.tsx";
import { upsertCsv } from "@/lib/pda/csv.ts";
import {
  SNIPPETS,
  VAR_TYPES,
  blankDialogue,
  blankFunction,
  dialogueGroup,
  gotoTarget,
  isGotoReset,
  looksLikeKey,
  mergeForeignDialogues,
  parseDialogueDoc,
  reindex,
  resolveDialogueText,
  uniqueDialogueName,
  type DialogueClip,
  type DialogueDoc,
  type DialogueFunction,
  type DialogueNext,
  type DialogueOption,
  type DialogueState,
  type DialogueVariable,
} from "@/lib/pda/dialogues.ts";
import { catalogText, dialogueDocFor, dialogueStrings, writeDialogues, writeLocalization } from "@/lib/pda/library.ts";
import { suggestionsFor, type ScenarioCatalog } from "@/lib/pda/scenario-index.ts";
import type { CsvTable } from "@/lib/pda/types.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

const GROUP_COLORS = ["#7dd3c7", "#c4b5fd", "#f9a8d4", "#fcd34d", "#93c5fd", "#86efac", "#fca5a5", "#fdba74"];

function groupColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return GROUP_COLORS[h % GROUP_COLORS.length];
}

export function DialogueEditor() {
  const catalog = usePdaStore((s) => s.catalog);
  const setCatalogText = usePdaStore((s) => s.setCatalogText);
  const project = usePdaStore((s) => s.project);
  const loca = useMemo(() => dialogueStrings(catalog), [catalog]);
  const [doc, setDoc] = useState<DialogueDoc>(() => dialogueDocFor(catalog));
  const [query, setQuery] = useState(loadFilter);
  const [picked, setPicked] = useState<string | null>(doc.states[0]?.name ?? null);
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [starredOnly, setStarredOnly] = useState(false);
  const [foreign, setForeign] = useState(false);
  const [clip, setClip] = useState<DialogueClip | null>(loadClip);
  const [mode, setMode] = useState<"bb" | "tmp">("bb");
  const [status, setStatus] = useState<string | null>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const docRef = useRef(doc);
  docRef.current = doc;
  const states = doc.states;
  const functions = doc.functions;
  const q = query.trim().toLowerCase();
  const visible = states.filter((s) => {
    if (starredOnly && !bookmarks.includes(s.name)) return false;
    if (!q) return true;
    return `${s.name} ${s.npcName} ${s.output} ${s.comment}`.toLowerCase().includes(q);
  });
  const selected = states.find((s) => s.name === picked) ?? visible[0];
  const groups = useMemo(() => {
    const map = new Map<string, DialogueState[]>();
    for (const state of visible) {
      const g = dialogueGroup(state);
      const arr = map.get(g) ?? [];
      arr.push(state);
      map.set(g, arr);
    }
    return [...map.entries()];
  }, [visible]);
  const stateNames = ["End", ...states.map((s) => s.name), ...functions.map((f) => f.name)];

  const persist = (next: DialogueDoc) => {
    setDoc(next);
    setCatalogText("dialogues", writeDialogues(next), catalogText(catalog, "dialogues")?.path || "Dialogues.ecf");
  };

  const commitStates = (next: DialogueState[]) => persist({ ...doc, states: next });
  const commitFns = (next: DialogueFunction[]) => persist({ ...doc, functions: next });

  const patch = (name: string, partial: Partial<DialogueState>) => {
    commitStates(states.map((s) => (s.name === name ? { ...s, ...partial } : s)));
  };

  const toast = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 1800);
  };

  const copyClip = (next: DialogueClip) => {
    setClip(next);
    saveClip(next);
    toast(`Copied ${next.kind}`);
  };

  const pasteInto = (additive: boolean) => {
    if (!clip || !selected) return;
    if (clip.kind === "state") {
      const copy = { ...structuredClone(clip.payload), name: uniqueDialogueName(states, `${clip.payload.name}_copy`) };
      const i = states.findIndex((s) => s.name === selected.name);
      const next = [...states];
      next.splice(i + 1, 0, copy);
      commitStates(next);
      setPicked(copy.name);
      return;
    }
    if (clip.kind === "option") {
      const row = { ...clip.payload, index: (selected.options.at(-1)?.index ?? 0) + 1 };
      patch(selected.name, { options: reindex(additive ? [...selected.options, row] : [row]) });
    }
    if (clip.kind === "next") {
      const row = { ...clip.payload, index: (selected.nexts.at(-1)?.index ?? 0) + 1 };
      patch(selected.name, { nexts: reindex(additive ? [...selected.nexts, row] : [row]) });
    }
    if (clip.kind === "variable") {
      const row = { ...clip.payload, index: (selected.variables.at(-1)?.index ?? 0) + 1 };
      patch(selected.name, { variables: reindex(additive ? [...selected.variables, row] : [row]) });
    }
    if (clip.kind === "function") {
      commitFns([...functions, { ...clip.payload, name: uniqueDialogueName(functions, `${clip.payload.name}_copy`) }]);
    }
    toast(additive ? "Paste added" : "Pasted");
  };

  useEffect(() => {
    const el = sideRef.current;
    if (el) el.scrollTop = loadScroll();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const inField = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName || "");
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        download("Dialogues.ecf", writeDialogues(docRef.current), "text/plain");
        toast("Exported Dialogues.ecf");
      }
      if (mod && e.key.toLowerCase() === "c" && !inField && selected) {
        e.preventDefault();
        copyClip({ kind: "state", payload: selected });
      }
      if (mod && e.key.toLowerCase() === "v" && !inField) {
        e.preventDefault();
        pasteInto(e.shiftKey);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const dropState = (fromName: string, toName: string) => {
    const from = states.findIndex((s) => s.name === fromName);
    const to = states.findIndex((s) => s.name === toName);
    commitStates(reorder(states, from, to));
  };

  const saveLoca = (table: CsvTable) =>
    setCatalogText(
      catalogText(catalog, "dialoguesCsv") ? "dialoguesCsv" : "localization",
      writeLocalization(table),
      catalogText(catalog, "dialoguesCsv")?.path || catalogText(catalog, "localization")?.path || "Dialogues.csv",
    );

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      {foreign ? (
        <ForeignImport
          onClose={() => setForeign(false)}
          onMerge={(text, prefix, selectedNames) => {
            persist(mergeForeignDialogues(doc, parseDialogueDoc(text), prefix, selectedNames));
            toast("Foreign dialogues merged");
          }}
        />
      ) : null}
      <aside className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              saveFilter(e.target.value);
            }}
            placeholder="Filter dialogues…"
            className="h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                const state = blankDialogue(uniqueDialogueName(states, `Dialogue_${states.length + 1}`));
                const i = selected ? states.findIndex((s) => s.name === selected.name) : states.length - 1;
                const next = [...states];
                next.splice(i + 1, 0, state);
                commitStates(next);
                setPicked(state.name);
              }}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                const copy = { ...structuredClone(selected), name: uniqueDialogueName(states, `${selected.name}_copy`) };
                const i = states.findIndex((s) => s.name === selected.name);
                const next = [...states];
                next.splice(i + 1, 0, copy);
                commitStates(next);
                setPicked(copy.name);
              }}
            >
              Duplicate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setForeign(true)}>
              Import foreign
            </Button>
            <Button
              size="sm"
              variant={starredOnly ? "default" : "secondary"}
              onClick={() => setStarredOnly((v) => !v)}
            >
              Bookmarks
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!states.length}
              onClick={() => download("Dialogues.ecf", writeDialogues(doc), "text/plain")}
            >
              Export ECF
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!Object.keys(loca.rows).length}
              onClick={() => download("Dialogues.csv", writeLocalization(loca), "text/csv")}
            >
              Export CSV
            </Button>
          </div>
          <p className="mt-2 text-xs text-subtle">
            {states.length} states · {functions.length} functions · drag to reorder · Alt-click copies name · Ctrl+S export
          </p>
          {status ? <p className="mt-1 text-xs text-accent">{status}</p> : null}
        </div>
        <div
          ref={sideRef}
          className="min-h-0 flex-1 overflow-auto py-1"
          onScroll={(e) => saveScroll((e.target as HTMLDivElement).scrollTop)}
        >
          {!states.length ? (
            <p className="p-4 text-sm text-muted">Import Dialogues.ecf / Dialogues.csv, or add a state.</p>
          ) : (
            groups.map(([group, list]) => (
              <div key={group}>
                <p className="flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ color: groupColor(group) }}>
                  <span className="size-2 rounded-full" style={{ background: groupColor(group) }} />
                  {group}
                </p>
                {list.map((state) => (
                  <button
                    key={state.name}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", state.name)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      dropState(e.dataTransfer.getData("text/plain"), state.name);
                    }}
                    onClick={(e) => {
                      if (e.altKey) {
                        void navigator.clipboard.writeText(state.name);
                        toast(state.name);
                        return;
                      }
                      setPicked(state.name);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                      selected?.name === state.name ? "bg-elevated" : "hover:bg-elevated/50"
                    }`}
                    title={state.comment || state.output}
                  >
                    <span className="w-0.5 self-stretch rounded-full" style={{ background: groupColor(group) }} />
                    <span
                      className={`text-xs ${bookmarks.includes(state.name) ? "text-accent" : "text-subtle"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = bookmarks.includes(state.name)
                          ? bookmarks.filter((n) => n !== state.name)
                          : [...bookmarks, state.name];
                        setBookmarks(next);
                        saveBookmarks(next);
                      }}
                    >
                      ★
                    </span>
                    <span className="min-w-0 flex-1 truncate">{state.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-subtle">
                      {state.options.length}opt {state.nexts.length}nxt
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>
      <section className="min-h-0 overflow-auto p-5">
        {selected ? (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-accent">Dialogue</p>
                <h2 className="mt-1 text-xl font-medium tracking-tight">{selected.name}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => copyClip({ kind: "state", payload: selected })}>
                  Copy
                </Button>
                <Button size="sm" variant="secondary" disabled={!clip} onClick={() => pasteInto(false)}>
                  Paste
                </Button>
                <Button size="sm" variant="secondary" disabled={!clip} onClick={() => pasteInto(true)}>
                  Paste add
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    const next = states.filter((s) => s.name !== selected.name);
                    commitStates(next);
                    setPicked(next[0]?.name ?? null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            <Field label="Name">
              <Input
                value={selected.name}
                onChange={(e) => {
                  const name = e.target.value;
                  patch(selected.name, { name });
                  setPicked(name);
                }}
              />
            </Field>
            <Field label="NPC name">
              <Input value={selected.npcName} onChange={(e) => patch(selected.name, { npcName: e.target.value })} />
            </Field>
            <Field label="Comment">
              <Input
                value={selected.comment}
                placeholder="POI / playfield notes"
                onChange={(e) => patch(selected.name, { comment: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="BarkingState">
                <StateSelect
                  value={selected.barkingState}
                  names={stateNames}
                  allowEmpty
                  onChange={(barkingState) => patch(selected.name, { barkingState })}
                />
              </Field>
              <Field label="RequiredStates">
                <Input
                  value={selected.requiredStates}
                  placeholder="state1, state2"
                  onChange={(e) => patch(selected.name, { requiredStates: e.target.value })}
                />
              </Field>
            </div>
            <CsvBoundField
              label="Output"
              value={selected.output}
              onChange={(output) => patch(selected.name, { output })}
              loca={loca}
              language={project.language}
              pda={project.csv}
              mode={mode}
              onMode={setMode}
              onSaveLoca={saveLoca}
            />
            <VariableList
              variables={selected.variables}
              onChange={(variables) => patch(selected.name, { variables: reindex(variables) })}
              onCopy={(payload) => copyClip({ kind: "variable", payload })}
            />
            <NextList
              nexts={selected.nexts}
              names={stateNames}
              catalog={catalog}
              onChange={(nexts) => patch(selected.name, { nexts: reindex(nexts) })}
              onCopy={(payload) => copyClip({ kind: "next", payload })}
            />
            <OptionList
              options={selected.options}
              names={stateNames}
              loca={loca}
              language={project.language}
              pda={project.csv}
              catalog={catalog}
              mode={mode}
              onMode={setMode}
              onChange={(options) => patch(selected.name, { options: reindex(options) })}
              onSaveLoca={saveLoca}
              onCopy={(payload) => copyClip({ kind: "option", payload })}
            />
            <FunctionList functions={functions} onChange={commitFns} onCopy={(payload) => copyClip({ kind: "function", payload })} />
          </div>
        ) : (
          <p className="p-6 text-sm text-muted">Select a dialogue state.</p>
        )}
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

function StateSelect({
  value,
  names,
  onChange,
  allowEmpty,
}: {
  value: string;
  names: string[];
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  const shown = isGotoReset(value) ? gotoTarget(value) : value;
  return (
    <>
      <Input
        value={shown}
        list="pulse-dlg-states"
        placeholder="Next state / End"
        onChange={(e) => onChange(isGotoReset(value) ? `GotoAndReset:${e.target.value}` : e.target.value)}
      />
      <datalist id="pulse-dlg-states">
        {allowEmpty ? <option value="" /> : null}
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </>
  );
}

function wrapInsert(value: string, open: string, close?: string) {
  if (!close) return `${value}${open}`;
  return `${open}${value}${close}`;
}

function CsvBoundField({
  label,
  value,
  onChange,
  loca,
  language,
  pda,
  mode,
  onMode,
  onSaveLoca,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  loca: CsvTable;
  language: string;
  pda?: CsvTable;
  mode: "bb" | "tmp";
  onMode: (m: "bb" | "tmp") => void;
  onSaveLoca: (table: CsvTable) => void;
}) {
  const lang = loca.languages.includes(language) ? language : loca.languages[0] || "English";
  const isKey = looksLikeKey(value) && Boolean(loca.rows[value] || pda?.rows[value]);
  const keys = Object.keys(loca.rows).slice(0, 400);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
      </div>
      <FormatBar mode={mode} onMode={onMode} onInsert={(open, close) => onChange(isKey ? value : wrapInsert(value, open, close))} />
      <Input value={value} list="pulse-dlg-keys" placeholder="Literal text or CSV key" onChange={(e) => onChange(e.target.value)} />
      <datalist id="pulse-dlg-keys">
        {keys.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>
      {isKey ? (
        <Textarea
          value={loca.rows[value]?.[lang] || pda?.rows[value]?.[lang] || ""}
          onChange={(e) => {
            const next = structuredClone(loca);
            upsertCsv(next, value, lang, e.target.value);
            onSaveLoca(next);
          }}
        />
      ) : (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      <BbText as="div" className="text-sm leading-relaxed text-muted" text={resolveDialogueText(value, loca, pda, lang)} />
    </div>
  );
}

function VariableList({
  variables,
  onChange,
  onCopy,
}: {
  variables: DialogueVariable[];
  onChange: (next: DialogueVariable[]) => void;
  onCopy: (row: DialogueVariable) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Variables</Label>
        <button
          className="text-xs text-muted hover:text-fg"
          onClick={() => onChange([...variables, { index: variables.length + 1, name: `Var${variables.length + 1}`, param1: "int" }])}
        >
          Add variable
        </button>
      </div>
      <div className="space-y-2">
        {variables.map((variable, i) => (
          <div
            key={variable.index}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onChange(reindex(reorder(variables, Number(e.dataTransfer.getData("text/plain")), i)));
            }}
            className="grid gap-2 sm:grid-cols-[1fr_160px_auto_auto]"
          >
            <Input
              value={variable.name}
              placeholder="Name"
              onChange={(e) => onChange(variables.map((v, n) => (n === i ? { ...v, name: e.target.value } : v)))}
            />
            <select
              className="h-10 rounded-sm border border-border bg-bg px-2 text-sm"
              value={variable.param1}
              onChange={(e) => onChange(variables.map((v, n) => (n === i ? { ...v, param1: e.target.value } : v)))}
            >
              {VAR_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <Button size="sm" variant="ghost" onClick={() => onCopy(variable)}>
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(variables.filter((_, n) => n !== i))}>
              ✕
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnippetBar({ onInsert }: { onInsert: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {SNIPPETS.map((s) => (
        <button
          key={s.label}
          type="button"
          className="h-6 rounded-sm border border-border px-1.5 text-[10px] text-muted hover:text-fg"
          onClick={() => onInsert(s.insert)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ItemHint({ catalog, onPick }: { catalog: ScenarioCatalog; onPick: (name: string) => void }) {
  const [q, setQ] = useState("");
  const hits = q.trim() ? suggestionsFor(catalog, ["item", "block", "token"], q.trim(), 8) : [];
  return (
    <div>
      <Input value={q} placeholder="Item helper…" className="h-8" onChange={(e) => setQ(e.target.value)} />
      {hits.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {hits.map((hit) => (
            <button
              key={`${hit.kind}:${hit.name}`}
              type="button"
              className="rounded-sm border border-border px-1.5 py-0.5 text-[11px] text-muted hover:text-fg"
              onClick={() => {
                onPick(hit.name);
                setQ("");
              }}
            >
              {hit.label && hit.label !== hit.name ? `${hit.name} · ${hit.label}` : hit.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NextList({
  nexts,
  names,
  catalog,
  onChange,
  onCopy,
}: {
  nexts: DialogueNext[];
  names: string[];
  catalog: ScenarioCatalog;
  onChange: (next: DialogueNext[]) => void;
  onCopy: (row: DialogueNext) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Auto next / Execute</Label>
        <button
          className="text-xs text-muted hover:text-fg"
          onClick={() => onChange([...nexts, { index: nexts.length + 1, next: "End", iff: "", execute: "" }])}
        >
          Add next
        </button>
      </div>
      <div className="space-y-3">
        {nexts.map((n, i) => (
          <div
            key={n.index}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onChange(reindex(reorder(nexts, Number(e.dataTransfer.getData("text/plain")), i)));
            }}
            className="space-y-2 rounded-sm border border-border p-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <GotoToggle value={n.next} onChange={(next) => onChange(nexts.map((row, idx) => (idx === i ? { ...row, next } : row)))} />
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onCopy(n)}>
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onChange(nexts.filter((_, idx) => idx !== i))}>
                  ✕
                </Button>
              </div>
            </div>
            <StateSelect
              value={n.next}
              names={names}
              onChange={(next) => onChange(nexts.map((row, idx) => (idx === i ? { ...row, next } : row)))}
            />
            <Input
              value={n.iff}
              placeholder="NextIf condition"
              className="border-accent/40"
              onChange={(e) => onChange(nexts.map((row, idx) => (idx === i ? { ...row, iff: e.target.value } : row)))}
            />
            <CodeField
              value={n.execute}
              placeholder="Execute C#"
              onChange={(execute) => onChange(nexts.map((row, idx) => (idx === i ? { ...row, execute } : row)))}
            />
            <SnippetBar
              onInsert={(text) =>
                onChange(nexts.map((row, idx) => (idx === i ? { ...row, execute: row.execute ? `${row.execute}\n${text}` : text } : row)))
              }
            />
            <ItemHint
              catalog={catalog}
              onPick={(name) =>
                onChange(nexts.map((row, idx) => (idx === i ? { ...row, execute: `${row.execute}${row.execute ? " " : ""}'${name}'` } : row)))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionList({
  options,
  names,
  loca,
  language,
  pda,
  catalog,
  mode,
  onMode,
  onChange,
  onSaveLoca,
  onCopy,
}: {
  options: DialogueOption[];
  names: string[];
  loca: CsvTable;
  language: string;
  pda?: CsvTable;
  catalog: ScenarioCatalog;
  mode: "bb" | "tmp";
  onMode: (m: "bb" | "tmp") => void;
  onChange: (next: DialogueOption[]) => void;
  onSaveLoca: (table: CsvTable) => void;
  onCopy: (row: DialogueOption) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Options</Label>
        <button
          className="text-xs text-muted hover:text-fg"
          onClick={() => onChange([...options, { index: options.length + 1, text: "Continue", next: "End", iff: "", execute: "" }])}
        >
          Add option
        </button>
      </div>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <div
            key={opt.index}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onChange(reindex(reorder(options, Number(e.dataTransfer.getData("text/plain")), i)));
            }}
            className="space-y-2 rounded-sm border border-border p-2"
          >
            <div className="flex items-center justify-between">
              <GotoToggle
                value={opt.next}
                onChange={(next) => onChange(options.map((row, idx) => (idx === i ? { ...row, next } : row)))}
              />
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onCopy(opt)}>
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onChange(options.filter((_, idx) => idx !== i))}>
                  Remove
                </Button>
              </div>
            </div>
            <CsvBoundField
              label={`Option ${opt.index}`}
              value={opt.text}
              onChange={(text) => onChange(options.map((row, idx) => (idx === i ? { ...row, text } : row)))}
              loca={loca}
              language={language}
              pda={pda}
              mode={mode}
              onMode={onMode}
              onSaveLoca={onSaveLoca}
            />
            <StateSelect
              value={opt.next}
              names={names}
              onChange={(next) => onChange(options.map((row, idx) => (idx === i ? { ...row, next } : row)))}
            />
            <Input
              value={opt.iff}
              placeholder="OptionIf"
              className="border-accent/40"
              onChange={(e) => onChange(options.map((row, idx) => (idx === i ? { ...row, iff: e.target.value } : row)))}
            />
            <CodeField
              value={opt.execute}
              placeholder="OptionExecute"
              onChange={(execute) => onChange(options.map((row, idx) => (idx === i ? { ...row, execute } : row)))}
            />
            <SnippetBar
              onInsert={(text) =>
                onChange(options.map((row, idx) => (idx === i ? { ...row, execute: row.execute ? `${row.execute}\n${text}` : text } : row)))
              }
            />
            <ItemHint
              catalog={catalog}
              onPick={(name) =>
                onChange(
                  options.map((row, idx) => (idx === i ? { ...row, execute: `${row.execute}${row.execute ? " " : ""}'${name}'` } : row)),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FunctionList({
  functions,
  onChange,
  onCopy,
}: {
  functions: DialogueFunction[];
  onChange: (next: DialogueFunction[]) => void;
  onCopy: (row: DialogueFunction) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Reusable functions</Label>
        <button
          className="text-xs text-muted hover:text-fg"
          onClick={() => onChange([...functions, blankFunction(`Fn_${functions.length + 1}`)])}
        >
          Add function
        </button>
      </div>
      <p className="mb-2 text-xs text-subtle">Call from Execute with FunctionName() or CallLater(5, FunctionName).</p>
      <div className="space-y-3">
        {functions.map((fn, i) => (
          <div key={`${fn.name}-${i}`} className="space-y-2 rounded-sm border border-border p-2">
            <div className="flex gap-2">
              <Input value={fn.name} onChange={(e) => onChange(functions.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))} />
              <Button size="sm" variant="ghost" onClick={() => onCopy(fn)}>
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange(functions.filter((_, idx) => idx !== i))}>
                ✕
              </Button>
            </div>
            <Input
              value={fn.comment}
              placeholder="Comment"
              onChange={(e) => onChange(functions.map((row, idx) => (idx === i ? { ...row, comment: e.target.value } : row)))}
            />
            <CodeField
              value={fn.execute}
              placeholder="Function body"
              onChange={(execute) => onChange(functions.map((row, idx) => (idx === i ? { ...row, execute } : row)))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

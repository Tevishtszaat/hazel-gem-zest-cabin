import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BbText } from "@/components/editor/bb-text.tsx";
import { PdaImage } from "@/components/editor/pda-image.tsx";
import { decodePdaEscapes, stripBbcode } from "@/lib/pda/bbcode.ts";
import { CHECKS } from "@/lib/pda/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input, Label, Textarea } from "@/components/ui/input.tsx";
import { SuggestInput, TokenStatus } from "@/components/editor/suggest-input.tsx";
import { CHECK_NAME_KINDS, CHECK_TYPE_KINDS } from "@/lib/pda/scenario-index.ts";
import { selectedContext, usePdaStore } from "@/store/pda-store.ts";
import type { ActionNode, ChapterNode, TaskNode } from "@/lib/pda/types.ts";

export function Inspector() {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const selected = usePdaStore((s) => s.selected);
  const ctx = selectedContext(project, selected);
  const update = usePdaStore((s) => s.updateSelected);

  if (!ctx) {
    return <WelcomeHome />;
  }

  if (ctx.kind === "chapter") {
    const ch = ctx.chapter;
    const patch = (p: Partial<ChapterNode>) =>
      update((proj) => {
        const i = proj.chapters.findIndex((c) => c.id === ch.id);
        if (i >= 0) proj.chapters[i] = { ...proj.chapters[i]!, ...p };
      });
    return (
      <div className="space-y-3 p-4">
        <Header kicker="Chapter" title={ch.chapterTitle} yamlKey={ch.titleKey} />
        <Field label="Title">
          <Input value={decodePdaEscapes(ch.chapterTitle)} onChange={(e) => patch({ chapterTitle: e.target.value })} />
          <BbText className="block min-h-5 text-sm" text={ch.chapterTitle} inline />
        </Field>
        <Field label="Description">
          <Textarea value={decodePdaEscapes(ch.description)} onChange={(e) => patch({ description: e.target.value })} />
          <BbText as="div" className="text-sm leading-relaxed text-muted" text={ch.description} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Input value={ch.category} onChange={(e) => patch({ category: e.target.value })} />
          </Field>
          <Field label="Visibility">
            <Input value={ch.visibility} onChange={(e) => patch({ visibility: e.target.value })} />
          </Field>
          <Field label="Player level">
            <Input value={ch.playerLevel} onChange={(e) => patch({ playerLevel: e.target.value })} />
          </Field>
          <Field label="Picture file">
            <SuggestInput
              value={ch.pictureFile}
              onChange={(pictureFile) => patch({ pictureFile })}
              catalog={catalog}
              kinds={["picture"]}
              list={false}
              placeholder="readfirst.jpg"
            />
            <TokenStatus value={ch.pictureFile} catalog={catalog} kinds={["picture"]} />
            <PdaImage name={ch.pictureFile} className="mt-2 max-h-32 w-full rounded-md object-cover" />
            <PicturePicker
              selected={ch.pictureFile}
              onPick={(pictureFile) => patch({ pictureFile })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Activatable">
            <Input value={ch.activatable} onChange={(e) => patch({ activatable: e.target.value })} />
          </Field>
          <Field label="Reputation level">
            <Input value={ch.reputationLevel} onChange={(e) => patch({ reputationLevel: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={ch.hideTasks}
            onChange={(e) => patch({ hideTasks: e.target.checked })}
          />
          Hide tasks
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={ch.autoActivateOnGameStart}
            onChange={(e) => patch({ autoActivateOnGameStart: e.target.checked })}
          />
          Auto activate on game start
        </label>
        <Field label="Preamble">
          <Textarea value={decodePdaEscapes(ch.preamble)} onChange={(e) => patch({ preamble: e.target.value })} />
        </Field>
        <Field label="Completed message">
          <Input value={ch.completedMessage} onChange={(e) => patch({ completedMessage: e.target.value })} />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Rewards</Label>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => patch({ rewards: [...ch.rewards, { item: "", type: "", count: 1, faction: "" }] })}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {ch.rewards.map((r, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <SuggestInput
                  placeholder="Item"
                  value={r.item}
                  onChange={(item) => {
                    const rewards = ch.rewards.map((x, idx) => (idx === i ? { ...x, item } : x));
                    patch({ rewards });
                  }}
                  catalog={catalog}
                  kinds={["item", "token", "block"]}
                  list={false}
                />
                <Input
                  placeholder="Type"
                  value={r.type}
                  onChange={(e) => {
                    const rewards = ch.rewards.map((x, idx) => (idx === i ? { ...x, type: e.target.value } : x));
                    patch({ rewards });
                  }}
                />
                <Input
                  type="number"
                  value={r.count}
                  onChange={(e) => {
                    const rewards = ch.rewards.map((x, idx) =>
                      idx === i ? { ...x, count: Number(e.target.value) } : x,
                    );
                    patch({ rewards });
                  }}
                />
                <SuggestInput
                  placeholder="Faction"
                  value={r.faction}
                  onChange={(faction) => {
                    const rewards = ch.rewards.map((x, idx) => (idx === i ? { ...x, faction } : x));
                    patch({ rewards });
                  }}
                  catalog={catalog}
                  kinds={["faction"]}
                  list
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => patch({ rewards: ch.rewards.filter((_, idx) => idx !== i) })}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Extra extra={ch.extra} />
      </div>
    );
  }

  if (ctx.kind === "task") {
    const tk = ctx.task;
    const patch = (p: Partial<TaskNode>) =>
      update((proj) => {
        for (const ch of proj.chapters) {
          const i = ch.tasks.findIndex((t) => t.id === tk.id);
          if (i >= 0) ch.tasks[i] = { ...ch.tasks[i]!, ...p };
        }
      });
    return (
      <div className="space-y-3 p-4">
        <Header kicker="Task" title={tk.taskTitle} yamlKey={tk.titleKey} />
        <Field
          label="Task title"
          hint={`${stripBbcode(tk.taskTitle).length}/26 HUD`}
          warn={stripBbcode(tk.taskTitle).length > 26}
        >
          <Input value={decodePdaEscapes(tk.taskTitle)} onChange={(e) => patch({ taskTitle: e.target.value })} />
          <BbText className="block min-h-5 text-sm" text={tk.taskTitle} inline />
        </Field>
        <Field label="Headline">
          <Input value={decodePdaEscapes(tk.headline)} onChange={(e) => patch({ headline: e.target.value })} />
        </Field>
        <Field label="Start message">
          <Textarea value={decodePdaEscapes(tk.startMessage)} onChange={(e) => patch({ startMessage: e.target.value })} />
          <BbText as="div" className="text-sm leading-relaxed text-muted" text={tk.startMessage} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start delay">
            <Input value={tk.startDelay} onChange={(e) => patch({ startDelay: e.target.value })} />
          </Field>
          <Field label="Picture file">
            <SuggestInput
              value={tk.pictureFile}
              onChange={(pictureFile) => patch({ pictureFile })}
              catalog={catalog}
              kinds={["picture"]}
              list={false}
            />
          </Field>
        </div>
        <Extra extra={tk.extra} />
      </div>
    );
  }

  const ac = ctx.action;
  const patch = (p: Partial<ActionNode>) =>
    update((proj) => {
      for (const ch of proj.chapters) {
        for (const tk of ch.tasks) {
          const i = tk.actions.findIndex((a) => a.id === ac.id);
          if (i >= 0) tk.actions[i] = { ...tk.actions[i]!, ...p };
        }
      }
    });
  const meta = CHECKS.find((c) => c.id === ac.check);
  const nameKinds = CHECK_NAME_KINDS[ac.check] ?? [];
  const typeKinds = CHECK_TYPE_KINDS[ac.check] ?? [];
  return (
    <div className="space-y-3 p-4">
      <Header kicker="Action" title={ac.actionTitle} yamlKey={ac.titleKey} />
      <Field label="Action title" hint={`${stripBbcode(ac.actionTitle).length}/24 HUD`} warn={stripBbcode(ac.actionTitle).length > 24}>
        <Input value={decodePdaEscapes(ac.actionTitle)} onChange={(e) => patch({ actionTitle: e.target.value })} />
        <BbText className="block min-h-5 text-sm" text={ac.actionTitle} inline />
      </Field>
      <Field label="Description">
        <Textarea value={decodePdaEscapes(ac.description)} onChange={(e) => patch({ description: e.target.value })} />
        <BbText as="div" className="text-sm leading-relaxed text-muted" text={ac.description} />
      </Field>
      <Field label="Check">
        <Input list="pulse-checks" value={ac.check} onChange={(e) => patch({ check: e.target.value })} />
        <datalist id="pulse-checks">
          {CHECKS.map((c) => (
            <option key={c.id} value={c.id} />
          ))}
        </datalist>
        <p className="text-xs text-subtle">{meta?.hint ?? "Unknown checks are kept and exported unchanged."}</p>
      </Field>
      <Field label="Names">
        <SuggestInput
          value={ac.names}
          onChange={(names) => patch({ names })}
          catalog={catalog}
          kinds={nameKinds}
          placeholder="BASE, HV"
        />
        <TokenStatus value={ac.names} catalog={catalog} kinds={nameKinds} />
      </Field>
      <Field label="Types">
        <SuggestInput value={ac.types} onChange={(types) => patch({ types })} catalog={catalog} kinds={typeKinds} />
        <TokenStatus value={ac.types} catalog={catalog} kinds={typeKinds} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount">
          <Input value={ac.amount} onChange={(e) => patch({ amount: e.target.value })} />
        </Field>
        <Field label="Required">
          <Input value={ac.required} onChange={(e) => patch({ required: e.target.value })} placeholder="NeedOne / NeedAll" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={ac.allowManualCompletion}
          onChange={(e) => patch({ allowManualCompletion: e.target.checked })}
        />
        Allow manual completion
      </label>
      <Field label="Completed message">
        <Input value={ac.completedMessage} onChange={(e) => patch({ completedMessage: e.target.value })} />
      </Field>
      <Extra extra={ac.extra} />
    </div>
  );
}

function WelcomeHome() {
  const project = usePdaStore((s) => s.project);
  const addChapter = usePdaStore((s) => s.addChapter);
  const n = project.chapters.length;
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-8 p-10">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Axis 2026</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight">Creator Particlewave</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {n
            ? `${n} chapters are loaded in the tree. Pick one to edit, or keep importing files — they merge in.`
            : "Empyrion mission workshop. Import a real scenario, or start a chapter from scratch."}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-accent">Start fresh?</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          If you don't want to import files yet, click the green + on a category — or{" "}
          <button className="text-fg underline-offset-2 hover:underline" onClick={() => addChapter()}>
            create a chapter
          </button>{" "}
          — then hang tasks under it.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-accent">Import?</h3>
        <p className="mt-2 mb-3 text-sm leading-relaxed text-muted">
          Bring in PDA.yaml, PDA.csv, configs, localization, images, dialogues, factions, sectors, playfields, and
          blueprints. Item names then autocomplete in checks and rewards.
        </p>
        <Link
          to="/import"
          className="flex h-11 items-center justify-center rounded-sm bg-elevated text-sm font-medium tracking-wide shadow-[var(--shadow-border)] transition-[box-shadow,opacity] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          Import page
        </Link>
      </div>
    </div>
  );
}

function Header({ kicker, title, yamlKey }: { kicker: string; title: string; yamlKey?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <BbText as="h2" className="text-lg font-medium tracking-tight" text={title || "Untitled"} inline />
      {yamlKey ? <p className="font-mono text-[11px] text-subtle">YAML key {yamlKey}</p> : null}
    </div>
  );
}

function Field({
  label,
  hint,
  warn,
  children,
}: {
  label: string;
  hint?: string;
  warn?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {hint ? <span className={`text-[11px] ${warn ? "text-warn" : "text-subtle"}`}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function PicturePicker({ selected, onPick }: { selected: string; onPick: (name: string) => void }) {
  const catalog = usePdaStore((s) => s.catalog);
  const pics = catalog.entries.filter((e) => e.kind === "picture" && e.group !== "item").slice(0, 24);
  if (!pics.length) return <p className="text-xs text-subtle">Import PDA images to preview and pick art.</p>;
  return (
    <div className="mt-2 grid grid-cols-4 gap-1.5">
      {pics.map((pic) => (
        <button
          key={pic.name}
          type="button"
          onClick={() => onPick(pic.name)}
          className={`overflow-hidden rounded-sm border ${selected === pic.name ? "border-accent" : "border-border"}`}
        >
          <PdaImage name={pic.name} className="h-12 w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function Extra({ extra }: { extra: Record<string, unknown> }) {
  const keys = Object.keys(extra);
  if (!keys.length) return null;
  return (
    <div className="rounded-md border border-border bg-elevated/40 p-3">
      <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted">Preserved from import</p>
      <ul className="space-y-1 font-mono text-[11px] text-subtle">
        {keys.map((k) => (
          <li key={k}>
            <span className="text-fg">{k}</span> {previewExtra(extra[k])}
          </li>
        ))}
      </ul>
    </div>
  );
}

function previewExtra(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    const s = JSON.stringify(value);
    return s.length > 80 ? s.slice(0, 80) + "…" : s;
  } catch {
    return "";
  }
}

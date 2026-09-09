import { ChevronDown, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { BbText } from "@/components/editor/bb-text.tsx";
import { stripBbcode } from "@/lib/pda/bbcode.ts";
import type { ChapterNode, TaskNode } from "@/lib/pda/types.ts";
import { selectedContext, usePdaStore } from "@/store/pda-store.ts";

function haystack(ch: ChapterNode): string {
  const parts = [ch.chapterTitle, ch.titleKey, ch.category, ch.description];
  for (const tk of ch.tasks) {
    parts.push(tk.taskTitle, tk.titleKey, tk.headline);
    for (const ac of tk.actions) parts.push(ac.actionTitle, ac.check, ac.names);
  }
  return stripBbcode(parts.filter(Boolean).join(" ")).toLowerCase();
}

function isFaqCategory(cat: string) {
  return /\bfaq\b/i.test(cat) || /^faq/i.test(cat);
}

export function TreePane() {
  const project = usePdaStore((s) => s.project);
  const selected = usePdaStore((s) => s.selected);
  const queryRaw = usePdaStore((s) => s.query);
  const query = queryRaw.trim().toLowerCase();
  const collapsed = usePdaStore((s) => s.collapsed);
  const select = usePdaStore((s) => s.select);
  const toggle = usePdaStore((s) => s.toggleCollapsed);
  const addChapter = usePdaStore((s) => s.addChapter);
  const setQuery = usePdaStore((s) => s.setQuery);

  const groups = useMemo(() => {
    const map = new Map<string, ChapterNode[]>();
    for (const ch of project.chapters) {
      if (query && !haystack(ch).includes(query)) continue;
      const cat = ch.category || "Uncategorized";
      const arr = map.get(cat) ?? [];
      arr.push(ch);
      map.set(cat, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => Number(isFaqCategory(a)) - Number(isFaqCategory(b)))
      .map(([cat, chapters]) => ({ cat, chapters }));
  }, [project.chapters, query]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-bg">
      <div className="border-b border-border px-2 py-2">
        <input
          value={queryRaw}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter chapter / task / act…"
          className="h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
        />
        <TreeTools />
      </div>
      <div className="min-h-0 flex-1 overflow-auto py-1" onClick={() => select(null)}>
        {!project.chapters.length ? (
          <p className="px-3 py-8 text-center text-sm text-muted">
            No chapters yet.{" "}
            <Link to="/import" className="text-fg underline-offset-2 hover:underline">
              Import a scenario
            </Link>{" "}
            or add one with + .
          </p>
        ) : !groups.length ? (
          <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
        ) : (
          groups.map((group) => {
            const catId = `cat:${group.cat}`;
            const catOpen = !collapsed.includes(catId);
            return (
              <div key={group.cat} className="mb-0.5">
                <div
                  className="sticky top-0 z-10 flex items-center gap-1 border-b border-border/60 bg-bg/95 px-1 py-0.5 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="grid size-6 place-items-center text-muted"
                    onClick={() => toggle(catId)}
                    aria-label="Toggle category"
                  >
                    {catOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </button>
                  <button
                    className="min-w-0 flex-1 truncate py-1 text-left text-xs font-medium uppercase tracking-[0.14em] text-accent"
                    onClick={() => toggle(catId)}
                  >
                    {group.cat}
                  </button>
                  <span className="pr-1 text-xs tabular-nums text-subtle">{group.chapters.length}</span>
                  <button
                    className="grid size-6 place-items-center text-ok hover:text-fg"
                    title={`Add chapter in ${group.cat}`}
                    onClick={() => addChapter(group.cat)}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                {catOpen
                  ? group.chapters.map((ch) => {
                      const open = query ? true : !collapsed.includes(ch.id);
                      const active = selected?.id === ch.id;
                      return (
                        <div key={ch.id}>
                          <Line
                            active={active}
                            depth={1}
                            open={open}
                            hasChildren={ch.tasks.length > 0}
                            title={ch.chapterTitle}
                            dot={ch.autoActivateOnGameStart ? "ok" : "muted"}
                            onToggle={() => toggle(ch.id)}
                            onClick={() => select({ kind: "chapter", id: ch.id })}
                          />
                          {open
                            ? ch.tasks.map((tk) => (
                                <TaskBranch
                                  key={tk.id}
                                  task={tk}
                                  query={query}
                                  selectedId={selected?.id}
                                  collapsed={collapsed}
                                  toggle={toggle}
                                  select={select}
                                />
                              ))
                            : null}
                        </div>
                      );
                    })
                  : null}
              </div>
            );
          })
        )}
      </div>
      <SelectedHint />
    </div>
  );
}

function TreeTools() {
  const addChapter = usePdaStore((s) => s.addChapter);
  const addTask = usePdaStore((s) => s.addTask);
  const addAction = usePdaStore((s) => s.addAction);
  const duplicate = usePdaStore((s) => s.duplicateSelected);
  const del = usePdaStore((s) => s.deleteSelected);
  const move = usePdaStore((s) => s.moveSelected);
  const btn = "h-7 rounded-sm px-2 text-xs text-muted hover:bg-elevated hover:text-fg";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <button className={btn} onClick={() => addChapter()}>
        + Chapter
      </button>
      <button className={btn} onClick={addTask}>
        Task
      </button>
      <button className={btn} onClick={addAction}>
        Action
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      <button className={btn} onClick={duplicate} title="Duplicate">
        <Copy className="size-3.5" />
      </button>
      <button className={btn} onClick={() => move(-1)}>
        Up
      </button>
      <button className={btn} onClick={() => move(1)}>
        Down
      </button>
      <button className={`${btn} text-danger hover:text-danger`} onClick={del} title="Delete">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function TaskBranch({
  task,
  query,
  selectedId,
  collapsed,
  toggle,
  select,
}: {
  task: TaskNode;
  query: string;
  selectedId?: string;
  collapsed: string[];
  toggle: (id: string) => void;
  select: (sel: { kind: "task" | "action"; id: string }) => void;
}) {
  const open = query
    ? stripBbcode(task.taskTitle).toLowerCase().includes(query) ||
      task.actions.some((a) => stripBbcode(`${a.actionTitle} ${a.check}`).toLowerCase().includes(query))
    : collapsed.includes(`open:${task.id}`);
  return (
    <div>
      <Line
        active={selectedId === task.id}
        depth={2}
        open={open}
        hasChildren={task.actions.length > 0}
        title={task.taskTitle}
        onToggle={() => toggle(`open:${task.id}`)}
        onClick={() => select({ kind: "task", id: task.id })}
      />
      {open
        ? task.actions.map((ac) => (
            <Line
              key={ac.id}
              active={selectedId === ac.id}
              depth={3}
              open={false}
              hasChildren={false}
              title={ac.actionTitle}
              meta={ac.check}
              onClick={() => select({ kind: "action", id: ac.id })}
            />
          ))
        : null}
    </div>
  );
}

const Line = memo(function Line(props: {
  active: boolean;
  depth: 1 | 2 | 3;
  open: boolean;
  hasChildren: boolean;
  title: string;
  meta?: string;
  dot?: "ok" | "muted";
  onToggle?: () => void;
  onClick: () => void;
}) {
  const pad = props.depth === 1 ? "pl-2" : props.depth === 2 ? "pl-6" : "pl-10";
  return (
    <div
      className={`group relative flex h-7 min-w-0 items-center gap-0.5 ${pad} pr-1 ${
        props.active ? "bg-elevated" : "hover:bg-elevated/50"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {props.active ? <span className="absolute inset-y-0 left-0 w-px bg-accent" /> : null}
      {props.hasChildren ? (
        <button
          className="grid size-5 shrink-0 place-items-center text-subtle"
          onClick={(e) => {
            e.stopPropagation();
            props.onToggle?.();
          }}
          aria-label="Toggle"
        >
          {props.open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </button>
      ) : (
        <span className="size-5 shrink-0" />
      )}
      <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={props.onClick}>
        <BbText className="min-w-0 flex-1 truncate text-sm leading-5" text={props.title} inline />
        {props.meta ? <span className="max-w-16 shrink-0 truncate font-mono text-xs text-subtle">{props.meta}</span> : null}
      </button>
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          props.dot === "ok" ? "bg-ok" : props.active ? "bg-accent" : "bg-border"
        }`}
      />
    </div>
  );
});

function SelectedHint() {
  const project = usePdaStore((s) => s.project);
  const selected = usePdaStore((s) => s.selected);
  const ctx = selectedContext(project, selected);
  if (!ctx) {
    return <div className="border-t border-border px-3 py-2 text-xs text-subtle">{project.chapters.length} chapters</div>;
  }
  return (
    <div className="border-t border-border px-3 py-2 text-xs text-subtle">
      {ctx.kind === "chapter" && `${ctx.chapter.category || "Chapter"} · ${(ctx.ci ?? 0) + 1} / ${project.chapters.length}`}
      {ctx.kind === "task" && (
        <>
          Task · <BbText className="inline" text={ctx.chapter.chapterTitle} inline />
        </>
      )}
      {ctx.kind === "action" && `Action · ${ctx.action.check || "no check"}`}
    </div>
  );
}

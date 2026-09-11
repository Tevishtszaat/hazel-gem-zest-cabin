import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { durableStorage, putCatalogTexts, loadCatalogTexts, clearCatalogTexts } from "@/lib/pda/idb-storage.ts";
import { stringifyCsv, csvLookup } from "@/lib/pda/csv.ts";
import { blankProject, applyCsvText, newAction, newChapter, newTask, type ImportFiles } from "@/lib/pda/yaml-import.ts";
import { classifyScenarioPath, dropCatalogGroup, emptyCatalog, mergeCatalog, catalogLoadSummary, type ScenarioCatalog, type ScenarioSource } from "@/lib/pda/scenario-index.ts";
import { importPdaOffthread, indexScenarioOffthread } from "@/lib/pda/offload.ts";
import { beginBusy, endBusy, setBusyDetail } from "@/store/busy-store.ts";
import { clearImages, putImages, warmImageCache, type ImageSet } from "@/lib/pda/image-store.ts";
import type { ImportKind } from "@/lib/pda/import-kinds.ts";
import { catalogText } from "@/lib/pda/library.ts";
import { applyEcfFix, applyYamlReplace } from "@/lib/pda/validate-files.ts";
import type { ProblemFix } from "@/lib/pda/validate.ts";
import type { ChapterNode, PdaProject } from "@/lib/pda/types.ts";

function imageSetFor(path: string, kind: ImportKind): ImageSet {
  const role = classifyScenarioPath(path, kind);
  if (role === "wallpaper") return "wallpaper";
  if (role === "itemPicture") return "item";
  return "pda";
}

type Sel = { kind: "chapter" | "task" | "action"; id: string } | null;

type PdaState = {
  project: PdaProject;
  catalog: ScenarioCatalog;
  selected: Sel;
  query: string;
  category: string;
  collapsed: string[];
  importOpen: boolean;
  setQuery: (q: string) => void;
  setLanguage: (language: string) => void;
  setCategory: (c: string) => void;
  select: (sel: Sel) => void;
  toggleCollapsed: (id: string) => void;
  setImportOpen: (open: boolean) => void;
  replaceProject: (project: PdaProject) => void;
  importFiles: (files: ImportFiles) => void;
  importScenario: (files: ScenarioSource[]) => void;
  ingestSources: (kind: ImportKind, files: ScenarioSource[]) => Promise<string>;
  clearImageSet: (set: ImageSet) => Promise<void>;
  setCatalog: (catalog: ScenarioCatalog) => void;
  setCatalogText: (role: string, text: string, path?: string) => void;
  patchChapter: (id: string, patch: Partial<ChapterNode>) => void;
  updateSelected: (mut: (project: PdaProject) => void) => void;
  addChapter: (category?: string) => void;
  addTask: () => void;
  addAction: () => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  deleteNodes: (ids: string[]) => void;
  patchNode: (id: string, patch: Record<string, unknown>) => void;
  applyBulk: (patches: { id: string; patch: Record<string, unknown> }[], deleteIds?: string[]) => void;
  applyFileFix: (fix: ProblemFix) => void;
  ignoredProblems: string[];
  ignoreProblems: (keys: string[]) => void;
  unignoreProblems: (keys: string[]) => void;
  jumpTo: (id: string) => void;
  moveSelected: (dir: -1 | 1) => void;
  reset: () => void;
};

function importReport(catalog: ScenarioCatalog, prefix: string) {
  const { missing, loaded } = catalogLoadSummary(catalog);
  const bits = [prefix];
  if (loaded.length) bits.push(`${loaded.length} config bodies stored`);
  if (missing.length) bits.push(`still need ${missing.join(", ")}`);
  return bits.join(" · ");
}

function findContext(project: PdaProject, id: string | undefined | null) {
  if (!id) return null;
  for (let ci = 0; ci < project.chapters.length; ci++) {
    const chapter = project.chapters[ci]!;
    if (chapter.id === id) return { kind: "chapter" as const, ci, chapter };
    for (let ti = 0; ti < chapter.tasks.length; ti++) {
      const task = chapter.tasks[ti]!;
      if (task.id === id) return { kind: "task" as const, ci, ti, chapter, task };
      for (let ai = 0; ai < task.actions.length; ai++) {
        const action = task.actions[ai]!;
        if (action.id === id) return { kind: "action" as const, ci, ti, ai, chapter, task, action };
      }
    }
  }
  return null;
}

function retag<T>(value: T): T {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const copy: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) {
        copy[k] = k === "id" ? crypto.randomUUID() : walk(v);
      }
      return copy;
    }
    return node;
  };
  return walk(value) as T;
}

export const usePdaStore = create<PdaState>()(
  persist(
    (set, get) => ({
      project: blankProject(),
      catalog: emptyCatalog(),
      selected: null,
      query: "",
      category: "all",
      collapsed: [],
      importOpen: false,
      ignoredProblems: [],
      setQuery: (query: string) => set({ query }),
      setLanguage: (language) =>
        set((s) => {
          const proj = structuredClone(s.project);
          proj.language = language;
          for (const ch of proj.chapters) {
            if (ch.titleKey) ch.chapterTitle = csvLookup(proj.csv, ch.titleKey, language) || ch.chapterTitle;
            if (ch.descriptionKey) ch.description = csvLookup(proj.csv, ch.descriptionKey, language) || ch.description;
            if (ch.preambleKey) ch.preamble = csvLookup(proj.csv, ch.preambleKey, language) || ch.preamble;
            for (const tk of ch.tasks) {
              if (tk.titleKey) tk.taskTitle = csvLookup(proj.csv, tk.titleKey, language) || tk.taskTitle;
              if (tk.startMessageKey)
                tk.startMessage = csvLookup(proj.csv, tk.startMessageKey, language) || tk.startMessage;
              for (const ac of tk.actions) {
                if (ac.titleKey) ac.actionTitle = csvLookup(proj.csv, ac.titleKey, language) || ac.actionTitle;
                if (ac.descriptionKey)
                  ac.description = csvLookup(proj.csv, ac.descriptionKey, language) || ac.description;
              }
            }
          }
          return { project: proj };
        }),
      setCategory: (category) => set({ category }),
      select: (selected) => set({ selected }),
      toggleCollapsed: (id) =>
        set((s) => ({
          collapsed: s.collapsed.includes(id) ? s.collapsed.filter((x) => x !== id) : [...s.collapsed, id],
        })),
      setImportOpen: (importOpen) => set({ importOpen }),
      replaceProject: (project) =>
        set({
          project,
          selected: null,
          collapsed: project.chapters.map((c) => c.id),
        }),
      importFiles: (files) => {
        void importPdaOffthread(files).then((project) => get().replaceProject(project));
      },
      importScenario: (files) => {
        void get().ingestSources("scenario", files);
      },
      ingestSources: async (kind, files) => {
        beginBusy("load", "Indexing scenario…");
        try {
          if (!files.length) throw new Error("No matching files in that drop.");
          setBusyDetail(`Indexing ${files.length} files…`, 8);
          const indexed = await indexScenarioOffthread(files, kind);
          const catalog = mergeCatalog(get().catalog, indexed.catalog);
          const texts = catalog.texts ?? [];
          if (texts.length) {
            setBusyDetail(`Saving ${texts.length} configs…`, 30);
            try {
              await putCatalogTexts(texts, (done, total) => {
                setBusyDetail(`Saving configs ${done}/${total}`, 30 + Math.round((done / Math.max(1, total)) * 25));
              });
            } catch (err) {
              console.warn("Could not persist catalog texts", err);
            }
          }

          const imageFiles = files.filter((file) => {
            const role = classifyScenarioPath(file.path, kind);
            return (role === "picture" || role === "itemPicture") && file.blob;
          });
          const wallpaperFiles = files.filter(
            (file) => classifyScenarioPath(file.path, kind) === "wallpaper" && file.blob,
          );

          const storeIcons = async () => {
            if (!imageFiles.length) return;
            setBusyDetail(`Storing ${imageFiles.length} icons…`, 60);
            await putImages(
              imageFiles.map((file) => ({
                path: file.path,
                blob: file.blob!,
                set: imageSetFor(file.path, kind),
              })),
              (done, total) =>
                setBusyDetail(`Storing icons ${done}/${total}`, 60 + Math.round((done / Math.max(1, total)) * 25)),
            );
          };

          const csvOnly =
            kind === "pdaCsv" ||
            (kind !== "scenario" && kind !== "pdaYaml" && indexed.pda?.csvText && !indexed.pda.yamlText);
          if (kind === "pdaCsv" || csvOnly) {
            const csvText =
              indexed.pda?.csvText || files.find((f) => classifyScenarioPath(f.path, kind) === "pdaCsv")?.text;
            if (!csvText) throw new Error("No PDA.csv in that drop.");
            const project = structuredClone(get().project);
            applyCsvText(project, csvText, indexed.pda?.csvName);
            set({ project, catalog });
            await storeIcons();
            if (wallpaperFiles.length) {
              void putImages(
                wallpaperFiles.map((file) => ({ path: file.path, blob: file.blob!, set: "wallpaper" as const })),
              );
            }
            setBusyDetail("Import finished", 100);
            return importReport(catalog, `Merged ${Object.keys(project.csv.rows).length} CSV keys.`);
          }

          if (indexed.pda?.yamlText) {
            setBusyDetail("Parsing PDA.yaml…", 55);
            const existingCsv =
              !indexed.pda.csvText && Object.keys(get().project.csv.rows).length
                ? stringifyCsv(get().project.csv)
                : indexed.pda.csvText;
            const project = await importPdaOffthread({
              yamlText: indexed.pda.yamlText,
              yamlName: indexed.pda.yamlName,
              csvText: existingCsv,
              csvName: indexed.pda.csvName,
            });
            if (catalog.folderName && (project.name === "Imported scenario" || project.name === "PDA")) {
              project.name = catalog.folderName;
            }
            get().replaceProject(project);
            set({ catalog });
            await storeIcons();
            if (wallpaperFiles.length) {
              void putImages(
                wallpaperFiles.map((file) => ({ path: file.path, blob: file.blob!, set: "wallpaper" as const })),
              );
            }
            setBusyDetail("Import finished", 100);
            return importReport(catalog, `Loaded ${project.chapters.length} chapters from ${indexed.pda.yamlName || "PDA.yaml"}.`);
          }

          if (kind === "pdaYaml") throw new Error("No PDA.yaml found.");
          set({ catalog });
          await storeIcons();
          if (wallpaperFiles.length) {
            void putImages(
              wallpaperFiles.map((file) => ({ path: file.path, blob: file.blob!, set: "wallpaper" as const })),
            );
          }
          const added = indexed.catalog.files.length;
          const pics = imageFiles.length;
          setBusyDetail("Import finished", 100);
          return importReport(
            catalog,
            `Indexed ${added} file${added === 1 ? "" : "s"}${pics ? ` · ${pics} images stored` : ""}.`,
          );
        } finally {
          endBusy("load");
        }
      },
      clearImageSet: async (imageSet) => {
        await clearImages(imageSet);
        if (imageSet === "pda" || imageSet === "item") {
          set({ catalog: dropCatalogGroup(get().catalog, imageSet) });
        }
      },
      setCatalog: (catalog) => set({ catalog }),
      setCatalogText: (role, text, path) =>
        set((s) => {
          const texts = [...(s.catalog.texts ?? [])];
          const i =
            role === "playfieldYaml" && path
              ? texts.findIndex((t) => t.role === role && t.path === path)
              : texts.findIndex((t) => t.role === role);
          if (i >= 0) texts[i] = { ...texts[i]!, text, path: path || texts[i]!.path };
          else texts.push({ role, path: path || role, text });
          void putCatalogTexts([texts[i >= 0 ? i : texts.length - 1]!]);
          const files = [...s.catalog.files];
          if (!files.some((f) => f.role === role && (!path || f.path === path))) {
            files.push({ role, path: path || role, count: 1 });
          }
          return { catalog: { ...s.catalog, texts, files, indexedAt: Date.now() } };
        }),
      patchChapter: (id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            chapters: s.project.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        })),
      updateSelected: (mut) =>
        set((s) => {
          const next = structuredClone(s.project);
          mut(next);
          return { project: next };
        }),
      addChapter: (category) =>
        set((s) => {
          const ch = newChapter();
          if (category) ch.category = category;
          else if (s.category && s.category !== "all") ch.category = s.category;
          return {
            project: { ...s.project, chapters: [...s.project.chapters, ch] },
            selected: { kind: "chapter", id: ch.id },
            collapsed: s.collapsed.filter((id) => id !== ch.id && id !== `cat:${ch.category}`),
          };
        }),
      addTask: () =>
        set((s) => {
          const ctx = findContext(s.project, s.selected?.id) ?? { chapter: s.project.chapters[0] };
          if (!("chapter" in ctx) || !ctx.chapter) {
            const ch = newChapter();
            return {
              project: { ...s.project, chapters: [...s.project.chapters, ch] },
              selected: { kind: "chapter", id: ch.id },
            };
          }
          const tk = newTask();
          const chapters = s.project.chapters.map((c) =>
            c.id === ctx.chapter.id ? { ...c, tasks: [...c.tasks, tk] } : c,
          );
          return { project: { ...s.project, chapters }, selected: { kind: "task", id: tk.id } };
        }),
      addAction: () =>
        set((s) => {
          const ctx = findContext(s.project, s.selected?.id);
          const task = ctx && "task" in ctx ? ctx.task : ctx?.chapter.tasks.at(-1);
          const chapter = ctx?.chapter ?? s.project.chapters[0];
          if (!task || !chapter) return s;
          const ac = newAction();
          const chapters = s.project.chapters.map((c) =>
            c.id === chapter.id
              ? {
                  ...c,
                  tasks: c.tasks.map((t) => (t.id === task.id ? { ...t, actions: [...t.actions, ac] } : t)),
                }
              : c,
          );
          return { project: { ...s.project, chapters }, selected: { kind: "action", id: ac.id } };
        }),
      duplicateSelected: () =>
        set((s) => {
          const ctx = findContext(s.project, s.selected?.id);
          if (!ctx) return s;
          const chapters = s.project.chapters.map((c) => ({ ...c, tasks: c.tasks.map((t) => ({ ...t, actions: [...t.actions] })) }));
          if (ctx.kind === "chapter") {
            const copy = retag(ctx.chapter);
            copy.chapterTitle += " copy";
            chapters.splice(ctx.ci + 1, 0, copy);
            return { project: { ...s.project, chapters }, selected: { kind: "chapter", id: copy.id } };
          }
          if (ctx.kind === "task") {
            const copy = retag(ctx.task);
            copy.taskTitle += " copy";
            chapters[ctx.ci]!.tasks.splice(ctx.ti + 1, 0, copy);
            return { project: { ...s.project, chapters }, selected: { kind: "task", id: copy.id } };
          }
          const copy = retag(ctx.action);
          copy.actionTitle += " copy";
          chapters[ctx.ci]!.tasks[ctx.ti]!.actions.splice(ctx.ai + 1, 0, copy);
          return { project: { ...s.project, chapters }, selected: { kind: "action", id: copy.id } };
        }),
      deleteSelected: () => {
        const id = get().selected?.id;
        if (id) get().deleteNodes([id]);
      },
      deleteNodes: (ids) =>
        set((s) => {
          const drop = new Set(ids);
          if (!drop.size) return s;
          const selectedId = s.selected?.id;
          const chapters = s.project.chapters
            .filter((c) => !drop.has(c.id))
            .map((c) => ({
              ...c,
              tasks: c.tasks
                .filter((t) => !drop.has(t.id))
                .map((t) => ({
                  ...t,
                  actions: t.actions.filter((a) => !drop.has(a.id)),
                })),
            }));
          const still = selectedId && findContext({ ...s.project, chapters }, selectedId);
          return {
            project: { ...s.project, chapters },
            selected: still ? s.selected : null,
          };
        }),
      patchNode: (id, patch) =>
        set((s) => {
          const ctx = findContext(s.project, id);
          if (!ctx) return s;
          const chapters = s.project.chapters.map((c) => {
            if (ctx.kind === "chapter" && c.id === id) return { ...c, ...patch };
            if (c.id !== ctx.chapter.id) return c;
            return {
              ...c,
              tasks: c.tasks.map((t) => {
                if (ctx.kind === "task" && t.id === id) return { ...t, ...patch };
                if (ctx.kind !== "action" || t.id !== ctx.task.id) return t;
                return {
                  ...t,
                  actions: t.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
                };
              }),
            };
          });
          return { project: { ...s.project, chapters } };
        }),
      applyBulk: (patches, deleteIds = []) =>
        set((s) => {
          const drop = new Set(deleteIds);
          const map = new Map(patches.map((p) => [p.id, p.patch]));
          if (!drop.size && !map.size) return s;
          const chapters = s.project.chapters
            .filter((c) => !drop.has(c.id))
            .map((c) => {
              const chapter = map.has(c.id) ? { ...c, ...map.get(c.id) } : c;
              return {
                ...chapter,
                tasks: chapter.tasks
                  .filter((t) => !drop.has(t.id))
                  .map((t) => {
                    const task = map.has(t.id) ? { ...t, ...map.get(t.id) } : t;
                    return {
                      ...task,
                      actions: task.actions
                        .filter((a) => !drop.has(a.id))
                        .map((a) => (map.has(a.id) ? { ...a, ...map.get(a.id) } : a)),
                    };
                  }),
              };
            });
          const selectedId = s.selected?.id;
          const still = selectedId && findContext({ ...s.project, chapters }, selectedId);
          return {
            project: { ...s.project, chapters },
            selected: still ? s.selected : null,
          };
        }),
      applyFileFix: (fix) => {
        if (fix.type === "ecf-set") {
          const current = catalogText(get().catalog, fix.role);
          if (!current?.text) return;
          get().setCatalogText(fix.role, applyEcfFix(current.text, fix.name, fix.field, fix.value), current.path);
          return;
        }
        if (fix.type === "yaml-replace") {
          const texts = get().catalog.texts ?? [];
          const current =
            texts.find((t) => t.role === fix.role && t.path === fix.path) ?? texts.find((t) => t.role === fix.role);
          if (!current?.text) return;
          get().setCatalogText(fix.role, applyYamlReplace(current.text, fix.from, fix.to), current.path);
        }
      },
      ignoreProblems: (keys) =>
        set((s) => ({
          ignoredProblems: [...new Set([...s.ignoredProblems, ...keys.filter(Boolean)])],
        })),
      unignoreProblems: (keys) =>
        set((s) => {
          const drop = new Set(keys);
          return { ignoredProblems: s.ignoredProblems.filter((k) => !drop.has(k)) };
        }),
      jumpTo: (id) =>
        set((s) => {
          const ctx = findContext(s.project, id);
          if (!ctx) return s;
          const catId = `cat:${ctx.chapter.category || "Uncategorized"}`;
          let collapsed = s.collapsed.filter((x) => x !== ctx.chapter.id && x !== catId);
          if (ctx.kind === "task" || ctx.kind === "action") {
            const openId = `open:${ctx.task.id}`;
            if (!collapsed.includes(openId)) collapsed = [...collapsed, openId];
          }
          return {
            selected: {
              kind: ctx.kind,
              id: ctx.kind === "chapter" ? ctx.chapter.id : ctx.kind === "task" ? ctx.task.id : ctx.action.id,
            },
            collapsed,
          };
        }),
      moveSelected: (dir) =>
        set((s) => {
          const ctx = findContext(s.project, s.selected?.id);
          if (!ctx) return s;
          const swap = <T,>(arr: T[], i: number) => {
            const j = i + dir;
            if (j < 0 || j >= arr.length) return arr;
            const copy = [...arr];
            [copy[i], copy[j]] = [copy[j]!, copy[i]!];
            return copy;
          };
          let chapters = s.project.chapters;
          if (ctx.kind === "chapter") chapters = swap(chapters, ctx.ci);
          if (ctx.kind === "task") {
            chapters = chapters.map((c, i) => (i === ctx.ci ? { ...c, tasks: swap(c.tasks, ctx.ti) } : c));
          }
          if (ctx.kind === "action") {
            chapters = chapters.map((c, i) =>
              i === ctx.ci
                ? {
                    ...c,
                    tasks: c.tasks.map((t, ti) => (ti === ctx.ti ? { ...t, actions: swap(t.actions, ctx.ai) } : t)),
                  }
                : c,
            );
          }
          return { project: { ...s.project, chapters } };
        }),
      reset: () => {
        void clearCatalogTexts();
        set({
          project: blankProject(),
          catalog: emptyCatalog(),
          selected: null,
          collapsed: [],
          ignoredProblems: [],
        });
      },
    }),
    {
      name: "pulsepda.project.v3",
      storage: createJSONStorage(() => durableStorage),
      partialize: (s) => ({
        project: s.project,
        catalog: { ...s.catalog, texts: [] as typeof s.catalog.texts },
        selected: s.selected,
        collapsed: s.collapsed,
        category: s.category,
        ignoredProblems: s.ignoredProblems,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PdaState>;
        return {
          ...current,
          ...saved,
          catalog: saved.catalog ?? emptyCatalog(),
          project: saved.project ?? current.project,
        };
      },
      onRehydrateStorage: () => {
        beginBusy("load");
        return () => {
          void (async () => {
            const cat = usePdaStore.getState().catalog;
            const stored = await loadCatalogTexts();
            if (stored.length) {
              usePdaStore.setState({ catalog: { ...cat, texts: stored } });
            } else if (cat.texts?.length) {
              await putCatalogTexts(cat.texts);
            }
          })()
            .catch(() => {
              /* keep rehydrated catalog */
            })
            .finally(() => {
              endBusy("load");
              void warmImageCache();
            });
        };
      },
    },
  ),
);

export function selectedContext(project: PdaProject, selected: Sel) {
  return findContext(project, selected?.id);
}

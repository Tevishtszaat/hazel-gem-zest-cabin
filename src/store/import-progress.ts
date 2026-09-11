import { create } from "zustand";
import type { ImportKind } from "@/lib/pda/import-kinds.ts";

export type AreaPhase = "idle" | "queued" | "work" | "done";

export type AreaSnap = {
  total: number;
  done: number;
  phase: AreaPhase;
};

type ImportProgressState = {
  areas: Partial<Record<ImportKind, AreaSnap>>;
  reset: (totals: Partial<Record<ImportKind, number>>) => void;
  tick: (kind: ImportKind, n?: number) => void;
  finish: (kind?: ImportKind) => void;
  clear: () => void;
};

export const useImportProgress = create<ImportProgressState>((set) => ({
  areas: {},
  reset: (totals) => {
    const areas: ImportProgressState["areas"] = {};
    for (const [key, total] of Object.entries(totals)) {
      if (!total) continue;
      areas[key as ImportKind] = { total, done: 0, phase: "queued" };
    }
    set({ areas });
  },
  tick: (kind, n = 1) =>
    set((s) => {
      const cur = s.areas[kind];
      if (!cur) return s;
      const done = Math.min(cur.total, cur.done + n);
      return {
        areas: {
          ...s.areas,
          [kind]: { ...cur, done, phase: done >= cur.total ? "done" : "work" },
        },
      };
    }),
  finish: (kind) =>
    set((s) => {
      if (kind) {
        const cur = s.areas[kind];
        if (!cur) return s;
        return { areas: { ...s.areas, [kind]: { ...cur, done: cur.total, phase: "done" } } };
      }
      const areas: ImportProgressState["areas"] = {};
      for (const [key, cur] of Object.entries(s.areas)) {
        if (!cur) continue;
        areas[key as ImportKind] = { ...cur, done: cur.total, phase: "done" };
      }
      return { areas };
    }),
  clear: () => set({ areas: {} }),
}));

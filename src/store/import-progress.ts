import { create } from "zustand";
import type { ImportKind } from "@/lib/pda/import-kinds.ts";

export type AreaPhase = "idle" | "queued" | "work" | "done";

export type AreaSnap = {
  total: number;
  done: number;
  phase: AreaPhase;
  pct: number;
};

type ImportProgressState = {
  areas: Partial<Record<ImportKind, AreaSnap>>;
  reset: (totals: Partial<Record<ImportKind, number>>) => void;
  tick: (kind: ImportKind, n?: number) => void;
  boost: (kind: ImportKind, pct: number) => void;
  boostAll: (pct: number) => void;
  finish: (kind?: ImportKind) => void;
  clear: () => void;
};

function readPct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 70);
}

export function areaPercent(snap: AreaSnap) {
  if (snap.phase === "done") return 100;
  return Math.max(0, Math.min(100, snap.pct));
}

export const useImportProgress = create<ImportProgressState>((set) => ({
  areas: {},
  reset: (totals) => {
    const areas: ImportProgressState["areas"] = {};
    for (const [key, total] of Object.entries(totals)) {
      if (!total) continue;
      areas[key as ImportKind] = { total, done: 0, phase: "queued", pct: 0 };
    }
    set({ areas });
  },
  tick: (kind, n = 1) =>
    set((s) => {
      const cur = s.areas[kind];
      if (!cur || cur.phase === "done") return s;
      const done = Math.min(cur.total, cur.done + n);
      return {
        areas: {
          ...s.areas,
          [kind]: { ...cur, done, phase: "work", pct: Math.max(cur.pct, readPct(done, cur.total)) },
        },
      };
    }),
  boost: (kind, pct) =>
    set((s) => {
      const cur = s.areas[kind];
      if (!cur || cur.phase === "done") return s;
      return {
        areas: {
          ...s.areas,
          [kind]: { ...cur, phase: "work", pct: Math.max(cur.pct, Math.min(99, pct)) },
        },
      };
    }),
  boostAll: (pct) =>
    set((s) => {
      const areas: ImportProgressState["areas"] = {};
      for (const [key, cur] of Object.entries(s.areas)) {
        if (!cur) continue;
        if (cur.phase === "done") areas[key as ImportKind] = cur;
        else areas[key as ImportKind] = { ...cur, phase: "work", pct: Math.max(cur.pct, Math.min(99, pct)) };
      }
      return { areas };
    }),
  finish: (kind) =>
    set((s) => {
      if (kind) {
        const cur = s.areas[kind];
        if (!cur) return s;
        return { areas: { ...s.areas, [kind]: { ...cur, done: cur.total, phase: "done", pct: 100 } } };
      }
      const areas: ImportProgressState["areas"] = {};
      for (const [key, cur] of Object.entries(s.areas)) {
        if (!cur) continue;
        areas[key as ImportKind] = { ...cur, done: cur.total, phase: "done", pct: 100 };
      }
      return { areas };
    }),
  clear: () => set({ areas: {} }),
}));

import { create } from "zustand";

type Kind = "load" | "save" | "think";

type BusyState = {
  load: number;
  save: number;
  think: number;
  detail: string;
  pct: number | null;
  begin: (kind: Kind, detail?: string) => void;
  end: (kind: Kind) => void;
  setDetail: (detail: string, pct?: number | null) => void;
};

export const useBusyStore = create<BusyState>((set) => ({
  load: 0,
  save: 0,
  think: 0,
  detail: "",
  pct: null,
  begin: (kind, detail) =>
    set((s) => ({
      [kind]: s[kind] + 1,
      detail: detail ?? s.detail,
    })),
  end: (kind) =>
    set((s) => {
      const next = Math.max(0, s[kind] - 1);
      const still = (kind === "load" ? next : s.load) + (kind === "save" ? next : s.save) + (kind === "think" ? next : s.think);
      return {
        [kind]: next,
        detail: still ? s.detail : "",
        pct: still ? s.pct : null,
      };
    }),
  setDetail: (detail, pct) => set({ detail, pct: pct ?? null }),
}));

export function beginBusy(kind: Kind, detail?: string) {
  useBusyStore.getState().begin(kind, detail);
}

export function endBusy(kind: Kind) {
  useBusyStore.getState().end(kind);
}

export function setBusyDetail(detail: string, pct?: number | null) {
  useBusyStore.getState().setDetail(detail, pct);
}

export function busyLabel(state: Pick<BusyState, Kind>) {
  if (state.load) return "Loading";
  if (state.think) return "Thinking";
  if (state.save) return "Saving";
  return null;
}

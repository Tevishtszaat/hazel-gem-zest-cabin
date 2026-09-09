import { create } from "zustand";

type Kind = "load" | "save" | "think";

type BusyState = {
  load: number;
  save: number;
  think: number;
  begin: (kind: Kind) => void;
  end: (kind: Kind) => void;
};

export const useBusyStore = create<BusyState>((set) => ({
  load: 0,
  save: 0,
  think: 0,
  begin: (kind) => set((s) => ({ [kind]: s[kind] + 1 })),
  end: (kind) => set((s) => ({ [kind]: Math.max(0, s[kind] - 1) })),
}));

export function beginBusy(kind: Kind) {
  useBusyStore.getState().begin(kind);
}

export function endBusy(kind: Kind) {
  useBusyStore.getState().end(kind);
}

export function busyLabel(state: Pick<BusyState, Kind>) {
  if (state.load) return "Loading";
  if (state.think) return "Thinking";
  if (state.save) return "Saving";
  return null;
}

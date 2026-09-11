import { create } from "zustand";
import type { ProblemStats } from "@/lib/pda/validate.ts";
import { problemStats } from "@/lib/pda/validate.ts";

const empty = problemStats([]);

export const useDebugStats = create<ProblemStats>(() => empty);

export function setDebugStats(stats: ProblemStats) {
  useDebugStats.setState(stats);
}

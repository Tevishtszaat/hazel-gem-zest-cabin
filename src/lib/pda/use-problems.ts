import { useEffect, useState } from "react";
import { validateOffthread } from "./offload.ts";
import { problemStats, type Problem } from "./validate.ts";
import { usePdaStore } from "@/store/pda-store.ts";

const emptyStats = problemStats([]);

export function useProblems() {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const [issues, setIssues] = useState<Problem[]>([]);
  const [stats, setStats] = useState(emptyStats);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(() => {
      void validateOffthread(project, catalog)
        .then((result) => {
          if (cancelled) return;
          setIssues(result.issues);
          setStats(result.stats);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [project, catalog]);

  return { issues, stats, busy };
}

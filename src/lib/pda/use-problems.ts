import { useEffect, useMemo, useState } from "react";
import { validateOffthread } from "./offload.ts";
import { problemIgnoreKey, visibleProblems } from "./problems.ts";
import { problemStats, type Problem } from "./validate.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { useBusyStore } from "@/store/busy-store.ts";

const emptyStats = problemStats([]);

export function useProblems(opts?: { includeLength?: boolean; includeIgnored?: boolean }) {
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const ignoredProblems = usePdaStore((s) => s.ignoredProblems);
  const loading = useBusyStore((s) => s.load);
  const [raw, setRaw] = useState<Problem[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(() => {
      void validateOffthread(project, catalog)
        .then((result) => {
          if (cancelled) return;
          setRaw(result.issues);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [project, catalog, loading]);

  const issues = useMemo(
    () => visibleProblems(raw, ignoredProblems, opts),
    [raw, ignoredProblems, opts?.includeLength, opts?.includeIgnored],
  );
  const stats = useMemo(() => problemStats(issues), [issues]);
  const ignoredCount = useMemo(
    () => raw.filter((issue) => ignoredProblems.includes(problemIgnoreKey(issue))).length,
    [raw, ignoredProblems],
  );

  return { issues, stats, busy, raw, ignoredCount };
}

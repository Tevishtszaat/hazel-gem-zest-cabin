import { useEffect, useMemo, useState } from "react";
import { validateFilesOffthread, validateOffthread } from "./offload.ts";
import { problemIgnoreKey, visibleProblems } from "./problems.ts";
import { problemStats, validateProject, type Problem } from "./validate.ts";
import { FILE_DEBUG_TABS, FILE_SCAN_ORDER, type FileDebugId } from "./validate-files.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { useBusyStore } from "@/store/busy-store.ts";

export type ScanProgress = { label: string; file: string; pct: number };

function tabLabel(id: string) {
  return FILE_DEBUG_TABS.find((tab) => tab.id === id)?.label || id;
}

export function useProblems(opts?: {
  includeLength?: boolean;
  includeIgnored?: boolean;
  source?: FileDebugId | "pda";
}) {
  const source = opts?.source ?? "pda";
  const project = usePdaStore((s) => s.project);
  const catalog = usePdaStore((s) => s.catalog);
  const indexedAt = catalog.indexedAt;
  const ignoredProblems = usePdaStore((s) => s.ignoredProblems);
  const loading = useBusyStore((s) => s.load);
  const [raw, setRaw] = useState<Problem[]>([]);
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<ScanProgress | null>(null);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(() => {
      void (async () => {
        const merged: Problem[] = [];
        const add = (issues: Problem[]) => {
          if (cancelled) return;
          if (issues.length) {
            merged.push(...issues);
            setRaw([...merged]);
          }
        };
        const queue =
          source === "all"
            ? (["pda-tree", "pda", ...FILE_SCAN_ORDER.filter((id) => id !== "pda")] as const)
            : source === "pda"
              ? (["pda-tree", "pda"] as const)
              : ([source] as const);
        const mark = (file: string, index: number) => {
          if (cancelled) return;
          const label = file === "pda-tree" ? "PDA tree" : tabLabel(file);
          setScan({
            label: `Scanning ${label}…`,
            file: file === "pda-tree" ? "pda" : file,
            pct: Math.round((index / Math.max(1, queue.length)) * 100),
          });
        };
        try {
          for (let i = 0; i < queue.length; i++) {
            if (cancelled) return;
            const step = queue[i]!;
            mark(step, i);
            if (step === "pda-tree") {
              try {
                const pda = await validateOffthread(project, catalog);
                add(pda.issues || []);
              } catch (err) {
                console.warn("PDA debug worker failed, running on this tab", err);
                add(validateProject(project, catalog));
              }
            } else {
              try {
                const part = await validateFilesOffthread(catalog, step);
                add(part.issues || []);
              } catch (err) {
                console.warn(`Debug scan failed for ${step}`, err);
              }
            }
            if (!cancelled) {
              setScan({
                label: `Scanning ${step === "pda-tree" ? "PDA tree" : tabLabel(step)}…`,
                file: step === "pda-tree" ? "pda" : step,
                pct: Math.round(((i + 1) / queue.length) * 100),
              });
            }
          }
        } catch (err) {
          console.warn("Debug scan failed", err);
          if (!merged.length) add(validateProject(project, catalog));
        } finally {
          if (!cancelled) {
            setScan(null);
            setBusy(false);
          }
        }
      })();
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [project, indexedAt, loading, source]);

  const issues = useMemo(
    () => visibleProblems(raw, ignoredProblems, opts),
    [raw, ignoredProblems, opts?.includeLength, opts?.includeIgnored],
  );
  const stats = useMemo(() => problemStats(issues), [issues]);
  const ignoredCount = useMemo(
    () => raw.filter((issue) => ignoredProblems.includes(problemIgnoreKey(issue))).length,
    [raw, ignoredProblems],
  );

  return { issues, stats, busy, raw, ignoredCount, scan };
}

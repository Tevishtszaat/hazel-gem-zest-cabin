import { useEffect, useState } from "react";
import { busyLabel, useBusyStore } from "@/store/busy-store.ts";

const LONG_JOB_MS = 3000;

export function BusyMascot() {
  const load = useBusyStore((s) => s.load);
  const save = useBusyStore((s) => s.save);
  const think = useBusyStore((s) => s.think);
  const label = busyLabel({ load, save, think });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!label) {
      setShow(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), LONG_JOB_MS);
    return () => window.clearTimeout(timer);
  }, [label]);

  if (!label || !show) return null;

  return (
    <aside
      className="pointer-events-none fixed bottom-4 right-4 z-[60] w-44 overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-border)]"
      aria-live="polite"
    >
      <img src="/loader.gif" alt="" className="aspect-square w-full object-cover" />
      <div className="border-t border-border px-2 py-1.5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent">{label}</p>
        <p className="text-xs text-muted">Cramming letters into the box…</p>
      </div>
    </aside>
  );
}

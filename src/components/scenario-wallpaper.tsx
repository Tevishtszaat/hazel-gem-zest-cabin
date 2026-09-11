import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getImageUrl, listWallpaperNames, peekImageUrl } from "@/lib/pda/image-store.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

function whenIdle(fn: () => void) {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (typeof ric === "function") return ric(fn, { timeout: 2500 });
  return window.setTimeout(fn, 400);
}

function cancelIdle(id: number) {
  const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
  if (typeof cic === "function") cic(id);
  else window.clearTimeout(id);
}

export function ScenarioWallpaper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const indexedAt = usePdaStore((s) => s.catalog.indexedAt);
  const folder = usePdaStore((s) => s.catalog.folderName);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let idleId = 0;
    const delay = window.setTimeout(() => {
      idleId = whenIdle(() => {
        void (async () => {
          try {
            const names = await listWallpaperNames();
            if (!alive || !names.length) {
              if (alive) setUrl(null);
              return;
            }
            const pick = names[hashSeed(`${pathname}|${folder}`) % names.length]!;
            const cached = peekImageUrl(pick);
            if (cached) {
              if (alive) setUrl(cached);
              return;
            }
            const next = await getImageUrl(pick);
            if (alive) setUrl(next);
          } catch {
            if (alive) setUrl(null);
          }
        })();
      });
    }, 350);
    return () => {
      alive = false;
      window.clearTimeout(delay);
      if (idleId) cancelIdle(idleId);
    };
  }, [pathname, indexedAt, folder]);

  if (!url) return null;
  return (
    <div className="scenario-wallpaper" aria-hidden>
      <img src={url} alt="" decoding="async" className="scenario-wallpaper-img" />
    </div>
  );
}

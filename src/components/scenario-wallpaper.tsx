import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getImageUrl, listWallpaperNames, peekImageUrl } from "@/lib/pda/image-store.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function ScenarioWallpaper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const indexedAt = usePdaStore((s) => s.catalog.indexedAt);
  const folder = usePdaStore((s) => s.catalog.folderName);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void listWallpaperNames().then(async (names) => {
      if (!alive) return;
      if (!names.length) {
        setUrl(null);
        return;
      }
      const seed = `${pathname}|${folder}`;
      const pick = names[hashSeed(seed) % names.length]!;
      const cached = peekImageUrl(pick);
      if (cached) {
        setUrl(cached);
        return;
      }
      const next = await getImageUrl(pick);
      if (alive) setUrl(next);
    });
    return () => {
      alive = false;
    };
  }, [pathname, indexedAt, folder]);

  if (!url) return null;
  return (
    <div
      aria-hidden
      className="scenario-wallpaper"
      style={{ backgroundImage: `url(${JSON.stringify(url)})` }}
    />
  );
}

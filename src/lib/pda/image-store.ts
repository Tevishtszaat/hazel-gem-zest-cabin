import { openPdaDb } from "./idb-storage.ts";
import { downscaleImageBlob } from "./image-scale.ts";

export type ImageSet = "pda" | "item" | "wallpaper";

export type StoredImage = {
  name: string;
  set: ImageSet;
  path: string;
  blob: Blob;
};

const urls = new Map<string, string>();
const aliases = new Map<string, string>();
let wallpaperNamesCache: string[] | null = null;
const WP_CAP = 8;

function basename(path: string): string {
  return path.replace(/\\/g, "/").split("/").pop() || path;
}

const ICON_EXT = /\.(png|jpe?g|webp|gif)$/i;

export function iconLookupKeys(name: string): string[] {
  const base = basename(name).trim();
  if (!base) return [];
  const stem = base.replace(ICON_EXT, "");
  const keys = [base, stem, `${stem}.png`, `${stem}.jpg`, `${stem}.jpeg`, `${stem}.webp`, `${stem}.gif`];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of keys) {
    const k = key.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(key);
  }
  return out;
}

export function iconCandidates(name: string, fields?: Record<string, string>): string[] {
  const custom =
    fields?.CustomIcon || fields?.customicon || fields?.Customicon || fields?.Icon || fields?.UnlockIcon;
  const refs = [custom, name].map((v) => (v || "").trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    for (const key of iconLookupKeys(ref)) {
      const k = key.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(key);
    }
  }
  return out;
}

function remember(storedName: string) {
  for (const key of iconLookupKeys(storedName)) aliases.set(key.toLowerCase(), storedName);
}

function resolveAlias(name: string): string | undefined {
  for (const key of iconLookupKeys(name)) {
    const mapped = aliases.get(key.toLowerCase());
    if (mapped) return mapped;
    if (urls.has(key)) return key;
  }
  return undefined;
}

export function peekImageUrl(name: string): string | undefined {
  const mapped = resolveAlias(name);
  if (mapped && urls.has(mapped)) return urls.get(mapped);
  return urls.get(basename(name)) || urls.get(name);
}

export async function putImages(
  files: { path: string; blob: Blob; set: ImageSet }[],
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  if (typeof indexedDB === "undefined" || !files.length) return [];
  const wallpapers: typeof files = [];
  const others: typeof files = [];
  for (const file of files) {
    if (file.set === "wallpaper") wallpapers.push(file);
    else others.push(file);
  }
  const names: string[] = [];
  if (others.length) names.push(...(await writeImageSlice(others, false, onProgress)));
  if (wallpapers.length) {
    const scaled: typeof files = [];
    for (const file of wallpapers.slice(0, WP_CAP)) {
      if (file.blob.size > 12_000_000) continue;
      const blob = await downscaleImageBlob(file.blob);
      if (!blob.size) continue;
      scaled.push({ ...file, blob });
      await new Promise((r) => setTimeout(r, 0));
    }
    names.push(...(await writeImageSlice(scaled, true)));
    wallpaperNamesCache = names.filter((n) => n.startsWith("wp:"));
  }
  return names;
}

async function writeImageSlice(
  files: { path: string; blob: Blob; set: ImageSet }[],
  wallpaper: boolean,
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  if (!files.length) return [];
  const db = await openPdaDb();
  const names: string[] = [];
  const chunk = wallpaper ? 2 : 40;
  for (let i = 0; i < files.length; i += chunk) {
    const slice = files.slice(i, i + chunk);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore("blobs");
      for (const file of slice) {
        const name = wallpaper ? `wp:${basename(file.path)}` : basename(file.path);
        names.push(name);
        store.put({ name, set: file.set, path: file.path, blob: file.blob }, name);
        remember(name);
      }
    });
    onProgress?.(Math.min(i + chunk, files.length), files.length);
    if (i + chunk < files.length) await new Promise((r) => setTimeout(r, 0));
  }
  return names;
}

export async function getImageUrl(name: string): Promise<string | null> {
  const hit = peekImageUrl(name);
  if (hit) return hit;
  if (typeof indexedDB === "undefined") return null;
  try {
    if (!name.startsWith("wp:")) {
      await warmImageCache();
      const warmed = peekImageUrl(name);
      if (warmed) return warmed;
    }
    const key = name.startsWith("wp:") ? name : resolveAlias(name) || basename(name);
    const db = await openPdaDb();
    const rec = await new Promise<StoredImage | undefined>((resolve, reject) => {
      const req = db.transaction("blobs", "readonly").objectStore("blobs").get(key);
      req.onsuccess = () => resolve(req.result as StoredImage | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!rec?.blob) return null;
    let blob = rec.blob;
    if (rec.set === "wallpaper" || rec.name.startsWith("wp:")) {
      blob = await downscaleImageBlob(blob);
      if (!blob.size) return null;
      if (blob !== rec.blob) {
        try {
          const tx = db.transaction("blobs", "readwrite");
          tx.objectStore("blobs").put({ ...rec, blob }, rec.name);
        } catch {
          /* keep original */
        }
      }
    }
    const existing = urls.get(rec.name);
    if (existing) return existing;
    const url = URL.createObjectURL(blob);
    const raced = urls.get(rec.name);
    if (raced) {
      URL.revokeObjectURL(url);
      return raced;
    }
    urls.set(rec.name, url);
    remember(rec.name);
    return url;
  } catch {
    return null;
  }
}

export async function resolveIconUrl(names: (string | undefined)[]): Promise<string | null> {
  for (const name of names) {
    if (!name) continue;
    const url = await getImageUrl(name);
    if (url) return url;
  }
  return null;
}

export async function listImageNames(): Promise<string[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openPdaDb();
  return await new Promise<string[]>((resolve, reject) => {
    const req = db.transaction("blobs", "readonly").objectStore("blobs").getAllKeys();
    req.onsuccess = () => resolve((req.result as string[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function listWallpaperNames(): Promise<string[]> {
  if (wallpaperNamesCache) return wallpaperNamesCache.slice(0, WP_CAP);
  const names = (await listImageNames()).map(String).filter((name) => name.startsWith("wp:"));
  wallpaperNamesCache = names.slice(0, WP_CAP);
  return wallpaperNamesCache;
}

export async function listImages(set?: ImageSet): Promise<StoredImage[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openPdaDb();
  const all = await new Promise<StoredImage[]>((resolve, reject) => {
    const req = db.transaction("blobs", "readonly").objectStore("blobs").getAll();
    req.onsuccess = () => resolve((req.result as StoredImage[]) || []);
    req.onerror = () => reject(req.error);
  });
  return set ? all.filter((img) => img.set === set) : all;
}

export async function clearImages(set?: ImageSet): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openPdaDb();
  if (!set) {
    for (const url of urls.values()) URL.revokeObjectURL(url);
    urls.clear();
    aliases.clear();
    wallpaperNamesCache = null;
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction("blobs", "readwrite").objectStore("blobs").clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return;
  }
  const keep = await listImages();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("blobs", "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore("blobs");
    for (const img of keep) {
      if (img.set !== set) continue;
      store.delete(img.name);
      const url = urls.get(img.name);
      if (url) URL.revokeObjectURL(url);
      urls.delete(img.name);
      if (img.set === "wallpaper") wallpaperNamesCache = null;
      for (const [alias, target] of [...aliases.entries()]) {
        if (target === img.name) aliases.delete(alias);
      }
    }
  });
}

export async function warmImageCache(): Promise<void> {
  try {
    const names = await listImageNames();
    for (const name of names) remember(String(name));
  } catch {
    /* icons load on demand */
  }
}

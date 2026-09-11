import { openPdaDb } from "./idb-storage.ts";

export type ImageSet = "pda" | "item";

export type StoredImage = {
  name: string;
  set: ImageSet;
  path: string;
  blob: Blob;
};

const urls = new Map<string, string>();
const aliases = new Map<string, string>();

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

export async function putImages(files: { path: string; blob: Blob; set: ImageSet }[]): Promise<string[]> {
  if (typeof indexedDB === "undefined" || !files.length) return [];
  const db = await openPdaDb();
  const names: string[] = [];
  const chunk = 80;
  for (let i = 0; i < files.length; i += chunk) {
    const slice = files.slice(i, i + chunk);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore("blobs");
      for (const file of slice) {
        const name = basename(file.path);
        names.push(name);
        store.put({ name, set: file.set, path: file.path, blob: file.blob }, name);
        const prev = urls.get(name);
        if (prev) URL.revokeObjectURL(prev);
        urls.set(name, URL.createObjectURL(file.blob));
        remember(name);
      }
    });
    if (i + chunk < files.length) await new Promise((r) => setTimeout(r, 0));
  }
  return names;
}

export async function getImageUrl(name: string): Promise<string | null> {
  const hit = peekImageUrl(name);
  if (hit) return hit;
  if (typeof indexedDB === "undefined") return null;
  try {
    await warmImageCache();
    const warmed = peekImageUrl(name);
    if (warmed) return warmed;
    const key = resolveAlias(name) || basename(name);
    const db = await openPdaDb();
    const rec = await new Promise<StoredImage | undefined>((resolve, reject) => {
      const req = db.transaction("blobs", "readonly").objectStore("blobs").get(key);
      req.onsuccess = () => resolve(req.result as StoredImage | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!rec?.blob) return null;
    const url = URL.createObjectURL(rec.blob);
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

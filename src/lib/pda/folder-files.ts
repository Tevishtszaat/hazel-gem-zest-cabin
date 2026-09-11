import { fileMatchesKind, type ImportKind } from "./import-kinds.ts";
import { parseEpbHeader } from "./epb.ts";
import { classifyScenarioPath, normalizePath, type ScenarioSource } from "./scenario-index.ts";

type DirReader = {
  readEntries: (ok: (entries: FsEntry[]) => void, err?: (e: DOMException) => void) => void;
};

type FsEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file?: (ok: (file: File) => void, err?: (e: DOMException) => void) => void;
  createReader?: () => DirReader;
};

function relativeOf(file: File): string {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
}

function withPath(file: File, path: string): File {
  if ((file as File & { webkitRelativePath?: string }).webkitRelativePath) return file;
  try {
    Object.defineProperty(file, "webkitRelativePath", { value: path });
  } catch {
    /* ignore */
  }
  return file;
}

async function readDir(entry: FsEntry): Promise<FsEntry[]> {
  const reader = entry.createReader?.();
  if (!reader) return [];
  const all: FsEntry[] = [];
  for (;;) {
    const batch = await new Promise<FsEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (!batch.length) break;
    all.push(...batch);
  }
  return all;
}

async function walkEntry(entry: FsEntry, out: File[]) {
  if (entry.isFile && entry.file) {
    const file = await new Promise<File>((resolve, reject) => entry.file!(resolve, reject));
    const path = normalizePath(entry.fullPath || entry.name).replace(/^\/+/, "");
    out.push(withPath(file, path));
    return;
  }
  if (entry.isDirectory) {
    const children = await readDir(entry);
    for (const child of children) await walkEntry(child, out);
  }
}

export async function filesFromDataTransfer(dt: DataTransfer): Promise<File[]> {
  const out: File[] = [];
  const items = [...dt.items];
  let walked = false;
  for (const item of items) {
    const entry = (item as DataTransferItem & { webkitGetAsEntry?: () => FsEntry | null }).webkitGetAsEntry?.();
    if (entry) {
      walked = true;
      await walkEntry(entry, out);
    }
  }
  if (walked && out.length) return out;
  return [...dt.files];
}

export function sourceReadMode(role: string | null): "text" | "blob" | "path" {
  if (role === "poi") return "path";
  if (role === "picture" || role === "itemPicture" || role === "wallpaper") return "blob";
  if (!role) return "path";
  return "text";
}

async function poolMap<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) || 0 }, async () => {
    while (next < items.length) {
      const index = next++;
      out[index] = await fn(items[index]!, index);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function sourcesFromFiles(
  files: File[],
  onProgress?: (done: number, total: number, path: string) => void,
  kind: ImportKind = "scenario",
): Promise<ScenarioSource[]> {
  const picked = files.filter((file) => fileMatchesKind(relativeOf(file), kind));
  let done = 0;
  const sources = await poolMap(picked, 10, async (file) => {
    const path = normalizePath(relativeOf(file));
    const role = classifyScenarioPath(path, kind);
    const mode = sourceReadMode(role);
    let source: ScenarioSource = { path };
    if (role === "poi") {
      try {
        const buf = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
        source = { path, meta: parseEpbHeader(buf, path) };
      } catch {
        source = { path };
      }
    } else if (mode === "blob") source = { path, blob: file };
    else if (mode === "text" && file.size <= 25_000_000) {
      if (role === "playfieldYaml" && file.size > 2_000_000) source = { path };
      else source = { path, text: await file.text() };
    }
    done += 1;
    onProgress?.(done, picked.length, path);
    if (done % 40 === 0) await new Promise((r) => setTimeout(r, 0));
    return source;
  });
  return sources;
}

export const TUTORIAL_INDEX_FILES = [
  "PDA.yaml",
  "PDA.csv",
  "Localization.csv",
  "Sectors.yaml",
  "Configuration/ItemsConfig.ecf",
  "Configuration/BlocksConfig.ecf",
  "Configuration/EClassConfig.ecf",
  "Configuration/Factions.ecf",
  "Configuration/Dialogues.ecf",
  "Configuration/TokenConfig.ecf",
  "Prefabs/Artifacts.epb",
  "Prefabs/AbandonedPOI.epb",
  "Prefabs/AlienTowerDMG.epb",
] as const;

export async function loadTutorialSources(): Promise<ScenarioSource[]> {
  const sources: ScenarioSource[] = [];
  for (const rel of TUTORIAL_INDEX_FILES) {
    const res = await fetch(`/samples/tutorial/${rel}`);
    if (!res.ok) continue;
    sources.push({ path: `eWPDA Tutorial/${rel}`, text: await res.text() });
  }
  if (!sources.some((s) => /pda\.yaml$/i.test(s.path))) {
    throw new Error("Could not load the bundled tutorial.");
  }
  return sources;
}

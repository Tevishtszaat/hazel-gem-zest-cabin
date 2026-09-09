import { fileMatchesKind, type ImportKind } from "./import-kinds.ts";
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

export async function sourcesFromFiles(
  files: File[],
  onProgress?: (done: number, total: number, path: string) => void,
  kind: ImportKind = "scenario",
): Promise<ScenarioSource[]> {
  const picked = files.filter((file) => fileMatchesKind(relativeOf(file), kind));
  const sources: ScenarioSource[] = [];
  let done = 0;
  for (const file of picked) {
    const path = normalizePath(relativeOf(file));
    const role = classifyScenarioPath(path, kind);
    onProgress?.(done, picked.length, path);
    if (role === "poi") {
      sources.push({ path });
    } else if (role === "picture" || role === "itemPicture") {
      sources.push({ path, blob: file });
    } else if (file.size > 25_000_000) {
      sources.push({ path });
    } else {
      sources.push({ path, text: await file.text() });
    }
    done += 1;
    onProgress?.(done, picked.length, path);
  }
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

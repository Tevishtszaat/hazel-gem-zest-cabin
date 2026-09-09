import type { StateStorage } from "zustand/middleware";
import { beginBusy, endBusy } from "@/store/busy-store.ts";

const DB = "pulsepda";
const STORE = "kv";
const DB_VERSION = 2;
const LEGACY_KEYS = ["pulsepda.project.v2", "pulsepda.project.v1"];

export function openPdaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const memory = new Map<string, string>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: { name: string; value: string } | null = null;

function txGet(db: IDBDatabase, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    req.onsuccess = () => {
      const value = req.result;
      resolve(typeof value === "string" ? value : value == null ? null : JSON.stringify(value));
    };
    req.onerror = () => reject(req.error);
  });
}

function txSet(db: IDBDatabase, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function txDel(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function dropLegacyLocal() {
  if (typeof localStorage === "undefined") return;
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

async function flush(name: string, value: string) {
  if (typeof indexedDB === "undefined") return;
  const db = await openPdaDb();
  await txSet(db, name, value);
  dropLegacyLocal();
}

export const durableStorage: StateStorage = {
  getItem: async (name) => {
    if (memory.has(name)) return memory.get(name)!;
    if (typeof indexedDB === "undefined") return null;
    try {
      const db = await openPdaDb();
      const fromIdb = await txGet(db, name);
      if (fromIdb != null) {
        memory.set(name, fromIdb);
        dropLegacyLocal();
        return fromIdb;
      }
      if (typeof localStorage !== "undefined") {
        for (const key of [name, ...LEGACY_KEYS]) {
          const legacy = localStorage.getItem(key);
          if (legacy) {
            memory.set(name, legacy);
            try {
              await txSet(db, name, legacy);
            } catch {
              /* keep memory copy even if IDB write fails */
            }
            dropLegacyLocal();
            return legacy;
          }
        }
      }
    } catch {
      return memory.get(name) ?? null;
    }
    return null;
  },
  setItem: (name, value) => {
    if (memory.get(name) === value) return Promise.resolve();
    memory.set(name, value);
    pending = { name, value };
    const wait = value.length > 800_000 ? 1200 : value.length > 120_000 ? 700 : 280;
    return new Promise<void>((resolve) => {
      if (writeTimer) clearTimeout(writeTimer);
      writeTimer = setTimeout(() => {
        const next = pending;
        pending = null;
        if (!next) {
          resolve();
          return;
        }
        beginBusy("save");
        void flush(next.name, next.value)
          .catch((err) => {
            console.warn("Axis 2026 Creator Particlewave could not save to IndexedDB", err);
          })
          .finally(() => {
            endBusy("save");
            resolve();
          });
      }, wait);
    });
  },
  removeItem: async (name) => {
    memory.delete(name);
    dropLegacyLocal();
    if (typeof indexedDB === "undefined") return;
    try {
      const db = await openPdaDb();
      await txDel(db, name);
    } catch {
      /* ignore */
    }
  },
};

import { runHeavy, slimCatalog, type HeavyOp, type HeavyPayload, type ValidateResult } from "./heavy-jobs.ts";
import type { ImportKind } from "./import-kinds.ts";
import type { IndexedScenario, ScenarioCatalog, ScenarioSource } from "./scenario-index.ts";
import type { PdaProject } from "./types.ts";
import type { ImportFiles } from "./yaml-import.ts";
import { beginBusy, endBusy } from "@/store/busy-store.ts";

type Req = { id: number; op: HeavyOp; payload: HeavyPayload };
type Res = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };

let worker: Worker | null | undefined;
let seq = 0;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (err: Error) => void }>();

function getWorker() {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker === undefined) {
    try {
      worker = new Worker(new URL("./heavy.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<Res>) => {
        const job = pending.get(event.data.id);
        if (!job) return;
        pending.delete(event.data.id);
        if (event.data.ok) job.resolve(event.data.result);
        else job.reject(new Error(event.data.error));
      };
      worker.onerror = () => {
        worker?.terminate();
        worker = null;
      };
    } catch {
      worker = null;
    }
  }
  return worker;
}

function call<T>(op: HeavyOp, payload: HeavyPayload): Promise<T> {
  beginBusy("think");
  const w = getWorker();
  const done = (run: Promise<T>) => run.finally(() => endBusy("think"));
  if (!w) return done(Promise.resolve(runHeavy(op, payload) as T));
  const id = ++seq;
  return done(
    new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: (value) => resolve(value as T), reject });
      w.postMessage({ id, op, payload } satisfies Req);
    }),
  );
}

export function indexScenarioOffthread(files: ScenarioSource[], kind?: ImportKind) {
  const light = files.map((file) => ({ path: file.path, text: file.text }));
  return call<IndexedScenario>("index", { files: light, kind });
}

export function importPdaOffthread(files: ImportFiles) {
  return call<PdaProject>("importPda", { importFiles: files });
}

export function validateOffthread(project: PdaProject, catalog: ScenarioCatalog) {
  return call<ValidateResult>("validate", { project, catalog: slimCatalog(catalog) });
}

import { runHeavy, type HeavyOp, type HeavyPayload } from "./heavy-jobs.ts";

type Req = { id: number; op: HeavyOp; payload: HeavyPayload };

self.onmessage = (event: MessageEvent<Req>) => {
  const { id, op, payload } = event.data;
  try {
    const result = runHeavy(op, payload);
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};

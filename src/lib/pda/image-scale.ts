const EDGE = 1280;
const QUALITY = 0.68;
const SMALL = 220_000;

const SCALE_SRC = `
self.onmessage = async (event) => {
  const { id, buffer, type, edge, quality } = event.data;
  try {
    const blob = new Blob([buffer], { type: type || "image/jpeg" });
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, edge / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d");
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const out = await canvas.convertToBlob({ type: "image/jpeg", quality });
    const buf = await out.arrayBuffer();
    self.postMessage({ id, ok: true, buffer: buf }, [buf]);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err) });
  }
};
`;

let worker: Worker | null | undefined;
let seq = 0;
const pending = new Map<number, { resolve: (blob: Blob | null) => void }>();

function getWorker() {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker !== undefined) return worker;
  try {
    const url = URL.createObjectURL(new Blob([SCALE_SRC], { type: "text/javascript" }));
    worker = new Worker(url);
    worker.onmessage = (event: MessageEvent<{ id: number; ok: boolean; buffer?: ArrayBuffer }>) => {
      const job = pending.get(event.data.id);
      if (!job) return;
      pending.delete(event.data.id);
      job.resolve(event.data.ok && event.data.buffer ? new Blob([event.data.buffer], { type: "image/jpeg" }) : null);
    };
    worker.onerror = () => {
      for (const job of pending.values()) job.resolve(null);
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  } catch {
    worker = null;
  }
  return worker;
}

export async function downscaleImageBlob(blob: Blob, edge = EDGE): Promise<Blob> {
  if (!blob || blob.size <= SMALL) return blob;
  const w = getWorker();
  if (!w) return blob;
  const id = ++seq;
  const buffer = await blob.arrayBuffer();
  return await new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      resolve(blob.size > 1_500_000 ? new Blob() : blob);
    }, 8000);
    pending.set(id, {
      resolve: (next) => {
        window.clearTimeout(timer);
        resolve(next && next.size ? next : blob);
      },
    });
    w.postMessage({ id, buffer, type: blob.type || "image/jpeg", edge, quality: QUALITY }, [buffer]);
  });
}

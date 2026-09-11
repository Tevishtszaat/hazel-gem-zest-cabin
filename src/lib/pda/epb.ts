/** Empyrion .epb header meta tags. GroupName (key 7) is not the file name. */

export type EpbMeta = {
  fileName: string;
  groupName?: string;
  spawnName?: string;
};

const MAGIC = 2022986309;
const PROP_GROUP = 7; // MetaTagKey.GroupName
const PROP_SPAWN = 16; // MetaTagKey.SpawnName / DisplayName
const TYPE_STRING = 0;
const HEADER_SCAN = 16384;

function read7Bit(view: DataView, o: { i: number }): number {
  let value = 0;
  let shift = 0;
  for (let n = 0; n < 5; n++) {
    if (o.i >= view.byteLength) throw new Error("eof");
    const b = view.getUint8(o.i++);
    value |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return value;
    shift += 7;
  }
  throw new Error("7bit");
}

function readNetString(bytes: Uint8Array, view: DataView, o: { i: number }): string {
  const len = read7Bit(view, o);
  if (len < 0 || o.i + len > bytes.length) throw new Error("str");
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(o.i, o.i + len));
  o.i += len;
  return text;
}

function looksName(value: string) {
  const t = value.trim();
  return t.length >= 2 && t.length <= 80 && /^[\w][\w +\-./()[\]]*$/.test(t);
}

function readTaggedString(bytes: Uint8Array, key: number): string | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = Math.min(bytes.length - 9, HEADER_SCAN);
  for (let i = 8; i < end; i++) {
    if (view.getInt32(i, true) !== key) continue;
    if (view.getInt32(i + 4, true) !== TYPE_STRING) continue;
    try {
      const text = readNetString(bytes, view, { i: i + 8 }).trim();
      if (looksName(text)) return text;
    } catch {
      continue;
    }
  }
  return undefined;
}

export function parseEpbHeader(bytes: Uint8Array, fileName = ""): EpbMeta {
  const base = (fileName.split(/[/\\]/).pop() ?? fileName).replace(/\.epb$/i, "");
  const meta: EpbMeta = { fileName: base };
  if (bytes.length < 16) return meta;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getInt32(0, true) !== MAGIC) return meta;
  meta.groupName = readTaggedString(bytes, PROP_GROUP);
  meta.spawnName = readTaggedString(bytes, PROP_SPAWN);
  return meta;
}

export function writeNetStringForTest(text: string): Uint8Array {
  const body = new TextEncoder().encode(text);
  if (body.length > 127) throw new Error("test string too long");
  const out = new Uint8Array(1 + body.length);
  out[0] = body.length;
  out.set(body, 1);
  return out;
}

export function buildTestEpb(opts: { groupName: string; spawnName?: string; fileName?: string }): Uint8Array {
  const chunks: number[] = [];
  const pushI32 = (n: number) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setInt32(0, n, true);
    chunks.push(...b);
  };
  const pushI16 = (n: number) => {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setInt16(0, n, true);
    chunks.push(...b);
  };
  const pushStr = (s: string) => chunks.push(...writeNetStringForTest(s));
  pushI32(MAGIC);
  pushI32(26);
  chunks.push(2);
  pushI32(8);
  pushI32(8);
  pushI32(8);
  pushI16(0);
  pushI16(opts.spawnName ? 2 : 1);
  pushI32(PROP_GROUP);
  pushI32(TYPE_STRING);
  pushStr(opts.groupName);
  if (opts.spawnName) {
    pushI32(PROP_SPAWN);
    pushI32(TYPE_STRING);
    pushStr(opts.spawnName);
  }
  return Uint8Array.from(chunks);
}

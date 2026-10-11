export type EcfRecord = {
  kind: string;
  name: string;
  id?: string;
  abbrev?: string;
};

export type EcfObject = {
  kind: string;
  plus: boolean;
  name: string;
  id?: string;
  fields: Record<string, string>;
  children?: EcfObject[];
};

const BLOCK_START = /^\s*\{\s*(\+)?([A-Za-z][A-Za-z0-9]*)\b(.*)$/;
const NAME_FIELD = /\bName:\s*(?:"([^"]+)"|'([^']+)'|([^,#}\n]+))/;
const ID_FIELD = /\bId:\s*(\d+)/;
const PROP = /^\s*([A-Za-z_][A-Za-z0-9_]*|\d+)\s*:\s*(.*)$/;

export function stripEcfComments(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.replace(/\/\*[\s\S]*?\*\//g, "\n").replace(/^\s*#.*$/gm, "");
}

function unquote(value: string) {
  const v = value.trim().replace(/,?\s*$/, "");
  const cdata = v.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdata) return cdata[1] ?? "";
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v.replace(/\s+#.*$/, "").trim();
}

function parseOpen(line: string): EcfObject | null {
  const open = line.match(BLOCK_START);
  if (!open) return null;
  const header = open[3] ?? "";
  const nameMatch = header.match(NAME_FIELD);
  const idMatch = header.match(ID_FIELD);
  let name = (nameMatch?.[1] || nameMatch?.[2] || nameMatch?.[3] || "").trim();
  if (!name) {
    name = header
      .replace(NAME_FIELD, "")
      .replace(ID_FIELD, "")
      .replace(/^[\s,]+/, "")
      .replace(/\s+#.*$/, "")
      .replace(/\}.*$/, "")
      .trim();
  }
  const obj: EcfObject = {
    kind: open[2]!,
    plus: Boolean(open[1]),
    name,
    id: idMatch?.[1],
    fields: {},
  };
  if (nameMatch || idMatch) {
    const rest = header.replace(NAME_FIELD, "").replace(ID_FIELD, "").replace(/^[\s,]+/, "");
    const extra = rest.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (extra) obj.fields[extra[1]!] = unquote(extra[2] ?? "");
  }
  return obj;
}

function braceCounts(line: string) {
  let inS = false;
  let inD = false;
  let open = 0;
  let close = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inD) {
      if (ch === "\\" && line[i + 1] === '"') i += 1;
      else if (ch === '"') inD = false;
      continue;
    }
    if (inS) {
      if (ch === "'") inS = false;
      continue;
    }
    if (ch === '"') inD = true;
    else if (ch === "'") inS = true;
    else if (ch === "{") open += 1;
    else if (ch === "}") close += 1;
  }
  return { open, close };
}

export function parseEcfObjects(text: string): EcfObject[] {
  const lines = stripEcfComments(text).split(/\r?\n/);
  const roots: EcfObject[] = [];
  const stack: EcfObject[] = [];

  const pushDone = (done: EcfObject | undefined) => {
    if (!done) return;
    if (!stack.length && done.kind.toLowerCase() !== "child") roots.push(done);
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, "");
    const opener = parseOpen(line);
    if (opener && /^\s*\{/.test(line)) {
      const parent = stack[stack.length - 1];
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(opener);
      }
      stack.push(opener);
      const { open, close } = braceCounts(line);
      if (close >= open) pushDone(stack.pop());
      continue;
    }
    const current = stack[stack.length - 1];
    if (!current) continue;
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("{") && !trimmed.startsWith("}")) {
      const prop = line.match(PROP);
      if (prop) {
        const key = prop[1]!;
        const value = unquote(prop[2] ?? "");
        if (key === "Name" && !current.name) current.name = value;
        else if (key === "Id" && !current.id) {
          if (/^\d+$/.test(value)) current.id = value;
          else if (value) current.fields.Id = value;
        }
        else current.fields[key] = value;
      }
    }
    const { open, close } = braceCounts(line);
    for (let i = 0; i < Math.max(0, close - open); i++) pushDone(stack.pop());
  }
  while (stack.length) pushDone(stack.pop());
  return roots;
}

export function harvestDeclaredNames(text: string): { kind: string; name: string }[] {
  const src = stripEcfComments(text);
  const out: { kind: string; name: string }[] = [];
  const seen = new Set<string>();
  const re = /\{\s*\+?([A-Za-z][A-Za-z0-9]*)\b([^\n]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    const kind = match[1] ?? "";
    if (!kind || /^child$/i.test(kind)) continue;
    const header = match[2] ?? "";
    const headerName = header.match(NAME_FIELD);
    let name = (headerName?.[1] || headerName?.[2] || headerName?.[3] || "").trim();
    if (!name) {
      const window = src.slice(match.index, match.index + 700);
      const named = window.match(/\bName:\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))/);
      name = (named?.[1] || named?.[2] || named?.[3] || "").trim();
    }
    if (!name) continue;
    const key = `${kind}:${name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind, name });
  }
  return out;
}

export function extractEcfRecords(text: string): EcfRecord[] {
  const seen = new Set<string>();
  const out: EcfRecord[] = [];
  const walk = (obj: EcfObject) => {
    const name = (obj.name || obj.id || "").trim();
    if (name && obj.kind.toLowerCase() !== "child") {
      const key = `${obj.kind}:${name}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        const abbrev = (obj.fields.Abbrev || obj.fields.abbrev || "").replace(/^["']|["']$/g, "").trim();
        out.push({ kind: obj.kind, name, id: obj.id, abbrev: abbrev || undefined });
      }
    }
    for (const child of obj.children ?? []) walk(child);
  };
  for (const obj of parseEcfObjects(text)) walk(obj);
  return out;
}

export function stringifyEcfObjects(objects: EcfObject[]): string {
  const emit = (obj: EcfObject, indent: number): string[] => {
    const pad = " ".repeat(indent);
    const head = [`${obj.plus ? "+" : ""}${obj.kind}`];
    const bits: string[] = [];
    if (obj.id && /^\d+$/.test(obj.id.trim()) && Number(obj.id) > 0) bits.push(`Id: ${obj.id.trim()}`);
    if (obj.name) {
      if (/^child$/i.test(obj.kind)) bits.push(obj.name);
      else bits.push(`Name: ${needsQuote(obj.name) ? `"${obj.name}"` : obj.name}`);
    }
    if (bits.length) head.push(bits.join(", "));
    const lines = [`${pad}{ ${head.join(" ")}`];
    for (const [key, value] of Object.entries(obj.fields)) {
      if (value === "" || value == null) continue;
      lines.push(`${pad}  ${key}: ${formatEcfValue(value)}`);
    }
    for (const child of obj.children ?? []) lines.push(...emit(child, indent + 2));
    lines.push(`${pad}}`);
    return lines;
  };
  return objects.map((obj) => emit(obj, 0).join("\n")).join("\n") + "\n";
}

function formatEcfValue(value: string) {
  if (/,\s*param\d+\s*:/i.test(value)) return value;
  if (needsQuote(value) || /[:(),]/.test(value)) return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

function needsQuote(value: string) {
  return /\s/.test(value) || /[:#]/.test(value);
}

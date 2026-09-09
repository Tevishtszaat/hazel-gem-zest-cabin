export type EcfRecord = {
  kind: string;
  name: string;
  id?: string;
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
  return text.replace(/\/\*[\s\S]*?\*\//g, "\n").replace(/^\s*#.*$/gm, "");
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

export function parseEcfObjects(text: string): EcfObject[] {
  const lines = stripEcfComments(text).split(/\r?\n/);
  const roots: EcfObject[] = [];
  const stack: EcfObject[] = [];

  const pushDone = (done: EcfObject | undefined) => {
    if (!done) return;
    if (!stack.length && done.kind.toLowerCase() !== "child") roots.push(done);
  };

  for (const line of lines) {
    const opener = parseOpen(line);
    if (opener && /^\s*\{/.test(line)) {
      const parent = stack[stack.length - 1];
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(opener);
      }
      stack.push(opener);
      const opens = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;
      if (closes >= opens) pushDone(stack.pop());
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
        else if (key === "Id" && !current.id) current.id = value;
        else current.fields[key] = value;
      }
    }
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    for (let i = 0; i < Math.max(0, closes - opens); i++) pushDone(stack.pop());
  }
  while (stack.length) pushDone(stack.pop());
  return roots;
}

export function extractEcfRecords(text: string): EcfRecord[] {
  const seen = new Set<string>();
  const out: EcfRecord[] = [];
  for (const obj of parseEcfObjects(text)) {
    const name = obj.name || obj.id;
    if (!name) continue;
    const key = `${obj.kind}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: obj.kind, name, id: obj.id });
  }
  return out;
}

export function stringifyEcfObjects(objects: EcfObject[]): string {
  const emit = (obj: EcfObject, indent: number): string[] => {
    const pad = " ".repeat(indent);
    const head = [`${obj.plus ? "+" : ""}${obj.kind}`];
    if (obj.id) head.push(`Id: ${obj.id}`);
    if (obj.name) {
      if (/^child$/i.test(obj.kind)) head.push(obj.name);
      else head.push(`Name: ${needsQuote(obj.name) ? `"${obj.name}"` : obj.name}`);
    }
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

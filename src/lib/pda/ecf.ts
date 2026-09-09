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
};

const BLOCK_START = /^\s*\{\s*(\+)?([A-Za-z][A-Za-z0-9]*)\b(.*)$/;
const NAME_FIELD = /\bName:\s*(?:"([^"]+)"|([A-Za-z0-9_+\-.]+))/;
const ID_FIELD = /\bId:\s*(\d+)/;
const PROP = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/;

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
  return v;
}

export function parseEcfObjects(text: string): EcfObject[] {
  const lines = stripEcfComments(text).split(/\r?\n/);
  const out: EcfObject[] = [];
  let current: EcfObject | null = null;
  let depth = 0;

  const flush = () => {
    if (current?.name) out.push(current);
    current = null;
  };

  for (const line of lines) {
    const open = line.match(BLOCK_START);
    if (open && depth === 0) {
      const kind = open[2]!;
      if (kind === "Child") continue;
      const header = open[3] ?? "";
      const nameMatch = header.match(NAME_FIELD);
      const idMatch = header.match(ID_FIELD);
      current = {
        kind,
        plus: Boolean(open[1]),
        name: (nameMatch?.[1] || nameMatch?.[2] || "").trim(),
        id: idMatch?.[1],
        fields: {},
      };
      depth = 1;
      const rest = header.replace(NAME_FIELD, "").replace(ID_FIELD, "").replace(/^[\s,]+/, "");
      if (rest.trim()) {
        const extra = rest.match(PROP);
        if (extra) current.fields[extra[1]!] = unquote(extra[2] ?? "");
      }
      if (/\}\s*$/.test(line) && depth === 1) {
        flush();
        depth = 0;
      }
      continue;
    }
    if (!current) continue;
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (opens && !closes && depth >= 1) {
      depth += opens;
      continue;
    }
    if (depth === 1) {
      const prop = line.match(PROP);
      if (prop) {
        const key = prop[1]!;
        const value = unquote(prop[2] ?? "");
        if (key === "Name" && !current.name) current.name = value;
        else if (key === "Id" && !current.id) current.id = value;
        else current.fields[key] = value;
      }
    }
    if (closes) {
      depth = Math.max(0, depth - closes);
      if (depth === 0) flush();
    } else if (opens) {
      depth += opens;
    }
  }
  flush();
  return out;
}

export function extractEcfRecords(text: string): EcfRecord[] {
  const seen = new Set<string>();
  const out: EcfRecord[] = [];
  for (const obj of parseEcfObjects(text)) {
    if (!obj.name) continue;
    const key = `${obj.kind}:${obj.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: obj.kind, name: obj.name, id: obj.id });
  }
  return out;
}

export function stringifyEcfObjects(objects: EcfObject[]): string {
  return (
    objects
      .map((obj) => {
        const head = [`${obj.plus ? "+" : ""}${obj.kind}`];
        if (obj.id) head.push(`Id: ${obj.id}`);
        if (obj.name) head.push(`Name: ${needsQuote(obj.name) ? `"${obj.name}"` : obj.name}`);
        const lines = [`{ ${head.join(" ")}`];
        for (const [key, value] of Object.entries(obj.fields)) {
          if (value === "" || value == null) continue;
          lines.push(`  ${key}: ${needsQuote(value) || /[:(),]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value}`);
        }
        lines.push("}");
        return lines.join("\n");
      })
      .join("\n") + "\n"
  );
}

function needsQuote(value: string) {
  return /\s/.test(value) || /[:#]/.test(value);
}

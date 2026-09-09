import type { CsvTable } from "./types.ts";
import { decodePdaEscapes, encodePdaEscapes } from "./bbcode.ts";

export function parseCsv(text: string): CsvTable {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = splitCsvLines(src);
  if (!lines.length) return { languages: [], rows: {} };

  const header = parseCsvLine(lines[0] ?? "").map((h) => h.trim());
  const keyIdx = header.findIndex((h) => /^key$/i.test(h));
  const k = keyIdx >= 0 ? keyIdx : 0;
  const languages = header.filter((_, i) => i !== k && header[i]);
  const rows: CsvTable["rows"] = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = parseCsvLine(line);
    const key = (cols[k] ?? "").trim();
    if (!key) continue;
    const rec: Record<string, string> = {};
    header.forEach((name, idx) => {
      if (idx === k || !name) return;
      rec[name] = decodePdaEscapes(cols[idx] ?? "");
    });
    rows[key] = rec;
  }
  return { languages, rows };
}

export function csvLookup(csv: CsvTable, key: string, language: string): string | undefined {
  const rec = csv.rows[key];
  if (!rec) return undefined;
  const pick = (v: string | undefined) => {
    if (!v || !v.trim()) return undefined;
    return decodePdaEscapes(v);
  };
  return pick(rec[language]) || pick(rec.English || rec.english || rec.EN) || csv.languages.map((lang) => pick(rec[lang])).find(Boolean);
}

export function stringifyCsv(csv: CsvTable): string {
  const langs = csv.languages.length ? csv.languages : ["English"];
  const header = ["KEY", ...langs];
  const keys = Object.keys(csv.rows);
  const lines = [header.map(csvEscape).join(",")];
  for (const key of keys) {
    const rec = csv.rows[key] ?? {};
    lines.push([key, ...langs.map((l) => rec[l] ?? "")].map(csvEscape).join(","));
  }
  return lines.join("\n") + "\n";
}

export function upsertCsv(csv: CsvTable, key: string, language: string, value: string) {
  if (!csv.rows[key]) csv.rows[key] = {};
  csv.rows[key][language] = value;
  if (!csv.languages.includes(language)) csv.languages.push(language);
}

function splitCsvLines(src: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          quoted = false;
          cur += c;
        }
      } else cur += c;
    } else if (c === '"') {
      quoted = true;
      cur += c;
    } else if (c === "\n") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  if (cur.length) out.push(cur);
  return out;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function csvEscape(value: string): string {
  const encoded = encodePdaEscapes(value);
  if (/[",\n]/.test(encoded)) return `"${encoded.replace(/"/g, '""')}"`;
  return encoded;
}

import * as yaml from "js-yaml";
import type { Problem, ProblemFix } from "./validate.ts";

type Push = (problem: Omit<Problem, "key">) => void;

function hrefFor(source: string) {
  if (source === "pda" || source === "pdaYaml" || source === "pdaCsv") return "/";
  if (source === "dialogues" || source === "dialoguesCsv") return "/dialogues";
  if (source === "playfields") return "/library/playfields";
  if (source === "galaxy") return "/library/galaxy";
  return "/library";
}

function issue(
  source: string,
  path: string,
  message: string,
  code = "syntax",
): Omit<Problem, "key"> {
  return {
    id: null,
    kind: "file",
    source: source === "pdaYaml" || source === "pdaCsv" ? "pda" : source,
    href: hrefFor(source),
    level: "error",
    code,
    message,
    path,
    recommend: "review",
    suggestions: [],
    fixes: [],
  };
}

function braceDelta(line: string) {
  let inS = false;
  let inD = false;
  let delta = 0;
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
    else if (ch === "{") delta += 1;
    else if (ch === "}") delta -= 1;
  }
  return delta;
}

export function scanEcfSyntax(text: string, source: string, path: string, push: Push) {
  const lines = text.replace(/\/\*[\s\S]*?\*\//g, "\n").split(/\r?\n/);
  let depth = 0;
  let firstUnclosed = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const line = raw.replace(/^\s*#.*$/, "").replace(/\s+#.*$/, "");
    if (!line.trim()) continue;
    const delta = braceDelta(line);
    if (depth + delta < 0) {
      push(issue(source, `${path}:${i + 1}`, `Unmatched “}” in ${path} at line ${i + 1}.`));
      depth = 0;
      continue;
    }
    if (depth === 0 && delta > 0 && !/^\s*\{/.test(line)) {
      push(issue(source, `${path}:${i + 1}`, `Line ${i + 1} in ${path} has “{” but does not start a block.`));
    }
    if (depth === 0 && /^\s*\{/.test(line) && !/^\s*\{\s*\+?[A-Za-z]/.test(line)) {
      push(issue(source, `${path}:${i + 1}`, `Line ${i + 1} in ${path} opens a block without a type name (e.g. { Item Name: …).`));
    }
    if (depth === 0 && delta > 0) firstUnclosed = i + 1;
    depth += delta;
  }
  if (depth > 0) {
    push(
      issue(
        source,
        path,
        `${path} has ${depth} unclosed “{” block${depth === 1 ? "" : "s"} (first open near line ${firstUnclosed || 1}).`,
      ),
    );
  }
}

export function scanYamlSyntax(text: string, source: string, path: string, push: Push) {
  try {
    yaml.load(text);
  } catch (err) {
    const message = err instanceof Error ? err.message.replace(/\n/g, " ") : "YAML parse failed.";
    push(issue(source, path, `${path}: ${message}`));
  }
}

export function padCsvColumns(text: string, onlyLine = 0): string {
  const bom = text.startsWith("\uFEFF") ? "\uFEFF" : "";
  const src = text.replace(/^\uFEFF/, "");
  let quoted = false;
  let cols = 1;
  let headerCols = 0;
  let line = 1;
  let content = false;
  const inserts: { at: number; commas: string }[] = [];
  for (let i = 0; i <= src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') i += 1;
        else quoted = false;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
      content = true;
    } else if (c === ",") cols += 1;
    else if (c === "\n" || c === undefined) {
      const blank = !content && cols === 1;
      if (line === 1) headerCols = cols;
      else if (!blank && headerCols && cols < headerCols && (!onlyLine || onlyLine === line)) {
        let at = c === undefined ? src.length : i;
        if (c === "\n" && src[i - 1] === "\r") at = i - 1;
        inserts.push({ at, commas: ",".repeat(headerCols - cols) });
      }
      cols = 1;
      content = false;
      line += 1;
    } else if (c !== "\r" && c !== " " && c !== "\t") content = true;
  }
  let out = src;
  for (let n = inserts.length - 1; n >= 0; n--) {
    const row = inserts[n];
    if (!row) continue;
    out = out.slice(0, row.at) + row.commas + out.slice(row.at);
  }
  return bom + out;
}

export function scanCsvSyntax(text: string, source: string, path: string, push: Push, role = source) {
  const src = text.replace(/^\uFEFF/, "");
  let quoted = false;
  let cols = 1;
  let headerCols = 0;
  let line = 1;
  let ragged = 0;
  let short = 0;
  let sample = 0;
  let content = false;
  for (let i = 0; i <= src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') i += 1;
        else quoted = false;
      } else if (c === undefined) {
        push(issue(source, path, `${path} has an unclosed quote (started before line ${line}).`));
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
      content = true;
    } else if (c === ",") cols += 1;
    else if (c === "\n" || c === undefined) {
      const blank = !content && cols === 1;
      if (line === 1) headerCols = cols;
      else if (!blank && cols && headerCols && cols !== headerCols) {
        ragged += 1;
        const missing = headerCols - cols;
        if (missing > 0) short += 1;
        if (sample < 4) {
          const fixes: ProblemFix[] =
            missing > 0
              ? [
                  {
                    type: "csv-pad",
                    role,
                    path,
                    line,
                    label: `Add ${missing} comma${missing === 1 ? "" : "s"}`,
                  },
                ]
              : [];
          const colWord = cols === 1 ? "column" : "columns";
          const message =
            missing > 0
              ? `${path} line ${line} has ${cols} ${colWord}, header has ${headerCols}. Add ${missing} comma${missing === 1 ? "" : "s"} for the empty language columns.`
              : `${path} line ${line} has ${cols} columns, header has ${headerCols}.`;
          push({
            ...issue(source, `${path}:${line}`, message, "csv-columns"),
            recommend: fixes.length ? "fix" : "review",
            fixes,
          });
          sample += 1;
        }
      }
      cols = 1;
      content = false;
      line += 1;
    } else if (c !== "\r" && c !== " " && c !== "\t") content = true;
  }
  if (ragged > sample) {
    const fixes: ProblemFix[] = short
      ? [{ type: "csv-pad", role, path, line: 0, label: "Add missing commas on every short row" }]
      : [];
    push({
      ...issue(source, path, `${path} has ${ragged} rows with the wrong column count.`, "csv-columns"),
      recommend: fixes.length ? "fix" : "review",
      fixes,
    });
  } else if (short > 1) {
    push({
      ...issue(source, path, `${path} has ${short} short rows. Empty language columns can be filled with commas.`, "csv-columns"),
      recommend: "fix",
      fixes: [{ type: "csv-pad", role, path, line: 0, label: "Add missing commas on every short row" }],
    });
  }
}

export function scanTextSyntax(role: string, path: string, text: string, push: Push) {
  if (!text) return;
  const source = role === "pdaYaml" || role === "pdaCsv" ? "pda" : role === "playfieldYaml" ? "playfields" : role === "dialoguesCsv" ? "dialogues" : role;
  if (role === "pdaCsv" || role === "dialoguesCsv" || role === "localization" || /\.csv$/i.test(path)) {
    scanCsvSyntax(text, source, path, push, role);
    return;
  }
  if (role === "pdaYaml" || role === "playfieldYaml" || role === "sectors" || /\.ya?ml$/i.test(path)) {
    scanYamlSyntax(text, source, path, push);
    return;
  }
  scanEcfSyntax(text, source, path, push);
}

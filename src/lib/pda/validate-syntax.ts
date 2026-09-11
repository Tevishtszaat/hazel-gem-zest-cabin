import * as yaml from "js-yaml";
import type { Problem } from "./validate.ts";

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

export function scanCsvSyntax(text: string, source: string, path: string, push: Push) {
  const src = text.replace(/^\uFEFF/, "");
  let quoted = false;
  let cols = 1;
  let headerCols = 0;
  let line = 1;
  let ragged = 0;
  let sample = 0;
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
    if (c === '"') quoted = true;
    else if (c === ",") cols += 1;
    else if (c === "\n" || c === undefined) {
      if (line === 1) headerCols = cols;
      else if (cols && headerCols && cols !== headerCols) {
        ragged += 1;
        if (sample < 4) {
          push(
            issue(
              source,
              `${path}:${line}`,
              `${path} line ${line} has ${cols} columns, header has ${headerCols}.`,
              "csv-columns",
            ),
          );
          sample += 1;
        }
      }
      cols = 1;
      line += 1;
    }
  }
  if (ragged > sample) {
    push(issue(source, path, `${path} has ${ragged} rows with the wrong column count.`, "csv-columns"));
  }
}

export function scanTextSyntax(role: string, path: string, text: string, push: Push) {
  if (!text) return;
  const source = role === "pdaYaml" || role === "pdaCsv" ? "pda" : role === "playfieldYaml" ? "playfields" : role === "dialoguesCsv" ? "dialogues" : role;
  if (role === "pdaCsv" || role === "dialoguesCsv" || role === "localization" || /\.csv$/i.test(path)) {
    scanCsvSyntax(text, source, path, push);
    return;
  }
  if (role === "pdaYaml" || role === "playfieldYaml" || role === "sectors" || /\.ya?ml$/i.test(path)) {
    scanYamlSyntax(text, source, path, push);
    return;
  }
  scanEcfSyntax(text, source, path, push);
}

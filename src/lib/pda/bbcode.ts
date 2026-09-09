const PAIR: Record<string, [string, string]> = {
  b: ["<strong>", "</strong>"],
  i: ["<em>", "</em>"],
  u: ["<u>", "</u>"],
  s: ["<s>", "</s>"],
};

export function decodePdaEscapes(input: string): string {
  if (!input) return "";
  return input.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "");
}

export function encodePdaEscapes(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\n/g, "\\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export function stripBbcode(input: string): string {
  return decodePdaEscapes(input)
    .replace(/\[(?:\/)?(?:c|b|i|u|s)\]/gi, "")
    .replace(/\[(?:[0-9a-fA-F]{3,8}|-)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function bbcodeToHtml(
  input: string,
  opts?: { inline?: boolean; imageUrl?: (name: string) => string | undefined },
): string {
  const src = decodePdaEscapes(input ?? "");
  let i = 0;
  let html = "";
  let colorOpen = false;

  const closeColor = () => {
    if (colorOpen) {
      html += "</span>";
      colorOpen = false;
    }
  };

  const openColor = (hex: string) => {
    closeColor();
    const h = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6);
    html += `<span style="color:#${h}">`;
    colorOpen = true;
  };

  while (i < src.length) {
    if (src[i] === "[") {
      const close = src.indexOf("]", i);
      if (close !== -1 && close - i <= 12) {
        const tag = src.slice(i + 1, close);
        const lower = tag.toLowerCase();
        if (lower === "c") {
          i = close + 1;
          continue;
        }
        if (lower === "/c" || lower === "-") {
          closeColor();
          i = close + 1;
          continue;
        }
        if (/^[0-9a-f]{3,8}$/i.test(tag)) {
          openColor(tag);
          i = close + 1;
          continue;
        }
        const closing = lower.startsWith("/");
        const name = closing ? lower.slice(1) : lower;
        if (PAIR[name]) {
          html += closing ? PAIR[name][1] : PAIR[name][0];
          i = close + 1;
          continue;
        }
      }
    }
    if (src[i] === "{") {
      const close = src.indexOf("}", i);
      if (close !== -1 && close - i <= 80) {
        const inner = src.slice(i + 1, close);
        if (/\.(png|jpe?g|gif|webp)$/i.test(inner)) {
          const url = opts?.imageUrl?.(inner);
          if (url && !opts?.inline) {
            html += `<img src="${url}" alt="${escapeHtml(inner)}" />`;
          } else {
            html += escapeHtml(`{${inner}}`);
          }
          i = close + 1;
          continue;
        }
      }
    }
    if (src[i] === "\n") {
      html += opts?.inline ? " " : "<br/>";
      i += 1;
      continue;
    }
    let j = i + 1;
    while (j < src.length && src[j] !== "[" && src[j] !== "{" && src[j] !== "\n") j += 1;
    html += escapeHtml(src.slice(i, j));
    i = j;
  }
  closeColor();
  return html;
}

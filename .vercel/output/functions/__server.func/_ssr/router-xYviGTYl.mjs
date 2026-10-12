import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useRouter, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { n as load, t as dump } from "../_libs/js-yaml.mjs";
import { a as Root3, i as Provider, n as Content2, o as Trigger, r as Portal, t as Arrow2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-xYviGTYl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-DeSgDIi2.css";
var useBusyStore = create((set) => ({
	load: 0,
	save: 0,
	think: 0,
	detail: "",
	pct: null,
	begin: (kind, detail) => set((s) => ({
		[kind]: s[kind] + 1,
		detail: detail ?? s.detail
	})),
	end: (kind) => set((s) => {
		const next = Math.max(0, s[kind] - 1);
		const still = (kind === "load" ? next : s.load) + (kind === "save" ? next : s.save) + (kind === "think" ? next : s.think);
		return {
			[kind]: next,
			detail: still ? s.detail : "",
			pct: still ? s.pct : null
		};
	}),
	setDetail: (detail, pct) => set({
		detail,
		pct: pct ?? null
	})
}));
function beginBusy(kind, detail) {
	useBusyStore.getState().begin(kind, detail);
}
function endBusy(kind) {
	useBusyStore.getState().end(kind);
}
function setBusyDetail(detail, pct) {
	useBusyStore.getState().setDetail(detail, pct);
}
var PAIR = {
	b: ["<strong>", "</strong>"],
	i: ["<em>", "</em>"],
	u: ["<u>", "</u>"],
	s: ["<s>", "</s>"]
};
function decodePdaEscapes(input) {
	if (!input) return "";
	return input.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\r/g, "");
}
function encodePdaEscapes(input) {
	return input.replace(/\r\n/g, "\n").replace(/\n/g, "\\n");
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripBbcode(input) {
	return decodePdaEscapes(input).replace(/\[(?:\/)?(?:c|b|i|u|s)\]/gi, "").replace(/\[(?:[0-9a-fA-F]{3,8}|-)\]/g, "").replace(/\s+/g, " ").trim();
}
function bbcodeToHtml(input, opts) {
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
	const openColor = (hex) => {
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
					if (url && !opts?.inline) html += `<img src="${url}" alt="${escapeHtml(inner)}" />`;
					else html += escapeHtml(`{${inner}}`);
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
function parseCsv(text) {
	const lines = splitCsvLines(text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"));
	if (!lines.length) return {
		languages: [],
		rows: {}
	};
	const header = parseCsvLine(lines[0] ?? "").map((h) => h.trim());
	const keyIdx = header.findIndex((h) => /^key$/i.test(h));
	const k = keyIdx >= 0 ? keyIdx : 0;
	const languages = header.filter((_, i) => i !== k && header[i]);
	const rows = {};
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line || !line.trim()) continue;
		const cols = parseCsvLine(line);
		const key = (cols[k] ?? "").trim();
		if (!key) continue;
		const rec = {};
		header.forEach((name, idx) => {
			if (idx === k || !name) return;
			rec[name] = decodePdaEscapes(cols[idx] ?? "");
		});
		rows[key] = rec;
	}
	return {
		languages,
		rows
	};
}
function csvLookup(csv, key, language) {
	const rec = csv.rows[key];
	if (!rec) return void 0;
	const pick = (v) => {
		if (!v || !v.trim()) return void 0;
		return decodePdaEscapes(v);
	};
	return pick(rec[language]) || pick(rec.English || rec.english || rec.EN) || csv.languages.map((lang) => pick(rec[lang])).find(Boolean);
}
function suggestEnglishText(key, rec, languages) {
	for (const lang of languages) {
		if (/^english$/i.test(lang)) continue;
		const value = rec[lang]?.trim();
		if (value) return {
			text: value,
			from: lang
		};
	}
	return {
		text: key.replace(/^(?:items?_|blocks?_|tokens?_|factions?_|txt_|pda_)/i, "").replace(/[_]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim() || key,
		from: "key"
	};
}
function csvEscapeRaw(value) {
	if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, "\"\"")}"`;
	return value;
}
function fillLocalizationEnglish(text, onlyKey = "") {
	const bom = text.startsWith("﻿") ? "﻿" : "";
	const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
	const lines = splitCsvLines(src);
	if (!lines.length) return text;
	const header = parseCsvLine(lines[0] ?? "");
	const keyIdx = header.findIndex((h) => /^key$/i.test(h.trim()));
	const k = keyIdx >= 0 ? keyIdx : 0;
	let enIdx = header.findIndex((h) => /^english$/i.test(h.trim()));
	if (enIdx < 0) enIdx = header.findIndex((h, i) => i !== k && h.trim());
	if (enIdx < 0) return text;
	const languages = header.map((h) => h.trim()).filter((h, i) => i !== k && h);
	return bom + lines.map((line, index) => {
		if (index === 0 || !line.trim()) return line;
		const cols = parseCsvLine(line);
		const key = (cols[k] ?? "").trim();
		if (!key || onlyKey && key !== onlyKey) return line;
		while (cols.length <= enIdx) cols.push("");
		if ((cols[enIdx] ?? "").trim()) return line;
		const rec = {};
		header.forEach((name, idx) => {
			if (idx === k || !name.trim()) return;
			rec[name.trim()] = cols[idx] ?? "";
		});
		const suggestion = suggestEnglishText(key, rec, languages);
		cols[enIdx] = suggestion.text;
		return cols.map((cell, idx) => idx === enIdx ? csvEscape(cell) : csvEscapeRaw(cell)).join(",");
	}).join("\n") + (src.endsWith("\n") || text.endsWith("\n") ? "\n" : "");
}
function stringifyCsv(csv) {
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
function upsertCsv(csv, key, language, value) {
	if (!csv.rows[key]) csv.rows[key] = {};
	csv.rows[key][language] = value;
	if (!csv.languages.includes(language)) csv.languages.push(language);
}
function splitCsvLines(src) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (quoted) {
			if (c === "\"") {
				if (src[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else {
					quoted = false;
					cur += c;
				}
			} else cur += c;
		} else if (c === "\"") {
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
function parseCsvLine(line) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (quoted) {
			if (c === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else quoted = false;
			} else cur += c;
		} else if (c === "\"") quoted = true;
		else if (c === ",") {
			out.push(cur);
			cur = "";
		} else cur += c;
	}
	out.push(cur);
	return out;
}
function csvEscape(value) {
	const encoded = encodePdaEscapes(value);
	if (/[",\n]/.test(encoded)) return `"${encoded.replace(/"/g, "\"\"")}"`;
	return encoded;
}
var BLOCK_START = /^\s*\{\s*(\+)?([A-Za-z][A-Za-z0-9]*)\b(.*)$/;
var NAME_FIELD = /\bName:\s*(?:"([^"]+)"|'([^']+)'|([^,#}\n]+))/;
var ID_FIELD = /\bId:\s*(\d+)/;
var PROP = /^\s*([A-Za-z_][A-Za-z0-9_]*|\d+)\s*:\s*(.*)$/;
function stripEcfComments(text) {
	return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\/\*[\s\S]*?\*\//g, "\n").replace(/^\s*#.*$/gm, "");
}
function unquote(value) {
	const v = value.trim().replace(/,?\s*$/, "");
	const cdata = v.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
	if (cdata) return cdata[1] ?? "";
	if (v.startsWith("\"") && v.endsWith("\"") || v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
	return v.replace(/\s+#.*$/, "").trim();
}
function parseOpen(line) {
	const open = line.match(BLOCK_START);
	if (!open) return null;
	const header = open[3] ?? "";
	const nameMatch = header.match(NAME_FIELD);
	const idMatch = header.match(ID_FIELD);
	let name = (nameMatch?.[1] || nameMatch?.[2] || nameMatch?.[3] || "").trim();
	if (!name) name = header.replace(NAME_FIELD, "").replace(ID_FIELD, "").replace(/^[\s,]+/, "").replace(/\s+#.*$/, "").replace(/\}.*$/, "").trim();
	const obj = {
		kind: open[2],
		plus: Boolean(open[1]),
		name,
		id: idMatch?.[1],
		fields: {}
	};
	if (nameMatch || idMatch) {
		const extra = header.replace(NAME_FIELD, "").replace(ID_FIELD, "").replace(/^[\s,]+/, "").match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
		if (extra) obj.fields[extra[1]] = unquote(extra[2] ?? "");
	}
	return obj;
}
function braceCounts(line) {
	let inS = false;
	let inD = false;
	let open = 0;
	let close = 0;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inD) {
			if (ch === "\\" && line[i + 1] === "\"") i += 1;
			else if (ch === "\"") inD = false;
			continue;
		}
		if (inS) {
			if (ch === "'") inS = false;
			continue;
		}
		if (ch === "\"") inD = true;
		else if (ch === "'") inS = true;
		else if (ch === "{") open += 1;
		else if (ch === "}") close += 1;
	}
	return {
		open,
		close
	};
}
function parseEcfObjects(text) {
	const lines = stripEcfComments(text).split(/\r?\n/);
	const roots = [];
	const stack = [];
	const pushDone = (done) => {
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
				const key = prop[1];
				const value = unquote(prop[2] ?? "");
				if (key === "Name" && !current.name) current.name = value;
				else if (key === "Id" && !current.id) {
					if (/^\d+$/.test(value)) current.id = value;
					else if (value) current.fields.Id = value;
				} else current.fields[key] = value;
			}
		}
		const { open, close } = braceCounts(line);
		for (let i = 0; i < Math.max(0, close - open); i++) pushDone(stack.pop());
	}
	while (stack.length) pushDone(stack.pop());
	return roots;
}
function harvestDeclaredNames(text) {
	const src = stripEcfComments(text);
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const re = /\{\s*\+?([A-Za-z][A-Za-z0-9]*)\b([^\n]*)/g;
	let match;
	while (match = re.exec(src)) {
		const kind = match[1] ?? "";
		if (!kind || /^child$/i.test(kind)) continue;
		const headerName = (match[2] ?? "").match(NAME_FIELD);
		let name = (headerName?.[1] || headerName?.[2] || headerName?.[3] || "").trim();
		if (!name) {
			const named = src.slice(match.index, match.index + 700).match(/\bName:\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))/);
			name = (named?.[1] || named?.[2] || named?.[3] || "").trim();
		}
		if (!name) continue;
		const key = `${kind}:${name}`.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({
			kind,
			name
		});
	}
	return out;
}
function extractEcfRecords(text) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	const walk = (obj) => {
		const name = (obj.name || obj.id || "").trim();
		if (name && obj.kind.toLowerCase() !== "child") {
			const key = `${obj.kind}:${name}`.toLowerCase();
			if (!seen.has(key)) {
				seen.add(key);
				const abbrev = (obj.fields.Abbrev || obj.fields.abbrev || "").replace(/^["']|["']$/g, "").trim();
				out.push({
					kind: obj.kind,
					name,
					id: obj.id,
					abbrev: abbrev || void 0
				});
			}
		}
		for (const child of obj.children ?? []) walk(child);
	};
	for (const obj of parseEcfObjects(text)) walk(obj);
	return out;
}
function stringifyEcfObjects(objects) {
	const emit = (obj, indent) => {
		const pad = " ".repeat(indent);
		const head = [`${obj.plus ? "+" : ""}${obj.kind}`];
		const bits = [];
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
function formatEcfValue(value) {
	if (/,\s*param\d+\s*:/i.test(value)) return value;
	if (needsQuote(value) || /[:(),]/.test(value)) return `"${value.replace(/"/g, "\\\"")}"`;
	return value;
}
function needsQuote(value) {
	return /\s/.test(value) || /[:#]/.test(value);
}
var CONFIG_METAS = [
	{
		role: "items",
		file: "ItemsConfig.ecf",
		label: "Items",
		kind: "Item",
		plus: true,
		idMode: "optional",
		format: "ecf",
		group: "catalog",
		catalogKind: "item",
		stats: [
			"Ref",
			"Category",
			"Group",
			"StackSize",
			"Mass",
			"Volume",
			"MarketPrice",
			"Durability",
			"UnlockCost",
			"CraftTime",
			"WeaponDmg",
			"Range",
			"FuelValue",
			"O2Value",
			"FoodValue",
			"Health",
			"CustomIcon"
		]
	},
	{
		role: "blocks",
		file: "BlocksConfig.ecf",
		label: "Blocks",
		kind: "Block",
		plus: true,
		idMode: "optional",
		format: "ecf",
		group: "catalog",
		catalogKind: "block",
		stats: [
			"Ref",
			"Category",
			"Group",
			"Class",
			"HitPoints",
			"Mass",
			"Volume",
			"MarketPrice",
			"EnergyIn",
			"EnergyOut",
			"CPUIn",
			"CPUOut",
			"UnlockCost",
			"BlastRadius",
			"MaxCount",
			"IsAccessible",
			"Material",
			"CustomIcon"
		]
	},
	{
		role: "templates",
		file: "Templates.ecf",
		label: "Templates",
		kind: "Template",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "catalog",
		catalogKind: "item",
		stats: [
			"CraftTime",
			"OutputCount",
			"Target",
			"BaseItem"
		]
	},
	{
		role: "tokens",
		file: "TokenConfig.ecf",
		label: "Tokens",
		kind: "Token",
		plus: true,
		idMode: "required",
		format: "ecf",
		group: "catalog",
		catalogKind: "token",
		stats: [
			"MarketPrice",
			"DropOnDeath",
			"CustomIcon"
		]
	},
	{
		role: "factions",
		file: "Factions.ecf",
		label: "Factions",
		kind: "Faction",
		plus: false,
		idMode: "required",
		format: "ecf",
		group: "world",
		catalogKind: "faction",
		stats: [
			"Abbrev",
			"Color",
			"IsNPC",
			"Hidden"
		]
	},
	{
		role: "eclass",
		file: "EClassConfig.ecf",
		label: "Entities",
		kind: "Entity",
		plus: true,
		idMode: "none",
		format: "ecf",
		group: "world",
		catalogKind: "entity",
		stats: [
			"Ref",
			"EntityType",
			"Class",
			"Parent",
			"Faction",
			"Prefab",
			"ModelType",
			"IsEnemy",
			"AllowInSpawners",
			"MaxHealth",
			"Mesh",
			"XpFactor",
			"LootListOnDeath",
			"ItemsOnEnterGame",
			"Weight",
			"VolumeCapacity"
		]
	},
	{
		role: "egroups",
		file: "EGroupsConfig.ecf",
		label: "Spawn groups",
		kind: "EGroup",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "world",
		catalogKind: "group",
		stats: ["SpawnInSameDirection"]
	},
	{
		role: "reputation",
		file: "DefReputation.ecf",
		label: "Reputation",
		kind: "Reputation",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "world",
		stats: []
	},
	{
		role: "warfare",
		file: "FactionWarfare.ecf",
		label: "Warfare",
		kind: "Element",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "world",
		stats: [
			"Faction",
			"ScenarioGroup",
			"Lvl1MinPrice",
			"Lvl1MaxPrice",
			"Lvl5MinPrice",
			"Lvl5MaxPrice",
			"Lvl10MinPrice",
			"Lvl10MaxPrice",
			"SDScenarioGroup",
			"SDProbabilityMin",
			"SDProbabilityMax",
			"SDPriceMin",
			"SDPriceMax"
		]
	},
	{
		role: "galaxy",
		file: "GalaxyConfig.ecf",
		label: "Galaxy",
		kind: "GalaxyConfig",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "world",
		stats: [
			"StarCount",
			"Radius",
			"NebulaCount",
			"StarterSystemLYCoord",
			"StarterSystemName",
			"StarterSystemStarClass",
			"GalaxyMode",
			"SectorsPerLY"
		]
	},
	{
		role: "containers",
		file: "Containers.ecf",
		label: "Containers",
		kind: "Container",
		plus: true,
		idMode: "required",
		format: "ecf",
		group: "loot",
		stats: [
			"Count",
			"Size",
			"SfxOpen",
			"SfxClose",
			"DestroyOnClose"
		]
	},
	{
		role: "lootgroups",
		file: "LootGroups.ecf",
		label: "Loot groups",
		kind: "LootGroup",
		plus: true,
		idMode: "none",
		format: "ecf",
		group: "loot",
		stats: ["Count"]
	},
	{
		role: "traders",
		file: "TraderNPCConfig.ecf",
		label: "Traders",
		kind: "Trader",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "loot",
		stats: [
			"SellingText",
			"SellingGoods",
			"Discount"
		]
	},
	{
		role: "materials",
		file: "MaterialConfig.ecf",
		label: "Materials",
		kind: "Material",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: [
			"collidable",
			"liquid",
			"lightopacity",
			"Mass",
			"damage_category",
			"surface_category",
			"stepsound"
		]
	},
	{
		role: "statuseffects",
		file: "StatusEffects.ecf",
		label: "Status effects",
		kind: "StatusEffect",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: [
			"Duration",
			"Type",
			"BuffIf",
			"DebuffIf",
			"Mutex",
			"Description",
			"Icon",
			"Actions"
		]
	},
	{
		role: "globaldefs",
		file: "GlobalDefsConfig.ecf",
		label: "Global defs",
		kind: "GlobalDef",
		plus: true,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: []
	},
	{
		role: "blockgroups",
		file: "BlockGroupsConfig.ecf",
		label: "Block groups",
		kind: "BlockGroup",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: ["Color"]
	},
	{
		role: "blockshapes",
		file: "BlockShapesWindow.ecf",
		aliases: ["blockshapewindow.ecf"],
		label: "Block shapes",
		kind: "Shape",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: ["Index", "Group"]
	},
	{
		role: "animations",
		file: "Animations.ecf",
		label: "Animations",
		kind: "Animation",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: []
	},
	{
		role: "baiconfig",
		file: "BAIConfig.ecf",
		label: "Base AI",
		kind: "Element",
		plus: false,
		idMode: "none",
		format: "ecf",
		group: "defs",
		stats: ["Count"]
	},
	{
		role: "sectors",
		file: "Sectors.yaml",
		aliases: ["sectors.yml"],
		label: "Sectors",
		kind: "Sectors",
		plus: false,
		idMode: "none",
		format: "yaml",
		group: "text",
		stats: []
	}
];
var BY_ROLE = new Map(CONFIG_METAS.map((m) => [m.role, m]));
var BY_FILE = /* @__PURE__ */ new Map();
for (const meta of CONFIG_METAS) {
	BY_FILE.set(meta.file.toLowerCase(), meta);
	for (const alias of meta.aliases ?? []) BY_FILE.set(alias.toLowerCase(), meta);
}
var CONFIG_TEXT_ROLES = /* @__PURE__ */ new Set([
	...CONFIG_METAS.map((m) => m.role),
	"localization",
	"dialogues",
	"dialoguesCsv"
]);
CONFIG_METAS.filter((m) => m.format === "ecf").map((m) => m.role);
function configMeta(role) {
	return BY_ROLE.get(role);
}
function configMetaByFile(basename) {
	return BY_FILE.get(basename.toLowerCase());
}
var PLAYFIELD_BASENAMES = [
	"playfield.yaml",
	"playfield.yml",
	"playfield_static.yaml",
	"playfield_static.yml",
	"playfield_dynamic.yaml",
	"playfield_dynamic.yml",
	"space_dynamic.yaml",
	"space_dynamic.yml",
	"space_static.yaml",
	"space_static.yml"
];
var SHARED_PLAYFIELD_KEYS = [
	"PlayfieldType",
	"PlanetType",
	"Biome",
	"Description",
	"PvP",
	"Difficulty",
	"AllowCV",
	"SunFlare"
];
var PLANET_PLAYFIELD_KEYS = [
	...SHARED_PLAYFIELD_KEYS,
	"Gravity",
	"AtmosphereO2",
	"AtmosphereBreathable",
	"AtmosphereEnabled",
	"AtmosphereDensity",
	"AtmosphereColor",
	"SkyColor",
	"Temperature",
	"TemperatureDay",
	"TemperatureNight",
	"DayLength",
	"Water",
	"WaterBlock",
	"SeaLevel",
	"ScaledRadius",
	"RealRadius",
	"Moons",
	"Seed",
	"UseFixed"
];
var SPACE_PLAYFIELD_KEYS = [
	...SHARED_PLAYFIELD_KEYS,
	"Skybox",
	"AtmosphereEnabled"
];
function isPlayfieldBasename(base) {
	return PLAYFIELD_BASENAMES.includes(base.toLowerCase());
}
function playfieldVariant(path) {
	const base = path.split(/[/\\]/).pop()?.toLowerCase() || "";
	if (base.startsWith("playfield_static")) return "static";
	if (base.startsWith("playfield_dynamic")) return "dynamic";
	if (base.startsWith("space_dynamic")) return "space-dynamic";
	if (base.startsWith("space_static")) return "space-static";
	return "playfield";
}
function yamlScalars(text) {
	const fields = {};
	const re = /^([A-Za-z][\w]*)\s*:\s*(.*?)\s*$/gm;
	let m;
	while (m = re.exec(text)) {
		const key = m[1];
		const raw = m[2].replace(/#.*$/, "").trim();
		if (!raw || raw === "|" || raw === ">" || raw === "-") continue;
		fields[key] = raw.replace(/^['"]|['"]$/g, "");
	}
	return fields;
}
function formatYamlValue(value) {
	const v = value.trim();
	if (!v) return "\"\"";
	if (/^(true|false|null)$/i.test(v)) return v;
	if (/^-?\d+(\.\d+)?$/.test(v)) return v;
	if (v.startsWith("[") || v.startsWith("{")) return v;
	if (/[:#,{}[\]]/.test(v) || /\s/.test(v)) return `"${v.replace(/"/g, "\\\"")}"`;
	return v;
}
function patchYamlField(text, key, value) {
	const re = new RegExp(`^([ \\t]*${key}\\s*:\\s*).*$`, "m");
	const next = `${key}: ${formatYamlValue(value)}`;
	if (re.test(text)) return text.replace(re, `$1${formatYamlValue(value)}`);
	return `${text.replace(/\s*$/, "")}\n${next}\n`;
}
function classifyPlayfieldKind(fields, folder, variant) {
	const type = (fields.PlayfieldType || "").toLowerCase();
	const planet = (fields.PlanetType || "").toLowerCase();
	const blob = `${type} ${planet} ${(fields.Biome || "").toLowerCase()} ${folder}`.toLowerCase();
	if (/moon/.test(blob)) return "moon";
	if (type === "planet" || planet && planet !== "space") return "planet";
	if (type === "space" || planet === "space") {
		if (/orbit/.test(blob) || variant === "dynamic" || variant === "space-dynamic") return /orbit/.test(folder.toLowerCase()) || /orbit/.test(blob) ? "orbit" : "space";
		return /orbit/.test(blob) ? "orbit" : "space";
	}
	if (variant === "dynamic" || variant === "space-dynamic") return /orbit/.test(folder.toLowerCase()) ? "orbit" : "space";
	return "unknown";
}
function playfieldFolder(path) {
	const parts = path.replace(/\\/g, "/").split("/");
	const file = parts.pop() || "";
	const folder = parts.pop() || file.replace(/\.[^.]+$/, "");
	return /^playfields?$/i.test(folder) ? file.replace(/\.[^.]+$/, "") : folder;
}
function playfieldFromText(path, text) {
	const folder = playfieldFolder(path);
	const variant = playfieldVariant(path);
	const fields = yamlScalars(text);
	return {
		name: folder,
		folder,
		path,
		variant,
		kind: classifyPlayfieldKind(fields, folder, variant),
		text,
		fields
	};
}
function rankVariant(variant) {
	if (variant === "static") return 0;
	if (variant === "playfield") return 1;
	if (variant === "space-static") return 2;
	if (variant === "dynamic") return 3;
	if (variant === "space-dynamic") return 4;
	return 5;
}
function rankKind(kind) {
	if (kind === "planet") return 4;
	if (kind === "moon") return 3;
	if (kind === "orbit") return 2;
	if (kind === "space") return 1;
	return 0;
}
function bundlePlayfields(texts, extraPaths = []) {
	const groups = /* @__PURE__ */ new Map();
	const seen = /* @__PURE__ */ new Set();
	const add = (file) => {
		if (seen.has(file.path)) return;
		seen.add(file.path);
		const list = groups.get(file.folder) ?? [];
		list.push(file);
		groups.set(file.folder, list);
	};
	for (const text of texts) {
		if (text.role !== "playfieldYaml" || !text.text) continue;
		add(playfieldFromText(text.path, text.text));
	}
	for (const path of extraPaths) {
		if (!isPlayfieldBasename(path.split(/[/\\]/).pop() || "")) continue;
		add(playfieldFromText(path, ""));
	}
	return [...groups.values()].map((files) => {
		const kind = files.reduce((best, file) => rankKind(file.kind) > rankKind(best) ? file.kind : best, "unknown");
		const folder = files[0].folder;
		return {
			folder,
			name: folder,
			kind,
			files: files.sort((a, b) => rankVariant(a.variant) - rankVariant(b.variant))
		};
	}).sort((a, b) => a.name.localeCompare(b.name));
}
function keysForKind(kind) {
	if (kind === "planet" || kind === "moon") return PLANET_PLAYFIELD_KEYS;
	return SPACE_PLAYFIELD_KEYS;
}
function kindLabel(kind) {
	if (kind === "planet") return "Planet";
	if (kind === "moon") return "Moon";
	if (kind === "orbit") return "Orbit";
	if (kind === "space") return "Space";
	return "Unknown";
}
function variantLabel(variant) {
	if (variant === "static") return "playfield_static.yaml";
	if (variant === "dynamic") return "playfield_dynamic.yaml";
	if (variant === "space-dynamic") return "space_dynamic.yaml";
	if (variant === "space-static") return "space_static.yaml";
	return "playfield.yaml";
}
var BUILTIN_NAMES = /* @__PURE__ */ new Set([
	"Player",
	"Pda",
	"Inventory",
	"BASE",
	"HV",
	"SV",
	"CV",
	"GV",
	"PlayerBike",
	"PlayerInventory",
	"SurvivalTool",
	"Start",
	"Destination",
	"NeedOne",
	"NeedAll"
]);
var ENGINE_FACTIONS = /* @__PURE__ */ new Set(["player"]);
var KIND_FROM_ECF = {
	item: "item",
	block: "block",
	entity: "entity",
	faction: "faction",
	dialogue: "dialogue",
	npcdialogue: "dialogue",
	token: "token",
	egroup: "group",
	entitygroup: "group",
	lootgroup: "group",
	trader: "entity",
	container: "item"
};
var MULTI_FILE_ROLES = /* @__PURE__ */ new Set([
	"blocks",
	"items",
	"templates",
	"tokens",
	"eclass",
	"factions",
	"dialogues",
	"dialoguesCsv",
	"ecf",
	"traders",
	"lootgroups",
	"containers",
	"blockshapes",
	"warfare",
	"reputation",
	"statuseffects",
	"randomPreset"
]);
function textForIndex(path, text) {
	if (!text) return void 0;
	if (/\.ecf$/i.test(path)) return text;
	if (text.length > 6e6) return void 0;
	if (/\bPlayfields?\b/i.test(path) && /playfield.*\.ya?ml$/i.test(path)) return void 0;
	return text;
}
function emptyCatalog() {
	return {
		folderName: "",
		files: [],
		entries: [],
		texts: [],
		indexedAt: 0
	};
}
function catalogLoaded(catalog) {
	return Boolean(catalog && catalog.entries.length);
}
function normalizePath(path) {
	return path.replace(/\\/g, "/").replace(/^\/+/, "");
}
function scenarioFolderOf(path) {
	return normalizePath(path).match(/(?:^|\/)scenarios\/([^/]+)\//i)?.[1] ?? null;
}
function chooseScenarioFolder(paths, preferred = "") {
	const names = /* @__PURE__ */ new Set();
	for (const path of paths) {
		const name = scenarioFolderOf(path);
		if (name) names.add(name);
	}
	if (!names.size) return "";
	const hit = preferred && [...names].find((name) => name.toLowerCase() === preferred.toLowerCase());
	if (hit) return hit;
	if (names.size === 1) return [...names][0];
	return "";
}
function isMainGameReference(path, dropIncludesScenarios) {
	return dropIncludesScenarios && !scenarioFolderOf(path);
}
function isOtherScenarioPath(path, active) {
	const name = scenarioFolderOf(path);
	if (!name) return false;
	if (!active) return true;
	return name.toLowerCase() !== active.toLowerCase();
}
function partitionContent(files, preferred = "") {
	const active = chooseScenarioFolder(files.map((file) => file.path), preferred);
	const names = /* @__PURE__ */ new Set();
	for (const file of files) {
		const name = scenarioFolderOf(file.path);
		if (name) names.add(name);
	}
	if (!names.size) return {
		scenario: files,
		game: [],
		ignored: [],
		active: preferred
	};
	const scenario = [];
	const game = [];
	const ignored = /* @__PURE__ */ new Set();
	for (const file of files) {
		const name = scenarioFolderOf(file.path);
		if (!name) game.push(file);
		else if (active && name.toLowerCase() === active.toLowerCase()) scenario.push(file);
		else ignored.add(name);
	}
	return {
		scenario,
		game,
		ignored: [...ignored],
		active
	};
}
function classifyScenarioPath(path, hint) {
	const p = normalizePath(path).toLowerCase();
	const base = p.split("/").pop() ?? "";
	if (base.startsWith("+backup") || p.includes("/backup/")) return null;
	if (/\/randompresets\//i.test(p) && /\.ya?ml$/.test(base)) return "randomPreset";
	if (hint === "pdaYaml" && /\.ya?ml$/.test(base) && !/sectors|playfield/.test(base)) return "pdaYaml";
	if (hint === "pdaCsv" && /\.csv$/.test(base) && base !== "localization.csv") return "pdaCsv";
	if (hint === "dialogues" && /\.ecf$/.test(base)) return "dialogues";
	if (hint === "dialoguesCsv" && /\.csv$/.test(base) && base !== "localization.csv" && base !== "pda.csv") return "dialoguesCsv";
	if (hint === "factions" && /\.ecf$/.test(base)) return "factions";
	if (hint === "galaxy" && /\.ecf$/.test(base) && /galaxy/.test(base)) return "galaxy";
	if (hint === "sectors" && /\.ya?ml$/.test(base) && base !== "playfield.yaml" && base !== "playfield.yml") return "sectors";
	if (hint === "localization" && /\.csv$/.test(base)) return "localization";
	if (base === "pda.yaml" || base === "pda.yml") return "pdaYaml";
	if (base === "pda.csv") return "pdaCsv";
	if (base === "localization.csv") return "localization";
	if (base === "sectors.yaml" || base === "sectors.yml" || base === "sector.yaml" || base === "sector.yml") return "sectors";
	if (/\.ya?ml$/.test(base) && base !== "playfield.yaml" && base !== "playfield.yml" && /(?:^|\/)(?:content\/)?sectors?\//.test(p) && !/\/playfields?\//.test(p)) return "sectors";
	if (/\.ya?ml$/.test(base) && /^sectors?[-_.]/i.test(base)) return "sectors";
	if (isPlayfieldBasename(base)) return "playfieldYaml";
	if (base === "playfield.yaml" || base === "playfield.yml") return "playfieldYaml";
	if (base === "config.ecf" || base === "config_example.ecf") return null;
	const meta = configMetaByFile(base);
	if (meta) return meta.role;
	if (base === "dialogues.ecf") return "dialogues";
	if (base === "factions.ecf" || base === "faction.ecf" || base === "factionconfig.ecf") return "factions";
	if (/\/factions?\//.test(p) && base.endsWith(".ecf") && !/warfare|reputation|diplomacy/.test(base)) return "factions";
	if (base === "dialogues.csv") return "dialoguesCsv";
	if (hint === "dialogues" && /\.csv$/.test(base)) return "dialoguesCsv";
	if (base.endsWith(".ecf")) return hint === "configs" || hint === "scenario" ? "ecf" : "ecf";
	if (base.endsWith(".epb")) return "poi";
	if (/\.(png|jpe?g|webp|gif)$/.test(base)) {
		if (isLoadingScreenPath(p)) return "wallpaper";
		if (hint === "pdaImages" || /(?:^|\/)pda(?:\/|$)/.test(p) || /extras\/pda/.test(p)) return "picture";
		if (hint === "itemImages") return "itemPicture";
		if (isIconPath(p)) return "itemPicture";
		if (hint === "scenario") return null;
	}
	return null;
}
function looksLikeSectorsYaml(text) {
	return /^\s*GalaxyMode\s*:/m.test(text) || /^\s*SolarSystems\s*:/m.test(text) || /^\s*Sectors\s*:/m.test(text) || /\n\s*Playfields\s*:/m.test(text);
}
function collectCatalogTexts(files, hint) {
	const byRole = /* @__PURE__ */ new Map();
	const consider = (role, file) => {
		if (!file.text) return;
		const next = {
			role,
			path: normalizePath(file.path),
			text: file.text
		};
		if (MULTI_FILE_ROLES.has(role)) {
			byRole.set(`${role}:${next.path}`, next);
			return;
		}
		const prev = byRole.get(role);
		if (!prev) {
			byRole.set(role, next);
			return;
		}
		const prevSectors = role === "sectors" ? looksLikeSectorsYaml(prev.text) : true;
		const nextSectors = role === "sectors" ? looksLikeSectorsYaml(next.text) : true;
		if (role === "sectors" && nextSectors && !prevSectors) byRole.set(role, next);
		else if (role === "sectors" && prevSectors && !nextSectors) return;
		else if (next.text.length >= prev.text.length) byRole.set(role, next);
	};
	for (const file of files) {
		const role = classifyScenarioPath(file.path, hint);
		if (file.text && role === "sectors" && !looksLikeSectorsYaml(file.text) && !/sectors\.ya?ml$/i.test(file.path)) continue;
		if (role && (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "pdaYaml" || role === "pdaCsv")) consider(role, file);
		else if ((role === "playfieldYaml" || role === "randomPreset") && file.text) byRole.set(`${role}:${normalizePath(file.path)}`, {
			role,
			path: normalizePath(file.path),
			text: file.text
		});
		else if (file.text && looksLikeSectorsYaml(file.text) && /\.ya?ml$/i.test(file.path) && !/playfield/i.test(file.path)) consider("sectors", file);
	}
	return [...byRole.values()];
}
function catalogLoadSummary(catalog) {
	const roles = (catalog.texts ?? []).map((t) => t.role);
	const has = (role) => roles.includes(role) || catalog.files.some((f) => f.role === role);
	const missing = [];
	if (!has("galaxy")) missing.push("GalaxyConfig.ecf");
	if (!catalog.texts?.some((t) => t.role === "sectors" && t.text)) missing.push("Sectors.yaml");
	if (!has("items")) missing.push("ItemsConfig.ecf");
	if (!has("blocks")) missing.push("BlocksConfig.ecf");
	if (!has("localization")) missing.push("Localization.csv");
	const playfields = (catalog.texts ?? []).filter((t) => t.role === "playfieldYaml" && t.text).length;
	const loaded = (catalog.texts ?? []).filter((t) => t.text && t.role !== "playfieldYaml").map((t) => `${t.path.split("/").pop()} (${Math.max(1, Math.round(t.text.length / 1024))} KB)`);
	if (playfields) loaded.push(`${playfields} playfield yaml`);
	return {
		missing,
		loaded
	};
}
function isLoadingScreenPath(path) {
	const p = normalizePath(path).toLowerCase();
	if (!/\.(png|jpe?g|webp|gif)$/.test(p)) return false;
	if (/(?:^|\/)loading.?screens?(?:hots?)?(?:\/|$)/.test(p)) return true;
	if (/(?:^|\/)loadingscreenshots?(?:\/|$)/.test(p)) return true;
	if (/gui\/(?:textures\/)?loading(?:screens?)?(?:\/|$)/.test(p)) return true;
	if (/(?:^|\/)extras\/loading(?:screens?)?(?:\/|$)/.test(p)) return true;
	if (/shareddata/.test(p) && /(?:^|\/)screenshots?(?:\/|$)/.test(p)) return true;
	if (/shareddata/.test(p) && /(?:^|\/)(?:menu.?bg|mainmenu|menubackground|wallpaper)(?:\/|$)/.test(p)) return true;
	return false;
}
function isIconPath(p) {
	if (isLoadingScreenPath(p)) return false;
	if (/\/playfields?\//.test(p) || /\/prefabs?\//.test(p)) return false;
	if (/(?:^|\/)(?:itemicons?|blockicons?)(?:\/|$)/.test(p)) return true;
	if (/\/bundles\/(?:itemicons?|blockicons?|icons)(?:\/|$)/.test(p)) return true;
	if (/\/shareddata\/content\/bundles\//.test(p)) return true;
	return /(?:^|\/)(?:shareddata\/)?(?:content\/)?(?:items?|itemicons|icons|blocks?)(?:\/|$)/.test(p) || /\/content\/(?:items?|blocks?|icons|bundles)\//.test(p);
}
function folderNameOf(files) {
	const top = (files[0]?.path ? normalizePath(files[0].path) : "").split("/")[0] ?? "";
	if (top && files.every((f) => normalizePath(f.path).startsWith(`${top}/`) || normalizePath(f.path) === top)) return top;
	return top || "Scenario";
}
function addEntry(bag, seen, entry) {
	const key = `${entry.kind}:${entry.name.toLowerCase()}`;
	if (seen.has(key)) return;
	seen.add(key);
	bag.push(entry);
}
function pickPda(files, role, hint) {
	const matches = files.filter((f) => classifyScenarioPath(f.path, hint) === role && f.text);
	if (!matches.length) return void 0;
	return matches.find((f) => /extras\/pda\//i.test(normalizePath(f.path))) ?? matches[0];
}
function parseSectors(text, source, bag, seen) {
	let doc;
	try {
		doc = load(text, { json: true });
	} catch {
		return 0;
	}
	let count = 0;
	const walk = (node) => {
		if (!node) return;
		if (Array.isArray(node)) {
			if (node.length >= 2 && typeof node[0] === "string" && typeof node[1] === "string") {
				const name = node[1].trim();
				if (name) {
					addEntry(bag, seen, {
						kind: "playfield",
						name,
						source
					});
					count += 1;
				}
			}
			node.forEach(walk);
			return;
		}
		if (typeof node !== "object") return;
		const rec = node;
		const named = rec.Name ?? rec.PlayfieldName ?? rec.PlanetName;
		if (typeof named === "string" && named.trim()) {
			addEntry(bag, seen, {
				kind: "playfield",
				name: named.trim(),
				source
			});
			count += 1;
		}
		Object.values(rec).forEach(walk);
	};
	walk(doc);
	return count;
}
function applyLocalization(entries, loc) {
	const packedToLabel = /* @__PURE__ */ new Map();
	for (const [key, label] of Object.entries(loc)) packedToLabel.set(compactToken(key.replace(/^(items?_|blocks?_|tokens?_|factions?_)/i, "")), label);
	for (const entry of entries) {
		if (entry.label) continue;
		const keys = locaKeysForName(entry.name, entry.kind);
		for (const key of keys) {
			const label = loc[key];
			if (label) {
				entry.label = label;
				break;
			}
		}
		if (entry.label) continue;
		const packed = compactToken(entry.name);
		const label = packedToLabel.get(packed);
		if (label) entry.label = label;
	}
}
function locaKeysForName(name, kind) {
	const keys = [
		name,
		`Items_${name}`,
		`Item_${name}`,
		`item_${name}`,
		`Block_${name}`,
		`Blocks_${name}`,
		`Token_${name}`,
		`Faction_${name}`
	];
	if (kind === "block") keys.unshift(`Block_${name}`, `Blocks_${name}`);
	if (kind === "item") keys.unshift(`Items_${name}`, `Item_${name}`);
	if (kind === "token") keys.unshift(`Token_${name}`, `Items_${name}`);
	if (kind === "faction") keys.unshift(`Faction_${name}`);
	return [...new Set(keys)];
}
function compactToken(value) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
var locaByCatalog = /* @__PURE__ */ new WeakMap();
var catalogIndex = null;
var catalogIndexRef = null;
var gameIndexCache = null;
var gameIndexRef = null;
function putMap(map, key, entry) {
	if (key && !map.has(key)) map.set(key, entry);
}
function indexEntries(entries, loca = []) {
	const byKind = /* @__PURE__ */ new Map();
	const name = /* @__PURE__ */ new Map();
	const label = /* @__PURE__ */ new Map();
	const file = /* @__PURE__ */ new Map();
	const group = /* @__PURE__ */ new Map();
	const packedName = /* @__PURE__ */ new Map();
	const packedLabel = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const list = byKind.get(entry.kind);
		if (list) list.push(entry);
		else byKind.set(entry.kind, [entry]);
		putMap(name, `${entry.kind}:${entry.name.toLowerCase()}`, entry);
		if (entry.label) putMap(label, `${entry.kind}:${entry.label.toLowerCase()}`, entry);
		if (entry.poiFile) putMap(file, `${entry.kind}:${entry.poiFile.toLowerCase()}`, entry);
		if (entry.poiGroup) putMap(group, `${entry.kind}:${entry.poiGroup.toLowerCase()}`, entry);
		putMap(packedName, `${entry.kind}:${compactToken(entry.name)}`, entry);
		if (entry.label) putMap(packedLabel, `${entry.kind}:${compactToken(entry.label)}`, entry);
	}
	const locaLabel = /* @__PURE__ */ new Map();
	const locaKey = /* @__PURE__ */ new Map();
	const locaPacked = /* @__PURE__ */ new Map();
	for (const row of loca) {
		const rec = {
			name: row.name,
			label: row.label
		};
		if (!locaLabel.has(row.label.toLowerCase())) locaLabel.set(row.label.toLowerCase(), rec);
		if (!locaKey.has(row.key.toLowerCase())) locaKey.set(row.key.toLowerCase(), rec);
		const packed = compactToken(row.label) || compactToken(row.name) || compactToken(row.key);
		if (packed && !locaPacked.has(packed)) locaPacked.set(packed, rec);
	}
	return {
		byKind,
		name,
		label,
		file,
		group,
		packedName,
		packedLabel,
		locaLabel,
		locaKey,
		locaPacked
	};
}
function getCatalogIndex(catalog) {
	if (catalogIndex && catalogIndexRef === catalog) return catalogIndex;
	catalogIndex = indexEntries(catalog.entries, localizationLabels(catalog));
	catalogIndexRef = catalog;
	return catalogIndex;
}
function getGameIndex(catalog) {
	const entries = catalog.game;
	if (!entries?.length) return null;
	if (gameIndexCache && gameIndexRef === entries) return gameIndexCache;
	gameIndexCache = indexEntries(entries);
	gameIndexRef = entries;
	return gameIndexCache;
}
function lookupIndex(index, token, kinds) {
	const needle = token.trim().toLowerCase();
	const packed = compactToken(token);
	if (!needle) return null;
	const pick = (map) => {
		for (const kind of kinds) {
			const hit = map.get(`${kind}:${needle}`);
			if (hit) return hit;
		}
		return null;
	};
	const byName = pick(index.name);
	if (byName) {
		if (byName.poiFile && byName.poiGroup && compactToken(byName.poiFile) === packed && compactToken(byName.poiGroup) !== packed) return {
			entry: byName,
			via: "file"
		};
		if (byName.poiGroup && compactToken(byName.poiGroup) === packed) return {
			entry: byName,
			via: "group"
		};
		return {
			entry: byName,
			via: "name"
		};
	}
	const byFile = pick(index.file);
	if (byFile) return {
		entry: byFile,
		via: byFile.poiGroup && byFile.poiGroup.toLowerCase() !== needle ? "file" : "name"
	};
	const byGroup = pick(index.group);
	if (byGroup) return {
		entry: byGroup,
		via: "group"
	};
	const byLabel = pick(index.label);
	if (byLabel) return {
		entry: byLabel,
		via: "label"
	};
	if (packed.length >= 3) {
		for (const kind of kinds) {
			const packedName = index.packedName.get(`${kind}:${packed}`);
			if (packedName) return {
				entry: packedName,
				via: "name"
			};
		}
		for (const kind of kinds) {
			const packedLabel = index.packedLabel.get(`${kind}:${packed}`);
			if (packedLabel) return {
				entry: packedLabel,
				via: "label"
			};
		}
	}
	const loca = index.locaLabel.get(needle) || index.locaKey.get(needle) || (packed.length >= 3 ? index.locaPacked.get(packed) : void 0);
	if (loca) for (const kind of kinds) {
		const entry = index.name.get(`${kind}:${loca.name.toLowerCase()}`) || index.packedName.get(`${kind}:${compactToken(loca.name)}`);
		if (entry) return {
			entry,
			via: entry.name.toLowerCase() === needle ? "name" : "label"
		};
	}
	return null;
}
function resolveCatalogToken(catalog, token, kinds) {
	const own = lookupIndex(getCatalogIndex(catalog), token, kinds);
	if (own) return own;
	const game = getGameIndex(catalog);
	if (!game) return null;
	return lookupIndex(game, token, kinds);
}
function localizationLabels(catalog) {
	if (!catalog) return [];
	const text = (catalog.texts ?? []).find((t) => t.role === "localization" && t.text)?.text ?? "";
	const cached = locaByCatalog.get(catalog);
	if (cached && cached.text === text) return cached.rows;
	const rows = [];
	if (text) {
		const table = parseCsv(text);
		const lang = table.languages.includes("English") ? "English" : table.languages[0];
		if (lang) for (const [key, rec] of Object.entries(table.rows)) {
			const label = rec[lang]?.trim();
			if (!label) continue;
			const name = key.replace(/^(items?_|blocks?_|tokens?_|factions?_)/i, "");
			rows.push({
				key,
				name,
				label
			});
		}
	}
	for (const entry of catalog.entries) if (entry.label) rows.push({
		key: entry.name,
		name: entry.name,
		label: entry.label
	});
	locaByCatalog.set(catalog, {
		text,
		rows
	});
	return rows;
}
function stampLocalization(catalog) {
	const loc = {};
	for (const row of localizationLabels(catalog)) {
		loc[row.key] = row.label;
		loc[row.name] = row.label;
	}
	applyLocalization(catalog.entries, loc);
	return catalog;
}
function indexScenario(files, hint) {
	const catalogFiles = [];
	const entries = [];
	const texts = [];
	const seen = /* @__PURE__ */ new Set();
	const loc = {};
	for (const file of files) {
		const role = classifyScenarioPath(file.path, hint);
		if (!role) continue;
		const source = normalizePath(file.path).split("/").slice(-2).join("/");
		let count = 0;
		if (role === "poi") {
			const fileName = (file.path.split(/[/\\]/).pop() ?? "").replace(/\.epb$/i, "");
			if (fileName) {
				const meta = file.meta ?? { fileName };
				const groupName = (meta.groupName || "").trim();
				const spawnName = (meta.spawnName || "").trim();
				addEntry(entries, seen, {
					kind: "poi",
					name: fileName,
					label: spawnName || groupName || void 0,
					source,
					poiFile: fileName,
					poiGroup: groupName || void 0
				});
				if (groupName && groupName.toLowerCase() !== fileName.toLowerCase()) addEntry(entries, seen, {
					kind: "poi",
					name: groupName,
					label: spawnName || fileName,
					source,
					poiFile: fileName,
					poiGroup: groupName
				});
				count = groupName && groupName.toLowerCase() !== fileName.toLowerCase() ? 2 : 1;
			}
		} else if (role === "picture" || role === "itemPicture") {
			const name = file.path.split(/[/\\]/).pop() ?? "";
			if (name) {
				addEntry(entries, seen, {
					kind: "picture",
					name,
					source,
					group: role === "itemPicture" ? "item" : "pda"
				});
				count = 1;
			}
		} else if (role === "wallpaper") count = 1;
		else if (role === "playfieldYaml") {
			const parts = normalizePath(file.path).split("/");
			const folder = parts[parts.length - 2];
			if (folder && !/^playfields?$/i.test(folder)) {
				addEntry(entries, seen, {
					kind: "playfield",
					name: folder,
					source
				});
				count = 1;
			}
		} else if (role === "sectors" && file.text) count = parseSectors(file.text, source, entries, seen);
		else if (role === "localization" && file.text) {
			const table = parseCsv(file.text);
			const lang = table.languages.includes("English") ? "English" : table.languages[0];
			if (lang) for (const [key, rec] of Object.entries(table.rows)) {
				const label = rec[lang]?.trim();
				if (label) loc[key] = label;
			}
			count = Object.keys(loc).length;
		} else if (file.text && role !== "localization" && role !== "dialoguesCsv" && role !== "sectors" && (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "dialogues")) {
			const records = extractEcfRecords(file.text);
			const harvested = harvestDeclaredNames(file.text);
			const seenRec = new Set(records.map((rec) => `${rec.kind}:${rec.name}`.toLowerCase()));
			for (const extra of harvested) {
				const key = `${extra.kind}:${extra.name}`.toLowerCase();
				if (seenRec.has(key)) continue;
				seenRec.add(key);
				records.push({
					kind: extra.kind,
					name: extra.name
				});
			}
			for (const rec of records) {
				const kind = KIND_FROM_ECF[rec.kind.toLowerCase()];
				if (!kind) continue;
				addEntry(entries, seen, {
					kind,
					name: rec.name,
					source
				});
				if (rec.abbrev && rec.abbrev.toLowerCase() !== rec.name.toLowerCase()) addEntry(entries, seen, {
					kind,
					name: rec.abbrev,
					label: rec.name,
					source
				});
				count += 1;
			}
		}
		if (file.text && (CONFIG_TEXT_ROLES.has(role) || role === "ecf" || role === "pdaYaml" || role === "pdaCsv" || role === "playfieldYaml" || role === "randomPreset")) texts.push({
			role,
			path: normalizePath(file.path),
			text: file.text
		});
		if (count || role === "pdaYaml" || role === "pdaCsv" || texts.some((t) => t.path === normalizePath(file.path))) catalogFiles.push({
			role,
			path: normalizePath(file.path),
			count
		});
	}
	applyLocalization(entries, loc);
	const yamlFile = pickPda(files, "pdaYaml", hint);
	const csvFile = pickPda(files, "pdaCsv", hint);
	const pda = yamlFile?.text ? {
		yamlText: yamlFile.text,
		yamlName: yamlFile.path.split(/[/\\]/).pop(),
		csvText: csvFile?.text,
		csvName: csvFile?.path.split(/[/\\]/).pop()
	} : void 0;
	return {
		catalog: {
			folderName: folderNameOf(files),
			files: catalogFiles,
			entries,
			texts,
			indexedAt: Date.now()
		},
		pda
	};
}
function catalogCounts(catalog) {
	const counts = {
		item: 0,
		block: 0,
		entity: 0,
		faction: 0,
		dialogue: 0,
		token: 0,
		group: 0,
		poi: 0,
		playfield: 0,
		picture: 0
	};
	for (const entry of catalog.entries) counts[entry.kind] += 1;
	return counts;
}
function lookupCatalog(catalog, name) {
	const needle = name.trim().toLowerCase();
	if (!needle) return void 0;
	return catalog.entries.find((e) => e.name.toLowerCase() === needle);
}
function splitTokens(value) {
	return value.split(/[,|\n]+/).map((part) => part.trim()).filter(Boolean);
}
function suggestionsFor(catalog, kinds, query, limit = 12) {
	const q = query.trim().toLowerCase();
	const index = getCatalogIndex(catalog);
	const pool = [];
	for (const kind of kinds) {
		const list = index.byKind.get(kind);
		if (!list) continue;
		for (const entry of list) {
			if (entry.kind === "picture" && entry.group === "item") continue;
			pool.push(entry);
		}
	}
	if (!q) return pool.slice(0, limit);
	const cq = compactToken(q);
	const scored = [];
	for (const entry of pool) {
		const name = entry.name.toLowerCase();
		const label = (entry.label ?? "").toLowerCase();
		const group = (entry.poiGroup ?? "").toLowerCase();
		const file = (entry.poiFile ?? "").toLowerCase();
		const cn = compactToken(name);
		let score = 0;
		if (name === q || group === q || file === q) score = 100;
		else if (name.startsWith(q) || q.startsWith(name) || group.startsWith(q) || file.startsWith(q)) score = 80;
		else if (label.startsWith(q)) score = 70;
		else if (name.includes(q) || group.includes(q) || file.includes(q)) score = 50;
		else if (label.includes(q)) score = 40;
		else if (cq.length >= 3 && cn && (cn.includes(cq) || cq.includes(cn))) score = 35;
		if (score) scored.push({
			entry,
			score
		});
	}
	scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
	const picked = scored.slice(0, limit).map((row) => row.entry);
	if (picked.length >= limit || !catalog.game?.length) return picked;
	const seen = new Set(picked.map((entry) => `${entry.kind}:${entry.name.toLowerCase()}`));
	const rest = suggestionsFor({
		...catalog,
		entries: catalog.game,
		game: void 0
	}, kinds, query, limit);
	for (const entry of rest) {
		const key = `${entry.kind}:${entry.name.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		picked.push(entry);
		if (picked.length >= limit) break;
	}
	return picked;
}
function mergeCatalog(base, extra) {
	const entries = base.entries.map((e) => ({ ...e }));
	const byKey = /* @__PURE__ */ new Map();
	for (const e of entries) byKey.set(`${e.kind}:${e.name.toLowerCase()}:${e.group ?? ""}`, e);
	for (const entry of extra.entries) {
		const key = `${entry.kind}:${entry.name.toLowerCase()}:${entry.group ?? ""}`;
		const existing = byKey.get(key);
		if (existing) {
			if (entry.label && !existing.label) existing.label = entry.label;
			if (entry.poiGroup && !existing.poiGroup) existing.poiGroup = entry.poiGroup;
			if (entry.poiFile && !existing.poiFile) existing.poiFile = entry.poiFile;
			continue;
		}
		const copy = { ...entry };
		byKey.set(key, copy);
		entries.push(copy);
	}
	const files = [...base.files];
	for (const file of extra.files) if (!files.some((f) => f.path === file.path && f.role === file.role)) files.push(file);
	else {
		const i = files.findIndex((f) => f.path === file.path && f.role === file.role);
		if (i >= 0) files[i] = file;
	}
	const texts = [...base.texts ?? []];
	for (const text of extra.texts ?? []) {
		if (!text.text) continue;
		if (text.role === "playfieldYaml" || text.role === "randomPreset") {
			const i = texts.findIndex((t) => t.role === text.role && t.path === text.path);
			if (i >= 0) texts[i] = text;
			else texts.push(text);
			continue;
		}
		const i = texts.findIndex((t) => t.role === text.role);
		if (i >= 0) {
			const cur = texts[i];
			texts[i] = text.text.length >= cur.text.length || text.path === cur.path ? text : cur;
		} else texts.push(text);
	}
	stampLocalization({
		folderName: extra.folderName || base.folderName,
		files,
		entries,
		texts,
		indexedAt: Date.now()
	});
	return {
		folderName: extra.folderName || base.folderName,
		files,
		entries,
		texts,
		game: extra.game ?? base.game,
		indexedAt: Date.now()
	};
}
function dropCatalogGroup(catalog, group) {
	return {
		...catalog,
		entries: catalog.entries.filter((e) => !(e.kind === "picture" && e.group === group)),
		indexedAt: Date.now()
	};
}
var CHECK_NAME_KINDS = {
	InventoryContains: ["item", "token"],
	ToolbarContains: ["item"],
	ItemsPickedUp: ["item"],
	ItemsConsumed: ["item"],
	ItemsCrafted: ["item"],
	ItemsUnlocked: ["item"],
	ArmorEquipped: ["item"],
	DevicePowered: ["block"],
	ConstructionQueueContains: ["block", "item"],
	BlocksPlaced: ["block"],
	BlocksRemoved: ["block"],
	BlockDestroyed: ["poi", "block"],
	NearPoi: ["poi"],
	PoiDiscovered: ["poi"],
	NearUnit: [
		"poi",
		"entity",
		"block"
	],
	SubjectKilled: ["entity", "group"],
	PlayfieldEntered: ["playfield"],
	PlayfieldTypeEntered: ["playfield"],
	NearResource: ["item", "block"],
	ResourceDiscovered: ["item", "block"],
	Signal: ["poi"],
	WindowOpened: [],
	InventoryOpened: [],
	InventoryEmptied: []
};
var CHECK_TYPE_KINDS = {
	InventoryContains: ["item", "token"],
	ToolbarContains: ["item"],
	ItemsPickedUp: ["item"],
	ItemsConsumed: ["item"],
	ItemsCrafted: ["item"],
	ItemsUnlocked: ["item"],
	ArmorEquipped: ["item"],
	DevicePowered: ["block"],
	BlocksPlaced: ["block"],
	BlocksRemoved: ["block"],
	BlockDestroyed: ["block"],
	NearResource: ["item", "block"],
	ResourceDiscovered: ["item", "block"]
};
var DB = "pulsepda";
var STORE = "kv";
var TEXT_STORE = "texts";
var DB_VERSION = 3;
var LEGACY_KEYS = ["pulsepda.project.v2", "pulsepda.project.v1"];
var dbPromise = null;
function openPdaDb() {
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
			if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
			if (!db.objectStoreNames.contains(TEXT_STORE)) db.createObjectStore(TEXT_STORE);
		};
		req.onsuccess = () => {
			const db = req.result;
			db.onclose = () => {
				dbPromise = null;
			};
			db.onversionchange = () => {
				db.close();
				dbPromise = null;
			};
			resolve(db);
		};
		req.onerror = () => {
			dbPromise = null;
			reject(req.error);
		};
	});
	return dbPromise;
}
var memory = /* @__PURE__ */ new Map();
var writeTimer = null;
var pending$2 = null;
function txGet(db, key) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
		req.onsuccess = () => {
			const value = req.result;
			resolve(typeof value === "string" ? value : value == null ? null : JSON.stringify(value));
		};
		req.onerror = () => reject(req.error);
	});
}
function txSet(db, key, value) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}
function txDel(db, key) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}
function dropLegacyLocal() {
	if (typeof localStorage === "undefined") return;
	for (const key of LEGACY_KEYS) try {
		localStorage.removeItem(key);
	} catch {}
}
async function flush(name, value) {
	if (typeof indexedDB === "undefined") return;
	await txSet(await openPdaDb(), name, value);
	dropLegacyLocal();
}
function catalogTextKey(text) {
	if (text.role === "playfieldYaml" || MULTI_FILE_ROLES.has(text.role)) return `${text.role}:${text.path}`;
	return text.role;
}
async function putCatalogTexts(texts, onProgress) {
	if (typeof indexedDB === "undefined" || !texts.length) return;
	const db = await openPdaDb();
	if (!db.objectStoreNames.contains(TEXT_STORE)) return;
	const rows = texts.filter((t) => t.text);
	const chunk = 20;
	for (let i = 0; i < rows.length; i += chunk) {
		const slice = rows.slice(i, i + chunk);
		await new Promise((resolve, reject) => {
			const tx = db.transaction(TEXT_STORE, "readwrite");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			const store = tx.objectStore(TEXT_STORE);
			for (const text of slice) store.put(text, catalogTextKey(text));
		});
		onProgress?.(Math.min(i + chunk, rows.length), rows.length);
		if (i + chunk < rows.length) await new Promise((r) => setTimeout(r, 0));
	}
}
async function deleteCatalogText(role, path) {
	if (typeof indexedDB === "undefined") return;
	try {
		const db = await openPdaDb();
		if (!db.objectStoreNames.contains(TEXT_STORE)) return;
		const key = catalogTextKey({
			role,
			path,
			text: " "
		});
		await new Promise((resolve, reject) => {
			const tx = db.transaction(TEXT_STORE, "readwrite");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.objectStore(TEXT_STORE).delete(key);
		});
	} catch {}
}
async function loadCatalogTexts() {
	if (typeof indexedDB === "undefined") return [];
	try {
		const db = await openPdaDb();
		if (!db.objectStoreNames.contains(TEXT_STORE)) return [];
		return await new Promise((resolve, reject) => {
			const req = db.transaction(TEXT_STORE, "readonly").objectStore(TEXT_STORE).getAll();
			req.onsuccess = () => resolve(req.result || []);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return [];
	}
}
async function clearCatalogTexts() {
	if (typeof indexedDB === "undefined") return;
	try {
		const db = await openPdaDb();
		if (!db.objectStoreNames.contains(TEXT_STORE)) return;
		await new Promise((resolve, reject) => {
			const req = db.transaction(TEXT_STORE, "readwrite").objectStore(TEXT_STORE).clear();
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	} catch {}
}
var durableStorage = {
	getItem: async (name) => {
		if (memory.has(name)) return memory.get(name);
		if (typeof indexedDB === "undefined") return null;
		try {
			const db = await openPdaDb();
			const fromIdb = await txGet(db, name);
			if (fromIdb != null) {
				memory.set(name, fromIdb);
				dropLegacyLocal();
				return fromIdb;
			}
			if (typeof localStorage !== "undefined") for (const key of [name, ...LEGACY_KEYS]) {
				const legacy = localStorage.getItem(key);
				if (legacy) {
					memory.set(name, legacy);
					try {
						await txSet(db, name, legacy);
					} catch {}
					dropLegacyLocal();
					return legacy;
				}
			}
		} catch {
			return memory.get(name) ?? null;
		}
		return null;
	},
	setItem: (name, value) => {
		if (memory.get(name) === value) return Promise.resolve();
		memory.set(name, value);
		pending$2 = {
			name,
			value
		};
		const wait = value.length > 8e5 ? 1800 : value.length > 12e4 ? 900 : 400;
		return new Promise((resolve) => {
			if (writeTimer) clearTimeout(writeTimer);
			writeTimer = setTimeout(() => {
				const next = pending$2;
				pending$2 = null;
				if (!next) {
					resolve();
					return;
				}
				beginBusy("save");
				flush(next.name, next.value).catch((err) => {
					console.warn("Axis 2026 Creator Particlewave could not save to IndexedDB", err);
				}).finally(() => {
					endBusy("save");
					resolve();
				});
			}, wait);
		});
	},
	removeItem: async (name) => {
		memory.delete(name);
		dropLegacyLocal();
		if (typeof indexedDB === "undefined") return;
		try {
			await txDel(await openPdaDb(), name);
		} catch {}
	}
};
var EDGE = 1280;
var QUALITY = .68;
var SMALL = 22e4;
var SCALE_SRC = `
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
var worker$1;
var seq$1 = 0;
var pending$1 = /* @__PURE__ */ new Map();
function getWorker$1() {
	if (typeof window === "undefined" || typeof Worker === "undefined") return null;
	if (worker$1 !== void 0) return worker$1;
	try {
		const url = URL.createObjectURL(new Blob([SCALE_SRC], { type: "text/javascript" }));
		worker$1 = new Worker(url);
		worker$1.onmessage = (event) => {
			const job = pending$1.get(event.data.id);
			if (!job) return;
			pending$1.delete(event.data.id);
			job.resolve(event.data.ok && event.data.buffer ? new Blob([event.data.buffer], { type: "image/jpeg" }) : null);
		};
		worker$1.onerror = () => {
			for (const job of pending$1.values()) job.resolve(null);
			pending$1.clear();
			worker$1?.terminate();
			worker$1 = null;
		};
	} catch {
		worker$1 = null;
	}
	return worker$1;
}
async function downscaleImageBlob(blob, edge = EDGE) {
	if (!blob || blob.size <= SMALL) return blob;
	const w = getWorker$1();
	if (!w) return blob;
	const id = ++seq$1;
	const buffer = await blob.arrayBuffer();
	return await new Promise((resolve) => {
		const timer = window.setTimeout(() => {
			pending$1.delete(id);
			resolve(blob.size > 15e5 ? new Blob() : blob);
		}, 8e3);
		pending$1.set(id, { resolve: (next) => {
			window.clearTimeout(timer);
			resolve(next && next.size ? next : blob);
		} });
		w.postMessage({
			id,
			buffer,
			type: blob.type || "image/jpeg",
			edge,
			quality: QUALITY
		}, [buffer]);
	});
}
var urls = /* @__PURE__ */ new Map();
var aliases = /* @__PURE__ */ new Map();
var iconMisses = /* @__PURE__ */ new Set();
var wallpaperNamesCache = null;
var warmPromise = null;
var iconsWarmed = false;
var WP_CAP = 8;
function basename(path) {
	return path.replace(/\\/g, "/").split("/").pop() || path;
}
var ICON_EXT = /\.(png|jpe?g|webp|gif)$/i;
function iconLookupKeys(name) {
	const base = basename(name).trim();
	if (!base) return [];
	const stem = base.replace(ICON_EXT, "");
	const keys = [
		base,
		stem,
		`${stem}.png`,
		`${stem}.jpg`,
		`${stem}.jpeg`,
		`${stem}.webp`,
		`${stem}.gif`
	];
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const key of keys) {
		const k = key.toLowerCase();
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(key);
	}
	return out;
}
function iconCandidates(name, fields) {
	const refs = [fields?.CustomIcon || fields?.customicon || fields?.Customicon || fields?.Icon || fields?.UnlockIcon, name].map((v) => (v || "").trim()).filter(Boolean);
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const ref of refs) for (const key of iconLookupKeys(ref)) {
		const k = key.toLowerCase();
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(key);
	}
	return out;
}
function remember(storedName) {
	for (const key of iconLookupKeys(storedName)) aliases.set(key.toLowerCase(), storedName);
}
function resolveAlias(name) {
	for (const key of iconLookupKeys(name)) {
		const mapped = aliases.get(key.toLowerCase());
		if (mapped) return mapped;
		if (urls.has(key)) return key;
	}
}
function peekImageUrl(name) {
	const mapped = resolveAlias(name);
	if (mapped && urls.has(mapped)) return urls.get(mapped);
	return urls.get(basename(name)) || urls.get(name);
}
async function putImages(files, onProgress) {
	if (typeof indexedDB === "undefined" || !files.length) return [];
	const wallpapers = [];
	const others = [];
	for (const file of files) if (file.set === "wallpaper") wallpapers.push(file);
	else others.push(file);
	const names = [];
	if (others.length) names.push(...await writeImageSlice(others, false, onProgress));
	if (wallpapers.length) {
		const scaled = [];
		for (const file of wallpapers.slice(0, WP_CAP)) {
			if (file.blob.size > 12e6) continue;
			const blob = await downscaleImageBlob(file.blob);
			if (!blob.size) continue;
			scaled.push({
				...file,
				blob
			});
			await new Promise((r) => setTimeout(r, 0));
		}
		names.push(...await writeImageSlice(scaled, true));
		wallpaperNamesCache = names.filter((n) => n.startsWith("wp:"));
	}
	return names;
}
async function writeImageSlice(files, wallpaper, onProgress) {
	if (!files.length) return [];
	const db = await openPdaDb();
	const names = [];
	const chunk = wallpaper ? 2 : 40;
	for (let i = 0; i < files.length; i += chunk) {
		const slice = files.slice(i, i + chunk);
		await new Promise((resolve, reject) => {
			const tx = db.transaction("blobs", "readwrite");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			const store = tx.objectStore("blobs");
			for (const file of slice) {
				const name = wallpaper ? `wp:${basename(file.path)}` : basename(file.path);
				names.push(name);
				store.put({
					name,
					set: file.set,
					path: file.path,
					blob: file.blob
				}, name);
				remember(name);
			}
		});
		onProgress?.(Math.min(i + chunk, files.length), files.length);
		if (i + chunk < files.length) await new Promise((r) => setTimeout(r, 0));
	}
	return names;
}
async function getImageUrl(name) {
	const hit = peekImageUrl(name);
	if (hit) return hit;
	if (typeof indexedDB === "undefined") return null;
	const missKey = name.trim().toLowerCase();
	if (missKey && iconMisses.has(missKey)) return null;
	try {
		if (!name.startsWith("wp:")) {
			await warmImageCache();
			const warmed = peekImageUrl(name);
			if (warmed) return warmed;
			if (iconsWarmed && !resolveAlias(name)) {
				if (missKey) iconMisses.add(missKey);
				return null;
			}
		}
		const key = name.startsWith("wp:") ? name : resolveAlias(name) || basename(name);
		const db = await openPdaDb();
		const rec = await new Promise((resolve, reject) => {
			const req = db.transaction("blobs", "readonly").objectStore("blobs").get(key);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		if (!rec?.blob) {
			if (missKey) iconMisses.add(missKey);
			return null;
		}
		let blob = rec.blob;
		if (rec.set === "wallpaper" || rec.name.startsWith("wp:")) {
			blob = await downscaleImageBlob(blob);
			if (!blob.size) return null;
			if (blob !== rec.blob) try {
				db.transaction("blobs", "readwrite").objectStore("blobs").put({
					...rec,
					blob
				}, rec.name);
			} catch {}
		}
		const existing = urls.get(rec.name);
		if (existing) return existing;
		const url = URL.createObjectURL(blob);
		const raced = urls.get(rec.name);
		if (raced) {
			URL.revokeObjectURL(url);
			return raced;
		}
		urls.set(rec.name, url);
		remember(rec.name);
		return url;
	} catch {
		return null;
	}
}
async function resolveIconUrl(names) {
	for (const name of names) {
		if (!name) continue;
		const url = await getImageUrl(name);
		if (url) return url;
	}
	return null;
}
async function listImageNames() {
	if (typeof indexedDB === "undefined") return [];
	const db = await openPdaDb();
	return await new Promise((resolve, reject) => {
		const req = db.transaction("blobs", "readonly").objectStore("blobs").getAllKeys();
		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => reject(req.error);
	});
}
async function listWallpaperNames() {
	if (wallpaperNamesCache) return wallpaperNamesCache.slice(0, WP_CAP);
	wallpaperNamesCache = (await listImageNames()).map(String).filter((name) => name.startsWith("wp:")).slice(0, WP_CAP);
	return wallpaperNamesCache;
}
async function clearImages(set) {
	if (typeof indexedDB === "undefined") return;
	const db = await openPdaDb();
	if (!set) {
		for (const url of urls.values()) URL.revokeObjectURL(url);
		urls.clear();
		aliases.clear();
		iconMisses.clear();
		iconsWarmed = false;
		wallpaperNamesCache = null;
		await new Promise((resolve, reject) => {
			const req = db.transaction("blobs", "readwrite").objectStore("blobs").clear();
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
		return;
	}
	await new Promise((resolve, reject) => {
		const tx = db.transaction("blobs", "readwrite");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		const req = tx.objectStore("blobs").openCursor();
		req.onsuccess = () => {
			const cursor = req.result;
			if (!cursor) return;
			const img = cursor.value;
			if (img.set === set) {
				cursor.delete();
				const url = urls.get(img.name);
				if (url) URL.revokeObjectURL(url);
				urls.delete(img.name);
				if (img.set === "wallpaper") wallpaperNamesCache = null;
				for (const [alias, target] of [...aliases.entries()]) if (target === img.name) aliases.delete(alias);
			}
			cursor.continue();
		};
	});
}
async function warmImageCache() {
	if (iconsWarmed) return;
	if (warmPromise) return warmPromise;
	warmPromise = (async () => {
		try {
			const names = await listImageNames();
			for (const name of names) remember(String(name));
			iconsWarmed = true;
		} catch {} finally {
			warmPromise = null;
		}
	})();
	return warmPromise;
}
var APP_NAME = "Axis 2026 Creator Particlewave";
var APP_SHORT = "Axis 2026";
var APP_SUBTITLE = "Creator Particlewave";
var CHECKS = [
	{
		id: "InventoryOpened",
		hint: "Names: inventory / device / Player"
	},
	{
		id: "InventoryEmptied",
		hint: "Names: inventory or device"
	},
	{
		id: "InventoryContains",
		hint: "Names: inventory; Types: items"
	},
	{
		id: "ToolbarContains",
		hint: "Types: items on toolbar"
	},
	{
		id: "DevicePowered",
		hint: "Names or Types: device / block"
	},
	{
		id: "ConstructionQueueContains",
		hint: "Names: constructor"
	},
	{
		id: "ItemsPickedUp",
		hint: "Types: ore / plants"
	},
	{
		id: "ItemsConsumed",
		hint: "Types: consumed items"
	},
	{
		id: "ItemsCrafted",
		hint: "Types: crafted; Names: constructor"
	},
	{
		id: "ItemsUnlocked",
		hint: "Types: unlocked items"
	},
	{
		id: "SubjectKilled",
		hint: "Names: NPC / fauna"
	},
	{
		id: "StructureSpawned",
		hint: "Names: Base, HV, SV, CV"
	},
	{
		id: "MainPowerSwitched",
		hint: "Names: Base, HV, SV, CV"
	},
	{
		id: "BlocksPlaced",
		hint: "Names: structure; Types: block"
	},
	{
		id: "BlocksRemoved",
		hint: "Names: structure; Types: block"
	},
	{
		id: "BlockDestroyed",
		hint: "Optional POI name + block type"
	},
	{
		id: "NearPoi",
		hint: "Names: POI group or filename"
	},
	{
		id: "NearUnit",
		hint: "Names: POI spawn or group, then the device’s control-panel name"
	},
	{
		id: "NearResource",
		hint: "Types: resource"
	},
	{
		id: "PoiDiscovered",
		hint: "Types / POI identifier"
	},
	{
		id: "ResourceDiscovered",
		hint: "Names: resource"
	},
	{
		id: "Signal",
		hint: "Names: signal* from blueprint"
	},
	{
		id: "WindowOpened",
		hint: "Names: Pda, Player, inventory window"
	},
	{
		id: "PlayfieldEntered",
		hint: "Names: playfield from Sectors.yaml"
	},
	{
		id: "PlayfieldTypeEntered",
		hint: "Names: playfield template"
	},
	{
		id: "ArmorEquipped",
		hint: "Types: armor item"
	}
];
var CHAPTER_KNOWN = /* @__PURE__ */ new Set([
	"ChapterTitle",
	"Category",
	"Description",
	"PictureFile",
	"PlayerLevel",
	"Visibility",
	"Tasks",
	"Rewards",
	"AutoActivateOnGameStart",
	"Preamble",
	"HideTasks",
	"CompletedMessage",
	"Activatable",
	"ReputationLevel"
]);
var TASK_KNOWN = /* @__PURE__ */ new Set([
	"TaskTitle",
	"Headline",
	"PictureFile",
	"StartDelay",
	"StartMessage",
	"Actions",
	"Rewards"
]);
var ACTION_KNOWN = /* @__PURE__ */ new Set([
	"ActionTitle",
	"Description",
	"Check",
	"Names",
	"Types",
	"Amount",
	"Required",
	"AllowManualCompletion",
	"CompletedMessage"
]);
function uid() {
	return crypto.randomUUID ? crypto.randomUUID() : `id${Math.random().toString(16).slice(2)}`;
}
function sanitizeYamlSource(src) {
	const notes = [];
	let text = src;
	if (text.charCodeAt(0) === 65279) {
		text = text.slice(1);
		notes.push({
			level: "info",
			message: "Stripped UTF-8 BOM."
		});
	}
	if (text.includes("\r")) text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	if (text.includes("	")) {
		text = text.replace(/\t/g, "  ");
		notes.push({
			level: "info",
			message: "Converted tabs to spaces."
		});
	}
	return {
		text,
		notes
	};
}
function importPda(files) {
	const started = Date.now();
	const issues = [];
	const { text, notes } = sanitizeYamlSource(files.yamlText);
	issues.push(...notes);
	let doc;
	try {
		doc = load(text, { json: true });
	} catch (err) {
		const mark = err.mark;
		const where = mark && typeof mark.line === "number" ? ` line ${mark.line + 1}${typeof mark.column === "number" ? `, column ${mark.column + 1}` : ""}` : "";
		throw new Error(`YAML parse failed${where}: ${err.message}`);
	}
	if (!doc || typeof doc !== "object") throw new Error("YAML did not contain a document object.");
	const root = doc;
	const csv = files.csvText ? parseCsv(files.csvText) : {
		languages: ["English"],
		rows: {}
	};
	if (files.csvText && csv.languages.length === 0) issues.push({
		level: "warning",
		message: "CSV parsed but no language columns were found."
	});
	const language = files.language && csv.languages.includes(files.language) ? files.language : csv.languages.includes("English") ? "English" : csv.languages[0] ?? "English";
	const chaptersIn = asArray(root.Chapters ?? root.chapters);
	if (!chaptersIn.length) issues.push({
		level: "error",
		message: "No Chapters array found in YAML."
	});
	let resolved = 0;
	const unresolvedKeys = [];
	const extraFields = /* @__PURE__ */ new Set();
	const resolve = (value) => {
		if (value == null) return { text: "" };
		const raw = String(value);
		const looked = csvLookup(csv, raw, language);
		if (looked != null) {
			resolved += 1;
			return {
				text: decodePdaEscapes(looked),
				key: raw
			};
		}
		if (looksLikeKey$1(raw)) {
			if (Object.keys(csv.rows).length) unresolvedKeys.push(raw);
			return {
				text: decodePdaEscapes(raw),
				key: raw
			};
		}
		return { text: decodePdaEscapes(raw) };
	};
	const chapters = chaptersIn.map((rawCh, index) => {
		const ch = asRecord(rawCh);
		if (!ch) {
			issues.push({
				level: "warning",
				message: `Chapter ${index + 1} was skipped (not an object).`
			});
			return emptyChapter(`Broken chapter ${index + 1}`);
		}
		const title = resolve(ch.ChapterTitle ?? ch.chapterTitle);
		const description = resolve(ch.Description ?? ch.description);
		const preamble = resolve(ch.Preamble);
		const extra = pickExtra(ch, CHAPTER_KNOWN, extraFields);
		const rewards = parseRewards(ch.Rewards);
		const tasks = asArray(ch.Tasks).map((rawTk, ti) => mapTask(rawTk, ti, title.text, resolve, extraFields, issues));
		if (!tasks.length) issues.push({
			level: "warning",
			message: `Chapter “${title.text || index + 1}” has no tasks.`
		});
		return {
			id: uid(),
			chapterTitle: title.text || `Chapter ${index + 1}`,
			titleKey: title.key,
			description: description.text,
			descriptionKey: description.key,
			pictureFile: str(ch.PictureFile),
			category: str(ch.Category) || "SoloMission",
			playerLevel: str(ch.PlayerLevel || 1),
			visibility: str(ch.Visibility) || "Always",
			autoActivateOnGameStart: asBool(ch.AutoActivateOnGameStart),
			hideTasks: asBool(ch.HideTasks),
			preamble: preamble.text,
			preambleKey: preamble.key,
			completedMessage: str(ch.CompletedMessage),
			activatable: str(ch.Activatable),
			reputationLevel: str(ch.ReputationLevel),
			rewards,
			tasks,
			extra
		};
	});
	const extraRoot = {};
	for (const [k, v] of Object.entries(root)) {
		if (k === "Creator" || k === "Chapters" || k === "chapters") continue;
		extraRoot[k] = v;
		extraFields.add(`root.${k}`);
	}
	if (!files.csvText) issues.push({
		level: "info",
		message: "No CSV imported. YAML keys will show as-is until you add PDA.csv."
	});
	const report = {
		yamlName: files.yamlName || "PDA.yaml",
		csvName: files.csvName || (files.csvText ? "PDA.csv" : "—"),
		chapters: chapters.length,
		tasks: chapters.reduce((n, c) => n + c.tasks.length, 0),
		actions: chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0),
		csvKeys: Object.keys(csv.rows).length,
		languages: csv.languages,
		resolved,
		unresolvedKeys: unique(unresolvedKeys).slice(0, 40),
		extraFields: [...extraFields].sort(),
		issues,
		durationMs: Date.now() - started
	};
	const nameFromFile = (files.yamlName || "").replace(/\.(ya?ml)$/i, "") || chapters[0]?.chapterTitle || "Imported scenario";
	return {
		name: nameFromFile === "PDA" ? "Imported scenario" : nameFromFile,
		creator: str(root.Creator) || "Unknown",
		language,
		csv,
		chapters,
		extraRoot,
		lastImport: report
	};
}
function mapTask(rawTk, index, chapterTitle, resolve, extraFields, issues) {
	const tk = asRecord(rawTk);
	if (!tk) {
		issues.push({
			level: "warning",
			message: `A task under “${chapterTitle}” was not an object.`
		});
		return emptyTask(`Broken task ${index + 1}`);
	}
	const title = resolve(tk.TaskTitle ?? tk.taskTitle);
	const startMessage = resolve(tk.StartMessage);
	const extra = pickExtra(tk, TASK_KNOWN, extraFields, "task");
	const actions = asArray(tk.Actions).map((rawAc, ai) => mapAction(rawAc, ai, title.text, resolve, extraFields, issues));
	if (!actions.length) issues.push({
		level: "warning",
		message: `Task “${title.text || index + 1}” in “${chapterTitle}” has no actions.`
	});
	return {
		id: uid(),
		taskTitle: title.text || `Task ${index + 1}`,
		titleKey: title.key,
		headline: str(tk.Headline),
		pictureFile: str(tk.PictureFile),
		startDelay: str(tk.StartDelay),
		startMessage: startMessage.text,
		startMessageKey: startMessage.key,
		actions,
		extra
	};
}
function mapAction(rawAc, index, taskTitle, resolve, extraFields, issues) {
	const ac = asRecord(rawAc);
	if (!ac) {
		issues.push({
			level: "warning",
			message: `An action under “${taskTitle}” was not an object.`
		});
		return emptyAction(`Broken action ${index + 1}`);
	}
	const title = resolve(ac.ActionTitle ?? ac.actionTitle);
	const description = resolve(ac.Description ?? ac.description);
	return {
		id: uid(),
		actionTitle: title.text || `Action ${index + 1}`,
		titleKey: title.key,
		description: description.text,
		descriptionKey: description.key,
		check: str(ac.Check),
		names: listToEdit(ac.Names),
		types: listToEdit(ac.Types),
		amount: ac.Amount == null ? "" : String(ac.Amount),
		required: str(ac.Required),
		allowManualCompletion: asBool(ac.AllowManualCompletion ?? ac.AllowManuelCompletion),
		completedMessage: str(ac.CompletedMessage),
		extra: pickExtra(ac, ACTION_KNOWN, extraFields, "action")
	};
}
function parseRewards(raw) {
	return asArray(raw).map((item) => {
		const r = asRecord(item) ?? {};
		const faction = r.Faction;
		return {
			item: str(r.Item),
			type: str(r.Type),
			count: Number(r.Count ?? 1) || 1,
			faction: Array.isArray(faction) ? faction.map(String).join(", ") : str(faction)
		};
	});
}
function pickExtra(rec, known, bag, prefix = "chapter") {
	const extra = {};
	for (const [k, v] of Object.entries(rec)) {
		if (known.has(k)) continue;
		extra[k] = v;
		bag.add(`${prefix}.${k}`);
	}
	return extra;
}
function asArray(value) {
	if (Array.isArray(value)) return value;
	if (value == null) return [];
	return [value];
}
function asRecord(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return null;
}
function str(value) {
	if (value == null) return "";
	return String(value);
}
function asBool(value) {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0;
	if (typeof value === "string") return /^(true|yes|1)$/i.test(value.trim());
	return false;
}
function listToEdit(value) {
	if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join(", ");
	if (value == null) return "";
	return String(value);
}
function looksLikeKey$1(raw) {
	return /^(txt_|pda_|ch_|tk_|ac_|chp|tasktitle|acttitle|chptitle)/i.test(raw) || /^[A-Za-z0-9_]{4,40}$/.test(raw);
}
function unique(list) {
	return [...new Set(list)];
}
function emptyChapter(title) {
	return {
		id: uid(),
		chapterTitle: title,
		description: "",
		pictureFile: "",
		category: "SoloMission",
		playerLevel: "1",
		visibility: "Always",
		autoActivateOnGameStart: false,
		hideTasks: false,
		preamble: "",
		completedMessage: "",
		activatable: "",
		reputationLevel: "",
		rewards: [],
		tasks: [],
		extra: {}
	};
}
function emptyTask(title) {
	return {
		id: uid(),
		taskTitle: title,
		headline: "",
		pictureFile: "",
		startDelay: "",
		startMessage: "",
		actions: [],
		extra: {}
	};
}
function emptyAction(title) {
	return {
		id: uid(),
		actionTitle: title,
		description: "",
		check: "",
		names: "",
		types: "",
		amount: "",
		required: "",
		allowManualCompletion: false,
		completedMessage: "",
		extra: {}
	};
}
function newChapter() {
	const t = emptyTask("New task");
	t.actions = [emptyAction("New action")];
	return {
		...emptyChapter("New chapter"),
		tasks: [t]
	};
}
function newTask() {
	const t = emptyTask("New task");
	t.actions = [emptyAction("New action")];
	return t;
}
function newAction() {
	return emptyAction("New action");
}
function blankProject() {
	return {
		name: "Untitled scenario",
		creator: APP_NAME,
		language: "English",
		csv: {
			languages: ["English"],
			rows: {}
		},
		chapters: [],
		extraRoot: {}
	};
}
function rehydrateStrings(project) {
	const lang = project.language;
	const csv = project.csv;
	for (const ch of project.chapters) {
		if (ch.titleKey) ch.chapterTitle = csvLookup(csv, ch.titleKey, lang) || ch.chapterTitle;
		if (ch.descriptionKey) ch.description = csvLookup(csv, ch.descriptionKey, lang) || ch.description;
		if (ch.preambleKey) ch.preamble = csvLookup(csv, ch.preambleKey, lang) || ch.preamble;
		for (const tk of ch.tasks) {
			if (tk.titleKey) tk.taskTitle = csvLookup(csv, tk.titleKey, lang) || tk.taskTitle;
			if (tk.startMessageKey) tk.startMessage = csvLookup(csv, tk.startMessageKey, lang) || tk.startMessage;
			for (const ac of tk.actions) {
				if (ac.titleKey) ac.actionTitle = csvLookup(csv, ac.titleKey, lang) || ac.actionTitle;
				if (ac.descriptionKey) ac.description = csvLookup(csv, ac.descriptionKey, lang) || ac.description;
			}
		}
	}
}
function applyCsvText(project, csvText, csvName) {
	const incoming = parseCsv(csvText);
	const languages = [...project.csv.languages];
	for (const lang of incoming.languages) if (!languages.includes(lang)) languages.push(lang);
	const rows = { ...project.csv.rows };
	for (const [key, rec] of Object.entries(incoming.rows)) rows[key] = {
		...rows[key] ?? {},
		...rec
	};
	project.csv = {
		languages,
		rows
	};
	if (csvName) project.lastImport = {
		...project.lastImport ?? {
			yamlName: "—",
			csvName,
			chapters: project.chapters.length,
			tasks: 0,
			actions: 0,
			csvKeys: Object.keys(rows).length,
			languages,
			resolved: 0,
			unresolvedKeys: [],
			extraFields: [],
			issues: [],
			durationMs: 0
		},
		csvName,
		csvKeys: Object.keys(rows).length,
		languages
	};
	project.language = project.language && languages.includes(project.language) ? project.language : languages.includes("English") ? "English" : languages[0] ?? "English";
	rehydrateStrings(project);
	return project;
}
var IMPORT_SLOTS = [
	{
		id: "scenario",
		title: "Import scenario",
		hint: "Whole folder — PDA, configs, loca, SharedData/Content/Bundles/ItemIcons, sectors, playfields, prefabs.",
		accept: "",
		directory: true
	},
	{
		id: "configs",
		title: "Import config files",
		hint: "Items, Blocks, Templates, Tokens, Factions, Entities, Containers, LootGroups, Traders, Materials, Status, GlobalDefs, and other .ecf files.",
		accept: ".ecf"
	},
	{
		id: "localization",
		title: "Import Localization.csv",
		hint: "Item / block display names for autocomplete.",
		accept: ".csv"
	},
	{
		id: "itemImages",
		title: "Import item images",
		hint: "SharedData/Content/Bundles/ItemIcons (scenario) or Content/Bundles/ItemIcons (game). CustomIcon names resolve from here.",
		accept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
		directory: true
	},
	{
		id: "pdaImages",
		title: "Import PDA images",
		hint: "Extras/PDA pictures for chapter art and {image.jpg} tags.",
		accept: "image/*,.png,.jpg,.jpeg,.webp,.gif"
	},
	{
		id: "pdaYaml",
		title: "Import PDA.yaml",
		hint: "Chapters, tasks, and actions. Keeps the CSV you already loaded.",
		accept: ".yaml,.yml"
	},
	{
		id: "pdaCsv",
		title: "Import PDA.csv",
		hint: "Resolves txt_ keys without replacing the YAML tree.",
		accept: ".csv"
	},
	{
		id: "dialogues",
		title: "Import Dialogues.ecf",
		hint: "NPC states, options, nexts, and functions.",
		accept: ".ecf"
	},
	{
		id: "dialoguesCsv",
		title: "Import Dialogues.csv",
		hint: "Translated dialogue lines (txt_ keys). Pair with Dialogues.ecf.",
		accept: ".csv"
	},
	{
		id: "factions",
		title: "Import Factions.ecf",
		hint: "Faction names for reputation rewards.",
		accept: ".ecf"
	},
	{
		id: "galaxy",
		title: "Import GalaxyConfig.ecf",
		hint: "Star types, habitable zones, luminosity, star regions, and territories.",
		accept: ".ecf"
	},
	{
		id: "sectors",
		title: "Import Sectors.yaml",
		hint: "Playfield names for PlayfieldEntered and similar checks.",
		accept: ".yaml,.yml"
	},
	{
		id: "playfields",
		title: "Import playfields",
		hint: "Playfields folder (playfield.yaml in each planet/orbit).",
		accept: ".yaml,.yml",
		directory: true
	},
	{
		id: "presets",
		title: "Import random presets",
		hint: "RandomPresets folder. SolarSystemConfig.yaml and SolarSystemConfig_Name.yaml.",
		accept: ".yaml,.yml",
		directory: true
	},
	{
		id: "blueprints",
		title: "Import blueprints",
		hint: "Prefab .epb files — POI names for NearPoi / SpawnDrone.",
		accept: ".epb",
		directory: true
	}
];
var ROLE_FOR_KIND = {
	configs: [
		"items",
		"blocks",
		"templates",
		"eclass",
		"tokens",
		"egroups",
		"reputation",
		"warfare",
		"galaxy",
		"factions",
		"containers",
		"lootgroups",
		"traders",
		"materials",
		"statuseffects",
		"globaldefs",
		"blockgroups",
		"blockshapes",
		"animations",
		"baiconfig",
		"ecf"
	],
	localization: ["localization"],
	itemImages: ["itemPicture"],
	pdaImages: ["picture"],
	pdaYaml: ["pdaYaml"],
	pdaCsv: ["pdaCsv"],
	dialogues: ["dialogues"],
	dialoguesCsv: ["dialoguesCsv"],
	factions: ["factions"],
	galaxy: ["galaxy"],
	sectors: ["sectors"],
	playfields: ["playfieldYaml"],
	presets: ["randomPreset"],
	blueprints: ["poi"]
};
function fileMatchesKind(path, kind) {
	const role = classifyScenarioPath(path, kind);
	if (!role) return false;
	if (kind === "scenario") return true;
	return ROLE_FOR_KIND[kind].includes(role);
}
function areaForRole(role) {
	if (!role || role === "wallpaper") return null;
	if (role === "ecf") return "configs";
	for (const kind of [
		"localization",
		"itemImages",
		"pdaImages",
		"pdaYaml",
		"pdaCsv",
		"dialogues",
		"dialoguesCsv",
		"factions",
		"galaxy",
		"sectors",
		"playfields",
		"presets",
		"blueprints"
	]) if (ROLE_FOR_KIND[kind].includes(role)) return kind;
	if (ROLE_FOR_KIND.configs.includes(role)) return "configs";
	return null;
}
function kindPresent(catalog, kinds) {
	return kinds.some((kind) => catalog.entries.some((e) => e.kind === kind) || (catalog.game ?? []).some((e) => e.kind === kind));
}
function unknownIn(catalog, value, kinds) {
	if (!kinds.length || !kindPresent(catalog, kinds)) return [];
	return splitTokens(value).filter((token) => {
		if (BUILTIN_NAMES.has(token)) return false;
		return !resolveCatalogToken(catalog, token, kinds);
	});
}
function locaNameHits(catalog, value, kinds) {
	if (!kinds.length || !kindPresent(catalog, kinds)) return [];
	return splitTokens(value).flatMap((token) => {
		if (BUILTIN_NAMES.has(token)) return [];
		const hit = resolveCatalogToken(catalog, token, kinds);
		if (!hit || hit.via === "name" || hit.via === "group") return [];
		if (hit.via === "file" && hit.entry.poiGroup) return [{
			token,
			name: hit.entry.poiGroup,
			label: hit.entry.label || token
		}];
		if (hit.via !== "label") return [];
		if (hit.entry.name.toLowerCase() === token.toLowerCase()) return [];
		if (compactToken(hit.entry.name) !== compactToken(token)) return [];
		return [{
			token,
			name: hit.entry.name,
			label: hit.entry.label || token
		}];
	});
}
function nearby(catalog, token, kinds, cache) {
	if (!catalog) return [];
	const key = `${kinds.join(",")}:${token.toLowerCase()}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const names = suggestionsFor(catalog, kinds, token, 4).map((e) => e.name);
	cache.set(key, names);
	return names;
}
function replaceToken(source, from, to) {
	return splitTokens(source).map((part) => part === from ? to : part).join(", ");
}
function looksLikeSection(title) {
	const t = stripBbcode(title).trim();
	return /^\*{2,}/.test(t) || /^\[[^\]]+\]$/.test(t) || /^[-–—]{3,}/.test(t);
}
function pathOf(ch, tk, ac) {
	const parts = [ch.category || "PDA", stripBbcode(ch.chapterTitle) || "Untitled"];
	if (tk) parts.push(stripBbcode(tk.taskTitle) || "Task");
	if (ac) parts.push(stripBbcode(ac.actionTitle) || ac.check || "Action");
	return parts.join(" · ");
}
function tokenFixes(field, source, token, suggestions) {
	const fixes = suggestions.map((name) => ({
		type: "set",
		field,
		value: replaceToken(source, token, name),
		label: `Use ${name}`
	}));
	const next = splitTokens(source).filter((part) => part !== token);
	if (next.length !== splitTokens(source).length) fixes.push({
		type: "set",
		field,
		value: next.join(", "),
		label: `Drop “${token}”`
	});
	else fixes.push({
		type: "clear",
		field,
		label: `Clear ${field}`
	});
	return fixes;
}
function validateProject(project, catalog) {
	const issues = [];
	const suggestCache = /* @__PURE__ */ new Map();
	let n = 0;
	const push = (problem) => {
		n += 1;
		issues.push({
			source: "pda",
			key: `${problem.code}:${problem.id ?? "root"}:${n}`,
			...problem
		});
	};
	if (!project.chapters.length) {
		push({
			id: null,
			kind: "project",
			level: "error",
			code: "empty",
			message: "Add a chapter to start a PDA journey.",
			path: "Project",
			recommend: "review",
			suggestions: [],
			fixes: []
		});
		return issues;
	}
	const seenTitles = /* @__PURE__ */ new Map();
	project.chapters.forEach((ch, ci) => {
		const title = ch.chapterTitle.trim();
		const chPath = pathOf(ch);
		if (!title) push({
			id: ch.id,
			kind: "chapter",
			level: "error",
			code: "empty-title",
			message: `Chapter ${ci + 1} has no title.`,
			path: chPath,
			recommend: "delete",
			field: "chapterTitle",
			suggestions: [],
			fixes: [{
				type: "set",
				field: "chapterTitle",
				value: `Chapter ${ci + 1}`,
				label: "Name it Chapter " + (ci + 1)
			}, {
				type: "delete",
				label: "Delete chapter"
			}]
		});
		const dupKey = `${ch.category}::${stripBbcode(title).toLowerCase()}`;
		if (title && seenTitles.has(dupKey)) push({
			id: ch.id,
			kind: "chapter",
			level: "warning",
			code: "duplicate-title",
			message: `Duplicate chapter title “${stripBbcode(title)}”.`,
			path: chPath,
			recommend: "review",
			field: "chapterTitle",
			value: ch.chapterTitle,
			suggestions: [`${stripBbcode(title)} (copy)`],
			fixes: [{
				type: "set",
				field: "chapterTitle",
				value: `${stripBbcode(title)} (copy)`,
				label: "Rename copy"
			}, {
				type: "delete",
				label: "Delete this copy"
			}]
		});
		else if (title) seenTitles.set(dupKey, ch.id);
		if (!ch.tasks.length) {
			const section = looksLikeSection(ch.chapterTitle) || ch.hideTasks;
			push({
				id: ch.id,
				kind: "chapter",
				level: section ? "warning" : "error",
				code: "empty-chapter",
				message: section ? `“${stripBbcode(ch.chapterTitle) || "Chapter"}” looks like a section header with no tasks.` : `“${stripBbcode(ch.chapterTitle) || "Chapter"}” has no tasks.`,
				path: chPath,
				recommend: section ? "review" : "delete",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete chapter"
				}]
			});
		}
		if (catalogLoaded(catalog) && ch.pictureFile) {
			if (unknownIn(catalog, ch.pictureFile, ["picture"]).length) {
				const suggestions = nearby(catalog, ch.pictureFile, ["picture"], suggestCache);
				push({
					id: ch.id,
					kind: "chapter",
					level: "warning",
					code: "unknown-picture",
					message: `Picture “${ch.pictureFile}” is not in Extras/PDA.`,
					path: chPath,
					recommend: suggestions.length ? "fix" : "review",
					field: "pictureFile",
					value: ch.pictureFile,
					suggestions,
					fixes: [...suggestions.map((name) => ({
						type: "set",
						field: "pictureFile",
						value: name,
						label: `Use ${name}`
					})), {
						type: "clear",
						field: "pictureFile",
						label: "Clear picture"
					}]
				});
			}
		}
		ch.rewards.forEach((reward, ri) => {
			if (!catalogLoaded(catalog)) return;
			if (reward.item) {
				const loca = locaNameHits(catalog, reward.item, [
					"item",
					"token",
					"block"
				]);
				if (loca.length) {
					const hit = loca[0];
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "loca-name",
						message: `Reward “${hit.token}” is the Localization.csv name. Item/block id is ${hit.name}.`,
						path: chPath,
						recommend: "fix",
						field: "rewards",
						value: reward.item,
						suggestions: [hit.name],
						fixes: [{
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								item: hit.name
							} : r),
							label: `Use ${hit.name}`
						}]
					});
				} else if (unknownIn(catalog, reward.item, [
					"item",
					"token",
					"block"
				]).length) {
					const suggestions = nearby(catalog, reward.item, [
						"item",
						"token",
						"block"
					], suggestCache);
					const next = ch.rewards.filter((_, i) => i !== ri);
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "unknown-reward",
						message: `Reward “${reward.item}” is not in the loaded scenario items.`,
						path: chPath,
						recommend: suggestions.length ? "fix" : "delete",
						field: "rewards",
						value: reward.item,
						suggestions,
						fixes: [...suggestions.slice(0, 3).map((name) => ({
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								item: name
							} : r),
							label: `Use ${name}`
						})), {
							type: "rewards",
							rewards: next,
							label: `Remove reward ${reward.item}`
						}]
					});
				}
			}
			if (reward.faction) {
				const locaFaction = locaNameHits(catalog, reward.faction, ["faction"]);
				if (locaFaction.length) {
					const hit = locaFaction[0];
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "loca-name",
						message: `Faction “${hit.token}” is the Localization.csv name. Config name is ${hit.name}.`,
						path: chPath,
						recommend: "fix",
						value: reward.faction,
						suggestions: [hit.name],
						fixes: [{
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								faction: hit.name
							} : r),
							label: `Use ${hit.name}`
						}]
					});
				} else if (unknownIn(catalog, reward.faction, ["faction"]).length) {
					const suggestions = nearby(catalog, reward.faction, ["faction"], suggestCache);
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "unknown-faction",
						message: `Faction “${reward.faction}” is not in Factions.ecf.`,
						path: chPath,
						recommend: suggestions.length ? "fix" : "review",
						value: reward.faction,
						suggestions,
						fixes: suggestions.slice(0, 3).map((name) => ({
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								faction: name
							} : r),
							label: `Use ${name}`
						}))
					});
				}
			}
		});
		ch.tasks.forEach((tk, ti) => {
			const tkPath = pathOf(ch, tk);
			const visTitle = stripBbcode(tk.taskTitle);
			if (!tk.taskTitle.trim()) push({
				id: tk.id,
				kind: "task",
				level: "error",
				code: "empty-title",
				message: `Task ${ti + 1} in “${stripBbcode(ch.chapterTitle)}” has no title.`,
				path: tkPath,
				recommend: "delete",
				field: "taskTitle",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete task"
				}]
			});
			if (visTitle.length > 26) {
				const short = visTitle.slice(0, 26).trim();
				const hasBb = /\[[^\]]+\]/.test(tk.taskTitle);
				push({
					id: tk.id,
					kind: "task",
					level: "warning",
					code: "hud-wrap",
					message: `“${visTitle}” is ${visTitle.length} chars. HUD wraps after 26.`,
					path: tkPath,
					recommend: "fix",
					field: "taskTitle",
					value: tk.taskTitle,
					suggestions: hasBb ? [] : [short],
					fixes: hasBb ? [] : [{
						type: "set",
						field: "taskTitle",
						value: short,
						label: `Shorten to “${short}”`
					}]
				});
			}
			if (!tk.actions.length) push({
				id: tk.id,
				kind: "task",
				level: "error",
				code: "empty-task",
				message: `Task “${visTitle || "untitled"}” has no actions.`,
				path: tkPath,
				recommend: "delete",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete task"
				}]
			});
			if (catalogLoaded(catalog) && tk.pictureFile) {
				if (unknownIn(catalog, tk.pictureFile, ["picture"]).length) {
					const suggestions = nearby(catalog, tk.pictureFile, ["picture"], suggestCache);
					push({
						id: tk.id,
						kind: "task",
						level: "warning",
						code: "unknown-picture",
						message: `Picture “${tk.pictureFile}” is not in Extras/PDA.`,
						path: tkPath,
						recommend: suggestions.length ? "fix" : "review",
						field: "pictureFile",
						value: tk.pictureFile,
						suggestions,
						fixes: [...suggestions.map((name) => ({
							type: "set",
							field: "pictureFile",
							value: name,
							label: `Use ${name}`
						})), {
							type: "clear",
							field: "pictureFile",
							label: "Clear picture"
						}]
					});
				}
			}
			tk.actions.forEach((ac) => {
				const acPath = pathOf(ch, tk, ac);
				const visAction = stripBbcode(ac.actionTitle);
				if (!ac.actionTitle.trim()) push({
					id: ac.id,
					kind: "action",
					level: "error",
					code: "empty-title",
					message: `An action under “${visTitle}” has no title.`,
					path: acPath,
					recommend: "delete",
					field: "actionTitle",
					suggestions: [],
					fixes: [{
						type: "delete",
						label: "Delete action"
					}]
				});
				if (visAction.length > 24) {
					const short = visAction.slice(0, 24).trim();
					const hasBb = /\[[^\]]+\]/.test(ac.actionTitle);
					push({
						id: ac.id,
						kind: "action",
						level: "warning",
						code: "hud-wrap",
						message: `“${visAction}” is ${visAction.length} chars. HUD wraps after 24.`,
						path: acPath,
						recommend: "fix",
						field: "actionTitle",
						value: ac.actionTitle,
						suggestions: hasBb ? [] : [short],
						fixes: hasBb ? [] : [{
							type: "set",
							field: "actionTitle",
							value: short,
							label: `Shorten to “${short}”`
						}]
					});
				}
				if (ac.check) {
					if (CHECKS.find((c) => c.id === ac.check)?.hint.includes("Names") && !ac.names.trim() && ac.check !== "ItemsUnlocked") push({
						id: ac.id,
						kind: "action",
						level: "warning",
						code: "missing-names",
						message: `“${visAction}” (${ac.check}) usually needs Names.`,
						path: acPath,
						recommend: "review",
						field: "names",
						suggestions: [],
						fixes: [{
							type: "delete",
							label: "Delete action"
						}]
					});
				}
				if (catalogLoaded(catalog) && ac.check === "NearUnit") {
					const tokens = splitTokens(ac.names);
					const poiToken = tokens[0];
					const unitKinds = [
						"poi",
						"block",
						"entity"
					];
					if (poiToken && tokens.length >= 2) {
						for (const hit of locaNameHits(catalog, poiToken, unitKinds)) push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "loca-name",
							message: `“${hit.token}” is a display name. NearUnit needs ${hit.name}.`,
							path: acPath,
							recommend: "fix",
							field: "names",
							value: hit.token,
							suggestions: [hit.name],
							fixes: tokenFixes("names", ac.names, hit.token, [hit.name])
						});
						for (const token of unknownIn(catalog, poiToken, unitKinds)) {
							const suggestions = nearby(catalog, token, unitKinds, suggestCache);
							push({
								id: ac.id,
								kind: "action",
								level: "warning",
								code: "unknown-name",
								message: `NearUnit’s first name “${token}” is not a POI, block, or entity. Empyrion matches that slot to a blueprint or a device such as a container. The name after it is the control-panel label and is not checked.`,
								path: acPath,
								recommend: suggestions.length ? "fix" : "review",
								field: "names",
								value: token,
								suggestions,
								fixes: tokenFixes("names", ac.names, token, suggestions)
							});
						}
					} else if (poiToken) {
						const kinds = [
							"poi",
							"entity",
							"block"
						];
						for (const hit of locaNameHits(catalog, poiToken, kinds)) push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "loca-name",
							message: `“${hit.token}” is a display or file name. NearUnit needs ${hit.name}.`,
							path: acPath,
							recommend: "fix",
							field: "names",
							value: hit.token,
							suggestions: [hit.name],
							fixes: tokenFixes("names", ac.names, hit.token, [hit.name])
						});
						for (const token of unknownIn(catalog, poiToken, kinds)) {
							const suggestions = nearby(catalog, token, kinds, suggestCache);
							push({
								id: ac.id,
								kind: "action",
								level: "warning",
								code: "unknown-name",
								message: `“${token}” is not a known POI, entity, or block. Empyrion still accepts a device name set in the blueprint control panel.`,
								path: acPath,
								recommend: "review",
								field: "names",
								value: token,
								suggestions,
								fixes: tokenFixes("names", ac.names, token, suggestions)
							});
						}
					}
				} else if (catalogLoaded(catalog)) {
					const nameKinds = CHECK_NAME_KINDS[ac.check] ?? [];
					const typeKinds = CHECK_TYPE_KINDS[ac.check] ?? [];
					for (const hit of locaNameHits(catalog, ac.names, nameKinds).slice(0, 4)) push({
						id: ac.id,
						kind: "action",
						level: "warning",
						code: "loca-name",
						message: `“${hit.token}” is the Localization.csv or Prefab file name. ${ac.check} needs ${hit.name}.`,
						path: acPath,
						recommend: "fix",
						field: "names",
						value: hit.token,
						suggestions: [hit.name],
						fixes: tokenFixes("names", ac.names, hit.token, [hit.name])
					});
					for (const token of unknownIn(catalog, ac.names, nameKinds).slice(0, 4)) {
						const suggestions = nearby(catalog, token, nameKinds, suggestCache);
						push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "unknown-name",
							message: `“${token}” is not in the loaded scenario (${ac.check} Names).`,
							path: acPath,
							recommend: suggestions.length ? "fix" : "delete",
							field: "names",
							value: token,
							suggestions,
							fixes: [...tokenFixes("names", ac.names, token, suggestions), {
								type: "delete",
								label: "Delete action"
							}]
						});
					}
					for (const token of unknownIn(catalog, ac.types, typeKinds).slice(0, 3)) {
						const suggestions = nearby(catalog, token, typeKinds, suggestCache);
						push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "unknown-type",
							message: `“${token}” is not in the loaded scenario (${ac.check} Types).`,
							path: acPath,
							recommend: suggestions.length ? "fix" : "delete",
							field: "types",
							value: token,
							suggestions,
							fixes: [...tokenFixes("types", ac.types, token, suggestions), {
								type: "delete",
								label: "Delete action"
							}]
						});
					}
				}
			});
		});
	});
	return issues;
}
function counts(project) {
	const tasks = project.chapters.reduce((n, c) => n + c.tasks.length, 0);
	const actions = project.chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0);
	return {
		chapters: project.chapters.length,
		tasks,
		actions
	};
}
function problemStats(issues) {
	return {
		total: issues.length,
		errors: issues.filter((i) => i.level === "error").length,
		warnings: issues.filter((i) => i.level === "warning").length,
		deletable: issues.filter((i) => i.recommend === "delete" && i.id).length
	};
}
var WARFARE_STATS = [
	"Faction",
	"ScenarioGroup",
	"Lvl1MinPrice",
	"Lvl1MaxPrice",
	"Lvl5MinPrice",
	"Lvl5MaxPrice",
	"Lvl10MinPrice",
	"Lvl10MaxPrice",
	"SDScenarioGroup",
	"SDProbabilityMin",
	"SDProbabilityMax",
	"SDPriceMin",
	"SDPriceMax"
];
var GALAXY_GENERAL_STATS = [
	"StarCount",
	"Radius",
	"NebulaCount",
	"NebulaColors1",
	"NebulaColors2",
	"NebulaColors3",
	"StarterSystemLYCoord",
	"StarterSystemName",
	"StarterSystemStarClass",
	"GalaxyMode",
	"SectorsPerLY"
];
var TERRITORY_STATS = [
	"Faction",
	"Center",
	"Radius"
];
function statsFor(role) {
	return configMeta(role)?.stats ?? [];
}
function objectLabel(obj) {
	if (obj.id && /^\d+$/.test(obj.id.trim()) && obj.name) return obj.name;
	if (obj.name) return obj.name;
	if (obj.id) return `#${obj.id}`;
	return obj.kind || "entry";
}
function objectKey(obj, index) {
	return `${obj.kind}:${obj.id ?? ""}:${obj.name}:${index}`;
}
var ENTITY_CLASS_KEYS = [
	"EntityType",
	"Class",
	"Parent",
	"Faction",
	"Ref"
];
function entityByName(objects) {
	const map = /* @__PURE__ */ new Map();
	for (const obj of objects) if (obj.name) map.set(obj.name.toLowerCase(), obj);
	return map;
}
function resolvedField(obj, key, byName, seen) {
	const own = (obj.fields[key] ?? "").trim();
	if (own) return own;
	const ref = (obj.fields.Ref ?? "").trim();
	if (!ref) return "";
	const walk = seen ?? /* @__PURE__ */ new Set();
	const id = (obj.name || "").toLowerCase();
	if (id) {
		if (walk.has(id)) return "";
		walk.add(id);
	}
	const parent = byName.get(ref.toLowerCase());
	if (!parent || parent === obj) return "";
	return resolvedField(parent, key, byName, walk);
}
function classFieldValue(obj, key, byName) {
	if (key === "Ref") return (obj.fields.Ref ?? "").trim();
	return resolvedField(obj, key, byName);
}
function fieldIndex(objects, key, byName) {
	const map = byName ?? entityByName(objects);
	const set = /* @__PURE__ */ new Set();
	for (const obj of objects) {
		const value = classFieldValue(obj, key, map);
		if (value) set.add(value);
	}
	return [...set].sort((a, b) => a.localeCompare(b));
}
function matchesClassFilter(obj, filters, byName) {
	for (const key of ENTITY_CLASS_KEYS) {
		const wanted = filters[key];
		if (!wanted || wanted === "all") continue;
		const got = classFieldValue(obj, key, byName);
		if (wanted === "__none") {
			if (got) return false;
		} else if (got !== wanted) return false;
	}
	return true;
}
function entityGroupKey(obj, byName) {
	return resolvedField(obj, "EntityType", byName) || resolvedField(obj, "Parent", byName) || "Unclassified";
}
function entityClassLine(obj, byName) {
	const type = resolvedField(obj, "EntityType", byName);
	const faction = resolvedField(obj, "Faction", byName);
	const klass = resolvedField(obj, "Class", byName);
	return [type, faction || klass].filter(Boolean).join(" · ");
}
function groupByEntityType(objects, byName) {
	const groups = /* @__PURE__ */ new Map();
	for (const obj of objects) {
		const key = entityGroupKey(obj, byName);
		const rows = groups.get(key);
		if (rows) rows.push(obj);
		else groups.set(key, [obj]);
	}
	return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, rows]) => ({
		key,
		rows
	}));
}
function numericIds(objects) {
	return objects.map((obj) => Number(obj.id)).filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
}
function isNumericConfigId(id) {
	return Boolean(id && /^\d+$/.test(id.trim()) && Number(id) > 0);
}
/** Empyrion treats +Item/+Block Name (and Item/Block Name) as the ID when no numeric Id is set. */
function entryIdentity(obj) {
	if (isNumericConfigId(obj.id)) return {
		kind: "numeric",
		label: obj.id.trim()
	};
	const name = (obj.name || "unnamed").trim();
	return {
		kind: "floating",
		label: `${obj.plus ? "+" : ""}${name}`
	};
}
var blockIdentity = entryIdentity;
function floatingEntries(objects) {
	return objects.filter((obj) => entryIdentity(obj).kind === "floating" && obj.name);
}
var floatingBlocks = floatingEntries;
function unusedNumericIds(used, opts) {
	const pad = opts?.pad ?? 16;
	const limit = opts?.limit ?? 60;
	const set = new Set(used.filter((n) => Number.isInteger(n) && n > 0));
	const max = set.size ? Math.max(...set) : 0;
	const end = Math.max(max + pad, pad);
	const ids = [];
	const ranges = [];
	let run = null;
	let total = 0;
	for (let i = 1; i <= end; i++) {
		if (set.has(i)) {
			if (run != null) {
				ranges.push({
					from: run,
					to: i - 1,
					count: i - run
				});
				run = null;
			}
			continue;
		}
		total += 1;
		if (ids.length < limit) ids.push(i);
		if (run == null) run = i;
	}
	if (run != null) ranges.push({
		from: run,
		to: end,
		count: end - run + 1
	});
	return {
		ids,
		ranges,
		total,
		next: max + 1 || 1
	};
}
function templateInputs(obj) {
	const child = obj.children?.find((c) => /input/i.test(c.name)) ?? obj.children?.[0];
	if (!child) return [];
	return Object.entries(child.fields).map(([name, count]) => ({
		name,
		count
	}));
}
function withTemplateInputs(obj, rows) {
	const fields = {};
	for (const row of rows) {
		const name = row.name.trim();
		if (!name) continue;
		fields[name] = row.count.trim() || "1";
	}
	const inputs = {
		kind: "Child",
		plus: false,
		name: "Inputs",
		fields
	};
	const rest = (obj.children ?? []).filter((c) => !/input/i.test(c.name));
	return {
		...obj,
		children: [inputs, ...rest]
	};
}
function numericValue(value) {
	if (value == null || value === "") return null;
	const n = Number(String(value).replace(/[^0-9.+-eE]/g, ""));
	return Number.isFinite(n) ? n : null;
}
function compareObjects(left, right, prefer) {
	return [.../* @__PURE__ */ new Set([
		...prefer,
		...Object.keys(left.fields),
		...Object.keys(right.fields)
	])].filter((k) => k !== "Label").map((key) => {
		const a = left.fields[key] ?? "";
		const b = right.fields[key] ?? "";
		const na = numericValue(a);
		const nb = numericValue(b);
		return {
			key,
			left: a,
			right: b,
			delta: na != null && nb != null ? nb - na : null
		};
	});
}
function similarBlocks(all, block) {
	const cat = block.fields.Category;
	const group = block.fields.Group;
	return all.filter((other) => {
		if (other.name === block.name) return false;
		if (cat && other.fields.Category === cat) return true;
		if (group && other.fields.Group === group) return true;
		return false;
	});
}
var OPTION = /^Option_(\d+)$/;
var OPTION_NEXT = /^OptionNext_(\d+)$/;
var OPTION_IF = /^OptionIf_(\d+)$/;
var OPTION_EX = /^OptionExecute_(\d+)$/;
var NEXT = /^Next_(\d+)$/;
var NEXT_IF = /^NextIf_(\d+)$/;
var EXECUTE = /^Execute_(\d+)$/;
var VARIABLE = /^Variable_(\d+)$/;
var VAR_TYPES = [
	"int",
	"dbstate_int",
	"dbplayer_int",
	"dbglobal_int",
	"dbglobalpf_int",
	"dbplayerpoi_int",
	"dbplayerpf_int",
	"dbplayerpfpoi_int",
	"dbglobalpoi_int",
	"dbstate_string",
	"dbplayer_string",
	"dbglobal_string",
	"dbglobalpoi_string"
];
var SNIPPETS = [
	{
		label: "End",
		insert: "End"
	},
	{
		label: "AddItem",
		insert: "AddItem('GoldCoins', 1)"
	},
	{
		label: "RemoveItem",
		insert: "RemoveItem('GoldCoins', 1)"
	},
	{
		label: "HasItem",
		insert: "HasItem('GoldCoins', 1)"
	},
	{
		label: "GetReputation",
		insert: "GetReputation(Faction.Talon) < Reputation.FriendlyMin"
	},
	{
		label: "AddReputation",
		insert: "AddReputation(Faction.Talon, 10)"
	},
	{
		label: "OpenTraderWindow",
		insert: "OpenTraderWindow()"
	},
	{
		label: "IsPdaChapterActive",
		insert: "IsPdaChapterActive('ChapterTitle')"
	},
	{
		label: "IsPdaTaskActive",
		insert: "IsPdaTaskActive('TaskTitle')"
	},
	{
		label: "SetNPCName",
		insert: "SetNPCName('Name')"
	},
	{
		label: "SetSignal",
		insert: "SetSignal('SignalName', true)"
	},
	{
		label: "IsSignalSet",
		insert: "IsSignalSet('SignalName')"
	},
	{
		label: "OpenHtmlWindow",
		insert: "OpenHtmlWindow('https://')"
	},
	{
		label: "AddItemsFromContainer",
		insert: "AddItemsFromContainer('ContainerName')"
	},
	{
		label: "UnlockTechTreeItem",
		insert: "UnlockTechTreeItem('ItemName')"
	},
	{
		label: "CallLater",
		insert: "CallLater(5, FunctionName)"
	},
	{
		label: "GotoAndReset",
		insert: "GotoAndReset:State_Init"
	},
	{
		label: "{PlayerName}",
		insert: "{PlayerName}"
	},
	{
		label: "{NPCName}",
		insert: "{NPCName}"
	}
];
function parseVariableValue(value) {
	const match = value.match(/^"?([^,"]+)"?\s*,?\s*(?:param1:\s*(.+))?$/i);
	if (!match) return {
		name: value.replace(/"/g, "").trim(),
		param1: ""
	};
	return {
		name: (match[1] ?? "").trim(),
		param1: (match[2] ?? "").trim()
	};
}
function objectToDialogue(obj) {
	const fields = { ...obj.fields };
	const npcName = fields.NPCName ?? "";
	const output = fields.Output ?? "";
	const comment = fields.Comment ?? "";
	const barkingState = fields.BarkingState ?? "";
	const requiredStates = fields.RequiredStates ?? "";
	delete fields.NPCName;
	delete fields.Output;
	delete fields.Comment;
	delete fields.BarkingState;
	delete fields.RequiredStates;
	const optionIdx = /* @__PURE__ */ new Set();
	const nextIdx = /* @__PURE__ */ new Set();
	const varIdx = /* @__PURE__ */ new Set();
	for (const key of Object.keys(fields)) {
		const o = key.match(OPTION) || key.match(OPTION_NEXT) || key.match(OPTION_IF) || key.match(OPTION_EX);
		if (o) optionIdx.add(Number(o[1]));
		const n = key.match(NEXT) || key.match(NEXT_IF);
		if (n) nextIdx.add(Number(n[1]));
		const e = key.match(EXECUTE);
		if (e) nextIdx.add(Number(e[1]));
		const v = key.match(VARIABLE);
		if (v) varIdx.add(Number(v[1]));
	}
	const variables = [...varIdx].sort((a, b) => a - b).map((index) => {
		const parsed = parseVariableValue(fields[`Variable_${index}`] ?? "");
		delete fields[`Variable_${index}`];
		return {
			index,
			name: parsed.name,
			param1: parsed.param1
		};
	});
	const options = [...optionIdx].sort((a, b) => a - b).map((index) => {
		const text = fields[`Option_${index}`] ?? "";
		const next = fields[`OptionNext_${index}`] ?? "";
		const iff = fields[`OptionIf_${index}`] ?? "";
		const execute = fields[`OptionExecute_${index}`] ?? "";
		delete fields[`Option_${index}`];
		delete fields[`OptionNext_${index}`];
		delete fields[`OptionIf_${index}`];
		delete fields[`OptionExecute_${index}`];
		return {
			index,
			text,
			next,
			iff,
			execute
		};
	});
	const nexts = [...nextIdx].sort((a, b) => a - b).map((index) => {
		const next = fields[`Next_${index}`] ?? "";
		const iff = fields[`NextIf_${index}`] ?? "";
		const execute = fields[`Execute_${index}`] ?? "";
		delete fields[`Next_${index}`];
		delete fields[`NextIf_${index}`];
		delete fields[`Execute_${index}`];
		return {
			index,
			next,
			iff,
			execute
		};
	});
	return {
		name: obj.name,
		npcName,
		output,
		comment,
		barkingState,
		requiredStates,
		variables,
		fields,
		options,
		nexts
	};
}
function quoteEcf(value) {
	if (value === "") return "\"\"";
	if (/[\s,#:]/.test(value) || /[()"']/.test(value)) return `"${value.replace(/"/g, "\\\"")}"`;
	return value;
}
function serializeDialogues(states) {
	return states.map((state) => {
		const lines = [`{ +Dialogue Name: ${quoteEcf(state.name)}`];
		if (state.npcName) lines.push(`  NPCName: ${quoteEcf(state.npcName)}`);
		if (state.comment) lines.push(`  Comment: ${quoteEcf(state.comment)}`);
		if (state.barkingState) lines.push(`  BarkingState: ${state.barkingState}`);
		if (state.requiredStates) lines.push(`  RequiredStates: ${quoteEcf(state.requiredStates)}`);
		for (const variable of state.variables) {
			if (!variable.name) continue;
			const param = variable.param1 ? `, param1: ${variable.param1}` : "";
			lines.push(`  Variable_${variable.index}: "${variable.name}"${param}`);
		}
		if (state.output) lines.push(`  Output: ${quoteEcf(state.output)}`);
		for (const n of state.nexts) {
			if (n.next) lines.push(`  Next_${n.index}: ${n.next}`);
			if (n.iff) lines.push(`  NextIf_${n.index}: ${quoteEcf(n.iff)}`);
			if (n.execute) lines.push(emitCode(`Execute_${n.index}`, n.execute));
		}
		for (const opt of state.options) {
			if (opt.text) lines.push(`  Option_${opt.index}: ${quoteEcf(opt.text)}`);
			if (opt.next) lines.push(`  OptionNext_${opt.index}: ${opt.next}`);
			if (opt.iff) lines.push(`  OptionIf_${opt.index}: ${quoteEcf(opt.iff)}`);
			if (opt.execute) lines.push(emitCode(`OptionExecute_${opt.index}`, opt.execute));
		}
		for (const [key, value] of Object.entries(state.fields)) if (value) lines.push(`  ${key}: ${quoteEcf(value)}`);
		lines.push("}");
		return lines.join("\n");
	}).join("\n") + "\n";
}
function dialogueGroup(state) {
	const cut = state.name.indexOf("_");
	if (cut > 0) return state.name.slice(0, cut);
	if (state.npcName.trim()) return state.npcName.trim();
	return "Ungrouped";
}
function looksLikeKey(value) {
	const v = value.trim();
	if (!v || /\s/.test(v) || v.length < 3) return false;
	return /^(txt_|dlg|dialogue_|ch_|task_|opt_)/i.test(v) || /^[A-Za-z][A-Za-z0-9_]*$/.test(v);
}
function collectDialogueKeys(doc) {
	const keys = /* @__PURE__ */ new Set();
	const add = (value) => {
		const v = value?.trim() ?? "";
		if (/^(txt_|dlg_|dialogue_|opt_|ch_|task_)/i.test(v) && !/\s/.test(v)) keys.add(v);
	};
	for (const state of doc.states) {
		add(state.output);
		add(state.npcName);
		add(state.comment);
		for (const opt of state.options) add(opt.text);
	}
	return [...keys];
}
function resolveDialogueText(value, loca, pda, language = "English") {
	if (!value) return "";
	if (!looksLikeKey(value)) return value;
	return loca && csvLookup(loca, value, language) || pda && csvLookup(pda, value, language) || value;
}
function blankDialogue(name = "NewDialogue") {
	return {
		name,
		npcName: "",
		output: "Hello.",
		comment: "",
		barkingState: "",
		requiredStates: "",
		variables: [],
		fields: {},
		options: [{
			index: 1,
			text: "Goodbye",
			next: "End",
			iff: "",
			execute: ""
		}],
		nexts: []
	};
}
function emitCode(key, value) {
	return `  ${key}: <![CDATA[${value}]]>`;
}
function parseDialogueDoc(text) {
	const objects = parseEcfObjects(text);
	return {
		states: objects.filter((obj) => /dialogue/i.test(obj.kind) && obj.name).map(objectToDialogue),
		functions: objects.filter((obj) => /function/i.test(obj.kind) && obj.name).map((obj) => ({
			name: obj.name,
			execute: obj.fields.Execute || obj.fields.Code || "",
			comment: obj.fields.Comment || ""
		}))
	};
}
function serializeDialogueDoc(doc) {
	const fns = doc.functions.filter((fn) => fn.name).map((fn) => {
		const lines = [`{ +Function Name: ${quoteEcf(fn.name)}`];
		if (fn.comment) lines.push(`  Comment: ${quoteEcf(fn.comment)}`);
		if (fn.execute) lines.push(emitCode("Execute", fn.execute));
		lines.push("}");
		return lines.join("\n");
	});
	return `${serializeDialogues(doc.states)}${fns.length ? fns.join("\n") + "\n" : ""}`;
}
function reindex(rows) {
	return rows.map((row, i) => ({
		...row,
		index: i + 1
	}));
}
function isGotoReset(next) {
	return /^GotoAndReset:/i.test(next.trim());
}
function gotoTarget(next) {
	return next.trim().replace(/^GotoAndReset:/i, "");
}
function setGoto(next, on) {
	const target = gotoTarget(next) || "State_Init";
	return on ? `GotoAndReset:${target}` : target;
}
function blankFunction(name = "NewFunction") {
	return {
		name,
		execute: "",
		comment: ""
	};
}
function uniqueDialogueName(states, base) {
	if (!states.some((s) => s.name === base)) return base;
	let n = 2;
	while (states.some((s) => s.name === `${base}_${n}`)) n += 1;
	return `${base}_${n}`;
}
function rewriteNext(value, map) {
	if (!value) return value;
	if (isGotoReset(value)) {
		const t = gotoTarget(value);
		return `GotoAndReset:${map.get(t) ?? t}`;
	}
	return map.get(value) ?? value;
}
function mergeForeignDialogues(base, extra, prefix, selected) {
	const pick = extra.states.filter((s) => selected.includes(s.name));
	const map = /* @__PURE__ */ new Map();
	const used = new Set(base.states.map((s) => s.name));
	for (const state of pick) {
		const name = uniqueDialogueName([...base.states, ...[...map.values()].map((n) => ({ name: n }))], `${prefix}${state.name}`);
		map.set(state.name, name);
		used.add(name);
	}
	const states = pick.map((state) => ({
		...structuredClone(state),
		name: map.get(state.name) || state.name,
		barkingState: state.barkingState ? map.get(state.barkingState) ?? state.barkingState : "",
		options: state.options.map((o) => ({
			...o,
			next: rewriteNext(o.next, map)
		})),
		nexts: state.nexts.map((n) => ({
			...n,
			next: rewriteNext(n.next, map)
		}))
	}));
	const fnNames = new Set(base.functions.map((f) => f.name));
	const mergedFns = extra.functions.map((fn) => {
		let name = `${prefix}${fn.name}`;
		let n = 2;
		while (fnNames.has(name)) {
			name = `${prefix}${fn.name}_${n}`;
			n += 1;
		}
		fnNames.add(name);
		return {
			...fn,
			name
		};
	});
	return {
		states: [...base.states, ...states],
		functions: [...base.functions, ...mergedFns]
	};
}
function catalogText(catalog, role) {
	const hits = (catalog.texts ?? []).filter((t) => t.role === role && t.text);
	if (!hits.length) return void 0;
	return hits.reduce((best, cur) => cur.text.length >= best.text.length ? cur : best);
}
var parsedByRole = /* @__PURE__ */ new Map();
function objectsFor(catalog, role) {
	const hits = (catalog.texts ?? []).filter((t) => t.role === role && t.text);
	if (hits.length) {
		const sig = hits.map((t) => `${t.path}:${t.text.length}`).join("|");
		const hit = parsedByRole.get(role);
		if (hit && hit.text === sig) return hit.objects;
		const objects = hits.flatMap((t) => parseEcfObjects(t.text));
		parsedByRole.set(role, {
			text: sig,
			objects
		});
		return objects;
	}
	const meta = configMeta(role);
	const kind = meta?.catalogKind || meta?.kind.toLowerCase() || "item";
	return catalog.entries.filter((e) => e.kind === kind).map((e) => ({
		kind: meta?.kind || kind,
		plus: Boolean(meta?.plus),
		name: e.name,
		fields: e.label ? { Label: e.label } : {}
	}));
}
var locaByText = /* @__PURE__ */ new Map();
function localizationTable(catalog) {
	const text = catalogText(catalog, "localization")?.text;
	if (!text) return {
		languages: ["English"],
		rows: {}
	};
	const hit = locaByText.get(text);
	if (hit) return hit;
	const table = parseCsv(text);
	locaByText.set(text, table);
	if (locaByText.size > 3) locaByText.delete(locaByText.keys().next().value);
	return table;
}
function dialogueStrings(catalog) {
	return dialogueCsvTable(catalog);
}
function dialogueCsvTable(catalog, doc) {
	const storedText = catalogText(catalog, "dialoguesCsv")?.text;
	const stored = storedText ? parseCsv(storedText) : {
		languages: [],
		rows: {}
	};
	const loca = localizationTable(catalog);
	const keys = collectDialogueKeys(doc ?? dialogueDocFor(catalog));
	const languages = [.../* @__PURE__ */ new Set([
		...stored.languages,
		...loca.languages,
		"English"
	])].filter(Boolean);
	const rows = { ...stored.rows };
	for (const key of keys) {
		if (rows[key]) continue;
		if (loca.rows[key]) rows[key] = { ...loca.rows[key] };
		else {
			const rec = {};
			for (const lang of languages) rec[lang] = "";
			rows[key] = rec;
		}
	}
	return {
		languages: languages.length ? languages : ["English"],
		rows
	};
}
function writeDialoguesCsv(catalog, doc) {
	return stringifyCsv(dialogueCsvTable(catalog, doc));
}
function dialogueDocFor(catalog) {
	const text = catalogText(catalog, "dialogues")?.text;
	if (text) return parseDialogueDoc(text);
	return {
		states: catalog.entries.filter((e) => e.kind === "dialogue").map((e) => ({
			name: e.name,
			npcName: "",
			output: "",
			comment: "",
			barkingState: "",
			requiredStates: "",
			variables: [],
			fields: {},
			options: [],
			nexts: []
		})),
		functions: []
	};
}
function writeDialogues(doc) {
	if (Array.isArray(doc)) return serializeDialogueDoc({
		states: doc,
		functions: []
	});
	return serializeDialogueDoc(doc);
}
function writeLocalization(table) {
	return stringifyCsv(table);
}
function locaLabel(table, name, language = "English") {
	const keys = [
		name,
		`Items_${name}`,
		`item_${name}`,
		`Block_${name}`,
		`Token_${name}`
	];
	for (const key of keys) {
		const rec = table.rows[key];
		if (!rec) continue;
		const value = rec[language] || rec.English || Object.values(rec).find(Boolean);
		if (value) return value;
	}
	return "";
}
var STAR_ZONES = [
	{
		key: "InnerSystem",
		label: "Inner",
		hint: "Lava / very hot",
		color: "#ea580c"
	},
	{
		key: "HabitableHot",
		label: "Hot",
		hint: "Arid / desert",
		color: "#fb7185"
	},
	{
		key: "HabitableTemperate",
		label: "Temperate",
		hint: "Earth-like generation",
		color: "#4ade80"
	},
	{
		key: "HabitableCold",
		label: "Cold",
		hint: "Snow / cold desert",
		color: "#22d3ee"
	},
	{
		key: "OuterSystem",
		label: "Outer",
		hint: "Barren / gas giants",
		color: "#60a5fa"
	}
];
var STAR_STATS = [
	"StarClass",
	"Model",
	"Probability",
	"SizeClass",
	"Color",
	"LightColor",
	"SurfaceTemperature",
	"Mass",
	"Radius",
	"Luminosity",
	"ColorName",
	"Age",
	"InnerSystem",
	"HabitableHot",
	"HabitableTemperate",
	"HabitableCold",
	"OuterSystem",
	"HabitableZone",
	"GalaxySpawnRadius",
	"GalaxySpawnAmount",
	"ClusterProb",
	"ClusterRange",
	"Description"
];
var STAR_REGION_STATS = [
	"Name",
	"Shape",
	"RadiusMinMax",
	"TotalSpawnCount",
	"UseDefaultStarDef",
	"Position",
	"FlattenFac"
];
var STAR_MODELS = [
	"SunBlueGiant",
	"SunWhiteDwarf",
	"SunYellowWhite",
	"SunYellow",
	"SunRedGiant",
	"SunRedDwarf",
	"SunNeutron",
	"SunGeneric",
	"BlackHole"
];
function fieldToHex(value) {
	if (!value) return "#fbbf24";
	if (/^#([0-9a-f]{6})$/i.test(value.trim())) return value.trim();
	const nums = value.split(",").map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
	if (nums.length < 3) return "#fbbf24";
	const to = (n) => Math.round(Math.max(0, Math.min(1, n > 1 ? n / 255 : n)) * 255);
	return `#${[
		nums[0],
		nums[1],
		nums[2]
	].map((n) => to(n).toString(16).padStart(2, "0")).join("")}`;
}
function hexToField(hex) {
	const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
	if (!m) return hex;
	const n = parseInt(m[1], 16);
	const r = (n >> 16 & 255) / 255;
	const g = (n >> 8 & 255) / 255;
	const b = (n & 255) / 255;
	const f = (x) => (Math.round(x * 1e3) / 1e3).toString();
	return `${f(r)},${f(g)},${f(b)}`;
}
function parseStarMix(fields) {
	return Object.entries(fields).filter(([key]) => /^StarClass_\d+$/i.test(key)).map(([key, value]) => {
		const index = Number(key.split("_")[1]) || 0;
		const match = value.match(/^([^,]+)(?:\s*,\s*param1:\s*"?([^"]*)"?)?/);
		const param = match?.[2] ?? "";
		const grab = (name) => param.match(new RegExp(`${name}=([^,]+)`, "i"))?.[1]?.trim() ?? "";
		return {
			index,
			starClass: (match?.[1] || value).trim(),
			spawnAmount: grab("SpawnAmount"),
			prob: grab("Prob"),
			clusterProb: grab("ClusterProb"),
			clusterRange: grab("ClusterRange")
		};
	}).sort((a, b) => a.index - b.index);
}
function writeStarMix(fields, mix) {
	const next = {};
	for (const [key, value] of Object.entries(fields)) if (!/^StarClass_\d+$/i.test(key)) next[key] = value;
	mix.forEach((row, i) => {
		const parts = [];
		if (row.spawnAmount.trim()) parts.push(`SpawnAmount=${row.spawnAmount.trim()}`);
		if (row.prob.trim()) parts.push(`Prob=${row.prob.trim()}`);
		if (row.clusterProb.trim()) parts.push(`ClusterProb=${row.clusterProb.trim()}`);
		if (row.clusterRange.trim()) parts.push(`ClusterRange=${row.clusterRange.trim()}`);
		const klass = row.starClass.trim() || "G";
		next[`StarClass_${i + 1}`] = parts.length ? `${klass}, param1: "${parts.join(", ")}"` : klass;
	});
	return next;
}
function zoneHandleList(spans) {
	if (!spans.length) return [];
	const list = [{
		id: "start",
		kind: "start",
		index: 0,
		sectors: spans[0].min
	}];
	for (let i = 0; i < spans.length - 1; i++) list.push({
		id: `join-${i}`,
		kind: "join",
		index: i,
		sectors: spans[i].max
	});
	list.push({
		id: "end",
		kind: "end",
		index: spans.length - 1,
		sectors: spans[spans.length - 1].max
	});
	return list;
}
function applyZoneDrag(spans, handle, sectors) {
	const next = spans.map((span) => ({ ...span }));
	const v = Math.max(0, Math.round(sectors));
	if (handle.kind === "start") {
		const span = next[0];
		if (span) span.min = Math.min(v, span.max - 1);
		return next;
	}
	if (handle.kind === "end") {
		const span = next[next.length - 1];
		if (span) span.max = Math.max(v, span.min + 1);
		return next;
	}
	const left = next[handle.index];
	const right = next[handle.index + 1];
	if (!left || !right) return next;
	const lo = left.min + 1;
	const hi = Math.max(lo, right.max - 2);
	const c = Math.min(Math.max(v, lo), hi);
	left.max = c;
	right.min = c + 1;
	return next;
}
function spansToZoneFields(spans) {
	const fields = {};
	for (const span of spans) fields[span.key] = formatRange({
		min: span.min,
		max: span.max
	});
	return fields;
}
function parseRange(value) {
	if (!value) return null;
	const nums = value.split(",").map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
	if (!nums.length) {
		const n = Number(value);
		return Number.isFinite(n) ? {
			min: n,
			max: n
		} : null;
	}
	if (nums.length === 1) return {
		min: nums[0],
		max: nums[0]
	};
	return {
		min: Math.min(nums[0], nums[1]),
		max: Math.max(nums[0], nums[1])
	};
}
function formatRange(range) {
	return range.min === range.max ? String(range.min) : `${range.min}, ${range.max}`;
}
function mid(range) {
	return (range.min + range.max) / 2;
}
function rgbFromField(value) {
	if (!value) return "#fbbf24";
	const nums = value.split(",").map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
	if (nums.length < 3) return "#fbbf24";
	const [r, g, b] = nums;
	const to = (n) => Math.round(Math.max(0, Math.min(1, n > 1 ? n / 255 : n)) * 255);
	return `rgb(${to(r)}, ${to(g)}, ${to(b)})`;
}
function luminosityOf(star) {
	const n = Number(star.fields.Luminosity);
	return Number.isFinite(n) && n >= 0 ? n : 1;
}
/** Kopparapu-style conservative HZ in AU, scaled by sqrt(L / Lsun). */
function physicsHabitableAU(luminosity) {
	const s = Math.sqrt(Math.max(luminosity, 0));
	return {
		inner: .95 * s,
		outer: 1.67 * s,
		optimisticInner: .75 * s,
		optimisticOuter: 1.77 * s
	};
}
function auToSectors(au) {
	return au * 10;
}
function sectorsToAu(sectors) {
	return sectors / 10;
}
/** Relative solar flux vs Earth at 1 AU around Sol. Inverse-square. Game: 1 AU = 10 sectors. */
function solarFlux(luminosity, sectors) {
	const au = Math.max(sectorsToAu(Math.max(sectors, .01)), .01);
	return luminosity / (au * au);
}
/** L needed at this distance to hit a given Earth-relative flux. */
function luminosityForFlux(flux, sectors) {
	const au = Math.max(sectorsToAu(Math.max(sectors, .01)), .01);
	return flux * au * au;
}
/**
* Kopparapu / Eleon-scale flux windows (Earth = 1 at 1 AU, L=1).
* Inner/hot/cold match GalaxyConfig generation intent: lava cooks, temperate is Earth-like, outer is dim.
*/
var CLIMATE_FLUX = {
	lava: {
		min: 2,
		max: 16,
		suggest: 6.5,
		suggestMax: 10
	},
	hot: {
		min: 1.11,
		max: 4,
		suggest: 1.8,
		suggestMax: 2.8
	},
	temperate: {
		min: .356,
		max: 1.107,
		suggest: 1,
		suggestMax: 1.107
	},
	cold: {
		min: .12,
		max: .356,
		suggest: .25,
		suggestMax: .356
	},
	outer: {
		min: .008,
		max: .12,
		suggest: .05,
		suggestMax: .12
	}
};
function climateAtOrbit(star, body) {
	const inferred = inferClimate(body.name, body.kind, body.playfieldType);
	if (inferred !== "unknown") return inferred;
	const zone = zoneAtDistance(star, body.distance);
	if (zone?.key === "InnerSystem") return "lava";
	if (zone?.key === "HabitableHot") return "hot";
	if (zone?.key === "HabitableTemperate") return "temperate";
	if (zone?.key === "HabitableCold") return "cold";
	if (zone?.key === "OuterSystem") return "outer";
	return "unknown";
}
function luminosityWindowForBody(climate, sectors) {
	if (climate === "unknown") return null;
	const band = CLIMATE_FLUX[climate];
	return {
		min: luminosityForFlux(band.min, sectors),
		max: luminosityForFlux(band.max, sectors),
		suggest: luminosityForFlux(band.suggest, sectors),
		suggestMax: luminosityForFlux(band.suggestMax, sectors),
		climate
	};
}
function roundLum(n) {
	if (n >= 10) return Math.round(n * 10) / 10;
	if (n >= 1) return Math.round(n * 100) / 100;
	if (n >= .01) return Math.round(n * 1e3) / 1e3;
	return Number(n.toExponential(2));
}
function systemLuminosityWindow(star, bodies) {
	const L = luminosityOf(star);
	const rows = [];
	for (const body of bodies) {
		if (kindGroup(body.kind) === "star") continue;
		if (body.distance < .5) continue;
		const climate = climateAtOrbit(star, body);
		const window = luminosityWindowForBody(climate, body.distance);
		if (!window) continue;
		rows.push({
			name: body.name,
			kind: body.kind,
			climate,
			distance: body.distance,
			flux: solarFlux(L, body.distance),
			window
		});
	}
	if (!rows.length) return null;
	const habitable = rows.filter((r) => r.climate === "temperate" || r.climate === "cold" || r.climate === "hot");
	const drivers = habitable.length ? habitable : rows;
	const min = Math.max(...drivers.map((r) => r.window.min));
	const max = Math.min(...drivers.map((r) => r.window.max));
	const suggestMax = Math.min(...drivers.map((r) => r.window.suggestMax));
	const temperate = rows.filter((r) => r.climate === "temperate");
	const suggest = temperate.length ? temperate.reduce((s, r) => s + r.window.suggest, 0) / temperate.length : drivers.reduce((s, r) => s + r.window.suggest, 0) / drivers.length;
	return {
		min: roundLum(min),
		max: roundLum(Math.max(max, min)),
		suggest: roundLum(suggest),
		suggestMax: roundLum(suggestMax),
		conflict: max < min,
		bodies: rows
	};
}
function formatLum(n) {
	if (!Number.isFinite(n)) return "—";
	if (n >= 10) return n.toFixed(1);
	if (n >= 1) return n.toFixed(2);
	if (n >= .01) return n.toFixed(3);
	return n.toExponential(2);
}
function starZoneSpans(star) {
	const out = [];
	for (const zone of STAR_ZONES) {
		const range = parseRange(star.fields[zone.key]);
		if (!range) continue;
		out.push({
			...zone,
			min: range.min,
			max: range.max
		});
	}
	return out;
}
function axisMax(star, bodies = []) {
	const spans = starZoneSpans(star);
	const physics = physicsHabitableAU(luminosityOf(star));
	const fromZones = spans.length ? Math.max(...spans.map((s) => s.max)) : 0;
	const fromPhysics = auToSectors(physics.optimisticOuter);
	const zoneCap = Math.max(fromZones * 1.3, fromPhysics * 1.2, 40);
	const inView = bodies.map((b) => b.distance).filter((d) => d > .5 && d <= zoneCap * 2);
	const fromBodies = inView.length ? Math.max(...inView) * 1.1 : 0;
	return Math.max(fromZones, fromPhysics, Math.min(fromBodies || 0, zoneCap * 1.8), 20);
}
function groupSystems(bodies) {
	const map = /* @__PURE__ */ new Map();
	for (const body of bodies) {
		const name = body.system || "System";
		let sys = map.get(name);
		if (!sys) {
			sys = {
				name,
				starClass: body.starClass,
				bodies: []
			};
			map.set(name, sys);
		}
		if (body.starClass && !sys.starClass) sys.starClass = body.starClass;
		sys.bodies.push(body);
	}
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function pickDefaultSystem(star, systems, starterName) {
	if (!systems.length) return "";
	const starter = starterName?.trim().toLowerCase();
	if (starter) {
		const hit = systems.find((s) => s.name.toLowerCase() === starter);
		if (hit) return hit.name;
	}
	const klass = (star.fields.StarClass || "").trim().toLowerCase();
	const outer = starZoneSpans(star).at(-1)?.max ?? 200;
	const scored = (list) => [...list].sort((a, b) => {
		const count = (s) => s.bodies.filter((x) => x.distance > .5 && x.distance <= outer * 2).length;
		return count(b) - count(a);
	});
	const byClass = systems.filter((s) => (s.starClass || "").toLowerCase() === klass);
	if (byClass.length) return scored(byClass)[0].name;
	return scored(systems)[0].name;
}
function kindGroup(kind) {
	if (/^(sun|star)$/i.test(kind)) return "star";
	if (/moon/i.test(kind)) return "moon";
	if (/planet/i.test(kind)) return "planet";
	return "other";
}
function zoneAtDistance(star, sectors) {
	return starZoneSpans(star).find((z) => sectors >= z.min && sectors <= z.max) ?? null;
}
function zoneWarnings(star) {
	const spans = starZoneSpans(star);
	const warnings = [];
	for (let i = 1; i < spans.length; i++) {
		const prev = spans[i - 1];
		const cur = spans[i];
		if (cur.min < prev.max) warnings.push(`${cur.label} overlaps ${prev.label} (${cur.min} < ${prev.max} sectors).`);
		else if (cur.min > prev.max + 1) warnings.push(`Gap between ${prev.label} and ${cur.label} (${prev.max}–${cur.min} sectors).`);
	}
	const L = luminosityOf(star);
	const physics = physicsHabitableAU(L);
	const temperate = spans.find((s) => s.key === "HabitableTemperate");
	if (temperate) {
		const midAu = sectorsToAu(mid({
			min: temperate.min,
			max: temperate.max
		}));
		if (midAu < physics.inner * .7 || midAu > physics.outer * 1.4) warnings.push(`Temperate band sits at ${midAu.toFixed(2)} AU; physics HZ for L=${L} is ${physics.inner.toFixed(2)}–${physics.outer.toFixed(2)} AU (${auToSectors(physics.inner).toFixed(0)}–${auToSectors(physics.outer).toFixed(0)} sectors).`);
	}
	return warnings;
}
function dist(a, b) {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	const dz = a[2] - b[2];
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/** Pull playfield positions out of Sectors.yaml (Sectors or SolarSystems). Distances are in sectors from the local origin. */
function parseSectorBodies(yaml) {
	const bodies = [];
	if (!yaml.trim()) return bodies;
	const blocks = yaml.split(/\n(?=\s*-\s+(?:Name:|Coordinates:))/);
	for (const block of blocks) {
		const nameMatch = block.match(/^\s*-?\s*Name:\s*(.+)$/m);
		const classMatch = block.match(/StarClass:\s*(\S+)/);
		const system = (nameMatch?.[1] || "System").replace(/['"]/g, "").trim();
		const starClass = classMatch?.[1]?.replace(/['"]/g, "");
		const origin = [
			0,
			0,
			0
		];
		const tupleRe = /\[\s*['"]?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*['"]?\s*,\s*([^,\]]+)\s*,\s*([^,\]]+)(?:\s*,\s*([^,\]]+))?/g;
		let m;
		while (m = tupleRe.exec(block)) {
			const coords = [
				Number(m[1]),
				Number(m[2]),
				Number(m[3])
			];
			const name = m[4].replace(/['"]/g, "").trim();
			const kind = m[5].replace(/['"]/g, "").trim();
			const playfieldType = m[6]?.replace(/['"]/g, "").trim();
			bodies.push({
				system,
				starClass,
				name,
				kind,
				playfieldType,
				coords,
				distance: dist(coords, origin)
			});
		}
	}
	if (bodies.length) return bodies;
	const loose = /\[\s*['"]?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*['"]?\s*,\s*([^,\]]+)\s*,\s*([^,\]]+)(?:\s*,\s*([^,\]]+))?/g;
	let m;
	while (m = loose.exec(yaml)) {
		const coords = [
			Number(m[1]),
			Number(m[2]),
			Number(m[3])
		];
		bodies.push({
			system: "System",
			name: m[4].replace(/['"]/g, "").trim(),
			kind: m[5].replace(/['"]/g, "").trim(),
			playfieldType: m[6]?.replace(/['"]/g, "").trim(),
			coords,
			distance: dist(coords, [
				0,
				0,
				0
			])
		});
	}
	return bodies;
}
function overlayBodies(_star, bodies) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const body of bodies) {
		if (body.distance < .5) continue;
		if (kindGroup(body.kind) === "star") continue;
		const key = `${body.name.toLowerCase()}@${body.distance.toFixed(1)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(body);
	}
	return out.sort((a, b) => a.distance - b.distance);
}
function clusterTicks(bodies, xOf, px = 4) {
	const groups = [];
	for (const body of bodies) {
		const x = xOf(body.distance);
		const last = groups[groups.length - 1];
		if (last && Math.abs(x - last.x) < px) last.bodies.push(body);
		else groups.push({
			x,
			bodies: [body]
		});
	}
	return groups;
}
function placeBodyLabels(bodies, xOf, minGap = 64, maxLanes = 4) {
	const lastX = Array.from({ length: maxLanes }, () => -Infinity);
	const placed = [];
	let hidden = 0;
	for (const body of bodies) {
		const x = xOf(body.distance);
		let lane = lastX.findIndex((prev) => x - prev >= minGap);
		if (lane < 0) {
			hidden += 1;
			continue;
		}
		lastX[lane] = x;
		placed.push({
			body,
			x,
			lane
		});
	}
	return {
		placed,
		hidden
	};
}
function fluxLabel(flux) {
	if (!Number.isFinite(flux)) return "—";
	if (flux >= 100) return `${flux.toFixed(0)}×`;
	if (flux >= 10) return `${flux.toFixed(1)}×`;
	if (flux >= 1) return `${flux.toFixed(2)}×`;
	if (flux >= .01) return `${flux.toFixed(3)}×`;
	return flux.toExponential(1);
}
function solarAdvice(flux) {
	if (flux >= 4) return "Harsh — panels clip; bases cook unless shielded.";
	if (flux >= .6) return "Strong solar — space bases and equatorial planets run well.";
	if (flux >= .25) return "Usable solar — expect night storage or extra panels.";
	if (flux >= .05) return "Weak solar — space bases starve; planets need weather luck.";
	return "Negligible sunlight — generators, not panels.";
}
function isStarType(obj) {
	if (/galaxyconfig/i.test(obj.kind) && /^general$/i.test(obj.name)) return false;
	return Boolean(obj.fields.StarClass || obj.fields.Luminosity || obj.fields.HabitableTemperate || obj.fields.InnerSystem);
}
var CLIMATE_TO_ZONE = {
	lava: "InnerSystem",
	hot: "HabitableHot",
	temperate: "HabitableTemperate",
	cold: "HabitableCold",
	outer: "OuterSystem"
};
function inferClimate(name, kind, playfieldType) {
	const blob = `${playfieldType || ""} ${kind} ${name}`.toLowerCase();
	if (/lava|volcan|magma|inferno|molten|scorch/.test(blob)) return "lava";
	if (/arid|desert|dune|savannah|mesa|badland/.test(blob)) return "hot";
	if (/snow|ice|frost|tundra|glacier|frozen|arctic/.test(blob)) return "cold";
	if (/temperate|ocean|jungle|forest|earth|garden|habitable|meadow|swamp/.test(blob)) return "temperate";
	if (/gas\s*giant|barren|asteroid|dead\b/.test(blob)) return "outer";
	if (/moon/i.test(kind)) return "unknown";
	if (/planet/i.test(kind)) return "unknown";
	return "outer";
}
function climateLabel(climate) {
	if (climate === "lava") return "Lava / volcanic";
	if (climate === "hot") return "Hot / arid";
	if (climate === "temperate") return "Temperate";
	if (climate === "cold") return "Cold / ice";
	if (climate === "outer") return "Outer / barren";
	return "Untyped";
}
function roundCoord(n) {
	return Math.round(n * 10) / 10;
}
function scaleCoords(coords, target) {
	const d = dist(coords, [
		0,
		0,
		0
	]);
	if (d < .05) return [
		roundCoord(target),
		0,
		0
	];
	const s = target / d;
	return [
		roundCoord(coords[0] * s),
		roundCoord(coords[1] * s),
		roundCoord(coords[2] * s)
	];
}
function zoneMidpoint(star, key) {
	const span = starZoneSpans(star).find((z) => z.key === key);
	if (!span) return null;
	return Math.round(mid({
		min: span.min,
		max: span.max
	}));
}
function slotInZone(star, key, used) {
	const span = starZoneSpans(star).find((z) => z.key === key);
	if (!span) return null;
	const midPt = Math.round(mid({
		min: span.min,
		max: span.max
	}));
	const candidates = [
		midPt,
		midPt - 2,
		midPt + 2,
		midPt - 4,
		midPt + 4,
		span.min + 1,
		span.max - 1
	];
	for (const n of candidates) {
		if (n < span.min || n > span.max) continue;
		if (used.some((u) => Math.abs(u - n) < 1.2)) continue;
		return n;
	}
	return midPt;
}
function nearestPlanet(moon, planets) {
	let best;
	let bestD = Infinity;
	for (const planet of planets) {
		const d = dist(moon.coords, planet.coords);
		if (d < bestD) {
			bestD = d;
			best = planet;
		}
	}
	return best;
}
var MOON_MAX_SEP = 10;
function diagnoseOrbits(star, bodies) {
	const spans = starZoneSpans(star);
	const outer = spans.find((s) => s.key === "OuterSystem")?.max ?? spans.at(-1)?.max ?? 0;
	const planets = bodies.filter((b) => kindGroup(b.kind) === "planet");
	const used = [];
	const relocated = /* @__PURE__ */ new Map();
	const issues = [];
	const consider = (body, expected, parent) => {
		const climate = inferClimate(body.name, body.kind, body.playfieldType);
		const zone = zoneAtDistance(star, body.distance);
		const off = outer > 0 && body.distance > outer * 1.15;
		const none = !zone && !off;
		const moon = kindGroup(body.kind) === "moon";
		let reason = "";
		let targetKey = expected;
		if (moon && parent && dist(body.coords, parent.coords) > MOON_MAX_SEP) {
			reason = `Moon sits ${dist(body.coords, parent.coords).toFixed(0)} sectors from ${parent.name}; keep it in that planet’s pocket.`;
			targetKey = "parent";
		} else if (moon && expected === "parent") return;
		else if (off) reason = `Off-scale at ${body.distance.toFixed(0)} sectors (outer band ends ~${outer}).`;
		else if (expected && expected !== "parent" && zone?.key && zone.key !== expected) reason = `${climateLabel(climate)} ${body.kind.toLowerCase()} is in the ${zone.label} band.`;
		else if (expected && expected !== "parent" && none) {
			const label = STAR_ZONES.find((z) => z.key === expected)?.label ?? expected;
			reason = `Outside every band for this star. ${climateLabel(climate)} bodies belong in the ${label} band.`;
		} else if (!expected && off) reason = `Off-scale at ${body.distance.toFixed(0)} sectors.`;
		else return;
		let suggested = body.coords;
		let suggestedDistance = body.distance;
		let movable = false;
		if (targetKey === "parent" && parent) {
			const nest = (parent.distance || 1) + 3;
			suggested = scaleCoords(parent.coords, nest);
			if (suggested[0] === parent.coords[0] && suggested[1] === parent.coords[1] && suggested[2] === parent.coords[2]) suggested = [
				roundCoord(parent.coords[0] + 3),
				parent.coords[1],
				parent.coords[2]
			];
			suggestedDistance = dist(suggested, [
				0,
				0,
				0
			]);
			movable = true;
		} else if (targetKey && targetKey !== "parent") {
			const slot = slotInZone(star, targetKey, used) ?? zoneMidpoint(star, targetKey);
			if (slot != null) {
				suggested = scaleCoords(body.coords, slot);
				suggestedDistance = dist(suggested, [
					0,
					0,
					0
				]);
				movable = zoneAtDistance(star, suggestedDistance)?.key === targetKey;
				if (movable) used.push(suggestedDistance);
			}
		} else if (off) {
			const slot = slotInZone(star, "OuterSystem", used) ?? zoneMidpoint(star, "OuterSystem");
			if (slot != null) {
				suggested = scaleCoords(body.coords, slot);
				suggestedDistance = dist(suggested, [
					0,
					0,
					0
				]);
				movable = Boolean(zoneAtDistance(star, suggestedDistance));
				if (movable) used.push(suggestedDistance);
			}
		}
		issues.push({
			key: `${body.system}:${body.name}:${body.distance.toFixed(1)}`,
			body,
			climate,
			currentZone: zone?.label ?? (off ? "off-scale" : null),
			expectedZone: targetKey,
			reason: movable ? reason : `${reason} This star has no ${STAR_ZONES.find((z) => z.key === targetKey)?.label || "matching"} range to move it into.`,
			suggested,
			suggestedDistance,
			movable
		});
		relocated.set(body.name, {
			...body,
			coords: suggested,
			distance: suggestedDistance
		});
	};
	for (const planet of planets) {
		const climate = inferClimate(planet.name, planet.kind, planet.playfieldType);
		consider(planet, climate === "unknown" ? null : CLIMATE_TO_ZONE[climate]);
	}
	for (const body of bodies) {
		if (kindGroup(body.kind) === "planet" || kindGroup(body.kind) === "star") continue;
		const climate = inferClimate(body.name, body.kind, body.playfieldType);
		const parentOrig = kindGroup(body.kind) === "moon" ? nearestPlanet(body, planets) : void 0;
		const parent = parentOrig ? relocated.get(parentOrig.name) ?? parentOrig : void 0;
		if (kindGroup(body.kind) === "moon" && (climate === "unknown" || parent)) consider(body, climate === "unknown" ? "parent" : CLIMATE_TO_ZONE[climate], parent);
		else consider(body, climate === "unknown" ? null : CLIMATE_TO_ZONE[climate]);
	}
	return issues;
}
function fmtCoord(n) {
	return Number.isInteger(n) ? String(n) : String(roundCoord(n));
}
function formatCoords(coords) {
	return `${fmtCoord(coords[0])}, ${fmtCoord(coords[1])}, ${fmtCoord(coords[2])}`;
}
function applyOrbitFixes(yaml, fixes) {
	const byName = new Map(fixes.map((fix) => [fix.name.trim().toLowerCase(), formatCoords(fix.coords)]));
	return yaml.replace(/\[\s*(['"]?)\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\1\s*,\s*(['"]?)([^,\]]+?)\2(?=\s*,)/g, (full, coordQuote, nameQuote, rawName) => {
		const coord = byName.get(rawName.trim().toLowerCase());
		if (!coord) return full;
		return `[${coordQuote}${coord}${coordQuote}, ${nameQuote}${rawName.trim()}${nameQuote}`;
	});
}
function renameSectorBody(yaml, from, to) {
	const name = from.trim();
	const next = to.trim();
	if (!name || !next || name === next) return yaml;
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const re = new RegExp(`(\\[[\\s'"]*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+[\\s'"]*,\\s*['"]?)${escaped}(['"]?(?=\\s*,))`);
	return yaml.replace(re, `$1${next}$2`);
}
var PLANET_TYPES = [
	"Temperate",
	"Barren",
	"Desert",
	"Lava",
	"Snow",
	"Moon",
	"Ocean",
	"Alien",
	"Nascent",
	"Arid",
	"MoonDesert",
	"Space"
];
var RESOURCE_NAMES = [
	"IronResource",
	"CopperResource",
	"SiliconResource",
	"PromethiumResource",
	"CobaltResource",
	"MagnesiumResource",
	"NeodymiumResource",
	"SathiumResource",
	"ErestrumResource",
	"ZascosiumResource",
	"GoldResource"
];
var RANDOM_POI_COLS = [
	{
		key: "GroupName",
		label: "GroupName",
		kind: "text"
	},
	{
		key: "CountMinMax",
		label: "Count",
		kind: "pair"
	},
	{
		key: "DroneProb",
		label: "DroneProb",
		kind: "number"
	},
	{
		key: "DronesMinMax",
		label: "Drones",
		kind: "pair"
	},
	{
		key: "ReserveCount",
		label: "Reserve",
		kind: "number"
	},
	{
		key: "TroopTransport",
		label: "TroopTransport",
		kind: "bool"
	},
	{
		key: "SpawnPOINear",
		label: "Near",
		kind: "list"
	},
	{
		key: "SpawnPOINearRange",
		label: "NearRange",
		kind: "pair"
	}
];
var FIXED_POI_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text"
	},
	{
		key: "Prefab",
		label: "Prefab",
		kind: "text"
	},
	{
		key: "Type",
		label: "Type",
		kind: "text"
	},
	{
		key: "Pos",
		label: "Pos",
		kind: "list"
	},
	{
		key: "Rot",
		label: "Rot",
		kind: "list"
	},
	{
		key: "InitPower",
		label: "Powered",
		kind: "bool"
	},
	{
		key: "Mode",
		label: "Mode",
		kind: "text",
		options: ["Survival", "Creative"]
	},
	{
		key: "Faction",
		label: "Faction",
		kind: "text"
	}
];
var RANDOM_RESOURCE_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text",
		options: RESOURCE_NAMES
	},
	{
		key: "CountMinMax",
		label: "Count",
		kind: "pair"
	},
	{
		key: "SizeMinMax",
		label: "Size",
		kind: "pair"
	},
	{
		key: "DepthMinMax",
		label: "Depth",
		kind: "pair"
	},
	{
		key: "DroneProb",
		label: "DroneProb",
		kind: "number"
	},
	{
		key: "MaxDroneCount",
		label: "MaxDrones",
		kind: "number"
	}
];
var FIXED_RESOURCE_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text",
		options: RESOURCE_NAMES
	},
	{
		key: "Pos",
		label: "Pos",
		kind: "list"
	},
	{
		key: "Radius",
		label: "Radius",
		kind: "number"
	}
];
var BIOME_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text"
	},
	{
		key: "Color",
		label: "Color",
		kind: "list"
	},
	{
		key: "Texture",
		label: "Texture",
		kind: "text"
	},
	{
		key: "YScale",
		label: "YScale",
		kind: "number"
	}
];
var ENTITY_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text"
	},
	{
		key: "Period",
		label: "Period",
		kind: "text",
		options: [
			"Day",
			"Night",
			"Always"
		]
	},
	{
		key: "Amount",
		label: "Amount",
		kind: "number"
	},
	{
		key: "Delay",
		label: "Delay",
		kind: "number"
	}
];
var SPAWN_ZONE_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text"
	},
	{
		key: "CenterX",
		label: "CenterX",
		kind: "number"
	},
	{
		key: "Radius",
		label: "Radius",
		kind: "number"
	},
	{
		key: "DronesMinMax",
		label: "Drones",
		kind: "pair"
	}
];
var ASTEROID_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text",
		options: RESOURCE_NAMES
	},
	{
		key: "CountMinMax",
		label: "Count",
		kind: "pair"
	},
	{
		key: "SizeMinMax",
		label: "Size",
		kind: "pair"
	}
];
var SPACE_VESSEL_COLS = [
	{
		key: "Name",
		label: "Name",
		kind: "text"
	},
	{
		key: "Prefab",
		label: "Prefab",
		kind: "text"
	},
	{
		key: "Factions",
		label: "Factions",
		kind: "list"
	},
	{
		key: "CountMinMax",
		label: "Count",
		kind: "pair"
	}
];
function loadPlayfieldDoc(text) {
	try {
		const doc = load(text, { json: true });
		if (doc && typeof doc === "object" && !Array.isArray(doc)) return doc;
		return {};
	} catch {
		return null;
	}
}
function dumpPlayfieldDoc(doc) {
	return dump(doc, {
		lineWidth: 140,
		noRefs: true,
		skipInvalid: true
	});
}
function asRows(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((row) => row && typeof row === "object" && !Array.isArray(row));
}
function getPath(doc, path) {
	let cur = doc;
	for (const key of path) {
		if (!cur || typeof cur !== "object" || Array.isArray(cur)) return void 0;
		cur = cur[key];
	}
	return cur;
}
function setPath(doc, path, value) {
	const next = structuredClone(doc);
	let cur = next;
	for (let i = 0; i < path.length - 1; i++) {
		const key = path[i];
		const child = cur[key];
		if (!child || typeof child !== "object" || Array.isArray(child)) cur[key] = {};
		cur = cur[key];
	}
	const last = path[path.length - 1];
	if (value == null) delete cur[last];
	else cur[last] = value;
	return next;
}
function randomPoiPath(doc) {
	if (getPath(doc, ["POIs", "Random"]) !== void 0) return ["POIs", "Random"];
	if (doc.RandomPOIs !== void 0) return ["RandomPOIs"];
	return ["POIs", "Random"];
}
function fixedPoiPath(doc) {
	if (getPath(doc, ["POIs", "Fixed"]) !== void 0) return ["POIs", "Fixed"];
	if (doc.FixedPOIs !== void 0) return ["FixedPOIs"];
	return ["POIs", "Fixed"];
}
function yamlCell(value) {
	if (value == null) return "";
	if (Array.isArray(value)) return value.join(", ");
	if (typeof value === "boolean") return value ? "True" : "False";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}
function parseCell(raw, kind) {
	const v = raw.trim();
	if (kind === "bool") return /^(true|yes|1)$/i.test(v);
	if (kind === "number") {
		if (v === "") return "";
		const n = Number(v);
		return Number.isFinite(n) ? n : v;
	}
	if (kind === "pair" || kind === "list") {
		if (!v) return [];
		return v.split(/[,\s]+/).filter(Boolean).map((part) => {
			const n = Number(part);
			return Number.isFinite(n) ? n : part;
		});
	}
	if (/^(true|false)$/i.test(v)) return /^true$/i.test(v);
	return v;
}
function rowsToCells(list, cols) {
	return list.map((row) => {
		const rec = {};
		for (const col of cols) rec[col.key] = yamlCell(row[col.key]);
		return rec;
	});
}
function cellsToRows(cells, cols, previous) {
	return cells.map((cell, i) => {
		const prev = { ...previous[i] ?? {} };
		for (const col of cols) {
			const raw = cell[col.key] ?? "";
			if (raw === "") {
				delete prev[col.key];
				continue;
			}
			prev[col.key] = parseCell(raw, col.kind);
		}
		return prev;
	});
}
function catalogNames(catalog, kind) {
	if (!catalog) return [];
	return [...new Set(catalog.entries.filter((e) => e.kind === kind).map((e) => e.name))].sort();
}
function tabsForKind(kind) {
	const planet = kind === "planet" || kind === "moon";
	const tabs = [
		{
			id: "basics",
			label: "Basics"
		},
		{
			id: "pois",
			label: "POIs"
		},
		{
			id: "resources",
			label: planet ? "Resources" : "Asteroids"
		}
	];
	if (planet) {
		tabs.push({
			id: "creatures",
			label: "Creatures"
		});
		tabs.push({
			id: "biomes",
			label: "Biomes"
		});
	}
	tabs.push({
		id: "spawns",
		label: "Spawns"
	});
	tabs.push({
		id: "check",
		label: "Pre-flight"
	});
	tabs.push({
		id: "raw",
		label: "Raw YAML"
	});
	return tabs;
}
function pairOrder(value) {
	if (!Array.isArray(value) || value.length < 2) return null;
	const a = Number(value[0]);
	const b = Number(value[1]);
	if (!Number.isFinite(a) || !Number.isFinite(b) || a <= b) return null;
	return `${a} > ${b}`;
}
function preflightPlayfield(file, catalog) {
	const issues = [];
	const doc = loadPlayfieldDoc(file.text);
	if (!doc) {
		issues.push({
			level: "error",
			code: "yaml",
			message: "YAML did not parse. Fix the Raw tab before using the lists.",
			path: file.path
		});
		return issues;
	}
	const type = String(file.fields.PlayfieldType || getPath(doc, ["PlayfieldType"]) || "");
	const planet = file.kind === "planet" || file.kind === "moon";
	if (planet && type && type.toLowerCase() === "space") issues.push({
		level: "error",
		code: "type",
		message: `${file.folder} looks like a ${file.kind} but PlayfieldType is Space.`,
		path: "PlayfieldType"
	});
	if ((file.kind === "orbit" || file.kind === "space") && type.toLowerCase() === "planet") issues.push({
		level: "error",
		code: "type",
		message: `${file.folder} is an orbit/space file with PlayfieldType Planet.`,
		path: "PlayfieldType"
	});
	if (planet && file.fields.Gravity == null && getPath(doc, ["Gravity"]) == null) issues.push({
		level: "warning",
		code: "gravity",
		message: "Planet/moon has no Gravity.",
		path: "Gravity"
	});
	if (!planet && (file.fields.Gravity || getPath(doc, ["Gravity"]) != null)) issues.push({
		level: "warning",
		code: "gravity",
		message: "Space/orbit files should not set Gravity.",
		path: "Gravity"
	});
	const pois = catalogNames(catalog, "poi");
	const random = asRows(getPath(doc, randomPoiPath(doc)));
	const seen = /* @__PURE__ */ new Set();
	random.forEach((row, i) => {
		const name = String(row.GroupName ?? "").trim();
		if (!name) issues.push({
			level: "error",
			code: "poi",
			message: `Random POI ${i + 1} has no GroupName.`,
			path: `POIs.Random[${i}]`
		});
		else if (seen.has(name.toLowerCase())) issues.push({
			level: "warning",
			code: "poi",
			message: `Duplicate GroupName “${name}”.`,
			path: `POIs.Random[${i}]`
		});
		else seen.add(name.toLowerCase());
		if (name && catalog) {
			const hit = resolveCatalogToken(catalog, name, ["poi"]);
			if (!hit && pois.length) issues.push({
				level: "warning",
				code: "poi",
				message: `GroupName “${name}” is not in imported Prefabs, EPB GroupName tags, or Localization.csv.`,
				path: `POIs.Random[${i}].GroupName`
			});
			else if (hit?.via === "file" && hit.entry.poiGroup) issues.push({
				level: "warning",
				code: "poi-group",
				message: `“${name}” is the .epb file. Random POIs use GroupName ${hit.entry.poiGroup}.`,
				path: `POIs.Random[${i}].GroupName`,
				fixFrom: name,
				fixTo: hit.entry.poiGroup
			});
			else if (hit?.via === "label" && hit.entry.poiGroup) issues.push({
				level: "warning",
				code: "loca-name",
				message: `“${name}” is the spawn/display name. GroupName is ${hit.entry.poiGroup}.`,
				path: `POIs.Random[${i}].GroupName`,
				fixFrom: name,
				fixTo: hit.entry.poiGroup
			});
			else if (hit && hit.via === "label") issues.push({
				level: "warning",
				code: "loca-name",
				message: `“${name}” is the Localization.csv name. Prefab/group id is ${hit.entry.name}.`,
				path: `POIs.Random[${i}].GroupName`,
				fixFrom: name,
				fixTo: hit.entry.name
			});
		}
		const order = pairOrder(row.CountMinMax);
		if (order) issues.push({
			level: "warning",
			code: "range",
			message: `“${name || i + 1}” CountMinMax is inverted (${order}).`,
			path: `POIs.Random[${i}].CountMinMax`
		});
	});
	asRows(getPath(doc, fixedPoiPath(doc))).forEach((row, i) => {
		if (!row.Prefab && !row.Name) {
			issues.push({
				level: "error",
				code: "poi",
				message: `Fixed POI ${i + 1} needs a Prefab or Name.`,
				path: `POIs.Fixed[${i}]`
			});
			return;
		}
		const prefab = String(row.Prefab ?? "").trim();
		if (prefab && catalog) {
			const hit = resolveCatalogToken(catalog, prefab, ["poi"]);
			if (hit?.via === "group" && hit.entry.poiFile && hit.entry.poiFile.toLowerCase() !== prefab.toLowerCase()) issues.push({
				level: "warning",
				code: "poi-file",
				message: `“${prefab}” is the GroupName. Fixed POIs use Prefab file ${hit.entry.poiFile}.`,
				path: `POIs.Fixed[${i}].Prefab`,
				fixFrom: prefab,
				fixTo: hit.entry.poiFile
			});
		}
	});
	const entities = catalogNames(catalog, "entity");
	asRows(getPath(doc, ["CreatureSpawning"])).forEach((biome, bi) => {
		const biomeName = String(biome.Biome ?? biome.Name ?? `Biome ${bi + 1}`);
		asRows(biome.Entities).forEach((ent, ei) => {
			const name = String(ent.Name ?? "").trim();
			if (!name) issues.push({
				level: "error",
				code: "creature",
				message: `Creature ${ei + 1} in ${biomeName} has no Name.`,
				path: `CreatureSpawning[${bi}].Entities[${ei}]`
			});
			else if (catalog) {
				const hit = resolveCatalogToken(catalog, name, ["entity"]);
				if (entities.length && !hit) issues.push({
					level: "warning",
					code: "creature",
					message: `Creature “${name}” is not in EClassConfig or Localization.csv.`,
					path: `CreatureSpawning[${bi}].Entities[${ei}].Name`
				});
				else if (hit && hit.via === "label") issues.push({
					level: "warning",
					code: "loca-name",
					message: `“${name}” is the Localization.csv name. Entity id is ${hit.entry.name}.`,
					path: `CreatureSpawning[${bi}].Entities[${ei}].Name`
				});
			}
		});
	});
	asRows(getPath(doc, ["RandomResources"])).forEach((row, i) => {
		if (!String(row.Name ?? "").trim()) issues.push({
			level: "error",
			code: "resource",
			message: `Random resource ${i + 1} has no Name.`,
			path: `RandomResources[${i}]`
		});
	});
	return issues;
}
function hrefFor$1(source) {
	if (source === "pda" || source === "pdaYaml" || source === "pdaCsv") return "/";
	if (source === "dialogues" || source === "dialoguesCsv") return "/dialogues";
	if (source === "playfields") return "/library/playfields";
	if (source === "galaxy") return "/library/galaxy";
	return "/library";
}
function issue(source, path, message, code = "syntax") {
	return {
		id: null,
		kind: "file",
		source: source === "pdaYaml" || source === "pdaCsv" ? "pda" : source,
		href: hrefFor$1(source),
		level: "error",
		code,
		message,
		path,
		recommend: "review",
		suggestions: [],
		fixes: []
	};
}
function braceDelta(line) {
	let inS = false;
	let inD = false;
	let delta = 0;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inD) {
			if (ch === "\\" && line[i + 1] === "\"") i += 1;
			else if (ch === "\"") inD = false;
			continue;
		}
		if (inS) {
			if (ch === "'") inS = false;
			continue;
		}
		if (ch === "\"") inD = true;
		else if (ch === "'") inS = true;
		else if (ch === "{") delta += 1;
		else if (ch === "}") delta -= 1;
	}
	return delta;
}
function scanEcfSyntax(text, source, path, push) {
	const lines = text.replace(/\/\*[\s\S]*?\*\//g, "\n").split(/\r?\n/);
	let depth = 0;
	let firstUnclosed = 0;
	for (let i = 0; i < lines.length; i++) {
		const line = (lines[i] ?? "").replace(/^\s*#.*$/, "").replace(/\s+#.*$/, "");
		if (!line.trim()) continue;
		const delta = braceDelta(line);
		if (depth + delta < 0) {
			push(issue(source, `${path}:${i + 1}`, `Unmatched “}” in ${path} at line ${i + 1}.`));
			depth = 0;
			continue;
		}
		if (depth === 0 && delta > 0 && !/^\s*\{/.test(line)) push(issue(source, `${path}:${i + 1}`, `Line ${i + 1} in ${path} has “{” but does not start a block.`));
		if (depth === 0 && /^\s*\{/.test(line) && !/^\s*\{\s*\+?[A-Za-z]/.test(line)) push(issue(source, `${path}:${i + 1}`, `Line ${i + 1} in ${path} opens a block without a type name (e.g. { Item Name: …).`));
		if (depth === 0 && delta > 0) firstUnclosed = i + 1;
		depth += delta;
	}
	if (depth > 0) push(issue(source, path, `${path} has ${depth} unclosed “{” block${depth === 1 ? "" : "s"} (first open near line ${firstUnclosed || 1}).`));
}
function scanYamlSyntax(text, source, path, push) {
	try {
		load(text);
	} catch (err) {
		push(issue(source, path, `${path}: ${err instanceof Error ? err.message.replace(/\n/g, " ") : "YAML parse failed."}`));
	}
}
function padCsvColumns(text, onlyLine = 0) {
	const bom = text.startsWith("﻿") ? "﻿" : "";
	const src = text.replace(/^\uFEFF/, "");
	let quoted = false;
	let cols = 1;
	let headerCols = 0;
	let line = 1;
	let content = false;
	const inserts = [];
	for (let i = 0; i <= src.length; i++) {
		const c = src[i];
		if (quoted) {
			if (c === "\"") {
				if (src[i + 1] === "\"") i += 1;
				else quoted = false;
			}
			continue;
		}
		if (c === "\"") {
			quoted = true;
			content = true;
		} else if (c === ",") cols += 1;
		else if (c === "\n" || c === void 0) {
			const blank = !content && cols === 1;
			if (line === 1) headerCols = cols;
			else if (!blank && headerCols && cols < headerCols && (!onlyLine || onlyLine === line)) {
				let at = c === void 0 ? src.length : i;
				if (c === "\n" && src[i - 1] === "\r") at = i - 1;
				inserts.push({
					at,
					commas: ",".repeat(headerCols - cols)
				});
			}
			cols = 1;
			content = false;
			line += 1;
		} else if (c !== "\r" && c !== " " && c !== "	") content = true;
	}
	let out = src;
	for (let n = inserts.length - 1; n >= 0; n--) {
		const row = inserts[n];
		if (!row) continue;
		out = out.slice(0, row.at) + row.commas + out.slice(row.at);
	}
	return bom + out;
}
function scanCsvSyntax(text, source, path, push, role = source) {
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
			if (c === "\"") {
				if (src[i + 1] === "\"") i += 1;
				else quoted = false;
			} else if (c === void 0) push(issue(source, path, `${path} has an unclosed quote (started before line ${line}).`));
			continue;
		}
		if (c === "\"") {
			quoted = true;
			content = true;
		} else if (c === ",") cols += 1;
		else if (c === "\n" || c === void 0) {
			const blank = !content && cols === 1;
			if (line === 1) headerCols = cols;
			else if (!blank && cols && headerCols && cols !== headerCols) {
				ragged += 1;
				const missing = headerCols - cols;
				if (missing > 0) short += 1;
				if (sample < 4) {
					const fixes = missing > 0 ? [{
						type: "csv-pad",
						role,
						path,
						line,
						label: `Add ${missing} comma${missing === 1 ? "" : "s"}`
					}] : [];
					const message = missing > 0 ? `${path} line ${line} has ${cols} ${cols === 1 ? "column" : "columns"}, header has ${headerCols}. Add ${missing} comma${missing === 1 ? "" : "s"} for the empty language columns.` : `${path} line ${line} has ${cols} columns, header has ${headerCols}.`;
					push({
						...issue(source, `${path}:${line}`, message, "csv-columns"),
						recommend: fixes.length ? "fix" : "review",
						fixes
					});
					sample += 1;
				}
			}
			cols = 1;
			content = false;
			line += 1;
		} else if (c !== "\r" && c !== " " && c !== "	") content = true;
	}
	if (ragged > sample) {
		const fixes = short ? [{
			type: "csv-pad",
			role,
			path,
			line: 0,
			label: "Add missing commas on every short row"
		}] : [];
		push({
			...issue(source, path, `${path} has ${ragged} rows with the wrong column count.`, "csv-columns"),
			recommend: fixes.length ? "fix" : "review",
			fixes
		});
	} else if (short > 1) push({
		...issue(source, path, `${path} has ${short} short rows. Empty language columns can be filled with commas.`, "csv-columns"),
		recommend: "fix",
		fixes: [{
			type: "csv-pad",
			role,
			path,
			line: 0,
			label: "Add missing commas on every short row"
		}]
	});
}
function scanTextSyntax(role, path, text, push) {
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
var FILE_DEBUG_TABS = [
	{
		id: "all",
		label: "All files",
		href: "/debug"
	},
	{
		id: "pda",
		label: "PDA",
		href: "/"
	},
	{
		id: "items",
		label: "Items",
		href: "/library/items"
	},
	{
		id: "blocks",
		label: "Blocks",
		href: "/library/blocks"
	},
	{
		id: "templates",
		label: "Templates",
		href: "/library"
	},
	{
		id: "tokens",
		label: "Tokens",
		href: "/library"
	},
	{
		id: "dialogues",
		label: "Dialogues",
		href: "/dialogues"
	},
	{
		id: "factions",
		label: "Factions",
		href: "/library/factions"
	},
	{
		id: "playfields",
		label: "Playfields",
		href: "/library/playfields"
	},
	{
		id: "galaxy",
		label: "Galaxy",
		href: "/library/galaxy"
	},
	{
		id: "sectors",
		label: "Sectors",
		href: "/library"
	},
	{
		id: "localization",
		label: "Localization",
		href: "/library"
	}
];
var FILE_SCAN_ORDER = FILE_DEBUG_TABS.map((tab) => tab.id).filter((id) => id !== "all");
var HREF = Object.fromEntries(FILE_DEBUG_TABS.map((t) => [t.id, t.href]));
var ECF_ROLES = [
	"items",
	"blocks",
	"templates",
	"tokens",
	"factions"
];
function hrefFor(source) {
	return HREF[source] || "/library";
}
function applyEcfFix(text, name, field, value) {
	const objects = parseEcfObjects(text);
	const hit = objects.find((o) => o.name === name);
	if (!hit) return text;
	if (field === "Name") hit.name = value;
	else if (field === "Id") hit.id = value;
	else if (value === "") delete hit.fields[field];
	else hit.fields[field] = value;
	return stringifyEcfObjects(objects);
}
function applyYamlReplace(text, from, to) {
	if (!from || from === to) return text;
	const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return text.replace(new RegExp(escaped), to);
}
function validateCatalog(catalog, source = "all") {
	if (!catalog) return [];
	if (!catalogLoaded(catalog) && !catalog.texts?.length) return [];
	const issues = [];
	let n = 0;
	const push = (problem) => {
		n += 1;
		if (issues.filter((i) => i.source === problem.source).length >= 80) return;
		issues.push({
			key: `${problem.source}:${problem.code}:${problem.path}:${n}`,
			...problem
		});
	};
	if (source === "pda") {
		validateSyntax(catalog, "pda", push);
		return issues;
	}
	if (source === "all") return issues;
	validateSyntax(catalog, source, push);
	if (ECF_ROLES.includes(source)) {
		const objects = objectsFor(catalog, source);
		if (objects.length) validateEcfRole(catalog, source, objects, push);
		return issues;
	}
	if (source === "dialogues") try {
		validateDialogues(catalog, push);
	} catch (err) {
		push({
			id: null,
			kind: "file",
			source: "dialogues",
			href: "/dialogues",
			level: "error",
			code: "syntax",
			message: `Dialogues.ecf could not be parsed: ${err instanceof Error ? err.message : "parse failed"}`,
			path: "Dialogues.ecf",
			recommend: "review",
			suggestions: [],
			fixes: []
		});
	}
	else if (source === "playfields") validatePlayfields(catalog, push);
	else if (source === "galaxy") validateGalaxy(catalog, push);
	else if (source === "sectors") validateGalaxy(catalog, push);
	else if (source === "localization") validateLocalization(catalog, push);
	return issues;
}
function slimCatalogForSource(catalog, source) {
	const roles = TEXT_ROLES[source] ?? [];
	let texts = (catalog.texts ?? []).filter((t) => roles.includes(t.role));
	if (source === "playfields") texts = texts.filter((t) => (t.text?.length || 0) < 15e5).slice(0, 40);
	return {
		folderName: catalog.folderName,
		files: catalog.files,
		indexedAt: catalog.indexedAt,
		entries: catalog.entries.map((e) => ({
			kind: e.kind,
			name: e.name,
			label: e.label,
			poiGroup: e.poiGroup,
			poiFile: e.poiFile,
			source: e.source
		})),
		texts
	};
}
var TEXT_ROLES = {
	items: ["items", "localization"],
	blocks: ["blocks"],
	templates: ["templates"],
	tokens: ["tokens", "localization"],
	factions: ["factions"],
	dialogues: ["dialogues", "dialoguesCsv"],
	playfields: ["playfieldYaml"],
	galaxy: ["galaxy", "sectors"],
	sectors: ["sectors"],
	localization: ["localization"],
	pda: ["pdaYaml", "pdaCsv"],
	all: []
};
function validateSyntax(catalog, source, push) {
	const roles = TEXT_ROLES[source] ?? [];
	for (const text of catalog.texts ?? []) {
		if (!text.text || !roles.includes(text.role)) continue;
		scanTextSyntax(text.role, text.path, text.text, push);
	}
}
function validateEcfRole(catalog, role, objects, push) {
	const meta = CONFIG_METAS.find((m) => m.role === role);
	const kinds = meta?.catalogKind ? [meta.catalogKind] : [];
	const unused = unusedNumericIds(objects.map((o) => Number(o.id)).filter((n) => Number.isInteger(n) && n > 0));
	const byId = /* @__PURE__ */ new Map();
	const byName = /* @__PURE__ */ new Map();
	const nameSet = new Set(objects.map((o) => o.name.toLowerCase()));
	const pictures = new Set([...catalog.entries, ...catalog.game ?? []].filter((e) => e.kind === "picture").flatMap((e) => {
		const base = e.name.toLowerCase();
		return [base, base.replace(/\.(png|jpe?g|webp|gif)$/i, "")];
	}));
	const itemNames = new Set([...catalog.entries, ...catalog.game ?? []].filter((e) => e.kind === "item" || e.kind === "block").map((e) => e.name.toLowerCase()));
	for (const obj of objects) {
		const name = obj.name?.trim() || "";
		if (!name) {
			push({
				id: null,
				kind: "file",
				source: role,
				href: hrefFor(role),
				level: "error",
				code: "empty-name",
				message: `${meta?.label || role} entry has no Name.`,
				path: meta?.file || role,
				recommend: "review",
				suggestions: [],
				fixes: []
			});
			continue;
		}
		byName.set(name.toLowerCase(), (byName.get(name.toLowerCase()) || 0) + 1);
		if (obj.id && /^\d+$/.test(obj.id)) {
			const list = byId.get(obj.id) ?? [];
			list.push(name);
			byId.set(obj.id, list);
		}
		const icon = obj.fields.CustomIcon || obj.fields.UnlockIcon;
		if (icon && pictures.size) {
			const stem = icon.replace(/\.(png|jpe?g|webp|gif)$/i, "").toLowerCase();
			if (!(pictures.has(icon.toLowerCase()) || pictures.has(stem))) push({
				id: null,
				kind: "file",
				source: role,
				href: hrefFor(role),
				level: "warning",
				code: "icon",
				message: `${name} CustomIcon “${icon}” is not in imported ItemIcons.`,
				path: `${name}.CustomIcon`,
				recommend: "review",
				field: "CustomIcon",
				value: icon,
				suggestions: [],
				fixes: []
			});
		}
		const factionField = obj.fields.Faction || obj.fields.faction;
		if (factionField && role !== "factions" && catalog.entries.some((e) => e.kind === "faction")) for (const token of factionField.split(/[,|]/).map((part) => part.trim()).filter(Boolean)) {
			if (ENGINE_FACTIONS.has(token.toLowerCase())) continue;
			if (resolveCatalogToken(catalog, token, ["faction"])) continue;
			const suggestions = suggestionsFor(catalog, ["faction"], token, 3).map((e) => e.name);
			push({
				id: null,
				kind: "file",
				source: role,
				href: hrefFor(role),
				level: "warning",
				code: "faction",
				message: `${name} Faction “${token}” is not in Factions.ecf.`,
				path: `${name}.Faction`,
				recommend: suggestions.length ? "fix" : "review",
				field: "Faction",
				value: token,
				suggestions,
				fixes: suggestions.slice(0, 2).map((s) => ({
					type: "ecf-set",
					role,
					name,
					field: "Faction",
					value: s,
					label: `Use ${s}`
				}))
			});
		}
		const ref = obj.fields.Ref;
		if (ref && !nameSet.has(ref.toLowerCase()) && kinds.length) {
			const suggestions = suggestionsFor(catalog, kinds, ref, 3).map((e) => e.name);
			push({
				id: null,
				kind: "file",
				source: role,
				href: hrefFor(role),
				level: "warning",
				code: "ref",
				message: `${name} Ref “${ref}” is not in the loaded ${role}.`,
				path: `${name}.Ref`,
				recommend: suggestions.length ? "fix" : "review",
				field: "Ref",
				value: ref,
				suggestions,
				fixes: suggestions.slice(0, 2).map((s) => ({
					type: "ecf-set",
					role,
					name,
					field: "Ref",
					value: s,
					label: `Use ${s}`
				}))
			});
		}
		if (role === "templates") {
			const child = obj.children?.find((c) => /input/i.test(c.name)) ?? obj.children?.[0];
			for (const [ingredient] of Object.entries(child?.fields ?? {})) {
				if (!ingredient) continue;
				if (itemNames.has(ingredient.toLowerCase())) continue;
				const suggestions = suggestionsFor(catalog, ["item", "block"], ingredient, 3).map((e) => e.name);
				push({
					id: null,
					kind: "file",
					source: role,
					href: hrefFor(role),
					level: "warning",
					code: "ingredient",
					message: `Template ${name} uses “${ingredient}” which is not an item or block.`,
					path: `${name}.Inputs.${ingredient}`,
					recommend: suggestions.length ? "fix" : "review",
					value: ingredient,
					suggestions,
					fixes: []
				});
			}
		}
	}
	for (const [id, names] of byId) {
		if (names.length < 2) continue;
		const next = String(unused.next || Number(id) + 1);
		push({
			id: null,
			kind: "file",
			source: role,
			href: hrefFor(role),
			level: "error",
			code: "duplicate-id",
			message: `Id ${id} is used by ${names.join(", ")}.`,
			path: `${meta?.file || role} Id ${id}`,
			recommend: "fix",
			value: id,
			suggestions: [next],
			fixes: names.slice(1).map((name) => ({
				type: "ecf-set",
				role,
				name,
				field: "Id",
				value: next,
				label: `Give ${name} Id ${next}`
			}))
		});
	}
	for (const [name, count] of byName) {
		if (count < 2) continue;
		push({
			id: null,
			kind: "file",
			source: role,
			href: hrefFor(role),
			level: "error",
			code: "duplicate-name",
			message: `${meta?.label || role} name “${name}” appears ${count} times.`,
			path: name,
			recommend: "review",
			suggestions: [],
			fixes: []
		});
	}
}
function validateDialogues(catalog, push) {
	if (!catalog.texts.some((t) => t.role === "dialogues")) return;
	const doc = dialogueDocFor(catalog);
	const names = new Set(doc.states.map((s) => s.name.toLowerCase()));
	for (const state of doc.states) {
		if (!state.name) {
			push({
				id: null,
				kind: "file",
				source: "dialogues",
				href: "/dialogues",
				level: "error",
				code: "empty-name",
				message: "A dialogue state has no name.",
				path: "Dialogues.ecf",
				recommend: "review",
				suggestions: [],
				fixes: []
			});
			continue;
		}
		if (state.npcName && !resolveCatalogToken(catalog, state.npcName, ["entity", "faction"]) && state.npcName !== "Player") {
			const suggestions = suggestionsFor(catalog, ["entity"], state.npcName, 3).map((e) => e.name);
			push({
				id: null,
				kind: "file",
				source: "dialogues",
				href: "/dialogues",
				level: "warning",
				code: "npc",
				message: `${state.name} NPC “${state.npcName}” is not in EClassConfig.`,
				path: `${state.name}.NPCName`,
				recommend: suggestions.length ? "fix" : "review",
				value: state.npcName,
				suggestions,
				fixes: []
			});
		}
		for (const opt of state.options) if (opt.next && !names.has(opt.next.toLowerCase()) && opt.next.toLowerCase() !== "end") push({
			id: null,
			kind: "file",
			source: "dialogues",
			href: "/dialogues",
			level: "warning",
			code: "next",
			message: `${state.name} option jumps to missing state “${opt.next}”.`,
			path: `${state.name}.OptionNext`,
			recommend: "review",
			value: opt.next,
			suggestions: [...names].slice(0, 4),
			fixes: []
		});
		for (const next of state.nexts) if (next.next && !names.has(next.next.toLowerCase()) && next.next.toLowerCase() !== "end") push({
			id: null,
			kind: "file",
			source: "dialogues",
			href: "/dialogues",
			level: "warning",
			code: "next",
			message: `${state.name} Next “${next.next}” is not a dialogue state.`,
			path: `${state.name}.Next`,
			recommend: "review",
			value: next.next,
			suggestions: [],
			fixes: []
		});
	}
}
function validatePlayfields(catalog, push) {
	const bundles = bundlePlayfields(catalog.texts ?? []);
	for (const bundle of bundles.slice(0, 80)) for (const file of bundle.files) {
		const local = preflightPlayfield(file, catalog);
		for (const issue of local) {
			const fixes = issue.fixFrom && issue.fixTo ? [{
				type: "yaml-replace",
				role: "playfieldYaml",
				path: file.path,
				from: issue.fixFrom,
				to: issue.fixTo,
				label: `Use ${issue.fixTo}`
			}] : [];
			push({
				id: null,
				kind: "file",
				source: "playfields",
				href: "/library/playfields",
				level: issue.level,
				code: issue.code,
				message: `${bundle.name}: ${issue.message}`,
				path: `${file.path} · ${issue.path}`,
				recommend: fixes.length ? "fix" : "review",
				suggestions: issue.fixTo ? [issue.fixTo] : [],
				fixes,
				value: issue.fixFrom
			});
		}
	}
}
function playfieldChoices(catalog, query, limit = 3) {
	const q = query.trim().toLowerCase();
	const cq = compactToken(q);
	const scored = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of [...catalog.entries, ...catalog.game ?? []]) {
		if (entry.kind !== "playfield") continue;
		const name = entry.name.trim();
		const key = name.toLowerCase();
		if (!name || seen.has(key) || key === q) continue;
		seen.add(key);
		const cn = compactToken(name);
		let score = 0;
		if (cn && cq && cn === cq) score = 90;
		else if (cq.length >= 4 && cn.length >= 4 && (cn.includes(cq) || cq.includes(cn))) {
			if (Math.min(cq.length, cn.length) / Math.max(cq.length, cn.length) >= .62) score = 70;
		}
		if (score) scored.push({
			name,
			score
		});
	}
	scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
	return scored.slice(0, limit).map((row) => row.name);
}
function validateGalaxy(catalog, push) {
	const stars = objectsFor(catalog, "galaxy").filter((o) => isStarType(o));
	const sectorText = catalog.texts.find((t) => t.role === "sectors")?.text || "";
	if (stars.length) for (const star of stars) {
		const mix = parseStarMix(star.fields);
		const sum = mix.reduce((n, row) => n + (Number(row.prob) || 0), 0);
		if (mix.length && sum && Math.abs(sum - 1) > .08 && Math.abs(sum - 100) > 8) push({
			id: null,
			kind: "file",
			source: "galaxy",
			href: "/library/galaxy",
			level: "warning",
			code: "star-mix",
			message: `${star.name} StarClass mix probabilities sum to ${sum}, not 1 or 100.`,
			path: star.name,
			recommend: "review",
			suggestions: [],
			fixes: []
		});
	}
	if (!sectorText) return;
	const bodies = parseSectorBodies(sectorText);
	const systems = groupSystems(bodies);
	const usableStars = stars.filter((star) => starZoneSpans(star).length);
	const fallbackStar = usableStars[0];
	for (const star of usableStars.slice(0, 8)) {
		const klass = (star.fields.StarClass || "").toLowerCase();
		const system = (klass ? systems.find((s) => (s.starClass || "").toLowerCase() === klass) : void 0) || (star === fallbackStar ? systems.find((s) => !s.starClass) || systems[0] : void 0);
		if (!system) continue;
		const issues = diagnoseOrbits(star, overlayBodies(star, system.bodies));
		for (const issue of issues.slice(0, 40)) {
			const zone = issue.expectedZone === "parent" ? "its planet" : STAR_ZONES.find((z) => z.key === issue.expectedZone)?.label ?? "its band";
			const coord = formatCoords(issue.suggested);
			const fixes = issue.movable ? [{
				type: "orbit-move",
				role: "sectors",
				path: catalog.texts.find((t) => t.role === "sectors")?.path || "Sectors.yaml",
				name: issue.body.name,
				coords: issue.suggested,
				label: `Move to ${zone} (${coord})`
			}] : [];
			push({
				id: null,
				kind: "file",
				source: "galaxy",
				href: "/library/galaxy",
				level: "warning",
				code: "orbit",
				message: `${system.name}: ${issue.body.name} — ${issue.reason}`,
				path: `${system.name} · ${issue.body.name}`,
				recommend: fixes.length ? "fix" : "review",
				suggestions: fixes.length ? [`${zone} at ${issue.suggestedDistance.toFixed(0)} sectors`] : [],
				value: coord,
				fixes
			});
		}
	}
	const playfields = new Set([...catalog.entries, ...catalog.game ?? []].filter((e) => e.kind === "playfield").map((e) => e.name.toLowerCase()));
	if (playfields.size) {
		const sectorPath = catalog.texts.find((t) => t.role === "sectors")?.path || "Sectors.yaml";
		const missing = [];
		for (const body of bodies) {
			const folder = (body.name || "").trim();
			if (!folder || /sun|star|asteroid/i.test(body.kind || "")) continue;
			if (playfields.has(folder.toLowerCase())) continue;
			missing.push(folder);
		}
		for (const folder of missing.slice(0, 16)) {
			const choices = playfieldChoices(catalog, folder, 3);
			push({
				id: null,
				kind: "file",
				source: "sectors",
				href: "/library/playfields",
				level: "warning",
				code: "playfield-missing",
				message: choices.length ? `${folder} is in Sectors.yaml but there is no Playfields folder with that name.` : `${folder} is in Sectors.yaml but no Playfields folder is close to that name.`,
				path: `Sectors.yaml · ${folder}`,
				recommend: choices.length ? "fix" : "review",
				suggestions: choices,
				value: folder,
				fixes: choices.map((name) => ({
					type: "sector-rename",
					role: "sectors",
					path: sectorPath,
					from: folder,
					to: name,
					label: `Use ${name}`
				}))
			});
		}
		if (missing.length > 16) push({
			id: null,
			kind: "file",
			source: "sectors",
			href: "/library/playfields",
			level: "warning",
			code: "playfield-missing",
			message: `${missing.length} Sectors.yaml bodies have no Playfields folder.`,
			path: "Sectors.yaml",
			recommend: "review",
			suggestions: [],
			fixes: []
		});
	}
}
function validateLocalization(catalog, push) {
	const table = localizationTable(catalog);
	const keys = Object.keys(table.rows);
	if (!keys.length) return;
	const path = catalogText(catalog, "localization")?.path || "Localization.csv";
	const languages = table.languages.length ? table.languages : ["English"];
	const empty = [];
	for (const key of keys) {
		const rec = table.rows[key] ?? {};
		if ((rec.English || rec.english || "").trim()) continue;
		empty.push({
			key,
			...suggestEnglishText(key, rec, languages)
		});
	}
	for (const row of empty.slice(0, 40)) {
		const from = row.from === "key" ? `the key “${row.text}”` : `${row.from} text`;
		push({
			id: null,
			kind: "file",
			source: "localization",
			href: "/library",
			level: "warning",
			code: "empty-loca",
			message: `Localization key “${row.key}” has no English text. Suggested ${from}: “${row.text}”.`,
			path: row.key,
			recommend: "fix",
			suggestions: [row.text],
			value: row.text,
			fixes: [{
				type: "loca-english",
				role: "localization",
				path,
				key: row.key,
				label: row.from === "key" ? `Use “${row.text}”` : `Copy ${row.from} into English`
			}]
		});
	}
	if (empty.length > 1) push({
		id: null,
		kind: "file",
		source: "localization",
		href: "/library",
		level: "warning",
		code: "empty-loca",
		message: `${empty.length} Localization.csv keys have no English text.`,
		path: "Localization.csv",
		recommend: "fix",
		suggestions: empty.slice(0, 4).map((row) => row.text),
		fixes: [{
			type: "loca-english",
			role: "localization",
			path,
			key: "",
			label: "Fill every empty English cell"
		}]
	});
}
function slimCatalog(catalog) {
	return {
		folderName: catalog.folderName,
		files: catalog.files,
		entries: catalog.entries.filter((e) => e.kind !== "picture").map((e) => ({
			kind: e.kind,
			name: e.name,
			label: e.label,
			poiGroup: e.poiGroup,
			poiFile: e.poiFile,
			source: e.source
		})),
		texts: (catalog.texts ?? []).filter((t) => t.role === "localization"),
		indexedAt: catalog.indexedAt
	};
}
function runHeavy(op, payload) {
	if (op === "index") {
		const indexed = indexScenario(payload.files || [], payload.kind);
		return {
			...indexed,
			catalog: {
				...indexed.catalog,
				texts: []
			}
		};
	}
	if (op === "importPda") {
		if (!payload.importFiles?.yamlText) throw new Error("No PDA.yaml to parse.");
		return importPda(payload.importFiles);
	}
	if (op === "validate") {
		const issues = validateProject(payload.project, payload.catalog);
		return {
			issues,
			stats: problemStats(issues)
		};
	}
	if (op === "validateFiles") {
		const source = payload.source || "pda";
		const issues = validateCatalog(payload.catalog, source);
		return {
			issues,
			stats: problemStats(issues)
		};
	}
	throw new Error(`Unknown heavy op ${op}`);
}
var worker;
var seq = 0;
var pending = /* @__PURE__ */ new Map();
function getWorker() {
	if (typeof window === "undefined" || typeof Worker === "undefined") return null;
	if (worker === void 0) try {
		worker = new Worker(new URL("./heavy.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (event) => {
			const job = pending.get(event.data.id);
			if (!job) return;
			pending.delete(event.data.id);
			if (event.data.ok) job.resolve(event.data.result);
			else job.reject(new Error(event.data.error));
		};
		worker.onerror = () => {
			worker?.terminate();
			worker = null;
		};
	} catch {
		worker = null;
	}
	return worker;
}
function call(op, payload, markBusy = true) {
	if (markBusy) beginBusy("think");
	const w = getWorker();
	const done = (run) => run.finally(() => {
		if (markBusy) endBusy("think");
	});
	if (!w) return done(Promise.resolve(runHeavy(op, payload)));
	const id = ++seq;
	return done(new Promise((resolve, reject) => {
		pending.set(id, {
			resolve: (value) => resolve(value),
			reject
		});
		w.postMessage({
			id,
			op,
			payload
		});
	}));
}
function indexScenarioOffthread(files, kind) {
	return call("index", {
		files: files.map((file) => {
			const text = textForIndex(file.path, file.text);
			if (!text) return {
				path: file.path,
				meta: file.meta
			};
			if (/\bPlayfields?\b/i.test(file.path) && /playfield.*\.ya?ml$/i.test(file.path)) return { path: file.path };
			return {
				path: file.path,
				text,
				meta: file.meta
			};
		}),
		kind
	}).then((indexed) => ({
		...indexed,
		catalog: {
			...indexed.catalog,
			texts: collectCatalogTexts(files, kind)
		}
	}));
}
function importPdaOffthread(files) {
	return call("importPda", { importFiles: files });
}
function validateOffthread(project, catalog) {
	return call("validate", {
		project,
		catalog: slimCatalog(catalog)
	}, false);
}
function validateFilesOffthread(catalog, source) {
	return call("validateFiles", {
		catalog: slimCatalogForSource(catalog, source),
		source
	}, false);
}
function readPct(done, total) {
	if (!total) return 0;
	return Math.round(done / total * 70);
}
function areaPercent(snap) {
	if (snap.phase === "done") return 100;
	return Math.max(0, Math.min(100, snap.pct));
}
var useImportProgress = create((set) => ({
	areas: {},
	reset: (totals) => {
		const areas = {};
		for (const [key, total] of Object.entries(totals)) {
			if (!total) continue;
			areas[key] = {
				total,
				done: 0,
				phase: "queued",
				pct: 0
			};
		}
		set({ areas });
	},
	tick: (kind, n = 1) => set((s) => {
		const cur = s.areas[kind];
		if (!cur || cur.phase === "done") return s;
		const done = Math.min(cur.total, cur.done + n);
		return { areas: {
			...s.areas,
			[kind]: {
				...cur,
				done,
				phase: "work",
				pct: Math.max(cur.pct, readPct(done, cur.total))
			}
		} };
	}),
	boost: (kind, pct) => set((s) => {
		const cur = s.areas[kind];
		if (!cur || cur.phase === "done") return s;
		return { areas: {
			...s.areas,
			[kind]: {
				...cur,
				phase: "work",
				pct: Math.max(cur.pct, Math.min(99, pct))
			}
		} };
	}),
	boostAll: (pct) => set((s) => {
		const areas = {};
		for (const [key, cur] of Object.entries(s.areas)) {
			if (!cur) continue;
			if (cur.phase === "done") areas[key] = cur;
			else areas[key] = {
				...cur,
				phase: "work",
				pct: Math.max(cur.pct, Math.min(99, pct))
			};
		}
		return { areas };
	}),
	finish: (kind) => set((s) => {
		if (kind) {
			const cur = s.areas[kind];
			if (!cur) return s;
			return { areas: {
				...s.areas,
				[kind]: {
					...cur,
					done: cur.total,
					phase: "done",
					pct: 100
				}
			} };
		}
		const areas = {};
		for (const [key, cur] of Object.entries(s.areas)) {
			if (!cur) continue;
			areas[key] = {
				...cur,
				done: cur.total,
				phase: "done",
				pct: 100
			};
		}
		return { areas };
	}),
	clear: () => set({ areas: {} })
}));
function imageSetFor(path, kind) {
	const role = classifyScenarioPath(path, kind);
	if (role === "wallpaper") return "wallpaper";
	if (role === "itemPicture") return "item";
	return "pda";
}
function importReport(catalog, prefix) {
	const { missing, loaded } = catalogLoadSummary(catalog);
	const bits = [prefix];
	if (loaded.length) bits.push(`${loaded.length} config bodies stored`);
	if (missing.length) bits.push(`still need ${missing.join(", ")}`);
	return bits.join(" · ");
}
function findContext(project, id) {
	if (!id) return null;
	for (let ci = 0; ci < project.chapters.length; ci++) {
		const chapter = project.chapters[ci];
		if (chapter.id === id) return {
			kind: "chapter",
			ci,
			chapter
		};
		for (let ti = 0; ti < chapter.tasks.length; ti++) {
			const task = chapter.tasks[ti];
			if (task.id === id) return {
				kind: "task",
				ci,
				ti,
				chapter,
				task
			};
			for (let ai = 0; ai < task.actions.length; ai++) {
				const action = task.actions[ai];
				if (action.id === id) return {
					kind: "action",
					ci,
					ti,
					ai,
					chapter,
					task,
					action
				};
			}
		}
	}
	return null;
}
function retag(value) {
	const walk = (node) => {
		if (Array.isArray(node)) return node.map(walk);
		if (node && typeof node === "object") {
			const copy = {};
			for (const [k, v] of Object.entries(node)) copy[k] = k === "id" ? crypto.randomUUID() : walk(v);
			return copy;
		}
		return node;
	};
	return walk(value);
}
var usePdaStore = create()(persist((set, get) => ({
	project: blankProject(),
	catalog: emptyCatalog(),
	selected: null,
	query: "",
	category: "all",
	collapsed: [],
	importOpen: false,
	ignoredProblems: [],
	setQuery: (query) => set({ query }),
	setLanguage: (language) => set((s) => {
		const proj = structuredClone(s.project);
		proj.language = language;
		for (const ch of proj.chapters) {
			if (ch.titleKey) ch.chapterTitle = csvLookup(proj.csv, ch.titleKey, language) || ch.chapterTitle;
			if (ch.descriptionKey) ch.description = csvLookup(proj.csv, ch.descriptionKey, language) || ch.description;
			if (ch.preambleKey) ch.preamble = csvLookup(proj.csv, ch.preambleKey, language) || ch.preamble;
			for (const tk of ch.tasks) {
				if (tk.titleKey) tk.taskTitle = csvLookup(proj.csv, tk.titleKey, language) || tk.taskTitle;
				if (tk.startMessageKey) tk.startMessage = csvLookup(proj.csv, tk.startMessageKey, language) || tk.startMessage;
				for (const ac of tk.actions) {
					if (ac.titleKey) ac.actionTitle = csvLookup(proj.csv, ac.titleKey, language) || ac.actionTitle;
					if (ac.descriptionKey) ac.description = csvLookup(proj.csv, ac.descriptionKey, language) || ac.description;
				}
			}
		}
		return { project: proj };
	}),
	setCategory: (category) => set({ category }),
	select: (selected) => set({ selected }),
	toggleCollapsed: (id) => set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((x) => x !== id) : [...s.collapsed, id] })),
	setImportOpen: (importOpen) => set({ importOpen }),
	replaceProject: (project) => set({
		project,
		selected: null,
		collapsed: project.chapters.map((c) => c.id)
	}),
	importFiles: (files) => {
		importPdaOffthread(files).then((project) => get().replaceProject(project));
	},
	importScenario: (files) => {
		get().ingestSources("scenario", files);
	},
	ingestSources: async (kind, files) => {
		beginBusy("load", "Indexing scenario…");
		try {
			if (!files.length) throw new Error("No matching files in that drop.");
			setBusyDetail(`Indexing ${files.length} files…`, 8);
			useImportProgress.getState().boostAll(72);
			const split = partitionContent(files, get().catalog.folderName);
			const scenarioFiles = split.scenario;
			const indexed = scenarioFiles.length ? await indexScenarioOffthread(scenarioFiles, kind) : { catalog: emptyCatalog() };
			useImportProgress.getState().boostAll(78);
			let catalog = scenarioFiles.length ? mergeCatalog(get().catalog, indexed.catalog) : get().catalog;
			if (split.active) catalog = {
				...catalog,
				folderName: split.active
			};
			if (split.game.length) {
				setBusyDetail(`Indexing main game reference…`, 40);
				const gameIndexed = await indexScenarioOffthread(split.game, "scenario");
				catalog = {
					...catalog,
					game: gameIndexed.catalog.entries.filter((entry) => entry.kind !== "picture" || entry.group === "item"),
					indexedAt: Date.now()
				};
			}
			const texts = catalog.texts ?? [];
			if (texts.length) {
				setBusyDetail(`Saving ${texts.length} configs…`, 30);
				try {
					await putCatalogTexts(texts, (done, total) => {
						const pct = 78 + Math.round(done / Math.max(1, total) * 12);
						setBusyDetail(`Saving configs ${done}/${total}`, 30 + Math.round(done / Math.max(1, total) * 25));
						const text = texts[done - 1];
						const area = text ? areaForRole(text.role) : null;
						const prog = useImportProgress.getState();
						prog.boostAll(pct);
						if (area) prog.boost(area, Math.min(94, pct + 4));
					});
				} catch (err) {
					console.warn("Could not persist catalog texts", err);
				}
			}
			const imageFiles = scenarioFiles.filter((file) => {
				const role = classifyScenarioPath(file.path, kind);
				return (role === "picture" || role === "itemPicture") && file.blob;
			});
			const wallpaperFiles = scenarioFiles.filter((file) => classifyScenarioPath(file.path, kind) === "wallpaper" && file.blob);
			const storeIcons = async () => {
				if (!imageFiles.length) return;
				setBusyDetail(`Storing ${imageFiles.length} icons…`, 60);
				await putImages(imageFiles.map((file) => ({
					path: file.path,
					blob: file.blob,
					set: imageSetFor(file.path, kind)
				})), (done, total) => {
					const pct = 88 + Math.round(done / Math.max(1, total) * 10);
					setBusyDetail(`Storing icons ${done}/${total}`, 60 + Math.round(done / Math.max(1, total) * 25));
					const prog = useImportProgress.getState();
					prog.boost("itemImages", pct);
					prog.boost("pdaImages", pct);
				});
			};
			const csvOnly = kind === "pdaCsv" || kind !== "scenario" && kind !== "pdaYaml" && indexed.pda?.csvText && !indexed.pda.yamlText;
			if (kind === "pdaCsv" || csvOnly) {
				const csvText = indexed.pda?.csvText || files.find((f) => classifyScenarioPath(f.path, kind) === "pdaCsv")?.text;
				if (!csvText) throw new Error("No PDA.csv in that drop.");
				const project = structuredClone(get().project);
				applyCsvText(project, csvText, indexed.pda?.csvName);
				set({
					project,
					catalog
				});
				await storeIcons();
				if (wallpaperFiles.length) putImages(wallpaperFiles.map((file) => ({
					path: file.path,
					blob: file.blob,
					set: "wallpaper"
				})));
				setBusyDetail("Import finished", 100);
				return importReport(catalog, `Merged ${Object.keys(project.csv.rows).length} CSV keys.`);
			}
			if (indexed.pda?.yamlText) {
				setBusyDetail("Parsing PDA.yaml…", 55);
				const existingCsv = !indexed.pda.csvText && Object.keys(get().project.csv.rows).length ? stringifyCsv(get().project.csv) : indexed.pda.csvText;
				const project = await importPdaOffthread({
					yamlText: indexed.pda.yamlText,
					yamlName: indexed.pda.yamlName,
					csvText: existingCsv,
					csvName: indexed.pda.csvName
				});
				if (catalog.folderName && (project.name === "Imported scenario" || project.name === "PDA")) project.name = catalog.folderName;
				get().replaceProject(project);
				set({ catalog });
				await storeIcons();
				if (wallpaperFiles.length) putImages(wallpaperFiles.map((file) => ({
					path: file.path,
					blob: file.blob,
					set: "wallpaper"
				})));
				setBusyDetail("Import finished", 100);
				return importReport(catalog, `Loaded ${project.chapters.length} chapters from ${indexed.pda.yamlName || "PDA.yaml"}.`);
			}
			if (kind === "pdaYaml") throw new Error("No PDA.yaml found.");
			set({ catalog });
			await storeIcons();
			if (wallpaperFiles.length) putImages(wallpaperFiles.map((file) => ({
				path: file.path,
				blob: file.blob,
				set: "wallpaper"
			})));
			const added = indexed.catalog.files.length;
			const pics = imageFiles.length;
			const gameNote = catalog.game?.length ? ` · main game reference ${catalog.game.length} names` : "";
			const ignoredNote = split.ignored.length ? ` · ignored other scenarios: ${split.ignored.slice(0, 6).join(", ")}` : "";
			setBusyDetail("Import finished", 100);
			return importReport(catalog, `Indexed ${added} file${added === 1 ? "" : "s"}${pics ? ` · ${pics} images stored` : ""}${gameNote}${ignoredNote}.`);
		} finally {
			endBusy("load");
		}
	},
	clearImageSet: async (imageSet) => {
		await clearImages(imageSet);
		if (imageSet === "pda" || imageSet === "item") set({ catalog: dropCatalogGroup(get().catalog, imageSet) });
	},
	setCatalog: (catalog) => set({ catalog }),
	setCatalogText: (role, text, path) => set((s) => {
		const texts = [...s.catalog.texts ?? []];
		const i = path ? texts.findIndex((t) => t.role === role && t.path === path) : -1;
		const at = i >= 0 ? i : texts.findIndex((t) => t.role === role);
		if (at >= 0) texts[at] = {
			...texts[at],
			text,
			path: path || texts[at].path
		};
		else texts.push({
			role,
			path: path || role,
			text
		});
		putCatalogTexts([texts[at >= 0 ? at : texts.length - 1]]);
		const files = [...s.catalog.files];
		if (!files.some((f) => f.role === role && (!path || f.path === path))) files.push({
			role,
			path: path || role,
			count: 1
		});
		return { catalog: {
			...s.catalog,
			texts,
			files,
			indexedAt: Date.now()
		} };
	}),
	removeCatalogText: (role, path) => set((s) => {
		deleteCatalogText(role, path);
		return { catalog: {
			...s.catalog,
			texts: (s.catalog.texts ?? []).filter((text) => !(text.role === role && text.path === path)),
			files: s.catalog.files.filter((file) => !(file.role === role && file.path === path)),
			indexedAt: Date.now()
		} };
	}),
	patchChapter: (id, patch) => set((s) => ({ project: {
		...s.project,
		chapters: s.project.chapters.map((c) => c.id === id ? {
			...c,
			...patch
		} : c)
	} })),
	updateSelected: (mut) => set((s) => {
		const next = {
			...s.project,
			chapters: structuredClone(s.project.chapters)
		};
		mut(next);
		return { project: next };
	}),
	addChapter: (category) => set((s) => {
		const ch = newChapter();
		if (category) ch.category = category;
		else if (s.category && s.category !== "all") ch.category = s.category;
		return {
			project: {
				...s.project,
				chapters: [...s.project.chapters, ch]
			},
			selected: {
				kind: "chapter",
				id: ch.id
			},
			collapsed: s.collapsed.filter((id) => id !== ch.id && id !== `cat:${ch.category}`)
		};
	}),
	addTask: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id) ?? { chapter: s.project.chapters[0] };
		if (!("chapter" in ctx) || !ctx.chapter) {
			const ch = newChapter();
			return {
				project: {
					...s.project,
					chapters: [...s.project.chapters, ch]
				},
				selected: {
					kind: "chapter",
					id: ch.id
				}
			};
		}
		const tk = newTask();
		const chapters = s.project.chapters.map((c) => c.id === ctx.chapter.id ? {
			...c,
			tasks: [...c.tasks, tk]
		} : c);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "task",
				id: tk.id
			}
		};
	}),
	addAction: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		const task = ctx && "task" in ctx ? ctx.task : ctx?.chapter.tasks.at(-1);
		const chapter = ctx?.chapter ?? s.project.chapters[0];
		if (!task || !chapter) return s;
		const ac = newAction();
		const chapters = s.project.chapters.map((c) => c.id === chapter.id ? {
			...c,
			tasks: c.tasks.map((t) => t.id === task.id ? {
				...t,
				actions: [...t.actions, ac]
			} : t)
		} : c);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "action",
				id: ac.id
			}
		};
	}),
	duplicateSelected: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		if (!ctx) return s;
		const chapters = s.project.chapters.map((c) => ({
			...c,
			tasks: c.tasks.map((t) => ({
				...t,
				actions: [...t.actions]
			}))
		}));
		if (ctx.kind === "chapter") {
			const copy = retag(ctx.chapter);
			copy.chapterTitle += " copy";
			chapters.splice(ctx.ci + 1, 0, copy);
			return {
				project: {
					...s.project,
					chapters
				},
				selected: {
					kind: "chapter",
					id: copy.id
				}
			};
		}
		if (ctx.kind === "task") {
			const copy = retag(ctx.task);
			copy.taskTitle += " copy";
			chapters[ctx.ci].tasks.splice(ctx.ti + 1, 0, copy);
			return {
				project: {
					...s.project,
					chapters
				},
				selected: {
					kind: "task",
					id: copy.id
				}
			};
		}
		const copy = retag(ctx.action);
		copy.actionTitle += " copy";
		chapters[ctx.ci].tasks[ctx.ti].actions.splice(ctx.ai + 1, 0, copy);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "action",
				id: copy.id
			}
		};
	}),
	deleteSelected: () => {
		const id = get().selected?.id;
		if (id) get().deleteNodes([id]);
	},
	deleteNodes: (ids) => set((s) => {
		const drop = new Set(ids);
		if (!drop.size) return s;
		const selectedId = s.selected?.id;
		const chapters = s.project.chapters.filter((c) => !drop.has(c.id)).map((c) => ({
			...c,
			tasks: c.tasks.filter((t) => !drop.has(t.id)).map((t) => ({
				...t,
				actions: t.actions.filter((a) => !drop.has(a.id))
			}))
		}));
		const still = selectedId && findContext({
			...s.project,
			chapters
		}, selectedId);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: still ? s.selected : null
		};
	}),
	patchNode: (id, patch) => set((s) => {
		const ctx = findContext(s.project, id);
		if (!ctx) return s;
		const chapters = s.project.chapters.map((c) => {
			if (ctx.kind === "chapter" && c.id === id) return {
				...c,
				...patch
			};
			if (c.id !== ctx.chapter.id) return c;
			return {
				...c,
				tasks: c.tasks.map((t) => {
					if (ctx.kind === "task" && t.id === id) return {
						...t,
						...patch
					};
					if (ctx.kind !== "action" || t.id !== ctx.task.id) return t;
					return {
						...t,
						actions: t.actions.map((a) => a.id === id ? {
							...a,
							...patch
						} : a)
					};
				})
			};
		});
		return { project: {
			...s.project,
			chapters
		} };
	}),
	applyBulk: (patches, deleteIds = []) => set((s) => {
		const drop = new Set(deleteIds);
		const map = new Map(patches.map((p) => [p.id, p.patch]));
		if (!drop.size && !map.size) return s;
		const chapters = s.project.chapters.filter((c) => !drop.has(c.id)).map((c) => {
			const chapter = map.has(c.id) ? {
				...c,
				...map.get(c.id)
			} : c;
			return {
				...chapter,
				tasks: chapter.tasks.filter((t) => !drop.has(t.id)).map((t) => {
					const task = map.has(t.id) ? {
						...t,
						...map.get(t.id)
					} : t;
					return {
						...task,
						actions: task.actions.filter((a) => !drop.has(a.id)).map((a) => map.has(a.id) ? {
							...a,
							...map.get(a.id)
						} : a)
					};
				})
			};
		});
		const selectedId = s.selected?.id;
		const still = selectedId && findContext({
			...s.project,
			chapters
		}, selectedId);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: still ? s.selected : null
		};
	}),
	applyFileFix: (fix) => {
		if (fix.type === "ecf-set") {
			const current = catalogText(get().catalog, fix.role);
			if (!current?.text) return;
			get().setCatalogText(fix.role, applyEcfFix(current.text, fix.name, fix.field, fix.value), current.path);
			return;
		}
		if (fix.type === "yaml-replace") {
			const texts = get().catalog.texts ?? [];
			const current = texts.find((t) => t.role === fix.role && t.path === fix.path) ?? texts.find((t) => t.role === fix.role);
			if (!current?.text) return;
			get().setCatalogText(fix.role, applyYamlReplace(current.text, fix.from, fix.to), current.path);
			return;
		}
		if (fix.type === "csv-pad") {
			const texts = get().catalog.texts ?? [];
			const current = texts.find((t) => t.role === fix.role && t.path === fix.path) ?? texts.find((t) => t.role === fix.role);
			if (!current?.text) return;
			get().setCatalogText(fix.role, padCsvColumns(current.text, fix.line), current.path);
			return;
		}
		if (fix.type === "orbit-move") {
			get().applyFileFixes([fix]);
			return;
		}
		if (fix.type === "loca-english") {
			const texts = get().catalog.texts ?? [];
			const current = texts.find((t) => t.role === fix.role && t.path === fix.path) ?? texts.find((t) => t.role === fix.role);
			if (!current?.text) return;
			get().setCatalogText(fix.role, fillLocalizationEnglish(current.text, fix.key), current.path);
			return;
		}
		if (fix.type === "sector-rename") {
			const texts = get().catalog.texts ?? [];
			const current = texts.find((t) => t.role === fix.role && t.path === fix.path) ?? texts.find((t) => t.role === fix.role);
			if (!current?.text) return;
			get().setCatalogText(fix.role, renameSectorBody(current.text, fix.from, fix.to), current.path);
		}
	},
	applyFileFixes: (fixes) => {
		const orbits = fixes.filter((fix) => fix.type === "orbit-move");
		const rest = fixes.filter((fix) => fix.type !== "orbit-move");
		const grouped = /* @__PURE__ */ new Map();
		for (const fix of orbits) {
			const key = `${fix.role}\n${fix.path}`;
			const hit = grouped.get(key) ?? {
				role: fix.role,
				path: fix.path,
				moves: []
			};
			hit.moves.push({
				name: fix.name,
				coords: fix.coords
			});
			grouped.set(key, hit);
		}
		for (const group of grouped.values()) {
			const texts = get().catalog.texts ?? [];
			const current = texts.find((t) => t.role === group.role && t.path === group.path) ?? texts.find((t) => t.role === group.role);
			if (!current?.text) continue;
			get().setCatalogText(group.role, applyOrbitFixes(current.text, group.moves), current.path);
		}
		for (const fix of rest) get().applyFileFix(fix);
	},
	ignoreProblems: (keys) => set((s) => ({ ignoredProblems: [.../* @__PURE__ */ new Set([...s.ignoredProblems, ...keys.filter(Boolean)])] })),
	unignoreProblems: (keys) => set((s) => {
		const drop = new Set(keys);
		return { ignoredProblems: s.ignoredProblems.filter((k) => !drop.has(k)) };
	}),
	jumpTo: (id) => set((s) => {
		const ctx = findContext(s.project, id);
		if (!ctx) return s;
		const catId = `cat:${ctx.chapter.category || "Uncategorized"}`;
		let collapsed = s.collapsed.filter((x) => x !== ctx.chapter.id && x !== catId);
		if (ctx.kind === "task" || ctx.kind === "action") {
			const openId = `open:${ctx.task.id}`;
			if (!collapsed.includes(openId)) collapsed = [...collapsed, openId];
		}
		return {
			selected: {
				kind: ctx.kind,
				id: ctx.kind === "chapter" ? ctx.chapter.id : ctx.kind === "task" ? ctx.task.id : ctx.action.id
			},
			collapsed
		};
	}),
	moveSelected: (dir) => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		if (!ctx) return s;
		const swap = (arr, i) => {
			const j = i + dir;
			if (j < 0 || j >= arr.length) return arr;
			const copy = [...arr];
			[copy[i], copy[j]] = [copy[j], copy[i]];
			return copy;
		};
		let chapters = s.project.chapters;
		if (ctx.kind === "chapter") chapters = swap(chapters, ctx.ci);
		if (ctx.kind === "task") chapters = chapters.map((c, i) => i === ctx.ci ? {
			...c,
			tasks: swap(c.tasks, ctx.ti)
		} : c);
		if (ctx.kind === "action") chapters = chapters.map((c, i) => i === ctx.ci ? {
			...c,
			tasks: c.tasks.map((t, ti) => ti === ctx.ti ? {
				...t,
				actions: swap(t.actions, ctx.ai)
			} : t)
		} : c);
		return { project: {
			...s.project,
			chapters
		} };
	}),
	reset: () => {
		clearCatalogTexts();
		set({
			project: blankProject(),
			catalog: emptyCatalog(),
			selected: null,
			collapsed: [],
			ignoredProblems: []
		});
	}
}), {
	name: "pulsepda.project.v3",
	storage: createJSONStorage(() => durableStorage),
	partialize: (s) => ({
		project: s.project,
		catalog: {
			folderName: s.catalog.folderName,
			files: s.catalog.files,
			indexedAt: s.catalog.indexedAt,
			entries: [],
			texts: [],
			game: (s.catalog.game ?? []).map((entry) => ({
				kind: entry.kind,
				name: entry.name,
				label: entry.label,
				poiGroup: entry.poiGroup,
				poiFile: entry.poiFile
			}))
		},
		selected: s.selected,
		collapsed: s.collapsed,
		category: s.category,
		ignoredProblems: s.ignoredProblems
	}),
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		return {
			...current,
			...saved,
			catalog: saved.catalog ?? emptyCatalog(),
			project: saved.project ?? current.project
		};
	},
	onRehydrateStorage: () => {
		beginBusy("load");
		return () => {
			(async () => {
				const cat = usePdaStore.getState().catalog;
				const stored = await loadCatalogTexts();
				if (!stored.length) {
					if (cat.texts?.length) await putCatalogTexts(cat.texts);
					return;
				}
				const sources = stored.map((t) => ({
					path: t.path,
					text: t.text
				}));
				for (const file of cat.files) if (file.role === "poi" || file.role === "playfieldYaml" || file.role === "picture" || file.role === "itemPicture") sources.push({ path: file.path });
				try {
					const indexed = await indexScenarioOffthread(sources, "scenario");
					const next = mergeCatalog({
						...cat,
						texts: stored,
						entries: []
					}, indexed.catalog);
					usePdaStore.setState({ catalog: {
						...next,
						texts: stored,
						folderName: cat.folderName || next.folderName,
						files: cat.files.length ? cat.files : next.files
					} });
				} catch {
					usePdaStore.setState({ catalog: {
						...cat,
						texts: stored
					} });
				}
			})().catch(() => {}).finally(() => {
				endBusy("load");
				warmImageCache();
			});
		};
	}
}));
function selectedContext(project, selected) {
	return findContext(project, selected?.id);
}
function hashSeed(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
	return h >>> 0;
}
function whenIdle(fn) {
	const ric = window.requestIdleCallback;
	if (typeof ric === "function") return ric(fn, { timeout: 2500 });
	return window.setTimeout(fn, 400);
}
function cancelIdle(id) {
	const cic = window.cancelIdleCallback;
	if (typeof cic === "function") cic(id);
	else window.clearTimeout(id);
}
function ScenarioWallpaper() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const indexedAt = usePdaStore((s) => s.catalog.indexedAt);
	const folder = usePdaStore((s) => s.catalog.folderName);
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		let idleId = 0;
		const delay = window.setTimeout(() => {
			idleId = whenIdle(() => {
				(async () => {
					try {
						const names = await listWallpaperNames();
						if (!alive || !names.length) {
							if (alive) setUrl(null);
							return;
						}
						const pick = names[hashSeed(`${pathname}|${folder}`) % names.length];
						const cached = peekImageUrl(pick);
						if (cached) {
							if (alive) setUrl(cached);
							return;
						}
						const next = await getImageUrl(pick);
						if (alive) setUrl(next);
					} catch {
						if (alive) setUrl(null);
					}
				})();
			});
		}, 350);
		return () => {
			alive = false;
			window.clearTimeout(delay);
			if (idleId) cancelIdle(idleId);
		};
	}, [
		pathname,
		indexedAt,
		folder
	]);
	if (!url) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "scenario-wallpaper",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: "",
			decoding: "async",
			className: "scenario-wallpaper-img"
		})
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function TooltipProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration: 250,
		skipDelayDuration: 400,
		children
	});
}
function Tooltip({ content, children, side = "bottom" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root3, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		asChild: true,
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
		side,
		className: cn("z-50 rounded-sm border border-border bg-elevated px-2 py-1 text-xs text-fg shadow"),
		children: [content, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow2, { className: "fill-elevated" })]
	}) })] });
}
var Route$16 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0a0c10"
			},
			{
				name: "description",
				content: "Local Empyrion PDA workshop. Import real YAML and CSV, keep extra fields, export clean files."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioWallpaper, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$15 = () => import("./routes-pQCEx9pi.mjs");
var Route$15 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./debug-Ba7hf1KY.mjs");
var Route$14 = createFileRoute("/debug")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./dialogues-CyAF2iq3.mjs");
var Route$13 = createFileRoute("/dialogues")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./export-CtUpy-s-.mjs");
var Route$12 = createFileRoute("/export")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./import-81DDoRrH.mjs");
var Route$11 = createFileRoute("/import")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./library-DX2pbMt0.mjs");
var Route$10 = createFileRoute("/library")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./library.index-DvoGhh5_.mjs");
var Route$9 = createFileRoute("/library/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./library.blocks-uzKwa7rJ.mjs");
var Route$8 = createFileRoute("/library/blocks")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./library.factions-D5EN3zml.mjs");
var Route$7 = createFileRoute("/library/factions")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./library.galaxy-Dr2tDPjd.mjs");
var Route$6 = createFileRoute("/library/galaxy")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./library.items-9k0J7_Le.mjs");
var Route$5 = createFileRoute("/library/items")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./library.playfields-YMti4ZA5.mjs");
var Route$4 = createFileRoute("/library/playfields")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./library.presets-CtUvYPkE.mjs");
var Route$3 = createFileRoute("/library/presets")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./library.reputation-BFFtcYOP.mjs");
var Route$2 = createFileRoute("/library/reputation")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./library.sectors-knRdGSZf.mjs");
var Route$1 = createFileRoute("/library/sectors")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./library.warfare-h1GAO3AO.mjs");
var Route = createFileRoute("/library/warfare")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$15.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$16
});
var DebugRoute = Route$14.update({
	id: "/debug",
	path: "/debug",
	getParentRoute: () => Route$16
});
var DialoguesRoute = Route$13.update({
	id: "/dialogues",
	path: "/dialogues",
	getParentRoute: () => Route$16
});
var ExportRoute = Route$12.update({
	id: "/export",
	path: "/export",
	getParentRoute: () => Route$16
});
var ImportRoute = Route$11.update({
	id: "/import",
	path: "/import",
	getParentRoute: () => Route$16
});
var LibraryRoute = Route$10.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => Route$16
});
var LibraryIndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => LibraryRoute
});
var LibraryRouteChildren = {
	LibraryBlocksRoute: Route$8.update({
		id: "/blocks",
		path: "/blocks",
		getParentRoute: () => LibraryRoute
	}),
	LibraryFactionsRoute: Route$7.update({
		id: "/factions",
		path: "/factions",
		getParentRoute: () => LibraryRoute
	}),
	LibraryGalaxyRoute: Route$6.update({
		id: "/galaxy",
		path: "/galaxy",
		getParentRoute: () => LibraryRoute
	}),
	LibraryItemsRoute: Route$5.update({
		id: "/items",
		path: "/items",
		getParentRoute: () => LibraryRoute
	}),
	LibraryPlayfieldsRoute: Route$4.update({
		id: "/playfields",
		path: "/playfields",
		getParentRoute: () => LibraryRoute
	}),
	LibraryPresetsRoute: Route$3.update({
		id: "/presets",
		path: "/presets",
		getParentRoute: () => LibraryRoute
	}),
	LibraryReputationRoute: Route$2.update({
		id: "/reputation",
		path: "/reputation",
		getParentRoute: () => LibraryRoute
	}),
	LibrarySectorsRoute: Route$1.update({
		id: "/sectors",
		path: "/sectors",
		getParentRoute: () => LibraryRoute
	}),
	LibraryWarfareRoute: Route.update({
		id: "/warfare",
		path: "/warfare",
		getParentRoute: () => LibraryRoute
	}),
	LibraryIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	DebugRoute,
	DialoguesRoute,
	ExportRoute,
	ImportRoute,
	LibraryRoute: LibraryRoute._addFileChildren(LibraryRouteChildren)
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { luminosityOf as $, setBusyDetail as $n, matchesClassFilter as $t, randomPoiPath as A, classifyScenarioPath as An, blankFunction as At, axisMax as B, kindLabel as Bn, uniqueDialogueName as Bt, catalogNames as C, warmImageCache as Cn, objectsFor as Ct, getPath as D, catalogCounts as Dn, SNIPPETS as Dt, fixedPoiPath as E, CHECK_TYPE_KINDS as En, writeLocalization as Et, STAR_REGION_STATS as F, scenarioFolderOf as Fn, mergeForeignDialogues as Ft, fluxLabel as G, stringifyEcfObjects as Gn, blockIdentity as Gt, clusterTicks as H, variantLabel as Hn, GALAXY_GENERAL_STATS as Ht, STAR_STATS as I, splitTokens as In, parseDialogueDoc as It, groupSystems as J, bbcodeToHtml as Jn, entityByName as Jt, formatCoords as K, stringifyCsv as Kn, classFieldValue as Kt, applyOrbitFixes as L, suggestionsFor as Ln, reindex as Lt, setPath as M, isOtherScenarioPath as Mn, gotoTarget as Mt, tabsForKind as N, lookupCatalog as Nn, isGotoReset as Nt, loadPlayfieldDoc as O, catalogLoaded as On, VAR_TYPES as Ot, STAR_MODELS as P, normalizePath as Pn, looksLikeKey as Pt, kindGroup as Q, endBusy as Qn, groupByEntityType as Qt, applyZoneDrag as R, bundlePlayfields as Rn, resolveDialogueText as Rt, asRows as S, resolveIconUrl as Sn, localizationTable as St, dumpPlayfieldDoc as T, CHECK_NAME_KINDS as Tn, writeDialoguesCsv as Tt, diagnoseOrbits as U, CONFIG_METAS as Un, TERRITORY_STATS as Ut, climateLabel as V, patchYamlField as Vn, ENTITY_CLASS_KEYS as Vt, fieldToHex as W, configMeta as Wn, WARFARE_STATS as Wt, inferClimate as X, stripBbcode as Xn, fieldIndex as Xt, hexToField as Y, decodePdaEscapes as Yn, entityClassLine as Yt, isStarType as Z, beginBusy as Zn, floatingBlocks as Zt, PLANET_TYPES as _, APP_SHORT as _n, catalogText as _t, usePdaStore as a, statsFor as an, placeBodyLabels as at, SPACE_VESSEL_COLS as b, iconCandidates as bn, dialogueStrings as bt, validateFilesOffthread as c, withTemplateInputs as cn, solarAdvice as ct, FILE_SCAN_ORDER as d, validateProject as dn, starZoneSpans as dt, numericIds as en, useBusyStore as er, overlayBodies as et, ASTEROID_COLS as f, IMPORT_SLOTS as fn, systemLuminosityWindow as ft, FIXED_RESOURCE_COLS as g, zoneWarnings as gt, FIXED_POI_COLS as h, CHECKS as hn, zoneHandleList as ht, selectedContext as i, similarBlocks as in, pickDefaultSystem as it, rowsToCells as j, isMainGameReference as jn, dialogueGroup as jt, preflightPlayfield as k, chooseScenarioFolder as kn, blankDialogue as kt, validateOffthread as l, counts as ln, solarFlux as lt, ENTITY_COLS as m, fileMatchesKind as mn, zoneAtDistance as mt, Tooltip as n, objectLabel as nn, parseStarMix as nt, areaPercent as o, templateInputs as on, rgbFromField as ot, BIOME_COLS as p, areaForRole as pn, writeStarMix as pt, formatLum as q, upsertCsv as qn, compareObjects as qt, cn as r, resolvedField as rn, physicsHabitableAU as rt, useImportProgress as s, unusedNumericIds as sn, sectorsToAu as st, router_exports as t, objectKey as tn, parseSectorBodies as tt, FILE_DEBUG_TABS as u, problemStats as un, spansToZoneFields as ut, RANDOM_POI_COLS as v, APP_SUBTITLE as vn, dialogueCsvTable as vt, cellsToRows as w, BUILTIN_NAMES as wn, writeDialogues as wt, SPAWN_ZONE_COLS as x, peekImageUrl as xn, locaLabel as xt, RANDOM_RESOURCE_COLS as y, getImageUrl as yn, dialogueDocFor as yt, auToSectors as z, keysForKind as zn, setGoto as zt };

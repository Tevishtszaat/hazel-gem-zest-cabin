import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { E as Box, _ as FileSpreadsheet, a as ScrollText, c as MessageSquare, d as LoaderCircle, g as FileUp, h as FolderOpen, i as Sun, m as Image, p as Landmark, r as Trash2, s as Package, u as Map, v as FileJson } from "../_libs/lucide-react.mjs";
import { $n as setBusyDetail, An as classifyScenarioPath, Dn as catalogCounts, Fn as scenarioFolderOf, Mn as isOtherScenarioPath, On as catalogLoaded, Pn as normalizePath, Qn as endBusy, Zn as beginBusy, a as usePdaStore, er as useBusyStore, fn as IMPORT_SLOTS, jn as isMainGameReference, kn as chooseScenarioFolder, mn as fileMatchesKind, o as areaPercent, pn as areaForRole, s as useImportProgress } from "./router-CQbUGop6.mjs";
import { n as Button, t as AppHeader } from "./button-Dk8gDvBQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-FfZX1qDR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAGIC = 2022986309;
var PROP_GROUP = 7;
var PROP_SPAWN = 16;
var TYPE_STRING = 0;
var HEADER_SCAN = 16384;
function read7Bit(view, o) {
	let value = 0;
	let shift = 0;
	for (let n = 0; n < 5; n++) {
		if (o.i >= view.byteLength) throw new Error("eof");
		const b = view.getUint8(o.i++);
		value |= (b & 127) << shift;
		if ((b & 128) === 0) return value;
		shift += 7;
	}
	throw new Error("7bit");
}
function readNetString(bytes, view, o) {
	const len = read7Bit(view, o);
	if (len < 0 || o.i + len > bytes.length) throw new Error("str");
	const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(o.i, o.i + len));
	o.i += len;
	return text;
}
function looksName(value) {
	const t = value.trim();
	return t.length >= 2 && t.length <= 80 && /^[\w][\w +\-./()[\]]*$/.test(t);
}
function readTaggedString(bytes, key) {
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
}
function parseEpbHeader(bytes, fileName = "") {
	const meta = { fileName: (fileName.split(/[/\\]/).pop() ?? fileName).replace(/\.epb$/i, "") };
	if (bytes.length < 16) return meta;
	if (new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true) !== MAGIC) return meta;
	meta.groupName = readTaggedString(bytes, PROP_GROUP);
	meta.spawnName = readTaggedString(bytes, PROP_SPAWN);
	return meta;
}
function relativeOf(file) {
	return file.webkitRelativePath || file.name;
}
function withPath(file, path) {
	if (file.webkitRelativePath) return file;
	try {
		Object.defineProperty(file, "webkitRelativePath", { value: path });
	} catch {}
	return file;
}
async function readDir(entry) {
	const reader = entry.createReader?.();
	if (!reader) return [];
	const all = [];
	for (;;) {
		const batch = await new Promise((resolve, reject) => {
			reader.readEntries(resolve, reject);
		});
		if (!batch.length) break;
		all.push(...batch);
	}
	return all;
}
async function walkEntry(entry, out) {
	if (entry.isFile && entry.file) {
		const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
		const path = normalizePath(entry.fullPath || entry.name).replace(/^\/+/, "");
		out.push(withPath(file, path));
		return;
	}
	if (entry.isDirectory) {
		const children = await readDir(entry);
		for (const child of children) await walkEntry(child, out);
	}
}
async function filesFromDataTransfer(dt) {
	const out = [];
	const items = [...dt.items];
	let walked = false;
	for (const item of items) {
		const entry = item.webkitGetAsEntry?.();
		if (entry) {
			walked = true;
			await walkEntry(entry, out);
		}
	}
	if (walked && out.length) return out;
	return [...dt.files];
}
function sourceReadMode(role) {
	if (role === "poi") return "path";
	if (role === "picture" || role === "itemPicture" || role === "wallpaper") return "blob";
	if (!role) return "path";
	return "text";
}
async function poolMap(items, limit, fn) {
	const out = new Array(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) || 0 }, async () => {
		while (next < items.length) {
			const index = next++;
			out[index] = await fn(items[index], index);
		}
	});
	await Promise.all(workers);
	return out;
}
async function sourcesFromFiles(files, onProgress, kind = "scenario", activeScenario = "") {
	const active = chooseScenarioFolder(files.map(relativeOf), activeScenario);
	const dropIncludesScenarios = files.some((file) => scenarioFolderOf(relativeOf(file)));
	const picked = files.filter((file) => {
		const path = relativeOf(file);
		if (isOtherScenarioPath(path, active)) return false;
		return fileMatchesKind(path, kind);
	});
	let done = 0;
	return await poolMap(picked, 10, async (file) => {
		const path = normalizePath(relativeOf(file));
		const role = classifyScenarioPath(path, kind);
		const gameFile = isMainGameReference(path, dropIncludesScenarios);
		const mode = sourceReadMode(role);
		let source = { path };
		if (gameFile && role === "wallpaper") source = { path };
		else if (gameFile && role === "playfieldYaml") source = { path };
		else if (role === "poi") try {
			source = {
				path,
				meta: parseEpbHeader(new Uint8Array(await file.slice(0, 65536).arrayBuffer()), path)
			};
		} catch {
			source = { path };
		}
		else if (mode === "blob") source = gameFile ? { path } : {
			path,
			blob: file
		};
		else if (mode === "text" && file.size <= 25e6) {
			if (role === "playfieldYaml" && file.size > 2e6) source = { path };
			else source = {
				path,
				text: await file.text()
			};
		}
		done += 1;
		onProgress?.(done, picked.length, path);
		if (done % 40 === 0) await new Promise((r) => setTimeout(r, 0));
		return source;
	});
}
var TUTORIAL_INDEX_FILES = [
	"PDA.yaml",
	"PDA.csv",
	"Localization.csv",
	"Sectors.yaml",
	"Configuration/ItemsConfig.ecf",
	"Configuration/BlocksConfig.ecf",
	"Configuration/EClassConfig.ecf",
	"Configuration/Factions.ecf",
	"Configuration/Dialogues.ecf",
	"Configuration/TokenConfig.ecf",
	"Prefabs/Artifacts.epb",
	"Prefabs/AbandonedPOI.epb",
	"Prefabs/AlienTowerDMG.epb"
];
async function loadTutorialSources() {
	const sources = [];
	for (const rel of TUTORIAL_INDEX_FILES) {
		const res = await fetch(`/samples/tutorial/${rel}`);
		if (!res.ok) continue;
		sources.push({
			path: `eWPDA Tutorial/${rel}`,
			text: await res.text()
		});
	}
	if (!sources.some((s) => /pda\.yaml$/i.test(s.path))) throw new Error("Could not load the bundled tutorial.");
	return sources;
}
var SHORT = {
	scenario: "Scenario",
	configs: "Configs",
	localization: "Localization",
	itemImages: "Item icons",
	pdaImages: "PDA images",
	pdaYaml: "PDA.yaml",
	pdaCsv: "PDA.csv",
	dialogues: "Dialogues",
	dialoguesCsv: "Dialogues.csv",
	factions: "Factions",
	galaxy: "Galaxy",
	sectors: "Sectors",
	playfields: "Playfields",
	presets: "Presets",
	blueprints: "Blueprints"
};
function AreaBar({ snap, compact }) {
	if (!snap) return null;
	const pct = areaPercent(snap);
	const fill = snap.phase === "done" ? "area-bar-fill is-done" : snap.phase === "queued" ? "area-bar-fill is-queued" : "area-bar-fill";
	const label = snap.phase === "done" ? "Done" : snap.phase === "queued" ? `Queued ${snap.total}` : `${snap.done}/${snap.total}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "mt-2" : "",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `overflow-hidden rounded-full bg-elevated ring-1 ring-border ${compact ? "h-2.5" : "h-4"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `h-full rounded-full ${fill}`,
				style: { width: `${Math.max(snap.phase === "queued" ? 10 : 3, pct)}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums",
				children: [pct, "%"]
			})]
		})]
	});
}
function ImportProgressPanel() {
	const areas = useImportProgress((s) => s.areas);
	const rows = IMPORT_SLOTS.map((slot) => ({
		slot,
		snap: areas[slot.id]
	})).filter((row) => row.snap);
	if (!rows.length) return null;
	const overall = rows.reduce((n, row) => n + areaPercent(row.snap), 0) / rows.length;
	const working = rows.some((row) => row.snap.phase !== "done");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-4 rounded-lg border border-accent/35 bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.16em] text-accent",
					children: "Import progress"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: working ? "Each bar is one import area. Stay until they all turn green." : "All areas finished."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium tabular-nums text-lg leading-none",
					children: [Math.round(overall), "%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 h-2 overflow-hidden rounded-full bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `h-full rounded-full ${working ? "area-bar-fill" : "area-bar-fill is-done"}`,
					style: { width: `${Math.max(4, overall)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2.5",
				children: rows.map(({ slot, snap }) => {
					const pct = areaPercent(snap);
					const fill = snap.phase === "done" ? "area-bar-fill is-done" : snap.phase === "queued" ? "area-bar-fill is-queued" : "area-bar-fill";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7.5rem_1fr_2.6rem] items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-fg",
								children: SHORT[slot.id]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-3.5 overflow-hidden rounded-full bg-elevated ring-1 ring-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full rounded-full ${fill}`,
									style: { width: `${Math.max(snap.phase === "queued" ? 8 : 3, pct)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-right text-[11px] tabular-nums text-muted",
								children: snap.phase === "done" ? "Done" : `${pct}%`
							})
						]
					}, slot.id);
				})
			})
		]
	});
}
var ICONS = {
	scenario: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-5" }),
	configs: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-5" }),
	localization: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-5" }),
	itemImages: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-5" }),
	pdaImages: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" }),
	pdaYaml: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "size-5" }),
	pdaCsv: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-5" }),
	dialogues: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-5" }),
	dialoguesCsv: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-5" }),
	factions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5" }),
	galaxy: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5" }),
	sectors: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }),
	playfields: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }),
	presets: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }),
	blueprints: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-5" })
};
function tallyAreas(files, kind) {
	const totals = {};
	for (const file of files) {
		const path = file.webkitRelativePath || file.name;
		if (!fileMatchesKind(path, kind)) continue;
		if (kind === "scenario") {
			totals.scenario = (totals.scenario || 0) + 1;
			const area = areaForRole(classifyScenarioPath(path, kind));
			if (area) totals[area] = (totals[area] || 0) + 1;
		} else totals[kind] = (totals[kind] || 0) + 1;
	}
	return totals;
}
function slotCount(kind, files, pictures) {
	const sum = (...roles) => files.filter((f) => roles.includes(f.role)).reduce((n, f) => n + (f.count || 1), 0);
	switch (kind) {
		case "scenario": return files.length;
		case "configs": return sum("items", "blocks", "templates", "eclass", "tokens", "egroups", "reputation", "warfare", "galaxy", "factions", "containers", "lootgroups", "traders", "materials", "statuseffects", "globaldefs", "blockgroups", "blockshapes", "animations", "baiconfig", "ecf");
		case "localization": return sum("localization");
		case "itemImages": return pictures.item;
		case "pdaImages": return pictures.pda;
		case "pdaYaml": return sum("pdaYaml");
		case "pdaCsv": return sum("pdaCsv");
		case "dialogues": return sum("dialogues");
		case "dialoguesCsv": return sum("dialoguesCsv");
		case "factions": return sum("factions");
		case "galaxy": return sum("galaxy");
		case "sectors": return sum("sectors");
		case "playfields": return sum("playfieldYaml", "playfield");
		case "presets": return sum("randomPreset");
		case "blueprints": return sum("poi");
		default: return 0;
	}
}
function ImportPage() {
	const catalog = usePdaStore((s) => s.catalog);
	usePdaStore((s) => s.project);
	const ingest = usePdaStore((s) => s.ingestSources);
	const reset = usePdaStore((s) => s.reset);
	const clearImageSet = usePdaStore((s) => s.clearImageSet);
	const pdaPics = (0, import_react.useMemo)(() => catalog.entries.filter((e) => e.kind === "picture" && e.group !== "item").length, [catalog.entries]);
	const itemPics = (0, import_react.useMemo)(() => catalog.entries.filter((e) => e.kind === "picture" && e.group === "item").length, [catalog.entries]);
	const resetAreas = useImportProgress((s) => s.reset);
	const tickArea = useImportProgress((s) => s.tick);
	const areas = useImportProgress((s) => s.areas);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [doneAt, setDoneAt] = (0, import_react.useState)(null);
	const detail = useBusyStore((s) => s.detail);
	const pct = useBusyStore((s) => s.pct);
	const loading = useBusyStore((s) => s.load);
	const run = (0, import_react.useCallback)(async (kind, work) => {
		setBusy(kind);
		setError(null);
		setStatus(null);
		setDoneAt(null);
		beginBusy("load", "Starting import…");
		try {
			const message = await work();
			useImportProgress.getState().finish();
			setStatus(message);
			setDoneAt((/* @__PURE__ */ new Date()).toLocaleTimeString());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Import failed.");
		} finally {
			endBusy("load");
			setBusy(null);
		}
	}, []);
	const ingestFiles = (0, import_react.useCallback)(async (kind, files) => {
		resetAreas(tallyAreas(files, kind));
		setBusyDetail(`Reading 0/${files.length} files…`, 2);
		const sources = await sourcesFromFiles(files, (done, total, path) => {
			setStatus(`Reading ${done}/${total} · ${path.split("/").pop()}`);
			setBusyDetail(`Reading ${done}/${total} · ${path.split("/").pop() || ""}`, Math.round(done / Math.max(1, total) * 20));
			if (kind === "scenario") {
				tickArea("scenario");
				const area = areaForRole(classifyScenarioPath(path, kind));
				if (area) tickArea(area);
			} else tickArea(kind);
		}, kind, catalog.folderName);
		if (!sources.length) throw new Error("Nothing in that drop matched this slot.");
		setBusyDetail("Indexing scenario…", 22);
		return ingest(kind, sources);
	}, [
		ingest,
		resetAreas,
		tickArea,
		catalog.folderName
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell flex min-h-dvh flex-col text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-medium text-2xl tracking-tight",
						children: "Import page"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "Drop a whole scenario, or fill slots one at a time. Configs, localization, images, dialogues, factions, GalaxyConfig, sectors, playfields, and blueprints merge in — they do not wipe the PDA you already have open."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/Axis-2026-Creator-Particlewave-Windows.zip",
									download: true,
									children: "Download for Windows"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/Axis-2026-Creator-Particlewave-Linux.zip",
									download: true,
									children: "Download for Linux"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								disabled: busy !== null,
								onClick: () => void run("tutorial", async () => {
									setStatus("Loading bundled tutorial…");
									return ingest("scenario", await loadTutorialSources());
								}),
								children: [busy === "tutorial" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Load tutorial"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadedStrip, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportProgressPanel, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted",
					onDragOver: (e) => e.preventDefault(),
					onDrop: (e) => {
						e.preventDefault();
						run("scenario", async () => ingestFiles("scenario", await filesFromDataTransfer(e.dataTransfer)));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "mb-1 inline size-4" }), " Drop a scenario folder anywhere here to load everything at once."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: IMPORT_SLOTS.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotCard, {
						kind: slot.id,
						title: slot.title,
						hint: slot.hint,
						accept: slot.accept,
						directory: slot.directory,
						loaded: slotCount(slot.id, catalog.files, {
							pda: pdaPics,
							item: itemPics
						}),
						busy: busy === slot.id || busy === "scenario" && Boolean(areas[slot.id]),
						disabled: busy !== null,
						progress: areas[slot.id],
						onFiles: (files) => void run(slot.id, () => ingestFiles(slot.id, files))
					}, slot.id))
				}),
				busy || loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-md border border-accent/40 bg-surface px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: detail || status || "Working…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-1.5 overflow-hidden rounded-sm bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-accent transition-[width] duration-200",
								style: { width: `${Math.max(4, Math.min(100, pct ?? 8))}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Stay on this page. A full scenario can take a few minutes — this bar is the live step."
						})
					]
				}) : null,
				!busy && !loading && status ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 rounded-md border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok",
					children: [
						"Done",
						doneAt ? ` at ${doneAt}` : "",
						". ",
						status
					]
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-2 border-t border-border pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							disabled: busy !== null,
							onClick: () => void clearImageSet("pda"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Clear PDA images"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							disabled: busy !== null,
							onClick: () => void clearImageSet("item"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Clear item images"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							disabled: busy !== null,
							onClick: () => reset(),
							children: "Reset workshop"
						})
					]
				})
			]
		})]
	});
}
function LoadedStrip() {
	const catalog = usePdaStore((s) => s.catalog);
	const project = usePdaStore((s) => s.project);
	const n = catalogCounts(catalog);
	const pics = catalog.entries.filter((e) => e.kind === "picture");
	const pdaPics = pics.filter((e) => e.group !== "item").length;
	const itemPics = pics.filter((e) => e.group === "item").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 grid gap-2 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "PDA",
				value: `${project.chapters.length} chapters`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "CSV keys",
				value: String(Object.keys(project.csv.rows).length)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Catalog",
				value: catalogLoaded(catalog) ? `${n.item} items · ${n.entity} NPCs · ${n.playfield} playfields · ${n.poi} POIs` : "Empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Images",
				value: `${pdaPics} PDA · ${itemPics} item`
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] uppercase tracking-[0.14em] text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm",
		children: value
	})] });
}
function SlotCard(props) {
	const inputRef = (0, import_react.useRef)(null);
	const [drag, setDrag] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = inputRef.current;
		if (!el || !props.directory) return;
		el.setAttribute("webkitdirectory", "");
		el.setAttribute("directory", "");
	}, [props.directory]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick: () => inputRef.current?.click(),
		onDragOver: (e) => {
			e.preventDefault();
			setDrag(true);
		},
		onDragLeave: () => setDrag(false),
		onDrop: (e) => {
			e.preventDefault();
			setDrag(false);
			filesFromDataTransfer(e.dataTransfer).then(props.onFiles);
		},
		className: `flex min-h-24 cursor-pointer items-center gap-4 rounded-md border px-4 py-3 text-left transition-[box-shadow,background-color] duration-150 ${drag ? "border-accent bg-elevated" : "border-border bg-surface hover:bg-elevated/70"} ${props.disabled && !props.progress ? "pointer-events-none opacity-40" : props.disabled ? "pointer-events-none" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: ICONS[props.kind]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: props.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs leading-relaxed text-muted",
						children: props.hint
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaBar, {
						snap: props.progress,
						compact: true
					})
				]
			}),
			props.busy && !props.progress ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 shrink-0 animate-spin text-muted" }) : props.progress?.phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 rounded-sm bg-ok/15 px-1.5 py-0.5 text-xs text-ok",
				children: "Done"
			}) : props.loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "shrink-0 rounded-sm bg-ok/15 px-1.5 py-0.5 text-xs text-ok",
				children: [props.loaded, " loaded"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-xs text-subtle",
				children: "Empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: props.accept || void 0,
				multiple: true,
				className: "hidden",
				onChange: (e) => {
					const list = e.target.files;
					if (list?.length) props.onFiles([...list]);
					e.target.value = "";
				}
			})
		]
	});
}
var SplitComponent = ImportPage;
//#endregion
export { SplitComponent as component };

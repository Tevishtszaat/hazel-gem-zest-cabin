import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Package, c as LoaderCircle, d as FolderOpen, f as FileUp, l as Landmark, m as FileJson, n as Trash2, o as MessageSquare, p as FileSpreadsheet, r as ScrollText, s as Map, u as Image, v as Box } from "../_libs/lucide-react.mjs";
import { M as usePdaStore, c as catalogCounts, l as catalogLoaded, r as Button, t as AppHeader, u as classifyScenarioPath, v as normalizePath } from "./button-DWalkn6S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-BAHJtjWB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
		hint: "ItemsConfig, BlocksConfig, Templates, DefReputation, FactionWarfare, GalaxyConfig, TokenConfig.",
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
	sectors: ["sectors"],
	playfields: ["playfieldYaml"],
	blueprints: ["poi"]
};
function fileMatchesKind(path, kind) {
	const role = classifyScenarioPath(path, kind);
	if (!role) return false;
	if (kind === "scenario") return true;
	return ROLE_FOR_KIND[kind].includes(role);
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
async function sourcesFromFiles(files, onProgress, kind = "scenario") {
	const picked = files.filter((file) => fileMatchesKind(relativeOf(file), kind));
	const sources = [];
	let done = 0;
	for (const file of picked) {
		const path = normalizePath(relativeOf(file));
		const role = classifyScenarioPath(path, kind);
		onProgress?.(done, picked.length, path);
		if (role === "poi") sources.push({ path });
		else if (role === "picture" || role === "itemPicture") sources.push({
			path,
			blob: file
		});
		else if (file.size > 25e6) sources.push({ path });
		else sources.push({
			path,
			text: await file.text()
		});
		done += 1;
		onProgress?.(done, picked.length, path);
	}
	return sources;
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
	sectors: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }),
	playfields: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }),
	blueprints: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-5" })
};
function slotCount(kind, files, pictures) {
	const sum = (...roles) => files.filter((f) => roles.includes(f.role)).reduce((n, f) => n + (f.count || 1), 0);
	switch (kind) {
		case "scenario": return files.length;
		case "configs": return sum("items", "blocks", "templates", "eclass", "tokens", "egroups", "reputation", "warfare", "galaxy", "ecf");
		case "localization": return sum("localization");
		case "itemImages": return pictures.item;
		case "pdaImages": return pictures.pda;
		case "pdaYaml": return sum("pdaYaml");
		case "pdaCsv": return sum("pdaCsv");
		case "dialogues": return sum("dialogues");
		case "dialoguesCsv": return sum("dialoguesCsv");
		case "factions": return sum("factions");
		case "sectors": return sum("sectors");
		case "playfields": return sum("playfieldYaml", "playfield");
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
	const pdaPics = catalog.entries.filter((e) => e.kind === "picture" && e.group !== "item").length;
	const itemPics = catalog.entries.filter((e) => e.kind === "picture" && e.group === "item").length;
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const run = (0, import_react.useCallback)(async (kind, work) => {
		setBusy(kind);
		setError(null);
		setStatus(null);
		try {
			const message = await work();
			setStatus(message);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Import failed.");
		} finally {
			setBusy(null);
		}
	}, []);
	const ingestFiles = (0, import_react.useCallback)(async (kind, files) => {
		const sources = await sourcesFromFiles(files, (done, total, path) => setStatus(`Reading ${done}/${total} · ${path.split("/").pop()}`), kind);
		if (!sources.length) throw new Error("Nothing in that drop matched this slot.");
		return ingest(kind, sources);
	}, [ingest]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
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
						children: "Drop a whole scenario, or fill slots one at a time. Configs, localization, images, dialogues, factions, sectors, playfields, and blueprints merge in — they do not wipe the PDA you already have open."
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
						busy: busy === slot.id,
						disabled: busy !== null,
						onFiles: (files) => void run(slot.id, () => ingestFiles(slot.id, files))
					}, slot.id))
				}),
				status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-ok",
					children: status
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
		className: `flex min-h-24 cursor-pointer items-center gap-4 rounded-md border px-4 py-3 text-left transition-[box-shadow,background-color] duration-150 ${drag ? "border-accent bg-elevated" : "border-border bg-surface hover:bg-elevated/70"} ${props.disabled ? "pointer-events-none opacity-40" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: ICONS[props.kind]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: props.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs leading-relaxed text-muted",
					children: props.hint
				})]
			}),
			props.busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 shrink-0 animate-spin text-muted" }) : props.loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
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

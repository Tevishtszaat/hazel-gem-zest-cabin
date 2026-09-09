import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as suggestionsFor, M as usePdaStore, j as upsertCsv, r as Button, t as AppHeader } from "./button-DWalkn6S.mjs";
import { i as Textarea, n as Input, r as Label, t as BbText } from "./input-DWBqAdv5.mjs";
import { C as writeDialoguesCsv, S as writeDialogues, _ as parseDialogueDoc, a as catalogText, b as setGoto, c as dialogueGroup, d as isGotoReset, h as mergeForeignDialogues, i as blankFunction, l as dialogueStrings, m as looksLikeKey, n as VAR_TYPES, o as dialogueCsvTable, r as blankDialogue, s as dialogueDocFor, t as SNIPPETS, u as gotoTarget, v as reindex, w as writeLocalization, x as uniqueDialogueName, y as resolveDialogueText } from "./library-BwXrTK_P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialogues-Cg_bjv1H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PALETTE_KEY = "pulsepda.dlg.palette";
var CLIP_KEY = "pulsepda.dlg.clip";
var BOOK_KEY = "pulsepda.dlg.bookmarks";
var SCROLL_KEY = "pulsepda.dlg.scroll";
var FILTER_KEY = "pulsepda.dlg.filter";
var DEFAULT_PALETTE = [
	"fddc1e",
	"ffcc33",
	"e11d48",
	"22c55e",
	"38bdf8",
	"a78bfa",
	"fb923c",
	"ffffff",
	"019245",
	"fd9b00"
];
function lsGet(key) {
	if (typeof localStorage === "undefined") return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}
function lsSet(key, value) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(key, value);
	} catch {}
}
function loadPalette() {
	try {
		const raw = JSON.parse(lsGet(PALETTE_KEY) || "[]");
		if (Array.isArray(raw) && raw.length) return raw.map(String);
	} catch {}
	return DEFAULT_PALETTE;
}
function savePalette(colors) {
	lsSet(PALETTE_KEY, JSON.stringify(colors));
}
function loadClip() {
	try {
		const raw = JSON.parse(lsGet(CLIP_KEY) || "null");
		if (raw && typeof raw.kind === "string") return raw;
	} catch {}
	return null;
}
function saveClip(clip) {
	lsSet(CLIP_KEY, JSON.stringify(clip));
}
function loadBookmarks() {
	try {
		const raw = JSON.parse(lsGet(BOOK_KEY) || "[]");
		return Array.isArray(raw) ? raw.map(String) : [];
	} catch {
		return [];
	}
}
function saveBookmarks(names) {
	lsSet(BOOK_KEY, JSON.stringify(names));
}
function loadFilter() {
	return lsGet(FILTER_KEY) || "";
}
function saveFilter(q) {
	lsSet(FILTER_KEY, q);
}
function loadScroll() {
	return Number(lsGet(SCROLL_KEY) || "0") || 0;
}
function saveScroll(n) {
	lsSet(SCROLL_KEY, String(n));
}
function FormatBar({ onInsert, mode, onMode }) {
	const [palette, setPalette] = (0, import_react.useState)(loadPalette);
	const [custom, setCustom] = (0, import_react.useState)("ffcc33");
	const wrap = (hex) => {
		const h = hex.replace("#", "");
		if (mode === "tmp") onInsert(`<color=#${h}>`, "</color>");
		else onInsert(`[c][${h}]`, "[-][/c]");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `h-6 rounded-sm border px-1.5 text-[10px] uppercase ${mode === "bb" ? "border-accent text-fg" : "border-border text-muted"}`,
					onClick: () => onMode("bb"),
					children: "BB"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `h-6 rounded-sm border px-1.5 text-[10px] uppercase ${mode === "tmp" ? "border-accent text-fg" : "border-border text-muted"}`,
					onClick: () => onMode("tmp"),
					children: "TMP"
				}),
				(mode === "tmp" ? [
					{
						label: "B",
						open: "<b>",
						close: "</b>"
					},
					{
						label: "I",
						open: "<i>",
						close: "</i>"
					},
					{
						label: "U",
						open: "<u>",
						close: "</u>"
					},
					{
						label: "Size",
						open: "<size=20>",
						close: "</size>"
					},
					{
						label: "Center",
						open: "<align=center>",
						close: "</align>"
					},
					{
						label: "\\n",
						open: "\\n"
					}
				] : [
					{
						label: "B",
						open: "[b]",
						close: "[/b]"
					},
					{
						label: "I",
						open: "[i]",
						close: "[/i]"
					},
					{
						label: "U",
						open: "[u]",
						close: "[/u]"
					},
					{
						label: "{Player}",
						open: "{PlayerName}"
					},
					{
						label: "{NPC}",
						open: "{NPCName}"
					},
					{
						label: "@p",
						open: "@p3"
					},
					{
						label: "@w",
						open: "@w2"
					}
				]).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-6 rounded-sm border border-border px-1.5 text-[10px] uppercase tracking-wide text-muted hover:text-fg",
					onClick: () => onInsert(b.open, b.close),
					children: b.label
				}, b.label))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1",
			children: [
				palette.map((hex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `#${hex}`,
					className: "size-5 rounded-sm border border-border",
					style: { background: `#${hex}` },
					onClick: () => wrap(hex),
					onContextMenu: (e) => {
						e.preventDefault();
						const next = palette.filter((c) => c !== hex);
						setPalette(next);
						savePalette(next);
					}
				}, hex)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "color",
					className: "size-6 cursor-pointer bg-transparent",
					value: `#${custom}`,
					onChange: (e) => setCustom(e.target.value.replace("#", ""))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-6 rounded-sm border border-border px-1.5 text-[10px] text-muted hover:text-fg",
					onClick: () => {
						wrap(custom);
						if (!palette.includes(custom)) {
							const next = [...palette, custom].slice(-16);
							setPalette(next);
							savePalette(next);
						}
					},
					children: "Use"
				})
			]
		})]
	});
}
function CodeField({ value, onChange, placeholder }) {
	const html = (0, import_react.useMemo)(() => highlightCSharp(value), [value]);
	const lines = value.split("\n").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-sm border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border bg-elevated px-2 py-1 text-[10px] uppercase tracking-wide text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Execute editor · C#" }), /["']/.test(value) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-accent",
					children: "CDATA on export"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[2rem_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "select-none bg-elevated/60 py-2 text-right font-mono text-[11px] leading-5 text-subtle",
					children: Array.from({ length: lines }, (_, i) => i + 1).join("\n")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "min-h-28 rounded-none border-0 bg-transparent py-2 font-mono text-xs leading-5",
					value,
					placeholder,
					spellCheck: false,
					onChange: (e) => onChange(e.target.value)
				})]
			}),
			value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-24 overflow-auto border-t border-border bg-bg px-3 py-2 font-mono text-[11px] leading-5 text-muted",
				dangerouslySetInnerHTML: { __html: html }
			}) : null
		]
	});
}
function escapeHtml(s) {
	return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
function highlightCSharp(src) {
	return escapeHtml(src).replace(/\b(if|else|return|true|false|new|int|string|var|void|null|this|Player)\b/g, "<span style=\"color:#93c5fd\">$1</span>").replace(/\b(AddItem|RemoveItem|HasItem|GetReputation|AddReputation|OpenTraderWindow|IsPdaChapterActive|IsPdaTaskActive|SetNPCName|SetSignal|IsSignalSet|OpenHtmlWindow|CloseHtmlWindow|AddItemsFromContainer|UnlockTechTreeItem|IsTechTreeItemUnlocked|CallLater|GotoAndReset|GetFaction|GetStructure|IsBlockActive|SetBlockActive|LocF|GetInstanceTicket)\b/g, "<span style=\"color:#7dd3c7\">$1</span>").replace(/('(?:\\'|[^'])*'|"(?:\\"|[^"])*")/g, "<span style=\"color:#fcd34d\">$1</span>").replace(/(\/\/.*)$/gm, "<span style=\"color:#6b7280\">$1</span>");
}
function GotoToggle({ value, onChange }) {
	const on = isGotoReset(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center gap-2 text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked: on,
			onChange: (e) => onChange(setGoto(value, e.target.checked))
		}), "GotoAndReset"]
	});
}
function reorder(list, from, to) {
	if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}
function ForeignImport({ onMerge, onClose }) {
	const [step, setStep] = (0, import_react.useState)(1);
	const [text, setText] = (0, import_react.useState)("");
	const [prefix, setPrefix] = (0, import_react.useState)("Foreign_");
	const [names, setNames] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)([]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-md border border-border bg-surface p-4 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-accent",
					children: "Import foreign dialogues"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mt-1 text-lg font-medium",
					children: [
						"Step ",
						step,
						" of 4"
					]
				}),
				step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Pick a Dialogues.ecf from another scenario. Nothing is overwritten yet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: ".ecf,.txt",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							setText(await file.text());
						}
					})]
				}) : null,
				step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 max-h-64 space-y-1 overflow-auto",
					children: names.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: selected.includes(n),
							onChange: (e) => setSelected(e.target.checked ? [...selected, n] : selected.filter((x) => x !== n))
						}), n]
					}, n))
				}) : null,
				step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Prefix renamed copies so they don’t collide with your states."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: prefix,
						onChange: (e) => setPrefix(e.target.value)
					})]
				}) : null,
				step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"Merge ",
						selected.length,
						" states with prefix “",
						prefix,
						"”. Existing dialogues stay put."
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex justify-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: onClose,
							children: "Cancel"
						}),
						step > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setStep(step - 1),
							children: "Back"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: step === 1 && !text,
							onClick: () => {
								if (step === 1) {
									const found = [...text.matchAll(/Dialogue Name:\s*"?([A-Za-z0-9_]+)"?/g)].map((m) => m[1]);
									const uniq = [...new Set(found)];
									setNames(uniq);
									setSelected(uniq);
									setStep(2);
									return;
								}
								if (step < 4) {
									setStep(step + 1);
									return;
								}
								onMerge(text, prefix, selected);
								onClose();
							},
							children: step === 4 ? "Merge" : "Next"
						})
					]
				})
			]
		})
	});
}
function download(name, text, type) {
	const blob = new Blob([text], { type });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
var GROUP_COLORS = [
	"#7dd3c7",
	"#c4b5fd",
	"#f9a8d4",
	"#fcd34d",
	"#93c5fd",
	"#86efac",
	"#fca5a5",
	"#fdba74"
];
function groupColor(name) {
	let h = 0;
	for (const ch of name) h = h * 33 + ch.charCodeAt(0) >>> 0;
	return GROUP_COLORS[h % GROUP_COLORS.length];
}
function DialogueEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const project = usePdaStore((s) => s.project);
	const loca = (0, import_react.useMemo)(() => dialogueStrings(catalog), [catalog]);
	const [doc, setDoc] = (0, import_react.useState)(() => dialogueDocFor(catalog));
	const [query, setQuery] = (0, import_react.useState)(loadFilter);
	const [picked, setPicked] = (0, import_react.useState)(doc.states[0]?.name ?? null);
	const [bookmarks, setBookmarks] = (0, import_react.useState)(loadBookmarks);
	const [starredOnly, setStarredOnly] = (0, import_react.useState)(false);
	const [foreign, setForeign] = (0, import_react.useState)(false);
	const [clip, setClip] = (0, import_react.useState)(loadClip);
	const [mode, setMode] = (0, import_react.useState)("bb");
	const [status, setStatus] = (0, import_react.useState)(null);
	const sideRef = (0, import_react.useRef)(null);
	const docRef = (0, import_react.useRef)(doc);
	docRef.current = doc;
	const states = doc.states;
	const functions = doc.functions;
	const q = query.trim().toLowerCase();
	const visible = states.filter((s) => {
		if (starredOnly && !bookmarks.includes(s.name)) return false;
		if (!q) return true;
		return `${s.name} ${s.npcName} ${s.output} ${s.comment}`.toLowerCase().includes(q);
	});
	const selected = states.find((s) => s.name === picked) ?? visible[0];
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const state of visible) {
			const g = dialogueGroup(state);
			const arr = map.get(g) ?? [];
			arr.push(state);
			map.set(g, arr);
		}
		return [...map.entries()];
	}, [visible]);
	const stateNames = [
		"End",
		...states.map((s) => s.name),
		...functions.map((f) => f.name)
	];
	const persist = (next) => {
		setDoc(next);
		setCatalogText("dialogues", writeDialogues(next), catalogText(catalog, "dialogues")?.path || "Dialogues.ecf");
	};
	const commitStates = (next) => persist({
		...doc,
		states: next
	});
	const commitFns = (next) => persist({
		...doc,
		functions: next
	});
	const patch = (name, partial) => {
		commitStates(states.map((s) => s.name === name ? {
			...s,
			...partial
		} : s));
	};
	const toast = (msg) => {
		setStatus(msg);
		window.setTimeout(() => setStatus(null), 1800);
	};
	const copyClip = (next) => {
		setClip(next);
		saveClip(next);
		toast(`Copied ${next.kind}`);
	};
	const pasteInto = (additive) => {
		if (!clip || !selected) return;
		if (clip.kind === "state") {
			const copy = {
				...structuredClone(clip.payload),
				name: uniqueDialogueName(states, `${clip.payload.name}_copy`)
			};
			const i = states.findIndex((s) => s.name === selected.name);
			const next = [...states];
			next.splice(i + 1, 0, copy);
			commitStates(next);
			setPicked(copy.name);
			return;
		}
		if (clip.kind === "option") {
			const row = {
				...clip.payload,
				index: (selected.options.at(-1)?.index ?? 0) + 1
			};
			patch(selected.name, { options: reindex(additive ? [...selected.options, row] : [row]) });
		}
		if (clip.kind === "next") {
			const row = {
				...clip.payload,
				index: (selected.nexts.at(-1)?.index ?? 0) + 1
			};
			patch(selected.name, { nexts: reindex(additive ? [...selected.nexts, row] : [row]) });
		}
		if (clip.kind === "variable") {
			const row = {
				...clip.payload,
				index: (selected.variables.at(-1)?.index ?? 0) + 1
			};
			patch(selected.name, { variables: reindex(additive ? [...selected.variables, row] : [row]) });
		}
		if (clip.kind === "function") commitFns([...functions, {
			...clip.payload,
			name: uniqueDialogueName(functions, `${clip.payload.name}_copy`)
		}]);
		toast(additive ? "Paste added" : "Pasted");
	};
	(0, import_react.useEffect)(() => {
		const el = sideRef.current;
		if (el) el.scrollTop = loadScroll();
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const mod = e.ctrlKey || e.metaKey;
			const inField = /input|textarea|select/i.test(e.target?.tagName || "");
			if (mod && e.key.toLowerCase() === "s") {
				e.preventDefault();
				download("Dialogues.ecf", writeDialogues(docRef.current), "text/plain");
				download("Dialogues.csv", writeDialoguesCsv(catalog, docRef.current), "text/csv");
				toast("Exported Dialogues.ecf + Dialogues.csv");
			}
			if (mod && e.key.toLowerCase() === "c" && !inField && selected) {
				e.preventDefault();
				copyClip({
					kind: "state",
					payload: selected
				});
			}
			if (mod && e.key.toLowerCase() === "v" && !inField) {
				e.preventDefault();
				pasteInto(e.shiftKey);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	const dropState = (fromName, toName) => {
		const from = states.findIndex((s) => s.name === fromName);
		const to = states.findIndex((s) => s.name === toName);
		commitStates(reorder(states, from, to));
	};
	const saveLoca = (table) => setCatalogText("dialoguesCsv", writeLocalization(table), catalogText(catalog, "dialoguesCsv")?.path || "Dialogues.csv");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
		children: [
			foreign ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForeignImport, {
				onClose: () => setForeign(false),
				onMerge: (text, prefix, selectedNames) => {
					persist(mergeForeignDialogues(doc, parseDialogueDoc(text), prefix, selectedNames));
					toast("Foreign dialogues merged");
				}
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex min-h-0 flex-col border-r border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => {
								setQuery(e.target.value);
								saveFilter(e.target.value);
							},
							placeholder: "Filter dialogues…",
							className: "h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => {
										const state = blankDialogue(uniqueDialogueName(states, `Dialogue_${states.length + 1}`));
										const i = selected ? states.findIndex((s) => s.name === selected.name) : states.length - 1;
										const next = [...states];
										next.splice(i + 1, 0, state);
										commitStates(next);
										setPicked(state.name);
									},
									children: "Add"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !selected,
									onClick: () => {
										if (!selected) return;
										const copy = {
											...structuredClone(selected),
											name: uniqueDialogueName(states, `${selected.name}_copy`)
										};
										const i = states.findIndex((s) => s.name === selected.name);
										const next = [...states];
										next.splice(i + 1, 0, copy);
										commitStates(next);
										setPicked(copy.name);
									},
									children: "Duplicate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setForeign(true),
									children: "Import foreign"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: starredOnly ? "default" : "secondary",
									onClick: () => setStarredOnly((v) => !v),
									children: "Bookmarks"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !states.length,
									onClick: () => download("Dialogues.ecf", writeDialogues(doc), "text/plain"),
									children: "Export ECF"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !states.length && !Object.keys(dialogueCsvTable(catalog, doc).rows).length,
									onClick: () => download("Dialogues.csv", writeDialoguesCsv(catalog, doc), "text/csv"),
									children: "Export CSV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									disabled: !states.length,
									onClick: () => {
										download("Dialogues.ecf", writeDialogues(doc), "text/plain");
										download("Dialogues.csv", writeDialoguesCsv(catalog, doc), "text/csv");
									},
									children: "Both"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: [
								states.length,
								" states · ",
								functions.length,
								" functions · drag to reorder · Alt-click copies name · Ctrl+S export"
							]
						}),
						status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-accent",
							children: status
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: sideRef,
					className: "min-h-0 flex-1 overflow-auto py-1",
					onScroll: (e) => saveScroll(e.target.scrollTop),
					children: !states.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-4 text-sm text-muted",
						children: "Import Dialogues.ecf / Dialogues.csv, or add a state."
					}) : groups.map(([group, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-[0.14em]",
						style: { color: groupColor(group) },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 rounded-full",
							style: { background: groupColor(group) }
						}), group]
					}), list.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						draggable: true,
						onDragStart: (e) => e.dataTransfer.setData("text/plain", state.name),
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							dropState(e.dataTransfer.getData("text/plain"), state.name);
						},
						onClick: (e) => {
							if (e.altKey) {
								navigator.clipboard.writeText(state.name);
								toast(state.name);
								return;
							}
							setPicked(state.name);
						},
						className: `flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${selected?.name === state.name ? "bg-elevated" : "hover:bg-elevated/50"}`,
						title: state.comment || state.output,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-0.5 self-stretch rounded-full",
								style: { background: groupColor(group) }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs ${bookmarks.includes(state.name) ? "text-accent" : "text-subtle"}`,
								onClick: (e) => {
									e.stopPropagation();
									const next = bookmarks.includes(state.name) ? bookmarks.filter((n) => n !== state.name) : [...bookmarks, state.name];
									setBookmarks(next);
									saveBookmarks(next);
								},
								children: "★"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate",
								children: state.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-mono text-[10px] text-subtle",
								children: [
									state.options.length,
									"opt ",
									state.nexts.length,
									"nxt"
								]
							})
						]
					}, state.name))] }, group))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "min-h-0 overflow-auto p-5",
				children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.14em] text-accent",
								children: "Dialogue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-xl font-medium tracking-tight",
								children: selected.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => copyClip({
											kind: "state",
											payload: selected
										}),
										children: "Copy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: !clip,
										onClick: () => pasteInto(false),
										children: "Paste"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: !clip,
										onClick: () => pasteInto(true),
										children: "Paste add"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "danger",
										onClick: () => {
											const next = states.filter((s) => s.name !== selected.name);
											commitStates(next);
											setPicked(next[0]?.name ?? null);
										},
										children: "Delete"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: selected.name,
								onChange: (e) => {
									const name = e.target.value;
									patch(selected.name, { name });
									setPicked(name);
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "NPC name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: selected.npcName,
								onChange: (e) => patch(selected.name, { npcName: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Comment",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: selected.comment,
								placeholder: "POI / playfield notes",
								onChange: (e) => patch(selected.name, { comment: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "BarkingState",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateSelect, {
									value: selected.barkingState,
									names: stateNames,
									allowEmpty: true,
									onChange: (barkingState) => patch(selected.name, { barkingState })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "RequiredStates",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: selected.requiredStates,
									placeholder: "state1, state2",
									onChange: (e) => patch(selected.name, { requiredStates: e.target.value })
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvBoundField, {
							label: "Output",
							value: selected.output,
							onChange: (output) => patch(selected.name, { output }),
							loca,
							language: project.language,
							pda: project.csv,
							mode,
							onMode: setMode,
							onSaveLoca: saveLoca
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariableList, {
							variables: selected.variables,
							onChange: (variables) => patch(selected.name, { variables: reindex(variables) }),
							onCopy: (payload) => copyClip({
								kind: "variable",
								payload
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextList, {
							nexts: selected.nexts,
							names: stateNames,
							catalog,
							onChange: (nexts) => patch(selected.name, { nexts: reindex(nexts) }),
							onCopy: (payload) => copyClip({
								kind: "next",
								payload
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionList, {
							options: selected.options,
							names: stateNames,
							loca,
							language: project.language,
							pda: project.csv,
							catalog,
							mode,
							onMode: setMode,
							onChange: (options) => patch(selected.name, { options: reindex(options) }),
							onSaveLoca: saveLoca,
							onCopy: (payload) => copyClip({
								kind: "option",
								payload
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunctionList, {
							functions,
							onChange: commitFns,
							onCopy: (payload) => copyClip({
								kind: "function",
								payload
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-6 text-sm text-muted",
					children: "Select a dialogue state."
				})
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium uppercase tracking-[0.12em] text-muted",
			children: label
		}), children]
	});
}
function StateSelect({ value, names, onChange, allowEmpty }) {
	const shown = isGotoReset(value) ? gotoTarget(value) : value;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		value: shown,
		list: "pulse-dlg-states",
		placeholder: "Next state / End",
		onChange: (e) => onChange(isGotoReset(value) ? `GotoAndReset:${e.target.value}` : e.target.value)
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("datalist", {
		id: "pulse-dlg-states",
		children: [allowEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "" }) : null, names.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: n }, n))]
	})] });
}
function wrapInsert(value, open, close) {
	if (!close) return `${value}${open}`;
	return `${open}${value}${close}`;
}
function CsvBoundField({ label, value, onChange, loca, language, pda, mode, onMode, onSaveLoca }) {
	const lang = loca.languages.includes(language) ? language : loca.languages[0] || "English";
	const isKey = looksLikeKey(value) && Boolean(loca.rows[value] || pda?.rows[value]);
	const keys = Object.keys(loca.rows).slice(0, 400);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormatBar, {
				mode,
				onMode,
				onInsert: (open, close) => onChange(isKey ? value : wrapInsert(value, open, close))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				list: "pulse-dlg-keys",
				placeholder: "Literal text or CSV key",
				onChange: (e) => onChange(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
				id: "pulse-dlg-keys",
				children: keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: k }, k))
			}),
			isKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: loca.rows[value]?.[lang] || pda?.rows[value]?.[lang] || "",
				onChange: (e) => {
					const next = structuredClone(loca);
					upsertCsv(next, value, lang, e.target.value);
					onSaveLoca(next);
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value,
				onChange: (e) => onChange(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
				as: "div",
				className: "text-sm leading-relaxed text-muted",
				text: resolveDialogueText(value, loca, pda, lang)
			})
		]
	});
}
function VariableList({ variables, onChange, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Variables" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "text-xs text-muted hover:text-fg",
			onClick: () => onChange([...variables, {
				index: variables.length + 1,
				name: `Var${variables.length + 1}`,
				param1: "int"
			}]),
			children: "Add variable"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: variables.map((variable, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			draggable: true,
			onDragStart: (e) => e.dataTransfer.setData("text/plain", String(i)),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				onChange(reindex(reorder(variables, Number(e.dataTransfer.getData("text/plain")), i)));
			},
			className: "grid gap-2 sm:grid-cols-[1fr_160px_auto_auto]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: variable.name,
					placeholder: "Name",
					onChange: (e) => onChange(variables.map((v, n) => n === i ? {
						...v,
						name: e.target.value
					} : v))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "h-10 rounded-sm border border-border bg-bg px-2 text-sm",
					value: variable.param1,
					onChange: (e) => onChange(variables.map((v, n) => n === i ? {
						...v,
						param1: e.target.value
					} : v)),
					children: VAR_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => onCopy(variable),
					children: "Copy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => onChange(variables.filter((_, n) => n !== i)),
					children: "✕"
				})
			]
		}, variable.index))
	})] });
}
function SnippetBar({ onInsert }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1",
		children: SNIPPETS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "h-6 rounded-sm border border-border px-1.5 text-[10px] text-muted hover:text-fg",
			onClick: () => onInsert(s.insert),
			children: s.label
		}, s.label))
	});
}
function ItemHint({ catalog, onPick }) {
	const [q, setQ] = (0, import_react.useState)("");
	const hits = q.trim() ? suggestionsFor(catalog, [
		"item",
		"block",
		"token"
	], q.trim(), 8) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		value: q,
		placeholder: "Item helper…",
		className: "h-8",
		onChange: (e) => setQ(e.target.value)
	}), hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 flex flex-wrap gap-1",
		children: hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "rounded-sm border border-border px-1.5 py-0.5 text-[11px] text-muted hover:text-fg",
			onClick: () => {
				onPick(hit.name);
				setQ("");
			},
			children: hit.label && hit.label !== hit.name ? `${hit.name} · ${hit.label}` : hit.name
		}, `${hit.kind}:${hit.name}`))
	}) : null] });
}
function NextList({ nexts, names, catalog, onChange, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Auto next / Execute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "text-xs text-muted hover:text-fg",
			onClick: () => onChange([...nexts, {
				index: nexts.length + 1,
				next: "End",
				iff: "",
				execute: ""
			}]),
			children: "Add next"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: nexts.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			draggable: true,
			onDragStart: (e) => e.dataTransfer.setData("text/plain", String(i)),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				onChange(reindex(reorder(nexts, Number(e.dataTransfer.getData("text/plain")), i)));
			},
			className: "space-y-2 rounded-sm border border-border p-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GotoToggle, {
						value: n.next,
						onChange: (next) => onChange(nexts.map((row, idx) => idx === i ? {
							...row,
							next
						} : row))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onCopy(n),
							children: "Copy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onChange(nexts.filter((_, idx) => idx !== i)),
							children: "✕"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateSelect, {
					value: n.next,
					names,
					onChange: (next) => onChange(nexts.map((row, idx) => idx === i ? {
						...row,
						next
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: n.iff,
					placeholder: "NextIf condition",
					className: "border-accent/40",
					onChange: (e) => onChange(nexts.map((row, idx) => idx === i ? {
						...row,
						iff: e.target.value
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeField, {
					value: n.execute,
					placeholder: "Execute C#",
					onChange: (execute) => onChange(nexts.map((row, idx) => idx === i ? {
						...row,
						execute
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnippetBar, { onInsert: (text) => onChange(nexts.map((row, idx) => idx === i ? {
					...row,
					execute: row.execute ? `${row.execute}\n${text}` : text
				} : row)) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemHint, {
					catalog,
					onPick: (name) => onChange(nexts.map((row, idx) => idx === i ? {
						...row,
						execute: `${row.execute}${row.execute ? " " : ""}'${name}'`
					} : row))
				})
			]
		}, n.index))
	})] });
}
function OptionList({ options, names, loca, language, pda, catalog, mode, onMode, onChange, onSaveLoca, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Options" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "text-xs text-muted hover:text-fg",
			onClick: () => onChange([...options, {
				index: options.length + 1,
				text: "Continue",
				next: "End",
				iff: "",
				execute: ""
			}]),
			children: "Add option"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			draggable: true,
			onDragStart: (e) => e.dataTransfer.setData("text/plain", String(i)),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				onChange(reindex(reorder(options, Number(e.dataTransfer.getData("text/plain")), i)));
			},
			className: "space-y-2 rounded-sm border border-border p-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GotoToggle, {
						value: opt.next,
						onChange: (next) => onChange(options.map((row, idx) => idx === i ? {
							...row,
							next
						} : row))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onCopy(opt),
							children: "Copy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onChange(options.filter((_, idx) => idx !== i)),
							children: "Remove"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvBoundField, {
					label: `Option ${opt.index}`,
					value: opt.text,
					onChange: (text) => onChange(options.map((row, idx) => idx === i ? {
						...row,
						text
					} : row)),
					loca,
					language,
					pda,
					mode,
					onMode,
					onSaveLoca
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateSelect, {
					value: opt.next,
					names,
					onChange: (next) => onChange(options.map((row, idx) => idx === i ? {
						...row,
						next
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: opt.iff,
					placeholder: "OptionIf",
					className: "border-accent/40",
					onChange: (e) => onChange(options.map((row, idx) => idx === i ? {
						...row,
						iff: e.target.value
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeField, {
					value: opt.execute,
					placeholder: "OptionExecute",
					onChange: (execute) => onChange(options.map((row, idx) => idx === i ? {
						...row,
						execute
					} : row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnippetBar, { onInsert: (text) => onChange(options.map((row, idx) => idx === i ? {
					...row,
					execute: row.execute ? `${row.execute}\n${text}` : text
				} : row)) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemHint, {
					catalog,
					onPick: (name) => onChange(options.map((row, idx) => idx === i ? {
						...row,
						execute: `${row.execute}${row.execute ? " " : ""}'${name}'`
					} : row))
				})
			]
		}, opt.index))
	})] });
}
function FunctionList({ functions, onChange, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reusable functions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "text-xs text-muted hover:text-fg",
				onClick: () => onChange([...functions, blankFunction(`Fn_${functions.length + 1}`)]),
				children: "Add function"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs text-subtle",
			children: "Call from Execute with FunctionName() or CallLater(5, FunctionName)."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: functions.map((fn, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 rounded-sm border border-border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: fn.name,
								onChange: (e) => onChange(functions.map((row, idx) => idx === i ? {
									...row,
									name: e.target.value
								} : row))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => onCopy(fn),
								children: "Copy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => onChange(functions.filter((_, idx) => idx !== i)),
								children: "✕"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: fn.comment,
						placeholder: "Comment",
						onChange: (e) => onChange(functions.map((row, idx) => idx === i ? {
							...row,
							comment: e.target.value
						} : row))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeField, {
						value: fn.execute,
						placeholder: "Function body",
						onChange: (execute) => onChange(functions.map((row, idx) => idx === i ? {
							...row,
							execute
						} : row))
					})
				]
			}, `${fn.name}-${i}`))
		})
	] });
}
function DialoguesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-x-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogueEditor, {})
		})]
	});
}
//#endregion
export { DialoguesPage as component };

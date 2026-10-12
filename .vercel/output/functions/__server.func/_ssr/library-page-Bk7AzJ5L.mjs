import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { S as ChevronLeft, x as ChevronRight } from "../_libs/lucide-react.mjs";
import { $t as matchesClassFilter, Cn as warmImageCache, Ct as objectsFor, Et as writeLocalization, Gn as stringifyEcfObjects, Gt as blockIdentity, Jt as entityByName, Kn as stringifyCsv, Kt as classFieldValue, Qt as groupByEntityType, St as localizationTable, Vt as ENTITY_CLASS_KEYS, Wn as configMeta, Xt as fieldIndex, Yt as entityClassLine, Zt as floatingBlocks, _t as catalogText, a as usePdaStore, an as statsFor, cn as withTemplateInputs, en as numericIds, in as similarBlocks, nn as objectLabel, on as templateInputs, qn as upsertCsv, qt as compareObjects, rn as resolvedField, sn as unusedNumericIds, tn as objectKey, xt as locaLabel } from "./router-CQbUGop6.mjs";
import { a as SelectItem, i as SelectContent, n as Button, o as SelectTrigger, r as Select, s as SelectValue, t as AppHeader } from "./button-Dk8gDvBQ.mjs";
import { t as BbText } from "./bb-text-Bgd73Pyz.mjs";
import { r as Textarea, t as Input } from "./input-Dg-_EBoP.mjs";
import { t as FieldNote } from "./field-note-DSZYzT0E.mjs";
import { t as noteForField } from "./field-notes-BnBibNoh.mjs";
import { t as ItemIcon } from "./pda-image-DSE4Aq0b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-page-Bk7AzJ5L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GROUP_TONE = {
	catalog: {
		idle: "border-[#245854] bg-[#0e1c1b] text-[#9ad7d1]",
		on: "border-[#3d8f88] bg-[#163330] text-[#e7fffb]"
	},
	world: {
		idle: "border-[#5a4630] bg-[#1c160f] text-[#e4c89a]",
		on: "border-[#a68558] bg-[#2a2116] text-[#fff4df]"
	},
	loot: {
		idle: "border-[#4a3a58] bg-[#16121c] text-[#d4b8e6]",
		on: "border-[#7a62a0] bg-[#261c30] text-[#f6ecff]"
	},
	defs: {
		idle: "border-[#2c4660] bg-[#101820] text-[#a9c7e4]",
		on: "border-[#4d7eaa] bg-[#172838] text-[#e8f4ff]"
	},
	text: {
		idle: "border-[#2d5244] bg-[#101a16] text-[#9ed4bc]",
		on: "border-[#4f8f74] bg-[#163028] text-[#e7fff4]"
	}
};
var GROUPS = [
	{
		id: "catalog",
		label: "Catalog"
	},
	{
		id: "world",
		label: "World"
	},
	{
		id: "loot",
		label: "Loot"
	},
	{
		id: "defs",
		label: "Defs"
	},
	{
		id: "text",
		label: "Text"
	}
];
var GROUP_TABS = {
	catalog: [
		"items",
		"blocks",
		"templates",
		"tokens",
		"compare"
	],
	world: [
		"factions",
		"playfields",
		"presets",
		"eclass",
		"egroups",
		"reputation",
		"warfare",
		"galaxy",
		"sectors"
	],
	loot: [
		"containers",
		"lootgroups",
		"traders"
	],
	defs: [
		"materials",
		"statuseffects",
		"globaldefs",
		"blockgroups",
		"blockshapes",
		"animations",
		"baiconfig"
	],
	text: ["localization"]
};
var WORKSPACE = {
	items: "/library/items",
	blocks: "/library/blocks",
	factions: "/library/factions",
	playfields: "/library/playfields",
	presets: "/library/presets",
	galaxy: "/library/galaxy",
	sectors: "/library/sectors",
	reputation: "/library/reputation",
	warfare: "/library/warfare"
};
function tabLabel(id) {
	if (id === "compare") return "Compare";
	if (id === "localization") return "Localization";
	if (id === "playfields") return "Playfields";
	if (id === "presets") return "Random presets";
	if (id === "sectors") return "Sectors";
	return configMeta(id)?.label || id;
}
function download(name, text, type) {
	const blob = new Blob([text], { type });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
function LibraryPage() {
	const catalog = usePdaStore((s) => s.catalog);
	const [tab, setTab] = (0, import_react.useState)("templates");
	const [group, setGroup] = (0, import_react.useState)("catalog");
	const [compareLeft, setCompareLeft] = (0, import_react.useState)(null);
	const tabs = GROUP_TABS[group];
	const setGroupAndTab = (next) => {
		setGroup(next);
		const first = GROUP_TABS[next].find((id) => !WORKSPACE[id]) ?? GROUP_TABS[next][0];
		if (!GROUP_TABS[next].includes(tab) || WORKSPACE[tab]) setTab(first);
	};
	const meta = configMeta(tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell flex h-dvh flex-col overflow-x-hidden text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-medium tracking-tight",
					children: "Library"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: [
						"Edit scenario configs. Items and blocks can use a number or a floating",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg/80",
							children: "+Name"
						}),
						" / ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg/80",
							children: "Name"
						}),
						". Tokens need numeric Ids."
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 border-b border-border px-4 py-3",
				children: GROUPS.map((item) => {
					const active = group === item.id;
					const tone = GROUP_TONE[item.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setGroupAndTab(item.id),
						className: `inline-flex h-12 items-center rounded-md border px-5 text-xl font-medium tracking-wide ${active ? tone.on : tone.idle}`,
						children: item.label
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 border-b border-border bg-surface/40 px-4 py-3",
				children: tabs.map((id) => {
					const href = WORKSPACE[id];
					const active = tab === id;
					const tone = GROUP_TONE[group];
					const className = `inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs ${active ? tone.on : `${tone.idle} opacity-80 hover:opacity-100`}`;
					const badge = href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-sm bg-black/25 px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
						children: "page"
					}) : null;
					if (href) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: href,
						className,
						children: [tabLabel(id), badge]
					}, id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTab(id),
						className,
						children: tabLabel(id)
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1",
				children: WORKSPACE[tab] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "p-6 text-sm text-muted",
					children: [tabLabel(tab), " opens as its own page so the list and editor can use the full window."]
				}) : tab === "compare" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockCompare, { initial: compareLeft }) : tab === "localization" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaEditor, {}) : meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
					role: meta.role,
					title: meta.label,
					onCompare: meta.role === "blocks" ? (name) => {
						setCompareLeft(name);
						setGroup("catalog");
						setTab("compare");
					} : void 0
				}, meta.role) : null
			}),
			!catalog.texts?.length && !catalog.entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "Empty library"
			}) : null
		]
	});
}
function CatalogRow({ obj, index, label, selected, selectedIndex, onPick, trailing }) {
	const key = objectKey(obj, index);
	const active = selected && objectKey(selected, selectedIndex) === key;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		"data-catalog-key": key,
		onClick: () => onPick(key),
		className: `flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${active ? "bg-elevated" : "hover:bg-elevated/50"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
				name: obj.name,
				fields: obj.fields,
				className: "size-6 rounded-sm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: label
			}),
			trailing
		]
	});
}
function CatalogScrubber({ items, index, onIndex, loca, language }) {
	if (!items.length) return null;
	const i = Math.min(Math.max(0, index), items.length - 1);
	const start = Math.max(0, i - 4);
	const tiles = items.slice(start, start + 9);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border p-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.14em] text-accent",
				children: "Slider"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: i <= 0,
						onClick: () => onIndex(i - 1),
						"aria-label": "Previous entry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex-1 text-center font-mono text-xs text-muted",
						children: [
							i + 1,
							" / ",
							items.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: i >= items.length - 1,
						onClick: () => onIndex(i + 1),
						"aria-label": "Next entry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				className: "catalog-range mt-2 w-full",
				min: 0,
				max: Math.max(0, items.length - 1),
				value: i,
				onChange: (e) => onIndex(Number(e.target.value)),
				"aria-label": "Slide through entries"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 max-h-52 space-y-1 overflow-y-auto",
				children: tiles.map((obj, offset) => {
					const idx = start + offset;
					const active = idx === i;
					const color = parseFactionColor(obj.fields.Color);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onIndex(idx),
						className: `flex w-full items-center gap-2 rounded-sm border px-2 py-1 text-left ${active ? "border-accent bg-elevated" : "border-border hover:bg-elevated/50"}`,
						title: obj.name,
						children: [
							color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-6 shrink-0 rounded-sm border border-border",
								style: { background: color }
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
								name: obj.name,
								fields: obj.fields,
								className: "size-6 rounded-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate text-xs",
								children: locaLabel(loca, obj.name, language) || obj.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 font-mono text-xs text-subtle",
								children: obj.id || obj.fields.Abbrev || ""
							})
						]
					}, `${obj.kind}-${obj.name}-${idx}`);
				})
			})
		]
	});
}
function parseFactionColor(value) {
	if (!value) return "";
	const parts = value.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n));
	if (parts.length < 3) return /^#|[a-z]/i.test(value) ? value : "";
	const [r, g, b] = parts;
	const scale = Math.max(r, g, b) <= 1 ? 255 : 1;
	return `rgb(${Math.round(r * scale)} ${Math.round(g * scale)} ${Math.round(b * scale)})`;
}
function ObjectBrowser({ role, title, onCompare, listCap = 800 }) {
	const meta = configMeta(role);
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const loca = (0, import_react.useMemo)(() => localizationTable(catalog), [catalog]);
	const language = usePdaStore((s) => s.project.language) || "English";
	const objects = (0, import_react.useMemo)(() => objectsFor(catalog, role), [catalog, role]);
	const objectIndex = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		objects.forEach((obj, index) => map.set(obj, index));
		return map;
	}, [objects]);
	const indexOf = (obj) => obj ? objectIndex.get(obj) ?? -1 : -1;
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [idFilter, setIdFilter] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		warmImageCache();
	}, []);
	const cats = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const obj of objects) if (obj.fields.Category) set.add(obj.fields.Category);
		return [...set].sort();
	}, [objects]);
	const [cat, setCat] = (0, import_react.useState)("all");
	const [classFilter, setClassFilter] = (0, import_react.useState)({
		EntityType: "all",
		Class: "all",
		Parent: "all",
		Faction: "all",
		Ref: "all"
	});
	const isEntities = role === "eclass";
	const byName = (0, import_react.useMemo)(() => entityByName(objects), [objects]);
	const classOptions = (0, import_react.useMemo)(() => {
		if (!isEntities) return null;
		return Object.fromEntries(ENTITY_CLASS_KEYS.map((key) => [key, fieldIndex(objects, key, byName)]));
	}, [
		isEntities,
		objects,
		byName
	]);
	const q = query.trim().toLowerCase();
	const missingIds = objects.filter((obj) => !obj.id);
	const unused = (0, import_react.useMemo)(() => unusedNumericIds(numericIds(objects)), [objects]);
	const floats = (0, import_react.useMemo)(() => floatingBlocks(objects), [objects]);
	const usesFloatingIds = role === "blocks" || role === "items";
	const usesNumericIds = meta.idMode === "required";
	const usesIds = usesNumericIds || usesFloatingIds;
	const visible = (0, import_react.useMemo)(() => objects.filter((obj, index) => {
		const ident = usesFloatingIds ? blockIdentity(obj) : null;
		if (idFilter === "missing" && obj.id) return false;
		if (idFilter === "numeric" && ident?.kind !== "numeric") return false;
		if (idFilter === "floating" && ident?.kind !== "floating") return false;
		if (cat !== "all" && obj.fields.Category !== cat) return false;
		if (isEntities && !matchesClassFilter(obj, classFilter, byName)) return false;
		if (!q) return true;
		const label = locaLabel(loca, obj.name, language);
		const idText = ident?.label ?? obj.id ?? objectLabel(obj);
		const classText = isEntities ? ENTITY_CLASS_KEYS.map((key) => classFieldValue(obj, key, byName)).join(" ") : "";
		return `${objectLabel(obj)} ${obj.name} ${idText} ${label} ${obj.fields.Category ?? ""} ${classText} ${index}`.toLowerCase().includes(q);
	}), [
		objects,
		usesFloatingIds,
		idFilter,
		cat,
		isEntities,
		classFilter,
		byName,
		q,
		loca,
		language
	]);
	const selected = objects.find((o, i) => objectKey(o, i) === picked) ?? visible[0] ?? objects[0];
	const selectedIndex = selected ? indexOf(selected) : -1;
	const numberedVisible = usesFloatingIds ? visible.filter((o) => blockIdentity(o).kind === "numeric") : visible;
	usesFloatingIds && visible.filter((o) => blockIdentity(o).kind === "floating");
	const slideItems = usesFloatingIds && idFilter === "all" ? numberedVisible : visible;
	const slideIndex = selected ? slideItems.indexOf(selected) : 0;
	const hasText = Boolean(catalogText(catalog, role));
	const fileName = catalogText(catalog, role)?.path.split(/[\\/]/).pop() || meta.file;
	const kindName = objects[0]?.kind || meta.kind;
	const pickAt = (next) => {
		const obj = slideItems[next];
		if (!obj) return;
		setPicked(objectKey(obj, indexOf(obj)));
	};
	(0, import_react.useEffect)(() => {
		if (!picked) return;
		document.querySelector(`[data-catalog-key="${CSS.escape(picked)}"]`)?.scrollIntoView({ block: "nearest" });
	}, [picked]);
	const persist = (next) => {
		setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
	};
	const patch = (index, mut) => {
		persist(objects.map((obj, i) => i === index ? mut({
			...obj,
			fields: { ...obj.fields },
			children: obj.children
		}) : obj));
	};
	const claim = (id) => {
		const used = new Set(objects.map((o) => o.name.toLowerCase()).filter(Boolean));
		const floating = usesFloatingIds && id == null;
		const skipId = meta.idMode === "none" || floating;
		const n = id ?? unused.next;
		let name = kindName === "Container" ? "" : skipId ? `New${kindName}` : `New${kindName}${n}`;
		let suffix = 2;
		while (name && used.has(name.toLowerCase())) {
			name = `New${kindName}${suffix}`;
			suffix += 1;
		}
		const fields = {};
		if (isEntities) for (const key of ENTITY_CLASS_KEYS) {
			const value = classFilter[key];
			if (value && value !== "all" && value !== "__none") fields[key] = value;
		}
		const obj = {
			kind: kindName,
			plus: meta.plus,
			name,
			id: skipId ? void 0 : String(n),
			fields,
			children: role === "templates" ? [{
				kind: "Child",
				plus: false,
				name: "Inputs",
				fields: {}
			}] : void 0
		};
		persist([...objects, obj]);
		setPicked(objectKey(obj, objects.length));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
		tabIndex: 0,
		onKeyDown: (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
			if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				e.preventDefault();
				pickAt(slideIndex - 1);
			} else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				e.preventDefault();
				pickAt(slideIndex + 1);
			} else if (e.key === "Home") {
				e.preventDefault();
				pickAt(0);
			} else if (e.key === "End") {
				e.preventDefault();
				pickAt(visible.length - 1);
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: `Filter ${title.toLowerCase()}…`,
							className: "h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
						}),
						cats.length && !isEntities ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs",
							value: cat,
							onChange: (e) => setCat(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All categories"
							}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
						}) : null,
						isEntities && classOptions ? ENTITY_CLASS_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs",
							value: classFilter[key],
							onChange: (e) => setClassFilter((prev) => ({
								...prev,
								[key]: e.target.value
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: "all",
									children: ["All ", key === "Ref" ? "templates" : key]
								}),
								classOptions[key].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value,
									children: value
								}, value)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "__none",
									children: "Unclassified"
								})
							]
						}, key)) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => claim(),
								children: ["New ", kindName]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !objects.length,
								onClick: () => download(fileName, stringifyEcfObjects(objects), "text/plain"),
								children: "Export"
							})]
						}),
						usesIds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: idFilter === "all" ? "text-fg" : "text-muted hover:text-fg",
								onClick: () => setIdFilter("all"),
								children: "All"
							}), usesFloatingIds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: idFilter === "numeric" ? "text-fg" : "text-muted hover:text-fg",
								onClick: () => setIdFilter("numeric"),
								children: [
									"Numeric (",
									objects.filter((o) => blockIdentity(o).kind === "numeric").length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: idFilter === "floating" ? "text-fg" : "text-muted hover:text-fg",
								onClick: () => setIdFilter("floating"),
								children: [
									"Custom (",
									floats.length,
									")"
								]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: idFilter === "missing" ? "text-fg" : "text-muted hover:text-fg",
								onClick: () => setIdFilter("missing"),
								children: [
									"No ID (",
									missingIds.length,
									")"
								]
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: [
								visible.length,
								" / ",
								objects.length,
								visible.length > listCap ? ` · showing first ${listCap}, filter to reach the rest` : "",
								usesNumericIds ? ` · ${unused.total} unused IDs` : "",
								usesFloatingIds ? ` · ${floats.length} custom · ${unused.total} free numbers` : ""
							]
						})
					]
				}),
				slideItems.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogScrubber, {
					items: slideItems,
					index: slideIndex < 0 ? 0 : slideIndex,
					onIndex: pickAt,
					loca,
					language
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-auto",
					children: !objects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "p-4 text-sm text-muted",
						children: [
							"Import ",
							fileName,
							" from the Import page, or create a new ",
							kindName.toLowerCase(),
							" here."
						]
					}) : isEntities ? groupByEntityType(visible.slice(0, listCap), byName).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "sticky top-0 z-10 bg-surface px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-accent",
						children: [group.key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-subtle",
							children: group.rows.length
						})]
					}), group.rows.map((obj) => {
						const index = indexOf(obj);
						const label = locaLabel(loca, obj.name, language) || objectLabel(obj);
						const key = objectKey(obj, index);
						const line = entityClassLine(obj, byName);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setPicked(key),
							className: `flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${selected && objectKey(selected, selectedIndex) === key ? "bg-elevated" : "hover:bg-elevated/50"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
								name: obj.name,
								fields: obj.fields,
								className: "size-6 rounded-sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate",
									children: label
								}), line ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-mono text-[11px] text-subtle",
									children: line
								}) : null]
							})]
						}, key);
					})] }, group.key)) : usesFloatingIds && idFilter === "all" && floats.length ? numberedVisible.slice(0, listCap).map((obj) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogRow, {
						obj,
						index: indexOf(obj),
						label: locaLabel(loca, obj.name, language) || objectLabel(obj),
						selected,
						selectedIndex,
						onPick: setPicked,
						trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-mono text-xs text-subtle",
							children: blockIdentity(obj).label
						})
					}, objectKey(obj, indexOf(obj)))) : visible.slice(0, listCap).map((obj) => {
						const index = indexOf(obj);
						const label = locaLabel(loca, obj.name, language) || objectLabel(obj);
						const ident = usesFloatingIds ? blockIdentity(obj) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogRow, {
							obj,
							index,
							label,
							selected,
							selectedIndex,
							onPick: setPicked,
							trailing: meta.idMode === "none" && !usesFloatingIds ? obj.plus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-mono text-[11px] text-subtle",
								children: ["+", obj.kind]
							}) : null : ident ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `shrink-0 font-mono text-xs ${ident.kind === "floating" ? "text-accent" : "text-subtle"}`,
								children: ident.label
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `shrink-0 font-mono text-xs ${obj.id ? "text-subtle" : "text-warn"}`,
								children: obj.id || "no id"
							})
						}, objectKey(obj, index));
					})
				}),
				usesFloatingIds || usesIds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 border-t border-border p-2",
					children: [usesFloatingIds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-xs uppercase tracking-[0.14em] text-muted",
						children: "Custom IDs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: selected && blockIdentity(selected).kind === "floating" ? objectKey(selected, selectedIndex) : "pick",
						onValueChange: (key) => {
							if (key !== "pick") setPicked(key);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-full min-w-0",
							"aria-label": "Custom name IDs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: floats.length ? `${floats.length} custom names` : "No custom IDs" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							className: "max-h-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "pick",
								children: floats.length ? `${floats.length} custom names` : "No custom IDs"
							}), floats.map((obj) => {
								const index = indexOf(obj);
								const key = objectKey(obj, index);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: key,
									children: [blockIdentity(obj).label, locaLabel(loca, obj.name, language) ? ` · ${locaLabel(loca, obj.name, language)}` : ""]
								}, key);
							})]
						})]
					})] }) : null, usesIds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-xs uppercase tracking-[0.14em] text-muted",
						children: "Unused IDs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						onValueChange: (value) => claim(Number(value.split(":").pop())),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-full min-w-0",
							"aria-label": "Unused numeric IDs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: unused.total ? `${unused.total} free numbers` : "No unused IDs" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							className: "max-h-80",
							children: [
								unused.ranges.map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: `range:${range.from}`,
									children: [range.from === range.to ? String(range.from) : `${range.from}–${range.to}`, ` · claim ${range.from}`]
								}, `range-${range.from}-${range.to}`)),
								unused.ids.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: `id:${id}`,
									children: id
								}, `id-${id}`)),
								!unused.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "none",
									disabled: true,
									children: "None"
								}) : null
							]
						})]
					}, unused.next)] }) : null]
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-6",
			children: selected && selectedIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectDetail, {
				obj: selected,
				role,
				label: locaLabel(loca, selected.name, language),
				thin: !hasText,
				onPatch: (mut) => patch(selectedIndex, mut),
				onRemove: () => {
					persist(objects.filter((_, i) => i !== selectedIndex));
					setPicked(null);
				},
				onCompare,
				inherit: isEntities ? (key) => resolvedField(selected, key, byName) : void 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select an entry."
			})
		})]
	});
}
function ObjectDetail({ obj, role, label, thin, onPatch, onRemove, onCompare, inherit }) {
	const meta = configMeta(role);
	const preferred = statsFor(role);
	const extra = Object.keys(obj.fields).filter((k) => k !== "Label" && !preferred.includes(k));
	const [newKey, setNewKey] = (0, import_react.useState)("");
	const [newInput, setNewInput] = (0, import_react.useState)({
		name: "",
		count: "1"
	});
	const inputs = role === "templates" ? templateInputs(obj) : [];
	const setField = (key, value) => onPatch((cur) => ({
		...cur,
		fields: {
			...cur.fields,
			[key]: value
		}
	}));
	const setInputs = (rows) => onPatch((cur) => withTemplateInputs(cur, rows));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
						name: obj.name,
						fields: obj.fields,
						className: "size-16 rounded-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.14em] text-accent",
								children: obj.kind
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-2xl font-medium tracking-tight",
								children: label || objectLabel(obj)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-sm text-muted",
								children: [objectLabel(obj), obj.id ? ` · Id ${obj.id}` : meta?.idMode === "required" ? " · no id" : obj.name ? ` · custom ${obj.plus ? "+" : ""}${obj.name}` : ""]
							}),
							role === "eclass" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 flex flex-wrap gap-1 text-[11px]",
								children: ENTITY_CLASS_KEYS.map((key) => {
									const own = (obj.fields[key] ?? "").trim();
									const value = own || inherit?.(key) || "";
									if (!value) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `rounded-sm px-1.5 py-0.5 font-mono ${own ? "bg-elevated text-fg" : "bg-bg text-subtle"}`,
										title: own ? key : `${key} inherited from ${obj.fields.Ref || "Ref"}`,
										children: [
											key,
											":",
											value
										]
									}, key);
								})
							}) : null
						]
					}),
					onCompare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => onCompare(obj.name),
						children: "Compare"
					}) : null,
					onRemove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: onRemove,
						children: "Delete"
					}) : null
				]
			}),
			thin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted",
				children: [
					"Names only until you re-import the config. Editing a field here will write a new ",
					role,
					" config into this workshop."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: obj.name,
							onChange: (e) => onPatch((cur) => ({
								...cur,
								name: e.target.value
							}))
						})
					}),
					meta?.idMode === "none" && role !== "blocks" && role !== "items" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: role === "blocks" || role === "items" ? "Numeric Id (optional)" : "Id",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: obj.id ?? "",
							placeholder: role === "blocks" || role === "items" ? `empty — Name is the floating ID` : "empty — assign an unused Id",
							onChange: (e) => onPatch((cur) => ({
								...cur,
								id: e.target.value || void 0
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Header",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex h-10 w-full items-center justify-between rounded-sm border border-border bg-bg px-3 font-mono text-sm",
								onClick: () => onPatch((cur) => ({
									...cur,
									plus: !cur.plus
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: `{ ${obj.plus ? "+" : ""}${obj.kind}${obj.id ? ` Id: ${obj.id},` : ""}${obj.name ? ` Name: ${obj.name}` : ""} }`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 shrink-0 text-xs uppercase tracking-[0.12em] text-accent",
									children: obj.plus ? `+${obj.kind}` : obj.kind
								})]
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Stats"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2",
				children: preferred.map((key) => {
					const inherited = inherit && !(obj.fields[key] ?? "").trim() ? inherit(key) : "";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: key,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: obj.fields[key] ?? "",
							placeholder: inherited ? `from ${obj.fields.Ref || "template"}: ${inherited}` : void 0,
							onChange: (e) => setField(key, e.target.value)
						})
					}, key);
				})
			}),
			extra.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted",
				children: "More fields"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2",
				children: extra.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: obj.fields[key] ?? "",
						onChange: (e) => setField(key, e.target.value)
					})
				}, key))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-8",
					value: newKey,
					placeholder: "Add field name",
					onChange: (e) => setNewKey(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: !newKey.trim(),
					onClick: () => {
						setField(newKey.trim(), "");
						setNewKey("");
					},
					children: "Add field"
				})]
			}),
			role === "templates" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-medium uppercase tracking-[0.14em] text-accent",
					children: "Child Inputs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-2",
					children: [inputs.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_80px_auto] gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: row.name,
								onChange: (e) => setInputs(inputs.map((r, i) => i === index ? {
									...r,
									name: e.target.value
								} : r))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: row.count,
								onChange: (e) => setInputs(inputs.map((r, i) => i === index ? {
									...r,
									count: e.target.value
								} : r))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setInputs(inputs.filter((_, i) => i !== index)),
								children: "Remove"
							})
						]
					}, `${row.name}-${index}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_80px_auto] gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newInput.name,
								placeholder: "Ingredient name",
								onChange: (e) => setNewInput((s) => ({
									...s,
									name: e.target.value
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newInput.count,
								onChange: (e) => setNewInput((s) => ({
									...s,
									count: e.target.value
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !newInput.name.trim(),
								onClick: () => {
									setInputs([...inputs, {
										name: newInput.name.trim(),
										count: newInput.count || "1"
									}]);
									setNewInput({
										name: "",
										count: "1"
									});
								},
								children: "Add"
							})
						]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildrenEditor, {
				obj,
				onPatch
			})
		]
	});
}
function ChildrenEditor({ obj, onPatch }) {
	const children = obj.children ?? [];
	const setChildren = (next) => onPatch((cur) => ({
		...cur,
		children: next
	}));
	const [newChild, setNewChild] = (0, import_react.useState)("Items");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Child blocks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-subtle",
				children: ["Loot rows, sensors, modify stats — nested ", `{ Child … }`]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-3",
				children: [children.map((child, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-sm border border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "h-8 font-mono text-xs",
								value: child.name,
								onChange: (e) => setChildren(children.map((c, i) => i === index ? {
									...c,
									name: e.target.value
								} : c))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setChildren(children.filter((_, i) => i !== index)),
								children: "Remove"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							children: Object.entries(child.fields).map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: key,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value,
									onChange: (e) => setChildren(children.map((c, i) => i === index ? {
										...c,
										fields: {
											...c.fields,
											[key]: e.target.value
										}
									} : c))
								})
							}, key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							className: "mt-2",
							onClick: () => {
								const key = `Field_${Object.keys(child.fields).length}`;
								setChildren(children.map((c, i) => i === index ? {
									...c,
									fields: {
										...c.fields,
										[key]: ""
									}
								} : c));
							},
							children: "Add field"
						})
					]
				}, `${child.name}-${index}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-8 w-40",
						value: newChild,
						placeholder: "Child name",
						onChange: (e) => setNewChild(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !newChild.trim(),
						onClick: () => {
							setChildren([...children, {
								kind: "Child",
								plus: false,
								name: newChild.trim(),
								fields: {}
							}]);
							setNewChild("Items");
						},
						children: "Add child"
					})]
				})]
			})
		]
	});
}
function BlockCompare({ initial }) {
	const catalog = usePdaStore((s) => s.catalog);
	const loca = (0, import_react.useMemo)(() => localizationTable(catalog), [catalog]);
	const language = usePdaStore((s) => s.project.language) || "English";
	const blocks = (0, import_react.useMemo)(() => objectsFor(catalog, "blocks"), [catalog]);
	const [leftName, setLeftName] = (0, import_react.useState)(initial || blocks[0]?.name || "");
	const [rightName, setRightName] = (0, import_react.useState)("");
	const left = blocks.find((b) => b.name === leftName) ?? blocks[0];
	const peers = left ? similarBlocks(blocks, left) : [];
	const pool = peers.length ? peers : blocks.filter((b) => b.name !== left?.name);
	const right = blocks.find((b) => b.name === rightName) || pool[0];
	const rows = left && right ? compareObjects(left, right, statsFor("blocks")) : [];
	(0, import_react.useEffect)(() => {
		if (initial) setLeftName(initial);
	}, [initial]);
	(0, import_react.useEffect)(() => {
		if (rightName && pool.some((p) => p.name === rightName)) return;
		setRightName(pool[0]?.name || "");
	}, [leftName, blocks]);
	if (!blocks.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-sm text-muted",
		children: "Import BlocksConfig.ecf to compare blocks."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[240px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "min-h-0 overflow-auto border-r border-border p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-accent",
					children: peers.length ? "Same category" : "All blocks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: left?.fields.Category || left?.fields.Group || "Uncategorized"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-1",
					children: pool.length ? pool.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setRightName(b.name),
						className: `flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm ${right?.name === b.name ? "bg-elevated" : "hover:bg-elevated/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
							name: b.name,
							fields: b.fields,
							className: "size-6"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: locaLabel(loca, b.name, language) || b.name
						})]
					}, b.name)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No other blocks in this category."
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "min-h-0 overflow-auto p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Block A",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm",
						value: left?.name || "",
						onChange: (e) => setLeftName(e.target.value),
						children: blocks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.name,
							children: locaLabel(loca, b.name, language) || b.name
						}, b.name))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Block B",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm",
						value: right?.name || "",
						onChange: (e) => setRightName(e.target.value),
						children: (pool.length ? pool : blocks.filter((b) => b.name !== left?.name)).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.name,
							children: locaLabel(loca, b.name, language) || b.name
						}, b.name))
					})
				})]
			}), left && right ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
							name: left.name,
							fields: left.fields,
							className: "size-10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: locaLabel(loca, left.name, language) || left.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: left.name
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "vs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
							name: right.name,
							fields: right.fields,
							className: "size-10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: locaLabel(loca, right.name, language) || right.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: right.name
						})] })]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs uppercase tracking-[0.12em] text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "Stat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "A"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "B"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "Δ B−A"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: row.left !== row.right ? "bg-elevated/40" : "",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 text-muted",
								children: row.key
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono text-xs",
								children: row.left || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono text-xs",
								children: row.right || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `py-1.5 font-mono text-xs ${row.delta == null || row.delta === 0 ? "text-subtle" : row.delta > 0 ? "text-accent" : "text-danger"}`,
								children: row.delta == null || row.delta === 0 ? "—" : row.delta > 0 ? `+${row.delta}` : String(row.delta)
							})
						]
					}, row.key))
				})]
			})] }) : null]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "relative block space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
				label,
				note: noteForField(label)
			})]
		}), children]
	});
}
function LocaEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const projectLang = usePdaStore((s) => s.project.language);
	const [table, setTable] = (0, import_react.useState)(() => localizationTable(catalog));
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const language = table.languages.includes(projectLang) ? projectLang : table.languages[0] || "English";
	const [lang, setLang] = (0, import_react.useState)(language);
	const q = query.trim().toLowerCase();
	const keys = Object.keys(table.rows).filter((key) => {
		if (!q) return true;
		const rec = table.rows[key] ?? {};
		return key.toLowerCase().includes(q) || Object.values(rec).some((v) => v.toLowerCase().includes(q));
	});
	const selectedKey = picked && table.rows[picked] ? picked : keys[0] ?? null;
	const selected = selectedKey ? table.rows[selectedKey] : null;
	const commit = (next) => {
		setTable(next);
		setCatalogText("localization", writeLocalization(next), catalogText(catalog, "localization")?.path || "Localization.csv");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Filter keys or text…",
						className: "h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-8 rounded-sm border border-border bg-surface px-2 text-xs",
								value: lang,
								onChange: (e) => setLang(e.target.value),
								children: table.languages.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: l }, l))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => {
									let n = 1;
									let key = `txt_new_${n}`;
									while (table.rows[key]) {
										n += 1;
										key = `txt_new_${n}`;
									}
									const next = structuredClone(table);
									upsertCsv(next, key, lang, "");
									commit(next);
									setPicked(key);
								},
								children: "Add key"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !Object.keys(table.rows).length,
								onClick: () => download("Localization.csv", stringifyCsv(table), "text/csv"),
								children: "Export"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							keys.length,
							" / ",
							Object.keys(table.rows).length,
							" keys"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto",
				children: !keys.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 text-sm text-muted",
					children: "Import Localization.csv from the Import page."
				}) : keys.slice(0, 400).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setPicked(key),
					className: `block w-full truncate px-3 py-1.5 text-left text-sm ${selectedKey === key ? "bg-elevated" : "hover:bg-elevated/50"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-subtle",
						children: key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block truncate text-sm",
						children: table.rows[key]?.[lang] || "—"
					})]
				}, key))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-5",
			children: selectedKey && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-accent",
						children: "Localization key"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-mono text-lg",
						children: selectedKey
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "danger",
						onClick: () => {
							const next = structuredClone(table);
							delete next.rows[selectedKey];
							commit(next);
							setPicked(null);
						},
						children: "Delete"
					})]
				}), table.languages.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: l,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: selected[l] ?? "",
						onChange: (e) => {
							const next = structuredClone(table);
							upsertCsv(next, selectedKey, l, e.target.value);
							commit(next);
						}
					}), l === lang ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
						as: "div",
						className: "mt-2 text-sm leading-relaxed text-muted",
						text: selected[l] ?? ""
					}) : null]
				}, l))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-6 text-sm text-muted",
				children: "Select a key, or import Localization.csv."
			})
		})]
	});
}
//#endregion
export { ObjectBrowser as n, LibraryPage as t };

import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as upsertCsv, D as stringifyEcfObjects, E as stringifyCsv, P as warmImageCache, j as usePdaStore, r as Button, t as AppHeader } from "./app-header-DGS9uiUo.mjs";
import { i as Textarea, n as Input, t as BbText } from "./input-RevLgvVB.mjs";
import { S as writeLocalization, a as catalogText, d as locaLabel, f as localizationTable, h as objectsFor } from "./library-COrpIse4.mjs";
import { t as ItemIcon } from "./pda-image-DUY7o9hd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-kkY2ah5x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ITEM_STATS = [
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
];
var BLOCK_STATS = [
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
];
var TOKEN_STATS = [
	"MarketPrice",
	"DropOnDeath",
	"CustomIcon"
];
function statsFor(role) {
	if (role === "items") return ITEM_STATS;
	if (role === "tokens") return TOKEN_STATS;
	return BLOCK_STATS;
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
	const [tab, setTab] = (0, import_react.useState)("items");
	const [compareLeft, setCompareLeft] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-x-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-medium tracking-tight",
					children: "Library"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Edit item and block stats from ItemsConfig / BlocksConfig, compare blocks in the same category, and patch Localization.csv."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 border-b border-border px-3",
				children: [
					{
						id: "items",
						label: "Items"
					},
					{
						id: "blocks",
						label: "Blocks"
					},
					{
						id: "tokens",
						label: "Tokens"
					},
					{
						id: "compare",
						label: "Compare"
					},
					{
						id: "localization",
						label: "Localization"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab(item.id),
					className: `relative h-10 px-3 text-sm ${tab === item.id ? "text-fg" : "text-muted hover:text-fg"}`,
					children: [item.label, tab === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-2 bottom-0 h-px bg-accent" }) : null]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1",
				children: [
					tab === "items" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
						role: "items",
						title: "Items"
					}) : null,
					tab === "blocks" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
						role: "blocks",
						title: "Blocks",
						onCompare: (name) => {
							setCompareLeft(name);
							setTab("compare");
						}
					}) : null,
					tab === "tokens" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
						role: "tokens",
						title: "Tokens"
					}) : null,
					tab === "compare" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockCompare, { initial: compareLeft }) : null,
					tab === "localization" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaEditor, {}) : null
				]
			}),
			!catalog.texts?.length && !catalog.entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "Empty library"
			}) : null
		]
	});
}
function ObjectBrowser({ role, title, onCompare }) {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const loca = (0, import_react.useMemo)(() => localizationTable(catalog), [catalog]);
	const language = usePdaStore((s) => s.project.language) || "English";
	const objects = (0, import_react.useMemo)(() => objectsFor(catalog, role), [catalog, role]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		warmImageCache();
	}, []);
	const cats = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const obj of objects) if (obj.fields.Category) set.add(obj.fields.Category);
		return [...set].sort();
	}, [objects]);
	const [cat, setCat] = (0, import_react.useState)("all");
	const q = query.trim().toLowerCase();
	const visible = objects.filter((obj) => {
		if (cat !== "all" && obj.fields.Category !== cat) return false;
		if (!q) return true;
		const label = locaLabel(loca, obj.name, language);
		return `${obj.name} ${obj.id ?? ""} ${label} ${obj.fields.Category ?? ""}`.toLowerCase().includes(q);
	});
	const selected = objects.find((o) => o.name === picked) ?? visible[0];
	const hasText = Boolean(catalogText(catalog, role));
	const fileName = role === "items" ? "ItemsConfig.ecf" : role === "blocks" ? "BlocksConfig.ecf" : "TokenConfig.ecf";
	const persist = (next) => {
		setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
	};
	const patch = (name, mut) => {
		persist(objects.map((obj) => obj.name === name ? mut({
			...obj,
			fields: { ...obj.fields }
		}) : obj));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: `Filter ${title.toLowerCase()}…`,
						className: "h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
					}),
					cats.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs",
						value: cat,
						onChange: (e) => setCat(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All categories"
						}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !objects.length,
							onClick: () => download(fileName, stringifyEcfObjects(objects), "text/plain"),
							children: "Export"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							visible.length,
							" / ",
							objects.length
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto",
				children: !objects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "p-4 text-sm text-muted",
					children: [
						"Import ",
						title,
						"Config.ecf from the Import page."
					]
				}) : visible.slice(0, 500).map((obj) => {
					const label = locaLabel(loca, obj.name, language);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setPicked(obj.name),
						className: `flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${selected?.name === obj.name ? "bg-elevated" : "hover:bg-elevated/50"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
								name: obj.name,
								fields: obj.fields,
								className: "size-6 rounded-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate",
								children: label || obj.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 font-mono text-xs text-subtle",
								children: obj.id || obj.name
							})
						]
					}, obj.name);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-6",
			children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectDetail, {
				obj: selected,
				role,
				label: locaLabel(loca, selected.name, language),
				thin: !hasText,
				onPatch: (mut) => patch(selected.name, mut),
				onCompare
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select an entry."
			})
		})]
	});
}
function ObjectDetail({ obj, role, label, thin, onPatch, onCompare }) {
	const preferred = statsFor(role);
	const extra = Object.keys(obj.fields).filter((k) => k !== "Label" && !preferred.includes(k));
	const [newKey, setNewKey] = (0, import_react.useState)("");
	const setField = (key, value) => onPatch((cur) => ({
		...cur,
		fields: {
			...cur.fields,
			[key]: value
		}
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
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
								children: label || obj.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-sm text-muted",
								children: [obj.name, obj.id ? ` · Id ${obj.id}` : ""]
							})
						]
					}),
					onCompare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => onCompare(obj.name),
						children: "Compare"
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: obj.name,
						onChange: (e) => onPatch((cur) => ({
							...cur,
							name: e.target.value
						}))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Id",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: obj.id ?? "",
						onChange: (e) => onPatch((cur) => ({
							...cur,
							id: e.target.value
						}))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Stats"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2",
				children: preferred.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: obj.fields[key] ?? "",
						onChange: (e) => setField(key, e.target.value)
					})
				}, key))
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
		className: "block space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium uppercase tracking-[0.12em] text-muted",
			children: label
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
var SplitComponent = LibraryPage;
//#endregion
export { SplitComponent as component };

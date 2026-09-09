import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as stringifyCsv, F as warmImageCache, M as usePdaStore, O as stringifyEcfObjects, j as upsertCsv, r as Button, t as AppHeader } from "./button-Baqp_Mp4.mjs";
import { i as Textarea, n as Input, t as BbText } from "./input-Z8rLsYnT.mjs";
import { a as catalogText, f as locaLabel, g as objectsFor, p as localizationTable, w as writeLocalization } from "./library-anjucauI.mjs";
import { t as ItemIcon } from "./pda-image-tliH5CiP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-SEakUW8H.js
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
var TEMPLATE_STATS = [
	"CraftTime",
	"OutputCount",
	"Target",
	"BaseItem"
];
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
	if (role === "items") return ITEM_STATS;
	if (role === "tokens") return TOKEN_STATS;
	if (role === "templates") return TEMPLATE_STATS;
	return BLOCK_STATS;
}
function numericIds(objects) {
	return objects.map((obj) => Number(obj.id)).filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
}
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
function download$1(name, text) {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
function Field$1({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium uppercase tracking-[0.12em] text-muted",
			children: label
		}), children]
	});
}
function useConfig(role, fileName) {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const objects = (0, import_react.useMemo)(() => objectsFor(catalog, role), [catalog, role]);
	const persist = (next) => {
		setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
	};
	return {
		catalog,
		objects,
		persist,
		fileName
	};
}
function ReputationTable() {
	const { objects, persist, fileName } = useConfig("reputation", "DefReputation.ecf");
	const [newFaction, setNewFaction] = (0, import_react.useState)("");
	const columns = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const obj of objects) for (const key of Object.keys(obj.fields)) set.add(key);
		return [...set];
	}, [objects]);
	const setCell = (name, faction, value) => {
		persist(objects.map((obj) => obj.name === name ? {
			...obj,
			fields: {
				...obj.fields,
				[faction]: value
			}
		} : obj));
	};
	const addRow = () => {
		const used = new Set(objects.map((o) => o.name));
		let n = objects.length + 1;
		let name = `Human:${n}`;
		while (used.has(name)) {
			n += 1;
			name = `Human:${n}`;
		}
		const fields = {};
		for (const col of columns) fields[col] = "16500";
		persist([...objects, {
			kind: "Reputation",
			plus: false,
			name,
			fields
		}]);
	};
	const addColumn = () => {
		const faction = newFaction.trim();
		if (!faction || columns.includes(faction)) return;
		persist(objects.map((obj) => ({
			...obj,
			fields: {
				...obj.fields,
				[faction]: obj.fields[faction] ?? "16500"
			}
		})));
		setNewFaction("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 border-b border-border px-4 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: addRow,
					children: "Add origin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-8 w-40",
					value: newFaction,
					placeholder: "New faction",
					onChange: (e) => setNewFaction(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: !newFaction.trim(),
					onClick: addColumn,
					children: "Add faction column"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: !objects.length,
					onClick: () => download$1(fileName, stringifyEcfObjects(objects)),
					children: "Export"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-subtle",
					children: [
						objects.length,
						" origins · ",
						columns.length,
						" factions"
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto p-4",
			children: !objects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Import DefReputation.ecf, or add an origin row and faction columns. Values are starting reputation for that player origin vs each NPC faction."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-max min-w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "sticky top-0 bg-bg text-left text-xs uppercase tracking-[0.12em] text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2",
							children: "Origin"
						}),
						columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2",
							children: col
						}, col)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-2" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: objects.map((obj) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "h-8 w-32 font-mono text-xs",
								value: obj.name,
								onChange: (e) => persist(objects.map((row) => row.name === obj.name ? {
									...row,
									name: e.target.value
								} : row))
							})
						}),
						columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "h-8 w-24 font-mono text-xs",
								value: obj.fields[col] ?? "",
								onChange: (e) => setCell(obj.name, col, e.target.value)
							})
						}, col)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => persist(objects.filter((row) => row.name !== obj.name)),
								children: "Remove"
							})
						})
					] }, obj.name))
				})]
			})
		})]
	});
}
function WarfareEditor() {
	const { objects, persist, fileName } = useConfig("warfare", "FactionWarfare.ecf");
	const factions = objects.filter((obj) => /factionsettings/i.test(obj.name) || obj.fields.Faction);
	const [picked, setPicked] = (0, import_react.useState)(0);
	const selected = factions[picked] ?? factions[0];
	const selectedIndex = selected ? objects.indexOf(selected) : -1;
	const addFaction = () => {
		const used = new Set(factions.map((f) => (f.fields.Faction || "").toLowerCase()));
		let name = "NewFaction";
		let n = 2;
		while (used.has(name.toLowerCase())) {
			name = `NewFaction${n}`;
			n += 1;
		}
		const obj = {
			kind: "Element",
			plus: false,
			name: "FactionSettings",
			fields: {
				Faction: name,
				ScenarioGroup: name,
				Lvl1MinPrice: "25",
				Lvl1MaxPrice: "40",
				Lvl5MinPrice: "110",
				Lvl5MaxPrice: "130",
				Lvl10MinPrice: "200",
				Lvl10MaxPrice: "232",
				SDScenarioGroup: `${name}SpaceDefense`,
				SDProbabilityMin: "0.20",
				SDProbabilityMax: "0.80",
				SDPriceMin: "30",
				SDPriceMax: "150"
			}
		};
		persist([...objects, obj]);
		setPicked(factions.length);
	};
	const patch = (mut) => {
		if (selectedIndex < 0) return;
		persist(objects.map((obj, i) => i === selectedIndex ? mut({
			...obj,
			fields: { ...obj.fields }
		}) : obj));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[260px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 border-b border-border p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: addFaction,
					children: "Add faction"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: !objects.length,
					onClick: () => download$1(fileName, stringifyEcfObjects(objects)),
					children: "Export"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto",
				children: !factions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 text-sm text-muted",
					children: "Import FactionWarfare.ecf, or add a faction."
				}) : factions.map((obj, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setPicked(i),
					className: `flex w-full items-center justify-between px-3 py-1.5 text-left text-sm ${factions[picked] === obj ? "bg-elevated" : "hover:bg-elevated/50"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: obj.fields.Faction || obj.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-subtle",
						children: obj.fields.ScenarioGroup || ""
					})]
				}, `${obj.fields.Faction || obj.name}-${i}`))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-6",
			children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-medium tracking-tight",
						children: selected.fields.Faction || selected.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Attack prices and space-defense settings for this faction."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-3 sm:grid-cols-2",
						children: WARFARE_STATS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: key,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: selected.fields[key] ?? "",
								onChange: (e) => patch((cur) => ({
									...cur,
									fields: {
										...cur.fields,
										[key]: e.target.value
									}
								}))
							})
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						size: "sm",
						variant: "secondary",
						onClick: () => persist(objects.filter((_, i) => i !== selectedIndex)),
						children: "Remove faction"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select a faction."
			})
		})]
	});
}
function GalaxyEditor() {
	const { objects, persist, fileName } = useConfig("galaxy", "GalaxyConfig.ecf");
	const general = objects.find((o) => /galaxyconfig/i.test(o.kind) && /^general$/i.test(o.name)) ?? objects.find((o) => /galaxyconfig/i.test(o.kind)) ?? null;
	const generalIndex = general ? objects.indexOf(general) : -1;
	const territories = (general?.children ?? []).filter((c) => /territory/i.test(c.name));
	const stars = objects.filter((o) => o !== general);
	const [starName, setStarName] = (0, import_react.useState)(stars[0]?.name || "");
	const star = stars.find((s) => s.name === starName) ?? stars[0];
	const patchGeneral = (mut) => {
		if (generalIndex < 0) {
			persist([mut({
				kind: "GalaxyConfig",
				plus: false,
				name: "General",
				fields: {},
				children: []
			}), ...objects]);
			return;
		}
		persist(objects.map((obj, i) => i === generalIndex ? mut({
			...obj,
			fields: { ...obj.fields },
			children: [...obj.children ?? []]
		}) : obj));
	};
	const addTerritory = () => {
		const child = {
			kind: "Child",
			plus: false,
			name: `Territory_${territories.length + 1}`,
			fields: {
				Faction: "NewFaction",
				Center: "0, 0, 0",
				Radius: "20"
			}
		};
		patchGeneral((cur) => ({
			...cur,
			children: [...cur.children ?? [], child]
		}));
	};
	const patchTerritory = (name, mut) => {
		patchGeneral((cur) => ({
			...cur,
			children: (cur.children ?? []).map((c) => c.name === name ? mut({
				...c,
				fields: { ...c.fields }
			}) : c)
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full min-h-0 overflow-auto p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: addTerritory,
						children: "Add territory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !objects.length,
						onClick: () => download$1(fileName, stringifyEcfObjects(objects)),
						children: "Export"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [
							territories.length,
							" territories · ",
							stars.length,
							" star types"
						]
					})
				]
			}),
			!objects.length && !general ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Import GalaxyConfig.ecf, then edit star counts, territories, and star types. Add a territory to place a new faction on the map."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "General"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: GALAXY_GENERAL_STATS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: key,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: general?.fields[key] ?? "",
						onChange: (e) => patchGeneral((cur) => ({
							...cur,
							fields: {
								...cur.fields,
								[key]: e.target.value
							}
						}))
					})
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Territories"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left text-xs uppercase tracking-[0.12em] text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2",
								children: "Id"
							}),
							TERRITORY_STATS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2",
								children: col
							}, col)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2",
								children: "Other factions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-2" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: territories.map((row) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1.5 font-mono text-xs text-subtle",
									children: row.name
								}),
								TERRITORY_STATS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8",
										value: row.fields[col] ?? "",
										onChange: (e) => patchTerritory(row.name, (cur) => ({
											...cur,
											fields: {
												...cur.fields,
												[col]: e.target.value
											}
										}))
									})
								}, col)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: Object.entries(row.fields).filter(([k]) => /^Other_/i.test(k)).map(([, v]) => v.split(",")[0].trim()).filter(Boolean).join(", ") || "—"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-28",
											placeholder: "Add faction",
											onKeyDown: (e) => {
												if (e.key !== "Enter") return;
												const name = e.target.value.trim();
												if (!name) return;
												patchTerritory(row.name, (cur) => {
													const n = Object.keys(cur.fields).filter((k) => /^Other_/i.test(k)).length + 1;
													return {
														...cur,
														fields: {
															...cur.fields,
															[`Other_${n}`]: name
														}
													};
												});
												e.target.value = "";
											}
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => patchGeneral((cur) => ({
											...cur,
											children: (cur.children ?? []).filter((c) => c.name !== row.name)
										})),
										children: "Remove"
									})
								})
							] }, row.name);
						})
					})]
				})
			}),
			stars.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent",
					children: "Star types"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 max-w-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm",
						value: star?.name || "",
						onChange: (e) => setStarName(e.target.value),
						children: stars.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.name,
							children: s.name
						}, s.name))
					})
				}),
				star ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid max-w-3xl gap-3 sm:grid-cols-2",
					children: Object.keys(star.fields).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: key,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: star.fields[key] ?? "",
							onChange: (e) => persist(objects.map((obj) => obj.name === star.name ? {
								...obj,
								fields: {
									...obj.fields,
									[key]: e.target.value
								}
							} : obj))
						})
					}, key))
				}) : null
			] }) : null
		]
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
					children: "Edit items, blocks, templates, reputation, faction warfare, and galaxy config. Unused IDs show as empty slots you can claim."
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
						id: "templates",
						label: "Templates"
					},
					{
						id: "tokens",
						label: "Tokens"
					},
					{
						id: "reputation",
						label: "Reputation"
					},
					{
						id: "warfare",
						label: "Warfare"
					},
					{
						id: "galaxy",
						label: "Galaxy"
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
					tab === "templates" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
						role: "templates",
						title: "Templates"
					}) : null,
					tab === "reputation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReputationTable, {}) : null,
					tab === "warfare" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarfareEditor, {}) : null,
					tab === "galaxy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalaxyEditor, {}) : null,
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
	const q = query.trim().toLowerCase();
	const missingIds = objects.filter((obj) => !obj.id);
	const unused = (0, import_react.useMemo)(() => unusedNumericIds(numericIds(objects)), [objects]);
	const usesIds = role === "items" || role === "blocks" || role === "tokens";
	const visible = objects.filter((obj) => {
		if (idFilter === "missing" && obj.id) return false;
		if (cat !== "all" && obj.fields.Category !== cat) return false;
		if (!q) return true;
		const label = locaLabel(loca, obj.name, language);
		return `${obj.name} ${obj.id ?? ""} ${label} ${obj.fields.Category ?? ""}`.toLowerCase().includes(q);
	});
	const selected = objects.find((o) => o.name === picked) ?? visible[0];
	const hasText = Boolean(catalogText(catalog, role));
	const fileName = role === "items" ? "ItemsConfig.ecf" : role === "blocks" ? "BlocksConfig.ecf" : role === "templates" ? "Templates.ecf" : "TokenConfig.ecf";
	const kindName = role === "items" ? "Item" : role === "blocks" ? "Block" : role === "templates" ? "Template" : "Token";
	const persist = (next) => {
		setCatalogText(role, stringifyEcfObjects(next), catalogText(catalog, role)?.path || fileName);
	};
	const patch = (name, mut) => {
		persist(objects.map((obj) => obj.name === name ? mut({
			...obj,
			fields: { ...obj.fields },
			children: obj.children
		}) : obj));
	};
	const claim = (id) => {
		const used = new Set(objects.map((o) => o.name.toLowerCase()));
		let n = id ?? unused.next;
		let name = role === "templates" ? "NewTemplate" : `New${kindName}${n}`;
		let suffix = 2;
		while (used.has(name.toLowerCase())) {
			name = role === "templates" ? `NewTemplate${suffix}` : `New${kindName}${n}_${suffix}`;
			suffix += 1;
		}
		const obj = {
			kind: kindName,
			plus: true,
			name,
			id: role === "templates" ? void 0 : String(n),
			fields: {},
			children: role === "templates" ? [{
				kind: "Child",
				plus: false,
				name: "Inputs",
				fields: {}
			}] : void 0
		};
		persist([...objects, obj]);
		setPicked(name);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
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
						cats.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs",
							value: cat,
							onChange: (e) => setCat(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All categories"
							}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
						}) : null,
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
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
								usesIds ? ` · ${unused.total} unused IDs` : ""
							]
						})
					]
				}),
				usesIds && unused.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.14em] text-accent",
							children: "Empty IDs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-subtle",
							children: [
								"Claim a free Id to add a new ",
								kindName.toLowerCase(),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: unused.ranges.slice(0, 8).map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted hover:bg-elevated hover:text-fg",
								onClick: () => claim(range.from),
								title: `${range.count} free · uses ${range.from}`,
								children: range.from === range.to ? range.from : `${range.from}–${range.to}`
							}, `${range.from}-${range.to}`))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: [unused.ids.slice(0, 24).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-muted hover:text-fg",
								onClick: () => claim(id),
								children: id
							}, id)), unused.total > 24 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-1 text-[11px] text-subtle",
								children: ["+", unused.total - 24]
							}) : null]
						})
					]
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
								role === "templates" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `shrink-0 font-mono text-xs ${obj.id ? "text-subtle" : "text-warn"}`,
									children: obj.id || "no id"
								})
							]
						}, obj.name);
					})
				})
			]
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
								children: [obj.name, obj.id ? ` · Id ${obj.id}` : role === "templates" ? "" : " · no id"]
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
				}), role === "templates" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Id",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: obj.id ?? "",
						placeholder: "empty — assign an unused Id",
						onChange: (e) => onPatch((cur) => ({
							...cur,
							id: e.target.value || void 0
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
			}) : null
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

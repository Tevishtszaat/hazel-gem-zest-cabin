import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { A as randomPoiPath, Bn as kindLabel, C as catalogNames, D as getPath, E as fixedPoiPath, Hn as variantLabel, M as setPath, N as tabsForKind, O as loadPlayfieldDoc, Rn as bundlePlayfields, S as asRows, T as dumpPlayfieldDoc, Vn as patchYamlField, _ as PLANET_TYPES, a as usePdaStore, b as SPACE_VESSEL_COLS, f as ASTEROID_COLS, g as FIXED_RESOURCE_COLS, h as FIXED_POI_COLS, j as rowsToCells, k as preflightPlayfield, m as ENTITY_COLS, p as BIOME_COLS, r as cn, v as RANDOM_POI_COLS, w as cellsToRows, x as SPAWN_ZONE_COLS, y as RANDOM_RESOURCE_COLS, zn as keysForKind } from "./router-xYviGTYl.mjs";
import { a as SelectItem, i as SelectContent, n as Button, o as SelectTrigger, r as Select, s as SelectValue } from "./button-DoV8KSj5.mjs";
import { r as Textarea, t as Input } from "./input-B25_b_Jt.mjs";
import { t as FieldNote } from "./field-note-DSZYzT0E.mjs";
import { t as noteForField } from "./field-notes-BnBibNoh.mjs";
import { t as WorkspacePage } from "./workspace-page-Zt6WaVcQ.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.playfields-YMti4ZA5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		className: cn("overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2 touch-none p-px transition-colors select-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
function Separator({ className, orientation = "horizontal", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function PlayfieldDesigner({ file, kind, catalog, onChange }) {
	const [tab, setTab] = (0, import_react.useState)("basics");
	const tabs = tabsForKind(kind);
	const doc = (0, import_react.useMemo)(() => loadPlayfieldDoc(file.text), [file.text]);
	const issues = (0, import_react.useMemo)(() => preflightPlayfield(file, catalog), [file, catalog]);
	const pois = catalogNames(catalog, "poi");
	const entities = catalogNames(catalog, "entity");
	const factions = catalogNames(catalog, "faction");
	const planet = kind === "planet" || kind === "moon";
	const rewrite = (next) => onChange(dumpPlayfieldDoc(next));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-6xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.14em] text-accent",
				children: kindLabel(kind)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-xl font-medium tracking-tight",
				children: file.folder
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-subtle",
				children: ["Empyrion Playfield Designer layout: lists for POIs, resources, creatures, biomes, plus a pre-flight check. Saving a list rewrites this YAML (comments on this file may drop). Basics still patch in place.", issues.length ? ` · ${issues.length} pre-flight note${issues.length === 1 ? "" : "s"}` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-1 border-b border-border pb-2",
				children: tabs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `rounded-sm px-2 py-1 text-xs ${tab === item.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`,
					onClick: () => setTab(item.id),
					children: [item.label, item.id === "check" && issues.length ? ` (${issues.length})` : ""]
				}, item.id))
			}),
			tab === "basics" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: keysForKind(kind).map((key) => {
					const options = key === "PlayfieldType" ? ["Planet", "Space"] : key === "PlanetType" ? PLANET_TYPES : key === "Water" || key === "WaterBlock" ? [
						"WaterBlue",
						"WaterGreen",
						"WaterBrown"
					] : /^(PvP|AtmosphereBreathable|AtmosphereEnabled|AllowCV|UseFixed)$/.test(key) ? ["True", "False"] : void 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted",
							children: [key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
								label: key,
								note: noteForField(key, "playfield")
							})]
						}), key === "Description" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: file.fields[key] ?? "",
							onChange: (e) => onChange(patchYamlField(file.text, key, e.target.value))
						}) : options ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: file.fields[key] || "unset",
							onValueChange: (value) => onChange(patchYamlField(file.text, key, value === "unset" ? "" : value)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-10 w-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: key })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "unset",
								children: "(empty)"
							}), options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: opt,
								children: opt
							}, opt))] })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: file.fields[key] ?? "",
							onChange: (e) => onChange(patchYamlField(file.text, key, e.target.value))
						})]
					}, key);
				})
			}) : null,
			tab === "pois" && doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Random POIs",
					hint: "Survival scatter. GroupName is the blueprint group tag inside the .epb — not the file name.",
					cols: RANDOM_POI_COLS.map((col) => col.key === "GroupName" && pois.length ? {
						...col,
						options: pois
					} : col),
					list: asRows(getPath(doc, randomPoiPath(doc))),
					blank: {
						GroupName: "NewPOI",
						CountMinMax: [1, 1],
						DroneProb: 0,
						TroopTransport: false
					},
					onChange: (list) => rewrite(setPath(doc, randomPoiPath(doc), list))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Fixed POIs",
					hint: "Placed at Pos. Prefab is the .epb file name, not the GroupName.",
					cols: FIXED_POI_COLS.map((col) => {
						if (col.key === "Prefab" && pois.length) return {
							...col,
							options: pois
						};
						if (col.key === "Faction" && factions.length) return {
							...col,
							options: factions
						};
						return col;
					}),
					list: asRows(getPath(doc, fixedPoiPath(doc))),
					blank: {
						Name: "NewPOI",
						Prefab: "",
						Pos: [
							0,
							0,
							0
						],
						InitPower: true
					},
					onChange: (list) => rewrite(setPath(doc, fixedPoiPath(doc), list))
				})]
			}) : null,
			tab === "resources" && doc ? planet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Random resources",
					cols: RANDOM_RESOURCE_COLS,
					list: asRows(getPath(doc, ["RandomResources"])),
					blank: {
						Name: "IronResource",
						CountMinMax: [1, 3],
						SizeMinMax: [5, 8],
						DepthMinMax: [0, 1]
					},
					onChange: (list) => rewrite(setPath(doc, ["RandomResources"], list))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Fixed resources",
					cols: FIXED_RESOURCE_COLS,
					list: asRows(getPath(doc, ["FixedResources"])),
					blank: {
						Name: "IronResource",
						Pos: [
							0,
							0,
							0
						],
						Radius: 8
					},
					onChange: (list) => rewrite(setPath(doc, ["FixedResources"], list))
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Asteroid resources",
					cols: ASTEROID_COLS,
					list: asRows(getPath(doc, ["AsteroidResources"]) || getPath(doc, ["RandomResources"])),
					blank: {
						Name: "IronResource",
						CountMinMax: [2, 4]
					},
					onChange: (list) => rewrite(setPath(doc, getPath(doc, ["AsteroidResources"]) != null ? ["AsteroidResources"] : ["RandomResources"], list))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Space vessels",
					cols: SPACE_VESSEL_COLS.map((col) => col.key === "Prefab" && pois.length ? {
						...col,
						options: pois
					} : col),
					list: asRows(getPath(doc, ["SpaceVessels"]) || getPath(doc, ["RandomPlanetVesselBase"])),
					blank: {
						Name: "Trader",
						CountMinMax: [0, 1]
					},
					onChange: (list) => rewrite(setPath(doc, ["SpaceVessels"], list))
				})]
			}) : null,
			tab === "creatures" && doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatureEditor, {
				list: asRows(getPath(doc, ["CreatureSpawning"])),
				entityNames: entities,
				onChange: (list) => rewrite(setPath(doc, ["CreatureSpawning"], list))
			}) : null,
			tab === "biomes" && doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Biomes",
					hint: "Names here are what Creatures.Biome and POI biome filters point at.",
					cols: BIOME_COLS,
					list: asRows(getPath(doc, ["Biomes"]) || getPath(doc, ["BiomeClusterData"])),
					blank: { Name: "NewBiome" },
					onChange: (list) => rewrite(setPath(doc, getPath(doc, ["Biomes"]) != null || getPath(doc, ["BiomeClusterData"]) == null ? ["Biomes"] : ["BiomeClusterData"], list))
				})
			}) : null,
			tab === "spawns" && doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Spawn zones",
					cols: SPAWN_ZONE_COLS,
					list: asRows(getPath(doc, ["SpawnZones"])),
					blank: {
						Name: "Zone",
						Radius: 500
					},
					onChange: (list) => rewrite(setPath(doc, ["SpawnZones"], list))
				})
			}) : null,
			tab === "check" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2",
				children: !issues.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-border bg-surface px-4 py-6 text-sm text-ok",
					children: "Pre-flight is clean for this file."
				}) : issues.map((issue, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-xs uppercase tracking-[0.14em] ${issue.level === "error" ? "text-danger" : "text-warn"}`,
							children: issue.level
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: issue.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-subtle",
							children: issue.path
						})
					]
				}, `${issue.code}-${i}`))
			}) : null,
			tab === "raw" || !doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [!doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-danger",
					children: "YAML did not parse. Edit raw until it loads."
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "min-h-80 font-mono text-xs",
					value: file.text,
					onChange: (e) => onChange(e.target.value)
				})]
			}) : null
		]
	});
}
function YamlTable({ title, hint, cols, list, blank, onChange }) {
	const cells = rowsToCells(list, cols);
	const setCell = (row, key, value) => {
		const next = cells.map((c) => ({ ...c }));
		next[row] = {
			...next[row],
			[key]: value
		};
		onChange(cellsToRows(next, cols, list));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-end justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.14em] text-accent",
			children: title
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: hint
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "secondary",
			onClick: () => onChange([...list, { ...blank }]),
			children: "Add"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-sm border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "min-w-full text-left text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-elevated text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [cols.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-2 py-1.5 font-medium",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [col.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
							label: col.label,
							note: noteForField(col.label, "playfield")
						})]
					})
				}, col.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10 px-2 py-1.5" })] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [cells.map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [cols.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-1 py-1",
					children: col.options?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-8 w-full min-w-28 rounded-sm border border-border bg-bg px-1 text-fg",
						value: cell[col.key] || "",
						onChange: (e) => setCell(i, col.key, e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: cell[col.key] ? cell[col.key] : "—"
						}), col.options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: opt,
							children: opt
						}, opt))]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 w-full min-w-24 rounded-sm border border-border bg-bg px-1 text-fg",
						value: cell[col.key] ?? "",
						onChange: (e) => setCell(i, col.key, e.target.value)
					})
				}, col.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-1 py-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-xs text-danger",
						onClick: () => onChange(list.filter((_, j) => j !== i)),
						children: "×"
					})
				})]
			}, i)), !cells.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-3 text-subtle",
				colSpan: cols.length + 1,
				children: "None. Add a row."
			}) }) : null] })]
		})
	})] });
}
function CreatureEditor({ list, entityNames, onChange }) {
	const [picked, setPicked] = (0, import_react.useState)(0);
	const idx = list.length ? Math.min(Math.max(0, picked), list.length - 1) : -1;
	const biome = idx >= 0 ? list[idx] : void 0;
	const entities = asRows(biome?.Entities);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-sm border border-border",
			children: [list.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: `block w-full truncate px-3 py-2 text-left text-sm ${i === idx ? "bg-elevated" : "hover:bg-elevated/50"}`,
				onClick: () => setPicked(i),
				children: String(row.Biome ?? row.Name ?? `Biome ${i + 1}`)
			}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "block w-full px-3 py-2 text-left text-xs text-accent",
				onClick: () => {
					onChange([...list, {
						Biome: "NewBiome",
						Entities: []
					}]);
					setPicked(list.length);
				},
				children: "+ Biome"
			})]
		}), biome ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted",
					children: ["Biome", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
						label: "Biome",
						note: noteForField("Biome")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: String(biome.Biome ?? biome.Name ?? ""),
					onChange: (e) => onChange(list.map((row, i) => i === idx ? {
						...row,
						Biome: e.target.value
					} : row))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YamlTable, {
					title: "Entities",
					cols: ENTITY_COLS.map((col) => col.key === "Name" && entityNames.length ? {
						...col,
						options: entityNames
					} : col),
					list: entities,
					blank: {
						Name: entityNames[0] || "AlienBug01",
						Period: "Always",
						Amount: 1,
						Delay: 0
					},
					onChange: (next) => onChange(list.map((row, i) => i === idx ? {
						...row,
						Entities: next
					} : row))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3",
				size: "sm",
				variant: "danger",
				onClick: () => {
					onChange(list.filter((_, i) => i !== idx));
					setPicked(0);
				},
				children: "Remove biome"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Add a biome to spawn creatures."
		})]
	});
}
var KINDS = [
	"planet",
	"moon",
	"orbit",
	"space",
	"unknown"
];
function playfieldPaths(catalog) {
	const paths = /* @__PURE__ */ new Set();
	for (const file of catalog.files ?? []) if (file.role === "playfieldYaml" || file.role === "playfield") paths.add(file.path);
	for (const text of catalog.texts ?? []) if (/\/playfields?\//i.test(text.path) && /playfield|space_/i.test(text.path)) paths.add(text.path);
	for (const entry of [...catalog.entries, ...catalog.game ?? []]) {
		if (entry.kind !== "playfield") continue;
		const source = entry.source || "";
		if (!/playfield|space_/i.test(source) && !/\/playfields?\//i.test(source)) continue;
		paths.add(source.includes("/") ? source : `${entry.name}/${source}`);
	}
	return [...paths];
}
function PlayfieldEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const bundles = (0, import_react.useMemo)(() => bundlePlayfields(catalog.texts ?? [], playfieldPaths(catalog)), [catalog.texts, catalog.files]);
	const [kind, setKind] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [filePath, setFilePath] = (0, import_react.useState)(null);
	const visible = bundles.filter((bundle) => {
		if (kind !== "all" && bundle.kind !== kind) return false;
		if (!query.trim()) return true;
		return `${bundle.name} ${bundle.kind} ${bundle.files.map((f) => f.variant).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
	});
	const selected = visible.find((b) => b.folder === picked) ?? visible[0];
	const current = selected?.files.find((f) => f.path === filePath) ?? selected?.files[0];
	const persist = (path, text) => setCatalogText("playfieldYaml", text, path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-accent",
						children: "Playfields"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Filter planet, orbit, space…",
						className: "mt-2 h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: `rounded-sm px-2 py-1 text-xs ${kind === "all" ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`,
							onClick: () => setKind("all"),
							children: [
								"All (",
								bundles.length,
								")"
							]
						}), KINDS.map((id) => {
							const n = bundles.filter((b) => b.kind === id).length;
							if (!n) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `rounded-sm px-2 py-1 text-xs ${kind === id ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`,
								onClick: () => setKind(id),
								children: [
									kindLabel(id),
									" (",
									n,
									")"
								]
							}, id);
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "h-full",
					children: !visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-4 text-sm text-muted",
						children: "Import the scenario folder that contains Playfields, not only Configuration. Planets use playfield.yaml or static/dynamic pairs. Orbits often only have playfield_dynamic.yaml. Open space uses space_dynamic.yaml."
					}) : visible.map((bundle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setPicked(bundle.folder);
							setFilePath(bundle.files[0]?.path ?? null);
						},
						className: `flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${selected?.folder === bundle.folder ? "bg-elevated" : "hover:bg-elevated/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate",
							children: bundle.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-subtle",
							children: kindLabel(bundle.kind)
						})]
					}, bundle.folder))
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-6",
			children: selected && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				selected.files.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex flex-wrap gap-1",
					children: selected.files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `rounded-sm border px-2 py-1 text-xs ${current.path === file.path ? "border-accent bg-elevated" : "border-border text-muted hover:text-fg"}`,
						onClick: () => setFilePath(file.path),
						children: variantLabel(file.variant)
					}, file.path))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-subtle",
					children: variantLabel(current.variant)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayfieldDesigner, {
					file: current,
					kind: selected.kind,
					catalog,
					onChange: (text) => persist(current.path, text)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => {
						const blob = new Blob([current.text], { type: "text/yaml;charset=utf-8" });
						const a = document.createElement("a");
						a.href = URL.createObjectURL(blob);
						a.download = current.path.split(/[/\\]/).pop() || "playfield.yaml";
						a.click();
						URL.revokeObjectURL(a.href);
					},
					children: "Download this file"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select a playfield."
			})
		})]
	});
}
function PlayfieldsWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Playfields",
		kicker: "playfield.yaml · static/dynamic · space_dynamic",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayfieldEditor, {})
	});
}
//#endregion
export { PlayfieldsWorkspace as component };

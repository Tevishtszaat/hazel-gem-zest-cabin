import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Ct as objectsFor, Gn as stringifyEcfObjects, Wt as WARFARE_STATS, _t as catalogText, a as usePdaStore } from "./router-CQbUGop6.mjs";
import { n as Button } from "./button-Dk8gDvBQ.mjs";
import { t as Input } from "./input-Dg-_EBoP.mjs";
import { t as FieldNote } from "./field-note-DSZYzT0E.mjs";
import { t as noteForField } from "./field-notes-BnBibNoh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/config-tabs-1dVBJJgD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function download(name, text) {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
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
					onClick: () => download(fileName, stringifyEcfObjects(objects)),
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: ["Origin", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
									label: "Origin",
									note: "Who the reputation is measured from, usually the player origin. Example: Human:1"
								})]
							})
						}),
						columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [col, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
									label: col,
									note: "Starting reputation of this player origin toward that faction. 16500 is neutral. Lower is hostile. Example: 8500"
								})]
							})
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
					onClick: () => download(fileName, stringifyEcfObjects(objects)),
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
						children: WARFARE_STATS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
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
//#endregion
export { WarfareEditor as n, ReputationTable as t };

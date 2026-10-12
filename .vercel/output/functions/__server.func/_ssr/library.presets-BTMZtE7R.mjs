import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as usePdaStore } from "./router-CQbUGop6.mjs";
import { n as Button } from "./button-Dk8gDvBQ.mjs";
import { r as Textarea, t as Input } from "./input-Dg-_EBoP.mjs";
import { t as FieldNote } from "./field-note-DSZYzT0E.mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.presets-BTMZtE7R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LIST_KEYS = /* @__PURE__ */ new Set([
	"PlanetCountProbs",
	"PlanetLists",
	"POICountProbs",
	"POIs"
]);
function unquote(value) {
	const trimmed = value.trim().replace(/,?\s*$/, "");
	if (trimmed.startsWith("'") && trimmed.endsWith("'") || trimmed.startsWith("\"") && trimmed.endsWith("\"")) return trimmed.slice(1, -1);
	return trimmed;
}
function emptyType(section, name) {
	return {
		section,
		name,
		color: "",
		icon: "",
		climate: "",
		placement: "",
		moonProb: "",
		moonType: "",
		orbitType: "",
		moonOrbitType: "",
		distance: "",
		playfieldLevel: "",
		forceSizeClass: "",
		forcePlanetType: "",
		hasOrbit: "",
		hasTerrain: "",
		playerStart: "",
		playfields: []
	};
}
function parseRandomPreset(text) {
	const doc = {
		scalars: [],
		countRows: [],
		listRows: [],
		poiCount: "",
		pois: "",
		types: []
	};
	let mode = "none";
	let section = "";
	let current = null;
	let inPlayfields = false;
	let inPlacement = false;
	const finish = () => {
		if (current) doc.types.push(current);
		current = null;
		inPlayfields = false;
		inPlacement = false;
	};
	for (const line of text.split(/\r?\n/)) {
		const sectionHit = line.match(/^  ([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
		if (sectionHit && !line.startsWith("   ")) {
			finish();
			const key = sectionHit[1];
			const rest = sectionHit[2] ?? "";
			if (key === "PlanetCountProbs") {
				mode = "counts";
				continue;
			}
			if (key === "PlanetLists") {
				mode = "lists";
				continue;
			}
			if (key === "POICountProbs") {
				mode = "none";
				doc.poiCount = unquote(rest.replace(/#.*$/, ""));
				continue;
			}
			if (key === "POIs") {
				mode = "none";
				doc.pois = unquote(rest.replace(/#.*$/, ""));
				continue;
			}
			if (/Types$/.test(key)) {
				mode = "types";
				section = key;
				continue;
			}
			mode = "none";
			if (!LIST_KEYS.has(key) && rest.trim() && !rest.trim().startsWith("#")) doc.scalars.push({
				key,
				value: rest.replace(/#.*$/, "").trim()
			});
			continue;
		}
		if (mode === "counts" || mode === "lists") {
			const item = line.match(/^\s+-\s+(['"])([\s\S]*?)\1\s*(?:#\s*(.*))?$/);
			if (!item) continue;
			const row = {
				raw: item[2].trim(),
				comment: (item[3] || "").trim()
			};
			if (mode === "counts") doc.countRows.push(row);
			else doc.listRows.push(row);
			continue;
		}
		if (mode === "types") {
			const named = line.match(/^\s+-\s+Name:\s*(.+?)\s*$/);
			if (named && !/^\s+#/.test(line)) {
				finish();
				current = emptyType(section, named[1].replace(/#.*$/, "").trim());
				continue;
			}
			if (!current) continue;
			if (inPlayfields) {
				const play = line.match(/^\s+-\s+([^#]+?)\s*$/);
				if (play) {
					const bits = play[1].split(",");
					const name = bits[0].trim();
					const weight = (bits[1] || "1").trim();
					if (name) current.playfields.push({
						name,
						weight
					});
					continue;
				}
			}
			if (inPlacement) {
				const place = line.match(/^\s+-\s+([^#]+?)\s*$/);
				if (place) {
					current.placement = current.placement ? `${current.placement}, ${place[1].trim()}` : place[1].trim();
					continue;
				}
			}
			const field = line.match(/^\s+([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
			if (!field) continue;
			inPlayfields = field[1] === "Playfields";
			inPlacement = field[1] === "Placement";
			const value = unquote((field[2] || "").replace(/#.*$/, "").trim());
			const slot = {
				Color: "color",
				Icon: "icon",
				Climate: "climate",
				MoonProb: "moonProb",
				MoonType: "moonType",
				OrbitType: "orbitType",
				MoonOrbitType: "moonOrbitType",
				Distance: "distance",
				PlayfieldLevel: "playfieldLevel",
				ForceSizeClass: "forceSizeClass",
				ForcePlanetType: "forcePlanetType",
				HasOrbit: "hasOrbit",
				HasTerrain: "hasTerrain",
				PlayerStart: "playerStart"
			}[field[1]];
			if (slot && slot !== "playfields" && slot !== "section" && slot !== "name") current[slot] = value;
		}
	}
	finish();
	return doc;
}
function yamlList(value) {
	return value.split(",").map((part) => part.trim()).filter(Boolean).map((part) => `            - ${part}`).join("\n");
}
function writeType(block) {
	const lines = [`      - Name: ${block.name}`];
	if (block.color) lines.push(`        Color: ${block.color}`);
	if (block.icon) lines.push(`        Icon: ${block.icon}`);
	if (block.distance) lines.push(`        Distance: ${block.distance}`);
	if (block.placement) {
		lines.push("        Placement:");
		lines.push(yamlList(block.placement));
	}
	if (block.playerStart) lines.push(`        PlayerStart: ${block.playerStart}`);
	if (block.moonProb) lines.push(`        MoonProb: '${block.moonProb}'`);
	if (block.moonType) lines.push(`        MoonType: ${block.moonType.startsWith("[") ? block.moonType : `[${block.moonType}]`}`);
	if (block.orbitType) lines.push(`        OrbitType: ${block.orbitType.startsWith("[") ? block.orbitType : `[${block.orbitType}]`}`);
	if (block.moonOrbitType) lines.push(`        MoonOrbitType: ${block.moonOrbitType.startsWith("[") ? block.moonOrbitType : `[${block.moonOrbitType}]`}`);
	if (block.climate) lines.push(`        Climate: ${block.climate}`);
	if (block.playfieldLevel) lines.push(`        PlayfieldLevel: ${block.playfieldLevel}`);
	if (block.forceSizeClass) lines.push(`        ForceSizeClass: ${block.forceSizeClass}`);
	if (block.forcePlanetType) lines.push(`        ForcePlanetType: ${block.forcePlanetType.startsWith("[") ? block.forcePlanetType : `[${block.forcePlanetType}]`}`);
	if (block.hasOrbit) lines.push(`        HasOrbit: ${block.hasOrbit}`);
	if (block.hasTerrain) lines.push(`        HasTerrain: ${block.hasTerrain}`);
	if (block.playfields.length) {
		lines.push("        Playfields:");
		for (const play of block.playfields) lines.push(play.weight && play.weight !== "1" ? `            - ${play.name}, ${play.weight}` : `            - ${play.name}`);
	}
	return lines.join("\n");
}
function writeRandomPreset(doc) {
	const lines = ["---", "GenerationParams:"];
	for (const scalar of doc.scalars) lines.push(`  ${scalar.key}: ${scalar.value}`);
	lines.push("  PlanetCountProbs:");
	for (const row of doc.countRows) lines.push(`    - '${row.raw}'${row.comment ? ` # ${row.comment}` : ""}`);
	lines.push("  PlanetLists:");
	for (const row of doc.listRows) lines.push(`    - '${row.raw}'${row.comment ? ` # ${row.comment}` : ""}`);
	lines.push(`  POICountProbs: '${doc.poiCount}'`);
	lines.push(`  POIs: '${doc.pois}'`);
	const sections = [...new Set(doc.types.map((block) => block.section))];
	for (const section of sections) {
		lines.push(`  ${section}:`);
		for (const block of doc.types.filter((item) => item.section === section)) lines.push(writeType(block));
	}
	lines.push("");
	return lines.join("\n");
}
function blankRandomPreset(star = "Custom") {
	return writeRandomPreset({
		scalars: [
			{
				key: "MapScale",
				value: "1.0"
			},
			{
				key: "SolarSystemSqueezeMinMax",
				value: "[0.005, 0.1]"
			},
			{
				key: "OneWayWarpProb",
				value: "0"
			},
			{
				key: "UniqueStarterPlanet",
				value: "false"
			}
		],
		countRows: [{
			raw: "0 : 0.5,  1 : 0.5",
			comment: "1 - Temperate"
		}],
		listRows: [{
			raw: "Temperate:1",
			comment: "1 - Temperate"
		}],
		poiCount: "0 : 0.6,  1 : 0.4",
		pois: "SpaceEmpty:0.5, POIExploreT1:0.5",
		types: [{
			...emptyType("PlanetTypes", "Temperate"),
			color: "[0.2, 0.7, 0.3]",
			placement: "HabitableTemperate",
			climate: "Temperate",
			playfieldLevel: "[1, 3]",
			moonProb: "0:0.6, 1:0.4",
			moonType: "MoonBarren",
			orbitType: "DefaultOrbit",
			playfields: [{
				name: "Temperate",
				weight: "1"
			}]
		}, {
			...emptyType("OrbitTypes", "DefaultOrbit"),
			color: "[0.3, 0.3, 0.3]",
			hasOrbit: "false",
			hasTerrain: "false",
			playfieldLevel: "[1, 4]",
			playfields: [{
				name: `${star}Orbit`,
				weight: "1"
			}]
		}]
	});
}
function presetFileName(name) {
	const base = name.trim().replace(/\.ya?ml$/i, "").replace(/[^\w.-]+/g, "_") || "SolarSystemConfig_Custom";
	return /solarsystemconfig/i.test(base) ? `${base}.yaml` : `SolarSystemConfig_${base}.yaml`;
}
var NOTES = {
	MapScale: "How far apart sectors sit. 1 is the usual spread. Example: 1.0",
	SolarSystemSqueezeMinMax: "How flat the system is, from 0 to 1. Lower is a thinner disk. Example: [0.005, 0.1]",
	OneWayWarpProb: "Chance a warp link only works one way. Example: 0",
	UniqueStarterPlanet: "True forces a unique starter planet. Example: false",
	Counts: "Each row is one slot, in the same order as Planet lists. Write amount : chance. The chances in a row should add to 1. Example: 0 : 0.5,  1 : 0.5",
	Lists: "Playfield type names for that same slot, with a weight. Example: Temperate:0.5, Swamp:0.5",
	POICount: "How many space POIs this system rolls. Example: 0 : 0.4,  1 : 0.6",
	POIs: "Which POI types fill those rolls. Example: POIExploreT1:0.5, POIMiningT1:0.5",
	Playfields: "Folder names under Playfields. A second number is the cumulative chance. The last one should be 1. Example: Temperate, 0.5"
};
function Note({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
		label,
		note: NOTES[label] || `${label} is stored on the solar system preset.`
	});
}
function RandomPresetEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const removeCatalogText = usePdaStore((s) => s.removeCatalogText);
	const files = (0, import_react.useMemo)(() => (catalog.texts ?? []).filter((text) => text.role === "randomPreset" && text.text), [catalog.texts]);
	const [picked, setPicked] = (0, import_react.useState)(files[0]?.path || "");
	const [draftName, setDraftName] = (0, import_react.useState)("SolarSystemConfig_Custom");
	const [rawMode, setRawMode] = (0, import_react.useState)(false);
	const [typeName, setTypeName] = (0, import_react.useState)("");
	const current = files.find((file) => file.path === picked) ?? files[0];
	const doc = (0, import_react.useMemo)(() => current ? parseRandomPreset(current.text) : null, [current]);
	const selectedType = doc?.types.find((block) => `${block.section}:${block.name}` === typeName) ?? doc?.types[0];
	const save = (next) => {
		if (!current) return;
		setCatalogText("randomPreset", next, current.path);
	};
	const saveDoc = (next) => save(writeRandomPreset(next));
	const create = () => {
		const file = presetFileName(draftName);
		const path = `RandomPresets/${file}`;
		if (files.some((item) => item.path === path)) {
			setPicked(path);
			return;
		}
		setCatalogText("randomPreset", blankRandomPreset(file.replace(/\.yaml$/i, "")), path);
		setPicked(path);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex min-h-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-b border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-accent",
						children: "Random presets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draftName,
						onChange: (e) => setDraftName(e.target.value),
						placeholder: "SolarSystemConfig_MainHot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: create,
						children: "New file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [files.length, " yaml files. SolarSystemConfig.yaml is the starter. SolarSystemConfig_Name.yaml is a star or faction preset."]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto",
				children: files.length ? files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setPicked(file.path),
					className: `block w-full truncate px-3 py-2 text-left text-sm ${current?.path === file.path ? "bg-elevated" : "hover:bg-elevated/50"}`,
					children: file.path.split("/").pop()
				}, file.path)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 text-sm text-muted",
					children: "Import the scenario RandomPresets folder, or create a file here. Each yaml is one solar-system recipe."
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "min-h-0 overflow-auto p-6",
			children: !current || !doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select a preset, or create one."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-4xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-medium",
							children: current.path.split("/").pop()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setRawMode((value) => !value),
							children: rawMode ? "Form" : "Raw YAML"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const blob = new Blob([current.text], { type: "text/yaml;charset=utf-8" });
								const a = document.createElement("a");
								a.href = URL.createObjectURL(blob);
								a.download = current.path.split("/").pop() || "SolarSystemConfig.yaml";
								a.click();
								URL.revokeObjectURL(a.href);
							},
							children: "Download"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								removeCatalogText("randomPreset", current.path);
								setPicked(files.find((file) => file.path !== current.path)?.path || "");
							},
							children: "Remove"
						})
					]
				}), rawMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-4 min-h-[480px] font-mono text-xs",
					value: current.text,
					onChange: (e) => save(e.target.value)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: doc.scalars.map((scalar) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted",
								children: [scalar.key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { label: scalar.key })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: scalar.value,
								onChange: (e) => saveDoc({
									...doc,
									scalars: doc.scalars.map((row) => row.key === scalar.key ? {
										...row,
										value: e.target.value
									} : row)
								})
							})]
						}, scalar.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowEditor, {
						title: "Planet counts",
						note: "Counts",
						rows: doc.countRows,
						kind: "count",
						onChange: (countRows) => saveDoc({
							...doc,
							countRows
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowEditor, {
						title: "Planet lists",
						note: "Lists",
						rows: doc.listRows,
						kind: "list",
						onChange: (listRows) => saveDoc({
							...doc,
							listRows
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted",
								children: ["POI counts", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { label: "POICount" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: doc.poiCount,
								onChange: (e) => saveDoc({
									...doc,
									poiCount: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted",
								children: ["POI types", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { label: "POIs" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: doc.pois,
								onChange: (e) => saveDoc({
									...doc,
									pois: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-xs uppercase tracking-[0.14em] text-accent",
						children: "Planet, orbit, and station types"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-10 min-w-64 rounded-sm border border-border bg-bg px-2 text-sm",
							value: selectedType ? `${selectedType.section}:${selectedType.name}` : "",
							onChange: (e) => setTypeName(e.target.value),
							children: doc.types.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: `${block.section}:${block.name}`,
								children: [
									block.section.replace("Types", ""),
									" — ",
									block.name
								]
							}, `${block.section}:${block.name}`))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const block = {
									...doc.types[0],
									section: "PlanetTypes",
									name: `NewType${doc.types.length + 1}`,
									playfields: [{
										name: "Temperate",
										weight: "1"
									}]
								};
								saveDoc({
									...doc,
									types: [...doc.types, block]
								});
								setTypeName(`${block.section}:${block.name}`);
							},
							children: "Add type"
						})]
					}),
					selectedType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeForm, {
						block: selectedType,
						onChange: (block) => saveDoc({
							...doc,
							types: doc.types.map((item) => item.section === selectedType.section && item.name === selectedType.name ? block : item)
						}),
						onRemove: () => saveDoc({
							...doc,
							types: doc.types.filter((item) => !(item.section === selectedType.section && item.name === selectedType.name))
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "This file has no type blocks yet."
					})
				] })]
			})
		})]
	});
}
function RowEditor({ title, note, rows, kind, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-accent",
				children: [title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { label: note })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: row.comment,
							placeholder: "Slot label",
							onChange: (e) => onChange(rows.map((item, i) => i === index ? {
								...item,
								comment: e.target.value
							} : item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: row.raw,
							onChange: (e) => onChange(rows.map((item, i) => i === index ? {
								...item,
								raw: e.target.value
							} : item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onChange(rows.filter((_, i) => i !== index)),
							children: "Remove"
						})
					]
				}, `${title}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-2",
				size: "sm",
				variant: "secondary",
				onClick: () => onChange([...rows, {
					comment: `${rows.length + 1}`,
					raw: kind === "count" ? "0 : 1" : "Temperate:1"
				}]),
				children: "Add row"
			})
		]
	});
}
function TypeForm({ block, onChange, onRemove }) {
	const set = (key, value) => onChange({
		...block,
		[key]: value
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-md border border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					["section", "Section"],
					["name", "Name"],
					["color", "Color"],
					["icon", "Icon"],
					["climate", "Climate"],
					["placement", "Placement"],
					["distance", "Distance"],
					["moonProb", "MoonProb"],
					["moonType", "MoonType"],
					["orbitType", "OrbitType"],
					["playfieldLevel", "PlayfieldLevel"],
					["hasOrbit", "HasOrbit"],
					["hasTerrain", "HasTerrain"]
				].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs uppercase tracking-[0.12em] text-muted",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: String(block[key] ?? ""),
						onChange: (e) => set(key, e.target.value)
					})]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted",
				children: ["Playfields", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { label: "Playfields" })]
			}),
			block.playfields.map((play, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: play.name,
						onChange: (e) => onChange({
							...block,
							playfields: block.playfields.map((row, i) => i === index ? {
								...row,
								name: e.target.value
							} : row)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "w-24",
						value: play.weight,
						onChange: (e) => onChange({
							...block,
							playfields: block.playfields.map((row, i) => i === index ? {
								...row,
								weight: e.target.value
							} : row)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => onChange({
							...block,
							playfields: block.playfields.filter((_, i) => i !== index)
						}),
						children: "Remove"
					})
				]
			}, `${play.name}-${index}`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => onChange({
						...block,
						playfields: [...block.playfields, {
							name: "NewPlayfield",
							weight: "1"
						}]
					}),
					children: "Add playfield"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: onRemove,
					children: "Remove type"
				})]
			})
		]
	});
}
function PresetsWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Random presets",
		kicker: "SolarSystemConfig.yaml · star and faction presets",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RandomPresetEditor, {})
	});
}
//#endregion
export { PresetsWorkspace as component };

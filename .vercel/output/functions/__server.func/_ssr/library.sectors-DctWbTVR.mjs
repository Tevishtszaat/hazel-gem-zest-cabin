import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Ct as objectsFor, Z as isStarType, _t as catalogText, a as usePdaStore, dt as starZoneSpans } from "./router-CQbUGop6.mjs";
import { n as Button } from "./button-Dk8gDvBQ.mjs";
import { t as Input } from "./input-Dg-_EBoP.mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
import { a as patchPlayfield, c as readGalaxyVolume, i as parseVolumeSystems, l as removePlayfield, n as VolumeViewport, o as patchSystemCoordinates, r as addPlayfield, s as patchSystemStarClass } from "./volume-view-pItLhBX1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.sectors-DctWbTVR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SectorsEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const file = catalogText(catalog, "sectors");
	const yaml = file?.text || "";
	const systems = (0, import_react.useMemo)(() => parseVolumeSystems(yaml), [yaml]);
	const galaxy = (0, import_react.useMemo)(() => {
		const general = objectsFor(catalog, "galaxy").find((obj) => /galaxyconfig/i.test(obj.kind) && /^general$/i.test(obj.name)) ?? null;
		return readGalaxyVolume(general);
	}, [catalog]);
	const stars = (0, import_react.useMemo)(() => objectsFor(catalog, "galaxy").filter(isStarType), [catalog]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [space, setSpace] = (0, import_react.useState)("galaxy");
	const [systemName, setSystemName] = (0, import_react.useState)("");
	const [bodyName, setBodyName] = (0, import_react.useState)("");
	const [rawOpen, setRawOpen] = (0, import_react.useState)(false);
	const [rawDraft, setRawDraft] = (0, import_react.useState)(null);
	const system = systems.find((item) => item.name === systemName) ?? null;
	const shown = systems.filter((item) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return item.name.toLowerCase().includes(q) || item.starClass.toLowerCase().includes(q) || item.bodies.some((body) => body.name.toLowerCase().includes(q));
	}).slice(0, 300);
	const star = stars.find((item) => (item.fields.StarClass || "").toLowerCase() === (system?.starClass || "").toLowerCase());
	const zones = star ? starZoneSpans(star) : [];
	function save(next) {
		setCatalogText("sectors", next, file?.path || "Sectors.yaml");
	}
	function openSystem(name, body) {
		setSystemName(name);
		setBodyName(body || "");
		setSpace("system");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex w-[340px] shrink-0 flex-col border-r border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [
							systems.length,
							" systems · ",
							systems.reduce((n, item) => n + item.bodies.length, 0),
							" playfields"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2 h-8",
						placeholder: "Find a star, planet, or moon",
						value: query,
						onChange: (e) => setQuery(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-auto",
					children: [shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: `block w-full border-b border-border px-3 py-2 text-left hover:bg-surface ${item.name === systemName ? "bg-surface" : ""}`,
						onClick: () => openSystem(item.name),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-subtle",
							children: [
								item.starClass || "no class",
								" · ",
								item.ly.join(", "),
								" LY · ",
								item.bodies.length,
								" bodies"
							]
						})]
					}, `${item.blockStart}-${item.name}`)), !systems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-3 text-sm text-muted",
						children: "Import Sectors.yaml. Each sector needs Coordinates in light years and a Playfields list."
					}) : null]
				}),
				system ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemForm, {
					system,
					bodyName,
					onBody: setBodyName,
					onSave: save,
					yaml
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-muted hover:text-fg",
							onClick: () => {
								setSpace("galaxy");
								setBodyName("");
							},
							children: "Galaxy"
						}),
						system ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-subtle",
							children: "/"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "hover:text-fg",
							onClick: () => {
								setSpace("system");
								setBodyName("");
							},
							children: system.name
						})] }) : null,
						bodyName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-subtle",
							children: "/"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bodyName })] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "ml-auto",
							size: "sm",
							variant: "secondary",
							onClick: () => setRawOpen((v) => !v),
							children: rawOpen ? "Hide raw YAML" : "Raw YAML"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeViewport, {
						space,
						galaxy,
						systems,
						focusSystem: system?.name,
						focusBody: bodyName,
						zones,
						onPick: (pick) => openSystem(pick.system, pick.body)
					})
				}),
				rawOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "h-48 shrink-0 border-t border-border bg-bg p-3 font-mono text-xs",
					value: rawDraft ?? yaml,
					onChange: (e) => setRawDraft(e.target.value),
					onBlur: () => {
						if (rawDraft != null && rawDraft !== yaml) save(rawDraft);
						setRawDraft(null);
					}
				}) : null
			]
		})]
	});
}
function SystemForm({ system, bodyName, yaml, onBody, onSave }) {
	const body = system.bodies.find((item) => item.name === bodyName) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-h-[46%] overflow-auto border-t border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.12em] text-muted",
				children: system.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-2 block text-xs text-subtle",
				children: ["Star class", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-8",
					defaultValue: system.starClass,
					onBlur: (e) => onSave(patchSystemStarClass(yaml, system, e.target.value))
				}, `${system.blockStart}-class`)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-3 gap-2",
				children: [
					"X",
					"Y",
					"Z"
				].map((axis, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-subtle",
					children: [
						axis,
						" LY",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1 h-8",
							defaultValue: String(system.ly[index]),
							onBlur: (e) => {
								const ly = [...system.ly];
								const n = Number(e.target.value);
								if (!Number.isFinite(n)) return;
								ly[index] = n;
								onSave(patchSystemCoordinates(yaml, system, ly));
							}
						}, `${system.blockStart}-${axis}`)
					]
				}, axis))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.12em] text-muted",
					children: "Playfields"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "ml-auto",
					size: "sm",
					variant: "secondary",
					onClick: () => onSave(addPlayfield(yaml, system, {
						local: [
							100,
							0,
							0
						],
						name: "New body",
						kind: "Planet",
						playfieldType: "Temperate"
					})),
					children: "Add"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: system.bodies.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `w-full rounded-sm px-2 py-1 text-left text-xs ${item.name === bodyName ? "bg-surface text-fg" : "text-muted"}`,
					onClick: () => onBody(item.name),
					children: [
						item.name,
						" · ",
						item.kind,
						" · ",
						item.local.join(", ")
					]
				}) }, item.line))
			}),
			body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BodyForm, {
				yaml,
				body,
				onSave
			}) : null
		]
	});
}
function BodyForm({ yaml, body, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 grid grid-cols-2 gap-2",
		children: [
			[
				"name",
				"kind",
				"playfieldType"
			].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-subtle",
				children: [key === "playfieldType" ? "Type" : key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-8",
					defaultValue: body[key] || "",
					onBlur: (e) => onSave(patchPlayfield(yaml, body, {
						...body,
						[key]: e.target.value
					}))
				}, `${body.line}-${key}`)]
			}, key)),
			[
				0,
				1,
				2
			].map((index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-subtle",
				children: [
					[
						"X",
						"Y",
						"Z"
					][index],
					" sec",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1 h-8",
						defaultValue: String(body.local[index]),
						onBlur: (e) => {
							const local = [...body.local];
							const n = Number(e.target.value);
							if (!Number.isFinite(n)) return;
							local[index] = n;
							onSave(patchPlayfield(yaml, body, {
								...body,
								local
							}));
						}
					}, `${body.line}-p${index}`)
				]
			}, index)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "col-span-2",
				size: "sm",
				variant: "ghost",
				onClick: () => onSave(removePlayfield(yaml, body)),
				children: "Remove playfield"
			})
		]
	});
}
function SectorsWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Sectors",
		kicker: "Sectors.yaml · galaxy, stars, planets, moons",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectorsEditor, {})
	});
}
//#endregion
export { SectorsWorkspace as component };

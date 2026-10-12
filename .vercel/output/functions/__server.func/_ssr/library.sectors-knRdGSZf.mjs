import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Ct as objectsFor, Z as isStarType, _t as catalogText, a as usePdaStore, dt as starZoneSpans } from "./router-xYviGTYl.mjs";
import { n as Button } from "./button-DoV8KSj5.mjs";
import { t as Input } from "./input-B25_b_Jt.mjs";
import { t as WorkspacePage } from "./workspace-page-Zt6WaVcQ.mjs";
import { a as parseVolumeSystems, c as patchSystemStarClass, d as starTint, i as addPlayfield, l as readGalaxyVolume, n as VolumeViewport, o as patchPlayfield, r as ZONE_FALLBACK, s as patchSystemCoordinates, t as STAR_CLASS_LEGEND, u as removePlayfield } from "./volume-view-CZlnSp5G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.sectors-knRdGSZf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BODY_GROUPS = [
	"Suns",
	"Planets",
	"Moons",
	"Orbits",
	"Other"
];
function bodyGroup(kind, name = "", playfieldType = "") {
	const text = `${kind} ${name} ${playfieldType}`;
	if (/moon/i.test(text)) return "Moons";
	if (/\b(sun|star)\b/i.test(text)) return "Suns";
	if (/orbit/i.test(text)) return "Orbits";
	if (/space|warp|station|asteroid/i.test(text)) return "Other";
	if (/planet/i.test(text) || playfieldType && !/space|orbit|sun/i.test(playfieldType) || kind && !/playfield/i.test(kind) && !/space|orbit|sun|warp/i.test(kind)) return "Planets";
	return "Other";
}
function bodyCounts(system) {
	let planets = 0;
	let moons = 0;
	for (const body of system.bodies) if (/moon/i.test(`${body.kind} ${body.name}`)) moons += 1;
	else if (bodyGroup(body.kind, body.name, body.playfieldType) === "Planets") planets += 1;
	return {
		planets,
		moons
	};
}
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
	const [group, setGroup] = (0, import_react.useState)("All");
	const [rawOpen, setRawOpen] = (0, import_react.useState)(false);
	const [rawDraft, setRawDraft] = (0, import_react.useState)(null);
	const [hidden, setHidden] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const system = systems.find((item) => item.name === systemName) ?? null;
	const shown = systems.filter((item) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return item.name.toLowerCase().includes(q) || item.starClass.toLowerCase().includes(q) || item.bodies.some((body) => body.name.toLowerCase().includes(q) || body.kind.toLowerCase().includes(q));
	}).slice(0, 300);
	const star = stars.find((item) => (item.fields.StarClass || "").toLowerCase() === (system?.starClass || "").toLowerCase());
	const zones = star ? starZoneSpans(star) : [];
	const body = system?.bodies.find((item) => item.name === bodyName) ?? null;
	function save(next) {
		setCatalogText("sectors", next, file?.path || "Sectors.yaml");
	}
	function openSystem(name, body) {
		setSystemName(name);
		setBodyName(body || "");
		setSpace("system");
		if (body) {
			const found = systems.find((item) => item.name === name)?.bodies.find((item) => item.name === body);
			if (found) setGroup(bodyGroup(found.kind, found.name, found.playfieldType));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex w-[280px] shrink-0 flex-col border-r border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-auto",
					children: [shown.map((item) => {
						const counts = bodyCounts(item);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
									counts.planets,
									" planets · ",
									counts.moons,
									" moons"
								]
							})]
						}, `${item.blockStart}-${item.name}`);
					}), !systems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-3 text-sm text-muted",
						children: "Import Sectors.yaml. Each sector needs Coordinates in light years and a Playfields list."
					}) : null]
				})]
			}),
			system ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BodyList, {
				system,
				yaml,
				bodyName,
				group,
				onGroup: setGroup,
				onBody: (name) => openSystem(system.name, name),
				onSave: save
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: space === "galaxy" ? "text-fg" : "text-muted hover:text-fg",
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
								className: space === "system" && !bodyName ? "text-fg" : "text-muted hover:text-fg",
								onClick: () => {
									setSpace("system");
									setBodyName("");
								},
								children: system.name
							})] }) : null,
							body ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "/"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [body.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-subtle",
								children: body.kind
							})] })] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "ml-auto",
								size: "sm",
								variant: "secondary",
								onClick: () => setRawOpen((v) => !v),
								children: rawOpen ? "Hide raw YAML" : "Raw YAML"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-h-0 flex-1 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeViewport, {
							space,
							layer: "galaxy",
							galaxy,
							systems,
							focusSystem: system?.name,
							focusBody: bodyName,
							zones,
							hidden,
							onPick: (pick) => openSystem(pick.system, pick.body)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectorLegend, {
							space,
							galaxy,
							system,
							zones,
							hidden,
							onChange: setHidden
						})]
					}),
					system && space === "system" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-[42%] shrink-0 overflow-auto border-t border-border p-3",
						children: body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BodyForm, {
							yaml,
							body,
							onSave: save
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Pick a planet, moon, or other playfield. Drag the view, or click a body in the volume."
						})
					}) : null,
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
			})
		]
	});
}
function BodyList({ system, yaml, bodyName, group, onGroup, onBody, onSave }) {
	const counts = bodyCounts(system);
	const listed = system.bodies.filter((item) => group === "All" || bodyGroup(item.kind, item.name, item.playfieldType) === group);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex w-[320px] shrink-0 flex-col border-r border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border p-3",
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[11px] text-subtle",
					children: [
						counts.planets,
						" planets · ",
						counts.moons,
						" moons · ",
						system.bodies.length,
						" playfields"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1",
					children: ["All", ...BODY_GROUPS].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `rounded-sm border px-2 py-0.5 text-[11px] ${group === name ? "border-accent text-fg" : "border-border text-muted"}`,
						onClick: () => onGroup(name),
						children: name
					}, name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-2",
					size: "sm",
					variant: "secondary",
					onClick: () => onSave(addPlayfield(yaml, system, {
						local: [
							100,
							0,
							0
						],
						name: "New body",
						kind: group === "Moons" ? "Moon" : group === "Orbits" ? "Orbit" : "Planet",
						playfieldType: "Temperate"
					})),
					children: ["Add ", group === "Moons" ? "moon" : group === "Orbits" ? "orbit" : "planet"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "min-h-0 flex-1 overflow-auto",
			children: [listed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: `block w-full border-b border-border px-3 py-2 text-left ${item.name === bodyName ? "bg-surface" : "hover:bg-surface"}`,
				onClick: () => onBody(item.name),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-subtle",
					children: [
						item.kind,
						item.playfieldType ? ` · ${item.playfieldType}` : "",
						" · ",
						Math.round(Math.hypot(item.local[0], item.local[1], item.local[2])),
						" sec"
					]
				})]
			}) }, item.line)), !listed.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "p-3 text-xs text-subtle",
				children: [
					"Nothing in ",
					group,
					"."
				]
			}) : null]
		})]
	});
}
function BodyForm({ yaml, body, onSave }) {
	const distance = Math.round(Math.hypot(body.local[0], body.local[1], body.local[2]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs uppercase tracking-[0.12em] text-muted",
			children: [
				bodyGroup(body.kind, body.name, body.playfieldType),
				" · ",
				distance,
				" sec from the star",
				body.coordLine != null ? " · Coordinates entry" : ""
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 grid grid-cols-2 gap-2 md:grid-cols-6",
			children: [[
				"name",
				"kind",
				"playfieldType"
			].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-subtle md:col-span-2",
				children: [key === "playfieldType" ? "Playfield type" : key === "kind" ? "Kind" : "Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-8",
					defaultValue: body[key] || "",
					onBlur: (e) => onSave(patchPlayfield(yaml, body, {
						...body,
						[key]: e.target.value
					}))
				}, `${body.line}-${key}`)]
			}, key)), [
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
			}, index))]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[11px] text-subtle",
			children: "Local position is in sectors from the star. 10 sectors is about 1 AU. Kind is Planet, Moon, Sun, Orbit, or Space."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-2",
			size: "sm",
			variant: "ghost",
			onClick: () => onSave(removePlayfield(yaml, body)),
			children: "Remove this body"
		})
	] });
}
function LegendRow({ id, color, ring, label, detail, hidden, onToggle, onOnly }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: `flex items-start gap-2 text-xs ${hidden ? "opacity-35" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-w-0 flex-1 items-start gap-2 text-left",
			onClick: () => onToggle(id),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border",
				style: {
					background: ring ? "transparent" : color,
					borderColor: color
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate",
					children: label
				}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] text-subtle",
					children: detail
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "shrink-0 text-[10px] uppercase tracking-wide text-subtle hover:text-fg",
			onClick: () => onOnly(id),
			children: "Only"
		})]
	});
}
function SectorLegend({ space, galaxy, system, zones, hidden, onChange }) {
	const rings = zones.length ? zones : ZONE_FALLBACK;
	const ids = space === "system" ? [
		"kind:sun",
		"kind:planet",
		"kind:moon",
		"kind:other",
		"path:orbit",
		...rings.map((zone) => `zone:${zone.label}`)
	] : [
		"radius:outer",
		...galaxy.inner > 1 ? ["radius:inner"] : [],
		...STAR_CLASS_LEGEND.map((item) => item.id)
	];
	const shown = ids.filter((id) => !hidden.has(id)).length;
	const toggle = (id) => {
		const next = new Set(hidden);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onChange(next);
	};
	const only = (id) => {
		const next = new Set(hidden);
		for (const item of ids) if (item === id) next.delete(item);
		else next.add(item);
		onChange(next);
	};
	const starColor = system ? starTint(system.starClass, system.color) : "#ffe29a";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "absolute bottom-6 right-6 top-6 z-10 flex w-52 flex-col overflow-hidden rounded-md border border-border bg-surface/90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.14em] text-muted",
					children: "Legend"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[10px] text-subtle",
					children: [
						"Showing ",
						shown,
						" of ",
						ids.length
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-7 rounded-sm border border-border px-2 text-xs",
						onClick: () => {
							const next = new Set(hidden);
							for (const id of ids) next.delete(id);
							onChange(next);
						},
						children: "All"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-7 rounded-sm border border-border px-2 text-xs",
						onClick: () => onChange(/* @__PURE__ */ new Set([...hidden, ...ids])),
						children: "None"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-auto p-3",
			children: [space === "system" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "kind:sun",
						color: starColor,
						label: "Star",
						hidden: hidden.has("kind:sun"),
						onToggle: toggle,
						onOnly: only
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "kind:planet",
						color: "#8ec8ff",
						label: "Planets",
						hidden: hidden.has("kind:planet"),
						onToggle: toggle,
						onOnly: only
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "kind:moon",
						color: "#d5d8e0",
						label: "Moons",
						hidden: hidden.has("kind:moon"),
						onToggle: toggle,
						onOnly: only
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "kind:other",
						color: "#b9a6ff",
						label: "Orbits and other",
						hidden: hidden.has("kind:other"),
						onToggle: toggle,
						onOnly: only
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "path:orbit",
						ring: true,
						color: "rgba(180,198,230,0.9)",
						label: "Orbit paths",
						hidden: hidden.has("path:orbit"),
						onToggle: toggle,
						onOnly: only
					}),
					rings.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: `zone:${zone.label}`,
						ring: true,
						color: zone.color,
						label: zone.label,
						detail: `${Math.round(zone.min)}–${Math.round(zone.max)} sec`,
						hidden: hidden.has(`zone:${zone.label}`),
						onToggle: toggle,
						onOnly: only
					}, zone.label))
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "radius:outer",
						ring: true,
						color: "rgba(150,186,255,0.95)",
						label: "Galaxy radius",
						hidden: hidden.has("radius:outer"),
						onToggle: toggle,
						onOnly: only
					}),
					galaxy.inner > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: "radius:inner",
						ring: true,
						color: "rgba(255,220,160,0.95)",
						label: "Inner radius",
						hidden: hidden.has("radius:inner"),
						onToggle: toggle,
						onOnly: only
					}) : null,
					STAR_CLASS_LEGEND.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
						id: item.id,
						color: item.color,
						label: item.label,
						hidden: hidden.has(item.id),
						onToggle: toggle,
						onOnly: only
					}, item.id))
				]
			}), space === "system" && !zones.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[10px] text-subtle",
				children: "Zone rings are defaults until this star class is in GalaxyConfig."
			}) : null]
		})]
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

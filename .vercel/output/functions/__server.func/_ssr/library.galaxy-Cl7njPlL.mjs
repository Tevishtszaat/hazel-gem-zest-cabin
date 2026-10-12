import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { $ as luminosityOf, B as axisMax, Ct as objectsFor, F as STAR_REGION_STATS, G as fluxLabel, Gn as stringifyEcfObjects, H as clusterTicks, Ht as GALAXY_GENERAL_STATS, I as STAR_STATS, J as groupSystems, K as formatCoords, L as applyOrbitFixes, P as STAR_MODELS, Q as kindGroup, R as applyZoneDrag, U as diagnoseOrbits, Ut as TERRITORY_STATS, V as climateLabel, W as fieldToHex, X as inferClimate, Y as hexToField, Z as isStarType, _t as catalogText, a as usePdaStore, at as placeBodyLabels, ct as solarAdvice, dt as starZoneSpans, et as overlayBodies, ft as systemLuminosityWindow, gt as zoneWarnings, ht as zoneHandleList, it as pickDefaultSystem, lt as solarFlux, mt as zoneAtDistance, nt as parseStarMix, ot as rgbFromField, pt as writeStarMix, q as formatLum, r as cn, rt as physicsHabitableAU, st as sectorsToAu, tt as parseSectorBodies, ut as spansToZoneFields, z as auToSectors } from "./router-CQbUGop6.mjs";
import { n as Button } from "./button-Dk8gDvBQ.mjs";
import { t as Input } from "./input-Dg-_EBoP.mjs";
import { t as FieldNote } from "./field-note-DSZYzT0E.mjs";
import { t as noteForField } from "./field-notes-BnBibNoh.mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
import { c as readGalaxyVolume, i as parseVolumeSystems, n as VolumeViewport, t as STAR_CLASS_LEGEND } from "./volume-view-pItLhBX1.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/radix-ui__react-slider.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.galaxy-Cl7njPlL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-6 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full border border-border bg-fg shadow outline-none focus-visible:ring-2 focus-visible:ring-accent/50" })]
	});
}
function shortName(name, max = 14) {
	const clean = name.replace(/\s+/g, " ").trim();
	return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
function GalaxyStarChart({ star, bodies, starterName, onPatchStar, onFixOrbits }) {
	const L = luminosityOf(star);
	const spans = starZoneSpans(star);
	const systems = (0, import_react.useMemo)(() => groupSystems(bodies), [bodies]);
	const [systemName, setSystemName] = (0, import_react.useState)(() => pickDefaultSystem(star, systems, starterName));
	const [showMoons, setShowMoons] = (0, import_react.useState)(false);
	const [showOther, setShowOther] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSystemName(pickDefaultSystem(star, systems, starterName));
	}, [
		star.name,
		starterName,
		systems
	]);
	const selected = systems.find((s) => s.name === systemName) ?? systems[0];
	const related = overlayBodies(star, selected?.bodies ?? []).filter((body) => {
		const group = kindGroup(body.kind);
		if (group === "planet") return true;
		if (group === "moon") return showMoons;
		return showOther;
	});
	const max = Math.max(axisMax(star, related), 8);
	const inView = related.filter((b) => b.distance <= max);
	const offscale = related.filter((b) => b.distance > max);
	const physics = physicsHabitableAU(L);
	const warnings = zoneWarnings(star);
	const svgRef = (0, import_react.useRef)(null);
	const [probe, setProbe] = (0, import_react.useState)(0);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [hover, setHover] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const temp = spans.find((s) => s.key === "HabitableTemperate");
		setProbe(temp ? Math.round((temp.min + temp.max) / 2) : Math.round(max * .4));
	}, [star.name]);
	const flux = solarFlux(L, probe);
	const zone = zoneAtDistance(star, probe);
	const color = rgbFromField(star.fields.Color || star.fields.LightColor);
	const w = 760;
	const bandY = 28;
	const bandH = 44;
	const fluxH = 96;
	const pad = {
		l: 52,
		r: 18,
		t: 10,
		b: 22
	};
	const innerW = w - pad.l - pad.r;
	const x = (sectors) => pad.l + Math.max(0, Math.min(sectors, max)) / max * innerW;
	const handles = zoneHandleList(spans);
	const ticks = clusterTicks(inView, x, 5);
	const { placed, hidden } = placeBodyLabels(inView, x, 70, 3);
	const axisY = 72 + (8 + Math.max(1, ...placed.map((p) => p.lane + 1), 1) * 16) + 18;
	const fluxY = axisY + 14;
	const height = fluxY + fluxH + pad.b;
	const sectorsFromEvent = (event) => {
		const svg = svgRef.current;
		if (!svg) return 0;
		const ctm = svg.getScreenCTM();
		if (!ctm) return 0;
		const pt = svg.createSVGPoint();
		pt.x = event.clientX;
		pt.y = event.clientY;
		const loc = pt.matrixTransform(ctm.inverse());
		return Math.round((loc.x - pad.l) / innerW * max);
	};
	const onPointerMove = (event) => {
		if (!drag) return;
		const sectors = Math.max(0, sectorsFromEvent(event));
		if (drag === "probe") {
			setProbe(sectors);
			return;
		}
		if (!onPatchStar) return;
		onPatchStar(spansToZoneFields(applyZoneDrag(spans, drag, sectors)));
	};
	const fluxPts = (0, import_react.useMemo)(() => {
		const pts = [];
		for (let i = 0; i <= 48; i++) {
			const sectors = i / 48 * max;
			const f = solarFlux(L, Math.max(sectors, .2));
			const log = Math.log10(Math.max(f, .001));
			const y = fluxY + fluxH - (log - Math.log10(.001)) / (Math.log10(20) - Math.log10(.001)) * fluxH;
			pts.push({
				x: x(sectors),
				y: Math.max(fluxY, Math.min(fluxY + fluxH, y))
			});
		}
		return pts;
	}, [
		L,
		max,
		fluxY
	]);
	const earthY = (() => {
		const log = Math.log10(1);
		return fluxY + fluxH - (log - Math.log10(.001)) / (Math.log10(20) - Math.log10(.001)) * fluxH;
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-accent",
						children: "Habitable zones · solar flux"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mt-1 text-lg font-medium tracking-tight",
						children: [star.fields.StarClass || star.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 font-mono text-sm text-muted",
							children: [
								"L = ",
								L,
								" Sol"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: "One solar system, scaled to this star’s outer band. Far playfields stay off-chart so names don’t pile up."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-2",
					children: [
						systems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["System", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "ml-2 h-8 max-w-48 rounded-sm border border-border bg-bg px-2 text-sm text-fg",
								value: selected?.name || "",
								onChange: (e) => setSystemName(e.target.value),
								children: systems.map((sys) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: sys.name,
									children: sys.starClass ? `${sys.name} (${sys.starClass})` : sys.name
								}, sys.name))
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-1 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: showMoons,
								onChange: (e) => setShowMoons(e.target.checked)
							}), "Moons"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-1 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: showOther,
								onChange: (e) => setShowOther(e.target.checked)
							}), "Other"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: [
								"Probe distance",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "ml-2 h-8 w-24 rounded-sm border border-border bg-bg px-2 font-mono text-sm text-fg",
									value: probe,
									onChange: (e) => setProbe(Number(e.target.value) || 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-subtle",
									children: "sec"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				ref: svgRef,
				viewBox: `0 0 ${w} ${height}`,
				className: "mt-3 w-full touch-none",
				onPointerMove,
				onPointerUp: () => setDrag(null),
				onPointerCancel: () => setDrag(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: pad.l,
						y: bandY,
						width: innerW,
						height: bandH,
						className: "fill-bg",
						rx: "4"
					}),
					spans.map((span) => {
						const left = x(span.min);
						const width = Math.max(2, x(span.max) - left);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: left,
								y: bandY,
								width,
								height: bandH,
								fill: span.color,
								opacity: .38
							}),
							width >= 36 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: left + width / 2,
								y: 46,
								textAnchor: "middle",
								className: "fill-fg",
								fontSize: "10",
								fontWeight: "500",
								children: span.label
							}) : null,
							width >= 52 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
								x: left + width / 2,
								y: 60,
								textAnchor: "middle",
								className: "fill-subtle",
								fontSize: "9",
								children: [
									span.min,
									"–",
									span.max
								]
							}) : null
						] }, span.key);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: x(auToSectors(physics.inner)),
						y: 65,
						width: Math.max(2, x(auToSectors(physics.outer)) - x(auToSectors(physics.inner))),
						height: 6,
						fill: "none",
						className: "stroke-fg",
						strokeDasharray: "4 3",
						opacity: .8
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: pad.l,
						cy: 50,
						r: 14,
						fill: color,
						opacity: .35
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: pad.l,
						cy: 50,
						r: 8,
						fill: color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: pad.l,
						y: 20,
						textAnchor: "middle",
						className: "fill-muted",
						fontSize: "9",
						children: star.fields.StarClass || "★"
					}),
					ticks.map((tick) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: tick.x,
						x2: tick.x,
						y1: 32,
						y2: 68,
						className: "stroke-fg",
						opacity: tick.bodies.some((b) => b.name === hover) ? .95 : .35,
						strokeWidth: tick.bodies.some((b) => b.name === hover) ? 2 : 1
					}, `t-${tick.x}`)),
					placed.map((item) => {
						const tick = x(item.body.distance);
						const labelY = 86 + item.lane * 16;
						const active = hover === item.body.name;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							onPointerEnter: () => setHover(item.body.name),
							onPointerLeave: () => setHover(null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: tick,
								x2: tick,
								y1: 72,
								y2: labelY - 8,
								className: "stroke-border",
								strokeWidth: 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: tick,
								y: labelY,
								textAnchor: "middle",
								className: active ? "fill-fg" : "fill-muted",
								fontSize: "10",
								stroke: "var(--color-surface)",
								strokeWidth: 3,
								paintOrder: "stroke",
								children: shortName(item.body.name)
							})]
						}, `${item.body.system}-${item.body.name}`);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: x(probe),
						x2: x(probe),
						y1: bandY,
						y2: 72,
						className: "stroke-accent",
						strokeWidth: 2,
						onPointerDown: (e) => {
							svgRef.current?.setPointerCapture(e.pointerId);
							setDrag("probe");
						}
					}),
					onPatchStar ? handles.map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: x(handle.sectors),
						cy: 50,
						r: 9,
						className: "fill-fg cursor-ew-resize",
						onPointerDown: (e) => {
							e.stopPropagation();
							svgRef.current?.setPointerCapture(e.pointerId);
							setDrag(handle);
						}
					}, handle.id)) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: pad.l,
						y: axisY,
						className: "fill-subtle",
						fontSize: "10",
						children: "0 AU"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						x: w - pad.r,
						y: axisY,
						textAnchor: "end",
						className: "fill-subtle",
						fontSize: "10",
						children: [
							max.toFixed(0),
							" sec · ",
							sectorsToAu(max).toFixed(1),
							" AU"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 8,
						y: fluxY + 10,
						className: "fill-subtle",
						fontSize: "10",
						children: "flux"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: pad.l,
						x2: w - pad.r,
						y1: earthY,
						y2: earthY,
						className: "stroke-ok",
						strokeDasharray: "3 3",
						opacity: .6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: w - pad.r,
						y: earthY - 4,
						textAnchor: "end",
						className: "fill-ok",
						fontSize: "9",
						children: "1× Earth"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
						fill: "none",
						className: "stroke-accent",
						strokeWidth: 2,
						points: fluxPts.map((p) => `${p.x},${p.y}`).join(" ")
					}),
					inView.map((body) => {
						const f = solarFlux(L, body.distance);
						const log = Math.log10(Math.max(f, .001));
						const y = fluxY + fluxH - (log - Math.log10(.001)) / (Math.log10(20) - Math.log10(.001)) * fluxH;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: x(body.distance),
							cy: Math.max(fluxY, Math.min(fluxY + fluxH, y)),
							r: hover === body.name ? 4 : 2.5,
							className: "fill-fg"
						}, `f-${body.system}-${body.name}`);
					})
				]
			}),
			hidden > 0 || offscale.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-subtle",
				children: [hidden > 0 ? `${hidden} labels skipped so names don’t overlap. ` : null, offscale.length > 0 ? `${offscale.length} playfields sit past this star’s outer band (e.g. ${offscale[0].name} at ${offscale[0].distance.toFixed(0)} sec / ${sectorsToAu(offscale[0].distance).toFixed(1)} AU) and are kept off the ruler.` : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Probe",
						value: `${probe} sec · ${sectorsToAu(probe).toFixed(2)} AU`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Game zone",
						value: zone ? `${zone.label} (${zone.hint})` : "Outside defined bands"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Solar vs Earth",
						value: `${fluxLabel(flux)} · ${solarAdvice(flux)}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LuminosityTuner, {
				star,
				bodies: related,
				onPatchStar
			}),
			warnings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-xs text-warn",
				children: warnings.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-subtle",
				children: [
					"Physics HZ ",
					auToSectors(physics.inner).toFixed(0),
					"–",
					auToSectors(physics.outer).toFixed(0),
					" sectors (",
					physics.inner.toFixed(2),
					"–",
					physics.outer.toFixed(2),
					" AU). Dashed bar on the zone ruler."
				]
			}),
			related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-3 w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs uppercase tracking-[0.12em] text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Playfield"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Kind"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Sectors"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "AU"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Zone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Solar"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: related.map((body) => {
						const z = zoneAtDistance(star, body.distance);
						const f = solarFlux(L, body.distance);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: hover === body.name ? "bg-elevated" : void 0,
							onPointerEnter: () => setHover(body.name),
							onPointerLeave: () => setHover(null),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5",
									children: body.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 text-muted",
									children: body.kind
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 font-mono text-xs",
									children: body.distance.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 font-mono text-xs",
									children: sectorsToAu(body.distance).toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5",
									children: z?.label || (body.distance > max ? "off-scale" : "—")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 text-xs text-muted",
									children: climateLabel(inferClimate(body.name, body.kind, body.playfieldType))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 font-mono text-xs",
									children: fluxLabel(f)
								})
							]
						}, `${body.system}-${body.name}`);
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: "Import Sectors.yaml to overlay planet distances on this star. Playfield coords are sectors from the local sun."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitDebugger, {
				star,
				bodies: related,
				onFixOrbits
			})
		]
	});
}
function lumToT(value, min, max) {
	const lo = Math.log10(Math.max(min, 1e-6));
	const hi = Math.log10(Math.max(max, min * 1.01));
	return Math.min(1, Math.max(0, (Math.log10(Math.max(value, 1e-6)) - lo) / (hi - lo)));
}
function tToLum(t, min, max) {
	const lo = Math.log10(Math.max(min, 1e-6));
	return 10 ** (lo + t * (Math.log10(Math.max(max, min * 1.01)) - lo));
}
function LuminosityTuner({ star, bodies, onPatchStar }) {
	const L = luminosityOf(star);
	const sys = (0, import_react.useMemo)(() => systemLuminosityWindow(star, bodies), [star, bodies]);
	if (!sys) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-subtle",
		children: "Import Sectors.yaml to size this star’s Luminosity from planet / moon distance (inverse-square, 1 AU = 10 sectors)."
	});
	const floor = Math.min(sys.min, L, sys.suggest);
	const ceil = Math.max(sys.max, sys.suggestMax, L);
	const setL = (next) => {
		const n = Number(next.toPrecision(4));
		onPatchStar?.({ Luminosity: String(n) });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-sm border border-border bg-bg p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-accent",
					children: "Luminosity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Game rule: flux = L / (AU)² with 1 AU = 10 sectors. Slider stays inside the min–max this system can take."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !onPatchStar,
						onClick: () => setL(sys.suggest),
						children: ["Earth-like ", formatLum(sys.suggest)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: !onPatchStar,
						onClick: () => setL(sys.suggestMax),
						children: ["Apply max ", formatLum(sys.suggestMax)]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-14 font-mono text-xs text-subtle",
						children: formatLum(floor)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 0,
						max: 1e3,
						step: 1,
						value: [Math.round(lumToT(L, floor, ceil) * 1e3)],
						onValueChange: (vals) => setL(tToLum((vals[0] ?? 0) / 1e3, floor, ceil)),
						"aria-label": "Star luminosity"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-14 text-right font-mono text-xs text-subtle",
						children: formatLum(ceil)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-16 text-right font-mono text-sm",
						children: formatLum(L)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					"Min ",
					formatLum(sys.min),
					" · suggested max ",
					formatLum(sys.suggestMax),
					sys.conflict ? " · bands conflict — lava and temperate want different L at these distances" : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-xs text-subtle",
				children: sys.bodies.slice(0, 12).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					row.name,
					" · ",
					climateLabel(row.climate),
					" · ",
					row.distance.toFixed(0),
					" sec → L ",
					formatLum(row.window.min),
					"–",
					formatLum(row.window.max),
					" (max ",
					formatLum(row.window.suggestMax),
					") · now ",
					fluxLabel(row.flux)
				] }, row.name))
			})
		]
	});
}
function OrbitDebugger({ star, bodies, onFixOrbits }) {
	const issues = (0, import_react.useMemo)(() => diagnoseOrbits(star, bodies), [star, bodies]);
	const [picked, setPicked] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setPicked(issues.map((issue) => issue.key));
	}, [issues]);
	if (!issues.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-xs text-subtle",
		children: "Orbit debugger: no off-scale or wrong-zone planets/moons in this system."
	});
	const selected = issues.filter((issue) => picked.includes(issue.key));
	const apply = (rows) => {
		onFixOrbits?.(rows.map((row) => ({
			name: row.body.name,
			coords: row.suggested
		})));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-sm border border-border bg-bg p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.14em] text-accent",
				children: "Orbit debugger"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "Snaps lava / arid / temperate / ice / barren worlds into this star’s bands. Moons follow their planet."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setPicked(issues.map((i) => i.key)),
						children: "Select all"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setPicked([]),
						children: "Select none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: !selected.length || !onFixOrbits,
						onClick: () => apply(selected),
						children: [
							"Apply ",
							selected.length || "",
							" suggested"
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: issues.map((issue) => {
				const on = picked.includes(issue.key);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 rounded-sm border border-border px-2 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1",
							checked: on,
							onChange: () => setPicked((cur) => on ? cur.filter((k) => k !== issue.key) : [...cur, issue.key])
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm",
									children: [
										issue.body.name,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [
												"· ",
												issue.body.kind,
												" · ",
												climateLabel(issue.climate)
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted",
									children: issue.reason
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs text-subtle",
									children: [
										formatCoords(issue.body.coords),
										" (",
										issue.body.distance.toFixed(0),
										" sec, ",
										issue.currentZone || "—",
										")",
										" → ",
										formatCoords(issue.suggested),
										" (",
										issue.suggestedDistance.toFixed(0),
										" sec",
										issue.expectedZone && issue.expectedZone !== "parent" ? `, ${issue.expectedZone}` : "",
										issue.expectedZone === "parent" ? ", parent orbit" : "",
										")"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							disabled: !onFixOrbits,
							onClick: () => apply([issue]),
							children: "Fix"
						})
					]
				}, issue.key);
			})
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm border border-border bg-bg p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.12em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm",
			children: value
		})]
	});
}
function download(name, text) {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
function Field({ label, note, area, children }) {
	const text = note || noteForField(label, area);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "relative block space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
				label,
				note: text
			})]
		}), children]
	});
}
function GalaxyEditor() {
	const catalog = usePdaStore((s) => s.catalog);
	const setCatalogText = usePdaStore((s) => s.setCatalogText);
	const objects = (0, import_react.useMemo)(() => objectsFor(catalog, "galaxy"), [catalog]);
	const persist = (next) => {
		setCatalogText("galaxy", stringifyEcfObjects(next), catalogText(catalog, "galaxy")?.path || "GalaxyConfig.ecf");
	};
	const fileName = catalogText(catalog, "galaxy")?.path.split(/[\\/]/).pop() || "GalaxyConfig.ecf";
	const sectorText = catalogText(catalog, "sectors");
	const bodies = (0, import_react.useMemo)(() => parseSectorBodies(sectorText?.text || ""), [sectorText?.text]);
	const general = objects.find((o) => /galaxyconfig/i.test(o.kind) && /^general$/i.test(o.name)) ?? objects.find((o) => /galaxyconfig/i.test(o.kind) && !isStarType(o)) ?? null;
	const generalIndex = general ? objects.indexOf(general) : -1;
	const children = general?.children ?? [];
	const territories = children.filter((c) => /territory/i.test(c.name));
	const regions = children.filter((c) => /starregion/i.test(c.name));
	const stars = objects.filter((o) => o !== general && isStarType(o));
	const [starName, setStarName] = (0, import_react.useState)(stars[0]?.name || "");
	const [regionName, setRegionName] = (0, import_react.useState)(regions[0]?.name || "");
	const [territoryName, setTerritoryName] = (0, import_react.useState)(territories[0]?.name || "");
	const star = stars.find((s) => s.name === starName) ?? stars[0];
	const region = regions.find((r) => r.name === regionName) ?? regions[0];
	const territory = territories.find((t) => t.name === territoryName) ?? territories[0];
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
	const patchChild = (name, mut) => {
		patchGeneral((cur) => ({
			...cur,
			children: (cur.children ?? []).map((c) => c.name === name ? mut({
				...c,
				fields: { ...c.fields }
			}) : c)
		}));
	};
	const addTerritory = () => {
		const n = nextChildNumber(territories, "Territory_");
		patchGeneral((cur) => ({
			...cur,
			children: [...cur.children ?? [], {
				kind: "Child",
				plus: false,
				name: `Territory_${n}`,
				fields: {
					Faction: "NewFaction",
					Center: "0, 0, 0",
					Radius: "20"
				}
			}]
		}));
		setTerritoryName(`Territory_${n}`);
	};
	const addRegion = () => {
		const n = nextChildNumber(regions, "StarRegion_");
		patchGeneral((cur) => ({
			...cur,
			children: [...cur.children ?? [], {
				kind: "Child",
				plus: false,
				name: `StarRegion_${n}`,
				fields: {
					Name: `Region ${n}`,
					Shape: "Sphere",
					RadiusMinMax: "0, 20",
					TotalSpawnCount: "10",
					UseDefaultStarDef: "false",
					NebulaSpawnCount: "0"
				}
			}]
		}));
		setRegionName(`StarRegion_${n}`);
	};
	const addNebula = () => {
		const key = `NebulaColors${nebulaKeys.reduce((max, key) => Math.max(max, Number(key.replace(/\D/g, "")) || 0), 0) + 1}`;
		patchGeneral((cur) => ({
			...cur,
			fields: {
				...cur.fields,
				[key]: "1, 0.5, 0.2"
			}
		}));
		setNebulaKey(key);
	};
	const addStar = () => {
		const used = new Set(stars.map((s) => (s.fields.StarClass || s.name).toLowerCase()));
		let klass = "G";
		let n = 2;
		while (used.has(klass.toLowerCase())) {
			klass = `G${n}`;
			n += 1;
		}
		const obj = {
			kind: "GalaxyConfig",
			plus: false,
			name: `${klass} Type Star`,
			fields: {
				StarClass: klass,
				Model: "SunYellow",
				Probability: "0.2",
				SizeClass: "10",
				Color: "1,0.95,0.63",
				LightColor: "1,0.96,0.85",
				SurfaceTemperature: "5500, 6000",
				Mass: "1",
				Radius: "1",
				Luminosity: "1",
				ColorName: "Yellow",
				InnerSystem: "5, 56",
				HabitableHot: "57, 63",
				HabitableTemperate: "64, 69",
				HabitableCold: "70, 75",
				OuterSystem: "76, 132"
			}
		};
		persist([...objects, obj]);
		setStarName(obj.name);
	};
	const extraGeneral = Object.keys(general?.fields ?? {}).filter((key) => !GALAXY_GENERAL_STATS.includes(key) && !/^NebulaColors\d+$/i.test(key));
	const nebulaKeys = Object.keys(general?.fields ?? {}).filter((key) => /^NebulaColors\d+$/i.test(key)).sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));
	const [nebulaKey, setNebulaKey] = (0, import_react.useState)(nebulaKeys[0] || "");
	const nebula = nebulaKeys.includes(nebulaKey) ? nebulaKey : nebulaKeys[0] || "";
	const extraStar = star ? Object.keys(star.fields).filter((k) => !STAR_STATS.includes(k)) : [];
	const [volumeTab, setVolumeTab] = (0, import_react.useState)("galaxy");
	const [hiddenLegend, setHiddenLegend] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const volumeSystems = (0, import_react.useMemo)(() => parseVolumeSystems(sectorText?.text || ""), [sectorText?.text]);
	const galaxyVolume = (0, import_react.useMemo)(() => readGalaxyVolume(general), [general]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full min-h-0 overflow-auto p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: addStar,
						children: "Add star type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: addRegion,
						children: "Add star region"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: addTerritory,
						children: "Add territory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: addNebula,
						children: "Add nebula"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !objects.length,
						onClick: () => download(fileName, stringifyEcfObjects(objects)),
						children: "Export"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "self-center text-xs text-subtle",
						children: [
							stars.length,
							" star types · ",
							regions.length,
							" regions · ",
							territories.length,
							" territories"
						]
					})
				]
			}),
			!objects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Import GalaxyConfig.ecf. Star types carry Inner / Hot / Temperate / Cold / Outer ranges in sectors (10 sec = 1 AU) plus Luminosity for solar flux."
			}) : null,
			objects.length && !sectorText?.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-warn",
				children: "GalaxyConfig is loaded, but Sectors.yaml was not kept as text — planet distances stay empty until that file is in the scenario drop (Content/Sectors.yaml) or imported on the Sectors slot."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					["galaxy", "Galaxy"],
					["regions", "Regions"],
					["territories", "Territories"],
					["all", "All"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setVolumeTab(id),
					className: `h-8 rounded-md border px-3 text-sm ${volumeTab === id ? "border-accent bg-accent/15 text-fg" : "border-border text-muted hover:text-fg"}`,
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex h-[520px] gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeViewport, {
						space: "galaxy",
						layer: volumeTab,
						galaxy: galaxyVolume,
						systems: volumeSystems,
						hidden: hiddenLegend
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeLegend, {
					tab: volumeTab,
					galaxy: galaxyVolume,
					hidden: hiddenLegend,
					onChange: setHiddenLegend
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-subtle",
				children: [
					volumeTab === "regions" ? "Star regions only. Nested shells are RadiusMinMax from the galactic center, in light years." : volumeTab === "territories" ? "Faction spheres only. Each territory is Center and Radius in light years." : volumeTab === "all" ? "Galaxy disk, star regions, and territories together." : "Galaxy radius and nebula color, with Sectors.yaml stars as the bright points.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library/sectors",
						className: "text-accent hover:underline",
						children: "Open the sectors volume"
					}),
					" ",
					"to zoom into a star, planet, or moon and edit it."
				]
			}),
			star ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalaxyStarChart, {
				star,
				bodies,
				starterName: general?.fields.StarterSystemName,
				onPatchStar: (fields) => persist(objects.map((obj) => obj.name === star.name ? {
					...obj,
					fields: {
						...obj.fields,
						...fields
					}
				} : obj)),
				onFixOrbits: (fixes) => {
					const current = catalogText(catalog, "sectors");
					if (!current?.text) return;
					setCatalogText("sectors", applyOrbitFixes(current.text, fixes), current.path || "Sectors.yaml");
				}
			}) : null,
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
						children: s.fields.StarClass ? `${s.fields.StarClass} — ${s.name}` : s.name
					}, s.name))
				})
			}),
			star ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [...STAR_STATS, ...extraStar].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					area: "star",
					children: key === "Description" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "min-h-20 w-full rounded-sm border border-border bg-bg px-2 py-1.5 text-sm",
						value: star.fields[key] ?? "",
						onChange: (e) => persist(objects.map((obj) => obj.name === star.name ? {
							...obj,
							fields: {
								...obj.fields,
								[key]: e.target.value
							}
						} : obj))
					}) : key === "Model" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm",
						value: star.fields.Model || "",
						onChange: (e) => persist(objects.map((obj) => obj.name === star.name ? {
							...obj,
							fields: {
								...obj.fields,
								Model: e.target.value
							}
						} : obj)),
						children: [star.fields.Model && !STAR_MODELS.includes(star.fields.Model) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: star.fields.Model,
							children: star.fields.Model
						}) : null, STAR_MODELS.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: model,
							children: model
						}, model))]
					}) : key === "Color" || key === "LightColor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "color",
							className: "h-10 w-12 cursor-pointer rounded-sm border border-border bg-bg",
							value: fieldToHex(star.fields[key]),
							onChange: (e) => persist(objects.map((obj) => obj.name === star.name ? {
								...obj,
								fields: {
									...obj.fields,
									[key]: hexToField(e.target.value)
								}
							} : obj))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: star.fields[key] ?? "",
							onChange: (e) => persist(objects.map((obj) => obj.name === star.name ? {
								...obj,
								fields: {
									...obj.fields,
									[key]: e.target.value
								}
							} : obj))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Add a star type to edit habitable zones and luminosity."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "General"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [...GALAXY_GENERAL_STATS, ...extraGeneral].filter((key) => !/^NebulaColors\d+$/i.test(key)).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					area: "general",
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
				children: "Nebulas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: "NebulaColors1 and up are color lists. A region’s NebulaColorIndex points at one of these."
			}),
			nebula ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 max-w-4xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "h-10 w-full max-w-xl rounded-sm border border-border bg-bg px-2 text-sm",
					value: nebula,
					onChange: (e) => setNebulaKey(e.target.value),
					children: nebulaKeys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: key,
						children: key
					}, key))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: nebula,
						note: "Red, green, blue groups from 0 to 1. Several groups make a gradient. Example: 1, 0.3, 0,  0.8, 0, 0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "min-h-20 w-full rounded-sm border border-border bg-bg px-2 py-1.5 font-mono text-sm",
							value: general?.fields[nebula] ?? "",
							onChange: (e) => patchGeneral((cur) => ({
								...cur,
								fields: {
									...cur.fields,
									[nebula]: e.target.value
								}
							}))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-2",
						size: "sm",
						variant: "ghost",
						onClick: () => {
							patchGeneral((cur) => {
								const fields = { ...cur.fields };
								delete fields[nebula];
								return {
									...cur,
									fields
								};
							});
							setNebulaKey(nebulaKeys.find((key) => key !== nebula) || "");
						},
						children: "Remove nebula"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "No nebula colors yet. Add one to paint the galaxy."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Star regions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: "Where stars spawn (LY). Mix rows are StarClass_n + Prob — that is the actual fill, not the default star list."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegionEditor, {
				rows: regions,
				selected: region?.name || "",
				onSelect: setRegionName,
				onChange: (name, col, value) => patchChild(name, (cur) => ({
					...cur,
					fields: {
						...cur.fields,
						[col]: value
					}
				})),
				onMix: (name, mix) => patchChild(name, (cur) => ({
					...cur,
					fields: writeStarMix(cur.fields, mix)
				})),
				onRemove: (name) => {
					patchGeneral((cur) => ({
						...cur,
						children: (cur.children ?? []).filter((c) => c.name !== name)
					}));
					const next = regions.find((row) => row.name !== name);
					setRegionName(next?.name || "");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-medium uppercase tracking-[0.14em] text-accent",
				children: "Territories"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: "Faction spheres in LY. Other_n lets extra POI factions leak in from center to edge."
			}),
			!territories.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "None yet. Add a territory to place a faction sphere."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "h-10 w-full rounded-sm border border-border bg-bg px-2 text-sm",
					value: territory?.name || "",
					onChange: (e) => setTerritoryName(e.target.value),
					children: territories.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: row.name,
						children: childLabel(row, row.fields.Faction || row.fields.Name)
					}, row.name))
				})
			}), territory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 max-w-4xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: territory.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "ml-auto",
							size: "sm",
							variant: "ghost",
							onClick: () => {
								patchGeneral((cur) => ({
									...cur,
									children: (cur.children ?? []).filter((c) => c.name !== territory.name)
								}));
								const next = territories.find((row) => row.name !== territory.name);
								setTerritoryName(next?.name || "");
							},
							children: "Remove"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: [...TERRITORY_STATS, ...extraKeys(territory, TERRITORY_STATS)].map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: col,
							area: "territory",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: territory.fields[col] ?? "",
								onChange: (e) => patchChild(territory.name, (cur) => ({
									...cur,
									fields: {
										...cur.fields,
										[col]: e.target.value
									}
								}))
							})
						}, col))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted",
								children: ["Other factions", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
									label: "Other factions",
									note: "Other_1 through Other_10. Each value is Faction, chance at the center, chance at the edge. Example: Zirax, 0.8, 0.1"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid gap-2 sm:grid-cols-2",
								children: Object.keys(territory.fields).filter((key) => /^Other_\d+$/i.test(key)).sort((a, b) => Number(a.slice(6)) - Number(b.slice(6))).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: key,
									note: "Faction name, then center chance, then edge chance. Example: Polaris, 0.5, 0.1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: territory.fields[key] ?? "",
										onChange: (e) => patchChild(territory.name, (cur) => ({
											...cur,
											fields: {
												...cur.fields,
												[key]: e.target.value
											}
										}))
									})
								}, key))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-2 h-8 max-w-xs",
								placeholder: "Add faction, then Enter",
								onKeyDown: (e) => {
									if (e.key !== "Enter") return;
									const name = e.target.value.trim();
									if (!name) return;
									patchChild(territory.name, (cur) => {
										const n = Object.keys(cur.fields).filter((key) => /^Other_/i.test(key)).length + 1;
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
							})
						]
					})
				]
			}) : null] })
		]
	});
}
function nextChildNumber(rows, prefix) {
	const used = rows.map((row) => Number(row.name.slice(prefix.length))).filter((n) => Number.isFinite(n));
	return (used.length ? Math.max(...used) : 0) + 1;
}
function childLabel(row, display) {
	const name = display?.trim();
	if (name && name !== row.name) return `${name} — ${row.name}`;
	return name || row.name;
}
function extraKeys(row, known) {
	return Object.keys(row.fields).filter((key) => !known.includes(key) && !/^Other_/i.test(key) && !/^StarClass_/i.test(key));
}
function RegionEditor({ rows, selected, onSelect, onChange, onMix, onRemove }) {
	const row = rows.find((item) => item.name === selected) ?? rows[0];
	if (!rows.length || !row) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm text-muted",
		children: "None yet. Add a star region to place classes in LY."
	});
	const mix = parseStarMix(row.fields);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 max-w-4xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "h-10 w-full max-w-xl rounded-sm border border-border bg-bg px-2 text-sm",
			value: row.name,
			onChange: (e) => onSelect(e.target.value),
			children: rows.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: item.name,
				children: childLabel(item, item.fields.Name)
			}, item.name))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 rounded-md border border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: row.fields.Name || "Unnamed region"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto text-xs text-subtle",
							children: mix.length ? `${mix.length} classes` : "default mix"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onRemove(row.name),
							children: "Remove"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [...STAR_REGION_STATS, ...extraKeys(row, STAR_REGION_STATS)].map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: col,
						area: "region",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "h-8",
							value: row.fields[col] ?? "",
							onChange: (e) => onChange(row.name, col, e.target.value)
						})
					}, col))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-auto px-3 pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-subtle",
							children: ["Star mix", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNote, {
								label: "Star mix",
								note: "Class is the star letter. Prob is that class’s share of this region and should add up to about 1. Cluster is the chance of a clump. Cluster range is how many extra stars, as minimum-maximum. Spawn amount is a fixed count when you set one."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[560px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-left text-xs uppercase tracking-[0.12em] text-subtle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-2",
										children: "Class"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-2",
										children: "Prob"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-2",
										children: "Cluster"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-2",
										children: "Cluster range"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-2",
										children: "Spawn amount"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "py-1" })
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: mix.map((entry, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 pr-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-24",
											value: entry.starClass,
											onChange: (e) => onMix(row.name, mix.map((item, j) => j === i ? {
												...item,
												starClass: e.target.value
											} : item))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 pr-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-20",
											value: entry.prob,
											onChange: (e) => onMix(row.name, mix.map((item, j) => j === i ? {
												...item,
												prob: e.target.value
											} : item))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 pr-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-20",
											value: entry.clusterProb,
											onChange: (e) => onMix(row.name, mix.map((item, j) => j === i ? {
												...item,
												clusterProb: e.target.value
											} : item))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 pr-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-28",
											value: entry.clusterRange,
											onChange: (e) => onMix(row.name, mix.map((item, j) => j === i ? {
												...item,
												clusterRange: e.target.value
											} : item))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 pr-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 w-24",
											value: entry.spawnAmount,
											onChange: (e) => onMix(row.name, mix.map((item, j) => j === i ? {
												...item,
												spawnAmount: e.target.value
											} : item))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => onMix(row.name, mix.filter((_, j) => j !== i)),
											children: "Remove"
										})
									})
								] }, `${row.name}-${entry.index}`))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-2",
							size: "sm",
							variant: "secondary",
							onClick: () => onMix(row.name, [...mix, {
								index: mix.length + 1,
								starClass: "G",
								spawnAmount: "",
								prob: "0.2",
								clusterProb: "0",
								clusterRange: "0-0"
							}]),
							children: "Add class"
						})
					]
				})
			]
		})]
	});
}
function stopColor(stop) {
	const c = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255);
	return `rgb(${c(stop[0])}, ${c(stop[1])}, ${c(stop[2])})`;
}
function Swatch({ color, ring }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border",
		style: {
			background: ring ? "transparent" : color,
			borderColor: color
		}
	});
}
function legendIds(tab, galaxy) {
	const ids = [];
	const galaxyOn = tab === "galaxy" || tab === "all";
	const regionsOn = tab === "regions" || tab === "all";
	const territoriesOn = tab === "territories" || tab === "all";
	if (galaxyOn) {
		ids.push("radius:outer");
		if (galaxy.inner > 1) ids.push("radius:inner");
		for (const nebula of galaxy.nebulas) ids.push(`nebula:${nebula.key}`);
		for (const item of STAR_CLASS_LEGEND) ids.push(item.id);
	}
	if (regionsOn) for (const region of galaxy.regions) ids.push(`region:${region.id}`);
	if (territoriesOn) for (const territory of galaxy.territories) ids.push(`territory:${territory.id}`);
	return ids;
}
function LegendRow({ id, color, ring, label, detail, hidden, onToggle, onOnly }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: `flex items-start gap-2 text-xs ${hidden ? "opacity-35" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-w-0 flex-1 items-start gap-2 text-left",
			onClick: () => onToggle(id),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, {
				ring,
				color
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
function VolumeLegend({ tab, galaxy, hidden, onChange }) {
	const showGalaxy = tab === "galaxy" || tab === "all";
	const showRegions = tab === "regions" || tab === "all";
	const showTerritories = tab === "territories" || tab === "all";
	const ids = legendIds(tab, galaxy);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex w-60 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-surface/50",
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
						ids.length,
						". Click a row to hide it."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-7 rounded-sm border border-border px-2 text-xs hover:text-fg",
						onClick: () => {
							const next = new Set(hidden);
							for (const id of ids) next.delete(id);
							onChange(next);
						},
						children: "All"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-7 rounded-sm border border-border px-2 text-xs hover:text-fg",
						onClick: () => onChange(new Set(ids)),
						children: "None"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-auto p-3",
			children: [
				showGalaxy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Galaxy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-1.5 space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
								id: "radius:outer",
								ring: true,
								color: "rgba(150,186,255,0.95)",
								label: "Outer radius",
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
							galaxy.nebulas.map((nebula) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
								id: `nebula:${nebula.key}`,
								color: stopColor(nebula.stops[0] || [
									1,
									1,
									1
								]),
								label: nebula.key,
								hidden: hidden.has(`nebula:${nebula.key}`),
								onToggle: toggle,
								onOnly: only
							}, nebula.key))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Star class"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1.5 space-y-1.5",
						children: STAR_CLASS_LEGEND.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
							id: item.id,
							color: item.color,
							label: item.label,
							hidden: hidden.has(item.id),
							onToggle: toggle,
							onOnly: only
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-[10px] leading-4 text-subtle",
						children: "A star Color field overrides the class tint."
					})
				] }) : null,
				showRegions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Regions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1.5 space-y-1.5",
						children: galaxy.regions.length ? galaxy.regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
							id: `region:${region.id}`,
							ring: true,
							color: region.color,
							label: region.name,
							detail: `${region.inner}–${region.outer} LY`,
							hidden: hidden.has(`region:${region.id}`),
							onToggle: toggle,
							onOnly: only
						}, region.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-xs text-subtle",
							children: "No star regions in this file."
						})
					})]
				}) : null,
				showTerritories ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Territories"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1.5 space-y-1.5",
						children: galaxy.territories.length ? galaxy.territories.map((territory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
							id: `territory:${territory.id}`,
							ring: true,
							color: territory.color,
							label: territory.faction,
							detail: territory.id,
							hidden: hidden.has(`territory:${territory.id}`),
							onToggle: toggle,
							onOnly: only
						}, territory.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-xs text-subtle",
							children: "No territories in this file."
						})
					})]
				}) : null
			]
		})]
	});
}
function GalaxyWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Galaxy",
		kicker: "GalaxyConfig.ecf · habitable zones",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalaxyEditor, {})
	});
}
//#endregion
export { GalaxyWorkspace as component };

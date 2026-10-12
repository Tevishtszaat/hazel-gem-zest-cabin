import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/volume-view-CZlnSp5G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FACTION_COLOR = {
	zirax: "#ff5a4a",
	talon: "#ff9a3c",
	polaris: "#3ec6ff",
	kriel: "#7dff6a",
	pirates: "#c58bff",
	trader: "#ffd15a",
	uch: "#f4f7ff",
	civilian: "#b7c0cc",
	alien: "#ff6ad5",
	player: "#4aa3ff"
};
function leading(line) {
	return line.match(/^\s*/)?.[0].length ?? 0;
}
function nums(text) {
	return text.split(/[, ]+/).map((part) => Number(part)).filter((n) => Number.isFinite(n));
}
function parseVec3(text, fallback = [
	0,
	0,
	0
]) {
	const n = nums(text || "");
	if (n.length < 3) return fallback;
	return [
		n[0],
		n[1],
		n[2]
	];
}
function unquote(value) {
	const v = value.trim();
	if (v.startsWith("'") && v.endsWith("'") || v.startsWith("\"") && v.endsWith("\"")) return v.slice(1, -1).trim();
	return v;
}
function splitFields(rest) {
	const out = [];
	let cur = "";
	let quote = "";
	for (const ch of rest) {
		if (quote) {
			if (ch === quote) quote = "";
			else cur += ch;
			continue;
		}
		if (ch === "'" || ch === "\"") {
			quote = ch;
			continue;
		}
		if (ch === ",") {
			out.push(cur.trim());
			cur = "";
			continue;
		}
		cur += ch;
	}
	if (cur.trim()) out.push(cur.trim());
	return out.map(unquote).filter((part) => part && !/^~/.test(part));
}
function isStructuralKind(value) {
	return /^(sun|star|planet|moon|orbit|space|asteroid|gas|station|playfield)$/i.test(value.trim());
}
function inferKind(name, biome) {
	const text = `${name} ${biome}`;
	if (/moon/i.test(text)) return "Moon";
	if (/orbit/i.test(text)) return "Orbit";
	if (/\b(sun|star)\b/i.test(text)) return "Sun";
	if (/space|warp|station|asteroid/i.test(text)) return "Space";
	return "Planet";
}
function describeSlots(name, slot2 = "", slot3 = "") {
	const second = slot2.trim();
	const third = slot3.trim();
	if (!second) return {
		kind: "Playfield",
		playfieldType: third || void 0
	};
	if (isStructuralKind(second)) return {
		kind: second,
		playfieldType: third || void 0
	};
	return {
		kind: inferKind(name, second),
		playfieldType: third || second
	};
}
function tripleFrom(text) {
	const n = nums(text);
	if (n.length < 3) return null;
	return [
		n[0],
		n[1],
		n[2]
	];
}
function isZero(v) {
	return v[0] === 0 && v[1] === 0 && v[2] === 0;
}
function parsePlayfieldLine(line) {
	const start = line.indexOf("[");
	const end = line.lastIndexOf("]");
	if (start < 0 || end <= start) return null;
	const inner = line.slice(start + 1, end).trim();
	const quoted = inner.match(/^(['"])(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\1\s*,\s*([\s\S]*)$/);
	const numeric = inner.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*([\s\S]*)$/);
	if (quoted || numeric) {
		const local = quoted ? [
			Number(quoted[2]),
			Number(quoted[3]),
			Number(quoted[4])
		] : [
			Number(numeric[1]),
			Number(numeric[2]),
			Number(numeric[3])
		];
		if (local.some((n) => !Number.isFinite(n))) return null;
		const fields = splitFields((quoted ? quoted[5] : numeric[4]) || "");
		if (!fields[0]) return null;
		let orbit = local;
		for (const field of fields) {
			const extra = tripleFrom(field);
			if (extra && isZero(orbit) && !isZero(extra)) orbit = extra;
		}
		return {
			name: fields[0],
			kind: fields[1] || "Playfield",
			playfieldType: fields[2] || void 0,
			local: orbit,
			quoted: Boolean(quoted)
		};
	}
	const fields = splitFields(inner);
	if (fields.length < 2) return null;
	const last = fields[fields.length - 1] || "";
	const trailing = tripleFrom(last);
	const numericTail = fields.length >= 5 && fields.slice(-3).every((field) => /^-?[\d.]+$/.test(field));
	let local = null;
	let head = fields;
	if (numericTail) {
		const tail = fields.slice(-3);
		local = [
			Number(tail[0]),
			Number(tail[1]),
			Number(tail[2])
		];
		head = fields.slice(0, -3);
	} else if (trailing && !/^[A-Za-z]/.test(last.trim())) {
		local = trailing;
		head = fields.slice(0, -1);
	}
	if (!local || local.some((n) => !Number.isFinite(n)) || !head[0]) return null;
	return {
		name: head[0],
		kind: head[1] || "Playfield",
		playfieldType: head[2] || void 0,
		local,
		quoted: false
	};
}
function readDashTriple(lines, start) {
	const found = [];
	let i = start;
	while (i < lines.length && found.length < 3) {
		const trimmed = (lines[i] || "").trim();
		if (!trimmed || trimmed.startsWith("#")) {
			i += 1;
			continue;
		}
		const hit = trimmed.match(/^-\s*(-?[\d.]+)\s*$/);
		if (!hit) break;
		found.push(Number(hit[1]));
		i += 1;
	}
	if (found.length < 3 || found.some((n) => !Number.isFinite(n))) return null;
	return {
		local: [
			found[0],
			found[1],
			found[2]
		],
		next: i
	};
}
function applyBodyKey(body, lineIndex, text) {
	const inline = text.match(/^(Coordinates|Pos|Position)\s*:\s*\[([^\]]+)\]/i);
	if (inline) {
		const local = tripleFrom(inline[2] || "");
		if (local) {
			body.local = local;
			body.coordLine = lineIndex;
		}
		return;
	}
	const named = text.match(/^(Name|SectorName)\s*:\s*(.+)$/i);
	if (named) {
		body.name = unquote(named[2].replace(/\s+#.*$/, ""));
		body.nameLine = lineIndex;
		return;
	}
	const typed = text.match(/^(PlayfieldType|PlanetType|Biome|Type)\s*:\s*(.+)$/i);
	if (typed) {
		body.playfieldType = unquote(typed[2].replace(/\s+#.*$/, ""));
		body.typeLine = lineIndex;
		if (!isStructuralKind(body.kind)) body.kind = inferKind(body.name, body.playfieldType || "");
		return;
	}
	const kind = text.match(/^Kind\s*:\s*(.+)$/i);
	if (kind) {
		body.kind = unquote(kind[1].replace(/\s+#.*$/, ""));
		body.kindLine = lineIndex;
	}
}
function readMapBody(lines, start) {
	const base = leading(lines[start] || "");
	const body = {
		name: "",
		kind: "Playfield",
		local: [
			0,
			0,
			0
		],
		line: start,
		quoted: false,
		nameLine: start
	};
	applyBodyKey(body, start, (lines[start] || "").trim().replace(/^-\s+/, ""));
	let i = start + 1;
	while (i < lines.length) {
		const line = lines[i] || "";
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			i += 1;
			continue;
		}
		if (leading(line) <= base) break;
		if (/^(Coordinates|Pos|Position)\s*:$/i.test(trimmed)) {
			const triple = readDashTriple(lines, i + 1);
			if (triple) {
				body.local = triple.local;
				body.coordLine = i;
				i = triple.next;
				continue;
			}
		}
		applyBodyKey(body, i, trimmed);
		i += 1;
	}
	if (!body.name) return null;
	body.entryEnd = i;
	if (!isStructuralKind(body.kind)) body.kind = inferKind(body.name, body.playfieldType || "");
	return {
		body,
		next: i
	};
}
function readSeqBody(lines, start) {
	const base = leading(lines[start] || "");
	const coordText = (lines[start] || "").trim().replace(/^-\s+-\s+/, "");
	const local = tripleFrom(unquote(coordText));
	if (!local) return null;
	const fields = [];
	const fieldLines = [];
	let i = start + 1;
	while (i < lines.length) {
		const line = lines[i] || "";
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			i += 1;
			continue;
		}
		if (leading(line) <= base || !trimmed.startsWith("-")) break;
		fields.push(unquote(trimmed.replace(/^-\s+/, "").replace(/\s+#.*$/, "")));
		fieldLines.push(i);
		i += 1;
	}
	if (!fields[0]) return null;
	const described = describeSlots(fields[0], fields[1] || "", fields[2] || "");
	return {
		body: {
			name: fields[0],
			kind: described.kind,
			playfieldType: described.playfieldType,
			local,
			line: start,
			coordLine: start,
			nameLine: fieldLines[0],
			kindLine: fieldLines[1],
			typeLine: fieldLines[2],
			quoted: /^['"]/.test(coordText.trim()),
			entryEnd: i
		},
		next: i
	};
}
function blankSystem(blockStart) {
	return {
		name: "",
		starClass: "",
		ly: [
			0,
			0,
			0
		],
		color: "",
		blockStart,
		blockEnd: blockStart,
		bodies: []
	};
}
function applySystemLine(system, index, line) {
	const trimmed = line.trim();
	const coords = trimmed.match(/^-\s*Coordinates:\s*\[([^\]]+)\]/i) || trimmed.match(/^Coordinates:\s*\[([^\]]+)\]/i);
	if (coords) {
		system.ly = parseVec3(coords[1]);
		system.coordLine = index;
		return;
	}
	const named = trimmed.match(/^(?:-\s*)?(SectorName|Name)\s*:\s*(.+)$/i);
	if (named) {
		system.name = unquote(named[2].replace(/\s+#.*$/, ""));
		system.nameLine = index;
		return;
	}
	const klass = trimmed.match(/^(?:-\s*)?StarClass\s*:\s*([^\s#]+)/i);
	if (klass) {
		system.starClass = unquote(klass[1]);
		system.starClassLine = index;
		return;
	}
	const color = trimmed.match(/^Color\s*:\s*(.+)$/i);
	if (color) system.color = unquote(color[1].replace(/\s+#.*$/, ""));
}
function parseVolumeSystems(yaml) {
	const lines = yaml.split(/\r?\n/);
	const systems = [];
	let cur = null;
	let inPlayfields = false;
	const flush = (end) => {
		if (!cur) return;
		cur.blockEnd = end;
		if (!cur.name) {
			const sun = cur.bodies.find((body) => /sun|star/i.test(body.kind));
			cur.name = sun?.name || `System ${systems.length + 1}`;
		}
		systems.push(cur);
		cur = null;
		inPlayfields = false;
	};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? "";
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		if (/^-\s+(Coordinates|Name|SectorName|StarClass)\s*:/i.test(trimmed) && leading(line) <= 2) {
			flush(i);
			cur = blankSystem(i);
			applySystemLine(cur, i, line);
			continue;
		}
		if (!cur) continue;
		if (/Playfields\s*:/i.test(trimmed) && !trimmed.startsWith("-")) {
			inPlayfields = true;
			cur.playfieldsLine = i;
			continue;
		}
		if (/^Coordinates\s*:$/i.test(trimmed)) {
			const triple = readDashTriple(lines, i + 1);
			if (triple) {
				if (inPlayfields) {
					const body = cur.bodies[cur.bodies.length - 1];
					if (body && isZero(body.local)) {
						body.local = triple.local;
						body.coordLine = i;
					}
				} else {
					cur.ly = triple.local;
					cur.coordLine = i;
				}
				i = triple.next - 1;
				continue;
			}
		}
		if (inPlayfields && /^\s*-\s+-\s+/.test(line)) {
			const seq = readSeqBody(lines, i);
			if (seq) {
				cur.bodies.push(seq.body);
				i = seq.next - 1;
				continue;
			}
		}
		if (inPlayfields && /^-\s+(Name|SectorName|Coordinates|Pos|Position)\s*:/i.test(trimmed)) {
			const map = readMapBody(lines, i);
			if (map) {
				cur.bodies.push(map.body);
				i = map.next - 1;
				continue;
			}
		}
		if (inPlayfields && trimmed.startsWith("-") && trimmed.includes("[")) {
			const body = parsePlayfieldLine(line);
			if (body) {
				const full = {
					...body,
					line: i
				};
				const follow = /^\s*(Coordinates|Pos|Position)\s*:/i.test((lines[i + 1] || "").trim()) ? i + 1 : -1;
				if (follow >= 0 && leading(lines[follow] || "") > leading(line)) {
					const inline = (lines[follow] || "").trim().match(/^(?:Coordinates|Pos|Position)\s*:\s*\[([^\]]+)\]/i);
					const nested = inline ? null : readDashTriple(lines, follow + 1);
					const local = inline ? tripleFrom(inline[1] || "") : nested?.local;
					if (local && (isZero(full.local) || !isZero(local))) {
						full.flowLocal = full.flowLocal ?? full.local;
						full.local = local;
						full.coordLine = follow;
					}
				}
				cur.bodies.push(full);
			}
			continue;
		}
		if (inPlayfields && leading(line) <= 2 && /^[A-Za-z]/.test(trimmed)) inPlayfields = false;
		if (!inPlayfields) applySystemLine(cur, i, line);
	}
	flush(lines.length);
	return systems;
}
function join(yaml, lines) {
	const nl = yaml.includes("\r\n") ? "\r\n" : "\n";
	return lines.join(nl);
}
function formatTriple(v) {
	const n = (x) => String(Math.round(x * 1e3) / 1e3);
	return `${n(v[0])}, ${n(v[1])}, ${n(v[2])}`;
}
function formatPlayfield(indent, body) {
	const type = body.playfieldType ? `, ${body.playfieldType}` : "";
	if (body.quoted) return `${indent}- ['${formatTriple(body.local)}', ${body.name}, ${body.kind}${type}]`;
	return `${indent}- [${formatTriple(body.local)}, ${body.name}, ${body.kind}${type}]`;
}
function patchSystemCoordinates(yaml, system, ly) {
	const lines = yaml.split(/\r?\n/);
	const triple = `[${formatTriple(ly)}]`;
	if (system.coordLine != null && lines[system.coordLine]) lines[system.coordLine] = lines[system.coordLine].replace(/\[[^\]]+\]/, triple);
	else {
		const indent = leading(lines[system.blockStart] || "") > 0 ? "" : "  ";
		lines.splice(system.blockStart + 1, 0, `${indent}Coordinates: ${triple}`);
	}
	return join(yaml, lines);
}
function patchSystemStarClass(yaml, system, starClass) {
	const lines = yaml.split(/\r?\n/);
	const value = starClass.trim();
	if (system.starClassLine != null && lines[system.starClassLine]) lines[system.starClassLine] = lines[system.starClassLine].replace(/StarClass\s*:\s*\S+/i, `StarClass: ${value}`);
	else lines.splice(system.blockStart + 1, 0, `  StarClass: ${value}`);
	return join(yaml, lines);
}
function patchPlayfield(yaml, body, next) {
	const lines = yaml.split(/\r?\n/);
	if (body.coordLine != null && lines[body.coordLine] && body.coordLine !== body.line) lines[body.coordLine] = replaceCoordLine(lines[body.coordLine], next.local);
	else if (body.coordLine != null && lines[body.line] && !lines[body.line].includes("[")) lines[body.line] = replaceCoordLine(lines[body.line], next.local);
	if (body.nameLine != null && lines[body.nameLine] && body.nameLine !== body.line) lines[body.nameLine] = replaceYamlValue(lines[body.nameLine], next.name);
	if (body.kindLine != null && lines[body.kindLine]) lines[body.kindLine] = replaceYamlValue(lines[body.kindLine], next.kind);
	if (body.typeLine != null && lines[body.typeLine]) lines[body.typeLine] = replaceYamlValue(lines[body.typeLine], next.playfieldType || "");
	if (lines[body.line]?.includes("[")) {
		const indent = (lines[body.line] || "").match(/^\s*/)?.[0] ?? "  ";
		const flow = body.flowLocal ?? (body.coordLine != null && body.coordLine !== body.line ? body.flowLocal : void 0);
		lines[body.line] = formatPlayfield(indent, {
			...next,
			local: flow ?? next.local,
			quoted: body.quoted
		});
	}
	return join(yaml, lines);
}
function replaceYamlValue(line, value) {
	return line.replace(/:\s*.+$/, `: ${value}`);
}
function replaceCoordLine(line, local) {
	if (/\[[^\]]*\]/.test(line)) return line.replace(/\[[^\]]*\]/, `[${formatTriple(local)}]`);
	const indent = line.match(/^\s*/)?.[0] ?? "";
	if (/^-\s+-/.test(line.trim()) || line.trim().startsWith("- -")) return `${indent}- - ${formatTriple(local)}`;
	return line;
}
function addPlayfield(yaml, system, body) {
	const lines = yaml.split(/\r?\n/);
	const last = system.bodies[system.bodies.length - 1];
	const at = (last?.line ?? system.playfieldsLine ?? system.blockStart) + 1;
	const indent = (last ? lines[last.line] || "" : "  - ['0, 0, 0', Sun, Sun]").match(/^\s*/)?.[0] || "  ";
	const quoted = last ? last.quoted : true;
	lines.splice(at, 0, formatPlayfield(indent, {
		...body,
		quoted
	}));
	return join(yaml, lines);
}
function removePlayfield(yaml, body) {
	const lines = yaml.split(/\r?\n/);
	const end = body.entryEnd ?? body.line + 1;
	lines.splice(body.line, Math.max(1, end - body.line));
	return join(yaml, lines);
}
function cssColor(text, fallback) {
	const n = nums(text || "");
	if (n.length < 3) return fallback;
	const c = (v) => Math.max(0, Math.min(255, Math.round((v > 1 ? v / 255 : v) * 255)));
	return `rgb(${c(n[0])}, ${c(n[1])}, ${c(n[2])})`;
}
var REGION_PALETTE = [
	"#7eb6ff",
	"#ffd36a",
	"#ff8b6a",
	"#8dffb0",
	"#d2a6ff",
	"#6aefff"
];
function readGalaxyVolume(general) {
	const fields = general?.fields ?? {};
	const radius = nums(fields.Radius || "");
	const inner = radius.length >= 2 ? radius[0] : 0;
	const outer = radius.length >= 2 ? radius[1] : radius[0] || 1e3;
	const sectorsPerLy = Number(fields.SectorsPerLY) || 1e5;
	const regions = [];
	const territories = [];
	for (const child of general?.children ?? []) {
		if (/starregion/i.test(child.name)) {
			const span = nums(child.fields.RadiusMinMax || "");
			regions.push({
				id: child.name,
				name: child.fields.Name || child.name,
				shape: /ellipt/i.test(child.fields.Shape || "") ? "elliptical" : "sphere",
				inner: span[0] ?? 0,
				outer: span[1] ?? span[0] ?? 0,
				color: cssColor(child.fields.LabelColor, REGION_PALETTE[regions.length % REGION_PALETTE.length])
			});
		}
		if (/territory/i.test(child.name)) {
			const faction = child.fields.Faction || child.fields.Name || child.name;
			const radiusLy = Number(String(child.fields.Radius || "").split(",")[0]);
			territories.push({
				id: child.name,
				faction,
				center: parseVec3(child.fields.Center),
				radius: Number.isFinite(radiusLy) ? radiusLy : 10,
				color: FACTION_COLOR[faction.toLowerCase()] || "#d7deea"
			});
		}
	}
	const nebulas = Object.keys(fields).filter((key) => /^NebulaColors\d+$/i.test(key)).sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))).map((key) => {
		const n = nums(fields[key] || "");
		const stops = [];
		for (let i = 0; i + 2 < n.length; i += 3) stops.push([
			n[i],
			n[i + 1],
			n[i + 2]
		]);
		return {
			key,
			stops
		};
	}).filter((nebula) => nebula.stops.length);
	return {
		inner,
		outer: Math.max(outer, 1),
		sectorsPerLy,
		regions,
		territories,
		nebulas
	};
}
var STAR_CLASS_LEGEND = [
	{
		id: "class:OB",
		label: "O / B stars",
		color: "#9ecbff"
	},
	{
		id: "class:AF",
		label: "A / F stars",
		color: "#f4f7ff"
	},
	{
		id: "class:G",
		label: "G stars",
		color: "#ffe29a"
	},
	{
		id: "class:K",
		label: "K stars",
		color: "#ffb15a"
	},
	{
		id: "class:M",
		label: "M stars",
		color: "#ff6d4a"
	},
	{
		id: "class:other",
		label: "Other stars",
		color: "#fff4cf"
	}
];
function starClassKey(starClass) {
	const letter = starClass.trim().charAt(0).toUpperCase();
	if (letter === "O" || letter === "B") return "class:OB";
	if (letter === "A" || letter === "F") return "class:AF";
	if (letter === "G" || letter === "K" || letter === "M") return `class:${letter}`;
	return "class:other";
}
function starTint(starClass, color) {
	if (color) return cssColor(color, "#ffe7a3");
	const letter = starClass.trim().charAt(0).toUpperCase();
	if (letter === "O" || letter === "B") return "#9ecbff";
	if (letter === "A" || letter === "F") return "#f4f7ff";
	if (letter === "G") return "#ffe29a";
	if (letter === "K") return "#ffb15a";
	if (letter === "M") return "#ff6d4a";
	return "#fff4cf";
}
var ZONE_FALLBACK = [
	{
		label: "Inner",
		min: 0,
		max: 40,
		color: "rgba(255,106,61,0.9)"
	},
	{
		label: "Hot",
		min: 40,
		max: 70,
		color: "rgba(255,176,32,0.9)"
	},
	{
		label: "Temperate",
		min: 70,
		max: 100,
		color: "rgba(61,255,154,0.9)"
	},
	{
		label: "Cold",
		min: 100,
		max: 140,
		color: "rgba(126,203,255,0.9)"
	},
	{
		label: "Outer",
		min: 140,
		max: 220,
		color: "rgba(180,190,210,0.7)"
	}
];
function project(p, cam, w, h) {
	const x = p[0] - cam.target[0];
	const y = p[1] - cam.target[1];
	const z = p[2] - cam.target[2];
	const cy = Math.cos(cam.yaw);
	const sy = Math.sin(cam.yaw);
	const x1 = x * cy + z * sy;
	const z1 = -x * sy + z * cy;
	const cp = Math.cos(cam.pitch);
	const sp = Math.sin(cam.pitch);
	const y2 = y * cp - z1 * sp;
	const z2 = y * sp + z1 * cp;
	const depth = cam.dist - z2;
	if (depth < .08) return null;
	const f = Math.min(w, h) * .78 / depth;
	return {
		x: w / 2 + x1 * f,
		y: h / 2 - y2 * f,
		depth
	};
}
function strokeLoop(ctx, pts, color, width, alpha = 1) {
	if (!pts || pts.length < 3) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (const p of pts) ctx.lineTo(p.x, p.y);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
}
function shell(ctx, cam, w, h, radius, yScale, color, alpha) {
	for (const lat of [
		-50,
		-25,
		0,
		25,
		50
	]) {
		const rad = lat * Math.PI / 180;
		const ring = Math.cos(rad) * radius;
		const y = Math.sin(rad) * radius * yScale;
		const pts = [];
		for (let i = 0; i <= 64; i++) {
			const a = i / 64 * Math.PI * 2;
			const p = project([
				Math.cos(a) * ring,
				y,
				Math.sin(a) * ring
			], cam, w, h);
			if (p) pts.push(p);
		}
		strokeLoop(ctx, pts, color, lat === 0 ? 1.4 : .7, alpha * (lat === 0 ? 1 : .55));
	}
}
var DUST = Array.from({ length: 700 }, (_, i) => {
	const n = (s) => {
		const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
		return x - Math.floor(x);
	};
	return {
		x: n(1),
		y: n(2),
		a: .15 + n(3) * .55,
		r: n(4) > .97 ? 1.4 : .6
	};
});
function VolumeViewport({ space, galaxy, systems, focusSystem, focusBody, zones, onPick, layer = "all", hidden }) {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const camRef = (0, import_react.useRef)({
		yaw: .6,
		pitch: .55,
		dist: 2e3,
		target: [
			0,
			0,
			0
		]
	});
	const hitsRef = (0, import_react.useRef)([]);
	const drag = (0, import_react.useRef)(null);
	const system = systems.find((item) => item.name === focusSystem) ?? null;
	const frameKey = `${space}:${focusSystem || ""}:${focusBody || ""}:${galaxy?.outer || 0}`;
	(0, import_react.useEffect)(() => {
		const outer = galaxy?.outer || 1e3;
		if (space === "galaxy") {
			camRef.current = {
				yaw: .7,
				pitch: .62,
				dist: outer * 2.35,
				target: [
					0,
					0,
					0
				]
			};
			return;
		}
		const body = system?.bodies.find((item) => item.name === focusBody);
		if (body) {
			const near = system?.bodies.reduce((best, item) => {
				if (item.name === body.name) return best;
				const d = Math.hypot(item.local[0] - body.local[0], item.local[1] - body.local[1], item.local[2] - body.local[2]);
				return Math.min(best, d);
			}, 80);
			camRef.current = {
				yaw: .5,
				pitch: .7,
				dist: Math.max(28, (near || 40) * 2.4),
				target: body.local
			};
			return;
		}
		const far = system?.bodies.reduce((m, item) => Math.max(m, Math.hypot(...item.local)), 80) || 160;
		camRef.current = {
			yaw: .55,
			pitch: .85,
			dist: Math.max(far * 2.4, 80),
			target: [
				0,
				0,
				0
			]
		};
	}, [
		frameKey,
		space,
		system,
		focusBody,
		galaxy?.outer
	]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		let frame = 0;
		const paint = () => {
			const cssW = wrap.clientWidth || 800;
			const cssH = wrap.clientHeight || 480;
			const dpr = 2;
			if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
				canvas.width = Math.floor(cssW * dpr);
				canvas.height = Math.floor(cssH * dpr);
			}
			canvas.style.width = `${cssW}px`;
			canvas.style.height = `${cssH}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const w = cssW;
			const h = cssH;
			const cam = camRef.current;
			const hits = [];
			ctx.clearRect(0, 0, w, h);
			const sky = ctx.createLinearGradient(0, 0, 0, h);
			sky.addColorStop(0, "#10182a");
			sky.addColorStop(1, "#05070d");
			ctx.fillStyle = sky;
			ctx.fillRect(0, 0, w, h);
			for (const star of DUST) {
				ctx.globalAlpha = star.a;
				ctx.fillStyle = "#d5e4ff";
				ctx.fillRect(star.x * w, star.y * h, star.r, star.r);
			}
			ctx.globalAlpha = 1;
			const off = (id) => Boolean(hidden?.has(id));
			if (space === "galaxy") {
				const showGalaxy = layer === "galaxy" || layer === "all";
				const showRegions = layer === "regions" || layer === "all";
				const showTerritories = layer === "territories" || layer === "all";
				const outer = galaxy?.outer || 1e3;
				const yScale = .22;
				if (showGalaxy) {
					if (!off("radius:outer")) shell(ctx, cam, w, h, outer, yScale, "rgba(150,186,255,0.85)", .35);
					if (!off("radius:inner") && (galaxy?.inner || 0) > 1) shell(ctx, cam, w, h, galaxy.inner, yScale, "rgba(255,220,160,0.8)", .28);
				} else shell(ctx, cam, w, h, outer, yScale, "rgba(150,186,255,0.45)", .12);
				if (showRegions) {
					const regionLabels = [];
					for (const region of galaxy?.regions || []) {
						if (region.outer <= 0 || off(`region:${region.id}`)) continue;
						shell(ctx, cam, w, h, region.outer, region.shape === "elliptical" ? .22 : 1, region.color, layer === "regions" ? .8 : .45);
						const at = project([
							region.outer,
							0,
							0
						], cam, w, h);
						if (at) regionLabels.push({
							x: at.x,
							y: at.y,
							text: region.name
						});
					}
					ctx.font = "11px sans-serif";
					ctx.fillStyle = "#f4f7ff";
					const drawn = [];
					for (const item of regionLabels) {
						if (drawn.some((prev) => Math.hypot(prev.x - item.x, prev.y - item.y) < 16)) continue;
						if (drawn.length >= 16) break;
						ctx.fillText(item.text, item.x + 6, item.y - 4);
						drawn.push(item);
					}
				}
				if (showGalaxy) {
					const visible = (galaxy?.nebulas || []).filter((nebula) => !off(`nebula:${nebula.key}`));
					const nebulas = hidden?.size ? visible.slice(0, 12) : visible.slice(0, 8);
					nebulas.forEach((nebula, i) => {
						const angle = i / nebulas.length * Math.PI * 2;
						const r = outer * (.35 + i % 3 * .15);
						const at = project([
							Math.cos(angle) * r,
							outer * .02,
							Math.sin(angle) * r
						], cam, w, h);
						const stop = nebula.stops[0];
						if (!at || !stop) return;
						const radius = Math.max(40, Math.min(w, h) * .16);
						const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, radius);
						const red = Math.round(Math.min(1, stop[0]) * 255);
						const green = Math.round(Math.min(1, stop[1]) * 255);
						const blue = Math.round(Math.min(1, stop[2]) * 255);
						g.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.28)`);
						g.addColorStop(1, "rgba(0,0,0,0)");
						ctx.fillStyle = g;
						ctx.beginPath();
						ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
						ctx.fill();
					});
				}
				if (showTerritories) {
					const drawn = [];
					for (const territory of galaxy?.territories || []) {
						if (off(`territory:${territory.id}`)) continue;
						const center = territory.center;
						shell(ctx, {
							...cam,
							target: [
								cam.target[0] - center[0],
								cam.target[1] - center[1],
								cam.target[2] - center[2]
							]
						}, w, h, territory.radius, 1, territory.color, layer === "territories" ? .9 : .55);
						const at = project(center, cam, w, h);
						if (!at) continue;
						ctx.fillStyle = territory.color;
						ctx.beginPath();
						ctx.arc(at.x, at.y, 3.2, 0, Math.PI * 2);
						ctx.fill();
						if (drawn.some((prev) => Math.hypot(prev.x - at.x, prev.y - at.y) < 14)) continue;
						ctx.font = "11px sans-serif";
						ctx.fillText(territory.faction, at.x + 6, at.y - 6);
						drawn.push(at);
					}
				}
				if (showGalaxy || layer === "all") {
					const projected = systems.map((item) => {
						const at = project(item.ly, cam, w, h);
						return at ? {
							item,
							at
						} : null;
					}).filter((item) => Boolean(item)).sort((a, b) => b.at.depth - a.at.depth);
					for (const { item, at } of projected) {
						if (off(starClassKey(item.starClass))) continue;
						const tint = starTint(item.starClass, item.color);
						const focused = item.name === focusSystem;
						ctx.fillStyle = tint;
						ctx.shadowColor = tint;
						ctx.shadowBlur = focused ? 16 : 8;
						ctx.beginPath();
						ctx.arc(at.x, at.y, focused ? 4.5 : 2.2, 0, Math.PI * 2);
						ctx.fill();
						ctx.shadowBlur = 0;
						hits.push({
							id: item.name,
							x: at.x,
							y: at.y,
							depth: at.depth,
							label: item.name
						});
					}
					const label = projected.find((item) => item.item.name === focusSystem);
					if (label) {
						ctx.fillStyle = "#f4f7ff";
						ctx.font = "12px sans-serif";
						ctx.fillText(label.item.name, label.at.x + 8, label.at.y - 8);
					}
				}
			} else if (system) {
				const rings = zones?.length ? zones : ZONE_FALLBACK;
				for (const zone of rings) {
					if (off(`zone:${zone.label}`)) continue;
					const pts = [];
					for (let i = 0; i <= 72; i++) {
						const a = i / 72 * Math.PI * 2;
						const p = project([
							Math.cos(a) * zone.max,
							0,
							Math.sin(a) * zone.max
						], cam, w, h);
						if (p) pts.push(p);
					}
					strokeLoop(ctx, pts, zone.color, 1.2, .55);
				}
				const sun = project([
					0,
					0,
					0
				], cam, w, h);
				if (sun && !off("kind:sun")) {
					const tint = starTint(system.starClass, system.color);
					const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 36);
					glow.addColorStop(0, tint);
					glow.addColorStop(1, "rgba(0,0,0,0)");
					ctx.fillStyle = glow;
					ctx.beginPath();
					ctx.arc(sun.x, sun.y, 36, 0, Math.PI * 2);
					ctx.fill();
				}
				const bodies = system.bodies.map((body) => {
					const at = project(body.local, cam, w, h);
					return at ? {
						body,
						at
					} : null;
				}).filter((item) => Boolean(item)).sort((a, b) => b.at.depth - a.at.depth);
				const namedAt = [];
				for (const { body, at } of bodies) {
					if (/sun|star/i.test(body.kind) && Math.hypot(body.local[0], body.local[1], body.local[2]) < 1) continue;
					const moon = /moon/i.test(body.kind);
					const planet = /planet/i.test(body.kind);
					if (off(/sun|star/i.test(body.kind) ? "kind:sun" : moon ? "kind:moon" : planet ? "kind:planet" : "kind:other")) continue;
					if (!off("path:orbit")) {
						const orbit = [];
						const radius = Math.hypot(body.local[0], body.local[2]) || Math.hypot(body.local[0], body.local[1], body.local[2]);
						for (let i = 0; i <= 48; i++) {
							const a = i / 48 * Math.PI * 2;
							const p = project([
								Math.cos(a) * radius,
								body.local[1],
								Math.sin(a) * radius
							], cam, w, h);
							if (p) orbit.push(p);
						}
						strokeLoop(ctx, orbit, "rgba(180,198,230,0.35)", 1, .8);
					}
					ctx.fillStyle = moon ? "#d5d8e0" : planet ? "#8ec8ff" : "#b9a6ff";
					const focused = body.name === focusBody;
					ctx.beginPath();
					ctx.arc(at.x, at.y, focused ? 7 : moon ? 3.5 : 5, 0, Math.PI * 2);
					ctx.fill();
					const named = focused || planet || moon || /sun|star/i.test(body.kind);
					const crowded = !focused && namedAt.some((prev) => Math.hypot(prev.x - at.x, prev.y - at.y) < 18);
					if (named && !crowded) {
						ctx.fillStyle = focused ? "#f4f7ff" : "rgba(214,224,242,0.85)";
						ctx.font = focused ? "12px sans-serif" : "11px sans-serif";
						ctx.fillText(body.name, at.x + 8, at.y - 8);
						namedAt.push(at);
					}
					hits.push({
						id: body.name,
						x: at.x,
						y: at.y,
						depth: at.depth,
						label: body.name
					});
				}
			} else {
				ctx.fillStyle = "#9aa6bd";
				ctx.font = "14px sans-serif";
				ctx.fillText("Import Sectors.yaml to place stars in this volume.", 24, 36);
			}
			hitsRef.current = hits;
		};
		const requestDraw = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(paint);
		};
		requestDraw();
		const observer = new ResizeObserver(requestDraw);
		observer.observe(wrap);
		const onWheel = (event) => {
			event.preventDefault();
			const cam = camRef.current;
			const next = cam.dist * (event.deltaY > 0 ? 1.08 : .92);
			const cap = space === "galaxy" ? (galaxy?.outer || 1e3) * 8 : 2e4;
			cam.dist = Math.max(space === "galaxy" ? 20 : 8, Math.min(next, cap));
			requestDraw();
		};
		wrap.addEventListener("wheel", onWheel, { passive: false });
		wrap.addEventListener("volume-cam", requestDraw);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			wrap.removeEventListener("wheel", onWheel);
			wrap.removeEventListener("volume-cam", requestDraw);
		};
	}, [
		space,
		galaxy,
		systems,
		system,
		focusSystem,
		focusBody,
		zones,
		frameKey,
		layer,
		hidden
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative h-full min-h-[420px] w-full overflow-hidden rounded-md border border-border bg-[#05070d]",
		onPointerDown: (event) => {
			drag.current = {
				x: event.clientX,
				y: event.clientY,
				yaw: camRef.current.yaw,
				pitch: camRef.current.pitch,
				moved: false
			};
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		onPointerMove: (event) => {
			const start = drag.current;
			if (!start) return;
			const dx = event.clientX - start.x;
			const dy = event.clientY - start.y;
			if (Math.hypot(dx, dy) > 3) start.moved = true;
			camRef.current.yaw = start.yaw + dx * .008;
			camRef.current.pitch = Math.max(-1.2, Math.min(1.35, start.pitch + dy * .006));
			wrapRef.current?.dispatchEvent(new Event("volume-cam"));
		},
		onPointerUp: (event) => {
			const start = drag.current;
			drag.current = null;
			if (!start || start.moved) return;
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			let best = null;
			let bestD = 16;
			for (const hit of hitsRef.current) {
				const d = Math.hypot(hit.x - x, hit.y - y);
				if (d < bestD) {
					best = hit;
					bestD = d;
				}
			}
			if (!best) return;
			if (space === "galaxy") onPick?.({ system: best.id });
			else if (focusSystem) onPick?.({
				system: focusSystem,
				body: best.id
			});
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute left-3 top-3 text-[11px] uppercase tracking-[0.14em] text-[#9eb0d0]",
			children: [space === "galaxy" ? layer === "regions" ? "Region view · star regions" : layer === "territories" ? "Territory view · faction spheres" : layer === "all" ? "Combined · galaxy, regions, territories" : "Galaxy view · light years" : focusBody ? `Planet view · ${focusBody}` : `Star view · ${focusSystem || "system"}`, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block normal-case tracking-normal text-[#7f8eab]",
				children: "Drag to orbit. Scroll to zoom. Click a point to go closer."
			})]
		})]
	});
}
//#endregion
export { parseVolumeSystems as a, patchSystemStarClass as c, starTint as d, addPlayfield as i, readGalaxyVolume as l, VolumeViewport as n, patchPlayfield as o, ZONE_FALLBACK as r, patchSystemCoordinates as s, STAR_CLASS_LEGEND as t, removePlayfield as u };

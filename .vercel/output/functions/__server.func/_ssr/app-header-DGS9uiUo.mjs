import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as Download } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as beginBusy, i as APP_SUBTITLE, n as APP_NAME, o as endBusy, r as APP_SHORT } from "./router-D3n9SJMy.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as load, t as dump } from "../_libs/js-yaml.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-header-DGS9uiUo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "bg-elevated text-fg border border-border hover:bg-surface",
			ghost: "text-muted hover:text-fg hover:bg-elevated",
			danger: "border border-danger/40 text-danger hover:bg-danger/10"
		},
		size: {
			default: "h-10 px-3",
			sm: "h-8 px-2.5 text-xs",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var PAIR = {
	b: ["<strong>", "</strong>"],
	i: ["<em>", "</em>"],
	u: ["<u>", "</u>"],
	s: ["<s>", "</s>"]
};
function decodePdaEscapes(input) {
	if (!input) return "";
	return input.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\r/g, "");
}
function encodePdaEscapes(input) {
	return input.replace(/\r\n/g, "\n").replace(/\n/g, "\\n");
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripBbcode(input) {
	return decodePdaEscapes(input).replace(/\[(?:\/)?(?:c|b|i|u|s)\]/gi, "").replace(/\[(?:[0-9a-fA-F]{3,8}|-)\]/g, "").replace(/\s+/g, " ").trim();
}
function bbcodeToHtml(input, opts) {
	const src = decodePdaEscapes(input ?? "");
	let i = 0;
	let html = "";
	let colorOpen = false;
	const closeColor = () => {
		if (colorOpen) {
			html += "</span>";
			colorOpen = false;
		}
	};
	const openColor = (hex) => {
		closeColor();
		const h = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6);
		html += `<span style="color:#${h}">`;
		colorOpen = true;
	};
	while (i < src.length) {
		if (src[i] === "[") {
			const close = src.indexOf("]", i);
			if (close !== -1 && close - i <= 12) {
				const tag = src.slice(i + 1, close);
				const lower = tag.toLowerCase();
				if (lower === "c") {
					i = close + 1;
					continue;
				}
				if (lower === "/c" || lower === "-") {
					closeColor();
					i = close + 1;
					continue;
				}
				if (/^[0-9a-f]{3,8}$/i.test(tag)) {
					openColor(tag);
					i = close + 1;
					continue;
				}
				const closing = lower.startsWith("/");
				const name = closing ? lower.slice(1) : lower;
				if (PAIR[name]) {
					html += closing ? PAIR[name][1] : PAIR[name][0];
					i = close + 1;
					continue;
				}
			}
		}
		if (src[i] === "{") {
			const close = src.indexOf("}", i);
			if (close !== -1 && close - i <= 80) {
				const inner = src.slice(i + 1, close);
				if (/\.(png|jpe?g|gif|webp)$/i.test(inner)) {
					const url = opts?.imageUrl?.(inner);
					if (url && !opts?.inline) html += `<img src="${url}" alt="${escapeHtml(inner)}" />`;
					else html += escapeHtml(`{${inner}}`);
					i = close + 1;
					continue;
				}
			}
		}
		if (src[i] === "\n") {
			html += opts?.inline ? " " : "<br/>";
			i += 1;
			continue;
		}
		let j = i + 1;
		while (j < src.length && src[j] !== "[" && src[j] !== "{" && src[j] !== "\n") j += 1;
		html += escapeHtml(src.slice(i, j));
		i = j;
	}
	closeColor();
	return html;
}
function parseCsv(text) {
	const lines = splitCsvLines(text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"));
	if (!lines.length) return {
		languages: [],
		rows: {}
	};
	const header = parseCsvLine(lines[0] ?? "").map((h) => h.trim());
	const keyIdx = header.findIndex((h) => /^key$/i.test(h));
	const k = keyIdx >= 0 ? keyIdx : 0;
	const languages = header.filter((_, i) => i !== k && header[i]);
	const rows = {};
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line || !line.trim()) continue;
		const cols = parseCsvLine(line);
		const key = (cols[k] ?? "").trim();
		if (!key) continue;
		const rec = {};
		header.forEach((name, idx) => {
			if (idx === k || !name) return;
			rec[name] = decodePdaEscapes(cols[idx] ?? "");
		});
		rows[key] = rec;
	}
	return {
		languages,
		rows
	};
}
function csvLookup(csv, key, language) {
	const rec = csv.rows[key];
	if (!rec) return void 0;
	const pick = (v) => {
		if (!v || !v.trim()) return void 0;
		return decodePdaEscapes(v);
	};
	return pick(rec[language]) || pick(rec.English || rec.english || rec.EN) || csv.languages.map((lang) => pick(rec[lang])).find(Boolean);
}
function stringifyCsv(csv) {
	const langs = csv.languages.length ? csv.languages : ["English"];
	const header = ["KEY", ...langs];
	const keys = Object.keys(csv.rows);
	const lines = [header.map(csvEscape).join(",")];
	for (const key of keys) {
		const rec = csv.rows[key] ?? {};
		lines.push([key, ...langs.map((l) => rec[l] ?? "")].map(csvEscape).join(","));
	}
	return lines.join("\n") + "\n";
}
function upsertCsv(csv, key, language, value) {
	if (!csv.rows[key]) csv.rows[key] = {};
	csv.rows[key][language] = value;
	if (!csv.languages.includes(language)) csv.languages.push(language);
}
function splitCsvLines(src) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (quoted) {
			if (c === "\"") {
				if (src[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else {
					quoted = false;
					cur += c;
				}
			} else cur += c;
		} else if (c === "\"") {
			quoted = true;
			cur += c;
		} else if (c === "\n") {
			out.push(cur);
			cur = "";
		} else cur += c;
	}
	if (cur.length) out.push(cur);
	return out;
}
function parseCsvLine(line) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (quoted) {
			if (c === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else quoted = false;
			} else cur += c;
		} else if (c === "\"") quoted = true;
		else if (c === ",") {
			out.push(cur);
			cur = "";
		} else cur += c;
	}
	out.push(cur);
	return out;
}
function csvEscape(value) {
	const encoded = encodePdaEscapes(value);
	if (/[",\n]/.test(encoded)) return `"${encoded.replace(/"/g, "\"\"")}"`;
	return encoded;
}
function exportYaml(project) {
	const chapters = project.chapters.map((ch) => chapterToYaml(ch, project));
	const doc = {
		Creator: project.creator || "Axis 2026 Creator Particlewave",
		...project.extraRoot,
		Chapters: chapters
	};
	return dump(doc, {
		lineWidth: 120,
		noRefs: true
	});
}
function exportCsv(project) {
	const csv = {
		languages: project.csv.languages.length ? [...project.csv.languages] : ["English"],
		rows: { ...project.csv.rows }
	};
	const lang = project.language || csv.languages[0] || "English";
	const used = new Set(Object.keys(csv.rows));
	const put = (existingKey, prefix, text) => {
		if (existingKey) {
			upsertCsv(csv, existingKey, lang, text);
			return existingKey;
		}
		const key = slug(prefix, text, used);
		upsertCsv(csv, key, lang, text);
		return key;
	};
	for (const ch of project.chapters) {
		put(ch.titleKey, "ch_", ch.chapterTitle);
		if (ch.description) put(ch.descriptionKey, "chd_", ch.description);
		if (ch.preamble) put(ch.preambleKey, "chp_", ch.preamble);
		for (const tk of ch.tasks) {
			put(tk.titleKey, "tk_", tk.taskTitle);
			if (tk.startMessage) put(tk.startMessageKey, "tks_", tk.startMessage);
			for (const ac of tk.actions) {
				put(ac.titleKey, "ac_", ac.actionTitle);
				if (ac.description) put(ac.descriptionKey, "acd_", ac.description);
			}
		}
	}
	return stringifyCsv(csv);
}
function chapterToYaml(ch, project) {
	const node = {
		ChapterTitle: yamlString(ch.titleKey, ch.chapterTitle, project),
		Category: ch.category || "SoloMission"
	};
	if (ch.description) node.Description = yamlString(ch.descriptionKey, ch.description, project);
	if (ch.pictureFile) node.PictureFile = ch.pictureFile;
	if (ch.playerLevel) node.PlayerLevel = toNumberOrString(ch.playerLevel);
	if (ch.visibility) node.Visibility = ch.visibility;
	if (ch.autoActivateOnGameStart) node.AutoActivateOnGameStart = true;
	if (ch.hideTasks) node.HideTasks = true;
	if (ch.preamble) node.Preamble = yamlString(ch.preambleKey, ch.preamble, project);
	if (ch.completedMessage) node.CompletedMessage = ch.completedMessage;
	if (ch.activatable) node.Activatable = ch.activatable;
	if (ch.reputationLevel) node.ReputationLevel = toNumberOrString(ch.reputationLevel);
	const rewards = ch.rewards.filter((r) => r.item || r.type);
	if (rewards.length) node.Rewards = rewards.map(rewardToYaml);
	Object.assign(node, ch.extra);
	node.Tasks = ch.tasks.map((tk) => taskToYaml(tk, project));
	return node;
}
function taskToYaml(tk, project) {
	const node = { TaskTitle: yamlString(tk.titleKey, tk.taskTitle, project) };
	if (tk.headline) node.Headline = tk.headline;
	if (tk.pictureFile) node.PictureFile = tk.pictureFile;
	if (tk.startDelay) node.StartDelay = toNumberOrString(tk.startDelay);
	if (tk.startMessage) node.StartMessage = yamlString(tk.startMessageKey, tk.startMessage, project);
	Object.assign(node, tk.extra);
	node.Actions = tk.actions.map((ac) => actionToYaml(ac, project));
	return node;
}
function actionToYaml(ac, project) {
	const node = { ActionTitle: yamlString(ac.titleKey, ac.actionTitle, project) };
	if (ac.description) node.Description = yamlString(ac.descriptionKey, ac.description, project);
	if (ac.check) node.Check = ac.check;
	const names = splitList(ac.names);
	const types = splitList(ac.types);
	if (names.length) node.Names = names;
	if (types.length) node.Types = types;
	if (ac.amount !== "") node.Amount = toNumberOrString(ac.amount);
	if (ac.required) node.Required = ac.required;
	if (ac.allowManualCompletion) node.AllowManualCompletion = true;
	if (ac.completedMessage) node.CompletedMessage = ac.completedMessage;
	Object.assign(node, ac.extra);
	return node;
}
function rewardToYaml(r) {
	const node = {};
	if (r.type) node.Type = r.type;
	if (r.item) node.Item = r.item;
	node.Count = r.count || 1;
	if (r.faction) {
		const factions = splitList(r.faction);
		node.Faction = factions.length === 1 ? factions[0] : factions;
	}
	return node;
}
function yamlString(key, text, project) {
	if (key) return key;
	if (Object.keys(project.csv.rows).length === 0) return text;
	return text;
}
function splitList(value) {
	return value.split(/[,|\n]/).map((s) => s.trim()).filter(Boolean);
}
function toNumberOrString(value) {
	if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
	return value;
}
function slug(prefix, text, used) {
	const base = (text || "item").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 28) || "item";
	let key = prefix + base;
	let n = 2;
	while (used.has(key)) {
		key = `${prefix}${base}_${n}`;
		n += 1;
	}
	used.add(key);
	return key;
}
var BLOCK_START = /^\s*\{\s*(\+)?([A-Za-z][A-Za-z0-9]*)\b(.*)$/;
var NAME_FIELD = /\bName:\s*(?:"([^"]+)"|([A-Za-z0-9_+\-.]+))/;
var ID_FIELD = /\bId:\s*(\d+)/;
var PROP = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/;
function stripEcfComments(text) {
	return text.replace(/\/\*[\s\S]*?\*\//g, "\n").replace(/^\s*#.*$/gm, "");
}
function unquote(value) {
	const v = value.trim().replace(/,?\s*$/, "");
	const cdata = v.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
	if (cdata) return cdata[1] ?? "";
	if (v.startsWith("\"") && v.endsWith("\"") || v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
	return v;
}
function parseEcfObjects(text) {
	const lines = stripEcfComments(text).split(/\r?\n/);
	const out = [];
	let current = null;
	let depth = 0;
	const flush = () => {
		if (current?.name) out.push(current);
		current = null;
	};
	for (const line of lines) {
		const open = line.match(BLOCK_START);
		if (open && depth === 0) {
			const kind = open[2];
			if (kind === "Child") continue;
			const header = open[3] ?? "";
			const nameMatch = header.match(NAME_FIELD);
			const idMatch = header.match(ID_FIELD);
			current = {
				kind,
				plus: Boolean(open[1]),
				name: (nameMatch?.[1] || nameMatch?.[2] || "").trim(),
				id: idMatch?.[1],
				fields: {}
			};
			depth = 1;
			const rest = header.replace(NAME_FIELD, "").replace(ID_FIELD, "").replace(/^[\s,]+/, "");
			if (rest.trim()) {
				const extra = rest.match(PROP);
				if (extra) current.fields[extra[1]] = unquote(extra[2] ?? "");
			}
			if (/\}\s*$/.test(line) && depth === 1) {
				flush();
				depth = 0;
			}
			continue;
		}
		if (!current) continue;
		const opens = (line.match(/\{/g) || []).length;
		const closes = (line.match(/\}/g) || []).length;
		if (opens && !closes && depth >= 1) {
			depth += opens;
			continue;
		}
		if (depth === 1) {
			const prop = line.match(PROP);
			if (prop) {
				const key = prop[1];
				const value = unquote(prop[2] ?? "");
				if (key === "Name" && !current.name) current.name = value;
				else if (key === "Id" && !current.id) current.id = value;
				else current.fields[key] = value;
			}
		}
		if (closes) {
			depth = Math.max(0, depth - closes);
			if (depth === 0) flush();
		} else if (opens) depth += opens;
	}
	flush();
	return out;
}
function extractEcfRecords(text) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const obj of parseEcfObjects(text)) {
		if (!obj.name) continue;
		const key = `${obj.kind}:${obj.name}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({
			kind: obj.kind,
			name: obj.name,
			id: obj.id
		});
	}
	return out;
}
function stringifyEcfObjects(objects) {
	return objects.map((obj) => {
		const head = [`${obj.plus ? "+" : ""}${obj.kind}`];
		if (obj.id) head.push(`Id: ${obj.id}`);
		if (obj.name) head.push(`Name: ${needsQuote(obj.name) ? `"${obj.name}"` : obj.name}`);
		const lines = [`{ ${head.join(" ")}`];
		for (const [key, value] of Object.entries(obj.fields)) {
			if (value === "" || value == null) continue;
			lines.push(`  ${key}: ${needsQuote(value) || /[:(),]/.test(value) ? `"${value.replace(/"/g, "\\\"")}"` : value}`);
		}
		lines.push("}");
		return lines.join("\n");
	}).join("\n") + "\n";
}
function needsQuote(value) {
	return /\s/.test(value) || /[:#]/.test(value);
}
var BUILTIN_NAMES = /* @__PURE__ */ new Set([
	"Player",
	"Pda",
	"Inventory",
	"BASE",
	"HV",
	"SV",
	"CV",
	"GV",
	"PlayerBike",
	"PlayerInventory",
	"SurvivalTool",
	"Start",
	"Destination",
	"NeedOne",
	"NeedAll"
]);
var KIND_FROM_ECF = {
	item: "item",
	block: "block",
	entity: "entity",
	faction: "faction",
	dialogue: "dialogue",
	npcdialogue: "dialogue",
	token: "token",
	egroup: "group",
	entitygroup: "group"
};
function emptyCatalog() {
	return {
		folderName: "",
		files: [],
		entries: [],
		texts: [],
		indexedAt: 0
	};
}
function catalogLoaded(catalog) {
	return Boolean(catalog && catalog.entries.length);
}
function normalizePath(path) {
	return path.replace(/\\/g, "/").replace(/^\/+/, "");
}
function classifyScenarioPath(path, hint) {
	const p = normalizePath(path).toLowerCase();
	const base = p.split("/").pop() ?? "";
	if (base.startsWith("+backup") || p.includes("/backup/")) return null;
	if (hint === "pdaYaml" && /\.ya?ml$/.test(base) && !/sectors|playfield/.test(base)) return "pdaYaml";
	if (hint === "pdaCsv" && /\.csv$/.test(base) && base !== "localization.csv") return "pdaCsv";
	if (hint === "dialogues" && /\.ecf$/.test(base)) return "dialogues";
	if (hint === "factions" && /\.ecf$/.test(base)) return "factions";
	if (hint === "sectors" && /\.ya?ml$/.test(base) && !/playfield/.test(base)) return "sectors";
	if (hint === "localization" && /\.csv$/.test(base)) return "localization";
	if (base === "pda.yaml" || base === "pda.yml") return "pdaYaml";
	if (base === "pda.csv") return "pdaCsv";
	if (base === "localization.csv") return "localization";
	if (base === "sectors.yaml" || base === "sectors.yml") return "sectors";
	if (base === "playfield.yaml" || base === "playfield.yml") return "playfieldYaml";
	if (base === "itemsconfig.ecf") return "items";
	if (base === "blocksconfig.ecf") return "blocks";
	if (base === "eclassconfig.ecf") return "eclass";
	if (base === "factions.ecf") return "factions";
	if (base === "dialogues.ecf") return "dialogues";
	if (base === "dialogues.csv") return "dialoguesCsv";
	if (hint === "dialogues" && /\.csv$/.test(base)) return "dialoguesCsv";
	if (base === "tokenconfig.ecf") return "tokens";
	if (base === "egroupsconfig.ecf") return "egroups";
	if (base.endsWith(".ecf")) return hint === "configs" || hint === "scenario" ? "ecf" : "ecf";
	if (base.endsWith(".epb")) return "poi";
	if (/\.(png|jpe?g|webp|gif)$/.test(base)) {
		if (hint === "pdaImages" || /(?:^|\/)pda(?:\/|$)/.test(p) || /extras\/pda/.test(p)) return "picture";
		if (hint === "itemImages") return "itemPicture";
		if (isIconPath(p)) return "itemPicture";
		if (hint === "scenario") return null;
	}
	return null;
}
function isIconPath(p) {
	if (/\/playfields?\//.test(p) || /\/prefabs?\//.test(p)) return false;
	if (/(?:^|\/)(?:itemicons?|blockicons?)(?:\/|$)/.test(p)) return true;
	if (/\/bundles\/(?:itemicons?|blockicons?|icons)(?:\/|$)/.test(p)) return true;
	if (/\/shareddata\/content\/bundles\//.test(p)) return true;
	return /(?:^|\/)(?:shareddata\/)?(?:content\/)?(?:items?|itemicons|icons|blocks?)(?:\/|$)/.test(p) || /\/content\/(?:items?|blocks?|icons|bundles)\//.test(p);
}
function folderNameOf(files) {
	const top = (files[0]?.path ? normalizePath(files[0].path) : "").split("/")[0] ?? "";
	if (top && files.every((f) => normalizePath(f.path).startsWith(`${top}/`) || normalizePath(f.path) === top)) return top;
	return top || "Scenario";
}
function addEntry(bag, seen, entry) {
	const key = `${entry.kind}:${entry.name.toLowerCase()}`;
	if (seen.has(key)) return;
	seen.add(key);
	bag.push(entry);
}
function pickPda(files, role, hint) {
	const matches = files.filter((f) => classifyScenarioPath(f.path, hint) === role && f.text);
	if (!matches.length) return void 0;
	return matches.find((f) => /extras\/pda\//i.test(normalizePath(f.path))) ?? matches[0];
}
function parseSectors(text, source, bag, seen) {
	let doc;
	try {
		doc = load(text, { json: true });
	} catch {
		return 0;
	}
	let count = 0;
	const walk = (node) => {
		if (!node) return;
		if (Array.isArray(node)) {
			if (node.length >= 2 && typeof node[0] === "string" && typeof node[1] === "string") {
				const name = node[1].trim();
				if (name) {
					addEntry(bag, seen, {
						kind: "playfield",
						name,
						source
					});
					count += 1;
				}
			}
			node.forEach(walk);
			return;
		}
		if (typeof node !== "object") return;
		const rec = node;
		const named = rec.Name ?? rec.PlayfieldName ?? rec.PlanetName;
		if (typeof named === "string" && named.trim()) {
			addEntry(bag, seen, {
				kind: "playfield",
				name: named.trim(),
				source
			});
			count += 1;
		}
		Object.values(rec).forEach(walk);
	};
	walk(doc);
	return count;
}
function applyLocalization(entries, loc) {
	for (const entry of entries) {
		if (entry.label) continue;
		const keys = [
			entry.name,
			`Items_${entry.name}`,
			`item_${entry.name}`,
			`Block_${entry.name}`
		];
		for (const key of keys) {
			const label = loc[key];
			if (label) {
				entry.label = label;
				break;
			}
		}
	}
}
function indexScenario(files, hint) {
	const catalogFiles = [];
	const entries = [];
	const texts = [];
	const seen = /* @__PURE__ */ new Set();
	const loc = {};
	for (const file of files) {
		const role = classifyScenarioPath(file.path, hint);
		if (!role) continue;
		const source = normalizePath(file.path).split("/").slice(-2).join("/");
		let count = 0;
		if (role === "poi") {
			const name = (file.path.split(/[/\\]/).pop() ?? "").replace(/\.epb$/i, "");
			if (name) {
				addEntry(entries, seen, {
					kind: "poi",
					name,
					source
				});
				count = 1;
			}
		} else if (role === "picture" || role === "itemPicture") {
			const name = file.path.split(/[/\\]/).pop() ?? "";
			if (name) {
				addEntry(entries, seen, {
					kind: "picture",
					name,
					source,
					group: role === "itemPicture" ? "item" : "pda"
				});
				count = 1;
			}
		} else if (role === "playfieldYaml") {
			const parts = normalizePath(file.path).split("/");
			const folder = parts[parts.length - 2];
			if (folder && !/^playfields?$/i.test(folder)) {
				addEntry(entries, seen, {
					kind: "playfield",
					name: folder,
					source
				});
				count = 1;
			}
			if (file.text) count += parseSectors(file.text, source, entries, seen);
		} else if (role === "sectors" && file.text) count = parseSectors(file.text, source, entries, seen);
		else if (role === "localization" && file.text) {
			const table = parseCsv(file.text);
			const lang = table.languages.includes("English") ? "English" : table.languages[0];
			if (lang) for (const [key, rec] of Object.entries(table.rows)) {
				const label = rec[lang]?.trim();
				if (label) loc[key] = label;
			}
			count = Object.keys(loc).length;
		} else if (file.text && (role.endsWith("s") || role === "eclass" || role === "ecf" || role === "dialogues")) {
			const records = extractEcfRecords(file.text);
			for (const rec of records) {
				const kind = KIND_FROM_ECF[rec.kind.toLowerCase()];
				if (!kind) continue;
				addEntry(entries, seen, {
					kind,
					name: rec.name,
					source
				});
				count += 1;
			}
		}
		if (file.text && [
			"localization",
			"items",
			"blocks",
			"tokens",
			"dialogues",
			"dialoguesCsv",
			"factions",
			"eclass",
			"egroups"
		].includes(role)) texts.push({
			role,
			path: normalizePath(file.path),
			text: file.text
		});
		if (count || role === "pdaYaml" || role === "pdaCsv" || texts.some((t) => t.path === normalizePath(file.path))) catalogFiles.push({
			role,
			path: normalizePath(file.path),
			count
		});
	}
	applyLocalization(entries, loc);
	const yamlFile = pickPda(files, "pdaYaml", hint);
	const csvFile = pickPda(files, "pdaCsv", hint);
	const pda = yamlFile?.text ? {
		yamlText: yamlFile.text,
		yamlName: yamlFile.path.split(/[/\\]/).pop(),
		csvText: csvFile?.text,
		csvName: csvFile?.path.split(/[/\\]/).pop()
	} : void 0;
	return {
		catalog: {
			folderName: folderNameOf(files),
			files: catalogFiles,
			entries,
			texts,
			indexedAt: Date.now()
		},
		pda
	};
}
function catalogCounts(catalog) {
	const counts = {
		item: 0,
		block: 0,
		entity: 0,
		faction: 0,
		dialogue: 0,
		token: 0,
		group: 0,
		poi: 0,
		playfield: 0,
		picture: 0
	};
	for (const entry of catalog.entries) counts[entry.kind] += 1;
	return counts;
}
function lookupCatalog(catalog, name) {
	const needle = name.trim().toLowerCase();
	if (!needle) return void 0;
	return catalog.entries.find((e) => e.name.toLowerCase() === needle);
}
function splitTokens(value) {
	return value.split(/[,|\n]+/).map((part) => part.trim()).filter(Boolean);
}
function suggestionsFor(catalog, kinds, query, limit = 12) {
	const q = query.trim().toLowerCase();
	const pool = catalog.entries.filter((e) => {
		if (!kinds.includes(e.kind)) return false;
		if (e.kind === "picture" && e.group === "item") return false;
		return true;
	});
	if (!q) return pool.slice(0, limit);
	const compact = (s) => s.replace(/[^a-z0-9]/g, "");
	const cq = compact(q);
	return pool.map((entry) => {
		const name = entry.name.toLowerCase();
		const label = (entry.label ?? "").toLowerCase();
		const cn = compact(name);
		let score = 0;
		if (name === q) score = 100;
		else if (name.startsWith(q) || q.startsWith(name)) score = 80;
		else if (label.startsWith(q)) score = 70;
		else if (name.includes(q)) score = 50;
		else if (label.includes(q)) score = 40;
		else if (cq.length >= 3 && cn && (cn.includes(cq) || cq.includes(cn))) score = 35;
		return {
			entry,
			score
		};
	}).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name)).slice(0, limit).map((x) => x.entry);
}
function mergeCatalog(base, extra) {
	const seen = new Set(base.entries.map((e) => `${e.kind}:${e.name.toLowerCase()}:${e.group ?? ""}`));
	const entries = base.entries.map((e) => ({ ...e }));
	for (const entry of extra.entries) {
		const key = `${entry.kind}:${entry.name.toLowerCase()}:${entry.group ?? ""}`;
		const existing = entries.find((e) => e.kind === entry.kind && e.name.toLowerCase() === entry.name.toLowerCase() && (e.group ?? "") === (entry.group ?? ""));
		if (existing) {
			if (entry.label && !existing.label) existing.label = entry.label;
			continue;
		}
		seen.add(key);
		entries.push({ ...entry });
	}
	const files = [...base.files];
	for (const file of extra.files) if (!files.some((f) => f.path === file.path && f.role === file.role)) files.push(file);
	else {
		const i = files.findIndex((f) => f.path === file.path && f.role === file.role);
		if (i >= 0) files[i] = file;
	}
	const texts = [...base.texts ?? []];
	for (const text of extra.texts ?? []) {
		const i = texts.findIndex((t) => t.path === text.path && t.role === text.role);
		if (i >= 0) texts[i] = text;
		else texts.push(text);
	}
	return {
		folderName: extra.folderName || base.folderName,
		files,
		entries,
		texts,
		indexedAt: Date.now()
	};
}
function dropCatalogGroup(catalog, group) {
	return {
		...catalog,
		entries: catalog.entries.filter((e) => !(e.kind === "picture" && e.group === group)),
		indexedAt: Date.now()
	};
}
var CHECK_NAME_KINDS = {
	InventoryContains: ["item", "token"],
	ToolbarContains: ["item"],
	ItemsPickedUp: ["item"],
	ItemsConsumed: ["item"],
	ItemsCrafted: ["item"],
	ItemsUnlocked: ["item"],
	ArmorEquipped: ["item"],
	DevicePowered: ["block"],
	ConstructionQueueContains: ["block", "item"],
	BlocksPlaced: ["block"],
	BlocksRemoved: ["block"],
	BlockDestroyed: ["poi", "block"],
	NearPoi: ["poi"],
	PoiDiscovered: ["poi"],
	NearUnit: ["entity", "poi"],
	SubjectKilled: ["entity", "group"],
	PlayfieldEntered: ["playfield"],
	PlayfieldTypeEntered: ["playfield"],
	NearResource: ["item", "block"],
	ResourceDiscovered: ["item", "block"],
	Signal: ["poi"],
	WindowOpened: [],
	InventoryOpened: [],
	InventoryEmptied: []
};
var CHECK_TYPE_KINDS = {
	InventoryContains: ["item", "token"],
	ToolbarContains: ["item"],
	ItemsPickedUp: ["item"],
	ItemsConsumed: ["item"],
	ItemsCrafted: ["item"],
	ItemsUnlocked: ["item"],
	ArmorEquipped: ["item"],
	DevicePowered: ["block"],
	BlocksPlaced: ["block"],
	BlocksRemoved: ["block"],
	BlockDestroyed: ["block"],
	NearResource: ["item", "block"],
	ResourceDiscovered: ["item", "block"]
};
var CHECKS = [
	{
		id: "InventoryOpened",
		hint: "Names: inventory / device / Player"
	},
	{
		id: "InventoryEmptied",
		hint: "Names: inventory or device"
	},
	{
		id: "InventoryContains",
		hint: "Names: inventory; Types: items"
	},
	{
		id: "ToolbarContains",
		hint: "Types: items on toolbar"
	},
	{
		id: "DevicePowered",
		hint: "Names or Types: device / block"
	},
	{
		id: "ConstructionQueueContains",
		hint: "Names: constructor"
	},
	{
		id: "ItemsPickedUp",
		hint: "Types: ore / plants"
	},
	{
		id: "ItemsConsumed",
		hint: "Types: consumed items"
	},
	{
		id: "ItemsCrafted",
		hint: "Types: crafted; Names: constructor"
	},
	{
		id: "ItemsUnlocked",
		hint: "Types: unlocked items"
	},
	{
		id: "SubjectKilled",
		hint: "Names: NPC / fauna"
	},
	{
		id: "StructureSpawned",
		hint: "Names: Base, HV, SV, CV"
	},
	{
		id: "MainPowerSwitched",
		hint: "Names: Base, HV, SV, CV"
	},
	{
		id: "BlocksPlaced",
		hint: "Names: structure; Types: block"
	},
	{
		id: "BlocksRemoved",
		hint: "Names: structure; Types: block"
	},
	{
		id: "BlockDestroyed",
		hint: "Optional POI name + block type"
	},
	{
		id: "NearPoi",
		hint: "Names: POI group or filename"
	},
	{
		id: "NearUnit",
		hint: "Names: [POI, Unit]"
	},
	{
		id: "NearResource",
		hint: "Types: resource"
	},
	{
		id: "PoiDiscovered",
		hint: "Types / POI identifier"
	},
	{
		id: "ResourceDiscovered",
		hint: "Names: resource"
	},
	{
		id: "Signal",
		hint: "Names: signal* from blueprint"
	},
	{
		id: "WindowOpened",
		hint: "Names: Pda, Player, inventory window"
	},
	{
		id: "PlayfieldEntered",
		hint: "Names: playfield from Sectors.yaml"
	},
	{
		id: "PlayfieldTypeEntered",
		hint: "Names: playfield template"
	},
	{
		id: "ArmorEquipped",
		hint: "Types: armor item"
	}
];
var CHAPTER_KNOWN = /* @__PURE__ */ new Set([
	"ChapterTitle",
	"Category",
	"Description",
	"PictureFile",
	"PlayerLevel",
	"Visibility",
	"Tasks",
	"Rewards",
	"AutoActivateOnGameStart",
	"Preamble",
	"HideTasks",
	"CompletedMessage",
	"Activatable",
	"ReputationLevel"
]);
var TASK_KNOWN = /* @__PURE__ */ new Set([
	"TaskTitle",
	"Headline",
	"PictureFile",
	"StartDelay",
	"StartMessage",
	"Actions",
	"Rewards"
]);
var ACTION_KNOWN = /* @__PURE__ */ new Set([
	"ActionTitle",
	"Description",
	"Check",
	"Names",
	"Types",
	"Amount",
	"Required",
	"AllowManualCompletion",
	"CompletedMessage"
]);
function kindPresent(catalog, kinds) {
	return kinds.some((kind) => catalog.entries.some((e) => e.kind === kind));
}
function unknownIn(catalog, value, kinds) {
	if (!kinds.length || !kindPresent(catalog, kinds)) return [];
	return splitTokens(value).filter((token) => {
		if (BUILTIN_NAMES.has(token)) return false;
		const needle = token.toLowerCase();
		return !catalog.entries.some((e) => kinds.includes(e.kind) && e.name.toLowerCase() === needle);
	});
}
function nearby(catalog, token, kinds, cache) {
	if (!catalog) return [];
	const key = `${kinds.join(",")}:${token.toLowerCase()}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const names = suggestionsFor(catalog, kinds, token, 4).map((e) => e.name);
	cache.set(key, names);
	return names;
}
function replaceToken(source, from, to) {
	return splitTokens(source).map((part) => part === from ? to : part).join(", ");
}
function looksLikeSection(title) {
	const t = stripBbcode(title).trim();
	return /^\*{2,}/.test(t) || /^\[[^\]]+\]$/.test(t) || /^[-–—]{3,}/.test(t);
}
function pathOf(ch, tk, ac) {
	const parts = [ch.category || "PDA", stripBbcode(ch.chapterTitle) || "Untitled"];
	if (tk) parts.push(stripBbcode(tk.taskTitle) || "Task");
	if (ac) parts.push(stripBbcode(ac.actionTitle) || ac.check || "Action");
	return parts.join(" · ");
}
function tokenFixes(field, source, token, suggestions) {
	const fixes = suggestions.map((name) => ({
		type: "set",
		field,
		value: replaceToken(source, token, name),
		label: `Use ${name}`
	}));
	const next = splitTokens(source).filter((part) => part !== token);
	if (next.length !== splitTokens(source).length) fixes.push({
		type: "set",
		field,
		value: next.join(", "),
		label: `Drop “${token}”`
	});
	else fixes.push({
		type: "clear",
		field,
		label: `Clear ${field}`
	});
	return fixes;
}
function validateProject(project, catalog) {
	const issues = [];
	const suggestCache = /* @__PURE__ */ new Map();
	let n = 0;
	const push = (problem) => {
		n += 1;
		issues.push({
			key: `${problem.code}:${problem.id ?? "root"}:${n}`,
			...problem
		});
	};
	if (!project.chapters.length) {
		push({
			id: null,
			kind: "project",
			level: "error",
			code: "empty",
			message: "Add a chapter to start a PDA journey.",
			path: "Project",
			recommend: "review",
			suggestions: [],
			fixes: []
		});
		return issues;
	}
	const seenTitles = /* @__PURE__ */ new Map();
	project.chapters.forEach((ch, ci) => {
		const title = ch.chapterTitle.trim();
		const chPath = pathOf(ch);
		if (!title) push({
			id: ch.id,
			kind: "chapter",
			level: "error",
			code: "empty-title",
			message: `Chapter ${ci + 1} has no title.`,
			path: chPath,
			recommend: "delete",
			field: "chapterTitle",
			suggestions: [],
			fixes: [{
				type: "set",
				field: "chapterTitle",
				value: `Chapter ${ci + 1}`,
				label: "Name it Chapter " + (ci + 1)
			}, {
				type: "delete",
				label: "Delete chapter"
			}]
		});
		const dupKey = `${ch.category}::${stripBbcode(title).toLowerCase()}`;
		if (title && seenTitles.has(dupKey)) push({
			id: ch.id,
			kind: "chapter",
			level: "warning",
			code: "duplicate-title",
			message: `Duplicate chapter title “${stripBbcode(title)}”.`,
			path: chPath,
			recommend: "delete",
			suggestions: [],
			fixes: [{
				type: "delete",
				label: "Delete this copy"
			}]
		});
		else if (title) seenTitles.set(dupKey, ch.id);
		if (!ch.tasks.length) {
			const section = looksLikeSection(ch.chapterTitle) || ch.hideTasks;
			push({
				id: ch.id,
				kind: "chapter",
				level: section ? "warning" : "error",
				code: "empty-chapter",
				message: section ? `“${stripBbcode(ch.chapterTitle) || "Chapter"}” looks like a section header with no tasks.` : `“${stripBbcode(ch.chapterTitle) || "Chapter"}” has no tasks.`,
				path: chPath,
				recommend: section ? "review" : "delete",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete chapter"
				}]
			});
		}
		if (catalogLoaded(catalog) && ch.pictureFile) {
			if (unknownIn(catalog, ch.pictureFile, ["picture"]).length) {
				const suggestions = nearby(catalog, ch.pictureFile, ["picture"], suggestCache);
				push({
					id: ch.id,
					kind: "chapter",
					level: "warning",
					code: "unknown-picture",
					message: `Picture “${ch.pictureFile}” is not in Extras/PDA.`,
					path: chPath,
					recommend: suggestions.length ? "fix" : "review",
					field: "pictureFile",
					value: ch.pictureFile,
					suggestions,
					fixes: [...suggestions.map((name) => ({
						type: "set",
						field: "pictureFile",
						value: name,
						label: `Use ${name}`
					})), {
						type: "clear",
						field: "pictureFile",
						label: "Clear picture"
					}]
				});
			}
		}
		ch.rewards.forEach((reward, ri) => {
			if (!catalogLoaded(catalog)) return;
			if (reward.item) {
				if (unknownIn(catalog, reward.item, [
					"item",
					"token",
					"block"
				]).length) {
					const suggestions = nearby(catalog, reward.item, [
						"item",
						"token",
						"block"
					], suggestCache);
					const next = ch.rewards.filter((_, i) => i !== ri);
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "unknown-reward",
						message: `Reward “${reward.item}” is not in the loaded scenario items.`,
						path: chPath,
						recommend: suggestions.length ? "fix" : "delete",
						field: "rewards",
						value: reward.item,
						suggestions,
						fixes: [...suggestions.slice(0, 3).map((name) => ({
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								item: name
							} : r),
							label: `Use ${name}`
						})), {
							type: "rewards",
							rewards: next,
							label: `Remove reward ${reward.item}`
						}]
					});
				}
			}
			if (reward.faction) {
				if (unknownIn(catalog, reward.faction, ["faction"]).length) {
					const suggestions = nearby(catalog, reward.faction, ["faction"], suggestCache);
					push({
						id: ch.id,
						kind: "chapter",
						level: "warning",
						code: "unknown-faction",
						message: `Faction “${reward.faction}” is not in Factions.ecf.`,
						path: chPath,
						recommend: suggestions.length ? "fix" : "review",
						value: reward.faction,
						suggestions,
						fixes: suggestions.slice(0, 3).map((name) => ({
							type: "rewards",
							rewards: ch.rewards.map((r, i) => i === ri ? {
								...r,
								faction: name
							} : r),
							label: `Use ${name}`
						}))
					});
				}
			}
		});
		ch.tasks.forEach((tk, ti) => {
			const tkPath = pathOf(ch, tk);
			const visTitle = stripBbcode(tk.taskTitle);
			if (!tk.taskTitle.trim()) push({
				id: tk.id,
				kind: "task",
				level: "error",
				code: "empty-title",
				message: `Task ${ti + 1} in “${stripBbcode(ch.chapterTitle)}” has no title.`,
				path: tkPath,
				recommend: "delete",
				field: "taskTitle",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete task"
				}]
			});
			if (visTitle.length > 26) {
				const short = visTitle.slice(0, 26).trim();
				const hasBb = /\[[^\]]+\]/.test(tk.taskTitle);
				push({
					id: tk.id,
					kind: "task",
					level: "warning",
					code: "hud-wrap",
					message: `“${visTitle}” is ${visTitle.length} chars. HUD wraps after 26.`,
					path: tkPath,
					recommend: "fix",
					field: "taskTitle",
					value: tk.taskTitle,
					suggestions: hasBb ? [] : [short],
					fixes: hasBb ? [] : [{
						type: "set",
						field: "taskTitle",
						value: short,
						label: `Shorten to “${short}”`
					}]
				});
			}
			if (!tk.actions.length) push({
				id: tk.id,
				kind: "task",
				level: "error",
				code: "empty-task",
				message: `Task “${visTitle || "untitled"}” has no actions.`,
				path: tkPath,
				recommend: "delete",
				suggestions: [],
				fixes: [{
					type: "delete",
					label: "Delete task"
				}]
			});
			if (catalogLoaded(catalog) && tk.pictureFile) {
				if (unknownIn(catalog, tk.pictureFile, ["picture"]).length) {
					const suggestions = nearby(catalog, tk.pictureFile, ["picture"], suggestCache);
					push({
						id: tk.id,
						kind: "task",
						level: "warning",
						code: "unknown-picture",
						message: `Picture “${tk.pictureFile}” is not in Extras/PDA.`,
						path: tkPath,
						recommend: suggestions.length ? "fix" : "review",
						field: "pictureFile",
						value: tk.pictureFile,
						suggestions,
						fixes: [...suggestions.map((name) => ({
							type: "set",
							field: "pictureFile",
							value: name,
							label: `Use ${name}`
						})), {
							type: "clear",
							field: "pictureFile",
							label: "Clear picture"
						}]
					});
				}
			}
			tk.actions.forEach((ac) => {
				const acPath = pathOf(ch, tk, ac);
				const visAction = stripBbcode(ac.actionTitle);
				if (!ac.actionTitle.trim()) push({
					id: ac.id,
					kind: "action",
					level: "error",
					code: "empty-title",
					message: `An action under “${visTitle}” has no title.`,
					path: acPath,
					recommend: "delete",
					field: "actionTitle",
					suggestions: [],
					fixes: [{
						type: "delete",
						label: "Delete action"
					}]
				});
				if (visAction.length > 24) {
					const short = visAction.slice(0, 24).trim();
					const hasBb = /\[[^\]]+\]/.test(ac.actionTitle);
					push({
						id: ac.id,
						kind: "action",
						level: "warning",
						code: "hud-wrap",
						message: `“${visAction}” is ${visAction.length} chars. HUD wraps after 24.`,
						path: acPath,
						recommend: "fix",
						field: "actionTitle",
						value: ac.actionTitle,
						suggestions: hasBb ? [] : [short],
						fixes: hasBb ? [] : [{
							type: "set",
							field: "actionTitle",
							value: short,
							label: `Shorten to “${short}”`
						}]
					});
				}
				if (ac.check) {
					if (CHECKS.find((c) => c.id === ac.check)?.hint.includes("Names") && !ac.names.trim() && ac.check !== "ItemsUnlocked") push({
						id: ac.id,
						kind: "action",
						level: "warning",
						code: "missing-names",
						message: `“${visAction}” (${ac.check}) usually needs Names.`,
						path: acPath,
						recommend: "review",
						field: "names",
						suggestions: [],
						fixes: [{
							type: "delete",
							label: "Delete action"
						}]
					});
				}
				if (catalogLoaded(catalog)) {
					const nameKinds = CHECK_NAME_KINDS[ac.check] ?? [];
					const typeKinds = CHECK_TYPE_KINDS[ac.check] ?? [];
					for (const token of unknownIn(catalog, ac.names, nameKinds).slice(0, 4)) {
						const suggestions = nearby(catalog, token, nameKinds, suggestCache);
						push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "unknown-name",
							message: `“${token}” is not in the loaded scenario (${ac.check} Names).`,
							path: acPath,
							recommend: suggestions.length ? "fix" : "delete",
							field: "names",
							value: token,
							suggestions,
							fixes: [...tokenFixes("names", ac.names, token, suggestions), {
								type: "delete",
								label: "Delete action"
							}]
						});
					}
					for (const token of unknownIn(catalog, ac.types, typeKinds).slice(0, 3)) {
						const suggestions = nearby(catalog, token, typeKinds, suggestCache);
						push({
							id: ac.id,
							kind: "action",
							level: "warning",
							code: "unknown-type",
							message: `“${token}” is not in the loaded scenario (${ac.check} Types).`,
							path: acPath,
							recommend: suggestions.length ? "fix" : "delete",
							field: "types",
							value: token,
							suggestions,
							fixes: [...tokenFixes("types", ac.types, token, suggestions), {
								type: "delete",
								label: "Delete action"
							}]
						});
					}
				}
			});
		});
	});
	return issues;
}
function counts(project) {
	const tasks = project.chapters.reduce((n, c) => n + c.tasks.length, 0);
	const actions = project.chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0);
	return {
		chapters: project.chapters.length,
		tasks,
		actions
	};
}
function problemStats(issues) {
	return {
		total: issues.length,
		errors: issues.filter((i) => i.level === "error").length,
		warnings: issues.filter((i) => i.level === "warning").length,
		deletable: issues.filter((i) => i.recommend === "delete" && i.id).length
	};
}
function uid() {
	return crypto.randomUUID ? crypto.randomUUID() : `id${Math.random().toString(16).slice(2)}`;
}
function sanitizeYamlSource(src) {
	const notes = [];
	let text = src;
	if (text.charCodeAt(0) === 65279) {
		text = text.slice(1);
		notes.push({
			level: "info",
			message: "Stripped UTF-8 BOM."
		});
	}
	if (text.includes("\r")) text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	if (text.includes("	")) {
		text = text.replace(/\t/g, "  ");
		notes.push({
			level: "info",
			message: "Converted tabs to spaces."
		});
	}
	return {
		text,
		notes
	};
}
function importPda(files) {
	const started = Date.now();
	const issues = [];
	const { text, notes } = sanitizeYamlSource(files.yamlText);
	issues.push(...notes);
	let doc;
	try {
		doc = load(text, { json: true });
	} catch (err) {
		const mark = err.mark;
		const where = mark && typeof mark.line === "number" ? ` line ${mark.line + 1}${typeof mark.column === "number" ? `, column ${mark.column + 1}` : ""}` : "";
		throw new Error(`YAML parse failed${where}: ${err.message}`);
	}
	if (!doc || typeof doc !== "object") throw new Error("YAML did not contain a document object.");
	const root = doc;
	const csv = files.csvText ? parseCsv(files.csvText) : {
		languages: ["English"],
		rows: {}
	};
	if (files.csvText && csv.languages.length === 0) issues.push({
		level: "warning",
		message: "CSV parsed but no language columns were found."
	});
	const language = files.language && csv.languages.includes(files.language) ? files.language : csv.languages.includes("English") ? "English" : csv.languages[0] ?? "English";
	const chaptersIn = asArray(root.Chapters ?? root.chapters);
	if (!chaptersIn.length) issues.push({
		level: "error",
		message: "No Chapters array found in YAML."
	});
	let resolved = 0;
	const unresolvedKeys = [];
	const extraFields = /* @__PURE__ */ new Set();
	const resolve = (value) => {
		if (value == null) return { text: "" };
		const raw = String(value);
		const looked = csvLookup(csv, raw, language);
		if (looked != null) {
			resolved += 1;
			return {
				text: decodePdaEscapes(looked),
				key: raw
			};
		}
		if (looksLikeKey(raw)) {
			if (Object.keys(csv.rows).length) unresolvedKeys.push(raw);
			return {
				text: decodePdaEscapes(raw),
				key: raw
			};
		}
		return { text: decodePdaEscapes(raw) };
	};
	const chapters = chaptersIn.map((rawCh, index) => {
		const ch = asRecord(rawCh);
		if (!ch) {
			issues.push({
				level: "warning",
				message: `Chapter ${index + 1} was skipped (not an object).`
			});
			return emptyChapter(`Broken chapter ${index + 1}`);
		}
		const title = resolve(ch.ChapterTitle ?? ch.chapterTitle);
		const description = resolve(ch.Description ?? ch.description);
		const preamble = resolve(ch.Preamble);
		const extra = pickExtra(ch, CHAPTER_KNOWN, extraFields);
		const rewards = parseRewards(ch.Rewards);
		const tasks = asArray(ch.Tasks).map((rawTk, ti) => mapTask(rawTk, ti, title.text, resolve, extraFields, issues));
		if (!tasks.length) issues.push({
			level: "warning",
			message: `Chapter “${title.text || index + 1}” has no tasks.`
		});
		return {
			id: uid(),
			chapterTitle: title.text || `Chapter ${index + 1}`,
			titleKey: title.key,
			description: description.text,
			descriptionKey: description.key,
			pictureFile: str(ch.PictureFile),
			category: str(ch.Category) || "SoloMission",
			playerLevel: str(ch.PlayerLevel || 1),
			visibility: str(ch.Visibility) || "Always",
			autoActivateOnGameStart: asBool(ch.AutoActivateOnGameStart),
			hideTasks: asBool(ch.HideTasks),
			preamble: preamble.text,
			preambleKey: preamble.key,
			completedMessage: str(ch.CompletedMessage),
			activatable: str(ch.Activatable),
			reputationLevel: str(ch.ReputationLevel),
			rewards,
			tasks,
			extra
		};
	});
	const extraRoot = {};
	for (const [k, v] of Object.entries(root)) {
		if (k === "Creator" || k === "Chapters" || k === "chapters") continue;
		extraRoot[k] = v;
		extraFields.add(`root.${k}`);
	}
	if (!files.csvText) issues.push({
		level: "info",
		message: "No CSV imported. YAML keys will show as-is until you add PDA.csv."
	});
	const report = {
		yamlName: files.yamlName || "PDA.yaml",
		csvName: files.csvName || (files.csvText ? "PDA.csv" : "—"),
		chapters: chapters.length,
		tasks: chapters.reduce((n, c) => n + c.tasks.length, 0),
		actions: chapters.reduce((n, c) => n + c.tasks.reduce((m, t) => m + t.actions.length, 0), 0),
		csvKeys: Object.keys(csv.rows).length,
		languages: csv.languages,
		resolved,
		unresolvedKeys: unique(unresolvedKeys).slice(0, 40),
		extraFields: [...extraFields].sort(),
		issues,
		durationMs: Date.now() - started
	};
	const nameFromFile = (files.yamlName || "").replace(/\.(ya?ml)$/i, "") || chapters[0]?.chapterTitle || "Imported scenario";
	return {
		name: nameFromFile === "PDA" ? "Imported scenario" : nameFromFile,
		creator: str(root.Creator) || "Unknown",
		language,
		csv,
		chapters,
		extraRoot,
		lastImport: report
	};
}
function mapTask(rawTk, index, chapterTitle, resolve, extraFields, issues) {
	const tk = asRecord(rawTk);
	if (!tk) {
		issues.push({
			level: "warning",
			message: `A task under “${chapterTitle}” was not an object.`
		});
		return emptyTask(`Broken task ${index + 1}`);
	}
	const title = resolve(tk.TaskTitle ?? tk.taskTitle);
	const startMessage = resolve(tk.StartMessage);
	const extra = pickExtra(tk, TASK_KNOWN, extraFields, "task");
	const actions = asArray(tk.Actions).map((rawAc, ai) => mapAction(rawAc, ai, title.text, resolve, extraFields, issues));
	if (!actions.length) issues.push({
		level: "warning",
		message: `Task “${title.text || index + 1}” in “${chapterTitle}” has no actions.`
	});
	return {
		id: uid(),
		taskTitle: title.text || `Task ${index + 1}`,
		titleKey: title.key,
		headline: str(tk.Headline),
		pictureFile: str(tk.PictureFile),
		startDelay: str(tk.StartDelay),
		startMessage: startMessage.text,
		startMessageKey: startMessage.key,
		actions,
		extra
	};
}
function mapAction(rawAc, index, taskTitle, resolve, extraFields, issues) {
	const ac = asRecord(rawAc);
	if (!ac) {
		issues.push({
			level: "warning",
			message: `An action under “${taskTitle}” was not an object.`
		});
		return emptyAction(`Broken action ${index + 1}`);
	}
	const title = resolve(ac.ActionTitle ?? ac.actionTitle);
	const description = resolve(ac.Description ?? ac.description);
	return {
		id: uid(),
		actionTitle: title.text || `Action ${index + 1}`,
		titleKey: title.key,
		description: description.text,
		descriptionKey: description.key,
		check: str(ac.Check),
		names: listToEdit(ac.Names),
		types: listToEdit(ac.Types),
		amount: ac.Amount == null ? "" : String(ac.Amount),
		required: str(ac.Required),
		allowManualCompletion: asBool(ac.AllowManualCompletion ?? ac.AllowManuelCompletion),
		completedMessage: str(ac.CompletedMessage),
		extra: pickExtra(ac, ACTION_KNOWN, extraFields, "action")
	};
}
function parseRewards(raw) {
	return asArray(raw).map((item) => {
		const r = asRecord(item) ?? {};
		const faction = r.Faction;
		return {
			item: str(r.Item),
			type: str(r.Type),
			count: Number(r.Count ?? 1) || 1,
			faction: Array.isArray(faction) ? faction.map(String).join(", ") : str(faction)
		};
	});
}
function pickExtra(rec, known, bag, prefix = "chapter") {
	const extra = {};
	for (const [k, v] of Object.entries(rec)) {
		if (known.has(k)) continue;
		extra[k] = v;
		bag.add(`${prefix}.${k}`);
	}
	return extra;
}
function asArray(value) {
	if (Array.isArray(value)) return value;
	if (value == null) return [];
	return [value];
}
function asRecord(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return null;
}
function str(value) {
	if (value == null) return "";
	return String(value);
}
function asBool(value) {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0;
	if (typeof value === "string") return /^(true|yes|1)$/i.test(value.trim());
	return false;
}
function listToEdit(value) {
	if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join(", ");
	if (value == null) return "";
	return String(value);
}
function looksLikeKey(raw) {
	return /^(txt_|pda_|ch_|tk_|ac_|chp|tasktitle|acttitle|chptitle)/i.test(raw) || /^[A-Za-z0-9_]{4,40}$/.test(raw);
}
function unique(list) {
	return [...new Set(list)];
}
function emptyChapter(title) {
	return {
		id: uid(),
		chapterTitle: title,
		description: "",
		pictureFile: "",
		category: "SoloMission",
		playerLevel: "1",
		visibility: "Always",
		autoActivateOnGameStart: false,
		hideTasks: false,
		preamble: "",
		completedMessage: "",
		activatable: "",
		reputationLevel: "",
		rewards: [],
		tasks: [],
		extra: {}
	};
}
function emptyTask(title) {
	return {
		id: uid(),
		taskTitle: title,
		headline: "",
		pictureFile: "",
		startDelay: "",
		startMessage: "",
		actions: [],
		extra: {}
	};
}
function emptyAction(title) {
	return {
		id: uid(),
		actionTitle: title,
		description: "",
		check: "",
		names: "",
		types: "",
		amount: "",
		required: "",
		allowManualCompletion: false,
		completedMessage: "",
		extra: {}
	};
}
function newChapter() {
	const t = emptyTask("New task");
	t.actions = [emptyAction("New action")];
	return {
		...emptyChapter("New chapter"),
		tasks: [t]
	};
}
function newTask() {
	const t = emptyTask("New task");
	t.actions = [emptyAction("New action")];
	return t;
}
function newAction() {
	return emptyAction("New action");
}
function blankProject() {
	return {
		name: "Untitled scenario",
		creator: APP_NAME,
		language: "English",
		csv: {
			languages: ["English"],
			rows: {}
		},
		chapters: [],
		extraRoot: {}
	};
}
function rehydrateStrings(project) {
	const lang = project.language;
	const csv = project.csv;
	for (const ch of project.chapters) {
		if (ch.titleKey) ch.chapterTitle = csvLookup(csv, ch.titleKey, lang) || ch.chapterTitle;
		if (ch.descriptionKey) ch.description = csvLookup(csv, ch.descriptionKey, lang) || ch.description;
		if (ch.preambleKey) ch.preamble = csvLookup(csv, ch.preambleKey, lang) || ch.preamble;
		for (const tk of ch.tasks) {
			if (tk.titleKey) tk.taskTitle = csvLookup(csv, tk.titleKey, lang) || tk.taskTitle;
			if (tk.startMessageKey) tk.startMessage = csvLookup(csv, tk.startMessageKey, lang) || tk.startMessage;
			for (const ac of tk.actions) {
				if (ac.titleKey) ac.actionTitle = csvLookup(csv, ac.titleKey, lang) || ac.actionTitle;
				if (ac.descriptionKey) ac.description = csvLookup(csv, ac.descriptionKey, lang) || ac.description;
			}
		}
	}
}
function applyCsvText(project, csvText, csvName) {
	const incoming = parseCsv(csvText);
	const languages = [...project.csv.languages];
	for (const lang of incoming.languages) if (!languages.includes(lang)) languages.push(lang);
	const rows = { ...project.csv.rows };
	for (const [key, rec] of Object.entries(incoming.rows)) rows[key] = {
		...rows[key] ?? {},
		...rec
	};
	project.csv = {
		languages,
		rows
	};
	if (csvName) project.lastImport = {
		...project.lastImport ?? {
			yamlName: "—",
			csvName,
			chapters: project.chapters.length,
			tasks: 0,
			actions: 0,
			csvKeys: Object.keys(rows).length,
			languages,
			resolved: 0,
			unresolvedKeys: [],
			extraFields: [],
			issues: [],
			durationMs: 0
		},
		csvName,
		csvKeys: Object.keys(rows).length,
		languages
	};
	project.language = project.language && languages.includes(project.language) ? project.language : languages.includes("English") ? "English" : languages[0] ?? "English";
	rehydrateStrings(project);
	return project;
}
function slimCatalog(catalog) {
	return {
		folderName: catalog.folderName,
		files: catalog.files,
		entries: catalog.entries,
		texts: [],
		indexedAt: catalog.indexedAt
	};
}
function runHeavy(op, payload) {
	if (op === "index") return indexScenario(payload.files || [], payload.kind);
	if (op === "importPda") {
		if (!payload.importFiles?.yamlText) throw new Error("No PDA.yaml to parse.");
		return importPda(payload.importFiles);
	}
	if (op === "validate") {
		const issues = validateProject(payload.project, payload.catalog);
		return {
			issues,
			stats: problemStats(issues)
		};
	}
	throw new Error(`Unknown heavy op ${op}`);
}
var worker;
var seq = 0;
var pending$1 = /* @__PURE__ */ new Map();
function getWorker() {
	if (typeof window === "undefined" || typeof Worker === "undefined") return null;
	if (worker === void 0) try {
		worker = new Worker(new URL("./heavy.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (event) => {
			const job = pending$1.get(event.data.id);
			if (!job) return;
			pending$1.delete(event.data.id);
			if (event.data.ok) job.resolve(event.data.result);
			else job.reject(new Error(event.data.error));
		};
		worker.onerror = () => {
			worker?.terminate();
			worker = null;
		};
	} catch {
		worker = null;
	}
	return worker;
}
function call(op, payload) {
	beginBusy("think");
	const w = getWorker();
	const done = (run) => run.finally(() => endBusy("think"));
	if (!w) return done(Promise.resolve(runHeavy(op, payload)));
	const id = ++seq;
	return done(new Promise((resolve, reject) => {
		pending$1.set(id, {
			resolve: (value) => resolve(value),
			reject
		});
		w.postMessage({
			id,
			op,
			payload
		});
	}));
}
function indexScenarioOffthread(files, kind) {
	return call("index", {
		files: files.map((file) => ({
			path: file.path,
			text: file.text
		})),
		kind
	});
}
function importPdaOffthread(files) {
	return call("importPda", { importFiles: files });
}
function validateOffthread(project, catalog) {
	return call("validate", {
		project,
		catalog: slimCatalog(catalog)
	});
}
var DB = "pulsepda";
var STORE = "kv";
var DB_VERSION = 2;
var LEGACY_KEYS = ["pulsepda.project.v2", "pulsepda.project.v1"];
function openPdaDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
			if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
var memory = /* @__PURE__ */ new Map();
var writeTimer = null;
var pending = null;
function txGet(db, key) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
		req.onsuccess = () => {
			const value = req.result;
			resolve(typeof value === "string" ? value : value == null ? null : JSON.stringify(value));
		};
		req.onerror = () => reject(req.error);
	});
}
function txSet(db, key, value) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}
function txDel(db, key) {
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}
function dropLegacyLocal() {
	if (typeof localStorage === "undefined") return;
	for (const key of LEGACY_KEYS) try {
		localStorage.removeItem(key);
	} catch {}
}
async function flush(name, value) {
	if (typeof indexedDB === "undefined") return;
	await txSet(await openPdaDb(), name, value);
	dropLegacyLocal();
}
var durableStorage = {
	getItem: async (name) => {
		if (memory.has(name)) return memory.get(name);
		if (typeof indexedDB === "undefined") return null;
		try {
			const db = await openPdaDb();
			const fromIdb = await txGet(db, name);
			if (fromIdb != null) {
				memory.set(name, fromIdb);
				dropLegacyLocal();
				return fromIdb;
			}
			if (typeof localStorage !== "undefined") for (const key of [name, ...LEGACY_KEYS]) {
				const legacy = localStorage.getItem(key);
				if (legacy) {
					memory.set(name, legacy);
					try {
						await txSet(db, name, legacy);
					} catch {}
					dropLegacyLocal();
					return legacy;
				}
			}
		} catch {
			return memory.get(name) ?? null;
		}
		return null;
	},
	setItem: (name, value) => {
		if (memory.get(name) === value) return Promise.resolve();
		memory.set(name, value);
		pending = {
			name,
			value
		};
		const wait = value.length > 8e5 ? 1200 : value.length > 12e4 ? 700 : 280;
		return new Promise((resolve) => {
			if (writeTimer) clearTimeout(writeTimer);
			writeTimer = setTimeout(() => {
				const next = pending;
				pending = null;
				if (!next) {
					resolve();
					return;
				}
				beginBusy("save");
				flush(next.name, next.value).catch((err) => {
					console.warn("Axis 2026 Creator Particlewave could not save to IndexedDB", err);
				}).finally(() => {
					endBusy("save");
					resolve();
				});
			}, wait);
		});
	},
	removeItem: async (name) => {
		memory.delete(name);
		dropLegacyLocal();
		if (typeof indexedDB === "undefined") return;
		try {
			await txDel(await openPdaDb(), name);
		} catch {}
	}
};
var urls = /* @__PURE__ */ new Map();
var aliases = /* @__PURE__ */ new Map();
function basename(path) {
	return path.replace(/\\/g, "/").split("/").pop() || path;
}
var ICON_EXT = /\.(png|jpe?g|webp|gif)$/i;
function iconLookupKeys(name) {
	const base = basename(name).trim();
	if (!base) return [];
	const stem = base.replace(ICON_EXT, "");
	const keys = [
		base,
		stem,
		`${stem}.png`,
		`${stem}.jpg`,
		`${stem}.jpeg`,
		`${stem}.webp`,
		`${stem}.gif`
	];
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const key of keys) {
		const k = key.toLowerCase();
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(key);
	}
	return out;
}
function iconCandidates(name, fields) {
	const refs = [fields?.CustomIcon || fields?.customicon || fields?.Customicon || fields?.Icon || fields?.UnlockIcon, name].map((v) => (v || "").trim()).filter(Boolean);
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const ref of refs) for (const key of iconLookupKeys(ref)) {
		const k = key.toLowerCase();
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(key);
	}
	return out;
}
function remember(storedName) {
	for (const key of iconLookupKeys(storedName)) aliases.set(key.toLowerCase(), storedName);
}
function resolveAlias(name) {
	for (const key of iconLookupKeys(name)) {
		const mapped = aliases.get(key.toLowerCase());
		if (mapped) return mapped;
		if (urls.has(key)) return key;
	}
}
function peekImageUrl(name) {
	const mapped = resolveAlias(name);
	if (mapped && urls.has(mapped)) return urls.get(mapped);
	return urls.get(basename(name)) || urls.get(name);
}
async function putImages(files) {
	if (typeof indexedDB === "undefined" || !files.length) return [];
	const db = await openPdaDb();
	const names = [];
	await new Promise((resolve, reject) => {
		const tx = db.transaction("blobs", "readwrite");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		const store = tx.objectStore("blobs");
		for (const file of files) {
			const name = basename(file.path);
			names.push(name);
			store.put({
				name,
				set: file.set,
				path: file.path,
				blob: file.blob
			}, name);
			const prev = urls.get(name);
			if (prev) URL.revokeObjectURL(prev);
			urls.set(name, URL.createObjectURL(file.blob));
			remember(name);
		}
	});
	return names;
}
async function getImageUrl(name) {
	const hit = peekImageUrl(name);
	if (hit) return hit;
	if (typeof indexedDB === "undefined") return null;
	try {
		await warmImageCache();
		const warmed = peekImageUrl(name);
		if (warmed) return warmed;
		const db = await openPdaDb();
		const rec = await new Promise((resolve, reject) => {
			const req = db.transaction("blobs", "readonly").objectStore("blobs").get(basename(name));
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		if (!rec?.blob) return null;
		const url = URL.createObjectURL(rec.blob);
		urls.set(rec.name, url);
		remember(rec.name);
		return url;
	} catch {
		return null;
	}
}
async function resolveIconUrl(names) {
	for (const name of names) {
		if (!name) continue;
		const url = await getImageUrl(name);
		if (url) return url;
	}
	return null;
}
async function listImages(set) {
	if (typeof indexedDB === "undefined") return [];
	const db = await openPdaDb();
	const all = await new Promise((resolve, reject) => {
		const req = db.transaction("blobs", "readonly").objectStore("blobs").getAll();
		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => reject(req.error);
	});
	return set ? all.filter((img) => img.set === set) : all;
}
async function clearImages(set) {
	if (typeof indexedDB === "undefined") return;
	const db = await openPdaDb();
	if (!set) {
		for (const url of urls.values()) URL.revokeObjectURL(url);
		urls.clear();
		aliases.clear();
		await new Promise((resolve, reject) => {
			const req = db.transaction("blobs", "readwrite").objectStore("blobs").clear();
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
		return;
	}
	const keep = await listImages();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("blobs", "readwrite");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		const store = tx.objectStore("blobs");
		for (const img of keep) {
			if (img.set !== set) continue;
			store.delete(img.name);
			const url = urls.get(img.name);
			if (url) URL.revokeObjectURL(url);
			urls.delete(img.name);
			for (const [alias, target] of [...aliases.entries()]) if (target === img.name) aliases.delete(alias);
		}
	});
}
async function warmImageCache() {
	const all = await listImages();
	for (const img of all) {
		remember(img.name);
		if (urls.has(img.name) || !img.blob) continue;
		urls.set(img.name, URL.createObjectURL(img.blob));
	}
}
function findContext(project, id) {
	if (!id) return null;
	for (let ci = 0; ci < project.chapters.length; ci++) {
		const chapter = project.chapters[ci];
		if (chapter.id === id) return {
			kind: "chapter",
			ci,
			chapter
		};
		for (let ti = 0; ti < chapter.tasks.length; ti++) {
			const task = chapter.tasks[ti];
			if (task.id === id) return {
				kind: "task",
				ci,
				ti,
				chapter,
				task
			};
			for (let ai = 0; ai < task.actions.length; ai++) {
				const action = task.actions[ai];
				if (action.id === id) return {
					kind: "action",
					ci,
					ti,
					ai,
					chapter,
					task,
					action
				};
			}
		}
	}
	return null;
}
function retag(value) {
	const walk = (node) => {
		if (Array.isArray(node)) return node.map(walk);
		if (node && typeof node === "object") {
			const copy = {};
			for (const [k, v] of Object.entries(node)) copy[k] = k === "id" ? crypto.randomUUID() : walk(v);
			return copy;
		}
		return node;
	};
	return walk(value);
}
var usePdaStore = create()(persist((set, get) => ({
	project: blankProject(),
	catalog: emptyCatalog(),
	selected: null,
	query: "",
	category: "all",
	collapsed: [],
	importOpen: false,
	setQuery: (query) => set({ query }),
	setLanguage: (language) => set((s) => {
		const proj = structuredClone(s.project);
		proj.language = language;
		for (const ch of proj.chapters) {
			if (ch.titleKey) ch.chapterTitle = csvLookup(proj.csv, ch.titleKey, language) || ch.chapterTitle;
			if (ch.descriptionKey) ch.description = csvLookup(proj.csv, ch.descriptionKey, language) || ch.description;
			if (ch.preambleKey) ch.preamble = csvLookup(proj.csv, ch.preambleKey, language) || ch.preamble;
			for (const tk of ch.tasks) {
				if (tk.titleKey) tk.taskTitle = csvLookup(proj.csv, tk.titleKey, language) || tk.taskTitle;
				if (tk.startMessageKey) tk.startMessage = csvLookup(proj.csv, tk.startMessageKey, language) || tk.startMessage;
				for (const ac of tk.actions) {
					if (ac.titleKey) ac.actionTitle = csvLookup(proj.csv, ac.titleKey, language) || ac.actionTitle;
					if (ac.descriptionKey) ac.description = csvLookup(proj.csv, ac.descriptionKey, language) || ac.description;
				}
			}
		}
		return { project: proj };
	}),
	setCategory: (category) => set({ category }),
	select: (selected) => set({ selected }),
	toggleCollapsed: (id) => set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((x) => x !== id) : [...s.collapsed, id] })),
	setImportOpen: (importOpen) => set({ importOpen }),
	replaceProject: (project) => set({
		project,
		selected: null,
		collapsed: project.chapters.map((c) => c.id)
	}),
	importFiles: (files) => {
		importPdaOffthread(files).then((project) => get().replaceProject(project));
	},
	importScenario: (files) => {
		get().ingestSources("scenario", files);
	},
	ingestSources: async (kind, files) => {
		if (!files.length) throw new Error("No matching files in that drop.");
		const indexed = await indexScenarioOffthread(files, kind);
		const imageFiles = files.filter((file) => {
			const role = classifyScenarioPath(file.path, kind);
			return (role === "picture" || role === "itemPicture") && file.blob;
		});
		if (imageFiles.length) await putImages(imageFiles.map((file) => ({
			path: file.path,
			blob: file.blob,
			set: classifyScenarioPath(file.path, kind) === "itemPicture" ? "item" : "pda"
		})));
		const catalog = mergeCatalog(get().catalog, indexed.catalog);
		const csvOnly = kind === "pdaCsv" || kind !== "scenario" && kind !== "pdaYaml" && indexed.pda?.csvText && !indexed.pda.yamlText;
		if (kind === "pdaCsv" || csvOnly) {
			const csvText = indexed.pda?.csvText || files.find((f) => classifyScenarioPath(f.path, kind) === "pdaCsv")?.text;
			if (!csvText) throw new Error("No PDA.csv in that drop.");
			const project = structuredClone(get().project);
			applyCsvText(project, csvText, indexed.pda?.csvName);
			set({
				project,
				catalog
			});
			return `Merged ${Object.keys(project.csv.rows).length} CSV keys.`;
		}
		if (indexed.pda?.yamlText) {
			const existingCsv = !indexed.pda.csvText && Object.keys(get().project.csv.rows).length ? stringifyCsv(get().project.csv) : indexed.pda.csvText;
			const project = await importPdaOffthread({
				yamlText: indexed.pda.yamlText,
				yamlName: indexed.pda.yamlName,
				csvText: existingCsv,
				csvName: indexed.pda.csvName
			});
			if (catalog.folderName && (project.name === "Imported scenario" || project.name === "PDA")) project.name = catalog.folderName;
			get().replaceProject(project);
			set({ catalog });
			return `Loaded ${project.chapters.length} chapters from ${indexed.pda.yamlName || "PDA.yaml"}.`;
		}
		if (kind === "pdaYaml") throw new Error("No PDA.yaml found.");
		set({ catalog });
		const added = indexed.catalog.files.length;
		const pics = imageFiles.length;
		return `Indexed ${added} file${added === 1 ? "" : "s"}${pics ? ` · ${pics} images stored` : ""}.`;
	},
	clearImageSet: async (imageSet) => {
		await clearImages(imageSet);
		set({ catalog: dropCatalogGroup(get().catalog, imageSet) });
	},
	setCatalog: (catalog) => set({ catalog }),
	setCatalogText: (role, text, path) => set((s) => {
		const texts = [...s.catalog.texts ?? []];
		const i = texts.findIndex((t) => t.role === role);
		if (i >= 0) texts[i] = {
			...texts[i],
			text,
			path: path || texts[i].path
		};
		else texts.push({
			role,
			path: path || role,
			text
		});
		const files = [...s.catalog.files];
		if (!files.some((f) => f.role === role)) files.push({
			role,
			path: path || role,
			count: 1
		});
		return { catalog: {
			...s.catalog,
			texts,
			files,
			indexedAt: Date.now()
		} };
	}),
	patchChapter: (id, patch) => set((s) => ({ project: {
		...s.project,
		chapters: s.project.chapters.map((c) => c.id === id ? {
			...c,
			...patch
		} : c)
	} })),
	updateSelected: (mut) => set((s) => {
		const next = structuredClone(s.project);
		mut(next);
		return { project: next };
	}),
	addChapter: (category) => set((s) => {
		const ch = newChapter();
		if (category) ch.category = category;
		else if (s.category && s.category !== "all") ch.category = s.category;
		return {
			project: {
				...s.project,
				chapters: [...s.project.chapters, ch]
			},
			selected: {
				kind: "chapter",
				id: ch.id
			},
			collapsed: s.collapsed.filter((id) => id !== ch.id && id !== `cat:${ch.category}`)
		};
	}),
	addTask: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id) ?? { chapter: s.project.chapters[0] };
		if (!("chapter" in ctx) || !ctx.chapter) {
			const ch = newChapter();
			return {
				project: {
					...s.project,
					chapters: [...s.project.chapters, ch]
				},
				selected: {
					kind: "chapter",
					id: ch.id
				}
			};
		}
		const tk = newTask();
		const chapters = s.project.chapters.map((c) => c.id === ctx.chapter.id ? {
			...c,
			tasks: [...c.tasks, tk]
		} : c);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "task",
				id: tk.id
			}
		};
	}),
	addAction: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		const task = ctx && "task" in ctx ? ctx.task : ctx?.chapter.tasks.at(-1);
		const chapter = ctx?.chapter ?? s.project.chapters[0];
		if (!task || !chapter) return s;
		const ac = newAction();
		const chapters = s.project.chapters.map((c) => c.id === chapter.id ? {
			...c,
			tasks: c.tasks.map((t) => t.id === task.id ? {
				...t,
				actions: [...t.actions, ac]
			} : t)
		} : c);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "action",
				id: ac.id
			}
		};
	}),
	duplicateSelected: () => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		if (!ctx) return s;
		const chapters = s.project.chapters.map((c) => ({
			...c,
			tasks: c.tasks.map((t) => ({
				...t,
				actions: [...t.actions]
			}))
		}));
		if (ctx.kind === "chapter") {
			const copy = retag(ctx.chapter);
			copy.chapterTitle += " copy";
			chapters.splice(ctx.ci + 1, 0, copy);
			return {
				project: {
					...s.project,
					chapters
				},
				selected: {
					kind: "chapter",
					id: copy.id
				}
			};
		}
		if (ctx.kind === "task") {
			const copy = retag(ctx.task);
			copy.taskTitle += " copy";
			chapters[ctx.ci].tasks.splice(ctx.ti + 1, 0, copy);
			return {
				project: {
					...s.project,
					chapters
				},
				selected: {
					kind: "task",
					id: copy.id
				}
			};
		}
		const copy = retag(ctx.action);
		copy.actionTitle += " copy";
		chapters[ctx.ci].tasks[ctx.ti].actions.splice(ctx.ai + 1, 0, copy);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: {
				kind: "action",
				id: copy.id
			}
		};
	}),
	deleteSelected: () => {
		const id = get().selected?.id;
		if (id) get().deleteNodes([id]);
	},
	deleteNodes: (ids) => set((s) => {
		const drop = new Set(ids);
		if (!drop.size) return s;
		const selectedId = s.selected?.id;
		const chapters = s.project.chapters.filter((c) => !drop.has(c.id)).map((c) => ({
			...c,
			tasks: c.tasks.filter((t) => !drop.has(t.id)).map((t) => ({
				...t,
				actions: t.actions.filter((a) => !drop.has(a.id))
			}))
		}));
		const still = selectedId && findContext({
			...s.project,
			chapters
		}, selectedId);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: still ? s.selected : null
		};
	}),
	patchNode: (id, patch) => set((s) => {
		const ctx = findContext(s.project, id);
		if (!ctx) return s;
		const chapters = s.project.chapters.map((c) => {
			if (ctx.kind === "chapter" && c.id === id) return {
				...c,
				...patch
			};
			if (c.id !== ctx.chapter.id) return c;
			return {
				...c,
				tasks: c.tasks.map((t) => {
					if (ctx.kind === "task" && t.id === id) return {
						...t,
						...patch
					};
					if (ctx.kind !== "action" || t.id !== ctx.task.id) return t;
					return {
						...t,
						actions: t.actions.map((a) => a.id === id ? {
							...a,
							...patch
						} : a)
					};
				})
			};
		});
		return { project: {
			...s.project,
			chapters
		} };
	}),
	applyBulk: (patches, deleteIds = []) => set((s) => {
		const drop = new Set(deleteIds);
		const map = new Map(patches.map((p) => [p.id, p.patch]));
		if (!drop.size && !map.size) return s;
		const chapters = s.project.chapters.filter((c) => !drop.has(c.id)).map((c) => {
			const chapter = map.has(c.id) ? {
				...c,
				...map.get(c.id)
			} : c;
			return {
				...chapter,
				tasks: chapter.tasks.filter((t) => !drop.has(t.id)).map((t) => {
					const task = map.has(t.id) ? {
						...t,
						...map.get(t.id)
					} : t;
					return {
						...task,
						actions: task.actions.filter((a) => !drop.has(a.id)).map((a) => map.has(a.id) ? {
							...a,
							...map.get(a.id)
						} : a)
					};
				})
			};
		});
		const selectedId = s.selected?.id;
		const still = selectedId && findContext({
			...s.project,
			chapters
		}, selectedId);
		return {
			project: {
				...s.project,
				chapters
			},
			selected: still ? s.selected : null
		};
	}),
	jumpTo: (id) => set((s) => {
		const ctx = findContext(s.project, id);
		if (!ctx) return s;
		const catId = `cat:${ctx.chapter.category || "Uncategorized"}`;
		let collapsed = s.collapsed.filter((x) => x !== ctx.chapter.id && x !== catId);
		if (ctx.kind === "task" || ctx.kind === "action") {
			const openId = `open:${ctx.task.id}`;
			if (!collapsed.includes(openId)) collapsed = [...collapsed, openId];
		}
		return {
			selected: {
				kind: ctx.kind,
				id: ctx.kind === "chapter" ? ctx.chapter.id : ctx.kind === "task" ? ctx.task.id : ctx.action.id
			},
			collapsed
		};
	}),
	moveSelected: (dir) => set((s) => {
		const ctx = findContext(s.project, s.selected?.id);
		if (!ctx) return s;
		const swap = (arr, i) => {
			const j = i + dir;
			if (j < 0 || j >= arr.length) return arr;
			const copy = [...arr];
			[copy[i], copy[j]] = [copy[j], copy[i]];
			return copy;
		};
		let chapters = s.project.chapters;
		if (ctx.kind === "chapter") chapters = swap(chapters, ctx.ci);
		if (ctx.kind === "task") chapters = chapters.map((c, i) => i === ctx.ci ? {
			...c,
			tasks: swap(c.tasks, ctx.ti)
		} : c);
		if (ctx.kind === "action") chapters = chapters.map((c, i) => i === ctx.ci ? {
			...c,
			tasks: c.tasks.map((t, ti) => ti === ctx.ti ? {
				...t,
				actions: swap(t.actions, ctx.ai)
			} : t)
		} : c);
		return { project: {
			...s.project,
			chapters
		} };
	}),
	reset: () => set({
		project: blankProject(),
		catalog: emptyCatalog(),
		selected: null,
		collapsed: []
	})
}), {
	name: "pulsepda.project.v3",
	storage: createJSONStorage(() => durableStorage),
	partialize: (s) => ({
		project: s.project,
		catalog: s.catalog,
		selected: s.selected,
		collapsed: s.collapsed,
		category: s.category
	}),
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		return {
			...current,
			...saved,
			catalog: saved.catalog ?? emptyCatalog(),
			project: saved.project ?? current.project
		};
	},
	onRehydrateStorage: () => {
		beginBusy("load");
		return () => {
			endBusy("load");
			warmImageCache();
		};
	}
}));
function selectedContext(project, selected) {
	return findContext(project, selected?.id);
}
var emptyStats = problemStats([]);
function useProblems() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const [issues, setIssues] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)(emptyStats);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setBusy(true);
		const timer = window.setTimeout(() => {
			validateOffthread(project, catalog).then((result) => {
				if (cancelled) return;
				setIssues(result.issues);
				setStats(result.stats);
			}).finally(() => {
				if (!cancelled) setBusy(false);
			});
		}, 220);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [project, catalog]);
	return {
		issues,
		stats,
		busy
	};
}
function download(name, text, type) {
	const blob = new Blob([text], { type });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
function AppHeader() {
	const project = usePdaStore((s) => s.project);
	const setLanguage = usePdaStore((s) => s.setLanguage);
	const n = counts(project);
	const languages = project.csv.languages;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3 px-3 py-2 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-8 place-items-center rounded-sm border border-border bg-elevated text-[10px] font-medium tracking-wide",
						children: "AX"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium leading-none tracking-tight",
						children: APP_SHORT
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: APP_SUBTITLE
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "ml-auto flex min-w-0 items-center gap-2 text-xs text-muted",
					children: ["PDA Language", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-8 max-w-36 rounded-sm border border-border bg-bg px-2 text-sm text-fg sm:max-w-none",
						value: project.language,
						onChange: (e) => setLanguage(e.target.value),
						children: (languages.length ? languages : [project.language || "English"]).map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: lang }, lang))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !n.chapters,
							onClick: () => download("PDA.yaml", exportYaml(project), "text/yaml"),
							children: "Export YAML"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !n.chapters,
							onClick: () => download("PDA.csv", exportCsv(project), "text/csv"),
							children: "Export CSV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !n.chapters,
							onClick: () => {
								download("PDA.yaml", exportYaml(project), "text/yaml");
								download("PDA.csv", exportCsv(project), "text/csv");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Both"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {})]
	});
}
function AppNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { stats } = useProblems();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "grid grid-cols-5 border-t border-border",
		children: [
			{
				to: "/",
				label: "PDA"
			},
			{
				to: "/dialogues",
				label: "Dialogues"
			},
			{
				to: "/import",
				label: "Import"
			},
			{
				to: "/library",
				label: "Library"
			},
			{
				to: "/debug",
				label: "Debug"
			}
		].map((item) => {
			const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				className: `relative flex h-9 min-w-0 items-center justify-center gap-1 px-1 text-xs tracking-wide sm:gap-2 sm:text-sm ${active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/40 hover:text-fg"}`,
				children: [
					item.label,
					item.to === "/debug" && stats.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `tabular-nums text-xs ${stats.errors ? "text-danger" : "text-warn"}`,
						children: stats.total
					}) : null,
					active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 bottom-0 h-px bg-accent" }) : null
				]
			}, item.to);
		})
	});
}
//#endregion
export { upsertCsv as A, resolveIconUrl as C, stringifyEcfObjects as D, stringifyCsv as E, useProblems as M, validateProject as N, stripBbcode as O, warmImageCache as P, problemStats as S, splitTokens as T, lookupCatalog as _, CHECK_NAME_KINDS as a, parseEcfObjects as b, catalogCounts as c, cn as d, counts as f, iconCandidates as g, getImageUrl as h, CHECKS as i, usePdaStore as j, suggestionsFor as k, catalogLoaded as l, decodePdaEscapes as m, BUILTIN_NAMES as n, CHECK_TYPE_KINDS as o, csvLookup as p, Button as r, bbcodeToHtml as s, AppHeader as t, classifyScenarioPath as u, normalizePath as v, selectedContext as w, peekImageUrl as x, parseCsv as y };

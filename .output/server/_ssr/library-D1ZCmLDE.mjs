import { E as stringifyCsv, b as parseEcfObjects, p as csvLookup, y as parseCsv } from "./app-header-DASzD0Jg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-D1ZCmLDE.js
var OPTION = /^Option_(\d+)$/;
var OPTION_NEXT = /^OptionNext_(\d+)$/;
var OPTION_IF = /^OptionIf_(\d+)$/;
var OPTION_EX = /^OptionExecute_(\d+)$/;
var NEXT = /^Next_(\d+)$/;
var NEXT_IF = /^NextIf_(\d+)$/;
var EXECUTE = /^Execute_(\d+)$/;
var VARIABLE = /^Variable_(\d+)$/;
var VAR_TYPES = [
	"int",
	"dbstate_int",
	"dbplayer_int",
	"dbglobal_int",
	"dbglobalpf_int",
	"dbplayerpoi_int",
	"dbplayerpf_int",
	"dbplayerpfpoi_int",
	"dbglobalpoi_int",
	"dbstate_string",
	"dbplayer_string",
	"dbglobal_string",
	"dbglobalpoi_string"
];
var SNIPPETS = [
	{
		label: "End",
		insert: "End"
	},
	{
		label: "AddItem",
		insert: "AddItem('GoldCoins', 1)"
	},
	{
		label: "RemoveItem",
		insert: "RemoveItem('GoldCoins', 1)"
	},
	{
		label: "HasItem",
		insert: "HasItem('GoldCoins', 1)"
	},
	{
		label: "GetReputation",
		insert: "GetReputation(Faction.Talon) < Reputation.FriendlyMin"
	},
	{
		label: "AddReputation",
		insert: "AddReputation(Faction.Talon, 10)"
	},
	{
		label: "OpenTraderWindow",
		insert: "OpenTraderWindow()"
	},
	{
		label: "IsPdaChapterActive",
		insert: "IsPdaChapterActive('ChapterTitle')"
	},
	{
		label: "IsPdaTaskActive",
		insert: "IsPdaTaskActive('TaskTitle')"
	},
	{
		label: "SetNPCName",
		insert: "SetNPCName('Name')"
	},
	{
		label: "SetSignal",
		insert: "SetSignal('SignalName', true)"
	},
	{
		label: "IsSignalSet",
		insert: "IsSignalSet('SignalName')"
	},
	{
		label: "OpenHtmlWindow",
		insert: "OpenHtmlWindow('https://')"
	},
	{
		label: "AddItemsFromContainer",
		insert: "AddItemsFromContainer('ContainerName')"
	},
	{
		label: "UnlockTechTreeItem",
		insert: "UnlockTechTreeItem('ItemName')"
	},
	{
		label: "CallLater",
		insert: "CallLater(5, FunctionName)"
	},
	{
		label: "GotoAndReset",
		insert: "GotoAndReset:State_Init"
	},
	{
		label: "{PlayerName}",
		insert: "{PlayerName}"
	},
	{
		label: "{NPCName}",
		insert: "{NPCName}"
	}
];
function parseVariableValue(value) {
	const match = value.match(/^"?([^,"]+)"?\s*,?\s*(?:param1:\s*(.+))?$/i);
	if (!match) return {
		name: value.replace(/"/g, "").trim(),
		param1: ""
	};
	return {
		name: (match[1] ?? "").trim(),
		param1: (match[2] ?? "").trim()
	};
}
function objectToDialogue(obj) {
	const fields = { ...obj.fields };
	const npcName = fields.NPCName ?? "";
	const output = fields.Output ?? "";
	const comment = fields.Comment ?? "";
	const barkingState = fields.BarkingState ?? "";
	const requiredStates = fields.RequiredStates ?? "";
	delete fields.NPCName;
	delete fields.Output;
	delete fields.Comment;
	delete fields.BarkingState;
	delete fields.RequiredStates;
	const optionIdx = /* @__PURE__ */ new Set();
	const nextIdx = /* @__PURE__ */ new Set();
	const varIdx = /* @__PURE__ */ new Set();
	for (const key of Object.keys(fields)) {
		const o = key.match(OPTION) || key.match(OPTION_NEXT) || key.match(OPTION_IF) || key.match(OPTION_EX);
		if (o) optionIdx.add(Number(o[1]));
		const n = key.match(NEXT) || key.match(NEXT_IF);
		if (n) nextIdx.add(Number(n[1]));
		const e = key.match(EXECUTE);
		if (e) nextIdx.add(Number(e[1]));
		const v = key.match(VARIABLE);
		if (v) varIdx.add(Number(v[1]));
	}
	const variables = [...varIdx].sort((a, b) => a - b).map((index) => {
		const parsed = parseVariableValue(fields[`Variable_${index}`] ?? "");
		delete fields[`Variable_${index}`];
		return {
			index,
			name: parsed.name,
			param1: parsed.param1
		};
	});
	const options = [...optionIdx].sort((a, b) => a - b).map((index) => {
		const text = fields[`Option_${index}`] ?? "";
		const next = fields[`OptionNext_${index}`] ?? "";
		const iff = fields[`OptionIf_${index}`] ?? "";
		const execute = fields[`OptionExecute_${index}`] ?? "";
		delete fields[`Option_${index}`];
		delete fields[`OptionNext_${index}`];
		delete fields[`OptionIf_${index}`];
		delete fields[`OptionExecute_${index}`];
		return {
			index,
			text,
			next,
			iff,
			execute
		};
	});
	const nexts = [...nextIdx].sort((a, b) => a - b).map((index) => {
		const next = fields[`Next_${index}`] ?? "";
		const iff = fields[`NextIf_${index}`] ?? "";
		const execute = fields[`Execute_${index}`] ?? "";
		delete fields[`Next_${index}`];
		delete fields[`NextIf_${index}`];
		delete fields[`Execute_${index}`];
		return {
			index,
			next,
			iff,
			execute
		};
	});
	return {
		name: obj.name,
		npcName,
		output,
		comment,
		barkingState,
		requiredStates,
		variables,
		fields,
		options,
		nexts
	};
}
function quoteEcf(value) {
	if (value === "") return "\"\"";
	if (/[\s,#:]/.test(value) || /[()"']/.test(value)) return `"${value.replace(/"/g, "\\\"")}"`;
	return value;
}
function serializeDialogues(states) {
	return states.map((state) => {
		const lines = [`{ +Dialogue Name: ${quoteEcf(state.name)}`];
		if (state.npcName) lines.push(`  NPCName: ${quoteEcf(state.npcName)}`);
		if (state.comment) lines.push(`  Comment: ${quoteEcf(state.comment)}`);
		if (state.barkingState) lines.push(`  BarkingState: ${state.barkingState}`);
		if (state.requiredStates) lines.push(`  RequiredStates: ${quoteEcf(state.requiredStates)}`);
		for (const variable of state.variables) {
			if (!variable.name) continue;
			const param = variable.param1 ? `, param1: ${variable.param1}` : "";
			lines.push(`  Variable_${variable.index}: "${variable.name}"${param}`);
		}
		if (state.output) lines.push(`  Output: ${quoteEcf(state.output)}`);
		for (const n of state.nexts) {
			if (n.next) lines.push(`  Next_${n.index}: ${n.next}`);
			if (n.iff) lines.push(`  NextIf_${n.index}: ${quoteEcf(n.iff)}`);
			if (n.execute) lines.push(emitCode(`Execute_${n.index}`, n.execute));
		}
		for (const opt of state.options) {
			if (opt.text) lines.push(`  Option_${opt.index}: ${quoteEcf(opt.text)}`);
			if (opt.next) lines.push(`  OptionNext_${opt.index}: ${opt.next}`);
			if (opt.iff) lines.push(`  OptionIf_${opt.index}: ${quoteEcf(opt.iff)}`);
			if (opt.execute) lines.push(emitCode(`OptionExecute_${opt.index}`, opt.execute));
		}
		for (const [key, value] of Object.entries(state.fields)) if (value) lines.push(`  ${key}: ${quoteEcf(value)}`);
		lines.push("}");
		return lines.join("\n");
	}).join("\n") + "\n";
}
function dialogueGroup(state) {
	const cut = state.name.indexOf("_");
	if (cut > 0) return state.name.slice(0, cut);
	if (state.npcName.trim()) return state.npcName.trim();
	return "Ungrouped";
}
function looksLikeKey(value) {
	const v = value.trim();
	if (!v || /\s/.test(v) || v.length < 3) return false;
	return /^(txt_|dlg|dialogue_|ch_|task_|opt_)/i.test(v) || /^[A-Za-z][A-Za-z0-9_]*$/.test(v);
}
function resolveDialogueText(value, loca, pda, language = "English") {
	if (!value) return "";
	if (!looksLikeKey(value)) return value;
	return loca && csvLookup(loca, value, language) || pda && csvLookup(pda, value, language) || value;
}
function blankDialogue(name = "NewDialogue") {
	return {
		name,
		npcName: "",
		output: "Hello.",
		comment: "",
		barkingState: "",
		requiredStates: "",
		variables: [],
		fields: {},
		options: [{
			index: 1,
			text: "Goodbye",
			next: "End",
			iff: "",
			execute: ""
		}],
		nexts: []
	};
}
function emitCode(key, value) {
	return `  ${key}: <![CDATA[${value}]]>`;
}
function parseDialogueDoc(text) {
	const objects = parseEcfObjects(text);
	return {
		states: objects.filter((obj) => /dialogue/i.test(obj.kind) && obj.name).map(objectToDialogue),
		functions: objects.filter((obj) => /function/i.test(obj.kind) && obj.name).map((obj) => ({
			name: obj.name,
			execute: obj.fields.Execute || obj.fields.Code || "",
			comment: obj.fields.Comment || ""
		}))
	};
}
function serializeDialogueDoc(doc) {
	const fns = doc.functions.filter((fn) => fn.name).map((fn) => {
		const lines = [`{ +Function Name: ${quoteEcf(fn.name)}`];
		if (fn.comment) lines.push(`  Comment: ${quoteEcf(fn.comment)}`);
		if (fn.execute) lines.push(emitCode("Execute", fn.execute));
		lines.push("}");
		return lines.join("\n");
	});
	return `${serializeDialogues(doc.states)}${fns.length ? fns.join("\n") + "\n" : ""}`;
}
function reindex(rows) {
	return rows.map((row, i) => ({
		...row,
		index: i + 1
	}));
}
function isGotoReset(next) {
	return /^GotoAndReset:/i.test(next.trim());
}
function gotoTarget(next) {
	return next.trim().replace(/^GotoAndReset:/i, "");
}
function setGoto(next, on) {
	const target = gotoTarget(next) || "State_Init";
	return on ? `GotoAndReset:${target}` : target;
}
function blankFunction(name = "NewFunction") {
	return {
		name,
		execute: "",
		comment: ""
	};
}
function uniqueDialogueName(states, base) {
	if (!states.some((s) => s.name === base)) return base;
	let n = 2;
	while (states.some((s) => s.name === `${base}_${n}`)) n += 1;
	return `${base}_${n}`;
}
function rewriteNext(value, map) {
	if (!value) return value;
	if (isGotoReset(value)) {
		const t = gotoTarget(value);
		return `GotoAndReset:${map.get(t) ?? t}`;
	}
	return map.get(value) ?? value;
}
function mergeForeignDialogues(base, extra, prefix, selected) {
	const pick = extra.states.filter((s) => selected.includes(s.name));
	const map = /* @__PURE__ */ new Map();
	const used = new Set(base.states.map((s) => s.name));
	for (const state of pick) {
		const name = uniqueDialogueName([...base.states, ...[...map.values()].map((n) => ({ name: n }))], `${prefix}${state.name}`);
		map.set(state.name, name);
		used.add(name);
	}
	const states = pick.map((state) => ({
		...structuredClone(state),
		name: map.get(state.name) || state.name,
		barkingState: state.barkingState ? map.get(state.barkingState) ?? state.barkingState : "",
		options: state.options.map((o) => ({
			...o,
			next: rewriteNext(o.next, map)
		})),
		nexts: state.nexts.map((n) => ({
			...n,
			next: rewriteNext(n.next, map)
		}))
	}));
	const fnNames = new Set(base.functions.map((f) => f.name));
	const mergedFns = extra.functions.map((fn) => {
		let name = `${prefix}${fn.name}`;
		let n = 2;
		while (fnNames.has(name)) {
			name = `${prefix}${fn.name}_${n}`;
			n += 1;
		}
		fnNames.add(name);
		return {
			...fn,
			name
		};
	});
	return {
		states: [...base.states, ...states],
		functions: [...base.functions, ...mergedFns]
	};
}
function catalogText(catalog, role) {
	return (catalog.texts ?? []).find((t) => t.role === role);
}
function objectsFor(catalog, role) {
	const text = catalogText(catalog, role)?.text;
	if (text) return parseEcfObjects(text);
	const kind = role === "items" ? "item" : role === "blocks" ? "block" : role === "tokens" ? "token" : "faction";
	return catalog.entries.filter((e) => e.kind === kind).map((e) => ({
		kind,
		plus: false,
		name: e.name,
		fields: e.label ? { Label: e.label } : {}
	}));
}
function localizationTable(catalog) {
	const text = catalogText(catalog, "localization")?.text;
	if (text) return parseCsv(text);
	return {
		languages: ["English"],
		rows: {}
	};
}
function dialogueStrings(catalog) {
	const loca = localizationTable(catalog);
	const extraText = catalogText(catalog, "dialoguesCsv")?.text;
	if (!extraText) return loca;
	const extra = parseCsv(extraText);
	return {
		languages: [.../* @__PURE__ */ new Set([...loca.languages, ...extra.languages])],
		rows: {
			...loca.rows,
			...extra.rows
		}
	};
}
function dialogueDocFor(catalog) {
	const text = catalogText(catalog, "dialogues")?.text;
	if (text) return parseDialogueDoc(text);
	return {
		states: catalog.entries.filter((e) => e.kind === "dialogue").map((e) => ({
			name: e.name,
			npcName: "",
			output: "",
			comment: "",
			barkingState: "",
			requiredStates: "",
			variables: [],
			fields: {},
			options: [],
			nexts: []
		})),
		functions: []
	};
}
function writeDialogues(doc) {
	if (Array.isArray(doc)) return serializeDialogueDoc({
		states: doc,
		functions: []
	});
	return serializeDialogueDoc(doc);
}
function writeLocalization(table) {
	return stringifyCsv(table);
}
function locaLabel(table, name, language = "English") {
	const keys = [
		name,
		`Items_${name}`,
		`item_${name}`,
		`Block_${name}`,
		`Token_${name}`
	];
	for (const key of keys) {
		const rec = table.rows[key];
		if (!rec) continue;
		const value = rec[language] || rec.English || Object.values(rec).find(Boolean);
		if (value) return value;
	}
	return "";
}
//#endregion
export { writeLocalization as S, reindex as _, catalogText as a, uniqueDialogueName as b, dialogueStrings as c, locaLabel as d, localizationTable as f, parseDialogueDoc as g, objectsFor as h, blankFunction as i, gotoTarget as l, mergeForeignDialogues as m, VAR_TYPES as n, dialogueDocFor as o, looksLikeKey as p, blankDialogue as r, dialogueGroup as s, SNIPPETS as t, isGotoReset as u, resolveDialogueText as v, writeDialogues as x, setGoto as y };

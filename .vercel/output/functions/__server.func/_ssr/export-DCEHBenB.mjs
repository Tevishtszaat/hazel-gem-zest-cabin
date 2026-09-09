import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-DZAurLMS.mjs";
import { t as dump } from "../_libs/js-yaml.mjs";
import { D as stringifyCsv, M as usePdaStore, O as stringifyEcfObjects, j as upsertCsv, l as catalogLoaded, r as Button, t as AppHeader } from "./button-DWalkn6S.mjs";
import { C as writeDialoguesCsv, S as writeDialogues, a as catalogText, g as objectsFor, o as dialogueCsvTable, p as localizationTable, s as dialogueDocFor, w as writeLocalization } from "./library-BwXrTK_P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-DCEHBenB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function fileName(catalog, role, fallback) {
	const path = catalogText(catalog, role)?.path || catalog.files.find((f) => f.role === role)?.path;
	if (!path) return fallback;
	return path.split(/[\\/]/).pop() || fallback;
}
function exportSlots(project, catalog) {
	const items = objectsFor(catalog, "items");
	const blocks = objectsFor(catalog, "blocks");
	const tokens = objectsFor(catalog, "tokens");
	const templates = objectsFor(catalog, "templates");
	const reputation = objectsFor(catalog, "reputation");
	const warfare = objectsFor(catalog, "warfare");
	const galaxy = objectsFor(catalog, "galaxy");
	const loca = localizationTable(catalog);
	const dialogues = dialogueDocFor(catalog);
	const dlgCsv = dialogueCsvTable(catalog, dialogues);
	const locaKeys = Object.keys(loca.rows).length;
	const dlgCsvKeys = Object.keys(dlgCsv.rows).length;
	const loaded = catalogLoaded(catalog);
	return [
		{
			id: "pdaYaml",
			label: "PDA.yaml",
			filename: "PDA.yaml",
			mime: "text/yaml",
			ready: project.chapters.length > 0,
			detail: project.chapters.length ? `${project.chapters.length} chapters` : "No chapters yet",
			build: () => exportYaml(project)
		},
		{
			id: "pdaCsv",
			label: "PDA.csv",
			filename: "PDA.csv",
			mime: "text/csv",
			ready: project.chapters.length > 0 || Object.keys(project.csv.rows).length > 0,
			detail: `${Object.keys(project.csv.rows).length} keys`,
			build: () => exportCsv(project)
		},
		{
			id: "items",
			label: "Items",
			filename: fileName(catalog, "items", "ItemsConfig.ecf"),
			mime: "text/plain",
			ready: items.length > 0,
			detail: items.length ? `${items.length} items` : loaded ? "No ItemsConfig loaded" : "Import ItemsConfig.ecf",
			build: () => stringifyEcfObjects(items)
		},
		{
			id: "blocks",
			label: "Blocks",
			filename: fileName(catalog, "blocks", "BlocksConfig.ecf"),
			mime: "text/plain",
			ready: blocks.length > 0,
			detail: blocks.length ? `${blocks.length} blocks` : loaded ? "No BlocksConfig loaded" : "Import BlocksConfig.ecf",
			build: () => stringifyEcfObjects(blocks)
		},
		{
			id: "templates",
			label: "Templates",
			filename: fileName(catalog, "templates", "Templates.ecf"),
			mime: "text/plain",
			ready: templates.length > 0,
			detail: templates.length ? `${templates.length} recipes` : loaded ? "No Templates.ecf loaded" : "Import Templates.ecf",
			build: () => stringifyEcfObjects(templates)
		},
		{
			id: "tokens",
			label: "Tokens",
			filename: fileName(catalog, "tokens", "TokenConfig.ecf"),
			mime: "text/plain",
			ready: tokens.length > 0,
			detail: tokens.length ? `${tokens.length} tokens` : loaded ? "No TokenConfig loaded" : "Import TokenConfig.ecf",
			build: () => stringifyEcfObjects(tokens)
		},
		{
			id: "reputation",
			label: "DefReputation",
			filename: fileName(catalog, "reputation", "DefReputation.ecf"),
			mime: "text/plain",
			ready: reputation.length > 0,
			detail: reputation.length ? `${reputation.length} origins` : loaded ? "No DefReputation.ecf loaded" : "Import DefReputation.ecf",
			build: () => stringifyEcfObjects(reputation)
		},
		{
			id: "warfare",
			label: "FactionWarfare",
			filename: fileName(catalog, "warfare", "FactionWarfare.ecf"),
			mime: "text/plain",
			ready: warfare.length > 0,
			detail: warfare.length ? `${warfare.length} elements` : loaded ? "No FactionWarfare.ecf loaded" : "Import FactionWarfare.ecf",
			build: () => stringifyEcfObjects(warfare)
		},
		{
			id: "galaxy",
			label: "GalaxyConfig",
			filename: fileName(catalog, "galaxy", "GalaxyConfig.ecf"),
			mime: "text/plain",
			ready: galaxy.length > 0,
			detail: galaxy.length ? `${galaxy.length} entries` : loaded ? "No GalaxyConfig.ecf loaded" : "Import GalaxyConfig.ecf",
			build: () => stringifyEcfObjects(galaxy)
		},
		{
			id: "localization",
			label: "Localization",
			filename: fileName(catalog, "localization", "Localization.csv"),
			mime: "text/csv",
			ready: locaKeys > 0,
			detail: locaKeys ? `${locaKeys} keys · ${loca.languages.join(", ") || "English"}` : "Import Localization.csv",
			build: () => writeLocalization(loca)
		},
		{
			id: "dialogues",
			label: "Dialogues.ecf",
			filename: fileName(catalog, "dialogues", "Dialogues.ecf"),
			mime: "text/plain",
			ready: dialogues.states.length > 0,
			detail: dialogues.states.length ? `${dialogues.states.length} states` : "Import Dialogues.ecf",
			build: () => writeDialogues(dialogues)
		},
		{
			id: "dialoguesCsv",
			label: "Dialogues.csv",
			filename: fileName(catalog, "dialoguesCsv", "Dialogues.csv"),
			mime: "text/csv",
			ready: dlgCsvKeys > 0 || dialogues.states.length > 0,
			detail: dlgCsvKeys ? `${dlgCsvKeys} keys · ${dlgCsv.languages.join(", ") || "English"}` : dialogues.states.length ? "No txt_ keys yet" : "Import Dialogues.csv",
			build: () => writeDialoguesCsv(catalog, dialogues)
		}
	];
}
function downloadText(name, text, type) {
	const blob = new Blob([text], { type: `${type};charset=utf-8` });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}
function ExportPage() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const slots = (0, import_react.useMemo)(() => exportSlots(project, catalog), [project, catalog]);
	const [picked, setPicked] = (0, import_react.useState)(() => Object.fromEntries(slots.filter((s) => s.ready).map((s) => [s.id, true])));
	const selected = slots.filter((s) => s.ready && picked[s.id]);
	const downloadOne = (id) => {
		const slot = slots.find((s) => s.id === id);
		if (!slot?.ready) return;
		downloadText(slot.filename, slot.build(), slot.mime);
	};
	const downloadSelected = () => {
		for (const slot of selected) downloadText(slot.filename, slot.build(), slot.mime);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-medium text-2xl tracking-tight",
					children: "Export"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Download the files this workshop can edit. Drop them back into the scenario folder, replacing the originals."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !selected.length,
					onClick: downloadSelected,
					children: [
						"Download selected (",
						selected.length,
						")"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 sm:grid-cols-2",
				children: slots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-md border border-border bg-surface p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1",
								disabled: !slot.ready,
								checked: Boolean(picked[slot.id]) && slot.ready,
								onChange: (e) => setPicked((p) => ({
									...p,
									[slot.id]: e.target.checked
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: slot.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-xs text-subtle",
										children: slot.filename
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `mt-1 text-xs ${slot.ready ? "text-muted" : "text-warn"}`,
										children: slot.detail
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !slot.ready,
								onClick: () => downloadOne(slot.id),
								children: "Download"
							})
						]
					})
				}, slot.id))
			})]
		})]
	});
}
var SplitComponent = ExportPage;
//#endregion
export { SplitComponent as component };

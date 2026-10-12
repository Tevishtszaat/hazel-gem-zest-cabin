import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as dump } from "../_libs/js-yaml.mjs";
import { Ct as objectsFor, Et as writeLocalization, Gn as stringifyEcfObjects, Kn as stringifyCsv, On as catalogLoaded, St as localizationTable, Tt as writeDialoguesCsv, Un as CONFIG_METAS, _t as catalogText, a as usePdaStore, qn as upsertCsv, vt as dialogueCsvTable, wt as writeDialogues, yt as dialogueDocFor } from "./router-xYviGTYl.mjs";
import { n as Button, t as AppHeader } from "./button-DoV8KSj5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-CtUpy-s-.js
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
	const loca = localizationTable(catalog);
	const dialogues = dialogueDocFor(catalog);
	const dlgCsv = dialogueCsvTable(catalog, dialogues);
	const locaKeys = Object.keys(loca.rows).length;
	const dlgCsvKeys = Object.keys(dlgCsv.rows).length;
	const loaded = catalogLoaded(catalog);
	const slots = [{
		id: "pdaYaml",
		label: "PDA.yaml",
		filename: "PDA.yaml",
		mime: "text/yaml",
		ready: project.chapters.length > 0,
		detail: project.chapters.length ? `${project.chapters.length} chapters` : "No chapters yet",
		build: () => exportYaml(project)
	}, {
		id: "pdaCsv",
		label: "PDA.csv",
		filename: "PDA.csv",
		mime: "text/csv",
		ready: project.chapters.length > 0 || Object.keys(project.csv.rows).length > 0,
		detail: `${Object.keys(project.csv.rows).length} keys`,
		build: () => exportCsv(project)
	}];
	for (const meta of CONFIG_METAS) {
		if (meta.format === "yaml") {
			const text = catalogText(catalog, meta.role)?.text ?? "";
			slots.push({
				id: meta.role,
				label: meta.label,
				filename: fileName(catalog, meta.role, meta.file),
				mime: "text/yaml",
				ready: text.trim().length > 0,
				detail: text.trim() ? `${text.split(/\r?\n/).length} lines` : loaded ? `No ${meta.file} loaded` : `Import ${meta.file}`,
				build: () => text
			});
			continue;
		}
		const objects = objectsFor(catalog, meta.role);
		slots.push({
			id: meta.role,
			label: meta.label,
			filename: fileName(catalog, meta.role, meta.file),
			mime: "text/plain",
			ready: objects.length > 0,
			detail: objects.length ? `${objects.length} entries` : loaded ? `No ${meta.file} loaded` : `Import ${meta.file}`,
			build: () => stringifyEcfObjects(objects)
		});
	}
	slots.push({
		id: "localization",
		label: "Localization",
		filename: fileName(catalog, "localization", "Localization.csv"),
		mime: "text/csv",
		ready: locaKeys > 0,
		detail: locaKeys ? `${locaKeys} keys · ${loca.languages.join(", ") || "English"}` : "Import Localization.csv",
		build: () => writeLocalization(loca)
	}, {
		id: "dialogues",
		label: "Dialogues.ecf",
		filename: fileName(catalog, "dialogues", "Dialogues.ecf"),
		mime: "text/plain",
		ready: dialogues.states.length > 0,
		detail: dialogues.states.length ? `${dialogues.states.length} states` : "Import Dialogues.ecf",
		build: () => writeDialogues(dialogues)
	}, {
		id: "dialoguesCsv",
		label: "Dialogues.csv",
		filename: fileName(catalog, "dialoguesCsv", "Dialogues.csv"),
		mime: "text/csv",
		ready: dlgCsvKeys > 0 || dialogues.states.length > 0,
		detail: dlgCsvKeys ? `${dlgCsvKeys} keys · ${dlgCsv.languages.join(", ") || "English"}` : dialogues.states.length ? "No txt_ keys yet" : "Import Dialogues.csv",
		build: () => writeDialoguesCsv(catalog, dialogues)
	});
	return slots;
}
var AXIS_FOLDER = "axisexport";
function downloadAxisExport(files) {
	const blob = new Blob([axisExportZip(files)], { type: "application/zip" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = `${AXIS_FOLDER}.zip`;
	a.click();
	URL.revokeObjectURL(a.href);
}
function axisExportZip(files) {
	const enc = new TextEncoder();
	const used = /* @__PURE__ */ new Set();
	return zipStored(files.map((file) => {
		const base = file.name.split(/[\\/]/).pop() || "file.txt";
		let name = `${AXIS_FOLDER}/${base}`;
		const key = name.toLowerCase();
		if (used.has(key)) {
			const dot = base.lastIndexOf(".");
			const stem = dot > 0 ? base.slice(0, dot) : base;
			const ext = dot > 0 ? base.slice(dot) : "";
			let n = 2;
			while (used.has(`${AXIS_FOLDER}/${stem}-${n}${ext}`.toLowerCase())) n += 1;
			name = `${AXIS_FOLDER}/${stem}-${n}${ext}`;
		}
		used.add(name.toLowerCase());
		return {
			name,
			data: enc.encode(file.text)
		};
	}));
}
function crc32(data) {
	let c = -1;
	for (let i = 0; i < data.length; i++) {
		c ^= data[i];
		for (let k = 0; k < 8; k++) c = c >>> 1 ^ (c & 1 ? 3988292384 : 0);
	}
	return ~c >>> 0;
}
function zipStored(files) {
	const enc = new TextEncoder();
	const now = /* @__PURE__ */ new Date();
	const time = now.getHours() << 11 | now.getMinutes() << 5 | Math.floor(now.getSeconds() / 2);
	const date = now.getFullYear() - 1980 << 9 | now.getMonth() + 1 << 5 | now.getDate();
	const locals = [];
	const central = [];
	let offset = 0;
	for (const file of files) {
		const name = enc.encode(file.name);
		const crc = crc32(file.data);
		const local = /* @__PURE__ */ new Uint8Array(30);
		const view = new DataView(local.buffer);
		view.setUint32(0, 67324752, true);
		view.setUint16(4, 20, true);
		view.setUint16(6, 2048, true);
		view.setUint16(10, time, true);
		view.setUint16(12, date, true);
		view.setUint32(14, crc, true);
		view.setUint32(18, file.data.length, true);
		view.setUint32(22, file.data.length, true);
		view.setUint16(26, name.length, true);
		locals.push(local, name, file.data);
		const cen = /* @__PURE__ */ new Uint8Array(46);
		const cenView = new DataView(cen.buffer);
		cenView.setUint32(0, 33639248, true);
		cenView.setUint16(4, 20, true);
		cenView.setUint16(6, 20, true);
		cenView.setUint16(8, 2048, true);
		cenView.setUint16(12, time, true);
		cenView.setUint16(14, date, true);
		cenView.setUint32(16, crc, true);
		cenView.setUint32(20, file.data.length, true);
		cenView.setUint32(24, file.data.length, true);
		cenView.setUint16(28, name.length, true);
		cenView.setUint32(42, offset, true);
		central.push(cen, name);
		offset += local.length + name.length + file.data.length;
	}
	const centralStart = offset;
	const centralSize = central.reduce((sum, part) => sum + part.length, 0);
	const eocd = /* @__PURE__ */ new Uint8Array(22);
	const end = new DataView(eocd.buffer);
	end.setUint32(0, 101010256, true);
	end.setUint16(8, files.length, true);
	end.setUint16(10, files.length, true);
	end.setUint32(12, centralSize, true);
	end.setUint32(16, centralStart, true);
	return concatBytes([
		...locals,
		...central,
		eocd
	]);
}
function concatBytes(chunks) {
	const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
}
function ExportPage() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const slots = (0, import_react.useMemo)(() => exportSlots(project, catalog), [project, catalog]);
	const [picked, setPicked] = (0, import_react.useState)(() => Object.fromEntries(slots.filter((s) => s.ready).map((s) => [s.id, true])));
	const selected = slots.filter((s) => s.ready && picked[s.id]);
	const available = slots.filter((s) => s.ready);
	const selectAvailable = () => {
		setPicked(Object.fromEntries(available.map((slot) => [slot.id, true])));
	};
	const downloadOne = (id) => {
		const slot = slots.find((s) => s.id === id);
		if (!slot?.ready) return;
		downloadAxisExport([{
			name: slot.filename,
			text: slot.build()
		}]);
	};
	const downloadSelected = () => {
		downloadAxisExport(selected.map((slot) => ({
			name: slot.filename,
			text: slot.build()
		})));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell flex min-h-dvh flex-col text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "canvas-wash mx-auto w-full max-w-5xl flex-1 px-4 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-medium text-2xl tracking-tight",
					children: "Export"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Download saves one axisexport.zip. The configs sit in a folder named axisexport and keep their original names. Export again and the browser numbers that zip, not the files inside."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						disabled: !available.length,
						onClick: selectAvailable,
						children: [
							"Select all available (",
							available.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: !selected.length,
						onClick: downloadSelected,
						children: [
							"Download selected (",
							selected.length,
							")"
						]
					})]
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

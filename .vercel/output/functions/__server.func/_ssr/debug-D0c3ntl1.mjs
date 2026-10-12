import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as usePdaStore, c as validateFilesOffthread, d as FILE_SCAN_ORDER, dn as validateProject, er as useBusyStore, l as validateOffthread, u as FILE_DEBUG_TABS, un as problemStats } from "./router-CQbUGop6.mjs";
import { c as setDebugStats, n as Button, t as AppHeader } from "./button-Dk8gDvBQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/debug-D0c3ntl1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** HUD wrap / visible character-count warnings. Hidden unless Debug asks to show them. */
var LENGTH_CODES = /* @__PURE__ */ new Set(["hud-wrap"]);
function problemIgnoreKey(problem) {
	return `${problem.source ?? "pda"}|${problem.code}|${problem.id ?? "root"}|${problem.field ?? ""}|${problem.value ?? ""}`;
}
function visibleProblems(issues, ignored, opts) {
	const skip = new Set(ignored);
	return issues.filter((issue) => {
		if (!opts?.includeLength && LENGTH_CODES.has(issue.code)) return false;
		if (!opts?.includeIgnored && skip.has(problemIgnoreKey(issue))) return false;
		return true;
	});
}
function tabLabel(id) {
	return FILE_DEBUG_TABS.find((tab) => tab.id === id)?.label || id;
}
async function collectAllProblems(project, catalog) {
	const merged = [];
	const queue = [
		"pda-tree",
		"pda",
		...FILE_SCAN_ORDER.filter((id) => id !== "pda")
	];
	for (const step of queue) {
		if (step === "pda-tree") {
			try {
				const pda = await validateOffthread(project, catalog);
				merged.push(...pda.issues || []);
			} catch {
				merged.push(...validateProject(project, catalog));
			}
			continue;
		}
		try {
			const part = await validateFilesOffthread(catalog, step);
			merged.push(...part.issues || []);
		} catch (err) {
			console.warn(`Debug scan failed for ${step}`, err);
		}
	}
	return merged;
}
function useProblems(opts) {
	const source = opts?.source ?? "pda";
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const indexedAt = catalog.indexedAt;
	const ignoredProblems = usePdaStore((s) => s.ignoredProblems);
	const loading = useBusyStore((s) => s.load);
	const [raw, setRaw] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [scan, setScan] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (loading) {
			setBusy(false);
			setScan(null);
			return;
		}
		setBusy(true);
		setRaw([]);
		setScan({
			label: "Starting scan…",
			file: source === "all" ? "pda" : source,
			pct: 0
		});
		const timer = window.setTimeout(() => {
			(async () => {
				const merged = [];
				const add = (issues) => {
					if (cancelled) return;
					if (issues.length) {
						merged.push(...issues);
						setRaw([...merged]);
					}
				};
				const queue = source === "all" ? [
					"pda-tree",
					"pda",
					...FILE_SCAN_ORDER.filter((id) => id !== "pda")
				] : source === "pda" ? ["pda-tree", "pda"] : [source];
				const mark = (file, index) => {
					if (cancelled) return;
					const label = file === "pda-tree" ? "PDA tree" : tabLabel(file);
					setScan({
						label: `Scanning ${label}…`,
						file: file === "pda-tree" ? "pda" : file,
						pct: Math.round(index / Math.max(1, queue.length) * 100)
					});
				};
				try {
					for (let i = 0; i < queue.length; i++) {
						if (cancelled) break;
						const step = queue[i];
						mark(step, i);
						if (step === "pda-tree") try {
							add((await validateOffthread(project, catalog)).issues || []);
						} catch (err) {
							console.warn("PDA debug worker failed, running on this tab", err);
							add(validateProject(project, catalog));
						}
						else try {
							add((await validateFilesOffthread(catalog, step)).issues || []);
						} catch (err) {
							console.warn(`Debug scan failed for ${step}`, err);
						}
						if (!cancelled) setScan({
							label: `Scanning ${step === "pda-tree" ? "PDA tree" : tabLabel(step)}…`,
							file: step === "pda-tree" ? "pda" : step,
							pct: Math.round((i + 1) / queue.length * 100)
						});
					}
				} catch (err) {
					console.warn("Debug scan failed", err);
					if (!merged.length) add(validateProject(project, catalog));
				} finally {
					if (!cancelled) {
						setScan(null);
						setBusy(false);
						setDebugStats(problemStats(merged));
					}
				}
			})();
		}, 180);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [
		project,
		indexedAt,
		loading,
		source
	]);
	const issues = (0, import_react.useMemo)(() => visibleProblems(raw, ignoredProblems, opts), [
		raw,
		ignoredProblems,
		opts?.includeLength,
		opts?.includeIgnored
	]);
	return {
		issues,
		stats: (0, import_react.useMemo)(() => problemStats(issues), [issues]),
		busy,
		raw,
		ignoredCount: (0, import_react.useMemo)(() => raw.filter((issue) => ignoredProblems.includes(problemIgnoreKey(issue))).length, [raw, ignoredProblems]),
		scan
	};
}
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "error",
		label: "Errors"
	},
	{
		id: "warning",
		label: "Warnings"
	},
	{
		id: "delete",
		label: "Suggested delete"
	},
	{
		id: "titles",
		label: "Duplicate titles"
	},
	{
		id: "fix",
		label: "Suggested fix"
	},
	{
		id: "ignored",
		label: "Ignored"
	}
];
function DebugPage() {
	const applyBulk = usePdaStore((s) => s.applyBulk);
	const applyFileFix = usePdaStore((s) => s.applyFileFix);
	const applyFileFixes = usePdaStore((s) => s.applyFileFixes);
	const jumpTo = usePdaStore((s) => s.jumpTo);
	const ignoreProblems = usePdaStore((s) => s.ignoreProblems);
	const unignoreProblems = usePdaStore((s) => s.unignoreProblems);
	const ignoredProblems = usePdaStore((s) => s.ignoredProblems);
	const navigate = useNavigate();
	const [file, setFile] = (0, import_react.useState)("pda");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)({});
	const [showLength, setShowLength] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [mastering, setMastering] = (0, import_react.useState)(false);
	const { issues, stats, busy, raw, ignoredCount, scan } = useProblems({
		includeLength: showLength || filter === "ignored",
		includeIgnored: filter === "ignored",
		source: file
	});
	const visible = issues.filter((issue) => {
		const ignored = ignoredProblems.includes(problemIgnoreKey(issue));
		if (filter === "ignored") return ignored;
		if (ignored) return false;
		if (filter === "error" && issue.level !== "error") return false;
		if (filter === "warning" && issue.level !== "warning") return false;
		if (filter === "delete" && (issue.recommend !== "delete" || issue.code === "duplicate-title")) return false;
		if (filter === "titles" && issue.code !== "duplicate-title") return false;
		if (filter === "fix" && issue.recommend !== "fix") return false;
		if (query) {
			if (!`${issue.message} ${issue.path} ${issue.code} ${issue.value ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())) return false;
		}
		return true;
	});
	const selectedIds = visible.filter((issue) => issue.id && picked[issue.key]).map((issue) => issue.id);
	const uniqueSelected = [...new Set(selectedIds)];
	const selectedKeys = visible.filter((issue) => picked[issue.key]).map((issue) => problemIgnoreKey(issue));
	const apply = (issue, fix) => {
		if (isFileFix(fix)) {
			applyFileFix(fix);
			setNote("Updated the loaded file. Use Export to write it into the scenario folder on disk.");
		} else if (issue.id) {
			if (fix.type === "delete") applyBulk([], [issue.id]);
			else applyBulk([{
				id: issue.id,
				patch: fixToPatch(fix)
			}]);
		}
		setPicked((p) => {
			const next = { ...p };
			delete next[issue.key];
			return next;
		});
	};
	const acceptIssues = (list, doneNote) => {
		const patches = [];
		const fileFixes = [];
		const seen = /* @__PURE__ */ new Set();
		let applied = 0;
		for (const issue of list) {
			const fix = preferredFix(issue);
			if (!fix) continue;
			const sig = fixSignature(issue, fix);
			if (seen.has(sig)) continue;
			seen.add(sig);
			applied += 1;
			if (isFileFix(fix)) fileFixes.push(fix);
			else if (issue.id) patches.push({
				id: issue.id,
				patch: fixToPatch(fix)
			});
		}
		if (fileFixes.length) applyFileFixes(fileFixes);
		if (patches.length) applyBulk(patches);
		setPicked({});
		if (applied) setNote(doneNote || "Updated the loaded file. Use Export to write it into the scenario folder on disk.");
		return applied;
	};
	const masterFix = async () => {
		if (mastering) return;
		setMastering(true);
		setNote("Master Fix is scanning every file…");
		try {
			const state = usePdaStore.getState();
			const all = await collectAllProblems(state.project, state.catalog);
			const ignored = new Set(state.ignoredProblems);
			const fixable = all.filter((issue) => !ignored.has(problemIgnoreKey(issue)) && preferredFix(issue));
			const applied = acceptIssues(fixable);
			setNote(applied ? `Master Fix applied ${applied} best-match fixes. Use Export to write them into the scenario folder on disk.` : "Master Fix found nothing it can correct.");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Master Fix failed.");
		} finally {
			setMastering(false);
		}
	};
	const selectable = visible.filter((issue) => issue.id || issue.fixes.length);
	const suggestedFixes = visible.filter((issue) => issue.recommend === "fix" && preferredFix(issue));
	const selectedFixable = selectable.filter((issue) => picked[issue.key] && preferredFix(issue));
	const recommendedDeletes = visible.filter((i) => i.recommend === "delete" && i.id).map((i) => i.id);
	const dupCount = issues.filter((i) => i.code === "duplicate-title" && !ignoredProblems.includes(problemIgnoreKey(i))).length;
	const open = (issue) => {
		if (issue.href) {
			navigate({ to: issue.href });
			return;
		}
		if (!issue.id) return;
		jumpTo(issue.id);
		navigate({ to: "/" });
	};
	const ignoreVisibleSelected = () => {
		if (!selectedKeys.length) return;
		ignoreProblems(selectedKeys);
		setPicked({});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell flex min-h-dvh flex-col text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "canvas-wash mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-medium tracking-tight",
							children: "Debug"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm text-muted",
							children: "Scans PDA, dialogues, and each config for broken syntax plus missing names and duplicate IDs."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							disabled: mastering || busy,
							onClick: () => void masterFix(),
							children: mastering ? "Master Fix…" : "Master Fix"
						}),
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-subtle",
							children: note
						}) : null
					]
				}),
				busy || scan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-md border border-accent/35 bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between gap-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-fg",
							children: scan?.label || "Starting scan…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "tabular-nums text-muted",
							children: [scan?.pct ?? 0, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-3.5 overflow-hidden rounded-full bg-elevated ring-1 ring-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "area-bar-fill h-full rounded-full",
							style: { width: `${Math.max(6, Math.min(100, scan?.pct ?? 6))}%` }
						})
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex flex-wrap gap-1.5",
					children: FILE_DEBUG_TABS.map((tab) => {
						const active = file === tab.id;
						const scanning = scan?.file === tab.id || tab.id === "all" && Boolean(scan);
						const count = active ? issues.filter((i) => !ignoredProblems.includes(problemIgnoreKey(i))).length : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setFile(tab.id),
							className: `h-8 rounded-sm px-3 text-xs ${active ? "bg-elevated text-fg" : scanning ? "text-accent" : "text-muted hover:text-fg"}`,
							children: [
								tab.label,
								scanning && !active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-subtle",
									children: "…"
								}) : null,
								active && count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-subtle",
									children: count
								}) : null
							]
						}, tab.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 grid gap-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Issues",
							value: String(stats.total)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Errors",
							value: String(stats.errors),
							tone: stats.errors ? "danger" : void 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Warnings",
							value: String(stats.warnings),
							tone: stats.warnings ? "warn" : void 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Ignored",
							value: String(ignoredCount)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center gap-2",
					children: [
						FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setFilter(item.id),
							className: `h-8 rounded-sm px-3 text-xs ${filter === item.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`,
							children: [
								item.label,
								item.id === "titles" && dupCount ? ` (${dupCount})` : "",
								item.id === "delete" && stats.deletable ? ` (${stats.deletable})` : ""
							]
						}, item.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-8 items-center gap-2 px-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: showLength,
								onChange: (e) => setShowLength(e.target.checked)
							}), "Show wrap / length"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Filter message or path…",
							className: "h-8 min-w-40 flex-1 rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !selectable.length,
							onClick: () => {
								const next = {};
								for (const issue of selectable) next[issue.key] = true;
								setPicked(next);
							},
							children: "Select all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							disabled: !Object.values(picked).some(Boolean),
							onClick: () => setPicked({}),
							children: "Deselect all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !selectedFixable.length || mastering,
							onClick: () => acceptIssues(selectedFixable),
							children: [
								"Accept selected (",
								selectedFixable.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !suggestedFixes.length || mastering,
							onClick: () => acceptIssues(suggestedFixes),
							children: [
								"Accept all suggested (",
								suggestedFixes.length,
								")"
							]
						}),
						filter === "ignored" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !selectedKeys.length && !visible.length,
							onClick: () => {
								unignoreProblems(selectedKeys.length ? selectedKeys : visible.map(problemIgnoreKey));
								setPicked({});
							},
							children: "Restore selected"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !selectedKeys.length,
							onClick: ignoreVisibleSelected,
							children: [
								"Ignore selected (",
								selectedKeys.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "danger",
							disabled: !uniqueSelected.length,
							onClick: () => {
								applyBulk([], uniqueSelected);
								setPicked({});
							},
							children: [
								"Delete selected (",
								uniqueSelected.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !recommendedDeletes.length,
							onClick: () => {
								applyBulk([], [...new Set(recommendedDeletes)]);
								setPicked({});
							},
							children: [
								"Delete all suggested (",
								[...new Set(recommendedDeletes)].length,
								")"
							]
						}),
						filter === "titles" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !suggestedFixes.length,
							onClick: () => acceptIssues(suggestedFixes),
							children: [
								"Rename all copies (",
								suggestedFixes.length,
								")"
							]
						}) : null
					]
				}),
				!visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-ok",
					children: raw.length ? "Nothing matches this filter." : "No issues. Structure looks exportable."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: visible.slice(0, 400).map((issue) => {
						const key = problemIgnoreKey(issue);
						const ignored = ignoredProblems.includes(key);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-md border border-border bg-surface p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [issue.id || issue.fixes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "mt-1",
									checked: Boolean(picked[issue.key]),
									onChange: (e) => setPicked((p) => ({
										...p,
										[issue.key]: e.target.checked
									}))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-xs uppercase tracking-[0.14em] ${issue.level === "error" ? "text-danger" : "text-warn"}`,
													children: issue.level === "error" ? "Error" : "Watch"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-subtle",
													children: issue.source ?? issue.kind
												}),
												issue.recommend === "delete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-danger",
													children: "suggest delete"
												}) : issue.recommend === "fix" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-ok",
													children: "suggest fix"
												}) : null,
												ignored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-subtle",
													children: "ignored"
												}) : null
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm",
											children: issue.message
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-xs text-subtle",
											children: issue.path
										}),
										issue.suggestions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted",
											children: ["Close matches: ", issue.suggestions.join(" · ")]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-wrap gap-1.5",
											children: [
												issue.fixes.map((fix) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: `h-7 rounded-sm px-2 text-xs ${fix.type === "delete" ? "border border-danger/40 text-danger hover:bg-danger/10" : "bg-elevated text-fg hover:bg-surface"}`,
													onClick: () => apply(issue, fix),
													children: fix.label
												}, fix.label)),
												ignored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "h-7 rounded-sm px-2 text-xs text-muted hover:text-fg",
													onClick: () => unignoreProblems([key]),
													children: "Restore"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "h-7 rounded-sm border border-border px-2 text-xs text-muted hover:text-fg",
													onClick: () => ignoreProblems([key]),
													children: "Ignore"
												}),
												issue.id || issue.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "h-7 rounded-sm px-2 text-xs text-muted hover:text-fg",
													onClick: () => open(issue),
													children: "Jump"
												}) : null
											]
										})
									]
								})]
							})
						}, issue.key);
					})
				}),
				visible.length > 400 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-subtle",
					children: [
						"Showing 400 of ",
						visible.length,
						". Narrow the filter to see the rest."
					]
				}) : null
			]
		})]
	});
}
function fixSignature(issue, fix) {
	if (fix.type === "orbit-move") return `orbit:${fix.path}:${fix.name.toLowerCase()}`;
	if (fix.type === "sector-rename") return `rename:${fix.path}:${fix.from.toLowerCase()}`;
	if (fix.type === "ecf-set") return `ecf:${fix.role}:${fix.name}:${fix.field}`;
	if (fix.type === "yaml-replace") return `yaml:${fix.path}:${fix.from}`;
	if (fix.type === "csv-pad") return `csv:${fix.path}:${fix.line}`;
	if (fix.type === "loca-english") return `loca:${fix.path}:${fix.key}`;
	if (issue.id) return `node:${issue.id}:${fix.type}:${"field" in fix ? fix.field : ""}`;
	return `${issue.path}:${issue.code}:${fix.type}:${fix.label}`;
}
function isFileFix(fix) {
	return fix.type === "ecf-set" || fix.type === "yaml-replace" || fix.type === "csv-pad" || fix.type === "orbit-move" || fix.type === "loca-english" || fix.type === "sector-rename";
}
function preferredFix(issue) {
	return issue.fixes.find((fix) => fix.type !== "delete") ?? null;
}
function fixToPatch(fix) {
	if (fix.type === "clear") return { [fix.field]: "" };
	if (fix.type === "set") return { [fix.field]: fix.value };
	if (fix.type === "rewards") return { rewards: fix.rewards };
	return {};
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.14em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 text-lg tabular-nums ${tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : ""}`,
			children: value
		})]
	});
}
var SplitComponent = DebugPage;
//#endregion
export { SplitComponent as component };

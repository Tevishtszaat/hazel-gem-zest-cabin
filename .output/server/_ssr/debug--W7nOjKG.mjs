import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as useProblems, j as usePdaStore, r as Button, t as AppHeader } from "./app-header-DASzD0Jg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/debug--W7nOjKG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
		id: "fix",
		label: "Suggested fix"
	}
];
function DebugPage() {
	const applyBulk = usePdaStore((s) => s.applyBulk);
	const jumpTo = usePdaStore((s) => s.jumpTo);
	const navigate = useNavigate();
	const { issues, stats, busy } = useProblems();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)({});
	const visible = issues.filter((issue) => {
		if (filter === "error" && issue.level !== "error") return false;
		if (filter === "warning" && issue.level !== "warning") return false;
		if (filter === "delete" && issue.recommend !== "delete") return false;
		if (filter === "fix" && issue.recommend !== "fix") return false;
		if (query) {
			if (!`${issue.message} ${issue.path} ${issue.code} ${issue.value ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())) return false;
		}
		return true;
	});
	const selectedIds = visible.filter((issue) => issue.id && picked[issue.key]).map((issue) => issue.id);
	const uniqueSelected = [...new Set(selectedIds)];
	const apply = (issue, fix) => {
		if (!issue.id) return;
		if (fix.type === "delete") applyBulk([], [issue.id]);
		else applyBulk([{
			id: issue.id,
			patch: fixToPatch(fix)
		}]);
		setPicked((p) => {
			const next = { ...p };
			delete next[issue.key];
			return next;
		});
	};
	const acceptIssues = (list) => {
		const patches = [];
		for (const issue of list) {
			if (!issue.id) continue;
			const fix = preferredFix(issue);
			if (!fix) continue;
			patches.push({
				id: issue.id,
				patch: fixToPatch(fix)
			});
		}
		if (!patches.length) return;
		applyBulk(patches);
		setPicked({});
	};
	const selectable = visible.filter((issue) => issue.id);
	const suggestedFixes = visible.filter((issue) => issue.recommend === "fix" && issue.id && preferredFix(issue));
	const selectedFixable = selectable.filter((issue) => picked[issue.key] && preferredFix(issue));
	const recommendedDeletes = visible.filter((i) => i.recommend === "delete" && i.id).map((i) => i.id);
	const open = (issue) => {
		if (!issue.id) return;
		jumpTo(issue.id);
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "canvas-wash mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight",
						children: "Debug"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: ["Catch empty rows, unknown names, missing pictures, and HUD wrap. Apply a suggested correction or delete the entry. Jump opens it in the editor.", busy ? " Rechecking in the background…" : ""]
					})]
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
							label: "Suggested deletes",
							value: String(stats.deletable)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center gap-2",
					children: [FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setFilter(item.id),
						className: `h-8 rounded-sm px-3 text-xs ${filter === item.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`,
						children: item.label
					}, item.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Filter message or path…",
						className: "h-8 min-w-40 flex-1 rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
					})]
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
							disabled: !selectedFixable.length,
							onClick: () => acceptIssues(selectedFixable),
							children: [
								"Accept selected (",
								selectedFixable.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !suggestedFixes.length,
							onClick: () => acceptIssues(suggestedFixes),
							children: [
								"Accept all suggested (",
								suggestedFixes.length,
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
						})
					]
				}),
				!visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-ok",
					children: issues.length ? "Nothing matches this filter." : "No issues. Structure looks exportable."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: visible.slice(0, 400).map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-md border border-border bg-surface p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [issue.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
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
												children: issue.kind
											}),
											issue.recommend === "delete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-danger",
												children: "suggest delete"
											}) : issue.recommend === "fix" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-ok",
												children: "suggest fix"
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
										children: [issue.fixes.map((fix) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: `h-7 rounded-sm px-2 text-xs ${fix.type === "delete" ? "border border-danger/40 text-danger hover:bg-danger/10" : "bg-elevated text-fg hover:bg-surface"}`,
											onClick: () => apply(issue, fix),
											children: fix.label
										}, fix.label)), issue.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-7 rounded-sm px-2 text-xs text-muted hover:text-fg",
											onClick: () => open(issue),
											children: "Jump"
										}) : null]
									})
								]
							})]
						})
					}, issue.key))
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

import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime, i as Slot } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { C as ChevronDown, T as Bug, a as ScrollText, f as Library, l as MessageSquareText, t as Upload, w as Check, y as Download } from "../_libs/lucide-react.mjs";
import { r as create } from "../_libs/zustand.mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _n as APP_SHORT, a as usePdaStore, n as Tooltip, r as cn, un as problemStats, vn as APP_SUBTITLE } from "./router-CQbUGop6.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var empty = problemStats([]);
var useDebugStats = create(() => empty);
function setDebugStats(stats) {
	useDebugStats.setState(stats);
}
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em]", {
			muted: "text-muted border-border",
			ok: "text-ok border-ok/30",
			warn: "text-warn border-warn/30",
			danger: "text-danger border-danger/30",
			chapter: "text-chapter border-chapter/30",
			task: "text-task border-task/30",
			action: "text-action border-action/30"
		}[tone], className),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("inline-flex h-8 min-w-28 items-center justify-between gap-2 rounded-sm border border-border bg-bg px-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 text-muted" })
		})]
	});
}
function SelectContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
		position: "popper",
		className: cn("z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-auto rounded-sm border border-border bg-surface p-1 shadow-lg", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, { children })
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex cursor-pointer items-center rounded-sm py-1.5 pr-6 pl-2 text-sm outline-none data-[highlighted]:bg-elevated data-[highlighted]:text-fg", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, {
			className: "absolute right-1.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-accent" })
		})]
	});
}
function AppHeader() {
	const language = usePdaStore((s) => s.project.language);
	const languages = usePdaStore((s) => s.project.csv.languages);
	const setLanguage = usePdaStore((s) => s.setLanguage);
	const langs = languages.length ? languages : [language || "English"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b border-border bg-surface/80 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3 px-3 py-2 sm:px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex min-w-0 items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "PDA Language"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: language,
					onValueChange: setLanguage,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						"aria-label": "PDA language",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: langs.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: lang,
						children: lang
					}, lang)) })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {})]
	});
}
function AppNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const stats = useDebugStats();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "grid grid-cols-3 border-t border-border sm:grid-cols-6",
		children: [
			{
				to: "/",
				label: "PDA",
				icon: ScrollText
			},
			{
				to: "/dialogues",
				label: "Dialogues",
				icon: MessageSquareText
			},
			{
				to: "/import",
				label: "Import",
				icon: Upload
			},
			{
				to: "/library",
				label: "Library",
				icon: Library
			},
			{
				to: "/export",
				label: "Export",
				icon: Download
			},
			{
				to: "/debug",
				label: "Debug",
				icon: Bug
			}
		].map((item) => {
			const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
				content: item.label,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: `relative flex h-10 min-w-0 items-center justify-center gap-1.5 px-1 text-xs tracking-wide sm:h-9 sm:text-sm ${active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/40 hover:text-fg"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: item.label
						}),
						item.to === "/debug" && stats.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: stats.errors ? "danger" : "warn",
							children: stats.total
						}) : null,
						active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 bottom-0 h-px bg-accent" }) : null
					]
				})
			}, item.to);
		})
	});
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
//#endregion
export { SelectItem as a, setDebugStats as c, SelectContent as i, Button as n, SelectTrigger as o, Select as r, SelectValue as s, AppHeader as t };

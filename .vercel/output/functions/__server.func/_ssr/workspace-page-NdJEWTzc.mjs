import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as AppHeader } from "./button-Dk8gDvBQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-page-NdJEWTzc.js
var import_jsx_runtime = require_jsx_runtime();
function WorkspacePage({ group, title, kicker, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell flex h-dvh flex-col overflow-hidden text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-10 flex-wrap items-center gap-2 border-b border-border px-4 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						className: "text-xs uppercase tracking-[0.14em] text-muted hover:text-fg",
						children: "Library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: group
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-medium tracking-tight",
						children: title
					}),
					kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto text-xs text-subtle",
						children: kicker
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1",
				children
			})
		]
	});
}
//#endregion
export { WorkspacePage as t };

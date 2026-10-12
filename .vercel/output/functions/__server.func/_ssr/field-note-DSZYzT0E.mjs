import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/field-note-DSZYzT0E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FieldNote({ label, note }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "relative inline-flex normal-case tracking-normal",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			title: note,
			"aria-expanded": open,
			"aria-label": `What ${label} does`,
			className: "inline-flex h-4 w-4 items-center justify-center rounded-full border border-warn/70 text-[10px] font-bold leading-none text-warn hover:bg-warn/15",
			onClick: (event) => {
				event.preventDefault();
				event.stopPropagation();
				setOpen((value) => !value);
			},
			children: "!"
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute left-0 top-5 z-30 w-72 rounded-md border border-warn/40 bg-bg px-2.5 py-2 text-xs leading-relaxed text-fg shadow-border",
			children: note
		}) : null]
	});
}
//#endregion
export { FieldNote as t };

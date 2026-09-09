import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, s as bbcodeToHtml, x as peekImageUrl } from "./button-DWalkn6S.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function BbText({ text, className, as: Tag = "span", inline = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
		className: `bbcode ${className ?? ""}`,
		dangerouslySetInnerHTML: { __html: bbcodeToHtml(text || "", {
			inline,
			imageUrl: peekImageUrl
		}) }
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-10 w-full rounded-sm border border-border bg-bg px-3 text-sm text-fg placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted", className),
		...props
	});
}
//#endregion
export { Textarea as i, Input as n, Label as r, BbText as t };

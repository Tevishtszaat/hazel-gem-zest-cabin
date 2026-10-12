import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Jn as bbcodeToHtml, xn as peekImageUrl } from "./router-xYviGTYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bb-text-DvUpX4Ez.js
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
//#endregion
export { BbText as t };

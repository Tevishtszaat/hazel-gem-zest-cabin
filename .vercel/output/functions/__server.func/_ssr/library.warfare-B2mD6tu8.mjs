import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
import { n as WarfareEditor } from "./config-tabs-1dVBJJgD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.warfare-B2mD6tu8.js
var import_jsx_runtime = require_jsx_runtime();
function WarfareWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Faction warfare",
		kicker: "FactionWarfare.ecf",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarfareEditor, {})
	});
}
//#endregion
export { WarfareWorkspace as component };

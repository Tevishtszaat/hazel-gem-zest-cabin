import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as WorkspacePage } from "./workspace-page-Zt6WaVcQ.mjs";
import { n as WarfareEditor } from "./config-tabs-DonCS7cK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.warfare-h1GAO3AO.js
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

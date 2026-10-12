import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as ObjectBrowser } from "./library-page-Bk7AzJ5L.mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.factions-BUKclJRY.js
var import_jsx_runtime = require_jsx_runtime();
function FactionsWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Factions",
		kicker: "Factions.ecf · slide the roster",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
			role: "factions",
			title: "Factions",
			listCap: 400
		})
	});
}
//#endregion
export { FactionsWorkspace as component };

import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as ObjectBrowser } from "./library-page-C-airMSW.mjs";
import { t as WorkspacePage } from "./workspace-page-Zt6WaVcQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.items-9k0J7_Le.js
var import_jsx_runtime = require_jsx_runtime();
function ItemsWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "Catalog",
		title: "Items",
		kicker: "ItemsConfig.ecf · Id or +Item Name",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
			role: "items",
			title: "Items",
			listCap: 200
		})
	});
}
//#endregion
export { ItemsWorkspace as component };

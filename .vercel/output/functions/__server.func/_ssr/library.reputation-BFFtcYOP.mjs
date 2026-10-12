import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as WorkspacePage } from "./workspace-page-Zt6WaVcQ.mjs";
import { t as ReputationTable } from "./config-tabs-DonCS7cK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.reputation-BFFtcYOP.js
var import_jsx_runtime = require_jsx_runtime();
function ReputationWorkspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "World",
		title: "Reputation",
		kicker: "DefReputation.ecf",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReputationTable, {})
	});
}
//#endregion
export { ReputationWorkspace as component };

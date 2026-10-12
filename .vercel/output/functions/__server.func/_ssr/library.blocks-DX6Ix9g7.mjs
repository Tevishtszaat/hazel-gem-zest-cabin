import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as ObjectBrowser } from "./library-page-Bk7AzJ5L.mjs";
import { t as WorkspacePage } from "./workspace-page-NdJEWTzc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library.blocks-DX6Ix9g7.js
var import_jsx_runtime = require_jsx_runtime();
function BlocksWorkspace() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspacePage, {
		group: "Catalog",
		title: "Blocks",
		kicker: "BlocksConfig.ecf · Id or +Block Name",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectBrowser, {
			role: "blocks",
			title: "Blocks",
			listCap: 200,
			onCompare: () => {
				navigate({ to: "/library" });
			}
		})
	});
}
//#endregion
export { BlocksWorkspace as component };

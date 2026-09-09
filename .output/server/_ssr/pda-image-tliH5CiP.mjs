import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, g as iconCandidates, h as getImageUrl, w as resolveIconUrl } from "./button-Baqp_Mp4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pda-image-tliH5CiP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PdaImage({ name, className }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		if (!name) {
			setUrl(null);
			return;
		}
		getImageUrl(name).then((next) => {
			if (alive) setUrl(next);
		});
		return () => {
			alive = false;
		};
	}, [name]);
	if (!name || !url) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: name,
		className
	});
}
function ItemIcon({ name, fields, className }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	const custom = fields?.CustomIcon || fields?.customicon || fields?.Customicon || fields?.Icon || fields?.UnlockIcon || "";
	(0, import_react.useEffect)(() => {
		let alive = true;
		if (!name) {
			setUrl(null);
			return;
		}
		resolveIconUrl(iconCandidates(name, fields)).then((next) => {
			if (alive) setUrl(next);
		});
		return () => {
			alive = false;
		};
	}, [name, custom]);
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-block shrink-0 rounded-sm bg-elevated", className),
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: "",
		className: cn("shrink-0 object-contain", className)
	});
}
//#endregion
export { PdaImage as n, ItemIcon as t };

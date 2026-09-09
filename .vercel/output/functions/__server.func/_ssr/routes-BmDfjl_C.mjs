import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ChevronDown, g as ChevronRight, h as Copy, i as Plus, n as Trash2 } from "../_libs/lucide-react.mjs";
import { A as suggestionsFor, C as problemStats, E as splitTokens, M as usePdaStore, P as validateProject, T as selectedContext, _ as lookupCatalog, a as CHECK_NAME_KINDS, c as catalogCounts, f as counts, i as CHECKS, k as stripBbcode, l as catalogLoaded, m as decodePdaEscapes, n as BUILTIN_NAMES, o as CHECK_TYPE_KINDS, r as Button, t as AppHeader } from "./button-xNsKyIxq.mjs";
import { i as Textarea, n as Input, r as Label, t as BbText } from "./input-CefCnc3F.mjs";
import { n as PdaImage } from "./pda-image-CI_fpZ9c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BmDfjl_C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SuggestInput({ value, onChange, catalog, kinds, placeholder, list = true }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const token = list ? (value.split(",").pop() ?? "").trim() : value.trim();
	const hits = (0, import_react.useMemo)(() => catalogLoaded(catalog) && kinds.length ? suggestionsFor(catalog, kinds, token) : [], [
		catalog,
		kinds,
		token
	]);
	const apply = (name) => {
		if (!list) {
			onChange(name);
			setOpen(false);
			return;
		}
		const parts = value.split(",").map((p) => p.trim());
		parts[parts.length - 1] = name;
		onChange(parts.filter(Boolean).join(", "));
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			placeholder,
			onChange: (e) => {
				onChange(e.target.value);
				setOpen(true);
			},
			onFocus: () => setOpen(true),
			onBlur: () => window.setTimeout(() => setOpen(false), 120),
			onKeyDown: (e) => {
				if (e.key === "Enter" && hits[0]) {
					e.preventDefault();
					apply(hits[0].name);
				}
				if (e.key === "Escape") setOpen(false);
			}
		}), open && hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg",
			children: hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-elevated",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => apply(hit.name),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: hit.label && hit.label !== hit.name ? `${hit.name} · ${hit.label}` : hit.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: hit.kind
				})]
			}) }, `${hit.kind}:${hit.name}`))
		}) : null]
	});
}
function TokenStatus({ value, catalog, kinds }) {
	if (!catalogLoaded(catalog) || !kinds.length || !value.trim()) return null;
	const tokens = splitTokens(value);
	if (!tokens.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-wrap gap-1 pt-1",
		children: tokens.slice(0, 12).map((token) => {
			const hit = lookupCatalog(catalog, token);
			const builtin = BUILTIN_NAMES.has(token);
			const ok = Boolean(hit) || builtin || kinds.length === 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: `rounded-sm px-1.5 py-0.5 font-mono text-[10px] ${ok ? "bg-elevated text-muted" : "bg-danger/15 text-danger"}`,
				title: hit ? `${hit.kind} · ${hit.source}` : ok ? "Built-in" : "Not in loaded scenario files",
				children: [token, hit?.kind ? ` · ${hit.kind}` : ok ? "" : " · missing"]
			}, token);
		})
	});
}
function Inspector() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const selected = usePdaStore((s) => s.selected);
	const ctx = selectedContext(project, selected);
	const update = usePdaStore((s) => s.updateSelected);
	if (!ctx) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeHome, {});
	if (ctx.kind === "chapter") {
		const ch = ctx.chapter;
		const patch = (p) => update((proj) => {
			const i = proj.chapters.findIndex((c) => c.id === ch.id);
			if (i >= 0) proj.chapters[i] = {
				...proj.chapters[i],
				...p
			};
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Chapter",
					title: ch.chapterTitle,
					yamlKey: ch.titleKey
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: decodePdaEscapes(ch.chapterTitle),
						onChange: (e) => patch({ chapterTitle: e.target.value })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
						className: "block min-h-5 text-sm",
						text: ch.chapterTitle,
						inline: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Description",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: decodePdaEscapes(ch.description),
						onChange: (e) => patch({ description: e.target.value })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
						as: "div",
						className: "text-sm leading-relaxed text-muted",
						text: ch.description
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Category",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: ch.category,
								onChange: (e) => patch({ category: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Visibility",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: ch.visibility,
								onChange: (e) => patch({ visibility: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Player level",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: ch.playerLevel,
								onChange: (e) => patch({ playerLevel: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Picture file",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
									value: ch.pictureFile,
									onChange: (pictureFile) => patch({ pictureFile }),
									catalog,
									kinds: ["picture"],
									list: false,
									placeholder: "readfirst.jpg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenStatus, {
									value: ch.pictureFile,
									catalog,
									kinds: ["picture"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdaImage, {
									name: ch.pictureFile,
									className: "mt-2 max-h-32 w-full rounded-md object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PicturePicker, {
									selected: ch.pictureFile,
									onPick: (pictureFile) => patch({ pictureFile })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Activatable",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: ch.activatable,
							onChange: (e) => patch({ activatable: e.target.value })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Reputation level",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: ch.reputationLevel,
							onChange: (e) => patch({ reputationLevel: e.target.value })
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: ch.hideTasks,
						onChange: (e) => patch({ hideTasks: e.target.checked })
					}), "Hide tasks"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: ch.autoActivateOnGameStart,
						onChange: (e) => patch({ autoActivateOnGameStart: e.target.checked })
					}), "Auto activate on game start"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Preamble",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: decodePdaEscapes(ch.preamble),
						onChange: (e) => patch({ preamble: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Completed message",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ch.completedMessage,
						onChange: (e) => patch({ completedMessage: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rewards" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => patch({ rewards: [...ch.rewards, {
							item: "",
							type: "",
							count: 1,
							faction: ""
						}] }),
						children: "Add"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: ch.rewards.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
								placeholder: "Item",
								value: r.item,
								onChange: (item) => {
									const rewards = ch.rewards.map((x, idx) => idx === i ? {
										...x,
										item
									} : x);
									patch({ rewards });
								},
								catalog,
								kinds: [
									"item",
									"token",
									"block"
								],
								list: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Type",
								value: r.type,
								onChange: (e) => {
									const rewards = ch.rewards.map((x, idx) => idx === i ? {
										...x,
										type: e.target.value
									} : x);
									patch({ rewards });
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: r.count,
								onChange: (e) => {
									const rewards = ch.rewards.map((x, idx) => idx === i ? {
										...x,
										count: Number(e.target.value)
									} : x);
									patch({ rewards });
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
								placeholder: "Faction",
								value: r.faction,
								onChange: (faction) => {
									const rewards = ch.rewards.map((x, idx) => idx === i ? {
										...x,
										faction
									} : x);
									patch({ rewards });
								},
								catalog,
								kinds: ["faction"],
								list: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => patch({ rewards: ch.rewards.filter((_, idx) => idx !== i) }),
								children: "Remove"
							})
						]
					}, i))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extra, { extra: ch.extra })
			]
		});
	}
	if (ctx.kind === "task") {
		const tk = ctx.task;
		const patch = (p) => update((proj) => {
			for (const ch of proj.chapters) {
				const i = ch.tasks.findIndex((t) => t.id === tk.id);
				if (i >= 0) ch.tasks[i] = {
					...ch.tasks[i],
					...p
				};
			}
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Task",
					title: tk.taskTitle,
					yamlKey: tk.titleKey
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Task title",
					hint: `${stripBbcode(tk.taskTitle).length}/26 HUD`,
					warn: stripBbcode(tk.taskTitle).length > 26,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: decodePdaEscapes(tk.taskTitle),
						onChange: (e) => patch({ taskTitle: e.target.value })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
						className: "block min-h-5 text-sm",
						text: tk.taskTitle,
						inline: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Headline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: decodePdaEscapes(tk.headline),
						onChange: (e) => patch({ headline: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Start message",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: decodePdaEscapes(tk.startMessage),
						onChange: (e) => patch({ startMessage: e.target.value })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
						as: "div",
						className: "text-sm leading-relaxed text-muted",
						text: tk.startMessage
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Start delay",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tk.startDelay,
							onChange: (e) => patch({ startDelay: e.target.value })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Picture file",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
							value: tk.pictureFile,
							onChange: (pictureFile) => patch({ pictureFile }),
							catalog,
							kinds: ["picture"],
							list: false
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extra, { extra: tk.extra })
			]
		});
	}
	const ac = ctx.action;
	const patch = (p) => update((proj) => {
		for (const ch of proj.chapters) for (const tk of ch.tasks) {
			const i = tk.actions.findIndex((a) => a.id === ac.id);
			if (i >= 0) tk.actions[i] = {
				...tk.actions[i],
				...p
			};
		}
	});
	const meta = CHECKS.find((c) => c.id === ac.check);
	const nameKinds = CHECK_NAME_KINDS[ac.check] ?? [];
	const typeKinds = CHECK_TYPE_KINDS[ac.check] ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Action",
				title: ac.actionTitle,
				yamlKey: ac.titleKey
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Action title",
				hint: `${stripBbcode(ac.actionTitle).length}/24 HUD`,
				warn: stripBbcode(ac.actionTitle).length > 24,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: decodePdaEscapes(ac.actionTitle),
					onChange: (e) => patch({ actionTitle: e.target.value })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
					className: "block min-h-5 text-sm",
					text: ac.actionTitle,
					inline: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Description",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: decodePdaEscapes(ac.description),
					onChange: (e) => patch({ description: e.target.value })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
					as: "div",
					className: "text-sm leading-relaxed text-muted",
					text: ac.description
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Check",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						list: "pulse-checks",
						value: ac.check,
						onChange: (e) => patch({ check: e.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: "pulse-checks",
						children: CHECKS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: c.id }, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: meta?.hint ?? "Unknown checks are kept and exported unchanged."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Names",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
					value: ac.names,
					onChange: (names) => patch({ names }),
					catalog,
					kinds: nameKinds,
					placeholder: "BASE, HV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenStatus, {
					value: ac.names,
					catalog,
					kinds: nameKinds
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Types",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestInput, {
					value: ac.types,
					onChange: (types) => patch({ types }),
					catalog,
					kinds: typeKinds
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenStatus, {
					value: ac.types,
					catalog,
					kinds: typeKinds
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Amount",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ac.amount,
						onChange: (e) => patch({ amount: e.target.value })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Required",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ac.required,
						onChange: (e) => patch({ required: e.target.value }),
						placeholder: "NeedOne / NeedAll"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: ac.allowManualCompletion,
					onChange: (e) => patch({ allowManualCompletion: e.target.checked })
				}), "Allow manual completion"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Completed message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: ac.completedMessage,
					onChange: (e) => patch({ completedMessage: e.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extra, { extra: ac.extra })
		]
	});
}
function WelcomeHome() {
	const project = usePdaStore((s) => s.project);
	const addChapter = usePdaStore((s) => s.addChapter);
	const n = project.chapters.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-full max-w-xl flex-col justify-center gap-8 p-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.18em] text-accent",
					children: "Axis 2026"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-3xl font-medium tracking-tight",
					children: "Creator Particlewave"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
					children: n ? `${n} chapters are loaded in the tree. Pick one to edit, or keep importing files — they merge in.` : "Empyrion mission workshop. Import a real scenario, or start a chapter from scratch."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-medium text-accent",
				children: "Start fresh?"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: [
					"If you don't want to import files yet, click the green + on a category — or",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-fg underline-offset-2 hover:underline",
						onClick: () => addChapter(),
						children: "create a chapter"
					}),
					" ",
					"— then hang tasks under it."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium text-accent",
					children: "Import?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 mb-3 text-sm leading-relaxed text-muted",
					children: "Bring in PDA.yaml, PDA.csv, configs, localization, images, dialogues, factions, sectors, playfields, and blueprints. Item names then autocomplete in checks and rewards."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/import",
					className: "flex h-11 items-center justify-center rounded-sm bg-elevated text-sm font-medium tracking-wide shadow-[var(--shadow-border)] transition-[box-shadow,opacity] duration-150 hover:shadow-[var(--shadow-border-hover)]",
					children: "Import page"
				})
			] })
		]
	});
}
function Header({ kicker, title, yamlKey }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.16em] text-muted",
			children: kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
			as: "h2",
			className: "text-lg font-medium tracking-tight",
			text: title || "Untitled",
			inline: true
		}),
		yamlKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-mono text-[11px] text-subtle",
			children: ["YAML key ", yamlKey]
		}) : null
	] });
}
function Field({ label, hint, warn, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `text-[11px] ${warn ? "text-warn" : "text-subtle"}`,
				children: hint
			}) : null]
		}), children]
	});
}
function PicturePicker({ selected, onPick }) {
	const pics = usePdaStore((s) => s.catalog).entries.filter((e) => e.kind === "picture" && e.group !== "item").slice(0, 24);
	if (!pics.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-subtle",
		children: "Import PDA images to preview and pick art."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 grid grid-cols-4 gap-1.5",
		children: pics.map((pic) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onPick(pic.name),
			className: `overflow-hidden rounded-sm border ${selected === pic.name ? "border-accent" : "border-border"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdaImage, {
				name: pic.name,
				className: "h-12 w-full object-cover"
			})
		}, pic.name))
	});
}
function Extra({ extra }) {
	const keys = Object.keys(extra);
	if (!keys.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-elevated/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-[11px] uppercase tracking-[0.14em] text-muted",
			children: "Preserved from import"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1 font-mono text-[11px] text-subtle",
			children: keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-fg",
					children: k
				}),
				" ",
				previewExtra(extra[k])
			] }, k))
		})]
	});
}
function previewExtra(value) {
	if (value == null) return "";
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
	try {
		const s = JSON.stringify(value);
		return s.length > 80 ? s.slice(0, 80) + "…" : s;
	} catch {
		return "";
	}
}
function PreviewPane() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const selected = usePdaStore((s) => s.selected);
	const ctx = selectedContext(project, selected);
	const ch = ctx?.chapter ?? project.chapters[0];
	const task = ctx && "task" in ctx ? ctx.task : ch?.tasks[0];
	const issues = validateProject(project, catalog);
	const stats = problemStats(issues);
	const report = project.lastImport;
	const n = counts(project);
	const indexed = catalogCounts(catalog);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col gap-3 overflow-auto p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-elevated p-1.5 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-bg p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-accent",
							children: ch?.category || "PDA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
							as: "h3",
							className: "mt-2 text-lg font-medium leading-snug",
							text: ch?.chapterTitle || "Nothing loaded",
							inline: true
						}),
						ch?.pictureFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdaImage, {
							name: ch.pictureFile,
							className: "mt-3 max-h-40 w-full rounded-sm object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: ["Picture ", ch.pictureFile]
						})] }) : null,
						ch?.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
							as: "div",
							className: "mt-3 text-sm leading-relaxed text-muted",
							text: ch.description
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-subtle",
							children: "No description."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-sm border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
								className: "text-sm font-medium text-task",
								text: task?.headline || task?.taskTitle || "No task",
								inline: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm",
								children: (task?.actions || []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2 text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full border border-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
										className: "min-w-0",
										text: a.actionTitle,
										inline: true
									})]
								}, a.id))
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "Health"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm tabular-nums text-muted",
						children: [
							n.chapters,
							" chapters · ",
							n.tasks,
							" tasks · ",
							n.actions,
							" actions"
						]
					}),
					stats.total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/debug",
						className: "mt-2 block rounded-sm bg-elevated px-2 py-2 text-xs hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: stats.errors ? "text-danger" : "text-warn",
							children: [
								stats.errors,
								" errors · ",
								stats.warnings,
								" warnings"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-subtle",
							children: "Open debug to fix or delete entries"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-ok",
						children: "Structure looks exportable."
					})
				]
			}),
			catalogLoaded(catalog) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "Scenario files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: catalog.folderName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							indexed.item,
							" items · ",
							indexed.block,
							" blocks · ",
							indexed.entity,
							" NPCs · ",
							indexed.faction,
							" factions ·",
							" ",
							indexed.dialogue,
							" dialogues · ",
							indexed.playfield,
							" playfields · ",
							indexed.poi,
							" POIs · ",
							indexed.picture,
							" ",
							"pictures"
						]
					})
				]
			}) : null,
			report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "Last import"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm",
						children: [report.yamlName, report.csvName !== "—" ? ` + ${report.csvName}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							report.chapters,
							" chapters · ",
							report.resolved,
							" CSV strings resolved · ",
							report.csvKeys,
							" keys ·",
							" ",
							report.durationMs,
							" ms"
						]
					})
				]
			}) : null
		]
	});
}
function haystack(ch) {
	const parts = [
		ch.chapterTitle,
		ch.titleKey,
		ch.category,
		ch.description
	];
	for (const tk of ch.tasks) {
		parts.push(tk.taskTitle, tk.titleKey, tk.headline);
		for (const ac of tk.actions) parts.push(ac.actionTitle, ac.check, ac.names);
	}
	return stripBbcode(parts.filter(Boolean).join(" ")).toLowerCase();
}
function isFaqCategory(cat) {
	return /\bfaq\b/i.test(cat) || /^faq/i.test(cat);
}
function TreePane() {
	const project = usePdaStore((s) => s.project);
	const selected = usePdaStore((s) => s.selected);
	const queryRaw = usePdaStore((s) => s.query);
	const query = queryRaw.trim().toLowerCase();
	const collapsed = usePdaStore((s) => s.collapsed);
	const select = usePdaStore((s) => s.select);
	const toggle = usePdaStore((s) => s.toggleCollapsed);
	const addChapter = usePdaStore((s) => s.addChapter);
	const setQuery = usePdaStore((s) => s.setQuery);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const ch of project.chapters) {
			if (query && !haystack(ch).includes(query)) continue;
			const cat = ch.category || "Uncategorized";
			const arr = map.get(cat) ?? [];
			arr.push(ch);
			map.set(cat, arr);
		}
		return [...map.entries()].sort(([a], [b]) => Number(isFaqCategory(a)) - Number(isFaqCategory(b))).map(([cat, chapters]) => ({
			cat,
			chapters
		}));
	}, [project.chapters, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 w-full min-w-0 flex-1 flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-2 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: queryRaw,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Filter chapter / task / act…",
					className: "h-8 w-full rounded-sm border border-border bg-surface px-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeTools, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto py-1",
				onClick: () => select(null),
				children: !project.chapters.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "px-3 py-8 text-center text-sm text-muted",
					children: [
						"No chapters yet.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/import",
							className: "text-fg underline-offset-2 hover:underline",
							children: "Import a scenario"
						}),
						" ",
						"or add one with + ."
					]
				}) : !groups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-6 text-center text-sm text-muted",
					children: "No matches."
				}) : groups.map((group) => {
					const catId = `cat:${group.cat}`;
					const catOpen = !collapsed.includes(catId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sticky top-0 z-10 flex items-center gap-1 border-b border-border/60 bg-bg/95 px-1 py-0.5 backdrop-blur-sm",
							onClick: (e) => e.stopPropagation(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid size-6 place-items-center text-muted",
									onClick: () => toggle(catId),
									"aria-label": "Toggle category",
									children: catOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-w-0 flex-1 truncate py-1 text-left text-xs font-medium uppercase tracking-[0.14em] text-accent",
									onClick: () => toggle(catId),
									children: group.cat
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pr-1 text-xs tabular-nums text-subtle",
									children: group.chapters.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid size-6 place-items-center text-ok hover:text-fg",
									title: `Add chapter in ${group.cat}`,
									onClick: () => addChapter(group.cat),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
								})
							]
						}), catOpen ? group.chapters.map((ch) => {
							const open = query ? true : !collapsed.includes(ch.id);
							const active = selected?.id === ch.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								active,
								depth: 1,
								open,
								hasChildren: ch.tasks.length > 0,
								title: ch.chapterTitle,
								dot: ch.autoActivateOnGameStart ? "ok" : "muted",
								onToggle: () => toggle(ch.id),
								onClick: () => select({
									kind: "chapter",
									id: ch.id
								})
							}), open ? ch.tasks.map((tk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskBranch, {
								task: tk,
								query,
								selectedId: selected?.id,
								collapsed,
								toggle,
								select
							}, tk.id)) : null] }, ch.id);
						}) : null]
					}, group.cat);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedHint, {})
		]
	});
}
function TreeTools() {
	const addChapter = usePdaStore((s) => s.addChapter);
	const addTask = usePdaStore((s) => s.addTask);
	const addAction = usePdaStore((s) => s.addAction);
	const duplicate = usePdaStore((s) => s.duplicateSelected);
	const del = usePdaStore((s) => s.deleteSelected);
	const move = usePdaStore((s) => s.moveSelected);
	const btn = "h-7 rounded-sm px-2 text-xs text-muted hover:bg-elevated hover:text-fg";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: () => addChapter(),
				children: "+ Chapter"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: addTask,
				children: "Task"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: addAction,
				children: "Action"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-4 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: duplicate,
				title: "Duplicate",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: () => move(-1),
				children: "Up"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btn,
				onClick: () => move(1),
				children: "Down"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: `${btn} text-danger hover:text-danger`,
				onClick: del,
				title: "Delete",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
			})
		]
	});
}
function TaskBranch({ task, query, selectedId, collapsed, toggle, select }) {
	const open = query ? stripBbcode(task.taskTitle).toLowerCase().includes(query) || task.actions.some((a) => stripBbcode(`${a.actionTitle} ${a.check}`).toLowerCase().includes(query)) : collapsed.includes(`open:${task.id}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
		active: selectedId === task.id,
		depth: 2,
		open,
		hasChildren: task.actions.length > 0,
		title: task.taskTitle,
		onToggle: () => toggle(`open:${task.id}`),
		onClick: () => select({
			kind: "task",
			id: task.id
		})
	}), open ? task.actions.map((ac) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
		active: selectedId === ac.id,
		depth: 3,
		open: false,
		hasChildren: false,
		title: ac.actionTitle,
		meta: ac.check,
		onClick: () => select({
			kind: "action",
			id: ac.id
		})
	}, ac.id)) : null] });
}
var Line = (0, import_react.memo)(function Line(props) {
	const pad = props.depth === 1 ? "pl-2" : props.depth === 2 ? "pl-6" : "pl-10";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `group relative flex h-7 min-w-0 items-center gap-0.5 ${pad} pr-1 ${props.active ? "bg-elevated" : "hover:bg-elevated/50"}`,
		onClick: (e) => e.stopPropagation(),
		children: [
			props.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-y-0 left-0 w-px bg-accent" }) : null,
			props.hasChildren ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "grid size-5 shrink-0 place-items-center text-subtle",
				onClick: (e) => {
					e.stopPropagation();
					props.onToggle?.();
				},
				"aria-label": "Toggle",
				children: props.open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-5 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "flex min-w-0 flex-1 items-center gap-2 text-left",
				onClick: props.onClick,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
					className: "min-w-0 flex-1 truncate text-sm leading-5",
					text: props.title,
					inline: true
				}), props.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-16 shrink-0 truncate font-mono text-xs text-subtle",
					children: props.meta
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 shrink-0 rounded-full ${props.dot === "ok" ? "bg-ok" : props.active ? "bg-accent" : "bg-border"}` })
		]
	});
});
function SelectedHint() {
	const project = usePdaStore((s) => s.project);
	const selected = usePdaStore((s) => s.selected);
	const ctx = selectedContext(project, selected);
	if (!ctx) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-3 py-2 text-xs text-subtle",
		children: [project.chapters.length, " chapters"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-3 py-2 text-xs text-subtle",
		children: [
			ctx.kind === "chapter" && `${ctx.chapter.category || "Chapter"} · ${(ctx.ci ?? 0) + 1} / ${project.chapters.length}`,
			ctx.kind === "task" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Task · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
				className: "inline",
				text: ctx.chapter.chapterTitle,
				inline: true
			})] }),
			ctx.kind === "action" && `Action · ${ctx.action.check || "no check"}`
		]
	});
}
function Workspace() {
	const project = usePdaStore((s) => s.project);
	const catalog = usePdaStore((s) => s.catalog);
	const n = counts(project);
	const indexed = catalogCounts(catalog);
	const [tab, setTab] = (0, import_react.useState)("tree");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-bg px-4 py-1.5 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 truncate",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BbText, {
							className: "font-medium text-fg",
							text: project.name,
							inline: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums",
						children: [
							n.chapters,
							" chapters · ",
							n.tasks,
							" tasks · ",
							n.actions,
							" actions"
						]
					}),
					catalogLoaded(catalog) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						title: catalog.files.map((f) => f.path).join("\n"),
						children: [
							catalog.folderName,
							" · ",
							indexed.item,
							" items · ",
							indexed.entity,
							" NPCs · ",
							indexed.playfield,
							" playfields ·",
							" ",
							indexed.poi,
							" POIs"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No scenario folder indexed" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto hidden sm:inline text-subtle",
						children: "Autosave on this device"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 border-b border-border px-3 py-2 lg:hidden",
				children: [
					"tree",
					"edit",
					"preview"
				].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(id),
					className: `h-10 flex-1 rounded-sm text-sm capitalize ${tab === id ? "bg-elevated text-fg" : "text-muted"}`,
					children: id === "tree" ? "Structure" : id === "edit" ? "Inspector" : "Preview"
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(240px,300px)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: `min-h-0 border-r border-border ${tab === "tree" ? "flex" : "hidden"} lg:flex`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreePane, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: `min-h-0 overflow-auto border-r border-border canvas-wash ${tab === "edit" ? "block" : "hidden"} lg:block`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: `min-h-0 bg-surface/40 ${tab === "preview" ? "block" : "hidden"} lg:block`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewPane, {})
					})
				]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workspace, {});
}
//#endregion
export { Home as component };

/* PulsePDA — local Empyrion PDA editor (MVP) */
const CHECKS = [
  { id: "InventoryOpened", names: true, types: false, amount: false, hint: "Names: inventory / device / Player" },
  { id: "InventoryEmptied", names: true, types: false, amount: false, hint: "Names: inventory or device" },
  { id: "InventoryContains", names: true, types: true, amount: true, hint: "Names: inventory; Types: items" },
  { id: "ToolbarContains", names: false, types: true, amount: true, hint: "Types: items on toolbar" },
  { id: "DevicePowered", names: true, types: false, amount: false, hint: "Names or Types: device / block" },
  { id: "ConstructionQueueContains", names: true, types: true, amount: false, hint: "Names: constructor" },
  { id: "ItemsPickedUp", names: false, types: true, amount: true, hint: "Types: ore / plants" },
  { id: "ItemsConsumed", names: false, types: true, amount: true, hint: "Types: consumed items" },
  { id: "ItemsCrafted", names: true, types: true, amount: true, hint: "Types: crafted; Names: constructor" },
  { id: "ItemsUnlocked", names: false, types: true, amount: false, hint: "Types: unlocked items" },
  { id: "SubjectKilled", names: true, types: false, amount: true, hint: "Names: NPC / fauna" },
  { id: "StructureSpawned", names: true, types: false, amount: false, hint: "Names: Base, HV, SV, CV" },
  { id: "MainPowerSwitched", names: true, types: false, amount: false, hint: "Names: Base, HV, SV, CV" },
  { id: "BlocksPlaced", names: true, types: true, amount: true, hint: "Names: structure; Types: block" },
  { id: "BlocksRemoved", names: true, types: true, amount: true, hint: "Names: structure; Types: block" },
  { id: "BlockDestroyed", names: true, types: true, amount: true, hint: "Optional POI name + block type" },
  { id: "NearPoi", names: true, types: false, amount: false, hint: "Names: POI group or filename" },
  { id: "NearUnit", names: true, types: false, amount: false, hint: "Names: [POI, Unit]" },
  { id: "NearResource", names: false, types: true, amount: false, hint: "Types: resource" },
  { id: "PoiDiscovered", names: false, types: true, amount: false, hint: "Types / POI identifier" },
  { id: "ResourceDiscovered", names: true, types: false, amount: false, hint: "Names: resource" },
  { id: "Signal", names: true, types: false, amount: false, hint: "Names: signal* from blueprint" },
  { id: "WindowOpened", names: true, types: false, amount: false, hint: "Names: Pda, Player, inventory window" },
  { id: "PlayfieldEntered", names: true, types: false, amount: false, hint: "Names: playfield from Sectors.yaml" },
  { id: "PlayfieldTypeEntered", names: true, types: false, amount: false, hint: "Names: playfield template" },
  { id: "ArmorEquipped", names: false, types: true, amount: false, hint: "Types: armor item" }
];

const CATEGORIES = ["SoloMission", "FactionMission", "Tutorial", "Knowledgebase", "FAQ"];
const VISIBILITY = ["Always", "ByLevel", "WhenRewarded", "ChapterActivation"];
const REQUIRED = ["", "NeedOne", "NeedAll"];
const STORE_KEY = "pulsepda.project.v1";

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id" + Math.random().toString(16).slice(2));

const sampleProject = () => ({
  name: "First Landing",
  creator: "PulsePDA",
  exportMode: "keys",
  chapters: [
    {
      id: uid(),
      chapterTitle: "First Landing",
      description: "You survived the drop. Stabilize life support, then get a constructor running before nightfall.",
      pictureFile: "Chapter1.jpg",
      category: "Tutorial",
      playerLevel: 1,
      visibility: "Always",
      autoActivateOnGameStart: true,
      rewards: [{ item: "IronOre", count: 50 }, { item: "XP", count: 200 }],
      tasks: [
        {
          id: uid(),
          taskTitle: "Secure the pod",
          headline: "Secure the crash site",
          pictureFile: "",
          startDelay: 0,
          startMessage: "Check the wreck and gather what still works.",
          actions: [
            {
              id: uid(),
              actionTitle: "Open inventory",
              description: "Press TAB and confirm you still have the survival tool.",
              check: "WindowOpened",
              names: "Player",
              types: "",
              amount: "",
              required: "",
              allowManualCompletion: true,
              completedMessage: "norm;20|Good. You are not empty-handed."
            },
            {
              id: uid(),
              actionTitle: "Place constructor",
              description: "Drop a Survival Constructor from the toolbar and power the site.",
              check: "BlocksPlaced",
              names: "BASE",
              types: "ConstructorSurvival",
              amount: "1",
              required: "",
              allowManualCompletion: false,
              completedMessage: "Constructor online. Now we can rebuild."
            }
          ]
        },
        {
          id: uid(),
          taskTitle: "Gather scrap",
          headline: "",
          pictureFile: "",
          startDelay: 0,
          startMessage: "",
          actions: [
            {
              id: uid(),
              actionTitle: "Collect iron ore",
              description: "Mine nearby rocks until you have enough iron to keep crafting.",
              check: "ItemsPickedUp",
              names: "",
              types: "IronOre",
              amount: "20",
              required: "",
              allowManualCompletion: false,
              completedMessage: "$"
            }
          ]
        }
      ]
    }
  ]
});

const state = {
  project: load() || sampleProject(),
  selected: null,
  collapsed: new Set(),
  query: "",
  history: [],
  suppress: false
};

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.project));
  const el = document.getElementById("statSave");
  el.textContent = "Saved " + new Date().toLocaleTimeString();
}

function snapshot() {
  if (state.suppress) return;
  state.history.push(JSON.stringify(state.project));
  if (state.history.length > 40) state.history.shift();
}

function undo() {
  const prev = state.history.pop();
  if (!prev) return;
  state.suppress = true;
  state.project = JSON.parse(prev);
  state.suppress = false;
  persistAndRender();
}

function persistAndRender() {
  save();
  render();
}

function allNodes() {
  const out = [];
  state.project.chapters.forEach((ch, ci) => {
    out.push({ type: "chapter", chapter: ch, path: [ci] });
    ch.tasks.forEach((tk, ti) => {
      out.push({ type: "task", chapter: ch, task: tk, path: [ci, ti] });
      tk.actions.forEach((ac, ai) => {
        out.push({ type: "action", chapter: ch, task: tk, action: ac, path: [ci, ti, ai] });
      });
    });
  });
  return out;
}

function selectedRef() {
  if (!state.selected) return null;
  return allNodes().find((n) => keyOf(n) === state.selected) || null;
}

function keyOf(n) {
  if (n.type === "chapter") return n.chapter.id;
  if (n.type === "task") return n.task.id;
  return n.action.id;
}

function titleOf(n) {
  if (n.type === "chapter") return n.chapter.chapterTitle || "Untitled chapter";
  if (n.type === "task") return n.task.taskTitle || "Untitled task";
  return n.action.actionTitle || "Untitled action";
}

function matchesQuery(n) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const blob = JSON.stringify(n.chapter && n.type === "chapter" ? n.chapter : n.task && n.type === "task" ? n.task : n.action).toLowerCase();
  return blob.includes(q);
}

function newChapter() {
  return {
    id: uid(),
    chapterTitle: "New chapter",
    description: "",
    pictureFile: "",
    category: "SoloMission",
    playerLevel: 1,
    visibility: "Always",
    autoActivateOnGameStart: false,
    rewards: [],
    tasks: [newTask()]
  };
}
function newTask() {
  return {
    id: uid(),
    taskTitle: "New task",
    headline: "",
    pictureFile: "",
    startDelay: 0,
    startMessage: "",
    actions: [newAction()]
  };
}
function newAction() {
  return {
    id: uid(),
    actionTitle: "New action",
    description: "",
    check: "AllowManual",
    names: "",
    types: "",
    amount: "",
    required: "",
    allowManualCompletion: true,
    completedMessage: "$"
  };
}

function addChapter() {
  snapshot();
  const ch = newChapter();
  state.project.chapters.push(ch);
  state.selected = ch.id;
  persistAndRender();
}
function addTask() {
  const sel = selectedRef();
  const chapter = sel ? sel.chapter : state.project.chapters[0];
  if (!chapter) return addChapter();
  snapshot();
  const tk = newTask();
  chapter.tasks.push(tk);
  state.selected = tk.id;
  persistAndRender();
}
function addAction() {
  const sel = selectedRef();
  if (!sel) return addTask();
  const task = sel.task || sel.chapter.tasks[sel.chapter.tasks.length - 1];
  if (!task) return addTask();
  snapshot();
  const ac = newAction();
  task.actions.push(ac);
  state.selected = ac.id;
  persistAndRender();
}

function deleteSelected() {
  const sel = selectedRef();
  if (!sel) return;
  snapshot();
  if (sel.type === "chapter") {
    state.project.chapters = state.project.chapters.filter((c) => c.id !== sel.chapter.id);
    state.selected = state.project.chapters[0]?.id || null;
  } else if (sel.type === "task") {
    sel.chapter.tasks = sel.chapter.tasks.filter((t) => t.id !== sel.task.id);
    state.selected = sel.chapter.id;
  } else {
    sel.task.actions = sel.task.actions.filter((a) => a.id !== sel.action.id);
    state.selected = sel.task.id;
  }
  persistAndRender();
}

function duplicateSelected() {
  const sel = selectedRef();
  if (!sel) return;
  snapshot();
  const clone = JSON.parse(JSON.stringify(sel.type === "chapter" ? sel.chapter : sel.type === "task" ? sel.task : sel.action));
  const retag = (node) => {
    if (node && typeof node === "object") {
      if (node.id) node.id = uid();
      Object.values(node).forEach(retag);
    }
  };
  retag(clone);
  if (sel.type === "chapter") {
    clone.chapterTitle += " copy";
    state.project.chapters.splice(sel.path[0] + 1, 0, clone);
    state.selected = clone.id;
  } else if (sel.type === "task") {
    clone.taskTitle += " copy";
    sel.chapter.tasks.splice(sel.path[1] + 1, 0, clone);
    state.selected = clone.id;
  } else {
    clone.actionTitle += " copy";
    sel.task.actions.splice(sel.path[2] + 1, 0, clone);
    state.selected = clone.id;
  }
  persistAndRender();
}

function moveSelected(dir) {
  const sel = selectedRef();
  if (!sel) return;
  snapshot();
  const swap = (arr, i) => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return i;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return j;
  };
  if (sel.type === "chapter") swap(state.project.chapters, sel.path[0]);
  if (sel.type === "task") swap(sel.chapter.tasks, sel.path[1]);
  if (sel.type === "action") swap(sel.task.actions, sel.path[2]);
  persistAndRender();
}

function validate() {
  const issues = [];
  state.project.chapters.forEach((ch, ci) => {
    if (!ch.chapterTitle.trim()) issues.push({ level: "error", msg: `Chapter ${ci + 1} needs a title.`, id: ch.id });
    if (!ch.tasks.length) issues.push({ level: "error", msg: `"${ch.chapterTitle || "Chapter"}" needs at least one task.`, id: ch.id });
    ch.tasks.forEach((tk, ti) => {
      if (!tk.taskTitle.trim()) issues.push({ level: "error", msg: `Task ${ti + 1} in "${ch.chapterTitle}" needs a title.`, id: tk.id });
      if ((tk.taskTitle || "").length > 26) issues.push({ level: "warning", msg: `"${tk.taskTitle}" is ${tk.taskTitle.length} chars. HUD wraps after 26.`, id: tk.id });
      if (!tk.actions.length) issues.push({ level: "error", msg: `Task "${tk.taskTitle}" needs at least one action.`, id: tk.id });
      tk.actions.forEach((ac) => {
        if (!ac.actionTitle.trim()) issues.push({ level: "error", msg: `An action under "${tk.taskTitle}" has no title.`, id: ac.id });
        if ((ac.actionTitle || "").length > 24) issues.push({ level: "warning", msg: `"${ac.actionTitle}" is ${ac.actionTitle.length} chars. HUD wraps after 24.`, id: ac.id });
        if (!ac.check) issues.push({ level: "error", msg: `"${ac.actionTitle}" has no Check.`, id: ac.id });
        const meta = CHECKS.find((c) => c.id === ac.check);
        if (meta?.names && !String(ac.names || "").trim() && ac.check !== "AllowManual") {
          issues.push({ level: "warning", msg: `"${ac.actionTitle}" (${ac.check}) usually needs Names.`, id: ac.id });
        }
        if (meta?.types && !String(ac.types || "").trim()) {
          issues.push({ level: "warning", msg: `"${ac.actionTitle}" (${ac.check}) usually needs Types.`, id: ac.id });
        }
        if (!ac.completedMessage) issues.push({ level: "warning", msg: `"${ac.actionTitle}" has no CompletedMessage. Use $ for default.`, id: ac.id });
      });
    });
  });
  if (!state.project.chapters.length) issues.push({ level: "error", msg: "Add a chapter to start a PDA journey.", id: null });
  return issues;
}

function slug(text, prefix, used) {
  const base = (text || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 28) || "item";
  let key = prefix + base;
  let n = 2;
  while (used.has(key)) {
    key = prefix + base + "_" + n;
    n += 1;
  }
  used.add(key);
  return key;
}

function listFrom(str) {
  return String(str || "")
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toYamlDoc() {
  const used = new Set();
  const csvRows = [["KEY", "English"]];
  const useKeys = state.project.exportMode !== "literal";
  const put = (prefix, text) => {
    if (!useKeys) return text;
    const key = slug(text, prefix, used);
    csvRows.push([key, text || ""]);
    return key;
  };

  const chapters = state.project.chapters.map((ch) => {
    const node = {
      ChapterTitle: put("ch_", ch.chapterTitle),
      Category: ch.category || "SoloMission",
      Description: put("chd_", ch.description),
      Visibility: ch.visibility || "Always",
      PlayerLevel: Number(ch.playerLevel || 1)
    };
    if (ch.pictureFile) node.PictureFile = ch.pictureFile;
    if (ch.autoActivateOnGameStart) node.AutoActivateOnGameStart = true;
    if (ch.rewards?.length) {
      node.Rewards = ch.rewards
        .filter((r) => r.item)
        .map((r) => ({ Item: r.item, Count: Number(r.count || 1) }));
    }
    node.Tasks = ch.tasks.map((tk) => {
      const t = {
        TaskTitle: put("tk_", tk.taskTitle)
      };
      if (tk.headline) t.Headline = put("tkh_", tk.headline);
      if (tk.pictureFile) t.PictureFile = tk.pictureFile;
      if (Number(tk.startDelay)) t.StartDelay = Number(tk.startDelay);
      if (tk.startMessage) t.StartMessage = put("tks_", tk.startMessage);
      t.Actions = tk.actions.map((ac) => {
        const a = {
          ActionTitle: put("ac_", ac.actionTitle),
          Description: put("acd_", ac.description || "--"),
          Check: ac.check === "AllowManual" ? "WindowOpened" : ac.check || "WindowOpened"
        };
        const names = listFrom(ac.names);
        const types = listFrom(ac.types);
        if (names.length) a.Names = names;
        if (types.length) a.Types = types;
        if (ac.amount !== "" && ac.amount != null) a.Amount = Number(ac.amount);
        if (ac.required) a.Required = ac.required;
        if (ac.allowManualCompletion) a.AllowManualCompletion = true;
        a.CompletedMessage = ac.completedMessage || "$";
        if (ac.check === "AllowManual") {
          a.Names = a.Names || ["Pda"];
          a.AllowManualCompletion = true;
        }
        return a;
      });
      return t;
    });
    return node;
  });

  const doc = {
    Creator: state.project.creator || "PulsePDA",
    Chapters: chapters
  };
  return { yaml: jsyaml.dump(doc, { lineWidth: 120, noRefs: true, quotingType: '"' }), csv: csvRows };
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportYaml() {
  const { yaml } = toYamlDoc();
  download("PDA.yaml", yaml, "text/yaml");
}
function exportCsv() {
  const { csv } = toYamlDoc();
  const text = csv.map((row) => row.map(csvEscape).join(",")).join("\n");
  download("PDA.csv", text, "text/csv");
}
function exportBoth() {
  exportYaml();
  exportCsv();
}
function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return {};
  const map = {};
  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]).map((h) => h.trim());
  const keyIdx = 0;
  let engIdx = header.findIndex((h) => /english|en/i.test(h));
  if (engIdx < 0) engIdx = 1;
  lines.slice(1).forEach((line) => {
    const cols = parseLine(line);
    if (cols[keyIdx]) map[cols[keyIdx].trim()] = (cols[engIdx] || cols[1] || "").trim();
  });
  return map;
}

function asList(val) {
  if (Array.isArray(val)) return val.join(", ");
  if (val == null) return "";
  return String(val);
}

function importYaml(text, csvMap = {}) {
  const doc = jsyaml.load(text);
  if (!doc || typeof doc !== "object") throw new Error("YAML did not contain an object.");
  const chaptersIn = doc.Chapters || doc.chapters;
  if (!Array.isArray(chaptersIn)) throw new Error("No Chapters array found.");
  const resolve = (v) => (v && csvMap[v] ? csvMap[v] : v || "");
  snapshot();
  state.project.creator = doc.Creator || state.project.creator || "PulsePDA";
  state.project.chapters = chaptersIn.map((ch) => ({
    id: uid(),
    chapterTitle: resolve(ch.ChapterTitle || ch.chapterTitle),
    description: resolve(ch.Description || ch.description),
    pictureFile: ch.PictureFile || "",
    category: ch.Category || "SoloMission",
    playerLevel: ch.PlayerLevel || 1,
    visibility: ch.Visibility || "Always",
    autoActivateOnGameStart: !!ch.AutoActivateOnGameStart,
    rewards: (ch.Rewards || []).map((r) => ({ item: r.Item || r.item || "", count: r.Count || r.count || 1 })),
    tasks: (ch.Tasks || []).map((tk) => ({
      id: uid(),
      taskTitle: resolve(tk.TaskTitle || tk.taskTitle),
      headline: resolve(tk.Headline || ""),
      pictureFile: tk.PictureFile || "",
      startDelay: tk.StartDelay || 0,
      startMessage: resolve(tk.StartMessage || ""),
      actions: (tk.Actions || []).map((ac) => ({
        id: uid(),
        actionTitle: resolve(ac.ActionTitle || ac.actionTitle),
        description: resolve(ac.Description || ""),
        check: ac.Check || "WindowOpened",
        names: asList(ac.Names),
        types: asList(ac.Types),
        amount: ac.Amount ?? "",
        required: ac.Required || "",
        allowManualCompletion: !!ac.AllowManualCompletion,
        completedMessage: ac.CompletedMessage || "$"
      }))
    }))
  }));
  state.selected = state.project.chapters[0]?.id || null;
  persistAndRender();
}

function renderTree() {
  const root = document.getElementById("tree");
  if (!state.project.chapters.length) {
    root.innerHTML = `<div class="empty">No chapters yet.<br/>Hit + Chapter and start a journey.</div>`;
    return;
  }
  const html = state.project.chapters.map((ch) => {
    const chActive = state.selected === ch.id ? "active" : "";
    const collapsed = state.collapsed.has(ch.id);
    const tasks = collapsed ? "" : ch.tasks.map((tk) => {
      const tkCollapsed = state.collapsed.has(tk.id);
      const actions = tkCollapsed ? "" : tk.actions.map((ac) => {
        if (state.query && !matchesQuery({ type: "action", action: ac, task: tk, chapter: ch })) return "";
        return `<div class="tree-item action ${state.selected === ac.id ? "active" : ""}" data-id="${ac.id}">
          <span class="caret">•</span>
          <div>
            <div class="kind">Action</div>
            <div class="title">${esc(ac.actionTitle || "Untitled")}</div>
          </div>
          <div class="meta">${esc(ac.check || "")}</div>
        </div>`;
      }).join("");
      if (state.query && !actions && !matchesQuery({ type: "task", task: tk, chapter: ch })) return "";
      return `<div class="tree-item task ${state.selected === tk.id ? "active" : ""}" data-id="${tk.id}">
        <span class="caret" data-toggle="${tk.id}">${tkCollapsed ? "▸" : "▾"}</span>
        <div>
          <div class="kind">Task</div>
          <div class="title">${esc(tk.taskTitle || "Untitled")}</div>
        </div>
        <div class="meta">${tk.actions.length}</div>
      </div>
      <div class="children">${actions}</div>`;
    }).join("");
    return `<div class="tree-item chapter ${chActive}" data-id="${ch.id}">
      <span class="caret" data-toggle="${ch.id}">${collapsed ? "▸" : "▾"}</span>
      <div>
        <div class="kind">${esc(ch.category || "Chapter")}</div>
        <div class="title">${esc(ch.chapterTitle || "Untitled")}</div>
      </div>
      <div class="meta">${ch.tasks.length}</div>
    </div>
    <div class="children">${tasks}</div>`;
  }).join("");
  root.innerHTML = html;
}

function field(label, inner, extra = "") {
  return `<div class="field"><label>${label}${extra}</label>${inner}</div>`;
}

function renderInspector() {
  const box = document.getElementById("inspector");
  const title = document.getElementById("inspectTitle");
  const sel = selectedRef();
  if (!sel) {
    title.textContent = "Inspector";
    box.innerHTML = `<div class="empty">Select a chapter, task, or action.<br/>The form follows whatever you click.</div>`;
    return;
  }
  if (sel.type === "chapter") {
    const ch = sel.chapter;
    title.textContent = "Chapter";
    box.innerHTML = `<div class="form">
      ${field("Chapter title", `<input data-bind="chapterTitle" value="${esc(ch.chapterTitle)}">`)}
      ${field("Description", `<textarea data-bind="description">${esc(ch.description)}</textarea>`)}
      <div class="row">
        ${field("Category", `<select data-bind="category">${CATEGORIES.map((c) => `<option ${c === ch.category ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
        ${field("Visibility", `<select data-bind="visibility">${VISIBILITY.map((c) => `<option ${c === ch.visibility ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
      </div>
      <div class="row">
        ${field("Player level", `<input type="number" min="1" data-bind="playerLevel" value="${esc(ch.playerLevel)}">`)}
        ${field("Picture file", `<input data-bind="pictureFile" value="${esc(ch.pictureFile)}" placeholder="Chapter1.jpg">`)}
      </div>
      ${field("Auto activate on game start", `<select data-bind="autoActivateOnGameStart"><option value="false" ${!ch.autoActivateOnGameStart ? "selected" : ""}>No</option><option value="true" ${ch.autoActivateOnGameStart ? "selected" : ""}>Yes</option></select>`)}
      <div class="field">
        <label>Rewards <button class="btn" id="addReward" type="button">+ item</button></label>
        <div id="rewards">${(ch.rewards || []).map((r, i) => `
          <div class="list-card">
            <div class="mini">
              <input data-reward="${i}" data-k="item" value="${esc(r.item)}" placeholder="IronOre / XP / Credits">
              <input data-reward="${i}" data-k="count" type="number" value="${esc(r.count)}">
              <button class="btn danger" data-del-reward="${i}">✕</button>
            </div>
          </div>`).join("") || `<div class="hint">No rewards yet.</div>`}
        </div>
      </div>
    </div>`;
  } else if (sel.type === "task") {
    const tk = sel.task;
    title.textContent = "Task";
    const over = (tk.taskTitle || "").length > 26 ? "over" : "";
    box.innerHTML = `<div class="form">
      ${field("Task title", `<input data-bind="taskTitle" value="${esc(tk.taskTitle)}">`, `<span class="counter ${over}">${(tk.taskTitle || "").length}/26 HUD</span>`)}
      ${field("Headline", `<input data-bind="headline" value="${esc(tk.headline)}" placeholder="Defaults to task title">`)}
      ${field("Start message", `<textarea data-bind="startMessage">${esc(tk.startMessage)}</textarea>`)}
      <div class="row">
        ${field("Start delay (sec)", `<input type="number" min="0" data-bind="startDelay" value="${esc(tk.startDelay)}">`)}
        ${field("Picture file", `<input data-bind="pictureFile" value="${esc(tk.pictureFile)}">`)}
      </div>
      <p class="hint">Task order in the tree is the order the player must complete them.</p>
    </div>`;
  } else {
    const ac = sel.action;
    const meta = CHECKS.find((c) => c.id === ac.check);
    const over = (ac.actionTitle || "").length > 24 ? "over" : "";
    box.innerHTML = `<div class="form">
      ${field("Action title", `<input data-bind="actionTitle" value="${esc(ac.actionTitle)}">`, `<span class="counter ${over}">${(ac.actionTitle || "").length}/24 HUD</span>`)}
      ${field("Description", `<textarea data-bind="description">${esc(ac.description)}</textarea>`)}
      ${field("Check", `<select data-bind="check"><option ${ac.check === "AllowManual" ? "selected" : ""} value="AllowManual">AllowManual (helper)</option>${CHECKS.map((c) => `<option ${c.id === ac.check ? "selected" : ""}>${c.id}</option>`).join("")}</select>`)}
      <p class="hint">${meta ? meta.hint : "Manual completion helper maps to WindowOpened + AllowManualCompletion."}</p>
      ${field("Names", `<input data-bind="names" value="${esc(ac.names)}" placeholder="BASE, HV  or  MyPoi">`)}
      ${field("Types", `<input data-bind="types" value="${esc(ac.types)}" placeholder="IronOre, ConstructorSurvival">`)}
      <div class="row">
        ${field("Amount", `<input data-bind="amount" value="${esc(ac.amount)}" placeholder="optional">`)}
        ${field("Required", `<select data-bind="required">${REQUIRED.map((c) => `<option value="${c}" ${c === (ac.required || "") ? "selected" : ""}>${c || "—"}</option>`).join("")}</select>`)}
      </div>
      ${field("Allow manual completion", `<select data-bind="allowManualCompletion"><option value="false" ${!ac.allowManualCompletion ? "selected" : ""}>No</option><option value="true" ${ac.allowManualCompletion ? "selected" : ""}>Yes</option></select>`)}
      ${field("Completed message", `<input data-bind="completedMessage" value="${esc(ac.completedMessage)}" placeholder="$ or custom / BBCode">`)}
    </div>`;
  }
}

function renderPreview() {
  const sel = selectedRef();
  const issues = validate();
  const preview = document.getElementById("preview");
  const ch = sel?.chapter || state.project.chapters[0];
  if (!ch) {
    preview.innerHTML = `<div class="tab">PDA</div><h3>Nothing loaded</h3><p class="hint">Create a chapter to preview the in-game list.</p>`;
  } else {
    const task = sel?.task || ch.tasks[0];
    preview.innerHTML = `
      <div class="tab">${esc(ch.category || "Mission")}</div>
      <h3>${esc(ch.chapterTitle || "Untitled chapter")}</h3>
      <div class="pic">${esc(ch.pictureFile || "No picture file yet")}</div>
      <p>${esc(ch.description || "No description.")}</p>
      <div class="hud">
        <div class="task">${esc(task?.headline || task?.taskTitle || "No task")}</div>
        <ul>${(task?.actions || []).map((a) => `<li>☐ ${esc(a.actionTitle || "Untitled")}</li>`).join("") || "<li>No actions</li>"}</ul>
      </div>`;
  }
  document.getElementById("issues").innerHTML = issues.length
    ? issues.map((i) => `<div class="issue ${i.level}" data-goto="${i.id || ""}">${i.level === "error" ? "Error" : "Watch"} — ${esc(i.msg)}</div>`).join("")
    : `<div class="issue" style="border-color:rgba(110,231,168,.35)">All clear. Export when you are ready.</div>`;

  const counts = allNodes();
  document.getElementById("statName").textContent = state.project.name || "Untitled";
  document.getElementById("statCh").textContent = state.project.chapters.length;
  document.getElementById("statTk").textContent = counts.filter((n) => n.type === "task").length;
  document.getElementById("statAc").textContent = counts.filter((n) => n.type === "action").length;
  const err = issues.filter((i) => i.level === "error").length;
  const warn = issues.filter((i) => i.level === "warning").length;
  const stat = document.getElementById("statIssues");
  stat.innerHTML = `Issues <b class="${err ? "bad" : warn ? "warn" : "ok"}">${issues.length}</b>`;
}

function render() {
  renderTree();
  renderInspector();
  renderPreview();
}

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bindInspectorEvents(e) {
  const sel = selectedRef();
  if (!sel) return;
  const target = e.target;
  if (target.id === "addReward") {
    snapshot();
    sel.chapter.rewards = sel.chapter.rewards || [];
    sel.chapter.rewards.push({ item: "", count: 1 });
    persistAndRender();
    return;
  }
  if (target.dataset.delReward != null) {
    snapshot();
    sel.chapter.rewards.splice(Number(target.dataset.delReward), 1);
    persistAndRender();
    return;
  }
  if (target.dataset.reward != null) {
    snapshot();
    const r = sel.chapter.rewards[Number(target.dataset.reward)];
    r[target.dataset.k] = target.value;
    save();
    renderPreview();
    return;
  }
  if (target.dataset.bind) {
    if (e.type === "change") snapshot();
    const node = sel.type === "chapter" ? sel.chapter : sel.type === "task" ? sel.task : sel.action;
    let val = target.value;
    if (target.dataset.bind === "autoActivateOnGameStart" || target.dataset.bind === "allowManualCompletion") {
      val = val === "true";
    }
    node[target.dataset.bind] = val;
    save();
    renderTree();
    renderPreview();
    if (e.type === "input" && ["taskTitle", "actionTitle", "chapterTitle"].includes(target.dataset.bind)) {
      renderInspectorKeepFocus(target);
    }
  }
}

function renderInspectorKeepFocus(el) {
  const bind = el.dataset.bind;
  const start = el.selectionStart;
  renderInspector();
  const next = document.querySelector(`[data-bind="${bind}"]`);
  if (next) {
    next.focus();
    if (typeof start === "number") next.setSelectionRange(start, start);
  }
}

function wire() {
  document.getElementById("addChapter").onclick = addChapter;
  document.getElementById("addTask").onclick = addTask;
  document.getElementById("addAction").onclick = addAction;
  document.getElementById("dupNode").onclick = duplicateSelected;
  document.getElementById("delNode").onclick = deleteSelected;
  document.getElementById("moveUp").onclick = () => moveSelected(-1);
  document.getElementById("moveDown").onclick = () => moveSelected(1);
  document.getElementById("btnUndo").onclick = undo;
  document.getElementById("btnImport").onclick = () => document.getElementById("importModal").classList.add("open");
  document.getElementById("closeImport").onclick = () => document.getElementById("importModal").classList.remove("open");
  document.getElementById("btnYaml").onclick = exportYaml;
  document.getElementById("btnCsv").onclick = exportCsv;
  document.getElementById("btnBoth").onclick = exportBoth;
  document.getElementById("search").oninput = (e) => { state.query = e.target.value; renderTree(); };

  document.getElementById("tree").onclick = (e) => {
    const toggle = e.target.dataset.toggle;
    if (toggle) {
      if (state.collapsed.has(toggle)) state.collapsed.delete(toggle);
      else state.collapsed.add(toggle);
      renderTree();
      return;
    }
    const item = e.target.closest(".tree-item");
    if (!item) return;
    state.selected = item.dataset.id;
    render();
  };

  document.getElementById("inspector").addEventListener("input", bindInspectorEvents);
  document.getElementById("inspector").addEventListener("change", bindInspectorEvents);
  document.getElementById("inspector").addEventListener("click", bindInspectorEvents);
  document.getElementById("inspector").addEventListener("focusin", () => snapshot());

  document.getElementById("issues").onclick = (e) => {
    const id = e.target.closest("[data-goto]")?.dataset.goto;
    if (id) { state.selected = id; render(); }
  };

  document.getElementById("loadSample").onclick = () => {
    snapshot();
    state.project = sampleProject();
    state.selected = state.project.chapters[0].id;
    document.getElementById("importModal").classList.remove("open");
    persistAndRender();
  };
  document.getElementById("wipeAll").onclick = () => {
    if (!confirm("Clear the whole local project?")) return;
    snapshot();
    state.project = { name: "Untitled", creator: "PulsePDA", exportMode: "keys", chapters: [] };
    state.selected = null;
    persistAndRender();
  };

  const drop = document.getElementById("dropzone");
  const input = document.getElementById("fileInput");
  drop.onclick = () => input.click();
  drop.ondragover = (e) => { e.preventDefault(); drop.textContent = "Drop to import"; };
  drop.ondragleave = () => { drop.textContent = "Drop files here or click to choose"; };
  drop.ondrop = (e) => { e.preventDefault(); ingestFiles(e.dataTransfer.files); };
  input.onchange = () => ingestFiles(input.files);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      exportBoth();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      undo();
    }
  });
}

async function ingestFiles(fileList) {
  const files = [...fileList];
  let yamlText = "";
  let csvMap = {};
  for (const f of files) {
    const text = await f.text();
    if (/\.csv$/i.test(f.name) || f.name.toLowerCase().includes("pda.csv")) csvMap = { ...csvMap, ...parseCsv(text) };
    else yamlText = text;
  }
  if (!yamlText && files[0]) yamlText = await files[0].text();
  try {
    importYaml(yamlText, csvMap);
    document.getElementById("importModal").classList.remove("open");
  } catch (err) {
    alert("Import failed: " + err.message);
  }
}

wire();
if (!state.selected && state.project.chapters[0]) state.selected = state.project.chapters[0].id;
render();
save();

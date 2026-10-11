import { stringifyEcfObjects } from "./ecf.ts";
import { CONFIG_METAS } from "./config-roles.ts";
import {
  catalogText,
  dialogueCsvTable,
  dialogueDocFor,
  localizationTable,
  objectsFor,
  writeDialogues,
  writeDialoguesCsv,
  writeLocalization,
} from "./library.ts";
import { catalogLoaded, type ScenarioCatalog } from "./scenario-index.ts";
import type { PdaProject } from "./types.ts";
import { exportCsv, exportYaml } from "./yaml-export.ts";

export type ExportSlot = {
  id: string;
  label: string;
  filename: string;
  mime: string;
  ready: boolean;
  detail: string;
  build: () => string;
};

function fileName(catalog: ScenarioCatalog, role: string, fallback: string) {
  const path = catalogText(catalog, role)?.path || catalog.files.find((f) => f.role === role)?.path;
  if (!path) return fallback;
  return path.split(/[\\/]/).pop() || fallback;
}

export function exportSlots(project: PdaProject, catalog: ScenarioCatalog): ExportSlot[] {
  const loca = localizationTable(catalog);
  const dialogues = dialogueDocFor(catalog);
  const dlgCsv = dialogueCsvTable(catalog, dialogues);
  const locaKeys = Object.keys(loca.rows).length;
  const dlgCsvKeys = Object.keys(dlgCsv.rows).length;
  const loaded = catalogLoaded(catalog);

  const slots: ExportSlot[] = [
    {
      id: "pdaYaml",
      label: "PDA.yaml",
      filename: "PDA.yaml",
      mime: "text/yaml",
      ready: project.chapters.length > 0,
      detail: project.chapters.length ? `${project.chapters.length} chapters` : "No chapters yet",
      build: () => exportYaml(project),
    },
    {
      id: "pdaCsv",
      label: "PDA.csv",
      filename: "PDA.csv",
      mime: "text/csv",
      ready: project.chapters.length > 0 || Object.keys(project.csv.rows).length > 0,
      detail: `${Object.keys(project.csv.rows).length} keys`,
      build: () => exportCsv(project),
    },
  ];

  for (const meta of CONFIG_METAS) {
    if (meta.format === "yaml") {
      const text = catalogText(catalog, meta.role)?.text ?? "";
      slots.push({
        id: meta.role,
        label: meta.label,
        filename: fileName(catalog, meta.role, meta.file),
        mime: "text/yaml",
        ready: text.trim().length > 0,
        detail: text.trim() ? `${text.split(/\r?\n/).length} lines` : loaded ? `No ${meta.file} loaded` : `Import ${meta.file}`,
        build: () => text,
      });
      continue;
    }
    const objects = objectsFor(catalog, meta.role);
    slots.push({
      id: meta.role,
      label: meta.label,
      filename: fileName(catalog, meta.role, meta.file),
      mime: "text/plain",
      ready: objects.length > 0,
      detail: objects.length
        ? `${objects.length} entries`
        : loaded
          ? `No ${meta.file} loaded`
          : `Import ${meta.file}`,
      build: () => stringifyEcfObjects(objects),
    });
  }

  slots.push(
    {
      id: "localization",
      label: "Localization",
      filename: fileName(catalog, "localization", "Localization.csv"),
      mime: "text/csv",
      ready: locaKeys > 0,
      detail: locaKeys ? `${locaKeys} keys · ${loca.languages.join(", ") || "English"}` : "Import Localization.csv",
      build: () => writeLocalization(loca),
    },
    {
      id: "dialogues",
      label: "Dialogues.ecf",
      filename: fileName(catalog, "dialogues", "Dialogues.ecf"),
      mime: "text/plain",
      ready: dialogues.states.length > 0,
      detail: dialogues.states.length ? `${dialogues.states.length} states` : "Import Dialogues.ecf",
      build: () => writeDialogues(dialogues),
    },
    {
      id: "dialoguesCsv",
      label: "Dialogues.csv",
      filename: fileName(catalog, "dialoguesCsv", "Dialogues.csv"),
      mime: "text/csv",
      ready: dlgCsvKeys > 0 || dialogues.states.length > 0,
      detail: dlgCsvKeys
        ? `${dlgCsvKeys} keys · ${dlgCsv.languages.join(", ") || "English"}`
        : dialogues.states.length
          ? "No txt_ keys yet"
          : "Import Dialogues.csv",
      build: () => writeDialoguesCsv(catalog, dialogues),
    },
  );

  return slots;
}

export function downloadText(name: string, text: string, type: string) {
  downloadAxisExport([{ name, text, type }]);
}

const AXIS_FOLDER = "axisexport";

export function downloadAxisExport(files: { name: string; text: string; type?: string }[]) {
  const blob = new Blob([axisExportZip(files)], { type: "application/zip" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${AXIS_FOLDER}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function axisExportZip(files: { name: string; text: string }[]): Uint8Array {
  const enc = new TextEncoder();
  const used = new Set<string>();
  const packed = files.map((file) => {
    const base = file.name.split(/[\\/]/).pop() || "file.txt";
    let name = `${AXIS_FOLDER}/${base}`;
    const key = name.toLowerCase();
    if (used.has(key)) {
      const dot = base.lastIndexOf(".");
      const stem = dot > 0 ? base.slice(0, dot) : base;
      const ext = dot > 0 ? base.slice(dot) : "";
      let n = 2;
      while (used.has(`${AXIS_FOLDER}/${stem}-${n}${ext}`.toLowerCase())) n += 1;
      name = `${AXIS_FOLDER}/${stem}-${n}${ext}`;
    }
    used.add(name.toLowerCase());
    return { name, data: enc.encode(file.text) };
  });
  return zipStored(packed);
}

function crc32(data: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i]!;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return ~c >>> 0;
}

function zipStored(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = enc.encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(10, time, true);
    view.setUint16(12, date, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, name.length, true);
    locals.push(local, name, file.data);
    const cen = new Uint8Array(46);
    const cenView = new DataView(cen.buffer);
    cenView.setUint32(0, 0x02014b50, true);
    cenView.setUint16(4, 20, true);
    cenView.setUint16(6, 20, true);
    cenView.setUint16(8, 0x0800, true);
    cenView.setUint16(12, time, true);
    cenView.setUint16(14, date, true);
    cenView.setUint32(16, crc, true);
    cenView.setUint32(20, file.data.length, true);
    cenView.setUint32(24, file.data.length, true);
    cenView.setUint16(28, name.length, true);
    cenView.setUint32(42, offset, true);
    central.push(cen, name);
    offset += local.length + name.length + file.data.length;
  }
  const centralStart = offset;
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(22);
  const end = new DataView(eocd.buffer);
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralStart, true);
  return concatBytes([...locals, ...central, eocd]);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

import type { ImportKind } from "./import-kinds.ts";
import { indexScenario, type ScenarioCatalog, type ScenarioSource } from "./scenario-index.ts";
import { problemStats, validateProject, type Problem } from "./validate.ts";
import { validateCatalog, type FileDebugId } from "./validate-files.ts";
import { importPda, type ImportFiles } from "./yaml-import.ts";
import type { PdaProject } from "./types.ts";

export type HeavyOp = "index" | "importPda" | "validate" | "validateFiles";

export type HeavyPayload = {
  files?: ScenarioSource[];
  kind?: ImportKind;
  importFiles?: ImportFiles;
  project?: PdaProject;
  catalog?: ScenarioCatalog;
  source?: FileDebugId | "pda";
};

export type ValidateResult = {
  issues: Problem[];
  stats: ReturnType<typeof problemStats>;
};

export function slimCatalog(catalog: ScenarioCatalog): ScenarioCatalog {
  return {
    folderName: catalog.folderName,
    files: catalog.files,
    entries: catalog.entries
      .filter((e) => e.kind !== "picture")
      .map((e) => ({
        kind: e.kind,
        name: e.name,
        label: e.label,
        poiGroup: e.poiGroup,
        poiFile: e.poiFile,
        source: e.source,
      })),
    texts: (catalog.texts ?? []).filter((t) => t.role === "localization"),
    indexedAt: catalog.indexedAt,
  };
}

export function runHeavy(op: HeavyOp, payload: HeavyPayload) {
  if (op === "index") {
    const indexed = indexScenario(payload.files || [], payload.kind);
    return {
      ...indexed,
      catalog: { ...indexed.catalog, texts: [] },
    };
  }
  if (op === "importPda") {
    if (!payload.importFiles?.yamlText) throw new Error("No PDA.yaml to parse.");
    return importPda(payload.importFiles);
  }
  if (op === "validate") {
    const issues = validateProject(payload.project!, payload.catalog);
    return { issues, stats: problemStats(issues) } satisfies ValidateResult;
  }
  if (op === "validateFiles") {
    const source = payload.source || "pda";
    const issues = validateCatalog(payload.catalog, source);
    return { issues, stats: problemStats(issues) } satisfies ValidateResult;
  }
  throw new Error(`Unknown heavy op ${op}`);
}

import type { Problem } from "./validate.ts";

/** HUD wrap / visible character-count warnings. Hidden unless Debug asks to show them. */
export const LENGTH_CODES = new Set(["hud-wrap"]);

export function problemIgnoreKey(problem: Pick<Problem, "code" | "id" | "field" | "value">) {
  return `${problem.code}|${problem.id ?? "root"}|${problem.field ?? ""}|${problem.value ?? ""}`;
}

export function visibleProblems(
  issues: Problem[],
  ignored: string[],
  opts?: { includeLength?: boolean; includeIgnored?: boolean },
) {
  const skip = new Set(ignored);
  return issues.filter((issue) => {
    if (!opts?.includeLength && LENGTH_CODES.has(issue.code)) return false;
    if (!opts?.includeIgnored && skip.has(problemIgnoreKey(issue))) return false;
    return true;
  });
}

import { Download } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { APP_MARK, APP_SHORT, APP_SUBTITLE } from "@/lib/brand.ts";
import { Button } from "@/components/ui/button.tsx";
import { exportCsv, exportYaml } from "@/lib/pda/yaml-export.ts";
import { counts } from "@/lib/pda/validate.ts";
import { useProblems } from "@/lib/pda/use-problems.ts";
import { usePdaStore } from "@/store/pda-store.ts";

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AppHeader() {
  const project = usePdaStore((s) => s.project);
  const setLanguage = usePdaStore((s) => s.setLanguage);
  const n = counts(project);
  const languages = project.csv.languages;

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-sm border border-border bg-elevated text-[10px] font-medium tracking-wide">
            {APP_MARK}
          </div>
          <div>
            <p className="text-sm font-medium leading-none tracking-tight">{APP_SHORT}</p>
            <p className="mt-1 text-xs text-muted">{APP_SUBTITLE}</p>
          </div>
        </div>

        <label className="ml-auto flex min-w-0 items-center gap-2 text-xs text-muted">
          PDA Language
          <select
            className="h-8 max-w-36 rounded-sm border border-border bg-bg px-2 text-sm text-fg sm:max-w-none"
            value={project.language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {(languages.length ? languages : [project.language || "English"]).map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!n.chapters}
            onClick={() => download("PDA.yaml", exportYaml(project), "text/yaml")}
          >
            Export YAML
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!n.chapters}
            onClick={() => download("PDA.csv", exportCsv(project), "text/csv")}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            disabled={!n.chapters}
            onClick={() => {
              download("PDA.yaml", exportYaml(project), "text/yaml");
              download("PDA.csv", exportCsv(project), "text/csv");
            }}
          >
            <Download className="size-3.5" /> Both
          </Button>
        </div>
      </div>
      <AppNav />
    </header>
  );
}

function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { stats } = useProblems();
  const items = [
    { to: "/" as const, label: "PDA" },
    { to: "/dialogues" as const, label: "Dialogues" },
    { to: "/import" as const, label: "Import" },
    { to: "/library" as const, label: "Library" },
    { to: "/debug" as const, label: "Debug" },
  ];
  return (
    <nav className="grid grid-cols-5 border-t border-border">
      {items.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`relative flex h-9 min-w-0 items-center justify-center gap-1 px-1 text-xs tracking-wide sm:gap-2 sm:text-sm ${
              active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/40 hover:text-fg"
            }`}
          >
            {item.label}
            {item.to === "/debug" && stats.total ? (
              <span className={`tabular-nums text-xs ${stats.errors ? "text-danger" : "text-warn"}`}>
                {stats.total}
              </span>
            ) : null}
            {active ? <span className="absolute inset-x-0 bottom-0 h-px bg-accent" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { Bug, Download, Library, MessageSquareText, ScrollText, Upload } from "lucide-react";
import { APP_MARK, APP_SHORT, APP_SUBTITLE } from "@/lib/brand.ts";
import { usePdaStore } from "@/store/pda-store.ts";
import { useDebugStats } from "@/store/debug-stats.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Tooltip } from "@/components/ui/tooltip.tsx";

export function AppHeader() {
  const language = usePdaStore((s) => s.project.language);
  const languages = usePdaStore((s) => s.project.csv.languages);
  const setLanguage = usePdaStore((s) => s.setLanguage);
  const langs = languages.length ? languages : [language || "English"];

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md">
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

        <div className="ml-auto flex min-w-0 items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">PDA Language</span>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger aria-label="PDA language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {langs.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <AppNav />
    </header>
  );
}

function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stats = useDebugStats();
  const items = [
    { to: "/" as const, label: "PDA", icon: ScrollText },
    { to: "/dialogues" as const, label: "Dialogues", icon: MessageSquareText },
    { to: "/import" as const, label: "Import", icon: Upload },
    { to: "/library" as const, label: "Library", icon: Library },
    { to: "/export" as const, label: "Export", icon: Download },
    { to: "/debug" as const, label: "Debug", icon: Bug },
  ];
  return (
    <nav className="grid grid-cols-3 border-t border-border sm:grid-cols-6">
      {items.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Tooltip key={item.to} content={item.label}>
            <Link
              to={item.to}
              className={`relative flex h-10 min-w-0 items-center justify-center gap-1.5 px-1 text-xs tracking-wide sm:h-9 sm:text-sm ${
                active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/40 hover:text-fg"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.to === "/debug" && stats.total ? (
                <Badge tone={stats.errors ? "danger" : "warn"}>{stats.total}</Badge>
              ) : null}
              {active ? <span className="absolute inset-x-0 bottom-0 h-px bg-accent" /> : null}
            </Link>
          </Tooltip>
        );
      })}
    </nav>
  );
}

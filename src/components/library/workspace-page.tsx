import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header.tsx";

export function WorkspacePage({
  group,
  title,
  kicker,
  children,
}: {
  group: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden text-fg">
      <AppHeader />
      <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <Link to="/library" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-fg">
          Library
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-xs uppercase tracking-[0.14em] text-muted">{group}</span>
        <span className="text-subtle">/</span>
        <h1 className="text-sm font-medium tracking-tight">{title}</h1>
        {kicker ? <span className="ml-auto text-xs text-subtle">{kicker}</span> : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

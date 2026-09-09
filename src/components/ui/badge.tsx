import { cn } from "@/lib/utils.ts";

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.ComponentProps<"span"> & { tone?: "muted" | "ok" | "warn" | "danger" | "chapter" | "task" | "action" }) {
  const tones: Record<string, string> = {
    muted: "text-muted border-border",
    ok: "text-ok border-ok/30",
    warn: "text-warn border-warn/30",
    danger: "text-danger border-danger/30",
    chapter: "text-chapter border-chapter/30",
    task: "text-task border-task/30",
    action: "text-action border-action/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

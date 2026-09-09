import { createFileRoute } from "@tanstack/react-router";
import { DebugPage } from "@/components/debug/debug-page.tsx";

export const Route = createFileRoute("/debug")({ component: DebugPage });

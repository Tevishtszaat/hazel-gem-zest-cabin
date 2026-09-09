import { createFileRoute } from "@tanstack/react-router";
import { ExportPage } from "@/components/export/export-page.tsx";

export const Route = createFileRoute("/export")({ component: ExportPage });

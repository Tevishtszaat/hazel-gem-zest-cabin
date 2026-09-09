import { createFileRoute } from "@tanstack/react-router";
import { ImportPage } from "@/components/import/import-page.tsx";

export const Route = createFileRoute("/import")({ component: ImportPage });

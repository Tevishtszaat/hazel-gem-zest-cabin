import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/components/library/library-page.tsx";

export const Route = createFileRoute("/library/")({ component: LibraryPage });

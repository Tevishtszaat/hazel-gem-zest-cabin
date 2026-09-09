import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/editor/workspace.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Workspace />;
}

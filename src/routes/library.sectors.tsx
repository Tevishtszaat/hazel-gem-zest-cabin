import { createFileRoute } from "@tanstack/react-router";
import { SectorsEditor } from "@/components/library/sectors-editor.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/sectors")({ component: SectorsWorkspace });

function SectorsWorkspace() {
  return (
    <WorkspacePage group="World" title="Sectors" kicker="Sectors.yaml · galaxy, stars, planets, moons">
      <SectorsEditor />
    </WorkspacePage>
  );
}

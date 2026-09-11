import { createFileRoute } from "@tanstack/react-router";
import { GalaxyEditor } from "@/components/library/config-tabs.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/galaxy")({ component: GalaxyWorkspace });

function GalaxyWorkspace() {
  return (
    <WorkspacePage group="World" title="Galaxy" kicker="GalaxyConfig.ecf · habitable zones">
      <GalaxyEditor />
    </WorkspacePage>
  );
}

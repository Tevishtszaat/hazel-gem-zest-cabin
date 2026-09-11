import { createFileRoute } from "@tanstack/react-router";
import { WarfareEditor } from "@/components/library/config-tabs.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/warfare")({ component: WarfareWorkspace });

function WarfareWorkspace() {
  return (
    <WorkspacePage group="World" title="Faction warfare" kicker="FactionWarfare.ecf">
      <WarfareEditor />
    </WorkspacePage>
  );
}

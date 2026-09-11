import { createFileRoute } from "@tanstack/react-router";
import { ReputationTable } from "@/components/library/config-tabs.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/reputation")({ component: ReputationWorkspace });

function ReputationWorkspace() {
  return (
    <WorkspacePage group="World" title="Reputation" kicker="DefReputation.ecf">
      <ReputationTable />
    </WorkspacePage>
  );
}

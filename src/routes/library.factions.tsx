import { createFileRoute } from "@tanstack/react-router";
import { ObjectBrowser } from "@/components/library/library-page.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/factions")({ component: FactionsWorkspace });

function FactionsWorkspace() {
  return (
    <WorkspacePage group="World" title="Factions" kicker="Factions.ecf · slide the roster">
      <ObjectBrowser role="factions" title="Factions" listCap={400} />
    </WorkspacePage>
  );
}

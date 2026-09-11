import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ObjectBrowser } from "@/components/library/library-page.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/blocks")({ component: BlocksWorkspace });

function BlocksWorkspace() {
  const navigate = useNavigate();
  return (
    <WorkspacePage group="Catalog" title="Blocks" kicker="BlocksConfig.ecf · Id or +Block Name">
      <ObjectBrowser
        role="blocks"
        title="Blocks"
        listCap={4000}
        onCompare={() => {
          void navigate({ to: "/library" });
        }}
      />
    </WorkspacePage>
  );
}

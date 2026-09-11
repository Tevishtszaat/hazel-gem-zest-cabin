import { createFileRoute } from "@tanstack/react-router";
import { ObjectBrowser } from "@/components/library/library-page.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/items")({ component: ItemsWorkspace });

function ItemsWorkspace() {
  return (
    <WorkspacePage group="Catalog" title="Items" kicker="ItemsConfig.ecf · Id or +Item Name">
      <ObjectBrowser role="items" title="Items" listCap={200} />
    </WorkspacePage>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PlayfieldEditor } from "@/components/library/playfield-editor.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/playfields")({ component: PlayfieldsWorkspace });

function PlayfieldsWorkspace() {
  return (
    <WorkspacePage group="World" title="Playfields" kicker="playfield.yaml · static/dynamic · space_dynamic">
      <PlayfieldEditor />
    </WorkspacePage>
  );
}

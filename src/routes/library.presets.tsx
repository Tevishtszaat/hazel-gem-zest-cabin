import { createFileRoute } from "@tanstack/react-router";
import { RandomPresetEditor } from "@/components/library/random-preset-editor.tsx";
import { WorkspacePage } from "@/components/library/workspace-page.tsx";

export const Route = createFileRoute("/library/presets")({ component: PresetsWorkspace });

function PresetsWorkspace() {
  return (
    <WorkspacePage group="World" title="Random presets" kicker="SolarSystemConfig.yaml · star and faction presets">
      <RandomPresetEditor />
    </WorkspacePage>
  );
}

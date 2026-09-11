import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { DialogueEditor } from "@/components/library/dialogue-editor.tsx";

export const Route = createFileRoute("/dialogues")({ component: DialoguesPage });

function DialoguesPage() {
  return (
    <div className="app-shell flex h-dvh flex-col overflow-x-hidden text-fg">
      <AppHeader />
      <div className="min-h-0 flex-1">
        <DialogueEditor />
      </div>
    </div>
  );
}

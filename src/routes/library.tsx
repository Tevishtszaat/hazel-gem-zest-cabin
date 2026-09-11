import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
  component: function LibraryLayout() {
    return <Outlet />;
  },
});

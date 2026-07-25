import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getWorkspaceOverview } from "@/components/workspace/workspace-shell/actions";

export const metadata: Metadata = {
  title: "Workspace | NexusOps",
  description:
    "Track document processing, review recent sources, and continue source-grounded conversations in NexusOps.",
};

export default async function WorkspacePage() {
  const overview = await getWorkspaceOverview();

  return <WorkspaceShell {...overview} />;
}

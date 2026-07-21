import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata: Metadata = {
  title: "Workspace | NexusOps",
  description: "Upload and organize invoices, receipts, and business documents in your private NexusOps workspace.",
};

export default async function WorkspacePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace");
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.username || "there";

  return <WorkspaceShell firstName={firstName} />;
}

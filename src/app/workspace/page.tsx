import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";

export const metadata: Metadata = {
  title: "Workspace | NexusOps",
  description:
    "Track document processing, review recent sources, and continue source-grounded conversations in NexusOps.",
};

export default async function WorkspacePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace");
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.username || "there";
  const appUser = await requireAppUser(userId);

  const [documentsResult, conversationsResult] = await Promise.all([
    supabaseAdmin
      .from("documents")
      .select("id, originalName, mimeType, sizeBytes, status, createdAt")
      .eq("userId", appUser.id)
      .order("createdAt", { ascending: false }),
    supabaseAdmin
      .from("conversations")
      .select("id, title, lastMessageAt, createdAt", { count: "exact" })
      .eq("userId", appUser.id)
      .eq("archived", false)
      .order("lastMessageAt", { ascending: false, nullsFirst: false })
      .limit(4),
  ]);

  if (documentsResult.error || conversationsResult.error) {
    throw new Error("Could not load the workspace dashboard.", {
      cause: documentsResult.error ?? conversationsResult.error,
    });
  }

  return (
    <WorkspaceShell
      firstName={firstName}
      initialDocuments={
        (documentsResult.data ?? []) as WorkspaceDocument[]
      }
      initialConversations={
        (conversationsResult.data ?? []) as ConversationSummary[]
      }
      conversationCount={conversationsResult.count ?? 0}
    />
  );
}

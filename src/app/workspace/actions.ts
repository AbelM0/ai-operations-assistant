import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { WorkspaceOverviewData } from "./_components/workspace-shell/types";

export async function getWorkspaceOverview(): Promise<WorkspaceOverviewData> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace");
  }

  const [user, appUser] = await Promise.all([
    currentUser(),
    requireAppUser(userId),
  ]);

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

  return {
    firstName: user?.firstName || user?.username || "there",
    initialDocuments: (documentsResult.data ?? []) as WorkspaceDocument[],
    initialConversations: (conversationsResult.data ??
      []) as ConversationSummary[],
    conversationCount: conversationsResult.count ?? 0,
  };
}

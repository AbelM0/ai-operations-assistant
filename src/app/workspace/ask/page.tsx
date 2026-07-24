import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AskNexusShell } from "@/components/workspace/ask-nexus-shell";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Ask Nexus | NexusOps",
  description: "Ask questions across selected documents in your NexusOps workspace.",
};

export default async function AskNexusPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/workspace/ask");

  const appUser = await requireAppUser();
  if (!appUser) redirect("/sign-in?redirect_url=/workspace/ask");

  const [documentsResult, conversationsResult] = await Promise.all([
    supabaseAdmin
      .from("documents")
      .select("id, originalName, mimeType, sizeBytes, status, createdAt")
      .eq("userId", appUser.id)
      .order("createdAt", { ascending: false }),
    supabaseAdmin
      .from("conversations")
      .select("id, title, lastMessageAt, createdAt")
      .eq("userId", appUser.id)
      .eq("archived", false)
      .order("lastMessageAt", { ascending: false, nullsFirst: false })
      .limit(12),
  ]);

  if (documentsResult.error || conversationsResult.error) {
    throw new Error("Could not load the Ask Nexus workspace.", {
      cause: documentsResult.error ?? conversationsResult.error,
    });
  }

  return (
    <AskNexusShell
      documents={(documentsResult.data ?? []) as WorkspaceDocument[]}
      initialConversations={
        (conversationsResult.data ?? []) as ConversationSummary[]
      }
    />
  );
}

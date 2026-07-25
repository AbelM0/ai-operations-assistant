import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DocumentsShell } from "@/components/workspace/documents-shell";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { WorkspaceDocument } from "@/lib/documents/types";

export const metadata: Metadata = {
  title: "Documents | NexusOps",
  description: "View, upload, and download documents in your private NexusOps workspace.",
};

export default async function DocumentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace/documents");
  }

  const appUser = await requireAppUser(userId);

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, mimeType, sizeBytes, status, errorMessage, createdAt")
    .eq("userId", appUser.id)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error("Could not load workspace documents.", { cause: error });
  }

  return <DocumentsShell initialDocuments={(data ?? []) as WorkspaceDocument[]} />;
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { attachExtractionSummaries } from "@/lib/documents/extraction-data";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getWorkspaceDocuments(): Promise<WorkspaceDocument[]> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace/documents");
  }

  const appUser = await requireAppUser(userId);
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select(
      "id, originalName, mimeType, sizeBytes, status, errorMessage, createdAt",
    )
    .eq("userId", appUser.id)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error("Could not load workspace documents.", { cause: error });
  }

  return attachExtractionSummaries(
    (data ?? []) as Omit<WorkspaceDocument, "extraction">[],
  );
}

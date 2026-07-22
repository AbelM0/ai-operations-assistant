import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/documents/[documentId]">,
) {
  let appUser;

  try {
    appUser = await requireAppUser();
  } catch (error) {
    console.error("Could not resolve the application user", error);
    return NextResponse.json({ error: "Could not prepare this deletion." }, { status: 500 });
  }

  if (!appUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { documentId } = await params;
  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, storagePath")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (documentError) {
    console.error("Could not resolve the document for deletion", documentError);
    return NextResponse.json({ error: "The document could not be deleted." }, { status: 500 });
  }

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  const { error: storageError } = await supabaseAdmin.storage
    .from(bucket)
    .remove([document.storagePath]);

  if (storageError) {
    console.error("Could not remove the document from storage", storageError);
    return NextResponse.json(
      { error: "The stored file could not be removed. Nothing else was deleted." },
      { status: 502 },
    );
  }

  const { data: deletedDocument, error: deleteError } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedDocument) {
    console.error("Could not delete the document record", deleteError);
    return NextResponse.json(
      { error: "The file was removed, but its document record could not be deleted." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    deletedId: deletedDocument.id,
    originalName: document.originalName,
  });
}


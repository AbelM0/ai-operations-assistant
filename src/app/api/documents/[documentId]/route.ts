import { after, NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/documents/[documentId]">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { documentId } = await params;
  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, mimeType, sizeBytes, pageCount, status, errorMessage, parserUsed, processingCompletedAt, createdAt")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "The document could not be loaded." }, { status: 500 });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const { data: summaries, error: summaryError } = await supabaseAdmin
    .from("document_summaries")
    .select("id, summary, language, provider, model, createdAt")
    .eq("documentId", documentId)
    .order("createdAt", { ascending: false });

  if (summaryError) return NextResponse.json({ error: "Document summaries could not be loaded." }, { status: 500 });
  return NextResponse.json({ document: { ...document, summaries: summaries ?? [] } }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/documents/[documentId]">,
) {
  let appUser;

  try {
    appUser = await requireAppUser();
  } catch (error) {
    console.error("Could not resolve the application user", error);
    return NextResponse.json({ error: "Could not restart document processing." }, { status: 500 });
  }

  if (!appUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { documentId } = await params;
  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, status")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (documentError) {
    console.error("Could not resolve the document for retry", documentError);
    return NextResponse.json({ error: "Document processing could not be restarted." }, { status: 500 });
  }

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  if (!["FAILED", "UPLOADED"].includes(document.status)) {
    return NextResponse.json(
      {
        error:
          document.status === "READY"
            ? "This document has already been processed."
            : "This document is already being processed.",
      },
      { status: 409 },
    );
  }

  if (document.status === "FAILED") {
    const { data: queuedDocument, error: queueError } = await supabaseAdmin
      .from("documents")
      .update({ errorMessage: null, status: "UPLOADED" })
      .eq("id", document.id)
      .eq("userId", appUser.id)
      .eq("status", "FAILED")
      .select("id")
      .maybeSingle();

    if (queueError || !queuedDocument) {
      console.error("Could not queue the document for retry", queueError);
      return NextResponse.json(
        { error: "Document processing could not be restarted." },
        { status: 409 },
      );
    }
  }

  after(async () => {
    const { processDocument } = await import("@/lib/documents/process-document");
    await processDocument(document.id);
  });

  return NextResponse.json(
    {
      document: {
        id: document.id,
        originalName: document.originalName,
        status: "UPLOADED",
      },
    },
    { status: 202 },
  );
}

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

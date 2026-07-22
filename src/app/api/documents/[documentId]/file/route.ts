import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function contentDisposition(fileName: string, download: boolean) {
  const fallbackName = fileName
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\\r\n]/g, "_")
    .slice(0, 180) || "document";
  const encodedName = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${download ? "attachment" : "inline"}; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/documents/[documentId]/file">,
) {
  const appUser = await requireAppUser();

  if (!appUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { documentId } = await params;
  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, storagePath, mimeType")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (documentError) {
    console.error("Could not resolve document download", documentError);
    return NextResponse.json({ error: "The document could not be opened." }, { status: 500 });
  }

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  const { data: file, error: storageError } = await supabaseAdmin.storage
    .from(bucket)
    .download(document.storagePath);

  if (storageError || !file) {
    console.error("Could not read the stored document", storageError);
    return NextResponse.json({ error: "The document could not be opened." }, { status: 502 });
  }

  return new Response(file, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": contentDisposition(document.originalName, download),
      "Content-Length": String(file.size),
      "Content-Type": document.mimeType || file.type || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

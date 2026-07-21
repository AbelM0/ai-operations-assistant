import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
    .select("id, originalName, storagePath")
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
  const { data, error: signedUrlError } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(
      document.storagePath,
      60,
      download ? { download: document.originalName } : undefined,
    );

  if (signedUrlError) {
    console.error("Could not create a signed document URL", signedUrlError);
    return NextResponse.json({ error: "The document could not be opened." }, { status: 502 });
  }

  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

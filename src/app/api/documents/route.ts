import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "document";
}

export async function POST(request: Request) {
  let appUser;

  try {
    appUser = await requireAppUser();
  } catch (error) {
    console.error("Could not resolve the application user", error);
    return NextResponse.json({ error: "Could not prepare your workspace." }, { status: 500 });
  }

  if (!appUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a document to upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "PDF, JPG, PNG, and WebP files are supported." }, { status: 415 });
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "The file must be between 1 byte and 20 MB." }, { status: 413 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  const storagePath = `${appUser.clerkId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase document upload failed", uploadError);
    return NextResponse.json({ error: "The document could not be uploaded. Please try again." }, { status: 502 });
  }

  const { data: document, error: insertError } = await supabaseAdmin
    .from("documents")
    .insert({
      userId: appUser.id,
      originalName: file.name,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      status: "UPLOADED",
    })
    .select("id, originalName, mimeType, sizeBytes, status, createdAt")
    .single();

  if (insertError) {
    await supabaseAdmin.storage.from(bucket).remove([storagePath]);
    console.error("Document metadata insert failed", insertError);
    return NextResponse.json({ error: "The document record could not be created." }, { status: 500 });
  }

  return NextResponse.json({ document }, { status: 201 });
}

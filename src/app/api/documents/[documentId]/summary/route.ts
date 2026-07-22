import { NextResponse } from "next/server";
import { isSummaryModel } from "@/lib/ai/models";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { summarizeDocumentChunks } from "@/lib/documents/summarize-document";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/documents/[documentId]/summary">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { model?: string };
  const model = body.model?.trim() || "";
  if (!isSummaryModel(model)) {
    return NextResponse.json({ error: "Choose a supported summary model." }, { status: 400 });
  }

  const { documentId } = await params;
  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, status")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (documentError) return NextResponse.json({ error: "The document could not be loaded." }, { status: 500 });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (document.status !== "READY") {
    return NextResponse.json({ error: "The document must finish processing before it can be summarized." }, { status: 409 });
  }

  const { data: chunks, error: chunksError } = await supabaseAdmin
    .from("document_chunks")
    .select("pageNumber, textContent")
    .eq("documentId", documentId)
    .order("chunkIndex", { ascending: true });

  if (chunksError) return NextResponse.json({ error: "The extracted document text could not be loaded." }, { status: 500 });

  try {
    const result = await summarizeDocumentChunks(chunks ?? [], model);
    const { data: summary, error: insertError } = await supabaseAdmin
      .from("document_summaries")
      .insert({ documentId, summary: result.summary, language: "en", provider: "deepseek", model })
      .select("id, summary, language, provider, model, createdAt")
      .single();

    if (insertError) throw insertError;

    if (result.usage.totalTokens > 0) {
      await supabaseAdmin.from("ai_usage").insert({
        userId: appUser.id,
        provider: "deepseek",
        model,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        estimatedCost: 0,
      });
    }

    return NextResponse.json({ summary }, { status: 201 });
  } catch (error) {
    console.error(`Could not summarize document ${documentId}`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The summary could not be generated." },
      { status: 502 },
    );
  }
}

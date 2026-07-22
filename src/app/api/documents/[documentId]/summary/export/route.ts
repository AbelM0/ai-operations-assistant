import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import { createSummaryPdf } from "@/lib/documents/summary-pdf";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeName(value: string) {
  return value.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 100) || "document";
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/documents/[documentId]/summary/export">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { documentId } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const summaryId = url.searchParams.get("summaryId");
  if (!summaryId || !["pdf", "csv"].includes(format || "")) {
    return NextResponse.json({ error: "Choose a summary and a PDF or CSV format." }, { status: 400 });
  }

  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("id, originalName")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const { data: summary } = await supabaseAdmin
    .from("document_summaries")
    .select("id, summary, language, provider, model, createdAt")
    .eq("id", summaryId)
    .eq("documentId", documentId)
    .maybeSingle();
  if (!summary) return NextResponse.json({ error: "Summary not found." }, { status: 404 });

  const fileName = `${safeName(document.originalName)}-summary.${format}`;
  if (format === "csv") {
    const csv = [
      ["document", "generated_at", "provider", "model", "language", "summary"].map(csvCell).join(","),
      [document.originalName, summary.createdAt, summary.provider || "", summary.model || "", summary.language, summary.summary].map(csvCell).join(","),
    ].join("\r\n");
    return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"`, "Cache-Control": "private, no-store" } });
  }

  const pdf = await createSummaryPdf({ documentName: document.originalName, summary: summary.summary, model: summary.model, createdAt: summary.createdAt });
  return new Response(Buffer.from(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${fileName}"`, "Cache-Control": "private, no-store" } });
}

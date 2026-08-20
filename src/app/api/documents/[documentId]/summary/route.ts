import {
  createUIMessageStreamResponse,
  smoothStream,
  toUIMessageStream,
} from "ai";
import { getDeepSeekModel } from "@/lib/ai/chat-model";
import { streamText, withLangSmithTracing } from "@/lib/ai/sdk";
import { isSummaryModel } from "@/lib/ai/models";
import { requireAppUser } from "@/lib/auth/require-app-user";
import {
  prepareDocumentSummary,
  summarySystemPrompt,
} from "@/lib/documents/summarize-document";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_SUMMARY_OUTPUT_TOKENS = 7_000;

function summaryOutputTokenLimit() {
  const configured = Number.parseInt(
    process.env.SUMMARY_MAX_OUTPUT_TOKENS || "",
    10,
  );
  return Number.isFinite(configured)
    ? Math.max(1_000, Math.min(12_000, configured))
    : DEFAULT_SUMMARY_OUTPUT_TOKENS;
}

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/documents/[documentId]/summary">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return errorResponse("Authentication required.", 401);

  const body = (await request.json().catch(() => ({}))) as {
    model?: string;
  };
  const model = body.model?.trim() || "";
  if (!isSummaryModel(model)) {
    return errorResponse("Choose a supported summary model.", 400);
  }

  const { documentId } = await params;
  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, status")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (documentError) {
    return errorResponse("The document could not be loaded.", 500);
  }
  if (!document) return errorResponse("Document not found.", 404);
  if (document.status !== "READY") {
    return errorResponse(
      "The document must finish processing before it can be summarized.",
      409,
    );
  }

  const { data: chunks, error: chunksError } = await supabaseAdmin
    .from("document_chunks")
    .select("pageNumber, textContent")
    .eq("documentId", documentId)
    .order("chunkIndex", { ascending: true });
  if (chunksError) {
    return errorResponse(
      "The extracted document text could not be loaded.",
      500,
    );
  }
  if (request.signal.aborted) {
    return new Response(null, { status: 499 });
  }

  const prepared = await prepareDocumentSummary(
    chunks ?? [],
    model,
    request.signal,
  );
  if (request.signal.aborted) {
    return new Response(null, { status: 499 });
  }

  const summaryModel = getDeepSeekModel(model);
  let aborted = false;
  const result = await streamText({
    model: summaryModel.model,
    system: summarySystemPrompt,
    prompt: prepared.prompt,
    temperature: 0.15,
    maxOutputTokens: summaryOutputTokenLimit(),
    providerOptions: withLangSmithTracing(
      summaryModel.providerOptions,
      "document-summary",
    ),
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
    abortSignal: request.signal,
    onAbort: () => {
      aborted = true;
    },
    onError: ({ error }) => {
      console.error(`Could not summarize document ${documentId}`, error);
    },
    onEnd: async ({ text, usage }) => {
      if (aborted || !text.trim()) return;

      try {
        const { error: insertError } = await supabaseAdmin
          .from("document_summaries")
          .insert({
            documentId,
            summary: text.trim(),
            language: "en",
            provider: summaryModel.provider,
            model: summaryModel.modelId,
          });
        if (insertError) throw insertError;

        const promptTokens =
          prepared.priorUsage.promptTokens + (usage.inputTokens || 0);
        const completionTokens =
          prepared.priorUsage.completionTokens + (usage.outputTokens || 0);
        const totalTokens =
          prepared.priorUsage.totalTokens + (usage.totalTokens || 0);

        if (totalTokens > 0) {
          const { error: usageError } = await supabaseAdmin
            .from("ai_usage")
            .insert({
              userId: appUser.id,
              provider: summaryModel.provider,
              model: summaryModel.modelId,
              promptTokens,
              completionTokens,
              totalTokens,
              estimatedCost: 0,
            });
          if (usageError) throw usageError;
        }
      } catch (persistenceError) {
        console.error(
          `Could not persist summary for ${documentId}`,
          persistenceError,
        );
      }
    },
  });

    return result.toUIMessageStreamResponse({
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Encoding": "none",
      "X-Accel-Buffering": "no",
    },
  });
}

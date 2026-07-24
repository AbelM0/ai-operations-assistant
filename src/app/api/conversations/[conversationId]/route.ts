import { requireAppUser } from "@/lib/auth/require-app-user";
import type {
  ConversationDetail,
  RagSource,
  RagUIMessage,
} from "@/lib/rag/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type StoredMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

type StoredMessageSource = {
  messageId: string;
  chunkId: string;
  similarity: number | null;
  sourceId: string | null;
  sourceOrder: number | null;
};

type StoredChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  pageNumber: number | null;
};

type StoredDocument = {
  id: string;
  originalName: string;
};

const MAX_LOADED_MESSAGES = 100;

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildSources(
  messageId: string,
  sourceRows: StoredMessageSource[],
  chunksById: Map<string, StoredChunk>,
  documentsById: Map<string, StoredDocument>,
) {
  const grouped = new Map<
    string,
    {
      chunks: StoredChunk[];
      similarities: number[];
      sourceId: string | null;
      sourceOrder: number | null;
    }
  >();

  for (const sourceRow of sourceRows) {
    if (sourceRow.messageId !== messageId) continue;
    const chunk = chunksById.get(sourceRow.chunkId);
    if (!chunk) continue;

    const groupKey = sourceRow.sourceId
      ? `${sourceRow.sourceId}:${chunk.documentId}`
      : chunk.documentId;
    const group = grouped.get(groupKey) ?? {
      chunks: [],
      similarities: [],
      sourceId: sourceRow.sourceId,
      sourceOrder: sourceRow.sourceOrder,
    };
    group.chunks.push(chunk);
    if (sourceRow.similarity !== null) {
      group.similarities.push(sourceRow.similarity);
    }
    grouped.set(groupKey, group);
  }

  return [...grouped.entries()]
    .map(([, group]) => {
      const chunks = group.chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
      const documentId = chunks[0]?.documentId ?? "";
      const pages = chunks
        .map((chunk) => chunk.pageNumber)
        .filter((page): page is number => page !== null);
      const similarity =
        group.similarities.length > 0 ? Math.max(...group.similarities) : 0;
      const document = documentsById.get(documentId);

      return {
        id: group.sourceId ?? "",
        chunkIds: chunks.map((chunk) => chunk.id),
        documentId,
        documentName: document?.originalName ?? "Document",
        pageStart: pages.length > 0 ? Math.min(...pages) : null,
        pageEnd: pages.length > 0 ? Math.max(...pages) : null,
        chunkStart: chunks[0]?.chunkIndex ?? 0,
        chunkEnd: chunks.at(-1)?.chunkIndex ?? 0,
        similarity,
        score: similarity,
        sourceOrder: group.sourceOrder,
      } satisfies RagSource & { sourceOrder: number | null };
    })
    .sort(
      (a, b) =>
        (a.sourceOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.sourceOrder ?? Number.MAX_SAFE_INTEGER) ||
        b.similarity - a.similarity,
    )
    .map(
      (source, index): RagSource => ({
        id: source.id || `S${index + 1}`,
        chunkIds: source.chunkIds,
        documentId: source.documentId,
        documentName: source.documentName,
        pageStart: source.pageStart,
        pageEnd: source.pageEnd,
        chunkStart: source.chunkStart,
        chunkEnd: source.chunkEnd,
        similarity: source.similarity,
        score: source.score,
      }),
    );
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/conversations/[conversationId]">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return errorResponse("Authentication required.", 401);

  const { conversationId } = await context.params;
  if (!isUuid(conversationId)) {
    return errorResponse("Conversation not found.", 404);
  }

  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from("conversations")
    .select("id, title, lastMessageAt, createdAt")
    .eq("id", conversationId)
    .eq("userId", appUser.id)
    .eq("archived", false)
    .maybeSingle();

  if (conversationError) {
    console.error("Could not load conversation", conversationError);
    return errorResponse("The conversation could not be loaded.", 502);
  }
  if (!conversation) return errorResponse("Conversation not found.", 404);

  const [conversationDocumentsResult, messagesResult] = await Promise.all([
    supabaseAdmin
      .from("conversation_documents")
      .select("documentId")
      .eq("conversationId", conversationId),
    supabaseAdmin
      .from("messages")
      .select("id, role, content")
      .eq("conversationId", conversationId)
      .in("role", ["USER", "ASSISTANT"])
      .order("createdAt", { ascending: false })
      .limit(MAX_LOADED_MESSAGES),
  ]);

  if (conversationDocumentsResult.error || messagesResult.error) {
    console.error(
      "Could not load conversation details",
      conversationDocumentsResult.error ?? messagesResult.error,
    );
    return errorResponse("The conversation could not be loaded.", 502);
  }

  const storedMessages = ((messagesResult.data ?? []) as StoredMessage[]).reverse();
  const assistantIds = storedMessages
    .filter((message) => message.role === "ASSISTANT")
    .map((message) => message.id);

  let sourceRows: StoredMessageSource[] = [];
  let chunks: StoredChunk[] = [];
  let documents: StoredDocument[] = [];

  if (assistantIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("message_sources")
      .select("messageId, chunkId, similarity, sourceId, sourceOrder")
      .in("messageId", assistantIds);
    if (error) {
      console.error("Could not load conversation citations", error);
      return errorResponse("The conversation citations could not be loaded.", 502);
    }
    sourceRows = (data ?? []) as StoredMessageSource[];
  }

  const chunkIds = [...new Set(sourceRows.map((source) => source.chunkId))];
  if (chunkIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("document_chunks")
      .select("id, documentId, chunkIndex, pageNumber")
      .in("id", chunkIds);
    if (error) {
      console.error("Could not load cited chunks", error);
      return errorResponse("The conversation citations could not be loaded.", 502);
    }
    chunks = (data ?? []) as StoredChunk[];
  }

  const citedDocumentIds = [...new Set(chunks.map((chunk) => chunk.documentId))];
  if (citedDocumentIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id, originalName")
      .eq("userId", appUser.id)
      .in("id", citedDocumentIds);
    if (error) {
      console.error("Could not load cited documents", error);
      return errorResponse("The conversation citations could not be loaded.", 502);
    }
    documents = (data ?? []) as StoredDocument[];
  }

  const detail: ConversationDetail = {
    id: conversation.id as string,
    title: conversation.title as string,
    lastMessageAt: (conversation.lastMessageAt as string | null) ?? null,
    createdAt: conversation.createdAt as string,
    documentIds: (conversationDocumentsResult.data ?? []).map(
      (row) => row.documentId as string,
    ),
  };
  const chunksById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const documentsById = new Map(
    documents.map((document) => [document.id, document]),
  );
  const messages: RagUIMessage[] = storedMessages.map((message) => {
    const sources =
      message.role === "ASSISTANT"
        ? buildSources(message.id, sourceRows, chunksById, documentsById)
        : [];

    return {
      id: message.id,
      role: message.role === "USER" ? "user" : "assistant",
      parts: [
        { type: "text", text: message.content },
        ...(sources.length > 0
          ? [
              {
                type: "data-sources" as const,
                data: {
                  conversationId: detail.id,
                  title: detail.title,
                  createdAt: detail.createdAt,
                  sources,
                },
              },
            ]
          : []),
      ],
    };
  });

  return Response.json({ conversation: detail, messages });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/conversations/[conversationId]">,
) {
  const appUser = await requireAppUser();
  if (!appUser) return errorResponse("Authentication required.", 401);

  const { conversationId } = await context.params;
  if (!isUuid(conversationId)) {
    return errorResponse("Conversation not found.", 404);
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("userId", appUser.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Could not delete conversation", error);
    return errorResponse("The conversation could not be deleted.", 502);
  }
  if (!data) return errorResponse("Conversation not found.", 404);

  return new Response(null, { status: 204 });
}

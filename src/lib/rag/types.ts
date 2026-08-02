import type { UIMessage } from "ai";
import type { AIProgress } from "@/lib/ai/stream-types";

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  pageNumber: number | null;
  textContent: string;
  vectorSimilarity: number;
  keywordRank: number;
  rrfScore: number;
};

export type RagSource = {
  id: string;
  chunkIds: string[];
  documentId: string;
  documentName: string;
  pageStart: number | null;
  pageEnd: number | null;
  chunkStart: number;
  chunkEnd: number;
  similarity: number;
  score: number;
  excerpt: string | null;
};

export type BuiltContext = {
  text: string;
  sources: RagSource[];
  estimatedTokens: number;
};

export type RagDataParts = {
  progress: AIProgress;
  conversation: {
    conversationId: string;
    title: string;
    createdAt: string;
  };
  sources: {
    conversationId: string;
    title: string;
    createdAt: string;
    messageId?: string;
    sources: RagSource[];
  };
};

export type RagUIMessage = UIMessage<unknown, RagDataParts>;

export type ConversationSummary = {
  id: string;
  title: string;
  lastMessageAt: string | null;
  createdAt: string;
};

export type ConversationDetail = ConversationSummary & {
  documentIds: string[];
};

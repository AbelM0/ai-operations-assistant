import type { WorkspaceDocument } from "@/lib/documents/types";
import type {
  ConversationDetail,
  ConversationSummary,
  RagUIMessage,
} from "@/lib/rag/types";

export type AskNexusShellProps = {
  documents: WorkspaceDocument[];
  initialConversations: ConversationSummary[];
};

export type ConversationResponse = {
  conversation: ConversationDetail;
  messages: RagUIMessage[];
};

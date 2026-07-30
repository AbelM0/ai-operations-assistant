import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";

export type WorkspaceShellProps = {
  firstName: string;
  initialDocuments: WorkspaceDocument[];
  initialConversations: ConversationSummary[];
  conversationCount: number;
};

export type WorkspaceOverviewData = WorkspaceShellProps;

export type DocumentUploadedHandler = (document: WorkspaceDocument) => void;

import type { ConversationResponse } from "./types";

export async function getConversation(
  conversationId: string,
): Promise<ConversationResponse> {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Could not load the conversation.");
  }

  return (await response.json()) as ConversationResponse;
}

export async function removeConversation(conversationId: string) {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Could not delete the conversation.");
  }
}

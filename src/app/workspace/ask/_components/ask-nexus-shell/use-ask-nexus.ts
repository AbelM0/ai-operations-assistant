"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { AIProgress } from "@/lib/ai/stream-types";
import type { ConversationSummary, RagUIMessage } from "@/lib/rag/types";
import { getConversation, removeConversation } from "./actions";
import type { AskNexusShellProps } from "./types";

export function useAskNexus({
  documents,
  initialConversations,
}: AskNexusShellProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [loadingConversationId, setLoadingConversationId] = useState<
    string | null
  >(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [conversationPendingDelete, setConversationPendingDelete] =
    useState<ConversationSummary | null>(null);
  const [responseProgress, setResponseProgress] =
    useState<AIProgress | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    clearError,
  } = useChat<RagUIMessage>({
    onData: (part) => {
      if (part.type === "data-progress") {
        setResponseProgress(part.data);
        return;
      }

      if (
        part.type === "data-conversation" ||
        part.type === "data-sources"
      ) {
        setConversationId(part.data.conversationId);
        conversationIdRef.current = part.data.conversationId;
        setConversations((current) => {
          const nextConversation: ConversationSummary = {
            id: part.data.conversationId,
            title: part.data.title,
            createdAt: part.data.createdAt,
            lastMessageAt: new Date().toISOString(),
          };
          return [
            nextConversation,
            ...current.filter(
              (conversation) => conversation.id !== nextConversation.id,
            ),
          ].slice(0, 12);
        });
      }
    },
    onFinish: async () => {
      setResponseProgress(null);
      const id = conversationIdRef.current;
      if (!id) return;

      try {
        const payload = await getConversation(id);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === id
              ? {
                  ...conversation,
                  title: payload.conversation.title,
                  lastMessageAt: payload.conversation.lastMessageAt,
                }
              : conversation,
          ),
        );
      } catch {
        // The answer is complete; a title refresh should not interrupt it.
      }
    },
    onError: () => setResponseProgress(null),
  });
  const isResponding = status === "submitted" || status === "streaming";
  const latestMessage = messages.at(-1);
  const latestAssistantHasText =
    latestMessage?.role === "assistant" &&
    latestMessage.parts.some(
      (part) => part.type === "text" && Boolean(part.text.trim()),
    );
  const showResponseProgress = isResponding && !latestAssistantHasText;

  useEffect(() => {
    const bottomThreshold = 96;
    const handleScroll = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight;

      if (distanceFromBottom <= bottomThreshold) {
        autoScrollRef.current = true;
      } else if (isResponding) {
        autoScrollRef.current = false;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isResponding]);

  useEffect(() => {
    if (!autoScrollRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, status]);

  const pauseAutoScroll = () => {
    if (isResponding) autoScrollRef.current = false;
  };

  const toggleDocument = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const sendQuestion = (value = draft) => {
    const question = value.trim();
    if (!question || selectedIds.length === 0 || isResponding) return;

    setDraft("");
    clearError();
    setResponseProgress({
      stage: "validating",
      label: t("chat.progress.validating.label"),
      detail: t("chat.progress.validating.detail"),
    });
    autoScrollRef.current = true;
    void sendMessage(
      { text: question },
      { body: { conversationId, documentIds: selectedIds } },
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion();
  };

  const startNewChat = () => {
    stop();
    setMessages([]);
    setDraft("");
    setSelectedIds([]);
    setConversationId(null);
    conversationIdRef.current = null;
    setChatStarted(false);
    setHistoryError(null);
    setResponseProgress(null);
    autoScrollRef.current = true;
    clearError();
  };

  const loadConversation = async (id: string) => {
    if (id === loadingConversationId) return;

    stop();
    clearError();
    setHistoryError(null);
    setResponseProgress(null);
    setLoadingConversationId(id);

    try {
      const payload = await getConversation(id);
      const availableDocumentIds = new Set(
        documents
          .filter((document) => document.status === "READY")
          .map((document) => document.id),
      );

      setMessages(payload.messages);
      setSelectedIds(
        payload.conversation.documentIds.filter((documentId) =>
          availableDocumentIds.has(documentId),
        ),
      );
      setConversationId(payload.conversation.id);
      conversationIdRef.current = payload.conversation.id;
      setChatStarted(true);
      setDraft("");
      autoScrollRef.current = true;
    } catch (cause) {
      setHistoryError(
        cause instanceof Error ? cause.message : t("chat.loadingConversation"),
      );
    } finally {
      setLoadingConversationId(null);
    }
  };

  const requestDeleteConversation = (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    if (!conversation || deletingConversationId) return;

    setConversationPendingDelete(conversation);
  };

  const cancelDeleteConversation = () => {
    if (!deletingConversationId) setConversationPendingDelete(null);
  };

  const deleteConversation = async () => {
    const conversation = conversationPendingDelete;
    if (!conversation || deletingConversationId) return;

    const id = conversation.id;

    setDeletingConversationId(id);
    setHistoryError(null);
    try {
      await removeConversation(id);
      setConversations((current) =>
        current.filter((item) => item.id !== id),
      );
      setConversationPendingDelete(null);
      if (conversationId === id) startNewChat();
    } catch (cause) {
      setHistoryError(
        cause instanceof Error ? cause.message : t("chat.deletingConversation"),
      );
    } finally {
      setDeletingConversationId(null);
    }
  };

  return {
    selectedIds,
    chatStarted,
    selectorOpen,
    draft,
    conversationId,
    conversations,
    loadingConversationId,
    historyError,
    deletingConversationId,
    conversationPendingDelete,
    responseProgress,
    messagesEndRef,
    messages,
    status,
    error,
    isResponding,
    showResponseProgress,
    setChatStarted,
    setSelectorOpen,
    setDraft,
    setHistoryError,
    clearError,
    stop,
    pauseAutoScroll,
    toggleDocument,
    sendQuestion,
    submit,
    startNewChat,
    loadConversation,
    requestDeleteConversation,
    cancelDeleteConversation,
    deleteConversation,
  };
}

export type AskNexusController = ReturnType<typeof useAskNexus>;

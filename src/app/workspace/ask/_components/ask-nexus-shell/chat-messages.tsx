"use client";

import { Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { StreamingMarkdown } from "@/components/ai/streaming-markdown";
import type { AskNexusController } from "./use-ask-nexus";

const prompts = [
  "chat.promptFacts",
  "chat.promptDates",
  "chat.promptAmounts",
  "chat.promptConflicts",
];

export function ChatMessages({
  controller,
}: {
  controller: AskNexusController;
}) {
  const { t } = useTranslation();
  const {
    messages,
    status,
    responseProgress,
    showResponseProgress,
    messagesEndRef,
    sendQuestion,
  } = controller;

  if (messages.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] text-[#5EEAD4]">
          <Sparkle className="h-5 w-5" weight="fill" />
        </div>
        <h1 className="mt-6 text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
          {t("chat.emptyTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#8B8B95]">
          {t("chat.emptyDescription")}
        </p>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendQuestion(t(prompt))}
              className="min-h-16 rounded-lg border border-white/10 bg-[#0B0B0D] px-4 py-3 text-left text-sm leading-5 text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#0D1312] hover:text-white active:translate-y-px"
            >
              {t(prompt)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 py-8 sm:py-10">
      <div className="space-y-8" aria-live="polite">
        {messages.map((message) => {
          const text = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");
          const sourcePart = message.parts.find(
            (part) => part.type === "data-sources",
          );
          const sources =
            sourcePart?.type === "data-sources"
              ? sourcePart.data.sources
              : [];
          if (message.role === "assistant" && !text.trim()) return null;

          const isStreamingMessage =
            status === "streaming" &&
            message.role === "assistant" &&
            message.id === messages.at(-1)?.id;

          return (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[88%]"
                  : "max-w-[92%]"
              }
            >
              {message.role === "assistant" ? (
                <div className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                    <Sparkle className="h-3.5 w-3.5" weight="fill" />
                  </span>
                  <div>
                    <StreamingMarkdown streaming={isStreamingMessage}>
                      {text}
                    </StreamingMarkdown>
                    {sources.length ? (
                      <div className="mt-4 rounded-lg border border-white/8 bg-[#0B0B0D] p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5EEAD4]">
                          {t("chat.sources")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sources.map((source) => (
                            <Link
                              key={source.id}
                              href={`/workspace/documents/${source.documentId}`}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-[#A1A1AA] transition-colors hover:border-[#2DD4BF]/30 hover:text-white"
                            >
                              <span className="font-mono text-[#5EEAD4]">
                                [{source.id}]
                              </span>
                              <span className="max-w-48 truncate">
                                {source.documentName}
                              </span>
                              {source.pageStart ? (
                                <span className="shrink-0 text-[#5E5E66]">
                                  {t("common.page")} {source.pageStart}
                                  {source.pageEnd &&
                                  source.pageEnd !== source.pageStart
                                    ? `-${source.pageEnd}`
                                    : ""}
                                </span>
                              ) : null}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-[#18181B] px-4 py-3 text-sm leading-6 text-[#F4F4F5]">
                  {text}
                </p>
              )}
            </article>
          );
        })}

        {showResponseProgress ? (
          <div className="grid grid-cols-[2rem_1fr] gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
              <Sparkle className="h-3.5 w-3.5" weight="fill" />
            </span>
            <div className="pt-1" aria-live="polite">
              <p className="text-sm font-medium text-[#D4D4D8]">
                {t(
                  `chat.progress.${responseProgress?.stage ?? "validating"}.label`,
                )}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#71717A]">
                {t(
                  `chat.progress.${responseProgress?.stage ?? "validating"}.detail`,
                )}
              </p>
              <div className="mt-3 h-0.5 w-28 animate-pulse rounded bg-[#2DD4BF]/45" />
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

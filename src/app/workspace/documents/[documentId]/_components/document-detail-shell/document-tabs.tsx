"use client";

import { useChat } from "@ai-sdk/react";
import { FilePdf, Sparkle } from "@phosphor-icons/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { SummaryModelOption } from "@/lib/ai/models";
import type { SummaryUIMessage } from "@/lib/ai/stream-types";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DocumentPreview } from "./document-preview";
import { fetchDocumentDetail } from "./actions";
import { SummaryControls } from "./summary-controls";
import { SummaryViewer } from "./summary-viewer";

type DocumentTabsProps = {
  document: WorkspaceDocumentDetail;
  models: SummaryModelOption[];
  locale: string;
  defaultModel: string;
  citedPage: number | null;
  onDocumentChange: (document: WorkspaceDocumentDetail) => void;
};

export function DocumentTabs({
  document,
  models,
  locale,
  defaultModel,
  citedPage,
  onDocumentChange,
}: DocumentTabsProps) {
  const { t } = useTranslation();
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/documents/${document.id}/summary`,
      }),
    [document.id],
  );
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    clearError,
  } = useChat<SummaryUIMessage>({
    transport,
    onFinish: async ({ isAbort, isError }) => {
      if (isAbort || isError) return;

      try {
        const refreshedDocument = await fetchDocumentDetail(document.id);
        onDocumentChange(refreshedDocument);
        toast.success(t("detail.summaryReady"), {
          description: t("detail.summaryReadyDescription"),
        });
      } catch (cause) {
        toast.error(t("detail.summaryRefreshFailed"), {
          description:
            cause instanceof Error
              ? cause.message
              : t("detail.summaryRefreshFailedDescription"),
        });
      }
    },
    onError: (cause) => {
      toast.error(t("detail.summaryFailed"), {
        description: cause.message,
      });
    },
  });

  return (
    <Tabs defaultValue="preview" className="mt-4 gap-3">
      <div className="flex items-center justify-between border-b border-white/8">
        <TabsList variant="line" className="h-10 gap-4 p-0">
          <TabsTrigger
            value="preview"
            className="h-10 gap-1.5 rounded-none px-1 text-sm text-[#71717A] data-active:text-white group-data-[variant=line]/tabs-list:data-active:after:bg-[#2DD4BF]"
          >
            <FilePdf className="h-4 w-4" />
            {t("detail.preview")}
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="h-10 gap-1.5 rounded-none px-1 text-sm text-[#71717A] data-active:text-white group-data-[variant=line]/tabs-list:data-active:after:bg-[#2DD4BF]"
          >
            <Sparkle className="h-4 w-4" />
            {t("detail.summary")}
            {document.summaries.length > 0 ? (
              <span className="ml-1 rounded bg-[#2DD4BF]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#5EEAD4]">
                {document.summaries.length}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <p className="hidden text-xs text-[#52525B] sm:block">
          {t("detail.switchViews")}
        </p>
      </div>

      <TabsContent value="preview">
        <DocumentPreview document={document} citedPage={citedPage} />
      </TabsContent>

      <TabsContent value="summary">
        <div className="grid items-start gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <SummaryControls
            document={document}
            models={models}
            selectedModel={selectedModel}
            status={status}
            sendMessage={sendMessage}
            stop={stop}
            setMessages={setMessages}
            clearError={clearError}
            onModelChange={setSelectedModel}
          />
          <SummaryViewer
            document={document}
            locale={locale}
            selectedModel={selectedModel}
            messages={messages}
            status={status}
            error={error}
            clearError={clearError}
            clearMessages={() => setMessages([])}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

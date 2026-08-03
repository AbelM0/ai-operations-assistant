"use client";

import { useChat } from "@ai-sdk/react";
import { FilePdf, Receipt, Sparkle } from "@phosphor-icons/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState } from "react";
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
import { OperationsCard } from "./operations-card";
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
  const [activeTab, setActiveTab] = useState(
    citedPage ? "preview" : document.status === "READY" ? "details" : "preview",
  );
  const [previewPage, setPreviewPage] = useState(citedPage);
  const tabsRef = useRef<HTMLDivElement | null>(null);
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

  const openEvidencePage = (page: number) => {
    setPreviewPage(page);
    setActiveTab("preview");

    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    window.history.replaceState(null, "", url);

    window.requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div ref={tabsRef} className="mt-4 scroll-mt-20">
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="gap-3"
    >
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
            value="details"
            className="h-10 gap-1.5 rounded-none px-1 text-sm text-[#71717A] data-active:text-white group-data-[variant=line]/tabs-list:data-active:after:bg-[#2DD4BF]"
          >
            <Receipt className="h-4 w-4" />
            {t("detail.operations.tab")}
            {document.extraction?.reviewStatus === "NEEDS_REVIEW" ? (
              <span className="ml-1 rounded bg-amber-300/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-200">
                {t("detail.operations.review")}
              </span>
            ) : null}
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
        <DocumentPreview document={document} citedPage={previewPage} />
      </TabsContent>

      <TabsContent value="details">
        <OperationsCard
          key={document.extraction?.updatedAt ?? "empty-extraction"}
          document={document}
          onDocumentChange={onDocumentChange}
          onOpenPage={openEvidencePage}
        />
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
    </div>
  );
}

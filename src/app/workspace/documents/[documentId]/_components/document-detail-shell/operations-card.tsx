"use client";

import {
  ArrowSquareOut,
  Check,
  CheckCircle,
  FloppyDisk,
  MagnifyingGlass,
  PlusCircle,
  Receipt,
  WarningCircle,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeExtractionDate } from "@/lib/documents/extraction-normalization";
import {
  documentTypes,
  extractionFieldKeys,
  type DocumentExtraction,
  type DocumentType,
  type ExtractedField,
  type ExtractionFieldKey,
  type WorkspaceDocumentDetail,
} from "@/lib/documents/types";
import {
  reanalyzeDocument,
  updateDocumentExtraction,
} from "./actions";

const fieldGroups: Array<{
  label: string;
  keys: ExtractionFieldKey[];
}> = [
  {
    label: "detail.operations.groups.identity",
    keys: ["vendor", "documentNumber", "vendorTaxId"],
  },
  {
    label: "detail.operations.groups.dates",
    keys: ["date", "dueDate"],
  },
  {
    label: "detail.operations.groups.amounts",
    keys: ["currency", "subtotal", "tax", "total"],
  },
  {
    label: "detail.operations.groups.accounting",
    keys: ["paymentMethod", "category"],
  },
];

const categories = [
  "OFFICE",
  "TRANSPORT",
  "UTILITIES",
  "FUEL",
  "RENT",
  "SALARY",
  "FOOD",
  "OTHER",
];

function emptyFields(): ExtractedField[] {
  return extractionFieldKeys.map((key) => ({
    key,
    value: null,
    normalizedValue: null,
    confidence: 0,
    status: "missing",
    pageNumber: null,
    chunkId: null,
    evidenceText: null,
  }));
}

function statusTone(status: DocumentExtraction["reviewStatus"]) {
  if (status === "CONFIRMED") {
    return "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]";
  }
  if (status === "FAILED") {
    return "border-red-400/20 bg-red-400/8 text-red-300";
  }
  if (status === "NEEDS_REVIEW") {
    return "border-amber-300/20 bg-amber-300/[0.06] text-amber-200";
  }
  return "border-white/10 bg-white/[0.04] text-[#A1A1AA]";
}

export function OperationsCard({
  document,
  onDocumentChange,
  onOpenPage,
}: {
  document: WorkspaceDocumentDetail;
  onDocumentChange: (document: WorkspaceDocumentDetail) => void;
  onOpenPage: (page: number) => void;
}) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<DocumentType>(
    document.extraction?.documentType ?? "OTHER",
  );
  const [fields, setFields] = useState<ExtractedField[]>(
    document.extraction?.fields ?? emptyFields(),
  );
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "analyze" | "save" | "confirm" | "promote" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const extraction = document.extraction;
  const financialDocument =
    selectedType === "INVOICE" || selectedType === "RECEIPT";
  const reviewCount = useMemo(
    () =>
      fields.filter(
        (field) =>
          field.value &&
          (field.confidence < 0.78 ||
            (!field.evidenceText && field.status !== "corrected")),
      ).length,
    [fields],
  );

  const applyPayload = (payload: {
    extraction: DocumentExtraction;
    duplicateExpenses: WorkspaceDocumentDetail["duplicateExpenses"];
  }) => {
    onDocumentChange({
      ...document,
      extraction: payload.extraction,
      duplicateExpenses: payload.duplicateExpenses,
    });
  };

  const analyze = async () => {
    setPendingAction("analyze");
    setError(null);
    try {
      const forcedType = extraction
        ? selectedType === extraction.documentType
          ? undefined
          : selectedType
        : selectedType === "OTHER"
          ? undefined
          : selectedType;
      const payload = await reanalyzeDocument(document.id, forcedType);
      applyPayload(payload);
      toast.success(t("detail.operations.analysisReady"));
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : t("detail.operations.updateFailed");
      setError(message);
      toast.error(t("detail.operations.analysisFailed"), {
        description: message,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const mutate = async (
    action: "save" | "confirm" | "promote",
    allowDuplicate = false,
  ) => {
    setPendingAction(action);
    setError(null);
    try {
      const payload = await updateDocumentExtraction(
        document.id,
        action,
        fields,
        allowDuplicate,
      );
      applyPayload(payload);
      toast.success(t(`detail.operations.${action}Success`));
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : t("detail.operations.updateFailed");
      setError(message);
      toast.error(t("detail.operations.updateFailed"), {
        description: message,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const updateField = (key: ExtractionFieldKey, value: string) => {
    setFields((current) =>
      current.map((field) =>
        field.key === key
          ? {
              ...field,
              value: value || null,
              normalizedValue:
                key === "date" || key === "dueDate"
                  ? normalizeExtractionDate(value)
                  : field.normalizedValue,
              status: value ? "corrected" : "missing",
            }
          : field,
      ),
    );
  };

  if (!extraction) {
    return (
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
        <div className="grid gap-7 p-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:p-8">
          <div>
            <Receipt className="h-6 w-6 text-[#5EEAD4]" weight="duotone" />
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-white">
              {t("detail.operations.emptyTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8B8B95]">
              {t("detail.operations.emptyDescription")}
            </p>
          </div>
          <div className="space-y-3">
            <TypeSelector value={selectedType} onChange={setSelectedType} t={t} />
            <button
              type="button"
              onClick={() => void analyze()}
              disabled={pendingAction !== null || document.status !== "READY"}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#DDFBF5] px-4 text-xs font-semibold text-[#08211C] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MagnifyingGlass className="h-4 w-4" />
              {pendingAction === "analyze"
                ? t("detail.operations.analyzing")
                : t("detail.operations.analyze")}
            </button>
          </div>
        </div>
        {error ? <InlineError message={error} /> : null}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <header className="grid gap-5 border-b border-white/8 px-5 py-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5EEAD4]">
              {t(`detail.operations.types.${extraction.documentType.toLowerCase()}`)}
            </span>
            <span
              className={`inline-flex rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] ${statusTone(extraction.reviewStatus)}`}
            >
              {t(
                `detail.operations.status.${extraction.reviewStatus.toLowerCase()}`,
              )}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
            {t("detail.operations.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8B8B95]">
            {t("detail.operations.description")}
          </p>
        </div>
        <div className="space-y-2">
          <TypeSelector value={selectedType} onChange={setSelectedType} t={t} />
          <button
            type="button"
            onClick={() => void analyze()}
            disabled={pendingAction !== null}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-xs font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:opacity-50"
          >
            <MagnifyingGlass className="h-3.5 w-3.5" />
            {pendingAction === "analyze"
              ? t("detail.operations.analyzing")
              : t("detail.operations.analyzeAgain")}
          </button>
        </div>
      </header>

      {extraction.reviewStatus === "FAILED" ? (
        <div className="p-5 sm:p-7">
          <InlineError
            message={
              extraction.errorMessage || t("detail.operations.analysisFailed")
            }
          />
        </div>
      ) : financialDocument ? (
        <>
          <div className="grid gap-0 lg:grid-cols-2">
            {fieldGroups.map((group) => (
              <section
                key={group.label}
                className="border-b border-white/8 p-5 sm:p-7 lg:odd:border-r"
              >
                <h3 className="text-sm font-semibold text-[#E4E4E7]">
                  {t(group.label)}
                </h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {group.keys.map((key) => {
                    const field = fields.find((candidate) => candidate.key === key);
                    if (!field) return null;
                    return (
                      <FieldEditor
                        key={key}
                        field={field}
                        expanded={expandedEvidence === key}
                        onExpand={() =>
                          setExpandedEvidence((current) =>
                            current === key ? null : key,
                          )
                        }
                        onChange={(value) => updateField(key, value)}
                        onOpenPage={onOpenPage}
                        t={t}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {document.duplicateExpenses.length > 0 ? (
            <div className="mx-5 mt-5 flex gap-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.045] p-4 text-amber-100 sm:mx-7">
              <WarningCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {t("detail.operations.duplicateTitle")}
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-100/65">
                  {t("detail.operations.duplicateDescription", {
                    count: document.duplicateExpenses.length,
                  })}
                </p>
              </div>
            </div>
          ) : null}

          {error ? <InlineError message={error} /> : null}

          <footer className="flex flex-col gap-4 border-t border-white/8 bg-[#09090B] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#D4D4D8]">
                {reviewCount > 0
                  ? t("detail.operations.reviewCount", { count: reviewCount })
                  : t("detail.operations.evidenceReady")}
              </p>
              <p className="mt-1 text-[11px] text-[#71717A]">
                {t("detail.operations.confirmationHint")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void mutate("save")}
                disabled={pendingAction !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-xs font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/35 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:opacity-50"
              >
                <FloppyDisk className="h-4 w-4" />
                {pendingAction === "save"
                  ? t("detail.operations.saving")
                  : t("detail.operations.save")}
              </button>
              <button
                type="button"
                onClick={() => void mutate("confirm")}
                disabled={pendingAction !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#DDFBF5] px-3.5 text-xs font-semibold text-[#08211C] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:opacity-50"
              >
                <Check className="h-4 w-4" weight="bold" />
                {pendingAction === "confirm"
                  ? t("detail.operations.confirming")
                  : t("detail.operations.confirm")}
              </button>
              {extraction.reviewStatus === "CONFIRMED" ? (
                <button
                  type="button"
                  onClick={() =>
                    void mutate(
                      "promote",
                      document.duplicateExpenses.length > 0,
                    )
                  }
                  disabled={pendingAction !== null || Boolean(extraction.expenseEntryId)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/8 px-3.5 text-xs font-semibold text-[#5EEAD4] hover:bg-[#2DD4BF]/13 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {extraction.expenseEntryId ? (
                    <CheckCircle className="h-4 w-4" weight="fill" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  {extraction.expenseEntryId
                    ? t("detail.operations.addedToExpenses")
                    : document.duplicateExpenses.length > 0
                      ? t("detail.operations.addDuplicateAnyway")
                      : t("detail.operations.addToExpenses")}
                </button>
              ) : null}
            </div>
          </footer>
        </>
      ) : (
        <div className="p-6 sm:p-8">
          <div className="max-w-2xl">
            <Receipt className="h-6 w-6 text-[#71717A]" weight="duotone" />
            <h3 className="mt-4 text-base font-semibold text-white">
              {t("detail.operations.unsupportedTitle")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#8B8B95]">
              {t("detail.operations.unsupportedDescription")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function TypeSelector({
  value,
  onChange,
  t,
}: {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const items = documentTypes.map((type) => ({
    value: type,
    label: t(`detail.operations.types.${type.toLowerCase()}`),
  }));

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-medium text-[#A1A1AA]">
        {t("detail.operations.documentType")}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue as DocumentType);
        }}
        items={items}
      >
        <SelectTrigger
          aria-label={t("detail.operations.documentType")}
          className="w-full border-white/10 bg-[#111113] text-xs text-white data-[size=default]:h-10 focus-visible:border-[#2DD4BF]/50 focus-visible:ring-[#2DD4BF]/20"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FieldEditor({
  field,
  expanded,
  onExpand,
  onChange,
  onOpenPage,
  t,
}: {
  field: ExtractedField;
  expanded: boolean;
  onExpand: () => void;
  onChange: (value: string) => void;
  onOpenPage: (page: number) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const lowConfidence =
    Boolean(field.value) &&
    (field.confidence < 0.78 ||
      (!field.evidenceText && field.status !== "corrected"));
  const inputType =
    field.key === "date" || field.key === "dueDate"
      ? "date"
      : ["subtotal", "tax", "total"].includes(field.key)
        ? "text"
        : "text";
  const inputValue =
    field.key === "date" || field.key === "dueDate"
      ? normalizeExtractionDate(field.normalizedValue) ??
        normalizeExtractionDate(field.value) ??
        ""
      : field.value ?? "";

  return (
    <div className={field.key === "vendor" ? "sm:col-span-2" : ""}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={`extraction-${field.key}`}
          className="text-[11px] font-medium text-[#A1A1AA]"
        >
          {t(`detail.operations.fields.${field.key}`)}
        </label>
        {lowConfidence ? (
          <span className="text-[10px] text-amber-200">
            {t("detail.operations.review")}
          </span>
        ) : null}
      </div>
      {field.key === "category" ? (
        <Select
          value={field.value}
          onValueChange={(nextValue) => onChange(nextValue ?? "")}
          items={[
            {
              value: null,
              label: t("detail.operations.notFound"),
            },
            ...categories.map((category) => ({
              value: category,
              label: t(
                `detail.operations.categories.${category.toLowerCase()}`,
              ),
            })),
          ]}
        >
          <SelectTrigger
            id={`extraction-${field.key}`}
            className="mt-1.5 w-full border-white/10 bg-[#111113] text-sm text-white data-[size=default]:h-10 focus-visible:border-[#2DD4BF]/50 focus-visible:ring-[#2DD4BF]/20"
          >
            <SelectValue placeholder={t("detail.operations.notFound")} />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value={null}>
              {t("detail.operations.notFound")}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {t(
                  `detail.operations.categories.${category.toLowerCase()}`,
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <input
          id={`extraction-${field.key}`}
          type={inputType}
          inputMode={
            ["subtotal", "tax", "total"].includes(field.key)
              ? "decimal"
              : undefined
          }
          value={inputValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("detail.operations.notFound")}
          className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#111113] px-3 text-sm text-white outline-none placeholder:text-[#52525B] focus:border-[#2DD4BF]/50 focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/20"
        />
      )}
      {field.evidenceText ? (
        <button
          type="button"
          onClick={onExpand}
          className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#5EEAD4] hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4]"
        >
          <Receipt className="h-3.5 w-3.5" />
          {field.pageNumber
            ? t("detail.operations.viewEvidencePage", {
                page: field.pageNumber,
              })
            : t("detail.operations.viewEvidence")}
        </button>
      ) : field.status === "corrected" ? (
        <p className="mt-2 text-[10px] text-[#71717A]">
          {t("detail.operations.userCorrected")}
        </p>
      ) : null}
      {expanded && field.evidenceText ? (
        <div className="mt-2 rounded-lg border border-[#2DD4BF]/15 bg-[#07100E] p-3">
          <blockquote className="text-xs leading-5 text-[#B9C4C1]">
            {field.evidenceText}
          </blockquote>
          {field.pageNumber ? (
            <button
              type="button"
              onClick={() => onOpenPage(field.pageNumber!)}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#5EEAD4] hover:text-white"
            >
              <ArrowSquareOut className="h-3.5 w-3.5" />
              {t("detail.operations.openPage", { page: field.pageNumber })}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mx-5 my-4 flex gap-2.5 rounded-lg border border-red-400/15 bg-red-400/[0.05] p-3 text-xs leading-5 text-red-200 sm:mx-7"
    >
      <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

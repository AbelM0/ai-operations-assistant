import type { UIMessage } from "ai";

export type AIProgressStage =
  | "validating"
  | "loading"
  | "retrieving"
  | "preparing"
  | "generating";

export type AIProgress = {
  stage: AIProgressStage;
  label: string;
  detail: string;
};

export type SummaryDataParts = {
  progress: AIProgress;
};

export type SummaryUIMessage = UIMessage<unknown, SummaryDataParts>;

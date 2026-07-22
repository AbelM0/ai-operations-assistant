export type SummaryModelOption = {
  id: string;
  label: string;
  provider: "deepseek";
  description: string;
};

const configuredModel = process.env.DEEPSEEK_MODEL?.trim();

const deepSeekModels: SummaryModelOption[] = [
  {
    id: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    provider: "deepseek",
    description: "Fast, efficient summaries for everyday documents.",
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    provider: "deepseek",
    description: "More thorough analysis for complex or technical documents.",
  },
];

if (configuredModel && !deepSeekModels.some((model) => model.id === configuredModel)) {
  deepSeekModels.unshift({
    id: configuredModel,
    label: `DeepSeek (${configuredModel})`,
    provider: "deepseek",
    description: "The DeepSeek model configured for this workspace.",
  });
}

export const summaryModels = deepSeekModels;

export const defaultSummaryModel =
  configuredModel && deepSeekModels.some((model) => model.id === configuredModel)
    ? configuredModel
    : "deepseek-v4-flash";

export function isSummaryModel(model: string) {
  return summaryModels.some((option) => option.id === model);
}

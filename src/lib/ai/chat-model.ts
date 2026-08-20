import "server-only";

import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { wrapEmbeddingModel, type LanguageModel } from "ai";
import { langSmithEmbeddingMiddleware } from "@/lib/ai/sdk";

type ChatModelResult = {
  model: LanguageModel;
  modelId: string;
  provider: "openai" | "deepseek";
  providerOptions?: {
    deepseek?: {
      thinking?: {
        type: "disabled" | "enabled" | "adaptive";
      };
    };
  };
};

export function getChatModel(): ChatModelResult {
  const useOpenAI = process.env.AI_PROVIDER?.toLowerCase() === "openai";

  if (useOpenAI) {
    const modelId = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
    return {
      model: openai(modelId),
      modelId,
      provider: "openai",
    };
  }

  // DeepSeek (default)
  const modelId =
    process.env.RAG_CHAT_MODEL ||
    process.env.DEEPSEEK_MODEL ||
    "deepseek-v4-flash";

  const isV4 = modelId.startsWith("deepseek-v4-");

  return {
    model: deepseek(modelId),
    modelId,
    provider: "deepseek",
    // Disable the long hidden reasoning pass on V4 models
    providerOptions: isV4
      ? {
          deepseek: {
            thinking: { type: "disabled" },
          },
        }
      : undefined,
  };
}

export function getDeepSeekModel(modelId: string): ChatModelResult {
  const isV4 = modelId.startsWith("deepseek-v4-");

  return {
    model: deepseek(modelId),
    modelId,
    provider: "deepseek",
    providerOptions: isV4
      ? {
          deepseek: {
            thinking: { type: "disabled" },
          },
        }
      : undefined,
  };
}

export function getOpenAIEmbeddingModel() {
  const modelId =
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  return {
    model: wrapEmbeddingModel({
      model: openai.embedding(modelId),
      middleware: langSmithEmbeddingMiddleware({
        provider: "openai",
        modelId,
      }),
    }),
    modelId,
    provider: "openai" as const,
  };
}

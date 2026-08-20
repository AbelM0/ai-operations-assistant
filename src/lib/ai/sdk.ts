import "server-only";

import * as ai from "ai";
import type { EmbeddingModelMiddleware } from "ai";
import {
  createLangSmithProviderOptions,
  wrapAISDK,
} from "langsmith/experimental/vercel";
import { traceable } from "langsmith/traceable";

const applicationMetadata = {
  application: "ai-operations-assistant",
};

const tracedAISDK = wrapAISDK(ai, {
  tags: ["application:ai-operations-assistant"],
  metadata: applicationMetadata,
});

export const generateText = tracedAISDK.generateText;
export const streamText = tracedAISDK.streamText;

export function withLangSmithTracing<
  T extends Record<string, Record<string, unknown>> | undefined,
>(providerOptions: T, operation: string) {
  return {
    ...providerOptions,
    langsmith: createLangSmithProviderOptions({
      name: operation,
      tags: [`operation:${operation}`],
      metadata: {
        ...applicationMetadata,
        operation,
      },
    }),
  };
}

export function langSmithEmbeddingMiddleware({
  provider,
  modelId,
}: {
  provider: string;
  modelId: string;
}): EmbeddingModelMiddleware {
  return {
    wrapEmbed: async ({ doEmbed, params }) => {
      const tracedEmbed = traceable(async () => doEmbed(), {
        name: `${provider}:${modelId}`,
        run_type: "embedding",
        tags: [
          "application:ai-operations-assistant",
          "operation:document-embedding",
          `provider:${provider}`,
        ],
        metadata: {
          ...applicationMetadata,
          operation: "document-embedding",
          ls_provider: provider,
          ls_model_name: modelId,
          ai_sdk_method: "ai.doEmbed",
        },
        processInputs: () => ({ values: params.values }),
        processOutputs: (result) => ({
          embeddingCount: result.embeddings.length,
          dimensions: result.embeddings[0]?.length ?? 0,
          usage: result.usage,
        }),
      });

      return tracedEmbed();
    },
  };
}

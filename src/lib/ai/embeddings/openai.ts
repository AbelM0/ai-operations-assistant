import "server-only";

import { embedMany } from "ai";
import { getOpenAIEmbeddingModel } from "@/lib/ai/chat-model";
import type { EmbeddingProvider } from "./types";
import { STORED_EMBEDDING_DIMENSIONS } from "./types";

export function createOpenAIEmbeddingProvider(): EmbeddingProvider {
  const embeddingModel = getOpenAIEmbeddingModel();

  return {
    id: "openai",
    model: embeddingModel.modelId,
    dimensions: STORED_EMBEDDING_DIMENSIONS,
    async embed(inputs) {
      if (inputs.length === 0) return [];

      const { embeddings } = await embedMany({
        model: embeddingModel.model,
        values: inputs,
        providerOptions: {
          openai: {
            dimensions: STORED_EMBEDDING_DIMENSIONS,
          },
        },
        maxRetries: 2,
      });

      if (
        embeddings.length !== inputs.length ||
        embeddings.some(
          (embedding) => embedding.length !== STORED_EMBEDDING_DIMENSIONS,
        )
      ) {
        throw new Error("OpenAI returned an unexpected embedding batch shape.");
      }

      return embeddings;
    },
  };
}

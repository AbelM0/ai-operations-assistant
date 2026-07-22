import "server-only";

import type { EmbeddingProvider } from "./types";
import { STORED_EMBEDDING_DIMENSIONS } from "./types";

type OpenAIEmbeddingResponse = {
  data?: Array<{ embedding?: number[]; index?: number }>;
  error?: { message?: string };
};

export function createOpenAIEmbeddingProvider(): EmbeddingProvider {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai.");
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  return {
    id: "openai",
    model,
    dimensions: STORED_EMBEDDING_DIMENSIONS,
    async embed(inputs) {
      if (inputs.length === 0) return [];

      const response = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: inputs,
          model,
          dimensions: STORED_EMBEDDING_DIMENSIONS,
          encoding_format: "float",
        }),
      });
      const payload = (await response.json()) as OpenAIEmbeddingResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message || "OpenAI embedding request failed.");
      }

      const embeddings = [...(payload.data ?? [])]
        .sort((left, right) => (left.index ?? 0) - (right.index ?? 0))
        .map((item) => item.embedding);

      if (
        embeddings.length !== inputs.length ||
        embeddings.some(
          (embedding) => embedding?.length !== STORED_EMBEDDING_DIMENSIONS,
        )
      ) {
        throw new Error("OpenAI returned an unexpected embedding batch shape.");
      }

      return embeddings as number[][];
    },
  };
}


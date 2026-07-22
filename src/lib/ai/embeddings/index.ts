import "server-only";

import type { EmbeddingProvider } from "./types";

let provider: EmbeddingProvider | undefined;

export async function getEmbeddingProvider() {
  if (provider) return provider;

  const providerName = (process.env.EMBEDDING_PROVIDER || "local").toLowerCase();

  if (providerName === "local") {
    provider = (await import("./local")).localEmbeddingProvider;
    return provider;
  }

  if (providerName === "openai") {
    provider = (await import("./openai")).createOpenAIEmbeddingProvider();
    return provider;
  }

  throw new Error(`Unsupported embedding provider: ${providerName}.`);
}


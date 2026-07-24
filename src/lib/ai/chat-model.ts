import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type ProviderName = "openai" | "deepseek";

const clients = new Map<
  string,
  ReturnType<typeof createOpenAICompatible>
>();

function getCompatibleClient({
  provider,
  apiKey,
  baseURL,
}: {
  provider: ProviderName;
  apiKey: string | undefined;
  baseURL: string;
}) {
  if (!apiKey) {
    throw new Error(
      `${provider === "openai" ? "OPENAI_API_KEY" : "DEEPSEEK_API_KEY"} is required.`,
    );
  }

  const normalizedBaseURL = baseURL.replace(/\/$/, "");
  const cacheKey = `${provider}:${normalizedBaseURL}`;
  const cached = clients.get(cacheKey);
  if (cached) return cached;

  const client = createOpenAICompatible({
    name: provider,
    apiKey,
    baseURL: normalizedBaseURL,
    includeUsage: true,
  });
  clients.set(cacheKey, client);
  return client;
}

function createCompatibleModel({
  provider,
  apiKey,
  baseURL,
  modelId,
}: {
  provider: ProviderName;
  apiKey: string | undefined;
  baseURL: string;
  modelId: string;
}) {
  const client = getCompatibleClient({ provider, apiKey, baseURL });
  const providerOptions =
    provider === "deepseek" && modelId.startsWith("deepseek-v4-")
      ? {
          deepseek: {
            // DeepSeek V4 otherwise streams a long hidden reasoning pass
            // before it begins emitting user-visible answer tokens.
            thinking: { type: "disabled" },
          },
        }
      : undefined;

  return {
    model: client.chatModel(modelId),
    modelId,
    provider,
    providerOptions,
  };
}

export function getChatModel() {
  const useOpenAI = process.env.AI_PROVIDER?.toLowerCase() === "openai";
  const provider = useOpenAI ? "openai" : "deepseek";
  const apiKey = useOpenAI
    ? process.env.OPENAI_API_KEY
    : process.env.DEEPSEEK_API_KEY;

  const baseURL = (
    useOpenAI
      ? process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
      : process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  );
  const modelId = useOpenAI
    ? process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini"
    : process.env.RAG_CHAT_MODEL ||
      process.env.DEEPSEEK_MODEL ||
      "deepseek-v4-flash";
  return createCompatibleModel({
    provider,
    apiKey,
    baseURL,
    modelId,
  });
}

export function getDeepSeekModel(modelId: string) {
  return createCompatibleModel({
    provider: "deepseek",
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    modelId,
  });
}

export function getOpenAIEmbeddingModel() {
  const modelId =
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  const client = getCompatibleClient({
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

  return {
    model: client.embeddingModel(modelId),
    modelId,
    provider: "openai" as const,
  };
}

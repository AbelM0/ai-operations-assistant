import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

function createCompatibleModel({
  provider,
  apiKey,
  baseURL,
  modelId,
}: {
  provider: "openai" | "deepseek";
  apiKey: string | undefined;
  baseURL: string;
  modelId: string;
}) {
  if (!apiKey) {
    throw new Error(
      `${provider === "openai" ? "OPENAI_API_KEY" : "DEEPSEEK_API_KEY"} is required.`,
    );
  }

  const client = createOpenAICompatible({
    name: provider,
    apiKey,
    baseURL: baseURL.replace(/\/$/, ""),
    includeUsage: true,
  });

  return {
    model: client(modelId),
    modelId,
    provider,
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

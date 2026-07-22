import "server-only";

type DeepSeekUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: DeepSeekUsage;
  error?: { message?: string };
};

export type AICompletion = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export async function createDeepSeekCompletion({
  model,
  system,
  user,
}: {
  model: string;
  system: string;
  user: string;
}): Promise<AICompletion> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek is not configured. Add DEEPSEEK_API_KEY to the server environment.");
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 5000,
      stream: false,
      ...(model.startsWith("deepseek-v4-")
        ? { thinking: { type: "disabled" } }
        : {}),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as DeepSeekResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `DeepSeek returned ${response.status}.`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("DeepSeek returned an empty summary.");

  return {
    content,
    usage: {
      promptTokens: payload.usage?.prompt_tokens || 0,
      completionTokens: payload.usage?.completion_tokens || 0,
      totalTokens: payload.usage?.total_tokens || 0,
    },
  };
}

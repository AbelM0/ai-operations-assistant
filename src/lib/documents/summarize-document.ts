import "server-only";

import { createDeepSeekCompletion } from "@/lib/ai/deepseek";

const MAX_BATCH_CHARACTERS = 72_000;

type Chunk = { pageNumber: number | null; textContent: string };

function buildBatches(chunks: Chunk[]) {
  const batches: string[] = [];
  let current = "";

  for (const chunk of chunks) {
    const section = `\n\n[Page ${chunk.pageNumber ?? "unknown"}]\n${chunk.textContent}`;
    if (current && current.length + section.length > MAX_BATCH_CHARACTERS) {
      batches.push(current);
      current = "";
    }
    current += section;
  }

  if (current) batches.push(current);
  return batches;
}

const systemPrompt = `You summarize business documents with precision. Use only facts present in the supplied text. Do not invent missing details. Preserve important names, dates, amounts, obligations, risks, decisions, and deadlines. Write clear Markdown with these sections when supported by the source: Overview, Key points, Important figures and dates, Risks or obligations, and Recommended follow-up. Omit unsupported sections. Keep the result useful and concise.`;

export async function summarizeDocumentChunks(chunks: Chunk[], model: string) {
  const batches = buildBatches(chunks);
  if (batches.length === 0) throw new Error("This document has no extracted text to summarize.");

  const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const addUsage = (next: typeof usage) => {
    usage.promptTokens += next.promptTokens;
    usage.completionTokens += next.completionTokens;
    usage.totalTokens += next.totalTokens;
  };

  if (batches.length === 1) {
    const result = await createDeepSeekCompletion({
      model,
      system: systemPrompt,
      user: `Summarize this document.\n${batches[0]}`,
    });
    addUsage(result.usage);
    return { summary: result.content, usage };
  }

  const partialSummaries: string[] = [];
  for (let index = 0; index < batches.length; index += 1) {
    const result = await createDeepSeekCompletion({
      model,
      system: systemPrompt,
      user: `This is part ${index + 1} of ${batches.length} of one document. Produce a factual intermediate summary that retains details needed for a final whole-document summary.\n${batches[index]}`,
    });
    partialSummaries.push(`## Part ${index + 1}\n${result.content}`);
    addUsage(result.usage);
  }

  const finalResult = await createDeepSeekCompletion({
    model,
    system: systemPrompt,
    user: `Combine these intermediate summaries into one coherent summary of the complete document. Remove repetition and do not mention document parts.\n\n${partialSummaries.join("\n\n")}`,
  });
  addUsage(finalResult.usage);
  return { summary: finalResult.content, usage };
}

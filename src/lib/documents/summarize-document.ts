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

export const summarySystemPrompt = `You create comprehensive, factual document summaries.

Rules:
1. Use only information present in the supplied document text.
2. Cover every major topic, argument, section, and conclusion supported by the document.
3. Preserve important names, definitions, dates, amounts, obligations, risks, decisions, examples, and deadlines.
4. Scale the detail to the document. Do not compress a long or technical document into a few short bullets.
5. Write polished Markdown using descriptive headings, paragraphs, lists, and tables where useful.
6. Prefer these sections when supported: Overview, Main topics, Key details, Important figures and dates, Risks or obligations, Conclusions, and Recommended follow-up.
7. Omit unsupported sections and never invent missing information.
8. Return the summary itself, without a preamble or fenced Markdown block.`;

export async function prepareDocumentSummary(chunks: Chunk[], model: string) {
  const batches = buildBatches(chunks);
  if (batches.length === 0) throw new Error("This document has no extracted text to summarize.");

  const priorUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const addUsage = (next: typeof priorUsage) => {
    priorUsage.promptTokens += next.promptTokens;
    priorUsage.completionTokens += next.completionTokens;
    priorUsage.totalTokens += next.totalTokens;
  };

  if (batches.length === 1) {
    return {
      prompt: `Create a detailed summary of this complete document.\n${batches[0]}`,
      priorUsage,
    };
  }

  const partialSummaries: string[] = [];
  for (let index = 0; index < batches.length; index += 1) {
    const result = await createDeepSeekCompletion({
      model,
      system: summarySystemPrompt,
      user: `This is part ${index + 1} of ${batches.length} of one document. Produce a factual intermediate summary that retains details needed for a final whole-document summary.\n${batches[index]}`,
    });
    partialSummaries.push(`## Part ${index + 1}\n${result.content}`);
    addUsage(result.usage);
  }

  return {
    prompt: `Combine these intermediate summaries into one detailed, coherent summary of the complete document. Cover all major topics, remove repetition, and do not mention document parts.\n\n${partialSummaries.join("\n\n")}`,
    priorUsage,
  };
}

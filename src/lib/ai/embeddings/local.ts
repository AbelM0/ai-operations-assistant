import "server-only";

import type { EmbeddingProvider } from "./types";
import { STORED_EMBEDDING_DIMENSIONS } from "./types";

const LOCAL_MODEL =
  process.env.LOCAL_EMBEDDING_MODEL ||
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const LOCAL_DIMENSIONS = 384;

type FeatureExtractor = (
  inputs: string[],
  options: { pooling: "mean"; normalize: true },
) => Promise<{ dims: number[]; tolist: () => unknown }>;

let extractorPromise: Promise<FeatureExtractor> | undefined;

async function getExtractor() {
  extractorPromise ??= import("@huggingface/transformers").then(
    async ({ pipeline }) =>
      (await pipeline("feature-extraction", LOCAL_MODEL, {
        dtype: "q8",
      })) as FeatureExtractor,
  );

  return extractorPromise;
}

function padForStorage(vector: number[]) {
  if (vector.length !== LOCAL_DIMENSIONS) {
    throw new Error(
      `Local embedding model returned ${vector.length} dimensions; expected ${LOCAL_DIMENSIONS}.`,
    );
  }

  return [
    ...vector,
    ...new Array<number>(STORED_EMBEDDING_DIMENSIONS - vector.length).fill(0),
  ];
}

export const localEmbeddingProvider: EmbeddingProvider = {
  id: "local",
  model: LOCAL_MODEL,
  dimensions: STORED_EMBEDDING_DIMENSIONS,
  async embed(inputs) {
    if (inputs.length === 0) return [];

    const extractor = await getExtractor();
    const output = await extractor(inputs, { pooling: "mean", normalize: true });
    const vectors = output.tolist() as number[][];

    if (!Array.isArray(vectors) || vectors.length !== inputs.length) {
      throw new Error("Local embedding model returned an unexpected batch shape.");
    }

    return vectors.map(padForStorage);
  },
};


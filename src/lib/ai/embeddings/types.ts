import "server-only";

export const STORED_EMBEDDING_DIMENSIONS = 1536;

export type EmbeddingProvider = {
  id: string;
  model: string;
  dimensions: number;
  embed: (inputs: string[]) => Promise<number[][]>;
};


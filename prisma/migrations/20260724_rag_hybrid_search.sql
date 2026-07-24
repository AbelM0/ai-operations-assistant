-- Production RAG retrieval: tenant isolation, hybrid search, and metadata filters.
-- Apply after init.sql and 20260721_clerk_user_sync.sql.

CREATE EXTENSION IF NOT EXISTS "vector";

ALTER TABLE "documents"
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS "documents_tags_gin_idx"
  ON "documents" USING GIN ("tags");

ALTER TABLE "document_chunks"
  ADD COLUMN IF NOT EXISTS "fts" TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('simple'::regconfig, coalesce("textContent", ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS "document_chunks_fts_gin_idx"
  ON "document_chunks" USING GIN ("fts");

CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw_idx"
  ON "document_chunks"
  USING HNSW ("embedding" vector_cosine_ops)
  WHERE "embedding" IS NOT NULL;

ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_summaries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_sources" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own documents" ON "documents";
CREATE POLICY "Users can read own documents"
  ON "documents"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "users" AS app_user
      WHERE app_user."id" = "documents"."userId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

DROP POLICY IF EXISTS "Users can read chunks from own documents" ON "document_chunks";
CREATE POLICY "Users can read chunks from own documents"
  ON "document_chunks"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "documents" AS document
      JOIN "users" AS app_user ON app_user."id" = document."userId"
      WHERE document."id" = "document_chunks"."documentId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

DROP POLICY IF EXISTS "Users can read summaries from own documents" ON "document_summaries";
CREATE POLICY "Users can read summaries from own documents"
  ON "document_summaries"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "documents" AS document
      JOIN "users" AS app_user ON app_user."id" = document."userId"
      WHERE document."id" = "document_summaries"."documentId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

DROP POLICY IF EXISTS "Users can read own conversations" ON "conversations";
CREATE POLICY "Users can read own conversations"
  ON "conversations"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "users" AS app_user
      WHERE app_user."id" = "conversations"."userId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

DROP POLICY IF EXISTS "Users can read messages from own conversations" ON "messages";
CREATE POLICY "Users can read messages from own conversations"
  ON "messages"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "conversations" AS conversation
      JOIN "users" AS app_user ON app_user."id" = conversation."userId"
      WHERE conversation."id" = "messages"."conversationId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

DROP POLICY IF EXISTS "Users can read sources from own messages" ON "message_sources";
CREATE POLICY "Users can read sources from own messages"
  ON "message_sources"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "messages" AS message
      JOIN "conversations" AS conversation
        ON conversation."id" = message."conversationId"
      JOIN "users" AS app_user ON app_user."id" = conversation."userId"
      WHERE message."id" = "message_sources"."messageId"
        AND app_user."clerk_id" = auth.jwt() ->> 'sub'
    )
  );

CREATE OR REPLACE FUNCTION public.match_documents(
  p_query_embedding VECTOR(1536),
  p_query_text TEXT,
  p_user_id UUID,
  p_match_threshold REAL DEFAULT 0.35,
  p_match_count INTEGER DEFAULT 12,
  p_document_ids UUID[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_rrf_k INTEGER DEFAULT 60
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_name TEXT,
  chunk_index INTEGER,
  page_number INTEGER,
  text_content TEXT,
  vector_similarity DOUBLE PRECISION,
  keyword_rank DOUBLE PRECISION,
  rrf_score DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH eligible AS MATERIALIZED (
    SELECT
      chunk."id" AS chunk_id,
      chunk."documentId" AS document_id,
      document."originalName" AS document_name,
      chunk."chunkIndex" AS chunk_index,
      chunk."pageNumber" AS page_number,
      chunk."textContent" AS text_content,
      chunk."embedding" AS embedding,
      chunk."fts" AS fts
    FROM "document_chunks" AS chunk
    JOIN "documents" AS document ON document."id" = chunk."documentId"
    WHERE document."userId" = p_user_id
      AND document."status" = 'READY'
      AND chunk."embedding" IS NOT NULL
      AND (p_document_ids IS NULL OR document."id" = ANY(p_document_ids))
      AND (p_tags IS NULL OR document."tags" && p_tags)
  ),
  vector_candidates AS (
    SELECT
      eligible.chunk_id,
      1 - (eligible.embedding <=> p_query_embedding) AS similarity
    FROM eligible
    WHERE 1 - (eligible.embedding <=> p_query_embedding)
      >= GREATEST(0, LEAST(1, p_match_threshold))
    ORDER BY eligible.embedding <=> p_query_embedding
    LIMIT GREATEST(1, LEAST(100, p_match_count * 4))
  ),
  vector_ranked AS (
    SELECT
      vector_candidates.chunk_id,
      vector_candidates.similarity,
      row_number() OVER (ORDER BY vector_candidates.similarity DESC) AS rank
    FROM vector_candidates
  ),
  query AS (
    SELECT websearch_to_tsquery('simple'::regconfig, coalesce(p_query_text, '')) AS value
  ),
  keyword_candidates AS (
    SELECT
      eligible.chunk_id,
      ts_rank_cd(eligible.fts, query.value, 32) AS rank_score
    FROM eligible
    CROSS JOIN query
    WHERE eligible.fts @@ query.value
    ORDER BY rank_score DESC
    LIMIT GREATEST(1, LEAST(100, p_match_count * 4))
  ),
  keyword_ranked AS (
    SELECT
      keyword_candidates.chunk_id,
      keyword_candidates.rank_score,
      row_number() OVER (ORDER BY keyword_candidates.rank_score DESC) AS rank
    FROM keyword_candidates
  ),
  candidate_ids AS (
    SELECT vector_ranked.chunk_id FROM vector_ranked
    UNION
    SELECT keyword_ranked.chunk_id FROM keyword_ranked
  )
  SELECT
    eligible.chunk_id,
    eligible.document_id,
    eligible.document_name,
    eligible.chunk_index,
    eligible.page_number,
    eligible.text_content,
    coalesce(vector_ranked.similarity, 0)::DOUBLE PRECISION AS vector_similarity,
    coalesce(keyword_ranked.rank_score, 0)::DOUBLE PRECISION AS keyword_rank,
    (
      0.65 / (GREATEST(1, p_rrf_k) + coalesce(vector_ranked.rank, 1000000))
      + 0.35 / (GREATEST(1, p_rrf_k) + coalesce(keyword_ranked.rank, 1000000))
    )::DOUBLE PRECISION AS rrf_score
  FROM candidate_ids
  JOIN eligible ON eligible.chunk_id = candidate_ids.chunk_id
  LEFT JOIN vector_ranked ON vector_ranked.chunk_id = candidate_ids.chunk_id
  LEFT JOIN keyword_ranked ON keyword_ranked.chunk_id = candidate_ids.chunk_id
  ORDER BY rrf_score DESC, vector_similarity DESC, keyword_rank DESC
  LIMIT GREATEST(1, LEAST(50, p_match_count));
$$;

COMMENT ON FUNCTION public.match_documents(
  VECTOR,
  TEXT,
  UUID,
  REAL,
  INTEGER,
  UUID[],
  TEXT[],
  INTEGER
) IS
  'Tenant-scoped hybrid retrieval using cosine similarity and weighted reciprocal rank fusion.';

REVOKE ALL ON FUNCTION public.match_documents(
  VECTOR,
  TEXT,
  UUID,
  REAL,
  INTEGER,
  UUID[],
  TEXT[],
  INTEGER
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.match_documents(
  VECTOR,
  TEXT,
  UUID,
  REAL,
  INTEGER,
  UUID[],
  TEXT[],
  INTEGER
) TO service_role;

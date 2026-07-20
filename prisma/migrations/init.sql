-- ============================================================
-- AI Operations Assistant — Initial Migration
-- Run this in Supabase SQL Editor:
--   https://itzayilkidahhzpkeyvn.supabase.co → SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enums
CREATE TYPE "DocumentStatus" AS ENUM (
  'UPLOADED', 'OCR_PROCESSING', 'OCR_COMPLETED',
  'CHUNKING', 'EMBEDDING', 'READY', 'FAILED'
);

CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

CREATE TYPE "AIJobType" AS ENUM (
  'OCR', 'EMBEDDING', 'SUMMARY', 'CHAT', 'EXPENSE_EXTRACTION'
);

CREATE TYPE "AIJobStatus" AS ENUM (
  'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
);

CREATE TYPE "ExpenseCategory" AS ENUM (
  'OFFICE', 'TRANSPORT', 'UTILITIES', 'FUEL',
  'RENT', 'SALARY', 'FOOD', 'OTHER'
);

-- Users
CREATE TABLE "users" (
  "id"                 UUID         NOT NULL DEFAULT gen_random_uuid(),
  "clerk_id"           TEXT         NOT NULL,
  "email"              TEXT         NOT NULL,
  "first_name"         TEXT,
  "last_name"          TEXT,
  "full_name"          TEXT,
  "image_url"          TEXT,
  "name"               TEXT,
  "avatarUrl"          TEXT,
  "languagePreference" TEXT         NOT NULL DEFAULT 'en',
  "timezone"           TEXT,
  "currency"           TEXT         NOT NULL DEFAULT 'ETB',
  "createdAt"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON "users"
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = "clerk_id");

CREATE POLICY "Users can update own app profile fields"
  ON "users"
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = "clerk_id")
  WITH CHECK (auth.jwt() ->> 'sub' = "clerk_id");

GRANT SELECT ON "users" TO authenticated;
REVOKE UPDATE ON "users" FROM authenticated;
GRANT UPDATE ("languagePreference", "timezone", "currency")
  ON "users"
  TO authenticated;

-- Documents
CREATE TABLE "documents" (
  "id"                   UUID             NOT NULL DEFAULT gen_random_uuid(),
  "userId"               UUID             NOT NULL,
  "originalName"         TEXT             NOT NULL,
  "storagePath"          TEXT             NOT NULL,
  "mimeType"             TEXT             NOT NULL,
  "sizeBytes"            INTEGER          NOT NULL,
  "pageCount"            INTEGER,
  "status"               "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
  "parserUsed"           TEXT,
  "ocrEngine"            TEXT,
  "fileHash"             TEXT,
  "errorMessage"         TEXT,
  "processingStartedAt"   TIMESTAMPTZ,
  "processingCompletedAt" TIMESTAMPTZ,
  "processingDurationMs"  INTEGER,
  "createdAt"            TIMESTAMPTZ      NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "documents_fileHash_key" ON "documents"("fileHash");
CREATE INDEX "documents_userId_idx" ON "documents"("userId");
CREATE INDEX "documents_status_idx" ON "documents"("status");
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Document Chunks
CREATE TABLE "document_chunks" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "documentId"  UUID        NOT NULL,
  "chunkIndex"  INTEGER     NOT NULL,
  "pageNumber"  INTEGER,
  "startOffset" INTEGER,
  "endOffset"   INTEGER,
  "tokenCount"  INTEGER,
  "textContent" TEXT        NOT NULL,
  "embedding"   vector(1536),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "document_chunks_documentId_chunkIndex_key"
  ON "document_chunks"("documentId", "chunkIndex");
CREATE INDEX "document_chunks_documentId_idx" ON "document_chunks"("documentId");
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE;

-- Document Summaries
CREATE TABLE "document_summaries" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "documentId" UUID        NOT NULL,
  "summary"    TEXT        NOT NULL,
  "language"   TEXT        NOT NULL DEFAULT 'en',
  "provider"   TEXT,
  "model"      TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "document_summaries_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "document_summaries" ADD CONSTRAINT "document_summaries_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE;

-- Conversations
CREATE TABLE "conversations" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "userId"        UUID        NOT NULL,
  "documentId"    UUID,
  "title"         TEXT        NOT NULL DEFAULT 'New Conversation',
  "archived"      BOOLEAN     NOT NULL DEFAULT false,
  "lastMessageAt" TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");
CREATE INDEX "conversations_documentId_idx" ON "conversations"("documentId");
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL;

-- Messages
CREATE TABLE "messages" (
  "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
  "conversationId"   UUID          NOT NULL,
  "role"             "MessageRole" NOT NULL,
  "content"          TEXT          NOT NULL,
  "language"         TEXT          NOT NULL DEFAULT 'en',
  "model"            TEXT,
  "promptTokens"     INTEGER,
  "completionTokens" INTEGER,
  "totalTokens"      INTEGER,
  "responseTimeMs"   INTEGER,
  "createdAt"        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE;

-- Message Sources (RAG)
CREATE TABLE "message_sources" (
  "id"         UUID   NOT NULL DEFAULT gen_random_uuid(),
  "messageId"  UUID   NOT NULL,
  "chunkId"    UUID   NOT NULL,
  "similarity" REAL,
  CONSTRAINT "message_sources_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "message_sources_messageId_idx" ON "message_sources"("messageId");
CREATE INDEX "message_sources_chunkId_idx" ON "message_sources"("chunkId");
ALTER TABLE "message_sources" ADD CONSTRAINT "message_sources_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE;
ALTER TABLE "message_sources" ADD CONSTRAINT "message_sources_chunkId_fkey"
  FOREIGN KEY ("chunkId") REFERENCES "document_chunks"("id") ON DELETE CASCADE;

-- AI Jobs
CREATE TABLE "ai_jobs" (
  "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
  "documentId"   UUID,
  "type"         "AIJobType"   NOT NULL,
  "status"       "AIJobStatus" NOT NULL DEFAULT 'PENDING',
  "progress"     INTEGER       NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "startedAt"    TIMESTAMPTZ,
  "completedAt"  TIMESTAMPTZ,
  "createdAt"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ai_jobs_status_idx" ON "ai_jobs"("status");
CREATE INDEX "ai_jobs_type_idx" ON "ai_jobs"("type");
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE;

-- AI Usage
CREATE TABLE "ai_usage" (
  "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
  "userId"           UUID         NOT NULL,
  "provider"         TEXT         NOT NULL,
  "model"            TEXT         NOT NULL,
  "promptTokens"     INTEGER      NOT NULL,
  "completionTokens" INTEGER      NOT NULL,
  "totalTokens"      INTEGER      NOT NULL,
  "estimatedCost"    DECIMAL(10,5) NOT NULL,
  "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ai_usage_userId_idx" ON "ai_usage"("userId");
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Expense Entries
CREATE TABLE "expense_entries" (
  "id"          UUID              NOT NULL DEFAULT gen_random_uuid(),
  "userId"      UUID              NOT NULL,
  "documentId"  UUID,
  "vendor"      TEXT              NOT NULL,
  "amount"      DECIMAL(12,2)     NOT NULL,
  "currency"    TEXT              NOT NULL DEFAULT 'ETB',
  "date"        TIMESTAMPTZ       NOT NULL,
  "category"    "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
  "description" TEXT,
  "confidence"  REAL,
  "sourceText"  TEXT,
  "createdAt"   TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT "expense_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "expense_entries_userId_idx" ON "expense_entries"("userId");
CREATE INDEX "expense_entries_date_idx" ON "expense_entries"("date");
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL;

-- Expense Summaries
CREATE TABLE "expense_summaries" (
  "id"                 UUID          NOT NULL DEFAULT gen_random_uuid(),
  "userId"             UUID          NOT NULL,
  "periodStart"        TIMESTAMPTZ   NOT NULL,
  "periodEnd"          TIMESTAMPTZ   NOT NULL,
  "totalAmount"        DECIMAL(14,2) NOT NULL,
  "vendorCount"        INTEGER       NOT NULL,
  "categoryBreakdown"  JSONB,
  "createdAt"          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT "expense_summaries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "expense_summaries_userId_idx" ON "expense_summaries"("userId");
ALTER TABLE "expense_summaries" ADD CONSTRAINT "expense_summaries_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Audit Logs
CREATE TABLE "audit_logs" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "userId"     UUID        NOT NULL,
  "action"     TEXT        NOT NULL,
  "resource"   TEXT        NOT NULL,
  "resourceId" TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

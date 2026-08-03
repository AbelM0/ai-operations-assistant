-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'RECEIPT', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "ExtractionReviewStatus" AS ENUM ('PROCESSING', 'SUGGESTED', 'NEEDS_REVIEW', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "document_extractions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "classificationConfidence" DOUBLE PRECISION NOT NULL,
    "schemaVersion" TEXT NOT NULL DEFAULT 'invoice-receipt-v1',
    "fields" JSONB NOT NULL,
    "reviewStatus" "ExtractionReviewStatus" NOT NULL DEFAULT 'PROCESSING',
    "provider" TEXT,
    "model" TEXT,
    "errorMessage" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_extractions_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "expense_entries" ADD COLUMN "extractionId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "document_extractions_documentId_key" ON "document_extractions"("documentId");
CREATE INDEX "document_extractions_userId_idx" ON "document_extractions"("userId");
CREATE INDEX "document_extractions_reviewStatus_idx" ON "document_extractions"("reviewStatus");
CREATE INDEX "document_extractions_documentType_idx" ON "document_extractions"("documentType");
CREATE UNIQUE INDEX "expense_entries_extractionId_key" ON "expense_entries"("extractionId");

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "document_extractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

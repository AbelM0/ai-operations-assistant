CREATE TABLE IF NOT EXISTS public.conversation_documents (
  "conversationId" uuid NOT NULL
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  "documentId" uuid NOT NULL
    REFERENCES public.documents(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("conversationId", "documentId")
);

CREATE INDEX IF NOT EXISTS conversation_documents_document_id_idx
  ON public.conversation_documents ("documentId");

ALTER TABLE public.message_sources
  ADD COLUMN IF NOT EXISTS "sourceId" text,
  ADD COLUMN IF NOT EXISTS "sourceOrder" integer;

-- Preserve the legacy single-document relationship for existing conversations.
INSERT INTO public.conversation_documents ("conversationId", "documentId")
SELECT id, "documentId"
FROM public.conversations
WHERE "documentId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Recover document selections from citations for existing multi-document chats.
INSERT INTO public.conversation_documents ("conversationId", "documentId")
SELECT DISTINCT m."conversationId", dc."documentId"
FROM public.messages AS m
JOIN public.message_sources AS ms ON ms."messageId" = m.id
JOIN public.document_chunks AS dc ON dc.id = ms."chunkId"
ON CONFLICT DO NOTHING;

ALTER TABLE public.conversation_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_documents_select_own
  ON public.conversation_documents;

CREATE POLICY conversation_documents_select_own
  ON public.conversation_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations AS c
      JOIN public.users AS u ON u.id = c."userId"
      JOIN public.documents AS d ON d.id = conversation_documents."documentId"
      WHERE c.id = conversation_documents."conversationId"
        AND d."userId" = c."userId"
        AND u.clerk_id = (auth.jwt() ->> 'sub')
    )
  );

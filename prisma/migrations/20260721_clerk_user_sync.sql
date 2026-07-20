-- Clerk user sync columns for existing Supabase databases.
-- Run this once in the Supabase SQL Editor before enabling the Clerk webhook.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "clerk_id" TEXT,
  ADD COLUMN IF NOT EXISTS "first_name" TEXT,
  ADD COLUMN IF NOT EXISTS "last_name" TEXT,
  ADD COLUMN IF NOT EXISTS "full_name" TEXT,
  ADD COLUMN IF NOT EXISTS "image_url" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_id_key"
  ON "users"("clerk_id")
  WHERE "clerk_id" IS NOT NULL;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON "users";
CREATE POLICY "Users can read own profile"
  ON "users"
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = "clerk_id");

DROP POLICY IF EXISTS "Users can update own app profile fields" ON "users";
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

-- After any existing rows are backfilled with Clerk IDs, you can enforce:
-- ALTER TABLE "users" ALTER COLUMN "clerk_id" SET NOT NULL;

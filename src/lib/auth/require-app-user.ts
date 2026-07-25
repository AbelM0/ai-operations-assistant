import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type AppUser = {
  id: string;
  clerkId: string;
};

export async function requireAppUser(clerkUserId: string): Promise<AppUser>;
export async function requireAppUser(): Promise<AppUser | null>;
export async function requireAppUser(
  clerkUserId?: string,
): Promise<AppUser | null> {
  const userId = clerkUserId ?? (await auth()).userId;

  if (!userId) {
    return null;
  }

  const { data: existingUser, error: lookupError } = await supabaseAdmin
    .from("users")
    .select("id, clerk_id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingUser) {
    return { id: existingUser.id as string, clerkId: userId };
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("The authenticated Clerk user has no primary email address.");
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const { data: createdUser, error: createError } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        clerk_id: userId,
        email,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        full_name: fullName,
        image_url: clerkUser.imageUrl,
        name: fullName,
        avatarUrl: clerkUser.imageUrl,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "clerk_id" },
    )
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return { id: createdUser.id as string, clerkId: userId };
}

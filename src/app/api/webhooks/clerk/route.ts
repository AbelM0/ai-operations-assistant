import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ClerkEmailAddress = {
  id: string;
  email_address?: string;
  emailAddress?: string;
};

type ClerkUserPayload = {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  emailAddresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  primaryEmailAddressId?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
};

type ClerkDeletedPayload = {
  id?: string | null;
};

type UserRow = {
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  image_url: string | null;
  name: string | null;
  avatarUrl: string | null;
  updatedAt: string;
};

function getWebhookSecret() {
  return (
    process.env.CLERK_WEBHOOK_SECRET ??
    process.env.CLERK_WEBHOOK_SIGNING_SECRET
  );
}

function getPrimaryEmail(user: ClerkUserPayload) {
  const emailAddresses = user.email_addresses ?? user.emailAddresses ?? [];
  const primaryEmailId =
    user.primary_email_address_id ?? user.primaryEmailAddressId;
  const primaryEmail = emailAddresses.find(
    (email) => email.id === primaryEmailId
  );
  const selectedEmail = primaryEmail ?? emailAddresses[0];

  return selectedEmail?.email_address ?? selectedEmail?.emailAddress ?? null;
}

function getFullName(firstName: string | null, lastName: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || null;
}

function mapClerkUserToUserRow(user: ClerkUserPayload): UserRow | null {
  const email = getPrimaryEmail(user);

  if (!email) {
    return null;
  }

  const firstName = user.first_name ?? user.firstName ?? null;
  const lastName = user.last_name ?? user.lastName ?? null;
  const fullName = getFullName(firstName, lastName);
  const imageUrl = user.image_url ?? user.imageUrl ?? null;

  return {
    clerk_id: user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    image_url: imageUrl,
    name: fullName,
    avatarUrl: imageUrl,
    updatedAt: new Date().toISOString(),
  };
}

async function upsertUser(user: ClerkUserPayload) {
  const row = mapClerkUserToUserRow(user);

  if (!row) {
    console.warn("Skipping Clerk user sync because user has no email", {
      clerkId: user.id,
    });
    return { skipped: true };
  }

  const { error } = await supabaseAdmin
    .from("users")
    .upsert(row, { onConflict: "clerk_id" });

  if (error) {
    throw error;
  }

  return { skipped: false };
}

async function deleteUser(user: ClerkDeletedPayload) {
  if (!user.id) {
    console.warn("Skipping Clerk user delete because payload has no id");
    return;
  }

  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("clerk_id", user.id);

  if (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const signingSecret = getWebhookSecret();

  if (!signingSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook signing secret is not configured" },
      { status: 500 }
    );
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request, { signingSecret });
  } catch (error) {
    console.error("Failed to verify Clerk webhook", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const result = await upsertUser(event.data as ClerkUserPayload);
        return NextResponse.json({
          received: true,
          type: event.type,
          skipped: result.skipped,
        });
      }

      case "user.deleted":
        await deleteUser(event.data as ClerkDeletedPayload);
        return NextResponse.json({ received: true, type: event.type });

      default:
        return NextResponse.json({ received: true, ignored: true });
    }
  } catch (error) {
    console.error("Failed to process Clerk webhook", {
      type: event.type,
      error,
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import {
  expenseCategories,
  type ExpenseCategory,
} from "@/lib/expenses/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ expenseId: string }> },
) {
  const appUser = await requireAppUser();
  if (!appUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { expenseId } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    category?: unknown;
  };
  if (
    typeof body.category !== "string" ||
    !expenseCategories.includes(body.category as ExpenseCategory)
  ) {
    return NextResponse.json(
      { error: "Choose a valid expense category." },
      { status: 400 },
    );
  }

  const category = body.category as ExpenseCategory;
  const { data, error } = await supabaseAdmin
    .from("expense_entries")
    .update({ category })
    .eq("id", expenseId)
    .eq("userId", appUser.id)
    .select("id, category")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "The expense category could not be updated." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  await supabaseAdmin.from("audit_logs").insert({
    userId: appUser.id,
    action: "expense_category_updated",
    resource: "expense_entry",
    resourceId: expenseId,
    metadata: { category },
  });

  return NextResponse.json({ id: data.id, category: data.category });
}

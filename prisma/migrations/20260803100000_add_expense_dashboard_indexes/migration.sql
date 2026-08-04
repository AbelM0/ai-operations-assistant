CREATE INDEX "expense_entries_userId_date_idx"
ON "expense_entries"("userId", "date");

CREATE INDEX "expense_entries_userId_category_date_idx"
ON "expense_entries"("userId", "category", "date");

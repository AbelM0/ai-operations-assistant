import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

test.describe("authenticated workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clerk.loaded({ page });
    await page.waitForFunction(() => Boolean(window.Clerk?.session));
  });

  test("opens protected workspace navigation", async ({ page }) => {
    await page.goto("/workspace");

    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const navigation = page.getByRole("navigation", {
      name: "Workspace navigation",
    });
    await expect(navigation.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(navigation.getByRole("link", { name: "Documents" })).toHaveAttribute(
      "href",
      "/workspace/documents",
    );
    await expect(navigation.getByRole("link", { name: "Expenses" })).toHaveAttribute(
      "href",
      "/workspace/expenses",
    );
    await expect(navigation.getByRole("link", { name: "Ask Nexus" })).toHaveAttribute(
      "href",
      "/workspace/ask",
    );
  });

  test("loads only the signed-in user's document collection", async ({ page }) => {
    await page.goto("/workspace");

    const response = await page.request.get("/api/documents");
    expect(response.status()).toBe(200);

    const payload = (await response.json()) as { documents?: unknown };
    expect(Array.isArray(payload.documents)).toBe(true);
  });

  test("rejects unsupported files before upload", async ({ page }) => {
    await page.goto("/workspace/documents");

    let fileInput = page.getByLabel("Choose a business document");
    if ((await fileInput.count()) === 0) {
      await page.getByRole("button", { name: "Upload document" }).first().click();
      fileInput = page.getByLabel("Choose a business document");
    }

    await fileInput.setInputFiles({
      name: "unsupported.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("This file must not be uploaded."),
    });

    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Choose a PDF, JPG, PNG, or WebP file." }),
    ).toHaveText("Choose a PDF, JPG, PNG, or WebP file.");
  });

  test("rejects an unsupported MIME type at the API boundary", async ({ page }) => {
    await page.goto("/workspace");

    const response = await page.request.post("/api/documents", {
      multipart: {
        file: {
          name: "unsupported.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("This file must not be stored."),
        },
      },
    });

    expect(response.status()).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: "PDF, JPG, PNG, and WebP files are supported.",
    });
  });
});

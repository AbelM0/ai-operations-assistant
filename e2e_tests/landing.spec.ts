import { expect, test } from "@playwright/test";

test.describe("public landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("presents the product and account entry points", async ({ page }) => {
    await expect(page).toHaveTitle(/NexusOps/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Find the signal\. Keep the evidence close\./,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Create your workspace" }).first(),
    ).toHaveAttribute("href", "/sign-up");
    await expect(
      page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Log in" }),
    ).toHaveAttribute("href", "/sign-in");
  });

  test("switches the interface to Amharic", async ({ page }) => {
    const amharicButton = page.getByRole("button", { name: "አማ" });
    const documentElement = page.locator("html");

    await expect(documentElement).toHaveAttribute("data-language", "en");
    await expect(async () => {
      await amharicButton.click();
      await expect(amharicButton).toHaveAttribute("aria-pressed", "true", {
        timeout: 1_500,
      });
      await expect(documentElement).toHaveAttribute("lang", "am", {
        timeout: 1_500,
      });
    }).toPass({ timeout: 10_000 });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /ዋናውን መረጃ ያግኙ። ማስረጃውን በቅርብ ይያዙ።/,
      }),
    ).toBeVisible();
  });
});

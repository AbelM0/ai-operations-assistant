import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test as setup } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";

const authFile = path.resolve("playwright/.clerk/user.json");

setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing", async () => {
  await clerkSetup();
});

setup("authenticate the dedicated test user", async ({ browser, page }) => {
  await page.goto("/");
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
  });

  await page.waitForFunction(() => Boolean(window.Clerk?.session));
  await expect
    .poll(async () => {
      const cookies = await page.context().cookies();
      return cookies.some((cookie) => cookie.name === "__session");
    })
    .toBe(true);

  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });

  const verificationContext = await browser.newContext({ storageState: authFile });
  const verificationPage = await verificationContext.newPage();
  await verificationPage.goto("/");
  await clerk.loaded({ page: verificationPage });
  await verificationPage.waitForFunction(() => Boolean(window.Clerk?.session));
  await verificationPage.goto("/workspace");
  await expect(verificationPage).toHaveURL(/\/workspace$/);
  await verificationContext.storageState({ path: authFile });
  await verificationContext.close();
});

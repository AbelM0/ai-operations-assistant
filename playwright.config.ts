import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: [".env.local", ".env"], quiet: true });

process.env.CLERK_PUBLISHABLE_KEY ??=
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const authenticatedTestsEnabled = Boolean(
  process.env.E2E_CLERK_USER_EMAIL &&
    process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

const publicProjects = [
  {
    name: "chromium",
    testIgnore: [/auth\.setup\.ts/, /\.authenticated\.spec\.ts/],
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    testIgnore: [/auth\.setup\.ts/, /\.authenticated\.spec\.ts/],
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    testIgnore: [/auth\.setup\.ts/, /\.authenticated\.spec\.ts/],
    use: { ...devices["Desktop Safari"] },
  },
];

const authenticatedProjects = authenticatedTestsEnabled
  ? [
      {
        name: "auth-setup",
        testMatch: /auth\.setup\.ts/,
      },
      {
        name: "authenticated",
        testMatch: /\.authenticated\.spec\.ts/,
        fullyParallel: false,
        use: {
          ...devices["Desktop Chrome"],
          storageState: "playwright/.clerk/user.json",
        },
        dependencies: ["auth-setup"],
      },
    ]
  : [];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e_tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  projects: [...publicProjects, ...authenticatedProjects],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

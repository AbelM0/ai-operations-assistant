This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Run the deterministic unit suite once:

```bash
pnpm test
```

Run unit tests in watch mode while developing:

```bash
pnpm test:watch
```

Run the public browser smoke tests in all installed browsers:

```bash
pnpm test:e2e
```

For a faster local browser check, run only Chromium:

```bash
pnpm test:e2e --project=chromium
```

Playwright starts the local Next.js development server automatically. It uses the
application environment variables available on the machine. Keep test credentials
and test service projects separate from production before adding authenticated
workspace, upload, or document-processing scenarios.

Authenticated tests are enabled automatically when all of these variables are
present:

```bash
E2E_CLERK_USER_EMAIL=e2e+clerk_test@example.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

The email must belong to a dedicated user in the same Clerk development instance.
The test runner signs that user in through Clerk's server-side testing helper and
stores the temporary browser state under the ignored `playwright/.clerk` directory.
Workspace tests also use the configured Supabase environment, which should be a
non-production test project.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

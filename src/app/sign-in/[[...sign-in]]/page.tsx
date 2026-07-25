import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { resolvePostAuthRedirect } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Log in | Nexus Ops",
  description: "Log in to your Nexus Ops workspace.",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in/[[...sign-in]]">) {
  const [{ userId }, params] = await Promise.all([auth(), searchParams]);

  if (userId) {
    redirect(resolvePostAuthRedirect(params.redirect_url));
  }

  return (
    <AuthLayout mode="sign-in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/workspace"
      />
    </AuthLayout>
  );
}

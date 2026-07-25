import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { resolvePostAuthRedirect } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Create your workspace | Nexus Ops",
  description:
    "Create a Nexus Ops workspace to turn business documents into searchable, source-backed operational insight.",
};

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up/[[...sign-up]]">) {
  const [{ userId }, params] = await Promise.all([auth(), searchParams]);

  if (userId) {
    redirect(resolvePostAuthRedirect(params.redirect_url));
  }

  return (
    <AuthLayout mode="sign-up">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/workspace"
      />
    </AuthLayout>
  );
}

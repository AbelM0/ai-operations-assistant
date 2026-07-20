import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Log in | Nexus Ops",
  description: "Log in to your Nexus Ops workspace.",
};

export default function SignInPage() {
  return (
    <AuthLayout mode="sign-in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </AuthLayout>
  );
}

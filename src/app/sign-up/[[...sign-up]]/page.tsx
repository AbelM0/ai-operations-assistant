import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Create your workspace | Nexus Ops",
  description:
    "Create a Nexus Ops workspace to turn business documents into searchable, source-backed operational insight.",
};

export default function SignUpPage() {
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

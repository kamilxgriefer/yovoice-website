import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mt-8 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">Reset password</h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <Suspense>
        <RedirectIfAuthenticated />
      </Suspense>
      <ForgotPasswordForm />
      <Link
        href="/"
        className="mt-6 block text-center text-sm link-accent"
      >
        Return to homepage
      </Link>
    </>
  );
}

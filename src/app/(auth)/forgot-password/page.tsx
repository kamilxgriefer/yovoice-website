import Link from "next/link";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Reset password</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
      <Link
        href="/"
        className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
      >
        Return to homepage
      </Link>
    </>
  );
}

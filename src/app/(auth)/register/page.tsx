import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Join YO Voice</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Create an account to download, sign in and launch the app.
      </p>
      <Suspense>
        <RedirectIfAuthenticated />
        <RegisterForm />
      </Suspense>
      <Link
        href="/"
        className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
      >
        Return to homepage
      </Link>
    </>
  );
}

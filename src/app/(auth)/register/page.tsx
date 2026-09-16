import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { APP_ENTRY_PATH, isAppLaunchRedirect } from "@/lib/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Create your account",
};

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  if (isAppLaunchRedirect(params.redirect)) {
    redirect(APP_ENTRY_PATH);
  }

  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Join YO Voice</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Create an account to download, sign in and launch the app.
      </p>
      <Suspense>
        {/* The form mounts the signed-in redirect itself, so it can hold the
            redirect off while its own sign-up is still running. */}
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

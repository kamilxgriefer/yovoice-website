import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { APP_ENTRY_PATH, isAppLaunchRedirect } from "@/lib/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Log in",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  if (isAppLaunchRedirect(params.redirect)) {
    redirect(APP_ENTRY_PATH);
  }

  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Sign in to continue to your downloads and account.
      </p>
      <Suspense>
        <RedirectIfAuthenticated />
        <LoginForm />
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

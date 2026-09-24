import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { APP_ENTRY_PATH, isAppLaunchRedirect } from "@/lib/auth/auth-redirect";
import { AUTH_MODE_VOICE } from "@/lib/auth/auth-mode";

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
      {/* The layout says this title and note aloud (large, animated,
          decorative); the heading of record stays here for assistive
          technology and the document outline. */}
      <h1 className="sr-only">{AUTH_MODE_VOICE.register.heading}</h1>
      <p className="sr-only">{AUTH_MODE_VOICE.register.note}</p>
      {/* No <Suspense> here: this page is dynamic, and a new, empty boundary
          would show nothing while the form's code loads on the first switch
          from Log in. Without it the router keeps the previous form on screen
          until this one is ready. The form mounts the signed-in redirect
          itself, so it can hold the redirect off while its own sign-up is
          still running. */}
      <RegisterForm />
      <Link
        href="/"
        className="mt-6 block text-center text-sm link-accent"
      >
        Return to homepage
      </Link>
    </>
  );
}

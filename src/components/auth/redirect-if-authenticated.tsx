"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";
import { shouldRedirectSignedInVisitor } from "@/lib/auth/registration-flow";

/** Sends an already-signed-in visitor away from /login, /register, and
 * /forgot-password — those pages assume you're not authenticated yet. Not
 * used on /verify-email, which needs you signed in to work at all.
 *
 * `suspended` keeps the visitor on the page while its own sign-up is in
 * progress: Firebase signs the new account in before the verification email
 * has been sent, and the register form must stay mounted to report that. */
export function RedirectIfAuthenticated({
  suspended = false,
}: {
  suspended?: boolean;
} = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!shouldRedirectSignedInVisitor({ loading, signedIn: Boolean(user), suspended })) {
      return;
    }
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }, [loading, user, suspended, router, searchParams]);

  return null;
}

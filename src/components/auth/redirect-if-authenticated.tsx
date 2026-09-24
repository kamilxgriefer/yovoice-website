"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";
import { shouldRedirectSignedInVisitor } from "@/lib/auth/registration-flow";
import {
  isSignedInRedirectHeld,
  isSignedInRedirectHeldOnServer,
  subscribeSignedInRedirectHold,
} from "@/lib/auth/signed-in-redirect-hold";

/** Sends an already-signed-in visitor away from /login, /register, and
 * /forgot-password — those pages assume you're not authenticated yet. Not
 * used on /verify-email, which needs you signed in to work at all.
 *
 * `suspended` keeps the visitor on the page while its own sign-up is in
 * progress: Firebase signs the new account in before the verification email
 * has been sent, and the register form must stay mounted to report that.
 *
 * A Google or Apple sign-in holds the redirect the same way until the new
 * account's profile has been written. It does so through
 * `signed-in-redirect-hold` rather than this prop, because /login mounts this
 * component beside its form, where the form cannot pass it anything. */
export function RedirectIfAuthenticated({
  suspended: suspendedByForm = false,
}: {
  suspended?: boolean;
} = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const heldBySocialSignIn = useSyncExternalStore(
    subscribeSignedInRedirectHold,
    isSignedInRedirectHeld,
    isSignedInRedirectHeldOnServer,
  );
  const suspended = suspendedByForm || heldBySocialSignIn;

  useEffect(() => {
    if (!shouldRedirectSignedInVisitor({ loading, signedIn: Boolean(user), suspended })) {
      return;
    }
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }, [loading, user, suspended, router, searchParams]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";

/** Sends an already-signed-in visitor away from /login, /register, and
 * /forgot-password — those pages assume you're not authenticated yet. Not
 * used on /verify-email, which needs you signed in to work at all. */
export function RedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }, [loading, user, router, searchParams]);

  return null;
}

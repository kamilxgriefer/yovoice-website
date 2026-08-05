"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

/**
 * Redirects to /login (preserving the current path as ?redirect=) once auth
 * state resolves and no user is signed in. Returns the same {user, loading}
 * shape as useAuth so callers can gate their render on loading/user without
 * duplicating the redirect effect.
 *
 * Pass `skip: true` when the caller isn't ready to decide whether this page
 * should be auth-gated yet (e.g. still detecting mobile vs. desktop) — the
 * redirect effect won't fire until skip becomes false.
 */
export function useRequireAuth({ skip = false }: { skip?: boolean } = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (skip || loading || user) return;
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [skip, loading, user, router, pathname]);

  return { user, loading };
}

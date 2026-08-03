"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

/**
 * Redirects to /login (preserving the current path as ?redirect=) once auth
 * state resolves and no user is signed in. Returns the same {user, loading}
 * shape as useAuth so callers can gate their render on loading/user without
 * duplicating the redirect effect.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  return { user, loading };
}

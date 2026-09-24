"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { authModeFromPath, authModeHref, type AuthMode } from "@/lib/auth/auth-mode";
import { markAuthModeSwitch } from "@/components/auth/auth-mode-motion";

const OPTIONS: { mode: AuthMode; label: string }[] = [
  { mode: "login", label: "Log in" },
  { mode: "register", label: "Create account" },
];

/**
 * Log in | Create account. Two real links (each is its own page), drawn as a
 * segmented control whose pill slides to the current page. It lives in the
 * auth layout, which persists across the two routes, so the pill moves instead
 * of being redrawn.
 */
export function AuthModeSwitch() {
  const mode = authModeFromPath(usePathname());
  if (!mode) return null;
  return (
    <Suspense fallback={<SwitchView mode={mode} redirect={null} />}>
      <SwitchWithRedirect mode={mode} />
    </Suspense>
  );
}

function SwitchWithRedirect({ mode }: { mode: AuthMode }) {
  return <SwitchView mode={mode} redirect={useSearchParams().get("redirect")} />;
}

function SwitchView({ mode, redirect }: { mode: AuthMode; redirect: string | null }) {
  return (
    <nav aria-label="Log in or create an account" data-auth-switch data-mode={mode} className="auth-switch">
      <span aria-hidden="true" className="auth-switch__pill" />
      {OPTIONS.map((option) => {
        const current = option.mode === mode;
        return (
          <Link
            key={option.mode}
            href={authModeHref(option.mode, redirect)}
            aria-current={current ? "page" : undefined}
            className="auth-switch__option"
            scroll={false}
            onNavigate={current ? undefined : markAuthModeSwitch}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

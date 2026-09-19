"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Download, LogOut, Monitor, Shield, Trash2, User } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";

const NAV = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: Shield },
  { href: "/account/devices", label: "Devices & Sessions", icon: Monitor },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/downloads", label: "Downloads", icon: Download },
  // Last, and styled apart from the rest: it is the one entry whose page
  // cannot be undone.
  { href: "/account/delete", label: "Delete account", icon: Trash2, danger: true },
] as const;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-text-tertiary">Loading…</p>
      </main>
    );
  }

  return (
    <div>
      <SiteHeader />
      <main id="main-content" className="min-h-screen px-5 pb-24 pt-26 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <VerifyEmailBanner />

          <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
            <nav aria-label="Account navigation" className="flex flex-col gap-1">
              {NAV.map((item) => {
                const { href, label, icon: Icon } = item;
                const danger = "danger" in item && item.danger;
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`focus-ring flex min-h-12 items-center gap-3 rounded-[var(--radius-field)] border px-3 text-sm font-semibold transition ${
                      danger ? "mt-3 " : ""
                    }${
                      danger
                        ? active
                          ? "border-[color-mix(in_srgb,var(--error)_38%,transparent)] bg-[var(--danger-surface)] text-error"
                          : "border-transparent bg-[var(--danger-surface)] text-error hover:border-[color-mix(in_srgb,var(--error)_38%,transparent)]"
                        : active
                          ? "border-border bg-[var(--surface)] text-white"
                          : "border-transparent text-text-secondary hover:bg-[var(--surface)] hover:text-white"
                    }`}
                  >
                    <Icon className="size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut()}
                className="focus-ring mt-3 flex min-h-12 items-center gap-3 rounded-[var(--radius-field)] border border-transparent px-3 text-left text-sm font-semibold text-text-secondary transition hover:bg-[var(--surface)] hover:text-white"
              >
                <LogOut className="size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                Sign out
              </button>
            </nav>

            <div>{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

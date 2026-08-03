"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Download, LogOut, Monitor, Shield, User } from "lucide-react";

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
      <main className="flex min-h-screen items-center justify-center bg-[#060511]">
        <p className="text-sm text-white/45">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="min-h-screen bg-[#060511] px-5 pb-24 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <VerifyEmailBanner />

          <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
            <nav aria-label="Account navigation" className="flex flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-fuchsia-500/15 text-white"
                        : "text-white/55 hover:bg-white/[.04] hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut()}
                className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/55 transition hover:bg-white/[.04] hover:text-rose-300"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </nav>

            <div>{children}</div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

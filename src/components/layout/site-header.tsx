"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setIsOpen(false);
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
      isScrolled
        ? "border-white/[0.08] bg-[#060511]/92 shadow-[0_16px_60px_rgba(0,0,0,.38)] backdrop-blur-2xl"
        : "border-transparent bg-[#060511]/76 backdrop-blur-xl"
    }`}>
      <div className="mx-auto flex h-20 w-full max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <BrandLockup priority />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring group relative rounded-full px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/[.06] hover:text-white"
            >
              {item.label}
              <span className="absolute inset-x-4 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-violet-400 to-fuchsia-300 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <>
              <Link href="/account/profile" className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[.04] hover:text-white">
                My account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="focus-ring flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[.04] hover:text-white disabled:opacity-50"
              >
                <LogOut className="size-4" />
                {signingOut ? "Signing out…" : "Log out"}
              </button>
              <Link href={APP_ENTRY_PATH} className="premium-button focus-ring min-h-12 px-5">
                <span className="relative">Open YO Voice</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[.04] hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="focus-ring rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[.04]">
                Create account
              </Link>
              {/* The web app is the product today — the header's primary
                  action opens it (through sign-in, which returns here's
                  visitor to the app). Downloads stay in the nav/footer as
                  a secondary path until native builds actually ship. */}
              <Link
                href="/login?redirect=/app"
                className="premium-button focus-ring min-h-12 px-5"
              >
                <span className="relative">Open YO Voice</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="focus-ring flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/[.06] bg-[#090616]/98 px-5 py-5 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white">
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/account/profile" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white">
                  My account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Signing out…" : "Log out"}
                </button>
                <Link href={APP_ENTRY_PATH} onClick={() => setIsOpen(false)} className="premium-button mt-3 min-h-12">
                  Open YO Voice
                </Link>
              </>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-white">
                    Create account
                  </Link>
                </div>
                <Link href="/login?redirect=/app" onClick={() => setIsOpen(false)} className="premium-button mt-3 min-h-12">
                  Open YO Voice
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

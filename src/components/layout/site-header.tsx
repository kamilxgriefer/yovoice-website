"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, LogOut, Menu, X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { getAppUrl } from "@/lib/auth/auth-redirect";

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
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-2xl" aria-label="YO Voice home">
          <span className="relative flex size-12 overflow-hidden rounded-2xl border border-fuchsia-300/20 bg-black shadow-[0_0_38px_rgba(192,38,255,.32)]">
            <Image src="/logos/yovoice-logo.png" alt="YO Voice logo" fill sizes="48px" className="object-cover" priority />
          </span>
          <span>
            <span className="block font-[family-name:var(--font-display)] text-lg font-bold tracking-[-.03em] text-white">
              YO Voice
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[.36em] text-fuchsia-300">
              Be You
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring rounded-lg text-sm font-medium text-white/68 transition hover:text-white">
              {item.label}
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
              <Link href={getAppUrl()} className="premium-button focus-ring min-h-12 px-5">
                <span className="relative">Open app</span>
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
              <Link href="#download" className="premium-button focus-ring min-h-12 px-5">
                <ArrowDownToLine className="relative size-4" />
                <span className="relative">Download</span>
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
                <Link href={getAppUrl()} onClick={() => setIsOpen(false)} className="premium-button mt-3 min-h-12">
                  Open app
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
                <Link href="#download" onClick={() => setIsOpen(false)} className="premium-button mt-3 min-h-12">
                  Download
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

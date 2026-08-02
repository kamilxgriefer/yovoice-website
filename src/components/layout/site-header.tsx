"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-white/[0.08] bg-[#08040f]/88 shadow-[0_12px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
          : "border-transparent bg-[#08040f]/45 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="focus-ring flex items-center gap-3 rounded-2xl"
          aria-label="YO Voice home"
        >
          <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-300/20 bg-black shadow-[0_0_35px_rgba(192,38,255,0.25)]">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice logo"
              width={48}
              height={48}
              className="size-full object-cover"
              priority
            />
          </span>

          <span>
            <span className="block font-[family-name:var(--font-display)] text-lg font-bold tracking-[-0.03em] text-white">
              YO Voice
            </span>

            <span className="block text-[9px] font-bold uppercase tracking-[0.34em] text-fuchsia-300">
              Be You
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-lg text-sm font-medium text-white/55 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:text-white"
          >
            Log in
          </Link>

          <Link
            href="#download"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-fuchsia-50"
          >
            Download
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-white/[0.06] bg-[#0d0715]/96 px-5 py-5 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 sm:hidden">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                Log in
              </Link>

              <Link
                href="#download"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-black"
              >
                Download
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, Menu, X } from "lucide-react";

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-white/[0.08] bg-[#08040f]/92 shadow-[0_16px_60px_rgba(0,0,0,0.36)] backdrop-blur-2xl"
          : "border-transparent bg-[#08040f]/58 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="focus-ring flex items-center gap-3 rounded-2xl"
          aria-label="YO Voice home"
        >
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-300/20 bg-[#0c0614] shadow-[0_0_38px_rgba(192,38,255,0.32)]">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice logo"
              width={48}
              height={48}
              className="size-full scale-[1.06] object-cover"
              priority
            />
          </span>

          <span>
            <span className="block font-[family-name:var(--font-display)] text-lg font-bold tracking-[-0.03em] text-white">
              YO Voice
            </span>

            <span className="block text-[9px] font-bold uppercase tracking-[0.36em] text-fuchsia-300">
              Be You
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Primary navigation"
        >
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
            className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/[0.04] hover:text-white"
          >
            Log in
          </Link>

          <Link
            href="#download"
            className="focus-ring group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-5 text-sm font-bold text-white shadow-[0_14px_42px_rgba(138,43,226,0.34)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(192,38,255,0.46)]"
          >
            <span className="absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-[130%]" />
            <ArrowDownToLine className="relative size-4" />
            <span className="relative">Download</span>
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-white/[0.06] bg-[#0b0612]/97 px-5 py-5 backdrop-blur-2xl lg:hidden"
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-2"
            aria-label="Mobile navigation"
          >
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
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-sm font-bold text-white"
              >
                <ArrowDownToLine className="size-4" />
                Download
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

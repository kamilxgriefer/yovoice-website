"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

/**
 * One breakpoint governs the whole chrome — navigation, action cluster,
 * hamburger and mobile panel all switch here. Splitting them would create
 * widths that show two menus at once.
 *
 * The number is measured in Chrome at 14px Inter, not guessed. Content
 * width of the row, inside 32px gutters and two 16px gaps:
 *
 *   signed out        lockup 117 + nav 476 + actions 406 = 1095px
 *   signed in         lockup 117 + nav 476 + actions 416 = 1105px
 *   mid sign-out      the button reads "Signing out…"    = 1147px
 *
 * So 1024px is impossible: it would need items dropped, type below 14px or
 * targets below 44px, and the brief forbids all three — the row would wrap
 * onto two lines instead. 1160px is the smallest width that clears every
 * state, leaving 65/55px of slack in the two steady variants and still
 * fitting the transient one. Gutters are `lg:px-8` rather than the `lg:px-12`
 * used elsewhere: the header has its own `max-w-[1480px]` and never lined up
 * with the 1280/1400px content containers anyway, and the 32px it saves is
 * what buys the 40px move down from the old `min-[1200px]`.
 *
 * Tailwind v4 scans source text for candidates, so the classes are written
 * out in full here and reused by reference; a template literal would leave
 * the utilities unbuilt.
 */
const DESKTOP_ROW = "hidden min-[1160px]:flex";
const MOBILE_ONLY = "min-[1160px]:hidden";
/** Must stay in sync with the two class constants above. */
const DESKTOP_MEDIA_QUERY = "(min-width: 1160px)";

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

const NAV_LINK =
  "focus-ring inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-medium link-muted transition hover:bg-[var(--surface)]";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  /**
   * While the panel is open it covers the page, so the page must not scroll
   * behind it and focus must not leave it. Both are new: the old panel was a
   * dropdown that left the document scrollable and let Tab walk into the
   * content underneath.
   *
   * The trap spans the whole <header>, not just the panel, because the close
   * button lives in the header row — trapping the panel alone would make the
   * only way out unreachable by keyboard. Elements hidden at this width
   * (the desktop row) report no offsetParent and are skipped.
   */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* The Tab trap below does nothing for screen-reader swipes or switch
       access, which never press Tab. Make everything outside the header
       inert instead: walk from the header up to <body> and mark each
       ancestor's siblings (page content, footer, skip link), whatever the
       layout nesting. Only elements this effect changed are restored. */
    const madeInert: HTMLElement[] = [];
    for (
      let node: HTMLElement | null = headerRef.current;
      node && node !== document.body;
      node = node.parentElement
    ) {
      const parent = node.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (
          sibling !== node &&
          sibling instanceof HTMLElement &&
          !sibling.inert &&
          // The route announcer is a live region that must keep speaking
          // the page change a menu link triggers.
          !["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NEXT-ROUTE-ANNOUNCER"].includes(
            sibling.tagName,
          )
        ) {
          sibling.inert = true;
          madeInert.push(sibling);
        }
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const header = headerRef.current;
      if (!header) return;

      const focusable = Array.from(
        header.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !header.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (active === last || !active || !header.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    /** A resize past the breakpoint reveals the desktop row; the panel's own
     *  `hidden` class would leave the body locked with nothing to unlock it. */
    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onBreakpointChange = () => {
      if (media.matches) setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onBreakpointChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onBreakpointChange);
      document.body.style.overflow = previousOverflow;
      for (const element of madeInert) element.inert = false;
    };
  }, [isOpen]);

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
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-8">
        <BrandLockup variant="compact" priority />

        <nav className={`${DESKTOP_ROW} items-center gap-0.5`} aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={NAV_LINK}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`${DESKTOP_ROW} items-center gap-2`}>
          {user ? (
            <>
              <Link href="/account/profile" className="premium-button-ghost focus-ring">
                My account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="premium-button-ghost focus-ring disabled:opacity-50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {signingOut ? "Signing out…" : "Log out"}
              </button>
              <Link href={APP_ENTRY_PATH} className="premium-button focus-ring">
                Open YO Voice
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="premium-button-ghost focus-ring">
                Log in
              </Link>
              <Link href="/register" className="premium-button-secondary focus-ring">
                Create account
              </Link>
              <Link href={APP_ENTRY_PATH} className="premium-button focus-ring">
                Open YO Voice
              </Link>
            </>
          )}
        </div>

        <button
          ref={mobileToggleRef}
          type="button"
          className={`focus-ring flex size-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-white ${MOBILE_ONLY}`}
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        /* The panel is sized by an explicit height rather than `bottom-0`:
           the header carries `backdrop-blur`, and a backdrop-filter makes an
           element the containing block for its fixed-position descendants,
           so `top`/`bottom` would resolve against the 56px header box and
           collapse the panel to its padding. */
        <div
          id="mobile-navigation"
          className={`fixed inset-x-0 top-[var(--header-height)] z-40 h-[calc(100svh-var(--header-height))] overflow-y-auto bg-[var(--surface)] px-5 py-6 ${MOBILE_ONLY}`}
        >
          <nav
            className="mx-auto flex w-full max-w-[560px] flex-col"
            aria-label="Mobile navigation"
          >
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="focus-ring link-muted flex min-h-14 items-center border-b border-[var(--border)] text-base font-semibold transition"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/account/profile"
                  onClick={closeMenu}
                  className="focus-ring link-muted flex min-h-14 items-center border-b border-[var(--border)] text-base font-semibold transition"
                >
                  My account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="focus-ring flex min-h-14 items-center gap-2 border-b border-[var(--border)] text-left text-base font-semibold text-[var(--text-secondary)] transition hover:text-white disabled:opacity-50"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {signingOut ? "Signing out…" : "Log out"}
                </button>
                <Link
                  href={APP_ENTRY_PATH}
                  onClick={closeMenu}
                  className="premium-button focus-ring mt-6"
                >
                  Open YO Voice
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="focus-ring link-muted flex min-h-14 items-center border-b border-[var(--border)] text-base font-semibold transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="premium-button-secondary focus-ring mt-6"
                >
                  Create account
                </Link>
                <Link
                  href={APP_ENTRY_PATH}
                  onClick={closeMenu}
                  className="premium-button focus-ring mt-3"
                >
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

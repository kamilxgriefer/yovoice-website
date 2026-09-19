import type { Metadata } from "next";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { AudioLines, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const highlights = [
  { icon: AudioLines, label: "Voice-first by design" },
  { icon: ShieldCheck, label: "Protected account hand-off" },
  { icon: Sparkles, label: "Dark and Pearl, one system" },
];

/**
 * One surface for all seven auth pages, including the mail-action pages
 * people open from their inbox on a cold device.
 *
 * Desktop: a single bordered surface split into a 560 px brand panel and a
 * form pane whose column is 400 px. Phone: no card at all — logo, wordmark
 * and the form sit straight on the page background.
 *
 * The brand line is a <p> styled as a heading on purpose: the page's only
 * <h1> belongs to the form (the panel is `hidden lg:flex`, so a heading here
 * gave desktop two H1s).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:py-16"
    >
      <div className="grid w-full max-w-[400px] lg:max-w-[1040px] lg:grid-cols-[minmax(0,560px)_minmax(0,480px)] lg:overflow-hidden lg:rounded-[var(--radius-card)] lg:border lg:border-border">
        <section
          aria-label="About YO Voice accounts"
          className="relative hidden min-h-[640px] overflow-hidden border-r border-border bg-[#120a22] p-12 lg:flex lg:flex-col"
        >
          {/* Three hairline rings: the panel's only decoration. */}
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0">
            {[520, 400, 280].map((size) => (
              <span
                key={size}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
                style={{ width: size, height: size }}
              />
            ))}
          </div>

          <div className="relative">
            <BrandLockup className="w-fit" />
            <p className="eyebrow mt-20">Voice Relay</p>
            <p className="mt-4 max-w-md font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-[1.08] tracking-[-.025em] text-white">
              One identity.
              <span className="block text-accent">Every conversation.</span>
            </p>
            <p className="mt-5 max-w-md text-base leading-[1.6] text-text-secondary">
              Enter the same YO Voice account used for Chats, Moments, Servers
              and your public Voice identity.
            </p>
          </div>

          <ul className="relative mt-auto grid gap-4">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-semibold text-text-secondary"
              >
                <span className="icon-tile">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center lg:bg-[var(--surface)] lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[400px]">
            <BrandLockup className="mx-auto w-fit lg:hidden" />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

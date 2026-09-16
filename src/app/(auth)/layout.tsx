import type { Metadata } from "next";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { AudioLines, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080711] px-3 py-6 sm:px-8 sm:py-10 lg:py-16"
    >
      <div className="absolute left-[-14%] top-[-18%] size-[620px] rounded-full bg-[#7b2ff7]/16 blur-[170px]" />
      <div className="absolute bottom-[-26%] right-[-12%] size-[620px] rounded-full bg-[#d986ff]/10 blur-[180px]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[0_40px_140px_rgba(0,0,0,.48)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden min-h-[680px] overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(145deg,#21192b,#130a22_58%,#080711)] p-12 lg:flex lg:flex-col">
          <div className="absolute right-[-22%] top-[8%] size-[460px] rounded-full bg-[#7b2ff7]/22 blur-[120px]" />
          <div className="relative">
            <BrandLockup className="w-fit" />
            <p className="mt-24 text-xs font-black uppercase tracking-[.24em] text-[#d986ff]">
              Voice Relay
            </p>
            <h1 className="mt-5 max-w-lg text-5xl font-black leading-[1.03] tracking-[-.05em] text-white">
              One identity.
              <span className="text-gradient text-gradient-descender-safe block">
                Every conversation.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-white/65">
              Enter the same YO Voice account used for Chats, Moments, Servers
              and your public Voice identity.
            </p>
          </div>

          <div className="relative mt-auto grid gap-3">
            {[
              { icon: AudioLines, label: "Voice-first by design" },
              { icon: ShieldCheck, label: "Protected account hand-off" },
              { icon: Sparkles, label: "Dark and Pearl, one system" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white/75"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#7b2ff7]/20 text-[#d986ff]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[620px] items-center bg-[linear-gradient(180deg,#17121f,#100d18)] p-3 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md rounded-[30px] border border-white/10 bg-[#17121f]/88 p-4 shadow-[0_28px_80px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-8">
            <BrandLockup className="mx-auto w-fit lg:hidden" />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

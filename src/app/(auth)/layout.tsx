import type { Metadata } from "next";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { AuthStage, AuthVoiceHeader } from "@/components/auth/auth-stage";
import { AuthModeSwitch } from "@/components/auth/auth-mode-switch";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * One surface for all seven auth pages, including the mail-action pages
 * people open from their inbox on a cold device.
 *
 * Desktop: a single bordered surface split into a 560 px brand panel and a
 * form pane whose column is 400 px. Phone: no card at all — logo, wordmark
 * and the form sit straight on the page background.
 *
 * Log in and Create account additionally share the spoken title, its
 * waveform and the mode switch. They live here rather than in the pages
 * because this layout survives the navigation between the two routes, which
 * is what lets them animate from one mode to the other. While the switch is
 * on screen the column is pinned to the top (`.auth-shell`, `.auth-pane`) so
 * the shared fields do not jump when the taller form arrives.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="auth-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:py-16"
    >
      <div className="grid w-full max-w-[400px] lg:max-w-[1040px] lg:grid-cols-[minmax(0,560px)_minmax(0,480px)] lg:overflow-hidden lg:rounded-[var(--radius-card)] lg:border lg:border-border">
        <AuthStage />

        <section className="auth-pane flex items-center lg:bg-[var(--surface)] lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[400px]">
            <BrandLockup className="mx-auto w-fit lg:hidden" />
            <AuthVoiceHeader />
            <AuthModeSwitch />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

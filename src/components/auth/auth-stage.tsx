"use client";

import { usePathname } from "next/navigation";
import { AudioLines, ShieldCheck, Sparkles } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { SpokenTitle } from "@/components/auth/spoken-title";
import { VoiceWave } from "@/components/auth/voice-wave";
import { AUTH_MODE_VOICE, authModeFromPath, type AuthMode } from "@/lib/auth/auth-mode";

const highlights = [
  { icon: AudioLines, label: "Voice-first by design" },
  { icon: ShieldCheck, label: "Protected account hand-off" },
  { icon: Sparkles, label: "Dark and Pearl, one system" },
];

/**
 * The desktop brand panel of the auth surface.
 *
 * On Log in and Create account it is a stage: the page's title said large and
 * a stylised waveform of that phrase along the bottom edge, both of which
 * animate when the visitor switches mode. Everything on the stage is
 * decorative, so it is not a named region. The five mail-action and recovery
 * pages keep the accounts panel they always had.
 */
export function AuthStage() {
  const mode = authModeFromPath(usePathname());
  return (
    <section
      aria-label={mode ? undefined : "About YO Voice accounts"}
      className="relative hidden min-h-[640px] overflow-hidden border-r border-border bg-[#120a22] p-12 lg:flex lg:flex-col"
    >
      {mode ? <VoiceStage mode={mode} /> : <AccountsPanel />}
    </section>
  );
}

function VoiceStage({ mode }: { mode: AuthMode }) {
  const voice = AUTH_MODE_VOICE[mode];
  return (
    <>
      <BrandLockup className="relative w-fit" />
      <div className="auth-title-frame relative flex flex-1 flex-col justify-center pb-36">
        <SpokenTitle text={voice.title} className="auth-spoken--stage" />
        <AuthModeNotes mode={mode} className="mt-5 max-w-md text-base leading-[1.6] text-text-secondary" />
      </div>
      <VoiceWave envelope={voice.envelope} bars={64} className="absolute inset-x-0 bottom-0 h-[150px]" />
    </>
  );
}

/**
 * Phone and tablet: the same title, note and waveform above the switch, in
 * the single column the auth surface collapses to below `lg`.
 */
export function AuthVoiceHeader() {
  const mode = authModeFromPath(usePathname());
  if (!mode) return null;
  const voice = AUTH_MODE_VOICE[mode];
  return (
    <div className="auth-title-frame mt-8 text-center lg:hidden">
      <SpokenTitle text={voice.title} className="auth-spoken--compact" />
      <AuthModeNotes mode={mode} className="mx-auto mt-3 max-w-[22rem] text-sm leading-[1.55] text-text-tertiary" />
      <VoiceWave envelope={voice.envelope} bars={44} className="mt-6 h-14" />
    </div>
  );
}

/** Both notes stay mounted and cross-fade, so the line below the title never
 * collapses and re-grows while the title is being said. Decorative: the page
 * repeats the current note for assistive technology. */
function AuthModeNotes({ mode, className }: { mode: AuthMode; className?: string }) {
  return (
    <p aria-hidden="true" className={`auth-notes ${className ?? ""}`}>
      {(Object.keys(AUTH_MODE_VOICE) as AuthMode[]).map((key) => (
        <span key={key} data-active={key === mode ? "" : undefined} className="auth-notes__note">
          {AUTH_MODE_VOICE[key].note}
        </span>
      ))}
    </p>
  );
}

/** The brand line is a <p> on purpose: the page's only <h1> belongs to the
 * form (the panel is `hidden lg:flex`, so a heading here gave desktop two
 * H1s). */
function AccountsPanel() {
  return (
    <>
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
    </>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Images,
  MessageSquareMore,
  PhoneCall,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { productUpdates } from "@/content/product-updates";

const releaseScope = [
  {
    icon: MessageSquareMore,
    title: "Chats & media",
    description: "Shared-media views and resilient voice, photo and video handling.",
  },
  {
    icon: Images,
    title: "Current identity",
    description: "Avatar refresh and profile media that stay consistent across surfaces.",
  },
  {
    icon: PhoneCall,
    title: "Private calls",
    description: "Safer audio and video negotiation across mixed app versions.",
  },
  {
    icon: Radio,
    title: "Voice Moments",
    description: "Publishing and playback recovery under the current media boundary.",
  },
  {
    icon: Clapperboard,
    title: "Reels MVP",
    description: "User-supplied photo, video, overlays, links and owned or licensed audio.",
  },
  {
    icon: ShieldCheck,
    title: "Trust boundary",
    description: "Short-lived access, bounded uploads and fail-safe compatibility.",
  },
] as const;

export function LatestReleaseSpotlight() {
  const update = productUpdates.find(
    (item) => item.slug === "mobile-build-19-release-candidate",
  );

  if (!update?.release) return null;

  return (
    <section
      aria-labelledby="latest-release-heading"
      className="relative overflow-hidden border-y border-white/[.06] bg-[var(--surface-sunken)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="grid-background absolute inset-0 opacity-15" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(123,47,247,.2),transparent_68%)] blur-2xl" />

      <div className="release-spotlight relative mx-auto grid max-w-[1240px] gap-8 overflow-hidden rounded-[30px] p-5 sm:p-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-10 lg:p-10">
        <div className="relative flex min-w-0 flex-col">
          <div className="inline-flex min-h-9 w-fit items-center gap-2 rounded-full border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/[.08] px-3.5 text-[11px] font-black uppercase tracking-[.17em] text-[var(--accent)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {update.release.stage}
          </div>

          <div className="mt-8 flex items-end gap-4 sm:mt-10 sm:gap-5">
            <span
              className="release-build-orb flex size-[5.6rem] shrink-0 items-center justify-center rounded-[1.8rem] font-[family-name:var(--font-display)] text-4xl font-black tabular-nums text-white sm:size-28 sm:rounded-[2rem] sm:text-5xl"
              aria-label={"Build " + update.release.buildNumber}
            >
              {update.release.buildNumber}
            </span>
            <div className="min-w-0 pb-1">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">
                YO Voice
              </p>
              <p className="mt-1 break-words font-[family-name:var(--font-display)] text-lg font-black tracking-[-.025em] text-white sm:text-2xl">
                {update.release.version}
              </p>
            </div>
          </div>

          <h2
            id="latest-release-heading"
            className="mt-8 max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.04] tracking-[-.045em] text-white sm:text-5xl"
          >
            One release.
            <span className="text-gradient block pb-[.08em]">
              One connected experience.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
            Build 19 brings connected chat and media, refreshed identity, private
            audio and video calls, Voice Moments, the Reels MVP and tighter media
            safeguards to invited iOS and Android testers. It is not publicly
            released on the App Store or Google Play.
          </p>

          <Link
            href="/updates#mobile-build-19-release-candidate"
            className="premium-button-secondary focus-ring mt-7 min-h-12 w-fit px-5 text-sm"
          >
            See Build 19 tester release
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="relative grid gap-3 sm:grid-cols-2" aria-label="Build 19 release scope">
          {releaseScope.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="release-scope-card group min-w-0 rounded-[22px] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-[var(--accent)] transition group-hover:border-[color:var(--accent)]/25 group-hover:bg-[color:var(--accent)]/[.08]">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-white">{title}</h3>
                    <span
                      className="text-[10px] font-black tabular-nums tracking-[.16em] text-white/25"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
                    {description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

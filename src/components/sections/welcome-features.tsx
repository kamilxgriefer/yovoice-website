"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Clapperboard,
  LayoutGrid,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import { useCinema } from "@/components/animations/cinema";
import { WelcomeFeaturesCinema } from "@/components/sections/welcome-features-cinema";
import {
  BrowserBar,
  FeatureRowBody,
  SCREEN_NOTE,
  SCREEN_SIZE,
  SCREEN_VIEWS,
  type Feature,
} from "@/components/sections/welcome-features-parts";

/**
 * What YO Voice gives you, described the way the audited /features page
 * describes it. Each card names a surface that exists under its current
 * name, and the Servers card says what a newcomer can do with one — anyone
 * signed in can create or join a Server — without turning the homepage into
 * release notes.
 *
 * Five rows: an icon tile, a title and one sentence, in two columns on a
 * wide screen and one on a phone.
 *
 * With the scroll cinema on, the section opens as the page's big-screen
 * moment (`welcome-features-cinema.tsx`): YO Voice in a browser on a large
 * screen rises out of a laptop-like tilt, fills the window, and shows Home,
 * Chats and Friends before the rows rise in. Without it — on the server,
 * before hydration, with reduced motion, large text or a short window — this
 * layout renders, with the same heading, sentence, rows and link, and the
 * Home capture as a calm still.
 */
const features: readonly Feature[] = [
  {
    icon: LayoutGrid,
    title: "Servers",
    description:
      "Friends, Community, Podcast, Family and Company: five kinds of space, each with its own voice channels and chats. Anyone signed in can create or join one.",
  },
  {
    icon: MessageCircle,
    title: "Chats",
    description:
      "Start a private conversation, send text, voice, photos or video, and open shared media in a responsive full-screen viewer.",
  },
  {
    icon: AudioLines,
    title: "Voice Moments",
    description:
      "Record, review and share a short voice update inside YO Moments. Published Moments last a day, then make room for the next one.",
  },
  {
    icon: Clapperboard,
    title: "Yeels",
    description:
      "Your own photo or short video comes first, with movable text and link overlays, and audio you own or license.",
  },
  {
    icon: UserPlus,
    title: "Friends",
    description:
      "A visible Add Friend action, plain-language search, and separate All, Online, Requests and Blocked views.",
  },
];

export function WelcomeFeatures() {
  const cinema = useCinema();
  return cinema ? <WelcomeFeaturesCinema features={features} /> : <WelcomeFeaturesStatic />;
}

function WelcomeFeaturesStatic() {
  const home = SCREEN_VIEWS[0];
  return (
    <section
      id="features"
      aria-labelledby="welcome-features-heading"
      className="relative border-t border-[var(--border)] bg-[var(--surface-sunken)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="max-w-2xl">
          <p className="eyebrow">What you get</p>
          <h2 id="welcome-features-heading" className="section-title text-balance break-words">
            One place for the{" "}
            <span className="text-[var(--accent)]">people you talk to.</span>
          </h2>
        </div>

        <figure className="mx-auto mt-10 max-w-[1080px] [--bar:1.625rem] sm:mt-12 sm:[--bar:2.125rem]">
          <div className="rounded-[0.875rem] bg-[linear-gradient(180deg,#2d2439_0%,#1a1424_40%,#110c19_100%)] p-[5px] shadow-[0_2rem_4rem_-1.5rem_rgb(0_0_0/0.7)] sm:rounded-[1.125rem] sm:p-[7px]">
            <div className="relative overflow-hidden rounded-[0.5rem] bg-[var(--surface-sunken)] shadow-[inset_0_0_0_1px_rgb(124_103_144/0.35)] sm:rounded-[0.6875rem]">
              <BrowserBar />
              <Image
                src={home.src}
                alt={home.alt}
                width={SCREEN_SIZE.width}
                height={SCREEN_SIZE.height}
                sizes="(min-width: 1200px) 1080px, (min-width: 1024px) calc(100vw - 96px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                className="block h-auto w-full"
              />
            </div>
          </div>
          <figcaption className="mt-4 break-words text-sm leading-6 text-[var(--text-tertiary)]">
            {SCREEN_NOTE}
          </figcaption>
        </figure>

        <ul className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
          {features.map((feature) => (
            <li key={feature.title} className="feature-row">
              <FeatureRowBody feature={feature} />
            </li>
          ))}
        </ul>

        <Link href="/features" className="premium-button-secondary focus-ring mt-10 w-fit">
          See every feature
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Radio, Sparkles, UserPlus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { usePublicShowcase } from "@/hooks/use-public-showcase";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import type {
  PublicShowcaseClub,
  PublicShowcasePerson,
} from "@/lib/public-showcase";

type Card =
  | { kind: "person"; key: string; value: PublicShowcasePerson }
  | { kind: "club"; key: string; value: PublicShowcaseClub };

const ROTATION_MS = 5600;

export function PublicShowcaseGrid() {
  const state = usePublicShowcase();
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  const cards = useMemo<Card[]>(() => {
    if (state.status !== "fresh") return [];
    const people = [...state.showcase.people].sort((a, b) => {
      const activity = Number(b.activity === "activeRecently") - Number(a.activity === "activeRecently");
      if (activity !== 0) return activity;
      const creator = Number(b.accountType !== "personal") - Number(a.accountType !== "personal");
      return creator !== 0 ? creator : a.displayName.localeCompare(b.displayName);
    });
    return [
      ...people.map((value, index) => ({
        kind: "person" as const,
        key: `person-${index}-${value.displayName}`,
        value,
      })),
      ...state.showcase.clubs.map((value, index) => ({
        kind: "club" as const,
        key: `club-${index}-${value.name}`,
        value,
      })),
    ];
  }, [state]);

  const pages = Math.max(1, Math.ceil(cards.length / 4));
  const visiblePage = page % pages;
  useEffect(() => {
    if (pages <= 1 || paused || reduceMotion === true) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pages);
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [pages, paused, reduceMotion]);

  if (state.status !== "fresh" || cards.length === 0) {
    return <ShowcaseInvitation />;
  }

  const visible = cards.slice(visiblePage * 4, visiblePage * 4 + 4);

  return (
    <div
      className="mt-7 sm:mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <span className="sr-only">
        This showcase contains only people and public Clubs that explicitly chose to appear on the public website.
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={visiblePage}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="grid gap-3 sm:grid-cols-2 sm:gap-4"
        >
          {visible.map((card) => (
            <ShowcaseCard key={card.key} card={card} />
          ))}
        </motion.div>
      </AnimatePresence>

      {pages > 1 && (
        <div className="mt-4 flex items-center gap-2" role="group" aria-label="Choose showcase page">
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Show community page ${index + 1} of ${pages}`}
              aria-current={visiblePage === index ? "true" : undefined}
              className={`focus-ring h-2.5 rounded-full transition-all ${
                visiblePage === index ? "w-7 bg-fuchsia-300" : "w-2.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShowcaseCard({ card }: { card: Card }) {
  const isClub = card.kind === "club";
  const person = !isClub ? card.value : null;
  const title = isClub ? card.value.name : card.value.displayName;
  const subtitle = isClub
    ? `${card.value.memberCount} ${card.value.memberCount === 1 ? "member" : "members"}`
    : person?.activity === "activeRecently"
      ? "Active recently"
      : person?.accountType === "creator"
        ? "Creator"
        : person?.accountType === "official"
          ? "Official profile"
          : "Community member";
  const Icon = isClub
    ? Crown
    : person?.activity === "activeRecently"
      ? Radio
      : person?.accountType === "personal"
        ? UserPlus
        : Sparkles;

  return (
    <article className="rounded-3xl border border-white/10 bg-[#130b1e]/72 p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 pt-1">
          <h4 className="truncate font-[family-name:var(--font-display)] text-lg font-bold text-white">
            {title}
          </h4>
          <p className="mt-1 text-xs text-white/55">{subtitle}</p>
        </div>
      </div>
      <Link
        href={APP_ENTRY_PATH}
        className="focus-ring mt-5 inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        Open YO Voice
      </Link>
    </article>
  );
}

function ShowcaseInvitation() {
  return (
    <div className="mt-7 rounded-3xl border border-fuchsia-300/15 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/[0.04] p-6 sm:mt-10">
      <p className="text-sm font-bold text-white">Meet the community in YO Voice</p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">
        Public profiles appear here only after a member chooses to be featured. Open YO Voice to discover people and public Clubs right now.
      </p>
      <Link
        href={APP_ENTRY_PATH}
        className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-fuchsia-100"
        style={{ color: "#080711" }}
      >
        Find your people
      </Link>
    </div>
  );
}

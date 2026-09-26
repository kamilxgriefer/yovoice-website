"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

import { SCENE_SPRING, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import styles from "@/components/servers/servers-welcome-cinema.module.css";
import {
  SERVERS_INTRO,
  ServersBoundary,
  ServersHeadingWords,
  StarterChannels,
  TemplatePrivacy,
  WORKSPACE_CAPTION,
  WorkspaceCapture,
} from "@/components/servers/servers-welcome-parts";
import { serverTemplates, type ServerTemplate } from "@/content/server-templates";
import { waveformHeights } from "@/lib/auth/auth-mode";
import { cn } from "@/lib/utils/cn";

/**
 * The five kinds of Server as a deck of stacking cards.
 *
 * On a wide screen the heading, the sentence and the Channels sheet hold
 * still on the left while the cards arrive on the right: each one slides up
 * over the card before it and settles a few pixels lower, and the covered
 * cards step back — a little smaller, a little darker — so the deck grows a
 * row of edges above the card in front. As a card lands, its numeral comes
 * to rest and the sound of its headline runs across it; the sheet turns a
 * few degrees and its screen drifts with every card that lands. On a phone
 * the heading and the sheet come first and the deck follows.
 *
 * Scroll is never taken over: the deck is ordinary flow plus
 * `position: sticky`. What follows the scroll is transform, opacity and one
 * clip-path per card.
 *
 * Contrast. A covered card's shade stays at most 0.08 while any of its text
 * is still in view (every line keeps WCAG AA on the surface), and deepens
 * only after the card in front has passed its first line of text, when all
 * that shows of it is the empty top edge. The shade follows the raw scroll
 * position, not the spring, so scrolling back up never uncovers text that
 * is still shaded.
 *
 * Only mounted while the scroll cinema is on; `ServersWelcome` renders the
 * static grid otherwise, with the same heading, id, sentence, figure, cards
 * and links.
 */
export function ServersWelcomeCinema() {
  const deckRef = useRef<HTMLUListElement>(null);
  const geometry = useDeckGeometry(deckRef);
  const wide = useWide();

  // Scroll distance, in px, since the top of the deck passed the top of the
  // window (negative before). `travel` follows through the scene spring;
  // `travelRaw` is exact.
  const { scrollYProgress } = useScroll({ target: deckRef, offset: ["start end", "end start"] });
  const eased = useSpring(scrollYProgress, SCENE_SPRING);
  const toTravel = (progress: number) =>
    geometry ? progress * geometry.span - geometry.viewport : 0;
  const travel = useTransform(eased, toTravel);
  const travelRaw = useTransform(scrollYProgress, toTravel);

  // How many cards have landed on the deck, 0..4, fractional in between.
  const landed = useTransform(travel, (u) =>
    geometry ? geometry.events.reduce((sum, event) => sum + ramp(u, event.from, event.to), 0) : 0,
  );

  return (
    <section
      id="servers"
      aria-labelledby="servers-welcome-heading"
      className="relative overflow-x-clip border-t border-[var(--border)] bg-[var(--background)] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:px-12"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-20">
          <div className={styles.aside}>
            <Reveal>
              <p className="eyebrow">Servers</p>
              <h2 id="servers-welcome-heading" className={styles.title}>
                <ServersHeadingWords accentClassName="lg:block" />
              </h2>
              <p className="mt-5 max-w-[34rem] text-base leading-[1.6] text-[var(--text-secondary)]">
                {SERVERS_INTRO}
              </p>
            </Reveal>

            <WorkspaceSheet landed={landed} wide={wide} />
          </div>

          <ul ref={deckRef} className={styles.deck} aria-label="The five kinds of Server">
            {serverTemplates.map((template, index) => (
              <DeckCard
                key={template.id}
                template={template}
                index={index}
                geometry={geometry}
                travel={travel}
                travelRaw={travelRaw}
                bars={wide ? WAVE_BARS_WIDE : WAVE_BARS}
              />
            ))}
          </ul>
        </div>

        <Reveal className="mt-12 sm:mt-16">
          <ServersBoundary />
        </Reveal>
      </div>
    </section>
  );
}

/* ---- Deck geometry -------------------------------------------------------- */

/** When card `k + 1` lands on card `k`, in px of deck travel. */
type LandingEvent = {
  /** Its top edge reaches the bottom of card `k`. */
  from: number;
  /** It has covered card `k`'s first line of text. */
  hide: number;
  /** It has settled. */
  to: number;
};

type DeckGeometry = {
  /** The window's height, as the scroll tracking measures it. */
  viewport: number;
  /** Deck height plus window height: the scroll the tracking spans. */
  span: number;
  /** Where each card settles, in px of deck travel. */
  settle: number[];
  /** Card `k + 1` landing on card `k`, for k = 0..3. */
  events: LandingEvent[];
};

/**
 * Measures the deck once per layout change (never per scroll step): makes
 * every card as tall as the tallest one, so no covered card can show below
 * the card in front, and works out where each card settles and lands.
 */
function useDeckGeometry(ref: RefObject<HTMLUListElement | null>): DeckGeometry | null {
  const [geometry, setGeometry] = useState<DeckGeometry | null>(null);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const items = Array.from(list.children).filter(
      (child): child is HTMLLIElement => child instanceof HTMLLIElement,
    );
    if (items.length === 0) return;

    let frame = 0;
    const measure = () => {
      frame = 0;

      // A card's natural height is its height minus the free space above its
      // foot, which the foot's auto margin takes up.
      const naturals = items.map((item) => {
        const card = item.firstElementChild as HTMLElement | null;
        const body = card?.querySelector<HTMLElement>("[data-deck-body]");
        const foot = card?.querySelector<HTMLElement>("[data-deck-foot]");
        if (!card || !body || !foot) return 0;
        const slack = foot.offsetTop - (body.offsetTop + body.offsetHeight);
        return card.offsetHeight - Math.max(0, slack);
      });
      const value = `${Math.ceil(Math.max(...naturals))}px`;
      if (list.style.getPropertyValue("--card-h") !== value) {
        list.style.setProperty("--card-h", value);
      }
      // What the cards are drawn at: that, or the deck's minimum if larger.
      const height = (items[0].firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;

      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      const tops = items.map((item) => parseFloat(getComputedStyle(item).top) || 0);
      const firstBody = items[0].querySelector<HTMLElement>("[data-deck-body]");
      const textTop = firstBody?.offsetTop ?? 24;
      const viewport = document.documentElement.clientHeight;

      // Card k sits at k * (height + gap) in the list's flow and settles
      // once that reaches its sticky top.
      const settle = tops.map((top, index) => index * (height + gap) - top);
      const events = settle.slice(1).map((to, index) => {
        const natural = (index + 1) * (height + gap);
        return {
          from: natural - tops[index] - height,
          hide: natural - tops[index] - textTop,
          to,
        };
      });
      const next: DeckGeometry = {
        viewport,
        span: list.clientHeight + viewport,
        settle,
        events,
      };
      setGeometry((previous) => (previous && sameGeometry(previous, next) ? previous : next));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();

    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    items.forEach((item) => {
      const card = item.firstElementChild;
      card?.querySelectorAll("[data-deck-body], [data-deck-foot]").forEach((part) => {
        observer.observe(part);
      });
    });
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      list.style.removeProperty("--card-h");
    };
  }, [ref]);

  return geometry;
}

function sameGeometry(a: DeckGeometry, b: DeckGeometry) {
  return (
    a.viewport === b.viewport &&
    a.span === b.span &&
    a.settle.length === b.settle.length &&
    a.settle.every((value, index) => value === b.settle[index]) &&
    a.events.every(
      (event, index) =>
        event.from === b.events[index].from &&
        event.hide === b.events[index].hide &&
        event.to === b.events[index].to,
    )
  );
}

/** 0 before `from`, 1 after `to`, linear in between. */
function ramp(value: number, from: number, to: number) {
  if (to <= from) return value >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

/* ---- One card --------------------------------------------------------------- */

/** How far a card steps back under the first card that lands on it … */
const STEP_BACK = 0.045;
/** … and under each one after that. */
const STEP_BACK_DEEPER = 0.013;
/** Most shade a card takes while any of its text is still in view. */
const SHADE_IN_VIEW = 0.08;
/** Shade once only its empty top edge shows, and per card after that. */
const SHADE_COVERED = 0.5;
const SHADE_DEEPER = 0.07;
/** How much of the window a card travels while it is "arriving". */
const ARRIVAL = 0.5;
/** One bar per 9–11 px of card width. */
const WAVE_BARS = 32;
const WAVE_BARS_WIDE = 60;

function DeckCard({
  template,
  index,
  geometry,
  travel,
  travelRaw,
  bars,
}: {
  template: ServerTemplate;
  index: number;
  geometry: DeckGeometry | null;
  travel: MotionValue<number>;
  travelRaw: MotionValue<number>;
  bars: number;
}) {
  const events = geometry?.events ?? [];
  const own = events[index];
  const settle = geometry?.settle[index];
  const lead = (geometry?.viewport ?? 0) * ARRIVAL;

  const scale = useTransform(travel, (u) => {
    let value = 1;
    for (let at = index; at < events.length; at += 1) {
      value -= (at === index ? STEP_BACK : STEP_BACK_DEEPER) * ramp(u, events[at].from, events[at].to);
    }
    return value;
  });

  const shade = useTransform(travelRaw, (u) => {
    if (!own) return 0;
    let value =
      SHADE_IN_VIEW * ramp(u, own.from, own.hide) +
      (SHADE_COVERED - SHADE_IN_VIEW) * ramp(u, own.hide, own.to);
    for (let at = index + 1; at < events.length; at += 1) {
      value += SHADE_DEEPER * ramp(u, events[at].from, events[at].to);
    }
    return value;
  });

  // The lit top edge belongs to the card in front.
  const edge = useTransform(travel, (u) => (own ? 1 - ramp(u, own.from, own.hide) : 1));

  // 0 while the card is still low in the window, 1 once it has settled.
  const arrival = useTransform(travel, (u) =>
    settle === undefined ? 1 : ramp(u, settle - lead, settle),
  );
  // The numeral slides in from the card's right edge and rests as it lands.
  const numeralX = useTransform(arrival, [0, 1], [72, 0]);
  // The sound of the headline runs across the card as it lands.
  const waveClip = useTransform(arrival, (a) => `inset(0 ${((1 - a) * 100).toFixed(2)}% 0 0)`);

  const heights = useMemo(
    () => waveformHeights(headlineEnvelope(template.headline), bars, index * 1.7 + 0.4),
    [template.headline, index, bars],
  );

  return (
    <li className={styles.item} style={{ "--i": index } as CSSProperties}>
      <motion.div className={cn("panel", styles.card)} style={{ scale }}>
        <motion.span className={styles.edge} style={{ opacity: edge }} aria-hidden="true" />
        <motion.span className={styles.numeral} style={{ x: numeralX }} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        <div data-deck-body="">
          <div className={styles.head}>
            <p className="eyebrow">{template.short}</p>
            <h3 className={styles.name}>{template.name}</h3>
          </div>
          <p className="mt-4 text-base font-semibold leading-snug text-[var(--foreground)] sm:text-[1.0625rem]">
            {template.headline}
          </p>
          <p className="mt-2.5 max-w-[34rem] text-sm leading-6 text-[var(--text-secondary)] sm:text-[0.9375rem] sm:leading-[1.65]">
            {template.description}
          </p>
        </div>

        <div data-deck-foot="" className="mt-auto pt-6">
          <motion.div className={styles.wave} style={{ clipPath: waveClip }} aria-hidden="true">
            {heights.map((height, bar) => (
              <WaveBar key={bar} height={height} index={bar} travel={travel} />
            ))}
          </motion.div>
          <StarterChannels template={template} className="mt-5" />
          <TemplatePrivacy template={template} className="mt-5" />
        </div>

        <motion.div className={styles.shade} style={{ opacity: shade }} aria-hidden="true" />
      </motion.div>
    </li>
  );
}

/**
 * One bar of a card's waveform. Like the page's `ScrollWave`, it moves a
 * little with every scroll step — a level meter, not a loop — and holds
 * still the moment scrolling stops.
 */
function WaveBar({
  height,
  index,
  travel,
}: {
  height: number;
  index: number;
  travel: MotionValue<number>;
}) {
  const scaleY = useTransform(
    travel,
    (u) => height * (0.78 + 0.22 * Math.abs(Math.sin(u / 36 + index * 0.9))),
  );
  return <motion.span className={styles.bar} style={{ scaleY }} />;
}

/**
 * A loudness contour for a headline, one value per character: vowels carry
 * the voice, consonants less, and spaces and full stops are the breaths —
 * the same idea as the hero line's hand-authored `TALK_ENVELOPE`, worked out
 * from the words so every kind of Server has its own sound.
 */
function headlineEnvelope(text: string): number[] {
  return Array.from(text.toLowerCase()).map((character, position) => {
    if (character === " ") return 0.14;
    if (/[.,·!?]/.test(character)) return 0.06;
    if ("aeiouy".includes(character)) return 0.84 + 0.16 * (((position * 7) % 5) / 4);
    return 0.4 + 0.32 * (((character.charCodeAt(0) * 13) % 7) / 6);
  });
}

/* ---- The Channels sheet ---------------------------------------------------- */

const SLAB_DEPTHS = [3, 6, 9, 12];

/**
 * The workspace capture as a device that turns a few degrees. On a wide
 * screen it holds still beside the deck and turns one step with every card
 * that lands; on a phone, where the deck comes after it, it turns as it
 * crosses the window.
 */
function WorkspaceSheet({ landed, wide }: { landed: MotionValue<number>; wide: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const crossing = useSceneProgress(ref, ["start end", "end start"]);
  const turn = useTransform([landed, crossing], ([cards, passing]: number[]) =>
    wide ? cards / 4 : passing,
  );

  const rotateY = useTransform(turn, [0, 1], [-16, 9]);
  const rotateX = useTransform(turn, [0, 1], [7, -3]);
  const drift = useTransform(turn, [0, 1], ["3.5%", "-3.5%"]);
  const sheenX = useTransform(turn, [0, 1], ["-22%", "22%"]);

  return (
    <figure ref={ref} className={styles.figure}>
      <div className={styles.stage}>
        <div className={styles.glow} aria-hidden="true" />
        <motion.div className={styles.device} style={{ rotateX, rotateY }}>
          {SLAB_DEPTHS.map((depth) => (
            <div
              key={depth}
              className={styles.slab}
              style={{ transform: `translateZ(-${depth}px)` }}
              aria-hidden="true"
            />
          ))}
          <div className={styles.body}>
            <div className={styles.screen}>
              <motion.div className={styles.capture} style={{ y: drift, scale: 1.08 }}>
                <WorkspaceCapture sizes="(min-width: 1024px) 290px, (min-width: 440px) 312px, 72vw" />
              </motion.div>
              <motion.div className={styles.sheen} style={{ x: sheenX }} aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </div>
      <figcaption className={styles.caption}>{WORKSPACE_CAPTION}</figcaption>
    </figure>
  );
}

/* ---- Breakpoint ------------------------------------------------------------- */

const WIDE_QUERY = "(min-width: 64rem)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

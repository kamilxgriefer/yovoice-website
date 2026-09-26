"use client";

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

import { useCinema, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * "Ready to find your people?" — the question the whole page has been
 * building to — zooms into place as it rises into view: it starts up to 1.4×
 * its size and settles as its centre reaches the middle of the screen.
 *
 * The starting size is capped by the widest line of the heading against the
 * viewport, so on a 320px phone it never grows past the screen edge. It never
 * fades below 55 % either, where both the white and the accent words still
 * read above 3:1 as large bold text, and the short focus pull (≤ 6px blur)
 * is gone by the time the heading is 40 % of the way in. Without the cinema
 * it is a plain `<h2>`.
 */
export function ZoomHeading({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const cinema = useCinema();
  if (!cinema) {
    return (
      <h2 id={id} className={className}>
        {children}
      </h2>
    );
  }
  return (
    <ZoomingHeading id={id} className={className}>
      {children}
    </ZoomingHeading>
  );
}

const MAX_ZOOM = 1.4;
/** Clear space kept on each side of the zoomed heading, in px. */
const GUTTER = 16;

function ZoomingHeading({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const progress = useSceneProgress(ref, ["start end", "center 0.5"]);
  const zoom = useMotionValue(MAX_ZOOM);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      // The union of the line boxes is as wide as the widest line. It is
      // read through the current transform, so undo the current scale.
      const range = document.createRange();
      range.selectNodeContents(node);
      const current = new DOMMatrixReadOnly(getComputedStyle(node).transform).a || 1;
      const line = range.getBoundingClientRect().width / current;
      const room = document.documentElement.clientWidth - GUTTER * 2;
      zoom.set(line > 0 ? Math.max(1, Math.min(MAX_ZOOM, room / line)) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [zoom]);

  const scale = useTransform([progress, zoom], ([value, start]: number[]) => {
    return 1 + (start - 1) * (1 - easeOutCubic(clamp01(value)));
  });
  const opacity = useTransform(progress, (value) => 0.55 + 0.45 * easeOutCubic(clamp01(value / 0.5)));
  const y = useTransform(progress, (value) => 36 * (1 - easeOutCubic(clamp01(value))));
  // A short focus pull as it arrives, gone well before it is read.
  const filter = useTransform(progress, (value) => {
    const blur = 6 * (1 - clamp01(value / 0.4));
    return blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  });

  return (
    <motion.h2 ref={ref} id={id} className={className} style={{ scale, opacity, y, filter }}>
      {children}
    </motion.h2>
  );
}

const DECK_QUERY = "(min-width: 48rem)";

function subscribeDeck(onChange: () => void) {
  const query = window.matchMedia(DECK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The four platform cards.
 *
 * With the cinema on a tablet or wider screen they are dealt: they arrive
 * as one fanned stack in the middle of the row and spread to their places as
 * you scroll — YO Voice everywhere, opening like a hand of cards. Cards are
 * opaque and never fade, so a card's text is either covered by the card on
 * top of it or fully readable. The moment keyboard focus enters the row the
 * deal completes, so a focused link is never tucked under another card.
 * On a phone the cards stack in one column and rise in one after another.
 * Without the cinema the grid is drawn at rest.
 */
export function PlatformDeck({
  id,
  className,
  cards,
}: {
  id: string;
  className?: string;
  cards: ReactNode[];
}) {
  const cinema = useCinema();
  const wide = useSyncExternalStore(
    subscribeDeck,
    () => window.matchMedia(DECK_QUERY).matches,
    () => false,
  );

  if (cinema && wide) return <DealtDeck id={id} className={className} cards={cards} />;

  return (
    <div id={id} className={className}>
      {cards.map((card, index) => (
        <Reveal key={index} delay={index * 0.08} className="flex min-w-0 flex-col">
          {card}
        </Reveal>
      ))}
    </div>
  );
}

function DealtDeck({ id, className, cards }: { id: string; className?: string; cards: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  // 0 while the row's middle is still just below the screen, 1 once it has
  // risen to a little above the middle.
  const progress = useSceneProgress(ref, ["center 1.08", "center 0.56"]);
  // Keyboard focus completes the deal at once.
  const forced = useMotionValue(0);
  const deal = useTransform([progress, forced], ([value, force]: number[]) => Math.max(value, force));

  return (
    <div
      ref={ref}
      id={id}
      className={`relative ${className ?? ""}`}
      onFocusCapture={() => forced.set(1)}
    >
      {cards.map((card, index) => (
        <DealtCard key={index} index={index} count={cards.length} deal={deal}>
          {card}
        </DealtCard>
      ))}
    </div>
  );
}

function DealtCard({
  index,
  count,
  deal,
  children,
}: {
  index: number;
  count: number;
  deal: MotionValue<number>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  useOffsetToCentre(ref, dx, dy);

  // -1 … 1 across the row: the fan's shape in the stack.
  const side = count > 1 ? (index / (count - 1)) * 2 - 1 : 0;
  const spread = useTransform(deal, (value) => easeInOutCubic(clamp01(value)));
  const x = useTransform([spread, dx], ([s, offset]: number[]) => (offset + side * 34) * (1 - s));
  const y = useTransform([spread, dy], ([s, offset]: number[]) => {
    // The stack is a slight arc, and each card lifts a little on its way out.
    const stacked = offset + Math.abs(side) * 14;
    return stacked * (1 - s) - Math.sin(Math.PI * s) * 22;
  });
  const rotate = useTransform(spread, (s) => side * 9 * (1 - s));
  const scale = useTransform(spread, (s) => 0.92 + 0.08 * s);

  return (
    <motion.div
      ref={ref}
      className="flex min-w-0 flex-col"
      style={{ x, y, rotate, scale, zIndex: count - index }}
    >
      {children}
    </motion.div>
  );
}

function useOffsetToCentre(
  ref: RefObject<HTMLElement | null>,
  dx: MotionValue<number>,
  dy: MotionValue<number>,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    const parent = node?.offsetParent as HTMLElement | null | undefined;
    if (!node || !parent) return;
    const measure = () => {
      dx.set(parent.clientWidth / 2 - (node.offsetLeft + node.offsetWidth / 2));
      dy.set(parent.clientHeight / 2 - (node.offsetTop + node.offsetHeight / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [ref, dx, dy]);
}

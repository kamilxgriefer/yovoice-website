"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

import { STAGGER, useCinema, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
        <Reveal key={index} delay={Math.min(index, 4) * STAGGER.item} className="flex min-w-0 flex-col">
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
  // From this card's slot to the middle of the row. State, not a motion
  // value set from a layout effect: a state update from a layout effect
  // re-renders before the browser paints, and the re-render re-derives every
  // transform below from the new number, so the stack is right from the
  // first frame the cards can be seen, never the grid slots snapping into a
  // pile (see the measurement rule in cinema.ts).
  const toCentre = useOffsetToCentre(ref);

  // -1 … 1 across the row: the fan's shape in the stack.
  const side = count > 1 ? (index / (count - 1)) * 2 - 1 : 0;
  const spread = useTransform(deal, (value) => easeInOutCubic(clamp01(value)));
  const x = useTransform(spread, (s) => (toCentre.x + side * 34) * (1 - s));
  const y = useTransform(spread, (s) => {
    // The stack is a slight arc, and each card lifts a little on its way out.
    const stacked = toCentre.y + Math.abs(side) * 14;
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

const AT_REST = { x: 0, y: 0 };

/** The vector from the element's resting centre to its offset parent's centre. */
function useOffsetToCentre(ref: RefObject<HTMLElement | null>): { x: number; y: number } {
  const [offset, setOffset] = useState(AT_REST);
  useLayoutEffect(() => {
    const node = ref.current;
    const parent = node?.offsetParent as HTMLElement | null | undefined;
    if (!node || !parent) return;
    const measure = () => {
      // offset* ignore transforms, so this is the slot, wherever the card is.
      const x = parent.clientWidth / 2 - (node.offsetLeft + node.offsetWidth / 2);
      const y = parent.clientHeight / 2 - (node.offsetTop + node.offsetHeight / 2);
      setOffset((current) => (current.x === x && current.y === y ? current : { x, y }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return offset;
}

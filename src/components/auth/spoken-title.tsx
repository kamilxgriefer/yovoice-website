"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { prefersReducedMotion } from "@/components/auth/auth-mode-motion";

const EASE_OUT = "cubic-bezier(.2,.8,.2,1)";
const EASE_IN = "cubic-bezier(.4,0,1,1)";

type Layer = { id: number; text: string; leaving: boolean; enter: boolean };

/**
 * A title that is said rather than swapped: when `text` changes, the old
 * phrase blurs out and the new one arrives letter by letter. The first render
 * (server markup, or a mount after navigating in from another page) simply
 * appears; only a change of mode animates.
 *
 * Every letter keeps the same size and weight at every moment; only opacity,
 * focus and the word's vertical position move. Letters are inline spans so
 * the browser still kerns the word as one run; words are inline-block so
 * they can rise, and never break across lines.
 *
 * Decorative: the page's own <h1> carries the same words for assistive
 * technology, so this renders `aria-hidden`.
 */
export function SpokenTitle({ text, className }: { text: string; className?: string }) {
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 0, text, leaving: false, enter: false },
  ]);
  const [shownText, setShownText] = useState(text);

  if (text !== shownText) {
    setShownText(text);
    setLayers((current) => [
      ...current.map((layer) => ({ ...layer, leaving: true })),
      { id: current[current.length - 1].id + 1, text, leaving: false, enter: true },
    ]);
  }

  return (
    <span aria-hidden="true" className={cn("auth-spoken", className)}>
      {layers.map((layer) => (
        <Phrase
          key={layer.id}
          text={layer.text}
          enter={layer.enter}
          leaving={layer.leaving}
          onGone={() => setLayers((current) => current.filter((l) => l.id !== layer.id))}
        />
      ))}
    </span>
  );
}

function Phrase({
  text,
  enter,
  leaving,
  onGone,
}: {
  text: string;
  enter: boolean;
  leaving: boolean;
  onGone: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const onGoneRef = useRef(onGone);

  useEffect(() => {
    onGoneRef.current = onGone;
  });

  // Entrance: before paint, so the first frame is already the start state.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enter || prefersReducedMotion()) return;
    const words = root.querySelectorAll<HTMLElement>("[data-word]");
    const letters = root.querySelectorAll<HTMLElement>("[data-letter]");
    const start = 150;
    words.forEach((word, i) =>
      word.animate(
        [{ transform: "translateY(.22em)" }, { transform: "translateY(0)" }],
        { duration: 560, delay: start + i * 90, easing: EASE_OUT, fill: "backwards" },
      ),
    );
    letters.forEach((letter, i) =>
      letter.animate(
        [
          { opacity: 0, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0)" },
        ],
        { duration: 380, delay: start + i * 24, easing: EASE_OUT, fill: "backwards" },
      ),
    );
  }, [enter]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !leaving) return;
    if (prefersReducedMotion()) {
      onGoneRef.current();
      return;
    }
    const words = [...root.querySelectorAll<HTMLElement>("[data-word]")].map((word) =>
      word.animate([{ transform: "translateY(0)" }, { transform: "translateY(-.14em)" }], {
        duration: 240,
        easing: EASE_IN,
        fill: "forwards",
      }),
    );
    const letters = [...root.querySelectorAll<HTMLElement>("[data-letter]")].map((letter, i) =>
      letter.animate(
        [
          { opacity: 1, filter: "blur(0)" },
          { opacity: 0, filter: "blur(4px)" },
        ],
        { duration: 200, delay: i * 8, easing: EASE_IN, fill: "forwards" },
      ),
    );
    let cancelled = false;
    Promise.all([...words, ...letters].map((animation) => animation.finished))
      .then(() => {
        if (!cancelled) onGoneRef.current();
      })
      .catch(() => {
        // Cancelled because the phrase unmounted first; nothing to clean up.
      });
    return () => {
      cancelled = true;
    };
  }, [leaving]);

  const words = text.split(" ");
  return (
    <span ref={ref} className="auth-spoken__phrase">
      {words.map((word, w) => (
        <span key={`${w}-${word}`}>
          <span data-word className="auth-spoken__word">
            {[...word].map((letter, l) => (
              <span key={l} data-letter>
                {letter}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

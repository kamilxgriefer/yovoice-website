"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import { useCinema, useSceneProgress } from "@/components/animations/cinema";

/**
 * Dim words on `--background` that still read at 4.6:1, so a sentence a
 * visitor stops half-way through is never below WCAG AA.
 */
const DIM = "#7f7689";
const LIT = "#f8f5fc";

/**
 * A sentence that lights up word by word as it scrolls through the viewport,
 * as if it were being said.
 *
 * Screen readers get the sentence once, as plain text; the per-word spans
 * are `aria-hidden`, so VoiceOver does not step through them one by one.
 * Without the cinema the sentence is plain text in its lit colour.
 */
export function WordReveal({
  text,
  className,
  as: Element = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "h3" | "span";
}) {
  const cinema = useCinema();
  return <Element className={className}>{cinema ? <ScrubbedWords text={text} /> : text}</Element>;
}

function ScrubbedWords({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const progress = useSceneProgress(ref, ["start 0.88", "end 0.52"]);
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} className="block" aria-hidden="true">
        {words.map((word, index) => {
          const start = (index / words.length) * 0.85;
          return (
            <Word key={`${word}-${index}`} progress={progress} range={[start, start + 0.15]}>
              {word}
            </Word>
          );
        })}
      </span>
    </>
  );
}

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const color = useTransform(progress, range, [DIM, LIT]);
  return (
    <>
      <motion.span style={{ color }}>{children}</motion.span>{" "}
    </>
  );
}

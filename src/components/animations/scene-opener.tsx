"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

import {
  DUR,
  EASE_IN,
  EASE_OUT,
  EXIT,
  RISE,
  STAGGER,
  justRelocated,
  onRelocation,
  useCinema,
  useSceneProgress,
} from "@/components/animations/cinema";
import { cn } from "@/lib/utils/cn";

/**
 * `scene` and `column` are the homepage's two display sizes; `section` keeps
 * the site's standard section title in the cinema too (a page whose own
 * heading is smaller, such as /servers).
 */
type OpenerSize = "scene" | "column" | "section";

/**
 * How every homepage section opens (2026-09-27): a ruled eyebrow in the
 * scene's ink, the title, and one lead.
 *
 * With the scroll cinema on, the first time the opener comes into view the
 * rule draws toward the title, the title's words rise out of their own
 * baseline one after another — the move the page closes on, where "Be You."
 * rises letter by letter — and the lead follows. It is triggered, not
 * scrubbed, and always finishes, so no text rests half-drawn; the whole
 * opener also settles a little as it crosses the window (transform only).
 * An opener already on screen when the cinema arms is drawn at rest, and
 * keyboard focus inside it draws it at rest at once. A relocation (a
 * fragment, a restored position) draws every opener it lands on or passes
 * in place, before the next paint.
 *
 * Without the cinema it is the same markup at rest: no split words, and the
 * title takes the site's standard section size (`.section-title`), which the
 * static layout keeps.
 *
 * Pinned stages pass `away` to send the opener off the stage (a quick fade,
 * lift and 6px blur that always completes) and bring it back.
 *
 * The title is plain text plus an optional accent (the words drawn in the
 * accent colour, always last): "A server for" + "every circle.". Its words
 * are split into spans only while their entrance is waiting or running;
 * before and after it the title is one run of plain text, so screen
 * readers, find in page and copy read it as written (each split word is an
 * inline-block, which the accessibility tree reads as a separate object with
 * no space after it).
 */
export function SceneOpener({
  eyebrow,
  eyebrowSlot,
  title,
  accent,
  accentClassName,
  lead,
  headingId,
  size = "scene",
  away = false,
  className,
  titleClassName,
  leadClassName,
  ink,
}: {
  /** The eyebrow's words; the rule is drawn before them. */
  eyebrow?: ReactNode;
  /** Replaces the ruled eyebrow entirely (Premium keeps its badge). */
  eyebrowSlot?: ReactNode;
  /** The title's plain words (a soft hyphen may be included). */
  title: string;
  /** The last words, drawn in the accent colour. */
  accent?: string;
  /** Classes for the accent span, e.g. `sm:block` to set it on its own line. */
  accentClassName?: string;
  lead?: ReactNode;
  headingId?: string;
  size?: OpenerSize;
  /** For pinned stages: true sends the opener off the stage. */
  away?: boolean;
  className?: string;
  titleClassName?: string;
  leadClassName?: string;
  /** The eyebrow's colour (the section's scene ink). */
  ink?: string;
}) {
  const cinema = useCinema();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const settle = useRef<(() => void) | null>(null);
  // True only while the entrance is waiting or running: the words are split.
  const [cue, setCue] = useState(false);
  // The shared settle, written by `OpenerSettle` while the cinema is on.
  const settleY = useMotionValue(0);

  // An opener still below the window when the cinema arms waits for its cue.
  useLayoutEffect(() => {
    const node = root.current;
    if (!cinema || !node) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    setCue(true);
    return () => setCue(false);
  }, [cinema]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!cinema || !cue || !node) return;

    const rule = eyebrowRef.current?.querySelector<HTMLElement>(".opener-rule") ?? null;
    const label = eyebrowRef.current?.querySelector<HTMLElement>(".opener-label") ?? null;
    const slot = eyebrowRef.current && !rule ? eyebrowRef.current : null;
    const words = Array.from(titleRef.current?.querySelectorAll<HTMLElement>(".opener-word-inner") ?? []);
    const leadNode = leadRef.current;

    const hide = () => {
      if (rule) rule.style.transform = "scaleX(0)";
      for (const el of [label, slot, leadNode]) {
        if (!el) continue;
        el.style.opacity = "0";
        el.style.transform = `translateY(${RISE.text}px)`;
      }
      for (const word of words) word.style.transform = "translateY(110%)";
    };
    const clear = () => {
      if (rule) rule.style.transform = "";
      for (const el of [label, slot, leadNode, ...words]) {
        if (!el) continue;
        el.style.opacity = "";
        el.style.transform = "";
      }
    };

    hide();
    let running: AnimationPlaybackControls[] = [];
    let done = false;
    // Drawn at rest: the split words go back to one run of text.
    const finish = () => {
      if (done) return;
      done = true;
      stopWatching();
      observer.disconnect();
      running.forEach((animation) => animation.stop());
      running = [];
      clear();
      setCue(false);
    };
    const play = () => {
      const wordsEnd = 0.12 + STAGGER.word * Math.min(words.length, 12);
      running = [
        ...(rule ? [animate(rule, { scaleX: [0, 1] }, { duration: DUR.text, ease: EASE_OUT })] : []),
        ...[label, slot].filter((el): el is HTMLElement => !!el).map((el) =>
          animate(el, { opacity: [0, 1], y: [RISE.text, 0] }, { duration: 0.4, delay: 0.08, ease: EASE_OUT }),
        ),
        ...words.map((word, index) =>
          animate(
            word,
            { y: ["110%", "0%"] },
            { duration: 0.8, delay: 0.12 + STAGGER.word * Math.min(index, 12), ease: EASE_OUT },
          ),
        ),
        ...(leadNode
          ? [
              animate(
                leadNode,
                { opacity: [0, 1], y: [RISE.text, 0] },
                { duration: DUR.text, delay: wordsEnd + 0.16, ease: EASE_OUT },
              ),
            ]
          : []),
      ];
      // Once every part has landed, the title is plain text again.
      const all = running;
      void Promise.all(all).then(() => {
        if (running === all) finish();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((candidate) => candidate.isIntersecting);
        if (!entry) return;
        observer.disconnect();
        stopWatching();
        // Arrived by a link or a restored position: drawn in place.
        if (justRelocated(entry.time)) finish();
        else play();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    // A relocation that lands on the opener, or past it, draws it in place
    // before the next paint, so its heading never blinks out.
    const stopWatching = onRelocation(() => {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.88) finish();
    });

    settle.current = finish;
    return () => {
      settle.current = null;
      stopWatching();
      observer.disconnect();
      running.forEach((animation) => animation.stop());
      running = [];
      clear();
    };
  }, [cinema, cue]);

  // Pinned stages: off the stage and back, always completing.
  const wasAway = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const node = body.current;
    if (!cinema || !node) return;
    const first = wasAway.current === null;
    if (!first && wasAway.current === away) return;
    wasAway.current = away;
    if (first) {
      node.style.opacity = away ? "0" : "";
      node.style.visibility = away ? "hidden" : "";
      return;
    }
    node.style.visibility = "";
    const move = away
      ? animate(
          node,
          { opacity: 0, y: EXIT.y, filter: `blur(${EXIT.blur}px)` },
          { duration: EXIT.duration, ease: EASE_IN },
        )
      : animate(
          node,
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.42, ease: EASE_OUT },
        );
    move.then(() => {
      if (away && body.current) body.current.style.visibility = "hidden";
    });
    return () => move.stop();
  }, [away, cinema]);

  const titleClass =
    cinema && size !== "section" ? (size === "scene" ? "title-scene" : "title-column") : "section-title";

  return (
    <motion.div ref={root} className={className} style={cinema ? { y: settleY } : undefined}>
      {cinema ? <OpenerSettle target={root} into={settleY} /> : null}
      <div ref={body} onFocusCapture={() => settle.current?.()}>
        {eyebrowSlot ? (
          <div ref={eyebrowRef as never}>{eyebrowSlot}</div>
        ) : eyebrow ? (
          <p
            ref={eyebrowRef}
            className="opener-eyebrow"
            style={ink ? ({ "--scene-ink": ink } as CSSProperties) : undefined}
          >
            <span className="opener-rule" aria-hidden="true" />
            <span className="opener-label">{eyebrow}</span>
          </p>
        ) : null}
        <h2 ref={titleRef} id={headingId} className={cn(titleClass, titleClassName)}>
          {/* The space before the accent stays inside the title's own text:
              Chrome drops a whitespace-only text node that follows React's
              server-rendered text separator from the accessibility tree. */}
          {cue ? splitWords(accent ? `${title} ` : title, "t") : accent ? `${title} ` : title}
          {accent ? (
            <span className={cn("text-[var(--accent)]", accentClassName)}>
              {cue ? splitWords(accent, "a") : accent}
            </span>
          ) : null}
        </h2>
        {lead ? (
          <p ref={leadRef} className={cn("opener-lead", leadClassName)}>
            {lead}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

/**
 * The opener's settle: it rises the last few pixels as it crosses the
 * window, finishing by the time its eyebrow reaches the voice line's head
 * (62 % down the window), so the line's tick meets the eyebrow where it
 * rests. Transform only, so the text stays crisp. Mounted only while the
 * cinema is on, so the static layout measures nothing.
 */
function OpenerSettle({ target, into }: { target: RefObject<HTMLDivElement | null>; into: MotionValue<number> }) {
  const progress = useSceneProgress(target, ["start end", "start 0.62"]);
  useMotionValueEvent(progress, "change", (value) => into.set(32 * (1 - value)));
  useEffect(() => {
    into.set(32 * (1 - progress.get()));
    return () => into.set(0);
  }, [progress, into]);
  return null;
}

/**
 * Every word in a clip and an inner span that can rise; the spaces between
 * the words stay plain text.
 */
function splitWords(text: string, key: string): ReactNode[] {
  return text.split(/(\s+)/).map((part, index) =>
    part === "" || /^\s+$/.test(part) ? (
      part
    ) : (
      <span key={`${key}${index}`} className="opener-word">
        <span className="opener-word-inner">{part}</span>
      </span>
    ),
  );
}

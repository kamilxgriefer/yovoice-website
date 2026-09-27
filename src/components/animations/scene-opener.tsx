"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useTransform, type AnimationPlaybackControls } from "framer-motion";

import {
  DUR,
  EASE_IN,
  EASE_OUT,
  EXIT,
  RISE,
  STAGGER,
  justRelocated,
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
 * keyboard focus inside it draws it at rest at once.
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
 * stay in one text flow — each word is a span, the spaces between them are
 * text — so screen readers and find in page read the title as written.
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

  // The shared settle: the opener rises the last few pixels as it crosses
  // the window. Transform only, so the text stays crisp.
  const progress = useSceneProgress(root, ["start end", "start 0.35"]);
  const settleY = useTransform(progress, [0, 1], [32, 0]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!cinema || !node) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

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
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // Arrived by a link or a restored position: drawn in place.
        if (justRelocated()) clear();
        else play();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);

    const toRest = () => {
      observer.disconnect();
      running.forEach((animation) => animation.stop());
      running = [];
      clear();
    };
    settle.current = toRest;
    return () => {
      settle.current = null;
      toRest();
    };
  }, [cinema]);

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
          {cinema ? splitWords(title, "t") : title}
          {accent ? (
            <>
              {" "}
              <span className={cn("text-[var(--accent)]", accentClassName)}>
                {cinema ? splitWords(accent, "a") : accent}
              </span>
            </>
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

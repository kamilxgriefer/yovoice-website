"use client";

import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { useScroll } from "framer-motion";

import { useCinema } from "@/components/animations/cinema";

/**
 * The voice line (2026-09-27): one thin line that carries the page's voice
 * from the end of the story to the last word.
 *
 * It runs down a single spine in the left gutter, just outside the page's
 * frame. Its head sits at 62 % of the window: behind it the line is lit
 * (violet → magenta, the story's colours), ahead of it a faint track shows
 * the way. At each section's opener it speaks — a short burst of voice on
 * the spine — and as the head passes, a tick draws from the spine into the
 * opener's ruled eyebrow in the section's ink, so the tick and the eyebrow's
 * rule read as one stroke. At the bottom it turns right and becomes the line
 * the "Be You." waveform stands on, drawn along it over the last stretch of
 * the page.
 *
 * - Decoration only: `aria-hidden`, no pointer events, left out in forced
 *   colours, and mounted only while the scroll cinema is on, from a tablet's
 *   width up. On a phone the gutter is 20px: a spine 10px from the glass
 *   doubles the edge of every card beside it and its ticks are too short to
 *   read, so phones have no line. The static layout has none either.
 * - Never behind text: the spine keeps to the gutter and a tick crosses only
 *   the gap between the spine and the eyebrow. A stage that covers the gutter
 *   while it is pinned (What you get's big screen) hides the line: the spine
 *   passes behind it, and the stop in it is drawn by the eyebrow itself —
 *   the line comes down into the stage, turns at a node into the eyebrow and
 *   leaves with the heading when the heading leaves the stage.
 * - The ticks (and the stop inside a covering stage) are attached to the
 *   eyebrow they reach, as a decorative child of it, so they follow it
 *   exactly wherever the opener is: settling into place, held by a sticky
 *   column (Servers) or leaving a pinned stage. Everything else is one SVG in
 *   page coordinates, whose bursts stand where the openers come to rest.
 * - The scroll is the only clock: the line follows the scroll exactly (no
 *   spring) through a precomputed table of the path — a binary search and a
 *   handful of attribute writes per scroll step, no layout reads (except the
 *   stop in a covering stage while the head crosses its opener). Ticks draw
 *   with a short transition when the head passes, always completing; a jump
 *   (a link, a restored position) lands without it.
 * - Geometry is read from the layout (offset chains, never transforms, so a
 *   running entrance does not bend the path) and rebuilt, once per frame at
 *   most, whenever the page's size changes.
 */
export function VoiceLine() {
  const cinema = useCinema();
  const wide = useSyncExternalStore(subscribeWide, wideSnapshot, () => false);
  return cinema && wide ? <VoiceLineCinema /> : null;
}

/** Tablets and up. */
const WIDE_QUERY = "(min-width: 48rem)";
const wideSnapshot = () => window.matchMedia(WIDE_QUERY).matches;

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The sections the line speaks at, in page order. */
const STOP_IDS = ["welcome", "features", "servers", "premium", "download"] as const;
/** Where the head sits, as a fraction of the window's height. */
const HEAD_AT = 0.62;
/** The spine's distance from the frame's edge, in px, where the gutter allows. */
const SPINE_GAP = 44;
/** A burst of voice at a stop: its height, cycles, peak (px) and points. */
const BURST = { span: 64, cycles: 6, amp: 10, steps: 120 } as const;
/** The radius of the final turn under "Be You." */
const TURN = 24;
/** The line fades in over this many px at its start. */
const FADE_IN = 160;
/** The line starts this far above the Welcome section: under the story's last call. */
const LEAD_IN = 140;
/** Scroll (in windows) over which the last stretch along the wave is drawn. */
const RUN_SCROLL = 0.3;
/** The run is complete by the time the wave's foot is this high in the window. */
const RUN_DONE_AT = 0.25;
/** How far above the stage's top a stage stop's stub starts (the stage clips it). */
const OVERSHOOT = 56;

const EASE = "cubic-bezier(.22,1,.36,1)";
const LIT = [
  [0, [123, 47, 247]],
  [0.55, [192, 38, 255]],
  [1, [217, 134, 255]],
] as const;
const TRACK = "#342a43";
const NODE_IDLE = { fill: "#080711", stroke: "#7c6790" } as const;
const HEAD = "#f8f5fc";
const HALO = "#c026ff";

type Point = { x: number; y: number; s: number };

/** A sticky stage that covers the spine while it is pinned. */
type Cover = {
  /** Its top in the page when it is not held (px). */
  top: number;
  height: number;
  /** Its CSS `top`. */
  stickyTop: number;
  /** How far it can be held down its track. */
  travel: number;
};

type Attachment = {
  target: HTMLElement;
  mount: HTMLSpanElement;
  tick: HTMLSpanElement;
  /** A stage stop only: the stub from the stage's top down to the eyebrow. */
  stub: {
    svg: SVGSVGElement;
    track: SVGPathElement;
    lit: SVGPathElement;
    node: HTMLSpanElement;
    length: number;
    /** The lit length last written. */
    drawn: number;
  } | null;
  restorePosition: string | null;
};

type Stop = {
  /** The eyebrow's centre line in the page, at rest (px). */
  y: number;
  /** The eyebrow's colour (its section's ink). */
  ink: string;
  cover: Cover | null;
  attachment: Attachment;
  on: boolean;
};

type Geometry = {
  x: number;
  startY: number;
  turnY: number;
  endY: number;
  vertical: Point[];
  run: Point[];
  verticalLength: number;
  runLength: number;
  vh: number;
  /** Scroll position where the head reaches the turn. */
  turnAt: number;
  /** Scroll position where the run is complete. */
  runDone: number;
  /** How far the head gets ahead of 62 % over the last screen, if it must. */
  lead: number;
  stops: Stop[];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Page position of an element's border box from the offset chain (no transforms). */
function pagePosition(element: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = element; node; ) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent) {
      x += parent.clientLeft;
      y += parent.clientTop;
    }
    node = parent;
  }
  return { x, y };
}

/**
 * How far the element's sticky ancestors are holding it down right now, and
 * the one that covers the spine (full-bleed stages), if any. A held
 * element's offsets include the hold, so each sticky ancestor is measured
 * once as static (synchronously, never painted) to find where it rests.
 */
function stickyState(element: HTMLElement, spineX: number): { shift: number; cover: Cover | null } {
  let shift = 0;
  let cover: Cover | null = null;
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.position !== "sticky") continue;
    const held = node.offsetTop;
    const inline = node.style.position;
    node.style.position = "static";
    const rest = node.offsetTop;
    node.style.position = inline;
    shift += held - rest;
    const box = pagePosition(node);
    if (!cover && box.x <= spineX && box.x + node.offsetWidth >= spineX) {
      const top = box.y - (held - rest);
      const track = node.parentElement;
      const trackBottom = track ? pagePosition(track).y + track.clientTop + track.clientHeight : top;
      cover = {
        top,
        height: node.offsetHeight,
        stickyTop: Number.parseFloat(style.top) || 0,
        travel: Math.max(0, trackBottom - top - node.offsetHeight),
      };
    }
  }
  return { shift, cover };
}

/** The opener's eyebrow, or Premium's badge in its place. */
function eyebrowOf(section: HTMLElement): HTMLElement | null {
  const ruled = section.querySelector<HTMLElement>(".opener-eyebrow");
  if (ruled) return ruled;
  const slot = section.querySelector("h2")?.previousElementSibling as HTMLElement | null | undefined;
  return (slot?.firstElementChild as HTMLElement | null | undefined) ?? slot ?? null;
}

function litAt(t: number): string {
  for (let index = 1; index < LIT.length; index++) {
    const [to, end] = LIT[index];
    const [from, start] = LIT[index - 1];
    if (t <= to || index === LIT.length - 1) {
      const k = clamp01((t - from) / (to - from));
      const [r, g, b] = start.map((channel, i) => Math.round(channel + (end[i] - channel) * k));
      return `rgb(${r} ${g} ${b})`;
    }
  }
  return "rgb(217 134 255)";
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The part of a stop that lives in the eyebrow: the tick (and, in a covering
 * stage, the stub and node). Classes are written out in full so Tailwind
 * builds them.
 */
function attach(target: HTMLElement, covered: boolean, previous: Attachment | undefined): Attachment {
  if (previous && previous.mount.isConnected && previous.target === target && !!previous.stub === covered) {
    return previous;
  }
  if (previous) detach(previous);

  let restorePosition: string | null = null;
  if (getComputedStyle(target).position === "static") {
    restorePosition = target.style.position;
    target.style.position = "relative";
  }
  const mount = document.createElement("span");
  mount.setAttribute("aria-hidden", "true");
  mount.dataset.voiceStop = "";
  mount.className = "pointer-events-none absolute right-full top-1/2 h-0 forced-colors:hidden";

  const tick = document.createElement("span");
  tick.className = "absolute inset-x-0 top-[-0.5px] block h-px origin-left bg-current";
  tick.style.transform = "scaleX(0)";
  mount.append(tick);

  let stub: Attachment["stub"] = null;
  if (covered) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "absolute left-0 top-0 overflow-visible");
    svg.setAttribute("width", "1");
    svg.setAttribute("height", "1");
    const track = document.createElementNS(SVG_NS, "path");
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", TRACK);
    track.setAttribute("stroke-width", "1.5");
    const lit = document.createElementNS(SVG_NS, "path");
    lit.setAttribute("fill", "none");
    lit.setAttribute("stroke-width", "2");
    svg.append(track, lit);
    const node = document.createElement("span");
    node.className = "absolute -left-1 -top-1 block size-2 rounded-full border-[1.5px]";
    mount.append(svg, node);
    stub = { svg, track, lit, node, length: 0, drawn: -1 };
  }
  target.append(mount);
  return { target, mount, tick, stub, restorePosition };
}

function detach(attachment: Attachment) {
  attachment.mount.remove();
  if (attachment.restorePosition !== null) attachment.target.style.position = attachment.restorePosition;
}

function VoiceLineCinema() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { lit: `vl-lit-${uid}`, track: `vl-track-${uid}`, halo: `vl-halo-${uid}`, clip: `vl-clip-${uid}` };
  const svgRef = useRef<SVGSVGElement>(null);
  const litGradient = useRef<SVGLinearGradientElement>(null);
  const trackGradient = useRef<SVGLinearGradientElement>(null);
  const fadeStops = useRef<SVGStopElement[]>([]);
  const clipAbove = useRef<SVGRectElement>(null);
  const clipBelow = useRef<SVGRectElement>(null);
  const verticalTrack = useRef<SVGPathElement>(null);
  const verticalLit = useRef<SVGPathElement>(null);
  const runTrack = useRef<SVGPathElement>(null);
  const runLit = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);

  const geometry = useRef<Geometry | null>(null);
  const attachments = useRef(new Map<HTMLElement, Attachment>());
  const last = useRef(freshState());

  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const owned = attachments.current;
    let frame = 0;

    /** Everything the scroll position decides. `instant`: land without transitions. */
    const draw = (y: number, instant: boolean) => {
      const g = geometry.current;
      if (!g) return;
      const state = last.current;
      const jump = instant || (!Number.isNaN(state.y) && Math.abs(y - state.y) > g.vh * 1.5);
      state.y = y;

      // Where the head is: 62 % of the window, pulled a little ahead over the
      // last screen when the page ends too soon for it to reach the turn.
      let headY = y + HEAD_AT * g.vh;
      if (g.lead > 0) headY += g.lead * smooth(clamp01((y - (g.turnAt - g.vh)) / g.vh));
      let vertical: number;
      let run = 0;
      if (y >= g.turnAt) {
        vertical = g.verticalLength;
        run = g.runLength * clamp01((y - g.turnAt) / Math.max(1, g.runDone - g.turnAt));
      } else {
        vertical = lengthAt(g.vertical, Math.min(headY, g.turnY));
      }

      if (Math.abs(vertical - state.vertical) > 0.2) {
        state.vertical = vertical;
        verticalLit.current?.setAttribute("stroke-dashoffset", (g.verticalLength - vertical).toFixed(1));
      }
      if (Math.abs(run - state.run) > 0.2) {
        state.run = run;
        runLit.current?.setAttribute("stroke-dashoffset", (g.runLength - run).toFixed(1));
      }

      // The covering stage, where it is now: the line passes behind it. The
      // page has one (What you get); a second would need a clip of its own.
      let hidden = false;
      for (const stop of g.stops) {
        const cover = stop.cover;
        if (!cover) continue;
        const top = cover.top + Math.min(cover.travel, Math.max(0, y + cover.stickyTop - cover.top));
        const bottom = top + cover.height;
        if (top !== state.above) {
          state.above = top;
          clipAbove.current?.setAttribute("height", Math.max(0, top).toFixed(1));
        }
        if (bottom !== state.below) {
          state.below = bottom;
          clipBelow.current?.setAttribute("y", bottom.toFixed(1));
        }
        const stub = stop.attachment.stub;
        if (!stub) continue;
        // The stub inside the stage: lit down to the head. Read from the
        // eyebrow only while the head is crossing it, so it is exact however
        // the opener has moved (settling, the stage's own drift).
        let corner = top + (stop.y - cover.top);
        const near = headY > top - OVERSHOOT && headY < corner + g.vh * 0.25;
        if (near) corner = stub.svg.getBoundingClientRect().top + y;
        if (headY > top && headY < bottom && headY > corner + 1) hidden = true;
        const along = Math.min(stub.length, Math.max(0, headY - (corner - stub.length)));
        if (Math.abs(along - stub.drawn) > 0.2) {
          stub.drawn = along;
          stub.lit.setAttribute("stroke-dashoffset", (stub.length - along).toFixed(1));
        }
        break;
      }

      // The head.
      const point = run > 0 ? pointAt(g.run, run) : pointAt(g.vertical, vertical);
      const headOn = vertical > 1 && run < g.runLength - 0.5 && !hidden;
      const headNode = head.current;
      if (headNode) {
        if (Math.abs(point.x - state.headX) > 0.05 || Math.abs(point.y - state.headY) > 0.05) {
          state.headX = point.x;
          state.headY = point.y;
          headNode.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
        }
        if (headOn !== state.headOn) {
          state.headOn = headOn;
          headNode.style.transition = jump ? "none" : `opacity .16s ${EASE}`;
          headNode.style.opacity = headOn ? "1" : "0";
        }
      }

      // The stops the head has passed: tick drawn.
      for (const stop of g.stops) {
        const on = headY >= stop.y;
        if (on === stop.on) continue;
        stop.on = on;
        paintStop(stop, jump);
      }
    };

    const build = () => {
      frame = 0;
      const svg = svgRef.current;
      if (!svg) return;
      const page = document.documentElement;
      const vh = window.innerHeight;
      const welcome = document.getElementById("welcome");
      const end = document.querySelector<HTMLElement>("[data-voice-line-end]");
      const frameElement = document.querySelector<HTMLElement>("main .frame");
      if (!welcome || !frameElement) {
        geometry.current = null;
        svg.style.display = "none";
        return;
      }
      svg.style.display = "";

      // The spine: 44px outside the frame's edge, or half the gutter where
      // the gutter is narrower than that.
      const frameStyle = getComputedStyle(frameElement);
      const gutter = Number.parseFloat(frameStyle.paddingLeft) || 20;
      const edge = pagePosition(frameElement).x + gutter;
      const x = Math.round(Math.max(gutter / 2, edge - SPINE_GAP));
      // The burst keeps to the gutter: at most half the room between the
      // spine and the frame's edge, and clear of the window's edge.
      const amp = Math.max(3, Math.min(BURST.amp, (edge - x) / 2, x - 6));

      const startY = Math.max(0, pagePosition(welcome).y - LEAD_IN);
      let endY: number;
      let runEndX: number;
      if (end) {
        const box = pagePosition(end);
        endY = box.y + end.offsetHeight;
        runEndX = box.x + end.offsetWidth;
      } else {
        const download = document.getElementById("download");
        endY = download ? pagePosition(download).y + download.offsetHeight : page.scrollHeight - vh;
        runEndX = x + TURN;
      }
      const turnY = endY - TURN;

      // The stops.
      const seen = new Set<HTMLElement>();
      const stops: Stop[] = [];
      for (const id of STOP_IDS) {
        const section = document.getElementById(id);
        const target = section ? eyebrowOf(section) : null;
        if (!target) continue;
        const { shift, cover } = stickyState(target, x);
        const box = pagePosition(target);
        const y = box.y - shift + target.offsetHeight / 2;
        if (y <= startY + BURST.span || y >= turnY - BURST.span) continue;
        const attachment = attach(target, !!cover, owned.get(target));
        owned.set(target, attachment);
        seen.add(target);
        const width = Math.max(0, box.x - x);
        attachment.mount.style.width = `${width}px`;
        attachment.tick.style.transitionDuration = `${Math.min(0.9, 0.25 + width / 900).toFixed(2)}s`;
        if (attachment.stub && cover) {
          // From above the stage's top (the stage clips it) down to the
          // eyebrow's centre line, where it turns into the tick.
          const length = y - cover.top + OVERSHOOT;
          const d = `M 0 ${(-length).toFixed(1)} V 0`;
          attachment.stub.track.setAttribute("d", d);
          attachment.stub.lit.setAttribute("d", d);
          attachment.stub.lit.setAttribute("stroke", litAt((cover.top - startY) / Math.max(1, endY - startY)));
          attachment.stub.lit.setAttribute("stroke-dasharray", `${length.toFixed(1)} ${(length + 1).toFixed(1)}`);
          attachment.stub.length = length;
          attachment.stub.drawn = -1;
        }
        const previous = geometry.current?.stops.find((stop) => stop.attachment === attachment);
        stops.push({
          y,
          ink: getComputedStyle(target).color,
          cover,
          attachment,
          on: previous?.on ?? false,
        });
      }
      for (const [target, attachment] of owned) {
        if (seen.has(target)) continue;
        detach(attachment);
        owned.delete(target);
      }

      // The vertical path: straight down the spine, a burst at every stop
      // outside a covering stage (the stage covers the others).
      const vertical: Point[] = [];
      const push = (list: Point[], px: number, py: number) => {
        const prior = list[list.length - 1];
        list.push({ x: px, y: py, s: prior ? prior.s + Math.hypot(px - prior.x, py - prior.y) : 0 });
      };
      push(vertical, x, startY);
      for (const stop of stops) {
        if (stop.cover) continue;
        const top = stop.y - BURST.span / 2;
        if (top <= vertical[vertical.length - 1].y) continue;
        push(vertical, x, top);
        for (let step = 1; step <= BURST.steps; step++) {
          const t = step / BURST.steps;
          const envelope = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(Math.PI * 3 * t) ** 2);
          push(vertical, x + amp * envelope * Math.sin(Math.PI * 2 * BURST.cycles * t), top + BURST.span * t);
        }
      }
      push(vertical, x, turnY);

      // The turn and the run along the foot of the wave.
      const run: Point[] = [];
      push(run, x, turnY);
      for (let step = 1; step <= 8; step++) {
        const angle = (step / 8) * (Math.PI / 2);
        push(run, x + TURN - TURN * Math.cos(angle), turnY + TURN * Math.sin(angle));
      }
      if (runEndX > x + TURN) push(run, runEndX, endY);

      const verticalLength = vertical[vertical.length - 1].s;
      const runLength = run[run.length - 1].s;

      // When the head reaches the turn, and when the run is done: the run is
      // drawn over the last stretch of scroll, complete when the wave's foot
      // is a quarter of the way down the window or at the end of the page.
      const maxScroll = Math.max(0, page.scrollHeight - vh);
      const runDone = Math.min(maxScroll, endY - RUN_DONE_AT * vh);
      const turnAt = Math.min(turnY - HEAD_AT * vh, runDone - RUN_SCROLL * vh);
      const lead = Math.max(0, turnY - (turnAt + HEAD_AT * vh));

      const pathOf = (list: Point[]) =>
        `M ${list.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" L ")}`;
      const verticalD = pathOf(vertical);
      const runD = pathOf(run);
      verticalTrack.current?.setAttribute("d", verticalD);
      verticalLit.current?.setAttribute("d", verticalD);
      verticalLit.current?.setAttribute("stroke-dasharray", `${verticalLength.toFixed(1)} ${(verticalLength + 1).toFixed(1)}`);
      runTrack.current?.setAttribute("d", runD);
      runLit.current?.setAttribute("d", runD);
      runLit.current?.setAttribute("stroke-dasharray", `${runLength.toFixed(1)} ${(runLength + 1).toFixed(1)}`);

      const height = Math.ceil(endY + 24);
      svg.setAttribute("height", String(height));
      svg.style.height = `${height}px`;
      for (const gradient of [litGradient.current, trackGradient.current]) {
        gradient?.setAttribute("y1", String(startY));
        gradient?.setAttribute("y2", String(endY));
      }
      const fade = String(clamp01(FADE_IN / Math.max(1, endY - startY)));
      for (const stop of fadeStops.current) stop.setAttribute("offset", fade);
      clipAbove.current?.setAttribute("width", "100%");
      clipBelow.current?.setAttribute("width", "100%");
      clipBelow.current?.setAttribute("height", String(height));
      if (!stops.some((stop) => stop.cover)) {
        clipAbove.current?.setAttribute("height", String(height));
        clipBelow.current?.setAttribute("y", String(height));
      }

      geometry.current = {
        x,
        startY,
        turnY,
        endY,
        vertical,
        run,
        verticalLength,
        runLength,
        vh,
        turnAt,
        runDone,
        lead,
        stops,
      };
      last.current = freshState();
      for (const stop of stops) paintStop(stop, true);
      draw(window.scrollY, true);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(build);
    };
    build();
    const unsubscribe = scrollY.on("change", (y) => draw(y, false));
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      for (const attachment of owned.values()) detach(attachment);
      owned.clear();
      geometry.current = null;
    };
  }, [scrollY]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full overflow-visible forced-colors:hidden"
      height={0}
    >
      <defs>
        <linearGradient ref={litGradient} id={ids.lit} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7b2ff7" stopOpacity="0" />
          <stop ref={(node) => { if (node) fadeStops.current[0] = node; }} offset="0.02" stopColor="#7b2ff7" />
          <stop offset="0.55" stopColor="#c026ff" />
          <stop offset="1" stopColor="#d986ff" />
        </linearGradient>
        <linearGradient ref={trackGradient} id={ids.track} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={TRACK} stopOpacity="0" />
          <stop ref={(node) => { if (node) fadeStops.current[1] = node; }} offset="0.02" stopColor={TRACK} />
          <stop offset="1" stopColor={TRACK} />
        </linearGradient>
        <radialGradient id={ids.halo}>
          <stop offset="0" stopColor={HALO} stopOpacity="0.55" />
          <stop offset="1" stopColor={HALO} stopOpacity="0" />
        </radialGradient>
        <clipPath id={ids.clip} clipPathUnits="userSpaceOnUse">
          <rect ref={clipAbove} x="0" y="0" width="100%" height="0" />
          <rect ref={clipBelow} x="0" y="0" width="100%" height="0" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${ids.clip})`}>
        <path ref={verticalTrack} fill="none" stroke={`url(#${ids.track})`} strokeWidth={1.5} />
        <path ref={verticalLit} fill="none" stroke={`url(#${ids.lit})`} strokeWidth={2} strokeLinecap="round" />
      </g>
      <path ref={runTrack} fill="none" stroke={TRACK} strokeWidth={1.5} />
      <path ref={runLit} fill="none" stroke={`url(#${ids.lit})`} strokeWidth={2} strokeLinecap="round" />
      <g ref={head} opacity={1}>
        <circle r={11} fill={`url(#${ids.halo})`} />
        <circle r={3.5} fill={HEAD} />
      </g>
    </svg>
  );
}

/** What was last written, so a scroll step only writes what changed. */
function freshState() {
  return {
    y: Number.NaN,
    vertical: -1,
    run: -1,
    headX: -1,
    headY: -1,
    headOn: null as boolean | null,
    above: -1,
    below: -1,
  };
}

/** A stop, passed or not: its tick drawn into the eyebrow, and where the
 * line ends in a covering stage, the node it turns at lit. */
function paintStop(stop: Stop, instant: boolean) {
  const { tick, stub } = stop.attachment;
  tick.style.transitionProperty = instant ? "none" : "transform";
  tick.style.transitionTimingFunction = EASE;
  tick.style.transform = stop.on ? "scaleX(1)" : "scaleX(0)";
  if (stub) {
    const colours = stop.on ? { fill: stop.ink, stroke: stop.ink } : NODE_IDLE;
    stub.node.style.transition = instant ? "none" : `background-color .4s ${EASE}, border-color .4s ${EASE}`;
    stub.node.style.backgroundColor = colours.fill;
    stub.node.style.borderColor = colours.stroke;
  }
}

/** The length along a path (by its table) at page height `y`; the path only goes down. */
function lengthAt(points: Point[], y: number): number {
  if (y <= points[0].y) return 0;
  const lastPoint = points[points.length - 1];
  if (y >= lastPoint.y) return lastPoint.s;
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (points[middle].y <= y) low = middle;
    else high = middle;
  }
  const a = points[low];
  const b = points[high];
  const k = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
  return a.s + (b.s - a.s) * k;
}

/** The point at length `s` along a path (by its table). */
function pointAt(points: Point[], s: number): { x: number; y: number } {
  if (s <= 0) return points[0];
  const lastPoint = points[points.length - 1];
  if (s >= lastPoint.s) return lastPoint;
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (points[middle].s <= s) low = middle;
    else high = middle;
  }
  const a = points[low];
  const b = points[high];
  const k = b.s === a.s ? 0 : (s - a.s) / (b.s - a.s);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

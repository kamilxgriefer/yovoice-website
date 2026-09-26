"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { Crown, Mic, Sparkles, Users, type LucideIcon } from "lucide-react";

import { useCinema, useSceneProgress } from "@/components/animations/cinema";

/**
 * The Premium identity: the ring a member's avatar gets in the app, with the
 * crown chip and the three capability pills around it.
 *
 * Without the scroll cinema it is drawn exactly as the static showcase always
 * was. With it, the ring is the scene's protagonist: as the section rises
 * into view it grows from half its size while the whole group turns into
 * place, thin rings spread from the avatar like sound as you scroll, and the
 * crown and pills fly out from behind the ring to their places, one after the
 * other, like a lineup fanning out. Everything is transform and opacity on
 * decorative layers; the pills never fade, they emerge from behind the ring
 * at full strength, so their text reads wherever the visitor stops.
 *
 * The box keeps the 320px-safe sizing: `w-full` with a 340px cap, so a
 * narrow viewport can never be forced wider than itself.
 */
export function PremiumIdentity({ ring }: { ring: ReactNode }) {
  const cinema = useCinema();
  return cinema ? <IdentityCinema ring={ring} /> : <IdentityStatic ring={ring} />;
}

const BOX = "relative h-[300px] w-full max-w-[340px]";
/** The ring's diameter (PremiumRing size) and the widest ripple, in px. */
const RING = 190;
const RIPPLE = 520;

type Satellite =
  | { key: string; kind: "crown"; className: string }
  | { key: string; kind: "pill"; icon: LucideIcon; label: string; className: string };

/** In flight order: the crown first, then the pills clockwise from the top. */
const SATELLITES: readonly Satellite[] = [
  { key: "crown", kind: "crown", className: "right-[62px] top-[52px]" },
  { key: "creator", kind: "pill", icon: Mic, label: "Creator", className: "right-0 top-[84px]" },
  {
    key: "premium-identity",
    kind: "pill",
    icon: Sparkles,
    label: "Premium Identity",
    className: "bottom-0 right-[36px]",
  },
  { key: "your-identity", kind: "pill", icon: Users, label: "Your identity", className: "left-0 top-[178px]" },
];

const CROWN =
  "absolute flex size-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)]";
const PILL =
  "absolute inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[13px] font-semibold text-[var(--text-secondary)]";

function SatelliteContent({ satellite }: { satellite: Satellite }) {
  if (satellite.kind === "crown") return <Crown className="size-5" strokeWidth={1.8} aria-hidden />;
  const Icon = satellite.icon;
  return (
    <>
      <Icon className="size-3.5 text-[var(--accent)]" aria-hidden />
      {satellite.label}
    </>
  );
}

function satelliteClass(satellite: Satellite) {
  return `${satellite.kind === "crown" ? CROWN : PILL} ${satellite.className}`;
}

function IdentityStatic({ ring }: { ring: ReactNode }) {
  return (
    <div className="flex w-full justify-center">
      <div className={BOX}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{ring}</div>
        {SATELLITES.map((satellite) => (
          <span key={satellite.key} className={satelliteClass(satellite)}>
            <SatelliteContent satellite={satellite} />
          </span>
        ))}
      </div>
    </div>
  );
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The ring grows from half its size over the first 60 % of the entrance. */
const ringScaleAt = (entry: number) => 0.5 + 0.5 * easeOutCubic(clamp01(entry / 0.6));

function IdentityCinema({ ring }: { ring: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  // 0 just after the box's top edge enters the viewport, 1 once its centre
  // is a little above the middle: the whole entrance happens while it is
  // seen, and settles while the visitor reads the copy beside it.
  const entry = useSceneProgress(boxRef, ["start 0.95", "center 0.42"]);
  // The ripples run for as long as the ring is on screen.
  const waves = useSceneProgress(boxRef, ["start end", "end start"]);

  const ringScale = useTransform(entry, ringScaleAt);
  const turn = useTransform(entry, (value) => -38 * (1 - easeInOutCubic(clamp01(value / 0.78))));
  const tilt = useTransform(entry, (value) => 16 * (1 - easeOutCubic(clamp01(value / 0.7))));
  const coreScale = useTransform(entry, (value) => 0.55 + 0.45 * easeOutCubic(clamp01(value / 0.7)));
  const coreOpacity = useTransform(entry, (value) => easeOutCubic(clamp01((value - 0.05) / 0.6)));

  return (
    <div className="flex w-full justify-center">
      <div ref={boxRef} className={`${BOX} [perspective:1400px]`}>
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ rotate: turn, rotateX: tilt }}
        >
          {/* The one bright core, behind the ring only. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(123,47,247,0.34),rgba(123,47,247,0.12)_52%,rgba(123,47,247,0)_100%)]"
            style={{ scale: coreScale, opacity: coreOpacity }}
          />
          {/* The ripples fade out towards their widest ring as well, so
              they are strongest near the avatar and never end on a hard
              edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000_58%,transparent_100%)]"
            style={{ width: RIPPLE, height: RIPPLE }}
          >
            {RIPPLE_COLORS.map((color, index) => (
              <Ripple key={index} index={index} color={color} entry={entry} waves={waves} />
            ))}
          </div>

          {SATELLITES.map((satellite, index) => (
            <FlyingSatellite key={satellite.key} satellite={satellite} index={index} entry={entry} />
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
            style={{ scale: ringScale }}
          >
            {ring}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/** Violet, magenta and the accent: the ring's own palette. */
const RIPPLE_COLORS = ["#7b2ff7", "#c026ff", "#d986ff", "#9b4dff"] as const;
/** How many times each ripple spreads while the ring crosses the screen. */
const RIPPLE_CYCLES = 3;

function Ripple({
  index,
  color,
  entry,
  waves,
}: {
  index: number;
  color: string;
  entry: MotionValue<number>;
  waves: MotionValue<number>;
}) {
  const phaseAt = (wave: number) => {
    const raw = wave * RIPPLE_CYCLES + index / RIPPLE_COLORS.length;
    return raw - Math.floor(raw);
  };
  const scale = useTransform([waves, entry], ([wave, enter]: number[]) => {
    // Each ripple leaves the ring's edge at the ring's current size.
    const start = (RING * ringScaleAt(enter)) / RIPPLE;
    return start + (1 - start) * easeOutCubic(phaseAt(wave));
  });
  const opacity = useTransform([waves, entry], ([wave, enter]: number[]) => {
    const phase = phaseAt(wave);
    const strength = easeOutCubic(clamp01((enter - 0.08) / 0.4));
    // Fades as it spreads, and eases in so the wrap-around never pops.
    return strength * 0.8 * Math.pow(1 - phase, 1.1) * Math.min(1, phase / 0.06);
  });

  return (
    <motion.span
      className="absolute inset-0 rounded-full border-[1.5px]"
      style={{ borderColor: color, scale, opacity }}
    />
  );
}

function FlyingSatellite({
  satellite,
  index,
  entry,
}: {
  satellite: Satellite;
  index: number;
  entry: MotionValue<number>;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // How far the satellite's centre sits from the ring's centre, measured
  // from its resting place (offset* ignore transforms).
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  useCentreOffset(ref, dx, dy);

  const start = 0.26 + index * 0.08;
  const flight = useTransform(entry, (value) => easeOutCubic(clamp01((value - start) / 0.42)));
  const x = useTransform([flight, dx], ([f, offset]: number[]) => offset * (1 - f));
  const y = useTransform([flight, dy], ([f, offset]: number[]) => offset * (1 - f));
  const scale = useTransform(flight, (f) => 0.5 + 0.5 * f);
  // Hidden while still tucked behind the small ring, then fully opaque:
  // the pill slides out from under the ring rather than fading in.
  const opacity = useTransform(entry, (value) => (value >= start ? 1 : 0));
  // The crown rests on the ring's edge, so it comes to the front once home.
  const zIndex = useTransform(flight, (f) => (f > 0.92 ? 3 : 1));

  return (
    <motion.span
      ref={ref}
      className={satelliteClass(satellite)}
      style={{ x, y, scale, opacity, zIndex }}
    >
      <SatelliteContent satellite={satellite} />
    </motion.span>
  );
}

function useCentreOffset(
  ref: RefObject<HTMLElement | null>,
  dx: MotionValue<number>,
  dy: MotionValue<number>,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    const parent = node?.offsetParent as HTMLElement | null | undefined;
    if (!node || !parent) return;
    const measure = () => {
      dx.set(parent.offsetWidth / 2 - (node.offsetLeft + node.offsetWidth / 2));
      dy.set(parent.offsetHeight / 2 - (node.offsetTop + node.offsetHeight / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, dx, dy]);
}

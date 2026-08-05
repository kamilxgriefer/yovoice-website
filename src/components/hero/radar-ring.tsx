/** A thin ring of evenly-spaced tick marks, like a radar/sonar sweep.
 * Pure CSS (conic-gradient ring, radial-gradient mask cuts a hollow ring
 * out of it) — scales with its container, no assets. */
export function RadarRing({ inset, opacity = 0.28 }: { inset: string; opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute rounded-full"
      style={{
        inset,
        background: `repeating-conic-gradient(rgba(240,171,252,${opacity}) 0deg 1deg, transparent 1deg 7.5deg)`,
        WebkitMaskImage:
          "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
        maskImage:
          "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
      }}
    />
  );
}

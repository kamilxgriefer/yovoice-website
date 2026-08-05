/** Purely CSS-drawn planets + nebula glow — no image assets, so this
 * scales crisply at any size/DPI and costs nothing to load. */
export function SpacePlanets() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Nebula depth — layered soft color blobs behind everything else */}
      <div className="absolute -right-[10%] top-[-15%] size-[560px] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,.16),transparent_65%)] blur-2xl" />
      <div className="absolute -left-[12%] bottom-[-20%] size-[480px] rounded-full bg-[radial-gradient(circle,rgba(88,28,235,.14),transparent_65%)] blur-2xl" />
      <div className="absolute right-[18%] top-[38%] size-[320px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.08),transparent_70%)] blur-2xl" />

      {/* Large ringed planet, upper right */}
      <div className="absolute -right-[6%] top-[2%] size-[220px] sm:size-[280px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #6d4fb8 0%, #3c2a72 32%, #1c1240 62%, #0c081f 100%)",
            boxShadow:
              "0 0 90px rgba(139,92,246,.35), inset -18px -18px 46px rgba(0,0,0,.55), inset 10px 10px 30px rgba(255,255,255,.06)",
          }}
        />
        <div
          className="absolute inset-[-18%] rounded-full border border-fuchsia-200/20"
          style={{ transform: "rotate(-18deg) scaleY(0.28)" }}
        />
        <div
          className="absolute inset-[-28%] rounded-full border border-fuchsia-200/10"
          style={{ transform: "rotate(-18deg) scaleY(0.28)" }}
        />
      </div>

      {/* Small moon, lower right */}
      <div
        className="absolute bottom-[8%] right-[4%] size-16 rounded-full sm:size-20"
        style={{
          background:
            "radial-gradient(circle at 34% 30%, #8d8aa8 0%, #4a4560 40%, #221d38 75%, #0c081f 100%)",
          boxShadow: "0 0 34px rgba(148,130,220,.25), inset -8px -8px 18px rgba(0,0,0,.55)",
        }}
      />

      {/* Distant asteroid speck */}
      <div className="absolute right-[28%] top-[62%] size-2 rounded-full bg-white/30 blur-[1px]" />
    </div>
  );
}

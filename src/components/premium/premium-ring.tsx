/**
 * The website rendition of the app's PremiumAvatarFrame: a slow
 * violet→magenta conic ring with a soft glow. Same palette, same 6s
 * sweep, so the Premium identity a visitor sees here is the one they
 * meet again inside YO Voice. Static under prefers-reduced-motion.
 */
export function PremiumRing({
  size = 96,
  children,
}: {
  size?: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="premium-ring relative shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-[3px] flex items-center justify-center overflow-hidden rounded-full bg-[#160b22]">
        {children}
      </div>
      <style>{`
        .premium-ring {
          background: conic-gradient(
            from var(--premium-ring-angle, 0deg),
            #7b2ff7,
            #c026ff 45%,
            #e879f9 70%,
            #7b2ff7
          );
          box-shadow: 0 0 24px rgba(192, 38, 255, 0.35);
          animation: premium-ring-spin 6s linear infinite;
        }
        @property --premium-ring-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes premium-ring-spin {
          to { --premium-ring-angle: 360deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          .premium-ring { animation: none; }
        }
      `}</style>
    </div>
  );
}

/**
 * The status visuals shared by every auth action page (verify-email,
 * reset-password, recover-email), extracted so success/error/loading look
 * identical no matter which flow a user arrives through.
 */

export function SuccessCheckmark({ label = "Success" }: { label?: string }) {
  return (
    <div className="mx-auto flex size-20 items-center justify-center">
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="size-20"
        role="img"
        aria-label={label}
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          className="origin-center animate-[verify-pop_0.4s_ease-out]"
          stroke="url(#verify-ring)"
          strokeWidth="3"
        />
        <path
          d="M24 41 L35 52 L57 29"
          fill="none"
          stroke="url(#verify-ring)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-[verify-draw_0.5s_0.25s_ease-out_both]"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
          }}
        />
        <defs>
          <linearGradient id="verify-ring" x1="0" y1="0" x2="80" y2="80">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        @keyframes verify-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes verify-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg circle, svg path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export function ErrorGlyph() {
  return (
    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-500/10">
      <svg viewBox="0 0 24 24" fill="none" className="size-9" aria-hidden="true">
        <path
          d="M12 8v5m0 3.5h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.6 0Z"
          stroke="#fb7185"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="mx-auto mt-4 size-10 animate-spin rounded-full border-2 border-white/10 border-t-fuchsia-400" />
  );
}

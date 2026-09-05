import type { SVGProps } from "react";

/** Matches the app's inactive FrameEchoCleanPainter: frame and play, no bars. */
export function FrameEchoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <rect
        x="3.75"
        y="3.75"
        width="92.5"
        height="92.5"
        rx="27"
        stroke="currentColor"
        strokeWidth="7.5"
      />
      <path
        d="M38.62 32Q35.26 34.52 35.26 39.2V60.8Q35.26 65.48 38.62 68L67.74 52.88Q71.66 50 67.74 47.12Z"
        fill="currentColor"
      />
    </svg>
  );
}

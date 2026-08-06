import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero's center logo (yovoice-mark-glow.png) is the page's single
    // most important image — it's rendered at full quality (100) rather
    // than Next's default 75 so the "must always remain perfectly sharp"
    // requirement actually holds after compression.
    qualities: [75, 100],
  },
};

export default nextConfig;

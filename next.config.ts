import type { NextConfig } from "next";

const authActionHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex" },
];

const authActionPaths = [
  "/auth/action",
  "/reset-password",
  "/verify-email",
  "/recover-email",
  "/revert-second-factor",
];

const nextConfig: NextConfig = {
  async headers() {
    return authActionPaths.map((source) => ({
      source,
      headers: authActionHeaders,
    }));
  },
  images: {
    // The hero's center logo (yovoice-mark-glow.png) is the page's single
    // most important image — it's rendered at full quality (100) rather
    // than Next's default 75 so the "must always remain perfectly sharp"
    // requirement actually holds after compression.
    qualities: [75, 100],
  },
};

export default nextConfig;

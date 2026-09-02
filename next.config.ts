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

// Start CSP in report-only mode: the policy is deliberately compatible with
// Firebase Auth/Firestore/Functions and Stripe redirects, but it must collect
// real production violations before it can safely become enforcing. The
// remaining headers are low-risk, global browser hardening controls.
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com https://accounts.google.com https://appleid.apple.com",
  "script-src 'self' 'unsafe-inline' https://auth.yovoice.app https://apis.google.com https://www.gstatic.com https://accounts.google.com https://appleid.cdn-apple.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://auth.yovoice.app https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net https://*.run.app https://api.stripe.com",
  "frame-src 'self' https://auth.yovoice.app https://accounts.google.com https://appleid.apple.com https://checkout.stripe.com https://billing.stripe.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const globalSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
  {
    key: "Permissions-Policy",
    value:
      'accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self "https://checkout.stripe.com"), usb=()',
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicyReportOnly,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders,
      },
      ...authActionPaths.map((source) => ({
        source,
        headers: authActionHeaders,
      })),
    ];
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

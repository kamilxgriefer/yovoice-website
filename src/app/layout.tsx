import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/providers/auth-provider";
import { MotionProvider } from "@/providers/motion-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yovoice.app"),
  title: {
    default: "YO Voice — Be You",
    template: "%s | YO Voice",
  },
  description:
    "Your people. Your space. Your voice. Servers, a refreshed Home, Chats, Friends and media-first Yeels are now in internal testing.",
  applicationName: "YO Voice",
  keywords: [
    "YO Voice",
    "voice chat",
    "voice channels",
    "online communities",
    "community servers",
    "creators",
  ],
  openGraph: {
    title: "YO Voice — Be You",
    description:
      "Servers, a refreshed Home, Chats, Friends and media-first Yeels are now in YO Voice internal testing.",
    url: "https://yovoice.app",
    siteName: "YO Voice",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "YO Voice — Be You",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YO Voice — Be You",
    description:
      "Servers, a refreshed Home, Chats, Friends and media-first Yeels are now in YO Voice internal testing.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "YO Voice",
              url: "https://yovoice.app",
              logo: "https://yovoice.app/logos/yo-voice-symbol.png",
              sameAs: [
                "https://github.com/kamilxgriefer",
                "https://www.instagram.com/yovoice.app/",
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="skip-link focus-ring fixed left-4 top-4 z-[100] -translate-y-24 rounded-full px-5 py-3 text-sm font-black shadow-xl transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <AuthProvider>{children}</AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

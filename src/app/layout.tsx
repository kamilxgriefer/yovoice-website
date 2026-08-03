import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";

import { AuthProvider } from "@/providers/auth-provider";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yovoice.app"),
  title: {
    default: "YO Voice — Be You",
    template: "%s | YO Voice",
  },
  description:
    "A modern voice platform where communities connect, creators grow and conversations come alive.",
  applicationName: "YO Voice",
  keywords: [
    "YO Voice",
    "voice chat",
    "voice rooms",
    "online communities",
    "clubs",
    "creators",
  ],
  openGraph: {
    title: "YO Voice — Be You",
    description:
      "Join communities, meet creators and experience conversations that feel alive.",
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
      "Join communities, meet creators and experience conversations that feel alive.",
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
      <body className={`${geist.variable} ${spaceGrotesk.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

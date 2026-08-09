import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opening YO Voice",
  // A hand-off route with nothing to read — keep it out of the index and out
  // of the sitemap rather than letting crawlers land on a redirect screen.
  robots: { index: false, follow: false },
};

export default function AppEntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

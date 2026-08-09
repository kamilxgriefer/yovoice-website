import type { Metadata } from "next";

// Owner-only surface: never indexed, never linked from public navigation.
// Access is enforced server-side by the Cloud Functions' role checks —
// this metadata just keeps crawlers from advertising the route.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

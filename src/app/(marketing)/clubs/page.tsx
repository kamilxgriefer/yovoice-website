import { permanentRedirect } from "next/navigation";

/**
 * The Clubs marketing page is retired for good, so old links get a permanent
 * (308) redirect and search engines move the listing to /servers. Existing
 * app Club IDs are unaffected.
 */
export default function ClubsPage() {
  permanentRedirect("/servers");
}

import { ServersLanding } from "@/components/servers/servers-landing";
import { DownloadSection } from "@/components/sections/download-section";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Servers — five spaces, open to every signed-in account",
  description: "Explore the five YO Voice Server types — Friends, Community, Podcast, Family and Company — open to every signed-in account in internal testing. Podcast recording remains disabled.",
  path: "/servers",
});

export default function ServersPage() {
  return <><ServersLanding /><DownloadSection /></>;
}

import { ServersLanding } from "@/components/servers/servers-landing";
import { DownloadSection } from "@/components/sections/download-section";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Servers — five spaces in internal testing",
  description: "Explore the five-type YO Voice Servers interface in internal testing: Friends, Community, Podcast, Family and Company. Backend activation remains gated.",
  path: "/servers",
});

export default function ServersPage() {
  return <><ServersLanding /><DownloadSection /></>;
}

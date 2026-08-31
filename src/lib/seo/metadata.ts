import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  socialTitle?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  socialTitle,
}: PageMetadataOptions): Metadata {
  const shareTitle =
    socialTitle ?? (title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: shareTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}

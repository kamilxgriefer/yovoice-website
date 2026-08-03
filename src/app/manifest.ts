import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YO Voice — Be You",
    short_name: "YO Voice",
    description:
      "A modern voice platform where communities connect, creators grow and conversations come alive.",
    start_url: "/",
    display: "standalone",
    background_color: "#060511",
    theme_color: "#060511",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

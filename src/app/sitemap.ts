import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const highPriorityRoutes = ["/", "/features", "/community", "/clubs", "/download"];

const routes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/features",
  "/community",
  "/clubs",
  "/achievements",
  "/about",
  "/updates",
  "/roadmap",
  "/careers",
  "/contact",
  "/help-center",
  "/faq",
  "/safety",
  "/status",
  "/privacy",
  "/terms",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
    changeFrequency: route === "/" || route === "/updates" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/updates"
          ? 0.75
          : highPriorityRoutes.includes(route)
            ? 0.8
            : 0.5,
  }));
}

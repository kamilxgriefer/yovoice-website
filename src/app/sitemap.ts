import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const highPriorityRoutes = ["/", "/features", "/community", "/servers", "/download"];

const routes = [
  "/",
  "/features",
  "/community",
  "/servers",
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
  "/premium",
  "/download",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const refreshedRoutes = new Set(["/", "/servers", "/features", "/community", "/faq", "/help-center", "/about", "/roadmap", "/premium", "/updates"]);

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(refreshedRoutes.has(route) ? "2026-09-16T00:00:00Z" : "2026-09-05T00:00:00Z"),
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

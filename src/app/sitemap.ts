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
  "/delete-account",
  "/premium",
  "/download",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const refreshedRoutes = new Set(["/", "/servers", "/features", "/community", "/faq", "/help-center", "/about", "/roadmap", "/premium", "/updates"]);

  // Pages edited after the last site-wide refresh carry their own date, so a
  // crawler is told when the text it indexes actually changed. The legal pages
  // and the deletion page were rewritten together in the 2026-09-18 account
  // deletion round.
  const editedOn = new Map([
    ["/delete-account", "2026-09-18T00:00:00Z"],
    ["/privacy", "2026-09-18T00:00:00Z"],
    ["/terms", "2026-09-18T00:00:00Z"],
    ["/faq", "2026-09-18T00:00:00Z"],
  ]);

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(
      editedOn.get(route) ??
        (refreshedRoutes.has(route) ? "2026-09-16T00:00:00Z" : "2026-09-05T00:00:00Z"),
    ),
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

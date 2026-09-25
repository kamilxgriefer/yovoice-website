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
  // deletion round. On 2026-09-25 every page below either had its copy edited
  // or renders release data that moved to YO Voice 3.0.0 (34)
  // (src/content/current-release.ts, src/content/product-updates.ts).
  const release300Pass = "2026-09-25T00:00:00Z";
  const editedOn = new Map([
    ["/", release300Pass],
    ["/features", release300Pass],
    ["/community", release300Pass],
    ["/servers", release300Pass],
    ["/achievements", release300Pass],
    ["/about", release300Pass],
    ["/updates", release300Pass],
    ["/roadmap", release300Pass],
    ["/contact", release300Pass],
    ["/help-center", release300Pass],
    ["/faq", release300Pass],
    ["/safety", release300Pass],
    ["/privacy", release300Pass],
    ["/terms", release300Pass],
    ["/delete-account", release300Pass],
    ["/premium", release300Pass],
    ["/download", release300Pass],
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

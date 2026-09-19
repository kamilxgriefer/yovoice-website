/**
 * Public profiles the footer points at. Only the footer reads this object:
 * the JSON-LD `sameAs` list in `src/app/layout.tsx` keeps its own copy of the
 * GitHub and Instagram URLs, so change both places together.
 *
 * `linkedin` is optional on purpose: the footer used to hard-code
 * `https://www.linkedin.com/`, a placeholder that sent people to LinkedIn's
 * own front page instead of a YO Voice profile. The icon is now rendered
 * only when this field holds a real URL, so the link cannot be a placeholder
 * again — set it the day the company page exists.
 */
const social: {
  github: string;
  instagram: string;
  email: string;
  linkedin?: string;
} = {
  github: "https://github.com/kamilxgriefer",
  instagram: "https://www.instagram.com/yovoice.app/",
  email: "mailto:hello@yovoice.app",
};

export const siteConfig = {
  name: "YO Voice",
  tagline: "Be You.",
  description:
    "Your people. Your space. Your voice. Explore the Servers interface, refreshed Home, Chats, Friends and media-first Yeels in internal testing.",
  url: "https://yovoice.app",
  navigation: [
    { label: "Features", href: "/features" },
    { label: "Community", href: "/community" },
    { label: "Servers", href: "/servers" },
    { label: "Premium", href: "/premium" },
    { label: "Updates", href: "/updates" },
    { label: "Download", href: "/download" },
  ],
  social,
} as const;

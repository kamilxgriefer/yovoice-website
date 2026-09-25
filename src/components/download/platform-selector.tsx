import Link from "next/link";
import { ArrowRight, Code2, Globe2, Laptop, Monitor, Smartphone } from "lucide-react";

import { currentRelease, currentReleaseAvailability } from "@/content/current-release";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

const REPO_URL = "https://github.com/kamilxgriefer/yovoice";

const cards = [
  {
    icon: Smartphone,
    title: "Mobile",
    description: "iOS and Android apps.",
    status: `YO Voice ${currentRelease.version}. ${currentReleaseAvailability}`,
    href: `/updates#mobile-build-${currentRelease.buildNumber}-internal-testing`,
    action: `See the ${currentRelease.version} release`,
  },
  {
    icon: Monitor,
    title: "Windows",
    description: "Desktop installer not started.",
    status: "Until then, use the web app in a modern browser.",
    href: `${REPO_URL}/releases`,
    action: "Check releases",
  },
  {
    icon: Laptop,
    title: "macOS",
    description: "Desktop installer not started.",
    status: "Until then, use the web app in a modern browser.",
    href: `${REPO_URL}/releases`,
    action: "Check releases",
  },
  {
    icon: Globe2,
    title: "Web",
    description: "No install required.",
    status: "Available right now.",
    href: APP_ENTRY_PATH,
    action: "Launch web app",
  },
] as const;

/** Post-login platform grid — the single source of truth for "where can I get YO Voice" links. */
export function PlatformSelector() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, description, status, href, action }) => (
          <article key={title} className="panel flex flex-col p-6">
            <span className="icon-tile">
              <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-[var(--foreground)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-[var(--accent)]">{status}</p>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="link-accent focus-ring mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 text-sm font-semibold"
            >
              {action} <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="link-accent focus-ring inline-flex min-h-11 items-center gap-2 text-sm"
        >
          <Code2 className="size-4" aria-hidden="true" /> Source on GitHub
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Code2, Globe2, Laptop, Monitor, Smartphone } from "lucide-react";

import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

const REPO_URL = "https://github.com/kamilxgriefer/yovoice";

const cards = [
  {
    icon: Smartphone,
    title: "Mobile",
    description: "iOS and Android apps.",
    status: "Coming soon to the App Store and Google Play.",
    href: REPO_URL,
    action: "Follow progress on GitHub",
  },
  {
    icon: Monitor,
    title: "Windows",
    description: "Native desktop build.",
    status: "Installer not published yet.",
    href: `${REPO_URL}/releases`,
    action: "Check releases",
  },
  {
    icon: Laptop,
    title: "macOS",
    description: "Apple Silicon and Intel builds.",
    status: "Installer not published yet.",
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
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, description, status, href, action }) => (
          <article key={title} className="glass-panel rounded-[28px] p-7">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
              <Icon className="size-6" />
            </div>
            <h2 className="mt-6 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-white/45">{description}</p>
            <p className="mt-3 text-xs font-semibold text-fuchsia-300">{status}</p>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-fuchsia-200"
            >
              {action} <ArrowRight className="size-4" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <Code2 className="size-4" /> Source on GitHub
        </Link>
      </div>
    </div>
  );
}

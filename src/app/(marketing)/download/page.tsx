"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Code2, Globe2, Laptop, Monitor, Smartphone } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { getAppUrl } from "@/lib/auth/auth-redirect";

const REPO_URL = "https://github.com/kamilxgriefer/yovoice";

export default function DownloadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/download");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060511]">
        <p className="text-sm text-white/45">Loading…</p>
      </main>
    );
  }

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
      href: getAppUrl(),
      action: "Launch web app",
    },
  ];

  return (
    <main>
      <SiteHeader />
      <section className="min-h-screen bg-[#060511] px-5 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Signed in as {user.email}</p>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-.05em] text-white sm:text-6xl">
            Get YO Voice
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/50">
            The web app is live today. Desktop and mobile installers are on
            the way — track progress on GitHub.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="mx-auto mt-10 flex max-w-5xl justify-center">
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
          >
            <Code2 className="size-4" /> Source on GitHub
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

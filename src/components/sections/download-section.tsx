import Link from "next/link";
import { ArrowRight, Download, Globe2, Laptop, Monitor, Smartphone } from "lucide-react";

import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

const REPO_RELEASES_URL = "https://github.com/kamilxgriefer/yovoice/releases";

export function DownloadSection() {
  const platforms = [
    {
      icon: Smartphone,
      title: "Mobile",
      description: "YO Voice 1.0.0 build 20 is available to invited testers through Google Play Internal Testing and TestFlight.",
      href: "/download",
      action: "View tester access",
    },
    {
      icon: Monitor,
      title: "Windows",
      description: "Continue every conversation with a dedicated desktop application.",
      href: REPO_RELEASES_URL,
      action: "Check releases",
    },
    {
      icon: Laptop,
      title: "macOS",
      description: "Native desktop builds prepared for Apple Silicon and Intel Macs.",
      href: REPO_RELEASES_URL,
      action: "Check releases",
    },
    {
      icon: Globe2,
      title: "Web",
      description: "Open YO Voice directly from a modern browser without installation.",
      href: APP_ENTRY_PATH,
      action: "Launch web app",
    },
  ];

  return (
    <section id="download" className="relative overflow-hidden border-t border-white/[.06] bg-[#080711] py-16 sm:py-28">
      <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/[.1] blur-[170px]" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">YO Voice everywhere</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-.055em] text-white sm:mt-6 sm:text-7xl">
            Ready to find <span className="text-gradient block">your people?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-white/65 sm:mt-7 sm:text-base sm:leading-8">
            Join from your phone, continue on desktop or open the web app. Your account, friends and communities stay connected everywhere.
          </p>
        </div>

        {/* min-h on the description exists to equalize card heights when
            they sit in a row; stacked on mobile it only added blank space. */}
        <div id="mobile-downloads" className="mt-10 grid gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {platforms.map(({icon: Icon,title,description,href,action}) => (
            <article key={title} className="glass-panel group rounded-[24px] p-6 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25 sm:rounded-[30px] sm:p-7">
              <div className="flex size-13 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200"><Icon className="size-6"/></div>
              <h3 className="mt-5 text-2xl font-bold sm:mt-7">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65 sm:mt-3 sm:leading-7 md:min-h-20">{description}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition hover:text-white sm:mt-7">
                {action}<ArrowRight className="size-4 transition group-hover:translate-x-1"/>
              </Link>
            </article>
          ))}
        </div>

        <div className="glass-panel mt-8 flex flex-col items-center justify-between gap-6 rounded-[28px] p-6 sm:mt-10 sm:gap-7 sm:rounded-[36px] sm:p-10 lg:flex-row">
          <div className="flex items-start gap-5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white"><Download className="size-6"/></div>
            <div>
              <h3 className="text-2xl font-bold">One identity across every device</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">Your account, friends and communities stay connected on the web and tester builds. Public mobile and desktop installers will be linked here only when they are genuinely available.</p>
            </div>
          </div>
          <Link href={APP_ENTRY_PATH} className="premium-button min-h-13 shrink-0 px-6">
            Open YO Voice <ArrowRight className="size-4"/>
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Download,
  Globe2,
  Laptop,
  Monitor,
  Smartphone,
} from "lucide-react";

const platforms = [
  {
    icon: Smartphone,
    title: "Mobile",
    description:
      "Download through the Apple App Store or Google Play.",
    action: "View mobile options",
  },
  {
    icon: Monitor,
    title: "Windows",
    description:
      "Continue every conversation with a dedicated desktop application.",
    action: "Sign in to download",
  },
  {
    icon: Laptop,
    title: "macOS",
    description:
      "Native desktop builds prepared for Apple Silicon and Intel Macs.",
    action: "Sign in to download",
  },
  {
    icon: Globe2,
    title: "Web",
    description:
      "Open YO Voice directly from a modern browser without installation.",
    action: "Launch web app",
  },
];

export function DownloadSection() {
  return (
    <section
      id="download"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#08040f] py-28 sm:py-36"
    >
      <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/11 blur-[170px]" />
      <div className="grid-background absolute inset-0 opacity-22" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">
            YO Voice everywhere
          </p>

          <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.055em] text-white sm:text-7xl">
            Ready to find
            <span className="text-gradient block">your people?</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/50">
            Join from your phone, continue on desktop or open the web app.
            Your account, friends and communities stay connected everywhere.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;

            return (
              <article
                key={platform.title}
                className="glass-panel group rounded-[30px] p-7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25"
              >
                <div className="flex size-13 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-7 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                  {platform.title}
                </h3>

                <p className="mt-3 min-h-20 text-sm leading-7 text-white/45">
                  {platform.description}
                </p>

                <Link
                  href="/login"
                  className="focus-ring mt-7 inline-flex items-center gap-2 rounded-xl text-sm font-bold text-fuchsia-300 transition hover:text-white"
                >
                  {platform.action}
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="glass-panel mt-10 flex flex-col items-center justify-between gap-7 rounded-[36px] p-7 sm:p-10 lg:flex-row">
          <div className="flex items-start gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_0_38px_rgba(192,38,255,0.28)]">
              <Download className="size-6" />
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                One account across every device
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
                Desktop downloads will be available after signing in. Your
                account will provide the correct installer, version details,
                release notes and device management.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="focus-ring inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-fuchsia-50"
          >
            Log in to download
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

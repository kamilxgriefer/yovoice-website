import Link from "next/link";
import { Code2, Globe2, Smartphone, Store } from "lucide-react";

import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

const REPO_URL = "https://github.com/kamilxgriefer/yovoice";

const stores = [
  { icon: Store, label: "App Store", status: "Coming soon" },
  { icon: Store, label: "Google Play", status: "Coming soon" },
];

/** No login required — mobile visitors should get store info or a
 * "coming soon" status immediately, never a login wall. */
export function MobileDownload() {
  return (
    <section className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_0_40px_rgba(192,38,255,.35)]">
          <Smartphone className="size-8" />
        </div>
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.05em] text-white sm:text-4xl">
          YO Voice for mobile
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/50">
          Native iOS and Android apps are on the way. Until they&apos;re
          published, open the web app right from your phone&apos;s browser —
          no install needed.
        </p>

        <div className="mt-10 space-y-3">
          {stores.map(({ icon: Icon, label, status }) => (
            <div
              key={label}
              className="glass-panel flex items-center gap-4 rounded-2xl p-5 text-left"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/[.06] text-white/70">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{label}</p>
                <p className="mt-0.5 text-xs text-white/40">{status}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href={APP_ENTRY_PATH}
          className="premium-button focus-ring mt-8 inline-flex min-h-12 w-full px-6 text-sm"
        >
          <Globe2 className="size-4" /> Open the web app
        </Link>

        <Link
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <Code2 className="size-4" /> Track progress on GitHub
        </Link>
      </div>
    </section>
  );
}

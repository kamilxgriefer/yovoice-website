"use client";

import { useEffect } from "react";

import { getAppUrl } from "@/lib/auth/auth-redirect";

const APP_URL = getAppUrl();

/**
 * The landing-site hand-off does no visual loading of its own. The app origin
 * owns the one real startup surface, so direct entry and entry through the
 * landing page are identical and no fixed animation delays navigation.
 */
export default function AppEntryPage() {
  useEffect(() => {
    window.location.replace(APP_URL);
  }, []);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
      <noscript>
        <a href={APP_URL} className="text-sm text-fuchsia-300 underline">
          Continue to YO Voice
        </a>
      </noscript>
    </main>
  );
}

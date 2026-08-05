import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/marketing/legal-document";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description: "How YO Voice uses cookies and local storage.",
};

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "1. What cookies are",
    body: (
      <p>
        Cookies are small pieces of data a website stores in your browser.
        We also use similar browser storage technologies — localStorage and
        IndexedDB — for the same essential purposes described below.
      </p>
    ),
  },
  {
    id: "what-we-use",
    title: "2. What we actually use",
    body: (
      <>
        <p>
          YO Voice keeps this simple: we only use storage that&apos;s
          essential to make the site work.
        </p>
        <ul>
          <li>
            <strong>Authentication.</strong> Keeps you signed in between
            visits and across tabs, so you don&apos;t have to log in every
            time.
          </li>
          <li>
            <strong>Preferences.</strong> Remembers small UI choices, like
            whether you&apos;ve dismissed a banner.
          </li>
        </ul>
        <p>
          <strong>
            We do not use third-party advertising or cross-site tracking
            cookies.
          </strong>{" "}
          We don&apos;t sell data to advertisers, and there&apos;s no ad
          network on YO Voice today. If that ever changes, we&apos;ll update
          this page and ask for consent where required.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "3. Third-party storage",
    body: (
      <p>
        Our infrastructure providers (Firebase, LiveKit) may set their own
        essential storage needed to establish your session and real-time
        connections. These are functional, not advertising-related, and are
        covered by those providers&apos; own privacy practices.
      </p>
    ),
  },
  {
    id: "control",
    title: "4. Managing cookies",
    body: (
      <p>
        Most browsers let you block or delete cookies and local storage in
        their settings. Since our storage is essential to signing in and
        keeping the app working, blocking it will likely sign you out or
        prevent parts of the site from functioning correctly.
      </p>
    ),
  },
  {
    id: "changes",
    title: "5. Changes to this policy",
    body: (
      <p>
        If our use of cookies changes — for example, if we add analytics or
        advertising in the future — we&apos;ll update this page and the date
        below, and ask for consent where required by law.
      </p>
    ),
  },
  {
    id: "contact",
    title: "6. Contact us",
    body: (
      <p>
        Questions? Email{" "}
        <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a>. See
        also our <a href="/privacy">Privacy Policy</a>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookies Policy"
        description="Essential storage only — no ad tracking, nothing sold."
      />
      <LegalDocument
        updatedOn="August 5, 2026"
        intro="This policy explains the cookies and browser storage YO Voice uses on yovoice.app."
        sections={sections}
      />
    </>
  );
}

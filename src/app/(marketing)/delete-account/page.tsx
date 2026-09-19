import { Suspense } from "react";

import { DeletionRequestBanner } from "@/components/legal/deletion-request-banner";
import { LegalDocument, type LegalSection } from "@/components/marketing/legal-document";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ACCOUNT_DELETION_PATH,
  DELETION_LIMITS,
  DELETION_REQUEST_MAILTO,
  DELETION_REMOVES,
  PRIVACY_MAILBOX,
  SELF_SERVICE_DELETION_LIVE,
  SUPPORT_MAILBOX,
  deletionRetains,
  deletionRoutes,
  deletionTiming,
} from "@/content/account-deletion";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Delete your YO Voice account",
  description:
    "How to delete your YO Voice account, what deletion removes, what we keep and why, and how long it takes.",
  path: "/delete-account",
});

const sections: LegalSection[] = [
  {
    id: "how-to-ask",
    title: "1. How to delete your account",
    body: (
      <>
        <p>
          You do not need a reason and you do not have to ask twice. Pick
          whichever of these suits you.
        </p>
        <ul>
          {deletionRoutes.map((route) => (
            <li key={route.id}>
              <strong>{route.title}.</strong> {route.detail}
            </li>
          ))}
        </ul>
        <p>
          The quickest way to reach us is{" "}
          <a href={DELETION_REQUEST_MAILTO}>{PRIVACY_MAILBOX}</a>. Mail sent to{" "}
          <a href={`mailto:${SUPPORT_MAILBOX}`}>{SUPPORT_MAILBOX}</a> reaches a
          person too, so an older email you have already sent is not lost.
        </p>
      </>
    ),
  },
  {
    id: "what-is-deleted",
    title: "2. What deleting your account removes",
    body: (
      <>
        <p>Deleting your YO Voice account removes:</p>
        <ul>
          {DELETION_REMOVES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          These are the categories we remove. Section 4 lists what we keep and
          why, and section 5 lists what deleting your account does not do. If
          something you care about is not named on any of the three, ask in
          your email and we will tell you plainly whether we hold it.
        </p>
      </>
    ),
  },
  {
    id: "how-long",
    title: "3. How it is carried out, and how long it takes",
    body: (
      <>
        <p>
          <strong>{deletionTiming.headline}</strong>
        </p>
        <p>{deletionTiming.detail}</p>
        <p>
          Deletion is permanent. We cannot restore an account, its content or
          its history once it has gone, and re-registering with the same email
          address creates a new, empty account.
        </p>
      </>
    ),
  },
  {
    id: "what-we-keep",
    title: "4. What we keep, and why",
    body: (
      <>
        <p>
          Some records are not ours alone to erase — they are someone else&apos;s
          safety history, or a duty we have to keep. This is the whole list, and
          nothing is kept without a reason:
        </p>
        <ul>
          {deletionRetains.map((entry) => (
            <li key={entry.item}>
              <strong>{entry.item}</strong> {entry.reason}
            </li>
          ))}
        </ul>
        <p>
          If this list ever changes, this page and section 9 of the{" "}
          <a href="/privacy#deletion">Privacy Policy</a> change with it. They
          are written from one source so that they cannot say different things.
        </p>
      </>
    ),
  },
  {
    id: "limits",
    title: "5. What deletion does not do",
    body: (
      <ul>
        {DELETION_LIMITS.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
    ),
  },
  {
    id: "identity",
    title: "6. How we check that the account is yours",
    body: (
      <>
        <p>
          Deletion is irreversible, so we will not run it for somebody who is
          not you.{" "}
          {SELF_SERVICE_DELETION_LIVE
            ? "In the app and on this website you prove it by signing in and entering your password again immediately before confirming — an old session is not enough."
            : "On this website you prove it by signing in before sending the request."}{" "}
          For an emailed request, write from the address on the account. If the
          mail arrives from another address, or the account uses Google or
          Apple sign-in, we may ask you for something that only the account
          holder would know before we act.
        </p>
        <p>
          We never ask for your password by email, and we will never ask you to
          send a photograph of an identity document.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "7. Contact",
    body: (
      <p>
        Anything about your data, including a deletion that has not finished:{" "}
        <a href={`mailto:${PRIVACY_MAILBOX}`}>{PRIVACY_MAILBOX}</a>. The full
        detail of what we collect and how long we hold it is in the{" "}
        <a href="/privacy">Privacy Policy</a>; section 9 covers deletion. If you
        are signed in, the account page for this is{" "}
        <a href={ACCOUNT_DELETION_PATH}>{ACCOUNT_DELETION_PATH}</a>.
      </p>
    ),
  },
];

export default function DeleteAccountPage() {
  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Delete your YO Voice account"
        description="Ask us in the app, on this site or by email. This page says exactly what is removed, what is kept, why it is kept, and how long it takes."
      />
      <Suspense fallback={null}>
        <DeletionRequestBanner />
      </Suspense>
      <LegalDocument
        updatedOn="September 18, 2026"
        intro="This page is for anyone who wants their YO Voice account and data removed — you do not need to be signed in to read it, and you do not need an app to ask."
        sections={sections}
      />
    </>
  );
}

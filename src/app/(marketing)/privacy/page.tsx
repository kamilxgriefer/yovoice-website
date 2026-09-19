import { LegalDocument, type LegalSection } from "@/components/marketing/legal-document";
import { PageHero } from "@/components/marketing/page-hero";
import {
  DELETION_LIMITS,
  DELETION_REMOVES,
  PUBLIC_DELETION_PATH,
  SELF_SERVICE_DELETION_LIVE,
  SUPPORT_MAILBOX,
  deletionRetains,
  deletionRoutes,
  deletionSummary,
  deletionTiming,
} from "@/content/account-deletion";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How YO Voice collects, uses and protects your data across the web, iOS, Android and desktop apps.",
  path: "/privacy",
});

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    body: (
      <>
        <p>
          This Privacy Policy explains what information YO Voice (&quot;we&quot;,
          &quot;us&quot;) collects when you use yovoice.app and the YO Voice
          apps, why we collect it, and the choices you have. YO Voice is the
          controller of the personal data described here.
        </p>
        <p>
          The way to reach us about privacy — including any request about your
          data — is{" "}
          <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a>.
        </p>
        <p>
          This policy describes what the product actually does today. Where a
          feature does not exist yet, or exists only in part, we say so instead
          of describing it as if it were finished.
        </p>
      </>
    ),
  },
  {
    id: "what-yo-voice-is",
    title: "2. What YO Voice is today",
    body: (
      <>
        <p>
          YO Voice is a voice-first social product built around{" "}
          <strong>Servers</strong> — persistent spaces that hold live voice and
          video conversations alongside text channels. A Server is created from
          one of five templates: Friends, Community, Podcast, Family or Company.
        </p>
        <p>
          The other parts of the product are Home, Chats (direct messages),
          Friends, <strong>YO Moments</strong>, your Profile, creator tools and
          Settings. YO Moments holds two content formats: <strong>Voice
          Moments</strong>, which are audio posts, and <strong>Yeels</strong>,
          which are media-first video or photo posts.
        </p>
        <p>
          Anyone signed in can join a public Community or Podcast Server without
          an invitation and talk to people they don&apos;t know there. Friends
          and Company Servers cannot be public, and Family Servers are always
          invite-only.
        </p>
        <p>
          Earlier versions of this policy described standalone Rooms and Clubs.
          Those are retired surfaces — Servers are the only shared space in the
          product today. Some of the older names survive inside our database as
          compatibility contracts, but they are not separate products and are
          not described here as such.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "3. Information we collect",
    body: (
      <>
        <p>
          <strong>Account and profile.</strong> An email address, and a password
          held by Firebase Authentication — we never see or store your plaintext
          password. You can instead sign in with Google or with Apple. Google
          returns your name and email address, and a link to your Google profile
          photo, which Firebase Authentication stores on your sign-in record.
          Apple returns only your name and an email address — which may be a
          private relay address if you choose that — and no photo. Neither
          provider&apos;s photo becomes your YO Voice profile picture; you upload
          that yourself. Verifying your email address is a real gate, not a
          banner: our servers check it before letting an account create content.
          Two-factor authentication using an authenticator app is optional; the
          enrollment secret is discarded once the first code is accepted.
        </p>
        <p>
          Your profile holds a display name and a username. You choose the
          username when you register with an email address; for a Google or
          Apple sign-in we derive a starting one from the name or email address
          that provider gives us. The fields you may add if you want them are a
          bio, status line, country, native, spoken and learning languages, a
          website link and a profile photo. Country and languages are text you
          type about yourself — they are not read from your device. We also keep
          counters produced by using the product:
          messages sent, voice and hosting minutes, active days, reactions,
          Moments posted and the achievement titles you have unlocked.
        </p>
        <p>
          If you turn on the Creator audience, we ask for your date of birth to
          confirm you are an adult. That date is used for the calculation and is
          never written to our database, to a log or to any public profile. All
          that is kept is the fact that the check passed, when it passed, and
          that the method was a self-declared birth date.
        </p>
        <p>
          <strong>Content you create.</strong> Depending on what you use, this
          can include:
        </p>
        <ul>
          <li>
            <strong>Photos</strong> — profile artwork, Server and session
            covers, Family memories, images in a Yeel, and photos you attach to
            a direct message (JPEG, PNG or WebP).
          </li>
          <li>
            <strong>Videos</strong> — Yeel videos, Family memories and videos
            you attach to a direct message (MP4, QuickTime or WebM).
          </li>
          <li>
            <strong>Voice and sound recordings</strong> — Voice Moments, voice
            replies, voice comments on a Yeel, and voice notes in a direct
            message.
          </li>
          <li>
            <strong>Music and other audio files</strong> — when you compose a
            Yeel you can pick an audio file from your device to use as backing
            audio. That file is uploaded and stored with the Yeel.
          </li>
          <li>
            <strong>Files and documents</strong> — on a Company Server, members
            can upload files to a channel: PDFs, plain-text files and images.
          </li>
          <li>
            <strong>Other text you write</strong> — your bio and status line,
            the name and description of a Server you create, Yeel captions, and
            the reason and any note you add when you report content.
          </li>
        </ul>
        <p>
          <strong>Messages.</strong> We store the messages you send: direct
          messages, including reactions, edits and read state; messages in
          Server and channel conversations; session chat; and comments on Voice
          Moments and Yeels. Direct messages are written by our servers rather
          than directly by the app.
        </p>
        <p>
          <strong>Live voice, video and screen share.</strong> When you join a
          live session, your device streams audio, video, screen share and
          related data through our real-time infrastructure to the other
          participants. <strong>We do not record or store those live
          streams.</strong> The access token our server issues never carries a
          recording permission, and no recording service is deployed. To route
          the session, your account identifier travels as the participant
          identity, together with your display name and your role in that
          session.
        </p>
        <p>
          <strong>Activity and viewing history.</strong> Friends, follows,
          blocks and mutes, Server memberships, likes, achievements, presence
          and last-seen, participation in live sessions, hand raises, event
          responses, Family check-ins and poll votes. We also keep a record of
          the calls you place or receive in Chats — who was on the call, when it
          started and ended, and whether it was answered or missed.{" "}
          <strong>We do not record the call itself.</strong> And we record which
          Voice Moments and Yeels your account has played, so the feed can avoid
          showing you the same thing again. That viewing history is readable
          only by your own account.
        </p>
        <p>
          Search is handled differently: what you type into GIF or profile
          search is not stored against your identity. GIF results are cached
          under a hash of the search text with no account identifier attached,
          and rate-limit counters are kept under a hash of your account
          identifier.
        </p>
        <p>
          <strong>Device and push identifiers.</strong> Once you allow
          notifications, we store one record per device holding a push
          notification token, the platform it belongs to and a timestamp.
          Notification text is built from the name of the person who acted plus,
          where relevant, the name of the space or channel — the body of your
          message is never put into a push notification. The apps also run
          Firebase App Check, which produces a device attestation and a Firebase
          installation identifier: on Android the attestation comes from Google
          Play Integrity, and on iPhone, iPad and Mac from Apple&apos;s App
          Attest with a DeviceCheck fallback. On the web app this check is not
          enabled.
        </p>
        <p>
          <strong>Crash logs and diagnostics.</strong> The app uses{" "}
          <strong>Firebase Crashlytics</strong>. In every released build, an
          uncaught error sends a stack trace together with your device model and
          operating system version to Google so we can find and fix it.{" "}
          <strong>There is currently no in-app switch to turn crash reporting
          off.</strong> Crashlytics does not run on the web app or in
          development builds. Separately, when a server call is refused, the app
          reports that refusal as a non-fatal diagnostic event, and our servers
          log identifiers such as a conversation, message, sender or recipient
          id together with the outcome — never the contents of a message.
        </p>
        <p>
          <strong>What we do not collect.</strong> YO Voice contains no
          advertising and no ads SDK, and does not use the Android advertising
          identifier — the permission needed to read it is not in the app. There
          is no analytics SDK of any kind. We do not collect your location:
          the app requests no location permission and contains no location
          library, and the one feature that could plausibly carry coordinates —
          a Family check-in — is refused by our servers if it contains any. We
          do not collect your contacts, phone number, SMS, calendar, health or
          fitness data.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "4. Why we use your information",
    body: (
      <ul>
        <li>To create and operate your account, sign you in, and confirm your email address before an account can post.</li>
        <li>To run the product itself: Servers, channels, live voice and video, chats and YO Moments.</li>
        <li>To send transactional email — address verification and password resets.</li>
        <li>To deliver the push notifications you have opted into, by type.</li>
        <li>To rank the YO Moments feed, so something you have already watched is not shown to you again.</li>
        <li>To detect and prevent abuse: rate limits, reports, blocks and mutes, and moderation of content that breaks our Terms.</li>
        <li>To keep the service reliable and to debug failures, using crash logs and diagnostics.</li>
      </ul>
    ),
  },
  {
    id: "who-processes-it",
    title: "5. Who processes your data",
    body: (
      <>
        <p>
          <strong>We do not sell your personal information, we do not show
          advertising, and we run no analytics SDK.</strong> We share data only
          with the providers that operate YO Voice for us, acting on our
          instructions:
        </p>
        <ul>
          <li>
            <strong>Google Firebase</strong> — authentication, database
            (Firestore), file storage, backend functions, push delivery (Cloud
            Messaging), crash reporting (Crashlytics) and app attestation (App
            Check).
          </li>
          <li>
            <strong>LiveKit Cloud</strong> — real-time infrastructure carrying
            live audio, video, screen share and session data. It receives your
            account identifier as the participant identity, your display name,
            and your role in the session. It also sends signed session events
            back to us so voice and hosting minutes can be credited.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional email. It
            receives the recipient address and the verification or password-reset
            link.
          </li>
          <li>
            <strong>Vercel</strong> — hosting for yovoice.app, which means
            website request metadata.
          </li>
          <li>
            <strong>Apple</strong> — Sign in with Apple, if you use it, and the
            device-attestation check on iPhone, iPad and Mac.
          </li>
        </ul>
        <p>
          GIFs offered in the app today are first-party animations that ship
          inside the app itself — searching for one never sends your search text
          to an outside GIF service. Older messages may still contain a GIF
          hosted by an external provider; opening such a message loads the image
          from that provider, which sees your IP address. You can stop that by
          turning GIF auto-loading off in settings.
        </p>
        <p>
          We may also disclose information where we are required to by law, or
          where we believe it is necessary to protect the safety of our
          community.
        </p>
      </>
    ),
  },
  {
    id: "what-others-see",
    title: "6. What other people can see",
    body: (
      <>
        <p>
          Other members see what you choose to make visible: your profile, the
          messages you post in the spaces you join, and your presence status.
          Anyone who can open a public Community or Podcast Server can see what
          is posted in it.
        </p>
        <p>
          <strong>Optional public website showcase.</strong> If you explicitly
          opt in from YO Voice settings, we may publish your display name,
          profile type and a short &quot;Active recently&quot; label on
          yovoice.app. We do not publish your user ID, username, last-seen time,
          email, avatar URL, staff role or social graph. Separately, the owner
          of an eligible public community space can opt that space into showing
          its name and current member count; private, invite-only and Family
          spaces are never eligible. It is off by default, and it can be
          switched off again from settings, which records the withdrawal — we
          keep a small record that says the setting is off, with the time it
          changed, and it is deleted when the account itself is deleted. While
          the showcase is on, it is visible to the public internet, including
          signed-out visitors and people whose accounts you have blocked.
        </p>
        <p>
          <strong>Staff and moderation.</strong> Inside YO Voice, a small number
          of people holding a moderator or administrator role can open a report
          and the content it points at, and can see account state — such as
          whether an account is banned — in order to act on it. Those actions
          are written to an internal audit log.
        </p>
      </>
    ),
  },
  {
    id: "premium-payments",
    title: "7. Premium and payments",
    body: (
      <p>
        <strong>Premium is not available for purchase yet</strong> — not in the
        apps and not on the website. There is no store billing on either
        platform and no checkout is deployed, so YO Voice collects and processes{" "}
        <strong>no payment data at all</strong>: no card number, no bank or
        payment-method details, no billing address. If that changes, we will
        update this policy
        before any payment can be taken, and describe exactly what the payment
        provider receives.
      </p>
    ),
  },
  {
    id: "retention",
    title: "8. How long we keep your data",
    body: (
      <>
        <p>
          Your account information, profile, messages, uploaded media and
          activity history are{" "}
          <strong>kept for as long as your account exists</strong>. We do not
          currently enforce a fixed deletion period for them, and we would
          rather say that plainly than quote a period we do not apply.
        </p>
        <p>
          One exception. The record of which Yeels you have watched carries a
          built-in expiry, and our database deletes each row automatically about
          90 days after that view. The equivalent record for Voice Moments has
          no expiry and is kept while your account exists.
        </p>
        <p>
          Crash logs and diagnostics sit in Firebase Crashlytics and Google
          Cloud Logging and are kept under those services&apos; own retention
          settings.
        </p>
        <p>
          What happens when an account is deleted — what goes, what we keep and
          why — is described in the next section and on our{" "}
          <a href={PUBLIC_DELETION_PATH}>account deletion page</a>.
        </p>
      </>
    ),
  },
  {
    id: "deletion",
    title: "9. Deleting your account or your data",
    body: (
      <>
        <p>
          {deletionSummary} The same lists, written for someone who is not
          signed in, are on our{" "}
          <a href={PUBLIC_DELETION_PATH}>account deletion page</a>.
        </p>
        <p>
          <strong>How to ask.</strong>
        </p>
        <ul>
          {deletionRoutes.map((route) => (
            <li key={route.id}>
              <strong>{route.title}.</strong> {route.detail}
            </li>
          ))}
        </ul>
        <p>
          Mail sent to{" "}
          <a href={`mailto:${SUPPORT_MAILBOX}`}>{SUPPORT_MAILBOX}</a> reaches a
          person too, so a request you have already sent there is not lost. We
          may need to verify that the account is yours before we act, and
          deletion is permanent — we cannot restore an account or its content
          afterwards.
        </p>
        <p>
          <strong>{deletionTiming.headline}</strong> {deletionTiming.detail}
        </p>
        {!SELF_SERVICE_DELETION_LIVE ? (
          <p>
            We are not going to promise you an erasure that our systems do not
            currently perform. The one automatic step is this: when a sign-in
            account is deleted, our servers remove the public profile, the
            presence record, the public badges, the member-directory entry and
            the website-showcase consent, and clear premium messaging-privacy
            state. Everything else on the list below is done by a person, which
            is why a request can take days rather than minutes.
          </p>
        ) : null}
        <p>
          <strong>What deletion removes.</strong>
        </p>
        <ul>
          {DELETION_REMOVES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          <strong>What we keep, and why.</strong> Some records are not ours
          alone to erase — they are another person&apos;s safety history, or an
          obligation we carry. This is the whole list, and each entry says why
          it is kept:
        </p>
        <ul>
          {deletionRetains.map((entry) => (
            <li key={entry.item}>
              <strong>{entry.item}</strong> {entry.reason}
            </li>
          ))}
        </ul>
        <p>
          <strong>What deletion does not do.</strong>
        </p>
        <ul>
          {DELETION_LIMITS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "10. Your rights and choices",
    body: (
      <>
        <p>Inside the product you can, at any time:</p>
        <ul>
          <li>Edit your profile information from your account settings.</li>
          <li>
            Set your profile visibility to public, friends only or private.
            Choosing anything other than public also withdraws the public
            website showcase consent described in section 6, in the same step.
          </li>
          <li>
            Set your availability — available, be right back, do not disturb,
            or invisible. Invisible is published to everyone else as plain
            offline, so it cannot be told apart from being signed out.
          </li>
          <li>Change or disable individual notification types.</li>
          <li>Choose who may send you a direct message — everyone, people you follow, friends, or nobody.</li>
          <li>Block or mute another member.</li>
          <li>Turn the optional public website showcase on or off.</li>
          <li>
            Turn GIF auto-loading off, so a GIF hosted outside the app is not
            fetched from its provider until you tap it.
          </li>
          <li>
            Review the device you are signed in on, and sign out everywhere,
            from Devices &amp; sessions.
          </li>
          <li>Turn on two-factor authentication with an authenticator app.</li>
          <li>Report content or behaviour to us.</li>
          {SELF_SERVICE_DELETION_LIVE ? (
            <li>
              Delete your account, and the data listed in section 9, from
              Settings in the app or from{" "}
              <a href="/account/delete">your account on this website</a>.
            </li>
          ) : null}
        </ul>
        <p>
          Under the GDPR you also have the right to access your personal data,
          to have it corrected or erased, to restrict or object to how we use
          it, and to data portability. To exercise any of these, email{" "}
          <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a>. We may
          need to verify your identity first.{" "}
          {SELF_SERVICE_DELETION_LIVE
            ? "Erasure you can carry out yourself, from the app or from your account on this website; section 9 sets out what it removes and the short list we keep. The other requests are handled by hand — we have no automated export tool."
            : "These requests are handled by hand: as noted above, we have no automated export or erasure pipeline, and the limits described in section 9 apply to erasure."}
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "11. Children's privacy",
    body: (
      <p>
        You must be at least 13 to use YO Voice, or older where your country
        requires it — see our <a href="/terms">Terms of Service</a>. YO Voice is
        not directed at children under 13, and we don&apos;t knowingly collect
        personal information from children under 13. If you believe a child has
        created an account, contact us at{" "}
        <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a> and
        we&apos;ll remove it.
      </p>
    ),
  },
  {
    id: "security",
    title: "12. How we protect your data",
    body: (
      <>
        <p>
          Data is encrypted in transit. The Android app refuses cleartext
          traffic outright, and the app connects only to the exact production
          address of our real-time infrastructure, with no credentials, custom
          port, path or query accepted in its place. Live audio and video travel
          over WebRTC&apos;s own encrypted transport.{" "}
          <strong>This is not end-to-end encryption</strong> — our
          infrastructure carries the media, and we do not claim otherwise.
        </p>
        <p>
          Access to your data in our database is governed by server-enforced
          security rules scoped to your account: your private records are
          readable only by you, uploads must match a server-issued reservation,
          and the fields a client may write are fixed by an explicit allowlist
          rather than left open. Sensitive operations run through bounded server
          endpoints with validation and rate limiting.
        </p>
        <p>
          No system is perfectly secure, but we design defaults conservatively
          and review access rules as the product changes.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "13. Changes to this policy",
    body: (
      <p>
        We&apos;ll update this page when our practices change and update the
        &quot;last updated&quot; date above. For material changes, we&apos;ll
        make a reasonable effort to notify you by email or in-app notice.
      </p>
    ),
  },
  {
    id: "contact",
    title: "14. Contact us",
    body: (
      <p>
        Questions about this policy or your data? Email{" "}
        <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a>. See
        also our{" "}
        <a href="/cookies">Cookies Policy</a> and{" "}
        <a href="/terms">Terms of Service</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="What we collect, why we collect it, and how you stay in control."
      />
      <LegalDocument
        updatedOn="September 18, 2026"
        intro="This policy covers yovoice.app and the YO Voice apps for iOS, Android, desktop and web."
        sections={sections}
      />
    </>
  );
}

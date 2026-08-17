import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/marketing/legal-document";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How YO Voice collects, uses and protects your data across the web, iOS, Android and desktop apps.",
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview",
    body: (
      <>
        <p>
          This Privacy Policy explains what information YO Voice (&quot;we&quot;,
          &quot;us&quot;) collects when you use yovoice.app and the YO Voice
          apps, why we collect it, and the choices you have. YO Voice is a
          voice-first social platform: rooms, clubs, friends, messaging and
          achievements built around real-time conversation.
        </p>
        <p>
          By creating an account or using YO Voice, you agree to the
          collection and use of information as described here. If you don&apos;t
          agree, please don&apos;t use the service.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "2. Information we collect",
    body: (
      <>
        <p>
          <strong>Account information.</strong> Email address, display name,
          password (stored as a salted hash — we never see or store your
          plaintext password), and optionally a profile photo.
        </p>
        <p>
          <strong>Profile and activity.</strong> Friends, follows, club
          memberships, messages you send in chats and clubs, voice moments
          you record, achievements you unlock, and your presence status
          (online / in a room).
        </p>
        <p>
          <strong>Optional public website showcase.</strong> If you explicitly
          opt in from YO Voice settings, we may publish your display name,
          profile type and a short &quot;Active recently&quot; label on yovoice.app.
          We do not publish your user ID, username, last-seen time, email,
          avatar URL, staff role or social graph. Club owners can separately
          opt a public Club into showing its name and current member count.
          Private, invite-only and Family spaces are never included.
        </p>
        <p>
          <strong>Voice and room data.</strong> When you join a voice room,
          your device streams audio through our real-time voice
          infrastructure (LiveKit) to other participants. We do not record or
          store the audio of live rooms. Voice moments you explicitly choose
          to record and post are stored so they can be played back.
        </p>
        <p>
          <strong>Device and notification data.</strong> A push-notification
          token for your device so we can deliver alerts (friend requests,
          mentions, club activity). You can disable specific notification
          types at any time in your notification preferences.
        </p>
        <p>
          <strong>Technical data.</strong> Basic request metadata
          (timestamps, error logs, approximate service performance) collected
          by our hosting and backend providers to keep the service reliable
          and secure.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "3. How we use your information",
    body: (
      <ul>
        <li>To create and operate your account, and authenticate you.</li>
        <li>To connect you with friends, clubs and rooms you choose to join.</li>
        <li>To send transactional email — verification, password reset, security alerts.</li>
        <li>To send push notifications you&apos;ve opted into.</li>
        <li>To detect, investigate and prevent abuse, spam and violations of our Terms.</li>
        <li>To keep the service secure, debug issues and improve reliability.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "4. Who we share information with",
    body: (
      <>
        <p>
          We don&apos;t sell your personal information. We share data only
          with the infrastructure providers that operate YO Voice on our
          behalf, under their own security and data-processing terms:
        </p>
        <ul>
          <li>
            <strong>Google Firebase</strong> — authentication, database
            (Firestore), file storage and backend functions.
          </li>
          <li>
            <strong>LiveKit</strong> — real-time audio infrastructure for
            voice rooms.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional email
            (verification links, password resets).
          </li>
          <li>
            <strong>Vercel</strong> — hosting for yovoice.app.
          </li>
        </ul>
        <p>
          Other members can see what you choose to make visible: your
          profile, public messages in clubs and rooms you join, and your
          presence status. We may also disclose information if required by
          law or to protect the safety of our community.
        </p>
        <p>
          The optional website showcase is visible to the public internet,
          including signed-out visitors and people whose accounts you have
          blocked. It is off by default and can be disabled from settings.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "5. How we protect your data",
    body: (
      <p>
        Data is encrypted in transit (TLS). Access to your data in our
        database is governed by server-enforced security rules scoped to
        your account. We also use bounded server endpoints, validation and
        abuse monitoring for sensitive operations. No system is perfectly
        secure, but we design defaults conservatively and review access rules
        as the product changes.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "6. Your rights and choices",
    body: (
      <>
        <p>You can, at any time:</p>
        <ul>
          <li>Update your profile information from your account settings.</li>
          <li>Change or disable individual notification types.</li>
          <li>Enable or disable the optional public website showcase.</li>
          <li>Request a copy of the personal data we hold about you.</li>
          <li>Request deletion of your account and associated data.</li>
        </ul>
        <p>
          To request an export or deletion, email{" "}
          <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a>. We
          will respond within a reasonable time and may need to verify your
          identity first.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "7. Data retention",
    body: (
      <p>
        We keep account and content data for as long as your account is
        active. If you delete your account, we remove or anonymize your
        personal data within a reasonable period, except where we&apos;re
        required to retain it for legal, security or fraud-prevention
        reasons.
      </p>
    ),
  },
  {
    id: "children",
    title: "8. Children's privacy",
    body: (
      <p>
        YO Voice is not directed at children under 13, and we don&apos;t
        knowingly collect personal information from children under 13. If
        you believe a child has created an account, contact us at{" "}
        <a href="mailto:privacy@yovoice.app">privacy@yovoice.app</a> and
        we&apos;ll remove it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to this policy",
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
    title: "10. Contact us",
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
        updatedOn="August 17, 2026"
        intro="This policy covers yovoice.app and the YO Voice apps for iOS, Android, desktop and web."
        sections={sections}
      />
    </>
  );
}

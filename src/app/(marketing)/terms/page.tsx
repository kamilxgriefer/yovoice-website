import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/marketing/legal-document";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of YO Voice.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: (
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and
        use of YO Voice — the website at yovoice.app and the YO Voice apps.
        By creating an account or using the service, you agree to these
        Terms. If you don&apos;t agree, don&apos;t use YO Voice.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility and accounts",
    body: (
      <>
        <p>
          You must be at least 13 years old to use YO Voice (or the minimum
          age required in your country to consent to use of online
          services). You&apos;re responsible for keeping your account
          credentials secure and for all activity under your account.
        </p>
        <p>
          You agree to provide accurate registration information and to keep
          it up to date.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable use",
    body: (
      <>
        <p>You agree not to use YO Voice to:</p>
        <ul>
          <li>Harass, threaten, bully or abuse other members.</li>
          <li>Impersonate another person or misrepresent your affiliation.</li>
          <li>Post or share illegal content, or content that infringes someone else&apos;s rights.</li>
          <li>Spam, or use the platform for unauthorized advertising.</li>
          <li>Attempt to disrupt, reverse engineer or gain unauthorized access to the service.</li>
          <li>Record or redistribute a live voice room without the consent of participants.</li>
        </ul>
        <p>
          Room hosts and club owners have moderation tools (mute, remove,
          manage access) and are expected to keep their spaces within these
          Terms and our{" "}
          <a href="/safety">Community Safety guidelines</a>.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "4. Your content",
    body: (
      <>
        <p>
          You retain ownership of the messages, voice moments, club content
          and profile information you post (&quot;your content&quot;). By
          posting it on YO Voice, you grant us a worldwide, non-exclusive
          license to host, store, transmit and display it as needed to
          operate the service — for example, delivering your messages to
          the people you send them to.
        </p>
        <p>
          You&apos;re responsible for your content and confirm you have the
          rights necessary to post it.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "5. Moderation and enforcement",
    body: (
      <p>
        We may remove content, restrict features, or suspend or terminate
        accounts that violate these Terms or our{" "}
        <a href="/safety">safety guidelines</a>, at our discretion and
        without prior notice where we believe it&apos;s necessary to protect
        the community.
      </p>
    ),
  },
  {
    id: "availability",
    title: "6. Service availability",
    body: (
      <p>
        YO Voice is under active development. Features, including desktop
        and mobile installers, may change, be added or be removed as the
        product evolves. We&apos;ll do our best to keep the service reliable,
        but we don&apos;t guarantee uninterrupted availability. Current
        operational status is published on our{" "}
        <a href="/status">Status page</a>.
      </p>
    ),
  },
  {
    id: "termination",
    title: "7. Termination",
    body: (
      <p>
        You can delete your account at any time from your account settings.
        We may suspend or terminate your access if you violate these Terms.
        Sections that by their nature should survive termination (like
        content licenses already granted, and limitations of liability) will
        continue to apply.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "8. Disclaimers and limitation of liability",
    body: (
      <p>
        YO Voice is provided &quot;as is&quot; without warranties of any
        kind, express or implied. To the maximum extent permitted by law, we
        are not liable for indirect, incidental or consequential damages
        arising from your use of the service. Nothing in these Terms limits
        liability that cannot be limited under applicable law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to these terms",
    body: (
      <p>
        We may update these Terms as the product evolves. We&apos;ll update
        the date below and, for material changes, make a reasonable effort
        to notify you. Continuing to use YO Voice after changes take effect
        means you accept the updated Terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "10. Contact us",
    body: (
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:hello@yovoice.app">hello@yovoice.app</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="The rules that keep YO Voice fair, safe and usable for everyone."
      />
      <LegalDocument
        updatedOn="August 5, 2026"
        intro="These Terms apply to yovoice.app and the YO Voice apps for iOS, Android, desktop and web."
        sections={sections}
      />
    </>
  );
}

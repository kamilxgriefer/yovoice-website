import { Briefcase, HelpCircle, Mail, ShieldAlert } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with the YO Voice team.",
  path: "/contact",
});

const channels = [
  {
    icon: HelpCircle,
    title: "General & support",
    description: "Questions, feedback or something not working right.",
    // The support address the app shows in Settings, Contact support.
    email: "support@yovoice.app",
  },
  {
    icon: ShieldAlert,
    title: "Safety & abuse reports",
    description: "Report harassment, abuse or a safety concern.",
    email: "safety@yovoice.app",
  },
  {
    icon: Briefcase,
    title: "Business & press",
    description: "Partnerships, press inquiries and business questions.",
    email: "press@yovoice.app",
  },
  {
    icon: Mail,
    title: "Privacy & data",
    description: "Data access, export or deletion requests.",
    email: "privacy@yovoice.app",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        description="Pick the right inbox and we'll get back to you as soon as we can — a real person reads every message."
      />
      <section className="px-5 pb-28 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">
          {channels.map(({ icon: Icon, title, description, email }) => (
            <article key={title} className="panel flex flex-col p-7">
              <div className="icon-tile">
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-[var(--foreground)]">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              <a
                href={`mailto:${email}`}
                className="link-accent focus-ring mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold"
              >
                {email}
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { Briefcase, HelpCircle, Mail, ShieldAlert } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the YO Voice team.",
};

const channels = [
  {
    icon: HelpCircle,
    title: "General & support",
    description: "Questions, feedback or something not working right.",
    email: "hello@yovoice.app",
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
            <article key={title} className="glass-panel flex flex-col rounded-[28px] p-7">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-6 text-lg font-bold">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-white/50">{description}</p>
              <a
                href={`mailto:${email}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition hover:text-white"
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

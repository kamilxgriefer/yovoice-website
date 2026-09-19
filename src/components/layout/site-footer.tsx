import Link from "next/link";
import { BriefcaseBusiness, Camera, Code2, Mail, type LucideIcon } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { siteConfig } from "@/config/site";

const columns = [
  { title: "Product", links: [["Features","/features"],["Community","/community"],["Servers","/servers"],["Achievements","/achievements"]] },
  { title: "Company", links: [["About","/about"],["Updates","/updates"],["Roadmap","/roadmap"],["Careers","/careers"],["Contact","/contact"]] },
  { title: "Support", links: [["Help Center","/help-center"],["Safety","/safety"],["Status","/status"],["FAQ","/faq"]] },
  { title: "Legal", links: [["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"],["Delete account","/delete-account"]] },
];

/**
 * LinkedIn is conditional: `siteConfig.social.linkedin` is unset while the
 * company page does not exist, and an icon that led to LinkedIn's front page
 * was a dead end dressed as a profile. Every other destination is a real
 * account and always renders.
 */
const socialLinks: { Icon: LucideIcon; href: string; label: string }[] = [
  { Icon: Code2, href: siteConfig.social.github, label: "GitHub" },
  ...(siteConfig.social.linkedin
    ? [{ Icon: BriefcaseBusiness, href: siteConfig.social.linkedin, label: "LinkedIn" }]
    : []),
  { Icon: Camera, href: siteConfig.social.instagram, label: "Instagram" },
  { Icon: Mail, href: siteConfig.social.email, label: "Email" },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_1.5fr] lg:gap-16 lg:px-12">
        <div className="max-w-sm">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">Your people. Your space. Your voice. A place for the conversations, communities and little moments that bring us closer.</p>
          <p className="eyebrow mt-5">Voice first. Community always.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold text-white">{column.title}</h2>
              <ul className="mt-2">
                {column.links.map(([label,href]) => <li key={label}><Link href={href} className="link-muted inline-flex min-h-11 items-center text-sm transition">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* One line: lockup, copyright, profiles. */}
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <BrandLockup className="w-fit" />
            <p className="text-sm text-[var(--text-tertiary)]">© {new Date().getFullYear()} YO Voice. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ Icon, href, label }) => {
              const opensNewTab = href.startsWith("http");
              return (
                <a key={label} href={href} target={opensNewTab ? "_blank" : undefined} rel={opensNewTab ? "noreferrer" : undefined} className="focus-ring flex size-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] link-muted transition hover:border-[var(--border-strong)]" aria-label={`${label}${opensNewTab ? " (opens in a new tab)" : ""}`}>
                  <Icon className="size-4" aria-hidden="true"/>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

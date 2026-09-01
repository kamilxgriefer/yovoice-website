import Link from "next/link";
import { BriefcaseBusiness, Camera, Code2, Mail } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";

const columns = [
  { title: "Product", links: [["Features","/features"],["Community","/community"],["Clubs","/clubs"],["Achievements","/achievements"]] },
  { title: "Company", links: [["About","/about"],["Updates","/updates"],["Roadmap","/roadmap"],["Careers","/careers"],["Contact","/contact"]] },
  { title: "Support", links: [["Help Center","/help-center"],["Safety","/safety"],["Status","/status"],["FAQ","/faq"]] },
  { title: "Legal", links: [["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"]] },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-white/[.06] bg-[#080711]">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:px-12">
        <div className="max-w-sm">
          <BrandLockup className="w-fit" />
          <p className="mt-6 text-sm leading-7 text-white/65">Where conversations become communities. Built for creators, friends and people looking for something real.</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-white/55">Voice first. Community always.</p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold">{column.title}</h2>
              <ul className="mt-3">
                {column.links.map(([label,href]) => <li key={label}><Link href={href} className="inline-flex min-h-11 items-center text-sm text-white/65 transition hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[.06]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p className="text-xs text-white/55">© {new Date().getFullYear()} YO Voice. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[
              [Code2,"https://github.com/kamilxgriefer","GitHub"],
              [BriefcaseBusiness,"https://www.linkedin.com/","LinkedIn"],
              [Camera,"https://www.instagram.com/yovoice.app/","Instagram"],
              [Mail,"mailto:hello@yovoice.app","Email"],
            ].map(([Icon,href,label]) => {
              const Comp = Icon as typeof Code2;
              const opensNewTab = String(href).startsWith("http");
              return (
                <a key={String(label)} href={String(href)} target={opensNewTab ? "_blank" : undefined} rel={opensNewTab ? "noreferrer" : undefined} className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/60 transition hover:border-fuchsia-300/30 hover:bg-fuchsia-400/10 hover:text-white" aria-label={`${String(label)}${opensNewTab ? " (opens in a new tab)" : ""}`}>
                  <Comp className="size-4" aria-hidden="true"/>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

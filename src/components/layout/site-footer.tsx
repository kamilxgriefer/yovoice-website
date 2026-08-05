import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Camera, Code2, Mail } from "lucide-react";

const columns = [
  { title: "Product", links: [["Features","/features"],["Community","/community"],["Clubs","/clubs"],["Achievements","/achievements"]] },
  { title: "Company", links: [["About","/about"],["Roadmap","/roadmap"],["Careers","/careers"],["Contact","/contact"]] },
  { title: "Support", links: [["Help Center","/help-center"],["Safety","/safety"],["Status","/status"],["FAQ","/faq"]] },
  { title: "Legal", links: [["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"]] },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-white/[.06] bg-[#05040d]">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:px-12">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-300/25 bg-black shadow-[0_0_28px_rgba(192,38,255,.25)]">
              <Image src="/logos/yovoice-logo.png" alt="YO Voice logo" fill sizes="48px" className="object-contain p-1.5"/>
            </span>
            <span className="leading-none">
              <span className="block text-lg font-extrabold uppercase tracking-[.02em]">YO Voice</span>
              <span className="text-gradient block font-[family-name:var(--font-script)] text-xl leading-tight">be you</span>
            </span>
          </Link>
          <p className="mt-6 text-sm leading-7 text-white/45">Where conversations become communities. Built for creators, friends and people looking for something real.</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-white/25">Voice first. Community always.</p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map(([label,href]) => <li key={label}><Link href={href} className="text-sm text-white/42 transition hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[.06]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p className="text-xs text-white/35">© {new Date().getFullYear()} YO Voice. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[
              [Code2,"https://github.com/kamilxgriefer","GitHub"],
              [BriefcaseBusiness,"https://www.linkedin.com/","LinkedIn"],
              [Camera,"https://www.instagram.com/","Instagram"],
              [Mail,"mailto:hello@yovoice.app","Email"],
            ].map(([Icon,href,label]) => {
              const Comp = Icon as typeof Code2;
              return (
                <a key={String(label)} href={String(href)} target={String(href).startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/60 transition hover:border-fuchsia-300/30 hover:bg-fuchsia-400/10 hover:text-white" aria-label={String(label)}>
                  <Comp className="size-4"/>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

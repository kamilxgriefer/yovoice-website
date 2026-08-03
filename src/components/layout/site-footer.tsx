import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Experience", href: "#experience" },
      { label: "Community", href: "#community" },
      { label: "Clubs", href: "#clubs" },
      { label: "Download", href: "#download" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Status", href: "/status" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07030d]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.35fr] lg:px-12">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative flex size-12 overflow-hidden rounded-2xl border border-fuchsia-300/20 bg-black">
              <Image
                src="/logos/yovoice-logo.png"
                alt="YO Voice logo"
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </span>

            <span>
              <span className="block font-[family-name:var(--font-display)] text-lg font-bold text-white">
                YO Voice
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.34em] text-fuchsia-300">
                Be You
              </span>
            </span>
          </Link>

          <p className="mt-6 text-sm leading-7 text-white/45">
            Where conversations become communities. Built for creators,
            friends and people looking for something real.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/25">
            Voice first. Community always.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-white">
                {section.title}
              </h2>

              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-5 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} YO Voice. All rights reserved.</p>
          <p>Designed and built by Kamil Jaguszewski.</p>
        </div>
      </div>
    </footer>
  );
}

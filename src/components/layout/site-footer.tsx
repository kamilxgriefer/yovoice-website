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
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.2fr_1fr] lg:px-10">
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

          <p className="mt-5 text-sm leading-7 text-white/45">
            A modern voice platform created for communities, creators and
            meaningful conversations.
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/25">
            Your voice. Your community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-white">{section.title}</h2>

              <ul className="mt-4 space-y-3">
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} YO Voice. All rights reserved.</p>
          <p>Designed and built by Kamil Jaguszewski.</p>
        </div>
      </div>
    </footer>
  );
}

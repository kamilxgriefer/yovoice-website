import Link from "next/link";
import { Crown, Mic2, Radio, Users } from "lucide-react";

const features = [
  {
    icon: Mic2,
    title: "Community Rooms",
    description: "Natural voice spaces where everyone feels present and comfortable.",
    href: "#community",
    image: "radial-gradient(circle at 80% 40%,rgba(96,165,250,.25),transparent 45%),linear-gradient(145deg,#3c1c65,#1a0f35)",
  },
  {
    icon: Radio,
    title: "Broadcast Rooms",
    description: "Host events, manage speakers and connect with large audiences.",
    href: "#community",
    image: "radial-gradient(circle at 72% 30%,rgba(244,63,94,.28),transparent 40%),linear-gradient(145deg,#5b1644,#23102d)",
  },
  {
    icon: Crown,
    title: "Clubs",
    description: "Create private or public clubs with roles, chats and dedicated spaces.",
    href: "#clubs",
    image: "radial-gradient(circle at 70% 30%,rgba(168,85,247,.28),transparent 40%),linear-gradient(145deg,#3a175b,#181028)",
  },
  {
    icon: Users,
    title: "Friends & Creators",
    description: "Follow creators, make friends and discover new communities that match you.",
    href: "#clubs",
    image: "radial-gradient(circle at 75% 35%,rgba(236,72,153,.25),transparent 42%),linear-gradient(145deg,#40184c,#1a1029)",
  },
];

export function FeatureGridSection() {
  return (
    <section id="experience" className="relative border-t border-white/[.06] bg-[#060511] py-10 pb-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.28em] text-fuchsia-400">Built for real connections</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
            Everything you need to build and belong
          </h2>
          <p className="mt-3 text-sm text-white/48">YO Voice combines powerful tools with a human-first experience.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description, href, image }) => (
            <article key={title} className="group relative min-h-[250px] overflow-hidden rounded-3xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/25" style={{ background: image }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#13081d] via-[#13081d]/65 to-transparent" />
              <div className="relative flex h-full flex-col">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_0_30px_rgba(192,38,255,.3)]">
                  <Icon className="size-6" />
                </div>
                <div className="mt-auto pt-16">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
                  <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-300 transition hover:text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

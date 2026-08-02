import { HeroSection } from "@/components/hero/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const previewFeatures = [
  {
    number: "01",
    title: "Community Rooms",
    description:
      "Join immersive voice spaces designed to make every participant feel present.",
  },
  {
    number: "02",
    title: "Broadcast Experiences",
    description:
      "Host structured live conversations, events and creator-led discussions.",
  },
  {
    number: "03",
    title: "Clubs and Friends",
    description:
      "Build lasting groups, discover people and stay close to your community.",
  },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />

      <section
        id="experience"
        className="relative border-t border-white/[0.06] bg-[#0b0712] py-24 sm:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,43,226,0.12),transparent_36%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-fuchsia-400">
              The experience
            </p>

            <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
              More than another voice chat.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/50">
              YO Voice brings live conversations, friendships and communities
              together in one carefully designed experience.
            </p>
          </div>

          <div
            id="features"
            className="mt-14 grid gap-5 md:grid-cols-3"
          >
            {previewFeatures.map((feature) => (
              <article
                key={feature.number}
                className="glass-panel group rounded-3xl p-7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-fuchsia-400">
                  {feature.number}
                </span>

                <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/45">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="download"
        className="relative overflow-hidden bg-[#08040f] py-24 sm:py-32"
      >
        <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/10 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-fuchsia-400">
            Coming soon
          </p>

          <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.045em] text-white sm:text-6xl">
            Your community is waiting.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/50">
            YO Voice is being built for mobile and desktop. The intelligent
            download experience arrives in the next development stage.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

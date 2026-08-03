import { HeroSection } from "@/components/hero/hero-section";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />

      <section
        id="experience"
        className="relative min-h-[45vh] border-t border-white/[0.06] bg-[#0b0712] py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-fuchsia-400">
            Next stage
          </p>

          <h2 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
            Community, broadcast, clubs and friendships — connected in one
            experience.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/50">
            The full product showcase will be added in the next stage.
          </p>
        </div>
      </section>
    </main>
  );
}

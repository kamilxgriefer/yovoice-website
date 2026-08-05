import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060511] px-5 py-16">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-8">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-300/25 bg-black shadow-[0_0_28px_rgba(192,38,255,.3)]">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice"
              fill
              sizes="48px"
              className="object-contain p-1.5"
            />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold uppercase tracking-[.02em]">YO Voice</span>
            <span className="text-gradient block font-[family-name:var(--font-script)] text-xl leading-tight">be you</span>
          </span>
        </Link>
        {children}
      </div>
    </main>
  );
}

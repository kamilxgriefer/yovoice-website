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
          <span className="relative size-12 overflow-hidden rounded-2xl">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice"
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <span className="text-xl font-bold">YO Voice</span>
        </Link>
        {children}
      </div>
    </main>
  );
}

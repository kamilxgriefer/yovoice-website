import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060511] px-5 py-16">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-8">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <span className="relative size-12 overflow-hidden rounded-2xl"><Image src="/logos/yovoice-logo.png" alt="YO Voice" fill className="object-cover"/></span>
          <span className="text-xl font-bold">YO Voice</span>
        </Link>
        <h1 className="mt-8 text-center text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-white/45">Sign in to continue to your downloads and account.</p>
        <form className="mt-8 space-y-4">
          <input type="email" placeholder="Email address" className="w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"/>
          <input type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"/>
          <button type="submit" className="premium-button min-h-13 w-full">Log in</button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white">Return to homepage</Link>
      </div>
    </main>
  );
}

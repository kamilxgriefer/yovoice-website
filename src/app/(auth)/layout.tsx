import { BrandLockup } from "@/components/layout/brand-lockup";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060511] px-5 py-16">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-8">
        <BrandLockup className="mx-auto w-fit" />
        {children}
      </div>
    </main>
  );
}

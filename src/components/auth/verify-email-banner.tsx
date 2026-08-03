"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function VerifyEmailBanner() {
  const { user } = useAuth();

  if (!user || user.emailVerified) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <TriangleAlert className="size-4 shrink-0" />
      <span className="flex-1">Your email isn&apos;t verified yet.</span>
      <Link href="/verify-email" className="font-semibold underline underline-offset-2 hover:text-white">
        Verify now
      </Link>
    </div>
  );
}

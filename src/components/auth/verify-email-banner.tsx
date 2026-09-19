"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function VerifyEmailBanner() {
  const { user } = useAuth();

  if (!user || user.emailVerified) return null;

  return (
    <div data-tone="warning" className="status-alert items-center">
      <TriangleAlert aria-hidden="true" />
      <span className="flex-1">Your email isn&apos;t verified yet.</span>
      <Link href="/verify-email" className="font-semibold underline underline-offset-2 hover:text-white">
        Verify now
      </Link>
    </div>
  );
}

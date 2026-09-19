"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  PRIVACY_MAILBOX,
  SELF_SERVICE_DELETION_LIVE,
} from "@/content/account-deletion";

/**
 * The confirmation a person lands on after asking for deletion from
 * /account/delete. It is a client island so the public page itself stays
 * statically rendered — Google Play links this URL, and it has to answer
 * without a server round trip.
 *
 * The text is deliberately informational: the query parameter is only a hint
 * from the previous page, so it never claims more than "this is what has just
 * happened", and the page below it carries the real detail.
 */
export function DeletionRequestBanner() {
  const params = useSearchParams();
  // Only the self-service flow produces this confirmation. While deletion is
  // still a request we handle by hand, a hand-typed ?requested=1 must not be
  // able to claim that an account is being deleted.
  if (!SELF_SERVICE_DELETION_LIVE) return null;
  if (params.get("requested") !== "1") return null;

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8">
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          Your account is being deleted and you have been signed out. It
          usually finishes within a few minutes; what happens next is set out
          below. Questions go to{" "}
          <a href={`mailto:${PRIVACY_MAILBOX}`}>{PRIVACY_MAILBOX}</a>.
        </p>
      </div>
    </div>
  );
}

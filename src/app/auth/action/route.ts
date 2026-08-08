import { NextResponse, type NextRequest } from "next/server";

import { safeContinueUrl } from "@/lib/auth/safe-continue-url";

/**
 * The single custom action URL for every Firebase Auth email template.
 *
 * Firebase Console → Authentication → Templates → "Customize action URL"
 * accepts exactly ONE url per project, shared by password reset, email
 * verification and email-change revocation. Emailed links therefore land
 * here as `/auth/action?mode=...&oobCode=...&continueUrl=...&lang=...`,
 * and this handler fans out to the branded page for each mode. Without
 * this customization Firebase routes users to its own hosted page at
 * yovoice-ec54a.firebaseapp.com/__/auth/action — the generic white screen
 * this architecture exists to replace.
 *
 * Deliberately a server-side redirect, not a page: no Firebase SDK spin-up
 * just to dispatch, no client JS, and the oobCode never renders into HTML.
 * Only recognized parameters are forwarded — nothing else on the incoming
 * query string survives the hop — and continueUrl is re-validated against
 * the allowlist here as well as on the destination pages (defense in
 * depth; the param is attacker-controllable).
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");
  const continueUrl = safeContinueUrl(params.get("continueUrl"));
  const lang = params.get("lang");

  const destination = (path: string) => {
    const url = new URL(path, request.nextUrl.origin);
    if (oobCode) url.searchParams.set("oobCode", oobCode);
    if (continueUrl) url.searchParams.set("continueUrl", continueUrl);
    if (lang && /^[a-zA-Z-]{2,10}$/.test(lang)) {
      url.searchParams.set("lang", lang);
    }
    return url;
  };

  // Without a code there is nothing to act on — send the visitor somewhere
  // useful instead of a dead end (people do open these links twice, strip
  // query strings when copy-pasting, etc.).
  if (!oobCode) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl.origin),
      307,
    );
  }

  switch (mode) {
    case "resetPassword":
      return NextResponse.redirect(destination("/reset-password"), 307);
    case "verifyEmail": {
      const url = destination("/verify-email");
      // The verify-email page's direct-link branch keys on mode+oobCode.
      url.searchParams.set("mode", "verifyEmail");
      return NextResponse.redirect(url, 307);
    }
    // recoverEmail: sent to the OLD address when an account email is
    // changed, so the owner can revert a hijack. verifyAndChangeEmail:
    // sent to the NEW address to confirm an email change. Same handler —
    // both are applyActionCode flows with different copy.
    case "recoverEmail":
    case "verifyAndChangeEmail": {
      const url = destination("/recover-email");
      url.searchParams.set("mode", mode);
      return NextResponse.redirect(url, 307);
    }
    default:
      return NextResponse.redirect(
        new URL("/login", request.nextUrl.origin),
        307,
      );
  }
}

import { NextResponse, type NextRequest } from "next/server";

import { resolveAuthActionDestination } from "@/lib/auth/auth-action-routing";
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
  const destination = resolveAuthActionDestination({
    origin: request.nextUrl.origin,
    mode: params.get("mode"),
    oobCode: params.get("oobCode"),
    safeContinueUrl: safeContinueUrl(params.get("continueUrl")),
    lang: params.get("lang"),
  });

  return NextResponse.redirect(destination, 307);
}

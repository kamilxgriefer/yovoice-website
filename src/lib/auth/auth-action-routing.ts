export type AuthActionDestinationInput = {
  origin: string;
  mode: string | null;
  oobCode: string | null;
  /** Already validated by safeContinueUrl at the HTTP boundary. */
  safeContinueUrl: string | null;
  lang: string | null;
};

const AUTH_ACTION_LANGUAGE = /^[a-zA-Z-]{2,10}$/;

/**
 * Resolves Firebase's single project-wide email action URL to the matching
 * branded YO Voice page.
 *
 * Kept independent of NextRequest/NextResponse so every action mode and
 * query-string boundary can be regression-tested without a running server.
 */
export function resolveAuthActionDestination({
  origin,
  mode,
  oobCode,
  safeContinueUrl,
  lang,
}: AuthActionDestinationInput): URL {
  if (!oobCode) return new URL("/login", origin);

  const destination = (path: string) => {
    const url = new URL(path, origin);
    url.searchParams.set("oobCode", oobCode);
    if (safeContinueUrl) {
      url.searchParams.set("continueUrl", safeContinueUrl);
    }
    if (lang && AUTH_ACTION_LANGUAGE.test(lang)) {
      url.searchParams.set("lang", lang);
    }
    return url;
  };

  switch (mode) {
    case "resetPassword":
      return destination("/reset-password");
    case "verifyEmail": {
      const url = destination("/verify-email");
      url.searchParams.set("mode", "verifyEmail");
      return url;
    }
    case "recoverEmail":
    case "verifyAndChangeEmail": {
      const url = destination("/recover-email");
      url.searchParams.set("mode", mode);
      return url;
    }
    case "revertSecondFactorAddition":
      return destination("/revert-second-factor");
    default:
      return new URL("/login", origin);
  }
}

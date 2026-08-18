import {
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  type Auth,
  type MultiFactorError,
  type MultiFactorResolver,
} from "firebase/auth";

export type TotpSignInFactor = {
  uid: string;
  displayName: string;
  enrollmentTime: string;
};

export type TotpSignInChallenge = {
  factors: readonly TotpSignInFactor[];
  resolve: (factorUid: string, oneTimePassword: string) => Promise<void>;
};

export type EmailPasswordSignInResult =
  | { status: "signed-in" }
  | { status: "totp-required"; challenge: TotpSignInChallenge };

export const TOTP_CHALLENGE_A11Y = Object.freeze({
  codeLabel: "6-digit authenticator code",
  inputMode: "numeric" as const,
  autoComplete: "one-time-code" as const,
  maxLength: 6,
});

export type TotpChallengeLayout = "compact" | "standard";

/** Mirrors the component's Tailwind `sm` breakpoint for regression tests. */
export function totpChallengeLayoutForWidth(
  viewportWidth: number,
): TotpChallengeLayout {
  return viewportWidth < 640 ? "compact" : "standard";
}

export class UnsupportedSecondFactorError extends Error {
  readonly code = "auth/unsupported-second-factor";

  constructor() {
    super(
      "This account requires a second-factor method that YO Voice does not support on the website.",
    );
    this.name = "UnsupportedSecondFactorError";
  }
}

export class InvalidTotpChallengeError extends Error {
  readonly code = "auth/invalid-totp-challenge";

  constructor(message: string) {
    super(message);
    this.name = "InvalidTotpChallengeError";
  }
}

export function isMultiFactorRequiredError(
  error: unknown,
): error is MultiFactorError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "auth/multi-factor-auth-required"
  );
}

export function normalizeTotpCode(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatTotpInput(value: string): string {
  return normalizeTotpCode(value).slice(0, TOTP_CHALLENGE_A11Y.maxLength);
}

type TotpResolver = Pick<MultiFactorResolver, "hints" | "resolveSignIn">;

/**
 * Builds a single-use sign-in challenge from Firebase's in-memory MFA
 * resolver. Only TOTP hints are exposed: the website never silently falls
 * back to SMS or starts a phone verification flow.
 */
export function createTotpChallengeFromResolver(
  resolver: TotpResolver,
): TotpSignInChallenge {
  const factors = resolver.hints
    .filter((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)
    .map((hint, index) => ({
      uid: hint.uid,
      displayName: hint.displayName?.trim() || `Authenticator ${index + 1}`,
      enrollmentTime: hint.enrollmentTime,
    }));

  if (factors.length === 0) {
    throw new UnsupportedSecondFactorError();
  }

  let completed = false;

  return {
    factors,
    resolve: async (factorUid, oneTimePassword) => {
      if (completed) {
        throw new InvalidTotpChallengeError(
          "This sign-in challenge has already been completed.",
        );
      }

      const factor = factors.find((candidate) => candidate.uid === factorUid);
      if (!factor) {
        throw new InvalidTotpChallengeError(
          "Choose one of the authenticator factors enrolled on this account.",
        );
      }

      const code = normalizeTotpCode(oneTimePassword);
      if (!/^\d{6}$/.test(code)) {
        throw new InvalidTotpChallengeError(
          "Enter the 6-digit code from your authenticator app.",
        );
      }

      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        factor.uid,
        code,
      );
      await resolver.resolveSignIn(assertion);
      completed = true;
    },
  };
}

export function createFirebaseTotpSignInChallenge(
  auth: Auth,
  error: MultiFactorError,
): TotpSignInChallenge {
  return createTotpChallengeFromResolver(getMultiFactorResolver(auth, error));
}

/**
 * Website registration contract for the shared `users/{uid}` document.
 *
 * The YO Voice app's Firestore Rules are the authority for this document:
 * `userCreateAllowed` rejects a first write that carries any key outside its
 * allowlist (there is no `photoUrl`), and the owner update branch rejects a
 * later write whose changed keys include anything outside its own allowlist
 * (neither `photoUrl` nor `createdAt`). `displayName` may only move from
 * missing/empty to a 2–120 character string on update.
 *
 * The website therefore mirrors the app's own `ProfileService.ensureProfile`
 * seed instead of inventing a shape, and it never lets a failed profile write
 * prevent the verification email: the app completes a missing profile on the
 * account's first sign-in, but nothing else re-sends the verification link.
 *
 * Kept free of Firebase and path-alias imports so `node --test` can load it.
 */

export const FALLBACK_REGISTRATION_DISPLAY_NAME = "YO Voice User";

const DISPLAY_NAME_MIN_UTF16 = 2;
const DISPLAY_NAME_MAX_UTF16 = 120;

function graphemes(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

/** Truncates by whole graphemes so an emoji or accent is never split. */
function truncateToUtf16Budget(value: string, maxCodeUnits: number): string {
  let result = "";
  for (const grapheme of graphemes(value)) {
    if (result.length + grapheme.length > maxCodeUnits) break;
    result += grapheme;
  }
  return result;
}

/**
 * Same resolution order as the app's `resolveAuthProfileName`: the typed
 * display name, then the email local part, then a neutral fallback. The result
 * always satisfies the 2–120 UTF-16 unit window the update rule enforces.
 */
export function resolveRegistrationDisplayName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  const typed = displayName?.trim() ?? "";
  const emailLocalPart = (email?.trim().split("@")[0] ?? "").trim();

  for (const candidate of [typed, emailLocalPart]) {
    const bounded = truncateToUtf16Budget(candidate, DISPLAY_NAME_MAX_UTF16);
    if (bounded.length >= DISPLAY_NAME_MIN_UTF16) return bounded;
  }
  return FALLBACK_REGISTRATION_DISPLAY_NAME;
}

export type ExistingUserProfile = Readonly<Record<string, unknown>> | null;

export type UserProfileWritePlan =
  | { kind: "create"; data: Record<string, unknown> }
  | { kind: "merge"; data: Record<string, unknown> }
  | { kind: "skip" };

/** Counters and profile defaults the app writes only on true first creation. */
function initialProfileDefaults(): Record<string, unknown> {
  return {
    bio: "",
    country: "",
    nativeLanguage: "",
    spokenLanguages: [],
    learningLanguages: [],
    website: "",
    accountType: "personal",
    friendCount: 0,
    followerCount: 0,
    followingCount: 0,
    roomCount: 0,
    communityCount: 0,
    voiceMinutes: 0,
    messageCount: 0,
    activeDays: 0,
    momentCount: 0,
    reactionCount: 0,
    hostMinutes: 0,
    unlockedTitleIds: [],
    unlockedTitleTimestamps: {},
  };
}

/**
 * Decides the single write that bootstraps `users/{uid}` after registration.
 *
 * - No document: a full create whose keys all sit inside `userCreateAllowed`.
 * - A partial document created first by presence or another client, without a
 *   display name: a merge of identity keys only, all inside the owner update
 *   allowlist.
 * - A document that already has a non-empty display name: nothing to do (the
 *   update rule would refuse a second display-name change anyway).
 */
export function planUserProfileBootstrap<TimestampSentinel>(input: {
  uid: string;
  email: string | null | undefined;
  displayName: string;
  existing: ExistingUserProfile;
  serverTimestamp: TimestampSentinel;
}): UserProfileWritePlan {
  const existingName = input.existing?.displayName;
  if (typeof existingName === "string" && existingName.length > 0) {
    return { kind: "skip" };
  }

  const name = resolveRegistrationDisplayName(input.displayName, input.email);
  const identity: Record<string, unknown> = {
    uid: input.uid,
    email: input.email?.trim().toLowerCase() ?? "",
    displayName: name,
    username: name,
    profileUpdatedAt: input.serverTimestamp,
  };

  if (input.existing === null) {
    return {
      kind: "create",
      data: {
        ...identity,
        ...initialProfileDefaults(),
        createdAt: input.serverTimestamp,
      },
    };
  }

  return { kind: "merge", data: identity };
}

export type RegistrationNonFatalStep = "authDisplayName" | "profile";

export type RegistrationSteps = {
  /** Optional Auth display-name update; runs first so email templates can use it. */
  updateAuthDisplayName?: () => Promise<void>;
  writeProfile: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  onNonFatalError?: (step: RegistrationNonFatalStep, error: unknown) => void;
};

function attempt(step: () => Promise<void>): Promise<void> {
  // Converts a synchronous throw into a rejection so one step can never stop
  // the next one from being started.
  return new Promise<void>((resolve) => resolve(step()));
}

/**
 * Finishes a freshly created account. The verification email is always
 * attempted, whatever happens to the Auth display name or the profile
 * document; only a verification failure is reported to the caller, because
 * the user has no other way to receive that link during registration.
 */
export async function completeRegistration(steps: RegistrationSteps): Promise<void> {
  if (steps.updateAuthDisplayName) {
    try {
      await attempt(steps.updateAuthDisplayName);
    } catch (error) {
      steps.onNonFatalError?.("authDisplayName", error);
    }
  }

  const [profile, verification] = await Promise.allSettled([
    attempt(steps.writeProfile),
    attempt(steps.sendVerificationEmail),
  ]);

  if (profile.status === "rejected") {
    steps.onNonFatalError?.("profile", profile.reason);
  }
  if (verification.status === "rejected") {
    throw verification.reason;
  }
}

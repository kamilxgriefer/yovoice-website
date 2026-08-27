export type PasswordResetPhase =
  | { name: "verifying" }
  | { name: "ready"; email: string }
  | { name: "success" }
  | { name: "link-invalid"; title: string; body: string }
  | { name: "network-error" };

/**
 * Maps Firebase action-code failures to stable, non-enumerating UX states.
 * Raw provider messages never reach the page.
 */
export function passwordResetPhaseForError(
  error: unknown,
): PasswordResetPhase {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/expired-action-code":
      return {
        name: "link-invalid",
        title: "This link has expired",
        body:
          "Password reset links are temporary for your security. Request a new one and we'll send it to your email.",
      };
    case "auth/invalid-action-code":
      return {
        name: "link-invalid",
        title: "This link is no longer valid",
        body:
          "It may have already been used, or it was copied incompletely. Request a fresh link and try again.",
      };
    case "auth/user-disabled":
      return {
        name: "link-invalid",
        title: "Account unavailable",
        body:
          "This account has been disabled. Contact support if you think that's a mistake.",
      };
    case "auth/user-not-found":
      return {
        name: "link-invalid",
        title: "This link is no longer valid",
        body: "Request a fresh reset link and try again.",
      };
    case "auth/network-request-failed":
      return { name: "network-error" };
    default:
      return {
        name: "link-invalid",
        title: "Something went wrong",
        body: "We couldn't check this link. Request a new one and try again.",
      };
  }
}

/**
 * Bounded background check for "has this account verified its email yet?" on
 * /verify-email. Every check is a Firebase Auth `accounts:lookup` request, so
 * the page must never poll in a tight loop:
 *
 * - one check when the prompt opens (the account may already be verified),
 * - then waits that double after each check (5s, 10s, 20s, 40s, then every
 *   60s), with at most one check in flight,
 * - at most `maxChecksPerVisibleStretch` checks while the tab stays visible,
 * - nothing while the tab is hidden; returning to the tab (typically from the
 *   mailbox) checks again promptly and restarts the backoff,
 * - stops for good once the account is verified or the caller stops it.
 *
 * Kept free of React, Firebase and DOM globals so `node --test` can drive it
 * with a fake clock.
 */

export type VerificationAutoCheckPolicy = {
  firstDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  maxChecksPerVisibleStretch: number;
};

export const VERIFICATION_AUTO_CHECK_POLICY: VerificationAutoCheckPolicy = {
  firstDelayMs: 5_000,
  maxDelayMs: 60_000,
  backoffFactor: 2,
  maxChecksPerVisibleStretch: 20,
};

export type VerificationAutoCheckEnvironment<TimerHandle = unknown> = {
  isVisible: () => boolean;
  /** Subscribes to visibility changes; returns an unsubscribe function. */
  onVisibilityChange: (listener: () => void) => () => void;
  setTimer: (callback: () => void, delayMs: number) => TimerHandle;
  clearTimer: (handle: TimerHandle) => void;
  now: () => number;
};

/** Delay before the next check, given how many checks already ran in this
 * visible stretch (1 after the opening check). */
export function verificationAutoCheckDelayMs(
  completedChecks: number,
  policy: VerificationAutoCheckPolicy = VERIFICATION_AUTO_CHECK_POLICY,
): number {
  const exponent = Math.max(0, completedChecks - 1);
  const delay = policy.firstDelayMs * policy.backoffFactor ** exponent;
  return Math.min(policy.maxDelayMs, delay);
}

export function startVerificationAutoCheck<TimerHandle>(options: {
  /** Resolves true once the account's email is verified. */
  check: () => Promise<boolean>;
  onVerified: () => void;
  environment: VerificationAutoCheckEnvironment<TimerHandle>;
  policy?: VerificationAutoCheckPolicy;
}): () => void {
  const { check, onVerified, environment } = options;
  const policy = options.policy ?? VERIFICATION_AUTO_CHECK_POLICY;

  let stopped = false;
  let inFlight = false;
  let timer: { handle: TimerHandle } | null = null;
  let checksThisStretch = 0;
  let lastCheckStartedAt = Number.NEGATIVE_INFINITY;
  let visible = environment.isVisible();

  function clearPendingTimer() {
    if (timer) {
      environment.clearTimer(timer.handle);
      timer = null;
    }
  }

  function schedule(delayMs: number) {
    clearPendingTimer();
    if (stopped || inFlight || !environment.isVisible()) return;
    if (checksThisStretch >= policy.maxChecksPerVisibleStretch) return;
    timer = { handle: environment.setTimer(runCheck, Math.max(0, delayMs)) };
  }

  async function runCheck() {
    timer = null;
    if (stopped || inFlight || !environment.isVisible()) return;
    inFlight = true;
    checksThisStretch += 1;
    lastCheckStartedAt = environment.now();
    let verified = false;
    try {
      verified = await check();
    } catch {
      // A failed lookup (offline, rate limited) is retried on the same
      // backoff; it never speeds the schedule up.
      verified = false;
    }
    inFlight = false;
    if (stopped) return;
    if (verified) {
      stop();
      onVerified();
      return;
    }
    schedule(verificationAutoCheckDelayMs(checksThisStretch, policy));
  }

  function handleVisibilityChange() {
    if (stopped) return;
    const nowVisible = environment.isVisible();
    // Only a real hidden <-> visible transition counts.
    if (nowVisible === visible) return;
    visible = nowVisible;
    if (!nowVisible) {
      clearPendingTimer();
      return;
    }
    // Back on the tab: a new visible stretch. Check soon, but never sooner
    // than the first backoff step after the previous check started.
    checksThisStretch = 0;
    const sinceLastCheck = environment.now() - lastCheckStartedAt;
    schedule(Math.max(0, policy.firstDelayMs - sinceLastCheck));
  }

  const unsubscribe = environment.onVisibilityChange(handleVisibilityChange);

  function stop() {
    if (stopped) return;
    stopped = true;
    clearPendingTimer();
    unsubscribe();
  }

  // The opening check runs immediately when the tab is visible.
  schedule(0);
  return stop;
}

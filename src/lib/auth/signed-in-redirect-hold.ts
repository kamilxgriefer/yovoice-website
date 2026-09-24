/**
 * Holds the "already signed in" redirect on /login and /register while a
 * Google or Apple sign-in started on the page is still finishing.
 *
 * Firebase reports the account as signed in the moment the popup closes, but
 * a brand-new account still has its `users/{uid}` profile to write. The
 * redirect would otherwise fire right then, and when it leads to the app
 * (a full-page hand-off to another origin) the write dies with the page.
 *
 * The /login page mounts its redirect beside the form rather than inside it,
 * so the form cannot pass it a prop; both read this store instead. It is
 * counted, so two overlapping flows never release each other's hold, and each
 * release is idempotent. Module state lives in one browser tab only; the
 * server never takes a hold, so its snapshot is always "not held".
 *
 * Kept free of React, Firebase and path-alias imports so `node --test` can
 * load it.
 */

let holds = 0;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Takes a hold and returns the function that releases it (once). */
export function holdSignedInRedirect(): () => void {
  holds += 1;
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds -= 1;
    notify();
  };
}

export function isSignedInRedirectHeld(): boolean {
  return holds > 0;
}

export function isSignedInRedirectHeldOnServer(): boolean {
  return false;
}

/** `useSyncExternalStore` subscription. */
export function subscribeSignedInRedirectHold(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

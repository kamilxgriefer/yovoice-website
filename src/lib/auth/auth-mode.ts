/**
 * Log in and Create account are two routes that share one auth surface. The
 * layout reads the mode from the pathname so the parts that outlive a
 * navigation (the switch, the spoken title, the waveform) can animate from
 * one mode to the other instead of being rebuilt.
 */
export type AuthMode = "login" | "register";

const AUTH_MODE_PATHS: Record<AuthMode, string> = {
  login: "/login",
  register: "/register",
};

export function authModeFromPath(pathname: string | null | undefined): AuthMode | null {
  if (!pathname) return null;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === AUTH_MODE_PATHS.login) return "login";
  if (path === AUTH_MODE_PATHS.register) return "register";
  return null;
}

/** The other mode's URL, keeping the `?redirect=` destination so a visitor
 * who switches from signing in to signing up still lands where they were
 * headed (the download gate depends on it). */
export function authModeHref(mode: AuthMode, redirect: string | null | undefined): string {
  const path = AUTH_MODE_PATHS[mode];
  return redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
}

/**
 * Loudness envelope per letter of each mode's title, 0..1. The title itself is
 * drawn at one even weight; this contour exists only as the sound of the
 * phrase in the waveform. Stressed syllables peak: WEL-come BACK, JOIN YO
 * VOICE. Spaces carry no sound and are skipped.
 */
export const AUTH_MODE_VOICE: Record<
  AuthMode,
  { title: string; heading: string; note: string; envelope: readonly number[] }
> = {
  login: {
    title: "Welcome back.",
    heading: "Welcome back",
    note: "Sign in to continue to your downloads and account.",
    envelope: [0.97, 1, 0.8, 0.46, 0.34, 0.26, 0.14, 0.94, 1, 0.83, 0.51, 0.09],
  },
  register: {
    title: "Join YO Voice.",
    heading: "Join YO Voice",
    note: "Create an account to download, sign in and launch the app.",
    envelope: [1, 0.94, 0.71, 0.46, 0.89, 0.8, 0.97, 1, 0.74, 0.49, 0.26, 0.09],
  },
};

/**
 * Bar heights (0..1) for a waveform of `bars` columns: the envelope sampled
 * across the width with a fixed, deterministic texture so neighbouring bars
 * differ the way a real recording does. Deterministic on purpose: the server
 * render and the hydrated client must produce identical markup.
 */
export function waveformHeights(envelope: readonly number[], bars: number, phase = 0): number[] {
  const count = Math.max(2, Math.floor(bars));
  const last = envelope.length - 1;
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * last;
    const k = Math.floor(x);
    const a = envelope[k] ?? 0;
    const b = envelope[Math.min(k + 1, last)] ?? a;
    const level = a + (b - a) * (x - k);
    const texture = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.9 + phase) * Math.cos(i * 0.41));
    heights.push(Number(Math.max(0.08, level * texture).toFixed(3)));
  }
  return heights;
}

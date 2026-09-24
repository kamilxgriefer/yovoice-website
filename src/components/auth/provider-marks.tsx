/**
 * Provider marks for "Continue with Google / Apple" — and nowhere else.
 *
 * The site otherwise never shows another product's logo or colours
 * (docs/design/design-system.md, "Legal hygiene"). Sign-in buttons are the
 * documented exception: Google's and Apple's branding rules require their own
 * mark, unaltered, on a button that signs in with them. The Google "G" keeps
 * its four colours on the dark surface (the app's
 * assets/icons/icon_google_g.svg); the Apple glyph takes the label's colour.
 * Both are decorative: the button's text names the provider.
 */

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 44 44"
      className={className}
    >
      <path
        d="M41 22.5c0-1.4-.1-2.5-.4-3.7H22v7h10.8c-.2 1.7-1.4 4.3-4 6l-.1.2 5.8 4.5.4.1c3.7-3.5 6.1-8.6 6.1-14.1Z"
        fill="#4285F4"
      />
      <path
        d="M22 42c5.3 0 9.7-1.7 12.9-4.7l-6.1-4.8c-1.6 1.1-3.8 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.4l-.2.1-6 4.7-.1.2C7.6 37.5 14.2 42 22 42Z"
        fill="#34A853"
      />
      <path
        d="M10.8 26c-.4-1.2-.6-2.6-.6-4s.2-2.8.6-4l-.1-.3-6.1-4.8-.2.1A20 20 0 0 0 2 22c0 3.2.8 6.3 2.4 9l6.4-5Z"
        fill="#FBBC05"
      />
      <path
        d="M22 9.6c3.7 0 6.2 1.6 7.6 2.9l5.6-5.4A19 19 0 0 0 22 2 20 20 0 0 0 4.4 13l6.4 5c1.6-4.9 6-8.4 11.2-8.4Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

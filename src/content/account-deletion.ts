/**
 * Account deletion — the single source of truth for every sentence this
 * website says about deleting a YO Voice account.
 *
 * Four surfaces read from here: the public `/delete-account` page (the URL
 * filed in Google Play's Data safety "Account deletion" field), the signed-in
 * `/account/delete` page, section 9 of the Privacy Policy and section 8 of the
 * Terms. They are one promise made in four places, so the promise lives in one
 * module instead of being retyped — a retention added later cannot be
 * disclosed on one page and forgotten on another.
 *
 * Grounding: the cross-system design at
 * yovoice-evidence/2026-09-18/b32/deletion-design.md (§3 what is deleted and
 * what is retained, §4 the direct-message decision, §7 these two pages, §9 the
 * policy text) and the per-collection inventory in deletion-inventory.md.
 */

/**
 * Is self-service deletion switched on in production?
 *
 * `false` until BOTH of these are true, and the website is deployed after
 * them, not before:
 *
 *  1. `deleteAccountSelfV1` and the account-deletion worker are deployed to
 *     the Firebase project, and `appConfig/accountDeletion.enabled` is `true`
 *     (the backend ships fail-closed with the switch off — design §8).
 *  2. The app build carrying Settings → Account → Delete account is released.
 *
 * Until then every sentence below describes the process that really runs
 * today: a request handled by hand. Flipping this one boolean switches the
 * public page, the account page, the Privacy Policy, the Terms and the FAQ
 * together. Nothing else needs editing, and nothing can drift out of step.
 *
 * Deploying this site with the switch on before (1) and (2) would publish a
 * privacy policy that promises a deletion the servers cannot perform, and a
 * button that calls a function that is not there.
 */
export const SELF_SERVICE_DELETION_LIVE: boolean = false;

/** The rights mailbox. One address across the app, the site and the policy. */
export const PRIVACY_MAILBOX = "privacy@yovoice.app";

/**
 * The support address. The app's Settings "Contact support" row shows and
 * opens it (settings_screen.dart in 3.0.0), and it reaches a human, so the
 * site publishes it wherever it offers support; a Play reviewer comparing the
 * app, the policy and this page has to find every address that works. The
 * app's Delete account screen writes to PRIVACY_MAILBOX instead.
 */
export const SUPPORT_MAILBOX = "support@yovoice.app";

/** The subject line the app's Delete account row pre-fills today. */
export const DELETION_EMAIL_SUBJECT = "Delete my YO Voice account";

/**
 * A request email carries no personal data in the URL — the subject only. The
 * address the mail arrives from is the identity we verify against.
 */
export const DELETION_REQUEST_MAILTO = `mailto:${PRIVACY_MAILBOX}?subject=${encodeURIComponent(
  DELETION_EMAIL_SUBJECT,
)}`;

export const PUBLIC_DELETION_PATH = "/delete-account";
export const ACCOUNT_DELETION_PATH = "/account/delete";

export type DeletionRoute = {
  id: string;
  title: string;
  detail: string;
  /** Does this route delete the account by itself today? */
  selfService: boolean;
};

/** The ways a person can ask us to delete their account. */
export function accountDeletionRoutes(
  live: boolean = SELF_SERVICE_DELETION_LIVE,
): DeletionRoute[] {
  return [
    {
      id: "app",
      title: "In the YO Voice app",
      detail: live
        ? "Open Settings, then Account, then Delete account. You confirm your password or your Google or Apple sign-in, and the deletion starts straight away. This row is in the app version released with this change — if your copy does not show it, update the app or use one of the routes below."
        : `Open Settings, then Delete account. The screen sets out what is removed and what we keep. While self-service deletion is being switched on it does not delete the account by itself — it offers the email route to ${PRIVACY_MAILBOX} with the subject "${DELETION_EMAIL_SUBJECT}", which reaches us the same way as the address below. ${SUPPORT_MAILBOX} still reaches a human too.`,
      selfService: live,
    },
    {
      id: "web",
      title: "On this website",
      detail: live
        ? `Sign in and open ${ACCOUNT_DELETION_PATH}. You confirm your password, the page tells you exactly what happens, and the deletion starts when you confirm. If your account signs in only with Google or Apple, it has no password to confirm with, so delete it in the YO Voice app or write to us.`
        : `Sign in and open ${ACCOUNT_DELETION_PATH}. The page sets out what deleting your account removes and what we keep, and sends your request to us. It cannot delete the account on its own yet. If your account signs in only with Google or Apple, you can still sign in here and send the request by email.`,
      selfService: live,
    },
    {
      id: "email",
      title: "By email",
      detail: `Write to ${PRIVACY_MAILBOX} from the address on the account, with the subject "${DELETION_EMAIL_SUBJECT}". This route works for every account, including one created with Google or Apple sign-in. We may need to verify that the account is yours before we act.`,
      selfService: false,
    },
  ];
}

/**
 * What deleting a YO Voice account removes, in the categories a person
 * recognises rather than the collection names our database uses.
 *
 * The same set in both states: today it is carried out by hand after we
 * verify the request, afterwards by the deletion pipeline. What changes is
 * how it happens and how long it takes, not what goes.
 */
export const DELETION_REMOVES: readonly string[] = [
  "Your sign-in account itself — the email address, the password, any Google or Apple link, and any authenticator app you enrolled.",
  "Your profile: display name, username, bio, status line, country, languages, website link and profile photo, and your entry in the member directory.",
  "The Voice Moments and Yeels you posted: their captions, the comments, likes and reactions people left on them, and the photos, videos, audio and files behind them.",
  "What you uploaded into your own account: profile artwork, the Server and session covers you own, and the media you attached to a message.",
  "Your friends, followers, the people you follow, your blocks and mutes — including the matching entry held on the other person's side.",
  "Your record of which Voice Moments and Yeels you played, your notifications, your push notification tokens and your device records.",
  "Your achievement progress and titles, your counters, your presence and last-seen, and your public website showcase consent.",
  "Your name and photo inside every Server you were a member of, so the membership that remains carries nothing about you.",
  "The name shown on a Server you own. The Server itself keeps running under an anonymous owner until we transfer or close it — tell us in your request if you want it closed.",
];

export type RetainedItem = {
  item: string;
  /** Why it is kept. Every retention on this page names its reason. */
  reason: string;
};

/**
 * What is kept after deletion, each with the reason that justifies keeping
 * it. Nothing is kept "just in case": if an entry here ever loses its reason,
 * it stops being retained.
 */
export function accountDeletionRetains(
  live: boolean = SELF_SERVICE_DELETION_LIVE,
): RetainedItem[] {
  const shared: RetainedItem[] = [
    {
      item: "Reports you filed about someone else, with the reporting account replaced by an anonymous marker.",
      reason:
        "They are the record of something that happened to another person. If deleting an account erased the reports it filed, deletion would become a way to destroy the evidence of harassment against somebody else.",
    },
    {
      item: "Reports other people filed about you, and any moderation decision taken on your account.",
      reason:
        "Safety history, and our ability to defend a decision that was challenged. Once your profile and directory entry are gone, what remains is an account identifier that no longer resolves to a person.",
    },
    {
      item: "Our internal staff audit log of moderation actions.",
      reason:
        "An audit trail that the person it concerns can erase is not an audit trail. It records what our staff did, not what you posted.",
    },
    {
      item: "Server-side logs and crash diagnostics held by Firebase Crashlytics and Google Cloud Logging.",
      reason:
        "Security and debugging. These lines hold identifiers and error traces, never the contents of a message, and they expire under those services' own retention settings rather than ours.",
    },
    {
      item: "Messages you sent in a one-to-one conversation stay in the other person's copy of that thread. The photos, videos, voice notes and files you sent are deleted.",
      reason:
        "A conversation is also the other person's record of something they took part in. We do not rewrite their history, and we do not keep your uploaded media after you leave.",
    },
  ];

  if (!live) {
    return [
      {
        item: "Until your request has been carried out, your private account record stays in our database, marked deleted and disabled. It still contains your email address, display name, username, bio, country, languages, notification preferences and your counters.",
        reason:
          "This is the one automatic step that runs the moment a sign-in account is deleted: it removes your public profile, presence, public badges, member-directory entry and website-showcase consent, and deliberately keeps the private record so that the rest can be finished by hand. It is deleted when your request is complete.",
      },
      ...shared,
    ];
  }

  return [
    {
      item: "A minimal internal marker in place of your account, with no email address, name, username or content in it.",
      reason:
        "Other people's data refers to your account — a conversation you took part in, a report you filed. The marker keeps their records readable without saying anything about you.",
    },
    {
      item: "If your account was banned when it was deleted: a salted, one-way hash of your email address. Not the address itself, and nothing else.",
      reason:
        "Without it, deleting an account would be a one-click way to reset a ban. It cannot be read back into an email address. We keep it for as long as the ban lasts, and a permanent ban means we keep it indefinitely.",
    },
    ...shared,
  ];
}

/** How the deletion is carried out, and how long it takes. */
export function accountDeletionTiming(
  live: boolean = SELF_SERVICE_DELETION_LIVE,
): { headline: string; detail: string } {
  if (!live) {
    return {
      headline: "Every request is carried out by hand.",
      detail:
        "One step is automatic: deleting the sign-in account immediately removes the public profile, presence, public badges, member-directory entry and website-showcase consent. Everything else on the list above — messages, uploaded media, push tokens, notifications, friends and followers, viewing history, Voice Moments, Yeels and Server content — is removed by a person, after we have checked that the account is yours. We aim to finish within 30 days of that check, and it is normally much sooner. Tell us in your email if there is anything in particular you want removed first.",
    };
  }

  return {
    headline: "Deletion starts immediately and runs to completion on its own.",
    detail:
      "The moment you confirm, your account is disabled and signed out everywhere, and it disappears from other people's screens. The rest is removed in stages — content, social graph, messages, uploaded files, then the sign-in account itself — and normally finishes within minutes. Our outside limit is 30 days. Deletion is permanent: there is no undo and no recovery window, which is why it asks for your password first.",
  };
}

/** One sentence, used where a page only has room for the headline. */
export function accountDeletionSummary(
  live: boolean = SELF_SERVICE_DELETION_LIVE,
): string {
  return live
    ? "You can delete your account yourself, in the app or on this website. Deletion is permanent."
    : "There is no self-service account deletion in the app yet: you ask us by email, and we carry the deletion out by hand.";
}

/** What we cannot do, said plainly rather than left to be discovered. */
export const DELETION_LIMITS: readonly string[] = [
  "We have no export tool. If you want a copy of your data before it goes, ask in the same email and it is put together by hand.",
  "Deleting a chat only for yourself is a separate control inside the app. It does not delete your account.",
  "Deleting your account does not delete a message someone else wrote, or a Server that somebody else owns.",
  "A comment or a reaction you left on somebody else's Voice Moment or Yeel stays under their post. Ask us in the same email and we remove those by hand.",
  "A file you uploaded into a Server that somebody else owns — a Family memory, or a file in a Company channel — stays with that Server. Ask us and we remove it by hand.",
  "A cover image you set on a live voice session, and a podcast episode published on a Server, stay where they are: neither is filed under your account, so the automatic deletion cannot find them. Ask us in the same email and we remove them by hand.",
  "A call record in a chat — who was on the call, when it started and ended — stays in the other person's chat.",
];

/** Ready-made values for the current state of the switch. */
export const deletionRoutes = accountDeletionRoutes();
export const deletionRetains = accountDeletionRetains();
export const deletionTiming = accountDeletionTiming();
export const deletionSummary = accountDeletionSummary();

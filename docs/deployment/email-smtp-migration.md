# Custom SMTP migration — audit, checklists, and provider setup

Prepared 2026-08-04. Companion to the email-verification-flow fix (see git
history on this date in both `yovoice` and `yovoice-website`). That fix made
`sendEmailVerification()` behave correctly end-to-end — Firebase's API
accepts the request and returns 200 — but no verification email was ever
received in any of four independent tests (three on localhost, one on
production `yovoice.app`, checked against Gmail including spam/trash).

**Important caveat on root cause**: Firebase's `DEFAULT` email-sending
method does not expose delivery, bounce, or complaint logs to project
owners. There is no API or Console page that shows "message accepted but
not delivered" versus "message accepted and delivered but filtered by the
recipient." A clean 200 from `accounts:sendOobCode` combined with zero
delivery across four tests is strong circumstantial evidence of a
deliverability problem with the shared `DEFAULT` sender, not proof from a
delivery log — because no such log is available to inspect. This document
proceeds on that evidence, but flags it as inference, not confirmed fact,
per instruction not to overstate certainty.

---

## 1. Current email-sending configuration (audited via API)

Fetched directly from `identitytoolkit.googleapis.com/v2/projects/yovoice-ec54a/config`
using an authenticated Google Cloud access token (Firebase CLI's own OAuth
session — no gcloud install was available). This is a live read of the
actual production config, not documentation-derived.

| Field | Current value |
|---|---|
| `subtype` | `FIREBASE_AUTH` (not upgraded to `IDENTITY_PLATFORM`) |
| `notification.sendEmail.method` | `DEFAULT` |
| `notification.sendEmail.callbackUri` | `https://yovoice-ec54a.firebaseapp.com/__/auth/action` |
| `notification.sendEmail.dnsInfo.customDomainState` | `NOT_STARTED` |
| `signIn.email.enabled` | `true` |
| `authorizedDomains` | `localhost`, `yovoice-ec54a.firebaseapp.com`, `yovoice-ec54a.web.app`, `auth.yovoice.app`, `yovoice.app`, `www.yovoice.app`, `app.yovoice.app` |
| `emailPrivacyConfig.enableImprovedEmailPrivacy` | `true` |
| Billing (`cloudbilling.googleapis.com` `billingInfo`) | **Enabled**, linked to billing account `017CD7-AFF830-42BCFB` (Blaze plan — confirmed separately since Cloud Functions v2/Eventarc already runs on this project) |

**Templates** (`resetPasswordTemplate`, `verifyEmailTemplate`,
`changeEmailTemplate`, `revertSecondFactorAdditionTemplate`) are all present,
unmodified from Firebase's defaults, `senderLocalPart: "noreply"`,
`replyTo: "noreply"`, `bodyFormat: HTML`. Nothing malformed or disabled —
the DEFAULT method's own templates are exactly what a fresh project ships
with.

## 2. Is Custom SMTP available? Is Identity Platform / billing required?

**Billing: already satisfied.** This project is on Blaze with an active
billing account — confirmed via the Cloud Billing API, not assumed.

**Identity Platform upgrade: very likely not required**, based on direct
inspection of the live `identitytoolkit` v2 API schema (Google's own
discovery document, fetched today):

- `NotificationConfig.SendEmail.method` is a plain enum with three values:
  `METHOD_UNSPECIFIED`, `DEFAULT`, `CUSTOM_SMTP` — sitting in the exact
  same config object (`notification.sendEmail`) that already holds the
  active `DEFAULT` value. There is no separate resource, no separate API,
  and no subtype gate declared anywhere in the schema for `CUSTOM_SMTP`.
- The `Smtp` sub-message (`host`, `port`, `username`, `password`,
  `securityMode`, `senderEmail`) hangs directly off `sendEmail.smtp` —
  again, no subtype restriction visible.

This is strong evidence Custom SMTP is a standard Firebase Authentication
Console feature (Authentication → Templates), not something gated behind
the separate "upgrade to Identity Platform" flow (which exists for
different features — SAML/OIDC providers, multi-tenancy, enterprise phone
MFA). I did not attempt to write `CUSTOM_SMTP` to production config to
confirm this experimentally — doing so without real relay credentials
would risk breaking the (currently at least API-functional) `DEFAULT`
path for a project with real user accounts, and entering placeholder
credentials would violate the "never enter credentials" constraint below
regardless of whether they're fake. **Definitive confirmation happens
when you open the Console page below and see (or don't see) the SMTP
option** — if it's not there or asks you to upgrade, that's the one
signal this document can't fully substitute for.

**Firebase Console path**: Firebase Console → select the **yovoice**
project → **Build → Authentication → Templates** tab → open any template
(e.g. "Email address verification") → look for **"SMTP settings"** (a
gear/settings affordance near the "From" address in that template's
detail panel). Console label wording changes over time; if "SMTP
settings" isn't the exact string shown, look for "Custom SMTP" or a
toggle near the sender address.

## 3. Provider-neutral SMTP configuration checklist

Every field below maps 1:1 to the `Smtp` object in Firebase's own schema —
whatever provider gets chosen, these are exactly the values Console will
ask for:

| Field | What it is | Notes |
|---|---|---|
| **SMTP host** | The relay's hostname, e.g. `smtp.something.com` | Get this from the provider's SMTP/relay docs, not their API docs — some providers have separate API and SMTP endpoints. |
| **Port** | `587` (STARTTLS) or `465` (SSL) in the overwhelming majority of providers | Confirm against the specific provider — a few also offer `2525` as a fallback for networks that block 587/465. |
| **Security mode** | `START_TLS` (paired with port 587) or `SSL` (paired with port 465) | Firebase's schema only accepts these two enum values — no plaintext option, which is correct/expected. |
| **Username** | Provider-specific — often an API key string, sometimes a fixed literal (e.g. `apikey`), sometimes the sending email address itself | Varies most between providers; check their SMTP qu————start guide specifically. |
| **Password / secret** | The actual SMTP credential/API key | **Never hardcoded, never entered by Claude — see §5.** |
| **Sender email** | The "From" address, e.g. `noreply@yovoice.app` or `noreply@mail.yovoice.app` | Must be on a domain you control and will add SPF/DKIM/DMARC records for (§4). Using the bare `yovoice.app` root domain works but a dedicated `mail.yovoice.app` subdomain is the safer default — see §4. |
| **Sender name** | Display name shown in the recipient's inbox, e.g. "YO Voice" | This is set **per email template** in Firebase (`senderDisplayName` on each of `verifyEmailTemplate`, `resetPasswordTemplate`, `changeEmailTemplate`), not once globally — set it on each template you use. |

## 4. DNS records needed (provider-neutral template)

All of these go on whichever domain becomes the **sender email**'s domain
— either `yovoice.app` directly, or a dedicated subdomain like
`mail.yovoice.app` (recommended — see below). Exact record *values* are
issued by the provider once selected; this section documents the record
*types*, *hosts*, and *why*, so DNS work can start the moment a provider
is picked without re-deriving any of this.

### Recommended: use `mail.yovoice.app`, not the bare root domain

Sending transactional mail from a dedicated subdomain (`mail.yovoice.app`)
rather than `yovoice.app` itself is the standard practice for two reasons:
domain reputation stays isolated (if the transactional stream ever gets
flagged, it doesn't touch the root domain's reputation for anything else
hosted there — website, other mail, etc.), and it avoids any conflict
between an existing root-domain SPF record (if `yovoice.app` already sends
mail some other way) and the new provider's requirements. This is optional
— the root domain works too — but is the safer default and costs nothing
extra to set up.

### SPF (Sender Policy Framework)

- **Record type**: `TXT`
- **Host**: `mail.yovoice.app` (or `@`/root if using the bare domain)
- **Value**: `v=spf1 include:<provider-spf-include> ~all` — the
  `include:` target is provider-specific (e.g. `include:sendgrid.net`,
  `include:spf.mtasv.net` for Postmark, `include:mailgun.org`,
  `include:amazonses.com` for SES); get the exact string from the
  provider's onboarding page, don't guess it.
- **Why**: tells receiving mail servers which hosts are authorized to send
  as this domain. Without it, DMARC alignment (below) fails by default.

### DKIM (DomainKeys Identified Mail)

- **Record type**: `TXT` (sometimes `CNAME`, depending on provider —
  several providers, e.g. SendGrid, issue a CNAME you point at their
  infrastructure instead of a raw TXT key)
- **Host**: provider-specific selector, typically formatted like
  `<selector>._domainkey.mail.yovoice.app` (e.g. Postmark uses something
  like `pm._domainkey`, SES issues three CNAME records with its own
  selectors, SendGrid issues two CNAMEs)
- **Value**: the exact public key / CNAME target the provider generates
  for this domain — this is unique per account, cannot be predicted or
  templated further than "get it from the provider dashboard after adding
  the domain there."
- **Why**: cryptographically signs outgoing mail so receivers can verify
  it wasn't altered/spoofed in transit. This is usually the single
  highest-impact record for actually landing in the inbox instead of spam.

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

- **Record type**: `TXT`
- **Host**: `_dmarc.mail.yovoice.app` (or `_dmarc.yovoice.app` if using
  the root domain)
- **Value** (start conservative, tighten later):
  `v=DMARC1; p=none; rua=mailto:dmarc-reports@yovoice.app; fo=1`
  — `p=none` means "monitor only, don't reject/quarantine failures yet."
  Once SPF+DKIM are confirmed working (a week or two of clean DMARC
  reports), tighten to `p=quarantine` and eventually `p=reject`.
- **Why**: tells receivers what to do when a message claims to be from
  this domain but fails SPF/DKIM alignment, and gives you visibility
  (via `rua` reports) into anyone else trying to spoof the domain.
- **Note**: `dmarc-reports@yovoice.app` needs to be a real, monitored
  mailbox (or an address that forwards somewhere monitored) — DMARC
  aggregate reports are only useful if someone reads them.

### Summary table (fill in once a provider is chosen)

| Type | Host | Value | Status |
|---|---|---|---|
| TXT (SPF) | `mail.yovoice.app` | `v=spf1 include:<provider> ~all` | ⬜ pending provider selection |
| TXT/CNAME (DKIM) | `<selector>._domainkey.mail.yovoice.app` | provider-issued | ⬜ pending provider selection |
| TXT (DMARC) | `_dmarc.mail.yovoice.app` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@yovoice.app; fo=1` | ⬜ can be added now, independent of provider |

The DMARC record can be added **today**, before choosing a provider — it's
domain-level policy, not provider-specific. SPF and DKIM must wait for
provider selection since their exact values come from that provider.

## 5. Credential handling policy

- **Never hardcoded** anywhere in either repo (`yovoice`, `yovoice-website`)
  — no `.env` file, no source file, no Firestore document, no Cloud
  Function source.
- **The only place an SMTP password/API key is ever entered is directly
  into the Firebase Console's SMTP settings form** (§2), by you, not by
  Claude — this applies even after a provider is selected and credentials
  exist. Identity Platform stores that credential internally, encrypted,
  as part of the project's Auth config; that's Google's storage, not
  something this repo configures or has access to inspect.
- If you want a staging/audit trail before pasting a credential into
  Console (e.g. so it's recorded who has access to rotate it later), this
  project already uses **Google Secret Manager** for other secrets (see
  `functions/livekit/token.js`'s `defineSecret` usage) — storing the SMTP
  credential there too, as a reference copy, is a reasonable optional
  practice. It is not required for the credential to function; Identity
  Platform doesn't read from Secret Manager for this feature.
- This applies regardless of which provider gets picked: Postmark,
  SendGrid, Mailgun, and SES all issue either an SMTP username/password
  pair or an API-key-as-password — same handling either way.

## 6. Per-provider admin checklist

Pick one, then work through its list. Every path below ends at the same
place: entering host/port/security-mode/username/password/sender-email
into Firebase Console (§2/§3) and adding the DNS records the provider
issues (§4).

### Postmark

1. Create a Postmark account, create a **Server** (transactional stream).
2. Add `mail.yovoice.app` (or `yovoice.app`) as a **Sender Signature** /
   verified domain under Sending → Domains.
3. Postmark shows you the exact SPF/DKIM TXT records for that domain —
   add them via your DNS registrar/host for `yovoice.app`.
4. Wait for Postmark to show the domain as **Verified** (DNS propagation,
   usually minutes to a few hours).
5. Under Servers → API Tokens / SMTP, get the **SMTP username and
   password** for that server (Postmark's SMTP username is typically the
   server API token itself, used as both username and password).
6. In Firebase Console (§2): host `smtp.postmarkapp.com`, port `587`,
   security `START_TLS`, username/password from step 5, sender email
   `noreply@mail.yovoice.app`.
7. Add the DMARC record (§4) if not already done.
8. Send a real verification email to a Gmail **and** an Outlook address
   and confirm both actually arrive before considering this done.

### SendGrid

1. Create a SendGrid account (Twilio SendGrid).
2. Settings → **Sender Authentication** → Authenticate Your Domain →
   enter `mail.yovoice.app`.
3. SendGrid issues 2-3 CNAME records — add them at your DNS host.
4. Wait for SendGrid to confirm the domain as verified.
5. Settings → **API Keys** → create a key with "Mail Send" permission
   only (least privilege — don't grant full access for this).
6. In Firebase Console: host `smtp.sendgrid.net`, port `587`, security
   `START_TLS`, username literally `apikey`, password = the API key from
   step 5, sender email `noreply@mail.yovoice.app`.
7. Add SPF (`include:sendgrid.net`) if SendGrid's domain auth flow doesn't
   already cover it, plus DMARC (§4).
8. Send a real test to Gmail and Outlook before considering this done.

### Mailgun

1. Create a Mailgun account.
2. Sending → Domains → Add New Domain → `mail.yovoice.app`.
3. Mailgun issues SPF (TXT), DKIM (TXT), and a tracking CNAME — add all
   at your DNS host. (Mailgun's SPF include is typically
   `include:mailgun.org`.)
4. Wait for Mailgun to show the domain as **Verified**.
5. Domain Settings → **SMTP credentials** → create/get the SMTP username
   (usually `postmaster@mail.yovoice.app`) and password.
6. In Firebase Console: host `smtp.mailgun.org`, port `587`, security
   `START_TLS`, username/password from step 5, sender email
   `noreply@mail.yovoice.app`.
7. Add the DMARC record (§4).
8. Send a real test to Gmail and Outlook before considering this done.

### Amazon SES

1. AWS account with SES access; **request production access** first —
   new SES accounts start in a sandbox that only sends to verified
   addresses, which would silently fail exactly like the current bug for
   anyone who hasn't manually verified their address with AWS.
2. SES → Verified identities → Create identity → Domain →
   `mail.yovoice.app`.
3. SES issues 3 DKIM CNAME records (via Easy DKIM) — add them at your DNS
   host. Add an SPF TXT record with `include:amazonses.com` as well.
4. Wait for SES to show the domain as **Verified**.
5. SES → SMTP settings → **Create SMTP credentials** — this generates an
   IAM user scoped to SES sending, with a distinct SMTP username/password
   (different from your AWS access key).
6. In Firebase Console: host is region-specific, e.g.
   `email-smtp.us-east-1.amazonaws.com` — use whichever region you
   verified the domain in — port `587`, security `START_TLS`,
   username/password from step 5, sender email
   `noreply@mail.yovoice.app`.
7. Add the DMARC record (§4).
8. Confirm the account is out of the SES sandbox (step 1) — this is the
   most common way SES setups silently fail for real users while test
   sends to the account owner's own verified address work fine.
9. Send a real test to Gmail and Outlook before considering this done.

## 7. What must NOT change

- **`https://yovoice.app/verify-email` stays the action-code continue
  URL** — `ActionCodeSettings` in both `yovoice-website` and `yovoice`
  (`src/lib/auth/action-code-settings.ts` and
  `lib/features/auth/data/action_code_settings.dart`) are independent of
  the SMTP method. Switching `DEFAULT` → `CUSTOM_SMTP` only changes who
  sends the email and from what address — not the link inside it, not the
  handler page that applies it. No code changes needed here when SMTP is
  configured.
- Templates' `%LINK%` placeholder still resolves to the same
  `continueUrl`-bearing link regardless of sender.

## 8. Final acceptance test (do not consider this migration done without it)

After configuring a provider end-to-end:

1. Register a brand-new account (not a previously-used address).
2. Confirm `accounts:sendOobCode` still returns 200 (should be unaffected
   by the SMTP change).
3. Check a **Gmail** inbox — email must actually arrive, not just avoid
   erroring.
4. Check an **Outlook/Hotmail** inbox — same.
5. Click the link in each, confirm it lands on
   `https://yovoice.app/verify-email`, applies the code, and the account
   shows verified.

Do not mark this migration complete on the strength of "Firebase accepted
the send" alone — that was already true under `DEFAULT` and is exactly
what didn't prove delivery last time.

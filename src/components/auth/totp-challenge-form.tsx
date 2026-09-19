"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  TOTP_CHALLENGE_A11Y,
  formatTotpInput,
  normalizeTotpCode,
  type TotpSignInChallenge,
} from "@/lib/auth/totp-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TotpChallengeFormProps = {
  challenge: TotpSignInChallenge;
  onCancel: () => void;
  onComplete: () => void;
};

export function TotpChallengeForm({
  challenge,
  onCancel,
  onComplete,
}: TotpChallengeFormProps) {
  const descriptionId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFactorUid, setSelectedFactorUid] = useState(
    challenge.factors[0]?.uid ?? "",
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const normalized = normalizeTotpCode(code);
    if (!/^\d{6}$/.test(normalized)) {
      setError("Enter the 6-digit code from your authenticator app.");
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await challenge.resolve(selectedFactorUid, normalized);
      onComplete();
    } catch (challengeError) {
      setError(getAuthErrorMessage(challengeError));
      setSubmitting(false);
      setCode("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <section className="mt-8 w-full" aria-labelledby="totp-challenge-title">
      <button
        type="button"
        onClick={onCancel}
        className="focus-ring -ml-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to password
      </button>

      <div className="mt-5">
        <div className="icon-tile mx-auto size-12">
          <ShieldCheck className="size-6" strokeWidth={1.8} aria-hidden />
        </div>
        <h2
          id="totp-challenge-title"
          className="mt-5 text-center text-2xl font-bold text-white"
        >
          Verify it&apos;s you
        </h2>
        <p
          id={descriptionId}
          className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-text-tertiary"
        >
          Enter the current 6-digit code from the authenticator app connected
          to your YO Voice account.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          {challenge.factors.length > 1 ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-text-secondary">
                Authenticator
              </legend>
              {challenge.factors.map((factor) => (
                <label
                  key={factor.uid}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus)]"
                >
                  <input
                    type="radio"
                    name="totp-factor"
                    value={factor.uid}
                    checked={selectedFactorUid === factor.uid}
                    onChange={() => setSelectedFactorUid(factor.uid)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <span className="text-sm font-semibold text-text-secondary">
                    {factor.displayName}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              {challenge.factors[0]?.displayName}
            </p>
          )}

          <div>
            <label htmlFor="totp-code" className="sr-only">
              {TOTP_CHALLENGE_A11Y.codeLabel}
            </label>
            <Input
              inputRef={inputRef}
              id="totp-code"
              type="text"
              inputMode={TOTP_CHALLENGE_A11Y.inputMode}
              autoComplete={TOTP_CHALLENGE_A11Y.autoComplete}
              pattern="[0-9]*"
              maxLength={TOTP_CHALLENGE_A11Y.maxLength}
              required
              placeholder="000000"
              value={code}
              onChange={(event) => {
                setCode(formatTotpInput(event.target.value));
                if (error) setError(null);
              }}
              icon={<KeyRound className="size-[18px]" />}
              state={error ? "error" : "default"}
              aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
              className="text-center font-mono text-xl tracking-[0.34em]"
            />
            {error ? (
              <p
                id={errorId}
                role="alert"
                data-tone="error"
                className="status-alert mt-2"
              >
                {error}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            isLoading={submitting}
            disabled={code.length !== 6 || !selectedFactorUid}
            className="w-full"
          >
            {submitting ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>
      </div>
    </section>
  );
}

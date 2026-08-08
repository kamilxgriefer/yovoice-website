"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * The password policy this product actually enforces: registration
 * (register-form.tsx) requires 8+ characters and the auth error copy for
 * `auth/weak-password` says the same. Firebase's own default minimum is 6,
 * so 8 is the binding constraint everywhere a password is chosen. Keep the
 * three in sync if this ever changes.
 */
export const MIN_PASSWORD_LENGTH = 8;

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
} {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 0, label: "Too short" };
  }
  let variety = 0;
  if (/[a-z]/.test(password)) variety += 1;
  if (/[A-Z]/.test(password)) variety += 1;
  if (/[0-9]/.test(password)) variety += 1;
  if (/[^a-zA-Z0-9]/.test(password)) variety += 1;

  if (password.length >= 14 && variety >= 3) return { score: 3, label: "Strong" };
  if (password.length >= 10 && variety >= 2) return { score: 2, label: "Good" };
  return { score: 1, label: "Okay" };
}

/**
 * A password input in the site's glass style with a show/hide toggle.
 *
 * Not built on <Input> because that component reserves the trailing slot
 * for its state icons; a password field needs that space for the
 * visibility toggle, which must be a real focusable button with an
 * accessible label.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
  autoFocus = false,
  invalid = false,
  errorMessage,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  autoFocus?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = useId();

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35">
          <Lock className="size-[18px]" />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={cn("glass-input pl-11 pr-12")}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={invalid}
          aria-describedby={invalid && errorMessage ? errorId : undefined}
          data-state={invalid ? "error" : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {invalid && errorMessage ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-rose-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Three-segment strength meter. Purely advisory — submission is gated on
 * the real policy (length), not on reaching a particular color.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (password.length === 0) return null;

  const colors = ["bg-rose-400/80", "bg-amber-400/80", "bg-lime-400/80", "bg-emerald-400/90"];
  const active = colors[score];

  return (
    <div aria-live="polite" className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {[0, 1, 2].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              score > segment ? active : "bg-white/10",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-white/45">{label}</span>
    </div>
  );
}

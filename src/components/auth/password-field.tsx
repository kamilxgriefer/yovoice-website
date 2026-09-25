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
 * Its `label` is visible above the field, as on every <Input>; the
 * placeholder is optional. `describedBy` names hint text the page renders
 * elsewhere (the password rules under the strength meter), read before the
 * error message.
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
  describedBy,
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
  placeholder?: string;
  describedBy?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = useId();
  const describedByIds =
    [describedBy, invalid && errorMessage ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {/* Same slotted structure as Input: leading lock slot, flexible
          text, trailing reveal slot — so the icon can never sit under the
          placeholder or caret, and the geometry is identical whether the
          password is hidden, visible, autofilled or invalid. */}
      <div className="glass-field" data-state={invalid ? "error" : undefined}>
        <span className="glass-field__icon" aria-hidden>
          <Lock className="size-[18px]" />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={cn("glass-field__input")}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={invalid}
          aria-describedby={describedByIds}
          data-state={invalid ? "error" : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          className="glass-field__action rounded-xl text-text-tertiary transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {invalid && errorMessage ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
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

  const colors = ["bg-error", "bg-warning", "bg-[var(--info)]", "bg-success"];
  const active = colors[score];

  return (
    <div aria-live="polite" className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {[0, 1, 2].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              score > segment ? active : "bg-[var(--surface-raised)]",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-text-tertiary">{label}</span>
    </div>
  );
}

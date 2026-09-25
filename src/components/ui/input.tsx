"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type State = "default" | "error" | "success";

/**
 * A labelled, slotted input. The visible `label` sits above the field and is
 * tied to it with `htmlFor` (WCAG 1.3.1, 2.4.6, 3.3.2): a placeholder is only
 * an optional example, never the name of the field, because at large text a
 * placeholder is cut off inside the field and disappears on the first
 * keystroke. The error message below the field is linked with
 * `aria-describedby`, after any description the caller passes.
 *
 * The WRAPPER carries the border, surface and focus ring, and the icon lives
 * in a fixed-width slot beside the text rather than floating over it. The
 * previous version absolutely positioned the icon and relied on a `pl-11`
 * utility for clearance, which the unlayered `.glass-input` padding always
 * beat (Tailwind v4 utilities are layered) — so the icon overlapped the
 * placeholder, the typed value and the caret. With slots the geometry is
 * structural and identical whether the field is empty, focused, autofilled,
 * invalid or showing a password.
 */
export function Input({
  id,
  label,
  icon,
  state = "default",
  errorMessage,
  inputRef,
  className,
  "aria-describedby": describedBy,
  ...rest
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  state?: State;
  errorMessage?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">) {
  const errorId = useId();
  const showError = state === "error" && Boolean(errorMessage);
  const describedByIds =
    [describedBy, showError ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const statusIcon =
    state === "error" ? (
      <XCircle className="size-[min(1.25rem,20px)] text-error" strokeWidth={1.8} />
    ) : state === "success" ? (
      <CheckCircle2 className="size-[min(1.25rem,20px)] text-success" strokeWidth={1.8} />
    ) : null;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div
        className="glass-field"
        data-state={state === "default" ? undefined : state}
      >
        {icon ? (
          <span className="glass-field__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          className={cn("glass-field__input", className)}
          aria-invalid={state === "error"}
          aria-describedby={describedByIds}
          {...rest}
        />
        {statusIcon ? (
          <span className="glass-field__action" aria-hidden>
            {statusIcon}
          </span>
        ) : null}
      </div>
      {showError ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

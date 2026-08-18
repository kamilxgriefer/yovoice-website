"use client";

import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type State = "default" | "error" | "success";

/**
 * A slotted input: the WRAPPER carries the border, surface and focus
 * ring, and the icon lives in a fixed-width slot beside the text rather
 * than floating over it. The previous version absolutely positioned the
 * icon and relied on a `pl-11` utility for clearance, which the unlayered
 * `.glass-input` padding always beat (Tailwind v4 utilities are layered)
 * — so the icon overlapped the placeholder, the typed value and the
 * caret. With slots the geometry is structural and identical whether the
 * field is empty, focused, autofilled, invalid or showing a password.
 */
export function Input({
  icon,
  state = "default",
  errorMessage,
  inputRef,
  className,
  ...rest
}: {
  icon?: ReactNode;
  state?: State;
  errorMessage?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  const statusIcon =
    state === "error" ? (
      <XCircle className="size-5 text-rose-400" />
    ) : state === "success" ? (
      <CheckCircle2 className="size-5 text-emerald-400" />
    ) : null;

  return (
    <div>
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
          className={cn("glass-field__input", className)}
          aria-invalid={state === "error"}
          {...rest}
        />
        {statusIcon ? (
          <span className="glass-field__action" aria-hidden>
            {statusIcon}
          </span>
        ) : null}
      </div>
      {state === "error" && errorMessage ? (
        <p role="alert" className="mt-1.5 text-xs text-rose-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type State = "default" | "error" | "success";

export function Input({
  icon,
  state = "default",
  errorMessage,
  className,
  ...rest
}: {
  icon?: ReactNode;
  state?: State;
  errorMessage?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  return (
    <div>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35">
            {icon}
          </span>
        ) : null}
        <input
          className={cn("glass-input", icon && "pl-11", (state === "error" || state === "success") && "pr-11", className)}
          data-state={state === "default" ? undefined : state}
          aria-invalid={state === "error"}
          {...rest}
        />
        {state === "error" ? (
          <XCircle className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-rose-400" />
        ) : null}
        {state === "success" ? (
          <CheckCircle2 className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-emerald-400" />
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

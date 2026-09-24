"use client";

import { useState, type ReactNode } from "react";

/**
 * A form row that belongs to only one of Log in / Create account. When the
 * visitor has just switched modes (`enter`), it unfolds from zero height
 * while the shared fields slide to make room; otherwise it is simply there.
 *
 * The row owns its bottom spacing (see `.auth-fold` in globals.css) so that
 * at zero height it takes no space at all — the shared email and password
 * fields then start exactly where the previous form left them.
 */
export function AuthFold({ enter, children }: { enter: boolean; children: ReactNode }) {
  const [unfolding, setUnfolding] = useState(enter);
  return (
    <div
      className="auth-fold"
      data-unfolding={unfolding ? "" : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setUnfolding(false);
      }}
    >
      <div className="auth-fold__body">
        <div className="auth-fold__content">{children}</div>
      </div>
    </div>
  );
}

/**
 * The space a row of the previous form occupied, folding away. Rendered only
 * right after a switch, so the rows below (and the submit button) travel from
 * where they were instead of jumping. `field` is one input row; `link` is the
 * Forgot password row.
 */
export function AuthFoldAway({ size }: { size: "field" | "link" }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div
      aria-hidden="true"
      className="auth-fold-away"
      data-size={size}
      onAnimationEnd={() => setGone(true)}
    />
  );
}

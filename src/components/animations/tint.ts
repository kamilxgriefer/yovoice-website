/**
 * `amount` of `to` over `from`, both #rrggbb: how the scroll cinema lifts a
 * deep flood toward its bright core (the story's chapter tints, What you
 * get's room light, the finale's flood). Worked out here rather than with
 * CSS `color-mix()`, so older browsers still paint the floods.
 */
export function mix(from: string, to: string, amount: number): string {
  const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
  return `#${[1, 3, 5]
    .map((at) => Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * amount))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** A #rrggbb colour at `amount` opacity, as `rgb(r g b / a)`. */
export function alpha(hex: string, amount: number): string {
  const channel = (at: number) => parseInt(hex.slice(at, at + 2), 16);
  return `rgb(${channel(1)} ${channel(3)} ${channel(5)} / ${amount})`;
}

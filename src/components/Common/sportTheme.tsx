import { FC } from "react";
import { isBrightColor } from "../../_utility/isBrightColor";

// The shared look of the sports that use the sport banner (baseball and
// volleyball). One place decides how a team's colours are used and what a
// result or a live match looks like, so the pages cannot drift apart.
// TechDocs/sport-ui-guide.md explains the rules.

const NEUTRAL = "#4B5563";

/**
 * A team's colours for a coloured surface (banner, strip, tile edge). A very
 * bright primary (white, yellow) swaps with the secondary so white text stays
 * readable; the other one is the accent. A team whose two colours match gets
 * white as its accent.
 */
export const sportTeamColors = (
  one?: string | null,
  two?: string | null,
): { color: string; accent: string } => {
  const first = one || NEUTRAL;
  const second = two || first;
  const [color, accent] = isBrightColor(first) ? [second, first] : [first, second];
  return {
    color,
    accent: accent.toLowerCase() === color.toLowerCase() ? "#FFFFFF" : accent,
  };
};

/** Where a match stands, for its colours and its label. */
export type SportMatchState = "win" | "loss" | "live" | "next" | "upcoming";

/** Text colour for a state, from the site's theme. */
export const sportStateText: Record<SportMatchState, string> = {
  win: "text-(--accent-success)",
  loss: "text-(--accent-error)",
  live: "text-(--accent-error)",
  next: "text-(--accent-primary)",
  upcoming: "text-(--text-muted)",
};

/**
 * A games-bar card for a state, as the other sports draw theirs: a result
 * is outlined in its colour and its body takes a light tint of it. The next
 * match and a live one are outlined only; upcoming ones are plain.
 */
export const sportStateCard: Record<SportMatchState, string> = {
  win: "border-2 border-(--accent-success) bg-[color-mix(in_srgb,var(--accent-success)_14%,var(--sport-surface))] [box-shadow:var(--sport-shadow)]",
  loss: "border-2 border-(--accent-error) bg-[color-mix(in_srgb,var(--accent-error)_14%,var(--sport-surface))] [box-shadow:var(--sport-shadow)]",
  live: "border-2 border-(--accent-error) bg-(--sport-surface) [box-shadow:var(--sport-shadow)]",
  next: "border-2 border-(--accent-primary) bg-(--sport-surface) [box-shadow:var(--sport-shadow)]",
  upcoming: "border-2 border-transparent bg-(--sport-surface) [box-shadow:var(--sport-shadow)] opacity-80",
};

/**
 * Laid over a card for a road match: a faint shade over whatever the card's
 * own colour is, so home and away tell apart without competing with the
 * result. A neutral-site match is left as a home one.
 */
export const sportAwayShade =
  // A dark surface needs more of it to show at all.
  "bg-[linear-gradient(light-dark(rgb(0_0_0/0.06),rgb(0_0_0/0.22)),light-dark(rgb(0_0_0/0.06),rgb(0_0_0/0.22)))]";

/** A small solid label: W, L. */
export const sportStatePill: Record<"win" | "loss", string> = {
  win: "bg-(--accent-success) text-white",
  loss: "bg-(--accent-error) text-white",
};

/**
 * The one way to say a match is on air: a pulsing dot and "Live". Use it
 * everywhere a match is live, in tiles, tables and headers alike.
 */
export const LiveBadge: FC<{ label?: string; className?: string }> = ({
  label = "Live",
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide text-(--accent-error) ${className}`}
  >
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent-error) opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-(--accent-error)" />
    </span>
    {label}
  </span>
);

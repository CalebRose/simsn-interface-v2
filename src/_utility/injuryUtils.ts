import { Player } from "../models/baseball/baseballModels";

// ─── Simple gates ─────────────────────────────────────────────────────────────

/** True if any active injury has stamina_pct = 0 (player completely benched). */
export function isPlayerBenched(player: Player): boolean {
  return (
    player.is_injured === true &&
    (player.injury_details ?? []).some((inj) => (inj.effects?.stamina_pct ?? 1) === 0.0)
  );
}

// ─── Display text helpers ─────────────────────────────────────────────────────

/** Short label: "Strained Hamstring (3w)" or "2 injuries". Null if not injured. */
export function injuryLabel(player: Player): string | null {
  if (!player.is_injured || !player.injury_details?.length) return null;
  if (player.injury_details.length === 1) {
    const inj = player.injury_details[0];
    return `${inj.injury_name} (${inj.weeks_remaining}w)`;
  }
  return `${player.injury_details.length} injuries`;
}

/** Multi-line tooltip: one line per active injury. Null if not injured. */
export function injuryTooltip(player: Player): string | null {
  if (!player.is_injured || !player.injury_details?.length) return null;
  return player.injury_details
    .map((inj) => `${inj.injury_name} — ${inj.weeks_remaining}w remaining`)
    .join("\n");
}

// ─── Effect analysis ──────────────────────────────────────────────────────────

const ATTR_LABELS: Record<string, string> = {
  contact:      "Contact",
  power:        "Power",
  speed:        "Speed",
  eye:          "Eye",
  discipline:   "Discipline",
  fieldreact:   "Field React",
  fieldcatch:   "Field Catch",
  throwpower:   "Throw Pow",
  throwacc:     "Throw Acc",
  basereaction: "Base Rctn",
  baserunning:  "Baserunning",
  pendurance:   "Endurance",
  pgencontrol:  "Gen Control",
  psequencing:  "Sequencing",
  pthrowpower:  "Velo",
  pickoff:      "Pickoff",
  stamina_pct:  "Stamina",
};

export interface InjuryEffectEntry {
  attr:        string;
  factor:      number;
  displayName: string;
  pct:         number; // e.g. 30 → "−30%"
}

/**
 * Combined attribute reduction entries across all concurrent injuries.
 * Stacking is multiplicative (0.7 × 0.9 = 0.63 total factor).
 */
export function injuryEffects(player: Player): InjuryEffectEntry[] {
  const combined: Record<string, number> = {};
  for (const inj of player.injury_details ?? []) {
    for (const [attr, factor] of Object.entries(inj.effects ?? {})) {
      combined[attr] = (combined[attr] ?? 1.0) * factor;
    }
  }
  return Object.entries(combined)
    .filter(([, f]) => f < 1.0)
    .map(([attr, factor]) => ({
      attr,
      factor,
      displayName: ATTR_LABELS[attr] ?? attr,
      pct: Math.round((1.0 - factor) * 100),
    }));
}

/**
 * Set of base attribute keys reduced by active injuries.
 * Used to flag cells in attribute grids.
 * Frontend display fields use `contact_display`; strip `_display` to match.
 */
export function affectedAttributeKeys(player: Player): Set<string> {
  const keys = new Set<string>();
  for (const inj of player.injury_details ?? []) {
    for (const attr of Object.keys(inj.effects ?? {})) {
      keys.add(attr);
    }
  }
  return keys;
}

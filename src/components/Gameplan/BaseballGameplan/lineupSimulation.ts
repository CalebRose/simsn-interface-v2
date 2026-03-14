import { Player, PlayerRatings, DisplayValue } from "../../../models/baseball/baseballModels";
import {
  DefenseAssignment,
  PositionCode,
  LineupRole,
} from "../../../models/baseball/baseballGameplanModels";
import { DEFENSE_POSITION_ORDER, PositionRatingKey } from "./BaseballGameplanConstants";
import { letterGradeToNumeric } from "../../../_utility/baseballHelpers";

// --- Public types ---

export interface SimulatedStarter {
  player: Player;
  position: PositionCode;
  battingSlot: number;
  role: LineupRole;
}

export interface SimulatedLineup {
  label: string;
  vsHand: "L" | "R";
  starters: SimulatedStarter[];
}

// --- Helpers ---

function rat(val: DisplayValue | undefined): number {
  if (val == null) return 0;
  if (typeof val === "string") return letterGradeToNumeric(val);
  return val;
}

/** Approximate the backend's offense_score from batting ratings. */
function offenseScore(p: Player): number {
  if (rat(p.ratings.dh_rating) > 0) return rat(p.ratings.dh_rating);
  return (rat(p.ratings.contact_display) + rat(p.ratings.power_display) + rat(p.ratings.eye_display)) / 3;
}

/** Get position-specific rating for a player. */
function posRating(p: Player, pos: PositionCode): number {
  const key = PositionRatingKey[pos] as keyof PlayerRatings;
  return rat(p.ratings[key] as DisplayValue);
}

// --- Defense Simulation ---

interface DefenseStarter {
  player: Player;
  position: PositionCode;
  assignment: DefenseAssignment;
}

/**
 * Simulate picking starters from the depth chart for a single game.
 * Returns starters with their originating assignment (for batting preferences).
 */
function simulateDefense(
  players: Player[],
  assignments: DefenseAssignment[],
  vsHand: "L" | "R",
  jitter: number,
): DefenseStarter[] {
  const usedPlayerIds = new Set<number>();
  const starters: DefenseStarter[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Fill field positions in eval order
  for (const pos of DEFENSE_POSITION_ORDER) {
    const candidates = assignments.filter(
      (a) => a.position_code === pos && (a.vs_hand === "both" || a.vs_hand === vsHand) && !usedPlayerIds.has(a.player_id),
    );

    if (candidates.length > 0) {
      const scored = candidates
        .map((a) => {
          const p = playerMap.get(a.player_id);
          if (!p) return null;
          const pRat = posRating(p, pos);
          const off = offenseScore(p);
          const score =
            (pRat * 0.7 + off * 0.3) +
            a.target_weight +
            (a.locked ? 1000 : 0) +
            (jitter > 0 ? (Math.random() - 0.5) * jitter : 0);
          return { player: p, assignment: a, score };
        })
        .filter(Boolean) as { player: Player; assignment: DefenseAssignment; score: number }[];

      scored.sort((a, b) => b.score - a.score);
      if (scored.length > 0) {
        starters.push({ player: scored[0].player, position: pos, assignment: scored[0].assignment });
        usedPlayerIds.add(scored[0].player.id);
      }
    }

    // Fallback to best available by rating
    if (!starters.some((s) => s.position === pos)) {
      const fallback = players
        .filter((p) => !usedPlayerIds.has(p.id))
        .map((p) => ({ player: p, score: posRating(p, pos) + (jitter > 0 ? (Math.random() - 0.5) * jitter : 0) }))
        .sort((a, b) => b.score - a.score);
      if (fallback.length > 0) {
        starters.push({
          player: fallback[0].player,
          position: pos,
          assignment: {
            position_code: pos,
            vs_hand: "both",
            player_id: fallback[0].player.id,
            target_weight: 1.0,
            priority: 0,
            locked: false,
            lineup_role: "balanced",
            min_order: null,
            max_order: null,
          },
        });
        usedPlayerIds.add(fallback[0].player.id);
      }
    }
  }

  // DH
  const dhCandidates = assignments.filter(
    (a) => a.position_code === "dh" && (a.vs_hand === "both" || a.vs_hand === vsHand) && !usedPlayerIds.has(a.player_id),
  );
  if (dhCandidates.length > 0) {
    const scored = dhCandidates
      .map((a) => {
        const p = playerMap.get(a.player_id);
        if (!p) return null;
        return { player: p, assignment: a, score: offenseScore(p) + a.target_weight + (a.locked ? 1000 : 0) };
      })
      .filter(Boolean) as { player: Player; assignment: DefenseAssignment; score: number }[];
    scored.sort((a, b) => b.score - a.score);
    if (scored.length > 0) {
      starters.push({ player: scored[0].player, position: "dh", assignment: scored[0].assignment });
      usedPlayerIds.add(scored[0].player.id);
    }
  }
  if (!starters.some((s) => s.position === "dh")) {
    const remaining = players
      .filter((p) => !usedPlayerIds.has(p.id))
      .map((p) => ({ player: p, score: offenseScore(p) }))
      .sort((a, b) => b.score - a.score);
    if (remaining.length > 0) {
      starters.push({
        player: remaining[0].player,
        position: "dh",
        assignment: {
          position_code: "dh",
          vs_hand: "both",
          player_id: remaining[0].player.id,
          target_weight: 1.0,
          priority: 0,
          locked: false,
          lineup_role: "balanced",
          min_order: null,
          max_order: null,
        },
      });
    }
  }

  return starters;
}

// --- Batting Order Simulation ---

/** Score a player for a lineup role (mirrors backend formulas). */
function scoreForRole(p: Player, role: LineupRole): number {
  const r = p.ratings;
  switch (role) {
    case "table_setter":
    case "on_base":
      return rat(r.eye_display) * 0.5 + rat(r.discipline_display) * 0.3 + rat(r.contact_display) * 0.2;
    case "slugger":
      return rat(r.power_display) * 0.7 + offenseScore(p) * 0.3;
    case "speed":
      return rat(r.speed_display) * 0.7 + offenseScore(p) * 0.3;
    case "balanced":
      return offenseScore(p);
    case "bottom":
      return -offenseScore(p);
    default:
      return offenseScore(p);
  }
}

/**
 * Build the batting order from defense starters using per-assignment batting preferences.
 *
 * 1. Place constrained players (those with min_order/max_order) first, tightest ranges first.
 * 2. Fill remaining slots with unconstrained players by role scoring.
 */
function simulateBattingOrder(starters: DefenseStarter[]): SimulatedStarter[] {
  const slots = 9;
  const result: (SimulatedStarter | null)[] = new Array(slots).fill(null);
  const placed = new Set<number>();

  // Separate constrained vs unconstrained
  const constrained = starters.filter(
    (s) => s.assignment.min_order != null || s.assignment.max_order != null,
  );
  const unconstrained = starters.filter(
    (s) => s.assignment.min_order == null && s.assignment.max_order == null,
  );

  // Sort constrained by range tightness (tighter ranges first)
  constrained.sort((a, b) => {
    const rangeA = (a.assignment.max_order ?? slots) - (a.assignment.min_order ?? 1);
    const rangeB = (b.assignment.max_order ?? slots) - (b.assignment.min_order ?? 1);
    return rangeA - rangeB;
  });

  // Place constrained players
  for (const s of constrained) {
    const minSlot = (s.assignment.min_order ?? 1) - 1; // 0-indexed
    const maxSlot = (s.assignment.max_order ?? slots) - 1;
    let bestIdx = -1;

    // Find the best open slot within range
    for (let i = minSlot; i <= maxSlot && i < slots; i++) {
      if (!result[i]) {
        bestIdx = i;
        break;
      }
    }
    if (bestIdx >= 0) {
      result[bestIdx] = {
        player: s.player,
        position: s.position,
        battingSlot: bestIdx + 1,
        role: s.assignment.lineup_role ?? "balanced",
      };
      placed.add(s.player.id);
    }
  }

  // Fill remaining slots with unconstrained players by role scoring.
  // Use a default role progression for empty slots.
  const defaultRoles: LineupRole[] = [
    "table_setter", "on_base", "slugger", "slugger",
    "balanced", "balanced", "balanced", "speed", "bottom",
  ];

  for (let i = 0; i < slots; i++) {
    if (result[i]) continue;

    // Pool: unconstrained that haven't been placed, plus any constrained that couldn't be placed
    const available = starters.filter((s) => !placed.has(s.player.id));
    if (available.length === 0) break;

    // For unconstrained players that have a lineup_role, use that role for scoring.
    // For the slot's fallback, use the default role progression.
    const slotDefaultRole = defaultRoles[i] ?? "balanced";

    const scored = available
      .map((s) => {
        const role = s.assignment.lineup_role ?? slotDefaultRole;
        // Check if this unconstrained player's role naturally fits this slot position
        const score = scoreForRole(s.player, role);
        return { ...s, score, effectiveRole: role };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    result[i] = {
      player: best.player,
      position: best.position,
      battingSlot: i + 1,
      role: best.effectiveRole,
    };
    placed.add(best.player.id);
  }

  return result.filter(Boolean) as SimulatedStarter[];
}

// --- Public API ---

/**
 * Simulate 4 game lineups for a week.
 * Game A: vs RHP, no jitter (pure best-fit)
 * Game B: vs LHP, no jitter (shows platoon effect)
 * Game C: vs RHP, with jitter (usage rotation)
 * Game D: vs LHP, with jitter (usage rotation)
 */
export function simulateWeekLineups(
  players: Player[],
  assignments: DefenseAssignment[],
): SimulatedLineup[] {
  if (players.length === 0) return [];

  const configs: { label: string; vsHand: "L" | "R"; jitter: number }[] = [
    { label: "Game A (vs RHP)", vsHand: "R", jitter: 0 },
    { label: "Game B (vs LHP)", vsHand: "L", jitter: 0 },
    { label: "Game C (vs RHP)", vsHand: "R", jitter: 8 },
    { label: "Game D (vs LHP)", vsHand: "L", jitter: 8 },
  ];

  return configs.map(({ label, vsHand, jitter }) => {
    const defStarters = simulateDefense(players, assignments, vsHand, jitter);
    const lineup = simulateBattingOrder(defStarters);
    return { label, vsHand, starters: lineup };
  });
}

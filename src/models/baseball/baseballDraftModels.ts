// ═══════════════════════════════════════════════
// Draft Phase
// ═══════════════════════════════════════════════

export type DraftPhase = "SETUP" | "IN_PROGRESS" | "PAUSED" | "SIGNING" | "COMPLETE";

// ═══════════════════════════════════════════════
// Round Modes
// ═══════════════════════════════════════════════

export type RoundMode = "live" | "auto";

export interface RoundModeConfig {
  round: number;
  mode: RoundMode;
}

// ═══════════════════════════════════════════════
// Draft State (from GET /draft/state)
// ═══════════════════════════════════════════════

export interface BaseballDraftState {
  league_year_id: number;
  phase: DraftPhase;
  current_round: number;
  current_pick: number;            // 1-30 within round
  total_rounds: number;
  picks_per_round: number;
  seconds_per_pick: number;
  is_snake: boolean;
  pick_deadline_at: string | null; // ISO timestamp, null when paused/auto
  seconds_remaining: number | null;
  current_round_mode: RoundMode;
  auto_rounds_locked: boolean;
}

// ═══════════════════════════════════════════════
// Draft Pick (from GET /draft/board)
// ═══════════════════════════════════════════════

export type SignStatus = "pending" | "signed" | "passed" | "refused";

export interface BaseballDraftPick {
  pick_id: number;
  round: number;
  pick_in_round: number;
  overall_pick: number;
  original_org_id: number;
  current_org_id: number;
  player_id: number | null;
  player_name: string | null;
  picked_at: string | null;
  is_auto_pick: boolean;
  slot_value: number;
  sign_status: SignStatus | null;
}

// ═══════════════════════════════════════════════
// Draft Board Response (GET /draft/board)
// ═══════════════════════════════════════════════

export interface DraftBoardResponse {
  picks: BaseballDraftPick[];
}

// ═══════════════════════════════════════════════
// Eligible Players (from GET /draft/eligible)
// ═══════════════════════════════════════════════

export interface BaseballDraftee {
  player_id: number;
  first_name: string;
  last_name: string;
  age: number;
  source: "college" | "hs";
  draft_rank: number | null;
  composite_score: number | null;
  star_rating: number | null;
  pitcher_role: string | null;
  position: string;
  height: number;
  weight: number;
  bat_hand: string;
  throw_hand: string;
  overall_grade: string | null;
  is_draft_eligible: boolean;
  college_team?: string;
  college_abbrev?: string;
  bio?: {
    firstname: string;
    lastname: string;
    age: number;
    ptype: "Pitcher" | "Position";
    height: number;
    weight: number;
    bat_hand: string;
    pitch_hand: string;
    arm_angle: string | null;
    durability: number | string;
    injury_risk: number | string;
    pitch1_name: string | null;
    pitch2_name: string | null;
    pitch3_name: string | null;
    pitch4_name: string | null;
    pitch5_name: string | null;
  };
  attributes?: Record<string, any>;
  potentials?: Record<string, any>;
  letter_grades?: Record<string, any>;
  ratings?: Record<string, any>;
  scouting?: {
    unlocked: string[];
    attrs_precise: boolean;
    pots_precise: boolean;
    available_actions: string[];
  };
}

export interface EligiblePlayersParams {
  league_year_id: number;
  available_only?: boolean;
  source?: "college" | "hs";
  search?: string;
  viewing_org_id?: number;
  limit?: number;
  offset?: number;
}

export interface EligiblePlayersResponse {
  players: BaseballDraftee[];
  total: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════
// Draft Initialize (POST /draft/admin/initialize)
// ═══════════════════════════════════════════════

export interface DraftInitializeParams {
  league_year_id: number;
  total_rounds?: number;
  seconds_per_pick?: number;
  is_snake?: boolean;
  live_rounds?: number[];
}

export interface DraftInitializeResponse {
  league_year_id: number;
  total_rounds: number;
  picks_per_round: number;
  total_picks: number;
  eligible_players: number;
  draft_order: number[];
  live_rounds: number[];
}

// ═══════════════════════════════════════════════
// Making a Pick (POST /draft/pick)
// ═══════════════════════════════════════════════

export interface MakePickRequest {
  league_year_id: number;
  org_id: number;
  player_id: number;
}

export interface MakePickResponse {
  pick_id: number;
  round: number;
  pick_in_round: number;
  overall_pick: number;
  org_id: number;
  player_id: number;
  player_name: string;
  is_auto_pick: boolean;
  draft_complete: boolean;
  auto_round_next: boolean;
}

// ═══════════════════════════════════════════════
// Auto-Draft Preferences
// ═══════════════════════════════════════════════

export interface AutoDraftQueueEntry {
  player_id: number;
  priority: number;
}

export interface AutoDraftPreferences {
  org_id: number;
  pitcher_quota: number;
  hitter_quota: number;
  locked: boolean;
  queue: AutoDraftQueueEntry[];
}

export interface SetAutoPrefsRequest {
  league_year_id: number;
  org_id: number;
  pitcher_quota?: number;
  hitter_quota?: number;
  queue?: number[];
}

// ═══════════════════════════════════════════════
// Auto Rounds (POST /draft/admin/run-auto-rounds)
// ═══════════════════════════════════════════════

export interface AutoRoundsResponse {
  picks_made: number;
  picks: MakePickResponse[];
}

// ═══════════════════════════════════════════════
// Signing (POST /draft/sign/{pick_id})
// ═══════════════════════════════════════════════

export interface SignPickResponse {
  transaction_id: number;
  contract_id: number;
  player_id: number;
  player_name: string;
  org_id: number;
  slot_value: number;
  years: number;
}

export interface PassPickResponse {
  draft_pick_id: number;
  status: "passed";
}

// ═══════════════════════════════════════════════
// Draft Trade
// ═══════════════════════════════════════════════

export interface DraftTradeRequest {
  league_year_id: number;
  pick_id: number;
  from_org_id: number;
  to_org_id: number;
  trade_proposal_id?: number | null;
}

export interface DraftTradeProposal {
  id: number;
  league_year_id: number;
  proposing_org_id: number;
  proposing_org_abbrev: string;
  receiving_org_id: number;
  receiving_org_abbrev: string;
  picks_offered: number[];
  picks_requested: number[];
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

// ═══════════════════════════════════════════════
// WebSocket Message Types
// ═══════════════════════════════════════════════

export type BaseballDraftWSMessage =
  | { type: "draft_state_change"; phase: DraftPhase; current_round: number; current_pick: number }
  | { type: "draft_pick_made"; pick_id: number; round: number; pick_in_round: number; overall_pick: number; org_id: number; player_id: number; player_name: string; is_auto_pick: boolean; draft_complete: boolean; auto_round_next: boolean }
  | { type: "draft_trade_completed"; round: number; pick_in_round: number; from_org_id: number; to_org_id: number }
  | { type: "auto_rounds_started"; league_year_id: number; starting_round: number }
  | { type: "auto_rounds_completed"; league_year_id: number; picks_made: number };

// ═══════════════════════════════════════════════
// Constants & Helpers
// ═══════════════════════════════════════════════

export const ROUNDS = 20;
export const PICKS_PER_ROUND = 30;
export const TOTAL_PICKS = ROUNDS * PICKS_PER_ROUND;

export const BASEBALL_DRAFT_POSITIONS = [
  { value: "C", label: "Catcher" },
  { value: "1B", label: "First Base" },
  { value: "2B", label: "Second Base" },
  { value: "3B", label: "Third Base" },
  { value: "SS", label: "Shortstop" },
  { value: "LF", label: "Left Field" },
  { value: "CF", label: "Center Field" },
  { value: "RF", label: "Right Field" },
  { value: "DH", label: "Designated Hitter" },
  { value: "SP", label: "Starting Pitcher" },
  { value: "RP", label: "Relief Pitcher" },
];

export const formatDraftTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatSlotValue = (value: number): string => {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

export type BaseballDraftTab =
  | "bigboard"
  | "eligible"
  | "scouting"
  | "warroom"
  | "preferences"
  | "mypicks"
  | "signing"
  | "admin";

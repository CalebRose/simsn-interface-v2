// ═══════════════════════════════════════════════
// Baseball Draft Pick
// ═══════════════════════════════════════════════

export interface BaseballDraftPick {
  id: number;
  round: number;
  pick_number: number;         // 1-30 within round
  overall_pick: number;        // 1-150 overall
  org_id: number;
  org_abbrev: string;
  original_org_id: number;     // for traded picks
  original_org_abbrev: string;
  selected_player_id: number | null;
  selected_player_name: string | null;
  selected_player_position: string | null;
  selected_player_college: string | null;
  selected_player_college_abbrev: string | null;
  slot_value: number;          // $ slot value for this pick
}

// ═══════════════════════════════════════════════
// Baseball Draftee (available player)
// ═══════════════════════════════════════════════

export interface BaseballDraftee {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  college_team: string;
  college_abbrev: string;
  height: number;              // inches
  weight: number;              // pounds
  bat_hand: string;            // L | R | S
  throw_hand: string;          // L | R
  overall_grade: string | null;    // letter grade from scouting
  draft_rank: number | null;       // consensus rank
  is_draft_eligible: boolean;
}

// ═══════════════════════════════════════════════
// Draft State
// ═══════════════════════════════════════════════

export type DraftPhase = "pre_draft" | "drafting" | "signing" | "complete";

export interface BaseballDraftState {
  league_year_id: number;
  current_round: number;
  current_pick: number;           // 1-30 within round
  current_overall: number;        // 1-150
  is_paused: boolean;
  seconds_remaining: number;
  end_time: string;               // ISO timestamp
  phase: DraftPhase;
  all_picks: BaseballDraftPick[];  // flat array of 150 picks
}

// ═══════════════════════════════════════════════
// Draft Signing
// ═══════════════════════════════════════════════

export type SigningStatus = "unsigned" | "offered" | "signed" | "refused";

export interface BaseballDraftSigningStatus {
  pick_id: number;
  overall_pick: number;
  player_id: number;
  player_name: string;
  slot_value: number;
  offered_amount: number | null;
  status: SigningStatus;
  signed_amount: number | null;
}

// ═══════════════════════════════════════════════
// Draft Board Response
// ═══════════════════════════════════════════════

export interface DraftBoardParams {
  league_year_id: number;
  position?: string;
  search?: string;
  bat_hand?: string;
  throw_hand?: string;
  page?: number;
  page_size?: number;
  exclude_drafted?: boolean;
}

export interface DraftBoardResponse {
  players: BaseballDraftee[];
  total: number;
  page: number;
  pages: number;
}

// ═══════════════════════════════════════════════
// Draft Trade
// ═══════════════════════════════════════════════

export interface DraftTradeProposal {
  id: number;
  league_year_id: number;
  proposing_org_id: number;
  proposing_org_abbrev: string;
  receiving_org_id: number;
  receiving_org_abbrev: string;
  picks_offered: number[];       // pick IDs
  picks_requested: number[];     // pick IDs
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

// ═══════════════════════════════════════════════
// Websocket Message Types
// ═══════════════════════════════════════════════

export type BaseballDraftWSMessage =
  | { type: "draft_state"; data: BaseballDraftState }
  | { type: "draft_pick_made"; data: DraftPickMadeData }
  | { type: "draft_timer_update"; data: { seconds_remaining: number; end_time: string } }
  | { type: "draft_paused"; data: { is_paused: boolean } }
  | { type: "draft_phase_change"; data: { phase: DraftPhase } }
  | { type: "draft_signing_update"; data: BaseballDraftSigningStatus };

export interface DraftPickMadeData {
  pick: BaseballDraftPick;
  current_round: number;
  current_pick: number;
  current_overall: number;
  seconds_remaining: number;
  end_time: string;
}

// ═══════════════════════════════════════════════
// Constants & Helpers
// ═══════════════════════════════════════════════

export const ROUNDS = 5;
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

export const getBaseballDraftTimerSeconds = (round: number): number => {
  if (round === 1) return 300;
  if (round <= 3) return 180;
  return 120;
};

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
  | "draftboard"
  | "scouting"
  | "warroom"
  | "signing"
  | "admin";

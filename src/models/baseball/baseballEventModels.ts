// ═══════════════════════════════════════════════
// Special Events — Playoffs, All-Star, WBC
// ═══════════════════════════════════════════════

// --- Playoffs / Bracket ---

export interface BracketTeam {
  id: number;
  abbrev: string;
  seed: number;
}

export type SeriesStatus = "pending" | "active" | "complete";

export interface PlayoffSeries {
  series_id: number;
  conference: string | null; // "AL" | "NL" | null
  team_a: BracketTeam;
  team_b: BracketTeam;
  wins_a: number;
  wins_b: number;
  series_length: number;
  status: SeriesStatus;
  winner: { id: number; abbrev: string } | null;
}

export interface CWSBracketEntry {
  team_id: number;
  team_abbrev: string;
  seed: number;
  qualification: "conf_champ" | "at_large";
  losses: number;
  eliminated: boolean;
  bracket_side: "winners" | "losers" | "eliminated";
}

export interface PlayoffBracketResponse {
  league_year_id: number;
  league_level: number;
  rounds: Record<string, PlayoffSeries[]>;
  cws_bracket?: CWSBracketEntry[];
}

// Round display order by league level
export const MLB_ROUND_ORDER = ["WC", "DS", "CS", "WS"] as const;
export const MILB_ROUND_ORDER = ["QF", "SF", "F"] as const;
export const CWS_ROUND_ORDER = [
  "CWS_W1", "CWS_W2", "CWS_W3", "CWS_L1", "CWS_L2", "CWS_L3", "CWS_F1", "CWS_F2",
] as const;

export const ROUND_LABELS: Record<string, string> = {
  WC: "Wild Card",
  DS: "Division Series",
  CS: "Championship Series",
  WS: "World Series",
  QF: "Quarterfinals",
  SF: "Semifinals",
  F: "Finals",
  CWS_W1: "Winners Round 1",
  CWS_W2: "Winners Round 2",
  CWS_W3: "Winners Round 3",
  CWS_L1: "Losers Round 1",
  CWS_L2: "Losers Round 2",
  CWS_L3: "Losers Round 3",
  CWS_F1: "Championship",
  CWS_F2: "Championship (If Necessary)",
};

// --- Pending Games ---

export interface PendingGame {
  game_id: number;
  away_team: number;
  home_team: number;
  away_abbrev: string;
  home_abbrev: string;
  season_week: number;
  season_subweek: string;
  series_id: number;
  round: string;
  series_number: number;
  wins_a: number;
  wins_b: number;
  series_length: number;
  series_status: SeriesStatus;
}

export interface PendingGamesResponse {
  games: PendingGame[];
}

// --- Series helpers ---

export const SERIES_LENGTH_LABEL: Record<number, string> = {
  1: "Single Game",
  3: "Best of 3",
  5: "Best of 5",
  7: "Best of 7",
};

export const CLINCH_WINS: Record<number, number> = {
  1: 1,
  3: 2,
  5: 3,
  7: 4,
};

// --- All-Star Game ---

export interface AllStarPlayer {
  player_id: number;
  name: string;
  team: string;
  position: string;
  is_starter: boolean;
  source: "auto" | "manual";
}

export interface AllStarRostersResponse {
  event_id: number;
  rosters: {
    AL: AllStarPlayer[];
    NL: AllStarPlayer[];
  };
}

export interface AllStarGameResult {
  game_id: number;
  home_score: number;
  away_score: number;
  home_team_id: number;
  away_team_id: number;
  winning_team_id: number;
  game_outcome: string;
}

export type AllStarStatus = "setup" | "roster_ready" | "complete";

export interface AllStarResultsResponse {
  event_id: number;
  status: AllStarStatus;
  game_result: AllStarGameResult | null;
  rosters: {
    AL: AllStarPlayer[];
    NL: AllStarPlayer[];
  };
}

// --- World Baseball Classic ---

export interface WBCTeam {
  country_name: string;
  country_code: string;
  pool_group: string;
  pool_wins: number;
  pool_losses: number;
  eliminated: boolean;
  seed: number;
}

export interface WBCTeamsResponse {
  teams: WBCTeam[];
}

export interface WBCRosterPlayer {
  player_id: number;
  name: string;
  position: string;
}

export interface WBCRostersResponse {
  rosters: Record<string, WBCRosterPlayer[]>;
}

// --- Special Events List (standalone endpoint) ---

export type SpecialEventType = "allstar" | "wbc" | "playoff";

export interface SpecialEvent {
  id: number | null;
  league_year_id: number;
  event_type: SpecialEventType;
  status: string;
  created_at: string | null;
  completed_at: string | null;
  // Playoff-specific
  league_level?: number;
  total_series?: number;
  completed_series?: number;
  latest_round?: string;
}

export interface SpecialEventsResponse {
  events: SpecialEvent[];
}

// --- Bootstrap-embedded special event payloads ---

import { BaseballGame } from "./baseballModels";

export interface BootstrapPlayoffEvent {
  event_type: "playoff";
  league_level: number;
  series: BootstrapPlayoffSeries[];
}

export interface BootstrapPlayoffSeries {
  round: string;
  conference?: string | null;
  series_id: number;
  team_a_id: number;
  team_a_abbrev?: string;
  team_a_seed?: number;
  team_b_id: number;
  team_b_abbrev?: string;
  team_b_seed?: number;
  wins_a: number;
  wins_b: number;
  series_length: number;
  status: SeriesStatus;
  winner_id?: number | null;
  winner_abbrev?: string | null;
}

export interface BootstrapAllStarEvent {
  event_type: "allstar";
  status?: AllStarStatus;
  rosters: {
    AL: AllStarPlayer[];
    NL: AllStarPlayer[];
  };
  game_result?: AllStarGameResult | null;
}

export interface BootstrapWBCEvent {
  event_type: "wbc";
  status: string;
  teams: WBCTeam[];
  games: BaseballGame[];
  team_map: Record<string, number>;
}

export type BootstrapSpecialEvent =
  | BootstrapPlayoffEvent
  | BootstrapAllStarEvent
  | BootstrapWBCEvent;

/**
 * Convert bootstrap playoff series to the PlayoffSeries shape used by components.
 */
export function bootstrapSeriesToPlayoffSeries(s: BootstrapPlayoffSeries): PlayoffSeries {
  return {
    series_id: s.series_id,
    conference: s.conference ?? null,
    team_a: { id: s.team_a_id, abbrev: s.team_a_abbrev ?? "", seed: s.team_a_seed ?? 0 },
    team_b: { id: s.team_b_id, abbrev: s.team_b_abbrev ?? "", seed: s.team_b_seed ?? 0 },
    wins_a: s.wins_a,
    wins_b: s.wins_b,
    series_length: s.series_length,
    status: s.status,
    winner: s.winner_id ? { id: s.winner_id, abbrev: s.winner_abbrev ?? "" } : null,
  };
}

/**
 * Convert bootstrap playoff event to PlayoffBracketResponse shape.
 */
export function bootstrapPlayoffToBracket(event: BootstrapPlayoffEvent): PlayoffBracketResponse {
  const rounds: Record<string, PlayoffSeries[]> = {};
  for (const s of event.series) {
    if (!rounds[s.round]) rounds[s.round] = [];
    rounds[s.round].push(bootstrapSeriesToPlayoffSeries(s));
  }
  return {
    league_year_id: 0,
    league_level: event.league_level,
    rounds,
  };
}

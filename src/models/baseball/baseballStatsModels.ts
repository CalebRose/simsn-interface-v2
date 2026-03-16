// ═══════════════════════════════════════════════
// Box Score Models
// ═══════════════════════════════════════════════

export interface BoxScoreTeamInfo {
  id: number;
  abbrev: string;
  score: number;
}

export interface BoxScoreLinescoreSide {
  runs: (number | string)[];
  R: number;
  H: number;
  E: number;
}

export interface BoxScoreLinescore {
  innings: number;
  home: BoxScoreLinescoreSide;
  away: BoxScoreLinescoreSide;
}

export interface PbpPlayer {
  id: number;
  name: string;
}

export interface PlayByPlayEntry {
  ID: number;
  Inning: number;
  "Inning Half": "Top" | "Bottom";
  "Home Team": string;
  "Away Team": string;
  "Home Score": number;
  "Away Score": number;
  "Ball Count": number;
  "Strike Count": number;
  "Out Count": number;
  "Outs this Action": number;
  Batter: PbpPlayer | { player_id: number; player_name: string };
  Pitcher: PbpPlayer | { player_id: number; player_name: string };
  Outcomes: string;
  "Batted Ball"?: string;
  "Air or Ground"?: string;
  "Hit Depth"?: string;
  "Hit Direction"?: string;
  "Hit Situation"?: string;
  "Targeted Defender"?: string;
  "Defensive Outcome"?: string;
  "Error List"?: string;
  "Defensive Actions"?: string;
  "On First"?: PbpPlayer | null;
  "On Second"?: PbpPlayer | null;
  "On Third"?: PbpPlayer | null;
  Home?: any[];
  Is_Walk: boolean;
  Is_Strikeout: boolean;
  Is_InPlay?: boolean;
  Is_Hit: boolean;
  Is_HBP?: boolean;
  Is_Pickoff?: boolean;
  Is_StealAttempt?: boolean;
  Is_StealSuccess?: boolean;
  Error_Count?: number;
  Is_Liveball?: boolean;
  Is_Foul?: boolean;
  Is_Single: boolean;
  Is_Double: boolean;
  Is_Triple: boolean;
  Is_Homerun: boolean;
  AB_Over?: boolean;
  Pre_Outs?: number;
  Runners_Scored: number;
  Runners_Scored_IDs?: number[];
  Is_DP_Opportunity?: boolean;
  Is_DP?: boolean;
  Is_TP_Opportunity?: boolean;
  Is_TP?: boolean;
  Catcher?: PbpPlayer | null;
  "First Base"?: PbpPlayer | null;
  "Second Base"?: PbpPlayer | null;
  "Third Base"?: PbpPlayer | null;
  Shortstop?: PbpPlayer | null;
  "Left Field"?: PbpPlayer | null;
  "Center Field"?: PbpPlayer | null;
  "Right Field"?: PbpPlayer | null;
}

export interface BoxScoreBattingLine {
  player_id: number;
  name: string;
  pos?: string;
  batting_order?: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  itphr: number;
  rbi: number;
  bb: number;
  hbp: number;
  so: number;
  sb: number;
  cs: number;
}

export interface BoxScorePitchingLine {
  player_id: number;
  name: string;
  appearance_order?: number;
  gs: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  itphr: number;
  pc: number;
  balls: number;
  strikes: number;
  hbp: number;
  wp: number;
  dec: string; // "W" | "L" | "S" | ""
  hold?: number;          // 0 or 1
  blown_save?: number;    // 0 or 1
  quality_start?: number; // 0 or 1, only meaningful when gs === 1
}

export type SubstitutionType = "pitching_change" | "emergency_pitcher" | "pinch_hit" | "defensive_sub";

export interface BoxScoreSubstitution {
  inning: number;
  half: "top" | "bottom";
  type: SubstitutionType;
  player_in: { id: number; name: string };
  player_out: { id: number; name: string };
  new_position: string;
  // Pitching change entry context (only on pitching_change subs from newer games)
  entry_score_diff?: number;
  entry_runners_on?: number;
  entry_inning?: number;
  entry_outs?: number;
  entry_is_save_situation?: boolean;
}

export type DefenseDict = Record<string, number>; // position code → player_id

export interface BoxScoreResponse {
  game_id: number;
  home_team: BoxScoreTeamInfo;
  away_team: BoxScoreTeamInfo;
  linescore: BoxScoreLinescore | null;
  batting: {
    home: BoxScoreBattingLine[];
    away: BoxScoreBattingLine[];
  };
  pitching: {
    home: BoxScorePitchingLine[];
    away: BoxScorePitchingLine[];
  };
  substitutions?: BoxScoreSubstitution[];
  defense?: {
    home: DefenseDict;
    away: DefenseDict;
  };
  play_by_play?: PlayByPlayEntry[];
  game_outcome: string;
  season_week: number;
  season_subweek: string;
  completed_at: string;
}

export interface PlayByPlayResponse {
  game_id: number;
  play_by_play: PlayByPlayEntry[];
}

// ═══════════════════════════════════════════════
// Game Results Models
// ═══════════════════════════════════════════════

export interface GameResultsParams {
  league_year_id?: number;
  season_week?: number;
  league_level?: number;
  team_id?: number;
  page?: number;
  page_size?: number;
}

export interface GameResultItem {
  game_id: number;
  home_team: BoxScoreTeamInfo;
  away_team: BoxScoreTeamInfo;
  outcome: string;
  week: number;
  subweek: string;
  league_level: number;
  completed_at: string;
}

export interface GameResultsResponse {
  games: GameResultItem[];
  total: number;
  page: number;
  pages: number;
}

// ═══════════════════════════════════════════════
// Stats Leaderboard Models
// ═══════════════════════════════════════════════

export type BattingSortField =
  | "avg" | "hr" | "rbi" | "hits" | "sb" | "ops"
  | "obp" | "slg" | "iso" | "babip" | "bb_pct" | "k_pct" | "bb_k" | "ab_hr" | "xbh_pct" | "sb_pct"
  | "pa" | "tb" | "r" | "bb" | "so" | "cs" | "2b" | "3b" | "g" | "ab";
export type PitchingSortField =
  | "era" | "wins" | "so" | "saves" | "whip"
  | "k9" | "bb9" | "hr9" | "h9" | "k_bb" | "w_pct" | "k_pct" | "bb_pct" | "babip" | "ip_gs"
  | "g" | "gs" | "w" | "l" | "sv" | "ip" | "h" | "r" | "er" | "bb" | "hr"
  | "holds" | "blown_saves" | "quality_starts";
export type FieldingSortField =
  | "fpct" | "putouts" | "assists"
  | "tc" | "tc_g" | "rf_g" | "po_inn" | "a_inn" | "e_inn"
  | "g" | "inn" | "po" | "a" | "e";

export interface BattingLeaderboardParams {
  league_year_id: number;
  league_level?: number;
  team_id?: number;
  org_id?: number;
  sort?: BattingSortField;
  order?: "asc" | "desc";
  position?: string;
  min_ab?: number;
  min_pa?: number;
  page?: number;
  page_size?: number;
}

export interface PitchingLeaderboardParams {
  league_year_id: number;
  league_level?: number;
  team_id?: number;
  org_id?: number;
  sort?: PitchingSortField;
  order?: "asc" | "desc";
  role?: "starter" | "reliever";
  min_ip?: number;
  page?: number;
  page_size?: number;
}

export interface FieldingLeaderboardParams {
  league_year_id: number;
  league_level?: number;
  team_id?: number;
  sort?: FieldingSortField;
  order?: "asc" | "desc";
  position_code?: string;
  min_inn?: number;
  page?: number;
  page_size?: number;
}

export interface BattingLeaderRow {
  rank: number;
  player_id: number;
  name: string;
  team_id: number;
  team_abbrev: string;
  position?: string;
  g: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  itphr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  tb: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  iso: string;
  babip: string;
  bb_pct: string;
  k_pct: string;
  bb_k: string;
  ab_hr: string;
  xbh_pct: string;
  sb_pct: string;
}

export interface BattingLeadersResponse {
  leaders: BattingLeaderRow[];
  total: number;
  page: number;
  pages: number;
}

export interface PitchingLeaderRow {
  rank: number;
  player_id: number;
  name: string;
  team_id: number;
  team_abbrev: string;
  g: number;
  gs: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  bs: number;
  qs: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  itphr: number;
  era: string;
  whip: string;
  k9: string;
  bb9: string;
  hr9: string;
  h9: string;
  k_bb: string;
  w_pct: string;
  k_pct: string;
  bb_pct: string;
  babip: string;
  ip_gs: string;
}

export interface PitchingLeadersResponse {
  leaders: PitchingLeaderRow[];
  total: number;
  page: number;
  pages: number;
}

export interface FieldingLeaderRow {
  rank: number;
  player_id: number;
  name: string;
  team_id: number;
  team_abbrev: string;
  pos: string;
  g: number;
  inn: number;
  po: number;
  a: number;
  e: number;
  fpct: string;
  tc: number;
  tc_g: string;
  rf_g: string;
  po_inn: string;
  a_inn: string;
  e_inn: string;
}

export interface FieldingLeadersResponse {
  leaders: FieldingLeaderRow[];
  total: number;
  page: number;
  pages: number;
}

// ═══════════════════════════════════════════════
// Team Stats Models
// ═══════════════════════════════════════════════

export interface TeamStatsParams {
  league_year_id: number;
  league_level?: number;
}

export interface TeamBattingRow {
  team_id: number;
  team_abbrev: string;
  team_level?: number;
  g: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  itphr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  tb: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  babip: string;
}

export interface TeamPitchingRow {
  team_id: number;
  team_abbrev: string;
  team_level?: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  bs: number;
  qs: number;
  ip: string;
  r: number;
  er: number;
  hr: number;
  itphr: number;
  bb: number;
  so: number;
  ha: number;
  era: string;
  whip: string;
  k9: string;
  bb9: string;
  hr9: string;
}

export interface TeamStatsResponse {
  batting: TeamBattingRow[];
  pitching: TeamPitchingRow[];
}

// ═══════════════════════════════════════════════
// Player Stats Models
// ═══════════════════════════════════════════════

export interface PlayerStatsParams {
  league_year_id?: number;
  include?: string; // "gamelog"
}

export interface PlayerGamelogBatting {
  game_id: number;
  week: number;
  subweek: string;
  opponent: string;
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  itphr: number;
  rbi: number;
  bb: number;
  so: number;
}

export interface PlayerGamelogPitching {
  game_id: number;
  week: number;
  subweek: string;
  opponent: string;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  itphr: number;
  dec: string;
}

export interface PlayerStatsSeason {
  league_year_id: number;
  team_id: number;
  team_abbrev: string;
  g: number;
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  itphr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  avg: string;
  obp: string;
}

export interface PlayerPitchingSeason {
  league_year_id: number;
  team_id: number;
  team_abbrev: string;
  g: number;
  gs: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  bs: number;
  qs: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  itphr: number;
  era: string;
  whip: string;
}

export interface PlayerFieldingSeason {
  league_year_id: number;
  team_id: number;
  team_abbrev: string;
  pos: string;
  g: number;
  inn: number;
  po: number;
  a: number;
  e: number;
}

export interface PlayerStatsResponse {
  player_id: number;
  name: string;
  batting: PlayerStatsSeason[];
  pitching: PlayerPitchingSeason[];
  fielding: PlayerFieldingSeason[];
  gamelog_batting?: PlayerGamelogBatting[];
  gamelog_pitching?: PlayerGamelogPitching[];
}

// ═══════════════════════════════════════════════
// Splits Models
// ═══════════════════════════════════════════════

export interface SplitsParams {
  league_year_id: number;
  player_id?: number;
  team_id?: number;
}

export interface SplitRow {
  player_id: number;
  name: string;
  position_code: string;
  vs_hand: "L" | "R";
  starts: number;
}

export interface SplitsResponse {
  splits: SplitRow[];
  total: number;
}

// ═══════════════════════════════════════════════
// Injury Models
// ═══════════════════════════════════════════════

export interface InjuryReportParams {
  league_year_id?: number;
  org_id?: number;
  team_id?: number;
  status?: "injured" | "healthy" | "all";
}

export interface InjuryReportItem {
  player_id: number;
  name: string;
  team_id: number;
  team_abbrev: string;
  org_id: number;
  injury_name: string;
  injury_code: string;
  weeks_remaining: number;
  weeks_assigned: number;
  status: string;
}

export interface InjuryReportResponse {
  injuries: InjuryReportItem[];
  total: number;
}

export interface InjuryHistoryParams {
  league_year_id?: number;
  player_id?: number;
  org_id?: number;
  page?: number;
  page_size?: number;
}

export interface InjuryHistoryItem {
  event_id: number;
  player_id: number;
  name: string;
  team_abbrev: string;
  injury_name: string;
  injury_code: string;
  league_year_id: number;
  weeks_assigned: number;
  weeks_remaining: number;
  created_at: string;
}

export interface InjuryHistoryResponse {
  events: InjuryHistoryItem[];
  total: number;
}

// ═══════════════════════════════════════════════
// Position Usage Models
// ═══════════════════════════════════════════════

export interface PositionUsageParams {
  league_year_id: number;
  team_id?: number;
  player_id?: number;
  season_week?: number;
}

export interface PositionUsageRow {
  player_id: number;
  name: string;
  team_id: number;
  team_abbrev: string;
  position_code: string;
  starts: number;
  vs_l_starts: number;
  vs_r_starts: number;
}

export interface PositionUsageResponse {
  positions: PositionUsageRow[];
  total: number;
}

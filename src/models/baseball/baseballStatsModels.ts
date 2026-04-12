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
  | "avg" | "hr" | "rbi" | "h" | "sb" | "ops"
  | "obp" | "slg" | "iso" | "babip" | "bb_pct" | "k_pct" | "bb_k" | "ab_hr" | "xbh_pct" | "sb_pct"
  | "pa" | "tb" | "r" | "bb" | "so" | "cs" | "2b" | "3b" | "g" | "ab"
  | "hbp" | "woba" | "rc" | "sec_a" | "sf" | "gidp" | "gb_pct"
  | "itphr" | "fb_pct" | "hr_fb" | "barrel_pct" | "hard_hit_pct" | "soft_pct" | "med_pct" | "ld_pct" | "contact_pct" | "pss"
  | "bwar" | "wrc_plus" | "ops_plus";
export type PitchingSortField =
  | "era" | "wins" | "so" | "saves" | "whip"
  | "k9" | "bb9" | "hr9" | "h9" | "k_bb" | "w_pct" | "k_pct" | "bb_pct" | "babip" | "ip_gs"
  | "g" | "gs" | "w" | "l" | "sv" | "ip" | "h" | "r" | "er" | "bb" | "hr"
  | "holds" | "blown_saves" | "quality_starts"
  | "hbp" | "wp" | "pitches" | "str_pct" | "p_ip" | "fip" | "gb_pct"
  | "itphr" | "bf" | "ir" | "irs" | "ir_pct" | "gidp_induced" | "fb_pct" | "hr_fb" | "barrel_pct" | "hard_hit_pct" | "soft_pct" | "ld_pct" | "k_bb_pct" | "wp9" | "lob_pct"
  | "pwar" | "xfip" | "era_minus" | "fip_minus";
export type FieldingSortField =
  | "fpct" | "putouts" | "assists"
  | "tc" | "tc_g" | "rf_g" | "po_inn" | "a_inn" | "e_inn"
  | "g" | "inn" | "po" | "a" | "e"
  | "dp" | "rf" | "dp_g"
  | "fwar" | "err_runs" | "range_runs" | "dp_runs";

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
  // Phase 1
  hbp: number;
  // Phase 2 — derived rate stats
  woba: string;
  wrc_plus: number;
  rc: string;
  sec_a: string;
  pss: string;
  ops_plus: number;
  // Phase 3 — batted ball & contact quality
  sf: number;
  gidp: number;
  gb_pct: string;
  fb_pct: string;
  hr_fb: string;
  barrel_pct: string;
  hard_hit_pct: string;
  soft_pct: string;
  med_pct: string;
  ld_pct: string;
  contact_pct: string;
  // WAR (computed in Python, not server-sortable)
  bwar: number;
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
  // Phase 1
  hbp: number;
  wp: number;
  pitches: number;
  balls: number;
  strikes: number;
  str_pct: string;
  p_ip: string;
  wp9: string;
  // Phase 2 — derived rate stats
  fip: string;
  xfip: string;
  k_bb_pct: string;
  era_minus: number;
  fip_minus: number;
  // Phase 3 — batted ball, contact quality, reliever, situational
  gb_pct: string;
  fb_pct: string;
  hr_fb: string;
  barrel_pct: string;
  hard_hit_pct: string;
  soft_pct: string;
  ld_pct: string;
  lob_pct: string;
  ir: number;
  irs: number;
  ir_pct: string;
  gidp_induced: number;
  bf: number;
  // WAR (computed in Python, not server-sortable)
  pwar: number;
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
  // Phase 3
  dp: number;
  rf: string;
  dp_g: string;
  // WAR components (computed in Python, not server-sortable)
  fwar: number;
  err_runs: number;
  range_runs: number;
  dp_runs: number;
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
  hbp: number;
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

export interface TeamFieldingRow {
  team_id: number;
  team_abbrev: string;
  team_level?: number;
  g: number;
  inn: number;
  po: number;
  a: number;
  e: number;
  dp: number;
  tc: number;
  fpct: string;
  rf: string;
  dp_g: string;
  e_g: string;
  def_eff: string;
}

export interface TeamStatsResponse {
  batting: TeamBattingRow[];
  pitching: TeamPitchingRow[];
  fielding?: TeamFieldingRow[];
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
  hbp: number;
  so: number;
  hr: number;
  itphr: number;
  wp: number;
  pitches: number;
  era: string;
  whip: string;
  str_pct: string;
  p_ip: string;
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
// Player Game Log Models (new endpoint)
// ═══════════════════════════════════════════════

export interface GamelogBattingRow {
  game_id: number;
  week: number;
  subweek: string;
  opponent: string; // prefixed with "@" for away games
  result: string;   // e.g. "W 5-3"
  pos: string;
  bo: number;       // batting order
  ab: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  hbp: number;
  pa: number;
  // Running season totals (cumulative through this game)
  avg: string;
  obp: string;
  ops: string;
}

export interface GamelogPitchingRow {
  game_id: number;
  week: number;
  subweek: string;
  opponent: string;
  dec: string;      // "W" | "L" | "S" | "H" | ""
  gs: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  hbp: number;
  pitches: number;
  // Running season total
  era: string;
}

export interface PlayerGamelogResponse {
  batting: GamelogBattingRow[];
  pitching: GamelogPitchingRow[];
}

// ═══════════════════════════════════════════════
// Career Stats Models (new endpoint)
// ═══════════════════════════════════════════════

export interface CareerBattingSeason {
  season: number | "Career";
  team: string | null;
  level: number | null;
  g: number;
  ab: number;
  pa: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  rbi: number;
  bb: number;
  hbp: number;
  so: number;
  sb: number;
  cs: number;
  sf: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
}

export interface CareerPitchingSeason {
  season: number | "Career";
  team: string | null;
  level: number | null;
  g: number;
  gs: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  hbp: number;
  so: number;
  hr: number;
  era: string;
  whip: string;
}

export interface PlayerCareerResponse {
  player_id: number;
  name: string;
  batting: CareerBattingSeason[];
  pitching: CareerPitchingSeason[];
}

// ═══════════════════════════════════════════════
// Player Situational Splits Models (new endpoint)
// Coexists with existing vs-hand SplitRow / GetSplits
// ═══════════════════════════════════════════════

export interface BattingSplitRow {
  g: number;
  ab: number;
  pa: number;
  r: number;
  h: number;
  "2b": number;
  "3b": number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  hbp: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
}

export interface BattingVsOpponentRow extends BattingSplitRow {
  opponent: string;
}

export interface PitchingSplitRow {
  g: number;
  gs: number;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  hbp: number;
  era: string;
  whip: string;
}

export interface PlayerSplitsResponse {
  batting_home_away: {
    home: BattingSplitRow;
    away: BattingSplitRow;
  };
  batting_vs_opponent: BattingVsOpponentRow[];
  pitching_home_away: {
    home: PitchingSplitRow;
    away: PitchingSplitRow;
  };
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
  current_level: number | null;
  on_ir: boolean;
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
  current_level: number | null;
  on_ir: boolean;
  injury_name: string;
  injury_code: string;
  league_year_id: number;
  weeks_assigned: number;
  weeks_remaining: number;
  created_at: string;
  // Unified injury fields (present on newer endpoints)
  injury_type_id?: number;
  source?: "pregame" | "ingame";
  status?: "active" | "healed";
  effects?: Record<string, number>;
  gamelist_id?: number;
  season_week?: number;
  season_subweek?: string;
  game_home_team?: number;
  game_away_team?: number;
}

export interface InjuryHistoryResponse {
  events: InjuryHistoryItem[];
  total: number;
}

// ═══════════════════════════════════════════════
// Player Injury History (per-player endpoint)
// ═══════════════════════════════════════════════

export interface PlayerInjuryHistoryParams {
  player_id: number;
  league_year_id?: number;
  limit?: number;
}

export interface PlayerInjuryHistoryEvent {
  event_id: number;
  injury_type_id: number;
  injury_name: string;
  injury_code: string;
  source: "pregame" | "ingame";
  status: "active" | "healed";
  weeks_assigned: number;
  weeks_remaining: number;
  effects: Record<string, number>;
  gamelist_id: number;
  season_week: number;
  season_subweek: string;
  game_home_team: number;
  game_away_team: number;
  created_at: string;
}

export interface PlayerInjuryHistoryResponse {
  player_id: number;
  league_year_id: number;
  count: number;
  events: PlayerInjuryHistoryEvent[];
}

// ═══════════════════════════════════════════════
// Admin Injury Log
// ═══════════════════════════════════════════════

export interface AdminInjuryLogParams {
  league_year_id: number;
  league_level?: number;
  team_id?: number;
  source?: "pregame" | "ingame";
  season_week?: number;
  limit?: number;
}

export interface AdminInjuryLogEvent extends PlayerInjuryHistoryEvent {
  player_id: number;
  player_name: string;
  player_team_abbrev: string;
  player_league_level: number;
}

export interface AdminInjuryLogSummary {
  total: number;
  pregame: number;
  ingame: number;
  active: number;
  healed: number;
  by_week: { week: number; count: number }[];
  by_injury_code: { code: string; count: number }[];
}

export interface AdminInjuryLogResponse {
  ok: boolean;
  filters: Record<string, unknown>;
  summary: AdminInjuryLogSummary;
  events: AdminInjuryLogEvent[];
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

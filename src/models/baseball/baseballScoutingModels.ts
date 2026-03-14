import { PlayerContract, VisibilityContext } from "./baseballModels";

// ── Scouting Action Types ───────────────────────────────────

export type ScoutingActionType =
    | "hs_report"
    | "recruit_potential_fuzzed"
    | "recruit_potential_precise"
    | "college_potential_precise"
    | "draft_attrs_fuzzed"
    | "draft_attrs_precise"
    | "draft_potential_precise"
    | "pro_attrs_precise"
    | "pro_potential_precise";

// ── Pool Endpoint Parameters ────────────────────────────────

export interface CollegePoolParams {
    page?: number;
    per_page?: number;
    sort?: string;
    dir?: "asc" | "desc";
    age?: number;
    ptype?: "Pitcher" | "Position";
    area?: string;
    star_rating?: number;
    search?: string;
    viewing_org_id?: number;
    league_year_id?: number;
}

export interface ProPoolParams {
    page?: number;
    per_page?: number;
    sort?: string;
    dir?: "asc" | "desc";
    ptype?: "Pitcher" | "Position";
    min_age?: number;
    max_age?: number;
    area?: string;
    search?: string;
    org_id?: number;
    viewing_org_id?: number;
}

// ── Pool Endpoint Responses ─────────────────────────────────

/** A player row from the college-pool or pro-pool endpoint (flat, raw). */
export interface PoolPlayer {
    id: number;
    firstname: string;
    lastname: string;
    age: number;
    ptype: "Pitcher" | "Position";
    area: string;
    city: string;
    intorusa: "usa" | "international";
    height: number;
    weight: number;
    bat_hand: "R" | "L" | "S" | null;
    pitch_hand: "R" | "L" | null;
    arm_angle: string | null;
    durability: string;
    injury_risk: string;
    displayovr: string | null;
    left_split?: number;
    center_split?: number;
    right_split?: number;
    org_id: number;
    org_abbrev: string;
    current_level: number;
    pitch1_name: string | null;
    pitch2_name: string | null;
    pitch3_name: string | null;
    pitch4_name: string | null;
    pitch5_name: string | null;
    pitch1_ovr: number | null;
    pitch2_ovr: number | null;
    pitch3_ovr: number | null;
    pitch4_ovr: number | null;
    pitch5_ovr: number | null;
    // Dynamic _base and _pot columns (e.g. contact_base, contact_pot)
    [key: string]: any;
}

export interface CollegePoolResponse {
    total: number;
    page: number;
    per_page: number;
    pages: number;
    age_counts: Record<string, number>;
    players: PoolPlayer[];
}

export interface ProPoolResponse {
    total: number;
    page: number;
    per_page: number;
    pages: number;
    pool_counts: Record<string, number>;
    players: PoolPlayer[];
}

// ── INTAM Pool ──────────────────────────────────────────────

export interface IntamPoolParams {
    page?: number;
    per_page?: number;
    sort?: string;
    dir?: "asc" | "desc";
    ptype?: "Pitcher" | "Position";
    min_age?: number;
    max_age?: number;
    area?: string;
    search?: string;
    viewing_org_id?: number;
}

export interface IntamPoolResponse {
    total: number;
    page: number;
    per_page: number;
    pages: number;
    players: PoolPlayer[];
}

// ── MLB Pool (pro roster players, levels 4-9) ───────────────

export interface MlbPoolParams {
    page?: number;
    per_page?: number;
    sort?: string;
    dir?: "asc" | "desc";
    ptype?: "Pitcher" | "Position";
    min_age?: number;
    max_age?: number;
    area?: string;
    search?: string;
    org_id?: number;
    level?: number;
    viewing_org_id?: number;
}

export interface MlbPoolResponse {
    total: number;
    page: number;
    per_page: number;
    pages: number;
    level_counts: Record<string, number>;
    players: PoolPlayer[];
}

// ── Free Agent List ─────────────────────────────────────────

export interface FreeAgentListItem {
    player_id: number;
    player_name: string;
    age: number;
    position: "Pitcher" | "Position";
}

// ── Scouting Player Detail (visibility-masked) ─────────────

export interface ScoutingPlayerBio {
    id: number;
    firstname: string;
    lastname: string;
    age: number;
    ptype: "Pitcher" | "Position";
    listed_position: string | null;
    area: string;
    city: string;
    intorusa: "usa" | "international";
    height: number;
    weight: number;
    bat_hand: "R" | "L" | "S" | null;
    pitch_hand: "R" | "L" | null;
    arm_angle: string | null;
    durability: string;
    injury_risk: string;
    pitch1_name: string | null;
    pitch2_name: string | null;
    pitch3_name: string | null;
    pitch4_name: string | null;
    pitch5_name: string | null;
}

export interface GeneratedBattingStats {
    games: number;
    at_bats: number;
    hits: number;
    doubles: number;
    triples: number;
    home_runs: number;
    rbi: number;
    runs: number;
    walks: number;
    strikeouts: number;
    stolen_bases: number;
    caught_stealing: number;
    avg: number;
    obp: number;
    slg: number;
}

export interface GeneratedFieldingStats {
    games: number;
    innings: number;
    putouts: number;
    assists: number;
    errors: number;
    fielding_pct: number;
}

export interface GeneratedPitchingStats {
    games: number;
    games_started: number;
    wins: number;
    losses: number;
    era: number;
    innings_pitched: number;
    innings_pitched_outs: number;
    hits_allowed: number;
    runs_allowed: number;
    earned_runs: number;
    walks: number;
    strikeouts: number;
    home_runs_allowed: number;
    saves: number;
    k_per_9: number;
    bb_per_9: number;
    whip: number;
}

export interface GeneratedStats {
    batting?: GeneratedBattingStats;
    fielding?: GeneratedFieldingStats;
    pitching?: GeneratedPitchingStats;
}

export interface TextReport {
    batting?: string;
    fielding?: string;
    pitching?: string;
    athletic?: string;
}

export type ScoutingPool = "hs" | "college" | "intam" | "pro";

export interface ScoutingVisibility {
    pool: ScoutingPool;
    unlocked: string[];
    available_actions: string[];
}

export interface CountingStats {
    batting?: GeneratedBattingStats;
    fielding?: GeneratedFieldingStats;
    pitching?: GeneratedPitchingStats;
}

export interface ScoutingPlayerResponse {
    bio: ScoutingPlayerBio;
    generated_stats?: GeneratedStats;
    text_report?: TextReport;
    letter_grades?: Record<string, string>;
    attributes?: Record<string, number>;
    potentials?: Record<string, string | null>;
    counting_stats?: CountingStats;
    display_format?: "20-80" | "20-80-fuzzed";
    visibility: ScoutingVisibility;
    visibility_context?: VisibilityContext;
    contract?: PlayerContract;
}

// ── Scouting Actions & Budget ───────────────────────────────

export interface ScoutingActionRequest {
    org_id: number;
    league_year_id: number;
    player_id: number;
    action_type: ScoutingActionType;
}

export interface ScoutingActionResponse {
    status: "unlocked" | "already_unlocked";
    action_type: string;
    player_id: number;
    points_spent: number;
    points_remaining: number;
}

export interface ScoutingBatchActionRequest {
    org_id: number;
    league_year_id: number;
    player_ids: number[];
    action_type: ScoutingActionType;
}

export interface ScoutingBatchActionResponse {
    successes: number[];
    already_unlocked: number[];
    errors: { player_id: number; error: string }[];
    budget: {
        total_points: number;
        spent_points: number;
        remaining_points: number;
    };
}

export interface ScoutingBudget {
    org_id: number;
    league_year_id: number;
    total_points: number;
    spent_points: number;
    remaining_points: number;
}

export interface ScoutingAction {
    id: number;
    player_id: number;
    action_type: string;
    points_spent: number;
    created_at: string;
    player_name: string;
    ptype: string;
    age: number;
}

export interface ScoutingActionsResponse {
    org_id: number;
    league_year_id: number;
    budget: {
        total_points: number;
        spent_points: number;
        remaining_points: number;
    };
    actions: ScoutingAction[];
}

// ── Signing ─────────────────────────────────────────────────

export interface SignPlayerRequest {
    player_id: number;
    org_id: number;
    years: number;
    salaries: number[];
    bonus: number;
    level_id: number;
    league_year_id: number;
    game_week_id: number;
    executed_by?: string;
}

export interface SignPlayerResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    years: number;
    bonus: number;
    roster_warning: any | null;
}

export interface SigningBudgetResponse {
    org_id: number;
    available_budget: number;
}

// ── INTAM Signings ──────────────────────────────────────────

export interface IntamSigning {
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    age: number;
    org_id: number;
    org_abbrev: string;
    contract_years: number;
    contract_bonus: number;
    signed_date?: string;
}

export interface IntamSigningsResponse {
    signings: IntamSigning[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

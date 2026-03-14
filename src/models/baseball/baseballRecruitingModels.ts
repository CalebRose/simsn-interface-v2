// ── Recruiting State ─────────────────────────────────────────

export interface RecruitingState {
    league_year_id: number;
    current_week: number;
    status: "pending" | "active" | "complete";
    total_weeks: number;
}

// ── Rankings ─────────────────────────────────────────────────

export interface RankedPlayer {
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    age: number;
    star_rating: number;
    rank_overall: number;
    rank_by_ptype: number;
}

export interface RankingsResponse {
    players: RankedPlayer[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface RankingsParams {
    league_year_id: number;
    page?: number;
    per_page?: number;
    star_rating?: number;
    ptype?: "Pitcher" | "Position";
    search?: string;
}

// ── Board ────────────────────────────────────────────────────

export interface BoardPlayer {
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    star_rating: number | null;
    rank_overall: number | null;
    your_points: number;
    on_board: boolean;
    interest_gauge: "Low" | "Medium" | "High" | "Very High";
    competitor_count: number;
    status: "uncommitted" | "committed";
    committed_to?: {
        org_id: number;
        org_abbrev: string;
        week_committed: number;
    } | null;
}

export interface BoardResponse {
    players: BoardPlayer[];
    board_player_ids: number[];
}

export interface BoardModifyRequest {
    org_id: number;
    league_year_id: number;
    player_id: number;
}

export interface BoardModifyResponse {
    status: "added" | "already_on_board" | "removed" | "not_on_board";
    player_id: number;
}

// ── Player Detail ────────────────────────────────────────────

export interface RecruitingPlayerDetail {
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    star_rating: number;
    rank_overall: number;
    rank_by_ptype: number;
    status: "uncommitted" | "committed";
    interest_gauge: "Low" | "Medium" | "High" | "Very High";
    competitor_count: number;
    your_investment: number;
    commitment?: {
        org_id: number;
        org_abbrev: string;
        week_committed: number;
        points_total: number;
    };
}

// ── Investment ───────────────────────────────────────────────

export interface InvestmentEntry {
    player_id: number;
    points: number;
}

export interface InvestmentPlayer {
    player_id: number;
    points: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
}

export interface InvestmentStateResponse {
    current_week: number;
    status: "pending" | "active" | "complete";
    weekly_budget: number;
    max_per_player: number;
    spent: number;
    budget_remaining: number;
    investments: InvestmentPlayer[];
}

export interface InvestRequest {
    org_id: number;
    league_year_id: number;
    week: number;
    investments: InvestmentEntry[];
}

export interface InvestResponse {
    accepted: InvestmentEntry[];
    errors: { player_id: number; error: string }[];
    budget_remaining: number;
}

// ── Commitments ──────────────────────────────────────────────

export interface Commitment {
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    org_id: number;
    org_abbrev: string;
    star_rating: number;
    week_committed: number;
    points_total: number;
}

export interface CommitmentsResponse {
    commitments: Commitment[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface CommitmentsParams {
    league_year_id: number;
    page?: number;
    per_page?: number;
    org_id?: number;
    star_rating?: number;
    week?: number;
}

// ── Simulation Control Models ───────────────────────────────

export interface SimulateWeekRequest {
    league_year_id: number;
    season_week: number;
    league_level?: number;
}

export interface SimulateWeekResponse {
    league_year_id: number;
    season_week: number;
    league_level?: number;
    total_games: number;
}

export interface SimulateSubweekRequest {
    league_year_id: number;
    season_week: number;
    subweek: "a" | "b" | "c" | "d";
    league_level?: number;
}

export interface SimulateSubweekResponse {
    league_year_id: number;
    season_week: number;
    total_games: number;
}

export interface AdvanceWeekRequest {
    season_id?: number;
}

export interface SimpleStatusResponse {
    status: string;
    message: string;
}

export interface RollbackToWeekRequest {
    target_week: number;
}

export interface EndSeasonRequest {
    league_year_id: number;
}

export interface EndSeasonResponse {
    phase_transition: string;
    waivers_resolved: { resolved: number; expired: number };
    end_of_season: {
        service_time_updated: number;
        contracts_expired: number;
        fa_eligible: number;
    };
    progression: {
        players_progressed: number;
        age_incremented: boolean;
    };
    timestamp_updated: boolean;
}

export interface StartNewSeasonRequest {
    league_year_id: number;
}

export interface StartNewSeasonResponse {
    phase_transition: string;
    year_start_books: { budgets_set: number; salary_caps_initialized: boolean };
    new_season: number;
    timestamp_updated: boolean;
}

export interface SetPhaseRequest {
    is_offseason?: boolean;
    is_free_agency_locked?: boolean;
    is_draft_time?: boolean;
    is_recruiting_locked?: boolean;
    free_agency_round?: number;
}

export interface RunSeasonRequest {
    league_year_id: number;
    league_level?: number;
    start_week?: number;
    end_week?: number;
}

export interface RunSeasonResponse {
    task_id: string;
    status: string;
    total: number;
    poll_url: string;
}

export interface TaskStatusResponse {
    task_id: string;
    status: "pending" | "running" | "complete" | "failed";
    progress: number;
    total: number;
    metadata?: {
        league_year_id: number;
        league_level?: number;
        start_week: number;
        end_week: number;
    };
    result?: unknown;
    error?: string;
    download_url?: string;
}

// ── Recruiting Admin Models ─────────────────────────────────

export interface AdvanceRecruitingWeekRequest {
    league_year_id: number;
}

export interface RecruitingCommitment {
    player_id: number;
    player_name: string;
    org_id: number;
    org_abbrev: string;
    star_rating: number;
    week_committed: number;
    points_total: number;
}

export interface AdvanceRecruitingWeekResponse {
    previous_week: number;
    new_week: number;
    status: string;
    ranked_players?: number;
    commitments?: RecruitingCommitment[];
    cleanup_commitments?: RecruitingCommitment[];
}

export interface RecruitingSummaryResponse {
    state: {
        current_week: number;
        status: string;
        pool_size: number;
        total_weeks: number;
    };
    stars: {
        star_distribution: Record<string, number>;
        committed_by_star: Record<string, number>;
    };
    commitments: {
        committed_count: number;
        uncommitted_count: number;
        unique_orgs_committing: number;
        avg_winning_points: number;
    };
    investment_activity: {
        active_orgs: number;
        targeted_players: number;
        total_points_invested: number;
        total_allocations: number;
    };
    trends: {
        weekly_trend: {
            week: number;
            active_orgs: number;
            points_spent: number;
            players_targeted: number;
        }[];
        commitment_pace: {
            week: number;
            commitments: number;
        }[];
    };
}

export interface OrgLeaderboardEntry {
    org_id: number;
    org_abbrev: string;
    total_points_invested: number;
    players_targeted: number;
    weeks_active: number;
    commitments_won: number;
    total_commit_stars: number;
    avg_star: number;
    budget_utilization_pct: number;
}

export interface OrgLeaderboardResponse {
    leaderboard: OrgLeaderboardEntry[];
}

export interface PlayerDemandEntry {
    player_id: number;
    player_name: string;
    ptype: string;
    star_rating: number;
    num_orgs_targeting: number;
    total_interest: number;
    top_orgs: { org_id: number; org_abbrev: string; invested_points: number }[];
}

export interface PlayerDemandResponse {
    players: PlayerDemandEntry[];
}

export interface PlayerDemandParams {
    league_year_id: number;
    star_rating?: number;
    limit?: number;
}

export interface OrgDetailResponse {
    org_id: number;
    org_abbrev: string;
    weekly_spend: { week: number; points_spent: number; players_targeted: number }[];
    commitments: {
        player_id: number;
        player_name: string;
        star_rating: number;
        week_committed: number;
        points_total: number;
    }[];
    investments: {
        player_id: number;
        player_name: string;
        star_rating: number;
        invested_points: number;
        status: string;
    }[];
}

export interface RecruitingResetWeekRequest {
    league_year_id: number;
    target_week?: number;
}

export interface RecruitingWipeRequest {
    league_year_id: number;
    org_id?: number;
    player_id?: number;
}

export interface RecruitingWipeResponse {
    ok: boolean;
    deleted: number;
    scope: string;
}

export interface RecruitingFullResetResponse {
    ok: boolean;
    deleted: {
        recruiting_investments: number;
        recruiting_commitments: number;
        recruiting_board: number;
        state_reset: boolean;
    };
}

export interface RankingsWipeResponse {
    status: string;
    deleted: number;
    league_year_id: number;
}

export interface RankingsRegenerateResponse {
    status: string;
    ranked_players: number;
    league_year_id: number;
}

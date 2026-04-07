// ═══════════════════════════════════════════════
// Free Agency & Auction Models
// ═══════════════════════════════════════════════

// ── Auction Phase ─────────────────────────────────────────────

export type AuctionPhase = "open" | "listening" | "finalize" | "completed" | "withdrawn";

export const PHASE_COLORS: Record<AuctionPhase, string> = {
    open: "green",
    listening: "yellow",
    finalize: "red",
    completed: "gray",
    withdrawn: "gray",
};

// ── Free Agent Pool ───────────────────────────────────────────

export interface FAPoolParams {
    viewing_org_id: number;
    league_year_id: number;
    page?: number;
    per_page?: number;
    sort?: string;
    dir?: "asc" | "desc";
    ptype?: "Pitcher" | "Position";
    search?: string;
    min_age?: number;
    max_age?: number;
    area?: string;
    has_auction?: string;
}

export interface FAPlayerOffer {
    offer_id: number;
    years: number;
    bonus: number;
    total_value: number;
    aav: number;
    status: string;
}

export interface FAPlayerAuction {
    auction_id: number;
    phase: AuctionPhase;
    min_aav: number;
    offer_count: number;
    my_offer: FAPlayerOffer | null;
}

export interface FAPlayerDemand {
    min_aav: string;
    min_years: number;
    max_years?: number;
    war: number;
}

export interface FAPlayerScouting {
    unlocked: string[];
    attrs_precise: boolean;
    pots_precise: boolean;
    available_actions: string[];
}

export type FAType = "mlb_fa" | "arb" | "pre_arb" | "milb_fa";

export const FA_TYPE_LABELS: Record<FAType, string> = {
    mlb_fa: "MLB FA",
    arb: "Arb-Eligible",
    pre_arb: "Pre-Arb",
    milb_fa: "MiLB FA",
};

/**
 * New unified API shape for FA pool players.
 * Bio fields are nested under `bio`, attributes under `ratings`, potentials under `potentials`.
 * `id` and `displayovr` remain at top level.
 */
export interface FAPoolPlayer {
    id: number;
    displayovr: number | null;
    listed_position: string | null;
    bio: {
        firstname: string;
        lastname: string;
        age: number;
        ptype: "Pitcher" | "Position";
        area: string;
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
    ratings: Record<string, any>;
    potentials: Record<string, any>;
    fa_type: FAType;
    last_level: number;
    last_org_abbrev: string | null;
    auction: FAPlayerAuction | null;
    demand: FAPlayerDemand | null;
    scouting: FAPlayerScouting;
}

export interface FAPoolResponse {
    total: number;
    page: number;
    per_page: number;
    pages: number;
    players: FAPoolPlayer[];
}

// ── Auction Board ─────────────────────────────────────────────

export interface AuctionBoardEntry {
    auction_id: number;
    player_id: number;
    player_name: string;
    player_type: "Pitcher" | "Position";
    war: number;
    age: number;
    phase: AuctionPhase;
    min_aav: number;
    min_total_value: number;
    min_years: number;
    max_years: number;
    offer_count: number;
    competing_teams: string[];
    my_offer: FAPlayerOffer | null;
    entered_week: number;
    listed_position: string | null;
    arm_angle: string | null;
    ratings: Record<string, any>;
    potentials: Record<string, any>;
    scouting: FAPlayerScouting;
}

// ── Player Detail Modal ───────────────────────────────────────

export interface FAPlayerBio {
    id: number;
    firstname: string;
    lastname: string;
    age: number;
    ptype: "Pitcher" | "Position";
    area: string;
    height: number;
    weight: number;
    bat_hand: string;
    pitch_hand: string;
    arm_angle: string | null;
    durability: number;
    injury_risk: number;
    displayovr: number | null;
}

export interface FAContractHistoryEntry {
    org: string;
    years: number;
    salary: number;
    bonus: number;
    signed_year: number;
    is_extension: boolean;
    is_buyout: boolean;
}

export interface FAStatsSummary {
    batting: {
        avg: string;
        hr: number;
        rbi: number;
        ab: number;
        hits: number;
        walks: number;
        sb: number;
    } | null;
    pitching: {
        era: string;
        wins: number;
        losses: number;
        ip: number;
        so: number;
        bb: number;
        whip: string;
    } | null;
}

export interface FAPlayerDetailResponse {
    bio: FAPlayerBio;
    ratings: Record<string, any>;
    potentials: Record<string, any>;
    contract_history: FAContractHistoryEntry[];
    demand: FAPlayerDemand | null;
    auction: {
        auction_id: number;
        phase: AuctionPhase;
        min_aav: number;
        offer_count: number;
        competing_teams: string[];
        my_offer: FAPlayerOffer | null;
    } | null;
    scouting: FAPlayerScouting;
    stats_summary: FAStatsSummary;
}

// ── Offer Submission ──────────────────────────────────────────

export interface FAOfferRequest {
    org_id: number;
    years: number;
    salaries: number[];
    bonus: number;
    level_id: number;
    league_year_id: number;
    game_week_id: number;
    current_week: number;
    executed_by?: string;
}

export interface FAOfferResponse {
    offer_id: number;
    auction_id: number;
    org_id: number;
    years: number;
    bonus: number;
    total_value: number;
    aav: number;
    is_update: boolean;
    phase: AuctionPhase;
}

export interface FAWithdrawResponse {
    withdrawn: boolean;
    auction_id: number;
    org_id: number;
}

// ── Direct Signing (non-auction FAs) ────────────────────────

export interface FASignRequest {
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

export interface FASignResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    years: number;
    bonus: number;
    roster_warning: string | null;
}

// ── Inline Scouting ───────────────────────────────────────────

export interface FAScoutRequest {
    org_id: number;
    league_year_id: number;
    player_id: number;
    action_type: "pro_attrs_precise" | "pro_potential_precise";
}

export interface FAScoutResponse {
    scouting_result: {
        status: "unlocked" | "already_unlocked";
        action_type: string;
        cost: number;
        budget: {
            total_points: number;
            spent_points: number;
            remaining_points: number;
        };
    };
    player: FAPlayerDetailResponse;
}

// ── Market Dashboard ──────────────────────────────────────────

export interface MarketSummary {
    dollar_per_war: string;
    total_signings: number;
    avg_years: number;
    avg_aav: string;
    avg_total_value: string;
    war_tiers: Record<string, number>;
    recent_signings: {
        player_id: number;
        name: string;
        war: number;
        total_value: string;
        aav: string;
        years: number;
        age: number;
        source: "fa_auction" | "direct_signing" | "extension" | "arb_renewal";
    }[];
}

export interface MarketRateResponse {
    dollar_per_war: string;
}

// ── Signing Budget ────────────────────────────────────────────

export interface FASigningBudgetResponse {
    org_id: number;
    available_budget: number;
}

// ── Contract Overview with Demands ────────────────────────────

export interface ContractDemand {
    type: "extension" | "buyout";
    min_aav: string;
    min_years: number;
    war: number;
    buyout_price: string;
}

export interface ContractOverviewWithDemand {
    player_id: number;
    player_name: string;
    age: number;
    position: string;
    contract_id: number;
    current_level: number;
    years: number;
    current_year: number;
    years_remaining: number;
    salary: number;
    on_ir: boolean;
    mlb_service_years: number;
    contract_phase: string;
    years_to_arb: number | null;
    years_to_fa: number | null;
    is_expiring: boolean;
    demand: ContractDemand | null;
}

// ── Scouting Budget ───────────────────────────────────────────

export interface FAScoutingBudgetResponse {
    org_id: number;
    total_points: number;
    spent_points: number;
    remaining_points: number;
}

// ── Waiver Wire ──────────────────────────────────────────────

export interface WaiverEntry {
    waiver_claim_id: number;
    player_id: number;
    player_name: string;
    ptype: "Pitcher" | "Position";
    age: number;
    displayovr: number | null;
    contract_id: number;
    releasing_org_id: number;
    releasing_org_abbrev: string;
    placed_week: number;
    expires_week: number;
    last_level: number;
    service_years: number;
    fa_type: FAType;
    bid_count: number;
    my_bid?: boolean;
}

export interface WaiverListResponse {
    ok: boolean;
    count: number;
    waivers: WaiverEntry[];
}

export interface WaiverDetailResponse extends WaiverEntry {
    status: "active" | "claimed" | "cleared";
    claiming_org_id: number | null;
    resolved_at: string | null;
}

export interface WaiverClaimResponse {
    ok: boolean;
    bid_id: number;
    waiver_claim_id: number;
    already_claimed?: boolean;
}

export interface WaiverWithdrawResponse {
    ok: boolean;
    withdrawn: boolean;
}

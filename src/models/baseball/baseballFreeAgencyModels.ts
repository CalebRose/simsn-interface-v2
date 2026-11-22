// ═══════════════════════════════════════════════
// Free Agency & Auction Models
// ═══════════════════════════════════════════════

import type {
    PlayerRatings,
    PlayerPotentials,
    VisibilityContext,
} from "./baseballModels";
import type { ScoutingPlayerBio } from "./baseballScoutingModels";

// ── Auction Phase ─────────────────────────────────────────────

export type AuctionPhase =
    | "open"
    | "listening"
    | "finalize"
    | "completed"
    | "expired"
    | "withdrawn";

export const PHASE_COLORS: Record<AuctionPhase, string> = {
    open: "green",
    listening: "yellow",
    finalize: "red",
    completed: "gray",
    expired: "gray",
    withdrawn: "gray",
};

/** Plain-words stage names; "finalize" is the final-three stage. */
export const AUCTION_PHASE_LABELS: Record<AuctionPhase, string> = {
    open: "Open",
    listening: "Listening",
    finalize: "Final three",
    completed: "Signed",
    expired: "Expired",
    withdrawn: "Withdrawn",
};

/** Stages in order, for the stage stepper. */
export const AUCTION_STAGES: AuctionPhase[] = ["open", "listening", "finalize", "completed"];

/** Lowest the ask can fall to after rounds without an offer. */
export const FA_ASK_FLOOR = 1_600_000;

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

export type FAOfferStatus = "active" | "outbid" | "withdrawn" | "won" | "lost" | "failed";

export const OFFER_STATUS_INFO: Record<FAOfferStatus, { label: string; meaning: string; color: string }> = {
    active: { label: "Active", meaning: "Your offer is in the running.", color: "green" },
    outbid: { label: "Outbid", meaning: "Your offer missed the final three.", color: "red" },
    withdrawn: { label: "Withdrawn", meaning: "You withdrew this offer. You can offer again while the auction is Open.", color: "gray" },
    won: { label: "Won", meaning: "He signed with your club.", color: "green" },
    lost: { label: "Lost", meaning: "He signed with another club.", color: "gray" },
    failed: { label: "Failed", meaning: "Your offer won but could not be completed, so the next offer signed.", color: "red" },
};

export interface FAPlayerOffer {
    offer_id: number;
    years: number;
    bonus: number;
    total_value: number;
    aav: number;
    /** The offer valued as the player sees it: salaries + bonus x (1 + bonus_value_premium). total_value and aav stay cash. */
    offer_value?: number;
    status: FAOfferStatus;
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
    /** Sent on board entries; the pool's demand omits it. */
    min_total_value?: number;
    /** Extra weight a bonus dollar carries toward the ask (0.15: bonus counts at 1.15x). */
    bonus_value_premium?: number;
    /** Lowest salary any MLB season may pay (veterans, 6+ service years); null when no floor applies. */
    veteran_min_salary?: number | null;
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
    /** Extra weight a bonus dollar carries toward the ask (0.15: bonus counts at 1.15x). */
    bonus_value_premium?: number;
    /** Lowest salary any MLB season may pay (veterans, 6+ service years); null when no floor applies. */
    veteran_min_salary?: number | null;
    offer_count: number;
    competing_teams: string[];
    my_offer: FAPlayerOffer | null;
    entered_week: number;
    /** The ask when he entered free agency; min_aav is the live ask. */
    initial_min_aav?: number;
    /** How many times the ask has dropped 10%. */
    ask_decay_steps?: number;
    /** Rounds in a row without an offer. */
    rounds_without_offer?: number;
    /** Season the auction opened in (in-season releases keep theirs). */
    auction_league_year_id?: number;
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
    buyout_price?: string;
    /** Extra weight a bonus dollar carries toward the ask (0.15: bonus counts at 1.15x). */
    bonus_value_premium?: number;
    /** Lowest salary any MLB season may pay (veterans, 6+ service years); null when no floor applies. */
    veteran_min_salary?: number | null;
}

/** GET fa-auction/player-demand/{id}?type=extension, POST fa-auction/compute-demands */
export interface ExtensionDemandResponse {
    player_id: number;
    demand_type: "extension";
    war: number;
    dollar_per_war: string;
    min_aav: string;
    min_years: number;
    max_years: number;
    min_total_value: string;
    age: number;
    service_years: number;
    /** Extra weight a bonus dollar carries toward the ask (0.15: bonus counts at 1.15x). */
    bonus_value_premium?: number;
    /** Lowest salary any MLB season may pay (veterans, 6+ service years); null when no floor applies. */
    veteran_min_salary?: number | null;
}

export interface ComputeExtensionDemandRequest {
    player_id: number;
    league_year_id: number;
    demand_type: "extension";
    contract_id: number;
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
    has_extension: boolean;
    extension_eligible: boolean;
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
    contract_years: number | null;
    contract_current_year: number | null;
    contract_years_remaining: number | null;
    contract_salary: number | null;
    // Standard display block (added API-side so a waiver entry can render the
    // normal player card). The card UI still fetches by player_id, so these are
    // optional and may be absent on older payloads.
    bio?: ScoutingPlayerBio;
    ratings?: PlayerRatings;
    potentials?: PlayerPotentials;
    visibility_context?: VisibilityContext;
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

// ═══════════════════════════════════════════════
// International Free Agency (IFA) Models
// ═══════════════════════════════════════════════

// ── IFA State ───────────────────────────────────────────────

export type IFAStatus = "pending" | "active" | "complete";

export interface IFAState {
    league_year_id: number;
    current_week: number;
    total_weeks: number;
    status: IFAStatus;
}

// ── Auction Phase ───────────────────────────────────────────

export type IFAAuctionPhase = "open" | "listening" | "finalize" | "completed";

export const IFA_PHASE_COLORS: Record<IFAAuctionPhase, string> = {
    open: "green",
    listening: "yellow",
    finalize: "red",
    completed: "gray",
};

// ── Bonus Pool ──────────────────────────────────────────────

export interface IFABonusPool {
    org_id: number;
    total_pool: number;
    spent: number;
    committed: number;
    remaining: number;
    standing_rank: number;
}

// ── Eligible Players ────────────────────────────────────────

export interface IFAPlayerScouting {
    unlocked: string[];
    attrs_precise: boolean;
    pots_precise: boolean;
    available_actions: string[];
}

export interface IFAEligiblePlayer {
    player_id: number;
    listed_position: string | null;
    star_rating: number;
    slot_value: number;
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
    scouting: IFAPlayerScouting;
}

// ── Board (Main View) ──────────────────────────────────────

export interface IFAMyOffer {
    bonus: number;
}

export interface IFAAuctionEntry {
    auction_id: number;
    player_id: number;
    listed_position: string | null;
    phase: IFAAuctionPhase;
    star_rating: number;
    slot_value: number;
    entered_week: number;
    active_offers: number;
    competitors: string[];
    my_offer: IFAMyOffer | null;
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
    scouting: IFAPlayerScouting;
}

export interface IFABoardResponse {
    state: IFAState;
    pool: IFABonusPool;
    auctions: IFAAuctionEntry[];
}

// ── Auction Detail ──────────────────────────────────────────

export type IFAOfferStatus = "active" | "outbid" | "withdrawn" | "won" | "lost";

export interface IFAAuctionOffer {
    offer_id: number;
    org_abbrev: string;
    status: IFAOfferStatus;
    submitted_week: number;
    bonus?: number; // Only present when is_mine === true
    is_mine: boolean;
}

export interface IFAAuctionDetail {
    auction_id: number;
    player_id: number;
    player_name: string;
    age: number;
    ptype: "Pitcher" | "Position";
    area: string;
    phase: IFAAuctionPhase;
    star_rating: number;
    slot_value: number;
    entered_week: number;
    winning_offer_id: number | null;
    offers: IFAAuctionOffer[];
}

// ── Start Auction ───────────────────────────────────────────

export interface IFAStartAuctionRequest {
    player_id: number;
    league_year_id: number;
}

export interface IFAStartAuctionResponse {
    auction_id: number;
    player_id: number;
    player_name: string;
    phase: IFAAuctionPhase;
    star_rating: number;
    slot_value: number;
    age: number;
}

// ── Submit / Update Offer ───────────────────────────────────

export interface IFAOfferRequest {
    org_id: number;
    bonus: number;
    league_year_id: number;
    executed_by?: string;
}

export interface IFAOfferResponse {
    offer_id: number;
    is_update: boolean;
    bonus: number;
    phase: IFAAuctionPhase;
}

// ── Withdraw Offer ──────────────────────────────────────────

export interface IFAWithdrawResponse {
    withdrawn: boolean;
}

// ── Org's Active Offers ─────────────────────────────────────

export interface IFAOrgOffer {
    offer_id: number;
    auction_id: number;
    player_id: number;
    player_name: string;
    age: number;
    ptype: "Pitcher" | "Position";
    bonus: number;
    status: IFAOfferStatus;
    auction_phase: IFAAuctionPhase;
    star_rating: number;
    slot_value: number;
}

// ── Admin: Advance Week ─────────────────────────────────────

export interface IFAAdvanceWeekRequest {
    league_year_id: number;
}

export interface IFAPhaseTransitions {
    open_to_listening: number;
    listening_to_finalize: number;
    finalize_to_completed: number;
    still_open: number;
    expired?: number;
}

export interface IFAAdvanceWeekResponse {
    league_year_id: number;
    previous_week: number;
    new_week: number;
    status: IFAStatus;
    players_ranked?: number;
    pools_allocated?: number;
    phase_transitions?: IFAPhaseTransitions;
}

// ── Offer Status Colors ─────────────────────────────────────

export const IFA_OFFER_STATUS_COLORS: Record<IFAOfferStatus, string> = {
    active: "green",
    won: "blue",
    outbid: "yellow",
    lost: "red",
    withdrawn: "gray",
};

// ── Star Rating Helpers ─────────────────────────────────────

export const starRatingLabel = (stars: number): string => {
    return "\u2605".repeat(stars) + "\u2606".repeat(5 - stars);
};

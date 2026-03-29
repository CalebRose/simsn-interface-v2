// ═══════════════════════════════════════════════
// Request DTOs
// ═══════════════════════════════════════════════

export interface PromoteRequest {
    contract_id: number;
    target_level_id: number;
    league_year_id: number;
    executed_by?: string;
}

export interface DemoteRequest {
    contract_id: number;
    target_level_id: number;
    league_year_id: number;
    executed_by?: string;
}

export interface IRPlaceRequest {
    contract_id: number;
    league_year_id: number;
}

export interface IRActivateRequest {
    contract_id: number;
    league_year_id: number;
}

export interface ReleaseRequest {
    contract_id: number;
    org_id: number;
    league_year_id: number;
}

export interface BuyoutRequest {
    contract_id: number;
    org_id: number;
    buyout_amount: number;
    league_year_id: number;
    game_week_id: number;
}

export interface ExtendRequest {
    contract_id: number;
    org_id: number;
    years: number;
    salaries: number[];
    bonus: number;
    league_year_id: number;
    game_week_id: number;
}

// ═══════════════════════════════════════════════
// Response DTOs
// ═══════════════════════════════════════════════

export interface RosterWarning {
    count: number;
    max_roster: number;
    over_limit: boolean;
}

/** Post-transaction player state returned by all transaction endpoints. */
export interface TransactionPlayerPatch {
    firstname: string;
    lastname: string;
    ptype: string;
    current_level: string | null;
    on_ir: boolean;
}

export interface PromoteResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    from_level: string;
    to_level: string;
    roster_warning?: RosterWarning;
    player?: TransactionPlayerPatch;
}

export interface DemoteResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    from_level: string;
    to_level: string;
    player?: TransactionPlayerPatch;
}

export interface IRPlaceResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    player?: TransactionPlayerPatch;
}

export interface IRActivateResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    roster_warning?: RosterWarning;
    player?: TransactionPlayerPatch;
}

export interface ReleaseResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    years_remaining_on_books: number;
    waiver?: {
        waiver_claim_id: number;
        expires_week: number;
    };
    player?: TransactionPlayerPatch;
}

export interface BuyoutResponse {
    transaction_id: number;
    original_contract_id: number;
    buyout_contract_id: number;
    buyout_amount: number;
    player_id: number;
    player?: TransactionPlayerPatch;
}

export interface ExtendResponse {
    transaction_id: number;
    original_contract_id: number;
    extension_contract_id: number;
    player_id: number;
    years: number;
    bonus: number;
    starts_league_year: number;
}

// ═══════════════════════════════════════════════
// Roster Status
// ═══════════════════════════════════════════════

export interface RosterLevelStatus {
    level_id: number;
    level_name: string;
    count: number;
    max_roster: number;
    over_limit: boolean;
}

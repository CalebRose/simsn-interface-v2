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

export interface PromoteResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    from_level: string;
    to_level: string;
    roster_warning?: RosterWarning;
}

export interface DemoteResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    from_level: string;
    to_level: string;
}

export interface IRPlaceResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
}

export interface IRActivateResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    roster_warning?: RosterWarning;
}

export interface ReleaseResponse {
    transaction_id: number;
    contract_id: number;
    player_id: number;
    years_remaining_on_books: number;
}

export interface BuyoutResponse {
    transaction_id: number;
    original_contract_id: number;
    buyout_contract_id: number;
    buyout_amount: number;
    player_id: number;
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

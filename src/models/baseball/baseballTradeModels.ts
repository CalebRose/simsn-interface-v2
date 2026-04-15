// ═══════════════════════════════════════════════
// Trade Proposal DTOs
// ═══════════════════════════════════════════════

export interface SalaryRetention {
    retaining_org_id: number;
    retention_pct: number; // 0.0–1.0
}

export interface TradeProposalBody {
    players_to_b: number[];   // player IDs going to receiving org
    players_to_a: number[];   // player IDs going to proposing org
    salary_retention?: Record<number, SalaryRetention>;
    cash_a_to_b?: number;     // signed: positive = A sends cash to B
}

export interface ProposeTradeRequest {
    proposing_org_id: number;
    receiving_org_id: number;
    league_year_id: number;
    proposal: TradeProposalBody;
}

export interface ProposeTradeResponse {
    proposal_id: number;
    status: string;
    message: string;
}

// ═══════════════════════════════════════════════
// Trade Proposal (returned from API)
// ═══════════════════════════════════════════════

export type TradeProposalStatus =
    | "proposed"
    | "counterparty_accepted"
    | "admin_approved"
    | "admin_rejected"
    | "executed"
    | "rejected"
    | "cancelled";

export interface TradeProposal {
    id: number;
    proposing_org_id: number;
    receiving_org_id: number;
    league_year_id: number;
    status: TradeProposalStatus;
    proposal: TradeProposalBody;
    note?: string;
    created_at: string;
    updated_at: string;
}

// ═══════════════════════════════════════════════
// Action Request (accept/reject/cancel)
// ═══════════════════════════════════════════════

export interface TradeProposalActionRequest {
    note?: string;
}

// ═══════════════════════════════════════════════
// Admin: Approve Trade
// ═══════════════════════════════════════════════

export interface AdminApproveTradeRequest {
    league_year_id: number;
    game_week_id: number;
    note?: string;
    executed_by?: string;
}

export interface AdminApproveTradeResponse {
    proposal_id: number;
    status: string;
    trade_result: {
        transaction_id: number;
        org_a_id: number;
        org_b_id: number;
        players_to_b: number[];
        players_to_a: number[];
        cash_a_to_b: number;
    };
}

// ═══════════════════════════════════════════════
// Admin: Reject Trade
// ═══════════════════════════════════════════════

export interface AdminRejectTradeRequest {
    note?: string;
}

// ═══════════════════════════════════════════════
// Admin: Direct Trade Execution
// ═══════════════════════════════════════════════

export interface DirectTradeRequest {
    org_a_id: number;
    org_b_id: number;
    league_year_id: number;
    game_week_id: number;
    players_to_b?: number[];
    players_to_a?: number[];
    salary_retention?: Record<string, { retention_pct: number }>;
    cash_a_to_b?: number;
    executed_by?: string;
}

export interface DirectTradeResponse {
    transaction_id: number;
    org_a_id: number;
    org_b_id: number;
    players_to_b: number[];
    players_to_a: number[];
    cash_a_to_b: number;
}

// ═══════════════════════════════════════════════
// Roster Context (for trade review)
// ═══════════════════════════════════════════════

export interface TradeRosterPlayer {
    contract_id: number;
    player_id: number;
    player_name: string;
    position: string;
    current_level: number;
    onIR: number;
    salary: number;
}

export interface RosterLevelStatus {
    level_id: number;
    level_name: number;
    count: number;
    min_roster: number;
    max_roster: number;
    over_limit: boolean;
    under_limit: boolean;
}

// ═══════════════════════════════════════════════
// Transaction Log & Rollback
// ═══════════════════════════════════════════════

export interface TransactionLogEntry {
    id: number;
    org_id: number;
    type: string;
    details: any;
    created_at: string;
}

export interface RollbackRequest {
    transaction_id: number;
}

export interface RollbackResponse {
    status: string;
    transaction_id: number;
}

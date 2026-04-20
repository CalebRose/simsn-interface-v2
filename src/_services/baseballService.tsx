import { baseballUrl } from "../_constants/urls";
import { GetCall, PostCall, PUTCall, DELETECall } from "../_helper/fetchHelper";
import type { TutorialManifest, TutorialArticle } from "../models/baseball/baseballTutorialModels";
import { BaseballBootstrapLanding, BaseballBootstrapAll, BaseballOrganization, BaseballRosters, PayrollProjectionResponse, ContractOverviewPlayer, ScheduleParams, ScheduleResponse, ListedPositionResponse, OrgFinancialSummaryResponse, LedgerResponse } from "../models/baseball/baseballModels";
import { FaceDataResponse } from "../models/footballModels";
import {
    OrgPlayerStrategiesResponse,
    PlayerStrategy,
    PlayerStrategyBatchSaveRequest,
    TeamStrategy,
    LineupConfig,
    DefenseConfig,
    RotationConfig,
    BullpenConfig,
} from "../models/baseball/baseballGameplanModels";
import {
    PromoteRequest, PromoteResponse,
    DemoteRequest, DemoteResponse,
    IRPlaceRequest, IRPlaceResponse,
    IRActivateRequest, IRActivateResponse,
    ReleaseRequest, ReleaseResponse,
    BuyoutRequest, BuyoutResponse,
    ExtendRequest, ExtendResponse,
    RosterLevelStatus,
} from "../models/baseball/baseballTransactionModels";
import {
    ProposeTradeRequest, ProposeTradeResponse,
    TradeProposal, TradeProposalActionRequest,
    PaginatedTradeProposals,
    AdminApproveTradeRequest, AdminApproveTradeResponse,
    AdminRejectTradeRequest,
    DirectTradeRequest, DirectTradeResponse,
    TradeRosterPlayer, RollbackRequest, RollbackResponse,
    TransactionLogEntry,
} from "../models/baseball/baseballTradeModels";
import type { RosterLevelStatus as TradeRosterLevelStatus } from "../models/baseball/baseballTradeModels";
import {
    CollegePoolParams, CollegePoolResponse,
    ProPoolParams, ProPoolResponse,
    IntamPoolParams, IntamPoolResponse,
    MlbPoolParams, MlbPoolResponse,
    FreeAgentListItem,
    ScoutingPlayerResponse,
    ScoutingActionRequest, ScoutingActionResponse,
    ScoutingBatchActionRequest, ScoutingBatchActionResponse,
    ScoutingBudget, ScoutingActionsResponse,
    ScoutingDepartmentStatus,
    DepartmentPurchaseRequest, DepartmentPurchaseResponse,
    SignPlayerRequest, SignPlayerResponse,
    SigningBudgetResponse,
    IntamSigningsResponse,
} from "../models/baseball/baseballScoutingModels";
import {
    RecruitingState,
    RankingsParams, RankingsResponse,
    BoardResponse, BoardModifyRequest, BoardModifyResponse,
    RecruitingPlayerDetail,
    InvestmentStateResponse, InvestRequest, InvestResponse,
    CommitmentsParams, CommitmentsResponse,
} from "../models/baseball/baseballRecruitingModels";
import {
    BoxScoreResponse, PlayByPlayResponse,
    GameResultsParams, GameResultsResponse,
    BattingLeaderboardParams, BattingLeadersResponse,
    PitchingLeaderboardParams, PitchingLeadersResponse,
    FieldingLeaderboardParams, FieldingLeadersResponse,
    TeamStatsParams, TeamStatsResponse,
    PlayerStatsParams, PlayerStatsResponse,
    SplitsParams, SplitsResponse,
    PlayerGamelogResponse,
    PlayerCareerResponse,
    PlayerSplitsResponse,
    InjuryReportParams, InjuryReportResponse,
    InjuryHistoryParams, InjuryHistoryResponse,
    PlayerInjuryHistoryParams, PlayerInjuryHistoryResponse,
    AdminInjuryLogParams, AdminInjuryLogResponse,
    PositionUsageParams, PositionUsageResponse,
} from "../models/baseball/baseballStatsModels";
import {
    PlayoffBracketResponse,
    PendingGamesResponse,
    AllStarRostersResponse, AllStarResultsResponse,
    WBCTeamsResponse, WBCRostersResponse,
    SpecialEventsResponse,
    CTGenerateResponse, CTAdvanceResponse, CTWipeResponse,
} from "../models/baseball/baseballEventModels";
import {
    BaseballDraftState,
    DraftBoardResponse,
    BaseballDraftPick,
    DraftTradeProposal,
    EligiblePlayersParams,
    EligiblePlayersResponse,
    DraftInitializeParams,
    DraftInitializeResponse,
    RoundModeConfig,
    AutoDraftPreferences,
    SetAutoPrefsRequest,
    AutoRoundsResponse,
    MakePickRequest,
    MakePickResponse,
    SignPickResponse,
    PassPickResponse,
} from "../models/baseball/baseballDraftModels";
import {
    SimulateWeekRequest, SimulateWeekResponse,
    SimulateSubweekRequest, SimulateSubweekResponse,
    AdvanceWeekRequest, SimpleStatusResponse,
    RollbackToWeekRequest,
    EndSeasonRequest, EndSeasonResponse,
    StartNewSeasonRequest, StartNewSeasonResponse,
    SetPhaseRequest,
    RunSeasonRequest, RunSeasonResponse,
    TaskStatusResponse,
    AdvanceRecruitingWeekRequest, AdvanceRecruitingWeekResponse,
    RecruitingSummaryResponse,
    OrgLeaderboardResponse,
    PlayerDemandParams, PlayerDemandResponse,
    OrgDetailResponse,
    RecruitingResetWeekRequest,
    RecruitingWipeRequest, RecruitingWipeResponse,
    RecruitingFullResetResponse,
    RankingsWipeResponse, RankingsRegenerateResponse,
} from "../models/baseball/baseballAdminModels";
import {
    IFAState,
    IFABonusPool,
    IFAEligiblePlayer,
    IFABoardResponse,
    IFAAuctionDetail,
    IFAStartAuctionRequest, IFAStartAuctionResponse,
    IFAOfferRequest, IFAOfferResponse,
    IFAWithdrawResponse,
    IFAOrgOffer,
    IFAAdvanceWeekRequest, IFAAdvanceWeekResponse,
} from "../models/baseball/baseballIFAModels";
import {
    FAPoolParams, FAPoolResponse,
    AuctionBoardEntry,
    FAPlayerDetailResponse,
    FAOfferRequest, FAOfferResponse,
    FAWithdrawResponse,
    FAScoutRequest, FAScoutResponse,
    MarketSummary, MarketRateResponse,
    FASigningBudgetResponse,
    ContractOverviewWithDemand,
    FAScoutingBudgetResponse,
    FASignRequest, FASignResponse,
    WaiverListResponse, WaiverDetailResponse,
    WaiverClaimResponse, WaiverWithdrawResponse,
} from "../models/baseball/baseballFreeAgencyModels";

/** Normalize face data keys from any casing to PascalCase matching FaceDataResponse. */
export const normalizeFaceData = (f: any): FaceDataResponse => {
    return {
        PlayerID:        f.PlayerID        ?? f.playerID        ?? f.player_id       ?? 0,
        Accessories:     f.Accessories     ?? f.accessories     ?? "",
        Body:            f.Body            ?? f.body            ?? "",
        Ear:             f.Ear             ?? f.ear             ?? "",
        Eye:             f.Eye             ?? f.eye             ?? "",
        EyeLine:         f.EyeLine         ?? f.eyeLine         ?? f.eye_line        ?? "",
        Eyebrow:         f.Eyebrow         ?? f.eyebrow         ?? "",
        FacialHair:      f.FacialHair      ?? f.facialHair      ?? f.facial_hair     ?? "",
        Glasses:         f.Glasses         ?? f.glasses         ?? "",
        Hair:            f.Hair            ?? f.hair            ?? "",
        HairBG:          f.HairBG          ?? f.hairBG          ?? f.hair_bg         ?? "",
        HairFlip:        f.HairFlip        ?? f.hairFlip        ?? f.hair_flip       ?? false,
        Head:            f.Head            ?? f.head            ?? "",
        Jersey:          f.Jersey          ?? f.jersey          ?? "",
        MiscLine:        f.MiscLine        ?? f.miscLine        ?? f.misc_line       ?? "",
        Mouth:           f.Mouth           ?? f.mouth           ?? "",
        MouthFlip:       f.MouthFlip       ?? f.mouthFlip       ?? f.mouth_flip      ?? false,
        Nose:            f.Nose            ?? f.nose            ?? "",
        NoseFlip:        f.NoseFlip        ?? f.noseFlip        ?? f.nose_flip       ?? false,
        SmileLine:       f.SmileLine       ?? f.smileLine       ?? f.smile_line      ?? "",
        BodySize:        f.BodySize        ?? f.bodySize        ?? f.body_size       ?? 1,
        EarSize:         f.EarSize         ?? f.earSize         ?? f.ear_size        ?? 1,
        EyeAngle:        f.EyeAngle        ?? f.eyeAngle        ?? f.eye_angle       ?? 0,
        EyeBrowAngle:    f.EyeBrowAngle    ?? f.eyeBrowAngle    ?? f.eyebrow_angle   ?? 0,
        FaceSize:        f.FaceSize        ?? f.faceSize        ?? f.face_size       ?? 0,
        FacialHairShave: f.FacialHairShave ?? f.facialHairShave ?? f.facial_hair_shave ?? "",
        NoseSize:        f.NoseSize        ?? f.noseSize        ?? f.nose_size       ?? 0,
        SmileLineSize:   f.SmileLineSize   ?? f.smileLineSize   ?? f.smile_line_size ?? 0,
        SkinColor:       f.SkinColor       ?? f.skinColor       ?? f.skin_color      ?? "",
        HairColor:       f.HairColor       ?? f.hairColor       ?? f.hair_color      ?? "",
    } as FaceDataResponse;
};

/** Build a URLSearchParams from a params object, skipping null/undefined values. */
const buildQueryString = (params: Record<string, string | number | boolean | null | undefined>): string => {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val != null && val !== "") qs.set(key, String(val));
    }
    return qs.toString();
};

export const BaseballService = {
    //Fetch Orgs
    GetAllOrganizations: async (): Promise<BaseballOrganization[]> => {
        const url = `${baseballUrl}org_report/`;
        return await GetCall<BaseballOrganization[]>(url);
    },
    GetAllRosters: async (viewingOrgId?: number): Promise<BaseballRosters[]> => {
        const qs = viewingOrgId ? `?viewing_org_id=${viewingOrgId}` : "";
        return await GetCall<BaseballRosters[]>(`${baseballUrl}rosters${qs}`);
    },
    // Bootstrap landing page data
    GetBootstrapLandingData: async (orgId: number, viewingOrgId?: number): Promise<BaseballBootstrapLanding> => {
        const qs = viewingOrgId ? `?viewing_org_id=${viewingOrgId}` : "";
        const url = `${baseballUrl}bootstrap/landing/${orgId}${qs}`;
        return await GetCall<BaseballBootstrapLanding>(url);
    },
    // All-orgs bootstrap (single request, pre-populates cache for every org)
    GetAllBootstrapData: async (viewingOrgId?: number): Promise<BaseballBootstrapAll> => {
        const qs = viewingOrgId ? `?viewing_org_id=${viewingOrgId}` : "";
        const url = `${baseballUrl}bootstrap/landing/all${qs}`;
        return await GetCall<BaseballBootstrapAll>(url);
    },
    // Notification management
    MarkNotificationRead: async (notificationId: number): Promise<void> => {
        const token = localStorage.getItem("token");
        await fetch(`${baseballUrl}notifications/${notificationId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token || ""}` },
        });
    },
    DeleteNotification: async (notificationId: number): Promise<void> => {
        const token = localStorage.getItem("token");
        await fetch(`${baseballUrl}notifications/${notificationId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token || ""}` },
        });
    },
    // --- Gameplanning: Player Strategy (org-level) ---
    GetOrgPlayerStrategies: async (orgId: number): Promise<OrgPlayerStrategiesResponse> => {
        return await GetCall<OrgPlayerStrategiesResponse>(`${baseballUrl}gameplanning/org/${orgId}/player-strategies`);
    },
    GetPlayerStrategy: async (orgId: number, playerId: number): Promise<PlayerStrategy> => {
        return await GetCall<PlayerStrategy>(`${baseballUrl}gameplanning/org/${orgId}/player/${playerId}/strategy`);
    },
    /**
     * Bulk upsert player strategies for an org. All-or-nothing on the backend.
     * Max 500 strategies per request. On 400 validation_failed, the thrown
     * ApiError carries `body.details: PlayerStrategyValidationDetail[]` for
     * per-row error display.
     */
    SaveOrgPlayerStrategiesBatch: async (
        orgId: number,
        strategies: PlayerStrategyBatchSaveRequest["strategies"],
    ): Promise<OrgPlayerStrategiesResponse> => {
        return await PUTCall<PlayerStrategyBatchSaveRequest, OrgPlayerStrategiesResponse>(
            `${baseballUrl}gameplanning/org/${orgId}/player-strategies`,
            { strategies },
        );
    },
    // --- Gameplanning: Team Strategy ---
    GetTeamStrategy: async (teamId: number): Promise<TeamStrategy> => {
        return await GetCall<TeamStrategy>(`${baseballUrl}gameplanning/team/${teamId}/strategy`);
    },
    SaveTeamStrategy: async (teamId: number, dto: Partial<TeamStrategy>): Promise<TeamStrategy> => {
        return await PUTCall<Partial<TeamStrategy>, TeamStrategy>(`${baseballUrl}gameplanning/team/${teamId}/strategy`, dto);
    },
    // --- Gameplanning: Lineup ---
    GetLineup: async (teamId: number): Promise<LineupConfig> => {
        return await GetCall<LineupConfig>(`${baseballUrl}gameplanning/team/${teamId}/lineup`);
    },
    SaveLineup: async (teamId: number, dto: LineupConfig): Promise<LineupConfig> => {
        return await PUTCall<LineupConfig, LineupConfig>(`${baseballUrl}gameplanning/team/${teamId}/lineup`, dto);
    },
    // --- Gameplanning: Defense ---
    GetDefensePlan: async (teamId: number): Promise<DefenseConfig> => {
        return await GetCall<DefenseConfig>(`${baseballUrl}gameplanning/team/${teamId}/defense`);
    },
    SaveDefensePlan: async (teamId: number, dto: DefenseConfig): Promise<DefenseConfig> => {
        return await PUTCall<DefenseConfig, DefenseConfig>(`${baseballUrl}gameplanning/team/${teamId}/defense`, dto);
    },
    // --- Gameplanning: Rotation ---
    GetRotation: async (teamId: number): Promise<RotationConfig> => {
        return await GetCall<RotationConfig>(`${baseballUrl}gameplanning/team/${teamId}/rotation`);
    },
    SaveRotation: async (teamId: number, dto: RotationConfig): Promise<RotationConfig> => {
        return await PUTCall<RotationConfig, RotationConfig>(`${baseballUrl}gameplanning/team/${teamId}/rotation`, dto);
    },
    // --- Gameplanning: Bullpen ---
    GetBullpen: async (teamId: number): Promise<BullpenConfig> => {
        return await GetCall<BullpenConfig>(`${baseballUrl}gameplanning/team/${teamId}/bullpen`);
    },
    SaveBullpen: async (teamId: number, dto: BullpenConfig): Promise<BullpenConfig> => {
        return await PUTCall<BullpenConfig, BullpenConfig>(`${baseballUrl}gameplanning/team/${teamId}/bullpen`, dto);
    },
    // --- Listed Position ---
    GetListedPosition: async (teamId: number, playerId: number): Promise<ListedPositionResponse> => {
        return await GetCall<ListedPositionResponse>(`${baseballUrl}gameplanning/team/${teamId}/player/${playerId}/listed-position`);
    },
    SetListedPosition: async (teamId: number, playerId: number, positionCode: string): Promise<ListedPositionResponse> => {
        return await PUTCall<{ position_code: string }, ListedPositionResponse>(
            `${baseballUrl}gameplanning/team/${teamId}/player/${playerId}/listed-position`,
            { position_code: positionCode },
        );
    },
    ClearListedPosition: async (teamId: number, playerId: number): Promise<ListedPositionResponse> => {
        return await DELETECall<{}, ListedPositionResponse>(
            `${baseballUrl}gameplanning/team/${teamId}/player/${playerId}/listed-position`,
            {},
        );
    },
    // --- Transactions ---
    PromotePlayer: async (dto: PromoteRequest): Promise<PromoteResponse> => {
        return await PostCall<PromoteRequest, PromoteResponse>(`${baseballUrl}transactions/promote`, dto);
    },
    DemotePlayer: async (dto: DemoteRequest): Promise<DemoteResponse> => {
        return await PostCall<DemoteRequest, DemoteResponse>(`${baseballUrl}transactions/demote`, dto);
    },
    PlaceOnIR: async (dto: IRPlaceRequest): Promise<IRPlaceResponse> => {
        return await PostCall<IRPlaceRequest, IRPlaceResponse>(`${baseballUrl}transactions/ir/place`, dto);
    },
    ActivateFromIR: async (dto: IRActivateRequest): Promise<IRActivateResponse> => {
        return await PostCall<IRActivateRequest, IRActivateResponse>(`${baseballUrl}transactions/ir/activate`, dto);
    },
    ReleasePlayer: async (dto: ReleaseRequest): Promise<ReleaseResponse> => {
        return await PostCall<ReleaseRequest, ReleaseResponse>(`${baseballUrl}transactions/release`, dto);
    },
    BuyoutContract: async (dto: BuyoutRequest): Promise<BuyoutResponse> => {
        return await PostCall<BuyoutRequest, BuyoutResponse>(`${baseballUrl}transactions/buyout`, dto);
    },
    ExtendContract: async (dto: ExtendRequest): Promise<ExtendResponse> => {
        return await PostCall<ExtendRequest, ExtendResponse>(`${baseballUrl}transactions/extend`, dto);
    },
    GetRosterStatus: async (orgId: number): Promise<RosterLevelStatus[]> => {
        return await GetCall<RosterLevelStatus[]>(`${baseballUrl}transactions/roster-status/${orgId}`);
    },
    // --- Financials / Contract Data ---
    GetOrgFinancialSummary: async (orgAbbrev: string, leagueYear: number): Promise<OrgFinancialSummaryResponse> => {
        return await GetCall<OrgFinancialSummaryResponse>(`${baseballUrl}orgs/${orgAbbrev}/financial_summary?league_year=${leagueYear}`);
    },
    GetLedgerEntries: async (orgAbbrev: string, leagueYear: number, entryType?: string): Promise<LedgerResponse> => {
        let url = `${baseballUrl}orgs/${orgAbbrev}/ledger?league_year=${leagueYear}`;
        if (entryType) url += `&entry_type=${entryType}`;
        return await GetCall<LedgerResponse>(url);
    },
    GetPayrollProjection: async (orgId: number): Promise<PayrollProjectionResponse> => {
        return await GetCall<PayrollProjectionResponse>(`${baseballUrl}transactions/payroll-projection/${orgId}`);
    },
    GetContractOverview: async (orgId: number): Promise<ContractOverviewPlayer[]> => {
        return await GetCall<ContractOverviewPlayer[]>(`${baseballUrl}transactions/contract-overview/${orgId}`);
    },
    // --- Trades ---
    ProposeTrade: async (dto: ProposeTradeRequest): Promise<ProposeTradeResponse> => {
        return await PostCall<ProposeTradeRequest, ProposeTradeResponse>(`${baseballUrl}transactions/trade/propose`, dto);
    },
    GetTradeProposals: async (orgId: number, status?: string, limit = 50, offset = 0): Promise<PaginatedTradeProposals> => {
        let url = `${baseballUrl}transactions/trade/proposals?org_id=${orgId}&limit=${limit}&offset=${offset}`;
        if (status) url += `&status=${status}`;
        return await GetCall<PaginatedTradeProposals>(url);
    },
    AcceptProposal: async (proposalId: number, dto: TradeProposalActionRequest = {}): Promise<void> => {
        await PUTCall<TradeProposalActionRequest, void>(`${baseballUrl}transactions/trade/proposals/${proposalId}/accept`, dto);
    },
    RejectProposal: async (proposalId: number, dto: TradeProposalActionRequest = {}): Promise<void> => {
        await PUTCall<TradeProposalActionRequest, void>(`${baseballUrl}transactions/trade/proposals/${proposalId}/reject`, dto);
    },
    CancelProposal: async (proposalId: number, dto: TradeProposalActionRequest = {}): Promise<void> => {
        await PUTCall<TradeProposalActionRequest, void>(`${baseballUrl}transactions/trade/proposals/${proposalId}/cancel`, dto);
    },
    // --- Admin Trade Endpoints ---
    GetAllTradeProposals: async (status?: string, limit = 50, offset = 0): Promise<PaginatedTradeProposals> => {
        let url = `${baseballUrl}transactions/trade/proposals?limit=${limit}&offset=${offset}`;
        if (status) url += `&status=${status}`;
        return await GetCall<PaginatedTradeProposals>(url);
    },
    GetTradeProposal: async (proposalId: number): Promise<TradeProposal> => {
        return await GetCall<TradeProposal>(`${baseballUrl}transactions/trade/proposals/${proposalId}`);
    },
    AdminApproveTrade: async (proposalId: number, dto: AdminApproveTradeRequest): Promise<AdminApproveTradeResponse> => {
        return await PUTCall<AdminApproveTradeRequest, AdminApproveTradeResponse>(`${baseballUrl}transactions/trade/proposals/${proposalId}/admin-approve`, dto);
    },
    AdminRejectTrade: async (proposalId: number, dto: AdminRejectTradeRequest): Promise<TradeProposal> => {
        return await PUTCall<AdminRejectTradeRequest, TradeProposal>(`${baseballUrl}transactions/trade/proposals/${proposalId}/admin-reject`, dto);
    },
    ExecuteDirectTrade: async (dto: DirectTradeRequest): Promise<DirectTradeResponse> => {
        return await PostCall<DirectTradeRequest, DirectTradeResponse>(`${baseballUrl}transactions/trade/execute`, dto);
    },
    GetTradeRoster: async (orgId: number): Promise<TradeRosterPlayer[]> => {
        return await GetCall<TradeRosterPlayer[]>(`${baseballUrl}transactions/roster/${orgId}`);
    },
    GetTradeRosterStatus: async (orgId: number): Promise<TradeRosterLevelStatus[]> => {
        return await GetCall<TradeRosterLevelStatus[]>(`${baseballUrl}transactions/roster-status/${orgId}`);
    },
    GetTransactionLog: async (orgId?: number, type?: string): Promise<TransactionLogEntry[]> => {
        let url = `${baseballUrl}transactions/log`;
        const params: string[] = [];
        if (orgId) params.push(`org_id=${orgId}`);
        if (type) params.push(`type=${type}`);
        if (params.length) url += `?${params.join('&')}`;
        return await GetCall<TransactionLogEntry[]>(url);
    },
    RollbackTransaction: async (dto: RollbackRequest): Promise<RollbackResponse> => {
        return await PostCall<RollbackRequest, RollbackResponse>(`${baseballUrl}transactions/rollback`, dto);
    },
    // --- Scouting: Pool Endpoints ---
    GetCollegePool: async (params: CollegePoolParams): Promise<CollegePoolResponse> => {
        const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
        return await GetCall<CollegePoolResponse>(`${baseballUrl}scouting/college-pool?${qs}`);
    },
    GetProPool: async (params: ProPoolParams): Promise<ProPoolResponse> => {
        const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
        return await GetCall<ProPoolResponse>(`${baseballUrl}scouting/pro-pool?${qs}`);
    },
    GetIntamPool: async (params: IntamPoolParams): Promise<IntamPoolResponse> => {
        const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
        return await GetCall<IntamPoolResponse>(`${baseballUrl}scouting/intam-pool?${qs}`);
    },
    GetIntamBoard: async (orgId: number, leagueYearId: number): Promise<BoardResponse> => {
        return await GetCall<BoardResponse>(`${baseballUrl}scouting/intam-board/${orgId}?league_year_id=${leagueYearId}`);
    },
    AddToIntamBoard: async (dto: BoardModifyRequest): Promise<BoardModifyResponse> => {
        return await PostCall<BoardModifyRequest, BoardModifyResponse>(`${baseballUrl}scouting/intam-board/add`, dto);
    },
    RemoveFromIntamBoard: async (dto: BoardModifyRequest): Promise<BoardModifyResponse> => {
        return await PostCall<BoardModifyRequest, BoardModifyResponse>(`${baseballUrl}scouting/intam-board/remove`, dto);
    },
    GetIntamSignings: async (params: { league_year_id: number; page?: number; per_page?: number }): Promise<IntamSigningsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.page) qs.set("page", String(params.page));
        if (params.per_page) qs.set("per_page", String(params.per_page));
        return await GetCall<IntamSigningsResponse>(`${baseballUrl}scouting/intam-signings?${qs.toString()}`);
    },
    GetMlbPool: async (params: MlbPoolParams): Promise<MlbPoolResponse> => {
        const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
        return await GetCall<MlbPoolResponse>(`${baseballUrl}scouting/mlb-pool?${qs}`);
    },
    GetFreeAgentList: async (): Promise<FreeAgentListItem[]> => {
        return await GetCall<FreeAgentListItem[]>(`${baseballUrl}transactions/free-agents`);
    },
    // --- Scouting: Player Detail & Actions ---
    GetScoutedPlayer: async (playerId: number, orgId: number, leagueYearId: number): Promise<ScoutingPlayerResponse> => {
        return await GetCall<ScoutingPlayerResponse>(`${baseballUrl}scouting/player/${playerId}?org_id=${orgId}&league_year_id=${leagueYearId}`);
    },
    /**
     * Fetch scouting data for multiple players in a single request.
     * Max 200 player IDs per call.
     */
    GetScoutedPlayersBatch: async (
        playerIds: number[],
        orgId: number,
        leagueYearId: number,
        mode: "overlay" | "full" = "overlay",
    ): Promise<Record<number, ScoutingPlayerResponse>> => {
        if (playerIds.length === 0) return {};
        const qs = new URLSearchParams();
        qs.set("org_id", String(orgId));
        qs.set("league_year_id", String(leagueYearId));
        qs.set("player_ids", playerIds.join(","));
        qs.set("mode", mode);
        const response = await GetCall<{ players: Record<string, ScoutingPlayerResponse>; not_found: number[] }>(
            `${baseballUrl}scouting/players/batch?${qs.toString()}`,
        );
        // Convert string-keyed response to number-keyed for consumer convenience
        const result: Record<number, ScoutingPlayerResponse> = {};
        for (const [idStr, data] of Object.entries(response.players)) {
            result[Number(idStr)] = data;
        }
        return result;
    },
    PerformScoutingAction: async (dto: ScoutingActionRequest): Promise<ScoutingActionResponse> => {
        return await PostCall<ScoutingActionRequest, ScoutingActionResponse>(`${baseballUrl}scouting/action`, dto);
    },
    PerformBatchScoutingAction: async (dto: ScoutingBatchActionRequest): Promise<ScoutingBatchActionResponse> => {
        return await PostCall<ScoutingBatchActionRequest, ScoutingBatchActionResponse>(`${baseballUrl}scouting/action/batch`, dto);
    },
    GetScoutingBudget: async (orgId: number, leagueYearId: number): Promise<ScoutingBudget> => {
        return await GetCall<ScoutingBudget>(`${baseballUrl}scouting/budget/${orgId}?league_year_id=${leagueYearId}`);
    },
    GetScoutingActions: async (orgId: number, leagueYearId: number): Promise<ScoutingActionsResponse> => {
        return await GetCall<ScoutingActionsResponse>(`${baseballUrl}scouting/actions/${orgId}?league_year_id=${leagueYearId}`);
    },
    // --- Scouting: Department Expansion ---
    GetDepartmentStatus: async (orgId: number, leagueYearId: number): Promise<ScoutingDepartmentStatus> => {
        return await GetCall<ScoutingDepartmentStatus>(`${baseballUrl}scouting/department/${orgId}?league_year_id=${leagueYearId}`);
    },
    PurchaseDepartmentTier: async (dto: DepartmentPurchaseRequest): Promise<DepartmentPurchaseResponse> => {
        return await PostCall<DepartmentPurchaseRequest, DepartmentPurchaseResponse>(`${baseballUrl}scouting/department/purchase`, dto);
    },
    // --- Scouting: Signing ---
    SignPlayer: async (dto: SignPlayerRequest): Promise<SignPlayerResponse> => {
        return await PostCall<SignPlayerRequest, SignPlayerResponse>(`${baseballUrl}transactions/sign`, dto);
    },
    GetSigningBudget: async (orgId: number, leagueYearId: number): Promise<SigningBudgetResponse> => {
        return await GetCall<SigningBudgetResponse>(`${baseballUrl}transactions/signing-budget/${orgId}?league_year_id=${leagueYearId}`);
    },
    // --- Schedule ---
    GetSchedule: async (params: ScheduleParams): Promise<ScheduleResponse> => {
        const qs = new URLSearchParams();
        qs.set("season_year", String(params.season_year));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.week_start != null) qs.set("week_start", String(params.week_start));
        if (params.week_end != null) qs.set("week_end", String(params.week_end));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<ScheduleResponse>(`${baseballUrl}schedule?${qs.toString()}`);
    },
    // --- Box Scores & Game Results ---
    GetBoxScore: async (gameId: number, includePbp = false): Promise<BoxScoreResponse> => {
        const qs = includePbp ? "" : "?include_pbp=0";
        return await GetCall<BoxScoreResponse>(`${baseballUrl}games/${gameId}/boxscore${qs}`);
    },
    GetPlayByPlay: async (gameId: number): Promise<PlayByPlayResponse> => {
        return await GetCall<PlayByPlayResponse>(`${baseballUrl}games/${gameId}/play-by-play`);
    },
    GetGameResults: async (params: GameResultsParams): Promise<GameResultsResponse> => {
        const qs = new URLSearchParams();
        if (params.league_year_id != null) qs.set("league_year_id", String(params.league_year_id));
        if (params.season_week != null) qs.set("season_week", String(params.season_week));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<GameResultsResponse>(`${baseballUrl}games/results?${qs.toString()}`);
    },
    // --- Stats Leaderboards ---
    GetBattingLeaders: async (params: BattingLeaderboardParams): Promise<BattingLeadersResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.org_id != null) qs.set("org_id", String(params.org_id));
        if (params.sort) qs.set("sort", params.sort);
        if (params.order) qs.set("order", params.order);
        if (params.position) qs.set("position", params.position);
        if (params.min_ab != null) qs.set("min_ab", String(params.min_ab));
        if (params.min_pa != null) qs.set("min_pa", String(params.min_pa));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<BattingLeadersResponse>(`${baseballUrl}stats/batting?${qs.toString()}`);
    },
    GetPitchingLeaders: async (params: PitchingLeaderboardParams): Promise<PitchingLeadersResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.org_id != null) qs.set("org_id", String(params.org_id));
        if (params.sort) qs.set("sort", params.sort);
        if (params.order) qs.set("order", params.order);
        if (params.role) qs.set("role", params.role);
        if (params.min_ip != null) qs.set("min_ip", String(params.min_ip));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<PitchingLeadersResponse>(`${baseballUrl}stats/pitching?${qs.toString()}`);
    },
    GetFieldingLeaders: async (params: FieldingLeaderboardParams): Promise<FieldingLeadersResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.sort) qs.set("sort", params.sort);
        if (params.order) qs.set("order", params.order);
        if (params.position_code) qs.set("position_code", params.position_code);
        if (params.min_inn != null) qs.set("min_inn", String(params.min_inn));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<FieldingLeadersResponse>(`${baseballUrl}stats/fielding?${qs.toString()}`);
    },
    GetTeamStats: async (params: TeamStatsParams): Promise<TeamStatsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        return await GetCall<TeamStatsResponse>(`${baseballUrl}stats/team?${qs.toString()}`);
    },
    GetPlayerStats: async (playerId: number, params?: PlayerStatsParams): Promise<PlayerStatsResponse> => {
        const qs = new URLSearchParams();
        if (params?.league_year_id != null) qs.set("league_year_id", String(params.league_year_id));
        if (params?.include) qs.set("include", params.include);
        return await GetCall<PlayerStatsResponse>(`${baseballUrl}stats/player/${playerId}?${qs.toString()}`);
    },
    GetSplits: async (params: SplitsParams): Promise<SplitsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.player_id != null) qs.set("player_id", String(params.player_id));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        return await GetCall<SplitsResponse>(`${baseballUrl}stats/splits?${qs.toString()}`);
    },
    GetPlayerGamelog: async (playerId: number, leagueYearId: number): Promise<PlayerGamelogResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(leagueYearId));
        return await GetCall<PlayerGamelogResponse>(`${baseballUrl}stats/player/${playerId}/gamelog?${qs.toString()}`);
    },
    GetPlayerCareer: async (playerId: number): Promise<PlayerCareerResponse> => {
        return await GetCall<PlayerCareerResponse>(`${baseballUrl}stats/player/${playerId}/career`);
    },
    GetPlayerSplits: async (playerId: number, leagueYearId: number): Promise<PlayerSplitsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(leagueYearId));
        return await GetCall<PlayerSplitsResponse>(`${baseballUrl}stats/player/${playerId}/splits?${qs.toString()}`);
    },
    // --- Injuries ---
    GetInjuries: async (params: InjuryReportParams): Promise<InjuryReportResponse> => {
        const qs = new URLSearchParams();
        if (params.league_year_id != null) qs.set("league_year_id", String(params.league_year_id));
        if (params.org_id != null) qs.set("org_id", String(params.org_id));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.status) qs.set("status", params.status);
        return await GetCall<InjuryReportResponse>(`${baseballUrl}injuries?${qs.toString()}`);
    },
    GetInjuryHistory: async (params: InjuryHistoryParams): Promise<InjuryHistoryResponse> => {
        const qs = new URLSearchParams();
        if (params.league_year_id != null) qs.set("league_year_id", String(params.league_year_id));
        if (params.player_id != null) qs.set("player_id", String(params.player_id));
        if (params.org_id != null) qs.set("org_id", String(params.org_id));
        if (params.page != null) qs.set("page", String(params.page));
        if (params.page_size != null) qs.set("page_size", String(params.page_size));
        return await GetCall<InjuryHistoryResponse>(`${baseballUrl}injuries/history?${qs.toString()}`);
    },
    // --- Position Usage ---
    GetPositionUsage: async (params: PositionUsageParams): Promise<PositionUsageResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.player_id != null) qs.set("player_id", String(params.player_id));
        if (params.season_week != null) qs.set("season_week", String(params.season_week));
        return await GetCall<PositionUsageResponse>(`${baseballUrl}stats/positions?${qs.toString()}`);
    },
    // --- Special Events ---
    GetSpecialEvents: async (leagueYearId?: number): Promise<SpecialEventsResponse> => {
        const qs = new URLSearchParams();
        if (leagueYearId != null) qs.set("league_year_id", String(leagueYearId));
        return await GetCall<SpecialEventsResponse>(`${baseballUrl}special-events?${qs.toString()}`);
    },
    GetPlayoffBracket: async (leagueYearId: number, leagueLevel: number): Promise<PlayoffBracketResponse> => {
        return await GetCall<PlayoffBracketResponse>(`${baseballUrl}playoffs/bracket/${leagueYearId}/${leagueLevel}`);
    },
    GetPendingPlayoffGames: async (leagueYearId: number, leagueLevel: number): Promise<PendingGamesResponse> => {
        return await GetCall<PendingGamesResponse>(`${baseballUrl}playoffs/pending-games/${leagueYearId}/${leagueLevel}`);
    },
    // --- Conference Tournament Admin ---
    GenerateConfTournaments: async (leagueYearId: number, startWeek?: number): Promise<CTGenerateResponse> => {
        const body: Record<string, number> = { league_year_id: leagueYearId };
        if (startWeek != null) body.start_week = startWeek;
        return await PostCall<Record<string, number>, CTGenerateResponse>(`${baseballUrl}playoffs/conf-tournaments/generate`, body);
    },
    AdvanceConfTournaments: async (leagueYearId: number): Promise<CTAdvanceResponse> => {
        return await PostCall<{ league_year_id: number }, CTAdvanceResponse>(`${baseballUrl}playoffs/conf-tournaments/advance`, { league_year_id: leagueYearId });
    },
    WipeConfTournaments: async (leagueYearId: number): Promise<CTWipeResponse> => {
        return await PostCall<{ league_year_id: number }, CTWipeResponse>(`${baseballUrl}playoffs/conf-tournaments/wipe`, { league_year_id: leagueYearId });
    },
    GetAllStarRosters: async (eventId: number): Promise<AllStarRostersResponse> => {
        return await GetCall<AllStarRostersResponse>(`${baseballUrl}allstar/${eventId}/rosters`);
    },
    GetAllStarResults: async (eventId: number): Promise<AllStarResultsResponse> => {
        return await GetCall<AllStarResultsResponse>(`${baseballUrl}allstar/${eventId}/results`);
    },
    GetWBCTeams: async (eventId: number): Promise<WBCTeamsResponse> => {
        return await GetCall<WBCTeamsResponse>(`${baseballUrl}wbc/${eventId}/teams`);
    },
    GetWBCRosters: async (eventId: number): Promise<WBCRostersResponse> => {
        return await GetCall<WBCRostersResponse>(`${baseballUrl}wbc/${eventId}/rosters`);
    },
    // --- Recruiting ---
    GetRecruitingState: async (leagueYearId: number): Promise<RecruitingState> => {
        return await GetCall<RecruitingState>(`${baseballUrl}recruiting/state?league_year_id=${leagueYearId}`);
    },
    GetRankings: async (params: RankingsParams): Promise<RankingsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.page) qs.set("page", String(params.page));
        if (params.per_page) qs.set("per_page", String(params.per_page));
        if (params.star_rating) qs.set("star_rating", String(params.star_rating));
        if (params.ptype) qs.set("ptype", params.ptype);
        if (params.search) qs.set("search", params.search);
        return await GetCall<RankingsResponse>(`${baseballUrl}recruiting/rankings?${qs.toString()}`);
    },
    GetRecruitingBoard: async (orgId: number, leagueYearId: number): Promise<BoardResponse> => {
        return await GetCall<BoardResponse>(`${baseballUrl}recruiting/board/${orgId}?league_year_id=${leagueYearId}`);
    },
    AddToBoard: async (dto: BoardModifyRequest): Promise<BoardModifyResponse> => {
        return await PostCall<BoardModifyRequest, BoardModifyResponse>(`${baseballUrl}recruiting/board/add`, dto);
    },
    RemoveFromBoard: async (dto: BoardModifyRequest): Promise<BoardModifyResponse> => {
        return await PostCall<BoardModifyRequest, BoardModifyResponse>(`${baseballUrl}recruiting/board/remove`, dto);
    },
    GetRecruitingPlayer: async (playerId: number, leagueYearId: number, viewingOrgId?: number): Promise<RecruitingPlayerDetail> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(leagueYearId));
        if (viewingOrgId) qs.set("viewing_org_id", String(viewingOrgId));
        return await GetCall<RecruitingPlayerDetail>(`${baseballUrl}recruiting/player/${playerId}?${qs.toString()}`);
    },
    GetInvestments: async (orgId: number, leagueYearId: number): Promise<InvestmentStateResponse> => {
        return await GetCall<InvestmentStateResponse>(`${baseballUrl}recruiting/investments/${orgId}?league_year_id=${leagueYearId}`);
    },
    SubmitInvestment: async (dto: InvestRequest): Promise<InvestResponse> => {
        return await PostCall<InvestRequest, InvestResponse>(`${baseballUrl}recruiting/invest`, dto);
    },
    GetCommitments: async (params: CommitmentsParams): Promise<CommitmentsResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.page) qs.set("page", String(params.page));
        if (params.per_page) qs.set("per_page", String(params.per_page));
        if (params.org_id) qs.set("org_id", String(params.org_id));
        if (params.star_rating) qs.set("star_rating", String(params.star_rating));
        if (params.week) qs.set("week", String(params.week));
        return await GetCall<CommitmentsResponse>(`${baseballUrl}recruiting/commitments?${qs.toString()}`);
    },
    // --- Face Data ---
    GetFaceData: async (): Promise<{ faces: { [key: number]: FaceDataResponse } }> => {
        const raw = await GetCall<{ faces: { [key: number]: any } }>(`${baseballUrl}faces`);
        // Normalize keys to PascalCase to match FaceDataResponse (football model)
        const normalized: { [key: number]: FaceDataResponse } = {};
        if (raw.faces) {
            for (const [id, f] of Object.entries(raw.faces)) {
                normalized[Number(id)] = normalizeFaceData(f);
            }
        }
        return { faces: normalized };
    },

    // --- Draft ---
    GetDraftState: async (leagueYearId: number): Promise<BaseballDraftState> => {
        return await GetCall<BaseballDraftState>(`${baseballUrl}draft/state?league_year_id=${leagueYearId}`);
    },
    GetDraftBoard: async (leagueYearId: number): Promise<DraftBoardResponse> => {
        return await GetCall<DraftBoardResponse>(`${baseballUrl}draft/board?league_year_id=${leagueYearId}`);
    },
    GetEligiblePlayers: async (params: EligiblePlayersParams): Promise<EligiblePlayersResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.available_only != null) qs.set("available_only", String(params.available_only));
        if (params.source) qs.set("source", params.source);
        if (params.search) qs.set("search", params.search);
        if (params.viewing_org_id != null) qs.set("viewing_org_id", String(params.viewing_org_id));
        if (params.limit != null) qs.set("limit", String(params.limit));
        if (params.offset != null) qs.set("offset", String(params.offset));
        return await GetCall<EligiblePlayersResponse>(`${baseballUrl}draft/eligible?${qs.toString()}`);
    },
    GetRoundModes: async (leagueYearId: number): Promise<{ rounds: RoundModeConfig[] }> => {
        return await GetCall<{ rounds: RoundModeConfig[] }>(`${baseballUrl}draft/round-modes?league_year_id=${leagueYearId}`);
    },
    GetOrgPicks: async (orgId: number, leagueYearId: number): Promise<BaseballDraftPick[]> => {
        return await GetCall<BaseballDraftPick[]>(`${baseballUrl}draft/picks/${orgId}?league_year_id=${leagueYearId}`);
    },
    MakeDraftPick: async (dto: MakePickRequest): Promise<MakePickResponse> => {
        return await PostCall<MakePickRequest, MakePickResponse>(`${baseballUrl}draft/pick`, dto);
    },
    // Draft Admin
    InitializeDraft: async (dto: DraftInitializeParams): Promise<DraftInitializeResponse> => {
        return await PostCall<DraftInitializeParams, DraftInitializeResponse>(`${baseballUrl}draft/admin/initialize`, dto);
    },
    SetRoundModes: async (dto: { league_year_id: number; round_modes: Record<string, string> }): Promise<void> => {
        await PostCall(`${baseballUrl}draft/admin/round-modes`, dto);
    },
    StartDraft: async (leagueYearId: number): Promise<BaseballDraftState> => {
        return await PostCall<{ league_year_id: number }, BaseballDraftState>(`${baseballUrl}draft/admin/start`, { league_year_id: leagueYearId });
    },
    PauseDraft: async (leagueYearId: number): Promise<BaseballDraftState> => {
        return await PostCall<{ league_year_id: number }, BaseballDraftState>(`${baseballUrl}draft/admin/pause`, { league_year_id: leagueYearId });
    },
    ResumeDraft: async (leagueYearId: number): Promise<BaseballDraftState> => {
        return await PostCall<{ league_year_id: number }, BaseballDraftState>(`${baseballUrl}draft/admin/resume`, { league_year_id: leagueYearId });
    },
    ResetDraftTimer: async (leagueYearId: number): Promise<BaseballDraftState> => {
        return await PostCall<{ league_year_id: number }, BaseballDraftState>(`${baseballUrl}draft/admin/reset-timer`, { league_year_id: leagueYearId });
    },
    RunAutoRounds: async (leagueYearId: number): Promise<AutoRoundsResponse> => {
        return await PostCall<{ league_year_id: number }, AutoRoundsResponse>(`${baseballUrl}draft/admin/run-auto-rounds`, { league_year_id: leagueYearId });
    },
    AdvanceToSigning: async (leagueYearId: number): Promise<void> => {
        await PostCall(`${baseballUrl}draft/admin/advance-signing`, { league_year_id: leagueYearId });
    },
    ExportDraft: async (leagueYearId: number): Promise<void> => {
        await PostCall(`${baseballUrl}draft/admin/export`, { league_year_id: leagueYearId });
    },
    CompleteDraft: async (leagueYearId: number): Promise<void> => {
        await PostCall(`${baseballUrl}draft/admin/complete`, { league_year_id: leagueYearId });
    },
    // Draft Preferences
    GetAutoPrefs: async (orgId: number, leagueYearId: number): Promise<AutoDraftPreferences> => {
        return await GetCall<AutoDraftPreferences>(`${baseballUrl}draft/prefs/${orgId}?league_year_id=${leagueYearId}`);
    },
    SetAutoPrefs: async (dto: SetAutoPrefsRequest): Promise<void> => {
        await PostCall(`${baseballUrl}draft/prefs`, dto);
    },
    // Draft Signing
    SignDraftPick: async (pickId: number, leagueYearId: number): Promise<SignPickResponse> => {
        return await PostCall<{ league_year_id: number }, SignPickResponse>(`${baseballUrl}draft/sign/${pickId}`, { league_year_id: leagueYearId });
    },
    PassDraftPick: async (pickId: number, leagueYearId: number): Promise<PassPickResponse> => {
        return await PostCall<{ league_year_id: number }, PassPickResponse>(`${baseballUrl}draft/pass/${pickId}`, { league_year_id: leagueYearId });
    },
    // Draft Trades
    ProposeDraftTrade: async (dto: {
        league_year_id: number; proposing_org_id: number; receiving_org_id: number;
        picks_offered: number[]; picks_requested: number[];
    }): Promise<{ success: boolean; proposal_id: number }> => {
        return await PostCall<typeof dto, { success: boolean; proposal_id: number }>(`${baseballUrl}draft/trade/propose`, dto);
    },
    GetDraftTradeProposals: async (orgId: number, leagueYearId: number): Promise<DraftTradeProposal[]> => {
        return await GetCall<DraftTradeProposal[]>(`${baseballUrl}draft/trade/proposals?org_id=${orgId}&league_year_id=${leagueYearId}`);
    },
    AcceptDraftTrade: async (proposalId: number): Promise<void> => {
        await PostCall(`${baseballUrl}draft/trade/accept`, { proposal_id: proposalId });
    },
    RejectDraftTrade: async (proposalId: number): Promise<void> => {
        await PostCall(`${baseballUrl}draft/trade/reject`, { proposal_id: proposalId });
    },
    // --- Free Agency Auction ---
    GetFreeAgentPool: async (params: FAPoolParams): Promise<FAPoolResponse> => {
        const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
        return await GetCall<FAPoolResponse>(`${baseballUrl}fa-auction/free-agent-pool?${qs}`);
    },
    GetFAPlayerDetail: async (playerId: number, viewingOrgId: number, leagueYearId: number): Promise<FAPlayerDetailResponse> => {
        return await GetCall<FAPlayerDetailResponse>(
            `${baseballUrl}fa-auction/player-detail/${playerId}?viewing_org_id=${viewingOrgId}&league_year_id=${leagueYearId}`,
        );
    },
    GetAuctionBoard: async (leagueYearId: number, orgId: number): Promise<AuctionBoardEntry[]> => {
        return await GetCall<AuctionBoardEntry[]>(
            `${baseballUrl}fa-auction/board?league_year_id=${leagueYearId}&org_id=${orgId}`,
        );
    },
    SubmitFAOffer: async (auctionId: number, dto: FAOfferRequest): Promise<FAOfferResponse> => {
        return await PostCall<FAOfferRequest, FAOfferResponse>(`${baseballUrl}fa-auction/${auctionId}/offer`, dto);
    },
    WithdrawFAOffer: async (auctionId: number, orgId: number): Promise<FAWithdrawResponse> => {
        return await DELETECall<{}, FAWithdrawResponse>(`${baseballUrl}fa-auction/${auctionId}/offer/${orgId}`, {});
    },
    ScoutFAPlayer: async (dto: FAScoutRequest): Promise<FAScoutResponse> => {
        return await PostCall<FAScoutRequest, FAScoutResponse>(`${baseballUrl}fa-auction/scout-player`, dto);
    },
    SignFreeAgent: async (dto: FASignRequest): Promise<FASignResponse> => {
        return await PostCall<FASignRequest, FASignResponse>(`${baseballUrl}transactions/sign`, dto);
    },
    GetMarketSummary: async (leagueYearId: number): Promise<MarketSummary> => {
        return await GetCall<MarketSummary>(`${baseballUrl}fa-auction/market-summary?league_year_id=${leagueYearId}`);
    },
    GetMarketRate: async (leagueYearId: number): Promise<MarketRateResponse> => {
        return await GetCall<MarketRateResponse>(`${baseballUrl}fa-auction/market-rate?league_year_id=${leagueYearId}`);
    },
    GetFASigningBudget: async (orgId: number, leagueYearId: number): Promise<FASigningBudgetResponse> => {
        return await GetCall<FASigningBudgetResponse>(
            `${baseballUrl}transactions/signing-budget/${orgId}?league_year_id=${leagueYearId}`,
        );
    },
    GetContractOverviewWithDemands: async (orgId: number, leagueYearId: number): Promise<ContractOverviewWithDemand[]> => {
        return await GetCall<ContractOverviewWithDemand[]>(
            `${baseballUrl}transactions/contract-overview/${orgId}?league_year_id=${leagueYearId}`,
        );
    },
    GetFAScoutingBudget: async (orgId: number, leagueYearId: number): Promise<FAScoutingBudgetResponse> => {
        return await GetCall<FAScoutingBudgetResponse>(
            `${baseballUrl}scouting/budget/${orgId}?league_year_id=${leagueYearId}`,
        );
    },
    // ── Waiver Wire ──
    GetWaivers: async (leagueYearId: number, orgId?: number): Promise<WaiverListResponse> => {
        const qs = `league_year_id=${leagueYearId}${orgId ? `&org_id=${orgId}` : ""}`;
        return await GetCall<WaiverListResponse>(`${baseballUrl}transactions/waivers?${qs}`);
    },
    GetWaiverDetail: async (waiverClaimId: number, orgId?: number): Promise<WaiverDetailResponse> => {
        const qs = orgId ? `?org_id=${orgId}` : "";
        return await GetCall<WaiverDetailResponse>(`${baseballUrl}transactions/waivers/${waiverClaimId}${qs}`);
    },
    PlaceWaiverClaim: async (waiverClaimId: number, orgId: number): Promise<WaiverClaimResponse> => {
        return await PostCall<{ org_id: number }, WaiverClaimResponse>(
            `${baseballUrl}transactions/waivers/${waiverClaimId}/claim`,
            { org_id: orgId },
        );
    },
    WithdrawWaiverClaim: async (waiverClaimId: number, orgId: number): Promise<WaiverWithdrawResponse> => {
        return await DELETECall<{ org_id: number }, WaiverWithdrawResponse>(
            `${baseballUrl}transactions/waivers/${waiverClaimId}/claim`,
            { org_id: orgId },
        );
    },
    // ── International Free Agency (IFA) ──
    GetIFAState: async (leagueYearId: number): Promise<IFAState> => {
        return await GetCall<IFAState>(`${baseballUrl}ifa/state?league_year_id=${leagueYearId}`);
    },
    GetIFABoard: async (leagueYearId: number, orgId: number): Promise<IFABoardResponse> => {
        return await GetCall<IFABoardResponse>(
            `${baseballUrl}ifa/board?league_year_id=${leagueYearId}&org_id=${orgId}`,
        );
    },
    GetIFAPool: async (orgId: number, leagueYearId: number): Promise<IFABonusPool> => {
        return await GetCall<IFABonusPool>(
            `${baseballUrl}ifa/pool/${orgId}?league_year_id=${leagueYearId}`,
        );
    },
    GetIFAEligible: async (leagueYearId: number, viewingOrgId?: number): Promise<IFAEligiblePlayer[]> => {
        const qs = viewingOrgId ? `&viewing_org_id=${viewingOrgId}` : "";
        return await GetCall<IFAEligiblePlayer[]>(`${baseballUrl}ifa/eligible?league_year_id=${leagueYearId}${qs}`);
    },
    GetIFAAuctionDetail: async (auctionId: number, orgId?: number): Promise<IFAAuctionDetail> => {
        const qs = orgId ? `?org_id=${orgId}` : "";
        return await GetCall<IFAAuctionDetail>(`${baseballUrl}ifa/auction/${auctionId}${qs}`);
    },
    StartIFAAuction: async (dto: IFAStartAuctionRequest): Promise<IFAStartAuctionResponse> => {
        return await PostCall<IFAStartAuctionRequest, IFAStartAuctionResponse>(`${baseballUrl}ifa/auction/start`, dto);
    },
    SubmitIFAOffer: async (auctionId: number, dto: IFAOfferRequest): Promise<IFAOfferResponse> => {
        return await PostCall<IFAOfferRequest, IFAOfferResponse>(`${baseballUrl}ifa/auction/${auctionId}/offer`, dto);
    },
    WithdrawIFAOffer: async (auctionId: number, orgId: number): Promise<IFAWithdrawResponse> => {
        return await DELETECall<{}, IFAWithdrawResponse>(`${baseballUrl}ifa/auction/${auctionId}/offer/${orgId}`, {});
    },
    GetIFAOrgOffers: async (orgId: number, leagueYearId: number): Promise<IFAOrgOffer[]> => {
        return await GetCall<IFAOrgOffer[]>(
            `${baseballUrl}ifa/offers/${orgId}?league_year_id=${leagueYearId}`,
        );
    },
    AdvanceIFAWeek: async (dto: IFAAdvanceWeekRequest): Promise<IFAAdvanceWeekResponse> => {
        return await PostCall<IFAAdvanceWeekRequest, IFAAdvanceWeekResponse>(`${baseballUrl}ifa/advance-week`, dto);
    },
    // --- Player Injury History (unified pregame + ingame) ---
    GetPlayerInjuryHistory: async (params: PlayerInjuryHistoryParams): Promise<PlayerInjuryHistoryResponse> => {
        const qs = new URLSearchParams();
        if (params.league_year_id != null) qs.set("league_year_id", String(params.league_year_id));
        if (params.limit != null) qs.set("limit", String(params.limit));
        return await GetCall<PlayerInjuryHistoryResponse>(`${baseballUrl}players/${params.player_id}/injury-history?${qs.toString()}`);
    },
    // --- Admin Injury Log ---
    GetAdminInjuryLog: async (params: AdminInjuryLogParams): Promise<AdminInjuryLogResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.league_level != null) qs.set("league_level", String(params.league_level));
        if (params.team_id != null) qs.set("team_id", String(params.team_id));
        if (params.source) qs.set("source", params.source);
        if (params.season_week != null) qs.set("season_week", String(params.season_week));
        if (params.limit != null) qs.set("limit", String(params.limit));
        return await GetCall<AdminInjuryLogResponse>(`${baseballUrl}admin/analytics/injury-log?${qs.toString()}`);
    },

    // ── Simulation Control ──────────────────────────────────────
    GetTimestamp: async (): Promise<any> => {
        return await GetCall<any>(`${baseballUrl}games/timestamp`);
    },
    SimulateWeek: async (dto: SimulateWeekRequest): Promise<SimulateWeekResponse> => {
        return await PostCall<SimulateWeekRequest, SimulateWeekResponse>(`${baseballUrl}games/simulate-week`, dto);
    },
    SimulateSubweek: async (dto: SimulateSubweekRequest): Promise<SimulateSubweekResponse> => {
        return await PostCall<SimulateSubweekRequest, SimulateSubweekResponse>(`${baseballUrl}games/simulate-subweek`, dto);
    },
    AdvanceWeek: async (dto?: AdvanceWeekRequest): Promise<SimpleStatusResponse> => {
        return await PostCall<AdvanceWeekRequest, SimpleStatusResponse>(`${baseballUrl}games/advance-week`, dto ?? {});
    },
    ResetWeek: async (): Promise<SimpleStatusResponse> => {
        return await PostCall<{}, SimpleStatusResponse>(`${baseballUrl}games/reset-week`, {});
    },
    RollbackWeek: async (): Promise<SimpleStatusResponse> => {
        return await PostCall<{}, SimpleStatusResponse>(`${baseballUrl}games/rollback-week`, {});
    },
    RollbackToWeek: async (dto: RollbackToWeekRequest): Promise<SimpleStatusResponse> => {
        return await PostCall<RollbackToWeekRequest, SimpleStatusResponse>(`${baseballUrl}games/rollback-to-week`, dto);
    },
    EndSeason: async (dto: EndSeasonRequest): Promise<EndSeasonResponse> => {
        return await PostCall<EndSeasonRequest, EndSeasonResponse>(`${baseballUrl}games/end-season`, dto);
    },
    StartNewSeason: async (dto: StartNewSeasonRequest): Promise<StartNewSeasonResponse> => {
        return await PostCall<StartNewSeasonRequest, StartNewSeasonResponse>(`${baseballUrl}games/start-new-season`, dto);
    },
    SetPhase: async (dto: SetPhaseRequest): Promise<any> => {
        return await PostCall<SetPhaseRequest, any>(`${baseballUrl}games/set-phase`, dto);
    },
    StartFreeAgency: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/start-free-agency`, {});
    },
    AdvanceFARound: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/advance-fa-round`, {});
    },
    EndFreeAgency: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/end-free-agency`, {});
    },
    StartDraftPhase: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/start-draft`, {});
    },
    EndDraftPhase: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/end-draft`, {});
    },
    StartRecruiting: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/start-recruiting`, {});
    },
    EndRecruiting: async (): Promise<any> => {
        return await PostCall<{}, any>(`${baseballUrl}games/end-recruiting`, {});
    },
    RunSeason: async (dto: RunSeasonRequest): Promise<RunSeasonResponse> => {
        return await PostCall<RunSeasonRequest, RunSeasonResponse>(`${baseballUrl}games/run-season`, dto);
    },
    RunSeasonAll: async (dto: RunSeasonRequest): Promise<RunSeasonResponse> => {
        return await PostCall<RunSeasonRequest, RunSeasonResponse>(`${baseballUrl}games/run-season-all`, dto);
    },
    GetTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
        return await GetCall<TaskStatusResponse>(`${baseballUrl}games/tasks/${taskId}`);
    },

    // ── Recruiting Admin ────────────────────────────────────────
    AdvanceRecruitingWeek: async (dto: AdvanceRecruitingWeekRequest): Promise<AdvanceRecruitingWeekResponse> => {
        return await PostCall<AdvanceRecruitingWeekRequest, AdvanceRecruitingWeekResponse>(`${baseballUrl}recruiting/advance-week`, dto);
    },
    GetRecruitingSummary: async (leagueYearId: number): Promise<RecruitingSummaryResponse> => {
        return await GetCall<RecruitingSummaryResponse>(`${baseballUrl}recruiting/admin/report/summary?league_year_id=${leagueYearId}`);
    },
    GetOrgLeaderboard: async (leagueYearId: number): Promise<OrgLeaderboardResponse> => {
        return await GetCall<OrgLeaderboardResponse>(`${baseballUrl}recruiting/admin/report/org-leaderboard?league_year_id=${leagueYearId}`);
    },
    GetPlayerDemand: async (params: PlayerDemandParams): Promise<PlayerDemandResponse> => {
        const qs = new URLSearchParams();
        qs.set("league_year_id", String(params.league_year_id));
        if (params.star_rating != null) qs.set("star_rating", String(params.star_rating));
        if (params.limit != null) qs.set("limit", String(params.limit));
        return await GetCall<PlayerDemandResponse>(`${baseballUrl}recruiting/admin/report/player-demand?${qs.toString()}`);
    },
    GetOrgDetail: async (orgId: number, leagueYearId: number): Promise<OrgDetailResponse> => {
        return await GetCall<OrgDetailResponse>(`${baseballUrl}recruiting/admin/report/org-detail/${orgId}?league_year_id=${leagueYearId}`);
    },
    RecruitingResetWeek: async (dto: RecruitingResetWeekRequest): Promise<SimpleStatusResponse> => {
        return await PostCall<RecruitingResetWeekRequest, SimpleStatusResponse>(`${baseballUrl}recruiting/admin/reset-week`, dto);
    },
    RecruitingWipeInvestments: async (dto: RecruitingWipeRequest): Promise<RecruitingWipeResponse> => {
        return await PostCall<RecruitingWipeRequest, RecruitingWipeResponse>(`${baseballUrl}recruiting/admin/wipe-investments`, dto);
    },
    RecruitingWipeCommitments: async (dto: RecruitingWipeRequest): Promise<RecruitingWipeResponse> => {
        return await PostCall<RecruitingWipeRequest, RecruitingWipeResponse>(`${baseballUrl}recruiting/admin/wipe-commitments`, dto);
    },
    RecruitingWipeBoards: async (dto: RecruitingWipeRequest): Promise<RecruitingWipeResponse> => {
        return await PostCall<RecruitingWipeRequest, RecruitingWipeResponse>(`${baseballUrl}recruiting/admin/wipe-boards`, dto);
    },
    RecruitingFullReset: async (dto: { league_year_id: number }): Promise<RecruitingFullResetResponse> => {
        return await PostCall<{ league_year_id: number }, RecruitingFullResetResponse>(`${baseballUrl}recruiting/admin/full-reset`, dto);
    },
    WipeRankings: async (dto: { league_year_id: number }): Promise<RankingsWipeResponse> => {
        return await PostCall<{ league_year_id: number }, RankingsWipeResponse>(`${baseballUrl}recruiting/rankings/wipe`, dto);
    },
    RegenerateRankings: async (dto: { league_year_id: number }): Promise<RankingsRegenerateResponse> => {
        return await PostCall<{ league_year_id: number }, RankingsRegenerateResponse>(`${baseballUrl}recruiting/rankings/regenerate`, dto);
    },
    // ─── Tutorial ────────────────────────────────────────────────────────────
    GetTutorialManifest: async (): Promise<TutorialManifest> => {
        return await GetCall<TutorialManifest>(`${baseballUrl}baseball/tutorial`);
    },
    GetTutorialArticle: async (categoryId: string, articleId: string): Promise<TutorialArticle> => {
        return await GetCall<TutorialArticle>(`${baseballUrl}baseball/tutorial/${categoryId}/${articleId}`);
    },
};

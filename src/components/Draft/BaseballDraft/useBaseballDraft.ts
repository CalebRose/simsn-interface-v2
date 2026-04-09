import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaseballDraftState } from "./useBaseballDraftState";
import { BaseballService } from "../../../_services/baseballService";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import {
  BaseballDraftee,
  BaseballDraftPick,
  BaseballDraftTab,
  DraftPhase,
  DraftTradeProposal,
  RoundModeConfig,
  RoundMode,
  AutoDraftPreferences,
  EligiblePlayersResponse,
  DraftInitializeParams,
  DraftInitializeResponse,
  AutoRoundsResponse,
} from "../../../models/baseball/baseballDraftModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";

// ═══════════════════════════════════════════════
// Eligible players fetch params
// ═══════════════════════════════════════════════

interface EligibleFetchParams {
  source?: "college" | "hs";
  search?: string;
  limit?: number;
  offset?: number;
}

// ═══════════════════════════════════════════════
// Return type
// ═══════════════════════════════════════════════

export interface UseBaseballDraftReturn {
  // Draft state (from useBaseballDraftState)
  boardPicks: BaseballDraftPick[];
  currentPick: BaseballDraftPick | null;
  phase: DraftPhase;
  isPaused: boolean;
  secondsRemaining: number;
  currentRound: number;
  currentPickNumber: number;
  currentOverall: number;
  currentRoundMode: RoundMode;
  autoRoundsLocked: boolean;
  totalRounds: number;
  picksPerRound: number;
  draftedPlayerIds: Set<number>;
  isAutoRoundsRunning: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Round modes
  roundModes: RoundModeConfig[];
  refreshRoundModes: () => void;

  // Eligible players
  eligiblePlayers: BaseballDraftee[];
  eligibleTotal: number;
  eligibleLimit: number;
  eligibleOffset: number;
  fetchEligiblePlayers: (params: EligibleFetchParams) => void;

  // User context
  userOrgId: number | null;
  userOrgAbbrev: string;
  isAdmin: boolean;
  isUserTurn: boolean;
  leagueYearId: number | null;
  orgMap: Record<number, string>;

  // Scouting
  scoutingBudget: ScoutingBudget | null;
  refreshScoutingBudget: () => void;

  // Scouting modal
  scoutModalPlayerId: number | null;
  isScoutModalOpen: boolean;
  openScoutModal: (playerId: number) => void;
  closeScoutModal: () => void;

  // Draft actions
  makePick: (playerId: number) => Promise<void>;

  // Auto-draft preferences
  autoPrefs: AutoDraftPreferences | null;
  refreshAutoPrefs: () => void;
  saveAutoPrefs: (prefs: { pitcher_quota?: number; hitter_quota?: number; queue?: number[] }) => Promise<void>;

  // My Picks (org picks)
  orgPicks: BaseballDraftPick[];
  refreshOrgPicks: () => void;

  // Signing
  signPick: (pickId: number) => Promise<void>;
  passPick: (pickId: number) => Promise<void>;

  // Trade
  tradeProposals: DraftTradeProposal[];
  refreshTradeProposals: () => void;
  proposeTrade: (
    receivingOrgId: number,
    picksOffered: number[],
    picksRequested: number[],
  ) => Promise<void>;
  acceptTrade: (proposalId: number) => Promise<void>;
  rejectTrade: (proposalId: number) => Promise<void>;

  // Admin actions
  initializeDraft: (params: DraftInitializeParams) => Promise<DraftInitializeResponse>;
  setRoundModes: (modes: Record<string, string>) => Promise<void>;
  startDraft: () => Promise<void>;
  pauseDraft: () => Promise<void>;
  resumeDraft: () => Promise<void>;
  resetTimer: () => Promise<void>;
  runAutoRounds: () => Promise<AutoRoundsResponse>;
  advanceToSigning: () => Promise<void>;
  exportDraft: () => Promise<void>;
  completeDraft: () => Promise<void>;

  // Tab state
  activeTab: BaseballDraftTab;
  setActiveTab: (tab: BaseballDraftTab) => void;

  // Computed
  upcomingPicks: BaseballDraftPick[];
  recentPicks: BaseballDraftPick[];
  teamPicks: BaseballDraftPick[];
}

// ═══════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════

export function useBaseballDraft(): UseBaseballDraftReturn {
  const { currentUser } = useAuthStore();
  const { mlbOrganization, seasonContext, organizations } = useSimBaseballStore();

  // ── User context ──
  const userOrgId = mlbOrganization?.id ?? currentUser?.MLBOrgID ?? null;
  const userOrgAbbrev = mlbOrganization?.org_abbrev ?? "";
  const isAdmin = currentUser?.roleID === "Admin";
  const leagueYearId = seasonContext?.current_league_year_id ?? null;

  // ── Org map for abbreviation lookups ──
  const orgMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (organizations) {
      for (const org of organizations) {
        map[org.id] = org.org_abbrev;
      }
    }
    return map;
  }, [organizations]);

  // ── Draft state (WebSocket-driven) ──
  const {
    draftState,
    boardPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    currentRoundMode,
    autoRoundsLocked,
    totalRounds,
    picksPerRound,
    draftedPlayerIds,
    isAutoRoundsRunning,
    isConnected,
    isLoading,
    error,
    refetchState,
    refetchBoard,
  } = useBaseballDraftState(leagueYearId);

  // ── Round modes ──
  const [roundModes, setRoundModes] = useState<RoundModeConfig[]>([]);

  // ── Eligible players state ──
  const [eligiblePlayers, setEligiblePlayers] = useState<BaseballDraftee[]>([]);
  const [eligibleTotal, setEligibleTotal] = useState(0);
  const [eligibleLimit, setEligibleLimit] = useState(50);
  const [eligibleOffset, setEligibleOffset] = useState(0);

  // ── Scouting ──
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);

  // ── Scouting modal ──
  const [scoutModalPlayerId, setScoutModalPlayerId] = useState<number | null>(null);
  const isScoutModalOpen = scoutModalPlayerId !== null;

  // ── Auto-draft preferences ──
  const [autoPrefs, setAutoPrefs] = useState<AutoDraftPreferences | null>(null);

  // ── Org picks ──
  const [orgPicks, setOrgPicks] = useState<BaseballDraftPick[]>([]);

  // ── Trades ──
  const [tradeProposals, setTradeProposals] = useState<DraftTradeProposal[]>([]);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<BaseballDraftTab>("bigboard");

  // ═══════════════════════════════════════════════
  // Round modes
  // ═══════════════════════════════════════════════

  const refreshRoundModes = useCallback(() => {
    if (!leagueYearId) return;
    BaseballService.GetRoundModes(leagueYearId)
      .then((res) => setRoundModes(res.rounds))
      .catch((err) => console.error("Failed to fetch round modes:", err));
  }, [leagueYearId]);

  // ═══════════════════════════════════════════════
  // Eligible players
  // ═══════════════════════════════════════════════

  const fetchEligiblePlayers = useCallback(
    (params: EligibleFetchParams) => {
      if (!leagueYearId) return;
      BaseballService.GetEligiblePlayers({
        league_year_id: leagueYearId,
        available_only: true,
        source: params.source,
        search: params.search,
        viewing_org_id: userOrgId ?? undefined,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      })
        .then((res: EligiblePlayersResponse) => {
          setEligiblePlayers(res.players);
          setEligibleTotal(res.total);
          setEligibleLimit(res.limit);
          setEligibleOffset(res.offset);
        })
        .catch((err) => console.error("Failed to fetch eligible players:", err));
    },
    [leagueYearId, userOrgId],
  );

  // ═══════════════════════════════════════════════
  // Scouting budget
  // ═══════════════════════════════════════════════

  const refreshScoutingBudget = useCallback(() => {
    if (!userOrgId || !leagueYearId) return;
    BaseballService.GetScoutingBudget(userOrgId, leagueYearId)
      .then((budget) => setScoutingBudget(budget))
      .catch((err) => console.error("Failed to fetch scouting budget:", err));
  }, [userOrgId, leagueYearId]);

  // ═══════════════════════════════════════════════
  // Scouting modal
  // ═══════════════════════════════════════════════

  const openScoutModal = useCallback((playerId: number) => {
    setScoutModalPlayerId(playerId);
  }, []);

  const closeScoutModal = useCallback(() => {
    setScoutModalPlayerId(null);
  }, []);

  // ═══════════════════════════════════════════════
  // Draft actions
  // ═══════════════════════════════════════════════

  const makePick = useCallback(
    async (playerId: number) => {
      if (!leagueYearId || !userOrgId) return;
      await BaseballService.MakeDraftPick({
        league_year_id: leagueYearId,
        org_id: userOrgId,
        player_id: playerId,
      });
      // State updates come through WebSocket
    },
    [leagueYearId, userOrgId],
  );

  // ═══════════════════════════════════════════════
  // Auto-draft preferences
  // ═══════════════════════════════════════════════

  const refreshAutoPrefs = useCallback(() => {
    if (!userOrgId || !leagueYearId) return;
    BaseballService.GetAutoPrefs(userOrgId, leagueYearId)
      .then((prefs) => setAutoPrefs(prefs))
      .catch((err) => console.error("Failed to fetch auto prefs:", err));
  }, [userOrgId, leagueYearId]);

  const saveAutoPrefs = useCallback(
    async (prefs: { pitcher_quota?: number; hitter_quota?: number; queue?: number[] }) => {
      if (!userOrgId || !leagueYearId) return;
      await BaseballService.SetAutoPrefs({
        league_year_id: leagueYearId,
        org_id: userOrgId,
        ...prefs,
      });
      refreshAutoPrefs();
    },
    [userOrgId, leagueYearId, refreshAutoPrefs],
  );

  // ═══════════════════════════════════════════════
  // Org picks (My Picks)
  // ═══════════════════════════════════════════════

  const refreshOrgPicks = useCallback(() => {
    if (!userOrgId || !leagueYearId) return;
    BaseballService.GetOrgPicks(userOrgId, leagueYearId)
      .then((picks) => setOrgPicks(picks))
      .catch((err) => console.error("Failed to fetch org picks:", err));
  }, [userOrgId, leagueYearId]);

  // ═══════════════════════════════════════════════
  // Signing
  // ═══════════════════════════════════════════════

  const signPick = useCallback(
    async (pickId: number) => {
      if (!leagueYearId) return;
      await BaseballService.SignDraftPick(pickId, leagueYearId);
      refreshOrgPicks();
    },
    [leagueYearId, refreshOrgPicks],
  );

  const passPick = useCallback(
    async (pickId: number) => {
      if (!leagueYearId) return;
      await BaseballService.PassDraftPick(pickId, leagueYearId);
      refreshOrgPicks();
    },
    [leagueYearId, refreshOrgPicks],
  );

  // ═══════════════════════════════════════════════
  // Trades
  // ═══════════════════════════════════════════════

  const refreshTradeProposals = useCallback(() => {
    if (!userOrgId || !leagueYearId) return;
    BaseballService.GetDraftTradeProposals(userOrgId, leagueYearId)
      .then((proposals) => setTradeProposals(proposals))
      .catch((err) => console.error("Failed to fetch trade proposals:", err));
  }, [userOrgId, leagueYearId]);

  const proposeTrade = useCallback(
    async (
      receivingOrgId: number,
      picksOffered: number[],
      picksRequested: number[],
    ) => {
      if (!userOrgId || !leagueYearId) return;
      await BaseballService.ProposeDraftTrade({
        league_year_id: leagueYearId,
        proposing_org_id: userOrgId,
        receiving_org_id: receivingOrgId,
        picks_offered: picksOffered,
        picks_requested: picksRequested,
      });
      refreshTradeProposals();
    },
    [userOrgId, leagueYearId, refreshTradeProposals],
  );

  const acceptTrade = useCallback(
    async (proposalId: number) => {
      await BaseballService.AcceptDraftTrade(proposalId);
      refreshTradeProposals();
      refetchBoard();
    },
    [refreshTradeProposals, refetchBoard],
  );

  const rejectTrade = useCallback(
    async (proposalId: number) => {
      await BaseballService.RejectDraftTrade(proposalId);
      refreshTradeProposals();
    },
    [refreshTradeProposals],
  );

  // ═══════════════════════════════════════════════
  // Admin actions
  // ═══════════════════════════════════════════════

  const initializeDraft = useCallback(
    async (params: DraftInitializeParams) => {
      return await BaseballService.InitializeDraft(params);
    },
    [],
  );

  const setRoundModesAdmin = useCallback(
    async (modes: Record<string, string>) => {
      if (!leagueYearId) return;
      await BaseballService.SetRoundModes({
        league_year_id: leagueYearId,
        round_modes: modes,
      });
      refreshRoundModes();
    },
    [leagueYearId, refreshRoundModes],
  );

  const startDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.StartDraft(leagueYearId);
  }, [leagueYearId]);

  const pauseDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.PauseDraft(leagueYearId);
  }, [leagueYearId]);

  const resumeDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.ResumeDraft(leagueYearId);
  }, [leagueYearId]);

  const resetTimer = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.ResetDraftTimer(leagueYearId);
  }, [leagueYearId]);

  const runAutoRounds = useCallback(async () => {
    if (!leagueYearId) return { picks_made: 0, picks: [] } as AutoRoundsResponse;
    return await BaseballService.RunAutoRounds(leagueYearId);
  }, [leagueYearId]);

  const advanceToSigning = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.AdvanceToSigning(leagueYearId);
  }, [leagueYearId]);

  const exportDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.ExportDraft(leagueYearId);
  }, [leagueYearId]);

  const completeDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.CompleteDraft(leagueYearId);
  }, [leagueYearId]);

  // ═══════════════════════════════════════════════
  // Computed picks
  // ═══════════════════════════════════════════════

  const isUserTurn =
    currentPick?.current_org_id === userOrgId &&
    phase === "IN_PROGRESS" &&
    currentRoundMode === "live";

  const upcomingPicks = useMemo(() => {
    return boardPicks
      .filter((p) => p.overall_pick > currentOverall && p.player_id == null)
      .slice(0, 5);
  }, [boardPicks, currentOverall]);

  const recentPicks = useMemo(() => {
    return boardPicks
      .filter((p) => p.overall_pick < currentOverall && p.player_id != null)
      .slice(-10);
  }, [boardPicks, currentOverall]);

  const teamPicks = useMemo(() => {
    return boardPicks.filter((p) => p.current_org_id === userOrgId);
  }, [boardPicks, userOrgId]);

  // ═══════════════════════════════════════════════
  // Effects
  // ═══════════════════════════════════════════════

  // On mount: fetch eligible players page 1
  useEffect(() => {
    if (leagueYearId) {
      fetchEligiblePlayers({ offset: 0 });
    }
  }, [leagueYearId, fetchEligiblePlayers]);

  // On mount: fetch round modes
  useEffect(() => {
    if (leagueYearId) {
      refreshRoundModes();
    }
  }, [leagueYearId, refreshRoundModes]);

  // On mount: fetch scouting budget if user has org
  useEffect(() => {
    if (userOrgId && leagueYearId) {
      refreshScoutingBudget();
    }
  }, [userOrgId, leagueYearId, refreshScoutingBudget]);

  // On mount: fetch auto prefs if user has org
  useEffect(() => {
    if (userOrgId && leagueYearId) {
      refreshAutoPrefs();
    }
  }, [userOrgId, leagueYearId, refreshAutoPrefs]);

  // When phase changes to SIGNING: fetch org picks
  useEffect(() => {
    if (phase === "SIGNING" || phase === "COMPLETE") {
      refreshOrgPicks();
    }
  }, [phase, refreshOrgPicks]);

  // When tab changes to mypicks: fetch org picks
  useEffect(() => {
    if (activeTab === "mypicks") {
      refreshOrgPicks();
    }
  }, [activeTab, refreshOrgPicks]);

  // ═══════════════════════════════════════════════
  // Return
  // ═══════════════════════════════════════════════

  return {
    // Draft state
    boardPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    currentRoundMode,
    autoRoundsLocked,
    totalRounds,
    picksPerRound,
    draftedPlayerIds,
    isAutoRoundsRunning,
    isConnected,
    isLoading,
    error,

    // Round modes
    roundModes,
    refreshRoundModes,

    // Eligible players
    eligiblePlayers,
    eligibleTotal,
    eligibleLimit,
    eligibleOffset,
    fetchEligiblePlayers,

    // User context
    userOrgId,
    userOrgAbbrev,
    isAdmin,
    isUserTurn,
    leagueYearId,
    orgMap,

    // Scouting
    scoutingBudget,
    refreshScoutingBudget,

    // Scouting modal
    scoutModalPlayerId,
    isScoutModalOpen,
    openScoutModal,
    closeScoutModal,

    // Draft actions
    makePick,

    // Auto-draft preferences
    autoPrefs,
    refreshAutoPrefs,
    saveAutoPrefs,

    // Org picks
    orgPicks,
    refreshOrgPicks,

    // Signing
    signPick,
    passPick,

    // Trade
    tradeProposals,
    refreshTradeProposals,
    proposeTrade,
    acceptTrade,
    rejectTrade,

    // Admin actions
    initializeDraft,
    setRoundModes: setRoundModesAdmin,
    startDraft,
    pauseDraft,
    resumeDraft,
    resetTimer,
    runAutoRounds,
    advanceToSigning,
    exportDraft,
    completeDraft,

    // Tab state
    activeTab,
    setActiveTab,

    // Computed
    upcomingPicks,
    recentPicks,
    teamPicks,
  };
}

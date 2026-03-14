import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaseballDraftState } from "./useBaseballDraftState";
import { BaseballService } from "../../../_services/baseballService";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import {
  BaseballDraftee,
  BaseballDraftPick,
  BaseballDraftSigningStatus,
  BaseballDraftTab,
  DraftBoardResponse,
  DraftPhase,
  DraftTradeProposal,
} from "../../../models/baseball/baseballDraftModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";

// ═══════════════════════════════════════════════
// Draft Board fetch params
// ═══════════════════════════════════════════════

interface DraftBoardFetchParams {
  position?: string;
  search?: string;
  bat_hand?: string;
  throw_hand?: string;
  page?: number;
  page_size?: number;
  exclude_drafted?: boolean;
}

// ═══════════════════════════════════════════════
// Return type
// ═══════════════════════════════════════════════

export interface UseBaseballDraftReturn {
  // Draft state (from useBaseballDraftState)
  allPicks: BaseballDraftPick[];
  currentPick: BaseballDraftPick | null;
  phase: DraftPhase;
  isPaused: boolean;
  secondsRemaining: number;
  currentRound: number;
  currentPickNumber: number;
  currentOverall: number;
  draftedPlayerIds: Set<number>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Draft board
  draftees: BaseballDraftee[];
  drafteesTotal: number;
  drafteesPage: number;
  drafteesPages: number;
  draftablePlayerMap: Record<number, BaseballDraftee>;
  fetchDraftBoard: (params: DraftBoardFetchParams) => void;

  // User context
  userOrgId: number | null;
  userOrgAbbrev: string;
  isAdmin: boolean;
  isUserTurn: boolean;
  leagueYearId: number | null;

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

  // Signing
  signingStatuses: BaseballDraftSigningStatus[];
  signPick: (pickId: number, amount: number) => Promise<void>;
  refreshSigningStatus: () => void;

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
  startDraft: () => Promise<void>;
  pauseDraft: () => Promise<void>;
  resumeDraft: () => Promise<void>;
  resetTimer: () => Promise<void>;
  setDraftPick: (round: number, pick: number) => Promise<void>;
  removePlayerFromPick: (pickId: number) => Promise<void>;
  advanceToSigning: () => Promise<void>;
  exportDraft: () => Promise<void>;

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
  const { mlbOrganization, seasonContext, allTeams } = useSimBaseballStore();

  // ── User context ──
  const userOrgId = mlbOrganization?.id ?? currentUser?.MLBOrgID ?? null;
  const userOrgAbbrev = mlbOrganization?.org_abbrev ?? "";
  const isAdmin = currentUser?.roleID === "Admin";
  const leagueYearId = seasonContext?.current_league_year_id ?? null;

  // ── Draft state (WebSocket-driven) ──
  const {
    draftState,
    allPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    draftedPlayerIds,
    isConnected,
    isLoading,
    error,
    refetchState,
  } = useBaseballDraftState(leagueYearId);

  // ── Draft board state ──
  const [draftees, setDraftees] = useState<BaseballDraftee[]>([]);
  const [drafteesTotal, setDrafteesTotal] = useState(0);
  const [drafteesPage, setDrafteesPage] = useState(1);
  const [drafteesPages, setDrafteesPages] = useState(1);

  // ── Scouting ──
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);

  // ── Scouting modal ──
  const [scoutModalPlayerId, setScoutModalPlayerId] = useState<number | null>(null);
  const isScoutModalOpen = scoutModalPlayerId !== null;

  // ── Signing ──
  const [signingStatuses, setSigningStatuses] = useState<BaseballDraftSigningStatus[]>([]);

  // ── Trades ──
  const [tradeProposals, setTradeProposals] = useState<DraftTradeProposal[]>([]);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<BaseballDraftTab>("bigboard");

  // ═══════════════════════════════════════════════
  // Draft board
  // ═══════════════════════════════════════════════

  const fetchDraftBoard = useCallback(
    (params: DraftBoardFetchParams) => {
      if (!leagueYearId) return;
      BaseballService.GetDraftBoard(leagueYearId, {
        position: params.position,
        search: params.search,
        bat_hand: params.bat_hand,
        throw_hand: params.throw_hand,
        page: params.page,
        page_size: params.page_size,
        exclude_drafted: params.exclude_drafted,
      })
        .then((res: DraftBoardResponse) => {
          setDraftees(res.players);
          setDrafteesTotal(res.total);
          setDrafteesPage(res.page);
          setDrafteesPages(res.pages);
        })
        .catch((err) => console.error("Failed to fetch draft board:", err));
    },
    [leagueYearId],
  );

  const draftablePlayerMap = useMemo(() => {
    const map: Record<number, BaseballDraftee> = {};
    for (const d of draftees) {
      map[d.player_id] = d;
    }
    return map;
  }, [draftees]);

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
      if (!currentPick) return;
      await BaseballService.MakeDraftPick({
        pick_id: currentPick.id,
        player_id: playerId,
      });
      // State updates will come through WebSocket
    },
    [currentPick],
  );

  // ═══════════════════════════════════════════════
  // Signing
  // ═══════════════════════════════════════════════

  const refreshSigningStatus = useCallback(() => {
    if (!leagueYearId || !userOrgId) return;
    BaseballService.GetSigningStatus(leagueYearId, userOrgId)
      .then((statuses) => setSigningStatuses(statuses))
      .catch((err) => console.error("Failed to fetch signing statuses:", err));
  }, [leagueYearId, userOrgId]);

  const signPick = useCallback(
    async (pickId: number, amount: number) => {
      await BaseballService.SignDraftPick({
        pick_id: pickId,
        offered_amount: amount,
      });
      refreshSigningStatus();
    },
    [refreshSigningStatus],
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
      refetchState();
    },
    [refreshTradeProposals, refetchState],
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

  const setDraftPickAdmin = useCallback(
    async (round: number, pick: number) => {
      if (!leagueYearId) return;
      await BaseballService.SetDraftPick({
        league_year_id: leagueYearId,
        round,
        pick_number: pick,
      });
    },
    [leagueYearId],
  );

  const removePlayerFromPick = useCallback(async (pickId: number) => {
    await BaseballService.RemovePlayerFromPick(pickId);
    refetchState();
  }, [refetchState]);

  const advanceToSigning = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.AdvanceToSigning(leagueYearId);
  }, [leagueYearId]);

  const exportDraft = useCallback(async () => {
    if (!leagueYearId) return;
    await BaseballService.ExportDraft(leagueYearId);
  }, [leagueYearId]);

  // ═══════════════════════════════════════════════
  // Computed picks
  // ═══════════════════════════════════════════════

  const isUserTurn =
    currentPick?.org_id === userOrgId &&
    phase === "drafting" &&
    !isPaused;

  const upcomingPicks = useMemo(() => {
    return allPicks
      .filter((p) => p.overall_pick > currentOverall)
      .slice(0, 5);
  }, [allPicks, currentOverall]);

  const recentPicks = useMemo(() => {
    return allPicks
      .filter(
        (p) =>
          p.overall_pick < currentOverall && p.selected_player_id != null,
      )
      .slice(-10);
  }, [allPicks, currentOverall]);

  const teamPicks = useMemo(() => {
    return allPicks.filter((p) => p.org_id === userOrgId);
  }, [allPicks, userOrgId]);

  // ═══════════════════════════════════════════════
  // Effects
  // ═══════════════════════════════════════════════

  // On mount: fetch draft board page 1
  useEffect(() => {
    if (leagueYearId) {
      fetchDraftBoard({ page: 1 });
    }
  }, [leagueYearId, fetchDraftBoard]);

  // On mount: fetch scouting budget if user has org
  useEffect(() => {
    if (userOrgId && leagueYearId) {
      refreshScoutingBudget();
    }
  }, [userOrgId, leagueYearId, refreshScoutingBudget]);

  // When phase changes to signing: fetch signing statuses
  useEffect(() => {
    if (phase === "signing") {
      refreshSigningStatus();
    }
  }, [phase, refreshSigningStatus]);

  // ═══════════════════════════════════════════════
  // Return
  // ═══════════════════════════════════════════════

  return {
    // Draft state
    allPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    draftedPlayerIds,
    isConnected,
    isLoading,
    error,

    // Draft board
    draftees,
    drafteesTotal,
    drafteesPage,
    drafteesPages,
    draftablePlayerMap,
    fetchDraftBoard,

    // User context
    userOrgId,
    userOrgAbbrev,
    isAdmin,
    isUserTurn,
    leagueYearId,

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

    // Signing
    signingStatuses,
    signPick,
    refreshSigningStatus,

    // Trade
    tradeProposals,
    refreshTradeProposals,
    proposeTrade,
    acceptTrade,
    rejectTrade,

    // Admin actions
    startDraft,
    pauseDraft,
    resumeDraft,
    resetTimer,
    setDraftPick: setDraftPickAdmin,
    removePlayerFromPick,
    advanceToSigning,
    exportDraft,

    // Tab state
    activeTab,
    setActiveTab,

    // Computed
    upcomingPicks,
    recentPicks,
    teamPicks,
  };
}

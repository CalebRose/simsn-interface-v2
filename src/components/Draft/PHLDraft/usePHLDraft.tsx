import { useState, useEffect, useMemo, useCallback } from "react";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  DraftPick,
  DraftablePlayer,
  ProfessionalTeam,
  ScoutingProfile,
  TradeOption,
  TradeProposal,
} from "../../../models/hockeyModels";
import {
  DraftBoardStr,
  DraftBoardType,
  DrafteeInfoType,
  InfoType,
  ModalAction,
  SimPHL,
} from "../../../_constants/constants";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import {
  defensiveSystemsInformationList,
  offensiveSystemsInformationList,
  getOffensiveSystemFromMap,
  getDefensiveSystemFromMap,
} from "../../Gameplan/HockeyLineups/useLineupUtils";
import { useModal } from "../../../_hooks/useModal";
import { Draftee } from "../common";
import { useDraftState } from "../hooks/useDraftState";
import { getSecondsByRound } from "./utils/draftHelpers";
import { useDraftTradeState } from "../hooks/useDraftTradeState";
import { TradeService } from "../../../_services/tradeService";

export const PHL_PICKS_PER_ROUND = 24;

export interface PHLDraftState {
  currentPickNumber: number;
  currentRound: number;
  isPaused: boolean;
  timeLeft: number;
  exportComplete: boolean;
}

export const getTimeForPick = (pickNumber: number): number => {
  if (pickNumber <= PHL_PICKS_PER_ROUND) return 300;
  if (pickNumber <= PHL_PICKS_PER_ROUND * 4) return 180;
  return 120;
};

export const usePHLDraft = () => {
  const {
    phlTeam,
    phlTeamOptions,
    phlTeamMap,
    proDraftablePlayers,
    proWarRoom,
    phlGameplanMap,
    phlScoutProfiles,
    phlAllDraftPicks,
    proRosterMap,
    getBootstrapDraftData,
    addPlayerToScoutBoard,
    revealScoutingAttribute,
    removePlayerFromScoutBoard,
    exportDraftPicks,
    bringUpCollegePlayer,
  } = useSimHCKStore();

  const {
    draftState,
    updateDraftState,
    isLoading: isDraftStateLoading,
    allDraftPicks,
    currentPick: draftCurrentPick,
    currentRound: draftCurrentRound,
    isPaused: draftIsPaused,
    seconds: draftSeconds,
    endTime: draftEndTime,
    nextPick: draftNextPick,
    formattedTime,
    isDraftComplete,
  } = useDraftState({
    CollectionName: "phldraftstate",
    DocName: "FHDIzvDUiO2OrG9aIvof",
  });

  const {
    userTeam,
    tradePartnerTeam,
    selectTradePartner,
    teamOptions,
    userTradablePlayers,
    userTradablePicks,
    partnerTradablePlayers,
    userTradeProposals,
    userWarRoomData,
    approvedRequests,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    vetoTrade,
    updateApprovedTrades,
    updateUserWarRoom,
  } = useDraftTradeState({
    ApprovedTradesCollectionName: "phldraftstate",
    ApprovedTradesDocName: "hUYy5QjqlmHNb5ulqFXg",
    WarRoomCollectionName: "phlwarrooms",
    UserWarRoomDocName: `${phlTeam?.TeamName} ${phlTeam?.Mascot}`,
    league: SimPHL,
  });

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(DrafteeInfoType);

  const [selectedTeam, setSelectedTeam] = useState<ProfessionalTeam | null>(
    phlTeam || null,
  );
  const [modalPlayer, setModalPlayer] = useState<DraftablePlayer | null>(null);
  const [activeTab, setActiveTab] = useState<DraftBoardType>(DraftBoardStr);
  const [isLoading, setIsLoading] = useState(false); // should be true
  const [error, setError] = useState<string | null>(null);
  const [selectedScoutProfile, setSelectedScoutProfile] =
    useState<ScoutingProfile | null>(null);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);
  const [seconds, setSeconds] = useState<number>(300);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  const draftPicksFromState = useMemo(() => {
    // Transform the allDraftPicks map into a flat array
    let picks: DraftPick[] = [];

    const draftStatePicks = allDraftPicks;
    if (!draftStatePicks) return picks;
    for (const round in draftStatePicks) {
      for (const pick of draftStatePicks[round]) {
        picks.push(pick as DraftPick);
      }
    }
    return picks;
  }, [allDraftPicks]);

  const teamDraftPicks = useMemo(() => {
    if (!draftPicksFromState || !selectedTeam) return [];

    return draftPicksFromState.filter(
      (pick) => pick.TeamID === selectedTeam.ID,
    );
  }, [draftPicksFromState, selectedTeam]);

  const draftablePlayerMap = useMemo(() => {
    const map: Record<number, Draftee> = {};
    proDraftablePlayers.forEach((player) => {
      map[player.ID] = player;
    });
    return map;
  }, [proDraftablePlayers]);

  useEffect(() => {
    const loadDraftData = async () => {
      setError(null);
      try {
        await getBootstrapDraftData();
      } catch (err) {
        console.error("Failed to load draft data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load draft data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, []);

  useEffect(() => {
    if (!draftEndTime) return;
    setIsPaused(draftIsPaused);
    setSeconds(draftSeconds);
  }, [draftEndTime, draftIsPaused, draftSeconds]);

  // Optimize timer to reduce Firestore calls and ensure multi-user sync
  useEffect(() => {
    if (isPaused || seconds <= 0) return;
    const interval = setInterval(() => {
      const now = new Date();

      // Handle Firestore Timestamp object properly
      let endTimeJS: Date;
      if (draftEndTime instanceof Date) {
        endTimeJS = draftEndTime;
      } else if (
        draftEndTime &&
        typeof draftEndTime === "object" &&
        "seconds" in draftEndTime
      ) {
        // Firestore Timestamp object
        const timestamp = draftEndTime as {
          seconds: number;
          nanoseconds?: number;
        };
        endTimeJS = new Date(
          timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000,
        );
      } else if (draftEndTime) {
        // String or other format
        endTimeJS = new Date(draftEndTime);
      } else {
        // No end time set
        return;
      }

      const secondsLeft = Math.round(
        (endTimeJS.getTime() - now.getTime()) / 1000,
      );
      const newSeconds = secondsLeft >= 0 ? secondsLeft : 0;
      setSeconds(newSeconds);

      // Only update Firestore when time runs out (not every second)
      if (secondsLeft <= 0) {
        updateDraftState({
          isPaused: true,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, seconds, draftEndTime, updateDraftState]);

  const currentPick = useMemo(() => {
    return (
      draftPicksFromState.find((pick) => {
        return (
          pick.DraftRound === draftCurrentRound &&
          pick.DraftNumber === draftCurrentPick
        );
      }) || null
    );
  }, [draftPicksFromState, draftCurrentRound, draftCurrentPick]);

  const upcomingPicks = useMemo(() => {
    const result = draftPicksFromState
      .filter((pick) => {
        const pickOverall =
          (pick.DraftRound - 1) * PHL_PICKS_PER_ROUND + pick.DraftNumber;
        const draftPickOverall =
          (draftCurrentRound - 1) * PHL_PICKS_PER_ROUND + draftCurrentPick;
        return pickOverall >= draftPickOverall;
      })
      .sort((a, b) => {
        if (a.DraftRound !== b.DraftRound) {
          return a.DraftRound - b.DraftRound;
        }
        return a.DraftNumber - b.DraftNumber;
      })
      .slice(0, 15);
    return result;
  }, [draftPicksFromState, draftCurrentPick]);

  const recentPicks = useMemo(() => {
    return draftPicksFromState
      .filter((pick) => {
        const pickOverall =
          (pick.DraftRound - 1) * PHL_PICKS_PER_ROUND + pick.DraftNumber;
        return pickOverall < draftCurrentPick && pick.DrafteeID > 0;
      })
      .sort((a, b) => {
        const aOverall =
          (a.DraftRound - 1) * PHL_PICKS_PER_ROUND + a.DraftNumber;
        const bOverall =
          (b.DraftRound - 1) * PHL_PICKS_PER_ROUND + b.DraftNumber;
        return bOverall - aOverall;
      })
      .slice(0, 20);
  }, [draftPicksFromState, draftCurrentPick]);

  const draftedPlayerIds = useMemo(() => {
    return new Set(
      draftPicksFromState
        .filter((pick) => pick.DrafteeID > 0)
        .map((pick) => pick.DrafteeID),
    );
  }, [draftPicksFromState]);

  const teamScoutProfiles = useMemo(() => {
    if (!selectedTeam) return [];

    return phlScoutProfiles.filter(
      (profile) => profile.TeamID === selectedTeam.ID,
    );
  }, [selectedTeam, phlScoutProfiles]);

  const phlGameplan = useMemo(() => {
    if (!selectedTeam) return null;
    return phlGameplanMap[selectedTeam.ID] || null;
  }, [phlGameplanMap, selectedTeam]);

  const scoutedPlayerIds = useMemo(() => {
    return new Set(teamScoutProfiles.map((profile) => profile.PlayerID));
  }, [teamScoutProfiles]);

  const teamWarRoom = useMemo(() => {
    if (!selectedTeam) return null;
    return proWarRoom[selectedTeam.ID] || null;
  }, [proWarRoom, selectedTeam]);

  const isUserTurn = useMemo(() => {
    return currentPick?.TeamID === selectedTeam?.ID;
  }, [currentPick, selectedTeam]);

  const teamRoster = useMemo(() => {
    if (!selectedTeam) return [];
    return proRosterMap[selectedTeam.ID] || [];
  }, [proRosterMap, selectedTeam]);

  const offensiveSystemsInformation = useMemo(() => {
    return offensiveSystemsInformationList[
      phlGameplan!
        .OffensiveSystem as keyof typeof offensiveSystemsInformationList
    ];
  }, [phlGameplan]);

  const defensiveSystemsInformation = useMemo(() => {
    return defensiveSystemsInformationList[
      phlGameplan!
        .DefensiveSystem as keyof typeof defensiveSystemsInformationList
    ];
  }, [phlGameplan]);

  const offensiveSystem = useMemo(() => {
    return getOffensiveSystemFromMap(phlGameplan!.OffensiveSystem).label;
  }, [phlGameplan]);

  const defensiveSystem = useMemo(() => {
    if (!phlGameplan) return "";
    return getDefensiveSystemFromMap(phlGameplan!.DefensiveSystem).label;
  }, [phlGameplan]);

  const teamNeedsList = useMemo(() => {
    if (!teamRoster || !phlGameplan || phlGameplan.TeamID !== selectedTeam?.ID)
      return [];

    const needs: string[] = [];

    // Position roster limits and quality thresholds
    const positionLimits = { C: 4, F: 8, D: 6, G: 2 };
    const qualityThreshold = 35;
    const starThreshold = 45;

    // Initialize counters
    const positionCounts = { C: 0, F: 0, D: 0, G: 0 };
    const qualityPlayers = { C: 0, F: 0, D: 0, G: 0 };
    const starPlayers = { C: 0, F: 0, D: 0, G: 0 };
    const archetypeCounts: Record<string, number> = {};

    // Analyze current roster
    teamRoster.forEach((player) => {
      const pos = player.Position as keyof typeof positionCounts;
      if (positionCounts[pos] !== undefined) {
        positionCounts[pos]++;

        if (player.Overall > qualityThreshold) {
          qualityPlayers[pos]++;
        }
        if (player.Overall > starThreshold) {
          starPlayers[pos]++;
        }

        // Track archetypes
        const archetype = player.Archetype;
        archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
      }
    });

    // Analyze position needs
    Object.entries(positionLimits).forEach(([position, limit]) => {
      const pos = position as keyof typeof positionCounts;
      const count = positionCounts[pos];
      const quality = qualityPlayers[pos];
      const stars = starPlayers[pos];

      // Critical needs (no players or very low count)
      if (count === 0) {
        needs.push(`🚨 CRITICAL: ${position} - No players rostered`);
      } else if (count === 1 && limit > 2) {
        needs.push(`🔴 HIGH: ${position} - Only 1 player (${count}/${limit})`);
      }
      // Quality needs
      else if (quality === 0 && count > 0) {
        needs.push(
          `🔴 HIGH: ${position} - No quality players (${count}/${limit} rostered)`,
        );
      }
      // Depth needs
      else if (count < Math.ceil(limit * 0.6)) {
        needs.push(
          `🟡 MEDIUM: ${position} - Below recommended depth (${count}/${limit})`,
        );
      }
      // Star power needs
      else if (stars === 0 && limit >= 4) {
        needs.push(
          `🔵 LOW: ${position} - No star players (${quality} quality of ${count})`,
        );
      }
      // Light depth concerns
      else if (quality < Math.ceil(limit * 0.4)) {
        needs.push(
          `🔵 LOW: ${position} - Limited quality depth (${quality} quality of ${count})`,
        );
      }
    });

    // System-specific archetype analysis
    const getArchetypeNeeds = () => {
      const systemNeeds: string[] = [];

      // Offensive system preferences
      if (offensiveSystemsInformation?.GoodFits) {
        const preferredOffensiveArchetypes =
          offensiveSystemsInformation.GoodFits.filter((fit) => fit.bonus >= 4) // High impact archetypes
            .map((fit) => fit.archetype);

        preferredOffensiveArchetypes.forEach((archetype) => {
          const currentCount = archetypeCounts[archetype] || 0;
          const minRecommended = archetype === "Playmaker" ? 2 : 1;

          if (currentCount < minRecommended) {
            const system = getOffensiveSystemFromMap(
              phlGameplan.OffensiveSystem,
            );
            systemNeeds.push(
              `⚡ SYSTEM: ${archetype} forwards for ${system.label} (+${offensiveSystemsInformation.GoodFits.find((f) => f.archetype === archetype)?.bonus} bonus)`,
            );
          }
        });
      }

      // Defensive system preferences
      if (defensiveSystemsInformation?.GoodFits) {
        const preferredDefensiveArchetypes =
          defensiveSystemsInformation.GoodFits.filter((fit) => fit.bonus >= 4) // High impact archetypes
            .map((fit) => fit.archetype);

        preferredDefensiveArchetypes.forEach((archetype) => {
          const currentCount = archetypeCounts[archetype] || 0;
          const minRecommended = archetype === "Defensive" ? 2 : 1;

          if (currentCount < minRecommended) {
            const system = getDefensiveSystemFromMap(
              phlGameplan.DefensiveSystem,
            );
            systemNeeds.push(
              `🛡️ SYSTEM: ${archetype} players for ${system.label} (+${defensiveSystemsInformation.GoodFits.find((f) => f.archetype === archetype)?.bonus} bonus)`,
            );
          }
        });
      }

      return systemNeeds;
    };

    // Add system-specific needs
    needs.push(...getArchetypeNeeds());

    // If no major needs, add development suggestions
    if (needs.length === 0) {
      needs.push(
        "✅ Roster is well-balanced - Consider best player available or future needs",
      );
    }

    return needs;
  }, [
    teamRoster,
    phlGameplan,
    selectedTeam,
    offensiveSystemsInformation,
    defensiveSystemsInformation,
  ]);

  const handleAddToScoutBoard = useCallback(
    async (player: DraftablePlayer) => {
      if (!selectedTeam) return;
      const dto = {
        PlayerID: player.ID,
        TeamID: selectedTeam.ID,
      };
      // Pass player data for optimistic update
      await addPlayerToScoutBoard(dto, player);
    },
    [selectedTeam, addPlayerToScoutBoard],
  );

  const handleRemoveFromScoutBoard = useCallback(
    async (profile: ScoutingProfile) => {
      await removePlayerFromScoutBoard(profile.ID);
    },
    [removePlayerFromScoutBoard],
  );

  const handleRevealAttribute = useCallback(
    async (profileId: number, attribute: string, points: number) => {
      if (!selectedTeam) return;
      const dto = {
        ScoutProfileID: profileId,
        Attribute: attribute,
        Points: points,
        TeamID: selectedTeam.ID,
      };
      await revealScoutingAttribute(dto);
    },
    [selectedTeam, revealScoutingAttribute],
  );

  const handleViewScoutDetails = useCallback((profile: ScoutingProfile) => {
    setSelectedScoutProfile(profile);
    setIsScoutingModalOpen(true);
  }, []);

  const closeScoutingModal = useCallback(() => {
    setIsScoutingModalOpen(false);
    setSelectedScoutProfile(null);
  }, []);

  const handleExportDraftPicks = useCallback(async () => {
    if (!selectedTeam) return;
    const dto = { TeamID: selectedTeam.ID };
    await exportDraftPicks(dto);
    updateDraftState({
      exportComplete: true,
    });
  }, [selectedTeam, exportDraftPicks, updateDraftState]);

  const refreshDraftData = useCallback(async () => {
    try {
      await getBootstrapDraftData();
    } catch (err) {
      console.error("Failed to refresh draft data:", err);
    }
  }, [getBootstrapDraftData]);

  const formatDraftPosition = useCallback((pick: DraftPick): string => {
    const round = pick.DraftRound;
    const pickInRound = pick.DraftNumber - (round - 1) * PHL_PICKS_PER_ROUND;

    const suffix = (n: number) => {
      if (n % 10 === 1 && n % 100 !== 11) return "st";
      if (n % 10 === 2 && n % 100 !== 12) return "nd";
      if (n % 10 === 3 && n % 100 !== 13) return "rd";
      return "th";
    };

    return `${round}${suffix(round)} Round, ${pickInRound}${suffix(pickInRound)} Pick (#${pick.DraftNumber} Overall)`;
  }, []);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = phlTeamMap ? phlTeamMap[value] : null;
    if (nextTeam) {
      setSelectedTeam(nextTeam);
    }
  };

  const handlePlayerModal = (
    action: ModalAction,
    player: DraftablePlayer | Draftee,
  ) => {
    setModalPlayer(player as DraftablePlayer);
    setModalAction(action);
    handleOpenModal();
  };

  // Enhanced update function that can handle manual updates
  const handleManualDraftStateUpdate = useCallback(
    async (newState: any) => {
      await updateDraftState(newState);
    },
    [updateDraftState],
  );

  const startDraft = useCallback(async () => {
    const newEndTime = new Date(Date.now() + draftSeconds * 1000);

    await handleManualDraftStateUpdate({
      isPaused: false,
      endTime: newEndTime,
    });
  }, [handleManualDraftStateUpdate, draftSeconds, draftIsPaused]);

  const togglePause = useCallback(async () => {
    if (draftIsPaused) {
      // Resuming - create new endTime based on current remaining seconds
      const newEndTime = new Date(Date.now() + seconds * 1000);
      await handleManualDraftStateUpdate({
        isPaused: false,
        endTime: newEndTime,
        seconds: seconds, // Preserve current countdown
      });
    } else {
      // Pausing - save current remaining time
      await handleManualDraftStateUpdate({
        isPaused: true,
        seconds: seconds, // Save current countdown value
      });
    }
  }, [handleManualDraftStateUpdate, draftIsPaused, seconds]);

  const resetTimer = useCallback(async () => {
    const newSeconds = getSecondsByRound(draftCurrentRound);
    const newEndTime = new Date(Date.now() + newSeconds * 1000);
    await handleManualDraftStateUpdate({
      isPaused: true,
      endTime: newEndTime,
      seconds: newSeconds, // Reset to original timer value
    });
    setSeconds(newSeconds);
    setIsPaused(true);
  }, [handleManualDraftStateUpdate, draftCurrentRound]);

  const resyncDraftData = useCallback(async () => {
    const draftMap: Record<number, DraftPick[]> = {};

    phlAllDraftPicks.forEach((pick) => {
      if (!draftMap[pick.DraftRound]) {
        draftMap[pick.DraftRound] = [];
      }
      draftMap[pick.DraftRound].push(pick);
    });

    handleManualDraftStateUpdate({
      allDraftPicks: draftMap,
    });
  }, [phlAllDraftPicks, handleManualDraftStateUpdate]);

  const partnerTradablePicks = useMemo(() => {
    if (!tradePartnerTeam) return [];
    return draftPicksFromState.filter((x) => x.TeamID === tradePartnerTeam.ID);
  }, [draftPicksFromState, tradePartnerTeam]);

  const handleProcessTrade = useCallback(
    (id: number) => {
      const adminTradeQueue = [...approvedRequests];
      const itemIdx = adminTradeQueue.findIndex((x) => x.ID === id);
      if (itemIdx < 0) {
        return;
      }
      const item = adminTradeQueue[itemIdx];
      let dto = {};
      const it = item as TradeProposal;
      dto = {
        TeamID: it.TeamID,
        RecepientTeamID: it.RecepientTeamID,
        IsTradeAccepted: true,
        IsTradeRejected: false,
        IsSynced: false,
        TeamTradeOptions: it.TeamTradeOptions,
        RecepientTeamTradeOptions: it.RecepientTeamTradeOptions,
      };

      const res = TradeService.HCKProcessAcceptedDraftTrade(dto);
      // 2. Swap the draft picks, don't worry about players
      const teamTradeDPs = it.TeamTradeOptions.filter((x) => x.DraftPickID > 0);

      const recTradeDPs = it.RecepientTeamTradeOptions.filter(
        (x) => x.DraftPickID > 0,
      );

      // Sent Team Options
      const swapMapSent: Record<number, boolean> = {};
      // Receiving Team Options
      const swapMapRec: Record<number, boolean> = {};

      for (let i = 0; i < teamTradeDPs.length; i++) {
        const dpObj = teamTradeDPs[i];
        if (dpObj.DraftPickID > 0) {
          swapMapSent[dpObj.DraftPickID] = true;
        }
      }

      for (let i = 0; i < recTradeDPs.length; i++) {
        const dpObj = recTradeDPs[i];
        if (dpObj.DraftPickID > 0) {
          swapMapRec[dpObj.DraftPickID] = true;
        }
      }

      const allDPs = { ...allDraftPicks };
      // 3. Place updated draft picks into map
      // 4. Iterate over draft pick list

      for (let i = 1; i < 8; i++) {
        for (let j = 0; j < allDPs[i].length; j++) {
          const pick = allDPs[i][j];
          if (swapMapSent[pick.ID]) {
            pick.PreviousTeamID = pick.TeamID;
            pick.PreviousTeam = pick.Team;
            pick.TeamID = it.RecepientTeamID;
          } else if (swapMapRec[pick.ID]) {
            pick.PreviousTeamID = pick.TeamID;
            pick.PreviousTeam = pick.Team;
            pick.TeamID = it.TeamID;
          }
        }
      }

      handleManualDraftStateUpdate({
        allDraftPicks: allDPs,
      });
      // 7. Filter out item from Admin Trades
      // 8. Save Admin State
      const filteredQueue = adminTradeQueue.filter((x) => x.ID !== id);
      const apt = { approvedRequests: filteredQueue };
      updateApprovedTrades(apt);
    },
    [approvedRequests, updateApprovedTrades, proRosterMap, allDraftPicks],
  );

  return {
    selectedTeam,
    proDraftablePlayers,
    teamScoutProfiles,
    phlAllDraftPicks,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    draftState,
    updateDraftState,
    handleManualDraftStateUpdate,
    selectedScoutProfile,
    isScoutingModalOpen,
    currentPick,
    upcomingPicks,
    recentPicks,
    draftedPlayerIds,
    scoutedPlayerIds,
    teamWarRoom,
    isUserTurn,
    handleAddToScoutBoard,
    handleRemoveFromScoutBoard,
    handleRevealAttribute,
    handleViewScoutDetails,
    closeScoutingModal,
    handleExportDraftPicks,
    refreshDraftData,
    bringUpCollegePlayer,
    formatDraftPosition,
    getTimeForPick,
    PICKS_PER_ROUND: PHL_PICKS_PER_ROUND,
    selectTeamOption,
    phlTeamOptions,
    teamNeedsList,
    offensiveSystemsInformation,
    defensiveSystemsInformation,
    offensiveSystem,
    defensiveSystem,
    modalPlayer,
    handleCloseModal,
    handlePlayerModal,
    modalAction,
    isModalOpen,
    isPaused,
    seconds,
    draftPicksFromState,
    resyncDraftData,
    isDraftStateLoading,
    formattedTime,
    isDraftComplete,
    togglePause,
    startDraft,
    resetTimer,
    teamDraftPicks,
    draftablePlayerMap,
    // Draft Trade State
    userTeam,
    tradePartnerTeam,
    selectTradePartner,
    teamOptions,
    userTradablePlayers,
    userTradablePicks,
    partnerTradablePlayers,
    partnerTradablePicks,
    userTradeProposals,
    userWarRoomData,
    approvedRequests,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    vetoTrade,
    updateUserWarRoom,
    updateApprovedTrades,
    handleProcessTrade,
  };
};

export default usePHLDraft;

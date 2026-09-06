import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useDraftState } from "../hooks/useDraftState";
import { useModal } from "../../../_hooks/useModal";
import {
  DraftBoardStr,
  DraftBoardType,
  DrafteeInfoType,
  ModalAction,
} from "../../../_constants/constants";
import {
  NBADraftee,
  DraftPick,
  NBATeam,
  NBAWarRoom,
  ScoutingProfile,
} from "../../../models/basketballModels";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Draftee } from "../common";
import { getSecondsByRound } from "../PHLDraft/utils/draftHelpers";

export const NBA_PICKS_PER_ROUND = 32;

export const getTimeForPick = (pickNumber: number): number => {
  if (pickNumber <= NBA_PICKS_PER_ROUND) return 300;
  return 120;
};

export interface NBADraftState {
  currentPick: number;
  currentRound: number;
  isPaused: boolean;
  seconds: number;
  exportComplete: boolean;
}

export const useNBADraftPage = () => {
  const {
    cbb_Timestamp,
    nbaTeam,
    nbaDraftees,
    nbaTeamOnlyOptions,
    nbaTeamMap,
    nbaWarRoomMap,
    nbaGameplanMap,
    nbaScoutingProfileMap,
    proRosterMap,
    nbaDraftPicks,
    currentSeasonDraftPicks,
    getBootstrapDraftData,
    addPlayerToScoutBoard,
    revealScoutingAttribute,
    removePlayerFromScoutBoard,
    exportDraftPicks,
    exportNBADraftees,
  } = useSimBBAStore();

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
    CollectionName: "nbadraftstate",
    DocName: "YfIofzhpUVSJITQpBrUA",
  });

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(DrafteeInfoType);

  const [selectedTeam, setSelectedTeam] = useState<NBATeam | null>(
    nbaTeam || null,
  );
  const [modalPlayer, setModalPlayer] = useState<NBADraftee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DraftBoardType>(DraftBoardStr);
  const [warRoom, setWarRoom] = useState<NBAWarRoom | null>(null);
  const [scoutProfiles, setScoutProfiles] = useState<ScoutingProfile[]>([]);
  const [selectedScoutProfile, setSelectedScoutProfile] =
    useState<ScoutingProfile | null>(null);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);
  const [nbaTeams, setNbaTeams] = useState<NBATeam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(300);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  // Normalize draftEndTime to a stable primitive so effects only re-run when
  // the timestamp value actually changes, not on every Firestore snapshot that
  // returns a new object reference for the same time.
  const endTimeMs = useMemo(() => {
    if (!draftEndTime) return 0;
    if (draftEndTime instanceof Date) return draftEndTime.getTime();
    if (typeof draftEndTime === "object" && "seconds" in draftEndTime) {
      const ts = draftEndTime as { seconds: number; nanoseconds?: number };
      return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000;
    }
    return new Date(draftEndTime as any).getTime();
  }, [draftEndTime]);

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
    const map: Record<number, NBADraftee> = {};
    nbaDraftees.forEach((player) => {
      map[player.ID] = player;
    });
    return map;
  }, [nbaDraftees]);

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

  // Sync Firestore → local state when the draft state meaningfully changes
  // (another admin action, auto-advance, etc.). endTimeMs is a primitive so
  // this only fires when the timestamp value changes, not on every snapshot.
  //
  // setSeconds is intentionally guarded to only run when paused. While the
  // timer is actively counting down the interval computes the accurate
  // remaining time from endTimeMs — calling setSeconds(draftSeconds) here
  // would jump the clock back to the stale initial-round value stored in
  // Firestore and cause the visible up-and-down oscillation.
  useEffect(() => {
    if (!endTimeMs) return;
    setIsPaused(draftIsPaused);
    if (draftIsPaused) {
      setSeconds(draftSeconds);
    }
  }, [endTimeMs, draftIsPaused, draftSeconds]);

  // Wall-clock countdown.
  // - deps are [isPaused, endTimeMs] only — no `seconds`, so setSeconds inside
  //   the interval does NOT restart the interval on every tick.
  // - Math.floor gives clean per-second decrements without the rounding
  //   artifact that made the timer appear slow near minute boundaries.
  // - Firestore is only written when the clock hits zero.
  useEffect(() => {
    if (isPaused || !endTimeMs) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.floor((endTimeMs - Date.now()) / 1000);
      setSeconds(secondsLeft >= 0 ? secondsLeft : 0);
      if (secondsLeft <= 0) {
        setIsPaused(true);
        updateDraftState({ isPaused: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, endTimeMs, updateDraftState]);

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
          (pick.DraftRound - 1) * NBA_PICKS_PER_ROUND + pick.DraftNumber;
        const draftPickOverall =
          (draftCurrentRound - 1) * NBA_PICKS_PER_ROUND + draftCurrentPick;
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
  }, [draftPicksFromState, draftCurrentRound, draftCurrentPick]);

  const recentPicks = useMemo(() => {
    return draftPicksFromState
      .filter((pick) => {
        const pickOverall =
          (pick.DraftRound - 1) * NBA_PICKS_PER_ROUND + pick.DraftNumber;
        const draftPickOverall =
          (draftCurrentRound - 1) * NBA_PICKS_PER_ROUND + draftCurrentPick;
        return pickOverall < draftPickOverall && pick.DrafteeID > 0;
      })
      .sort((a, b) => {
        const aOverall =
          (a.DraftRound - 1) * NBA_PICKS_PER_ROUND + a.DraftNumber;
        const bOverall =
          (b.DraftRound - 1) * NBA_PICKS_PER_ROUND + b.DraftNumber;
        return bOverall - aOverall;
      })
      .slice(0, 20);
  }, [draftPicksFromState, draftCurrentRound, draftCurrentPick]);

  const draftedPlayerIds = useMemo(() => {
    return new Set(
      draftPicksFromState
        .filter((pick) => pick.DrafteeID > 0)
        .map((pick) => pick.DrafteeID),
    );
  }, [draftPicksFromState]);

  const teamScoutProfiles = useMemo(() => {
    if (selectedTeam === null || !selectedTeam) return [];
    if (selectedTeam.ID === undefined || selectedTeam.ID === null) return [];
    if (nbaScoutingProfileMap === null || !nbaScoutingProfileMap) return [];
    if (
      !nbaScoutingProfileMap[selectedTeam.ID] ||
      nbaScoutingProfileMap[selectedTeam.ID] === null
    )
      return [];
    const nbaScoutingProfileMapForTeam = nbaScoutingProfileMap[selectedTeam.ID];
    if (
      !nbaScoutingProfileMapForTeam ||
      nbaScoutingProfileMapForTeam.length === 0
    ) {
      return [];
    }
    return nbaScoutingProfileMapForTeam.filter(
      (profile) => profile.TeamID === selectedTeam.ID,
    );
  }, [selectedTeam, nbaScoutingProfileMap]);

  const scoutedPlayerIds = useMemo(() => {
    return new Set(teamScoutProfiles.map((profile) => profile.PlayerID));
  }, [teamScoutProfiles]);

  const teamWarRoom = useMemo(() => {
    if (!selectedTeam) return null;
    return nbaWarRoomMap[selectedTeam.ID] || null;
  }, [nbaWarRoomMap, selectedTeam]);

  const isUserTurn = useMemo(() => {
    return currentPick?.TeamID === selectedTeam?.ID;
  }, [currentPick, selectedTeam]);

  const teamRoster = useMemo(() => {
    if (!selectedTeam) return [];
    if (!proRosterMap || proRosterMap === null) return [];
    if (
      !proRosterMap[selectedTeam.ID] ||
      proRosterMap[selectedTeam.ID] === null
    )
      return [];
    return proRosterMap[selectedTeam.ID] || [];
  }, [proRosterMap, selectedTeam]);

  const nbaGameplan = useMemo(() => {
    if (!selectedTeam) return null;
    if (!nbaGameplanMap || nbaGameplanMap === null) return null;
    if (
      !nbaGameplanMap[selectedTeam.ID] ||
      nbaGameplanMap[selectedTeam.ID] === null
    )
      return null;
    return nbaGameplanMap[selectedTeam.ID] || null;
  }, [nbaGameplanMap, selectedTeam]);

  // Callbacks
  const handleAddToScoutBoard = useCallback(
    async (player: NBADraftee) => {
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
      if (!selectedTeam) return;
      await removePlayerFromScoutBoard(profile.ID, selectedTeam?.ID);
    },
    [removePlayerFromScoutBoard, selectedTeam],
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
    const dto = { TeamID: selectedTeam.ID, DraftPicks: draftPicksFromState };
    await exportDraftPicks(dto);
    updateDraftState({
      exportComplete: true,
    });
  }, [selectedTeam, exportDraftPicks, updateDraftState, draftPicksFromState]);

  const refreshDraftData = useCallback(async () => {
    try {
      await getBootstrapDraftData();
    } catch (err) {
      console.error("Failed to refresh draft data:", err);
    }
  }, [getBootstrapDraftData]);

  const formatDraftPosition = useCallback((pick: DraftPick): string => {
    const round = pick.DraftRound;
    const pickInRound = pick.DraftNumber - (round - 1) * NBA_PICKS_PER_ROUND;

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
    const nextTeam = nbaTeamMap ? nbaTeamMap[value] : null;
    if (nextTeam) {
      setSelectedTeam(nextTeam);
    }
  };

  const handlePlayerModal = (action: ModalAction, player: Draftee) => {
    setModalPlayer(player as NBADraftee);
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
      // Resuming — flip local state immediately, then write fresh endTime
      const newEndTime = new Date(Date.now() + seconds * 1000);
      await handleManualDraftStateUpdate({
        isPaused: false,
        endTime: newEndTime,
        seconds,
      });
    } else {
      // Pausing — stop local timer immediately, persist remaining seconds
      await handleManualDraftStateUpdate({
        isPaused: true,
        seconds,
      });
    }
  }, [handleManualDraftStateUpdate, draftIsPaused, seconds]);

  const resetTimer = useCallback(async () => {
    const newSeconds = getSecondsByRound(draftCurrentRound);
    const newEndTime = new Date(Date.now() + newSeconds * 1000);
    await handleManualDraftStateUpdate({
      isPaused: true,
      endTime: newEndTime,
      seconds: newSeconds,
    });
    setSeconds(newSeconds);
    setIsPaused(true);
  }, [handleManualDraftStateUpdate, draftCurrentRound]);

  const resyncDraftData = useCallback(async () => {
    const draftMap: Record<number, DraftPick[]> = {};

    currentSeasonDraftPicks.forEach((pick) => {
      if (!draftMap[pick.DraftRound]) {
        draftMap[pick.DraftRound] = [];
      }
      draftMap[pick.DraftRound].push(pick);
    });

    // Update this once the NBA season is complete
    handleManualDraftStateUpdate({
      allDraftPicks: draftMap,
    });
  }, [currentSeasonDraftPicks, handleManualDraftStateUpdate]);

  const teamNeedsList = useMemo(() => {
    if (!teamRoster || !nbaGameplan || nbaGameplan.TeamID !== selectedTeam?.ID)
      return [];

    const needs: string[] = [];

    // Position roster limits and quality thresholds
    const positionLimits = {
      G: 6,
      F: 6,
      C: 4,
    };
    const qualityThreshold = 35;
    const starThreshold = 45;

    // Initialize counters
    const positionCounts = {
      G: 0,
      F: 0,
      C: 0,
    };
    const qualityPlayers = {
      G: 0,
      F: 0,
      C: 0,
    };
    const starPlayers = {
      G: 0,
      F: 0,
      C: 0,
    };

    // Analyze current roster
    teamRoster.forEach((player) => {
      const pos = player.Position as keyof typeof positionCounts;
      if (positionCounts[pos] !== undefined) {
        positionCounts[pos]++;
        if (player.Overall >= qualityThreshold) {
          qualityPlayers[pos]++;
        }
        if (player.Overall >= starThreshold) {
          starPlayers[pos]++;
        }
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

    if (needs.length === 0) {
      needs.push(
        "✅ Roster is well-balanced - Consider best player available or future needs",
      );
    }

    return needs;
  }, [teamRoster, nbaGameplan, selectedTeam]);

  return {
    selectedTeam,
    nbaDraftees,
    teamScoutProfiles,
    currentSeasonDraftPicks,
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
    formatDraftPosition,
    getTimeForPick,
    PICKS_PER_ROUND: NBA_PICKS_PER_ROUND,
    selectTeamOption,
    nbaTeamOnlyOptions,
    teamNeedsList,
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
    nbaDraftPicks,
    exportNBADraftees,
  };
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import {
  NFLDraftee,
  NFLDraftPick,
  NFLTeam,
  NFLWarRoom,
  ScoutingProfile,
} from "../../../models/footballModels";
import { DraftService } from "../../../_services/draftService";
import { useDraftState } from "../hooks/useDraftState";
import { useModal } from "../../../_hooks/useModal";
import {
  DraftBoardStr,
  DraftBoardType,
  DrafteeInfoType,
  ModalAction,
} from "../../../_constants/constants";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { getSecondsByRound } from "../PHLDraft/utils/draftHelpers";
import { Draftee } from "../common";
import { FormationMap } from "../../../_utility/getFormationMap";

export const NFL_PICKS_PER_ROUND = 24;

export const getTimeForPick = (pickNumber: number): number => {
  if (pickNumber <= NFL_PICKS_PER_ROUND) return 300;
  if (pickNumber <= NFL_PICKS_PER_ROUND * 4) return 180;
  return 120;
};

export const useNFLDraft = () => {
  const {
    nflDraftees,
    nflTeam,
    nflTeamOptions,
    proTeamMap,
    nflWarRoomMap,
    nflGameplanMap,
    nflScoutingProfileMap,
    nflDraftPicks,
    proRosterMap,
    getBootstrapDraftData,
    addPlayerToScoutBoard,
    revealScoutingAttribute,
    removePlayerFromScoutBoard,
    exportDraftPicks,
  } = useSimFBAStore();

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
    CollectionName: "nfldraftstate",
    DocName: "Mwwhz87HR14DNHy99cmh",
  });
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(DrafteeInfoType);

  const [selectedTeam, setSelectedTeam] = useState<NFLTeam | null>(
    nflTeam || null,
  );
  const [modalPlayer, setModalPlayer] = useState<NFLDraftee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DraftBoardType>(DraftBoardStr);
  const [warRoom, setWarRoom] = useState<NFLWarRoom | null>(null);
  const [scoutProfiles, setScoutProfiles] = useState<ScoutingProfile[]>([]);
  const [selectedScoutProfile, setSelectedScoutProfile] =
    useState<ScoutingProfile | null>(null);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);
  const [nflTeams, setNflTeams] = useState<NFLTeam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(300);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  const draftPicksFromState = useMemo(() => {
    // Transform the allDraftPicks map into a flat array
    let picks: NFLDraftPick[] = [];

    const draftStatePicks = allDraftPicks;
    if (!draftStatePicks) return picks;
    for (const round in draftStatePicks) {
      for (const pick of draftStatePicks[round]) {
        picks.push(pick as NFLDraftPick);
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
    const map: Record<number, NFLDraftee> = {};
    nflDraftees.forEach((player) => {
      map[player.ID] = player;
    });
    return map;
  }, [nflDraftees]);

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

  useEffect(() => {
    if (draftState.isPaused || draftState.seconds <= 0) return;

    const interval = setInterval(() => {
      updateDraftState({
        ...draftState,
        seconds: Math.max(0, draftState.seconds - 1),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [draftState.isPaused, draftState.seconds]);

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
          (pick.DraftRound - 1) * NFL_PICKS_PER_ROUND + pick.DraftNumber;
        const draftPickOverall =
          (draftCurrentRound - 1) * NFL_PICKS_PER_ROUND + draftCurrentPick;
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
          (pick.DraftRound - 1) * NFL_PICKS_PER_ROUND + pick.DraftNumber;
        return pickOverall < draftCurrentPick && pick.SelectedPlayerID > 0;
      })
      .sort((a, b) => {
        const aOverall =
          (a.DraftRound - 1) * NFL_PICKS_PER_ROUND + a.DraftNumber;
        const bOverall =
          (b.DraftRound - 1) * NFL_PICKS_PER_ROUND + b.DraftNumber;
        return bOverall - aOverall;
      })
      .slice(0, 20);
  }, [draftPicksFromState, draftCurrentRound, draftCurrentPick]);

  const draftedPlayerIds = useMemo(() => {
    return new Set(
      draftPicksFromState
        .filter((pick) => pick.SelectedPlayerID > 0)
        .map((pick) => pick.SelectedPlayerID),
    );
  }, [draftPicksFromState]);

  const teamScoutProfiles = useMemo(() => {
    if (selectedTeam === null || !selectedTeam) return [];
    if (selectedTeam.ID === undefined || selectedTeam.ID === null) return [];
    if (nflScoutingProfileMap === null || !nflScoutingProfileMap) return [];
    if (
      !nflScoutingProfileMap[selectedTeam.ID] ||
      nflScoutingProfileMap[selectedTeam.ID] === null
    )
      return [];

    const nflScoutingProfileMapForTeam = nflScoutingProfileMap[selectedTeam.ID];
    if (
      !nflScoutingProfileMapForTeam ||
      nflScoutingProfileMapForTeam.length === 0
    ) {
      return [];
    }
    return nflScoutingProfileMapForTeam.filter(
      (profile) => profile.TeamID === selectedTeam.ID,
    );
  }, [selectedTeam, nflScoutingProfileMap]);

  const scoutedPlayerIds = useMemo(() => {
    return new Set(teamScoutProfiles.map((profile) => profile.PlayerID));
  }, [teamScoutProfiles]);

  const teamWarRoom = useMemo(() => {
    if (!selectedTeam) return null;
    return nflWarRoomMap[selectedTeam.ID] || null;
  }, [nflWarRoomMap, selectedTeam]);

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

  const nflGameplan = useMemo(() => {
    if (!selectedTeam) return null;
    if (!nflGameplanMap || nflGameplanMap === null) return null;
    if (
      !nflGameplanMap[selectedTeam.ID] ||
      nflGameplanMap[selectedTeam.ID] === null
    )
      return null;
    return nflGameplanMap[selectedTeam.ID] || null;
  }, [nflGameplanMap, selectedTeam]);

  const handleAddToScoutBoard = useCallback(
    async (player: NFLDraftee) => {
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

  const formatDraftPosition = useCallback((pick: NFLDraftPick): string => {
    const round = pick.DraftRound;
    const pickInRound = pick.DraftNumber - (round - 1) * NFL_PICKS_PER_ROUND;

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
    const nextTeam = proTeamMap ? proTeamMap[value] : null;
    if (nextTeam) {
      setSelectedTeam(nextTeam);
    }
  };

  const handlePlayerModal = (action: ModalAction, player: Draftee) => {
    setModalPlayer(player as NFLDraftee);
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
    const draftMap: Record<number, NFLDraftPick[]> = {};

    nflDraftPicks.forEach((pick) => {
      if (!draftMap[pick.DraftRound]) {
        draftMap[pick.DraftRound] = [];
      }
      draftMap[pick.DraftRound].push(pick);
    });

    handleManualDraftStateUpdate({
      allDraftPicks: draftMap,
    });
  }, [nflDraftPicks, handleManualDraftStateUpdate]);

  const offensiveSystem = useMemo(() => {
    if (!nflGameplan) return "";
    return nflGameplan?.OffensiveScheme;
  }, [nflGameplan]);

  const defensiveSystem = useMemo(() => {
    if (!nflGameplan) return "";
    return nflGameplan.DefensiveScheme;
  }, [nflGameplan]);

  const teamNeedsList = useMemo(() => {
    if (!teamRoster || !nflGameplan || nflGameplan.TeamID !== selectedTeam?.ID)
      return [];

    const needs: string[] = [];
    const offScheme = offensiveSystem;
    const defScheme = defensiveSystem;

    // Position roster limits and quality thresholds
    const positionLimits = {
      QB: 2,
      FB: 1,
      RB: 4,
      WR: 5,
      TE: 3,
      OT: 4,
      OG: 4,
      C: 3,
      DT: 4,
      DE: 4,
      ILB: 3,
      OLB: 4,
      CB: 5,
      FS: 2,
      SS: 2,
      K: 1,
      P: 1,
    };
    const qualityThreshold = 70;
    const starThreshold = 80;

    // Initialize counters
    const positionCounts = {
      QB: 0,
      RB: 0,
      FB: 0,
      WR: 0,
      TE: 0,
      OT: 0,
      OG: 0,
      C: 0,
      DT: 0,
      DE: 0,
      ILB: 0,
      OLB: 0,
      CB: 0,
      FS: 0,
      SS: 0,
      K: 0,
      P: 0,
    };
    const qualityPlayers = {
      QB: 0,
      RB: 0,
      FB: 0,
      WR: 0,
      TE: 0,
      OT: 0,
      OG: 0,
      C: 0,
      DT: 0,
      DE: 0,
      ILB: 0,
      DL: 0,
      OLB: 0,
      CB: 0,
      FS: 0,
      SS: 0,
      K: 0,
      P: 0,
    };
    const starPlayers = {
      QB: 0,
      RB: 0,
      FB: 0,
      WR: 0,
      TE: 0,
      OT: 0,
      OG: 0,
      C: 0,
      DT: 0,
      DE: 0,
      ILB: 0,
      DL: 0,
      OLB: 0,
      CB: 0,
      FS: 0,
      SS: 0,
      K: 0,
      P: 0,
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

      if (player.PositionTwo.length > 0) {
        const positionTwo = player.PositionTwo as keyof typeof positionCounts;
        if (positionTwo && positionCounts[positionTwo] !== undefined) {
          positionCounts[positionTwo]++;
          if (player.Overall >= qualityThreshold) {
            qualityPlayers[positionTwo]++;
          }
          if (player.Overall >= starThreshold) {
            starPlayers[positionTwo]++;
          }
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

    // Scheme fit analysis — iterate SchemeFits/BadFits from the FormationMap
    type SchemeEntry = { SchemeFits: string[]; BadFits: string[] };
    const formationMap = FormationMap as Record<string, SchemeEntry>;

    // Position group expansion for scheme fit strings that use generic group labels
    const positionGroupMap: Record<string, string[]> = {
      OL: ["OT", "OG", "C"],
      DL: ["DT", "DE"],
      DB: ["CB", "FS", "SS"],
      LB: ["ILB", "OLB"],
    };

    const matchesPositionGroup = (
      playerPos: string,
      fitPos: string,
    ): boolean => {
      const group = positionGroupMap[fitPos];
      return group ? group.includes(playerPos) : playerPos === fitPos;
    };

    // Parse a fit string like "Run Blocking OL" → { arch: "Run Blocking", pos: "OL" }
    const parseFit = (fit: string): { arch: string; pos: string } => {
      const parts = fit.split(" ");
      return {
        arch: parts.slice(0, -1).join(" "),
        pos: parts[parts.length - 1],
      };
    };

    const analyzeScheme = (schemeName: string, label: string) => {
      const scheme = formationMap[schemeName];
      if (!scheme) return;

      scheme.SchemeFits.forEach((fit) => {
        const { arch, pos } = parseFit(fit);
        const matching = teamRoster.filter(
          (p) => p.Archetype === arch && matchesPositionGroup(p.Position, pos),
        );
        const starPlayers = matching.filter((p) => p.Overall >= starThreshold);
        const qualityPlayers = matching.filter(
          (p) => p.Overall >= qualityThreshold && p.Overall < starThreshold,
        );

        if (starPlayers.length > 0) {
          const best = starPlayers.reduce((a, b) =>
            a.Overall >= b.Overall ? a : b,
          );
          needs.push(
            `⭐ STAR FIT (${label}): ${fit} — ${best.FirstName} ${best.LastName} (${best.Overall} OVR)${starPlayers.length > 1 ? ` +${starPlayers.length - 1} more` : ""}`,
          );
        } else if (qualityPlayers.length > 0) {
          const best = qualityPlayers.reduce((a, b) =>
            a.Overall >= b.Overall ? a : b,
          );
          needs.push(
            `✅ QUALITY FIT (${label}): ${fit} — ${best.FirstName} ${best.LastName} (${best.Overall} OVR)${qualityPlayers.length > 1 ? ` +${qualityPlayers.length - 1} more` : ""}`,
          );
        } else {
          needs.push(
            `❌ MISSING FIT (${label}): ${fit} — No quality players rostered`,
          );
        }
      });

      scheme.BadFits.forEach((fit) => {
        if (fit === "None") return;
        const { arch, pos } = parseFit(fit);
        const qualityMisfits = teamRoster.filter(
          (p) =>
            p.Archetype === arch &&
            matchesPositionGroup(p.Position, pos) &&
            p.Overall >= qualityThreshold,
        );
        qualityMisfits.forEach((p) => {
          needs.push(
            `⚠️ BAD FIT (${label}): ${fit} — ${p.FirstName} ${p.LastName} (${p.Overall} OVR)`,
          );
        });
      });
    };

    analyzeScheme(offScheme, "OFF");
    analyzeScheme(defScheme, "DEF");

    return needs;
  }, [teamRoster, nflGameplan, selectedTeam, offensiveSystem, defensiveSystem]);

  return {
    selectedTeam,
    nflDraftees,
    teamScoutProfiles,
    nflDraftPicks,
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
    PICKS_PER_ROUND: NFL_PICKS_PER_ROUND,
    selectTeamOption,
    nflTeamOptions,
    teamNeedsList,
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
  };
};

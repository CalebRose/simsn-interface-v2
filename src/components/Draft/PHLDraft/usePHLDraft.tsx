import { useState, useEffect, useMemo, useCallback } from "react";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  DraftPick,
  DraftablePlayer,
  ProfessionalTeam,
  ScoutingProfile,
} from "../../../models/hockeyModels";
import {
  DraftBoardStr,
  DraftBoardType,
  DrafteeInfoType,
  InfoType,
  ModalAction,
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

const PICKS_PER_ROUND = 24;

export interface PHLDraftState {
  currentPickNumber: number;
  currentRound: number;
  isPaused: boolean;
  timeLeft: number;
  exportComplete: boolean;
}

export const getTimeForPick = (pickNumber: number): number => {
  if (pickNumber <= PICKS_PER_ROUND) return 300;
  if (pickNumber <= PICKS_PER_ROUND * 4) return 180;
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

  const [draftState, setDraftState] = useState<PHLDraftState>({
    currentPickNumber: 1,
    currentRound: 1,
    isPaused: true,
    timeLeft: 300,
    exportComplete: false,
  });

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

  const getOverallPickNumber = (pick: DraftPick) => {
    return (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
  };

  useEffect(() => {
    if (phlAllDraftPicks.length > 0) {
      const sortedPicks = [...phlAllDraftPicks].sort((a, b) => {
        if (a.DraftRound !== b.DraftRound) return a.DraftRound - b.DraftRound;
        return a.DraftNumber - b.DraftNumber;
      });
      const nextPick = sortedPicks.find((pick) => pick.SelectedPlayerID === 0);
      if (nextPick) {
        const overallPickNumber = getOverallPickNumber(nextPick);
        setDraftState((prev) => ({
          ...prev,
          currentPickNumber: overallPickNumber,
          currentRound: nextPick.DraftRound,
          timeLeft: getTimeForPick(overallPickNumber),
        }));
      }
    }
  }, [phlAllDraftPicks]);

  useEffect(() => {
    if (draftState.isPaused || draftState.timeLeft <= 0) return;

    const interval = setInterval(() => {
      setDraftState((prev) => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [draftState.isPaused, draftState.timeLeft]);

  const currentPick = useMemo(() => {
    return (
      phlAllDraftPicks.find((pick) => {
        const overallNum =
          (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
        return overallNum === draftState.currentPickNumber;
      }) || null
    );
  }, [phlAllDraftPicks, draftState.currentPickNumber]);

  const upcomingPicks = useMemo(() => {
    const result = phlAllDraftPicks
      .filter((pick) => {
        const pickOverall =
          (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
        return pickOverall >= draftState.currentPickNumber;
      })
      .sort((a, b) => {
        if (a.DraftRound !== b.DraftRound) {
          return a.DraftRound - b.DraftRound;
        }
        return a.DraftNumber - b.DraftNumber;
      })
      .slice(0, 15);
    return result;
  }, [phlAllDraftPicks, draftState.currentPickNumber]);

  const recentPicks = useMemo(() => {
    return phlAllDraftPicks
      .filter((pick) => {
        const pickOverall =
          (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
        return (
          pickOverall < draftState.currentPickNumber &&
          pick.SelectedPlayerID > 0
        );
      })
      .sort((a, b) => {
        const aOverall = (a.DraftRound - 1) * PICKS_PER_ROUND + a.DraftNumber;
        const bOverall = (b.DraftRound - 1) * PICKS_PER_ROUND + b.DraftNumber;
        return bOverall - aOverall;
      })
      .slice(0, 20);
  }, [phlAllDraftPicks, draftState.currentPickNumber]);

  const draftedPlayerIds = useMemo(() => {
    return new Set(
      phlAllDraftPicks
        .filter((pick) => pick.SelectedPlayerID > 0)
        .map((pick) => pick.SelectedPlayerID),
    );
  }, [phlAllDraftPicks]);

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
    setDraftState((prev) => ({ ...prev, exportComplete: true }));
  }, [selectedTeam, exportDraftPicks]);

  const refreshDraftData = useCallback(async () => {
    try {
      await getBootstrapDraftData();
    } catch (err) {
      console.error("Failed to refresh draft data:", err);
    }
  }, [getBootstrapDraftData]);

  const formatDraftPosition = useCallback((pick: DraftPick): string => {
    const round = pick.DraftRound;
    const pickInRound = pick.DraftNumber - (round - 1) * PICKS_PER_ROUND;

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
    setDraftState,
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
    PICKS_PER_ROUND,
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
  };
};

export default usePHLDraft;

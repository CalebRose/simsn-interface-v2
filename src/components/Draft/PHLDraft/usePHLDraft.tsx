import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSimHCKStore } from '../../../context/SimHockeyContext';
import {
  DraftPick,
  DraftablePlayer,
  ScoutingProfile
} from '../../../models/hockeyModels';

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
  const hkStore = useSimHCKStore();
  const {
    phlTeam,
    proDraftablePlayers,
    proWarRoom,
    phlScoutProfiles,
    phlAllDraftPicks,
    getBootstrapDraftData,
    addPlayerToScoutBoard,
    revealScoutingAttribute,
    removePlayerFromScoutBoard,
    exportDraftPicks,
    bringUpCollegePlayer
  } = hkStore;

  const [activeTab, setActiveTab] = useState<'board' | 'scout'>('board');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScoutProfile, setSelectedScoutProfile] = useState<ScoutingProfile | null>(null);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);

  const [draftState, setDraftState] = useState<PHLDraftState>({
    currentPickNumber: 1,
    currentRound: 1,
    isPaused: true,
    timeLeft: 300,
    exportComplete: false
  });

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await getBootstrapDraftData();
      } catch (err) {
        console.error('Failed to load draft data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load draft data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [getBootstrapDraftData]);

  const getOverallPickNumber = (pick: DraftPick) => {
    return (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
  };

  useEffect(() => {
    if (phlAllDraftPicks.length > 0) {
      const sortedPicks = [...phlAllDraftPicks].sort((a, b) => {
        if (a.DraftRound !== b.DraftRound) return a.DraftRound - b.DraftRound;
        return a.DraftNumber - b.DraftNumber;
      });
      const nextPick = sortedPicks.find(pick => pick.SelectedPlayerID === 0);
      if (nextPick) {
        const overallPickNumber = getOverallPickNumber(nextPick);
        setDraftState(prev => ({
          ...prev,
          currentPickNumber: overallPickNumber,
          currentRound: nextPick.DraftRound,
          timeLeft: getTimeForPick(overallPickNumber)
        }));
      }
    }
  }, [phlAllDraftPicks]);

  useEffect(() => {
    if (draftState.isPaused || draftState.timeLeft <= 0) return;

    const interval = setInterval(() => {
      setDraftState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [draftState.isPaused, draftState.timeLeft]);

  const currentPick = useMemo(() => {
    return phlAllDraftPicks.find(pick => {
      const overallNum = (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
      return overallNum === draftState.currentPickNumber;
    }) || null;
  }, [phlAllDraftPicks, draftState.currentPickNumber]);

  const upcomingPicks = useMemo(() => {
    const result = phlAllDraftPicks
      .filter(pick => {
        const pickOverall = (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
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
      .filter(pick => {
        const pickOverall = (pick.DraftRound - 1) * PICKS_PER_ROUND + pick.DraftNumber;
        return pickOverall < draftState.currentPickNumber && pick.SelectedPlayerID > 0;
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
        .filter(pick => pick.SelectedPlayerID > 0)
        .map(pick => pick.SelectedPlayerID)
    );
  }, [phlAllDraftPicks]);

  const scoutedPlayerIds = useMemo(() => {
    return new Set(phlScoutProfiles.map(profile => profile.PlayerID));
  }, [phlScoutProfiles]);

  const teamWarRoom = useMemo(() => {
    if (!phlTeam) return null;
    return proWarRoom[phlTeam.ID] || null;
  }, [proWarRoom, phlTeam]);

  const isUserTurn = useMemo(() => {
    return currentPick?.TeamID === phlTeam?.ID;
  }, [currentPick, phlTeam]);

  const handleAddToScoutBoard = useCallback(async (player: DraftablePlayer) => {
    if (!phlTeam) return;
    const dto = {
      PlayerID: player.ID,
      TeamID: phlTeam.ID
    };
    // Pass player data for optimistic update
    await addPlayerToScoutBoard(dto, player);
  }, [phlTeam, addPlayerToScoutBoard]);

  const handleRemoveFromScoutBoard = useCallback(async (profile: ScoutingProfile) => {
    await removePlayerFromScoutBoard(profile.ID);
  }, [removePlayerFromScoutBoard]);

  const handleRevealAttribute = useCallback(async (profileId: number, attribute: string, points: number) => {
    if (!phlTeam) return;
    const dto = {
      ScoutProfileID: profileId,
      Attribute: attribute,
      Points: points,
      TeamID: phlTeam.ID
    };
    await revealScoutingAttribute(dto);
  }, [phlTeam, revealScoutingAttribute]);

  const handleViewScoutDetails = useCallback((profile: ScoutingProfile) => {
    setSelectedScoutProfile(profile);
    setIsScoutingModalOpen(true);
  }, []);

  const closeScoutingModal = useCallback(() => {
    setIsScoutingModalOpen(false);
    setSelectedScoutProfile(null);
  }, []);

  const handleExportDraftPicks = useCallback(async () => {
    if (!phlTeam) return;
    const dto = { TeamID: phlTeam.ID };
    await exportDraftPicks(dto);
    setDraftState(prev => ({ ...prev, exportComplete: true }));
  }, [phlTeam, exportDraftPicks]);

  const refreshDraftData = useCallback(async () => {
    try {
      await getBootstrapDraftData();
    } catch (err) {
      console.error('Failed to refresh draft data:', err);
    }
  }, [getBootstrapDraftData]);

  const formatDraftPosition = useCallback((pick: DraftPick): string => {
    const round = pick.DraftRound;
    const pickInRound = pick.DraftNumber - ((round - 1) * PICKS_PER_ROUND);

    const suffix = (n: number) => {
      if (n % 10 === 1 && n % 100 !== 11) return 'st';
      if (n % 10 === 2 && n % 100 !== 12) return 'nd';
      if (n % 10 === 3 && n % 100 !== 13) return 'rd';
      return 'th';
    };

    return `${round}${suffix(round)} Round, ${pickInRound}${suffix(pickInRound)} Pick (#${pick.DraftNumber} Overall)`;
  }, []);

  return {
    phlTeam,
    proDraftablePlayers,
    phlScoutProfiles,
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
    PICKS_PER_ROUND
  };
};

export default usePHLDraft;

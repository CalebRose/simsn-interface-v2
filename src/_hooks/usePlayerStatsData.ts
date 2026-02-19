import { useEffect, useMemo, useState } from "react";
import { useSimFBAStore } from "../context/SimFBAContext";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  NFLPlayerSeasonStats,
} from "../models/footballModels";
import {
  League,
  SimCFB,
  SimNFL,
  SEASON_VIEW,
  SimCHL,
  SimPHL,
} from "../_constants/constants";
import { getFBAWeekID, getHCKWeekID } from "../_helper/statsPageHelper";
import {
  CollegePlayer as CHLPlayer,
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  DraftablePlayer,
  ProfessionalPlayer,
  ProfessionalPlayerSeasonStats,
} from "../models/hockeyModels";
import { useSimHCKStore } from "../context/SimHockeyContext";

export const useFootballPlayerStatsData = (
  player: CFBPlayer | NFLPlayer,
  league: League,
) => {
  const {
    cfbPlayerSeasonStatsMap,
    nflPlayerSeasonStatsMap,
    SearchFootballStats,
    cfb_Timestamp,
  } = useSimFBAStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedStats, setHasRequestedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestedPlayerID, setLastRequestedPlayerID] = useState<
    number | null
  >(null);

  const playerStats = useMemo(() => {
    let allStats: (CFBPlayerSeasonStats | NFLPlayerSeasonStats)[] = [];
    if (player.ID === undefined || player.ID === 0) return [];

    if (league === SimCFB && cfbPlayerSeasonStatsMap) {
      // Flatten all seasons and filter by player ID
      allStats = Object.values(cfbPlayerSeasonStatsMap)
        .flat()
        .filter(
          (stat) =>
            (stat as CFBPlayerSeasonStats).CollegePlayerID === player.ID,
        );
    } else if (league === SimNFL && nflPlayerSeasonStatsMap) {
      // Flatten all seasons and filter by player ID
      allStats = Object.values(nflPlayerSeasonStatsMap)
        .flat()
        .filter(
          (stat) => (stat as NFLPlayerSeasonStats).NFLPlayerID === player.ID,
        );
    }

    return allStats.sort((a, b) => a.SeasonID - b.SeasonID);
  }, [cfbPlayerSeasonStatsMap, nflPlayerSeasonStatsMap, league, player.ID]);

  useEffect(() => {
    if (!SearchFootballStats || !cfb_Timestamp) return;
    if (player.ID === undefined || player.ID === 0) return;

    // Reset hasRequestedStats if the player has changed
    if (lastRequestedPlayerID !== player.ID) {
      setHasRequestedStats(false);
      setLastRequestedPlayerID(player.ID);
    }

    if (hasRequestedStats) return;

    const seasonStatsMap =
      league === SimCFB ? cfbPlayerSeasonStatsMap : nflPlayerSeasonStatsMap;

    // Check if stats for this specific player are already loaded
    const playerSpecificStats = seasonStatsMap
      ? Object.values(seasonStatsMap)
          .flat()
          .filter((stat) => {
            if (league === SimCFB) {
              return (
                (stat as CFBPlayerSeasonStats).CollegePlayerID === player.ID
              );
            } else {
              return (stat as NFLPlayerSeasonStats).NFLPlayerID === player.ID;
            }
          })
      : [];
    if (playerSpecificStats && playerSpecificStats.length > 0) {
      setHasRequestedStats(true);
      return;
    }

    let isMounted = true;
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasRequestedStats(true);

        const maxSeasonId = cfb_Timestamp.CollegeSeasonID;
        const gameTypeRegularSeason = "2";
        const promises: Promise<void>[] = [];

        for (let seasonId = 1; seasonId <= maxSeasonId; seasonId++) {
          const weekId = getFBAWeekID(1, seasonId);
          promises.push(
            SearchFootballStats({
              League: league,
              ViewType: SEASON_VIEW,
              WeekID: weekId,
              SeasonID: seasonId,
              GameType: gameTypeRegularSeason,
            }),
          );
        }
        await Promise.all(promises);
      } catch {
        if (isMounted) {
          setError("Unable to load stats for this player.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [
    SearchFootballStats,
    cfb_Timestamp,
    league,
    cfbPlayerSeasonStatsMap,
    nflPlayerSeasonStatsMap,
    hasRequestedStats,
    player.ID,
  ]);

  return {
    playerStats,
    isLoading,
    error,
  };
};

export const useHockeyPlayerStatsData = (
  player: CHLPlayer | ProfessionalPlayer | DraftablePlayer,
  league: League,
) => {
  const {
    chlPlayerSeasonStatsMap,
    phlPlayerSeasonStatsMap,
    SearchHockeyStats,
    hck_Timestamp,
  } = useSimHCKStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedStats, setHasRequestedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestedPlayerID, setLastRequestedPlayerID] = useState<
    number | null
  >(null);

  const playerStats = useMemo(() => {
    let allStats: (CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats)[] = [];
    if (player.ID === undefined || player.ID === 0) return [];

    if (league === SimCHL && chlPlayerSeasonStatsMap) {
      // Flatten all seasons and filter by player ID
      allStats = Object.values(chlPlayerSeasonStatsMap)
        .flat()
        .filter(
          (stat) => (stat as CHLPlayerSeasonStats).PlayerID === player.ID,
        );
    } else if (league === SimPHL && phlPlayerSeasonStatsMap) {
      // Flatten all seasons and filter by player ID
      allStats = Object.values(phlPlayerSeasonStatsMap)
        .flat()
        .filter(
          (stat) =>
            (stat as ProfessionalPlayerSeasonStats).PlayerID === player.ID,
        );
    }

    return allStats.sort((a, b) => a.SeasonID - b.SeasonID);
  }, [chlPlayerSeasonStatsMap, phlPlayerSeasonStatsMap, league, player.ID]);

  useEffect(() => {
    if (!SearchHockeyStats || !hck_Timestamp) return;
    if (player.ID === undefined || player.ID === 0) return;

    // Reset hasRequestedStats if the player has changed
    if (lastRequestedPlayerID !== player.ID) {
      setHasRequestedStats(false);
      setLastRequestedPlayerID(player.ID);
    }

    if (hasRequestedStats) return;

    const seasonStatsMap =
      league === SimCHL ? chlPlayerSeasonStatsMap : phlPlayerSeasonStatsMap;

    // Check if stats for this specific player are already loaded
    const playerSpecificStats = seasonStatsMap
      ? Object.values(seasonStatsMap)
          .flat()
          .filter((stat) => {
            if (league === SimCHL) {
              return (stat as CHLPlayerSeasonStats).PlayerID === player.ID;
            } else {
              return (
                (stat as ProfessionalPlayerSeasonStats).PlayerID === player.ID
              );
            }
          })
      : [];
    if (playerSpecificStats && playerSpecificStats.length > 0) {
      setHasRequestedStats(true);
      return;
    }

    let isMounted = true;
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasRequestedStats(true);

        const maxSeasonId = hck_Timestamp.SeasonID;
        const gameTypeRegularSeason = "2";
        const promises: Promise<void>[] = [];

        for (let seasonId = 1; seasonId <= maxSeasonId; seasonId++) {
          const weekId = getHCKWeekID(1, seasonId);
          promises.push(
            SearchHockeyStats({
              League: league,
              ViewType: SEASON_VIEW,
              WeekID: weekId,
              SeasonID: seasonId,
              GameType: gameTypeRegularSeason,
            }),
          );
        }

        await Promise.all(promises);
      } catch {
        if (isMounted) {
          setError("Unable to load stats for this player.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [
    SearchHockeyStats,
    hck_Timestamp,
    league,
    chlPlayerSeasonStatsMap,
    phlPlayerSeasonStatsMap,
    hasRequestedStats,
    player.ID,
  ]);

  return {
    playerStats,
    isLoading,
    error,
  };
};

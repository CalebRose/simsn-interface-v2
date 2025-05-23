import { useMemo } from "react";
import {
  BASE_HCK_SEASON,
  BASE_HCK_WEEKS_IN_SEASON,
  GameDay,
  PLAYER_VIEW,
  StatsType,
  StatsView,
  WEEK_VIEW,
} from "../_constants/constants";
import {
  CollegePlayer as CHLPlayer,
  CollegeTeam as CHLTeam,
  ProfessionalPlayer as PHLPlayer,
  ProfessionalTeam as PHLTeam,
  Timestamp as HCKTimestamp,
  CollegePlayerGameStats as CHLPlayerGameStats,
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  CollegeTeamGameStats as CHLTeamGameStats,
  CollegeTeamSeasonStats as CHLTeamSeasonStats,
  ProfessionalPlayerGameStats,
  ProfessionalPlayerSeasonStats,
  ProfessionalTeamGameStats,
  ProfessionalTeamSeasonStats,
  CollegePlayerSeasonStats,
} from "../models/hockeyModels";

export const MakeCHLPlayerMapFromRosterMap = (
  chlTeams: CHLTeam[],
  rosterMap: Record<number, CHLPlayer[]>
): Record<number, CHLPlayer> => {
  const playerMap: Record<number, CHLPlayer> = {};

  for (let i = 0; i < chlTeams.length; i++) {
    const teamID = chlTeams[i].ID;
    const roster = rosterMap[teamID];
    for (let j = 0; j < roster.length; j++) {
      const player = roster[j];
      playerMap[player.ID] = player;
    }
  }

  const unsignedPlayers = rosterMap[0];
  for (let i = 0; i < unsignedPlayers.length; i++) {
    const player = unsignedPlayers[i];
    playerMap[player.ID] = player;
  }

  return playerMap;
};

export const MakePHLPlayerMapFromRosterMap = (
  phlTeams: PHLTeam[],
  rosterMap: Record<number, PHLPlayer[]>
): Record<number, PHLPlayer> => {
  const playerMap: Record<number, PHLPlayer> = {};

  for (let i = 0; i < phlTeams.length; i++) {
    const teamID = phlTeams[i].ID;
    const roster = rosterMap[teamID];
    for (let j = 0; j < roster.length; j++) {
      const player = roster[j];
      playerMap[player.ID] = player;
    }
  }

  const unsignedPlayers = rosterMap[0];
  for (let i = 0; i < unsignedPlayers.length; i++) {
    const player = unsignedPlayers[i];
    playerMap[player.ID] = player;
  }

  return playerMap;
};

export const MakeHCKSeasonsOptionList = (ts: HCKTimestamp) => {
  const seasonsList = [];
  for (let i = 1; i <= ts.SeasonID; i++) {
    const iterativeSeason = 2024 + i;
    const seasonLabel = `${iterativeSeason}`;
    const option = { label: seasonLabel, value: i.toString() };
    seasonsList.push(option);
  }
  return seasonsList;
};

export const MakeHCKWeeksOptionList = (seasonID: number) => {
  const weeksList = [];

  for (let i = 1; i <= BASE_HCK_WEEKS_IN_SEASON; i++) {
    const weekID = getHCKWeekID(i, seasonID);
    const weekLabel = `Week ${i}`;
    const option = { label: weekLabel, value: weekID.toString() };
    weeksList.push(option);
  }

  return weeksList;
};

export const getHCKWeekID = (week: number, seasonID: number) => {
  const season = seasonID + BASE_HCK_SEASON;
  const diffSeason = season - 2000;
  return diffSeason * 100 + week;
};

export const getHCKDisplayWeek = (weekID: number, season: number) => {
  const diffSeason = season - 2000;
  const baseWeekDiff = diffSeason * 100;
  return weekID - baseWeekDiff;
};

export const GetHCKCollegeStats = (
  statsView: StatsView,
  statsType: StatsType,
  week: number,
  season: number,
  chlPlayerGameStatsMap: Record<number, CHLPlayerGameStats[]>,
  chlPlayerSeasonStatsMap: Record<number, CHLPlayerSeasonStats[]>,
  chlTeamGameStatsMap: Record<number, CHLTeamGameStats[]>,
  chlTeamSeasonStatsMap: Record<number, CHLTeamSeasonStats[]>,
  gameDay: GameDay
) => {
  if (statsView === WEEK_VIEW) {
    if (statsType === PLAYER_VIEW) {
      const slateOfStats = chlPlayerGameStatsMap[week] || [];
      if (slateOfStats.length > 0) {
        return slateOfStats.filter((stat) => stat.GameDay === gameDay);
      }
      return [];
    }
    const slateOfStats = chlTeamGameStatsMap[week] || [];
    if (slateOfStats.length > 0) {
      return slateOfStats.filter((stat) => stat.GameDay === gameDay);
    }
    return [];
  }
  if (statsType === PLAYER_VIEW) {
    return chlPlayerSeasonStatsMap[season] || [];
  }
  return chlTeamSeasonStatsMap[season] || [];
};

export const GetHCKProStats = (
  statsView: StatsView,
  statsType: StatsType,
  week: number,
  season: number,
  phlPlayerGameStatsMap: Record<number, ProfessionalPlayerGameStats[]>,
  phlPlayerSeasonStatsMap: Record<number, ProfessionalPlayerSeasonStats[]>,
  phlTeamGameStatsMap: Record<number, ProfessionalTeamGameStats[]>,
  phlTeamSeasonStatsMap: Record<number, ProfessionalTeamSeasonStats[]>,
  gameDay: GameDay
) => {
  if (statsView === WEEK_VIEW) {
    if (statsType === PLAYER_VIEW) {
      const slateOfStats = phlPlayerGameStatsMap[week] || [];
      if (slateOfStats.length > 0) {
        return slateOfStats.filter((stat) => stat.GameDay === gameDay);
      }
      return [];
    }
    const slateOfStats = phlTeamGameStatsMap[week] || [];
    if (slateOfStats.length > 0) {
      return slateOfStats.filter((stat) => stat.GameDay === gameDay);
    }
    return [];
  }
  if (statsType === PLAYER_VIEW) {
    return phlPlayerSeasonStatsMap[season] || [];
  }
  return phlTeamSeasonStatsMap[season] || [];
};

export const useFilteredHockeyStats = ({
  selectedStats,
  selectedTeams,
  selectedConferences,
  teamMap,
  playerMap,
  statsType,
  viewGoalieStats,
}: {
  selectedStats: any[];
  selectedTeams: string[];
  selectedConferences: string[];
  teamMap: Record<number, { ConferenceID: number }>;
  playerMap: Record<number, { Position: string }>;
  statsType: StatsType;
  viewGoalieStats: boolean;
}) => {
  // 1) build Sets once per change
  const teamSet = useMemo(() => new Set(selectedTeams), [selectedTeams]);
  const confSet = useMemo(
    () => new Set(selectedConferences),
    [selectedConferences]
  );

  const filtered = useMemo(() => {
    return selectedStats.filter((stat) => {
      // 1) Team filter
      if (teamSet.size > 0) {
        const tid = stat.TeamID.toString();
        if (!teamSet.has(tid)) {
          return false;
        }
      }

      // 2) Conference filter
      if (confSet.size > 0) {
        const confId = teamMap[stat.TeamID]?.ConferenceID?.toString() ?? "";
        if (!confSet.has(confId)) {
          return false;
        }
      }

      // 3) Player‐view (goalie vs. skater)
      if (statsType === PLAYER_VIEW) {
        const player = playerMap[stat.PlayerID];
        if (!player) return false;

        const isGoalie = player.Position === "G";
        // if we're viewing goalies, drop non-goalies; if viewing skaters, drop goalies
        if (viewGoalieStats ? !isGoalie : isGoalie) {
          return false;
        }
      }

      // 4) If we get here, we've passed all active filters
      return true;
    });
  }, [
    selectedStats,
    teamSet,
    confSet,
    teamMap,
    playerMap,
    statsType,
    viewGoalieStats,
  ]);

  return filtered;
};

type SeasonStats = CollegePlayerSeasonStats | ProfessionalPlayerSeasonStats;
export const isSeasonStats = (s: any): s is SeasonStats => {
  return typeof s.StatType === "number" && typeof s.GamesPlayed === "number";
};

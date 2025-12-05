import { useMemo } from "react";
import {
  BASE_FBA_SEASON,
  BASE_FBA_WEEKS_IN_SEASON,
  BASE_HCK_SEASON,
  BASE_HCK_WEEKS_IN_SEASON,
  DEFENSE,
  FootballStatsType,
  GameDay,
  League,
  OLINE,
  PASSING,
  PLAYER_VIEW,
  RECEIVING,
  RETURN,
  RUSHING,
  SimCFB,
  SPECIAL_TEAMS,
  StatsType,
  StatsView,
  TEAM_VIEW,
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
} from "../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  CollegeTeam as CFBTeam,
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  CollegePlayerStats as CFBPlayerStats,
  NFLPlayer,
  NFLPlayerSeasonStats,
  NFLPlayerStats,
  NFLTeam,
  NFLTeamSeasonStats,
  NFLTeamStats,
  Timestamp as FBATimestamp,
  CollegeTeamStats,
  CollegeTeamSeasonStats,
  CollegeTeam,
} from "../models/footballModels";
import { Timestamp as BBATimestamp } from "../models/basketballModels";

export const MakeCHLPlayerMapFromRosterMap = (
  chlTeams: CHLTeam[],
  rosterMap: Record<number, CHLPlayer[]>
): Record<number, CHLPlayer> => {
  const playerMap: Record<number, CHLPlayer> = {};

  for (let i = 0; i < chlTeams.length; i++) {
    const teamID = chlTeams[i].ID;
    const roster = rosterMap[teamID];
    if (!roster) continue;
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

type HCKSeasonStats = CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats;
export const isSeasonStats = (s: any): s is HCKSeasonStats => {
  return typeof s.StatType === "number" && typeof s.GamesPlayed === "number";
};

export const MakeFBASeasonsOptionList = (ts: FBATimestamp) => {
  const seasonsList = [];
  for (let i = 1; i <= ts.CollegeSeasonID; i++) {
    const iterativeSeason = 2020 + i;
    const seasonLabel = `${iterativeSeason}`;
    const option = { label: seasonLabel, value: i.toString() };
    seasonsList.push(option);
  }
  return seasonsList;
};

export const MakeFBAWeeksOptionList = (seasonID: number) => {
  const weeksList = [];

  for (let i = 0; i <= BASE_FBA_WEEKS_IN_SEASON; i++) {
    const weekID = getFBAWeekID(i, seasonID);
    const weekLabel = `Week ${i}`;
    const option = { label: weekLabel, value: weekID.toString() };
    weeksList.push(option);
  }

  return weeksList;
};

export const MakeBBASeasonsOptionList = (ts: BBATimestamp) => {
  const seasonsList = [];
  for (let i = 1; i <= ts.SeasonID; i++) {
    const iterativeSeason = 2020 + i;
    const seasonLabel = `${iterativeSeason}`;
    const option = { label: seasonLabel, value: i.toString() };
    seasonsList.push(option);
  }
  return seasonsList;
};

export const MakeBBAWeeksOptionList = (seasonID: number) => {
  const weeksList = [];

  for (let i = 1; i <= BASE_HCK_WEEKS_IN_SEASON; i++) {
    const weekID = getFBAWeekID(i, seasonID);
    const weekLabel = `Week ${i}`;
    const option = { label: weekLabel, value: weekID.toString() };
    weeksList.push(option);
  }

  return weeksList;
};

export const getFBAWeekID = (week: number, seasonID: number) => {
  const season = seasonID + BASE_FBA_SEASON;
  const diffSeason = season - 2000;
  return diffSeason * 100 + week;
};

export const getFBADisplayWeek = (weekID: number, season: number) => {
  const diffSeason = season - 2000;
  const baseWeekDiff = diffSeason * 100;
  return weekID - baseWeekDiff;
};

export const MakeCFBPlayerMapFromRosterMap = (
  cfbTeams: CFBTeam[],
  rosterMap: Record<number, CFBPlayer[]>
): Record<number, CFBPlayer> => {
  const playerMap: Record<number, CFBPlayer> = {};

  for (let i = 0; i < cfbTeams.length; i++) {
    const teamID = cfbTeams[i].ID;
    const roster = rosterMap[teamID];
    if (!roster) continue;
    for (let j = 0; j < roster.length; j++) {
      const player = roster[j];
      playerMap[player.ID] = player;
    }
  }

  const unsignedPlayers = rosterMap[0];
  if (unsignedPlayers) {
    for (let i = 0; i < unsignedPlayers.length; i++) {
      const player = unsignedPlayers[i];
      playerMap[player.ID] = player;
    }
  }

  return playerMap;
};

export const MakeNFLPlayerMapFromRosterMap = (
  nflTeams: NFLTeam[],
  rosterMap: Record<number, NFLPlayer[]>
): Record<number, NFLPlayer> => {
  const playerMap: Record<number, NFLPlayer> = {};

  for (let i = 0; i < nflTeams.length; i++) {
    const teamID = nflTeams[i].ID;
    const roster = rosterMap[teamID];
    if (!roster) continue;
    for (let j = 0; j < roster.length; j++) {
      const player = roster[j];
      playerMap[player.ID] = player;
    }
  }

  const unsignedPlayers = rosterMap[0];
  if (unsignedPlayers) {
    for (let i = 0; i < unsignedPlayers.length; i++) {
      const player = unsignedPlayers[i];
      playerMap[player.ID] = player;
    }
  }

  return playerMap;
};

export const GetFBACollegeStats = (
  statsView: StatsView,
  statsType: StatsType,
  week: number,
  season: number,
  cfbPlayerGameStatsMap: Record<number, CFBPlayerStats[]>,
  cfbPlayerSeasonStatsMap: Record<number, CFBPlayerSeasonStats[]>,
  cfbTeamGameStatsMap: Record<number, CollegeTeamStats[]>,
  cfbTeamSeasonStatsMap: Record<number, CollegeTeamSeasonStats[]>
) => {
  if (statsView === WEEK_VIEW) {
    if (statsType === PLAYER_VIEW) {
      const slateOfStats = cfbPlayerGameStatsMap[week] || [];
      if (slateOfStats.length > 0) {
        return slateOfStats;
      }
      return [];
    }
    const slateOfStats = cfbTeamGameStatsMap[week] || [];
    if (slateOfStats.length > 0) {
      return slateOfStats;
    }
    return [];
  }
  if (statsType === PLAYER_VIEW) {
    return cfbPlayerSeasonStatsMap[season] || [];
  }
  return cfbTeamSeasonStatsMap[season] || [];
};

export const GetFBAProStats = (
  statsView: StatsView,
  statsType: StatsType,
  week: number,
  season: number,
  nflPlayerGameStatsMap: Record<number, NFLPlayerStats[]>,
  nflPlayerSeasonStatsMap: Record<number, NFLPlayerSeasonStats[]>,
  nflTeamGameStatsMap: Record<number, NFLTeamStats[]>,
  nflTeamSeasonStatsMap: Record<number, NFLTeamSeasonStats[]>
) => {
  if (statsView === WEEK_VIEW) {
    if (statsType === PLAYER_VIEW) {
      const slateOfStats = nflPlayerGameStatsMap[week] || [];
      if (slateOfStats.length > 0) {
        return slateOfStats;
      }
      return [];
    }
    const slateOfStats = nflTeamGameStatsMap[week] || [];
    if (slateOfStats.length > 0) {
      return slateOfStats;
    }
    return [];
  }
  if (statsType === PLAYER_VIEW) {
    return nflPlayerSeasonStatsMap[season] || [];
  }
  return nflTeamSeasonStatsMap[season] || [];
};

export const useFilteredFootballStats = ({
  selectedStats,
  selectedTeams,
  selectedConferences,
  teamMap,
  playerMap,
  statsType,
  footballStatsType,
  selectedLeague,
  selectedLeagueOption,
}: {
  selectedStats: any[];
  selectedTeams: string[];
  selectedConferences: string[];
  teamMap: Record<number, { ConferenceID: number; IsFBS?: boolean }>;
  playerMap: Record<number, { Position: string }>;
  statsType: StatsType;
  footballStatsType: FootballStatsType;
  selectedLeague: string;
  selectedLeagueOption: number;
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

      // 3) Player‐view
      if (statsType === PLAYER_VIEW) {
        const id =
          selectedLeague === SimCFB ? stat.CollegePlayerID : stat.NFLPlayerID;
        const player = playerMap[id];
        if (!player) return false;
        if (selectedLeague === SimCFB) {
          const team = teamMap[stat.TeamID];
          if (selectedLeagueOption === 2 && !team.IsFBS) {
            return false;
          }
          if (selectedLeagueOption === 3 && team.IsFBS) {
            return false;
          }
        }
        // Maybe filter by stat type
        // (pass, rush, receiving, defense, special teams, OLine)

        if (footballStatsType === PASSING) {
          return (
            ["QB", "ATH"].includes(player.Position) && stat.PassAttempts > 0
          );
        }
        if (footballStatsType === RUSHING) {
          return (
            ["RB", "FB", "QB", "ATH"].includes(player.Position) &&
            stat.RushAttempts > 0
          );
        }
        if (footballStatsType === RECEIVING) {
          return (
            ["RB", "FB", "WR", "TE", "ATH"].includes(player.Position) &&
            stat.Targets > 0
          );
        }
        if (footballStatsType === DEFENSE) {
          return (
            ["DT", "DE", "OLB", "ILB", "CB", "FS", "SS", "ATH"].includes(
              player.Position
            ) && stat.Snaps > 0
          );
        }
        if (footballStatsType === OLINE) {
          return ["OT", "OG", "C", "ATH"].includes(player.Position);
        }
        if (footballStatsType === RETURN) {
          return stat.KickReturns > 0 || stat.PuntReturns > 0;
        }
        if (footballStatsType === SPECIAL_TEAMS) {
          return (
            stat.FGAttempts > 0 ||
            stat.ExtraPointsAttempted > 0 ||
            stat.Punts > 0
          );
        }
      }

      if (statsType === TEAM_VIEW) {
        const id = stat.TeamID;
        const team = teamMap[id];
        if (!team) return false;
        if (selectedLeague === SimCFB) {
          const team = teamMap[stat.TeamID];
          if (selectedLeagueOption === 2 && !team.IsFBS) {
            return false;
          }
          if (selectedLeagueOption === 3 && team.IsFBS) {
            return false;
          }
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
    selectedLeagueOption,
    selectedLeague,
    footballStatsType,
  ]);

  return filtered;
};

type FBASeasonStats = CFBPlayerSeasonStats | NFLPlayerSeasonStats;
export const isFBASeasonStats = (s: any): s is FBASeasonStats => {
  return typeof s.StatType === "number" && typeof s.GamesPlayed === "number";
};

export const GetFilteredCFBTeamOptions = (
  selectedLeagueOption: number,
  cfbTeamOptions: { label: string; value: string }[],
  teamMap: Record<number, CollegeTeam>
) => {
  const optionsList = [];
  for (let i = 0; i < cfbTeamOptions.length; i++) {
    const opt = cfbTeamOptions[i];
    const teamID = Number(opt.value);
    const team = teamMap[teamID];
    if (
      (selectedLeagueOption === 2 && team.IsFBS) ||
      (selectedLeagueOption === 3 && !team.IsFBS)
    ) {
      optionsList.push(opt);
    }
  }
  return optionsList;
};

export const GetFilteredCFBConferenceOptions = (
  selectedLeagueOption: number,
  cfbConferenceOptions: { label: string; value: string }[],
  cfbTeams: CollegeTeam[]
) => {
  const optionsMap: any = {};
  const selectedMap: any = {};
  for (let i = 0; i < cfbConferenceOptions.length; i++) {
    const opt = cfbConferenceOptions[i];
    const confID = Number(opt.value);
    optionsMap[confID] = opt;
  }

  const optionsList = [];
  for (let i = 0; i < cfbTeams.length; i++) {
    const team = cfbTeams[i];
    if (
      (selectedLeagueOption === 2 && team.IsFBS) ||
      (selectedLeagueOption === 3 && !team.IsFBS)
    ) {
      const conf = optionsMap[team.ConferenceID];
      if (selectedMap[team.ConferenceID]) {
        continue;
      }
      selectedMap[team.ConferenceID] = true;
      optionsList.push(conf);
    }
  }
  return optionsList;
};

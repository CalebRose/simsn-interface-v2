import { useEffect, useState } from "react";
import {
  CollegeStandings,
  NFLStandings,
  CollegeGame,
  NFLGame,
  CollegeTeam,
  NFLTeam,
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../../../models/footballModels";
import {
  CollegeStandings as CHLStandings,
  ProfessionalStandings as PHLStandings,
  CollegeGame as CHLGame,
  ProfessionalGame as PHLGame,
  CollegeTeam as CHLTeam,
  ProfessionalTeam as PHLTeam,
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
} from "../../../models/hockeyModels";
import { League } from "../../../_constants/constants";
import { RevealResults, RevealHCKResults } from "../../../_helper/teamHelper";
import { getLogo } from "../../../_utility/getLogo";
import {
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  Divisions,
  CHLConferenceNames,
  PHLConferenceNames,
  PHLDivisionNames,
} from "../../../_constants/constants";
import {
  ThursdayNight,
  FridayNight,
  SaturdayMorning,
  SaturdayAfternoon,
  SaturdayEvening,
  SaturdayNight,
  ThursdayNightFootball,
  SundayNoon,
  SundayAfternoon,
  SundayNightFootball,
  MondayNightFootball,
} from "../../../_constants/constants";
import { useCurrentUser } from "../../../_hooks/useCurrentUser";

export const getScheduleCFBData = (
  team: any,
  currentWeek: any,
  selectedWeek: any,
  selectedSeason: any,
  league: League,
  allCFBStandings: CollegeStandings[],
  allCollegeGames: CollegeGame[],
  allCollegeTeams: CollegeTeam[]
) => {
  // Team Standings
  const teamStandings = allCFBStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  const teamAbbrMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.TeamAbbr])
  );

  const teamNameMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.TeamName])
  );

  const teamMascotMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.Mascot])
  );

  // Team Schedule
  const teamSchedule = allCollegeGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    }));

  // Weekly Games
  const groupedWeeklyGames = allCollegeGames.reduce((acc: any, game) => {
    if (!acc[game.Week]) {
      acc[game.Week] = [];
    }
    acc[game.Week].push({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    });
    return acc;
  }, {});

  return {
    teamStandings,
    teamSchedule,
    groupedWeeklyGames,
  };
};

export const getScheduleNFLData = (
  team: any,
  currentWeek: any,
  selectedWeek: any,
  selectedSeason: any,
  league: League,
  allNFLStandings: NFLStandings[],
  allNFLGames: NFLGame[],
  allNFLTeams: NFLTeam[]
) => {
  // Team Standings
  const teamStandings = allNFLStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  const teamAbbrMap = new Map(
    allNFLTeams.map((team) => [team.ID, team.TeamAbbr])
  );

  const teamNameMap = new Map(
    allNFLTeams.map((team) => [team.ID, team.TeamName])
  );

  const teamMascotMap = new Map(
    allNFLTeams.map((team) => [team.ID, team.Mascot])
  );

  // Team Schedule
  const teamSchedule = allNFLGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    }));

  // Weekly Games
  const groupedWeeklyGames = allNFLGames.reduce((acc: any, game) => {
    if (!acc[game.Week]) {
      acc[game.Week] = [];
    }
    acc[game.Week].push({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    });
    return acc;
  }, {});

  return {
    teamStandings,
    teamSchedule,
    groupedWeeklyGames,
    teamAbbrMap,
  };
};

export const getScheduleCHLData = (
  team: any,
  currentWeek: any,
  selectedWeek: any,
  selectedSeason: any,
  league: League,
  allCHLStandings: CHLStandings[],
  allCollegeGames: CHLGame[],
  allCollegeTeams: CHLTeam[]
) => {
  // Team Standings
  const teamStandings = allCHLStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({
      ...standings,
      TeamAbbr: standings.TeamName,
      Rank: index + 1,
    }));

  const teamAbbrMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.Abbreviation])
  );

  const teamNameMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.TeamName])
  );

  const teamMascotMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.Mascot])
  );

  // Team Schedule
  const teamSchedule = allCollegeGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    }));

  // Weekly Games
  const groupedWeeklyGames = allCollegeGames.reduce((acc: any, game) => {
    if (!acc[game.Week]) {
      acc[game.Week] = [];
    }
    acc[game.Week].push({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    });
    return acc;
  }, {});

  return {
    teamStandings,
    teamSchedule,
    groupedWeeklyGames,
  };
};

export const getSchedulePHLData = (
  team: any,
  currentWeek: any,
  selectedWeek: any,
  selectedSeason: any,
  league: League,
  allPHLStandings: PHLStandings[],
  allPHLGames: PHLGame[],
  allPHLTeams: PHLTeam[]
) => {
  // Team Standings
  const teamStandings = allPHLStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({
      ...standings,
      TeamAbbr: standings.TeamName,
      Rank: index + 1,
    }));

  const teamAbbrMap = new Map(
    allPHLTeams.map((team) => [team.ID, team.Abbreviation])
  );

  const teamNameMap = new Map(
    allPHLTeams.map((team) => [team.ID, team.TeamName])
  );

  const teamMascotMap = new Map(
    allPHLTeams.map((team) => [team.ID, team.Mascot])
  );

  // Team Schedule
  const teamSchedule = allPHLGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    }));

  // Weekly Games
  const groupedWeeklyGames = allPHLGames.reduce((acc: any, game) => {
    if (!acc[game.Week]) {
      acc[game.Week] = [];
    }
    acc[game.Week].push({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
      HomeTeamName: teamNameMap.get(game.HomeTeamID),
      HomeTeamMascot: teamMascotMap.get(game.HomeTeamID),
      AwayTeamName: teamNameMap.get(game.AwayTeamID),
      AwayTeamMascot: teamMascotMap.get(game.AwayTeamID),
      HomeTeamLogo: getLogo(league, game.HomeTeamID, false),
      AwayTeamLogo: getLogo(league, game.AwayTeamID, false),
    });
    return acc;
  }, {});

  return {
    teamStandings,
    teamSchedule,
    groupedWeeklyGames,
  };
};

export const processSchedule = (
  schedule: any[],
  team: any,
  ts: any,
  league: League,
  resultsOverride: boolean
) => {
  let weekCounter: { [key: number]: number } = {};
  return schedule.map((game) => {
    let revealResult = false;
    if (league === SimCHL || league === SimPHL) {
      revealResult = RevealHCKResults(game, ts, resultsOverride);
    } else {
      revealResult = RevealResults(game, ts, league, resultsOverride);
    }

    const isHomeGame = game.HomeTeamID === team.ID;
    const opponentLabel = isHomeGame ? game.AwayTeamAbbr : game.HomeTeamAbbr;
    const opponentLogo = getLogo(
      league,
      isHomeGame ? game.AwayTeamID : game.HomeTeamID,
      false
    );
    const userLogo = getLogo(
      league,
      isHomeGame ? game.HomeTeamID : game.AwayTeamID,
      false
    );

    const opponentID = isHomeGame ? game.AwayTeamID : game.HomeTeamID;

    let userWin = false;
    let userLoss = false;
    let gameScore = "TBC";
    let headerGameScore = "TBC";
    const shootoutScore =
      game.HomeTeamShootoutScore + game.AwayTeamShootoutScore;
    let isShootout = shootoutScore > 0 ? true : false;
    let userShootoutScore;
    let opponentShootoutScore;

    if (revealResult) {
      const userTeamScore = isHomeGame
        ? game.HomeTeamScore
        : game.AwayTeamScore;
      const opponentScore = isHomeGame
        ? game.AwayTeamScore
        : game.HomeTeamScore;

      if (isShootout) {
        userShootoutScore = isHomeGame
          ? game.HomeTeamShootoutScore
          : game.AwayTeamShootoutScore;
        opponentShootoutScore = isHomeGame
          ? game.AwayTeamShootoutScore
          : game.HomeTeamShootoutScore;

        userWin = userShootoutScore > opponentShootoutScore;
        userLoss = userShootoutScore < opponentShootoutScore;
      } else {
        userWin = userTeamScore > opponentScore;
        userLoss = userTeamScore < opponentScore;
      }

      if (
        game.HomeTeamScore === 0 &&
        game.AwayTeamScore === 0 &&
        game.HomeTeamShootoutScore === 0 &&
        game.AwayTeamShootoutScore === 0
      ) {
        gameScore = "TBC";
        headerGameScore = "TBC";
      } else if (
        game.HomeTeamShootoutScore > 0 ||
        game.AwayTeamShootoutScore > 0
      ) {
        gameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore} (${game.HomeTeamShootoutScore} - ${game.AwayTeamShootoutScore})`;
        headerGameScore = `${userTeamScore} - ${opponentScore} (${userShootoutScore} - ${opponentShootoutScore})`;
      } else {
        gameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore}`;
        headerGameScore = `${userTeamScore} - ${opponentScore}`;
      }
    }

    let weekLabel = `${game.Week}`;
    if (league === SimCHL || league === SimPHL) {
      if (!weekCounter[game.Week]) {
        weekCounter[game.Week] = 0;
      }
      weekCounter[game.Week] += 1;

      const suffix =
        league === SimCHL
          ? weekCounter[game.Week] === 1
            ? "A"
            : "B"
          : weekCounter[game.Week] === 1
          ? "A"
          : weekCounter[game.Week] === 2
          ? "B"
          : "C";

      weekLabel += suffix;
    }

    return {
      ...game,
      opponentLabel,
      opponentLogo,
      userLogo,
      userWin,
      userLoss,
      gameScore,
      headerGameScore,
      gameLocation: isHomeGame ? "vs" : "@",
      weekLabel,
      opponentID,
    };
  });
};

export const processWeeklyGames = (
  schedule: any[],
  ts: any,
  league: League,
  resultsOverride: boolean
) => {
  const sortGames = (games: any[]) => {
    if (league === SimCHL || league === SimPHL) {
      return games.sort((a, b) => (a.GameDay > b.GameDay ? 1 : -1));
    }
    if (league === SimCFB || league === SimNFL) {
      return sortFootballGames(games, league);
    }
    return games;
  };

  const processedGames = schedule.map((game) => {
    const revealResult =
      league === SimCHL || league === SimPHL
        ? RevealHCKResults(game, ts, resultsOverride)
        : RevealResults(game, ts, league, resultsOverride);

    const homeTeamLogo = getLogo(league, game.HomeTeamID, false);
    const awayTeamLogo = getLogo(league, game.AwayTeamID, false);
    let gameScore = "TBC";
    let headerGameScore = "TBC";
    if (revealResult) {
      if (
        game.HomeTeamScore === 0 &&
        game.AwayTeamScore === 0 &&
        game.HomeTeamShootoutScore === 0 &&
        game.AwayTeamShootoutScore === 0
      ) {
        gameScore = "TBC";
        headerGameScore = "TBC";
      } else if (
        game.HomeTeamShootoutScore > 0 ||
        game.AwayTeamShootoutScore > 0
      ) {
        gameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore} (${game.HomeTeamShootoutScore} - ${game.AwayTeamShootoutScore})`;
        headerGameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore} (${game.HomeTeamShootoutScore} - ${game.AwayTeamShootoutScore})`;
      } else {
        gameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore}`;
        headerGameScore = `${game.HomeTeamScore} - ${game.AwayTeamScore}`;
      }
    }

    return {
      ...game,
      homeTeam: {
        id: game.HomeTeamID,
        abbr: game.HomeTeamAbbr,
        logo: homeTeamLogo,
      },
      awayTeam: {
        id: game.AwayTeamID,
        abbr: game.AwayTeamAbbr,
        logo: awayTeamLogo,
      },
      gameScore,
      headerGameScore,
    };
  });
  return sortGames(processedGames);
};

export const processLeagueStandings = (
  standings: any[],
  customOrder: string[],
  league: League,
  category?: string
) => {
  if (league === SimCHL) {
    standings = standings.map((team) => {
      const conference = CHLConferenceNames.find(
        (conf) => conf.value === team.ConferenceID.toString()
      );
      return {
        ...team,
        ConferenceName: conference ? conference.name : "Unknown",
      };
    });
  } else if (league === SimPHL) {
    if (category === Divisions) {
      standings = standings.map((team) => {
        const division = PHLDivisionNames.find(
          (div) => div.value === team.DivisionID.toString()
        );
        return {
          ...team,
          DivisionName: division ? division.name : "Unknown",
        };
      });
    } else {
      standings = standings.map((team) => {
        const conference = PHLConferenceNames.find(
          (conf) => conf.value === team.ConferenceID.toString()
        );
        return {
          ...team,
          ConferenceName: conference ? conference.name : "Unknown",
        };
      });
    }
  } else if (league === SimNFL) {
    if (category === Divisions) {
      standings = standings.map((team) => ({
        ...team,
        GroupKey: `${team.ConferenceName} ${team.DivisionName}`,
      }));
    }
  }

  const groupedStandings = standings.reduce((acc: any, team) => {
    const groupKey =
      league === SimNFL && category === Divisions
        ? team.GroupKey
        : category === Divisions
        ? team.DivisionName
        : team.ConferenceName;

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(team);
    return acc;
  }, {});

  const sortedGroupNames = Object.keys(groupedStandings).sort((a, b) => {
    const indexA = customOrder.indexOf(a);
    const indexB = customOrder.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.localeCompare(b);
  });

  return { groupedStandings, sortedGroupNames };
};

const sortFootballGames = (games: any[], league: League) => {
  const cfbPriority: Record<string, number> = {
    [ThursdayNight]: 1,
    [FridayNight]: 2,
    [SaturdayMorning]: 3,
    [SaturdayAfternoon]: 4,
    [SaturdayEvening]: 5,
    [SaturdayNight]: 6,
  };

  const nflPriority: Record<string, number> = {
    [ThursdayNightFootball]: 1,
    [SundayNoon]: 2,
    [SundayAfternoon]: 3,
    [SundayNightFootball]: 4,
    [MondayNightFootball]: 5,
  };

  const priorityMap = league === SimCFB ? cfbPriority : nflPriority;

  return games.sort((a, b) => {
    const priorityA = priorityMap[a.TimeSlot as string] || 999;
    const priorityB = priorityMap[b.TimeSlot as string] || 999;

    if (priorityA === priorityB) {
      return games.indexOf(a) - games.indexOf(b);
    }

    return priorityA - priorityB;
  });
};

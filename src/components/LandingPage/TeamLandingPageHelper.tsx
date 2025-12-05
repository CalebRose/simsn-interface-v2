import { useMemo } from "react";
import {
  CollegeStandings,
  NFLStandings,
  Notification,
  CollegeGame,
  NFLGame,
  CollegeTeam,
  NFLTeam,
  CollegePlayer,
  NFLPlayer,
  NewsLog,
} from "../../models/footballModels";
import {
  CollegeStandings as CBBStandings,
  NBAStandings,
  Notification as BasketballNotification,
  Match as CBBMatch,
  NBAMatch as NBAMatch,
  Team as CBBTeam,
  NBATeam,
  CollegePlayer as CBBPlayer,
  NBAPlayer,
  NewsLog as BasketballNewsLog,
  Timestamp,
} from "../../models/basketballModels";
import {
  CollegeStandings as CHLStandings,
  ProfessionalStandings as PHLStandings,
  Notification as HockeyNotification,
  CollegeGame as CHLGame,
  ProfessionalGame as PHLGame,
  CollegeTeam as CHLTeam,
  ProfessionalTeam as PHLTeam,
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
  NewsLog as HockeyNewsLog,
  Timestamp as HCKTimestamp,
} from "../../models/hockeyModels";

import { getLogo } from "../../_utility/getLogo";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { ConvertTimeOnIce, GetNextGameDay } from "../../_helper/utilHelper";

export const getLandingCFBData = (
  team: any,
  currentWeek: any,
  league: League,
  currentUser: any,
  allCFBStandings: CollegeStandings[],
  collegeNotifications: Notification[],
  allCollegeGames: CollegeGame[],
  allCollegeTeams: CollegeTeam[],
  topCFBPassers: CollegePlayer[],
  topCFBRushers: CollegePlayer[],
  topCFBReceivers: CollegePlayer[],
  collegeNews: NewsLog[],
  cfbRosterMap: Record<number, CollegePlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allCFBStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = collegeNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(
    allCollegeTeams.map((team) => [team.ID, team.TeamAbbr])
  );
  let foundMatch: CollegeGame[] | null = null;
  let gameWeek = currentWeek;

  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allCollegeGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allCollegeGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // Team Stats
  const userPassers = topCFBPassers.filter((p) => p.TeamID === team.ID);
  const userRushers = topCFBRushers.filter((r) => r.TeamID === team.ID);
  const userReceivers = topCFBReceivers.filter((rcv) => rcv.TeamID === team.ID);
  const topPasser = userPassers.length > 0 ? userPassers[0] : null;
  const topRusher = userRushers.length > 0 ? userRushers[0] : null;
  const topReceiver = userReceivers.length > 0 ? userReceivers[0] : null;

  const teamInjuries = useMemo(() => {
    if (cfbRosterMap && team.ID) {
      return cfbRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [cfbRosterMap, team.ID]);

  const teamStats = {
    TopPasser: topPasser,
    TopRusher: topRusher,
    TopReceiver: topReceiver,
  };

  // Team News
  const teamNews = collegeNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamNotifications,
    teamMatchUp,
    gameWeek,
    teamSchedule,
    homeLogo,
    awayLogo,
    homeLabel,
    awayLabel,
    teamStats,
    teamNews,
    teamInjuries,
  };
};

export const getLandingNFLData = (
  team: any,
  currentWeek: any,
  league: League,
  currentUser: any,
  allProStandings: NFLStandings[],
  proNotifications: Notification[],
  allProGames: NFLGame[],
  allProTeams: NFLTeam[],
  topNFLPassers: NFLPlayer[],
  topNFLRushers: NFLPlayer[],
  topNFLReceivers: NFLPlayer[],
  proNews: NewsLog[],
  proRosterMap: Record<number, NFLPlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allProStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = proNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(
    allProTeams.map((team) => [team.ID, team.TeamAbbr])
  );
  let foundMatch: NFLGame[] | null = null;
  let gameWeek = currentWeek;

  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allProGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allProGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // Team Stats
  const userPassers = topNFLPassers.filter((p) => p.TeamID === team.ID);
  const userRushers = topNFLRushers.filter((r) => r.TeamID === team.ID);
  const userReceivers = topNFLReceivers.filter((rcv) => rcv.TeamID === team.ID);
  const topPasser = userPassers.length > 0 ? userPassers[0] : null;
  const topRusher = userRushers.length > 0 ? userRushers[0] : null;
  const topReceiver = userReceivers.length > 0 ? userReceivers[0] : null;

  const teamStats = {
    TopPasser: topPasser,
    TopRusher: topRusher,
    TopReceiver: topReceiver,
  };

  // Team Injuries
  const teamInjuries = useMemo(() => {
    if (proRosterMap && team.ID) {
      return proRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [proRosterMap, team.ID]);

  // Team News
  const teamNews = proNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamNotifications,
    teamMatchUp,
    gameWeek,
    teamSchedule,
    homeLogo,
    awayLogo,
    homeLabel,
    awayLabel,
    teamStats,
    teamNews,
    teamInjuries,
  };
};

export const getLandingCBBData = (
  team: any,
  currentWeek: any,
  timestamp: Timestamp,
  league: League,
  currentUser: any,
  allCBBStandings: CBBStandings[],
  cbbNotifications: BasketballNotification[],
  allCBBGames: CBBMatch[],
  allCBBTeams: CBBTeam[],
  topCBBPoints: CBBPlayer[],
  topCBBAssists: CBBPlayer[],
  topCBBRebounds: CBBPlayer[],
  cbbNews: BasketballNewsLog[],
  cbbRosterMap: Record<number, CBBPlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allCBBStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = cbbNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(allCBBTeams.map((team) => [team.ID, team.Abbr]));
  const nextGameDay = GetNextGameDay(
    timestamp.GamesARan,
    timestamp.GamesBRan,
    timestamp.GamesCRan
  );
  let foundMatch: CBBMatch[] | null = null;
  let gameWeek = currentWeek;

  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allCBBGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek &&
        game.MatchOfWeek === nextGameDay
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allCBBGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // Team Stats
  const userPoints = topCBBPoints.filter((p) => p.TeamID === team.ID);
  const userAssists = topCBBAssists.filter((r) => r.TeamID === team.ID);
  const userRebounds = topCBBRebounds.filter((rcv) => rcv.TeamID === team.ID);
  const topPoints = userPoints.length > 0 ? userPoints[0] : null;
  const topAssists = userAssists.length > 0 ? userAssists[0] : null;
  const topRebounds = userRebounds.length > 0 ? userRebounds[0] : null;

  const teamStats = {
    TopPoints: topPoints,
    TopAssists: topAssists,
    TopRebounds: topRebounds,
  };

  // Team Injuries
  const teamInjuries = useMemo(() => {
    if (cbbRosterMap && team.ID) {
      return cbbRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [cbbRosterMap, team.ID]);

  // Team News
  const teamNews = cbbNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamNotifications,
    teamMatchUp,
    gameWeek,
    teamSchedule,
    homeLogo,
    awayLogo,
    homeLabel,
    awayLabel,
    teamStats,
    teamNews,
    teamInjuries,
  };
};

export const getLandingNBAData = (
  team: any,
  currentWeek: any,
  timestamp: Timestamp,
  league: League,
  currentUser: any,
  allNBAStandings: NBAStandings[],
  nbaNotifications: BasketballNotification[],
  allNBAGames: NBAMatch[],
  allNBATeams: NBATeam[],
  topNBAPoints: NBAPlayer[],
  topNBAAssists: NBAPlayer[],
  topNBARebounds: NBAPlayer[],
  nbaNews: BasketballNewsLog[],
  nbaRosterMap: Record<number, NBAPlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allNBAStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = nbaNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(allNBATeams.map((team) => [team.ID, team.Abbr]));
  const nextGameDay = GetNextGameDay(
    timestamp.GamesARan,
    timestamp.GamesBRan,
    timestamp.GamesCRan
  );
  let foundMatch: NBAMatch[] | null = null;
  let gameWeek = currentWeek;

  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allNBAGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek &&
        game.MatchOfWeek === nextGameDay
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allNBAGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // Team Stats
  const userPoints = topNBAPoints.filter((p) => p.TeamID === team.ID);
  const userAssists = topNBAAssists.filter((r) => r.TeamID === team.ID);
  const userRebounds = topNBARebounds.filter((rcv) => rcv.TeamID === team.ID);
  const topPoints = userPoints.length > 0 ? userPoints[0] : null;
  const topAssists = userAssists.length > 0 ? userAssists[0] : null;
  const topRebounds = userRebounds.length > 0 ? userRebounds[0] : null;

  const teamStats = {
    TopPoints: topPoints,
    TopAssists: topAssists,
    TopRebounds: topRebounds,
  };

  // Team Injuries
  const teamInjuries = useMemo(() => {
    if (nbaRosterMap && team.ID) {
      return nbaRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [nbaRosterMap, team.ID]);

  // Team News
  const teamNews = nbaNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamNotifications,
    teamMatchUp,
    gameWeek,
    teamSchedule,
    homeLogo,
    awayLogo,
    homeLabel,
    awayLabel,
    teamStats,
    teamNews,
    teamInjuries,
  };
};

export const getLandingCHLData = (
  team: any,
  currentWeek: any,
  timestamp: HCKTimestamp,
  league: League,
  currentUser: any,
  allCHLStandings: CHLStandings[],
  chlNotifications: HockeyNotification[],
  allCHLGames: CHLGame[],
  chlTeams: CHLTeam[],
  chlNews: HockeyNewsLog[],
  topCHLGoals: CHLPlayer[],
  topCHLAssists: CHLPlayer[],
  topCHLSaves: CHLPlayer[],
  chlRosterMap: Record<number, CHLPlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allCHLStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = chlNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(
    chlTeams.map((team) => [team.ID, team.Abbreviation])
  );
  const nextGameDay = GetNextGameDay(
    timestamp.GamesARan,
    timestamp.GamesBRan,
    timestamp.GamesCRan
  );
  let foundMatch: CHLGame[] | null = null;
  let gameWeek = currentWeek;

  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allCHLGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek &&
        game.GameDay === nextGameDay
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allCHLGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // Team Stats
  const userSaves = topCHLSaves.filter((p) => p.TeamID === team.ID);
  const userGoals = topCHLGoals.filter((r) => r.TeamID === team.ID);
  const userAssists = topCHLAssists.filter((rcv) => rcv.TeamID === team.ID);
  const topSaves = userSaves.length > 0 ? userSaves[0] : null;
  const topGoals = userGoals.length > 0 ? userGoals[0] : null;
  const topAssists = userAssists.length > 0 ? userAssists[0] : null;

  const teamStats = {
    TopSaves: topSaves,
    TopGoals: topGoals,
    TopAssists: topAssists,
  };

  // Team Injuries
  const teamInjuries = useMemo(() => {
    if (chlRosterMap && team.ID) {
      return chlRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [chlRosterMap, team.ID]);

  // Team News
  const teamNews = chlNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamMatchUp,
    teamNotifications,
    teamSchedule,
    homeLogo,
    homeLabel,
    awayLogo,
    awayLabel,
    teamNews,
    gameWeek,
    teamStats,
    teamInjuries,
  };
};

export const getLandingPHLData = (
  team: any,
  currentWeek: any,
  timestamp: HCKTimestamp,
  league: League,
  currentUser: any,
  allPHLStandings: PHLStandings[],
  phlNotifications: HockeyNotification[],
  allPHLGames: PHLGame[],
  phlTeams: PHLTeam[],
  phlNews: HockeyNewsLog[],
  topPHLGoals: PHLPlayer[],
  topPHLAssists: PHLPlayer[],
  topPHLSaves: PHLPlayer[],
  phlRosterMap: Record<number, PHLPlayer[]> | null
) => {
  // Team Standings
  const teamStandings = allPHLStandings
    .filter((standings) => standings.ConferenceID === team.ConferenceID)
    .map((standings, index) => ({ ...standings, Rank: index + 1 }));

  // Team Notifications
  const teamNotifications = phlNotifications
    .filter((notification) => notification.TeamID === team.ID)
    .reverse();

  // Team Match-Up
  const teamAbbrMap = new Map(
    phlTeams.map((team) => [team.ID, team.Abbreviation])
  );
  let foundMatch: PHLGame[] | null = null;
  let gameWeek = currentWeek;
  const nextGameDay = GetNextGameDay(
    timestamp.GamesARan,
    timestamp.GamesBRan,
    timestamp.GamesCRan
  );
  for (let weekOffset = 0; weekOffset <= 10; weekOffset++) {
    const testWeek = currentWeek + weekOffset;
    const nextMatch = allPHLGames.filter(
      (game) =>
        (game.HomeTeamID === team.ID || game.AwayTeamID === team.ID) &&
        game.Week === testWeek &&
        game.GameDay === nextGameDay
    );

    if (nextMatch.length > 0) {
      foundMatch = nextMatch;
      gameWeek = testWeek;
      break;
    }
  }

  const teamMatchUp = foundMatch || [];
  let homeLogo = "";
  let awayLogo = "";
  let homeLabel = "";
  let awayLabel = "";
  let gameLocation = "";

  if (teamMatchUp.length > 0) {
    const isUserTeamHome = teamMatchUp[0].HomeTeamID === team.ID;

    homeLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].HomeTeamID : teamMatchUp[0].AwayTeamID,
      currentUser?.isRetro
    );
    awayLogo = getLogo(
      league,
      isUserTeamHome ? teamMatchUp[0].AwayTeamID : teamMatchUp[0].HomeTeamID,
      currentUser?.isRetro
    );

    homeLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown";
    awayLabel = isUserTeamHome
      ? teamAbbrMap.get(teamMatchUp[0].AwayTeamID) || "Unknown"
      : teamAbbrMap.get(teamMatchUp[0].HomeTeamID) || "Unknown";

    gameLocation = isUserTeamHome ? "VS" : "AT";
  }

  // Team Schedule
  const teamSchedule = allPHLGames
    .filter(
      (game) => game.HomeTeamID === team.ID || game.AwayTeamID === team.ID
    )
    .map((game) => ({
      ...game,
      HomeTeamAbbr: teamAbbrMap.get(game.HomeTeamID),
      AwayTeamAbbr: teamAbbrMap.get(game.AwayTeamID),
    }));

  // // Team Stats
  const userSaves = topPHLSaves.filter((p) => p.TeamID === team.ID);
  const userGoals = topPHLGoals.filter((r) => r.TeamID === team.ID);
  const userAssists = topPHLAssists.filter((rcv) => rcv.TeamID === team.ID);
  const topSaves = userSaves.length > 0 ? userSaves[0] : null;
  const topGoals = userGoals.length > 0 ? userGoals[0] : null;
  const topAssists = userAssists.length > 0 ? userAssists[0] : null;

  const teamStats = {
    TopSaves: topSaves,
    TopGoals: topGoals,
    TopAssists: topAssists,
  };

  // Team Injuries
  const teamInjuries = useMemo(() => {
    if (phlRosterMap && team.ID) {
      return phlRosterMap[team.ID]?.filter((player) => player.IsInjured) || [];
    }
    return [];
  }, [phlRosterMap, team.ID]);

  // Team News
  const teamNews = phlNews
    .filter((newsItem) => newsItem.TeamID === team.ID)
    .slice(-10)
    .reverse();

  return {
    teamStandings,
    teamMatchUp,
    teamNotifications,
    teamSchedule,
    homeLogo,
    homeLabel,
    awayLogo,
    awayLabel,
    teamNews,
    gameWeek,
    teamStats,
    teamInjuries,
  };
};

interface BoxStatsProps {
  id?: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  topStat?: number | string;
  bottomStat?: number | string;
}
export const getLandingBoxStats = (
  league: League,
  teamStats: any
): {
  boxOne: BoxStatsProps;
  boxTwo: BoxStatsProps;
  boxThree: BoxStatsProps;
} => {
  let boxOne: BoxStatsProps = {};
  let boxTwo: BoxStatsProps = {};
  let boxThree: BoxStatsProps = {};

  switch (league) {
    case "SimCFB":
    case "SimNFL":
      boxOne = {
        id: teamStats.TopPasser?.ID,
        firstName: teamStats.TopPasser?.FirstName,
        lastName: teamStats.TopPasser?.LastName,
        position: teamStats.TopPasser?.Position,
        topStat: teamStats.TopPasser?.SeasonStats?.PassingTDs,
        bottomStat: teamStats.TopPasser?.SeasonStats?.PassingYards,
      };
      boxTwo = {
        id: teamStats.TopRusher?.ID,
        firstName: teamStats.TopRusher?.FirstName,
        lastName: teamStats.TopRusher?.LastName,
        position: teamStats.TopRusher?.Position,
        topStat: teamStats.TopRusher?.SeasonStats?.RushingTDs,
        bottomStat: teamStats.TopRusher?.SeasonStats?.RushingYards,
      };
      boxThree = {
        id: teamStats.TopReceiver?.ID,
        firstName: teamStats.TopReceiver?.FirstName,
        lastName: teamStats.TopReceiver?.LastName,
        position: teamStats.TopReceiver?.Position,
        topStat: teamStats.TopReceiver?.SeasonStats?.ReceivingTDs,
        bottomStat: teamStats.TopReceiver?.SeasonStats?.ReceivingYards,
      };
      break;

    case "SimCBB":
    case "SimNBA":
      boxOne = {
        id: teamStats.TopPoints?.ID,
        firstName: teamStats.TopPoints?.FirstName,
        lastName: teamStats.TopPoints?.LastName,
        position: teamStats.TopPoints?.Position,
        topStat: teamStats.TopPoints?.SeasonStats?.PPG.toFixed(1),
        bottomStat: teamStats.TopPoints?.SeasonStats?.MinutesPerGame.toFixed(1),
      };
      boxTwo = {
        id: teamStats.TopAssists?.ID,
        firstName: teamStats.TopAssists?.FirstName,
        lastName: teamStats.TopAssists?.LastName,
        position: teamStats.TopAssists?.Position,
        topStat: teamStats.TopAssists?.SeasonStats?.AssistsPerGame.toFixed(1),
        bottomStat:
          teamStats.TopAssists?.SeasonStats?.MinutesPerGame.toFixed(1),
      };
      boxThree = {
        id: teamStats.TopRebounds?.ID,
        firstName: teamStats.TopRebounds?.FirstName,
        lastName: teamStats.TopRebounds?.LastName,
        position: teamStats.TopRebounds?.Position,
        topStat: teamStats.TopRebounds?.SeasonStats?.ReboundsPerGame.toFixed(1),
        bottomStat:
          teamStats.TopRebounds?.SeasonStats?.MinutesPerGame.toFixed(1),
      };
      break;

    case "SimCHL":
    case "SimPHL":
      boxOne = {
        id: teamStats.TopGoals?.ID,
        firstName: teamStats.TopGoals?.FirstName,
        lastName: teamStats.TopGoals?.LastName,
        position: teamStats.TopGoals?.Position,
        topStat: teamStats.TopGoals?.SeasonStats?.Goals,
        bottomStat: ConvertTimeOnIce(
          teamStats.TopGoals?.SeasonStats?.TimeOnIce
        ).toFixed(1),
      };
      boxTwo = {
        id: teamStats.TopAssists?.ID,
        firstName: teamStats.TopAssists?.FirstName,
        lastName: teamStats.TopAssists?.LastName,
        position: teamStats.TopAssists?.Position,
        topStat: teamStats.TopAssists?.SeasonStats?.Assists,
        bottomStat: ConvertTimeOnIce(
          teamStats.TopAssists?.SeasonStats?.TimeOnIce
        ).toFixed(1),
      };
      boxThree = {
        id: teamStats.TopSaves?.ID,
        firstName: teamStats.TopSaves?.FirstName,
        lastName: teamStats.TopSaves?.LastName,
        position: teamStats.TopSaves?.Position,
        topStat: teamStats.TopSaves?.SeasonStats?.Points,
        bottomStat: ConvertTimeOnIce(
          teamStats.TopSaves?.SeasonStats?.TimeOnIce
        ).toFixed(1),
      };
      break;

    default:
      break;
  }

  return { boxOne, boxTwo, boxThree };
};

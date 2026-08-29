import {
  DEFENSE,
  FootballStatsType,
  League,
  OFFENSE,
  OLINE,
  OVERALL,
  PASSING,
  PLAYER_VIEW,
  RECEIVING,
  RETURN,
  RUSHING,
  SEASON_VIEW,
  SimCBB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
  SPECIAL_TEAMS,
  StatsType,
  StatsView,
  TEAM_VIEW,
} from "../../../_constants/constants";
import { isSeasonStats } from "../../../_helper/statsPageHelper";
import { getPasserRating } from "../../../_utility/getPasserRating";
import {
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  CollegePlayerStats as CFBPlayerStats,
  CollegeTeamSeasonStats as CFBTeamSeasonStats,
  CollegeTeamStats as CFBTeamStats,
  NFLPlayerSeasonStats,
  NFLPlayerStats,
  NFLTeamSeasonStats,
  NFLTeamStats,
} from "../../../models/footballModels";
import {
  CollegePlayerSeasonStats,
  CollegePlayerStats,
  NBAPlayerSeasonStats,
  NBAPlayerStats,
  NBATeamSeasonStats,
  NBATeamStats,
  TeamSeasonStats,
  TeamStats,
} from "../../../models/basketballModels";
import {
  CollegePlayerGameStats as CHLPlayerGameStats,
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  CollegeTeamGameStats as CHLTeamGameStats,
  CollegeTeamSeasonStats as CHLTeamSeasonStats,
  ProfessionalPlayerGameStats,
  ProfessionalPlayerSeasonStats,
  ProfessionalTeamGameStats,
  ProfessionalTeamSeasonStats,
} from "../../../models/hockeyModels";

export const GetStatsColumns = (
  league: League,
  statsType: StatsType,
  statsView: StatsView,
  isMobile: boolean,
  isGoalie: boolean,
  basketballStatsType?: string,
) => {
  if (league === SimCHL || league === SimPHL) {
    return GetHockeyStatsColumns(
      league,
      statsType,
      statsView,
      isMobile,
      isGoalie,
    );
  }
  if (league === SimCBB || league === SimNBA) {
    return GetBasketballStatsColumns(
      league,
      statsType,
      statsView,
      basketballStatsType ?? "Total",
      isMobile,
    );
  }
  return [];
};

// Update as needed for viewing Football stats
export const GetFootballStatsColumns = (
  league: League,
  statsType: StatsType,
  footballStatsType: FootballStatsType,
  statsView: StatsView,
  isMobile: boolean,
) => {
  let columns = [{ header: "", accessor: "" }];
  if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Team", accessor: "TeamName" }]);
  }

  if (statsType === PLAYER_VIEW) {
    columns = columns.concat([
      { header: "Team", accessor: "Team" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: isMobile ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: "Exp", accessor: "Year" },
      { header: "Ovr", accessor: "Overall" },
    ]);
  } else if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Conf", accessor: "Conference" }]);
  }
  if (statsView === SEASON_VIEW) {
    columns = columns.concat([{ header: "GP", accessor: "GamesPlayed" }]);
    if (statsType === PLAYER_VIEW) {
      columns = columns.concat([{ header: "Snaps", accessor: "Snaps" }]);
    }
  } else if (statsType === PLAYER_VIEW) {
    columns = columns.concat([{ header: "Snaps", accessor: "Snaps" }]);
  }
  if (statsType === PLAYER_VIEW) {
    if (footballStatsType === PASSING) {
      // skater stats
      columns = columns.concat([
        { header: "Pass Yds.", accessor: "PassingYards" },
        { header: "Pass Cmp.", accessor: "PassCompletions" },
        { header: "Pass Att.", accessor: "PassAttempts" },
        { header: "Pass %", accessor: "Completion" },
        { header: "Passing Avg", accessor: "PassingAvg" },
        { header: "Pass TDs", accessor: "PassingTDs" },
        { header: "INTs", accessor: "Interceptions" },
        { header: "QBR", accessor: "QBRating" },
        { header: "Long. Pass", accessor: "LongestPass" },
        { header: "Scks", accessor: "Sacks" },
      ]);
    } else if (footballStatsType === RUSHING) {
      // goalie stats
      columns = columns.concat([
        { header: "Rush Yds", accessor: "RushingYards" },
        { header: "Rush Att.", accessor: "RushAttempts" },
        { header: "Rush Avg.", accessor: "RushAvg" },
        { header: "Rush TDs", accessor: "RushingTDs" },
        { header: "Fumbles", accessor: "Fumbles" },
        { header: "Long. Rush", accessor: "LongestRush" },
      ]);
    } else if (footballStatsType === RECEIVING) {
      // goalie stats
      columns = columns.concat([
        { header: "Catches", accessor: "Catches" },
        { header: "Targets", accessor: "Targets" },
        { header: "Rec. Yds", accessor: "ReceivingYards" },
        { header: "Rec. TDs", accessor: "ReceivingTDs" },
        { header: "Fumbles", accessor: "Fumbles" },
        { header: "Longest Catch", accessor: "LongestReception" },
      ]);
    } else if (footballStatsType === DEFENSE) {
      // goalie stats
      columns = columns.concat([
        { header: "Solo Tackles", accessor: "SoloTackles" },
        { header: "Asst. Tackles", accessor: "AssistedTackles" },
        { header: "TFL", accessor: "TacklesForLoss" },
        { header: "Sacks", accessor: "SacksMade" },
        { header: "FF", accessor: "ForcedFumbles" },
        { header: "FR", accessor: "RecoveredFumbles" },
        { header: "PD", accessor: "PassDeflections" },
        { header: "INT", accessor: "InterceptionsCaught" },
        { header: "Safeties", accessor: "Safeties" },
        { header: "Def. TDs", accessor: "DefensiveTDs" },
        { header: "Prs", accessor: "DefensivePressures" },
        { header: "Hur", accessor: "Hurries" },
        { header: "PRSnp", accessor: "PassRushSnaps" },
        { header: "PRWin", accessor: "PassRushWins" },
      ]);
    } else if (footballStatsType === SPECIAL_TEAMS) {
      // goalie stats
      columns = columns.concat([
        { header: "FGM", accessor: "FGMade" },
        { header: "FGA", accessor: "FGAttempts" },
        { header: "LFG", accessor: "LongestFG" },
        { header: "XPM", accessor: "ExtraPointsMade" },
        { header: "XPA", accessor: "ExtraPointsAttempted" },
        { header: "KTB", accessor: "KickoffTouchbacks" },
        { header: "P", accessor: "Punts" },
        { header: "GPD", accessor: "GrossPuntDistance" },
        { header: "NPD", accessor: "NetPuntDistance" },
        { header: "PT", accessor: "PuntTouchbacks" },
        { header: "Ins20", accessor: "PuntsInside20" },
      ]);
    } else if (footballStatsType === RETURN) {
      // goalie stats
      columns = columns.concat([
        { header: "Kick Returns", accessor: "KickReturns" },
        { header: "K. Ret. Yds", accessor: "KickReturnYards" },
        { header: "K. Ret. TDs", accessor: "KickReturnTDs" },
        { header: "Punt Returns", accessor: "PuntReturns" },
        { header: "P. Ret. Yds", accessor: "PuntReturnYards" },
        { header: "P. Ret. TDs", accessor: "PuntReturnTDs" },
        { header: "FG Blocked", accessor: "FGBlocked" },
        { header: "Punts Blocked", accessor: "PuntsBlocked" },
      ]);
    } else if (footballStatsType === OLINE) {
      // goalie stats
      columns = columns.concat([
        { header: "PBSnp", accessor: "PassBlockSnaps" },
        { header: "PBWin", accessor: "PassBlockWins" },
        { header: "PrsAll", accessor: "PressuresAllowed" },
        { header: "ScksAll", accessor: "SacksAllowed" },
        { header: "Pnck", accessor: "Pancakes" },
      ]);
    }
  } else if (statsType === TEAM_VIEW) {
    if (footballStatsType === OVERALL) {
      // skater stats
      columns = columns.concat([
        { header: "Pts", accessor: "PointsScored" },
        { header: "Pts All", accessor: "PointsAgainst" },
      ]);

      if (statsView === SEASON_VIEW) {
        columns = columns.concat([
          { header: "Tot Off Yds", accessor: "TotalOffensiveYards" },
          { header: "Tot Yds All", accessor: "TotalYardsAllowed" },
        ]);
      }
      columns = columns.concat([
        { header: "Pass Yds", accessor: "PassingYards" },
        { header: "Pass Yds All", accessor: "PassingYardsAllowed" },
        { header: "Ru Yds", accessor: "RushingYards" },
        { header: "Ru Yds All", accessor: "RushingYardsAllowed" },
      ]);
      if (statsView === SEASON_VIEW) {
        columns = columns.concat([{ header: "TO", accessor: "Turnovers" }]);
      }
      columns = columns.concat([
        { header: "Off Pen", accessor: "OffensivePenalties" },
        { header: "Def Pen", accessor: "DefensivePenalties" },
      ]);
    } else if (footballStatsType === OFFENSE) {
      if (statsView === SEASON_VIEW) {
        columns = columns.concat([
          { header: "Tot Off Yds", accessor: "TotalOffensiveYards" },
        ]);
      }
      columns = columns.concat([
        { header: "Pass Yds", accessor: "PassingYards" },
        { header: "Pass TDs", accessor: "PassingTouchdowns" },
        { header: "QBR", accessor: "QBRating" },
        { header: "Sacks", accessor: "QBSacks" },
        { header: "INTs", accessor: "PassingInterceptions" },
        { header: "Ru Yds", accessor: "RushingYards" },
        { header: "RuTD", accessor: "RushingTDs" },
        { header: "Fum", accessor: "RushingFumbles" },
      ]);
    } else if (footballStatsType === DEFENSE) {
      columns = columns.concat([
        { header: "Pts All", accessor: "PointsAgainst" },
      ]);

      if (statsView === SEASON_VIEW) {
        columns = columns.concat([
          { header: "Tot Yds All", accessor: "TotalYardsAllowed" },
        ]);
      }
      columns = columns.concat([
        { header: "Pass Yds All", accessor: "PassingYardsAllowed" },
        { header: "Ru Yds All", accessor: "RushingYardsAllowed" },
      ]);
      if (statsView === SEASON_VIEW) {
        columns = columns.concat([{ header: "TO", accessor: "Turnovers" }]);
      }

      columns = columns.concat([
        { header: "TOYds", accessor: "TurnoverYards" },
      ]);
      if (statsView === SEASON_VIEW) {
        columns = columns.concat([{ header: "Tck", accessor: "Tackles" }]);
      }
      columns = columns.concat([
        { header: "TFL", accessor: "TacklesForLoss" },
        { header: "Scks", accessor: "DefensiveSacks" },
        { header: "FF", accessor: "ForcedFumbles" },
        { header: "FR", accessor: "FumblesRecovered" },
        { header: "INT", accessor: "DefensiveInterceptions" },
        { header: "SFT", accessor: "Safeties" },
        { header: "DTDs", accessor: "DefensiveTDs" },
        { header: "Prs", accessor: "DefensivePressures" },
        { header: "xScks", accessor: "DefensiveExpectedSacks" },
      ]);
    }
  }

  return columns;
};

// Update as needed for viewing Basketball stats
export const GetBasketballStatsColumns = (
  league: League,
  statsType: StatsType,
  statsView: StatsView,
  basketballStatsType: string,
  isMobile: boolean,
) => {
  let columns = [{ header: "", accessor: "" }];

  if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Team", accessor: "Team" }]);
  }
  if (statsType === PLAYER_VIEW) {
    columns = columns.concat([
      { header: "Team", accessor: "Team" },
      { header: "Player", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: isMobile ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: "Exp", accessor: "Year" },
      { header: "Ovr", accessor: "Overall" },
    ]);
  } else if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Conf", accessor: "Conference" }]);
  }

  if (statsView === SEASON_VIEW) {
    columns = columns.concat([{ header: "GP", accessor: "GamesPlayed" }]);
  }

  if (statsType === PLAYER_VIEW) {
    if (statsView === SEASON_VIEW && basketballStatsType === "Average") {
      columns = columns.concat([
        { header: "MPG", accessor: "MinutesPerGame" },
        { header: "PPG", accessor: "PPG" },
        { header: "RPG", accessor: "ReboundsPerGame" },
        { header: "OR/G", accessor: "OffReboundsPerGame" },
        { header: "DR/G", accessor: "DefReboundsPerGame" },
        { header: "APG", accessor: "AssistsPerGame" },
        { header: "SPG", accessor: "StealsPerGame" },
        { header: "BPG", accessor: "BlocksPerGame" },
        { header: "TPG", accessor: "TurnoversPerGame" },
        { header: "FPG", accessor: "FoulsPerGame" },
        { header: "FGM/G", accessor: "FGMPG" },
        { header: "FGA/G", accessor: "FGAPG" },
        { header: "FG%", accessor: "FGPercent" },
        { header: "3PM/G", accessor: "ThreePointsMadePerGame" },
        { header: "3PA/G", accessor: "ThreePointAttemptsPerGame" },
        { header: "3P%", accessor: "ThreePointPercent" },
        { header: "FTM/G", accessor: "FTMPG" },
        { header: "FTA/G", accessor: "FTAPG" },
        { header: "FT%", accessor: "FTPercent" },
      ]);
    } else {
      // Game view or season Total
      columns = columns.concat([
        { header: "Min", accessor: "Minutes" },
        { header: "Pts", accessor: "Points" },
        { header: "Reb", accessor: "TotalRebounds" },
        { header: "OR", accessor: "OffRebounds" },
        { header: "DR", accessor: "DefRebounds" },
        { header: "Ast", accessor: "Assists" },
        { header: "Stl", accessor: "Steals" },
        { header: "Blk", accessor: "Blocks" },
        { header: "TO", accessor: "Turnovers" },
        { header: "Fouls", accessor: "Fouls" },
        { header: "FGM", accessor: "FGM" },
        { header: "FGA", accessor: "FGA" },
        { header: "FG%", accessor: "FGPercent" },
        { header: "3PM", accessor: "ThreePointsMade" },
        { header: "3PA", accessor: "ThreePointAttempts" },
        { header: "3P%", accessor: "ThreePointPercent" },
        { header: "FTM", accessor: "FTM" },
        { header: "FTA", accessor: "FTA" },
        { header: "FT%", accessor: "FTPercent" },
      ]);
      if (statsView === SEASON_VIEW) {
        columns = columns.concat([{ header: "FO", accessor: "FoulOuts" }]);
      }
    }
  } else if (statsType === TEAM_VIEW) {
    if (statsView === SEASON_VIEW && basketballStatsType === "Average") {
      columns = columns.concat([
        { header: "PPG", accessor: "PPG" },
        { header: "PAPG", accessor: "PAPG" },
        { header: "FGM/G", accessor: "FGMPG" },
        { header: "FGA/G", accessor: "FGAPG" },
        { header: "FG%", accessor: "FGPercent" },
        { header: "FGM-A/G", accessor: "FGMAPG" },
        { header: "FGA-A/G", accessor: "FGAAPG" },
        { header: "FG%-A", accessor: "FGPercentAgainst" },
        { header: "3PM/G", accessor: "TPMPG" },
        { header: "3PA/G", accessor: "TPAPG" },
        { header: "3P%", accessor: "ThreePointPercent" },
        { header: "3PM-A/G", accessor: "TPMAPG" },
        { header: "3PA-A/G", accessor: "TPAAPG" },
        { header: "3P%-A", accessor: "ThreePointPercentAgainst" },
        { header: "FTM/G", accessor: "FTMPG" },
        { header: "FTA/G", accessor: "FTAPG" },
        { header: "FT%", accessor: "FTPercent" },
        { header: "FTM-A/G", accessor: "FTMAPG" },
        { header: "FTA-A/G", accessor: "FTAAPG" },
        { header: "FT%-A", accessor: "FTPercentAgainst" },
        { header: "RPG", accessor: "ReboundsPerGame" },
        { header: "RPG-A", accessor: "ReboundsAllowedPerGame" },
        { header: "APG", accessor: "AssistsPerGame" },
        { header: "APG-A", accessor: "AssistsAllowedPerGame" },
        { header: "SPG", accessor: "StealsPerGame" },
        { header: "SPG-A", accessor: "StealsAllowedPerGame" },
        { header: "BPG", accessor: "BlocksPerGame" },
        { header: "BPG-A", accessor: "BlocksAllowedPerGame" },
        { header: "TPG", accessor: "TurnoversPerGame" },
        { header: "TPG-A", accessor: "TurnoversAllowedPerGame" },
        { header: "FPG", accessor: "FoulsPerGame" },
      ]);
    } else if (statsView === SEASON_VIEW) {
      columns = columns.concat([
        { header: "Pts", accessor: "Points" },
        { header: "PA", accessor: "PointsAgainst" },
        { header: "FGM", accessor: "FGM" },
        { header: "FGA", accessor: "FGA" },
        { header: "FG%", accessor: "FGPercent" },
        { header: "FGM-A", accessor: "FGMAgainst" },
        { header: "FGA-A", accessor: "FGAAgainst" },
        { header: "FG%-A", accessor: "FGPercentAgainst" },
        { header: "3PM", accessor: "ThreePointsMade" },
        { header: "3PA", accessor: "ThreePointAttempts" },
        { header: "3P%", accessor: "ThreePointPercent" },
        { header: "3PM-A", accessor: "ThreePointsMadeAgainst" },
        { header: "3PA-A", accessor: "ThreePointAttemptsAgainst" },
        { header: "3P%-A", accessor: "ThreePointPercentAgainst" },
        { header: "FTM", accessor: "FTM" },
        { header: "FTA", accessor: "FTA" },
        { header: "FT%", accessor: "FTPercent" },
        { header: "FTM-A", accessor: "FTMAgainst" },
        { header: "FTA-A", accessor: "FTAAgainst" },
        { header: "FT%-A", accessor: "FTPercentAgainst" },
        { header: "Reb", accessor: "Rebounds" },
        { header: "Reb-A", accessor: "ReboundsAllowed" },
        { header: "OR", accessor: "OffRebounds" },
        { header: "DR", accessor: "DefRebounds" },
        { header: "Ast", accessor: "Assists" },
        { header: "Ast-A", accessor: "AssistsAllowed" },
        { header: "Stl", accessor: "Steals" },
        { header: "Stl-A", accessor: "StealsAllowed" },
        { header: "Blk", accessor: "Blocks" },
        { header: "Blk-A", accessor: "BlocksAllowed" },
        { header: "TO", accessor: "TotalTurnovers" },
        { header: "TO-A", accessor: "TurnoversAllowed" },
        { header: "Fouls", accessor: "Fouls" },
      ]);
    } else {
      // Game view
      columns = columns.concat([
        { header: "Pts", accessor: "Points" },
        { header: "PA", accessor: "PointsAgainst" },
        { header: "1H", accessor: "FirstHalfScore" },
        { header: "2H", accessor: "SecondHalfScore" },
        { header: "OT", accessor: "OvertimeScore" },
        { header: "FGM", accessor: "FGM" },
        { header: "FGA", accessor: "FGA" },
        { header: "FG%", accessor: "FGPercent" },
        { header: "3PM", accessor: "ThreePointsMade" },
        { header: "3PA", accessor: "ThreePointAttempts" },
        { header: "3P%", accessor: "ThreePointPercent" },
        { header: "FTM", accessor: "FTM" },
        { header: "FTA", accessor: "FTA" },
        { header: "FT%", accessor: "FTPercent" },
        { header: "Reb", accessor: "Rebounds" },
        { header: "OR", accessor: "OffRebounds" },
        { header: "DR", accessor: "DefRebounds" },
        { header: "Ast", accessor: "Assists" },
        { header: "Stl", accessor: "Steals" },
        { header: "Blk", accessor: "Blocks" },
        { header: "TO", accessor: "TotalTurnovers" },
        { header: "Fouls", accessor: "Fouls" },
      ]);
    }
  }

  return columns;
};

export const GetHockeyStatsColumns = (
  league: League,
  statsType: StatsType,
  statsView: StatsView,
  isMobile: boolean,
  isGoalie: boolean,
) => {
  let columns = [{ header: "", accessor: "" }];
  if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Team", accessor: "TeamName" }]);
  }
  if (statsType === PLAYER_VIEW) {
    columns = columns.concat([
      { header: "Team", accessor: "Team" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: isMobile ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: "Exp", accessor: "Year" },
      { header: "Ovr", accessor: "Overall" },
    ]);
  } else if (statsType === TEAM_VIEW) {
    columns = columns.concat([{ header: "Conf", accessor: "Conference" }]);
  }

  if (statsView === SEASON_VIEW) {
    columns = columns.concat([{ header: "GP", accessor: "GamesPlayed" }]);
    if (statsType === PLAYER_VIEW) {
      columns.push({ header: "GS", accessor: "GamesStarted" });
    }
  }

  if (statsType === PLAYER_VIEW) {
    if (!isGoalie) {
      // skater stats
      columns = columns.concat([
        { header: "G", accessor: "Goals" },
        { header: "A", accessor: "Assists" },
        { header: "P", accessor: "Points" },
        { header: "+/-", accessor: "PlusMinus" },
        { header: "PIM", accessor: "PenaltyMinutes" },
        { header: "ESG", accessor: "EvenStrengthGoals" },
        { header: "ESP", accessor: "EvenStrengthPoints" },
        { header: "PPG", accessor: "PowerPlayGoals" },
        { header: "PPP", accessor: "PowerPlayPoints" },
        { header: "SHG", accessor: "ShorthandedGoals" },
        { header: "SHP", accessor: "ShorthandedPoints" },
        { header: "OTG", accessor: "OvertimeGoals" },
        { header: "GWG", accessor: "GameWinningGoals" },
        { header: "SOG", accessor: "Shots" },
        { header: "S%", accessor: "ShootingPercentage" },
        { header: "FO%", accessor: "FaceOffWinPercentage" },
        { header: "FOW", accessor: "FaceOffsWon" },
        { header: "FOA", accessor: "FaceOffs" },
        { header: "BCHK", accessor: "BodyChecks" },
        { header: "SCHK", accessor: "StickChecks" },
        { header: "SHB", accessor: "ShotsBlocked" },
      ]);
    } else {
      // goalie stats
      columns = columns.concat([
        { header: "W", accessor: "GoalieWins" },
        { header: "L", accessor: "GoalieLosses" },
        { header: "T", accessor: "GoalieTies" },
        { header: "OTL", accessor: "OvertimeLosses" },

        { header: "SA", accessor: "ShotsAgainst" },
        { header: "SV", accessor: "Saves" },
        { header: "SV%", accessor: "SavePercentage" },

        { header: "SO", accessor: "Shutouts" },
      ]);
    }
  } else if (statsType === TEAM_VIEW) {
    columns = columns.concat([
      { header: "GF", accessor: "GoalsFor" },
      { header: "GA", accessor: "GoalsAgainst" },
      { header: "A", accessor: "Assists" },
      { header: "P", accessor: "Points" },
      { header: "1st", accessor: "Period1Score" },
      { header: "2nd", accessor: "Period2Score" },
      { header: "3rd", accessor: "Period3Score" },
      { header: "OT", accessor: "OTScore" },
      { header: "+/-", accessor: "PlusMinus" },
      { header: "PIM", accessor: "PenaltyMinutes" },
      { header: "ESG", accessor: "EvenStrengthGoals" },
      { header: "ESP", accessor: "EvenStrengthPoints" },
      { header: "PPG", accessor: "PowerPlayGoals" },
      { header: "PPP", accessor: "PowerPlayPoints" },
      { header: "SHG", accessor: "ShorthandedGoals" },
      { header: "SHP", accessor: "ShorthandedPoints" },
      { header: "OTG", accessor: "OvertimeGoals" },
      { header: "GWG", accessor: "GameWinningGoals" },
      { header: "SOG", accessor: "Shots" },
      { header: "S%", accessor: "ShootingPercentage" },
      { header: "FO%", accessor: "FaceOffWinPercentage" },
      { header: "FOW", accessor: "FaceOffsWon" },
      { header: "FOA", accessor: "FaceOffs" },
      { header: "SA", accessor: "ShotsAgainst" },
      { header: "SV", accessor: "Saves" },
      { header: "SV%", accessor: "SavePercentage" },
      { header: "SO", accessor: "Shutouts" },
    ]);
  }

  return columns;
};

export const GetHockeyPlayerStatsValues = (
  stats:
    | CHLPlayerGameStats
    | CHLPlayerSeasonStats
    | ProfessionalPlayerGameStats
    | ProfessionalPlayerSeasonStats,
  statsView: StatsView,
  isGoalie: boolean,
) => {
  let values: any[] = [];
  if (statsView === SEASON_VIEW && isSeasonStats(stats)) {
    values = values.concat([
      { label: "GP", value: stats.GamesPlayed },
      { label: "GS", value: stats.GamesStarted },
    ]);
  }
  if (!isGoalie) {
    values = values.concat([
      { label: "G", value: stats.Goals },
      { label: "A", value: stats.Assists },
      { label: "P", value: stats.Points },
      { label: "+/-", value: stats.PlusMinus },
      { label: "PIM", value: stats.PenaltyMinutes },
      { label: "ESG", value: stats.EvenStrengthGoals },
      { label: "ESP", value: stats.EvenStrengthPoints },
      { label: "PPG", value: stats.PowerPlayGoals },
      { label: "PPP", value: stats.PowerPlayPoints },
      { label: "SHG", value: stats.ShorthandedGoals },
      { label: "SHP", value: stats.ShorthandedPoints },
      { label: "OTG", value: stats.OvertimeGoals },
      { label: "GWG", value: stats.GameWinningGoals },
      { label: "SOG", value: stats.Shots },
      { label: "S%", value: (stats.ShootingPercentage * 100).toFixed(3) },
      { label: "FO%", value: stats.FaceOffWinPercentage.toFixed(3) },
      { label: "FOW", value: stats.FaceOffsWon },
      { label: "FOA", value: stats.FaceOffs },
      { label: "BCHK", value: stats.BodyChecks },
      { label: "SCHK", value: stats.StickChecks },
      { label: "SHB", value: stats.ShotsBlocked },
    ]);
  } else {
    values = values.concat([
      { label: "W", value: stats.GoalieWins },
      { label: "L", value: stats.GoalieLosses },
      { label: "T", value: stats.GoalieTies },
      { label: "OTL", value: stats.OvertimeLosses },
      { label: "SA", value: stats.ShotsAgainst },
      { label: "SV", value: stats.Saves },
      { label: "SV%", value: stats.SavePercentage.toFixed(3) },
      { label: "SO", value: stats.Shutouts },
    ]);
  }
  return values;
};

export const GetHockeyTeamStatsValues = (
  stats:
    | CHLTeamGameStats
    | CHLTeamSeasonStats
    | ProfessionalTeamGameStats
    | ProfessionalTeamSeasonStats,
  statsView: StatsView,
) => {
  let values: any[] = [];
  if (statsView === SEASON_VIEW) {
    values = values.concat([{ label: "GP", value: stats.GamesPlayed }]);
  }
  values = values.concat([
    { label: "GF", value: stats.GoalsFor },
    { label: "GA", value: stats.GoalsAgainst },
    { label: "A", value: stats.Assists },
    { label: "P", value: stats.Points },
    { label: "1st", value: stats.Period1Score },
    { label: "2nd", value: stats.Period2Score },
    { label: "3rd", value: stats.Period3Score },
    { label: "OT", value: stats.OTScore },
    { label: "+/-", value: stats.PlusMinus },
    { label: "PIM", value: stats.PenaltyMinutes },
    { label: "ESG", value: stats.EvenStrengthGoals },
    { label: "ESP", value: stats.EvenStrengthPoints },
    { label: "PPG", value: stats.PowerPlayGoals },
    { label: "PPP", value: stats.PowerPlayPoints },
    { label: "SHG", value: stats.ShorthandedGoals },
    { label: "SHP", value: stats.ShorthandedPoints },
    { label: "OTG", value: stats.OvertimeGoals },
    { label: "GWG", value: stats.GameWinningGoals },
    { label: "SOG", value: stats.Shots },
    { label: "S%", value: stats.ShootingPercentage.toFixed(3) },
    { label: "FO%", value: stats.FaceOffWinPercentage.toFixed(3) },
    { label: "FOW", value: stats.FaceOffsWon },
    { label: "FOA", value: stats.FaceOffs },
    { label: "SA", value: stats.ShotsAgainst },
    { label: "SV", value: stats.Saves },
    { label: "SV%", value: stats.SavePercentage.toFixed(3) },
    { label: "SO", value: stats.Shutouts },
  ]);
  return values;
};

export const GetFootballPlayerStatsValues = (
  stats:
    | CFBPlayerStats
    | CFBPlayerSeasonStats
    | NFLPlayerStats
    | NFLPlayerSeasonStats,
  statsView: StatsView,
  footballStatsType: FootballStatsType,
): { label: string; value: number }[] => {
  const values: { label: string; value: number }[] = [];

  // season aggregates
  if (statsView === SEASON_VIEW) {
    values.push({ label: "GP", value: stats.GamesPlayed });
  }

  // detail by category
  switch (footballStatsType) {
    case PASSING:
      let completionPercentage = Number(
        stats.PassCompletions / stats.PassAttempts,
      );
      let completionPercentageLabel = "";
      if (completionPercentage > 0) {
        completionPercentage = completionPercentage * 100;
        completionPercentageLabel = completionPercentage.toFixed(2);
      }
      const passingAvg = Number(
        (stats.PassingYards / stats.PassAttempts).toFixed(2),
      );
      let QBRating = stats.QBRating;
      if (!QBRating) {
        const isPro =
          stats instanceof NFLPlayerStats ||
          stats instanceof NFLPlayerSeasonStats;
        QBRating = getPasserRating(
          isPro,
          stats.PassCompletions,
          stats.PassAttempts,
          stats.PassingYards,
          stats.PassingTDs,
          stats.Interceptions,
        );
      } else {
        QBRating = QBRating.toFixed(2);
      }
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "PY", value: stats.PassingYards },
        { label: "PC", value: stats.PassCompletions },
        { label: "PA", value: stats.PassAttempts },
        { label: "P%", value: Number(completionPercentageLabel) },
        { label: "PAvg", value: passingAvg },
        { label: "PTDs", value: stats.PassingTDs },
        { label: "INTs", value: stats.Interceptions },
        { label: "QBR", value: Number(QBRating) },
        { label: "LP", value: stats.LongestPass },
        { label: "Scks", value: stats.Sacks },
      );
      break;

    case RUSHING:
      let rushingAvg = stats.RushingAvg;
      if (rushingAvg === undefined || rushingAvg === null) {
        rushingAvg = 0;
      }
      if (statsView === SEASON_VIEW) {
        let rAvg = Number(stats.RushingAvg);
        if (!rAvg) {
          rAvg = 0;
        }
        rushingAvg = rAvg.toFixed(2);
      } else {
        rushingAvg = Number(
          (stats.RushingYards / stats.RushAttempts).toFixed(2),
        );
      }
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "RY", value: stats.RushingYards },
        { label: "RA", value: stats.RushAttempts },
        { label: "RAvg", value: rushingAvg },
        { label: "RuTD", value: stats.RushingTDs },
        { label: "Fum", value: stats.Fumbles },
        { label: "LR", value: stats.LongestRush },
      );
      break;

    case RECEIVING:
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "Cth", value: stats.Catches },
        { label: "Trgt", value: stats.Targets },
        { label: "RcY", value: stats.ReceivingYards },
        { label: "RcTDs", value: stats.ReceivingTDs },
        { label: "Fum", value: stats.Fumbles },
        { label: "LRec", value: stats.LongestReception },
      );
      break;

    case DEFENSE:
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "SoloTck", value: stats.SoloTackles },
        { label: "AstTckl", value: stats.AssistedTackles },
        { label: "TFL", value: stats.TacklesForLoss },
        { label: "Scks", value: stats.SacksMade },
        { label: "FF", value: stats.ForcedFumbles },
        { label: "FR", value: stats.RecoveredFumbles },
        { label: "PD", value: stats.PassDeflections },
        { label: "INT", value: stats.InterceptionsCaught },
        { label: "SFT", value: stats.Safeties },
        { label: "DTDs", value: stats.DefensiveTDs },
        { label: "Prs", value: stats.DefensivePressures },
        { label: "Hur", value: stats.Hurries },
        { label: "PRSnp", value: stats.PassRushSnaps },
        { label: "PRWin", value: stats.PassRushWins },
      );
      break;

    case SPECIAL_TEAMS:
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "FGM", value: stats.FGMade },
        { label: "FGA", value: stats.FGAttempts },
        { label: "LFG", value: stats.LongestFG },
        { label: "XPM", value: stats.ExtraPointsMade },
        { label: "XPA", value: stats.ExtraPointsAttempted },
        { label: "KTB", value: stats.KickoffTouchbacks },
        { label: "P", value: stats.Punts },
        { label: "GPD", value: stats.GrossPuntDistance },
        { label: "NPD", value: stats.NetPuntDistance },
        { label: "PT", value: stats.PuntTouchbacks },
        { label: "Ins20", value: stats.PuntsInside20 },
      );
      break;

    case RETURN:
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "KRet", value: stats.KickReturns },
        { label: "KRetY", value: stats.KickReturnYards },
        { label: "KRetTDs", value: stats.KickReturnTDs },
        { label: "PRet", value: stats.PuntReturns },
        { label: "PRetY", value: stats.PuntReturnYards },
        { label: "PRetTDs", value: stats.PuntReturnTDs },
        { label: "FGB", value: stats.FGBlocked },
        { label: "PB", value: stats.PuntsBlocked },
      );
      break;

    case OLINE:
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "PBSnp", value: stats.PassBlockSnaps },
        { label: "PBWin", value: stats.PassBlockWins },
        { label: "PrsAll", value: stats.PressuresAllowed },
        { label: "ScksAll", value: stats.SacksAllowed },
        { label: "Pnck", value: stats.Pancakes },
      );
      break;
  }

  return values;
};

export const GetFootballTeamStatsValues = (
  stats: CFBTeamStats | CFBTeamSeasonStats | NFLTeamStats | NFLTeamSeasonStats,
  statsView: StatsView,
  footballStatsType: FootballStatsType,
): { label: string; value: number }[] => {
  const values: { label: string; value: number }[] = [];
  // season aggregate
  if (statsView === SEASON_VIEW) {
    if ("GamesPlayed" in stats) {
      values.push({
        label: "GP",
        value: (stats as CFBTeamSeasonStats | NFLTeamSeasonStats).GamesPlayed,
      });
    }
  }

  // detail by category
  switch (footballStatsType) {
    case OVERALL:
      values.push(
        { label: "Pts", value: stats.PointsScored },
        { label: "Pts All", value: stats.PointsAgainst },
      );
      if (statsView === SEASON_VIEW) {
        if ("TotalOffensiveYards" in stats && "TotalYardsAllowed" in stats) {
          values.push(
            { label: "Tot Off Yds", value: stats.TotalOffensiveYards },
            { label: "Tot Yds All", value: stats.TotalYardsAllowed },
          );
        }
      }
      values.push(
        { label: "Pass Yds", value: stats.PassingYards },
        { label: "Pass Yds All", value: stats.PassingYardsAllowed },
        { label: "Ru Yds", value: stats.RushingYards },
        { label: "Ru Yds All", value: stats.RushingYardsAllowed },
      );
      if (statsView === SEASON_VIEW && "Turnovers" in stats) {
        values.push({ label: "TO", value: stats.Turnovers });
      }
      values.push(
        { label: "Off Pen", value: stats.OffensivePenalties },
        { label: "Def Pen", value: stats.DefensivePenalties },
      );
      break;

    case OFFENSE:
      if ("TotalOffensiveYards" in stats) {
        values.push({ label: "Tot Off Yds", value: stats.TotalOffensiveYards });
      }
      values.push(
        { label: "Pass Yds", value: stats.PassingYards },
        { label: "Pass TDs", value: stats.PassingTouchdowns },
        { label: "QBR", value: Number(stats.QBRating.toFixed(2)) },
        { label: "Sacks", value: stats.QBSacks },
        { label: "INTs", value: stats.PassingInterceptions },
        { label: "Ru Yds", value: stats.RushingYards },
        { label: "RuTD", value: stats.RushingTouchdowns },
        { label: "Fum", value: stats.RushingFumbles },
      );
      break;

    case DEFENSE:
      values.push({ label: "Pts All", value: stats.PointsAgainst });
      if (statsView === SEASON_VIEW && "TotalYardsAllowed" in stats) {
        values.push({ label: "Tot Yds All", value: stats.TotalYardsAllowed });
      }
      values.push(
        { label: "Pass Yds All", value: stats.PassingYardsAllowed },
        { label: "Ru Yds All", value: stats.RushingYardsAllowed },
      );
      if (statsView === SEASON_VIEW && "Turnovers" in stats) {
        values.push({ label: "TO", value: stats.Turnovers });
      }
      values.push({ label: "TOYds", value: stats.TurnoverYards });
      if (statsView === SEASON_VIEW && "Tackles" in stats) {
        values.push({ label: "Tck", value: stats.Tackles });
      }
      values.push(
        { label: "TFL", value: stats.TacklesForLoss },
        { label: "Scks", value: stats.DefensiveSacks },
        { label: "FF", value: stats.ForcedFumbles },
        { label: "FR", value: stats.FumblesRecovered },
        { label: "INT", value: stats.DefensiveInterceptions },
        { label: "SFT", value: stats.Safeties },
        { label: "DTDs", value: stats.DefensiveTDs },
        { label: "Prs", value: stats.DefensivePressures },
        { label: "xScks", value: stats.DefensiveExpectedSacks },
      );
      break;
  }

  return values;
};

export const GetBasketballPlayerStatsValues = (
  stats:
    | CollegePlayerStats
    | CollegePlayerSeasonStats
    | NBAPlayerStats
    | NBAPlayerSeasonStats,
  statsView: StatsView,
  basketballStatsType: string,
): { label: string; value: number | string }[] => {
  const values: { label: string; value: number | string }[] = [];

  if (statsView === SEASON_VIEW) {
    const seasonStats = stats as
      | CollegePlayerSeasonStats
      | NBAPlayerSeasonStats;
    values.push({ label: "GP", value: seasonStats.GamesPlayed });

    if (basketballStatsType === "Average") {
      values.push(
        { label: "MPG", value: seasonStats.MinutesPerGame.toFixed(1) },
        { label: "PPG", value: seasonStats.PPG.toFixed(1) },
        { label: "RPG", value: seasonStats.ReboundsPerGame.toFixed(1) },
        { label: "OR/G", value: seasonStats.OffReboundsPerGame.toFixed(1) },
        { label: "DR/G", value: seasonStats.DefReboundsPerGame.toFixed(1) },
        { label: "APG", value: seasonStats.AssistsPerGame.toFixed(1) },
        { label: "SPG", value: seasonStats.StealsPerGame.toFixed(1) },
        { label: "BPG", value: seasonStats.BlocksPerGame.toFixed(1) },
        { label: "TPG", value: seasonStats.TurnoversPerGame.toFixed(1) },
        { label: "FPG", value: seasonStats.FoulsPerGame.toFixed(1) },
        { label: "FGM/G", value: seasonStats.FGMPG.toFixed(1) },
        { label: "FGA/G", value: seasonStats.FGAPG.toFixed(1) },
        { label: "FG%", value: (seasonStats.FGPercent * 100).toFixed(1) },
        {
          label: "3PM/G",
          value: seasonStats.ThreePointsMadePerGame.toFixed(1),
        },
        {
          label: "3PA/G",
          value: seasonStats.ThreePointAttemptsPerGame.toFixed(1),
        },
        {
          label: "3P%",
          value: (seasonStats.ThreePointPercent * 100).toFixed(1),
        },
        { label: "FTM/G", value: seasonStats.FTMPG.toFixed(1) },
        { label: "FTA/G", value: seasonStats.FTAPG.toFixed(1) },
        { label: "FT%", value: (seasonStats.FTPercent * 100).toFixed(1) },
      );
    } else {
      values.push(
        { label: "Min", value: seasonStats.Minutes },
        { label: "Pts", value: seasonStats.Points },
        { label: "Reb", value: seasonStats.TotalRebounds },
        { label: "OR", value: seasonStats.OffRebounds },
        { label: "DR", value: seasonStats.DefRebounds },
        { label: "Ast", value: seasonStats.Assists },
        { label: "Stl", value: seasonStats.Steals },
        { label: "Blk", value: seasonStats.Blocks },
        { label: "TO", value: seasonStats.Turnovers },
        { label: "Fouls", value: seasonStats.Fouls },
        { label: "FO", value: seasonStats.FoulOuts },
        { label: "FGM", value: seasonStats.FGM },
        { label: "FGA", value: seasonStats.FGA },
        { label: "FG%", value: (seasonStats.FGPercent * 100).toFixed(1) },
        { label: "3PM", value: seasonStats.ThreePointsMade },
        { label: "3PA", value: seasonStats.ThreePointAttempts },
        {
          label: "3P%",
          value: (seasonStats.ThreePointPercent * 100).toFixed(1),
        },
        { label: "FTM", value: seasonStats.FTM },
        { label: "FTA", value: seasonStats.FTA },
        { label: "FT%", value: (seasonStats.FTPercent * 100).toFixed(1) },
      );
    }
  } else {
    values.push(
      { label: "Min", value: stats.Minutes },
      { label: "Pts", value: stats.Points },
      { label: "Reb", value: stats.TotalRebounds },
      { label: "OR", value: stats.OffRebounds },
      { label: "DR", value: stats.DefRebounds },
      { label: "Ast", value: stats.Assists },
      { label: "Stl", value: stats.Steals },
      { label: "Blk", value: stats.Blocks },
      { label: "TO", value: stats.Turnovers },
      { label: "Fouls", value: stats.Fouls },
      { label: "FGM", value: stats.FGM },
      { label: "FGA", value: stats.FGA },
      { label: "FG%", value: (stats.FGPercent * 100).toFixed(1) },
      { label: "3PM", value: stats.ThreePointsMade },
      { label: "3PA", value: stats.ThreePointAttempts },
      { label: "3P%", value: (stats.ThreePointPercent * 100).toFixed(1) },
      { label: "FTM", value: stats.FTM },
      { label: "FTA", value: stats.FTA },
      { label: "FT%", value: (stats.FTPercent * 100).toFixed(1) },
    );
  }

  return values;
};

export const GetBasketballTeamStatsValues = (
  stats: TeamStats | TeamSeasonStats | NBATeamStats | NBATeamSeasonStats,
  statsView: StatsView,
  basketballStatsType: string,
): { label: string; value: number | string }[] => {
  const values: { label: string; value: number | string }[] = [];

  if (statsView === SEASON_VIEW) {
    const seasonStats = stats as TeamSeasonStats | NBATeamSeasonStats;
    values.push({ label: "GP", value: seasonStats.GamesPlayed });

    if (basketballStatsType === "Average") {
      values.push(
        { label: "PPG", value: seasonStats.PPG.toFixed(1) },
        { label: "PAPG", value: seasonStats.PAPG.toFixed(1) },
        { label: "FGM/G", value: seasonStats.FGMPG.toFixed(1) },
        { label: "FGA/G", value: seasonStats.FGAPG.toFixed(1) },
        { label: "FG%", value: (seasonStats.FGPercent * 100).toFixed(1) },
        { label: "FGM-A/G", value: seasonStats.FGMAPG.toFixed(1) },
        { label: "FGA-A/G", value: seasonStats.FGAAPG.toFixed(1) },
        {
          label: "FG%-A",
          value: (seasonStats.FGPercentAgainst * 100).toFixed(1),
        },
        { label: "3PM/G", value: seasonStats.TPMPG.toFixed(1) },
        { label: "3PA/G", value: seasonStats.TPAPG.toFixed(1) },
        {
          label: "3P%",
          value: (seasonStats.ThreePointPercent * 100).toFixed(1),
        },
        { label: "3PM-A/G", value: seasonStats.TPMAPG.toFixed(1) },
        { label: "3PA-A/G", value: seasonStats.TPAAPG.toFixed(1) },
        {
          label: "3P%-A",
          value: (seasonStats.ThreePointPercentAgainst * 100).toFixed(1),
        },
        { label: "FTM/G", value: seasonStats.FTMPG.toFixed(1) },
        { label: "FTA/G", value: seasonStats.FTAPG.toFixed(1) },
        { label: "FT%", value: (seasonStats.FTPercent * 100).toFixed(1) },
        { label: "FTM-A/G", value: seasonStats.FTMAPG.toFixed(1) },
        { label: "FTA-A/G", value: seasonStats.FTAAPG.toFixed(1) },
        {
          label: "FT%-A",
          value: (seasonStats.FTPercentAgainst * 100).toFixed(1),
        },
        { label: "RPG", value: seasonStats.ReboundsPerGame.toFixed(1) },
        {
          label: "RPG-A",
          value: seasonStats.ReboundsAllowedPerGame.toFixed(1),
        },
        { label: "APG", value: seasonStats.AssistsPerGame.toFixed(1) },
        { label: "APG-A", value: seasonStats.AssistsAllowedPerGame.toFixed(1) },
        { label: "SPG", value: seasonStats.StealsPerGame.toFixed(1) },
        { label: "SPG-A", value: seasonStats.StealsAllowedPerGame.toFixed(1) },
        { label: "BPG", value: seasonStats.BlocksPerGame.toFixed(1) },
        { label: "BPG-A", value: seasonStats.BlocksAllowedPerGame.toFixed(1) },
        { label: "TPG", value: seasonStats.TurnoversPerGame.toFixed(1) },
        {
          label: "TPG-A",
          value: seasonStats.TurnoversAllowedPerGame.toFixed(1),
        },
        { label: "FPG", value: seasonStats.FoulsPerGame.toFixed(1) },
      );
    } else {
      values.push(
        { label: "Pts", value: seasonStats.Points },
        { label: "PA", value: seasonStats.PointsAgainst },
        { label: "FGM", value: seasonStats.FGM },
        { label: "FGA", value: seasonStats.FGA },
        { label: "FG%", value: (seasonStats.FGPercent * 100).toFixed(1) },
        { label: "FGM-A", value: seasonStats.FGMAgainst },
        { label: "FGA-A", value: seasonStats.FGAAgainst },
        {
          label: "FG%-A",
          value: (seasonStats.FGPercentAgainst * 100).toFixed(1),
        },
        { label: "3PM", value: seasonStats.ThreePointsMade },
        { label: "3PA", value: seasonStats.ThreePointAttempts },
        {
          label: "3P%",
          value: (seasonStats.ThreePointPercent * 100).toFixed(1),
        },
        { label: "3PM-A", value: seasonStats.ThreePointsMadeAgainst },
        { label: "3PA-A", value: seasonStats.ThreePointAttemptsAgainst },
        {
          label: "3P%-A",
          value: (seasonStats.ThreePointPercentAgainst * 100).toFixed(1),
        },
        { label: "FTM", value: seasonStats.FTM },
        { label: "FTA", value: seasonStats.FTA },
        { label: "FT%", value: (seasonStats.FTPercent * 100).toFixed(1) },
        { label: "FTM-A", value: seasonStats.FTMAgainst },
        { label: "FTA-A", value: seasonStats.FTAAgainst },
        {
          label: "FT%-A",
          value: (seasonStats.FTPercentAgainst * 100).toFixed(1),
        },
        { label: "Reb", value: seasonStats.Rebounds },
        { label: "Reb-A", value: seasonStats.ReboundsAllowed },
        { label: "OR", value: seasonStats.OffRebounds },
        { label: "DR", value: seasonStats.DefRebounds },
        { label: "Ast", value: seasonStats.Assists },
        { label: "Ast-A", value: seasonStats.AssistsAllowed },
        { label: "Stl", value: seasonStats.Steals },
        { label: "Stl-A", value: seasonStats.StealsAllowed },
        { label: "Blk", value: seasonStats.Blocks },
        { label: "Blk-A", value: seasonStats.BlocksAllowed },
        { label: "TO", value: seasonStats.TotalTurnovers },
        { label: "TO-A", value: seasonStats.TurnoversAllowed },
        { label: "Fouls", value: seasonStats.Fouls },
      );
    }
  } else {
    values.push(
      { label: "Pts", value: stats.Points },
      { label: "PA", value: stats.PointsAgainst },
      { label: "1H", value: stats.FirstHalfScore },
      { label: "2H", value: stats.SecondHalfScore },
      { label: "OT", value: stats.OvertimeScore },
      { label: "FGM", value: stats.FGM },
      { label: "FGA", value: stats.FGA },
      { label: "FG%", value: (stats.FGPercent * 100).toFixed(1) },
      { label: "3PM", value: stats.ThreePointsMade },
      { label: "3PA", value: stats.ThreePointAttempts },
      { label: "3P%", value: (stats.ThreePointPercent * 100).toFixed(1) },
      { label: "FTM", value: stats.FTM },
      { label: "FTA", value: stats.FTA },
      { label: "FT%", value: (stats.FTPercent * 100).toFixed(1) },
      { label: "Reb", value: stats.Rebounds },
      { label: "OR", value: stats.OffRebounds },
      { label: "DR", value: stats.DefRebounds },
      { label: "Ast", value: stats.Assists },
      { label: "Stl", value: stats.Steals },
      { label: "Blk", value: stats.Blocks },
      { label: "TO", value: stats.TotalTurnovers },
      { label: "Fouls", value: stats.Fouls },
    );
  }

  return values;
};

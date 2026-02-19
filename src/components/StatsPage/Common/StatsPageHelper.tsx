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
  CollegePlayerSeasonStats,
  CollegePlayerStats,
  CollegeTeamSeasonStats,
  CollegeTeamStats,
  NFLPlayerSeasonStats,
  NFLPlayerStats,
  NFLTeamSeasonStats,
  NFLTeamStats,
} from "../../../models/footballModels";
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
    return GetBasketballStatsColumns(league, statsType, statsView, isMobile);
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
        { header: "Pass %", accessor: "PassPercentage" },
        { header: "Passing Avg", accessor: "PassAvg" },
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
  isMobile: boolean,
) => {
  return [];
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
    | CollegePlayerStats
    | CollegePlayerSeasonStats
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
      values.push(
        { label: "Snaps", value: stats.Snaps },
        { label: "RY", value: stats.RushingYards },
        { label: "RA", value: stats.RushAttempts },
        { label: "RAvg", value: stats.RushAvg },
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
        { label: "ScksAll", value: stats.SacksAllowed },
        { label: "Pnck", value: stats.Pancakes },
      );
      break;
  }

  return values;
};

export const GetFootballTeamStatsValues = (
  stats:
    | CollegeTeamStats
    | CollegeTeamSeasonStats
    | NFLTeamStats
    | NFLTeamSeasonStats,
  statsView: StatsView,
  footballStatsType: FootballStatsType,
): { label: string; value: number }[] => {
  const values: { label: string; value: number }[] = [];
  // season aggregate
  if (statsView === SEASON_VIEW) {
    if ("GamesPlayed" in stats) {
      values.push({
        label: "GP",
        value: (stats as CollegeTeamSeasonStats | NFLTeamSeasonStats)
          .GamesPlayed,
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
      );
      break;
  }

  return values;
};

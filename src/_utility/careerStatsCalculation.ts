import {
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  NFLPlayerSeasonStats,
} from "../models/footballModels";
import { League, SimNFL } from "../_constants/constants";
import { getPasserRating } from "./getPasserRating";
import {
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  ProfessionalPlayerSeasonStats,
} from "../models/hockeyModels";

export const calculateFBCareerStats = (
  playerStats: (CFBPlayerSeasonStats | NFLPlayerSeasonStats)[],
  league: League,
) => {
  if (playerStats.length === 0) return null;

  const total: any = {
    SeasonID: 0,
    GamesPlayed: 0,
    PassCompletions: 0,
    PassAttempts: 0,
    PassingYards: 0,
    PassingTDs: 0,
    Interceptions: 0,
    Sacks: 0,
    RushAttempts: 0,
    RushingYards: 0,
    RushingTDs: 0,
    Fumbles: 0,
    Targets: 0,
    Catches: 0,
    ReceivingYards: 0,
    ReceivingTDs: 0,
    SoloTackles: 0,
    AssistedTackles: 0,
    TacklesForLoss: 0,
    SacksMade: 0,
    ForcedFumbles: 0,
    RecoveredFumbles: 0,
    PassDeflections: 0,
    InterceptionsCaught: 0,
    Safeties: 0,
    DefensiveTDs: 0,
    FGMade: 0,
    FGAttempts: 0,
    LongestFG: 0,
    ExtraPointsMade: 0,
    ExtraPointsAttempted: 0,
    KickoffTouchbacks: 0,
    Punts: 0,
    GrossPuntDistance: 0,
    NetPuntDistance: 0,
    PuntTouchbacks: 0,
    PuntsInside20: 0,
    KickReturns: 0,
    KickReturnYards: 0,
    KickReturnTDs: 0,
    PuntReturns: 0,
    PuntReturnYards: 0,
    PuntReturnTDs: 0,
    Snaps: 0,
    Pancakes: 0,
    SacksAllowed: 0,
  };

  for (const s of playerStats as any[]) {
    total.GamesPlayed += s.GamesPlayed ?? 0;
    total.PassCompletions += s.PassCompletions ?? 0;
    total.PassAttempts += s.PassAttempts ?? 0;
    total.PassingYards += s.PassingYards ?? 0;
    total.PassingTDs += s.PassingTDs ?? 0;
    total.Interceptions += s.Interceptions ?? 0;
    total.Sacks += s.Sacks ?? 0;
    total.RushAttempts += s.RushAttempts ?? 0;
    total.RushingYards += s.RushingYards ?? 0;
    total.RushingTDs += s.RushingTDs ?? 0;
    total.Fumbles += s.Fumbles ?? 0;
    total.Targets += s.Targets ?? 0;
    total.Catches += s.Catches ?? 0;
    total.ReceivingYards += s.ReceivingYards ?? 0;
    total.ReceivingTDs += s.ReceivingTDs ?? 0;
    total.SoloTackles += s.SoloTackles ?? 0;
    total.AssistedTackles += s.AssistedTackles ?? 0;
    total.TacklesForLoss += s.TacklesForLoss ?? 0;
    total.SacksMade += s.SacksMade ?? 0;
    total.ForcedFumbles += s.ForcedFumbles ?? 0;
    total.RecoveredFumbles += s.RecoveredFumbles ?? 0;
    total.PassDeflections += s.PassDeflections ?? 0;
    total.InterceptionsCaught += s.InterceptionsCaught ?? 0;
    total.Safeties += s.Safeties ?? 0;
    total.DefensiveTDs += s.DefensiveTDs ?? 0;
    total.FGMade += s.FGMade ?? 0;
    total.FGAttempts += s.FGAttempts ?? 0;
    total.LongestFG = Math.max(total.LongestFG, s.LongestFG ?? 0);
    total.ExtraPointsMade += s.ExtraPointsMade ?? 0;
    total.ExtraPointsAttempted += s.ExtraPointsAttempted ?? 0;
    total.KickoffTouchbacks += s.KickoffTouchbacks ?? 0;
    total.Punts += s.Punts ?? 0;
    total.GrossPuntDistance += s.GrossPuntDistance ?? 0;
    total.NetPuntDistance += s.NetPuntDistance ?? 0;
    total.PuntTouchbacks += s.PuntTouchbacks ?? 0;
    total.PuntsInside20 += s.PuntsInside20 ?? 0;
    total.KickReturns += s.KickReturns ?? 0;
    total.KickReturnYards += s.KickReturnYards ?? 0;
    total.KickReturnTDs += s.KickReturnTDs ?? 0;
    total.PuntReturns += s.PuntReturns ?? 0;
    total.PuntReturnYards += s.PuntReturnYards ?? 0;
    total.PuntReturnTDs += s.PuntReturnTDs ?? 0;
    total.Snaps += s.Snaps ?? 0;
    total.Pancakes += s.Pancakes ?? 0;
    total.SacksAllowed += s.SacksAllowed ?? 0;
  }

  if (total.RushAttempts > 0) {
    total.RushAvg = total.RushingYards / total.RushAttempts;
  }

  if (total.PassAttempts > 0) {
    const qbrStr = getPasserRating(
      league === SimNFL,
      total.PassCompletions,
      total.PassAttempts,
      total.PassingYards,
      total.PassingTDs,
      total.Interceptions,
    );
    total.QBRating = Number(qbrStr);
  }

  return { ...total, isCareer: true };
};

export const calculateHCKCareerStats = (
  playerStats: (CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats)[],
  league: League,
) => {
  if (playerStats.length === 0) return null;

  const total: any = {
    SeasonID: 0,
    GamesPlayed: 0,
    GamesStarted: 0,
    Goals: 0,
    Assists: 0,
    Points: 0,
    PlusMinus: 0,
    PenaltyMinutes: 0,
    EvenStrengthGoals: 0,
    EvenStrengthPoints: 0,
    PowerPlayGoals: 0,
    PowerPlayPoints: 0,
    ShorthandedGoals: 0,
    ShorthandedPoints: 0,
    OvertimeGoals: 0,
    GameWinningGoals: 0,
    Shots: 0,
    ShootingPercentage: 0,
    TimeOnIce: 0,
    FaceOffWinPercentage: 0,
    FaceOffsWon: 0,
    FaceOffs: 0,
    GoalieWins: 0,
    GoalieLosses: 0,
    GoalieTies: 0,
    OvertimeLosses: 0,
    ShotsAgainst: 0,
    Saves: 0,
    GoalsAgainst: 0,
    SavePercentage: 0,
    Shutouts: 0,
    ShotsBlocked: 0,
    BodyChecks: 0,
    StickChecks: 0,
  };

  let totalTimeOnIce = 0;
  let totalShotsAgainst = 0;
  let gamesWithTimeOnIce = 0;
  let gamesWithShotsAgainst = 0;

  for (const s of playerStats as any[]) {
    total.GamesPlayed += s.GamesPlayed ?? 0;
    total.GamesStarted += s.GamesStarted ?? 0;
    total.Goals += s.Goals ?? 0;
    total.Assists += s.Assists ?? 0;
    total.Points += s.Points ?? 0;
    total.PlusMinus += s.PlusMinus ?? 0;
    total.PenaltyMinutes += s.PenaltyMinutes ?? 0;
    total.EvenStrengthGoals += s.EvenStrengthGoals ?? 0;
    total.EvenStrengthPoints += s.EvenStrengthPoints ?? 0;
    total.PowerPlayGoals += s.PowerPlayGoals ?? 0;
    total.PowerPlayPoints += s.PowerPlayPoints ?? 0;
    total.ShorthandedGoals += s.ShorthandedGoals ?? 0;
    total.ShorthandedPoints += s.ShorthandedPoints ?? 0;
    total.OvertimeGoals += s.OvertimeGoals ?? 0;
    total.GameWinningGoals += s.GameWinningGoals ?? 0;
    total.Shots += s.Shots ?? 0;
    total.FaceOffsWon += s.FaceOffsWon ?? 0;
    total.FaceOffs += s.FaceOffs ?? 0;
    total.GoalieWins += s.GoalieWins ?? 0;
    total.GoalieLosses += s.GoalieLosses ?? 0;
    total.GoalieTies += s.GoalieTies ?? 0;
    total.OvertimeLosses += s.OvertimeLosses ?? 0;
    total.ShotsAgainst += s.ShotsAgainst ?? 0;
    total.Saves += s.Saves ?? 0;
    total.GoalsAgainst += s.GoalsAgainst ?? 0;
    total.Shutouts += s.Shutouts ?? 0;
    total.ShotsBlocked += s.ShotsBlocked ?? 0;
    total.BodyChecks += s.BodyChecks ?? 0;
    total.StickChecks += s.StickChecks ?? 0;

    // Track time on ice for averaging
    if (s.TimeOnIce && s.TimeOnIce > 0) {
      totalTimeOnIce += s.TimeOnIce;
      gamesWithTimeOnIce++;
    }

    // Track shots against for save percentage calculation
    if (s.ShotsAgainst && s.ShotsAgainst > 0) {
      totalShotsAgainst += s.ShotsAgainst;
      gamesWithShotsAgainst++;
    }
  }

  // Calculate derived stats
  if (total.Shots > 0) {
    total.ShootingPercentage = (total.Goals / total.Shots) * 100;
  }

  if (gamesWithTimeOnIce > 0) {
    total.TimeOnIce = totalTimeOnIce / gamesWithTimeOnIce;
  }

  if (total.FaceOffs > 0) {
    total.FaceOffWinPercentage = (total.FaceOffsWon / total.FaceOffs) * 100;
  }

  if (total.ShotsAgainst > 0) {
    total.SavePercentage = (total.Saves / total.ShotsAgainst) * 100;
  }

  return { ...total, isCareer: true };
};

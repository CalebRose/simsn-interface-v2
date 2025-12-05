import { CollegePlayerStats } from "../../../models/basketballModels";
import { CollegePlayerGameStats } from "../../../models/hockeyModels";

export interface PlayByPlay {
  [key: string]: any;
}
export interface PlayerStats {
  ID?: number;
  CollegePlayerID?: number;
  GameID?: number;
  FirstName?: string;
  LastName?: string;
  Position?: string;
  WeekID?: number;
  SeasonID?: number;
  OpposingTeam?: string;
  Year?: number;
  IsRedshirt?: boolean;
  PassingYards?: number;
  PassAttempts?: number;
  PassCompletions?: number;
  PassingTDs?: number;
  Interceptions?: number;
  LongestPass?: number;
  Sacks?: number;
  RushAttempts?: number;
  RushingYards?: number;
  RushingTDs?: number;
  Fumbles?: number;
  LongestRush?: number;
  Targets?: number;
  Catches?: number;
  ReceivingYards?: number;
  ReceivingTDs?: number;
  LongestReception?: number;
  SoloTackles?: number;
  AssistedTackles?: number;
  TacklesForLoss?: number;
  SacksMade?: number;
  ForcedFumbles?: number;
  RecoveredFumbles?: number;
  PassDeflections?: number;
  InterceptionsCaught?: number;
  Safeties?: number;
  DefensiveTDs?: number;
  FGMade?: number;
  FGAttempts?: number;
  LongestFG?: number;
  ExtraPointsMade?: number;
  ExtraPointsAttempted?: number;
  KickoffTouchbacks?: number;
  Punts?: number;
  GrossPuntDistance?: number;
  NetPuntDistance?: number;
  PuntTouchbacks?: number;
  PuntsInside20?: number;
  KickReturns?: number;
  KickReturnTDs?: number;
  KickReturnYards?: number;
  PuntReturns?: number;
  PuntReturnTDs?: number;
  PuntReturnYards?: number;
  STSoloTackles?: number;
  STAssistedTackles?: number;
  PuntsBlocked?: number;
  FGBlocked?: number;
  Snaps?: number;
  Pancakes?: number;
  SacksAllowed?: number;
  PlayedGame?: number;
  StartedGame?: number;
  WasInjured?: boolean;
  WeeksOfRecovery?: number;
  InjuryType?: string;
  RevealResults?: boolean;
  TeamID?: number;
  Team?: string;
  PreviousTeamID?: number;
  PreviousTeam?: string;
  GameType?: number;
}

export interface FilteredStats {
  PassingStats: PlayerStats[];
  RushingStats: PlayerStats[];
  ReceivingStats: PlayerStats[];
  DefenseStats: PlayerStats[];
  SpecialTeamStats: PlayerStats[];
  OLineStats: PlayerStats[];
  ReturnStats: PlayerStats[];
}

export interface HockeyPlayerStats {
  Position: string;
  FirstName: string;
  LastName: string;
  PassAttempts?: number;
  PassCompletions?: number;
  PassingYards?: number;
  PassingTDs?: number;
  Interceptions?: number;
  RushAttempts?: number;
  Targets?: number;
  Pancakes?: number;
  SacksAllowed?: number;
  Sacks?: number;
}

export interface BasketballPlayerStats {
  Position: string;
  FirstName: string;
  LastName: string;
  Minutes: number;
  FGM: number;
  FGA: number;
  FGPercentage: number;
  ThreePM: number;
  ThreePA: number;
  ThreePAPercentage: number;
  FTM: number;
  FTA: number;
  FTPercentage: number;
  Points: number;
  OffensiveRebounds: number;
  DefensiveRebounds: number;
  TotalRebounds: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  Turnovers: number;
  Fouls: number;
}

export interface HockeyFilteredStats {
  ForwardsStats: CollegePlayerGameStats[];
  DefensemenStats: CollegePlayerGameStats[];
  GoalieStats: CollegePlayerGameStats[];
}

export interface BasketballFilteredStats {
  TeamOne: BasketballPlayerStats[];
  TeamTwo: BasketballPlayerStats[];
}

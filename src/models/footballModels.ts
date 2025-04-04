/* Do not change, this code is generated from Golang structs */

export class NFLGame {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  WeekID: number;
  Week: number;
  SeasonID: number;
  HomeTeamID: number;
  HomeTeam: string;
  HomeTeamCoach: string;
  HomeTeamWin: boolean;
  AwayTeamID: number;
  AwayTeam: string;
  AwayTeamCoach: string;
  AwayTeamWin: boolean;
  MVP: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  TimeSlot: string;
  StadiumID: number;
  Stadium: string;
  City: string;
  State: string;
  Region: string;
  LowTemp: number;
  HighTemp: number;
  GameTemp: number;
  Cloud: string;
  Precip: string;
  WindSpeed: number;
  WindCategory: string;
  IsNeutral: boolean;
  IsDomed: boolean;
  IsNightGame: boolean;
  IsPlayoffGame: boolean;
  IsRivalryGame: boolean;
  IsConference: boolean;
  IsDivisional: boolean;
  IsConferenceChampionship: boolean;
  IsSuperBowl: boolean;
  GameComplete: boolean;
  IsPreseasonGame: boolean;
  GameTitle: string;
  NextGameID: number;
  NextGameHOA: string;
  HomePreviousBye: boolean;
  AwayPreviousBye: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.HomeTeamID = source["HomeTeamID"];
    this.HomeTeam = source["HomeTeam"];
    this.HomeTeamCoach = source["HomeTeamCoach"];
    this.HomeTeamWin = source["HomeTeamWin"];
    this.AwayTeamID = source["AwayTeamID"];
    this.AwayTeam = source["AwayTeam"];
    this.AwayTeamCoach = source["AwayTeamCoach"];
    this.AwayTeamWin = source["AwayTeamWin"];
    this.MVP = source["MVP"];
    this.HomeTeamScore = source["HomeTeamScore"];
    this.AwayTeamScore = source["AwayTeamScore"];
    this.TimeSlot = source["TimeSlot"];
    this.StadiumID = source["StadiumID"];
    this.Stadium = source["Stadium"];
    this.City = source["City"];
    this.State = source["State"];
    this.Region = source["Region"];
    this.LowTemp = source["LowTemp"];
    this.HighTemp = source["HighTemp"];
    this.GameTemp = source["GameTemp"];
    this.Cloud = source["Cloud"];
    this.Precip = source["Precip"];
    this.WindSpeed = source["WindSpeed"];
    this.WindCategory = source["WindCategory"];
    this.IsNeutral = source["IsNeutral"];
    this.IsDomed = source["IsDomed"];
    this.IsNightGame = source["IsNightGame"];
    this.IsPlayoffGame = source["IsPlayoffGame"];
    this.IsRivalryGame = source["IsRivalryGame"];
    this.IsConference = source["IsConference"];
    this.IsDivisional = source["IsDivisional"];
    this.IsConferenceChampionship = source["IsConferenceChampionship"];
    this.IsSuperBowl = source["IsSuperBowl"];
    this.GameComplete = source["GameComplete"];
    this.IsPreseasonGame = source["IsPreseasonGame"];
    this.GameTitle = source["GameTitle"];
    this.NextGameID = source["NextGameID"];
    this.NextGameHOA = source["NextGameHOA"];
    this.HomePreviousBye = source["HomePreviousBye"];
    this.AwayPreviousBye = source["AwayPreviousBye"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class WaiverWirePlayerResponse {
  ID: number;
  PlayerID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  TeamID: number;
  College: string;
  TeamAbbr: string;
  Hometown: string;
  State: string;
  Experience: number;
  IsActive: boolean;
  IsFreeAgent: boolean;
  IsWaived: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  MinimumValue: number;
  DraftedTeam: string;
  ShowLetterGrade: boolean;
  IsPracticeSquad: boolean;
  SeasonStats: NFLPlayerSeasonStats;
  WaiverOffers: NFLWaiverOffer[];
  Contract: NFLContract;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.PlayerID = source["PlayerID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.TeamID = source["TeamID"];
    this.College = source["College"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Hometown = source["Hometown"];
    this.State = source["State"];
    this.Experience = source["Experience"];
    this.IsActive = source["IsActive"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsWaived = source["IsWaived"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.MinimumValue = source["MinimumValue"];
    this.PreviousTeam = source["PreviousTeam"];
    this.DraftedTeam = source["DraftedTeam"];
    this.ShowLetterGrade = source["ShowLetterGrade"];
    this.IsPracticeSquad = source["IsPracticeSquad"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NFLPlayerSeasonStats
    );
    this.WaiverOffers = this.convertValues(
      source["WaiverOffers"],
      NFLWaiverOffer
    );
    this.Contract = this.convertValues(source["Contract"], NFLContract);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class FreeAgentResponse {
  ID: number;
  PlayerID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  PositionTwo: string;
  Archetype: string;
  ArchetypeTwo: string;
  Height: number;
  Weight: number;
  Age: number;
  Overall: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  InjuryRating: number;
  Stamina: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  TeamID: number;
  College: string;
  TeamAbbr: string;
  Hometown: string;
  State: string;
  Experience: number;
  IsActive: boolean;
  IsFreeAgent: boolean;
  IsWaived: boolean;
  MinimumValue: number;
  DraftedTeam: string;
  ShowLetterGrade: boolean;
  IsPracticeSquad: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  Shotgun: number;
  SeasonStats: NFLPlayerSeasonStats;
  Offers: FreeAgencyOffer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.PlayerID = source["PlayerID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.PositionTwo = source["PositionTwo"];
    this.Archetype = source["Archetype"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Overall = source["Overall"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.InjuryRating = source["InjuryRating"];
    this.Stamina = source["Stamina"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.TeamID = source["TeamID"];
    this.College = source["College"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Hometown = source["Hometown"];
    this.State = source["State"];
    this.Experience = source["Experience"];
    this.IsActive = source["IsActive"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsWaived = source["IsWaived"];
    this.MinimumValue = source["MinimumValue"];
    this.DraftedTeam = source["DraftedTeam"];
    this.ShowLetterGrade = source["ShowLetterGrade"];
    this.IsPracticeSquad = source["IsPracticeSquad"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.Shotgun = source["Shotgun"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NFLPlayerSeasonStats
    );
    this.Offers = this.convertValues(source["Offers"], FreeAgencyOffer);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class FreeAgencyResponse {
  FreeAgents: FreeAgentResponse[];
  WaiverPlayers: WaiverWirePlayerResponse[];
  PracticeSquad: FreeAgentResponse[];
  TeamOffers: FreeAgencyOffer[];
  RosterCount: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FreeAgents = this.convertValues(
      source["FreeAgents"],
      FreeAgentResponse
    );
    this.WaiverPlayers = this.convertValues(
      source["WaiverPlayers"],
      WaiverWirePlayerResponse
    );
    this.PracticeSquad = this.convertValues(
      source["PracticeSquad"],
      FreeAgentResponse
    );
    this.TeamOffers = this.convertValues(source["TeamOffers"], FreeAgencyOffer);
    this.RosterCount = source["RosterCount"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLStandings {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  TeamName: string;
  Mascot: string;
  SeasonID: number;
  Season: number;
  LeagueID: number;
  LeagueName: string;
  ConferenceID: number;
  ConferenceName: string;
  TotalTies: number;
  ConferenceTies: number;
  DivisionID: number;
  DivisionName: string;
  DivisionWins: number;
  DivisionLosses: number;
  DivisionTies: number;
  PostSeasonStatus: string;
  TotalWins: number;
  TotalLosses: number;
  ConferenceWins: number;
  ConferenceLosses: number;
  RankedWins: number;
  RankedLosses: number;
  PointsFor: number;
  PointsAgainst: number;
  Streak: number;
  HomeWins: number;
  AwayWins: number;
  Coach: string;
  TeamAbbr: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.TeamName = source["TeamName"];
    this.Mascot = source["Mascot"];
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.LeagueID = source["LeagueID"];
    this.LeagueName = source["LeagueName"];
    this.ConferenceID = source["ConferenceID"];
    this.ConferenceName = source["ConferenceName"];
    this.TotalTies = source["TotalTies"];
    this.ConferenceTies = source["ConferenceTies"];
    this.DivisionID = source["DivisionID"];
    this.DivisionName = source["DivisionName"];
    this.DivisionWins = source["DivisionWins"];
    this.DivisionLosses = source["DivisionLosses"];
    this.DivisionTies = source["DivisionTies"];
    this.PostSeasonStatus = source["PostSeasonStatus"];
    this.TotalWins = source["TotalWins"];
    this.TotalLosses = source["TotalLosses"];
    this.ConferenceWins = source["ConferenceWins"];
    this.ConferenceLosses = source["ConferenceLosses"];
    this.RankedWins = source["RankedWins"];
    this.RankedLosses = source["RankedLosses"];
    this.PointsFor = source["PointsFor"];
    this.PointsAgainst = source["PointsAgainst"];
    this.Streak = source["Streak"];
    this.HomeWins = source["HomeWins"];
    this.AwayWins = source["AwayWins"];
    this.Coach = source["Coach"];
    this.TeamAbbr = source["TeamAbbr"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLGameplan {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  OffensiveScheme: string;
  OffRunToPassRatio: number;
  OffFormation1Name: string;
  OffForm1Weight: number;
  OffForm1TraditionalRun: number;
  OffForm1OptionRun: number;
  OffForm1Pass: number;
  OffForm1RPO: number;
  OffFormation2Name: string;
  OffForm2Weight: number;
  OffForm2TraditionalRun: number;
  OffForm2OptionRun: number;
  OffForm2Pass: number;
  OffForm2RPO: number;
  OffFormation3Name: string;
  OffForm3Weight: number;
  OffForm3TraditionalRun: number;
  OffForm3OptionRun: number;
  OffForm3Pass: number;
  OffForm3RPO: number;
  OffFormation4Name: string;
  OffForm4Weight: number;
  OffForm4TraditionalRun: number;
  OffForm4OptionRun: number;
  OffForm4Pass: number;
  OffForm4RPO: number;
  OffFormation5Name: string;
  OffForm5Weight: number;
  OffForm5TraditionalRun: number;
  OffForm5OptionRun: number;
  OffForm5Pass: number;
  OffForm5RPO: number;
  RunnerDistributionQB: number;
  RunnerDistributionRB1: number;
  RunnerDistributionRB2: number;
  RunnerDistributionRB3: number;
  RunnerDistributionFB1: number;
  RunnerDistributionFB2: number;
  RunnerDistributionWR: number;
  RunnerDistributionWRPosition: string;
  RunnerDistributionWRID: number;
  RunOutsideLeft: number;
  RunOutsideRight: number;
  RunInsideLeft: number;
  RunInsideRight: number;
  RunPowerLeft: number;
  RunPowerRight: number;
  RunDrawLeft: number;
  RunDrawRight: number;
  ReadOptionLeft: number;
  ReadOptionRight: number;
  SpeedOptionLeft: number;
  SpeedOptionRight: number;
  InvertedOptionLeft: number;
  InvertedOptionRight: number;
  TripleOptionLeft: number;
  TripleOptionRight: number;
  PassQuick: number;
  PassShort: number;
  PassLong: number;
  PassScreen: number;
  PassPAShort: number;
  PassPALong: number;
  LeftVsRight: number;
  ChoiceOutside: number;
  ChoiceInside: number;
  ChoicePower: number;
  PeekOutside: number;
  PeekInside: number;
  PeekPower: number;
  TargetingWR1: number;
  TargetDepthWR1: string;
  TargetingWR2: number;
  TargetDepthWR2: string;
  TargetingWR3: number;
  TargetDepthWR3: string;
  TargetingWR4: number;
  TargetDepthWR4: string;
  TargetingWR5: number;
  TargetDepthWR5: string;
  TargetingTE1: number;
  TargetDepthTE1: string;
  TargetingTE2: number;
  TargetDepthTE2: string;
  TargetingTE3: number;
  TargetDepthTE3: string;
  TargetingRB1: number;
  TargetDepthRB1: string;
  TargetingRB2: number;
  TargetDepthRB2: string;
  TargetingFB1: number;
  TargetDepthFB1: string;
  DefensiveScheme: string;
  DefFormation1: string;
  DefFormation1RunToPass: number;
  DefFormation1BlitzWeight: number;
  DefFormation1BlitzAggression: string;
  DefFormation2: string;
  DefFormation2RunToPass: number;
  DefFormation2BlitzWeight: number;
  DefFormation2BlitzAggression: string;
  DefFormation3: string;
  DefFormation3RunToPass: number;
  DefFormation3BlitzWeight: number;
  DefFormation3BlitzAggression: string;
  DefFormation4: string;
  DefFormation4RunToPass: number;
  DefFormation4BlitzWeight: number;
  DefFormation4BlitzAggression: string;
  DefFormation5: string;
  DefFormation5RunToPass: number;
  DefFormation5BlitzWeight: number;
  DefFormation5BlitzAggression: string;
  BlitzSafeties: boolean;
  BlitzCorners: boolean;
  LinebackerCoverage: string;
  CornersCoverage: string;
  SafetiesCoverage: string;
  DiveFocus: number;
  PitchFocus: number;
  PrimaryHB: number;
  MaximumFGDistance: number;
  GoFor4AndShort: number;
  GoFor4AndLong: number;
  HasSchemePenalty: boolean;
  OffenseSchemePenalty: number;
  DefenseSchemePenalty: number;
  DefaultOffense: boolean;
  DefaultDefense: boolean;
  PreviousWeekBye: boolean;
  FocusPlays: string;
  DoubleTeam: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.OffRunToPassRatio = source["OffRunToPassRatio"];
    this.OffFormation1Name = source["OffFormation1Name"];
    this.OffForm1Weight = source["OffForm1Weight"];
    this.OffForm1TraditionalRun = source["OffForm1TraditionalRun"];
    this.OffForm1OptionRun = source["OffForm1OptionRun"];
    this.OffForm1Pass = source["OffForm1Pass"];
    this.OffForm1RPO = source["OffForm1RPO"];
    this.OffFormation2Name = source["OffFormation2Name"];
    this.OffForm2Weight = source["OffForm2Weight"];
    this.OffForm2TraditionalRun = source["OffForm2TraditionalRun"];
    this.OffForm2OptionRun = source["OffForm2OptionRun"];
    this.OffForm2Pass = source["OffForm2Pass"];
    this.OffForm2RPO = source["OffForm2RPO"];
    this.OffFormation3Name = source["OffFormation3Name"];
    this.OffForm3Weight = source["OffForm3Weight"];
    this.OffForm3TraditionalRun = source["OffForm3TraditionalRun"];
    this.OffForm3OptionRun = source["OffForm3OptionRun"];
    this.OffForm3Pass = source["OffForm3Pass"];
    this.OffForm3RPO = source["OffForm3RPO"];
    this.OffFormation4Name = source["OffFormation4Name"];
    this.OffForm4Weight = source["OffForm4Weight"];
    this.OffForm4TraditionalRun = source["OffForm4TraditionalRun"];
    this.OffForm4OptionRun = source["OffForm4OptionRun"];
    this.OffForm4Pass = source["OffForm4Pass"];
    this.OffForm4RPO = source["OffForm4RPO"];
    this.OffFormation5Name = source["OffFormation5Name"];
    this.OffForm5Weight = source["OffForm5Weight"];
    this.OffForm5TraditionalRun = source["OffForm5TraditionalRun"];
    this.OffForm5OptionRun = source["OffForm5OptionRun"];
    this.OffForm5Pass = source["OffForm5Pass"];
    this.OffForm5RPO = source["OffForm5RPO"];
    this.RunnerDistributionQB = source["RunnerDistributionQB"];
    this.RunnerDistributionRB1 = source["RunnerDistributionRB1"];
    this.RunnerDistributionRB2 = source["RunnerDistributionRB2"];
    this.RunnerDistributionRB3 = source["RunnerDistributionRB3"];
    this.RunnerDistributionFB1 = source["RunnerDistributionFB1"];
    this.RunnerDistributionFB2 = source["RunnerDistributionFB2"];
    this.RunnerDistributionWR = source["RunnerDistributionWR"];
    this.RunnerDistributionWRPosition = source["RunnerDistributionWRPosition"];
    this.RunnerDistributionWRID = source["RunnerDistributionWRID"];
    this.RunOutsideLeft = source["RunOutsideLeft"];
    this.RunOutsideRight = source["RunOutsideRight"];
    this.RunInsideLeft = source["RunInsideLeft"];
    this.RunInsideRight = source["RunInsideRight"];
    this.RunPowerLeft = source["RunPowerLeft"];
    this.RunPowerRight = source["RunPowerRight"];
    this.RunDrawLeft = source["RunDrawLeft"];
    this.RunDrawRight = source["RunDrawRight"];
    this.ReadOptionLeft = source["ReadOptionLeft"];
    this.ReadOptionRight = source["ReadOptionRight"];
    this.SpeedOptionLeft = source["SpeedOptionLeft"];
    this.SpeedOptionRight = source["SpeedOptionRight"];
    this.InvertedOptionLeft = source["InvertedOptionLeft"];
    this.InvertedOptionRight = source["InvertedOptionRight"];
    this.TripleOptionLeft = source["TripleOptionLeft"];
    this.TripleOptionRight = source["TripleOptionRight"];
    this.PassQuick = source["PassQuick"];
    this.PassShort = source["PassShort"];
    this.PassLong = source["PassLong"];
    this.PassScreen = source["PassScreen"];
    this.PassPAShort = source["PassPAShort"];
    this.PassPALong = source["PassPALong"];
    this.LeftVsRight = source["LeftVsRight"];
    this.ChoiceOutside = source["ChoiceOutside"];
    this.ChoiceInside = source["ChoiceInside"];
    this.ChoicePower = source["ChoicePower"];
    this.PeekOutside = source["PeekOutside"];
    this.PeekInside = source["PeekInside"];
    this.PeekPower = source["PeekPower"];
    this.TargetingWR1 = source["TargetingWR1"];
    this.TargetDepthWR1 = source["TargetDepthWR1"];
    this.TargetingWR2 = source["TargetingWR2"];
    this.TargetDepthWR2 = source["TargetDepthWR2"];
    this.TargetingWR3 = source["TargetingWR3"];
    this.TargetDepthWR3 = source["TargetDepthWR3"];
    this.TargetingWR4 = source["TargetingWR4"];
    this.TargetDepthWR4 = source["TargetDepthWR4"];
    this.TargetingWR5 = source["TargetingWR5"];
    this.TargetDepthWR5 = source["TargetDepthWR5"];
    this.TargetingTE1 = source["TargetingTE1"];
    this.TargetDepthTE1 = source["TargetDepthTE1"];
    this.TargetingTE2 = source["TargetingTE2"];
    this.TargetDepthTE2 = source["TargetDepthTE2"];
    this.TargetingTE3 = source["TargetingTE3"];
    this.TargetDepthTE3 = source["TargetDepthTE3"];
    this.TargetingRB1 = source["TargetingRB1"];
    this.TargetDepthRB1 = source["TargetDepthRB1"];
    this.TargetingRB2 = source["TargetingRB2"];
    this.TargetDepthRB2 = source["TargetDepthRB2"];
    this.TargetingFB1 = source["TargetingFB1"];
    this.TargetDepthFB1 = source["TargetDepthFB1"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.DefFormation1 = source["DefFormation1"];
    this.DefFormation1RunToPass = source["DefFormation1RunToPass"];
    this.DefFormation1BlitzWeight = source["DefFormation1BlitzWeight"];
    this.DefFormation1BlitzAggression = source["DefFormation1BlitzAggression"];
    this.DefFormation2 = source["DefFormation2"];
    this.DefFormation2RunToPass = source["DefFormation2RunToPass"];
    this.DefFormation2BlitzWeight = source["DefFormation2BlitzWeight"];
    this.DefFormation2BlitzAggression = source["DefFormation2BlitzAggression"];
    this.DefFormation3 = source["DefFormation3"];
    this.DefFormation3RunToPass = source["DefFormation3RunToPass"];
    this.DefFormation3BlitzWeight = source["DefFormation3BlitzWeight"];
    this.DefFormation3BlitzAggression = source["DefFormation3BlitzAggression"];
    this.DefFormation4 = source["DefFormation4"];
    this.DefFormation4RunToPass = source["DefFormation4RunToPass"];
    this.DefFormation4BlitzWeight = source["DefFormation4BlitzWeight"];
    this.DefFormation4BlitzAggression = source["DefFormation4BlitzAggression"];
    this.DefFormation5 = source["DefFormation5"];
    this.DefFormation5RunToPass = source["DefFormation5RunToPass"];
    this.DefFormation5BlitzWeight = source["DefFormation5BlitzWeight"];
    this.DefFormation5BlitzAggression = source["DefFormation5BlitzAggression"];
    this.BlitzSafeties = source["BlitzSafeties"];
    this.BlitzCorners = source["BlitzCorners"];
    this.LinebackerCoverage = source["LinebackerCoverage"];
    this.CornersCoverage = source["CornersCoverage"];
    this.SafetiesCoverage = source["SafetiesCoverage"];
    this.DiveFocus = source["DiveFocus"];
    this.PitchFocus = source["PitchFocus"];
    this.PrimaryHB = source["PrimaryHB"];
    this.MaximumFGDistance = source["MaximumFGDistance"];
    this.GoFor4AndShort = source["GoFor4AndShort"];
    this.GoFor4AndLong = source["GoFor4AndLong"];
    this.HasSchemePenalty = source["HasSchemePenalty"];
    this.OffenseSchemePenalty = source["OffenseSchemePenalty"];
    this.DefenseSchemePenalty = source["DefenseSchemePenalty"];
    this.DefaultOffense = source["DefaultOffense"];
    this.DefaultDefense = source["DefaultDefense"];
    this.PreviousWeekBye = source["PreviousWeekBye"];
    this.FocusPlays = source["FocusPlays"];
    this.DoubleTeam = source["DoubleTeam"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLExtensionOffer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLPlayerID: number;
  TeamID: number;
  SeasonID: number;
  Team: string;
  ContractLength: number;
  Y1BaseSalary: number;
  Y1Bonus: number;
  Y2BaseSalary: number;
  Y2Bonus: number;
  Y3BaseSalary: number;
  Y3Bonus: number;
  Y4BaseSalary: number;
  Y4Bonus: number;
  Y5BaseSalary: number;
  Y5Bonus: number;
  TotalBonus: number;
  TotalSalary: number;
  ContractValue: number;
  BonusPercentage: number;
  Rejections: number;
  IsAccepted: boolean;
  IsActive: boolean;
  IsRejected: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLPlayerID = source["NFLPlayerID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.ContractLength = source["ContractLength"];
    this.Y1BaseSalary = source["Y1BaseSalary"];
    this.Y1Bonus = source["Y1Bonus"];
    this.Y2BaseSalary = source["Y2BaseSalary"];
    this.Y2Bonus = source["Y2Bonus"];
    this.Y3BaseSalary = source["Y3BaseSalary"];
    this.Y3Bonus = source["Y3Bonus"];
    this.Y4BaseSalary = source["Y4BaseSalary"];
    this.Y4Bonus = source["Y4Bonus"];
    this.Y5BaseSalary = source["Y5BaseSalary"];
    this.Y5Bonus = source["Y5Bonus"];
    this.TotalBonus = source["TotalBonus"];
    this.TotalSalary = source["TotalSalary"];
    this.ContractValue = source["ContractValue"];
    this.BonusPercentage = source["BonusPercentage"];
    this.Rejections = source["Rejections"];
    this.IsAccepted = source["IsAccepted"];
    this.IsActive = source["IsActive"];
    this.IsRejected = source["IsRejected"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLWaiverOffer {
  ID: number;
  TeamID: number;
  Team: string;
  WaiverOrder: number;
  NFLPlayerID: number;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.WaiverOrder = source["WaiverOrder"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.IsActive = source["IsActive"];
  }
}
export class FreeAgencyOffer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLPlayerID: number;
  TeamID: number;
  Team: string;
  ContractLength: number;
  Y1BaseSalary: number;
  Y1Bonus: number;
  Y2BaseSalary: number;
  Y2Bonus: number;
  Y3BaseSalary: number;
  Y3Bonus: number;
  Y4BaseSalary: number;
  Y4Bonus: number;
  Y5BaseSalary: number;
  Y5Bonus: number;
  TotalBonus: number;
  TotalSalary: number;
  ContractValue: number;
  BonusPercentage: number;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLPlayerID = source["NFLPlayerID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.ContractLength = source["ContractLength"];
    this.Y1BaseSalary = source["Y1BaseSalary"];
    this.Y1Bonus = source["Y1Bonus"];
    this.Y2BaseSalary = source["Y2BaseSalary"];
    this.Y2Bonus = source["Y2Bonus"];
    this.Y3BaseSalary = source["Y3BaseSalary"];
    this.Y3Bonus = source["Y3Bonus"];
    this.Y4BaseSalary = source["Y4BaseSalary"];
    this.Y4Bonus = source["Y4Bonus"];
    this.Y5BaseSalary = source["Y5BaseSalary"];
    this.Y5Bonus = source["Y5Bonus"];
    this.TotalBonus = source["TotalBonus"];
    this.TotalSalary = source["TotalSalary"];
    this.ContractValue = source["ContractValue"];
    this.BonusPercentage = source["BonusPercentage"];
    this.IsActive = source["IsActive"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLPlayerSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLPlayerID: number;
  SeasonID: number;
  Year: number;
  PassingYards: number;
  PassAttempts: number;
  PassCompletions: number;
  PassingTDs: number;
  Interceptions: number;
  LongestPass: number;
  Sacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingTDs: number;
  Fumbles: number;
  LongestRush: number;
  Targets: number;
  Catches: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  LongestReception: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  SacksMade: number;
  ForcedFumbles: number;
  RecoveredFumbles: number;
  PassDeflections: number;
  InterceptionsCaught: number;
  Safeties: number;
  DefensiveTDs: number;
  FGMade: number;
  FGAttempts: number;
  LongestFG: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  KickoffTouchbacks: number;
  Punts: number;
  GrossPuntDistance: number;
  NetPuntDistance: number;
  PuntTouchbacks: number;
  PuntsInside20: number;
  KickReturns: number;
  KickReturnTDs: number;
  KickReturnYards: number;
  PuntReturns: number;
  PuntReturnTDs: number;
  PuntReturnYards: number;
  STSoloTackles: number;
  STAssistedTackles: number;
  PuntsBlocked: number;
  FGBlocked: number;
  Snaps: number;
  Pancakes: number;
  SacksAllowed: number;
  PlayedGame: number;
  StartedGame: number;
  WasInjured: boolean;
  WeeksOfRecovery: number;
  InjuryType: string;
  RevealResults: boolean;
  TeamID: number;
  Team: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  GameType: number;
  GamesPlayed: number;
  QBRating: number;
  Tackles: number;
  RushingAvg: number;
  PassingAvg: number;
  ReceivingAvg: number;
  Completion: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLPlayerID = source["NFLPlayerID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.PassingYards = source["PassingYards"];
    this.PassAttempts = source["PassAttempts"];
    this.PassCompletions = source["PassCompletions"];
    this.PassingTDs = source["PassingTDs"];
    this.Interceptions = source["Interceptions"];
    this.LongestPass = source["LongestPass"];
    this.Sacks = source["Sacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingTDs = source["RushingTDs"];
    this.Fumbles = source["Fumbles"];
    this.LongestRush = source["LongestRush"];
    this.Targets = source["Targets"];
    this.Catches = source["Catches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.ReceivingTDs = source["ReceivingTDs"];
    this.LongestReception = source["LongestReception"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.SacksMade = source["SacksMade"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.RecoveredFumbles = source["RecoveredFumbles"];
    this.PassDeflections = source["PassDeflections"];
    this.InterceptionsCaught = source["InterceptionsCaught"];
    this.Safeties = source["Safeties"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.FGMade = source["FGMade"];
    this.FGAttempts = source["FGAttempts"];
    this.LongestFG = source["LongestFG"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.KickoffTouchbacks = source["KickoffTouchbacks"];
    this.Punts = source["Punts"];
    this.GrossPuntDistance = source["GrossPuntDistance"];
    this.NetPuntDistance = source["NetPuntDistance"];
    this.PuntTouchbacks = source["PuntTouchbacks"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.KickReturns = source["KickReturns"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.KickReturnYards = source["KickReturnYards"];
    this.PuntReturns = source["PuntReturns"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.STSoloTackles = source["STSoloTackles"];
    this.STAssistedTackles = source["STAssistedTackles"];
    this.PuntsBlocked = source["PuntsBlocked"];
    this.FGBlocked = source["FGBlocked"];
    this.Snaps = source["Snaps"];
    this.Pancakes = source["Pancakes"];
    this.SacksAllowed = source["SacksAllowed"];
    this.PlayedGame = source["PlayedGame"];
    this.StartedGame = source["StartedGame"];
    this.WasInjured = source["WasInjured"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryType = source["InjuryType"];
    this.RevealResults = source["RevealResults"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.GameType = source["GameType"];
    this.GamesPlayed = source["GamesPlayed"];
    this.QBRating = source["QBRating"];
    this.Tackles = source["Tackles"];
    this.RushingAvg = source["RushingAvg"];
    this.PassingAvg = source["PassingAvg"];
    this.ReceivingAvg = source["ReceivingAvg"];
    this.Completion = source["Completion"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLPlayerStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  IsPreseasonGame: boolean;
  NFLPlayerID: number;
  GameID: number;
  WeekID: number;
  SeasonID: number;
  OpposingTeam: string;
  Year: number;
  PassingYards: number;
  PassAttempts: number;
  PassCompletions: number;
  PassingTDs: number;
  Interceptions: number;
  LongestPass: number;
  Sacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingTDs: number;
  Fumbles: number;
  LongestRush: number;
  Targets: number;
  Catches: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  LongestReception: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  SacksMade: number;
  ForcedFumbles: number;
  RecoveredFumbles: number;
  PassDeflections: number;
  InterceptionsCaught: number;
  Safeties: number;
  DefensiveTDs: number;
  FGMade: number;
  FGAttempts: number;
  LongestFG: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  KickoffTouchbacks: number;
  Punts: number;
  GrossPuntDistance: number;
  NetPuntDistance: number;
  PuntTouchbacks: number;
  PuntsInside20: number;
  KickReturns: number;
  KickReturnTDs: number;
  KickReturnYards: number;
  PuntReturns: number;
  PuntReturnTDs: number;
  PuntReturnYards: number;
  STSoloTackles: number;
  STAssistedTackles: number;
  PuntsBlocked: number;
  FGBlocked: number;
  Snaps: number;
  Pancakes: number;
  SacksAllowed: number;
  PlayedGame: number;
  StartedGame: number;
  WasInjured: boolean;
  WeeksOfRecovery: number;
  InjuryType: string;
  RevealResults: boolean;
  TeamID: number;
  Team: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  GameType: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.IsPreseasonGame = source["IsPreseasonGame"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.GameID = source["GameID"];
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
    this.OpposingTeam = source["OpposingTeam"];
    this.Year = source["Year"];
    this.PassingYards = source["PassingYards"];
    this.PassAttempts = source["PassAttempts"];
    this.PassCompletions = source["PassCompletions"];
    this.PassingTDs = source["PassingTDs"];
    this.Interceptions = source["Interceptions"];
    this.LongestPass = source["LongestPass"];
    this.Sacks = source["Sacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingTDs = source["RushingTDs"];
    this.Fumbles = source["Fumbles"];
    this.LongestRush = source["LongestRush"];
    this.Targets = source["Targets"];
    this.Catches = source["Catches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.ReceivingTDs = source["ReceivingTDs"];
    this.LongestReception = source["LongestReception"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.SacksMade = source["SacksMade"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.RecoveredFumbles = source["RecoveredFumbles"];
    this.PassDeflections = source["PassDeflections"];
    this.InterceptionsCaught = source["InterceptionsCaught"];
    this.Safeties = source["Safeties"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.FGMade = source["FGMade"];
    this.FGAttempts = source["FGAttempts"];
    this.LongestFG = source["LongestFG"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.KickoffTouchbacks = source["KickoffTouchbacks"];
    this.Punts = source["Punts"];
    this.GrossPuntDistance = source["GrossPuntDistance"];
    this.NetPuntDistance = source["NetPuntDistance"];
    this.PuntTouchbacks = source["PuntTouchbacks"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.KickReturns = source["KickReturns"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.KickReturnYards = source["KickReturnYards"];
    this.PuntReturns = source["PuntReturns"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.STSoloTackles = source["STSoloTackles"];
    this.STAssistedTackles = source["STAssistedTackles"];
    this.PuntsBlocked = source["PuntsBlocked"];
    this.FGBlocked = source["FGBlocked"];
    this.Snaps = source["Snaps"];
    this.Pancakes = source["Pancakes"];
    this.SacksAllowed = source["SacksAllowed"];
    this.PlayedGame = source["PlayedGame"];
    this.StartedGame = source["StartedGame"];
    this.WasInjured = source["WasInjured"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryType = source["InjuryType"];
    this.RevealResults = source["RevealResults"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.GameType = source["GameType"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLPlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  CollegeID: number;
  College: string;
  TeamAbbr: string;
  Experience: number;
  HighSchool: string;
  Hometown: string;
  State: string;
  IsActive: boolean;
  IsPracticeSquad: boolean;
  IsFreeAgent: boolean;
  IsWaived: boolean;
  IsOnTradeBlock: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  NegotiationRound: number;
  SigningRound: number;
  MinimumValue: number;
  DraftedTeamID: number;
  DraftedTeam: string;
  DraftedRound: number;
  DraftPickID: number;
  DraftedPick: number;
  ShowLetterGrade: boolean;
  HasProgressed: boolean;
  Rejections: number;
  ProBowls: number;
  TagType: number;
  Stats: NFLPlayerStats[];
  SeasonStats: NFLPlayerSeasonStats;
  Contract: NFLContract;
  Offers: FreeAgencyOffer[];
  WaiverOffers: NFLWaiverOffer[];
  Extensions: NFLExtensionOffer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Experience = source["Experience"];
    this.HighSchool = source["HighSchool"];
    this.Hometown = source["Hometown"];
    this.State = source["State"];
    this.IsActive = source["IsActive"];
    this.IsPracticeSquad = source["IsPracticeSquad"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsWaived = source["IsWaived"];
    this.IsOnTradeBlock = source["IsOnTradeBlock"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.NegotiationRound = source["NegotiationRound"];
    this.SigningRound = source["SigningRound"];
    this.MinimumValue = source["MinimumValue"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeam = source["DraftedTeam"];
    this.DraftedRound = source["DraftedRound"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftedPick = source["DraftedPick"];
    this.ShowLetterGrade = source["ShowLetterGrade"];
    this.HasProgressed = source["HasProgressed"];
    this.Rejections = source["Rejections"];
    this.ProBowls = source["ProBowls"];
    this.TagType = source["TagType"];
    this.Stats = this.convertValues(source["Stats"], NFLPlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NFLPlayerSeasonStats
    );
    this.Contract = this.convertValues(source["Contract"], NFLContract);
    this.Offers = this.convertValues(source["Offers"], FreeAgencyOffer);
    this.WaiverOffers = this.convertValues(
      source["WaiverOffers"],
      NFLWaiverOffer
    );
    this.Extensions = this.convertValues(
      source["Extensions"],
      NFLExtensionOffer
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLDepthChartPosition {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  DepthChartID: number;
  PlayerID: number;
  Position: string;
  PositionLevel: string;
  FirstName: string;
  LastName: string;
  OriginalPosition: string;
  NFLPlayer: NFLPlayer;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.DepthChartID = source["DepthChartID"];
    this.PlayerID = source["PlayerID"];
    this.Position = source["Position"];
    this.PositionLevel = source["PositionLevel"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.OriginalPosition = source["OriginalPosition"];
    this.NFLPlayer = this.convertValues(source["NFLPlayer"], NFLPlayer);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLDepthChart {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  DepthChartPlayers: NFLDepthChartPosition[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.DepthChartPlayers = this.convertValues(
      source["DepthChartPlayers"],
      NFLDepthChartPosition
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTeamSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  SeasonID: number;
  Year: number;
  PointsScored: number;
  PointsAgainst: number;
  TwoPointTries: number;
  TwoPointSucceed: number;
  PassingYards: number;
  PassingAttempts: number;
  PassingCompletions: number;
  LongestPass: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  QBRating: number;
  QBSacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingYardsPerAttempt: number;
  LongestRush: number;
  RushingTouchdowns: number;
  RushingFumbles: number;
  ReceivingTargets: number;
  ReceivingCatches: number;
  ReceivingYards: number;
  YardsPerCatch: number;
  ReceivingTouchdowns: number;
  ReceivingFumbles: number;
  PassingYardsAllowed: number;
  PassingTDsAllowed: number;
  PassingCompletionsAllowed: number;
  RushingYardsAllowed: number;
  RushingTDsAllowed: number;
  RushingYardsPerAttemptAllowed: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  DefensiveSacks: number;
  ForcedFumbles: number;
  FumblesRecovered: number;
  DefensiveInterceptions: number;
  TurnoverYards: number;
  DefensiveTDs: number;
  Safeties: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  ExtraPointPercentage: number;
  FieldGoalsMade: number;
  FieldGoalsAttempted: number;
  FieldGoalsPercentage: number;
  LongestFieldGoal: number;
  KickoffTBs: number;
  PuntTBs: number;
  Punts: number;
  PuntYards: number;
  PuntsInside20: number;
  PuntAverage: number;
  Inside20YardLine: number;
  KickReturnYards: number;
  KickReturnTDs: number;
  PuntReturnYards: number;
  PuntReturnTDs: number;
  OffensivePenalties: number;
  DefensivePenalties: number;
  OffPenaltyYards: number;
  DefPenaltyYards: number;
  Score1Q: number;
  Score2Q: number;
  Score3Q: number;
  Score4Q: number;
  Score5Q: number;
  Score6Q: number;
  Score7Q: number;
  ScoreOT: number;
  OffensiveScheme: string;
  DefensiveScheme: string;
  OffensiveSnaps: number;
  DefensiveSnaps: number;
  SpecialTeamSnaps: number;
  GameType: number;
  RevealResults: boolean;
  GamesPlayed: number;
  TotalOffensiveYards: number;
  TotalYardsAllowed: number;
  Fumbles: number;
  Tackles: number;
  Turnovers: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.PointsScored = source["PointsScored"];
    this.PointsAgainst = source["PointsAgainst"];
    this.TwoPointTries = source["TwoPointTries"];
    this.TwoPointSucceed = source["TwoPointSucceed"];
    this.PassingYards = source["PassingYards"];
    this.PassingAttempts = source["PassingAttempts"];
    this.PassingCompletions = source["PassingCompletions"];
    this.LongestPass = source["LongestPass"];
    this.PassingTouchdowns = source["PassingTouchdowns"];
    this.PassingInterceptions = source["PassingInterceptions"];
    this.QBRating = source["QBRating"];
    this.QBSacks = source["QBSacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingYardsPerAttempt = source["RushingYardsPerAttempt"];
    this.LongestRush = source["LongestRush"];
    this.RushingTouchdowns = source["RushingTouchdowns"];
    this.RushingFumbles = source["RushingFumbles"];
    this.ReceivingTargets = source["ReceivingTargets"];
    this.ReceivingCatches = source["ReceivingCatches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.YardsPerCatch = source["YardsPerCatch"];
    this.ReceivingTouchdowns = source["ReceivingTouchdowns"];
    this.ReceivingFumbles = source["ReceivingFumbles"];
    this.PassingYardsAllowed = source["PassingYardsAllowed"];
    this.PassingTDsAllowed = source["PassingTDsAllowed"];
    this.PassingCompletionsAllowed = source["PassingCompletionsAllowed"];
    this.RushingYardsAllowed = source["RushingYardsAllowed"];
    this.RushingTDsAllowed = source["RushingTDsAllowed"];
    this.RushingYardsPerAttemptAllowed =
      source["RushingYardsPerAttemptAllowed"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.DefensiveSacks = source["DefensiveSacks"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.FumblesRecovered = source["FumblesRecovered"];
    this.DefensiveInterceptions = source["DefensiveInterceptions"];
    this.TurnoverYards = source["TurnoverYards"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.Safeties = source["Safeties"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.ExtraPointPercentage = source["ExtraPointPercentage"];
    this.FieldGoalsMade = source["FieldGoalsMade"];
    this.FieldGoalsAttempted = source["FieldGoalsAttempted"];
    this.FieldGoalsPercentage = source["FieldGoalsPercentage"];
    this.LongestFieldGoal = source["LongestFieldGoal"];
    this.KickoffTBs = source["KickoffTBs"];
    this.PuntTBs = source["PuntTBs"];
    this.Punts = source["Punts"];
    this.PuntYards = source["PuntYards"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.PuntAverage = source["PuntAverage"];
    this.Inside20YardLine = source["Inside20YardLine"];
    this.KickReturnYards = source["KickReturnYards"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.OffensivePenalties = source["OffensivePenalties"];
    this.DefensivePenalties = source["DefensivePenalties"];
    this.OffPenaltyYards = source["OffPenaltyYards"];
    this.DefPenaltyYards = source["DefPenaltyYards"];
    this.Score1Q = source["Score1Q"];
    this.Score2Q = source["Score2Q"];
    this.Score3Q = source["Score3Q"];
    this.Score4Q = source["Score4Q"];
    this.Score5Q = source["Score5Q"];
    this.Score6Q = source["Score6Q"];
    this.Score7Q = source["Score7Q"];
    this.ScoreOT = source["ScoreOT"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.OffensiveSnaps = source["OffensiveSnaps"];
    this.DefensiveSnaps = source["DefensiveSnaps"];
    this.SpecialTeamSnaps = source["SpecialTeamSnaps"];
    this.GameType = source["GameType"];
    this.RevealResults = source["RevealResults"];
    this.GamesPlayed = source["GamesPlayed"];
    this.TotalOffensiveYards = source["TotalOffensiveYards"];
    this.TotalYardsAllowed = source["TotalYardsAllowed"];
    this.Fumbles = source["Fumbles"];
    this.QBRating = source["QBRating"];
    this.Tackles = source["Tackles"];
    this.Turnovers = source["Turnovers"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTeamStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  GameID: number;
  WeekID: number;
  SeasonID: number;
  OpposingTeam: string;
  IsPreseasonGame: boolean;
  PointsScored: number;
  PointsAgainst: number;
  TwoPointTries: number;
  TwoPointSucceed: number;
  PassingYards: number;
  PassingAttempts: number;
  PassingCompletions: number;
  LongestPass: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  QBRating: number;
  QBSacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingYardsPerAttempt: number;
  LongestRush: number;
  RushingTouchdowns: number;
  RushingFumbles: number;
  ReceivingTargets: number;
  ReceivingCatches: number;
  ReceivingYards: number;
  YardsPerCatch: number;
  ReceivingTouchdowns: number;
  ReceivingFumbles: number;
  PassingYardsAllowed: number;
  PassingTDsAllowed: number;
  PassingCompletionsAllowed: number;
  RushingYardsAllowed: number;
  RushingTDsAllowed: number;
  RushingYardsPerAttemptAllowed: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  DefensiveSacks: number;
  ForcedFumbles: number;
  FumblesRecovered: number;
  DefensiveInterceptions: number;
  TurnoverYards: number;
  DefensiveTDs: number;
  Safeties: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  ExtraPointPercentage: number;
  FieldGoalsMade: number;
  FieldGoalsAttempted: number;
  FieldGoalsPercentage: number;
  LongestFieldGoal: number;
  KickoffTBs: number;
  PuntTBs: number;
  Punts: number;
  PuntYards: number;
  PuntsInside20: number;
  PuntAverage: number;
  Inside20YardLine: number;
  KickReturnYards: number;
  KickReturnTDs: number;
  PuntReturnYards: number;
  PuntReturnTDs: number;
  OffensivePenalties: number;
  DefensivePenalties: number;
  OffPenaltyYards: number;
  DefPenaltyYards: number;
  Score1Q: number;
  Score2Q: number;
  Score3Q: number;
  Score4Q: number;
  Score5Q: number;
  Score6Q: number;
  Score7Q: number;
  ScoreOT: number;
  OffensiveScheme: string;
  DefensiveScheme: string;
  OffensiveSnaps: number;
  DefensiveSnaps: number;
  SpecialTeamSnaps: number;
  GameType: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.GameID = source["GameID"];
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
    this.OpposingTeam = source["OpposingTeam"];
    this.IsPreseasonGame = source["IsPreseasonGame"];
    this.PointsScored = source["PointsScored"];
    this.PointsAgainst = source["PointsAgainst"];
    this.TwoPointTries = source["TwoPointTries"];
    this.TwoPointSucceed = source["TwoPointSucceed"];
    this.PassingYards = source["PassingYards"];
    this.PassingAttempts = source["PassingAttempts"];
    this.PassingCompletions = source["PassingCompletions"];
    this.LongestPass = source["LongestPass"];
    this.PassingTouchdowns = source["PassingTouchdowns"];
    this.PassingInterceptions = source["PassingInterceptions"];
    this.QBRating = source["QBRating"];
    this.QBSacks = source["QBSacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingYardsPerAttempt = source["RushingYardsPerAttempt"];
    this.LongestRush = source["LongestRush"];
    this.RushingTouchdowns = source["RushingTouchdowns"];
    this.RushingFumbles = source["RushingFumbles"];
    this.ReceivingTargets = source["ReceivingTargets"];
    this.ReceivingCatches = source["ReceivingCatches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.YardsPerCatch = source["YardsPerCatch"];
    this.ReceivingTouchdowns = source["ReceivingTouchdowns"];
    this.ReceivingFumbles = source["ReceivingFumbles"];
    this.PassingYardsAllowed = source["PassingYardsAllowed"];
    this.PassingTDsAllowed = source["PassingTDsAllowed"];
    this.PassingCompletionsAllowed = source["PassingCompletionsAllowed"];
    this.RushingYardsAllowed = source["RushingYardsAllowed"];
    this.RushingTDsAllowed = source["RushingTDsAllowed"];
    this.RushingYardsPerAttemptAllowed =
      source["RushingYardsPerAttemptAllowed"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.DefensiveSacks = source["DefensiveSacks"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.FumblesRecovered = source["FumblesRecovered"];
    this.DefensiveInterceptions = source["DefensiveInterceptions"];
    this.TurnoverYards = source["TurnoverYards"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.Safeties = source["Safeties"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.ExtraPointPercentage = source["ExtraPointPercentage"];
    this.FieldGoalsMade = source["FieldGoalsMade"];
    this.FieldGoalsAttempted = source["FieldGoalsAttempted"];
    this.FieldGoalsPercentage = source["FieldGoalsPercentage"];
    this.LongestFieldGoal = source["LongestFieldGoal"];
    this.KickoffTBs = source["KickoffTBs"];
    this.PuntTBs = source["PuntTBs"];
    this.Punts = source["Punts"];
    this.PuntYards = source["PuntYards"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.PuntAverage = source["PuntAverage"];
    this.Inside20YardLine = source["Inside20YardLine"];
    this.KickReturnYards = source["KickReturnYards"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.OffensivePenalties = source["OffensivePenalties"];
    this.DefensivePenalties = source["DefensivePenalties"];
    this.OffPenaltyYards = source["OffPenaltyYards"];
    this.DefPenaltyYards = source["DefPenaltyYards"];
    this.Score1Q = source["Score1Q"];
    this.Score2Q = source["Score2Q"];
    this.Score3Q = source["Score3Q"];
    this.Score4Q = source["Score4Q"];
    this.Score5Q = source["Score5Q"];
    this.Score6Q = source["Score6Q"];
    this.Score7Q = source["Score7Q"];
    this.ScoreOT = source["ScoreOT"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.OffensiveSnaps = source["OffensiveSnaps"];
    this.DefensiveSnaps = source["DefensiveSnaps"];
    this.SpecialTeamSnaps = source["SpecialTeamSnaps"];
    this.GameType = source["GameType"];
    this.RevealResults = source["RevealResults"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLDraftPick {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  SeasonID: number;
  Season: number;
  DrafteeID: number;
  DraftRound: number;
  DraftNumber: number;
  TeamID: number;
  Team: string;
  OriginalTeamID: number;
  OriginalTeam: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  DraftValue: number;
  Notes: string;
  SelectedPlayerID: number;
  SelectedPlayerName: string;
  SelectedPlayerPosition: string;
  IsCompensation: boolean;
  IsVoid: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.DrafteeID = source["DrafteeID"];
    this.DraftRound = source["DraftRound"];
    this.DraftNumber = source["DraftNumber"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.OriginalTeamID = source["OriginalTeamID"];
    this.OriginalTeam = source["OriginalTeam"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.DraftValue = source["DraftValue"];
    this.Notes = source["Notes"];
    this.SelectedPlayerID = source["SelectedPlayerID"];
    this.SelectedPlayerName = source["SelectedPlayerName"];
    this.SelectedPlayerPosition = source["SelectedPlayerPosition"];
    this.IsCompensation = source["IsCompensation"];
    this.IsVoid = source["IsVoid"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLContract {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  PlayerID: number;
  NFLPlayerID: number;
  TeamID: number;
  Team: string;
  OriginalTeamID: number;
  OriginalTeam: string;
  ContractLength: number;
  Y1BaseSalary: number;
  Y1Bonus: number;
  Y2BaseSalary: number;
  Y2Bonus: number;
  Y3BaseSalary: number;
  Y3Bonus: number;
  Y4BaseSalary: number;
  Y4Bonus: number;
  Y5BaseSalary: number;
  Y5Bonus: number;
  BonusPercentage: number;
  ContractType: string;
  ContractValue: number;
  SigningValue: number;
  IsActive: boolean;
  IsComplete: boolean;
  IsExtended: boolean;
  HasProgressed: boolean;
  PlayerRetired: boolean;
  TagType: number;
  IsTagged: boolean;
  IsCut: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.OriginalTeamID = source["OriginalTeamID"];
    this.OriginalTeam = source["OriginalTeam"];
    this.ContractLength = source["ContractLength"];
    this.Y1BaseSalary = source["Y1BaseSalary"];
    this.Y1Bonus = source["Y1Bonus"];
    this.Y2BaseSalary = source["Y2BaseSalary"];
    this.Y2Bonus = source["Y2Bonus"];
    this.Y3BaseSalary = source["Y3BaseSalary"];
    this.Y3Bonus = source["Y3Bonus"];
    this.Y4BaseSalary = source["Y4BaseSalary"];
    this.Y4Bonus = source["Y4Bonus"];
    this.Y5BaseSalary = source["Y5BaseSalary"];
    this.Y5Bonus = source["Y5Bonus"];
    this.BonusPercentage = source["BonusPercentage"];
    this.ContractType = source["ContractType"];
    this.ContractValue = source["ContractValue"];
    this.SigningValue = source["SigningValue"];
    this.IsActive = source["IsActive"];
    this.IsComplete = source["IsComplete"];
    this.IsExtended = source["IsExtended"];
    this.HasProgressed = source["HasProgressed"];
    this.PlayerRetired = source["PlayerRetired"];
    this.TagType = source["TagType"];
    this.IsTagged = source["IsTagged"];
    this.IsCut = source["IsCut"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLCapsheet {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLTeamID: number;
  Y1Bonus: number;
  Y1Salary: number;
  Y1CapHit: number;
  Y2Bonus: number;
  Y2Salary: number;
  Y2CapHit: number;
  Y3Bonus: number;
  Y3Salary: number;
  Y3CapHit: number;
  Y4Bonus: number;
  Y4Salary: number;
  Y4CapHit: number;
  Y5Bonus: number;
  Y5Salary: number;
  Y5CapHit: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLTeamID = source["NFLTeamID"];
    this.Y1Bonus = source["Y1Bonus"];
    this.Y1Salary = source["Y1Salary"];
    this.Y1CapHit = source["Y1CapHit"];
    this.Y2Bonus = source["Y2Bonus"];
    this.Y2Salary = source["Y2Salary"];
    this.Y2CapHit = source["Y2CapHit"];
    this.Y3Bonus = source["Y3Bonus"];
    this.Y3Salary = source["Y3Salary"];
    this.Y3CapHit = source["Y3CapHit"];
    this.Y4Bonus = source["Y4Bonus"];
    this.Y4Salary = source["Y4Salary"];
    this.Y4CapHit = source["Y4CapHit"];
    this.Y5Bonus = source["Y5Bonus"];
    this.Y5Salary = source["Y5Salary"];
    this.Y5CapHit = source["Y5CapHit"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTeam {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamName: string;
  Mascot: string;
  TeamAbbr: string;
  Coach: string;
  City: string;
  State: string;
  Country: string;
  StadiumID: number;
  Stadium: string;
  StadiumCapacity: number;
  RecordAttendance: number;
  Enrollment: number;
  FirstPlayed: number;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  DiscordID: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  PenaltyMarks: number;
  ConferenceID: number;
  Conference: string;
  DivisionID: number;
  Division: string;
  NFLOwnerID: number;
  NFLOwnerName: string;
  NFLCoachID: number;
  NFLCoachName: string;
  NFLGMID: number;
  NFLGMName: string;
  NFLAssistantID: number;
  NFLAssistantName: string;
  WaiverOrder: number;
  UsedTagThisSeason: boolean;
  Capsheet: NFLCapsheet;
  Contracts: NFLContract[];
  DraftPicks: NFLDraftPick[];
  TeamStats: NFLTeamStats[];
  TeamSeasonStats: NFLTeamSeasonStats[];
  TeamDepthChart: NFLDepthChart;
  TeamGameplan: NFLGameplan;
  Standings: NFLStandings[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamName = source["TeamName"];
    this.Mascot = source["Mascot"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Coach = source["Coach"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.StadiumID = source["StadiumID"];
    this.Stadium = source["Stadium"];
    this.StadiumCapacity = source["StadiumCapacity"];
    this.RecordAttendance = source["RecordAttendance"];
    this.Enrollment = source["Enrollment"];
    this.FirstPlayed = source["FirstPlayed"];
    this.ColorOne = source["ColorOne"];
    this.ColorTwo = source["ColorTwo"];
    this.ColorThree = source["ColorThree"];
    this.DiscordID = source["DiscordID"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.PenaltyMarks = source["PenaltyMarks"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.DivisionID = source["DivisionID"];
    this.Division = source["Division"];
    this.NFLOwnerID = source["NFLOwnerID"];
    this.NFLOwnerName = source["NFLOwnerName"];
    this.NFLCoachID = source["NFLCoachID"];
    this.NFLCoachName = source["NFLCoachName"];
    this.NFLGMID = source["NFLGMID"];
    this.NFLGMName = source["NFLGMName"];
    this.NFLAssistantID = source["NFLAssistantID"];
    this.NFLAssistantName = source["NFLAssistantName"];
    this.WaiverOrder = source["WaiverOrder"];
    this.UsedTagThisSeason = source["UsedTagThisSeason"];
    this.Capsheet = this.convertValues(source["Capsheet"], NFLCapsheet);
    this.Contracts = this.convertValues(source["Contracts"], NFLContract);
    this.DraftPicks = this.convertValues(source["DraftPicks"], NFLDraftPick);
    this.TeamStats = this.convertValues(source["TeamStats"], NFLTeamStats);
    this.TeamSeasonStats = this.convertValues(
      source["TeamSeasonStats"],
      NFLTeamSeasonStats
    );
    this.TeamDepthChart = this.convertValues(
      source["TeamDepthChart"],
      NFLDepthChart
    );
    this.TeamGameplan = this.convertValues(source["TeamGameplan"], NFLGameplan);
    this.Standings = this.convertValues(source["Standings"], NFLStandings);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeGame {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  WeekID: number;
  Week: number;
  SeasonID: number;
  HomeTeamRank: number;
  HomeTeamID: number;
  HomeTeam: string;
  HomeTeamCoach: string;
  HomeTeamWin: boolean;
  AwayTeamRank: number;
  AwayTeamID: number;
  AwayTeam: string;
  AwayTeamCoach: string;
  AwayTeamWin: boolean;
  MVP: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  TimeSlot: string;
  StadiumID: number;
  Stadium: string;
  City: string;
  State: string;
  Region: string;
  LowTemp: number;
  HighTemp: number;
  GameTemp: number;
  Cloud: string;
  Precip: string;
  WindSpeed: number;
  WindCategory: string;
  IsNeutral: boolean;
  IsDomed: boolean;
  IsNightGame: boolean;
  IsConference: boolean;
  IsDivisional: boolean;
  IsConferenceChampionship: boolean;
  IsBowlGame: boolean;
  IsPlayoffGame: boolean;
  IsNationalChampionship: boolean;
  IsRivalryGame: boolean;
  GameComplete: boolean;
  IsSpringGame: boolean;
  GameTitle: string;
  NextGameID: number;
  NextGameHOA: string;
  HomePreviousBye: boolean;
  AwayPreviousBye: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.HomeTeamRank = source["HomeTeamRank"];
    this.HomeTeamID = source["HomeTeamID"];
    this.HomeTeam = source["HomeTeam"];
    this.HomeTeamCoach = source["HomeTeamCoach"];
    this.HomeTeamWin = source["HomeTeamWin"];
    this.AwayTeamRank = source["AwayTeamRank"];
    this.AwayTeamID = source["AwayTeamID"];
    this.AwayTeam = source["AwayTeam"];
    this.AwayTeamCoach = source["AwayTeamCoach"];
    this.AwayTeamWin = source["AwayTeamWin"];
    this.MVP = source["MVP"];
    this.HomeTeamScore = source["HomeTeamScore"];
    this.AwayTeamScore = source["AwayTeamScore"];
    this.TimeSlot = source["TimeSlot"];
    this.StadiumID = source["StadiumID"];
    this.Stadium = source["Stadium"];
    this.City = source["City"];
    this.State = source["State"];
    this.Region = source["Region"];
    this.LowTemp = source["LowTemp"];
    this.HighTemp = source["HighTemp"];
    this.GameTemp = source["GameTemp"];
    this.Cloud = source["Cloud"];
    this.Precip = source["Precip"];
    this.WindSpeed = source["WindSpeed"];
    this.WindCategory = source["WindCategory"];
    this.IsNeutral = source["IsNeutral"];
    this.IsDomed = source["IsDomed"];
    this.IsNightGame = source["IsNightGame"];
    this.IsConference = source["IsConference"];
    this.IsDivisional = source["IsDivisional"];
    this.IsConferenceChampionship = source["IsConferenceChampionship"];
    this.IsBowlGame = source["IsBowlGame"];
    this.IsPlayoffGame = source["IsPlayoffGame"];
    this.IsNationalChampionship = source["IsNationalChampionship"];
    this.IsRivalryGame = source["IsRivalryGame"];
    this.GameComplete = source["GameComplete"];
    this.IsSpringGame = source["IsSpringGame"];
    this.GameTitle = source["GameTitle"];
    this.NextGameID = source["NextGameID"];
    this.NextGameHOA = source["NextGameHOA"];
    this.HomePreviousBye = source["HomePreviousBye"];
    this.AwayPreviousBye = source["AwayPreviousBye"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class Notification {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  TeamID: number;
  League: string;
  NotificationType: string;
  Message: string;
  Subject: string;
  IsRead: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.TeamID = source["TeamID"];
    this.League = source["League"];
    this.NotificationType = source["NotificationType"];
    this.Message = source["Message"];
    this.Subject = source["Subject"];
    this.IsRead = source["IsRead"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NewsLog {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  WeekID: number;
  Week: number;
  SeasonID: number;
  TeamID: number;
  MessageType: string;
  Message: string;
  League: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.TeamID = source["TeamID"];
    this.MessageType = source["MessageType"];
    this.Message = source["Message"];
    this.League = source["League"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class LeadingTeams {
  TeamID: number;
  TeamName: string;
  TeamAbbr: string;
  Odds: number;
  HasScholarship: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamID = source["TeamID"];
    this.TeamName = source["TeamName"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Odds = source["Odds"];
    this.HasScholarship = source["HasScholarship"];
  }
}
export class Croot {
  ID: number;
  PlayerID: number;
  TeamID: number;
  College: string;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Height: number;
  Weight: number;
  Stars: number;
  PotentialGrade: string;
  Personality: string;
  RecruitingBias: string;
  AcademicBias: string;
  WorkEthic: string;
  HighSchool: string;
  City: string;
  State: string;
  AffinityOne: string;
  AffinityTwo: string;
  RecruitingStatus: string;
  RecruitModifier: number;
  IsCustomCroot: boolean;
  CustomCrootFor: string;
  IsSigned: boolean;
  OverallGrade: string;
  TotalRank: number;
  LeadingTeams: LeadingTeams[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.College = source["College"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Stars = source["Stars"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.AcademicBias = source["AcademicBias"];
    this.WorkEthic = source["WorkEthic"];
    this.HighSchool = source["HighSchool"];
    this.City = source["City"];
    this.State = source["State"];
    this.AffinityOne = source["AffinityOne"];
    this.AffinityTwo = source["AffinityTwo"];
    this.RecruitingStatus = source["RecruitingStatus"];
    this.RecruitModifier = source["RecruitModifier"];
    this.IsCustomCroot = source["IsCustomCroot"];
    this.CustomCrootFor = source["CustomCrootFor"];
    this.IsSigned = source["IsSigned"];
    this.OverallGrade = source["OverallGrade"];
    this.TotalRank = source["TotalRank"];
    this.LeadingTeams = this.convertValues(
      source["LeadingTeams"],
      LeadingTeams
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeStandings {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  TeamName: string;
  SeasonID: number;
  Season: number;
  LeagueID: number;
  LeagueName: string;
  ConferenceID: number;
  ConferenceName: string;
  DivisionID: number;
  PostSeasonStatus: string;
  IsFBS: boolean;
  Rank: number;
  TotalWins: number;
  TotalLosses: number;
  ConferenceWins: number;
  ConferenceLosses: number;
  RankedWins: number;
  RankedLosses: number;
  PointsFor: number;
  PointsAgainst: number;
  Streak: number;
  HomeWins: number;
  AwayWins: number;
  Coach: string;
  TeamAbbr: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.TeamName = source["TeamName"];
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.LeagueID = source["LeagueID"];
    this.LeagueName = source["LeagueName"];
    this.ConferenceID = source["ConferenceID"];
    this.ConferenceName = source["ConferenceName"];
    this.DivisionID = source["DivisionID"];
    this.PostSeasonStatus = source["PostSeasonStatus"];
    this.IsFBS = source["IsFBS"];
    this.Rank = source["Rank"];
    this.TotalWins = source["TotalWins"];
    this.TotalLosses = source["TotalLosses"];
    this.ConferenceWins = source["ConferenceWins"];
    this.ConferenceLosses = source["ConferenceLosses"];
    this.RankedWins = source["RankedWins"];
    this.RankedLosses = source["RankedLosses"];
    this.PointsFor = source["PointsFor"];
    this.PointsAgainst = source["PointsAgainst"];
    this.Streak = source["Streak"];
    this.HomeWins = source["HomeWins"];
    this.AwayWins = source["AwayWins"];
    this.Coach = source["Coach"];
    this.TeamAbbr = source["TeamAbbr"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePromise {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  CollegePlayerID: number;
  PromiseType: string;
  PromiseWeight: string;
  Benchmark: number;
  BenchmarkStr: string;
  PromiseMade: boolean;
  IsFullfilled: boolean;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.CollegePlayerID = source["CollegePlayerID"];
    this.PromiseType = source["PromiseType"];
    this.PromiseWeight = source["PromiseWeight"];
    this.Benchmark = source["Benchmark"];
    this.BenchmarkStr = source["BenchmarkStr"];
    this.PromiseMade = source["PromiseMade"];
    this.IsFullfilled = source["IsFullfilled"];
    this.IsActive = source["IsActive"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NullInt64 {
  Int64: number;
  Valid: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Int64 = source["Int64"];
    this.Valid = source["Valid"];
  }
}
export class TransferPortalProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  SeasonID: number;
  CollegePlayerID: number;
  ProfileID: number;
  PromiseID: NullInt64;
  TeamAbbreviation: string;
  TotalPoints: number;
  CurrentWeeksPoints: number;
  PreviouslySpentPoints: number;
  SpendingCount: number;
  RemovedFromBoard: boolean;
  RolledOnPromise: boolean;
  LockProfile: boolean;
  IsSigned: boolean;
  Recruiter: string;
  CollegePlayer: CollegePlayer;
  Promise: CollegePromise;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.SeasonID = source["SeasonID"];
    this.CollegePlayerID = source["CollegePlayerID"];
    this.ProfileID = source["ProfileID"];
    this.PromiseID = this.convertValues(source["PromiseID"], NullInt64);
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.TotalPoints = source["TotalPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.PreviouslySpentPoints = source["PreviouslySpentPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.RolledOnPromise = source["RolledOnPromise"];
    this.LockProfile = source["LockProfile"];
    this.IsSigned = source["IsSigned"];
    this.Recruiter = source["Recruiter"];
    this.CollegePlayer = this.convertValues(
      source["CollegePlayer"],
      CollegePlayer
    );
    this.Promise = this.convertValues(source["Promise"], CollegePromise);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePlayerSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  CollegePlayerID: number;
  SeasonID: number;
  Year: number;
  IsRedshirt: boolean;
  PassingYards: number;
  PassAttempts: number;
  PassCompletions: number;
  PassingTDs: number;
  Interceptions: number;
  LongestPass: number;
  Sacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingTDs: number;
  Fumbles: number;
  LongestRush: number;
  Targets: number;
  Catches: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  LongestReception: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  SacksMade: number;
  ForcedFumbles: number;
  RecoveredFumbles: number;
  PassDeflections: number;
  InterceptionsCaught: number;
  Safeties: number;
  DefensiveTDs: number;
  FGMade: number;
  FGAttempts: number;
  LongestFG: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  KickoffTouchbacks: number;
  Punts: number;
  GrossPuntDistance: number;
  NetPuntDistance: number;
  PuntTouchbacks: number;
  PuntsInside20: number;
  KickReturns: number;
  KickReturnTDs: number;
  KickReturnYards: number;
  PuntReturns: number;
  PuntReturnTDs: number;
  PuntReturnYards: number;
  STSoloTackles: number;
  STAssistedTackles: number;
  PuntsBlocked: number;
  FGBlocked: number;
  Snaps: number;
  Pancakes: number;
  SacksAllowed: number;
  PlayedGame: number;
  StartedGame: number;
  WasInjured: boolean;
  WeeksOfRecovery: number;
  InjuryType: string;
  RevealResults: boolean;
  TeamID: number;
  Team: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  GameType: number;
  GamesPlayed: number;
  QBRating: number;
  Tackles: number;
  RushingAvg: number;
  PassingAvg: number;
  ReceivingAvg: number;
  Completion: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.CollegePlayerID = source["CollegePlayerID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.IsRedshirt = source["IsRedshirt"];
    this.PassingYards = source["PassingYards"];
    this.PassAttempts = source["PassAttempts"];
    this.PassCompletions = source["PassCompletions"];
    this.PassingTDs = source["PassingTDs"];
    this.Interceptions = source["Interceptions"];
    this.LongestPass = source["LongestPass"];
    this.Sacks = source["Sacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingTDs = source["RushingTDs"];
    this.Fumbles = source["Fumbles"];
    this.LongestRush = source["LongestRush"];
    this.Targets = source["Targets"];
    this.Catches = source["Catches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.ReceivingTDs = source["ReceivingTDs"];
    this.LongestReception = source["LongestReception"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.SacksMade = source["SacksMade"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.RecoveredFumbles = source["RecoveredFumbles"];
    this.PassDeflections = source["PassDeflections"];
    this.InterceptionsCaught = source["InterceptionsCaught"];
    this.Safeties = source["Safeties"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.FGMade = source["FGMade"];
    this.FGAttempts = source["FGAttempts"];
    this.LongestFG = source["LongestFG"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.KickoffTouchbacks = source["KickoffTouchbacks"];
    this.Punts = source["Punts"];
    this.GrossPuntDistance = source["GrossPuntDistance"];
    this.NetPuntDistance = source["NetPuntDistance"];
    this.PuntTouchbacks = source["PuntTouchbacks"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.KickReturns = source["KickReturns"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.KickReturnYards = source["KickReturnYards"];
    this.PuntReturns = source["PuntReturns"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.STSoloTackles = source["STSoloTackles"];
    this.STAssistedTackles = source["STAssistedTackles"];
    this.PuntsBlocked = source["PuntsBlocked"];
    this.FGBlocked = source["FGBlocked"];
    this.Snaps = source["Snaps"];
    this.Pancakes = source["Pancakes"];
    this.SacksAllowed = source["SacksAllowed"];
    this.PlayedGame = source["PlayedGame"];
    this.StartedGame = source["StartedGame"];
    this.WasInjured = source["WasInjured"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryType = source["InjuryType"];
    this.RevealResults = source["RevealResults"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.GameType = source["GameType"];
    this.GamesPlayed = source["GamesPlayed"];
    this.QBRating = source["QBRating"];
    this.Tackles = source["Tackles"];
    this.RushingAvg = source["RushingAvg"];
    this.PassingAvg = source["PassingAvg"];
    this.ReceivingAvg = source["ReceivingAvg"];
    this.Completion = source["Completion"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePlayerStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  CollegePlayerID: number;
  GameID: number;
  WeekID: number;
  SeasonID: number;
  OpposingTeam: string;
  Year: number;
  IsRedshirt: boolean;
  PassingYards: number;
  PassAttempts: number;
  PassCompletions: number;
  PassingTDs: number;
  Interceptions: number;
  LongestPass: number;
  Sacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingTDs: number;
  Fumbles: number;
  LongestRush: number;
  Targets: number;
  Catches: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  LongestReception: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  SacksMade: number;
  ForcedFumbles: number;
  RecoveredFumbles: number;
  PassDeflections: number;
  InterceptionsCaught: number;
  Safeties: number;
  DefensiveTDs: number;
  FGMade: number;
  FGAttempts: number;
  LongestFG: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  KickoffTouchbacks: number;
  Punts: number;
  GrossPuntDistance: number;
  NetPuntDistance: number;
  PuntTouchbacks: number;
  PuntsInside20: number;
  KickReturns: number;
  KickReturnTDs: number;
  KickReturnYards: number;
  PuntReturns: number;
  PuntReturnTDs: number;
  PuntReturnYards: number;
  STSoloTackles: number;
  STAssistedTackles: number;
  PuntsBlocked: number;
  FGBlocked: number;
  Snaps: number;
  Pancakes: number;
  SacksAllowed: number;
  PlayedGame: number;
  StartedGame: number;
  WasInjured: boolean;
  WeeksOfRecovery: number;
  InjuryType: string;
  RevealResults: boolean;
  TeamID: number;
  Team: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  GameType: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.CollegePlayerID = source["CollegePlayerID"];
    this.GameID = source["GameID"];
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
    this.OpposingTeam = source["OpposingTeam"];
    this.Year = source["Year"];
    this.IsRedshirt = source["IsRedshirt"];
    this.PassingYards = source["PassingYards"];
    this.PassAttempts = source["PassAttempts"];
    this.PassCompletions = source["PassCompletions"];
    this.PassingTDs = source["PassingTDs"];
    this.Interceptions = source["Interceptions"];
    this.LongestPass = source["LongestPass"];
    this.Sacks = source["Sacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingTDs = source["RushingTDs"];
    this.Fumbles = source["Fumbles"];
    this.LongestRush = source["LongestRush"];
    this.Targets = source["Targets"];
    this.Catches = source["Catches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.ReceivingTDs = source["ReceivingTDs"];
    this.LongestReception = source["LongestReception"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.SacksMade = source["SacksMade"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.RecoveredFumbles = source["RecoveredFumbles"];
    this.PassDeflections = source["PassDeflections"];
    this.InterceptionsCaught = source["InterceptionsCaught"];
    this.Safeties = source["Safeties"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.FGMade = source["FGMade"];
    this.FGAttempts = source["FGAttempts"];
    this.LongestFG = source["LongestFG"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.KickoffTouchbacks = source["KickoffTouchbacks"];
    this.Punts = source["Punts"];
    this.GrossPuntDistance = source["GrossPuntDistance"];
    this.NetPuntDistance = source["NetPuntDistance"];
    this.PuntTouchbacks = source["PuntTouchbacks"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.KickReturns = source["KickReturns"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.KickReturnYards = source["KickReturnYards"];
    this.PuntReturns = source["PuntReturns"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.STSoloTackles = source["STSoloTackles"];
    this.STAssistedTackles = source["STAssistedTackles"];
    this.PuntsBlocked = source["PuntsBlocked"];
    this.FGBlocked = source["FGBlocked"];
    this.Snaps = source["Snaps"];
    this.Pancakes = source["Pancakes"];
    this.SacksAllowed = source["SacksAllowed"];
    this.PlayedGame = source["PlayedGame"];
    this.StartedGame = source["StartedGame"];
    this.WasInjured = source["WasInjured"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryType = source["InjuryType"];
    this.RevealResults = source["RevealResults"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.GameType = source["GameType"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  HighSchool: string;
  City: string;
  State: string;
  Year: number;
  IsRedshirt: boolean;
  IsRedshirting: boolean;
  HasGraduated: boolean;
  TransferStatus: number;
  TransferLikeliness: string;
  Stats: CollegePlayerStats[];
  SeasonStats: CollegePlayerSeasonStats;
  HasProgressed: boolean;
  WillDeclare: boolean;
  LegacyID: number;
  Profiles: TransferPortalProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.HighSchool = source["HighSchool"];
    this.City = source["City"];
    this.State = source["State"];
    this.Year = source["Year"];
    this.IsRedshirt = source["IsRedshirt"];
    this.IsRedshirting = source["IsRedshirting"];
    this.HasGraduated = source["HasGraduated"];
    this.TransferStatus = source["TransferStatus"];
    this.TransferLikeliness = source["TransferLikeliness"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
    this.HasProgressed = source["HasProgressed"];
    this.WillDeclare = source["WillDeclare"];
    this.LegacyID = source["LegacyID"];
    this.Profiles = this.convertValues(
      source["Profiles"],
      TransferPortalProfile
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeDepthChartPosition {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  DepthChartID: number;
  PlayerID: number;
  Position: string;
  PositionLevel: string;
  FirstName: string;
  LastName: string;
  OriginalPosition: string;
  CollegePlayer: CollegePlayer;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.DepthChartID = source["DepthChartID"];
    this.PlayerID = source["PlayerID"];
    this.Position = source["Position"];
    this.PositionLevel = source["PositionLevel"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.OriginalPosition = source["OriginalPosition"];
    this.CollegePlayer = this.convertValues(
      source["CollegePlayer"],
      CollegePlayer
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeTeamDepthChart {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  DepthChartPlayers: CollegeDepthChartPosition[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.DepthChartPlayers = this.convertValues(
      source["DepthChartPlayers"],
      CollegeDepthChartPosition
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeGameplan {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  OffensiveScheme: string;
  OffRunToPassRatio: number;
  OffFormation1Name: string;
  OffForm1Weight: number;
  OffForm1TraditionalRun: number;
  OffForm1OptionRun: number;
  OffForm1Pass: number;
  OffForm1RPO: number;
  OffFormation2Name: string;
  OffForm2Weight: number;
  OffForm2TraditionalRun: number;
  OffForm2OptionRun: number;
  OffForm2Pass: number;
  OffForm2RPO: number;
  OffFormation3Name: string;
  OffForm3Weight: number;
  OffForm3TraditionalRun: number;
  OffForm3OptionRun: number;
  OffForm3Pass: number;
  OffForm3RPO: number;
  OffFormation4Name: string;
  OffForm4Weight: number;
  OffForm4TraditionalRun: number;
  OffForm4OptionRun: number;
  OffForm4Pass: number;
  OffForm4RPO: number;
  OffFormation5Name: string;
  OffForm5Weight: number;
  OffForm5TraditionalRun: number;
  OffForm5OptionRun: number;
  OffForm5Pass: number;
  OffForm5RPO: number;
  RunnerDistributionQB: number;
  RunnerDistributionRB1: number;
  RunnerDistributionRB2: number;
  RunnerDistributionRB3: number;
  RunnerDistributionFB1: number;
  RunnerDistributionFB2: number;
  RunnerDistributionWR: number;
  RunnerDistributionWRPosition: string;
  RunnerDistributionWRID: number;
  RunOutsideLeft: number;
  RunOutsideRight: number;
  RunInsideLeft: number;
  RunInsideRight: number;
  RunPowerLeft: number;
  RunPowerRight: number;
  RunDrawLeft: number;
  RunDrawRight: number;
  ReadOptionLeft: number;
  ReadOptionRight: number;
  SpeedOptionLeft: number;
  SpeedOptionRight: number;
  InvertedOptionLeft: number;
  InvertedOptionRight: number;
  TripleOptionLeft: number;
  TripleOptionRight: number;
  PassQuick: number;
  PassShort: number;
  PassLong: number;
  PassScreen: number;
  PassPAShort: number;
  PassPALong: number;
  LeftVsRight: number;
  ChoiceOutside: number;
  ChoiceInside: number;
  ChoicePower: number;
  PeekOutside: number;
  PeekInside: number;
  PeekPower: number;
  TargetingWR1: number;
  TargetDepthWR1: string;
  TargetingWR2: number;
  TargetDepthWR2: string;
  TargetingWR3: number;
  TargetDepthWR3: string;
  TargetingWR4: number;
  TargetDepthWR4: string;
  TargetingWR5: number;
  TargetDepthWR5: string;
  TargetingTE1: number;
  TargetDepthTE1: string;
  TargetingTE2: number;
  TargetDepthTE2: string;
  TargetingTE3: number;
  TargetDepthTE3: string;
  TargetingRB1: number;
  TargetDepthRB1: string;
  TargetingRB2: number;
  TargetDepthRB2: string;
  TargetingFB1: number;
  TargetDepthFB1: string;
  DefensiveScheme: string;
  DefFormation1: string;
  DefFormation1RunToPass: number;
  DefFormation1BlitzWeight: number;
  DefFormation1BlitzAggression: string;
  DefFormation2: string;
  DefFormation2RunToPass: number;
  DefFormation2BlitzWeight: number;
  DefFormation2BlitzAggression: string;
  DefFormation3: string;
  DefFormation3RunToPass: number;
  DefFormation3BlitzWeight: number;
  DefFormation3BlitzAggression: string;
  DefFormation4: string;
  DefFormation4RunToPass: number;
  DefFormation4BlitzWeight: number;
  DefFormation4BlitzAggression: string;
  DefFormation5: string;
  DefFormation5RunToPass: number;
  DefFormation5BlitzWeight: number;
  DefFormation5BlitzAggression: string;
  BlitzSafeties: boolean;
  BlitzCorners: boolean;
  LinebackerCoverage: string;
  CornersCoverage: string;
  SafetiesCoverage: string;
  DiveFocus: number;
  PitchFocus: number;
  PrimaryHB: number;
  MaximumFGDistance: number;
  GoFor4AndShort: number;
  GoFor4AndLong: number;
  HasSchemePenalty: boolean;
  OffenseSchemePenalty: number;
  DefenseSchemePenalty: number;
  DefaultOffense: boolean;
  DefaultDefense: boolean;
  PreviousWeekBye: boolean;
  FocusPlays: string;
  DoubleTeam: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.OffRunToPassRatio = source["OffRunToPassRatio"];
    this.OffFormation1Name = source["OffFormation1Name"];
    this.OffForm1Weight = source["OffForm1Weight"];
    this.OffForm1TraditionalRun = source["OffForm1TraditionalRun"];
    this.OffForm1OptionRun = source["OffForm1OptionRun"];
    this.OffForm1Pass = source["OffForm1Pass"];
    this.OffForm1RPO = source["OffForm1RPO"];
    this.OffFormation2Name = source["OffFormation2Name"];
    this.OffForm2Weight = source["OffForm2Weight"];
    this.OffForm2TraditionalRun = source["OffForm2TraditionalRun"];
    this.OffForm2OptionRun = source["OffForm2OptionRun"];
    this.OffForm2Pass = source["OffForm2Pass"];
    this.OffForm2RPO = source["OffForm2RPO"];
    this.OffFormation3Name = source["OffFormation3Name"];
    this.OffForm3Weight = source["OffForm3Weight"];
    this.OffForm3TraditionalRun = source["OffForm3TraditionalRun"];
    this.OffForm3OptionRun = source["OffForm3OptionRun"];
    this.OffForm3Pass = source["OffForm3Pass"];
    this.OffForm3RPO = source["OffForm3RPO"];
    this.OffFormation4Name = source["OffFormation4Name"];
    this.OffForm4Weight = source["OffForm4Weight"];
    this.OffForm4TraditionalRun = source["OffForm4TraditionalRun"];
    this.OffForm4OptionRun = source["OffForm4OptionRun"];
    this.OffForm4Pass = source["OffForm4Pass"];
    this.OffForm4RPO = source["OffForm4RPO"];
    this.OffFormation5Name = source["OffFormation5Name"];
    this.OffForm5Weight = source["OffForm5Weight"];
    this.OffForm5TraditionalRun = source["OffForm5TraditionalRun"];
    this.OffForm5OptionRun = source["OffForm5OptionRun"];
    this.OffForm5Pass = source["OffForm5Pass"];
    this.OffForm5RPO = source["OffForm5RPO"];
    this.RunnerDistributionQB = source["RunnerDistributionQB"];
    this.RunnerDistributionRB1 = source["RunnerDistributionRB1"];
    this.RunnerDistributionRB2 = source["RunnerDistributionRB2"];
    this.RunnerDistributionRB3 = source["RunnerDistributionRB3"];
    this.RunnerDistributionFB1 = source["RunnerDistributionFB1"];
    this.RunnerDistributionFB2 = source["RunnerDistributionFB2"];
    this.RunnerDistributionWR = source["RunnerDistributionWR"];
    this.RunnerDistributionWRPosition = source["RunnerDistributionWRPosition"];
    this.RunnerDistributionWRID = source["RunnerDistributionWRID"];
    this.RunOutsideLeft = source["RunOutsideLeft"];
    this.RunOutsideRight = source["RunOutsideRight"];
    this.RunInsideLeft = source["RunInsideLeft"];
    this.RunInsideRight = source["RunInsideRight"];
    this.RunPowerLeft = source["RunPowerLeft"];
    this.RunPowerRight = source["RunPowerRight"];
    this.RunDrawLeft = source["RunDrawLeft"];
    this.RunDrawRight = source["RunDrawRight"];
    this.ReadOptionLeft = source["ReadOptionLeft"];
    this.ReadOptionRight = source["ReadOptionRight"];
    this.SpeedOptionLeft = source["SpeedOptionLeft"];
    this.SpeedOptionRight = source["SpeedOptionRight"];
    this.InvertedOptionLeft = source["InvertedOptionLeft"];
    this.InvertedOptionRight = source["InvertedOptionRight"];
    this.TripleOptionLeft = source["TripleOptionLeft"];
    this.TripleOptionRight = source["TripleOptionRight"];
    this.PassQuick = source["PassQuick"];
    this.PassShort = source["PassShort"];
    this.PassLong = source["PassLong"];
    this.PassScreen = source["PassScreen"];
    this.PassPAShort = source["PassPAShort"];
    this.PassPALong = source["PassPALong"];
    this.LeftVsRight = source["LeftVsRight"];
    this.ChoiceOutside = source["ChoiceOutside"];
    this.ChoiceInside = source["ChoiceInside"];
    this.ChoicePower = source["ChoicePower"];
    this.PeekOutside = source["PeekOutside"];
    this.PeekInside = source["PeekInside"];
    this.PeekPower = source["PeekPower"];
    this.TargetingWR1 = source["TargetingWR1"];
    this.TargetDepthWR1 = source["TargetDepthWR1"];
    this.TargetingWR2 = source["TargetingWR2"];
    this.TargetDepthWR2 = source["TargetDepthWR2"];
    this.TargetingWR3 = source["TargetingWR3"];
    this.TargetDepthWR3 = source["TargetDepthWR3"];
    this.TargetingWR4 = source["TargetingWR4"];
    this.TargetDepthWR4 = source["TargetDepthWR4"];
    this.TargetingWR5 = source["TargetingWR5"];
    this.TargetDepthWR5 = source["TargetDepthWR5"];
    this.TargetingTE1 = source["TargetingTE1"];
    this.TargetDepthTE1 = source["TargetDepthTE1"];
    this.TargetingTE2 = source["TargetingTE2"];
    this.TargetDepthTE2 = source["TargetDepthTE2"];
    this.TargetingTE3 = source["TargetingTE3"];
    this.TargetDepthTE3 = source["TargetDepthTE3"];
    this.TargetingRB1 = source["TargetingRB1"];
    this.TargetDepthRB1 = source["TargetDepthRB1"];
    this.TargetingRB2 = source["TargetingRB2"];
    this.TargetDepthRB2 = source["TargetDepthRB2"];
    this.TargetingFB1 = source["TargetingFB1"];
    this.TargetDepthFB1 = source["TargetDepthFB1"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.DefFormation1 = source["DefFormation1"];
    this.DefFormation1RunToPass = source["DefFormation1RunToPass"];
    this.DefFormation1BlitzWeight = source["DefFormation1BlitzWeight"];
    this.DefFormation1BlitzAggression = source["DefFormation1BlitzAggression"];
    this.DefFormation2 = source["DefFormation2"];
    this.DefFormation2RunToPass = source["DefFormation2RunToPass"];
    this.DefFormation2BlitzWeight = source["DefFormation2BlitzWeight"];
    this.DefFormation2BlitzAggression = source["DefFormation2BlitzAggression"];
    this.DefFormation3 = source["DefFormation3"];
    this.DefFormation3RunToPass = source["DefFormation3RunToPass"];
    this.DefFormation3BlitzWeight = source["DefFormation3BlitzWeight"];
    this.DefFormation3BlitzAggression = source["DefFormation3BlitzAggression"];
    this.DefFormation4 = source["DefFormation4"];
    this.DefFormation4RunToPass = source["DefFormation4RunToPass"];
    this.DefFormation4BlitzWeight = source["DefFormation4BlitzWeight"];
    this.DefFormation4BlitzAggression = source["DefFormation4BlitzAggression"];
    this.DefFormation5 = source["DefFormation5"];
    this.DefFormation5RunToPass = source["DefFormation5RunToPass"];
    this.DefFormation5BlitzWeight = source["DefFormation5BlitzWeight"];
    this.DefFormation5BlitzAggression = source["DefFormation5BlitzAggression"];
    this.BlitzSafeties = source["BlitzSafeties"];
    this.BlitzCorners = source["BlitzCorners"];
    this.LinebackerCoverage = source["LinebackerCoverage"];
    this.CornersCoverage = source["CornersCoverage"];
    this.SafetiesCoverage = source["SafetiesCoverage"];
    this.DiveFocus = source["DiveFocus"];
    this.PitchFocus = source["PitchFocus"];
    this.PrimaryHB = source["PrimaryHB"];
    this.MaximumFGDistance = source["MaximumFGDistance"];
    this.GoFor4AndShort = source["GoFor4AndShort"];
    this.GoFor4AndLong = source["GoFor4AndLong"];
    this.HasSchemePenalty = source["HasSchemePenalty"];
    this.OffenseSchemePenalty = source["OffenseSchemePenalty"];
    this.DefenseSchemePenalty = source["DefenseSchemePenalty"];
    this.DefaultOffense = source["DefaultOffense"];
    this.DefaultDefense = source["DefaultDefense"];
    this.PreviousWeekBye = source["PreviousWeekBye"];
    this.FocusPlays = source["FocusPlays"];
    this.DoubleTeam = source["DoubleTeam"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeTeamRecords {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  PassingTDCareerHolderID: number;
  PassingTDCareerHolder: string;
  PassingTDCareerRecord: number;
  PassingTDGameHolderID: number;
  PassingTDGameHolder: string;
  PassingTDGameRecord: number;
  PassingTDSeasonHolderID: number;
  PassingTDSeasonHolder: string;
  PassingTDSeasonRecord: number;
  PassingYardsCareerHolderID: number;
  PassingYardsCareerHolder: string;
  PassingYardsCareerRecord: number;
  PassingYardsGameHolderID: number;
  PassingYardsGameHolder: string;
  PassingYardsGameRecord: number;
  PassingYardsSeasonHolderID: number;
  PassingYardsSeasonHolder: string;
  PassingYardsSeasonRecord: number;
  RushingTDCareerHolderID: number;
  RushingTDCareerHolder: string;
  RushingTDCareerRecord: number;
  RushingTDGameHolderID: number;
  RushingTDGameHolder: string;
  RushingTDGameRecord: number;
  RushingTDSeasonHolderID: number;
  RushingTDSeasonHolder: string;
  RushingTDSeasonRecord: number;
  RushingYardsCareerHolderID: number;
  RushingYardsCareerHolder: string;
  RushingYardsCareerRecord: number;
  RushingYardsGameHolderID: number;
  RushingYardsGameHolder: string;
  RushingYardsGameRecord: number;
  RushingYardsSeasonHolderID: number;
  RushingYardsSeasonHolder: string;
  RushingYardsSeasonRecord: number;
  ReceivingTDCareerHolderID: number;
  ReceivingTDCareerHolder: string;
  ReceivingTDCareerRecord: number;
  ReceivingTDGameHolderID: number;
  ReceivingTDGameHolder: string;
  ReceivingTDGameRecord: number;
  ReceivingTDSeasonHolderID: number;
  ReceivingTDSeasonHolder: string;
  ReceivingTDSeasonRecord: number;
  ReceivingYardsCareerHolderID: number;
  ReceivingYardsCareerHolder: string;
  ReceivingYardsCareerRecord: number;
  ReceivingYardsGameHolderID: number;
  ReceivingYardsGameHolder: string;
  ReceivingYardsGameRecord: number;
  ReceivingYardsSeasonHolderID: number;
  ReceivingYardsSeasonHolder: string;
  ReceivingYardsSeasonRecord: number;
  ReceptionsCareerHolderID: number;
  ReceptionsCareerHolder: string;
  ReceptionsCareerRecord: number;
  ReceptionsGameHolderID: number;
  ReceptionsGameHolder: string;
  ReceptionsGameRecord: number;
  ReceptionsSeasonHolderID: number;
  ReceptionsSeasonHolder: string;
  ReceptionsSeasonRecord: number;
  InterceptionsCareerHolderID: number;
  InterceptionsCareerHolder: string;
  InterceptionsCareerRecord: number;
  InterceptionsGameHolderID: number;
  InterceptionsGameHolder: string;
  InterceptionsGameRecord: number;
  InterceptionsSeasonHolderID: number;
  InterceptionsSeasonHolder: string;
  InterceptionsSeasonRecord: number;
  SacksCareerHolderID: number;
  SacksCareerHolder: string;
  SacksCareerRecord: number;
  SacksGameHolderID: number;
  SacksGameHolder: string;
  SacksGameRecord: number;
  SacksSeasonHolderID: number;
  SacksSeasonHolder: string;
  SacksSeasonRecord: number;
  TacklesCareerHolderID: number;
  TacklesCareerHolder: string;
  TacklesCareerRecord: number;
  TacklesGameHolderID: number;
  TacklesGameHolder: string;
  TacklesGameRecord: number;
  TacklesSeasonHolderID: number;
  TacklesSeasonHolder: string;
  TacklesSeasonRecord: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.PassingTDCareerHolderID = source["PassingTDCareerHolderID"];
    this.PassingTDCareerHolder = source["PassingTDCareerHolder"];
    this.PassingTDCareerRecord = source["PassingTDCareerRecord"];
    this.PassingTDGameHolderID = source["PassingTDGameHolderID"];
    this.PassingTDGameHolder = source["PassingTDGameHolder"];
    this.PassingTDGameRecord = source["PassingTDGameRecord"];
    this.PassingTDSeasonHolderID = source["PassingTDSeasonHolderID"];
    this.PassingTDSeasonHolder = source["PassingTDSeasonHolder"];
    this.PassingTDSeasonRecord = source["PassingTDSeasonRecord"];
    this.PassingYardsCareerHolderID = source["PassingYardsCareerHolderID"];
    this.PassingYardsCareerHolder = source["PassingYardsCareerHolder"];
    this.PassingYardsCareerRecord = source["PassingYardsCareerRecord"];
    this.PassingYardsGameHolderID = source["PassingYardsGameHolderID"];
    this.PassingYardsGameHolder = source["PassingYardsGameHolder"];
    this.PassingYardsGameRecord = source["PassingYardsGameRecord"];
    this.PassingYardsSeasonHolderID = source["PassingYardsSeasonHolderID"];
    this.PassingYardsSeasonHolder = source["PassingYardsSeasonHolder"];
    this.PassingYardsSeasonRecord = source["PassingYardsSeasonRecord"];
    this.RushingTDCareerHolderID = source["RushingTDCareerHolderID"];
    this.RushingTDCareerHolder = source["RushingTDCareerHolder"];
    this.RushingTDCareerRecord = source["RushingTDCareerRecord"];
    this.RushingTDGameHolderID = source["RushingTDGameHolderID"];
    this.RushingTDGameHolder = source["RushingTDGameHolder"];
    this.RushingTDGameRecord = source["RushingTDGameRecord"];
    this.RushingTDSeasonHolderID = source["RushingTDSeasonHolderID"];
    this.RushingTDSeasonHolder = source["RushingTDSeasonHolder"];
    this.RushingTDSeasonRecord = source["RushingTDSeasonRecord"];
    this.RushingYardsCareerHolderID = source["RushingYardsCareerHolderID"];
    this.RushingYardsCareerHolder = source["RushingYardsCareerHolder"];
    this.RushingYardsCareerRecord = source["RushingYardsCareerRecord"];
    this.RushingYardsGameHolderID = source["RushingYardsGameHolderID"];
    this.RushingYardsGameHolder = source["RushingYardsGameHolder"];
    this.RushingYardsGameRecord = source["RushingYardsGameRecord"];
    this.RushingYardsSeasonHolderID = source["RushingYardsSeasonHolderID"];
    this.RushingYardsSeasonHolder = source["RushingYardsSeasonHolder"];
    this.RushingYardsSeasonRecord = source["RushingYardsSeasonRecord"];
    this.ReceivingTDCareerHolderID = source["ReceivingTDCareerHolderID"];
    this.ReceivingTDCareerHolder = source["ReceivingTDCareerHolder"];
    this.ReceivingTDCareerRecord = source["ReceivingTDCareerRecord"];
    this.ReceivingTDGameHolderID = source["ReceivingTDGameHolderID"];
    this.ReceivingTDGameHolder = source["ReceivingTDGameHolder"];
    this.ReceivingTDGameRecord = source["ReceivingTDGameRecord"];
    this.ReceivingTDSeasonHolderID = source["ReceivingTDSeasonHolderID"];
    this.ReceivingTDSeasonHolder = source["ReceivingTDSeasonHolder"];
    this.ReceivingTDSeasonRecord = source["ReceivingTDSeasonRecord"];
    this.ReceivingYardsCareerHolderID = source["ReceivingYardsCareerHolderID"];
    this.ReceivingYardsCareerHolder = source["ReceivingYardsCareerHolder"];
    this.ReceivingYardsCareerRecord = source["ReceivingYardsCareerRecord"];
    this.ReceivingYardsGameHolderID = source["ReceivingYardsGameHolderID"];
    this.ReceivingYardsGameHolder = source["ReceivingYardsGameHolder"];
    this.ReceivingYardsGameRecord = source["ReceivingYardsGameRecord"];
    this.ReceivingYardsSeasonHolderID = source["ReceivingYardsSeasonHolderID"];
    this.ReceivingYardsSeasonHolder = source["ReceivingYardsSeasonHolder"];
    this.ReceivingYardsSeasonRecord = source["ReceivingYardsSeasonRecord"];
    this.ReceptionsCareerHolderID = source["ReceptionsCareerHolderID"];
    this.ReceptionsCareerHolder = source["ReceptionsCareerHolder"];
    this.ReceptionsCareerRecord = source["ReceptionsCareerRecord"];
    this.ReceptionsGameHolderID = source["ReceptionsGameHolderID"];
    this.ReceptionsGameHolder = source["ReceptionsGameHolder"];
    this.ReceptionsGameRecord = source["ReceptionsGameRecord"];
    this.ReceptionsSeasonHolderID = source["ReceptionsSeasonHolderID"];
    this.ReceptionsSeasonHolder = source["ReceptionsSeasonHolder"];
    this.ReceptionsSeasonRecord = source["ReceptionsSeasonRecord"];
    this.InterceptionsCareerHolderID = source["InterceptionsCareerHolderID"];
    this.InterceptionsCareerHolder = source["InterceptionsCareerHolder"];
    this.InterceptionsCareerRecord = source["InterceptionsCareerRecord"];
    this.InterceptionsGameHolderID = source["InterceptionsGameHolderID"];
    this.InterceptionsGameHolder = source["InterceptionsGameHolder"];
    this.InterceptionsGameRecord = source["InterceptionsGameRecord"];
    this.InterceptionsSeasonHolderID = source["InterceptionsSeasonHolderID"];
    this.InterceptionsSeasonHolder = source["InterceptionsSeasonHolder"];
    this.InterceptionsSeasonRecord = source["InterceptionsSeasonRecord"];
    this.SacksCareerHolderID = source["SacksCareerHolderID"];
    this.SacksCareerHolder = source["SacksCareerHolder"];
    this.SacksCareerRecord = source["SacksCareerRecord"];
    this.SacksGameHolderID = source["SacksGameHolderID"];
    this.SacksGameHolder = source["SacksGameHolder"];
    this.SacksGameRecord = source["SacksGameRecord"];
    this.SacksSeasonHolderID = source["SacksSeasonHolderID"];
    this.SacksSeasonHolder = source["SacksSeasonHolder"];
    this.SacksSeasonRecord = source["SacksSeasonRecord"];
    this.TacklesCareerHolderID = source["TacklesCareerHolderID"];
    this.TacklesCareerHolder = source["TacklesCareerHolder"];
    this.TacklesCareerRecord = source["TacklesCareerRecord"];
    this.TacklesGameHolderID = source["TacklesGameHolderID"];
    this.TacklesGameHolder = source["TacklesGameHolder"];
    this.TacklesGameRecord = source["TacklesGameRecord"];
    this.TacklesSeasonHolderID = source["TacklesSeasonHolderID"];
    this.TacklesSeasonHolder = source["TacklesSeasonHolder"];
    this.TacklesSeasonRecord = source["TacklesSeasonRecord"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class DeletedAt {
  Time: Time;
  Valid: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Time = this.convertValues(source["Time"], Time);
    this.Valid = source["Valid"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeTeamSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  TeamID: number;
  SeasonID: number;
  Year: number;
  PointsScored: number;
  PointsAgainst: number;
  TwoPointTries: number;
  TwoPointSucceed: number;
  PassingYards: number;
  PassingAttempts: number;
  PassingCompletions: number;
  LongestPass: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  QBRating: number;
  QBSacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingYardsPerAttempt: number;
  LongestRush: number;
  RushingTouchdowns: number;
  RushingFumbles: number;
  ReceivingTargets: number;
  ReceivingCatches: number;
  ReceivingYards: number;
  YardsPerCatch: number;
  ReceivingTouchdowns: number;
  ReceivingFumbles: number;
  PassingYardsAllowed: number;
  PassingTDsAllowed: number;
  PassingCompletionsAllowed: number;
  RushingYardsAllowed: number;
  RushingTDsAllowed: number;
  RushingYardsPerAttemptAllowed: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  DefensiveSacks: number;
  ForcedFumbles: number;
  FumblesRecovered: number;
  DefensiveInterceptions: number;
  TurnoverYards: number;
  DefensiveTDs: number;
  Safeties: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  ExtraPointPercentage: number;
  FieldGoalsMade: number;
  FieldGoalsAttempted: number;
  FieldGoalsPercentage: number;
  LongestFieldGoal: number;
  KickoffTBs: number;
  PuntTBs: number;
  Punts: number;
  PuntYards: number;
  PuntsInside20: number;
  PuntAverage: number;
  Inside20YardLine: number;
  KickReturnYards: number;
  KickReturnTDs: number;
  PuntReturnYards: number;
  PuntReturnTDs: number;
  OffensivePenalties: number;
  DefensivePenalties: number;
  OffPenaltyYards: number;
  DefPenaltyYards: number;
  Score1Q: number;
  Score2Q: number;
  Score3Q: number;
  Score4Q: number;
  Score5Q: number;
  Score6Q: number;
  Score7Q: number;
  ScoreOT: number;
  OffensiveScheme: string;
  DefensiveScheme: string;
  OffensiveSnaps: number;
  DefensiveSnaps: number;
  SpecialTeamSnaps: number;
  GameType: number;
  RevealResults: boolean;
  GamesPlayed: number;
  TotalOffensiveYards: number;
  TotalYardsAllowed: number;
  Fumbles: number;
  Tackles: number;
  Turnovers: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.PointsScored = source["PointsScored"];
    this.PointsAgainst = source["PointsAgainst"];
    this.TwoPointTries = source["TwoPointTries"];
    this.TwoPointSucceed = source["TwoPointSucceed"];
    this.PassingYards = source["PassingYards"];
    this.PassingAttempts = source["PassingAttempts"];
    this.PassingCompletions = source["PassingCompletions"];
    this.LongestPass = source["LongestPass"];
    this.PassingTouchdowns = source["PassingTouchdowns"];
    this.PassingInterceptions = source["PassingInterceptions"];
    this.QBRating = source["QBRating"];
    this.QBSacks = source["QBSacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingYardsPerAttempt = source["RushingYardsPerAttempt"];
    this.LongestRush = source["LongestRush"];
    this.RushingTouchdowns = source["RushingTouchdowns"];
    this.RushingFumbles = source["RushingFumbles"];
    this.ReceivingTargets = source["ReceivingTargets"];
    this.ReceivingCatches = source["ReceivingCatches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.YardsPerCatch = source["YardsPerCatch"];
    this.ReceivingTouchdowns = source["ReceivingTouchdowns"];
    this.ReceivingFumbles = source["ReceivingFumbles"];
    this.PassingYardsAllowed = source["PassingYardsAllowed"];
    this.PassingTDsAllowed = source["PassingTDsAllowed"];
    this.PassingCompletionsAllowed = source["PassingCompletionsAllowed"];
    this.RushingYardsAllowed = source["RushingYardsAllowed"];
    this.RushingTDsAllowed = source["RushingTDsAllowed"];
    this.RushingYardsPerAttemptAllowed =
      source["RushingYardsPerAttemptAllowed"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.DefensiveSacks = source["DefensiveSacks"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.FumblesRecovered = source["FumblesRecovered"];
    this.DefensiveInterceptions = source["DefensiveInterceptions"];
    this.TurnoverYards = source["TurnoverYards"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.Safeties = source["Safeties"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.ExtraPointPercentage = source["ExtraPointPercentage"];
    this.FieldGoalsMade = source["FieldGoalsMade"];
    this.FieldGoalsAttempted = source["FieldGoalsAttempted"];
    this.FieldGoalsPercentage = source["FieldGoalsPercentage"];
    this.LongestFieldGoal = source["LongestFieldGoal"];
    this.KickoffTBs = source["KickoffTBs"];
    this.PuntTBs = source["PuntTBs"];
    this.Punts = source["Punts"];
    this.PuntYards = source["PuntYards"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.PuntAverage = source["PuntAverage"];
    this.Inside20YardLine = source["Inside20YardLine"];
    this.KickReturnYards = source["KickReturnYards"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.OffensivePenalties = source["OffensivePenalties"];
    this.DefensivePenalties = source["DefensivePenalties"];
    this.OffPenaltyYards = source["OffPenaltyYards"];
    this.DefPenaltyYards = source["DefPenaltyYards"];
    this.Score1Q = source["Score1Q"];
    this.Score2Q = source["Score2Q"];
    this.Score3Q = source["Score3Q"];
    this.Score4Q = source["Score4Q"];
    this.Score5Q = source["Score5Q"];
    this.Score6Q = source["Score6Q"];
    this.Score7Q = source["Score7Q"];
    this.ScoreOT = source["ScoreOT"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.OffensiveSnaps = source["OffensiveSnaps"];
    this.DefensiveSnaps = source["DefensiveSnaps"];
    this.SpecialTeamSnaps = source["SpecialTeamSnaps"];
    this.GameType = source["GameType"];
    this.RevealResults = source["RevealResults"];
    this.GamesPlayed = source["GamesPlayed"];
    this.TotalOffensiveYards = source["TotalOffensiveYards"];
    this.TotalYardsAllowed = source["TotalYardsAllowed"];
    this.Fumbles = source["Fumbles"];
    this.QBRating = source["QBRating"];
    this.Tackles = source["Tackles"];
    this.Turnovers = source["Turnovers"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeTeamStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  GameID: number;
  WeekID: number;
  SeasonID: number;
  OpposingTeam: string;
  PointsScored: number;
  PointsAgainst: number;
  TwoPointTries: number;
  TwoPointSucceed: number;
  PassingYards: number;
  PassingAttempts: number;
  PassingCompletions: number;
  LongestPass: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  QBRating: number;
  QBSacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingYardsPerAttempt: number;
  LongestRush: number;
  RushingTouchdowns: number;
  RushingFumbles: number;
  ReceivingTargets: number;
  ReceivingCatches: number;
  ReceivingYards: number;
  YardsPerCatch: number;
  ReceivingTouchdowns: number;
  ReceivingFumbles: number;
  PassingYardsAllowed: number;
  PassingTDsAllowed: number;
  PassingCompletionsAllowed: number;
  RushingYardsAllowed: number;
  RushingTDsAllowed: number;
  RushingYardsPerAttemptAllowed: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  DefensiveSacks: number;
  ForcedFumbles: number;
  FumblesRecovered: number;
  DefensiveInterceptions: number;
  TurnoverYards: number;
  DefensiveTDs: number;
  Safeties: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  ExtraPointPercentage: number;
  FieldGoalsMade: number;
  FieldGoalsAttempted: number;
  FieldGoalsPercentage: number;
  LongestFieldGoal: number;
  KickoffTBs: number;
  PuntTBs: number;
  Punts: number;
  PuntYards: number;
  PuntsInside20: number;
  PuntAverage: number;
  Inside20YardLine: number;
  KickReturnYards: number;
  KickReturnTDs: number;
  PuntReturnYards: number;
  PuntReturnTDs: number;
  OffensivePenalties: number;
  DefensivePenalties: number;
  OffPenaltyYards: number;
  DefPenaltyYards: number;
  Score1Q: number;
  Score2Q: number;
  Score3Q: number;
  Score4Q: number;
  Score5Q: number;
  Score6Q: number;
  Score7Q: number;
  ScoreOT: number;
  OffensiveScheme: string;
  DefensiveScheme: string;
  OffensiveSnaps: number;
  DefensiveSnaps: number;
  SpecialTeamSnaps: number;
  GameType: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.GameID = source["GameID"];
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
    this.OpposingTeam = source["OpposingTeam"];
    this.PointsScored = source["PointsScored"];
    this.PointsAgainst = source["PointsAgainst"];
    this.TwoPointTries = source["TwoPointTries"];
    this.TwoPointSucceed = source["TwoPointSucceed"];
    this.PassingYards = source["PassingYards"];
    this.PassingAttempts = source["PassingAttempts"];
    this.PassingCompletions = source["PassingCompletions"];
    this.LongestPass = source["LongestPass"];
    this.PassingTouchdowns = source["PassingTouchdowns"];
    this.PassingInterceptions = source["PassingInterceptions"];
    this.QBRating = source["QBRating"];
    this.QBSacks = source["QBSacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingYardsPerAttempt = source["RushingYardsPerAttempt"];
    this.LongestRush = source["LongestRush"];
    this.RushingTouchdowns = source["RushingTouchdowns"];
    this.RushingFumbles = source["RushingFumbles"];
    this.ReceivingTargets = source["ReceivingTargets"];
    this.ReceivingCatches = source["ReceivingCatches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.YardsPerCatch = source["YardsPerCatch"];
    this.ReceivingTouchdowns = source["ReceivingTouchdowns"];
    this.ReceivingFumbles = source["ReceivingFumbles"];
    this.PassingYardsAllowed = source["PassingYardsAllowed"];
    this.PassingTDsAllowed = source["PassingTDsAllowed"];
    this.PassingCompletionsAllowed = source["PassingCompletionsAllowed"];
    this.RushingYardsAllowed = source["RushingYardsAllowed"];
    this.RushingTDsAllowed = source["RushingTDsAllowed"];
    this.RushingYardsPerAttemptAllowed =
      source["RushingYardsPerAttemptAllowed"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.DefensiveSacks = source["DefensiveSacks"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.FumblesRecovered = source["FumblesRecovered"];
    this.DefensiveInterceptions = source["DefensiveInterceptions"];
    this.TurnoverYards = source["TurnoverYards"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.Safeties = source["Safeties"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.ExtraPointPercentage = source["ExtraPointPercentage"];
    this.FieldGoalsMade = source["FieldGoalsMade"];
    this.FieldGoalsAttempted = source["FieldGoalsAttempted"];
    this.FieldGoalsPercentage = source["FieldGoalsPercentage"];
    this.LongestFieldGoal = source["LongestFieldGoal"];
    this.KickoffTBs = source["KickoffTBs"];
    this.PuntTBs = source["PuntTBs"];
    this.Punts = source["Punts"];
    this.PuntYards = source["PuntYards"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.PuntAverage = source["PuntAverage"];
    this.Inside20YardLine = source["Inside20YardLine"];
    this.KickReturnYards = source["KickReturnYards"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.OffensivePenalties = source["OffensivePenalties"];
    this.DefensivePenalties = source["DefensivePenalties"];
    this.OffPenaltyYards = source["OffPenaltyYards"];
    this.DefPenaltyYards = source["DefPenaltyYards"];
    this.Score1Q = source["Score1Q"];
    this.Score2Q = source["Score2Q"];
    this.Score3Q = source["Score3Q"];
    this.Score4Q = source["Score4Q"];
    this.Score5Q = source["Score5Q"];
    this.Score6Q = source["Score6Q"];
    this.Score7Q = source["Score7Q"];
    this.ScoreOT = source["ScoreOT"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.OffensiveSnaps = source["OffensiveSnaps"];
    this.DefensiveSnaps = source["DefensiveSnaps"];
    this.SpecialTeamSnaps = source["SpecialTeamSnaps"];
    this.GameType = source["GameType"];
    this.RevealResults = source["RevealResults"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class ProfileAffinity {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  AffinityID: number;
  ProfileID: number;
  AffinityName: string;
  IsApplicable: boolean;
  IsDynamicAffinity: boolean;
  IsCheckedWeekly: boolean;
  IsCheckedSeasonal: boolean;
  AffinityValue: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.AffinityID = source["AffinityID"];
    this.ProfileID = source["ProfileID"];
    this.AffinityName = source["AffinityName"];
    this.IsApplicable = source["IsApplicable"];
    this.IsDynamicAffinity = source["IsDynamicAffinity"];
    this.IsCheckedWeekly = source["IsCheckedWeekly"];
    this.IsCheckedSeasonal = source["IsCheckedSeasonal"];
    this.AffinityValue = source["AffinityValue"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class Recruit {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  PlayerID: number;
  TeamID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  HighSchool: string;
  City: string;
  State: string;
  AffinityOne: string;
  AffinityTwo: string;
  IsSigned: boolean;
  IsCustomCroot: boolean;
  CustomCrootFor: string;
  College: string;
  OverallRank: number;
  RivalsRank: number;
  ESPNRank: number;
  Rank247: number;
  TopRankModifier: number;
  RecruitingModifier: number;
  RecruitingStatus: string;
  RecruitPlayerProfiles: RecruitPlayerProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.HighSchool = source["HighSchool"];
    this.City = source["City"];
    this.State = source["State"];
    this.AffinityOne = source["AffinityOne"];
    this.AffinityTwo = source["AffinityTwo"];
    this.IsSigned = source["IsSigned"];
    this.IsCustomCroot = source["IsCustomCroot"];
    this.CustomCrootFor = source["CustomCrootFor"];
    this.College = source["College"];
    this.OverallRank = source["OverallRank"];
    this.RivalsRank = source["RivalsRank"];
    this.ESPNRank = source["ESPNRank"];
    this.Rank247 = source["Rank247"];
    this.TopRankModifier = source["TopRankModifier"];
    this.RecruitingModifier = source["RecruitingModifier"];
    this.RecruitingStatus = source["RecruitingStatus"];
    this.RecruitPlayerProfiles = this.convertValues(
      source["RecruitPlayerProfiles"],
      RecruitPlayerProfile
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class RecruitPlayerProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  SeasonID: number;
  RecruitID: number;
  ProfileID: number;
  TotalPoints: number;
  CurrentWeeksPoints: number;
  PreviousWeekPoints: number;
  SpendingCount: number;
  RecruitingEfficiencyScore: number;
  Scholarship: boolean;
  ScholarshipRevoked: boolean;
  AffinityOneEligible: boolean;
  AffinityTwoEligible: boolean;
  TeamAbbreviation: string;
  Recruiter: string;
  RemovedFromBoard: boolean;
  IsSigned: boolean;
  IsLocked: boolean;
  CaughtCheating: boolean;
  TeamReachedMax: boolean;
  Recruit: Recruit;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.SeasonID = source["SeasonID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.TotalPoints = source["TotalPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.PreviousWeekPoints = source["PreviousWeekPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.RecruitingEfficiencyScore = source["RecruitingEfficiencyScore"];
    this.Scholarship = source["Scholarship"];
    this.ScholarshipRevoked = source["ScholarshipRevoked"];
    this.AffinityOneEligible = source["AffinityOneEligible"];
    this.AffinityTwoEligible = source["AffinityTwoEligible"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.Recruiter = source["Recruiter"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.IsSigned = source["IsSigned"];
    this.IsLocked = source["IsLocked"];
    this.CaughtCheating = source["CaughtCheating"];
    this.TeamReachedMax = source["TeamReachedMax"];
    this.Recruit = this.convertValues(source["Recruit"], Recruit);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class RecruitingTeamProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Team: string;
  TeamAbbreviation: string;
  State: string;
  ScholarshipsAvailable: number;
  WeeklyPoints: number;
  SpentPoints: number;
  TotalCommitments: number;
  RecruitClassSize: number;
  PortalReputation: number;
  BaseEfficiencyScore: number;
  RecruitingEfficiencyScore: number;
  PreviousOverallWinPer: number;
  PreviousConferenceWinPer: number;
  CurrentOverallWinPer: number;
  CurrentConferenceWinPer: number;
  ESPNScore: number;
  RivalsScore: number;
  Rank247Score: number;
  CompositeScore: number;
  ThreeStars: number;
  FourStars: number;
  FiveStars: number;
  RecruitingClassRank: number;
  CaughtCheating: boolean;
  IsFBS: boolean;
  IsAI: boolean;
  IsUserTeam: boolean;
  AIBehavior: string;
  AIQuality: string;
  WeeksMissed: number;
  BattlesWon: number;
  BattlesLost: number;
  AIMinThreshold: number;
  AIMaxThreshold: number;
  AIStarMin: number;
  AIStarMax: number;
  AIAutoOfferscholarships: boolean;
  OffensiveScheme: string;
  DefensiveScheme: string;
  Recruiter: string;
  Recruits: RecruitPlayerProfile[];
  Affinities: ProfileAffinity[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.State = source["State"];
    this.ScholarshipsAvailable = source["ScholarshipsAvailable"];
    this.WeeklyPoints = source["WeeklyPoints"];
    this.SpentPoints = source["SpentPoints"];
    this.TotalCommitments = source["TotalCommitments"];
    this.RecruitClassSize = source["RecruitClassSize"];
    this.PortalReputation = source["PortalReputation"];
    this.BaseEfficiencyScore = source["BaseEfficiencyScore"];
    this.RecruitingEfficiencyScore = source["RecruitingEfficiencyScore"];
    this.PreviousOverallWinPer = source["PreviousOverallWinPer"];
    this.PreviousConferenceWinPer = source["PreviousConferenceWinPer"];
    this.CurrentOverallWinPer = source["CurrentOverallWinPer"];
    this.CurrentConferenceWinPer = source["CurrentConferenceWinPer"];
    this.ESPNScore = source["ESPNScore"];
    this.RivalsScore = source["RivalsScore"];
    this.Rank247Score = source["Rank247Score"];
    this.CompositeScore = source["CompositeScore"];
    this.ThreeStars = source["ThreeStars"];
    this.FourStars = source["FourStars"];
    this.FiveStars = source["FiveStars"];
    this.RecruitingClassRank = source["RecruitingClassRank"];
    this.CaughtCheating = source["CaughtCheating"];
    this.IsFBS = source["IsFBS"];
    this.IsAI = source["IsAI"];
    this.IsUserTeam = source["IsUserTeam"];
    this.AIBehavior = source["AIBehavior"];
    this.AIQuality = source["AIQuality"];
    this.WeeksMissed = source["WeeksMissed"];
    this.BattlesWon = source["BattlesWon"];
    this.BattlesLost = source["BattlesLost"];
    this.AIMinThreshold = source["AIMinThreshold"];
    this.AIMaxThreshold = source["AIMaxThreshold"];
    this.AIStarMin = source["AIStarMin"];
    this.AIStarMax = source["AIStarMax"];
    this.AIAutoOfferscholarships = source["AIAutoOfferscholarships"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.Recruiter = source["Recruiter"];
    this.Recruits = this.convertValues(
      source["Recruits"],
      RecruitPlayerProfile
    );
    this.Affinities = this.convertValues(source["Affinities"], ProfileAffinity);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegeCoach {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  CoachName: string;
  Age: number;
  TeamID: number;
  Team: string;
  AlmaMaterID: number;
  AlmaMater: string;
  FormerPlayerID: number;
  Prestige: number;
  PointMin: number;
  PointMax: number;
  StarMin: number;
  StarMax: number;
  Odds1: number;
  Odds2: number;
  Odds3: number;
  Odds4: number;
  Odds5: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  OffensiveScheme: string;
  DefensiveScheme: string;
  TeambuildingPreference: string;
  CareerPreference: string;
  PromiseTendency: string;
  PortalReputation: number;
  SchoolTenure: number;
  CareerTenure: number;
  ContractLength: number;
  YearsRemaining: number;
  OverallWins: number;
  OverallLosses: number;
  OverallConferenceChampionships: number;
  BowlWins: number;
  BowlLosses: number;
  PlayoffWins: number;
  PlayoffLosses: number;
  NationalChampionships: number;
  IsUser: boolean;
  IsActive: boolean;
  IsRetired: boolean;
  IsFormerPlayer: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.CoachName = source["CoachName"];
    this.Age = source["Age"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.AlmaMaterID = source["AlmaMaterID"];
    this.AlmaMater = source["AlmaMater"];
    this.FormerPlayerID = source["FormerPlayerID"];
    this.Prestige = source["Prestige"];
    this.PointMin = source["PointMin"];
    this.PointMax = source["PointMax"];
    this.StarMin = source["StarMin"];
    this.StarMax = source["StarMax"];
    this.Odds1 = source["Odds1"];
    this.Odds2 = source["Odds2"];
    this.Odds3 = source["Odds3"];
    this.Odds4 = source["Odds4"];
    this.Odds5 = source["Odds5"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.TeambuildingPreference = source["TeambuildingPreference"];
    this.CareerPreference = source["CareerPreference"];
    this.PromiseTendency = source["PromiseTendency"];
    this.PortalReputation = source["PortalReputation"];
    this.SchoolTenure = source["SchoolTenure"];
    this.CareerTenure = source["CareerTenure"];
    this.ContractLength = source["ContractLength"];
    this.YearsRemaining = source["YearsRemaining"];
    this.OverallWins = source["OverallWins"];
    this.OverallLosses = source["OverallLosses"];
    this.OverallConferenceChampionships =
      source["OverallConferenceChampionships"];
    this.BowlWins = source["BowlWins"];
    this.BowlLosses = source["BowlLosses"];
    this.PlayoffWins = source["PlayoffWins"];
    this.PlayoffLosses = source["PlayoffLosses"];
    this.NationalChampionships = source["NationalChampionships"];
    this.IsUser = source["IsUser"];
    this.IsActive = source["IsActive"];
    this.IsRetired = source["IsRetired"];
    this.IsFormerPlayer = source["IsFormerPlayer"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class Time {
  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
  }
}
export class CollegeTeam {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamName: string;
  Mascot: string;
  TeamAbbr: string;
  Coach: string;
  City: string;
  State: string;
  Country: string;
  StadiumID: number;
  Stadium: string;
  StadiumCapacity: number;
  RecordAttendance: number;
  Enrollment: number;
  FirstPlayed: number;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  DiscordID: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  PenaltyMarks: number;
  ConferenceID: number;
  Conference: string;
  DivisionID: number;
  Division: string;
  ProgramPrestige: number;
  AcademicPrestige: number;
  Facilities: number;
  IsFBS: boolean;
  IsActive: boolean;
  PlayersProgressed: boolean;
  RecruitsAdded: boolean;
  CollegeCoach: CollegeCoach;
  RecruitingProfile: RecruitingTeamProfile;
  TeamStats: CollegeTeamStats[];
  TeamSeasonStats: CollegeTeamSeasonStats;
  TeamRecord: CollegeTeamRecords;
  TeamGameplan: CollegeGameplan;
  TeamDepthChart: CollegeTeamDepthChart;
  TeamStandings: CollegeStandings[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamName = source["TeamName"];
    this.Mascot = source["Mascot"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Coach = source["Coach"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.StadiumID = source["StadiumID"];
    this.Stadium = source["Stadium"];
    this.StadiumCapacity = source["StadiumCapacity"];
    this.RecordAttendance = source["RecordAttendance"];
    this.Enrollment = source["Enrollment"];
    this.FirstPlayed = source["FirstPlayed"];
    this.ColorOne = source["ColorOne"];
    this.ColorTwo = source["ColorTwo"];
    this.ColorThree = source["ColorThree"];
    this.DiscordID = source["DiscordID"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.PenaltyMarks = source["PenaltyMarks"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.DivisionID = source["DivisionID"];
    this.Division = source["Division"];
    this.ProgramPrestige = source["ProgramPrestige"];
    this.AcademicPrestige = source["AcademicPrestige"];
    this.Facilities = source["Facilities"];
    this.IsFBS = source["IsFBS"];
    this.IsActive = source["IsActive"];
    this.PlayersProgressed = source["PlayersProgressed"];
    this.RecruitsAdded = source["RecruitsAdded"];
    this.CollegeCoach = this.convertValues(
      source["CollegeCoach"],
      CollegeCoach
    );
    this.RecruitingProfile = this.convertValues(
      source["RecruitingProfile"],
      RecruitingTeamProfile
    );
    this.TeamStats = this.convertValues(source["TeamStats"], CollegeTeamStats);
    this.TeamSeasonStats = this.convertValues(
      source["TeamSeasonStats"],
      CollegeTeamSeasonStats
    );
    this.TeamRecord = this.convertValues(
      source["TeamRecord"],
      CollegeTeamRecords
    );
    this.TeamGameplan = this.convertValues(
      source["TeamGameplan"],
      CollegeGameplan
    );
    this.TeamDepthChart = this.convertValues(
      source["TeamDepthChart"],
      CollegeTeamDepthChart
    );
    this.TeamStandings = this.convertValues(
      source["TeamStandings"],
      CollegeStandings
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class BootstrapData {
  CollegeTeam: CollegeTeam | null;
  ProTeam: NFLTeam | null;
  AllCollegeTeams: CollegeTeam[];
  CollegeStandings: CollegeStandings[];
  CollegeRosterMap: { [key: number]: CollegePlayer[] } | null;
  Recruits: Croot[];
  TeamProfileMap: { [key: string]: RecruitingTeamProfile } | null;
  PortalPlayers: CollegePlayer[];
  CollegeInjuryReport: CollegePlayer[];
  CollegeNews: NewsLog[];
  CollegeNotifications: Notification[];
  AllCollegeGames: CollegeGame[];
  CollegeGameplan: CollegeGameplan | null;
  CollegeDepthChart: CollegeTeamDepthChart | null;
  CollegeDepthChartMap: { [key: number]: CollegeTeamDepthChart } | null;
  AllProTeams: NFLTeam[];
  ProStandings: NFLStandings[];
  ProRosterMap: { [key: number]: NFLPlayer[] } | null;
  CapsheetMap: { [key: number]: NFLCapsheet } | null;
  FreeAgency: FreeAgencyResponse | null;
  ProInjuryReport: NFLPlayer[];
  ProNews: NewsLog[];
  ProNotifications: Notification[];
  AllProGames: NFLGame[];
  NFLGameplan: NFLGameplan | null;
  NFLDepthChart: NFLDepthChart | null;
  NFLDepthChartMap: { [key: number]: NFLDepthChart } | null;
  TopCFBPassers: CollegePlayer[];
  TopCFBRushers: CollegePlayer[];
  TopCFBReceivers: CollegePlayer[];
  TopNFLPassers: NFLPlayer[];
  TopNFLRushers: NFLPlayer[];
  TopNFLReceivers: NFLPlayer[];
  FaceData: {[key: number]: FaceDataResponse};
  ContractMap: {[key: number]: NFLContract};
  ExtensionMap: {[key: number]: NFLExtensionOffer};

  constructor(source: any = {}) {
    if (typeof source === "string") source = JSON.parse(source);

    this.CollegeTeam = this.convertValues(source["CollegeTeam"], CollegeTeam) || null;
    this.AllCollegeTeams = this.convertValues(source["AllCollegeTeams"], CollegeTeam) || [];
    this.CollegeStandings = this.convertValues(source["CollegeStandings"], CollegeStandings) || [];
    this.CollegeRosterMap = source["CollegeRosterMap"] || null;
    this.Recruits = this.convertValues(source["Recruits"], Croot) || [];
    this.TeamProfileMap = this.convertValues(source["TeamProfileMap"], RecruitingTeamProfile, true) || null;
    this.PortalPlayers = this.convertValues(source["PortalPlayers"], CollegePlayer) || [];
    this.CollegeInjuryReport = this.convertValues(source["CollegeInjuryReport"], CollegePlayer) || [];
    this.CollegeNews = this.convertValues(source["CollegeNews"], NewsLog) || [];
    this.CollegeNotifications = this.convertValues(source["CollegeNotifications"], Notification) || [];
    this.AllCollegeGames = this.convertValues(source["AllCollegeGames"], CollegeGame) || [];
    this.CollegeGameplan = this.convertValues(source["CollegeGameplan"], CollegeGameplan) || null;
    this.CollegeDepthChart = this.convertValues(source["CollegeDepthChart"], CollegeTeamDepthChart) || null;
    this.CollegeDepthChartMap = this.convertValues(source["CollegeDepthChartMap"], CollegeTeamDepthChart, true) || null;
    this.ProTeam = this.convertValues(source["ProTeam"], NFLTeam) || null;
    this.AllProTeams = this.convertValues(source["AllProTeams"], NFLTeam) || [];
    this.ProStandings = this.convertValues(source["ProStandings"], NFLStandings) || [];
    this.ProRosterMap = source["ProRosterMap"] || null;
    this.CapsheetMap = this.convertValues(source["CapsheetMap"], NFLCapsheet, true) || null;
    this.FreeAgency = this.convertValues(source["FreeAgency"], FreeAgencyResponse) || null;
    this.ProInjuryReport = this.convertValues(source["ProInjuryReport"], NFLPlayer) || [];
    this.ProNews = this.convertValues(source["ProNews"], NewsLog) || [];
    this.ProNotifications = this.convertValues(source["ProNotifications"], Notification) || [];
    this.AllProGames = this.convertValues(source["AllProGames"], NFLGame) || [];
    this.NFLGameplan = this.convertValues(source["NFLGameplan"], NFLGameplan) || null;
    this.NFLDepthChart = this.convertValues(source["NFLDepthChart"], NFLDepthChart) || null;
    this.NFLDepthChartMap = this.convertValues(source["NFLDepthChartMap"], NFLDepthChart, true) || null;
    this.TopCFBPassers = this.convertValues(source["TopCFBPassers"], CollegePlayer);
    this.TopCFBRushers = this.convertValues(source["TopCFBRushers"], CollegePlayer);
    this.TopCFBReceivers = this.convertValues(source["TopCFBReceivers"], CollegePlayer);
    this.TopNFLPassers = this.convertValues(source["TopNFLPassers"], NFLPlayer);
    this.TopNFLRushers = this.convertValues(source["TopNFLRushers"], NFLPlayer);
    this.TopNFLReceivers = this.convertValues(source["TopNFLReceivers"], NFLPlayer);
    this.FaceData = this.convertValues(source["FaceData"], FaceDataResponse, true);
    this.ContractMap = this.convertValues(source["ContractMap"], NFLContract, true);
    this.ExtensionMap = this.convertValues(source["ExtensionMap"], NFLExtensionOffer, true);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    // If a is null or undefined, return it directly (or a default value)
    if (a === null || a === undefined) {
      return null;
    }
    if (Array.isArray(a)) {
      return a.map((elem) => this.convertValues(elem, classs));
    } else if (typeof a === "object") {
      if (asMap) {
        // If asMap, convert each property value to an instance of the class.
        const result: { [key: string]: any } = {};
        for (const key of Object.keys(a)) {
          result[key] = new classs(a[key]);
        }
        return result;
      }
      return new classs(a);
    }
    return a;
  }
}

export class TeamRequestsResponse {
  CollegeRequests: TeamRequest[];
  ProRequests: NFLRequest[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.CollegeRequests = this.convertValues(
      source["CollegeRequests"],
      TeamRequest
    );
    this.ProRequests = this.convertValues(source["ProRequests"], NFLRequest);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class BasePlayer {
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
  }
}

export class BaseTeam {
  TeamName: string;
  Mascot: string;
  TeamAbbr: string;
  Coach: string;
  City: string;
  State: string;
  Country: string;
  StadiumID: number;
  Stadium: string;
  StadiumCapacity: number;
  RecordAttendance: number;
  Enrollment: number;
  FirstPlayed: number;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  DiscordID: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  PenaltyMarks: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamName = source["TeamName"];
    this.Mascot = source["Mascot"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Coach = source["Coach"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.StadiumID = source["StadiumID"];
    this.Stadium = source["Stadium"];
    this.StadiumCapacity = source["StadiumCapacity"];
    this.RecordAttendance = source["RecordAttendance"];
    this.Enrollment = source["Enrollment"];
    this.FirstPlayed = source["FirstPlayed"];
    this.ColorOne = source["ColorOne"];
    this.ColorTwo = source["ColorTwo"];
    this.ColorThree = source["ColorThree"];
    this.DiscordID = source["DiscordID"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.PenaltyMarks = source["PenaltyMarks"];
  }
}

export class Stadium {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  StadiumName: string;
  TeamID: number;
  TeamAbbr: string;
  City: string;
  State: string;
  Country: string;
  Region: string;
  WeatherRegion: string;
  Capacity: number;
  RecordAttendance: number;
  FirstSeason: number;
  LeagueID: number;
  LeagueName: string;
  IsDomed: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.StadiumName = source["StadiumName"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Region = source["Region"];
    this.WeatherRegion = source["WeatherRegion"];
    this.Capacity = source["Capacity"];
    this.RecordAttendance = source["RecordAttendance"];
    this.FirstSeason = source["FirstSeason"];
    this.LeagueID = source["LeagueID"];
    this.LeagueName = source["LeagueName"];
    this.IsDomed = source["IsDomed"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class CreateRecruitProfileDto {
  PlayerID: number;
  SeasonID: number;
  RecruitID: number;
  ProfileID: number;
  Team: string;
  RES: number;
  AffinityOneEligible: boolean;
  AffinityTwoEligible: boolean;
  PlayerRecruit: Recruit;
  Recruiter: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayerID = source["PlayerID"];
    this.SeasonID = source["SeasonID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.Team = source["Team"];
    this.RES = source["RES"];
    this.AffinityOneEligible = source["AffinityOneEligible"];
    this.AffinityTwoEligible = source["AffinityTwoEligible"];
    this.PlayerRecruit = this.convertValues(source["PlayerRecruit"], Recruit);
    this.Recruiter = source["Recruiter"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class UpdateRecruitPointsDto {
  RecruitPointsID: number;
  RecruitID: number;
  ProfileID: number;
  Team: string;
  WeekID: number;
  AllocationID: number;
  SpentPoints: number;
  RewardScholarship: boolean;
  RevokeScholarship: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.RecruitPointsID = source["RecruitPointsID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.Team = source["Team"];
    this.WeekID = source["WeekID"];
    this.AllocationID = source["AllocationID"];
    this.SpentPoints = source["SpentPoints"];
    this.RewardScholarship = source["RewardScholarship"];
    this.RevokeScholarship = source["RevokeScholarship"];
  }
}
export class CrootProfile {
  ID: number;
  SeasonID: number;
  RecruitID: number;
  ProfileID: number;
  TotalPoints: number;
  CurrentWeeksPoints: number;
  SpendingCount: number;
  RecruitingEfficiencyScore: number;
  Scholarship: boolean;
  ScholarshipRevoked: boolean;
  AffinityOneEligible: boolean;
  AffinityTwoEligible: boolean;
  TeamAbbreviation: string;
  RemovedFromBoard: boolean;
  IsSigned: boolean;
  IsLocked: boolean;
  CaughtCheating: boolean;
  Recruit: Croot;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.SeasonID = source["SeasonID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.TotalPoints = source["TotalPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.RecruitingEfficiencyScore = source["RecruitingEfficiencyScore"];
    this.Scholarship = source["Scholarship"];
    this.ScholarshipRevoked = source["ScholarshipRevoked"];
    this.AffinityOneEligible = source["AffinityOneEligible"];
    this.AffinityTwoEligible = source["AffinityTwoEligible"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.IsSigned = source["IsSigned"];
    this.IsLocked = source["IsLocked"];
    this.CaughtCheating = source["CaughtCheating"];
    this.Recruit = this.convertValues(source["Recruit"], Croot);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class SimTeamBoardResponse {
  ID: number;
  TeamID: number;
  Team: string;
  TeamAbbreviation: string;
  State: string;
  ScholarshipsAvailable: number;
  WeeklyPoints: number;
  SpentPoints: number;
  TotalCommitments: number;
  RecruitClassSize: number;
  BaseEfficiencyScore: number;
  RecruitingEfficiencyScore: number;
  PreviousOverallWinPer: number;
  PreviousConferenceWinPer: number;
  CurrentOverallWinPer: number;
  CurrentConferenceWinPer: number;
  ESPNScore: number;
  RivalsScore: number;
  Rank247Score: number;
  CompositeScore: number;
  IsAI: boolean;
  IsUserTeam: boolean;
  BattlesWon: number;
  BattlesLost: number;
  AIMinThreshold: number;
  AIMaxThreshold: number;
  AIStarMin: number;
  AIStarMax: number;
  AIAutoOfferscholarships: boolean;
  OffensiveScheme: string;
  DefensiveScheme: string;
  Recruiter: string;
  RecruitingClassRank: number;
  Recruits: CrootProfile[];
  Affinities: ProfileAffinity[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.State = source["State"];
    this.ScholarshipsAvailable = source["ScholarshipsAvailable"];
    this.WeeklyPoints = source["WeeklyPoints"];
    this.SpentPoints = source["SpentPoints"];
    this.TotalCommitments = source["TotalCommitments"];
    this.RecruitClassSize = source["RecruitClassSize"];
    this.BaseEfficiencyScore = source["BaseEfficiencyScore"];
    this.RecruitingEfficiencyScore = source["RecruitingEfficiencyScore"];
    this.PreviousOverallWinPer = source["PreviousOverallWinPer"];
    this.PreviousConferenceWinPer = source["PreviousConferenceWinPer"];
    this.CurrentOverallWinPer = source["CurrentOverallWinPer"];
    this.CurrentConferenceWinPer = source["CurrentConferenceWinPer"];
    this.ESPNScore = source["ESPNScore"];
    this.RivalsScore = source["RivalsScore"];
    this.Rank247Score = source["Rank247Score"];
    this.CompositeScore = source["CompositeScore"];
    this.IsAI = source["IsAI"];
    this.IsUserTeam = source["IsUserTeam"];
    this.BattlesWon = source["BattlesWon"];
    this.BattlesLost = source["BattlesLost"];
    this.AIMinThreshold = source["AIMinThreshold"];
    this.AIMaxThreshold = source["AIMaxThreshold"];
    this.AIStarMin = source["AIStarMin"];
    this.AIStarMax = source["AIStarMax"];
    this.AIAutoOfferscholarships = source["AIAutoOfferscholarships"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.Recruiter = source["Recruiter"];
    this.RecruitingClassRank = source["RecruitingClassRank"];
    this.Recruits = this.convertValues(source["Recruits"], CrootProfile);
    this.Affinities = this.convertValues(source["Affinities"], ProfileAffinity);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class UpdateRecruitingBoardDTO {
  Profile: RecruitingTeamProfile;
  Recruits: RecruitPlayerProfile[];
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Profile = this.convertValues(source["Profile"], RecruitingTeamProfile);
    this.Recruits = this.convertValues(
      source["Recruits"],
      RecruitPlayerProfile
    );
    this.TeamID = source["TeamID"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class RecruitPointAllocation {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  RecruitID: number;
  TeamProfileID: number;
  RecruitProfileID: number;
  WeekID: number;
  Points: number;
  RESAffectedPoints: number;
  AffinityOneApplied: boolean;
  AffinityTwoApplied: boolean;
  CaughtCheating: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.RecruitID = source["RecruitID"];
    this.TeamProfileID = source["TeamProfileID"];
    this.RecruitProfileID = source["RecruitProfileID"];
    this.WeekID = source["WeekID"];
    this.Points = source["Points"];
    this.RESAffectedPoints = source["RESAffectedPoints"];
    this.AffinityOneApplied = source["AffinityOneApplied"];
    this.AffinityTwoApplied = source["AffinityTwoApplied"];
    this.CaughtCheating = source["CaughtCheating"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class RedshirtDTO {
  PlayerID: number;
  RedshirtStatus: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayerID = source["PlayerID"];
    this.RedshirtStatus = source["RedshirtStatus"];
  }
}
export class CFBRosterPageResponse {
  Players: CollegePlayer[];
  Promises: CollegePromise[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Players = this.convertValues(source["Players"], CollegePlayer);
    this.Promises = this.convertValues(source["Promises"], CollegePromise);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class TransferPlayerResponse {
  FirstName: string;
  LastName: string;
  Archetype: string;
  Position: string;
  PositionTwo: string;
  ArchetypeTwo: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: number;
  Weight: number;
  PotentialGrade: string;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  OverallGrade: string;
  Personality: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  IsRedshirting: boolean;
  IsRedshirt: boolean;
  PreviousTeamID: number;
  PreviousTeam: string;
  TransferStatus: number;
  TransferLikeliness: string;
  LegacyID: number;
  SeasonStats: CollegePlayerSeasonStats;
  Stats: CollegePlayerStats;
  LeadingTeams: LeadingTeams[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Archetype = source["Archetype"];
    this.Position = source["Position"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.OverallGrade = source["OverallGrade"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.IsRedshirting = source["IsRedshirting"];
    this.IsRedshirt = source["IsRedshirt"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.TransferStatus = source["TransferStatus"];
    this.TransferLikeliness = source["TransferLikeliness"];
    this.LegacyID = source["LegacyID"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.LeadingTeams = this.convertValues(
      source["LeadingTeams"],
      LeadingTeams
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class TransferPortalProfileResponse {
  ID: number;
  SeasonID: number;
  CollegePlayerID: number;
  ProfileID: number;
  PromiseID: number;
  TeamAbbreviation: string;
  TotalPoints: number;
  CurrentWeeksPoints: number;
  PreviouslySpentPoints: number;
  SpendingCount: number;
  RemovedFromBoard: boolean;
  RolledOnPromise: boolean;
  LockProfile: boolean;
  IsSigned: boolean;
  Recruiter: string;
  CollegePlayer: TransferPlayerResponse;
  Promise: CollegePromise;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.SeasonID = source["SeasonID"];
    this.CollegePlayerID = source["CollegePlayerID"];
    this.ProfileID = source["ProfileID"];
    this.PromiseID = source["PromiseID"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.TotalPoints = source["TotalPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.PreviouslySpentPoints = source["PreviouslySpentPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.RolledOnPromise = source["RolledOnPromise"];
    this.LockProfile = source["LockProfile"];
    this.IsSigned = source["IsSigned"];
    this.Recruiter = source["Recruiter"];
    this.CollegePlayer = this.convertValues(
      source["CollegePlayer"],
      TransferPlayerResponse
    );
    this.Promise = this.convertValues(source["Promise"], CollegePromise);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class TransferPortalResponse {
  Team: RecruitingTeamProfile;
  TeamBoard: TransferPortalProfileResponse[];
  TeamPromises: CollegePromise[];
  Players: TransferPlayerResponse[];
  TeamList: CollegeTeam[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Team = this.convertValues(source["Team"], RecruitingTeamProfile);
    this.TeamBoard = this.convertValues(
      source["TeamBoard"],
      TransferPortalProfileResponse
    );
    this.TeamPromises = this.convertValues(
      source["TeamPromises"],
      CollegePromise
    );
    this.Players = this.convertValues(
      source["Players"],
      TransferPlayerResponse
    );
    this.TeamList = this.convertValues(source["TeamList"], CollegeTeam);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class TransferPortalBoardDto {
  Profiles: TransferPortalProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Profiles = this.convertValues(
      source["Profiles"],
      TransferPortalProfile
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class UpdateTransferPortalBoard {
  Profile: SimTeamBoardResponse;
  Players: TransferPortalProfileResponse[];
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Profile = this.convertValues(source["Profile"], SimTeamBoardResponse);
    this.Players = this.convertValues(
      source["Players"],
      TransferPortalProfileResponse
    );
    this.TeamID = source["TeamID"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class FreeAgencyOfferDTO {
  ID: number;
  NFLPlayerID: number;
  TeamID: number;
  Team: string;
  ContractLength: number;
  Y1BaseSalary: number;
  Y1Bonus: number;
  Y2BaseSalary: number;
  Y2Bonus: number;
  Y3BaseSalary: number;
  Y3Bonus: number;
  Y4BaseSalary: number;
  Y4Bonus: number;
  Y5BaseSalary: number;
  Y5Bonus: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.ContractLength = source["ContractLength"];
    this.Y1BaseSalary = source["Y1BaseSalary"];
    this.Y1Bonus = source["Y1Bonus"];
    this.Y2BaseSalary = source["Y2BaseSalary"];
    this.Y2Bonus = source["Y2Bonus"];
    this.Y3BaseSalary = source["Y3BaseSalary"];
    this.Y3Bonus = source["Y3Bonus"];
    this.Y4BaseSalary = source["Y4BaseSalary"];
    this.Y4Bonus = source["Y4Bonus"];
    this.Y5BaseSalary = source["Y5BaseSalary"];
    this.Y5Bonus = source["Y5Bonus"];
  }
}
export class NFLWaiverOffDTO {
  ID: number;
  NFLPlayerID: number;
  TeamID: number;
  Team: string;
  WaiverOrder: number;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.WaiverOrder = source["WaiverOrder"];
    this.IsActive = source["IsActive"];
  }
}

export class CollegePollSubmission {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  Username: string;
  SeasonID: number;
  WeekID: number;
  Week: number;
  Rank1: string;
  Rank1ID: number;
  Rank2: string;
  Rank2ID: number;
  Rank3: string;
  Rank3ID: number;
  Rank4: string;
  Rank4ID: number;
  Rank5: string;
  Rank5ID: number;
  Rank6: string;
  Rank6ID: number;
  Rank7: string;
  Rank7ID: number;
  Rank8: string;
  Rank8ID: number;
  Rank9: string;
  Rank9ID: number;
  Rank10: string;
  Rank10ID: number;
  Rank11: string;
  Rank11ID: number;
  Rank12: string;
  Rank12ID: number;
  Rank13: string;
  Rank13ID: number;
  Rank14: string;
  Rank14ID: number;
  Rank15: string;
  Rank15ID: number;
  Rank16: string;
  Rank16ID: number;
  Rank17: string;
  Rank17ID: number;
  Rank18: string;
  Rank18ID: number;
  Rank19: string;
  Rank19ID: number;
  Rank20: string;
  Rank20ID: number;
  Rank21: string;
  Rank21ID: number;
  Rank22: string;
  Rank22ID: number;
  Rank23: string;
  Rank23ID: number;
  Rank24: string;
  Rank24ID: number;
  Rank25: string;
  Rank25ID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.Username = source["Username"];
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.Rank1 = source["Rank1"];
    this.Rank1ID = source["Rank1ID"];
    this.Rank2 = source["Rank2"];
    this.Rank2ID = source["Rank2ID"];
    this.Rank3 = source["Rank3"];
    this.Rank3ID = source["Rank3ID"];
    this.Rank4 = source["Rank4"];
    this.Rank4ID = source["Rank4ID"];
    this.Rank5 = source["Rank5"];
    this.Rank5ID = source["Rank5ID"];
    this.Rank6 = source["Rank6"];
    this.Rank6ID = source["Rank6ID"];
    this.Rank7 = source["Rank7"];
    this.Rank7ID = source["Rank7ID"];
    this.Rank8 = source["Rank8"];
    this.Rank8ID = source["Rank8ID"];
    this.Rank9 = source["Rank9"];
    this.Rank9ID = source["Rank9ID"];
    this.Rank10 = source["Rank10"];
    this.Rank10ID = source["Rank10ID"];
    this.Rank11 = source["Rank11"];
    this.Rank11ID = source["Rank11ID"];
    this.Rank12 = source["Rank12"];
    this.Rank12ID = source["Rank12ID"];
    this.Rank13 = source["Rank13"];
    this.Rank13ID = source["Rank13ID"];
    this.Rank14 = source["Rank14"];
    this.Rank14ID = source["Rank14ID"];
    this.Rank15 = source["Rank15"];
    this.Rank15ID = source["Rank15ID"];
    this.Rank16 = source["Rank16"];
    this.Rank16ID = source["Rank16ID"];
    this.Rank17 = source["Rank17"];
    this.Rank17ID = source["Rank17ID"];
    this.Rank18 = source["Rank18"];
    this.Rank18ID = source["Rank18ID"];
    this.Rank19 = source["Rank19"];
    this.Rank19ID = source["Rank19ID"];
    this.Rank20 = source["Rank20"];
    this.Rank20ID = source["Rank20ID"];
    this.Rank21 = source["Rank21"];
    this.Rank21ID = source["Rank21ID"];
    this.Rank22 = source["Rank22"];
    this.Rank22ID = source["Rank22ID"];
    this.Rank23 = source["Rank23"];
    this.Rank23ID = source["Rank23ID"];
    this.Rank24 = source["Rank24"];
    this.Rank24ID = source["Rank24ID"];
    this.Rank25 = source["Rank25"];
    this.Rank25ID = source["Rank25ID"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePollOfficial {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  SeasonID: number;
  WeekID: number;
  Week: number;
  Rank1: string;
  Rank1ID: number;
  Rank1Votes: number;
  Rank1No1Votes: number;
  Rank2: string;
  Rank2ID: number;
  Rank2Votes: number;
  Rank2No1Votes: number;
  Rank3: string;
  Rank3ID: number;
  Rank3Votes: number;
  Rank3No1Votes: number;
  Rank4: string;
  Rank4ID: number;
  Rank4Votes: number;
  Rank4No1Votes: number;
  Rank5: string;
  Rank5ID: number;
  Rank5Votes: number;
  Rank5No1Votes: number;
  Rank6: string;
  Rank6ID: number;
  Rank6Votes: number;
  Rank6No1Votes: number;
  Rank7: string;
  Rank7ID: number;
  Rank7Votes: number;
  Rank7No1Votes: number;
  Rank8: string;
  Rank8ID: number;
  Rank8Votes: number;
  Rank8No1Votes: number;
  Rank9: string;
  Rank9ID: number;
  Rank9Votes: number;
  Rank9No1Votes: number;
  Rank10: string;
  Rank10ID: number;
  Rank10Votes: number;
  Rank10No1Votes: number;
  Rank11: string;
  Rank11ID: number;
  Rank11Votes: number;
  Rank11No1Votes: number;
  Rank12: string;
  Rank12ID: number;
  Rank12Votes: number;
  Rank12No1Votes: number;
  Rank13: string;
  Rank13ID: number;
  Rank13Votes: number;
  Rank13No1Votes: number;
  Rank14: string;
  Rank14ID: number;
  Rank14Votes: number;
  Rank14No1Votes: number;
  Rank15: string;
  Rank15ID: number;
  Rank15Votes: number;
  Rank15No1Votes: number;
  Rank16: string;
  Rank16ID: number;
  Rank16Votes: number;
  Rank16No1Votes: number;
  Rank17: string;
  Rank17ID: number;
  Rank17Votes: number;
  Rank17No1Votes: number;
  Rank18: string;
  Rank18ID: number;
  Rank18Votes: number;
  Rank18No1Votes: number;
  Rank19: string;
  Rank19ID: number;
  Rank19Votes: number;
  Rank19No1Votes: number;
  Rank20: string;
  Rank20ID: number;
  Rank20Votes: number;
  Rank20No1Votes: number;
  Rank21: string;
  Rank21ID: number;
  Rank21Votes: number;
  Rank21No1Votes: number;
  Rank22: string;
  Rank22ID: number;
  Rank22Votes: number;
  Rank22No1Votes: number;
  Rank23: string;
  Rank23ID: number;
  Rank23Votes: number;
  Rank23No1Votes: number;
  Rank24: string;
  Rank24ID: number;
  Rank24Votes: number;
  Rank24No1Votes: number;
  Rank25: string;
  Rank25ID: number;
  Rank25Votes: number;
  Rank25No1Votes: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.Rank1 = source["Rank1"];
    this.Rank1ID = source["Rank1ID"];
    this.Rank1Votes = source["Rank1Votes"];
    this.Rank1No1Votes = source["Rank1No1Votes"];
    this.Rank2 = source["Rank2"];
    this.Rank2ID = source["Rank2ID"];
    this.Rank2Votes = source["Rank2Votes"];
    this.Rank2No1Votes = source["Rank2No1Votes"];
    this.Rank3 = source["Rank3"];
    this.Rank3ID = source["Rank3ID"];
    this.Rank3Votes = source["Rank3Votes"];
    this.Rank3No1Votes = source["Rank3No1Votes"];
    this.Rank4 = source["Rank4"];
    this.Rank4ID = source["Rank4ID"];
    this.Rank4Votes = source["Rank4Votes"];
    this.Rank4No1Votes = source["Rank4No1Votes"];
    this.Rank5 = source["Rank5"];
    this.Rank5ID = source["Rank5ID"];
    this.Rank5Votes = source["Rank5Votes"];
    this.Rank5No1Votes = source["Rank5No1Votes"];
    this.Rank6 = source["Rank6"];
    this.Rank6ID = source["Rank6ID"];
    this.Rank6Votes = source["Rank6Votes"];
    this.Rank6No1Votes = source["Rank6No1Votes"];
    this.Rank7 = source["Rank7"];
    this.Rank7ID = source["Rank7ID"];
    this.Rank7Votes = source["Rank7Votes"];
    this.Rank7No1Votes = source["Rank7No1Votes"];
    this.Rank8 = source["Rank8"];
    this.Rank8ID = source["Rank8ID"];
    this.Rank8Votes = source["Rank8Votes"];
    this.Rank8No1Votes = source["Rank8No1Votes"];
    this.Rank9 = source["Rank9"];
    this.Rank9ID = source["Rank9ID"];
    this.Rank9Votes = source["Rank9Votes"];
    this.Rank9No1Votes = source["Rank9No1Votes"];
    this.Rank10 = source["Rank10"];
    this.Rank10ID = source["Rank10ID"];
    this.Rank10Votes = source["Rank10Votes"];
    this.Rank10No1Votes = source["Rank10No1Votes"];
    this.Rank11 = source["Rank11"];
    this.Rank11ID = source["Rank11ID"];
    this.Rank11Votes = source["Rank11Votes"];
    this.Rank11No1Votes = source["Rank11No1Votes"];
    this.Rank12 = source["Rank12"];
    this.Rank12ID = source["Rank12ID"];
    this.Rank12Votes = source["Rank12Votes"];
    this.Rank12No1Votes = source["Rank12No1Votes"];
    this.Rank13 = source["Rank13"];
    this.Rank13ID = source["Rank13ID"];
    this.Rank13Votes = source["Rank13Votes"];
    this.Rank13No1Votes = source["Rank13No1Votes"];
    this.Rank14 = source["Rank14"];
    this.Rank14ID = source["Rank14ID"];
    this.Rank14Votes = source["Rank14Votes"];
    this.Rank14No1Votes = source["Rank14No1Votes"];
    this.Rank15 = source["Rank15"];
    this.Rank15ID = source["Rank15ID"];
    this.Rank15Votes = source["Rank15Votes"];
    this.Rank15No1Votes = source["Rank15No1Votes"];
    this.Rank16 = source["Rank16"];
    this.Rank16ID = source["Rank16ID"];
    this.Rank16Votes = source["Rank16Votes"];
    this.Rank16No1Votes = source["Rank16No1Votes"];
    this.Rank17 = source["Rank17"];
    this.Rank17ID = source["Rank17ID"];
    this.Rank17Votes = source["Rank17Votes"];
    this.Rank17No1Votes = source["Rank17No1Votes"];
    this.Rank18 = source["Rank18"];
    this.Rank18ID = source["Rank18ID"];
    this.Rank18Votes = source["Rank18Votes"];
    this.Rank18No1Votes = source["Rank18No1Votes"];
    this.Rank19 = source["Rank19"];
    this.Rank19ID = source["Rank19ID"];
    this.Rank19Votes = source["Rank19Votes"];
    this.Rank19No1Votes = source["Rank19No1Votes"];
    this.Rank20 = source["Rank20"];
    this.Rank20ID = source["Rank20ID"];
    this.Rank20Votes = source["Rank20Votes"];
    this.Rank20No1Votes = source["Rank20No1Votes"];
    this.Rank21 = source["Rank21"];
    this.Rank21ID = source["Rank21ID"];
    this.Rank21Votes = source["Rank21Votes"];
    this.Rank21No1Votes = source["Rank21No1Votes"];
    this.Rank22 = source["Rank22"];
    this.Rank22ID = source["Rank22ID"];
    this.Rank22Votes = source["Rank22Votes"];
    this.Rank22No1Votes = source["Rank22No1Votes"];
    this.Rank23 = source["Rank23"];
    this.Rank23ID = source["Rank23ID"];
    this.Rank23Votes = source["Rank23Votes"];
    this.Rank23No1Votes = source["Rank23No1Votes"];
    this.Rank24 = source["Rank24"];
    this.Rank24ID = source["Rank24ID"];
    this.Rank24Votes = source["Rank24Votes"];
    this.Rank24No1Votes = source["Rank24No1Votes"];
    this.Rank25 = source["Rank25"];
    this.Rank25ID = source["Rank25ID"];
    this.Rank25Votes = source["Rank25Votes"];
    this.Rank25No1Votes = source["Rank25No1Votes"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class PollDataResponse {
  Poll: CollegePollSubmission;
  Matches: CollegeGame[];
  Standings: CollegeStandings[];
  OfficialPolls: CollegePollOfficial[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Poll = this.convertValues(source["Poll"], CollegePollSubmission);
    this.Matches = this.convertValues(source["Matches"], CollegeGame);
    this.Standings = this.convertValues(source["Standings"], CollegeStandings);
    this.OfficialPolls = this.convertValues(
      source["OfficialPolls"],
      CollegePollOfficial
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class NFLDraftee {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  HighSchool: string;
  CollegeID: number;
  College: string;
  DraftedTeamID: number;
  DraftedTeam: string;
  DraftedRound: number;
  DraftPickID: number;
  DraftedPick: number;
  City: string;
  State: string;
  OverallGrade: string;
  StaminaGrade: string;
  InjuryGrade: string;
  FootballIQGrade: string;
  SpeedGrade: string;
  CarryingGrade: string;
  AgilityGrade: string;
  CatchingGrade: string;
  RouteRunningGrade: string;
  ZoneCoverageGrade: string;
  ManCoverageGrade: string;
  StrengthGrade: string;
  TackleGrade: string;
  PassBlockGrade: string;
  RunBlockGrade: string;
  PassRushGrade: string;
  RunDefenseGrade: string;
  ThrowPowerGrade: string;
  ThrowAccuracyGrade: string;
  KickAccuracyGrade: string;
  KickPowerGrade: string;
  PuntAccuracyGrade: string;
  PuntPowerGrade: string;
  BoomOrBust: boolean;
  BoomOrBustStatus: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.HighSchool = source["HighSchool"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeam = source["DraftedTeam"];
    this.DraftedRound = source["DraftedRound"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftedPick = source["DraftedPick"];
    this.City = source["City"];
    this.State = source["State"];
    this.OverallGrade = source["OverallGrade"];
    this.StaminaGrade = source["StaminaGrade"];
    this.InjuryGrade = source["InjuryGrade"];
    this.FootballIQGrade = source["FootballIQGrade"];
    this.SpeedGrade = source["SpeedGrade"];
    this.CarryingGrade = source["CarryingGrade"];
    this.AgilityGrade = source["AgilityGrade"];
    this.CatchingGrade = source["CatchingGrade"];
    this.RouteRunningGrade = source["RouteRunningGrade"];
    this.ZoneCoverageGrade = source["ZoneCoverageGrade"];
    this.ManCoverageGrade = source["ManCoverageGrade"];
    this.StrengthGrade = source["StrengthGrade"];
    this.TackleGrade = source["TackleGrade"];
    this.PassBlockGrade = source["PassBlockGrade"];
    this.RunBlockGrade = source["RunBlockGrade"];
    this.PassRushGrade = source["PassRushGrade"];
    this.RunDefenseGrade = source["RunDefenseGrade"];
    this.ThrowPowerGrade = source["ThrowPowerGrade"];
    this.ThrowAccuracyGrade = source["ThrowAccuracyGrade"];
    this.KickAccuracyGrade = source["KickAccuracyGrade"];
    this.KickPowerGrade = source["KickPowerGrade"];
    this.PuntAccuracyGrade = source["PuntAccuracyGrade"];
    this.PuntPowerGrade = source["PuntPowerGrade"];
    this.BoomOrBust = source["BoomOrBust"];
    this.BoomOrBustStatus = source["BoomOrBustStatus"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class ScoutingProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  PlayerID: number;
  TeamID: number;
  ShowAttribute1: boolean;
  ShowAttribute2: boolean;
  ShowAttribute3: boolean;
  ShowAttribute4: boolean;
  ShowAttribute5: boolean;
  ShowAttribute6: boolean;
  ShowAttribute7: boolean;
  ShowAttribute8: boolean;
  ShowPotential: boolean;
  RemovedFromBoard: boolean;
  ShowCount: number;
  Draftee: NFLDraftee;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.ShowAttribute1 = source["ShowAttribute1"];
    this.ShowAttribute2 = source["ShowAttribute2"];
    this.ShowAttribute3 = source["ShowAttribute3"];
    this.ShowAttribute4 = source["ShowAttribute4"];
    this.ShowAttribute5 = source["ShowAttribute5"];
    this.ShowAttribute6 = source["ShowAttribute6"];
    this.ShowAttribute7 = source["ShowAttribute7"];
    this.ShowAttribute8 = source["ShowAttribute8"];
    this.ShowPotential = source["ShowPotential"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.ShowCount = source["ShowCount"];
    this.Draftee = this.convertValues(source["Draftee"], NFLDraftee);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLWarRoom {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Team: string;
  ScoutingPoints: number;
  SpentPoints: number;
  DraftPicks: NFLDraftPick[];
  ScoutProfiles: ScoutingProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.ScoutingPoints = source["ScoutingPoints"];
    this.SpentPoints = source["SpentPoints"];
    this.DraftPicks = this.convertValues(source["DraftPicks"], NFLDraftPick);
    this.ScoutProfiles = this.convertValues(
      source["ScoutProfiles"],
      ScoutingProfile
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLDraftPageResponse {
  WarRoom: NFLWarRoom;
  DraftablePlayers: NFLDraftee[];
  NFLTeams: NFLTeam[];
  AllDraftPicks: NFLDraftPick[][];
  CollegeTeams: CollegeTeam[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.WarRoom = this.convertValues(source["WarRoom"], NFLWarRoom);
    this.DraftablePlayers = this.convertValues(
      source["DraftablePlayers"],
      NFLDraftee
    );
    this.NFLTeams = this.convertValues(source["NFLTeams"], NFLTeam);
    this.AllDraftPicks = this.convertValues(
      source["AllDraftPicks"],
      NFLDraftPick
    );
    this.CollegeTeams = this.convertValues(source["CollegeTeams"], CollegeTeam);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class ScoutingProfileDTO {
  PlayerID: number;
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
  }
}
export class ScoutingDataResponse {
  DrafteeSeasonStats: CollegePlayerSeasonStats;
  TeamStandings: CollegeStandings;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.DrafteeSeasonStats = this.convertValues(
      source["DrafteeSeasonStats"],
      CollegePlayerSeasonStats
    );
    this.TeamStandings = this.convertValues(
      source["TeamStandings"],
      CollegeStandings
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class RevealAttributeDTO {
  ScoutProfileID: number;
  Attribute: string;
  Points: number;
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ScoutProfileID = source["ScoutProfileID"];
    this.Attribute = source["Attribute"];
    this.Points = source["Points"];
    this.TeamID = source["TeamID"];
  }
}
export class ExportDraftPicksDTO {
  DraftPicks: NFLDraftPick[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.DraftPicks = this.convertValues(source["DraftPicks"], NFLDraftPick);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePlayerResponse {
  ID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  TeamID: number;
  TeamAbbr: string;
  City: string;
  State: string;
  Year: number;
  IsRedshirt: boolean;
  ConferenceID: number;
  Conference: string;
  Stats: CollegePlayerStats;
  SeasonStats: CollegePlayerSeasonStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.City = source["City"];
    this.State = source["State"];
    this.Year = source["Year"];
    this.IsRedshirt = source["IsRedshirt"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLPlayerResponse {
  ID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  TeamID: number;
  TeamAbbr: string;
  City: string;
  State: string;
  Year: number;
  ConferenceID: number;
  Conference: string;
  DivisionID: number;
  Division: string;
  Stats: NFLPlayerStats;
  SeasonStats: NFLPlayerSeasonStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.City = source["City"];
    this.State = source["State"];
    this.Year = source["Year"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.DivisionID = source["DivisionID"];
    this.Division = source["Division"];
    this.Stats = this.convertValues(source["Stats"], NFLPlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NFLPlayerSeasonStats
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class CollegePlayerCSV {
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PositionTwo: string;
  ArchetypeTwo: string;
  Year: string;
  Team: string;
  Age: number;
  Stars: number;
  HighSchool: string;
  City: string;
  State: string;
  College: string;
  Height: number;
  Weight: number;
  Shotgun: number;
  OverallGrade: string;
  StaminaGrade: string;
  InjuryGrade: string;
  FootballIQGrade: string;
  SpeedGrade: string;
  CarryingGrade: string;
  AgilityGrade: string;
  CatchingGrade: string;
  RouteRunningGrade: string;
  ZoneCoverageGrade: string;
  ManCoverageGrade: string;
  StrengthGrade: string;
  TackleGrade: string;
  PassBlockGrade: string;
  RunBlockGrade: string;
  PassRushGrade: string;
  RunDefenseGrade: string;
  ThrowPowerGrade: string;
  ThrowAccuracyGrade: string;
  KickAccuracyGrade: string;
  KickPowerGrade: string;
  PuntAccuracyGrade: string;
  PuntPowerGrade: string;
  PotentialGrade: string;
  RedshirtStatus: string;
  Stats: CollegePlayerStats[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.Year = source["Year"];
    this.Team = source["Team"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.HighSchool = source["HighSchool"];
    this.City = source["City"];
    this.State = source["State"];
    this.College = source["College"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Shotgun = source["Shotgun"];
    this.OverallGrade = source["OverallGrade"];
    this.StaminaGrade = source["StaminaGrade"];
    this.InjuryGrade = source["InjuryGrade"];
    this.FootballIQGrade = source["FootballIQGrade"];
    this.SpeedGrade = source["SpeedGrade"];
    this.CarryingGrade = source["CarryingGrade"];
    this.AgilityGrade = source["AgilityGrade"];
    this.CatchingGrade = source["CatchingGrade"];
    this.RouteRunningGrade = source["RouteRunningGrade"];
    this.ZoneCoverageGrade = source["ZoneCoverageGrade"];
    this.ManCoverageGrade = source["ManCoverageGrade"];
    this.StrengthGrade = source["StrengthGrade"];
    this.TackleGrade = source["TackleGrade"];
    this.PassBlockGrade = source["PassBlockGrade"];
    this.RunBlockGrade = source["RunBlockGrade"];
    this.PassRushGrade = source["PassRushGrade"];
    this.RunDefenseGrade = source["RunDefenseGrade"];
    this.ThrowPowerGrade = source["ThrowPowerGrade"];
    this.ThrowAccuracyGrade = source["ThrowAccuracyGrade"];
    this.KickAccuracyGrade = source["KickAccuracyGrade"];
    this.KickPowerGrade = source["KickPowerGrade"];
    this.PuntAccuracyGrade = source["PuntAccuracyGrade"];
    this.PuntPowerGrade = source["PuntPowerGrade"];
    this.PotentialGrade = source["PotentialGrade"];
    this.RedshirtStatus = source["RedshirtStatus"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class HistoricCollegePlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  HighSchool: string;
  City: string;
  State: string;
  Year: number;
  IsRedshirt: boolean;
  IsRedshirting: boolean;
  HasGraduated: boolean;
  TransferStatus: number;
  TransferLikeliness: string;
  Stats: CollegePlayerStats[];
  SeasonStats: CollegePlayerSeasonStats;
  HasProgressed: boolean;
  WillDeclare: boolean;
  LegacyID: number;
  Profiles: TransferPortalProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.HighSchool = source["HighSchool"];
    this.City = source["City"];
    this.State = source["State"];
    this.Year = source["Year"];
    this.IsRedshirt = source["IsRedshirt"];
    this.IsRedshirting = source["IsRedshirting"];
    this.HasGraduated = source["HasGraduated"];
    this.TransferStatus = source["TransferStatus"];
    this.TransferLikeliness = source["TransferLikeliness"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
    this.HasProgressed = source["HasProgressed"];
    this.WillDeclare = source["WillDeclare"];
    this.LegacyID = source["LegacyID"];
    this.Profiles = this.convertValues(
      source["Profiles"],
      TransferPortalProfile
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLRetiredPlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  Height: number;
  Weight: number;
  Age: number;
  Stars: number;
  Overall: number;
  Stamina: number;
  Injury: number;
  FootballIQ: number;
  Speed: number;
  Carrying: number;
  Agility: number;
  Catching: number;
  RouteRunning: number;
  ZoneCoverage: number;
  ManCoverage: number;
  Strength: number;
  Tackle: number;
  PassBlock: number;
  RunBlock: number;
  PassRush: number;
  RunDefense: number;
  ThrowPower: number;
  ThrowAccuracy: number;
  KickAccuracy: number;
  KickPower: number;
  PuntAccuracy: number;
  PuntPower: number;
  Progression: number;
  Discipline: number;
  PotentialGrade: string;
  FreeAgency: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PrimeAge: number;
  Clutch: number;
  Shotgun: number;
  PositionTwo: string;
  ArchetypeTwo: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  CollegeID: number;
  College: string;
  TeamAbbr: string;
  Experience: number;
  HighSchool: string;
  Hometown: string;
  State: string;
  IsActive: boolean;
  IsPracticeSquad: boolean;
  IsFreeAgent: boolean;
  IsWaived: boolean;
  IsOnTradeBlock: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  NegotiationRound: number;
  SigningRound: number;
  MinimumValue: number;
  DraftedTeamID: number;
  DraftedTeam: string;
  DraftedRound: number;
  DraftPickID: number;
  DraftedPick: number;
  ShowLetterGrade: boolean;
  HasProgressed: boolean;
  Rejections: number;
  ProBowls: number;
  TagType: number;
  Stats: NFLPlayerStats[];
  SeasonStats: NFLPlayerSeasonStats;
  Contract: NFLContract;
  Offers: FreeAgencyOffer[];
  WaiverOffers: NFLWaiverOffer[];
  Extensions: NFLExtensionOffer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.Height = source["Height"];
    this.Weight = source["Weight"];
    this.Age = source["Age"];
    this.Stars = source["Stars"];
    this.Overall = source["Overall"];
    this.Stamina = source["Stamina"];
    this.Injury = source["Injury"];
    this.FootballIQ = source["FootballIQ"];
    this.Speed = source["Speed"];
    this.Carrying = source["Carrying"];
    this.Agility = source["Agility"];
    this.Catching = source["Catching"];
    this.RouteRunning = source["RouteRunning"];
    this.ZoneCoverage = source["ZoneCoverage"];
    this.ManCoverage = source["ManCoverage"];
    this.Strength = source["Strength"];
    this.Tackle = source["Tackle"];
    this.PassBlock = source["PassBlock"];
    this.RunBlock = source["RunBlock"];
    this.PassRush = source["PassRush"];
    this.RunDefense = source["RunDefense"];
    this.ThrowPower = source["ThrowPower"];
    this.ThrowAccuracy = source["ThrowAccuracy"];
    this.KickAccuracy = source["KickAccuracy"];
    this.KickPower = source["KickPower"];
    this.PuntAccuracy = source["PuntAccuracy"];
    this.PuntPower = source["PuntPower"];
    this.Progression = source["Progression"];
    this.Discipline = source["Discipline"];
    this.PotentialGrade = source["PotentialGrade"];
    this.FreeAgency = source["FreeAgency"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PrimeAge = source["PrimeAge"];
    this.Clutch = source["Clutch"];
    this.Shotgun = source["Shotgun"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Experience = source["Experience"];
    this.HighSchool = source["HighSchool"];
    this.Hometown = source["Hometown"];
    this.State = source["State"];
    this.IsActive = source["IsActive"];
    this.IsPracticeSquad = source["IsPracticeSquad"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsWaived = source["IsWaived"];
    this.IsOnTradeBlock = source["IsOnTradeBlock"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.NegotiationRound = source["NegotiationRound"];
    this.SigningRound = source["SigningRound"];
    this.MinimumValue = source["MinimumValue"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeam = source["DraftedTeam"];
    this.DraftedRound = source["DraftedRound"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftedPick = source["DraftedPick"];
    this.ShowLetterGrade = source["ShowLetterGrade"];
    this.HasProgressed = source["HasProgressed"];
    this.Rejections = source["Rejections"];
    this.ProBowls = source["ProBowls"];
    this.TagType = source["TagType"];
    this.Stats = this.convertValues(source["Stats"], NFLPlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NFLPlayerSeasonStats
    );
    this.Contract = this.convertValues(source["Contract"], NFLContract);
    this.Offers = this.convertValues(source["Offers"], FreeAgencyOffer);
    this.WaiverOffers = this.convertValues(
      source["WaiverOffers"],
      NFLWaiverOffer
    );
    this.Extensions = this.convertValues(
      source["Extensions"],
      NFLExtensionOffer
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLRequest {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  Username: string;
  NFLTeamID: number;
  NFLTeam: string;
  NFLTeamAbbreviation: string;
  IsOwner: boolean;
  IsManager: boolean;
  IsCoach: boolean;
  IsAssistant: boolean;
  IsApproved: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.Username = source["Username"];
    this.NFLTeamID = source["NFLTeamID"];
    this.NFLTeam = source["NFLTeam"];
    this.NFLTeamAbbreviation = source["NFLTeamAbbreviation"];
    this.IsOwner = source["IsOwner"];
    this.IsManager = source["IsManager"];
    this.IsCoach = source["IsCoach"];
    this.IsAssistant = source["IsAssistant"];
    this.IsApproved = source["IsApproved"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class TeamRequest {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Username: string;
  IsApproved: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.Username = source["Username"];
    this.IsApproved = source["IsApproved"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradeOption {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TradeProposalID: number;
  NFLTeamID: number;
  NFLPlayerID: number;
  NFLDraftPickID: number;
  OptionType: string;
  SalaryPercentage: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TradeProposalID = source["TradeProposalID"];
    this.NFLTeamID = source["NFLTeamID"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.NFLDraftPickID = source["NFLDraftPickID"];
    this.OptionType = source["OptionType"];
    this.SalaryPercentage = source["SalaryPercentage"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradeProposal {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLTeamID: number;
  NFLTeam: string;
  RecepientTeamID: number;
  RecepientTeam: string;
  IsTradeAccepted: boolean;
  IsTradeRejected: boolean;
  IsSynced: boolean;
  NFLTeamTradeOptions: NFLTradeOption[];
  RecepientTeamTradeOptions: NFLTradeOption[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLTeamID = source["NFLTeamID"];
    this.NFLTeam = source["NFLTeam"];
    this.RecepientTeamID = source["RecepientTeamID"];
    this.RecepientTeam = source["RecepientTeam"];
    this.IsTradeAccepted = source["IsTradeAccepted"];
    this.IsTradeRejected = source["IsTradeRejected"];
    this.IsSynced = source["IsSynced"];
    this.NFLTeamTradeOptions = this.convertValues(
      source["NFLTeamTradeOptions"],
      NFLTradeOption
    );
    this.RecepientTeamTradeOptions = this.convertValues(
      source["RecepientTeamTradeOptions"],
      NFLTradeOption
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradeOptionObj {
  ID: number;
  TradeProposalID: number;
  NFLTeamID: number;
  NFLPlayerID: number;
  NFLDraftPickID: number;
  OptionType: string;
  SalaryPercentage: number;
  Player: NFLPlayer;
  Draftpick: NFLDraftPick;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TradeProposalID = source["TradeProposalID"];
    this.NFLTeamID = source["NFLTeamID"];
    this.NFLPlayerID = source["NFLPlayerID"];
    this.NFLDraftPickID = source["NFLDraftPickID"];
    this.OptionType = source["OptionType"];
    this.SalaryPercentage = source["SalaryPercentage"];
    this.Player = this.convertValues(source["Player"], NFLPlayer);
    this.Draftpick = this.convertValues(source["Draftpick"], NFLDraftPick);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradeProposalDTO {
  ID: number;
  NFLTeamID: number;
  NFLTeam: string;
  RecepientTeamID: number;
  RecepientTeam: string;
  IsTradeAccepted: boolean;
  IsTradeRejected: boolean;
  NFLTeamTradeOptions: NFLTradeOptionObj[];
  RecepientTeamTradeOptions: NFLTradeOptionObj[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.NFLTeamID = source["NFLTeamID"];
    this.NFLTeam = source["NFLTeam"];
    this.RecepientTeamID = source["RecepientTeamID"];
    this.RecepientTeam = source["RecepientTeam"];
    this.IsTradeAccepted = source["IsTradeAccepted"];
    this.IsTradeRejected = source["IsTradeRejected"];
    this.NFLTeamTradeOptions = this.convertValues(
      source["NFLTeamTradeOptions"],
      NFLTradeOptionObj
    );
    this.RecepientTeamTradeOptions = this.convertValues(
      source["RecepientTeamTradeOptions"],
      NFLTradeOptionObj
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class NFLTeamProposals {
  SentTradeProposals: NFLTradeProposalDTO[];
  ReceivedTradeProposals: NFLTradeProposalDTO[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.SentTradeProposals = this.convertValues(
      source["SentTradeProposals"],
      NFLTradeProposalDTO
    );
    this.ReceivedTradeProposals = this.convertValues(
      source["ReceivedTradeProposals"],
      NFLTradeProposalDTO
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradePreferences {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NFLTeamID: number;
  Quarterbacks: boolean;
  QuarterbackType: string;
  Runningbacks: boolean;
  RunningbackType: string;
  Fullbacks: boolean;
  FullbackType: string;
  WideReceivers: boolean;
  WideReceiverType: string;
  TightEnds: boolean;
  TightEndType: string;
  OffensiveTackles: boolean;
  OffensiveGuards: boolean;
  Centers: boolean;
  OffensiveTackleType: string;
  OffensiveGuardType: string;
  CenterType: string;
  DefensiveTackles: boolean;
  DefensiveTackleType: string;
  DefensiveEnds: boolean;
  DefensiveEndType: string;
  OutsideLinebackers: boolean;
  OutsideLinebackerType: string;
  InsideLinebackers: boolean;
  InsideLinebackerType: string;
  Cornerbacks: boolean;
  CornerbackType: string;
  FreeSafeties: boolean;
  FreeSafetyType: string;
  StrongSafeties: boolean;
  StrongSafetyType: string;
  Kickers: boolean;
  KickerType: string;
  Punters: boolean;
  PunterType: string;
  DraftPicks: boolean;
  DraftPickType: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NFLTeamID = source["NFLTeamID"];
    this.Quarterbacks = source["Quarterbacks"];
    this.QuarterbackType = source["QuarterbackType"];
    this.Runningbacks = source["Runningbacks"];
    this.RunningbackType = source["RunningbackType"];
    this.Fullbacks = source["Fullbacks"];
    this.FullbackType = source["FullbackType"];
    this.WideReceivers = source["WideReceivers"];
    this.WideReceiverType = source["WideReceiverType"];
    this.TightEnds = source["TightEnds"];
    this.TightEndType = source["TightEndType"];
    this.OffensiveTackles = source["OffensiveTackles"];
    this.OffensiveGuards = source["OffensiveGuards"];
    this.Centers = source["Centers"];
    this.OffensiveTackleType = source["OffensiveTackleType"];
    this.OffensiveGuardType = source["OffensiveGuardType"];
    this.CenterType = source["CenterType"];
    this.DefensiveTackles = source["DefensiveTackles"];
    this.DefensiveTackleType = source["DefensiveTackleType"];
    this.DefensiveEnds = source["DefensiveEnds"];
    this.DefensiveEndType = source["DefensiveEndType"];
    this.OutsideLinebackers = source["OutsideLinebackers"];
    this.OutsideLinebackerType = source["OutsideLinebackerType"];
    this.InsideLinebackers = source["InsideLinebackers"];
    this.InsideLinebackerType = source["InsideLinebackerType"];
    this.Cornerbacks = source["Cornerbacks"];
    this.CornerbackType = source["CornerbackType"];
    this.FreeSafeties = source["FreeSafeties"];
    this.FreeSafetyType = source["FreeSafetyType"];
    this.StrongSafeties = source["StrongSafeties"];
    this.StrongSafetyType = source["StrongSafetyType"];
    this.Kickers = source["Kickers"];
    this.KickerType = source["KickerType"];
    this.Punters = source["Punters"];
    this.PunterType = source["PunterType"];
    this.DraftPicks = source["DraftPicks"];
    this.DraftPickType = source["DraftPickType"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class NFLTradePreferencesDTO {
  NFLTeamID: number;
  Quarterbacks: boolean;
  QuarterbackType: string;
  Runningbacks: boolean;
  RunningbackType: string;
  Fullbacks: boolean;
  FullbackType: string;
  WideReceivers: boolean;
  WideReceiverType: string;
  TightEnds: boolean;
  TightEndType: string;
  OffensiveTackles: boolean;
  OffensiveGuards: boolean;
  Centers: boolean;
  OffensiveTackleType: string;
  OffensiveGuardType: string;
  CenterType: string;
  DefensiveTackles: boolean;
  DefensiveTackleType: string;
  DefensiveEnds: boolean;
  DefensiveEndType: string;
  OutsideLinebackers: boolean;
  OutsideLinebackerType: string;
  InsideLinebackers: boolean;
  InsideLinebackerType: string;
  Cornerbacks: boolean;
  CornerbackType: string;
  FreeSafeties: boolean;
  FreeSafetyType: string;
  StrongSafeties: boolean;
  StrongSafetyType: string;
  Kickers: boolean;
  KickerType: string;
  Punters: boolean;
  PunterType: string;
  DraftPicks: boolean;
  DraftPickType: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.NFLTeamID = source["NFLTeamID"];
    this.Quarterbacks = source["Quarterbacks"];
    this.QuarterbackType = source["QuarterbackType"];
    this.Runningbacks = source["Runningbacks"];
    this.RunningbackType = source["RunningbackType"];
    this.Fullbacks = source["Fullbacks"];
    this.FullbackType = source["FullbackType"];
    this.WideReceivers = source["WideReceivers"];
    this.WideReceiverType = source["WideReceiverType"];
    this.TightEnds = source["TightEnds"];
    this.TightEndType = source["TightEndType"];
    this.OffensiveTackles = source["OffensiveTackles"];
    this.OffensiveGuards = source["OffensiveGuards"];
    this.Centers = source["Centers"];
    this.OffensiveTackleType = source["OffensiveTackleType"];
    this.OffensiveGuardType = source["OffensiveGuardType"];
    this.CenterType = source["CenterType"];
    this.DefensiveTackles = source["DefensiveTackles"];
    this.DefensiveTackleType = source["DefensiveTackleType"];
    this.DefensiveEnds = source["DefensiveEnds"];
    this.DefensiveEndType = source["DefensiveEndType"];
    this.OutsideLinebackers = source["OutsideLinebackers"];
    this.OutsideLinebackerType = source["OutsideLinebackerType"];
    this.InsideLinebackers = source["InsideLinebackers"];
    this.InsideLinebackerType = source["InsideLinebackerType"];
    this.Cornerbacks = source["Cornerbacks"];
    this.CornerbackType = source["CornerbackType"];
    this.FreeSafeties = source["FreeSafeties"];
    this.FreeSafetyType = source["FreeSafetyType"];
    this.StrongSafeties = source["StrongSafeties"];
    this.StrongSafetyType = source["StrongSafetyType"];
    this.Kickers = source["Kickers"];
    this.KickerType = source["KickerType"];
    this.Punters = source["Punters"];
    this.PunterType = source["PunterType"];
    this.DraftPicks = source["DraftPicks"];
    this.DraftPickType = source["DraftPickType"];
  }
}
export class NFLUser {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  Username: string;
  TeamID: number;
  TeamAbbreviation: string;
  IsOwner: boolean;
  IsManager: boolean;
  IsHeadCoach: boolean;
  IsAssistant: boolean;
  TotalWins: number;
  TotalLosses: number;
  TotalTies: number;
  ConferenceChampionships: number;
  PlayoffWins: number;
  PlayoffLosses: number;
  SuperBowls: number;
  SuperBowlLosses: number;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.Username = source["Username"];
    this.TeamID = source["TeamID"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.IsOwner = source["IsOwner"];
    this.IsManager = source["IsManager"];
    this.IsHeadCoach = source["IsHeadCoach"];
    this.IsAssistant = source["IsAssistant"];
    this.TotalWins = source["TotalWins"];
    this.TotalLosses = source["TotalLosses"];
    this.TotalTies = source["TotalTies"];
    this.ConferenceChampionships = source["ConferenceChampionships"];
    this.PlayoffWins = source["PlayoffWins"];
    this.PlayoffLosses = source["PlayoffLosses"];
    this.SuperBowls = source["SuperBowls"];
    this.SuperBowlLosses = source["SuperBowlLosses"];
    this.IsActive = source["IsActive"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class PlayByPlayResponse {
  PlayNumber: number;
  HomeTeamID: number;
  HomeTeamScore: number;
  AwayTeamID: number;
  AwayTeamScore: number;
  Quarter: number;
  Possession: string;
  TimeRemaining: string;
  Down: number;
  Distance: number;
  LineOfScrimmage: string;
  PlayType: string;
  PlayName: string;
  OffensiveFormation: string;
  DefensiveFormation: string;
  PointOfAttack: string;
  DefensiveTendency: string;
  BlitzNumber: number;
  LBCoverage: string;
  CBCoverage: string;
  SCoverage: string;
  QBPlayerID: number;
  BallCarrierID: number;
  Tackler1ID: number;
  Tackler2ID: number;
  PresureID: number;
  ResultYards: number;
  Result: string;
  StreamResult: string[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayNumber = source["PlayNumber"];
    this.HomeTeamID = source["HomeTeamID"];
    this.HomeTeamScore = source["HomeTeamScore"];
    this.AwayTeamID = source["AwayTeamID"];
    this.AwayTeamScore = source["AwayTeamScore"];
    this.Quarter = source["Quarter"];
    this.Possession = source["Possession"];
    this.TimeRemaining = source["TimeRemaining"];
    this.Down = source["Down"];
    this.Distance = source["Distance"];
    this.LineOfScrimmage = source["LineOfScrimmage"];
    this.PlayType = source["PlayType"];
    this.PlayName = source["PlayName"];
    this.OffensiveFormation = source["OffensiveFormation"];
    this.DefensiveFormation = source["DefensiveFormation"];
    this.PointOfAttack = source["PointOfAttack"];
    this.DefensiveTendency = source["DefensiveTendency"];
    this.BlitzNumber = source["BlitzNumber"];
    this.LBCoverage = source["LBCoverage"];
    this.CBCoverage = source["CBCoverage"];
    this.SCoverage = source["SCoverage"];
    this.QBPlayerID = source["QBPlayerID"];
    this.BallCarrierID = source["BallCarrierID"];
    this.Tackler1ID = source["Tackler1ID"];
    this.Tackler2ID = source["Tackler2ID"];
    this.PresureID = source["PresureID"];
    this.ResultYards = source["ResultYards"];
    this.Result = source["Result"];
    this.StreamResult = source["StreamResult"];
  }
}
export class ScoreBoard {
  Q1Home: number;
  Q2Home: number;
  Q3Home: number;
  Q4Home: number;
  OT1Home: number;
  OT2Home: number;
  OT3Home: number;
  OT4Home: number;
  Q1Away: number;
  Q2Away: number;
  Q3Away: number;
  Q4Away: number;
  OT1Away: number;
  OT2Away: number;
  OT3Away: number;
  OT4Away: number;
  HomeOffensiveScheme: string;
  HomeDefensiveScheme: string;
  AwayOffensiveScheme: string;
  AwayDefensiveScheme: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Q1Home = source["Q1Home"];
    this.Q2Home = source["Q2Home"];
    this.Q3Home = source["Q3Home"];
    this.Q4Home = source["Q4Home"];
    this.OT1Home = source["OT1Home"];
    this.OT2Home = source["OT2Home"];
    this.OT3Home = source["OT3Home"];
    this.OT4Home = source["OT4Home"];
    this.Q1Away = source["Q1Away"];
    this.Q2Away = source["Q2Away"];
    this.Q3Away = source["Q3Away"];
    this.Q4Away = source["Q4Away"];
    this.OT1Away = source["OT1Away"];
    this.OT2Away = source["OT2Away"];
    this.OT3Away = source["OT3Away"];
    this.OT4Away = source["OT4Away"];
    this.HomeOffensiveScheme = source["HomeOffensiveScheme"];
    this.HomeDefensiveScheme = source["HomeDefensiveScheme"];
    this.AwayOffensiveScheme = source["AwayOffensiveScheme"];
    this.AwayDefensiveScheme = source["AwayDefensiveScheme"];
  }
}
export class GameResultsPlayer {
  ID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  TeamAbbr: string;
  League: string;
  Year: number;
  PassingYards: number;
  PassAttempts: number;
  PassCompletions: number;
  PassingTDs: number;
  Interceptions: number;
  LongestPass: number;
  Sacks: number;
  RushAttempts: number;
  RushingYards: number;
  RushingTDs: number;
  Fumbles: number;
  LongestRush: number;
  Targets: number;
  Catches: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  LongestReception: number;
  SoloTackles: number;
  AssistedTackles: number;
  TacklesForLoss: number;
  SacksMade: number;
  ForcedFumbles: number;
  RecoveredFumbles: number;
  PassDeflections: number;
  InterceptionsCaught: number;
  Safeties: number;
  DefensiveTDs: number;
  FGMade: number;
  FGAttempts: number;
  LongestFG: number;
  ExtraPointsMade: number;
  ExtraPointsAttempted: number;
  KickoffTouchbacks: number;
  Punts: number;
  PuntTouchbacks: number;
  PuntsInside20: number;
  KickReturns: number;
  KickReturnTDs: number;
  KickReturnYards: number;
  PuntReturns: number;
  PuntReturnTDs: number;
  PuntReturnYards: number;
  STSoloTackles: number;
  STAssistedTackles: number;
  PuntsBlocked: number;
  FGBlocked: number;
  Snaps: number;
  Pancakes: number;
  SacksAllowed: number;
  PlayedGame: number;
  StartedGame: number;
  WasInjured: boolean;
  WeeksOfRecovery: number;
  InjuryType: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.TeamAbbr = source["TeamAbbr"];
    this.League = source["League"];
    this.Year = source["Year"];
    this.PassingYards = source["PassingYards"];
    this.PassAttempts = source["PassAttempts"];
    this.PassCompletions = source["PassCompletions"];
    this.PassingTDs = source["PassingTDs"];
    this.Interceptions = source["Interceptions"];
    this.LongestPass = source["LongestPass"];
    this.Sacks = source["Sacks"];
    this.RushAttempts = source["RushAttempts"];
    this.RushingYards = source["RushingYards"];
    this.RushingTDs = source["RushingTDs"];
    this.Fumbles = source["Fumbles"];
    this.LongestRush = source["LongestRush"];
    this.Targets = source["Targets"];
    this.Catches = source["Catches"];
    this.ReceivingYards = source["ReceivingYards"];
    this.ReceivingTDs = source["ReceivingTDs"];
    this.LongestReception = source["LongestReception"];
    this.SoloTackles = source["SoloTackles"];
    this.AssistedTackles = source["AssistedTackles"];
    this.TacklesForLoss = source["TacklesForLoss"];
    this.SacksMade = source["SacksMade"];
    this.ForcedFumbles = source["ForcedFumbles"];
    this.RecoveredFumbles = source["RecoveredFumbles"];
    this.PassDeflections = source["PassDeflections"];
    this.InterceptionsCaught = source["InterceptionsCaught"];
    this.Safeties = source["Safeties"];
    this.DefensiveTDs = source["DefensiveTDs"];
    this.FGMade = source["FGMade"];
    this.FGAttempts = source["FGAttempts"];
    this.LongestFG = source["LongestFG"];
    this.ExtraPointsMade = source["ExtraPointsMade"];
    this.ExtraPointsAttempted = source["ExtraPointsAttempted"];
    this.KickoffTouchbacks = source["KickoffTouchbacks"];
    this.Punts = source["Punts"];
    this.PuntTouchbacks = source["PuntTouchbacks"];
    this.PuntsInside20 = source["PuntsInside20"];
    this.KickReturns = source["KickReturns"];
    this.KickReturnTDs = source["KickReturnTDs"];
    this.KickReturnYards = source["KickReturnYards"];
    this.PuntReturns = source["PuntReturns"];
    this.PuntReturnTDs = source["PuntReturnTDs"];
    this.PuntReturnYards = source["PuntReturnYards"];
    this.STSoloTackles = source["STSoloTackles"];
    this.STAssistedTackles = source["STAssistedTackles"];
    this.PuntsBlocked = source["PuntsBlocked"];
    this.FGBlocked = source["FGBlocked"];
    this.Snaps = source["Snaps"];
    this.Pancakes = source["Pancakes"];
    this.SacksAllowed = source["SacksAllowed"];
    this.PlayedGame = source["PlayedGame"];
    this.StartedGame = source["StartedGame"];
    this.WasInjured = source["WasInjured"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryType = source["InjuryType"];
  }
}
export class GameResultsResponse {
  HomePlayers: GameResultsPlayer[];
  AwayPlayers: GameResultsPlayer[];
  PlayByPlays: PlayByPlayResponse[];
  Score: ScoreBoard;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.HomePlayers = this.convertValues(
      source["HomePlayers"],
      GameResultsPlayer
    );
    this.AwayPlayers = this.convertValues(
      source["AwayPlayers"],
      GameResultsPlayer
    );
    this.PlayByPlays = this.convertValues(
      source["PlayByPlays"],
      PlayByPlayResponse
    );
    this.Score = this.convertValues(source["Score"], ScoreBoard);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class TopPlayer {
  PlayerID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  PositionTwo: string;
  ArchetypeTwo: string;
  OverallGrade: string;
  Overall: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayerID = source["PlayerID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.PositionTwo = source["PositionTwo"];
    this.ArchetypeTwo = source["ArchetypeTwo"];
    this.OverallGrade = source["OverallGrade"];
    this.Overall = source["Overall"];
  }
}
export class TeamRecordResponse {
  OverallWins: number;
  OverallLosses: number;
  CurrentSeasonWins: number;
  CurrentSeasonLosses: number;
  BowlWins: number;
  BowlLosses: number;
  ConferenceChampionships: string[];
  DivisionTitles: string[];
  NationalChampionships: string[];
  TopPlayers: TopPlayer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.OverallWins = source["OverallWins"];
    this.OverallLosses = source["OverallLosses"];
    this.CurrentSeasonWins = source["CurrentSeasonWins"];
    this.CurrentSeasonLosses = source["CurrentSeasonLosses"];
    this.BowlWins = source["BowlWins"];
    this.BowlLosses = source["BowlLosses"];
    this.ConferenceChampionships = source["ConferenceChampionships"];
    this.DivisionTitles = source["DivisionTitles"];
    this.NationalChampionships = source["NationalChampionships"];
    this.TopPlayers = this.convertValues(source["TopPlayers"], TopPlayer);
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class InboxResponse {
  CFBNotifications: Notification[];
  NFLNotifications: Notification[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.CFBNotifications = this.convertValues(
      source["CFBNotifications"],
      Notification
    );
    this.NFLNotifications = this.convertValues(
      source["NFLNotifications"],
      Notification
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

export class CollusionDto {
  WeekID: number;
  SeasonID: number;
  Message: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
    this.Message = source["Message"];
  }
}

export class FaceDataResponse {
  PlayerID: number;
  Accessories: string;
  Body: string;
  Ear: string;
  Eye: string;
  EyeLine: string;
  Eyebrow: string;
  FacialHair: string;
  Glasses: string;
  Hair: string;
  HairBG: string;
  HairFlip: boolean;
  Head: string;
  Jersey: string;
  MiscLine: string;
  Mouth: string;
  MouthFlip: boolean;
  Nose: string;
  NoseFlip: boolean;
  SmileLine: string;
  BodySize: number;
  EarSize: number;
  EyeAngle: number;
  EyeBrowAngle: number;
  FaceSize: number;
  FacialHairShave: string;
  NoseSize: number;
  SmileLineSize: number;
  SkinColor: string;
  HairColor: string;
  teamColors?: string[];

  constructor(source: any = {}) {
      if ('string' === typeof source) source = JSON.parse(source);
      this.PlayerID = source["PlayerID"];
      this.Accessories = source["Accessories"];
      this.Body = source["Body"];
      this.Ear = source["Ear"];
      this.Eye = source["Eye"];
      this.EyeLine = source["EyeLine"];
      this.Eyebrow = source["Eyebrow"];
      this.FacialHair = source["FacialHair"];
      this.Glasses = source["Glasses"];
      this.Hair = source["Hair"];
      this.HairBG = source["HairBG"];
      this.HairFlip = source["HairFlip"];
      this.Head = source["Head"];
      this.Jersey = source["Jersey"];
      this.MiscLine = source["MiscLine"];
      this.Mouth = source["Mouth"];
      this.MouthFlip = source["MouthFlip"];
      this.Nose = source["Nose"];
      this.NoseFlip = source["NoseFlip"];
      this.SmileLine = source["SmileLine"];
      this.BodySize = source["BodySize"];
      this.EarSize = source["EarSize"];
      this.EyeAngle = source["EyeAngle"];
      this.EyeBrowAngle = source["EyeBrowAngle"];
      this.FaceSize = source["FaceSize"];
      this.FacialHairShave = source["FacialHairShave"];
      this.NoseSize = source["NoseSize"];
      this.SmileLineSize = source["SmileLineSize"];
      this.SkinColor = source["SkinColor"];
      this.HairColor = source["HairColor"];
      this.teamColors = source["TeamColors"];
  }
}
export class Timestamp {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  CollegeWeekID: number;
  CollegeWeek: number;
  CollegeSeasonID: number;
  Season: number;
  NFLSeasonID: number;
  NFLWeekID: number;
  NFLWeek: number;
  CFBSpringGames: boolean;
  ThursdayGames: boolean;
  FridayGames: boolean;
  SaturdayMorning: boolean;
  SaturdayNoon: boolean;
  SaturdayEvening: boolean;
  SaturdayNight: boolean;
  CollegePollRan: boolean;
  NFLThursday: boolean;
  NFLSundayNoon: boolean;
  NFLSundayAfternoon: boolean;
  NFLSundayEvening: boolean;
  NFLMondayEvening: boolean;
  NFLTradingAllowed: boolean;
  NFLPreseason: boolean;
  RecruitingEfficiencySynced: boolean;
  RecruitingSynced: boolean;
  GMActionsCompleted: boolean;
  IsOffSeason: boolean;
  IsNFLOffSeason: boolean;
  IsRecruitingLocked: boolean;
  AIDepthchartsSync: boolean;
  AIRecruitingBoardsSynced: boolean;
  IsFreeAgencyLocked: boolean;
  IsDraftTime: boolean;
  RunGames: boolean;
  Y1Capspace: number;
  Y2Capspace: number;
  Y3Capspace: number;
  Y4Capspace: number;
  Y5Capspace: number;
  DeadCapLimit: number;
  FreeAgencyRound: number;
  RunCron: boolean;
  IsTesting: boolean;
  CollegeSeasonOver: boolean;
  NFLSeasonOver: boolean;
  CrootsGenerated: boolean;
  ProgressedCollegePlayers: boolean;
  ProgressedProfessionalPlayers: boolean;
  TransferPortalPhase: number;
  TransferPortalRound: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.CollegeWeekID = source["CollegeWeekID"];
    this.CollegeWeek = source["CollegeWeek"];
    this.CollegeSeasonID = source["CollegeSeasonID"];
    this.Season = source["Season"];
    this.NFLSeasonID = source["NFLSeasonID"];
    this.NFLWeekID = source["NFLWeekID"];
    this.NFLWeek = source["NFLWeek"];
    this.CFBSpringGames = source["CFBSpringGames"];
    this.ThursdayGames = source["ThursdayGames"];
    this.FridayGames = source["FridayGames"];
    this.SaturdayMorning = source["SaturdayMorning"];
    this.SaturdayNoon = source["SaturdayNoon"];
    this.SaturdayEvening = source["SaturdayEvening"];
    this.SaturdayNight = source["SaturdayNight"];
    this.CollegePollRan = source["CollegePollRan"];
    this.NFLThursday = source["NFLThursday"];
    this.NFLSundayNoon = source["NFLSundayNoon"];
    this.NFLSundayAfternoon = source["NFLSundayAfternoon"];
    this.NFLSundayEvening = source["NFLSundayEvening"];
    this.NFLMondayEvening = source["NFLMondayEvening"];
    this.NFLTradingAllowed = source["NFLTradingAllowed"];
    this.NFLPreseason = source["NFLPreseason"];
    this.RecruitingEfficiencySynced = source["RecruitingEfficiencySynced"];
    this.RecruitingSynced = source["RecruitingSynced"];
    this.GMActionsCompleted = source["GMActionsCompleted"];
    this.IsOffSeason = source["IsOffSeason"];
    this.IsNFLOffSeason = source["IsNFLOffSeason"];
    this.IsRecruitingLocked = source["IsRecruitingLocked"];
    this.AIDepthchartsSync = source["AIDepthchartsSync"];
    this.AIRecruitingBoardsSynced = source["AIRecruitingBoardsSynced"];
    this.IsFreeAgencyLocked = source["IsFreeAgencyLocked"];
    this.IsDraftTime = source["IsDraftTime"];
    this.RunGames = source["RunGames"];
    this.Y1Capspace = source["Y1Capspace"];
    this.Y2Capspace = source["Y2Capspace"];
    this.Y3Capspace = source["Y3Capspace"];
    this.Y4Capspace = source["Y4Capspace"];
    this.Y5Capspace = source["Y5Capspace"];
    this.DeadCapLimit = source["DeadCapLimit"];
    this.FreeAgencyRound = source["FreeAgencyRound"];
    this.RunCron = source["RunCron"];
    this.IsTesting = source["IsTesting"];
    this.CollegeSeasonOver = source["CollegeSeasonOver"];
    this.NFLSeasonOver = source["NFLSeasonOver"];
    this.CrootsGenerated = source["CrootsGenerated"];
    this.ProgressedCollegePlayers = source["ProgressedCollegePlayers"];
    this.ProgressedProfessionalPlayers =
      source["ProgressedProfessionalPlayers"];
    this.TransferPortalPhase = source["TransferPortalPhase"];
    this.TransferPortalRound = source["TransferPortalRound"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (Array.isArray(a)) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}

/* Do not change, this code is generated from Golang structs */

export class NBAMatch {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  MatchName: string;
  WeekID: number;
  Week: number;
  SeasonID: number;
  SeriesID: number;
  HomeTeamID: number;
  HomeTeam: string;
  HomeTeamCoach: string;
  HomeTeamWin: boolean;
  HomeTeamRank: number;
  AwayTeamID: number;
  AwayTeam: string;
  AwayTeamCoach: string;
  AwayTeamWin: boolean;
  AwayTeamRank: number;
  MatchOfWeek: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  NextGameID: number;
  NextGameHOA: string;
  TimeSlot: string;
  Arena: string;
  City: string;
  State: string;
  Country: string;
  IsNeutralSite: boolean;
  IsConference: boolean;
  IsDivisional: boolean;
  IsConferenceTournament: boolean;
  IsInternational: boolean;
  IsPlayoffGame: boolean;
  IsTheFinals: boolean;
  IsRivalryGame: boolean;
  GameComplete: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.MatchName = source["MatchName"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.SeriesID = source["SeriesID"];
    this.HomeTeamID = source["HomeTeamID"];
    this.HomeTeam = source["HomeTeam"];
    this.HomeTeamCoach = source["HomeTeamCoach"];
    this.HomeTeamWin = source["HomeTeamWin"];
    this.HomeTeamRank = source["HomeTeamRank"];
    this.AwayTeamID = source["AwayTeamID"];
    this.AwayTeam = source["AwayTeam"];
    this.AwayTeamCoach = source["AwayTeamCoach"];
    this.AwayTeamWin = source["AwayTeamWin"];
    this.AwayTeamRank = source["AwayTeamRank"];
    this.MatchOfWeek = source["MatchOfWeek"];
    this.HomeTeamScore = source["HomeTeamScore"];
    this.AwayTeamScore = source["AwayTeamScore"];
    this.NextGameID = source["NextGameID"];
    this.NextGameHOA = source["NextGameHOA"];
    this.TimeSlot = source["TimeSlot"];
    this.Arena = source["Arena"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.IsNeutralSite = source["IsNeutralSite"];
    this.IsConference = source["IsConference"];
    this.IsDivisional = source["IsDivisional"];
    this.IsConferenceTournament = source["IsConferenceTournament"];
    this.IsInternational = source["IsInternational"];
    this.IsPlayoffGame = source["IsPlayoffGame"];
    this.IsTheFinals = source["IsTheFinals"];
    this.IsRivalryGame = source["IsRivalryGame"];
    this.GameComplete = source["GameComplete"];
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
export class NBAPlayerSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  PreviousTeamID: number;
  GamesPlayed: number;
  NBAPlayerID: number;
  SeasonID: number;
  Year: number;
  Minutes: number;
  MinutesPerGame: number;
  PossessionsPerGame: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  FGMPG: number;
  FGAPG: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  ThreePointsMadePerGame: number;
  ThreePointAttemptsPerGame: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  FTMPG: number;
  FTAPG: number;
  Points: number;
  PPG: number;
  TotalRebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  ReboundsPerGame: number;
  OffReboundsPerGame: number;
  DefReboundsPerGame: number;
  Assists: number;
  AssistsPerGame: number;
  Steals: number;
  StealsPerGame: number;
  Blocks: number;
  BlocksPerGame: number;
  Turnovers: number;
  TurnoversPerGame: number;
  Fouls: number;
  FoulOuts: number;
  FoulsPerGame: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.GamesPlayed = source["GamesPlayed"];
    this.NBAPlayerID = source["NBAPlayerID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.Minutes = source["Minutes"];
    this.MinutesPerGame = source["MinutesPerGame"];
    this.PossessionsPerGame = source["PossessionsPerGame"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.FGMPG = source["FGMPG"];
    this.FGAPG = source["FGAPG"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.ThreePointsMadePerGame = source["ThreePointsMadePerGame"];
    this.ThreePointAttemptsPerGame = source["ThreePointAttemptsPerGame"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.FTMPG = source["FTMPG"];
    this.FTAPG = source["FTAPG"];
    this.Points = source["Points"];
    this.PPG = source["PPG"];
    this.TotalRebounds = source["TotalRebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.ReboundsPerGame = source["ReboundsPerGame"];
    this.OffReboundsPerGame = source["OffReboundsPerGame"];
    this.DefReboundsPerGame = source["DefReboundsPerGame"];
    this.Assists = source["Assists"];
    this.AssistsPerGame = source["AssistsPerGame"];
    this.Steals = source["Steals"];
    this.StealsPerGame = source["StealsPerGame"];
    this.Blocks = source["Blocks"];
    this.BlocksPerGame = source["BlocksPerGame"];
    this.Turnovers = source["Turnovers"];
    this.TurnoversPerGame = source["TurnoversPerGame"];
    this.Fouls = source["Fouls"];
    this.FoulOuts = source["FoulOuts"];
    this.FoulsPerGame = source["FoulsPerGame"];
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
export class NBAPlayerStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  NBAPlayerID: number;
  MatchID: number;
  SeasonID: number;
  WeekID: number;
  Week: number;
  MatchType: string;
  Year: number;
  Minutes: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  Points: number;
  TotalRebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  Turnovers: number;
  Fouls: number;
  FouledOut: boolean;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.NBAPlayerID = source["NBAPlayerID"];
    this.MatchID = source["MatchID"];
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.MatchType = source["MatchType"];
    this.Year = source["Year"];
    this.Minutes = source["Minutes"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.Points = source["Points"];
    this.TotalRebounds = source["TotalRebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.Assists = source["Assists"];
    this.Steals = source["Steals"];
    this.Blocks = source["Blocks"];
    this.Turnovers = source["Turnovers"];
    this.Fouls = source["Fouls"];
    this.FouledOut = source["FouledOut"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
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
export class NBAExtensionOffer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NBAPlayerID: number;
  TeamID: number;
  SeasonID: number;
  Team: string;
  TotalYears: number;
  ContractType: string;
  TotalCost: number;
  Year1Total: number;
  Year2Total: number;
  Year3Total: number;
  Year4Total: number;
  Year5Total: number;
  ContractValue: number;
  Year1Opt: boolean;
  Year2Opt: boolean;
  Year3Opt: boolean;
  Year4Opt: boolean;
  Year5Opt: boolean;
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
    this.NBAPlayerID = source["NBAPlayerID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.TotalYears = source["TotalYears"];
    this.ContractType = source["ContractType"];
    this.TotalCost = source["TotalCost"];
    this.Year1Total = source["Year1Total"];
    this.Year2Total = source["Year2Total"];
    this.Year3Total = source["Year3Total"];
    this.Year4Total = source["Year4Total"];
    this.Year5Total = source["Year5Total"];
    this.ContractValue = source["ContractValue"];
    this.Year1Opt = source["Year1Opt"];
    this.Year2Opt = source["Year2Opt"];
    this.Year3Opt = source["Year3Opt"];
    this.Year4Opt = source["Year4Opt"];
    this.Year5Opt = source["Year5Opt"];
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
export class NBAWaiverOffer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  PlayerID: number;
  TeamID: number;
  SeasonID: number;
  Team: string;
  IsAccepted: boolean;
  IsRejected: boolean;
  IsActive: boolean;
  WaiverOrder: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.IsAccepted = source["IsAccepted"];
    this.IsRejected = source["IsRejected"];
    this.IsActive = source["IsActive"];
    this.WaiverOrder = source["WaiverOrder"];
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
export class NBAContractOffer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  PlayerID: number;
  TeamID: number;
  SeasonID: number;
  Team: string;
  TotalYears: number;
  ContractType: string;
  TotalCost: number;
  Year1Total: number;
  Year2Total: number;
  Year3Total: number;
  Year4Total: number;
  Year5Total: number;
  ContractValue: number;
  Year1Opt: boolean;
  Year2Opt: boolean;
  Year3Opt: boolean;
  Year4Opt: boolean;
  Year5Opt: boolean;
  IsAccepted: boolean;
  IsRejected: boolean;
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.TotalYears = source["TotalYears"];
    this.ContractType = source["ContractType"];
    this.TotalCost = source["TotalCost"];
    this.Year1Total = source["Year1Total"];
    this.Year2Total = source["Year2Total"];
    this.Year3Total = source["Year3Total"];
    this.Year4Total = source["Year4Total"];
    this.Year5Total = source["Year5Total"];
    this.ContractValue = source["ContractValue"];
    this.Year1Opt = source["Year1Opt"];
    this.Year2Opt = source["Year2Opt"];
    this.Year3Opt = source["Year3Opt"];
    this.Year4Opt = source["Year4Opt"];
    this.Year5Opt = source["Year5Opt"];
    this.IsAccepted = source["IsAccepted"];
    this.IsRejected = source["IsRejected"];
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
export class NBAPlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  CollegeID: number;
  College: string;
  DraftPickID: number;
  DraftedRound: number;
  DraftPick: number;
  DraftedTeamID: number;
  DraftedTeamAbbr: string;
  PrimeAge: number;
  IsNBA: boolean;
  MaxRequested: boolean;
  IsSuperMaxQualified: boolean;
  IsFreeAgent: boolean;
  IsGLeague: boolean;
  IsTwoWay: boolean;
  IsWaived: boolean;
  IsOnTradeBlock: boolean;
  IsFirstTeamANBA: boolean;
  IsDPOY: boolean;
  IsMVP: boolean;
  IsInternational: boolean;
  IsIntGenerated: boolean;
  IsRetiring: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  MinimumValue: number;
  SigningRound: number;
  NegotiationRound: number;
  Rejections: number;
  HasProgressed: boolean;
  Offers: NBAContractOffer[];
  WaiverOffers: NBAWaiverOffer[];
  Extensions: NBAExtensionOffer[];
  Contract: NBAContract;
  Stats: NBAPlayerStats[];
  SeasonStats: NBAPlayerSeasonStats;

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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftedRound = source["DraftedRound"];
    this.DraftPick = source["DraftPick"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeamAbbr = source["DraftedTeamAbbr"];
    this.PrimeAge = source["PrimeAge"];
    this.IsNBA = source["IsNBA"];
    this.MaxRequested = source["MaxRequested"];
    this.IsSuperMaxQualified = source["IsSuperMaxQualified"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsGLeague = source["IsGLeague"];
    this.IsTwoWay = source["IsTwoWay"];
    this.IsWaived = source["IsWaived"];
    this.IsOnTradeBlock = source["IsOnTradeBlock"];
    this.IsFirstTeamANBA = source["IsFirstTeamANBA"];
    this.IsDPOY = source["IsDPOY"];
    this.IsMVP = source["IsMVP"];
    this.IsInternational = source["IsInternational"];
    this.IsIntGenerated = source["IsIntGenerated"];
    this.IsRetiring = source["IsRetiring"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.MinimumValue = source["MinimumValue"];
    this.SigningRound = source["SigningRound"];
    this.NegotiationRound = source["NegotiationRound"];
    this.Rejections = source["Rejections"];
    this.HasProgressed = source["HasProgressed"];
    this.Offers = this.convertValues(source["Offers"], NBAContractOffer);
    this.WaiverOffers = this.convertValues(
      source["WaiverOffers"],
      NBAWaiverOffer
    );
    this.Extensions = this.convertValues(
      source["Extensions"],
      NBAExtensionOffer
    );
    this.Contract = this.convertValues(source["Contract"], NBAContract);
    this.Stats = this.convertValues(source["Stats"], NBAPlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NBAPlayerSeasonStats
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
export class FreeAgencyResponse {
  FreeAgents: NBAPlayer[];
  WaiverPlayers: NBAPlayer[];
  GLeaguePlayers: NBAPlayer[];
  ISLPlayers: NBAPlayer[];
  TeamOffers: NBAContractOffer[];
  RosterCount: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FreeAgents = this.convertValues(source["FreeAgents"], NBAPlayer);
    this.WaiverPlayers = this.convertValues(source["WaiverPlayers"], NBAPlayer);
    this.GLeaguePlayers = this.convertValues(
      source["GLeaguePlayers"],
      NBAPlayer
    );
    this.ISLPlayers = this.convertValues(source["ISLPlayers"], NBAPlayer);
    this.TeamOffers = this.convertValues(
      source["TeamOffers"],
      NBAContractOffer
    );
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
export class NBAStandings {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  TeamID: number;
  TeamName: string;
  TeamAbbr: string;
  SeasonID: number;
  Season: number;
  LeagueID: number;
  League: string;
  ConferenceID: number;
  ConferenceName: string;
  DivisionID: number;
  DivisionName: string;
  PostSeasonStatus: string;
  IsConferenceChampion: boolean;
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

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.TeamID = source["TeamID"];
    this.TeamName = source["TeamName"];
    this.TeamAbbr = source["TeamAbbr"];
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.LeagueID = source["LeagueID"];
    this.League = source["League"];
    this.ConferenceID = source["ConferenceID"];
    this.ConferenceName = source["ConferenceName"];
    this.DivisionID = source["DivisionID"];
    this.DivisionName = source["DivisionName"];
    this.PostSeasonStatus = source["PostSeasonStatus"];
    this.IsConferenceChampion = source["IsConferenceChampion"];
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
export class DraftPick {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  SeasonID: number;
  Season: number;
  DraftRound: number;
  DraftNumber: number;
  DrafteeID: number;
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

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.DraftRound = source["DraftRound"];
    this.DraftNumber = source["DraftNumber"];
    this.DrafteeID = source["DrafteeID"];
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
export class NBAContract {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  PlayerID: number;
  TeamID: number;
  Team: string;
  OriginalTeamID: number;
  OriginalTeam: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  YearsRemaining: number;
  ContractType: string;
  TotalRemaining: number;
  Year1Total: number;
  Year2Total: number;
  Year3Total: number;
  Year4Total: number;
  Year5Total: number;
  ContractValue: number;
  Year1Opt: boolean;
  Year2Opt: boolean;
  Year3Opt: boolean;
  Year4Opt: boolean;
  Year5Opt: boolean;
  IsDeadCap: boolean;
  IsActive: boolean;
  IsComplete: boolean;
  IsExtended: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.OriginalTeamID = source["OriginalTeamID"];
    this.OriginalTeam = source["OriginalTeam"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.YearsRemaining = source["YearsRemaining"];
    this.ContractType = source["ContractType"];
    this.TotalRemaining = source["TotalRemaining"];
    this.Year1Total = source["Year1Total"];
    this.Year2Total = source["Year2Total"];
    this.Year3Total = source["Year3Total"];
    this.Year4Total = source["Year4Total"];
    this.Year5Total = source["Year5Total"];
    this.ContractValue = source["ContractValue"];
    this.Year1Opt = source["Year1Opt"];
    this.Year2Opt = source["Year2Opt"];
    this.Year3Opt = source["Year3Opt"];
    this.Year4Opt = source["Year4Opt"];
    this.Year5Opt = source["Year5Opt"];
    this.IsDeadCap = source["IsDeadCap"];
    this.IsActive = source["IsActive"];
    this.IsComplete = source["IsComplete"];
    this.IsExtended = source["IsExtended"];
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
export class NBACapsheet {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  CurrentSeason: number;
  Year1Total: number;
  Year1Cap: number;
  Year1CashTransferred: number;
  Year1CashReceived: number;
  Year2Total: number;
  Year2Cap: number;
  Year2CashTransferred: number;
  Year2CashReceived: number;
  Year3Total: number;
  Year3Cap: number;
  Year3CashTransferred: number;
  Year3CashReceived: number;
  Year4Total: number;
  Year4Cap: number;
  Year4CashTransferred: number;
  Year4CashReceived: number;
  Year5Total: number;
  Year5Cap: number;
  Year5CashTransferred: number;
  Year5CashReceived: number;
  IsOverMax: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.CurrentSeason = source["CurrentSeason"];
    this.Year1Total = source["Year1Total"];
    this.Year1Cap = source["Year1Cap"];
    this.Year1CashTransferred = source["Year1CashTransferred"];
    this.Year1CashReceived = source["Year1CashReceived"];
    this.Year2Total = source["Year2Total"];
    this.Year2Cap = source["Year2Cap"];
    this.Year2CashTransferred = source["Year2CashTransferred"];
    this.Year2CashReceived = source["Year2CashReceived"];
    this.Year3Total = source["Year3Total"];
    this.Year3Cap = source["Year3Cap"];
    this.Year3CashTransferred = source["Year3CashTransferred"];
    this.Year3CashReceived = source["Year3CashReceived"];
    this.Year4Total = source["Year4Total"];
    this.Year4Cap = source["Year4Cap"];
    this.Year4CashTransferred = source["Year4CashTransferred"];
    this.Year4CashReceived = source["Year4CashReceived"];
    this.Year5Total = source["Year5Total"];
    this.Year5Cap = source["Year5Cap"];
    this.Year5CashTransferred = source["Year5CashTransferred"];
    this.Year5CashReceived = source["Year5CashReceived"];
    this.IsOverMax = source["IsOverMax"];
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
export class NBATeamSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  SeasonID: number;
  GamesPlayed: number;
  Points: number;
  PointsAgainst: number;
  PPG: number;
  PAPG: number;
  Possessions: number;
  PossessionsPerGame: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  FGMPG: number;
  FGAPG: number;
  FGMAgainst: number;
  FGAAgainst: number;
  FGPercentAgainst: number;
  FGMAPG: number;
  FGAAPG: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  ThreePointsMadeAgainst: number;
  ThreePointAttemptsAgainst: number;
  ThreePointPercentAgainst: number;
  TPMPG: number;
  TPAPG: number;
  TPMAPG: number;
  TPAAPG: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  FTMPG: number;
  FTAPG: number;
  FTMAgainst: number;
  FTAAgainst: number;
  FTMAPG: number;
  FTAAPG: number;
  FTPercentAgainst: number;
  Rebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  ReboundsPerGame: number;
  OffReboundsPerGame: number;
  DefReboundsPerGame: number;
  ReboundsAllowed: number;
  OffReboundsAllowed: number;
  DefReboundsAllowed: number;
  ReboundsAllowedPerGame: number;
  OffReboundsAllowedPerGame: number;
  DefReboundsAllowedPerGame: number;
  Assists: number;
  AssistsAllowed: number;
  AssistsPerGame: number;
  AssistsAllowedPerGame: number;
  Steals: number;
  StealsAllowed: number;
  StealsPerGame: number;
  StealsAllowedPerGame: number;
  Blocks: number;
  BlocksAllowed: number;
  BlocksPerGame: number;
  BlocksAllowedPerGame: number;
  TotalTurnovers: number;
  TurnoversAllowed: number;
  TurnoversPerGame: number;
  TurnoversAllowedPerGame: number;
  Fouls: number;
  FoulsPerGame: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.GamesPlayed = source["GamesPlayed"];
    this.Points = source["Points"];
    this.PointsAgainst = source["PointsAgainst"];
    this.PPG = source["PPG"];
    this.PAPG = source["PAPG"];
    this.Possessions = source["Possessions"];
    this.PossessionsPerGame = source["PossessionsPerGame"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.FGMPG = source["FGMPG"];
    this.FGAPG = source["FGAPG"];
    this.FGMAgainst = source["FGMAgainst"];
    this.FGAAgainst = source["FGAAgainst"];
    this.FGPercentAgainst = source["FGPercentAgainst"];
    this.FGMAPG = source["FGMAPG"];
    this.FGAAPG = source["FGAAPG"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.ThreePointsMadeAgainst = source["ThreePointsMadeAgainst"];
    this.ThreePointAttemptsAgainst = source["ThreePointAttemptsAgainst"];
    this.ThreePointPercentAgainst = source["ThreePointPercentAgainst"];
    this.TPMPG = source["TPMPG"];
    this.TPAPG = source["TPAPG"];
    this.TPMAPG = source["TPMAPG"];
    this.TPAAPG = source["TPAAPG"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.FTMPG = source["FTMPG"];
    this.FTAPG = source["FTAPG"];
    this.FTMAgainst = source["FTMAgainst"];
    this.FTAAgainst = source["FTAAgainst"];
    this.FTMAPG = source["FTMAPG"];
    this.FTAAPG = source["FTAAPG"];
    this.FTPercentAgainst = source["FTPercentAgainst"];
    this.Rebounds = source["Rebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.ReboundsPerGame = source["ReboundsPerGame"];
    this.OffReboundsPerGame = source["OffReboundsPerGame"];
    this.DefReboundsPerGame = source["DefReboundsPerGame"];
    this.ReboundsAllowed = source["ReboundsAllowed"];
    this.OffReboundsAllowed = source["OffReboundsAllowed"];
    this.DefReboundsAllowed = source["DefReboundsAllowed"];
    this.ReboundsAllowedPerGame = source["ReboundsAllowedPerGame"];
    this.OffReboundsAllowedPerGame = source["OffReboundsAllowedPerGame"];
    this.DefReboundsAllowedPerGame = source["DefReboundsAllowedPerGame"];
    this.Assists = source["Assists"];
    this.AssistsAllowed = source["AssistsAllowed"];
    this.AssistsPerGame = source["AssistsPerGame"];
    this.AssistsAllowedPerGame = source["AssistsAllowedPerGame"];
    this.Steals = source["Steals"];
    this.StealsAllowed = source["StealsAllowed"];
    this.StealsPerGame = source["StealsPerGame"];
    this.StealsAllowedPerGame = source["StealsAllowedPerGame"];
    this.Blocks = source["Blocks"];
    this.BlocksAllowed = source["BlocksAllowed"];
    this.BlocksPerGame = source["BlocksPerGame"];
    this.BlocksAllowedPerGame = source["BlocksAllowedPerGame"];
    this.TotalTurnovers = source["TotalTurnovers"];
    this.TurnoversAllowed = source["TurnoversAllowed"];
    this.TurnoversPerGame = source["TurnoversPerGame"];
    this.TurnoversAllowedPerGame = source["TurnoversAllowedPerGame"];
    this.Fouls = source["Fouls"];
    this.FoulsPerGame = source["FoulsPerGame"];
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
export class NBATeamStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  MatchID: number;
  SeasonID: number;
  WeekID: number;
  Week: number;
  MatchType: string;
  Points: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  Rebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  TotalTurnovers: number;
  LargestLead: number;
  FirstHalfScore: number;
  SecondQuarterScore: number;
  SecondHalfScore: number;
  FourthQuarterScore: number;
  OvertimeScore: number;
  Fouls: number;
  PointsAgainst: number;
  FGMAgainst: number;
  FGAAgainst: number;
  FGPercentAgainst: number;
  ThreePointsMadeAgainst: number;
  ThreePointAttemptsAgainst: number;
  ThreePointPercentAgainst: number;
  FTMAgainst: number;
  FTAAgainst: number;
  FTPercentAgainst: number;
  ReboundsAllowed: number;
  OffReboundsAllowed: number;
  DefReboundsAllowed: number;
  AssistsAllowed: number;
  StealsAllowed: number;
  BlocksAllowed: number;
  TurnoversAllowed: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.MatchID = source["MatchID"];
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.MatchType = source["MatchType"];
    this.Points = source["Points"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.Rebounds = source["Rebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.Assists = source["Assists"];
    this.Steals = source["Steals"];
    this.Blocks = source["Blocks"];
    this.TotalTurnovers = source["TotalTurnovers"];
    this.LargestLead = source["LargestLead"];
    this.FirstHalfScore = source["FirstHalfScore"];
    this.SecondQuarterScore = source["SecondQuarterScore"];
    this.SecondHalfScore = source["SecondHalfScore"];
    this.FourthQuarterScore = source["FourthQuarterScore"];
    this.OvertimeScore = source["OvertimeScore"];
    this.Fouls = source["Fouls"];
    this.PointsAgainst = source["PointsAgainst"];
    this.FGMAgainst = source["FGMAgainst"];
    this.FGAAgainst = source["FGAAgainst"];
    this.FGPercentAgainst = source["FGPercentAgainst"];
    this.ThreePointsMadeAgainst = source["ThreePointsMadeAgainst"];
    this.ThreePointAttemptsAgainst = source["ThreePointAttemptsAgainst"];
    this.ThreePointPercentAgainst = source["ThreePointPercentAgainst"];
    this.FTMAgainst = source["FTMAgainst"];
    this.FTAAgainst = source["FTAAgainst"];
    this.FTPercentAgainst = source["FTPercentAgainst"];
    this.ReboundsAllowed = source["ReboundsAllowed"];
    this.OffReboundsAllowed = source["OffReboundsAllowed"];
    this.DefReboundsAllowed = source["DefReboundsAllowed"];
    this.AssistsAllowed = source["AssistsAllowed"];
    this.StealsAllowed = source["StealsAllowed"];
    this.BlocksAllowed = source["BlocksAllowed"];
    this.TurnoversAllowed = source["TurnoversAllowed"];
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
export class NBAGameplan {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Game: string;
  Pace: string;
  ThreePointProportion: number;
  JumperProportion: number;
  PaintProportion: number;
  FocusPlayer: string;
  OffensiveFormation: string;
  DefensiveFormation: string;
  OffensiveStyle: string;
  Toggle2pt: boolean;
  Toggle3pt: boolean;
  ToggleFT: boolean;
  ToggleFN: boolean;
  ToggleBW: boolean;
  ToggleRB: boolean;
  ToggleID: boolean;
  TogglePD: boolean;
  ToggleP2: boolean;
  ToggleP3: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.Game = source["Game"];
    this.Pace = source["Pace"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.JumperProportion = source["JumperProportion"];
    this.PaintProportion = source["PaintProportion"];
    this.FocusPlayer = source["FocusPlayer"];
    this.OffensiveFormation = source["OffensiveFormation"];
    this.DefensiveFormation = source["DefensiveFormation"];
    this.OffensiveStyle = source["OffensiveStyle"];
    this.Toggle2pt = source["Toggle2pt"];
    this.Toggle3pt = source["Toggle3pt"];
    this.ToggleFT = source["ToggleFT"];
    this.ToggleFN = source["ToggleFN"];
    this.ToggleBW = source["ToggleBW"];
    this.ToggleRB = source["ToggleRB"];
    this.ToggleID = source["ToggleID"];
    this.TogglePD = source["TogglePD"];
    this.ToggleP2 = source["ToggleP2"];
    this.ToggleP3 = source["ToggleP3"];
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
export class NBATeam {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  Team: string;
  Nickname: string;
  Abbr: string;
  City: string;
  State: string;
  Country: string;
  LeagueID: number;
  League: string;
  ConferenceID: number;
  Conference: string;
  DivisionID: number;
  Division: string;
  ArenaID: number;
  Arena: string;
  NBAOwnerID: number;
  NBAOwnerName: string;
  NBACoachID: number;
  NBACoachName: string;
  NBAGMID: number;
  NBAGMName: string;
  NBAAssistantID: number;
  NBAAssistantName: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  IsActive: boolean;
  CanTrade: boolean;
  WaiverOrder: number;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  Gameplan: NBAGameplan;
  TeamStats: NBATeamStats[];
  TeamSeasonStats: NBATeamSeasonStats;
  RecruitingProfile: TeamRecruitingProfile;
  Capsheet: NBACapsheet;
  Contracts: NBAContract[];
  DraftPicks: DraftPick[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.Team = source["Team"];
    this.Nickname = source["Nickname"];
    this.Abbr = source["Abbr"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.LeagueID = source["LeagueID"];
    this.League = source["League"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.DivisionID = source["DivisionID"];
    this.Division = source["Division"];
    this.ArenaID = source["ArenaID"];
    this.Arena = source["Arena"];
    this.NBAOwnerID = source["NBAOwnerID"];
    this.NBAOwnerName = source["NBAOwnerName"];
    this.NBACoachID = source["NBACoachID"];
    this.NBACoachName = source["NBACoachName"];
    this.NBAGMID = source["NBAGMID"];
    this.NBAGMName = source["NBAGMName"];
    this.NBAAssistantID = source["NBAAssistantID"];
    this.NBAAssistantName = source["NBAAssistantName"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.IsActive = source["IsActive"];
    this.CanTrade = source["CanTrade"];
    this.WaiverOrder = source["WaiverOrder"];
    this.ColorOne = source["ColorOne"];
    this.ColorTwo = source["ColorTwo"];
    this.ColorThree = source["ColorThree"];
    this.Gameplan = this.convertValues(source["Gameplan"], NBAGameplan);
    this.TeamStats = this.convertValues(source["TeamStats"], NBATeamStats);
    this.TeamSeasonStats = this.convertValues(
      source["TeamSeasonStats"],
      NBATeamSeasonStats
    );
    this.RecruitingProfile = this.convertValues(
      source["RecruitingProfile"],
      TeamRecruitingProfile
    );
    this.Capsheet = this.convertValues(source["Capsheet"], NBACapsheet);
    this.Contracts = this.convertValues(source["Contracts"], NBAContract);
    this.DraftPicks = this.convertValues(source["DraftPicks"], DraftPick);
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
export class Match {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  MatchName: string;
  WeekID: number;
  Week: number;
  SeasonID: number;
  HomeTeamID: number;
  HomeTeam: string;
  HomeTeamCoach: string;
  HomeTeamWin: boolean;
  HomeTeamRank: number;
  AwayTeamID: number;
  AwayTeam: string;
  AwayTeamCoach: string;
  AwayTeamWin: boolean;
  AwayTeamRank: number;
  MatchOfWeek: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  TimeSlot: string;
  Arena: string;
  City: string;
  State: string;
  NextGameID: number;
  NextGameHOA: string;
  IsNeutralSite: boolean;
  IsNBAMatch: boolean;
  IsConference: boolean;
  IsConferenceTournament: boolean;
  IsNITGame: boolean;
  IsCBIGame: boolean;
  IsPlayoffGame: boolean;
  IsNationalChampionship: boolean;
  IsRivalryGame: boolean;
  IsInvitational: boolean;
  GameComplete: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.MatchName = source["MatchName"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.HomeTeamID = source["HomeTeamID"];
    this.HomeTeam = source["HomeTeam"];
    this.HomeTeamCoach = source["HomeTeamCoach"];
    this.HomeTeamWin = source["HomeTeamWin"];
    this.HomeTeamRank = source["HomeTeamRank"];
    this.AwayTeamID = source["AwayTeamID"];
    this.AwayTeam = source["AwayTeam"];
    this.AwayTeamCoach = source["AwayTeamCoach"];
    this.AwayTeamWin = source["AwayTeamWin"];
    this.AwayTeamRank = source["AwayTeamRank"];
    this.MatchOfWeek = source["MatchOfWeek"];
    this.HomeTeamScore = source["HomeTeamScore"];
    this.AwayTeamScore = source["AwayTeamScore"];
    this.TimeSlot = source["TimeSlot"];
    this.Arena = source["Arena"];
    this.City = source["City"];
    this.State = source["State"];
    this.NextGameID = source["NextGameID"];
    this.NextGameHOA = source["NextGameHOA"];
    this.IsNeutralSite = source["IsNeutralSite"];
    this.IsNBAMatch = source["IsNBAMatch"];
    this.IsConference = source["IsConference"];
    this.IsConferenceTournament = source["IsConferenceTournament"];
    this.IsNITGame = source["IsNITGame"];
    this.IsCBIGame = source["IsCBIGame"];
    this.IsPlayoffGame = source["IsPlayoffGame"];
    this.IsNationalChampionship = source["IsNationalChampionship"];
    this.IsRivalryGame = source["IsRivalryGame"];
    this.IsInvitational = source["IsInvitational"];
    this.GameComplete = source["GameComplete"];
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
  DeletedAt: DeletedAt;
  WeekID: number;
  Week: number;
  SeasonID: number;
  Season: number;
  MessageType: string;
  Message: string;
  League: string;
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.MessageType = source["MessageType"];
    this.Message = source["Message"];
    this.League = source["League"];
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
export class CollegePromise {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
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
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
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
  DeletedAt: DeletedAt;
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
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
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
  TeamID: number;
  PreviousTeamID: number;
  GamesPlayed: number;
  CollegePlayerID: number;
  SeasonID: number;
  Year: number;
  Minutes: number;
  MinutesPerGame: number;
  PossessionsPerGame: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  FGMPG: number;
  FGAPG: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  ThreePointsMadePerGame: number;
  ThreePointAttemptsPerGame: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  FTMPG: number;
  FTAPG: number;
  Points: number;
  PPG: number;
  TotalRebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  ReboundsPerGame: number;
  OffReboundsPerGame: number;
  DefReboundsPerGame: number;
  Assists: number;
  AssistsPerGame: number;
  Steals: number;
  StealsPerGame: number;
  Blocks: number;
  BlocksPerGame: number;
  Turnovers: number;
  TurnoversPerGame: number;
  Fouls: number;
  FoulOuts: number;
  FoulsPerGame: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.GamesPlayed = source["GamesPlayed"];
    this.CollegePlayerID = source["CollegePlayerID"];
    this.SeasonID = source["SeasonID"];
    this.Year = source["Year"];
    this.Minutes = source["Minutes"];
    this.MinutesPerGame = source["MinutesPerGame"];
    this.PossessionsPerGame = source["PossessionsPerGame"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.FGMPG = source["FGMPG"];
    this.FGAPG = source["FGAPG"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.ThreePointsMadePerGame = source["ThreePointsMadePerGame"];
    this.ThreePointAttemptsPerGame = source["ThreePointAttemptsPerGame"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.FTMPG = source["FTMPG"];
    this.FTAPG = source["FTAPG"];
    this.Points = source["Points"];
    this.PPG = source["PPG"];
    this.TotalRebounds = source["TotalRebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.ReboundsPerGame = source["ReboundsPerGame"];
    this.OffReboundsPerGame = source["OffReboundsPerGame"];
    this.DefReboundsPerGame = source["DefReboundsPerGame"];
    this.Assists = source["Assists"];
    this.AssistsPerGame = source["AssistsPerGame"];
    this.Steals = source["Steals"];
    this.StealsPerGame = source["StealsPerGame"];
    this.Blocks = source["Blocks"];
    this.BlocksPerGame = source["BlocksPerGame"];
    this.Turnovers = source["Turnovers"];
    this.TurnoversPerGame = source["TurnoversPerGame"];
    this.Fouls = source["Fouls"];
    this.FoulOuts = source["FoulOuts"];
    this.FoulsPerGame = source["FoulsPerGame"];
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
  TeamID: number;
  CollegePlayerID: number;
  MatchID: number;
  SeasonID: number;
  WeekID: number;
  Week: number;
  MatchType: string;
  Year: number;
  Minutes: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  Points: number;
  TotalRebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  Turnovers: number;
  Fouls: number;
  FouledOut: boolean;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.CollegePlayerID = source["CollegePlayerID"];
    this.MatchID = source["MatchID"];
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.MatchType = source["MatchType"];
    this.Year = source["Year"];
    this.Minutes = source["Minutes"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.Points = source["Points"];
    this.TotalRebounds = source["TotalRebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.Assists = source["Assists"];
    this.Steals = source["Steals"];
    this.Blocks = source["Blocks"];
    this.Turnovers = source["Turnovers"];
    this.Fouls = source["Fouls"];
    this.FouledOut = source["FouledOut"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
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
export class CollegePlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  IsRedshirt: boolean;
  IsRedshirting: boolean;
  HasGraduated: boolean;
  HasProgressed: boolean;
  WillDeclare: boolean;
  TransferStatus: number;
  TransferLikeliness: string;
  LegacyID: number;
  Stats: CollegePlayerStats[];
  SeasonStats: CollegePlayerSeasonStats;
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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.IsRedshirt = source["IsRedshirt"];
    this.IsRedshirting = source["IsRedshirting"];
    this.HasGraduated = source["HasGraduated"];
    this.HasProgressed = source["HasProgressed"];
    this.WillDeclare = source["WillDeclare"];
    this.TransferStatus = source["TransferStatus"];
    this.TransferLikeliness = source["TransferLikeliness"];
    this.LegacyID = source["LegacyID"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
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
export class LeadingTeams {
  TeamName: string;
  TeamAbbr: string;
  TeamID: number;
  Odds: number;
  Scholarship: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamName = source["TeamName"];
    this.TeamAbbr = source["TeamAbbr"];
    this.TeamID = source["TeamID"];
    this.Odds = source["Odds"];
    this.Scholarship = source["Scholarship"];
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
  Height: string;
  Stars: number;
  Shooting2: string;
  Shooting3: string;
  FreeThrow: string;
  Finishing: string;
  Ballwork: string;
  Rebounding: string;
  InteriorDefense: string;
  PerimeterDefense: string;
  PotentialGrade: string;
  Personality: string;
  RecruitingBias: string;
  AcademicBias: string;
  WorkEthic: string;
  State: string;
  Country: string;
  ESPNRank: number;
  RivalsRank: number;
  Rank247: number;
  IsSigned: boolean;
  OverallGrade: string;
  TotalRank: number;
  SigningStatus: string;
  IsCustomCroot: boolean;
  CreatedFor: string;
  RelativeID: number;
  Notes: string;
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
    this.Stars = source["Stars"];
    this.Shooting2 = source["Shooting2"];
    this.Shooting3 = source["Shooting3"];
    this.FreeThrow = source["FreeThrow"];
    this.Finishing = source["Finishing"];
    this.Ballwork = source["Ballwork"];
    this.Rebounding = source["Rebounding"];
    this.InteriorDefense = source["InteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.AcademicBias = source["AcademicBias"];
    this.WorkEthic = source["WorkEthic"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.ESPNRank = source["ESPNRank"];
    this.RivalsRank = source["RivalsRank"];
    this.Rank247 = source["Rank247"];
    this.IsSigned = source["IsSigned"];
    this.OverallGrade = source["OverallGrade"];
    this.TotalRank = source["TotalRank"];
    this.SigningStatus = source["SigningStatus"];
    this.IsCustomCroot = source["IsCustomCroot"];
    this.CreatedFor = source["CreatedFor"];
    this.RelativeID = source["RelativeID"];
    this.Notes = source["Notes"];
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
  TeamAbbr: string;
  SeasonID: number;
  Season: number;
  ConferenceID: number;
  ConferenceName: string;
  PostSeasonStatus: string;
  IsConferenceChampion: boolean;
  InvitationalParticipant: boolean;
  Invitational: string;
  InvitationalChampion: boolean;
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

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.TeamName = source["TeamName"];
    this.TeamAbbr = source["TeamAbbr"];
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.ConferenceID = source["ConferenceID"];
    this.ConferenceName = source["ConferenceName"];
    this.PostSeasonStatus = source["PostSeasonStatus"];
    this.IsConferenceChampion = source["IsConferenceChampion"];
    this.InvitationalParticipant = source["InvitationalParticipant"];
    this.Invitational = source["Invitational"];
    this.InvitationalChampion = source["InvitationalChampion"];
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
  DeletedAt: DeletedAt;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  UninterestedThreshold: number;
  LowInterestThreshold: number;
  MedInterestThreshold: number;
  HighInterestThreshold: number;
  ReadyToSignThreshold: number;
  SigningStatus: string;
  TopRankModifier: number;
  RivalsRank: number;
  ESPNRank: number;
  Rank247: number;
  RecruitModifier: number;
  IsSigned: boolean;
  IsTransfer: boolean;
  IsCustomCroot: boolean;
  CreatedFor: string;
  RecruitProfiles: PlayerRecruitProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.UninterestedThreshold = source["UninterestedThreshold"];
    this.LowInterestThreshold = source["LowInterestThreshold"];
    this.MedInterestThreshold = source["MedInterestThreshold"];
    this.HighInterestThreshold = source["HighInterestThreshold"];
    this.ReadyToSignThreshold = source["ReadyToSignThreshold"];
    this.SigningStatus = source["SigningStatus"];
    this.TopRankModifier = source["TopRankModifier"];
    this.RivalsRank = source["RivalsRank"];
    this.ESPNRank = source["ESPNRank"];
    this.Rank247 = source["Rank247"];
    this.RecruitModifier = source["RecruitModifier"];
    this.IsSigned = source["IsSigned"];
    this.IsTransfer = source["IsTransfer"];
    this.IsCustomCroot = source["IsCustomCroot"];
    this.CreatedFor = source["CreatedFor"];
    this.RecruitProfiles = this.convertValues(
      source["RecruitProfiles"],
      PlayerRecruitProfile
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
export class PlayerRecruitProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  SeasonID: number;
  RecruitID: number;
  ProfileID: number;
  TotalPoints: number;
  AdjustedPoints: number;
  CurrentWeeksPoints: number;
  PreviouslySpentPoints: number;
  SpendingCount: number;
  Scholarship: boolean;
  ScholarshipRevoked: boolean;
  TeamAbbreviation: string;
  InterestLevel: string;
  RecruitModifier: number;
  IsSigned: boolean;
  IsLocked: boolean;
  HasStateBonus: boolean;
  HasRegionBonus: boolean;
  RemovedFromBoard: boolean;
  TeamReachedMax: boolean;
  Recruit: Recruit;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.SeasonID = source["SeasonID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.TotalPoints = source["TotalPoints"];
    this.AdjustedPoints = source["AdjustedPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.PreviouslySpentPoints = source["PreviouslySpentPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.Scholarship = source["Scholarship"];
    this.ScholarshipRevoked = source["ScholarshipRevoked"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.InterestLevel = source["InterestLevel"];
    this.RecruitModifier = source["RecruitModifier"];
    this.IsSigned = source["IsSigned"];
    this.IsLocked = source["IsLocked"];
    this.HasStateBonus = source["HasStateBonus"];
    this.HasRegionBonus = source["HasRegionBonus"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
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
export class TeamRecruitingProfile {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  TeamID: number;
  TeamAbbr: string;
  State: string;
  Region: string;
  ScholarshipsAvailable: number;
  WeeklyPoints: number;
  BonusPoints: number;
  SpentPoints: number;
  TotalCommitments: number;
  RecruitClassSize: number;
  PortalReputation: number;
  IsAI: boolean;
  AIBehavior: string;
  AIQuality: string;
  AIValue: string;
  AIPrestige: string;
  AIAttribute1: string;
  AIAttribute2: string;
  ESPNScore: number;
  RivalsScore: number;
  Rank247Score: number;
  CompositeScore: number;
  FiveStars: number;
  FourStars: number;
  ThreeStars: number;
  AIMinThreshold: number;
  AIMaxThreshold: number;
  AIStarMin: number;
  AIStarMax: number;
  AIAutoOfferscholarships: boolean;
  OffensiveScheme: string;
  DefensiveScheme: string;
  Recruiter: string;
  CaughtCheating: boolean;
  Recruits: PlayerRecruitProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.State = source["State"];
    this.Region = source["Region"];
    this.ScholarshipsAvailable = source["ScholarshipsAvailable"];
    this.WeeklyPoints = source["WeeklyPoints"];
    this.BonusPoints = source["BonusPoints"];
    this.SpentPoints = source["SpentPoints"];
    this.TotalCommitments = source["TotalCommitments"];
    this.RecruitClassSize = source["RecruitClassSize"];
    this.PortalReputation = source["PortalReputation"];
    this.IsAI = source["IsAI"];
    this.AIBehavior = source["AIBehavior"];
    this.AIQuality = source["AIQuality"];
    this.AIValue = source["AIValue"];
    this.AIPrestige = source["AIPrestige"];
    this.AIAttribute1 = source["AIAttribute1"];
    this.AIAttribute2 = source["AIAttribute2"];
    this.ESPNScore = source["ESPNScore"];
    this.RivalsScore = source["RivalsScore"];
    this.Rank247Score = source["Rank247Score"];
    this.CompositeScore = source["CompositeScore"];
    this.FiveStars = source["FiveStars"];
    this.FourStars = source["FourStars"];
    this.ThreeStars = source["ThreeStars"];
    this.AIMinThreshold = source["AIMinThreshold"];
    this.AIMaxThreshold = source["AIMaxThreshold"];
    this.AIStarMin = source["AIStarMin"];
    this.AIStarMax = source["AIStarMax"];
    this.AIAutoOfferscholarships = source["AIAutoOfferscholarships"];
    this.OffensiveScheme = source["OffensiveScheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.Recruiter = source["Recruiter"];
    this.CaughtCheating = source["CaughtCheating"];
    this.Recruits = this.convertValues(
      source["Recruits"],
      PlayerRecruitProfile
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
export class TeamSeasonStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  SeasonID: number;
  GamesPlayed: number;
  Points: number;
  PointsAgainst: number;
  PPG: number;
  PAPG: number;
  Possessions: number;
  PossessionsPerGame: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  FGMPG: number;
  FGAPG: number;
  FGMAgainst: number;
  FGAAgainst: number;
  FGPercentAgainst: number;
  FGMAPG: number;
  FGAAPG: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  ThreePointsMadeAgainst: number;
  ThreePointAttemptsAgainst: number;
  ThreePointPercentAgainst: number;
  TPMPG: number;
  TPAPG: number;
  TPMAPG: number;
  TPAAPG: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  FTMPG: number;
  FTAPG: number;
  FTMAgainst: number;
  FTAAgainst: number;
  FTMAPG: number;
  FTAAPG: number;
  FTPercentAgainst: number;
  Rebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  ReboundsPerGame: number;
  OffReboundsPerGame: number;
  DefReboundsPerGame: number;
  ReboundsAllowed: number;
  OffReboundsAllowed: number;
  DefReboundsAllowed: number;
  ReboundsAllowedPerGame: number;
  OffReboundsAllowedPerGame: number;
  DefReboundsAllowedPerGame: number;
  Assists: number;
  AssistsAllowed: number;
  AssistsPerGame: number;
  AssistsAllowedPerGame: number;
  Steals: number;
  StealsAllowed: number;
  StealsPerGame: number;
  StealsAllowedPerGame: number;
  Blocks: number;
  BlocksAllowed: number;
  BlocksPerGame: number;
  BlocksAllowedPerGame: number;
  TotalTurnovers: number;
  TurnoversAllowed: number;
  TurnoversPerGame: number;
  TurnoversAllowedPerGame: number;
  Fouls: number;
  FoulsPerGame: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.GamesPlayed = source["GamesPlayed"];
    this.Points = source["Points"];
    this.PointsAgainst = source["PointsAgainst"];
    this.PPG = source["PPG"];
    this.PAPG = source["PAPG"];
    this.Possessions = source["Possessions"];
    this.PossessionsPerGame = source["PossessionsPerGame"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.FGMPG = source["FGMPG"];
    this.FGAPG = source["FGAPG"];
    this.FGMAgainst = source["FGMAgainst"];
    this.FGAAgainst = source["FGAAgainst"];
    this.FGPercentAgainst = source["FGPercentAgainst"];
    this.FGMAPG = source["FGMAPG"];
    this.FGAAPG = source["FGAAPG"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.ThreePointsMadeAgainst = source["ThreePointsMadeAgainst"];
    this.ThreePointAttemptsAgainst = source["ThreePointAttemptsAgainst"];
    this.ThreePointPercentAgainst = source["ThreePointPercentAgainst"];
    this.TPMPG = source["TPMPG"];
    this.TPAPG = source["TPAPG"];
    this.TPMAPG = source["TPMAPG"];
    this.TPAAPG = source["TPAAPG"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.FTMPG = source["FTMPG"];
    this.FTAPG = source["FTAPG"];
    this.FTMAgainst = source["FTMAgainst"];
    this.FTAAgainst = source["FTAAgainst"];
    this.FTMAPG = source["FTMAPG"];
    this.FTAAPG = source["FTAAPG"];
    this.FTPercentAgainst = source["FTPercentAgainst"];
    this.Rebounds = source["Rebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.ReboundsPerGame = source["ReboundsPerGame"];
    this.OffReboundsPerGame = source["OffReboundsPerGame"];
    this.DefReboundsPerGame = source["DefReboundsPerGame"];
    this.ReboundsAllowed = source["ReboundsAllowed"];
    this.OffReboundsAllowed = source["OffReboundsAllowed"];
    this.DefReboundsAllowed = source["DefReboundsAllowed"];
    this.ReboundsAllowedPerGame = source["ReboundsAllowedPerGame"];
    this.OffReboundsAllowedPerGame = source["OffReboundsAllowedPerGame"];
    this.DefReboundsAllowedPerGame = source["DefReboundsAllowedPerGame"];
    this.Assists = source["Assists"];
    this.AssistsAllowed = source["AssistsAllowed"];
    this.AssistsPerGame = source["AssistsPerGame"];
    this.AssistsAllowedPerGame = source["AssistsAllowedPerGame"];
    this.Steals = source["Steals"];
    this.StealsAllowed = source["StealsAllowed"];
    this.StealsPerGame = source["StealsPerGame"];
    this.StealsAllowedPerGame = source["StealsAllowedPerGame"];
    this.Blocks = source["Blocks"];
    this.BlocksAllowed = source["BlocksAllowed"];
    this.BlocksPerGame = source["BlocksPerGame"];
    this.BlocksAllowedPerGame = source["BlocksAllowedPerGame"];
    this.TotalTurnovers = source["TotalTurnovers"];
    this.TurnoversAllowed = source["TurnoversAllowed"];
    this.TurnoversPerGame = source["TurnoversPerGame"];
    this.TurnoversAllowedPerGame = source["TurnoversAllowedPerGame"];
    this.Fouls = source["Fouls"];
    this.FoulsPerGame = source["FoulsPerGame"];
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
export class TeamStats {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  MatchID: number;
  SeasonID: number;
  WeekID: number;
  Week: number;
  MatchType: string;
  Points: number;
  Possessions: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  Rebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  TotalTurnovers: number;
  LargestLead: number;
  FirstHalfScore: number;
  SecondHalfScore: number;
  OvertimeScore: number;
  Fouls: number;
  PointsAgainst: number;
  FGMAgainst: number;
  FGAAgainst: number;
  FGPercentAgainst: number;
  ThreePointsMadeAgainst: number;
  ThreePointAttemptsAgainst: number;
  ThreePointPercentAgainst: number;
  FTMAgainst: number;
  FTAAgainst: number;
  FTPercentAgainst: number;
  ReboundsAllowed: number;
  OffReboundsAllowed: number;
  DefReboundsAllowed: number;
  AssistsAllowed: number;
  StealsAllowed: number;
  BlocksAllowed: number;
  TurnoversAllowed: number;
  RevealResults: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.MatchID = source["MatchID"];
    this.SeasonID = source["SeasonID"];
    this.WeekID = source["WeekID"];
    this.Week = source["Week"];
    this.MatchType = source["MatchType"];
    this.Points = source["Points"];
    this.Possessions = source["Possessions"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.Rebounds = source["Rebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.Assists = source["Assists"];
    this.Steals = source["Steals"];
    this.Blocks = source["Blocks"];
    this.TotalTurnovers = source["TotalTurnovers"];
    this.LargestLead = source["LargestLead"];
    this.FirstHalfScore = source["FirstHalfScore"];
    this.SecondHalfScore = source["SecondHalfScore"];
    this.OvertimeScore = source["OvertimeScore"];
    this.Fouls = source["Fouls"];
    this.PointsAgainst = source["PointsAgainst"];
    this.FGMAgainst = source["FGMAgainst"];
    this.FGAAgainst = source["FGAAgainst"];
    this.FGPercentAgainst = source["FGPercentAgainst"];
    this.ThreePointsMadeAgainst = source["ThreePointsMadeAgainst"];
    this.ThreePointAttemptsAgainst = source["ThreePointAttemptsAgainst"];
    this.ThreePointPercentAgainst = source["ThreePointPercentAgainst"];
    this.FTMAgainst = source["FTMAgainst"];
    this.FTAAgainst = source["FTAAgainst"];
    this.FTPercentAgainst = source["FTPercentAgainst"];
    this.ReboundsAllowed = source["ReboundsAllowed"];
    this.OffReboundsAllowed = source["OffReboundsAllowed"];
    this.DefReboundsAllowed = source["DefReboundsAllowed"];
    this.AssistsAllowed = source["AssistsAllowed"];
    this.StealsAllowed = source["StealsAllowed"];
    this.BlocksAllowed = source["BlocksAllowed"];
    this.TurnoversAllowed = source["TurnoversAllowed"];
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
export class Gameplan {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Game: string;
  Pace: string;
  ThreePointProportion: number;
  JumperProportion: number;
  PaintProportion: number;
  FocusPlayer: string;
  OffensiveFormation: string;
  DefensiveFormation: string;
  OffensiveStyle: string;
  Toggle2pt: boolean;
  Toggle3pt: boolean;
  ToggleFT: boolean;
  ToggleFN: boolean;
  ToggleBW: boolean;
  ToggleRB: boolean;
  ToggleID: boolean;
  TogglePD: boolean;
  ToggleP2: boolean;
  ToggleP3: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TeamID = source["TeamID"];
    this.Game = source["Game"];
    this.Pace = source["Pace"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.JumperProportion = source["JumperProportion"];
    this.PaintProportion = source["PaintProportion"];
    this.FocusPlayer = source["FocusPlayer"];
    this.OffensiveFormation = source["OffensiveFormation"];
    this.DefensiveFormation = source["DefensiveFormation"];
    this.OffensiveStyle = source["OffensiveStyle"];
    this.Toggle2pt = source["Toggle2pt"];
    this.Toggle3pt = source["Toggle3pt"];
    this.ToggleFT = source["ToggleFT"];
    this.ToggleFN = source["ToggleFN"];
    this.ToggleBW = source["ToggleBW"];
    this.ToggleRB = source["ToggleRB"];
    this.ToggleID = source["ToggleID"];
    this.TogglePD = source["TogglePD"];
    this.ToggleP2 = source["ToggleP2"];
    this.ToggleP3 = source["ToggleP3"];
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
export class Time {
  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
  }
}
export class Team {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  Team: string;
  Nickname: string;
  Abbr: string;
  City: string;
  State: string;
  Country: string;
  ConferenceID: number;
  Conference: string;
  Arena: string;
  FirstSeason: string;
  Coach: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  IsNBA: boolean;
  IsActive: boolean;
  IsUserCoached: boolean;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  Gameplan: Gameplan[];
  TeamStats: TeamStats[];
  TeamSeasonStats: TeamSeasonStats;
  RecruitingProfile: TeamRecruitingProfile;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.Team = source["Team"];
    this.Nickname = source["Nickname"];
    this.Abbr = source["Abbr"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.Arena = source["Arena"];
    this.FirstSeason = source["FirstSeason"];
    this.Coach = source["Coach"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.IsNBA = source["IsNBA"];
    this.IsActive = source["IsActive"];
    this.IsUserCoached = source["IsUserCoached"];
    this.ColorOne = source["ColorOne"];
    this.ColorTwo = source["ColorTwo"];
    this.ColorThree = source["ColorThree"];
    this.Gameplan = this.convertValues(source["Gameplan"], Gameplan);
    this.TeamStats = this.convertValues(source["TeamStats"], TeamStats);
    this.TeamSeasonStats = this.convertValues(
      source["TeamSeasonStats"],
      TeamSeasonStats
    );
    this.RecruitingProfile = this.convertValues(
      source["RecruitingProfile"],
      TeamRecruitingProfile
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
  AllCollegeTeams: Team[];
  CollegeTeam: Team;
  CollegeRosterMap: { [key: number]: CollegePlayer[] };
  PortalPlayers: TransferPlayerResponse[];
  CollegeInjuryReport: CollegePlayer[];
  CollegeNotifications: Notification[];
  CollegeGameplan: Gameplan[];
  TopCBBPoints: CollegePlayer[];
  TopCBBAssists: CollegePlayer[];
  TopCBBRebounds: CollegePlayer[];
  NBATeam: NBATeam;
  AllProTeams: NBATeam[];
  ProNotifications: Notification[];
  NBAGameplan: NBAGameplan[];
  CollegeNews: NewsLog[];
  TeamProfileMap: { [key: string]: TeamRecruitingProfile };
  CollegeStandings: CollegeStandings[];
  ProStandings: NBAStandings[];
  CapsheetMap: { [key: number]: NBACapsheet };
  ProRosterMap: { [key: number]: NBAPlayer[] };
  TopNBAPoints: NBAPlayer[];
  TopNBAAssists: NBAPlayer[];
  TopNBARebounds: NBAPlayer[];
  ProInjuryReport: NBAPlayer[];
  Recruits: Croot[];
  FreeAgency: FreeAgencyResponse;
  ProNews: NewsLog[];
  AllCollegeGames: Match[];
  AllProGames: NBAMatch[];
  FaceData: {[key: number]: FaceDataResponse};
  ContractMap: {[key: number]: NBAContract};
  ExtensionMap: {[key: number]: NBAExtensionOffer};

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.AllCollegeTeams = this.convertValues(source["AllCollegeTeams"], Team);
    this.CollegeTeam = this.convertValues(source["CollegeTeam"], Team);
    this.CollegeRosterMap = source["CollegeRosterMap"];
    this.PortalPlayers = this.convertValues(
      source["PortalPlayers"],
      TransferPlayerResponse
    );
    this.CollegeInjuryReport = this.convertValues(
      source["CollegeInjuryReport"],
      CollegePlayer
    );
    this.CollegeNotifications = this.convertValues(
      source["CollegeNotifications"],
      Notification
    );
    this.CollegeGameplan = this.convertValues(
      source["CollegeGameplan"],
      Gameplan
    );
    this.TopCBBPoints = this.convertValues(
      source["TopCBBPoints"],
      CollegePlayer
    );
    this.TopCBBAssists = this.convertValues(
      source["TopCBBAssists"],
      CollegePlayer
    );
    this.TopCBBRebounds = this.convertValues(
      source["TopCBBRebounds"],
      CollegePlayer
    );
    this.NBATeam = this.convertValues(source["NBATeam"], NBATeam);
    this.AllProTeams = this.convertValues(source["AllProTeams"], NBATeam);
    this.ProNotifications = this.convertValues(
      source["ProNotifications"],
      Notification
    );
    this.NBAGameplan = this.convertValues(source["NBAGameplan"], NBAGameplan);
    this.CollegeNews = this.convertValues(source["CollegeNews"], NewsLog);
    this.TeamProfileMap = source["TeamProfileMap"];
    this.CollegeStandings = this.convertValues(
      source["CollegeStandings"],
      CollegeStandings
    );
    this.ProStandings = this.convertValues(
      source["ProStandings"],
      NBAStandings
    );
    this.CapsheetMap = this.convertValues(
      source["CapsheetMap"],
      NBACapsheet,
      true
    );
    this.ProRosterMap = source["ProRosterMap"];
    this.TopNBAPoints = this.convertValues(source["TopNBAPoints"], NBAPlayer);
    this.TopNBAAssists = this.convertValues(source["TopNBAAssists"], NBAPlayer);
    this.TopNBARebounds = this.convertValues(
      source["TopNBARebounds"],
      NBAPlayer
    );
    this.ProInjuryReport = this.convertValues(
      source["ProInjuryReport"],
      NBAPlayer
    );
    this.Recruits = this.convertValues(source["Recruits"], Croot);
    this.FreeAgency = this.convertValues(
      source["FreeAgency"],
      FreeAgencyResponse
    );
    this.ProNews = this.convertValues(source["ProNews"], NewsLog);
    this.AllCollegeGames = this.convertValues(source["AllCollegeGames"], Match);
    this.AllProGames = this.convertValues(source["AllProGames"], NBAMatch);
    this.FaceData = this.convertValues(source["FaceData"], FaceDataResponse, true);
    this.ContractMap = this.convertValues(source["ContractMap"], NBAContract, true);
    this.ExtensionMap = this.convertValues(source["ExtensionMap"], NBAExtensionOffer, true);
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
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
  }
}

export class Arena {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  ArenaName: string;
  City: string;
  State: string;
  Country: string;
  Capacity: number;
  HomeTeam: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.ArenaName = source["ArenaName"];
    this.City = source["City"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Capacity = source["Capacity"];
    this.HomeTeam = source["HomeTeam"];
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
  ProfileId: number;
  PlayerId: number;
  SeasonId: number;
  HasStateBonus: boolean;
  HasRegionBonus: boolean;
  Team: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ProfileId = source["ProfileId"];
    this.PlayerId = source["PlayerId"];
    this.SeasonId = source["SeasonId"];
    this.HasStateBonus = source["HasStateBonus"];
    this.HasRegionBonus = source["HasRegionBonus"];
    this.Team = source["Team"];
  }
}
export class UpdateRecruitPointsDto {
  RecruitPointsId: number;
  ProfileId: number;
  PlayerId: number;
  SpentPoints: number;
  Team: string;
  RewardScholarship: boolean;
  RevokeScholarship: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.RecruitPointsId = source["RecruitPointsId"];
    this.ProfileId = source["ProfileId"];
    this.PlayerId = source["PlayerId"];
    this.SpentPoints = source["SpentPoints"];
    this.Team = source["Team"];
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
  AdjustedPoints: number;
  CurrentWeeksPoints: number;
  SpendingCount: number;
  Scholarship: boolean;
  ScholarshipRevoked: boolean;
  TeamAbbreviation: string;
  RemovedFromBoard: boolean;
  IsSigned: boolean;
  IsLocked: boolean;
  CaughtCheating: boolean;
  SigningStatus: string;
  Recruit: Croot;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.SeasonID = source["SeasonID"];
    this.RecruitID = source["RecruitID"];
    this.ProfileID = source["ProfileID"];
    this.TotalPoints = source["TotalPoints"];
    this.AdjustedPoints = source["AdjustedPoints"];
    this.CurrentWeeksPoints = source["CurrentWeeksPoints"];
    this.SpendingCount = source["SpendingCount"];
    this.Scholarship = source["Scholarship"];
    this.ScholarshipRevoked = source["ScholarshipRevoked"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.IsSigned = source["IsSigned"];
    this.IsLocked = source["IsLocked"];
    this.CaughtCheating = source["CaughtCheating"];
    this.SigningStatus = source["SigningStatus"];
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
  Region: string;
  ScholarshipsAvailable: number;
  WeeklyPoints: number;
  SpentPoints: number;
  BonusPoints: number;
  TotalCommitments: number;
  RecruitClassSize: number;
  ESPNScore: number;
  RivalsScore: number;
  Rank247Score: number;
  CompositeScore: number;
  RecruitingClassRank: number;
  Recruits: CrootProfile[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.TeamAbbreviation = source["TeamAbbreviation"];
    this.State = source["State"];
    this.Region = source["Region"];
    this.ScholarshipsAvailable = source["ScholarshipsAvailable"];
    this.WeeklyPoints = source["WeeklyPoints"];
    this.SpentPoints = source["SpentPoints"];
    this.BonusPoints = source["BonusPoints"];
    this.TotalCommitments = source["TotalCommitments"];
    this.RecruitClassSize = source["RecruitClassSize"];
    this.ESPNScore = source["ESPNScore"];
    this.RivalsScore = source["RivalsScore"];
    this.Rank247Score = source["Rank247Score"];
    this.CompositeScore = source["CompositeScore"];
    this.RecruitingClassRank = source["RecruitingClassRank"];
    this.Recruits = this.convertValues(source["Recruits"], CrootProfile);
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
export class UpdateRecruitingBoardDto {
  Profile: SimTeamBoardResponse;
  Recruits: CrootProfile[];
  TeamID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Profile = this.convertValues(source["Profile"], SimTeamBoardResponse);
    this.Recruits = this.convertValues(source["Recruits"], CrootProfile);
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
  BonusAffectedPoints: number;
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
    this.BonusAffectedPoints = source["BonusAffectedPoints"];
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
export class CollegePlayerResponse {
  FirstName: string;
  LastName: string;
  Archetype: string;
  Position: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  PotentialGrade: string;
  Shooting2Grade: string;
  Shooting3Grade: string;
  FreeThrowGrade: string;
  FinishingGrade: string;
  BallworkGrade: string;
  ReboundingGrade: string;
  InteriorDefenseGrade: string;
  PerimeterDefenseGrade: string;
  Stamina: number;
  PlaytimeExpectations: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  Minutes: number;
  Potential: number;
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
  DisciplineGrade: string;
  InjuryGrade: string;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  SeasonStats: CollegePlayerSeasonStats;
  Stats: CollegePlayerStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Archetype = source["Archetype"];
    this.Position = source["Position"];
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Shooting2Grade = source["Shooting2Grade"];
    this.Shooting3Grade = source["Shooting3Grade"];
    this.FreeThrowGrade = source["FreeThrowGrade"];
    this.FinishingGrade = source["FinishingGrade"];
    this.BallworkGrade = source["BallworkGrade"];
    this.ReboundingGrade = source["ReboundingGrade"];
    this.InteriorDefenseGrade = source["InteriorDefenseGrade"];
    this.PerimeterDefenseGrade = source["PerimeterDefenseGrade"];
    this.Stamina = source["Stamina"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.Minutes = source["Minutes"];
    this.Potential = source["Potential"];
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
    this.DisciplineGrade = source["DisciplineGrade"];
    this.InjuryGrade = source["InjuryGrade"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
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
export class CBBRosterResponse {
  Players: CollegePlayerResponse[];
  Promises: CollegePromise[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Players = this.convertValues(source["Players"], CollegePlayerResponse);
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
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  PotentialGrade: string;
  Overall: string;
  Shooting2: string;
  Shooting3: string;
  FreeThrow: string;
  Finishing: string;
  Ballwork: string;
  Rebounding: string;
  InteriorDefense: string;
  PerimeterDefense: string;
  Stamina: number;
  PlaytimeExpectations: number;
  Minutes: number;
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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Overall = source["Overall"];
    this.Shooting2 = source["Shooting2"];
    this.Shooting3 = source["Shooting3"];
    this.FreeThrow = source["FreeThrow"];
    this.Finishing = source["Finishing"];
    this.Ballwork = source["Ballwork"];
    this.Rebounding = source["Rebounding"];
    this.InteriorDefense = source["InteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.Stamina = source["Stamina"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
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
  Team: TeamRecruitingProfile;
  TeamBoard: TransferPortalProfileResponse[];
  TeamPromises: CollegePromise[];
  Players: TransferPlayerResponse[];
  TeamList: Team[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Team = this.convertValues(source["Team"], TeamRecruitingProfile);
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
    this.TeamList = this.convertValues(source["TeamList"], Team);
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

export class NBAContractOfferDTO {
  ID: number;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  OriginalTeamID: number;
  OriginalTeam: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  SeasonID: number;
  Team: string;
  TotalYears: number;
  ContractType: string;
  TotalCost: number;
  Year1Total: number;
  Year2Total: number;
  Year3Total: number;
  Year4Total: number;
  Year5Total: number;
  ContractValue: number;
  Year1Opt: boolean;
  Year2Opt: boolean;
  Year3Opt: boolean;
  Year4Opt: boolean;
  Year5Opt: boolean;
  IsAccepted: boolean;
  IsRejected: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.OriginalTeamID = source["OriginalTeamID"];
    this.OriginalTeam = source["OriginalTeam"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.TotalYears = source["TotalYears"];
    this.ContractType = source["ContractType"];
    this.TotalCost = source["TotalCost"];
    this.Year1Total = source["Year1Total"];
    this.Year2Total = source["Year2Total"];
    this.Year3Total = source["Year3Total"];
    this.Year4Total = source["Year4Total"];
    this.Year5Total = source["Year5Total"];
    this.ContractValue = source["ContractValue"];
    this.Year1Opt = source["Year1Opt"];
    this.Year2Opt = source["Year2Opt"];
    this.Year3Opt = source["Year3Opt"];
    this.Year4Opt = source["Year4Opt"];
    this.Year5Opt = source["Year5Opt"];
    this.IsAccepted = source["IsAccepted"];
    this.IsRejected = source["IsRejected"];
  }
}

export class NBAWaiverOfferDTO {
  ID: number;
  PlayerID: number;
  TeamID: number;
  SeasonID: number;
  Team: string;
  IsAccepted: boolean;
  IsRejected: boolean;
  WaiverOrder: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.Team = source["Team"];
    this.IsAccepted = source["IsAccepted"];
    this.IsRejected = source["IsRejected"];
    this.WaiverOrder = source["WaiverOrder"];
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
  Matches: Match[];
  Standings: CollegeStandings[];
  OfficialPolls: CollegePollOfficial[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Poll = this.convertValues(source["Poll"], CollegePollSubmission);
    this.Matches = this.convertValues(source["Matches"], Match);
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

export class NBADraftee {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  CollegeID: number;
  College: string;
  DraftPickID: number;
  DraftPick: string;
  DraftedTeamID: number;
  DraftedTeamAbbr: string;
  PrimeAge: number;
  StandingReach: string;
  VerticalLeap: number;
  LaneAgility: number;
  MaxVerticalLeap: number;
  ThreeQuarterSprint: number;
  ShuttleRun: number;
  WingSpan: string;
  Shooting2Grade: string;
  Shooting3Grade: string;
  FreeThrowGrade: string;
  FinishingGrade: string;
  BallworkGrade: string;
  ReboundingGrade: string;
  InteriorDefenseGrade: string;
  PerimeterDefenseGrade: string;
  OverallGrade: string;
  Prediction: number;
  IsInternational: boolean;

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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftPick = source["DraftPick"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeamAbbr = source["DraftedTeamAbbr"];
    this.PrimeAge = source["PrimeAge"];
    this.StandingReach = source["StandingReach"];
    this.VerticalLeap = source["VerticalLeap"];
    this.LaneAgility = source["LaneAgility"];
    this.MaxVerticalLeap = source["MaxVerticalLeap"];
    this.ThreeQuarterSprint = source["ThreeQuarterSprint"];
    this.ShuttleRun = source["ShuttleRun"];
    this.WingSpan = source["WingSpan"];
    this.Shooting2Grade = source["Shooting2Grade"];
    this.Shooting3Grade = source["Shooting3Grade"];
    this.FreeThrowGrade = source["FreeThrowGrade"];
    this.FinishingGrade = source["FinishingGrade"];
    this.BallworkGrade = source["BallworkGrade"];
    this.ReboundingGrade = source["ReboundingGrade"];
    this.InteriorDefenseGrade = source["InteriorDefenseGrade"];
    this.PerimeterDefenseGrade = source["PerimeterDefenseGrade"];
    this.OverallGrade = source["OverallGrade"];
    this.Prediction = source["Prediction"];
    this.IsInternational = source["IsInternational"];
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
  ShowShooting2: boolean;
  ShowShooting3: boolean;
  ShowFreeThrow: boolean;
  ShowFinishing: boolean;
  ShowBallwork: boolean;
  ShowRebounding: boolean;
  ShowInteriorDefense: boolean;
  ShowPerimeterDefense: boolean;
  ShowPotential: boolean;
  RemovedFromBoard: boolean;
  ShowCount: number;
  Draftee: NBADraftee;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.ShowShooting2 = source["ShowShooting2"];
    this.ShowShooting3 = source["ShowShooting3"];
    this.ShowFreeThrow = source["ShowFreeThrow"];
    this.ShowFinishing = source["ShowFinishing"];
    this.ShowBallwork = source["ShowBallwork"];
    this.ShowRebounding = source["ShowRebounding"];
    this.ShowInteriorDefense = source["ShowInteriorDefense"];
    this.ShowPerimeterDefense = source["ShowPerimeterDefense"];
    this.ShowPotential = source["ShowPotential"];
    this.RemovedFromBoard = source["RemovedFromBoard"];
    this.ShowCount = source["ShowCount"];
    this.Draftee = this.convertValues(source["Draftee"], NBADraftee);
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
export class NBAWarRoom {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TeamID: number;
  Team: string;
  ScoutingPoints: number;
  SpentPoints: number;
  DraftPicks: DraftPick[];
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
    this.DraftPicks = this.convertValues(source["DraftPicks"], DraftPick);
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
export class NBADraftPageResponse {
  WarRoom: NBAWarRoom;
  DraftablePlayers: NBADraftee[];
  NBATeams: NBATeam[];
  AllDraftPicks: DraftPick[][];
  CollegeTeams: Team[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.WarRoom = this.convertValues(source["WarRoom"], NBAWarRoom);
    this.DraftablePlayers = this.convertValues(
      source["DraftablePlayers"],
      NBADraftee
    );
    this.NBATeams = this.convertValues(source["NBATeams"], NBATeam);
    this.AllDraftPicks = this.convertValues(source["AllDraftPicks"], DraftPick);
    this.CollegeTeams = this.convertValues(source["CollegeTeams"], Team);
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
  DraftPicks: DraftPick[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.DraftPicks = this.convertValues(source["DraftPicks"], DraftPick);
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

export class NBAPlayerResponse {
  FirstName: string;
  LastName: string;
  Position: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  PotentialGrade: string;
  Shooting2Grade: string;
  Shooting3Grade: string;
  FreeThrowGrade: string;
  FinishingGrade: string;
  BallworkGrade: string;
  ReboundingGrade: string;
  InteriorDefenseGrade: string;
  PerimeterDefenseGrade: string;
  Stamina: number;
  PlaytimeExpectations: number;
  Minutes: number;
  Potential: number;
  OverallGrade: string;
  Personality: string;
  RecruitingBias: string;
  WorkEthic: string;
  AcademicBias: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  IsRedshirting: boolean;
  IsRedshirt: boolean;
  SeasonStats: NBAPlayerSeasonStats;
  Stats: NBAPlayerStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.PotentialGrade = source["PotentialGrade"];
    this.Shooting2Grade = source["Shooting2Grade"];
    this.Shooting3Grade = source["Shooting3Grade"];
    this.FreeThrowGrade = source["FreeThrowGrade"];
    this.FinishingGrade = source["FinishingGrade"];
    this.BallworkGrade = source["BallworkGrade"];
    this.ReboundingGrade = source["ReboundingGrade"];
    this.InteriorDefenseGrade = source["InteriorDefenseGrade"];
    this.PerimeterDefenseGrade = source["PerimeterDefenseGrade"];
    this.Stamina = source["Stamina"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.Potential = source["Potential"];
    this.OverallGrade = source["OverallGrade"];
    this.Personality = source["Personality"];
    this.RecruitingBias = source["RecruitingBias"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.IsRedshirting = source["IsRedshirting"];
    this.IsRedshirt = source["IsRedshirt"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NBAPlayerSeasonStats
    );
    this.Stats = this.convertValues(source["Stats"], NBAPlayerStats);
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
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  IsRedshirt: boolean;
  IsRedshirting: boolean;
  HasGraduated: boolean;
  HasProgressed: boolean;
  WillDeclare: boolean;
  TransferStatus: number;
  TransferLikeliness: string;
  LegacyID: number;
  Stats: CollegePlayerStats[];
  SeasonStats: CollegePlayerSeasonStats;
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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.IsRedshirt = source["IsRedshirt"];
    this.IsRedshirting = source["IsRedshirting"];
    this.HasGraduated = source["HasGraduated"];
    this.HasProgressed = source["HasProgressed"];
    this.WillDeclare = source["WillDeclare"];
    this.TransferStatus = source["TransferStatus"];
    this.TransferLikeliness = source["TransferLikeliness"];
    this.LegacyID = source["LegacyID"];
    this.Stats = this.convertValues(source["Stats"], CollegePlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      CollegePlayerSeasonStats
    );
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
export class RetiredPlayer {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Age: number;
  Year: number;
  State: string;
  Country: string;
  Stars: number;
  Height: string;
  Shooting2: number;
  SpecShooting2: boolean;
  Shooting3: number;
  SpecShooting3: boolean;
  Finishing: number;
  SpecFinishing: boolean;
  FreeThrow: number;
  SpecFreeThrow: boolean;
  Ballwork: number;
  SpecBallwork: boolean;
  Rebounding: number;
  SpecRebounding: boolean;
  Defense: number;
  InteriorDefense: number;
  SpecInteriorDefense: boolean;
  PerimeterDefense: number;
  SpecPerimeterDefense: boolean;
  Potential: number;
  PotentialGrade: string;
  ProPotentialGrade: number;
  Stamina: number;
  Discipline: number;
  InjuryRating: number;
  IsInjured: boolean;
  InjuryName: string;
  InjuryType: string;
  WeeksOfRecovery: number;
  InjuryReserve: boolean;
  PlaytimeExpectations: number;
  Minutes: number;
  InsideProportion: number;
  MidRangeProportion: number;
  ThreePointProportion: number;
  Overall: number;
  PositionOne: string;
  PositionTwo: string;
  PositionThree: string;
  P1Minutes: number;
  P2Minutes: number;
  P3Minutes: number;
  SpecCount: number;
  Personality: string;
  FreeAgency: string;
  RecruitingBias: string;
  RecruitingBiasValue: string;
  WorkEthic: string;
  AcademicBias: string;
  PreviousTeamID: number;
  PreviousTeam: string;
  RelativeID: number;
  RelativeType: number;
  Notes: string;
  PlayerID: number;
  TeamID: number;
  TeamAbbr: string;
  CollegeID: number;
  College: string;
  DraftPickID: number;
  DraftedRound: number;
  DraftPick: number;
  DraftedTeamID: number;
  DraftedTeamAbbr: string;
  PrimeAge: number;
  IsNBA: boolean;
  MaxRequested: boolean;
  IsSuperMaxQualified: boolean;
  IsFreeAgent: boolean;
  IsGLeague: boolean;
  IsTwoWay: boolean;
  IsWaived: boolean;
  IsOnTradeBlock: boolean;
  IsFirstTeamANBA: boolean;
  IsDPOY: boolean;
  IsMVP: boolean;
  IsInternational: boolean;
  IsIntGenerated: boolean;
  IsRetiring: boolean;
  IsAcceptingOffers: boolean;
  IsNegotiating: boolean;
  MinimumValue: number;
  SigningRound: number;
  NegotiationRound: number;
  Rejections: number;
  HasProgressed: boolean;
  Offers: NBAContractOffer[];
  WaiverOffers: NBAWaiverOffer[];
  Extensions: NBAExtensionOffer[];
  Contract: NBAContract;
  Stats: NBAPlayerStats[];
  SeasonStats: NBAPlayerSeasonStats;

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
    this.Age = source["Age"];
    this.Year = source["Year"];
    this.State = source["State"];
    this.Country = source["Country"];
    this.Stars = source["Stars"];
    this.Height = source["Height"];
    this.Shooting2 = source["Shooting2"];
    this.SpecShooting2 = source["SpecShooting2"];
    this.Shooting3 = source["Shooting3"];
    this.SpecShooting3 = source["SpecShooting3"];
    this.Finishing = source["Finishing"];
    this.SpecFinishing = source["SpecFinishing"];
    this.FreeThrow = source["FreeThrow"];
    this.SpecFreeThrow = source["SpecFreeThrow"];
    this.Ballwork = source["Ballwork"];
    this.SpecBallwork = source["SpecBallwork"];
    this.Rebounding = source["Rebounding"];
    this.SpecRebounding = source["SpecRebounding"];
    this.Defense = source["Defense"];
    this.InteriorDefense = source["InteriorDefense"];
    this.SpecInteriorDefense = source["SpecInteriorDefense"];
    this.PerimeterDefense = source["PerimeterDefense"];
    this.SpecPerimeterDefense = source["SpecPerimeterDefense"];
    this.Potential = source["Potential"];
    this.PotentialGrade = source["PotentialGrade"];
    this.ProPotentialGrade = source["ProPotentialGrade"];
    this.Stamina = source["Stamina"];
    this.Discipline = source["Discipline"];
    this.InjuryRating = source["InjuryRating"];
    this.IsInjured = source["IsInjured"];
    this.InjuryName = source["InjuryName"];
    this.InjuryType = source["InjuryType"];
    this.WeeksOfRecovery = source["WeeksOfRecovery"];
    this.InjuryReserve = source["InjuryReserve"];
    this.PlaytimeExpectations = source["PlaytimeExpectations"];
    this.Minutes = source["Minutes"];
    this.InsideProportion = source["InsideProportion"];
    this.MidRangeProportion = source["MidRangeProportion"];
    this.ThreePointProportion = source["ThreePointProportion"];
    this.Overall = source["Overall"];
    this.PositionOne = source["PositionOne"];
    this.PositionTwo = source["PositionTwo"];
    this.PositionThree = source["PositionThree"];
    this.P1Minutes = source["P1Minutes"];
    this.P2Minutes = source["P2Minutes"];
    this.P3Minutes = source["P3Minutes"];
    this.SpecCount = source["SpecCount"];
    this.Personality = source["Personality"];
    this.FreeAgency = source["FreeAgency"];
    this.RecruitingBias = source["RecruitingBias"];
    this.RecruitingBiasValue = source["RecruitingBiasValue"];
    this.WorkEthic = source["WorkEthic"];
    this.AcademicBias = source["AcademicBias"];
    this.PreviousTeamID = source["PreviousTeamID"];
    this.PreviousTeam = source["PreviousTeam"];
    this.RelativeID = source["RelativeID"];
    this.RelativeType = source["RelativeType"];
    this.Notes = source["Notes"];
    this.PlayerID = source["PlayerID"];
    this.TeamID = source["TeamID"];
    this.TeamAbbr = source["TeamAbbr"];
    this.CollegeID = source["CollegeID"];
    this.College = source["College"];
    this.DraftPickID = source["DraftPickID"];
    this.DraftedRound = source["DraftedRound"];
    this.DraftPick = source["DraftPick"];
    this.DraftedTeamID = source["DraftedTeamID"];
    this.DraftedTeamAbbr = source["DraftedTeamAbbr"];
    this.PrimeAge = source["PrimeAge"];
    this.IsNBA = source["IsNBA"];
    this.MaxRequested = source["MaxRequested"];
    this.IsSuperMaxQualified = source["IsSuperMaxQualified"];
    this.IsFreeAgent = source["IsFreeAgent"];
    this.IsGLeague = source["IsGLeague"];
    this.IsTwoWay = source["IsTwoWay"];
    this.IsWaived = source["IsWaived"];
    this.IsOnTradeBlock = source["IsOnTradeBlock"];
    this.IsFirstTeamANBA = source["IsFirstTeamANBA"];
    this.IsDPOY = source["IsDPOY"];
    this.IsMVP = source["IsMVP"];
    this.IsInternational = source["IsInternational"];
    this.IsIntGenerated = source["IsIntGenerated"];
    this.IsRetiring = source["IsRetiring"];
    this.IsAcceptingOffers = source["IsAcceptingOffers"];
    this.IsNegotiating = source["IsNegotiating"];
    this.MinimumValue = source["MinimumValue"];
    this.SigningRound = source["SigningRound"];
    this.NegotiationRound = source["NegotiationRound"];
    this.Rejections = source["Rejections"];
    this.HasProgressed = source["HasProgressed"];
    this.Offers = this.convertValues(source["Offers"], NBAContractOffer);
    this.WaiverOffers = this.convertValues(
      source["WaiverOffers"],
      NBAWaiverOffer
    );
    this.Extensions = this.convertValues(
      source["Extensions"],
      NBAExtensionOffer
    );
    this.Contract = this.convertValues(source["Contract"], NBAContract);
    this.Stats = this.convertValues(source["Stats"], NBAPlayerStats);
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      NBAPlayerSeasonStats
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
export class NBARequest {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  Username: string;
  NBATeamID: number;
  NBATeam: string;
  NBATeamAbbreviation: string;
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
    this.NBATeamID = source["NBATeamID"];
    this.NBATeam = source["NBATeam"];
    this.NBATeamAbbreviation = source["NBATeamAbbreviation"];
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
export class Request {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  TeamID: number;
  Username: string;
  IsApproved: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
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
export class RequestDTO {
  ID: number;
  TeamID: number;
  Team: string;
  Abbr: string;
  Username: string;
  Conference: string;
  IsNBA: boolean;
  IsApproved: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamID = source["TeamID"];
    this.Team = source["Team"];
    this.Abbr = source["Abbr"];
    this.Username = source["Username"];
    this.Conference = source["Conference"];
    this.IsNBA = source["IsNBA"];
    this.IsApproved = source["IsApproved"];
  }
}
export class NBATradeOption {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  TradeProposalID: number;
  NBATeamID: number;
  NBAPlayerID: number;
  NBADraftPickID: number;
  OptionType: string;
  CashTransfer: number;
  SalaryPercentage: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.TradeProposalID = source["TradeProposalID"];
    this.NBATeamID = source["NBATeamID"];
    this.NBAPlayerID = source["NBAPlayerID"];
    this.NBADraftPickID = source["NBADraftPickID"];
    this.OptionType = source["OptionType"];
    this.CashTransfer = source["CashTransfer"];
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
export class NBATradeProposal {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  NBATeamID: number;
  NBATeam: string;
  RecepientTeamID: number;
  RecepientTeam: string;
  IsTradeAccepted: boolean;
  IsTradeRejected: boolean;
  IsSynced: boolean;
  NBATeamTradeOptions: NBATradeOption[];
  RecepientTeamTradeOptions: NBATradeOption[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.NBATeamID = source["NBATeamID"];
    this.NBATeam = source["NBATeam"];
    this.RecepientTeamID = source["RecepientTeamID"];
    this.RecepientTeam = source["RecepientTeam"];
    this.IsTradeAccepted = source["IsTradeAccepted"];
    this.IsTradeRejected = source["IsTradeRejected"];
    this.IsSynced = source["IsSynced"];
    this.NBATeamTradeOptions = this.convertValues(
      source["NBATeamTradeOptions"],
      NBATradeOption
    );
    this.RecepientTeamTradeOptions = this.convertValues(
      source["RecepientTeamTradeOptions"],
      NBATradeOption
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
export class NBATradeOptionObj {
  ID: number;
  TradeProposalID: number;
  NBATeamID: number;
  NBAPlayerID: number;
  NBADraftPickID: number;
  OptionType: string;
  CashTransfer: number;
  SalaryPercentage: number;
  Player: NBAPlayer;
  Draftpick: DraftPick;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TradeProposalID = source["TradeProposalID"];
    this.NBATeamID = source["NBATeamID"];
    this.NBAPlayerID = source["NBAPlayerID"];
    this.NBADraftPickID = source["NBADraftPickID"];
    this.OptionType = source["OptionType"];
    this.CashTransfer = source["CashTransfer"];
    this.SalaryPercentage = source["SalaryPercentage"];
    this.Player = this.convertValues(source["Player"], NBAPlayer);
    this.Draftpick = this.convertValues(source["Draftpick"], DraftPick);
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
export class NBATradeProposalDTO {
  ID: number;
  NBATeamID: number;
  NBATeam: string;
  RecepientTeamID: number;
  RecepientTeam: string;
  IsTradeAccepted: boolean;
  IsTradeRejected: boolean;
  NBATeamTradeOptions: NBATradeOptionObj[];
  RecepientTeamTradeOptions: NBATradeOptionObj[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.NBATeamID = source["NBATeamID"];
    this.NBATeam = source["NBATeam"];
    this.RecepientTeamID = source["RecepientTeamID"];
    this.RecepientTeam = source["RecepientTeam"];
    this.IsTradeAccepted = source["IsTradeAccepted"];
    this.IsTradeRejected = source["IsTradeRejected"];
    this.NBATeamTradeOptions = this.convertValues(
      source["NBATeamTradeOptions"],
      NBATradeOptionObj
    );
    this.RecepientTeamTradeOptions = this.convertValues(
      source["RecepientTeamTradeOptions"],
      NBATradeOptionObj
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

export class NBATeamProposals {
  SentTradeProposals: NBATradeProposalDTO[];
  ReceivedTradeProposals: NBATradeProposalDTO[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.SentTradeProposals = this.convertValues(
      source["SentTradeProposals"],
      NBATradeProposalDTO
    );
    this.ReceivedTradeProposals = this.convertValues(
      source["ReceivedTradeProposals"],
      NBATradeProposalDTO
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
export class NBATradePreferences {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  NBATeamID: number;
  PointGuards: boolean;
  PointGuardSpecialties: string;
  ShootingGuards: boolean;
  ShootingGuardSpecialties: string;
  PowerForwards: boolean;
  PowerForwardSpecialties: string;
  SmallForwards: boolean;
  SmallForwardSpecialties: string;
  Centers: boolean;
  CenterSpecialties: string;
  DraftPicks: boolean;
  DraftPickType: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.NBATeamID = source["NBATeamID"];
    this.PointGuards = source["PointGuards"];
    this.PointGuardSpecialties = source["PointGuardSpecialties"];
    this.ShootingGuards = source["ShootingGuards"];
    this.ShootingGuardSpecialties = source["ShootingGuardSpecialties"];
    this.PowerForwards = source["PowerForwards"];
    this.PowerForwardSpecialties = source["PowerForwardSpecialties"];
    this.SmallForwards = source["SmallForwards"];
    this.SmallForwardSpecialties = source["SmallForwardSpecialties"];
    this.Centers = source["Centers"];
    this.CenterSpecialties = source["CenterSpecialties"];
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
export class NBATradePreferencesDTO {
  NBATeamID: number;
  PointGuards: boolean;
  PointGuardSpecialties: string;
  ShootingGuards: boolean;
  ShootingGuardSpecialties: string;
  PowerForwards: boolean;
  PowerForwardSpecialties: string;
  SmallForwards: boolean;
  SmallForwardSpecialties: string;
  Centers: boolean;
  CenterSpecialties: string;
  DraftPicks: boolean;
  DraftPickType: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.NBATeamID = source["NBATeamID"];
    this.PointGuards = source["PointGuards"];
    this.PointGuardSpecialties = source["PointGuardSpecialties"];
    this.ShootingGuards = source["ShootingGuards"];
    this.ShootingGuardSpecialties = source["ShootingGuardSpecialties"];
    this.PowerForwards = source["PowerForwards"];
    this.PowerForwardSpecialties = source["PowerForwardSpecialties"];
    this.SmallForwards = source["SmallForwards"];
    this.SmallForwardSpecialties = source["SmallForwardSpecialties"];
    this.Centers = source["Centers"];
    this.CenterSpecialties = source["CenterSpecialties"];
    this.DraftPicks = source["DraftPicks"];
    this.DraftPickType = source["DraftPickType"];
  }
}
export class NBAUser {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
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
  IsActive: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
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
export class CollegeCoach {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  Name: string;
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
  Scheme: string;
  DefensiveScheme: string;
  TeambuildingPreference: string;
  CareerPreference: string;
  PromiseTendency: string;
  PortalReputation: number;
  SchoolTenure: number;
  CareerTenure: number;
  ContractLength: number;
  YearsRemaining: number;
  IsRetired: boolean;
  IsFormerPlayer: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.Name = source["Name"];
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
    this.Scheme = source["Scheme"];
    this.DefensiveScheme = source["DefensiveScheme"];
    this.TeambuildingPreference = source["TeambuildingPreference"];
    this.CareerPreference = source["CareerPreference"];
    this.PromiseTendency = source["PromiseTendency"];
    this.PortalReputation = source["PortalReputation"];
    this.SchoolTenure = source["SchoolTenure"];
    this.CareerTenure = source["CareerTenure"];
    this.ContractLength = source["ContractLength"];
    this.YearsRemaining = source["YearsRemaining"];
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
export class AvailableTeamResponse {
  TeamName: string;
  TeamAbbr: string;
  Conference: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamName = source["TeamName"];
    this.TeamAbbr = source["TeamAbbr"];
    this.Conference = source["Conference"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
  }
}
export class MatchTeamResponse {
  ID: number;
  TeamName: string;
  Mascot: string;
  Abbr: string;
  Conference: string;
  Coach: string;
  ConferenceID: number;
  LeagueID: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamName = source["TeamName"];
    this.Mascot = source["Mascot"];
    this.Abbr = source["Abbr"];
    this.Conference = source["Conference"];
    this.Coach = source["Coach"];
    this.ConferenceID = source["ConferenceID"];
    this.LeagueID = source["LeagueID"];
  }
}
export class CBBMatchDataResponse {
  HomeTeam: MatchTeamResponse;
  HomeTeamRoster: CollegePlayer[];
  HomeTeamGameplan: Gameplan;
  AwayTeam: MatchTeamResponse;
  AwayTeamRoster: CollegePlayer[];
  AwayTeamGameplan: Gameplan;
  GameID: number;
  Match: string;
  WeekID: number;
  SeasonID: number;
  League: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.HomeTeam = this.convertValues(source["HomeTeam"], MatchTeamResponse);
    this.HomeTeamRoster = this.convertValues(
      source["HomeTeamRoster"],
      CollegePlayer
    );
    this.HomeTeamGameplan = this.convertValues(
      source["HomeTeamGameplan"],
      Gameplan
    );
    this.AwayTeam = this.convertValues(source["AwayTeam"], MatchTeamResponse);
    this.AwayTeamRoster = this.convertValues(
      source["AwayTeamRoster"],
      CollegePlayer
    );
    this.AwayTeamGameplan = this.convertValues(
      source["AwayTeamGameplan"],
      Gameplan
    );
    this.GameID = source["GameID"];
    this.Match = source["Match"];
    this.WeekID = source["WeekID"];
    this.SeasonID = source["SeasonID"];
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
export class TeamSeasonStatsResponse {
  ID: number;
  TeamID: number;
  SeasonID: number;
  GamesPlayed: number;
  Points: number;
  PointsAgainst: number;
  PPG: number;
  PAPG: number;
  Possessions: number;
  PossessionsPerGame: number;
  FGM: number;
  FGA: number;
  FGPercent: number;
  FGMPG: number;
  FGAPG: number;
  FGMAgainst: number;
  FGAAgainst: number;
  FGPercentAgainst: number;
  FGMAPG: number;
  FGAAPG: number;
  ThreePointsMade: number;
  ThreePointAttempts: number;
  ThreePointPercent: number;
  ThreePointsMadeAgainst: number;
  ThreePointAttemptsAgainst: number;
  ThreePointPercentAgainst: number;
  TPMPG: number;
  TPAPG: number;
  TPMAPG: number;
  TPAAPG: number;
  FTM: number;
  FTA: number;
  FTPercent: number;
  FTMPG: number;
  FTAPG: number;
  FTMAgainst: number;
  FTAAgainst: number;
  FTMAPG: number;
  FTAAPG: number;
  FTPercentAgainst: number;
  Rebounds: number;
  OffRebounds: number;
  DefRebounds: number;
  ReboundsPerGame: number;
  OffReboundsPerGame: number;
  DefReboundsPerGame: number;
  ReboundsAllowed: number;
  OffReboundsAllowed: number;
  DefReboundsAllowed: number;
  ReboundsAllowedPerGame: number;
  OffReboundsAllowedPerGame: number;
  DefReboundsAllowedPerGame: number;
  Assists: number;
  AssistsAllowed: number;
  AssistsPerGame: number;
  AssistsAllowedPerGame: number;
  Steals: number;
  StealsAllowed: number;
  StealsPerGame: number;
  StealsAllowedPerGame: number;
  Blocks: number;
  BlocksAllowed: number;
  BlocksPerGame: number;
  BlocksAllowedPerGame: number;
  TotalTurnovers: number;
  TurnoversAllowed: number;
  TurnoversPerGame: number;
  TurnoversAllowedPerGame: number;
  Fouls: number;
  FoulsPerGame: number;
  PointsDiff: number;
  FGMDiff: number;
  FGADiff: number;
  FGPercentDiff: number;
  TPMDiff: number;
  TPADiff: number;
  TPPercentDiff: number;
  FTMDiff: number;
  FTADiff: number;
  FTPercentDiff: number;
  OReboundsDiff: number;
  DReboundsDiff: number;
  ReboundsDiff: number;
  AssistsDiff: number;
  StealsDiff: number;
  BlocksDiff: number;
  TODiff: number;
  FoulsDiff: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.TeamID = source["TeamID"];
    this.SeasonID = source["SeasonID"];
    this.GamesPlayed = source["GamesPlayed"];
    this.Points = source["Points"];
    this.PointsAgainst = source["PointsAgainst"];
    this.PPG = source["PPG"];
    this.PAPG = source["PAPG"];
    this.Possessions = source["Possessions"];
    this.PossessionsPerGame = source["PossessionsPerGame"];
    this.FGM = source["FGM"];
    this.FGA = source["FGA"];
    this.FGPercent = source["FGPercent"];
    this.FGMPG = source["FGMPG"];
    this.FGAPG = source["FGAPG"];
    this.FGMAgainst = source["FGMAgainst"];
    this.FGAAgainst = source["FGAAgainst"];
    this.FGPercentAgainst = source["FGPercentAgainst"];
    this.FGMAPG = source["FGMAPG"];
    this.FGAAPG = source["FGAAPG"];
    this.ThreePointsMade = source["ThreePointsMade"];
    this.ThreePointAttempts = source["ThreePointAttempts"];
    this.ThreePointPercent = source["ThreePointPercent"];
    this.ThreePointsMadeAgainst = source["ThreePointsMadeAgainst"];
    this.ThreePointAttemptsAgainst = source["ThreePointAttemptsAgainst"];
    this.ThreePointPercentAgainst = source["ThreePointPercentAgainst"];
    this.TPMPG = source["TPMPG"];
    this.TPAPG = source["TPAPG"];
    this.TPMAPG = source["TPMAPG"];
    this.TPAAPG = source["TPAAPG"];
    this.FTM = source["FTM"];
    this.FTA = source["FTA"];
    this.FTPercent = source["FTPercent"];
    this.FTMPG = source["FTMPG"];
    this.FTAPG = source["FTAPG"];
    this.FTMAgainst = source["FTMAgainst"];
    this.FTAAgainst = source["FTAAgainst"];
    this.FTMAPG = source["FTMAPG"];
    this.FTAAPG = source["FTAAPG"];
    this.FTPercentAgainst = source["FTPercentAgainst"];
    this.Rebounds = source["Rebounds"];
    this.OffRebounds = source["OffRebounds"];
    this.DefRebounds = source["DefRebounds"];
    this.ReboundsPerGame = source["ReboundsPerGame"];
    this.OffReboundsPerGame = source["OffReboundsPerGame"];
    this.DefReboundsPerGame = source["DefReboundsPerGame"];
    this.ReboundsAllowed = source["ReboundsAllowed"];
    this.OffReboundsAllowed = source["OffReboundsAllowed"];
    this.DefReboundsAllowed = source["DefReboundsAllowed"];
    this.ReboundsAllowedPerGame = source["ReboundsAllowedPerGame"];
    this.OffReboundsAllowedPerGame = source["OffReboundsAllowedPerGame"];
    this.DefReboundsAllowedPerGame = source["DefReboundsAllowedPerGame"];
    this.Assists = source["Assists"];
    this.AssistsAllowed = source["AssistsAllowed"];
    this.AssistsPerGame = source["AssistsPerGame"];
    this.AssistsAllowedPerGame = source["AssistsAllowedPerGame"];
    this.Steals = source["Steals"];
    this.StealsAllowed = source["StealsAllowed"];
    this.StealsPerGame = source["StealsPerGame"];
    this.StealsAllowedPerGame = source["StealsAllowedPerGame"];
    this.Blocks = source["Blocks"];
    this.BlocksAllowed = source["BlocksAllowed"];
    this.BlocksPerGame = source["BlocksPerGame"];
    this.BlocksAllowedPerGame = source["BlocksAllowedPerGame"];
    this.TotalTurnovers = source["TotalTurnovers"];
    this.TurnoversAllowed = source["TurnoversAllowed"];
    this.TurnoversPerGame = source["TurnoversPerGame"];
    this.TurnoversAllowedPerGame = source["TurnoversAllowedPerGame"];
    this.Fouls = source["Fouls"];
    this.FoulsPerGame = source["FoulsPerGame"];
    this.PointsDiff = source["PointsDiff"];
    this.FGMDiff = source["FGMDiff"];
    this.FGADiff = source["FGADiff"];
    this.FGPercentDiff = source["FGPercentDiff"];
    this.TPMDiff = source["TPMDiff"];
    this.TPADiff = source["TPADiff"];
    this.TPPercentDiff = source["TPPercentDiff"];
    this.FTMDiff = source["FTMDiff"];
    this.FTADiff = source["FTADiff"];
    this.FTPercentDiff = source["FTPercentDiff"];
    this.OReboundsDiff = source["OReboundsDiff"];
    this.DReboundsDiff = source["DReboundsDiff"];
    this.ReboundsDiff = source["ReboundsDiff"];
    this.AssistsDiff = source["AssistsDiff"];
    this.StealsDiff = source["StealsDiff"];
    this.BlocksDiff = source["BlocksDiff"];
    this.TODiff = source["TODiff"];
    this.FoulsDiff = source["FoulsDiff"];
  }
}
export class CollegeTeamResponse {
  ID: number;
  Team: string;
  Nickname: string;
  Abbr: string;
  ConferenceID: number;
  Conference: string;
  Coach: string;
  OverallGrade: string;
  OffenseGrade: string;
  DefenseGrade: string;
  IsNBA: boolean;
  IsActive: boolean;
  SeasonStats: TeamSeasonStatsResponse;
  Stats: TeamStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.Team = source["Team"];
    this.Nickname = source["Nickname"];
    this.Abbr = source["Abbr"];
    this.ConferenceID = source["ConferenceID"];
    this.Conference = source["Conference"];
    this.Coach = source["Coach"];
    this.OverallGrade = source["OverallGrade"];
    this.OffenseGrade = source["OffenseGrade"];
    this.DefenseGrade = source["DefenseGrade"];
    this.IsNBA = source["IsNBA"];
    this.IsActive = source["IsActive"];
    this.SeasonStats = this.convertValues(
      source["SeasonStats"],
      TeamSeasonStatsResponse
    );
    this.Stats = this.convertValues(source["Stats"], TeamStats);
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
export class CollegeTeamResponseData {
  TeamData: Team;
  TeamStandings: CollegeStandings;
  UpcomingMatches: Match[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamData = this.convertValues(source["TeamData"], Team);
    this.TeamStandings = this.convertValues(
      source["TeamStandings"],
      CollegeStandings
    );
    this.UpcomingMatches = this.convertValues(source["UpcomingMatches"], Match);
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
export class DashboardResponseData {
  CollegeStandings: CollegeStandings[];
  NewsLogs: NewsLog[];
  CollegeGames: Match[];
  NBAStandings: NBAStandings[];
  NBAGames: NBAMatch[];
  TopCBBPlayers: CollegePlayer[];
  TopNBAPlayers: NBAPlayer[];
  TopTenPoll: CollegePollOfficial;
  CBBTeamStats: TeamSeasonStats;
  NBATeamStats: NBATeamSeasonStats;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.CollegeStandings = this.convertValues(
      source["CollegeStandings"],
      CollegeStandings
    );
    this.NewsLogs = this.convertValues(source["NewsLogs"], NewsLog);
    this.CollegeGames = this.convertValues(source["CollegeGames"], Match);
    this.NBAStandings = this.convertValues(
      source["NBAStandings"],
      NBAStandings
    );
    this.NBAGames = this.convertValues(source["NBAGames"], NBAMatch);
    this.TopCBBPlayers = this.convertValues(
      source["TopCBBPlayers"],
      CollegePlayer
    );
    this.TopNBAPlayers = this.convertValues(source["TopNBAPlayers"], NBAPlayer);
    this.TopTenPoll = this.convertValues(
      source["TopTenPoll"],
      CollegePollOfficial
    );
    this.CBBTeamStats = this.convertValues(
      source["CBBTeamStats"],
      TeamSeasonStats
    );
    this.NBATeamStats = this.convertValues(
      source["NBATeamStats"],
      NBATeamSeasonStats
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

export class DashboardTeamProfileResponse {
  TeamProfile: TeamRecruitingProfile;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.TeamProfile = this.convertValues(
      source["TeamProfile"],
      TeamRecruitingProfile
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
export class GameplanResponse {
  Gameplan: Gameplan;
  OpposingRoster: CollegePlayer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Gameplan = this.convertValues(source["Gameplan"], Gameplan);
    this.OpposingRoster = this.convertValues(
      source["OpposingRoster"],
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
export class TopPlayer {
  PlayerID: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  OverallGrade: string;
  Overall: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.PlayerID = source["PlayerID"];
    this.FirstName = source["FirstName"];
    this.LastName = source["LastName"];
    this.Position = source["Position"];
    this.Archetype = source["Archetype"];
    this.OverallGrade = source["OverallGrade"];
    this.Overall = source["Overall"];
  }
}
export class TeamRecordResponse {
  OverallWins: number;
  OverallLosses: number;
  CurrentSeasonWins: number;
  CurrentSeasonLosses: number;
  TournamentWins: number;
  TournamentLosses: number;
  PlayoffWins: number;
  PlayoffLosses: number;
  NITWins: number;
  NITLosses: number;
  CBIWins: number;
  CBILosses: number;
  RegularSeasonChampionships: string[];
  ConferenceChampionships: string[];
  SweetSixteens: string[];
  EliteEights: string[];
  FinalFours: string[];
  RunnerUps: string[];
  NationalChampionships: string[];
  TopPlayers: TopPlayer[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.OverallWins = source["OverallWins"];
    this.OverallLosses = source["OverallLosses"];
    this.CurrentSeasonWins = source["CurrentSeasonWins"];
    this.CurrentSeasonLosses = source["CurrentSeasonLosses"];
    this.TournamentWins = source["TournamentWins"];
    this.TournamentLosses = source["TournamentLosses"];
    this.PlayoffWins = source["PlayoffWins"];
    this.PlayoffLosses = source["PlayoffLosses"];
    this.NITWins = source["NITWins"];
    this.NITLosses = source["NITLosses"];
    this.CBIWins = source["CBIWins"];
    this.CBILosses = source["CBILosses"];
    this.RegularSeasonChampionships = source["RegularSeasonChampionships"];
    this.ConferenceChampionships = source["ConferenceChampionships"];
    this.SweetSixteens = source["SweetSixteens"];
    this.EliteEights = source["EliteEights"];
    this.FinalFours = source["FinalFours"];
    this.RunnerUps = source["RunnerUps"];
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
  CBBNotifications: Notification[];
  NBANotifications: Notification[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.CBBNotifications = this.convertValues(
      source["CBBNotifications"],
      Notification
    );
    this.NBANotifications = this.convertValues(
      source["NBANotifications"],
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
  }
}
export class Timestamp {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: Time;
  SeasonID: number;
  Season: number;
  CollegeWeekID: number;
  NBAWeekID: number;
  CollegeWeek: number;
  NBAWeek: number;
  GamesARan: boolean;
  GamesBRan: boolean;
  GamesCRan: boolean;
  GamesDRan: boolean;
  CollegePollRan: boolean;
  RecruitingSynced: boolean;
  GMActionsComplete: boolean;
  IsRecruitingLocked: boolean;
  AIBoardsCreated: boolean;
  AIPointAllocationComplete: boolean;
  IsOffSeason: boolean;
  IsNBAOffseason: boolean;
  NBAPreseason: boolean;
  IsFreeAgencyLocked: boolean;
  IsDraftTime: boolean;
  ProgressedCollegePlayers: boolean;
  ProgressedProfessionalPlayers: boolean;
  CollegeSeasonOver: boolean;
  NBASeasonOver: boolean;
  CrootsGenerated: boolean;
  Y1Capspace: number;
  Y2Capspace: number;
  Y3Capspace: number;
  Y4Capspace: number;
  Y5Capspace: number;
  FreeAgencyRound: number;
  RunCron: boolean;
  RunGames: boolean;
  TransferPortalPhase: number;
  TransferPortalRound: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], Time);
    this.SeasonID = source["SeasonID"];
    this.Season = source["Season"];
    this.CollegeWeekID = source["CollegeWeekID"];
    this.NBAWeekID = source["NBAWeekID"];
    this.CollegeWeek = source["CollegeWeek"];
    this.NBAWeek = source["NBAWeek"];
    this.GamesARan = source["GamesARan"];
    this.GamesBRan = source["GamesBRan"];
    this.GamesCRan = source["GamesCRan"];
    this.GamesDRan = source["GamesDRan"];
    this.CollegePollRan = source["CollegePollRan"];
    this.RecruitingSynced = source["RecruitingSynced"];
    this.GMActionsComplete = source["GMActionsComplete"];
    this.IsRecruitingLocked = source["IsRecruitingLocked"];
    this.AIBoardsCreated = source["AIBoardsCreated"];
    this.AIPointAllocationComplete = source["AIPointAllocationComplete"];
    this.IsOffSeason = source["IsOffSeason"];
    this.IsNBAOffseason = source["IsNBAOffseason"];
    this.NBAPreseason = source["NBAPreseason"];
    this.IsFreeAgencyLocked = source["IsFreeAgencyLocked"];
    this.IsDraftTime = source["IsDraftTime"];
    this.ProgressedCollegePlayers = source["ProgressedCollegePlayers"];
    this.ProgressedProfessionalPlayers =
      source["ProgressedProfessionalPlayers"];
    this.CollegeSeasonOver = source["CollegeSeasonOver"];
    this.NBASeasonOver = source["NBASeasonOver"];
    this.CrootsGenerated = source["CrootsGenerated"];
    this.Y1Capspace = source["Y1Capspace"];
    this.Y2Capspace = source["Y2Capspace"];
    this.Y3Capspace = source["Y3Capspace"];
    this.Y4Capspace = source["Y4Capspace"];
    this.Y5Capspace = source["Y5Capspace"];
    this.FreeAgencyRound = source["FreeAgencyRound"];
    this.RunCron = source["RunCron"];
    this.RunGames = source["RunGames"];
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
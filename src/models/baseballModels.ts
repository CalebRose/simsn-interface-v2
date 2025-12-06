export class Time {
  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
  }
}

export class Timestamp {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  Season: number;
  SeasonID: number;
  Week: number;
  WeekID: number | null;
  GamesARan: boolean;
  GamesBRan: boolean;
  GamesCRan: boolean;
  GamesDRan: boolean;
  IsOffSeason: boolean;
  IsRecruitingLocked: boolean;
  IsFreeAgencyLocked: boolean;
  IsDraftTime: boolean;
  RunGames: boolean;
  RunCron: boolean;
  RecruitingSynced: boolean;
  GMActionsCompleted: boolean;
  FreeAgencyRound: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.Season = source["Season"];
    this.SeasonID = source["SeasonID"];
    this.Week = source["Week"];
    this.WeekID = source["WeekID"];
    this.GamesARan = source["GamesARan"];
    this.GamesBRan = source["GamesBRan"];
    this.GamesCRan = source["GameCRan"];
    this.GamesDRan = source["GamesDRan"];
    this.IsOffSeason = source["IsOffSeason"];
    this.IsRecruitingLocked = source["IsRecruitingLocked"];
    this.IsFreeAgencyLocked = source["IsFreeAgencyLocked"];
    this.IsDraftTime = source["IsDraftTime"];
    this.RunGames = source["RunGames"];
    this.RunCron = source["RunCron"];
    this.RecruitingSynced = source["RecruitingSynced"];
    this.GMActionsCompleted = source["GMActionsCompleted"];
    this.FreeAgencyRound = source["FreeAgencyRound"];
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

export class BaseballTeam {
  id: number;
  city: string;
  nickname: string;
  abbrev: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.id = source["id"];
    this.city = source["city"];
    this.nickname = source["nickname"];
    this.abbrev = source["abbrev"];
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

export class BaseballOrganization {
  id: number;
  org_abbrev: string;
  cash: number;
  league: "mlb" | "college";
  teams: BaseballTeam[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.id = source["id"];
    this.org_abbrev = source["org_abbrev"];
    this.cash = source["cash"];
    this.league = source["league"];
    this.teams = this.convertValues(source["teams"], BaseballTeam);
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

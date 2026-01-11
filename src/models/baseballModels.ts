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

export interface BaseballTeam {
    id: number;
    city: string;
    nickname: string;
    abbrev: string;
}


export interface BaseballOrganization {
    id: number;
    org_abbrev: string;
    cash: number;
    league: "mlb" | "college";
    teams: BaseballTeam[];
}

export interface BaseballRosters{
    org_abbrev: string;
    org_id:     number;
    players:    Player[];
}

export interface Player {
    age:                 number;
    area:                string;
    arm_angle:           ArmAngle;
    basereaction_base:   number;
    basereaction_pot:    Pot;
    baserunning_base:    number;
    baserunning_pot:     Pot;
    bat_hand:            Hand;
    c_rating:            number;
    catchframe_base:     number;
    catchframe_pot:      Pot;
    catchsequence_base:  number;
    catchsequence_pot:   Pot;
    center_split:        number;
    cf_rating:           number;
    city:                string;
    contact_base:        number;
    contact_pot:         Pot;
    current_level:       number;
    dh_rating:           number;
    discipline_base:     number;
    discipline_pot:      Pot;
    displayovr:          null;
    durability:          Durability;
    eye_base:            number;
    eye_pot:             Pot;
    fb_rating:           number;
    fieldcatch_base:     number;
    fieldcatch_pot:      Pot;
    fieldreact_base:     number;
    fieldreact_pot:      Pot;
    fieldspot_base:      number;
    fieldspot_pot:       Pot;
    firstname:           string;
    height:              number;
    id:                  number;
    injury_risk:         InjuryRisk;
    intorusa:            Intorusa;
    lastname:            string;
    left_split:          number;
    level:               Level;
    lf_rating:           number;
    pendurance_base:     number;
    pendurance_pot:      Pot;
    pgencontrol_base:    number;
    pgencontrol_pot:     Pot;
    pickoff_base:        number;
    pickoff_pot:         Pot;
    pitch1_consist_base: number;
    pitch1_consist_pot:  Pot;
    pitch1_name:         PitchName;
    pitch1_ovr:          number;
    pitch1_pacc_base:    number;
    pitch1_pacc_pot:     Pot;
    pitch1_pbrk_base:    number;
    pitch1_pbrk_pot:     Pot;
    pitch1_pcntrl_base:  number;
    pitch1_pcntrl_pot:   Pot;
    pitch2_consist_base: number;
    pitch2_consist_pot:  Pot;
    pitch2_name:         PitchName;
    pitch2_ovr:          number;
    pitch2_pacc_base:    number;
    pitch2_pacc_pot:     Pot;
    pitch2_pbrk_base:    number;
    pitch2_pbrk_pot:     Pot;
    pitch2_pcntrl_base:  number;
    pitch2_pcntrl_pot:   Pot;
    pitch3_consist_base: number;
    pitch3_consist_pot:  Pot;
    pitch3_name:         PitchName;
    pitch3_ovr:          number;
    pitch3_pacc_base:    number;
    pitch3_pacc_pot:     Pot;
    pitch3_pbrk_base:    number;
    pitch3_pbrk_pot:     Pot;
    pitch3_pcntrl_base:  number;
    pitch3_pcntrl_pot:   Pot;
    pitch4_consist_base: number;
    pitch4_consist_pot:  Pot;
    pitch4_name:         PitchName;
    pitch4_ovr:          number;
    pitch4_pacc_base:    number;
    pitch4_pacc_pot:     Pot;
    pitch4_pbrk_base:    number;
    pitch4_pbrk_pot:     Pot;
    pitch4_pcntrl_base:  number;
    pitch4_pcntrl_pot:   Pot;
    pitch5_consist_base: number;
    pitch5_consist_pot:  Pot;
    pitch5_name:         PitchName;
    pitch5_ovr:          number;
    pitch5_pacc_base:    number;
    pitch5_pacc_pot:     Pot;
    pitch5_pbrk_base:    number;
    pitch5_pbrk_pot:     Pot;
    pitch5_pcntrl_base:  number;
    pitch5_pcntrl_pot:   Pot;
    pitch_hand:          Hand;
    power_base:          number;
    power_pot:           Pot;
    psequencing_base:    number;
    psequencing_pot:     Pot;
    pthrowpower_base:    number;
    pthrowpower_pot:     Pot;
    ptype:               Ptype;
    rf_rating:           number;
    right_split:         number;
    rp_rating:           number;
    sb_rating:           number;
    sp_rating:           number;
    speed_base:          number;
    speed_pot:           Pot;
    ss_rating:           number;
    tb_rating:           number;
    team:                string;
    throwacc_base:       number;
    throwacc_pot:        Pot;
    throwpower_base:     number;
    throwpower_pot:      Pot;
    weight:              number;
}

export enum ArmAngle {
    Overhead = "Overhead",
    Sidearm = "Sidearm",
    Submarine = "Submarine",
    The34S = "3/4''s",
}

export enum Pot {
    Aplus = "A+",
    A = "A",
    Aminus = "A-",
    Bplus = "B+",
    B = "B",
    Bminus = "B-",
    Cplus = "C+",
    C = "C",
    Cminus = "C-",
    Dplus = "D+",
    D = "D",
    Dminus = "D-",
    F = "F",
    N = "N",
}

export enum Hand {
    L = "L",
    R = "R",
    S = "S",
}

export enum Durability {
    Dependable = "Dependable",
    IronMan = "Iron Man",
    Normal = "Normal",
    TiresEasily = "Tires Easily",
    Undependable = "Undependable",
}

export enum InjuryRisk {
    Dependable = "Dependable",
    Normal = "Normal",
    Risky = "Risky",
    Safe = "Safe",
    Volatile = "Volatile",
}

export enum Intorusa {
    International = "international",
    Usa = "usa",
}

export enum Level {
    A = "a",
    AAA = "aaa",
    Aa = "aa",
    Higha = "higha",
    Mlb = "mlb",
    Scraps = "scraps",
}

export enum PitchName {
    ChangeUp = "Change Up",
    CircleChange = "Circle Change",
    Curveball = "Curveball",
    Cutter = "Cutter",
    Eephus = "Eephus",
    FourSeamFastball = "Four-Seam Fastball",
    KnuckleBall = "Knuckle Ball",
    KnuckleCurve = "Knuckle Curve",
    Screwball = "Screwball",
    Sinker = "Sinker",
    Slider = "Slider",
    Slurve = "Slurve",
    Splitter = "Splitter",
    TwoSeamFastball = "Two-Seam Fastball",
}

export enum Ptype {
    Pitcher = "Pitcher",
    Position = "Position",
}
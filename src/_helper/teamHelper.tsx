import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";
import {
  Timestamp as BKTimestamp,
  Match,
  NBAMatch,
} from "../models/basketballModels";
import { Timestamp as FBTimestamp } from "../models/footballModels";
import {
  Timestamp as HCKTimestamp,
  CollegeGame as CHLGame,
  ProfessionalGame as PHLGame,
  CollegeGame,
} from "../models/hockeyModels";

export const GetTeamLabel = (league: League, team: any): String => {
  if (league === SimCFB || league === SimNFL) {
    return `${team.TeamName} ${team.Mascot}`;
  } else if (league === SimCBB || league === SimNBA) {
    return `${team.Team} ${team.Nickname}`;
  }
  return "";
};

export const GetCurrentWeek = (league: League, ts: any) => {
  if (league === SimCFB || league === SimNFL) {
    return GetFBCurrentWeek(league, ts as FBTimestamp);
  }
  if (league === SimCBB || league === SimNBA) {
    return GetBKCurrentWeek(league, ts as BKTimestamp);
  }
  if (league === SimCHL || league === SimPHL) {
    return GetHCKCurrentWeek(ts as HCKTimestamp);
  }
};

export const GetFBCurrentWeek = (league: League, ts: FBTimestamp) => {
  if (league === SimCFB) {
    return ts.CollegeWeek;
  } else if (league === SimNFL) {
    return ts.NFLWeek;
  }
  return 0;
};

export const GetBKCurrentWeek = (league: League, ts: BKTimestamp) => {
  if (league === SimCBB) {
    return ts.CollegeWeek;
  } else if (league === SimNBA) {
    return ts.NBAWeek;
  }
  return 0;
};

export const GetHCKCurrentWeek = (ts: HCKTimestamp) => {
  return ts.Week;
};

export const GetLeagueTS = (
  league: League,
  cfb: FBTimestamp | null,
  cbb: BKTimestamp | null,
  hck: HCKTimestamp | null
) => {
  if ([SimCFB, SimNFL].includes(league)) {
    return cfb;
  }
  if ([SimCBB, SimNBA].includes(league)) {
    return cbb;
  }
  if ([SimCHL, SimPHL].includes(league)) {
    return hck;
  }
  return null;
};

export const RevealBBAResults = (
  game: Match | NBAMatch,
  timestamp: BKTimestamp,
  currentWeek: number
): boolean => {
  if (game.Week < currentWeek || game.SeasonID < timestamp.SeasonID)
    return true;
  const { MatchOfWeek, GameComplete } = game;
  if (MatchOfWeek === "A" && timestamp.GamesARan) return GameComplete;
  if (MatchOfWeek === "B" && timestamp.GamesBRan) return GameComplete;
  if (MatchOfWeek === "C" && timestamp.GamesCRan) return GameComplete;
  if (MatchOfWeek === "D" && timestamp.GamesDRan) return GameComplete;

  return false;
};

export const GetGameIndex = (ts: any, matches: Match[]): number => {
  if (matches.length === 0) return -1;
  if (ts && ts.CollegeWeek > -1 && matches && matches.length > 0) {
    let currentMatchIdx = -1;
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (
        match.Week === ts.CollegeWeek &&
        ((match.MatchOfWeek === "A" && !ts.GamesARan) ||
          match.MatchOfWeek === "B" ||
          match.MatchOfWeek === "C" ||
          match.MatchOfWeek === "D")
      ) {
        currentMatchIdx = i;
        break;
      }
    }
    return currentMatchIdx;
  }
  return -1;
};

interface Game {
  TimeSlot: string;
  GameDay: string;
  MatchOfWeek: string;
  RevealGame: boolean;
  Week: number;
  SeasonID: number;
}

export const RevealResults = (
  game: Game,
  ts: FBTimestamp | BKTimestamp | HCKTimestamp,
  league: League,
  resultsOverride: boolean
): boolean => {
  if (resultsOverride) return true;
  const { TimeSlot, Week, SeasonID } = game;
  let gameDay = "";
  let currentWeek = 0,
    currentSeasonID = 0;
  let timestamp = ts;
  if (league === SimCFB) {
    timestamp = timestamp as FBTimestamp;
    currentWeek = timestamp.CollegeWeek;
    currentSeasonID = timestamp.CollegeSeasonID;
  } else if (league === SimNFL) {
    timestamp = timestamp as FBTimestamp;
    currentWeek = timestamp.NFLWeek;
    currentSeasonID = timestamp.NFLSeasonID;
  }

  if (Week < currentWeek || SeasonID < currentSeasonID) {
    return true;
  }
  timestamp = timestamp as FBTimestamp;
  if (TimeSlot === "Thursday Night" && timestamp.ThursdayGames) return true;
  if (TimeSlot === "Thursday Night Football" && timestamp.NFLThursday)
    return true;
  if (TimeSlot === "Friday Night" && timestamp.FridayGames) return true;
  if (TimeSlot === "Saturday Morning" && timestamp.SaturdayMorning) return true;
  if (TimeSlot === "Saturday Afternoon" && timestamp.SaturdayNoon) return true;
  if (TimeSlot === "Saturday Evening" && timestamp.SaturdayEvening) return true;
  if (TimeSlot === "Saturday Night" && timestamp.SaturdayNight) return true;
  if (TimeSlot === "Sunday Noon" && timestamp.NFLSundayNoon) return true;
  if (TimeSlot === "Sunday Afternoon" && timestamp.NFLSundayAfternoon)
    return true;
  if (TimeSlot === "Sunday Night Football" && timestamp.NFLSundayEvening)
    return true;
  if (TimeSlot === "Monday Night Football" && timestamp.NFLMondayEvening)
    return true;
  return false;
};

export const RevealHCKResults = (
  game: CHLGame | PHLGame,
  timestamp: HCKTimestamp,
  resultsOverride: boolean
): boolean => {
  if (resultsOverride) return true;
  const currentWeek = timestamp.Week;
  if (game.Week < currentWeek || game.SeasonID < timestamp.SeasonID)
    return true;
  const { GameDay, GameComplete } = game;
  if (CHLGame) {
    if (GameDay === "A" && timestamp.GamesARan) return GameComplete;
    if (GameDay === "B" && timestamp.GamesBRan) return GameComplete;
  }
  if (PHLGame) {
    if (GameDay === "A" && timestamp.GamesARan) return GameComplete;
    if (GameDay === "B" && timestamp.GamesBRan) return GameComplete;
    if (GameDay === "C" && timestamp.GamesCRan) return GameComplete;
  }
  return false;
};

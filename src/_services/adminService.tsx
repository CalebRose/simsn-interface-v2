import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall, PostCall, PUTCallNoResponse } from "../_helper/fetchHelper";
import { CollegeGame, NFLGame, Timestamp as FBA_Timestamp } from "../models/footballModels";
import { Match, NBAMatch } from "../models/basketballModels";

export interface FBAUpdateTimestampDTO {
  WeekID: number;
  Week: number;
  SeasonID: number;
  Phase: number;
  SalaryCap?: number;
  Y1Capspace?: number;
  CFBSpringGames: boolean;
  NFLPreseason: boolean;
  ThursdayGames: boolean;
  FridayGames: boolean;
  SaturdayMorning: boolean;
  SaturdayNoon: boolean;
  SaturdayEvening: boolean;
  SaturdayNight: boolean;
  NFLThursday: boolean;
  NFLSundayNoon: boolean;
  NFLSundayAfternoon: boolean;
  NFLSundayEvening: boolean;
  NFLMondayEvening: boolean;
}

export interface GamesTimestampDTO {
  WeekID: number;
  Week: number;
  SeasonID: number;
  Phase: number;
  SalaryCap?: number;
  Y1Capspace?: number;
  IsPreseason: boolean;
  GamesARan: boolean;
  GamesBRan: boolean;
  GamesCRan: boolean;
  GamesDRan: boolean;
}

export interface CFBConferenceChampionshipDTO {
  GameID?: number;
  ConferenceID: number;
  Conference: string;
  HomeTeamID: number;
  AwayTeamID: number;
  TimeSlot: string;
  StadiumID?: number;
  Stadium?: string;
  City?: string;
  State?: string;
  IsDomed?: boolean;
  IsNeutral: boolean;
  GameTitle?: string;
  Week?: number;
}

export interface CFBBowlFixtureDTO {
  GameID?: number;
  Week: number;
  TimeSlot: string;
  GameTitle: string;
  HomeTeam: string;
  AwayTeam: string;
  HomeTeamID?: number;
  AwayTeamID?: number;
  StadiumID?: number;
  Stadium: string;
  City: string;
  State: string;
  IsDomed: boolean;
  IsNeutral: boolean;
}

export interface CFBBowlUploadRequest {
  Fixtures: CFBBowlFixtureDTO[];
  OverrideWeekCheck?: boolean;
}

export interface CFBPlayoffSeedDTO {
  Seed: number;
  TeamID: number;
  TeamAbbr: string;
}

export interface CFBPlayoffScheduleRequest {
  Seeds: CFBPlayoffSeedDTO[];
}

export interface NFLPlayoffSeedDTO {
  Seed: number;
  TeamID: number;
  TeamAbbr: string;
  Conference: "AFC" | "NFC" | string;
}

export interface NFLPlayoffScheduleRequest {
  Seeds: NFLPlayoffSeedDTO[];
}

export interface CompensatoryDraftPickDTO {
  TeamID: number;
  Season?: number;
  SeasonID?: number;
  DraftRound: number;
  DraftNumber: number;
}

export interface CBBTournamentMatchDTO {
  TournamentName: string;
  Conference?: string;
  RoundName: string;
  HomeTeamID: number;
  AwayTeamID: number;
  HomeTeamSeed?: number;
  AwayTeamSeed?: number;
  Week: number;
  TimeSlot: string;
  Arena: string;
  City: string;
  State: string;
  IsConferenceTournament?: boolean;
}

export interface CBBTournamentSeedDTO {
  Seed: number;
  TeamID: number;
  TeamName: string;
}

export interface CBBTournamentScheduleRequest {
  ConferenceID?: number;
  TournamentName: string;
  Format?: string;
  Seeds: CBBTournamentSeedDTO[];
}

export interface CBBNCAATournamentRequest {
  TournamentName: string;
  Regions: {
    East: CBBTournamentSeedDTO[];
    South: CBBTournamentSeedDTO[];
    Midwest: CBBTournamentSeedDTO[];
    West: CBBTournamentSeedDTO[];
  };
}

export interface NBAPlayoffSeedDTO {
  Seed: number;
  TeamID: number;
  TeamName: string;
}

export interface NBAPlayoffScheduleRequest {
  IncludePlayIn?: boolean;
  EastSeeds: NBAPlayoffSeedDTO[];
  WestSeeds: NBAPlayoffSeedDTO[];
}

export const AdminService = {
  AddCompensatoryDraftPick: async (
    dto: CompensatoryDraftPickDTO,
  ): Promise<any> => {
    return await PostCall(`${fbaUrl}admin/nfl/draft-pick/compensatory`, dto);
  },
  FBAUpdateTimestamp: async (dto: FBAUpdateTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${fbaUrl}admin/timestamp/update`, dto);
  },
  FBARunTheGames: async (): Promise<FBA_Timestamp> => {
    return await PostCall<Record<string, never>, FBA_Timestamp>(
      `${fbaUrl}admin/run/the/games/`,
      {},
    );
  },
  GetCFBPostseasonGames: async (): Promise<CollegeGame[]> => {
    return await GetCall<CollegeGame[]>(`${fbaUrl}admin/cfb/postseason/games`);
  },
  DeleteCFBPostseasonGame: async (gameID: number): Promise<void> => {
    await PostCall<Record<string, never>, { deleted: boolean }>(
      `${fbaUrl}admin/cfb/game/delete/${gameID}`,
      {},
    );
  },
  GetNFLPostseasonGames: async (): Promise<NFLGame[]> => {
    return await GetCall<NFLGame[]>(`${fbaUrl}admin/nfl/postseason/games`);
  },
  DeleteNFLPostseasonGame: async (gameID: number): Promise<void> => {
    await PostCall<Record<string, never>, { deleted: boolean }>(
      `${fbaUrl}admin/nfl/game/delete/${gameID}`,
      {},
    );
  },
  GenerateNFLPlayoffSchedule: async (
    dto: NFLPlayoffScheduleRequest,
  ): Promise<NFLGame[]> => {
    return await PostCall<NFLPlayoffScheduleRequest, NFLGame[]>(
      `${fbaUrl}admin/nfl/playoffs/generate`,
      dto,
    );
  },
  SaveCFBConferenceChampionship: async (
    dto: CFBConferenceChampionshipDTO,
  ): Promise<CollegeGame> => {
    return await PostCall<CFBConferenceChampionshipDTO, CollegeGame>(
      `${fbaUrl}admin/cfb/conference-championship/save`,
      dto,
    );
  },
  UploadCFBBowlGames: async (
    dto: CFBBowlUploadRequest,
  ): Promise<CollegeGame[]> => {
    return await PostCall<CFBBowlUploadRequest, CollegeGame[]>(
      `${fbaUrl}admin/cfb/bowls/upload`,
      dto,
    );
  },
  GenerateFBSPlayoffSchedule: async (
    dto: CFBPlayoffScheduleRequest,
  ): Promise<CollegeGame[]> => {
    return await PostCall<CFBPlayoffScheduleRequest, CollegeGame[]>(
      `${fbaUrl}admin/cfb/playoffs/fbs/generate`,
      dto,
    );
  },
  GenerateFCSPlayoffSchedule: async (
    dto: CFBPlayoffScheduleRequest,
  ): Promise<CollegeGame[]> => {
    return await PostCall<CFBPlayoffScheduleRequest, CollegeGame[]>(
      `${fbaUrl}admin/cfb/playoffs/fcs/generate`,
      dto,
    );
  },
  BBAUpdateTimestamp: async (dto: GamesTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${bbaUrl}admin/timestamp/update`, dto);
  },
  HCKUpdateTimestamp: async (dto: GamesTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${hckUrl}admin/timestamp/update`, dto);
  },
  SaveCBBConferenceTournamentMatch: async (
    dto: CBBTournamentMatchDTO,
  ): Promise<Match> => {
    return await PostCall<CBBTournamentMatchDTO, Match>(
      `${bbaUrl}admin/cbb/tournament/match/save`,
      dto,
    );
  },
  GenerateCBBConferenceTournament: async (
    dto: CBBTournamentScheduleRequest,
  ): Promise<Match[]> => {
    return await PostCall<CBBTournamentScheduleRequest, Match[]>(
      `${bbaUrl}admin/cbb/tournament/conference/generate`,
      dto,
    );
  },
  DeleteCBBPostseasonMatch: async (gameID: number): Promise<void> => {
    await PostCall<Record<string, never>, { deleted: boolean }>(
      `${bbaUrl}admin/cbb/match/delete/${gameID}`,
      {},
    );
  },
  GenerateCBBPostseasonSchedule: async (
    dto: CBBNCAATournamentRequest,
  ): Promise<Match[]> => {
    return await PostCall<CBBNCAATournamentRequest, Match[]>(
      `${bbaUrl}admin/cbb/tournament/ncaa/generate`,
      dto,
    );
  },
  GenerateNBAPlayoffSchedule: async (
    dto: NBAPlayoffScheduleRequest,
  ): Promise<NBAMatch[]> => {
    return await PostCall<NBAPlayoffScheduleRequest, NBAMatch[]>(
      `${bbaUrl}admin/nba/playoffs/generate`,
      dto,
    );
  },
  DeleteNBAPostseasonMatch: async (gameID: number): Promise<void> => {
    await PostCall<Record<string, never>, { deleted: boolean }>(
      `${bbaUrl}admin/nba/match/delete/${gameID}`,
      {},
    );
  },
  BBARunNextGames: async (timeslot: string): Promise<any> => {
    try {
      return await PostCall(`${bbaUrl}admin/run/the/games/${timeslot}`, {});
    } catch {
      try {
        return await PostCall(`${bbaUrl}admin/run/the/games/`, {});
      } catch {
        return null;
      }
    }
  },
  HCKRunNextGames: async (timeslot: string): Promise<any> => {
    try {
      return await GetCall(`${hckUrl}admin/test/engine/`);
    } catch {
      return null;
    }
  },
};

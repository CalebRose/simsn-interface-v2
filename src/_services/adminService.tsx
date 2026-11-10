import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall, PostCall, PUTCallNoResponse } from "../_helper/fetchHelper";
import { CollegeGame, Timestamp as FBA_Timestamp } from "../models/footballModels";

export interface FBAUpdateTimestampDTO {
  WeekID: number;
  Week: number;
  SeasonID: number;
  Phase: number;
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

export const AdminService = {
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
};

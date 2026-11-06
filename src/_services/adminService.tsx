import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { PUTCallNoResponse } from "../_helper/fetchHelper";

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

export const AdminService = {
  FBAUpdateTimestamp: async (dto: FBAUpdateTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${fbaUrl}admin/timestamp/update`, dto);
  },
  BBAUpdateTimestamp: async (dto: GamesTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${bbaUrl}admin/timestamp/update`, dto);
  },
  HCKUpdateTimestamp: async (dto: GamesTimestampDTO): Promise<void> => {
    await PUTCallNoResponse(`${hckUrl}admin/timestamp/update`, dto);
  },
};

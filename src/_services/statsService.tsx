import { fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall, GetExportCall } from "../_helper/fetchHelper";
import { SearchStatsResponse as FBASearchStatsResponse } from "../models/footballModels";
import { SearchStatsResponse as HCKSearchStatsResponse } from "../models/hockeyModels";

export const StatsService = {
  HCKCollegeStatsSearch: async (dto: any): Promise<HCKSearchStatsResponse> => {
    return await GetCall(
      `${hckUrl}statistics/interface/chl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  HCKProStatsSearch: async (dto: any): Promise<HCKSearchStatsResponse> => {
    return await GetCall(
      `${hckUrl}statistics/interface/phl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  HCKCollegeStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${hckUrl}export/stats/chl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `chl_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },

  HCKProStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${hckUrl}export/stats/phl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `phl_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },

  FBACollegeStatsSearch: async (dto: any): Promise<FBASearchStatsResponse> => {
    return await GetCall(
      `${fbaUrl}statistics/interface/v2/cfb/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  FBAProStatsSearch: async (dto: any): Promise<FBASearchStatsResponse> => {
    return await GetCall(
      `${fbaUrl}statistics/interface/v2/nfl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  FBACollegeStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${fbaUrl}statistics/export/cfb/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `cfb_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },

  FBAProStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${fbaUrl}statistics/export/nfl/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `nfl_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },

  BBACollegeStatsSearch: async (dto: any): Promise<HCKSearchStatsResponse> => {
    return await GetCall(
      `${hckUrl}statistics/interface/cbb/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  BBAProStatsSearch: async (dto: any): Promise<HCKSearchStatsResponse> => {
    return await GetCall(
      `${hckUrl}statistics/interface/nba/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
    );
  },

  BBACollegeStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${hckUrl}export/stats/cbb/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `cbb_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },

  BBAProStatsExport: async (dto: any): Promise<void> => {
    await GetExportCall(
      `${hckUrl}export/stats/nba/${dto.SeasonID}/${dto.WeekID}/${dto.ViewType}/${dto.GameType}`,
      "blob",
      `nba_season_${dto.SeasonID}_week_${dto.WeekID}_${dto.ViewType}_${dto.GameType}_stats_export`,
    );
  },
};

import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall } from "../_helper/fetchHelper";
import { BootstrapData as BBBootstrap } from "../models/basketballModels";
import { BootstrapData as FBBootstrap } from "../models/footballModels";
import { BootstrapData as HockeyBootstrap } from "../models/hockeyModels";

export const BootstrapService = {
  // ✅ Get Hockey Bootstrap Data
  GetHCKBootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<HockeyBootstrap> => {
    return await GetCall<HockeyBootstrap>(
      `${hckUrl}bootstrap/${collegeID}/${proID}`
    );
  },

  GetHCKBootstrapTeamData: async (): Promise<HockeyBootstrap> => {
    return await GetCall<HockeyBootstrap>(`${hckUrl}bootstrap/teams/`);
  },

  GetFBABootstrapTeamData: async (): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(`${fbaUrl}bootstrap/teams`);
  },

  // ✅ Get Football Bootstrap Data
  GetFBALandingBootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/landing/${collegeID}/${proID}`
    );
  },

  GetFBARosterBootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/roster/${collegeID}/${proID}`
    );
  },

  GetFBARecruitingBootstrapData: async (
    collegeID: number,
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/recruiting/${collegeID}`
    );
  },

  GetFBAFreeAgencyBootstrapData: async (
    proID: number,
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/freeagency/${proID}`
    );
  },

  GetFBASchedulingBootstrapData: async (
    username: string,
    collegeID: number,
    proID: number,
    seasonID: number
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/roster/${username}/${collegeID}/${proID}/${seasonID}`
    );
  },

  GetFBADraftBootstrapData: async (
    proID: number,
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/draft/${proID}`
    );
  },

  GetFBAPortalBootstrapData: async (
    collegeID: number,
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/portal/${collegeID}`
    );
  },

  GetFBAGameplanBootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/gameplan/${collegeID}/${proID}`
    );
  },

  GetFBANewsBootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<FBBootstrap> => {
    return await GetCall<FBBootstrap>(
      `${fbaUrl}bootstrap/news/${collegeID}/${proID}`
    );
  },

  GetBBABootstrapTeamData: async (): Promise<BBBootstrap> => {
    return await GetCall<BBBootstrap>(`${bbaUrl}bootstrap/teams/`);
  },

  // ✅ Get Basketball Bootstrap Data
  GetBBABootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<BBBootstrap> => {
    return await GetCall<BBBootstrap>(
      `${bbaUrl}bootstrap/one/${collegeID}/${proID}`
    );
  },

  // ✅ Get Basketball Bootstrap Data
  GetSecondBBABootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<BBBootstrap> => {
    return await GetCall<BBBootstrap>(
      `${bbaUrl}bootstrap/two/${collegeID}/${proID}`
    );
  },

  // ✅ Get Basketball Bootstrap Data
  GetThirdBBABootstrapData: async (
    collegeID: number,
    proID: number
  ): Promise<BBBootstrap> => {
    return await GetCall<BBBootstrap>(
      `${bbaUrl}bootstrap/three/${collegeID}/${proID}`
    );
  },
};

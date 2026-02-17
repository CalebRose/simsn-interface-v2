import { fbaUrl, bbaUrl, hckUrl } from "../_constants/urls";
import {
  GetActionCall,
  GetExportCall,
  PostCall,
  PostCallNoResponse,
  PUTCall,
} from "../_helper/fetchHelper";
import {
  PlayerRecruitProfile as BBAPlayerRecruitProfile,
  UpdateRecruitingBoardDto as BBAUpdateRecruitingBoardDto,
  TeamRecruitingProfile,
} from "../models/basketballModels";
import {
  RecruitPlayerProfile as HCKRecruitPlayerProfile,
  UpdateRecruitingBoardDTO as HCKUpdateRecruitingBoardDTO,
  UpdateRecruitProfileDto as HCKUpdateRecruitProfileDto,
  TransferPortalProfile,
} from "../models/hockeyModels";
import {
  RecruitPlayerProfile as FBARecruitPlayerProfile,
  UpdateRecruitingBoardDTO as FBAUpdateRecruitingBoardDTO,
} from "../models/footballModels";

export const RecruitService = {
  HCKCreateRecruitProfile: async (
    dto: any,
  ): Promise<HCKRecruitPlayerProfile> => {
    return await PostCall(`${hckUrl}recruiting/add/recruit/`, dto);
  },

  HCKRemoveCrootFromBoard: async (
    dto: any,
  ): Promise<HCKUpdateRecruitProfileDto> => {
    return await PostCall(`${hckUrl}recruiting/remove/recruit/`, dto);
  },

  HCKToggleScholarship: async (dto: any): Promise<HCKRecruitPlayerProfile> => {
    return await PostCall(`${hckUrl}recruiting/toggle/scholarship/`, dto);
  },

  HCKScoutRecruitingAttribute: async (
    dto: any,
  ): Promise<HCKRecruitPlayerProfile> => {
    return await PostCall(`${hckUrl}recruiting/scout/attribute/`, dto);
  },

  HCKSaveRecruitingBoard: async (
    dto: any,
  ): Promise<HCKUpdateRecruitingBoardDTO> => {
    return await PostCall(`${hckUrl}recruiting/save/board/`, dto);
  },

  HCKSaveAISettings: async (dto: any): Promise<HCKUpdateRecruitingBoardDTO> => {
    return await PostCall(`${hckUrl}recruiting/save/ai/`, dto);
  },

  BBACreateRecruitProfile: async (
    dto: any,
  ): Promise<BBAPlayerRecruitProfile> => {
    return await PostCall(`${bbaUrl}recruiting/add/recruit/`, dto);
  },

  BBARemoveCrootFromBoard: async (
    dto: any,
  ): Promise<BBAPlayerRecruitProfile> => {
    return await PostCall(`${bbaUrl}recruit/remove/recruit/v2`, dto);
  },

  BBAToggleScholarship: async (dto: any): Promise<BBAPlayerRecruitProfile> => {
    return await PostCall(`${bbaUrl}recruit/toggle/Scholarship/v2`, dto);
  },

  BBASaveRecruitingBoard: async (dto: any): Promise<void> => {
    await PostCallNoResponse(`${bbaUrl}recruit/saveRecruitingBoard`, dto);
  },

  BBAToggleAISetting: async (teamID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}recruit/save/ai/toggle/${teamID}`);
  },

  BBASaveAISettings: async (dto: any): Promise<TeamRecruitingProfile> => {
    return await PostCall(`${bbaUrl}recruit/save/ai/settings`, dto);
  },

  ExportCHLRecruits: async () => {
    await GetExportCall(
      `${hckUrl}export/college/recruits/all`,
      "blob",
      "chl_recruits_export",
    );
  },

  FBACreateRecruitProfile: async (
    dto: any,
  ): Promise<FBARecruitPlayerProfile> => {
    return await PostCall(`${fbaUrl}recruiting/addrecruit/`, dto);
  },

  FBAToggleScholarship: async (dto: any): Promise<FBARecruitPlayerProfile> => {
    return await PostCall(`${fbaUrl}recruiting/toggleScholarship/`, dto);
  },

  FBARemovePlayerFromBoard: async (
    dto: any,
  ): Promise<FBARecruitPlayerProfile> => {
    return await PUTCall(`${fbaUrl}recruiting/removecrootfromboard/`, dto);
  },

  FBASaveRecruitingBoard: async (
    dto: any,
  ): Promise<FBAUpdateRecruitingBoardDTO> => {
    return await PostCall(`${fbaUrl}recruiting/savecrootboard/`, dto);
  },

  FBAToggleAIBehavior: async (
    dto: any,
  ): Promise<FBAUpdateRecruitingBoardDTO> => {
    return await PostCall(`${fbaUrl}recruiting/save/ai/`, dto);
  },

  ExportCFBCroots: async () => {
    await GetExportCall(`${fbaUrl}recruits/export/all/`, "blob");
  },

  ExportCBBCroots: async () => {
    await GetExportCall(`${bbaUrl}croots/export/all/`, "blob");
  },
};

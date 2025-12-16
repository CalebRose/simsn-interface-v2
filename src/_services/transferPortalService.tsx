import { bbaUrl, hckUrl } from "../_constants/urls";
import {
  GetActionCall,
  GetCall,
  GetExportCall,
  PostCall,
} from "../_helper/fetchHelper";
import { CollegePromise, TransferPortalProfile } from "../models/hockeyModels";

export const TransferPortalService = {
  HCKCreateTransferPortalProfile: async (
    dto: any
  ): Promise<TransferPortalProfile> => {
    return await PostCall(`${hckUrl}portal/profile/create`, dto);
  },

  HCKRemoveProfileFromBoard: async (
    dto: any
  ): Promise<TransferPortalProfile> => {
    return await PostCall(`${hckUrl}portal/profile/remove`, dto);
  },

  HCKSaveTransferPortalBoard: async (dto: any): Promise<void> => {
    await PostCall(`${hckUrl}portal/saveboard`, dto);
  },

  HCKCreatePromise: async (dto: any): Promise<CollegePromise> => {
    return await PostCall(`${hckUrl}portal/promise/create`, dto);
  },

  HCKCancelPromise: async (dto: any): Promise<void> => {
    await GetActionCall(`${hckUrl}portal/promise/cancel/${dto.ID}`);
  },

  ExportHCKPortal: async () => {
    await GetExportCall(`${hckUrl}portal/export/players/`, "blob");
  },

  BBACreateTransferPortalProfile: async (
    dto: any
  ): Promise<TransferPortalProfile> => {
    return await PostCall(`${bbaUrl}portal/profile/create`, dto);
  },

  BBARemoveProfileFromBoard: async (
    dto: any
  ): Promise<TransferPortalProfile> => {
    return await GetCall(`${bbaUrl}portal/profile/remove/${dto.ProfileID}`);
  },

  BBASaveTransferPortalBoard: async (dto: any): Promise<void> => {
    await PostCall(`${bbaUrl}portal/saveboard`, dto);
  },

  BBACreatePromise: async (dto: any): Promise<CollegePromise> => {
    return await PostCall(`${bbaUrl}portal/promise/create`, dto);
  },

  BBACancelPromise: async (dto: any): Promise<void> => {
    await GetActionCall(`${bbaUrl}portal/promise/cancel/${dto.ID}`);
  },

  ExportBBAPortal: async () => {
    await GetExportCall(`${bbaUrl}portal/export/players/`, "blob");
  },
};

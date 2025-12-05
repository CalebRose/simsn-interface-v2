import { hckUrl } from "../_constants/urls";
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
};

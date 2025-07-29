import { fbaUrl, bbaUrl, hckUrl } from "../_constants/urls";
import { GetCall, PostCall, GetActionCall } from "../_helper/fetchHelper";

export const DraftService = {
  CreateNFLScoutingProfile: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/create/scoutprofile`, dto);
  },

  RevealNFLAttribute: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/reveal/attribute`, dto);
  },

  RemoveNFLPlayerFromBoard: async (id: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}nfl/draft/remove/${id}`);
  },

  DraftNFLPlayer: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/player/`, dto);
  },

  ExportNFLPlayers: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/export/picks`, dto);
  },

  GetDraftPageData: async (TeamID: any):Promise<any> => {
    return await GetCall(`${fbaUrl}nfl/draft/page/${TeamID}`);
  },
};
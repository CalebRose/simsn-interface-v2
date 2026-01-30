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

  GetPHLDraftPageData: async (teamID: number): Promise<any> => {
    return await GetCall(`${hckUrl}phl/draft/page/${teamID}`);
  },

  CreatePHLScoutingProfile: async (dto: any): Promise<any> => {
    return await PostCall(`${hckUrl}phl/draft/create/scoutprofile`, dto);
  },

  RevealPHLAttribute: async (dto: any): Promise<any> => {
    return await PostCall(`${hckUrl}phl/draft/reveal/attribute`, dto);
  },

  RemovePHLPlayerFromBoard: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}phl/draft/remove/${id}`);
  },

  GetPHLScoutingData: async (id: number): Promise<any> => {
    return await GetCall(`${hckUrl}phl/draft/scout/${id}`);
  },

  ExportPHLDraftPicks: async (dto: any): Promise<any> => {
    return await PostCall(`${hckUrl}phl/draft/export/picks`, dto);
  },

  BringUpCollegePlayer: async (draftPickID: number): Promise<any> => {
    return await GetCall(`${hckUrl}phl/roster/bringup/college/player/${draftPickID}`);
  },
};
import { fbaUrl, bbaUrl, hckUrl } from "../_constants/urls";
import {
  GetCall,
  PostCall,
  GetActionCall,
  GetExportCall,
  DeleteCall,
} from "../_helper/fetchHelper";

export const DraftService = {
  CreateNFLScoutingProfile: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/create/scoutprofile`, dto);
  },

  RevealNFLAttribute: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/reveal/attribute`, dto);
  },

  RemovePlayerFromBoard: async (id: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}nfl/draft/remove/${id}`);
  },

  DraftNFLPlayer: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/player/`, dto);
  },

  ExportNFLPlayers: async (dto: any): Promise<any> => {
    return await PostCall(`${fbaUrl}nfl/draft/export/picks`, dto);
  },

  ExportNFLDraftees: async (): Promise<any> => {
    return await GetExportCall(
      `${fbaUrl}nfl/draft/draftees/export`,
      "blob",
      "nfl_draftees_export",
    );
  },

  GetDraftPageData: async (TeamID: any): Promise<any> => {
    return await GetCall(`${fbaUrl}nfl/draft/page/${TeamID}`);
  },

  // NEW UDFA ENDPOINTS
  GetUDFABoard: async (teamID: number) => 
    GetCall(`${fbaUrl}nfl/udfa/board/${teamID}`),

  AddPlayerToUDFABoard: async (dto: any) => 
    PostCall(`${fbaUrl}nfl/udfa/board/add`, dto),

  SaveUDFABoard: async (dto: any) => 
    PostCall(`${fbaUrl}nfl/udfa/board/save`, dto),

  RemovePlayerFromUDFABoard: async (profileID: number) => 
    DeleteCall(`${fbaUrl}nfl/udfa/board/remove/${profileID}`),

  ProcessUDFAs: async (isDryRun: boolean) => 
    GetCall(`${fbaUrl}admin/process-udfas?dryRun=${isDryRun}`),

  // HOCKEY / PHL ENDPOINTS
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
};
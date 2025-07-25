import { fbaUrl, bbaUrl, hckUrl } from "../_constants/urls";
import { PostCall, GetCall, PUTCallNoResponse, PostCallNoResponse } from "../_helper/fetchHelper";

export const GameplanService = {
  SaveCHLGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${hckUrl}chl/strategy/update`, dto);
  },

  SavePHLGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${hckUrl}phl/strategy/update`, dto);
  },

  SaveCHLAIGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${hckUrl}chl/gameplan/update`, dto);
  },

  SavePHLAIGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${hckUrl}phl/gameplan/update`, dto);
  },

  SaveCBBGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${bbaUrl}cbb/gameplans/update`, dto);
  },

  SaveNBAGameplan: async (dto: any): Promise<void> => {
    await PostCall(`${bbaUrl}nba/gameplans/update`, dto);
  },

  SaveCFBGameplan: async (dto: any): Promise<void> => {
    await PostCallNoResponse(`${fbaUrl}gameplan/college/updategameplan`, dto);
  },

  SaveNFLGameplan: async (dto: any): Promise<void> => {
    await PostCallNoResponse(`${fbaUrl}gameplan/nfl/updategameplan`, dto);
  },
};

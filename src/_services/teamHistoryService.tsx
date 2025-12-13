import { fbaUrl, hckUrl } from "../_constants/urls.js";
import { GetCall, PostCall } from "../_helper/fetchHelper.js";

export const TeamHistoryService = {
  async GetCFBTeamHistory(): Promise<any> {
    return await GetCall(`${fbaUrl}history/college`);
  },
};

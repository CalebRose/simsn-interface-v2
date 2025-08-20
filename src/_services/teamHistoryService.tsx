import { fbaUrl, hckUrl } from "../_constants/urls.js";
import { GetCall, PostCall } from "../_helper/fetchHelper.js";

export default class FBATeamHistoryService {
  async GetCFBTeamHistory(
  ): Promise<any> {
    return await GetCall(`${fbaUrl}history/college`);
  }
}
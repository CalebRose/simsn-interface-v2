import { hckUrl } from "../_constants/urls";
import { PostCall } from "../_helper/fetchHelper";
import { CollegePollSubmission as HCKPollSubmission } from "../models/hockeyModels";

export const CollegePollService = {
  HCKSubmitPoll: async (dto: any): Promise<HCKPollSubmission> => {
    return await PostCall(`${hckUrl}college/poll/create/`, dto);
  },
};

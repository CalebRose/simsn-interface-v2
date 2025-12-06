import { baseballUrl } from "../_constants/urls";
import { GetCall } from "../_helper/fetchHelper";
import { BaseballOrganization, BaseballTeam } from "../models/baseballModels";

export const BaseballService = {
  //Fetch Orgs
  GetAllOrganizations: async (): Promise<BaseballOrganization[]> => {
    const url = `${baseballUrl}org_report/`;
    return await GetCall<BaseballOrganization[]>(url);
  },
};

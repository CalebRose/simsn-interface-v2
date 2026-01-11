import { baseballUrl } from "../_constants/urls";
import { GetCall } from "../_helper/fetchHelper";
import { BaseballOrganization, BaseballRosters } from "../models/baseballModels";

export const BaseballService = {
    //Fetch Orgs
    GetAllOrganizations: async (): Promise<BaseballOrganization[]> => {
        const url = `${baseballUrl}org_report/`;
        return await GetCall<BaseballOrganization[]>(url);
    },
    GetAllRosters: async (): Promise<BaseballRosters[]> => {
        const url = `${baseballUrl}rosters`;
        return await GetCall<BaseballRosters[]>(url);
    },

};


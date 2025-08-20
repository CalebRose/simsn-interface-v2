import { fbaUrl } from "../_constants/urls";
import { GetCall } from "../_helper/fetchHelper";
import { FaceDataResponse } from "../models/footballModels";

export const FaceDataService = {
    GetFBAFaceData: async (): Promise<{ [key: number]: FaceDataResponse }> => {
        return await GetCall<{ [key: number]: FaceDataResponse }>(`${fbaUrl}faces`)
    }
}
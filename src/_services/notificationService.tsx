import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall } from "../_helper/fetchHelper";

export const notificationService = {
  ToggleSimHCKNotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${hckUrl}notification/toggle/${notificationID}`);
  },
  DeleteSimHCKNotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${hckUrl}notification/delete/${notificationID}`);
  },

  ToggleSimFBANotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${fbaUrl}notification/toggle/${notificationID}`);
  },
  DeleteSimFBANotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${fbaUrl}notification/delete/${notificationID}`);
  },

  ToggleSimBBANotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${bbaUrl}notification/toggle/${notificationID}`);
  },
  DeleteSimBBANotification: async (notificationID: number): Promise<void> => {
    return await GetCall(`${bbaUrl}notification/delete/${notificationID}`);
  },
};

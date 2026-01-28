import { bbaUrl, hckUrl } from "../_constants/urls";
import { fbaUrl } from "../_constants/urls";
import { GetActionCall, PostCall } from "../_helper/fetchHelper";

export const PlayerService = {
  // Cut CHL Player
  CutCHLPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${hckUrl}chl/roster/cut/${playerID}`);
  },

  RedshirtCHLPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${hckUrl}chl/roster/redshirt/${playerID}`);
  },

  PromiseCHLPlayer: async (playerID: number): Promise<void> => {
    await PostCall(`${hckUrl}chl/roster/promise/${playerID}`, {});
  },

  CutPHLPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${hckUrl}phl/roster/cut/${playerID}`);
  },

  SendPHLPlayerToAffiliate: async (playerID: number): Promise<void> => {
    await GetActionCall(`${hckUrl}phl/roster/affiliate/${playerID}`);
  },

  SendPHLPlayerToTradeBlock: async (playerID: number): Promise<void> => {
    await GetActionCall(`${hckUrl}phl/roster/tradeblock/${playerID}`);
  },

  CutCFBPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}collegeplayers/cut/player/${playerID}/`);
  },

  RedshirtCFBPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}collegeplayers/assign/redshirt/${playerID}/`);
  },

  PromiseCFBPlayer: async (playerID: number): Promise<void> => {
    await PostCall(`${fbaUrl}portal/promise/create/${playerID}/`, {});
  },

  CutNFLPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}nflplayers/cut/player/${playerID}/`);
  },

  SendNFLPlayerToPracticeSquad: async (playerID: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}nflplayers/place/player/squad/${playerID}/`);
  },

  SendNFLPlayerToTradeBlock: async (playerID: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/place/block/${playerID}`);
  },

  CutCBBPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}cbb/players/cut/${playerID}`);
  },

  RedshirtCBBPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}cbb/players/redshirt/${playerID}`);
  },

  PromiseCBBPlayer: async (dto: any): Promise<void> => {
    await PostCall(`${bbaUrl}portal/promise/create/`, dto);
  },

  CutNBAPlayer: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}nba/players/cut/${playerID}`);
  },

  SendNBAPlayerToGLeague: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}nba/players/place/gleague/${playerID}`);
  },

  AssignNBAPlayerAsTwoWay: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}nba/players/place/twoway/${playerID}`);
  },

  SendNBAPlayerToTradeBlock: async (playerID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}trades/nba/place/block/${playerID}`);
  },
  ActivateNBAOption: async (contractID: number): Promise<void> => {
    await GetActionCall(`${bbaUrl}nba/players/activate/option/${contractID}`);
  },
};

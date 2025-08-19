import { fbaUrl, hckUrl, bbaUrl } from "../_constants/urls";
import { GetActionCall, GetCall, PostCall } from "../_helper/fetchHelper";
import { TradePreferences, TradeProposal } from "../models/hockeyModels";
import {
  NFLTradePreferences,
  NFLTradeProposalDTO,
} from "../models/footballModels";
import { NBATradeProposalDTO } from "../models/basketballModels";

export const TradeService = {
  HCKUpdateTradePreferences: async (dto: TradePreferences): Promise<void> => {
    return await PostCall(`${hckUrl}trades/phl/preferences/update`, dto);
  },

  HCKCreateTradeProposal: async (dto: TradeProposal): Promise<void> => {
    return await PostCall(`${hckUrl}trades/phl/create/proposal`, dto);
  },

  HCKAcceptTradeProposal: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/phl/proposal/accept/${id}`);
  },

  HCKRejectTradeProposal: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/phl/proposal/reject/${id}`);
  },

  HCKCancelTradeProposal: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/phl/proposal/cancel/${id}`);
  },

  HCKProcessAcceptedTrade: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/admin/accept/sync/${id}`);
  },

  HCKVetoAcceptedTrade: async (id: number): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/admin/veto/sync/${id}`);
  },

  HCKCleanupRejectedTrades: async (): Promise<void> => {
    await GetActionCall(`${hckUrl}trades/admin/cleanup`);
  },

  FBAGetTradeBlockData: async (teamId: number): Promise<any> => {
    return await GetCall(`${fbaUrl}trades/nfl/block/${teamId}`);
  },

  FBAPlacePlayerOnTradeBlock: async (playerId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/place/block/${playerId}`);
  },

  FBAUpdateTradePreferences: async (
    dto: NFLTradePreferences
  ): Promise<void> => {
    await PostCall(`${fbaUrl}trades/nfl/preferences/update`, dto);
  },

  FBACreateTradeProposal: async (dto: NFLTradeProposalDTO): Promise<void> => {
    await PostCall(`${fbaUrl}trades/nfl/create/proposal`, dto);
  },

  FBAProcessDraftTrade: async (dto: any): Promise<void> => {
    await PostCall(`${fbaUrl}trades/nfl/draft/process`, dto);
  },

  FBAAcceptTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/accept/${proposalId}`);
  },

  FBARejectTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/reject/${proposalId}`);
  },

  FBACancelTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/cancel/${proposalId}`);
  },

  FBAGetAllAcceptedTrades: async (): Promise<any> => {
    return await GetCall(`${fbaUrl}trades/nfl/all/accepted`);
  },

  FBAGetAllRejectedTrades: async (): Promise<any> => {
    return await GetCall(`${fbaUrl}trades/nfl/all/rejected`);
  },

  FBAConfirmAcceptedTrade: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/accept/sync/${proposalId}`);
  },

  FBAVetoAcceptedTrade: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/veto/sync/${proposalId}`);
  },

  FBACleanupRejectedTrades: async (): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/cleanup`);
  },

  FBARegenerateCapsheets: async (): Promise<void> => {
    await GetActionCall(`${fbaUrl}nfl/capsheet/generate`);
  },

  BBACreateTradeProposal: async (dto: NBATradeProposalDTO): Promise<void> => {
    await PostCall(`${fbaUrl}trades/nfl/create/proposal`, dto);
  },

  BBAProcessDraftTrade: async (dto: any): Promise<void> => {
    await PostCall(`${fbaUrl}trades/nfl/draft/process`, dto);
  },

  BBAAcceptTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/accept/${proposalId}`);
  },

  BBARejectTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/reject/${proposalId}`);
  },

  BBACancelTradeProposal: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}trades/nfl/proposal/cancel/${proposalId}`);
  },

  BBAGetAllAcceptedTrades: async (): Promise<any> => {
    return await GetCall(`${fbaUrl}trades/nfl/all/accepted`);
  },

  BBAGetAllRejectedTrades: async (): Promise<any> => {
    return await GetCall(`${fbaUrl}trades/nfl/all/rejected`);
  },

  BBAConfirmAcceptedTrade: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/accept/sync/${proposalId}`);
  },

  BBAVetoAcceptedTrade: async (proposalId: number): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/veto/sync/${proposalId}`);
  },

  BBACleanupRejectedTrades: async (): Promise<void> => {
    await GetActionCall(`${fbaUrl}admin/trades/cleanup`);
  },

  BBARegenerateCapsheets: async (): Promise<void> => {
    await GetActionCall(`${fbaUrl}nfl/capsheet/generate`);
  },
};

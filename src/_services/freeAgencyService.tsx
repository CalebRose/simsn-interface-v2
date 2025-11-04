import { fbaUrl, bbaUrl, hckUrl } from "../_constants/urls";
import { PostCall } from "../_helper/fetchHelper";
import {
  NBAContractOffer,
  NBAContractOfferDTO,
  NBAWaiverOffer,
  NBAWaiverOfferDTO,
} from "../models/basketballModels";
import {
  ExtensionOffer,
  FreeAgencyOffer,
  FreeAgencyOfferDTO,
  WaiverOffer,
  WaiverOfferDTO,
} from "../models/hockeyModels";
import {
  FreeAgencyOffer as NFLFreeAgencyOffer,
  FreeAgencyOfferDTO as NFLFreeAgencyOfferDTO,
  NFLWaiverOffer,
  NFLWaiverOffDTO,
} from "../models/footballModels";

export const FreeAgencyService = {
  HCKSaveFreeAgencyOffer: async (
    dto: FreeAgencyOfferDTO
  ): Promise<FreeAgencyOffer> => {
    return await PostCall(`${hckUrl}phl/freeagency/create/offer`, dto);
  },

  HCKCancelFreeAgencyOffer: async (
    dto: FreeAgencyOfferDTO
  ): Promise<FreeAgencyOffer> => {
    return await PostCall(`${hckUrl}phl/freeagency/cancel/offer`, dto);
  },

  HCKSaveWaiverWireOffer: async (dto: WaiverOfferDTO): Promise<WaiverOffer> => {
    return await PostCall(`${hckUrl}phl/waiverwire/create/offer`, dto);
  },

  HCKCancelWaiverWireOffer: async (
    dto: WaiverOfferDTO
  ): Promise<WaiverOffer> => {
    return await PostCall(`${hckUrl}phl/waiverwire/cancel/offer`, dto);
  },

  HCKSaveExtensionOffer: async (
    dto: ExtensionOffer
  ): Promise<ExtensionOffer> => {
    return await PostCall(`${hckUrl}phl/roster/extend/${dto.PlayerID}`, dto);
  },

  HCKCancelExtensionOffer: async (
    dto: ExtensionOffer
  ): Promise<ExtensionOffer> => {
    return await PostCall(
      `${hckUrl}phl/roster/extend/cancel/${dto.PlayerID}`,
      dto
    );
  },

  BBASaveFreeAgencyOffer: async (
    dto: NBAContractOfferDTO
  ): Promise<NBAContractOffer> => {
    return await PostCall(`${bbaUrl}nba/freeagency/create/offer`, dto);
  },

  BBACancelFreeAgencyOffer: async (
    dto: NBAContractOfferDTO
  ): Promise<NBAContractOffer> => {
    return await PostCall(`${bbaUrl}nba/freeagency/cancel/offer`, dto);
  },

  BBASaveWaiverWireOffer: async (
    dto: NBAWaiverOfferDTO
  ): Promise<NBAWaiverOffer> => {
    return await PostCall(`${bbaUrl}nba/waiverwire/create/offer`, dto);
  },

  BBACancelWaiverWireOffer: async (
    dto: NBAWaiverOfferDTO
  ): Promise<WaiverOffer> => {
    return await PostCall(`${bbaUrl}nba/waiverwire/cancel/offer`, dto);
  },

  FBASaveFreeAgencyOffer: async (
    dto: NFLFreeAgencyOfferDTO
  ): Promise<NFLFreeAgencyOffer> => {
    return await PostCall(`${fbaUrl}nfl/freeagency/create/offer`, dto);
  },

  FBACancelFreeAgencyOffer: async (
    dto: NFLFreeAgencyOfferDTO
  ): Promise<NFLFreeAgencyOffer> => {
    return await PostCall(`${fbaUrl}nfl/freeagency/cancel/offer`, dto);
  },

  FBASaveWaiverWireOffer: async (
    dto: NFLWaiverOffDTO
  ): Promise<NFLWaiverOffer> => {
    return await PostCall(`${fbaUrl}nfl/waiverwire/create/offer`, dto);
  },

  FBACancelWaiverWireOffer: async (
    dto: NFLWaiverOffDTO
  ): Promise<NFLWaiverOffer> => {
    return await PostCall(`${fbaUrl}nfl/waiverwire/cancel/offer`, dto);
  },
};

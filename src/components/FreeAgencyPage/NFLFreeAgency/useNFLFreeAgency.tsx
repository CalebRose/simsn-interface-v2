import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import {
  FreeAgent,
  FreeAgentOffer,
  InfoType,
  ModalAction,
  OfferAction,
  Overview,
  USARegionOptions,
  Waivers,
} from "../../../_constants/constants";
import { NBAPlayer } from "../../../models/basketballModels";
import {
  FreeAgencyOffer,
  NFLCapsheet,
  NFLPlayer,
  NFLWaiverOffer,
} from "../../../models/footballModels";
import { ProfessionalPlayer } from "../../../models/hockeyModels";
import { useFilteredNFLFreeAgents } from "../../../_helper/freeAgencyHelper";
import { usePagination } from "../../../_hooks/usePagination";

export const useNFLFreeAgency = () => {
  const fbStore = useSimFBAStore();
  const {
    capsheetMap,
    proTeamMap,
    nflTeam,
    freeAgentOffers,
    waiverOffers,
    proRosterMap,
    practiceSquadPlayers,
    proPlayerMap,
    freeAgents,
    waiverPlayers,
    getBootstrapFreeAgencyData,
  } = fbStore;

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [freeAgencyCategory, setFreeAgencyCategory] = useState(Overview);
  const [playerType, setPlayerType] = useState<string>(FreeAgent);
  const [modalPlayer, setModalPlayer] = useState<
    ProfessionalPlayer | NFLPlayer | NBAPlayer
  >({} as NFLPlayer);
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);
  const [offerAction, setOfferAction] = useState<OfferAction>(FreeAgentOffer);
  const [country, setCountry] = useState<string>("");
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const pageSize = 100;

  useEffect(() => {
    getBootstrapFreeAgencyData();
  }, []);

  const freeAgentMap = useMemo(() => {
    const dict: Record<number, NFLPlayer> = {};
    if (!freeAgents) {
      return dict;
    }
    for (let i = 0; i < freeAgents.length; i++) {
      dict[freeAgents[i].ID] = freeAgents[i];
    }
    return dict;
  }, [freeAgents]);

  const waiverPlayerMap = useMemo(() => {
    const dict: Record<number, NFLPlayer> = {};
    if (!waiverPlayers) {
      return dict;
    }
    for (let i = 0; i < waiverPlayers.length; i++) {
      dict[waiverPlayers[i].ID] = waiverPlayers[i];
    }
    return dict;
  }, [waiverPlayers]);

  const teamFreeAgentOffers = useMemo(() => {
    if (!nflTeam || !freeAgentOffers) return [];
    return freeAgentOffers.filter((x) => x.TeamID === nflTeam.ID);
  }, [nflTeam, freeAgentOffers]);

  const teamWaiverOffers = useMemo(() => {
    if (!nflTeam || !waiverOffers) return [];
    return waiverOffers.filter((x) => x.TeamID === nflTeam.ID);
  }, [nflTeam, waiverOffers]);

  const freeAgentOfferMapByPlayer = useMemo(() => {
    const dict: Record<number, FreeAgencyOffer[]> = {};
    if (!freeAgentOffers) {
      return dict;
    }
    for (let i = 0; i < freeAgentOffers.length; i++) {
      const offer = freeAgentOffers[i];
      if (dict[offer.NFLPlayerID] && dict[offer.NFLPlayerID].length > 0) {
        dict[offer.NFLPlayerID].push(offer);
      } else {
        dict[offer.NFLPlayerID] = [offer];
      }
    }
    return dict;
  }, [freeAgentOffers]);

  const waiverOfferMapByPlayer = useMemo(() => {
    const dict: Record<number, NFLWaiverOffer[]> = {};
    if (!waiverOffers) {
      return dict;
    }
    for (let i = 0; i < waiverOffers.length; i++) {
      const offer = waiverOffers[i];
      if (dict[offer.PlayerID] && dict[offer.PlayerID].length > 0) {
        dict[offer.PlayerID].push(offer);
      } else {
        dict[offer.PlayerID] = [offer];
      }
    }
    return dict;
  }, [waiverOffers]);

  const teamFreeAgentOfferMap = useMemo(() => {
    const dict: Record<number, FreeAgencyOffer> = {};
    if (!teamFreeAgentOffers) {
      return dict;
    }
    for (let i = 0; i < teamFreeAgentOffers.length; i++) {
      const offer = teamFreeAgentOffers[i];
      dict[offer.NFLPlayerID] = offer;
    }
    return dict;
  }, [teamFreeAgentOffers]);

  const teamWaiverOfferMap = useMemo(() => {
    const dict: Record<number, NFLWaiverOffer> = {};
    if (!teamWaiverOffers) {
      return dict;
    }
    for (let i = 0; i < teamWaiverOffers.length; i++) {
      const offer = teamWaiverOffers[i];
      dict[offer.PlayerID] = offer;
    }
    return dict;
  }, [teamWaiverOffers]);

  const offerMapByPlayerType = useMemo(() => {
    if (playerType === Waivers) {
      return waiverOfferMapByPlayer;
    }
    return freeAgentOfferMapByPlayer;
  }, [freeAgentOfferMapByPlayer, waiverOfferMapByPlayer, playerType]);

  const teamOfferMap = useMemo(() => {
    if (playerType === Waivers) {
      return teamWaiverOfferMap;
    }
    return teamFreeAgentOfferMap;
  }, [teamFreeAgentOfferMap, teamWaiverOfferMap, playerType]);

  const teamCapsheet = useMemo(() => {
    if (nflTeam) {
      return capsheetMap![nflTeam.ID];
    }
    return {} as NFLCapsheet;
  }, [nflTeam, capsheetMap]);

  const adjustedTeamCapsheet = useMemo(() => {
    if (teamFreeAgentOffers.length === 0) {
      return teamCapsheet;
    }
    const adjCapsheet = { ...teamCapsheet } as NFLCapsheet;
    for (let i = 0; i < teamFreeAgentOffers.length; i++) {
      adjCapsheet.Y1Salary += teamFreeAgentOffers[i].ContractValue;
      if (teamFreeAgentOffers[i].ContractLength > 1) {
        adjCapsheet.Y2Salary += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 2) {
        adjCapsheet.Y3Salary += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 3) {
        adjCapsheet.Y4Salary += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 4) {
        adjCapsheet.Y5Salary += teamFreeAgentOffers[i].ContractValue;
      }
    }
    adjCapsheet.UpdatedAt = new Date();
    return adjCapsheet;
  }, [teamCapsheet, teamFreeAgentOffers]);

  const filteredFA = useFilteredNFLFreeAgents({
    freeAgents,
    waiverPlayers,
    practiceSquadPlayers,
    playerType,
    positions,
    archetype,
    regions,
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredFA.length, pageSize);

  const SelectPositionOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setPositions(options);
    setCurrentPage(0);
  };

  const SelectArchetypeOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setArchetype(options);
    setCurrentPage(0);
  };

  const SelectRegionOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setRegions(options);
    setCurrentPage(0);
  };

  const handleFAModal = (
    action: ModalAction,
    player: ProfessionalPlayer | NFLPlayer | NBAPlayer
  ) => {
    setModalPlayer(player);
    setModalAction(action);
    handleOpenModal();
  };

  const offerModal = useModal();

  const handleOfferModal = (
    action: OfferAction,
    player: ProfessionalPlayer | NFLPlayer | NBAPlayer
  ) => {
    setOfferAction(action);
    setModalPlayer(player);
    offerModal.handleOpenModal();
  };

  const handleFreeAgencyCategory = (cat: string) => {
    setFreeAgencyCategory(cat);
  };

  const regionOptions = useMemo(() => {
    return USARegionOptions;
  }, [country]);

  return {
    teamCapsheet,
    adjustedTeamCapsheet,
    modalAction,
    isModalOpen,
    handleCloseModal,
    freeAgencyCategory,
    handleFreeAgencyCategory,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    modalPlayer,
    handleFAModal,
    SelectArchetypeOptions,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    regionOptions,
    filteredFA,
    freeAgentMap,
    waiverPlayerMap,
    teamFreeAgentOffers,
    teamWaiverOffers,
    offerMapByPlayerType,
    teamOfferMap,
    playerType,
    setPlayerType,
    offerAction,
    offerModal,
    handleOfferModal,
  };
};

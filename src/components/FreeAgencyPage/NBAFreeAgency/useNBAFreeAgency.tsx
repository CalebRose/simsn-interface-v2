import React, { useEffect, useMemo, useState } from "react";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import {
  Attributes,
  FreeAgent,
  FreeAgentOffer,
  InfoType,
  ModalAction,
  OfferAction,
  Overview,
  USARegionOptions,
  Waivers,
} from "../../../_constants/constants";
import { useModal } from "../../../_hooks/useModal";
import {
  NBACapsheet,
  NBAContractOffer,
  NBAPlayer,
  NBAWaiverOffer,
} from "../../../models/basketballModels";
import { NFLPlayer } from "../../../models/footballModels";
import { ProfessionalPlayer } from "../../../models/hockeyModels";
import { useFilteredNBAFreeAgents } from "../../../_helper/freeAgencyHelper";
import { usePagination } from "../../../_hooks/usePagination";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";

export const useNBAFreeAgency = () => {
  const {
    capsheetMap,
    nbaTeam,
    freeAgentOffers,
    waiverOffers,
    proRosterMap,
    gLeaguePlayers,
    proPlayerMap,
    freeAgents,
    waiverPlayers,
    getBootstrapFreeAgencyData,
  } = useSimBBAStore();

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [freeAgencyCategory, setFreeAgencyCategory] = useState(Overview);
  const [playerType, setPlayerType] = useState<string>(FreeAgent);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
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
    const dict: Record<number, NBAPlayer> = {};
    if (!freeAgents) {
      return dict;
    }
    for (let i = 0; i < freeAgents.length; i++) {
      dict[freeAgents[i].ID] = freeAgents[i];
    }
    return dict;
  }, [freeAgents]);

  const waiverPlayerMap = useMemo(() => {
    const dict: Record<number, NBAPlayer> = {};
    if (!waiverPlayers) {
      return dict;
    }
    for (let i = 0; i < waiverPlayers.length; i++) {
      dict[waiverPlayers[i].ID] = waiverPlayers[i];
    }
    return dict;
  }, [waiverPlayers]);

  const teamFreeAgentOffers = useMemo(() => {
    if (!nbaTeam || !freeAgentOffers) return [];
    return freeAgentOffers.filter((x) => x.TeamID === nbaTeam.ID);
  }, [nbaTeam, freeAgentOffers]);

  const teamWaiverOffers = useMemo(() => {
    if (!nbaTeam || !waiverOffers) return [];
    return waiverOffers.filter((x) => x.TeamID === nbaTeam.ID);
  }, [nbaTeam, waiverOffers]);

  const freeAgentOfferMapByPlayer = useMemo(() => {
    const dict: Record<number, NBAContractOffer[]> = {};
    if (!freeAgentOffers) {
      return dict;
    }
    for (let i = 0; i < freeAgentOffers.length; i++) {
      const offer = freeAgentOffers[i];
      if (dict[offer.NBAPlayerID] && dict[offer.NBAPlayerID].length > 0) {
        dict[offer.NBAPlayerID].push(offer);
      } else {
        dict[offer.NFLPlayerID] = [offer];
      }
    }
    return dict;
  }, [freeAgentOffers]);

  const waiverOfferMapByPlayer = useMemo(() => {
    const dict: Record<number, NBAWaiverOffer[]> = {};
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
    const dict: Record<number, NBAContractOffer> = {};
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
    const dict: Record<number, NBAWaiverOffer> = {};
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
    if (nbaTeam) {
      return capsheetMap![nbaTeam.ID];
    }
    return {} as NBACapsheet;
  }, [nbaTeam, capsheetMap]);

  const adjustedTeamCapsheet = useMemo(() => {
    if (teamFreeAgentOffers.length === 0) {
      return teamCapsheet;
    }
    const adjCapsheet = { ...teamCapsheet } as NBACapsheet;
    for (let i = 0; i < teamFreeAgentOffers.length; i++) {
      adjCapsheet.Year1Total += teamFreeAgentOffers[i].ContractValue;
      if (teamFreeAgentOffers[i].ContractLength > 1) {
        adjCapsheet.Year2Total += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 2) {
        adjCapsheet.Year3Total += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 3) {
        adjCapsheet.Year4Total += teamFreeAgentOffers[i].ContractValue;
      }
      if (teamFreeAgentOffers[i].ContractLength > 4) {
        adjCapsheet.Year5Total += teamFreeAgentOffers[i].ContractValue;
      }
    }
    adjCapsheet.UpdatedAt = new Date();
    return adjCapsheet;
  }, [teamCapsheet, teamFreeAgentOffers]);

  const filteredFA = useFilteredNBAFreeAgents({
    freeAgents,
    waiverPlayers,
    gLeaguePlayers,
    playerType,
    country,
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

  const SelectCountryOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    setCountry(value);
    setCurrentPage(0);
  };

  const SelectRegionOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setRegions(options);
    setCurrentPage(0);
  };

  const handleFAModal = (
    action: ModalAction,
    player: ProfessionalPlayer | NFLPlayer | NBAPlayer,
  ) => {
    setModalPlayer(player);
    setModalAction(action);
    handleOpenModal();
  };

  const offerModal = useModal();

  const handleOfferModal = (
    action: OfferAction,
    player: ProfessionalPlayer | NFLPlayer | NBAPlayer,
  ) => {
    setOfferAction(action);
    setModalPlayer(player);
    offerModal.handleOpenModal();
  };

  const handleFreeAgencyCategory = (cat: string) => {
    setFreeAgencyCategory(cat);
    if (cat === Overview) {
      setTableViewType(Attributes);
    }
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
    SelectCountryOption,
    tableViewType,
    setTableViewType,
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

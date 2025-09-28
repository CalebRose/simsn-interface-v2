import { useMemo, useState } from "react";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  Attributes,
  Canada,
  CanadaRegionOptions,
  InfoType,
  ModalAction,
  Overview,
  Potentials,
  RecruitingCategory,
  Russia,
  RussiaRegionOptions,
  Sweden,
  SwedenRegionOptions,
  USA,
  USARegionOptions,
} from "../../../_constants/constants";
import { CollegePlayer as HockeyPlayer } from "../../../models/hockeyModels";
import { useFilteredHockeyTransferPlayers } from "../../../_helper/transferPortalHelper";
import { usePagination } from "../../../_hooks/usePagination";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useModal } from "../../../_hooks/useModal";
import { CollegePlayer as FootballPlayer } from "../../../models/footballModels";
import { CollegePlayer as BasketballPlayer } from "../../../models/basketballModels";

export const useHCKTransferPortal = () => {
  const hkStore = useSimHCKStore();
  const {
    portalPlayers,
    teamProfileMap,
    chlTeam,
    transferPortalProfiles,
    chlTeams,
    chlTeamMap,
    hck_Timestamp,
  } = hkStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const [recruitingCategory, setRecruitingCategory] =
    useState<RecruitingCategory>(Overview);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
  const [country, setCountry] = useState<string>("");
  const [stars, setStars] = useState<number[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [attribute, setAttribute] = useState<string>("");
  const [modalPlayer, setModalPlayer] = useState<
    HockeyPlayer | FootballPlayer | BasketballPlayer
  >({} as HockeyPlayer);
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);

  const recruitingLocked = useMemo(() => {
    if (hck_Timestamp) {
      return hck_Timestamp.IsRecruitingLocked;
    }
    return false;
  }, [hck_Timestamp]);

  const transferOnBoardMap = useMemo(() => {
    const boardMap: Record<number, boolean> = {};
    transferPortalProfiles.forEach((profile) => {
      boardMap[profile.CollegePlayerID] = true;
    });
    return boardMap;
  }, [transferPortalProfiles]);

  const regionOptions = useMemo(() => {
    if (country === USA) {
      return USARegionOptions;
    }
    if (country === Canada) {
      return CanadaRegionOptions;
    }
    if (country === Sweden) {
      return SwedenRegionOptions;
    }
    if (country === Russia) {
      return RussiaRegionOptions;
    }
    return [];
  }, [country]);

  const teamProfile = useMemo(() => {
    if (chlTeam && teamProfileMap) {
      return teamProfileMap[Number(chlTeam.ID)];
    }
    return null;
  }, [chlTeam, teamProfileMap]);

  const transferMap = useMemo(() => {
    const tpMap: any = {};
    for (let i = 0; i < portalPlayers.length; i++) {
      tpMap[portalPlayers[i].ID] = portalPlayers[i];
    }
    return tpMap;
  }, [portalPlayers]);

  const filteredPlayers = useFilteredHockeyTransferPlayers({
    portalPlayers,
    country,
    positions,
    archetype,
    regions,
    stars,
  });

  const pageSize = 100;

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredPlayers.length, pageSize);

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

  const SelectStarOptions = (opts: any) => {
    const options = [...opts.map((x: any) => Number(x.value))];
    setStars(options);
    setCurrentPage(0);
  };

  const SelectCountryOption = (opts: SingleValue<SelectOption>) => {
    const value = opts?.value;
    if (value) {
      setCountry(value);
      setCurrentPage(0);
    }
  };

  const SelectRegionOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setRegions(options);
    setCurrentPage(0);
  };

  const openModal = (
    action: ModalAction,
    player: HockeyPlayer | FootballPlayer | BasketballPlayer
  ) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  const updateRecruitingCategory = (category: RecruitingCategory) => {
    setRecruitingCategory(category);
    if (category === Overview && tableViewType === Potentials) {
      setTableViewType(Attributes);
    }
  };

  return {
    teamProfile,
    recruitingCategory,
    transferMap,
    transferOnBoardMap,
    updateRecruitingCategory,
    recruitingLocked,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    openModal,
    modalAction,
    modalPlayer,
    regionOptions,
    SelectArchetypeOptions,
    SelectCountryOption,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    SelectStarOptions,
    tableViewType,
    setTableViewType,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    filteredPlayers,
    attribute,
    setAttribute,
  };
};

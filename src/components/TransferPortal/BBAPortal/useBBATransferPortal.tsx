import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import {
  Attributes,
  InfoType,
  ModalAction,
  Overview,
  Potentials,
  RecruitingCategory,
  USA,
  USARegionOptions,
} from "../../../_constants/constants";
import { CollegePlayer as FootballPlayer } from "../../../models/footballModels";
import { TransferPlayerResponse as BasketballPlayer } from "../../../models/basketballModels";
import { CollegePlayer as HockeyPlayer } from "../../../models/hockeyModels";
import { usePagination } from "../../../_hooks/usePagination";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useFilteredBasketballTransferPlayers } from "../../../_helper/transferPortalHelper";

export const useBBATransferPortal = () => {
  const bbaStore = useSimBBAStore();
  const {
    portalPlayers,
    teamProfileMap,
    cbbTeam,
    transferPortalProfiles,
    cbbTeamOptions,
    cbb_Timestamp,
    getBootstrapPortalData,
  } = bbaStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const promiseModal = useModal();

  const [recruitingCategory, setRecruitingCategory] =
    useState<RecruitingCategory>(Overview);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
  const [country, setCountry] = useState<string>("");
  const [stars, setStars] = useState<number[]>([]);
  const [previousTeams, setPreviousTeamIDs] = useState<number[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [attribute, setAttribute] = useState<string>("");
  const [modalPlayer, setModalPlayer] = useState<
    HockeyPlayer | FootballPlayer | BasketballPlayer
  >({} as HockeyPlayer);
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);

  const recruitingLocked = useMemo(() => {
    if (cbb_Timestamp) {
      return cbb_Timestamp.IsRecruitingLocked;
    }
    return false;
  }, [cbb_Timestamp]);
  const teamTransferPortalProfiles = useMemo(() => {
    if (cbbTeam && transferPortalProfiles) {
      return transferPortalProfiles.filter(
        (profile) => profile.ProfileID === cbbTeam.ID
      );
    }
    return [];
  }, [cbbTeam, transferPortalProfiles]);
  const currentSpentPoints = useMemo(() => {
    if (
      !teamTransferPortalProfiles ||
      teamTransferPortalProfiles.length === 0
    ) {
      return 0;
    }
    return teamTransferPortalProfiles.reduce(
      (acc, profile) => acc + profile.CurrentWeeksPoints,
      0
    );
  }, [teamTransferPortalProfiles]);

  const transferOnBoardMap = useMemo(() => {
    const boardMap: Record<number, boolean> = {};
    teamTransferPortalProfiles.forEach((profile) => {
      boardMap[profile.CollegePlayerID] = true;
    });
    return boardMap;
  }, [teamTransferPortalProfiles]);

  const regionOptions = useMemo(() => {
    if (country === USA) {
      return USARegionOptions;
    }
    return [];
  }, [country]);

  const teamProfile = useMemo(() => {
    if (cbbTeam && teamProfileMap) {
      return teamProfileMap[Number(cbbTeam.ID)];
    }
    return null;
  }, [cbbTeam, teamProfileMap]);

  const transferMap = useMemo(() => {
    const tpMap: any = {};
    for (let i = 0; i < portalPlayers.length; i++) {
      tpMap[portalPlayers[i].ID] = portalPlayers[i];
    }
    return tpMap;
  }, [portalPlayers]);

  const filteredPlayers = useFilteredBasketballTransferPlayers({
    portalPlayers,
    country,
    positions,
    archetype,
    regions,
    stars,
    previousTeams,
  });

  useEffect(() => {
    getBootstrapPortalData();
  }, []);

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

  const SelectPrevTeamOptions = (opts: any) => {
    const options = [...opts.map((x: any) => Number(x.value))];
    setPreviousTeamIDs(options);
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

  const openPromiseModal = (
    player: HockeyPlayer | FootballPlayer | BasketballPlayer
  ) => {
    promiseModal.handleOpenModal();
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
    promiseModal,
    openPromiseModal,
    currentSpentPoints,
    cbbTeamOptions,
    SelectPrevTeamOptions,
  };
};

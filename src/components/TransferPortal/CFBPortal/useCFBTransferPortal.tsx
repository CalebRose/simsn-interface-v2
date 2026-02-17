import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { useSimFBAStore } from "../../../context/SimFBAContext";
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
import {
  CollegePlayer as FootballPlayer,
  RecruitingTeamProfile,
} from "../../../models/footballModels";
import { TransferPlayerResponse as BasketballPlayer } from "../../../models/basketballModels";
import { CollegePlayer as HockeyPlayer } from "../../../models/hockeyModels";
import { usePagination } from "../../../_hooks/usePagination";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useFilteredFootballTransferPlayers } from "../../../_helper/transferPortalHelper";
export const useCFBTransferPortal = () => {
  const {
    portalPlayers,
    teamProfileMap,
    cfbTeam,
    transferPortalProfiles,
    teamTransferPortalProfiles,
    cfbTeamOptions,
    cfb_Timestamp,
    portalPlayerMap,
    getBootstrapPortalData,
  } = useSimFBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const promiseModal = useModal();

  const [recruitingCategory, setRecruitingCategory] =
    useState<RecruitingCategory>(Overview);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
  const [country, setCountry] = useState<string>("");
  const [stars, setStars] = useState<number[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [previousTeams, setPreviousTeamIDs] = useState<number[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [attribute, setAttribute] = useState<string>("");
  const [modalPlayer, setModalPlayer] = useState<
    HockeyPlayer | FootballPlayer | BasketballPlayer
  >({} as HockeyPlayer);
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);

  useEffect(() => {
    getBootstrapPortalData();
  }, []);

  const isPortalOpen = useMemo(() => {
    if (cfb_Timestamp) {
      return cfb_Timestamp.TransferPortalPhase === 3;
    }
    return false;
  }, [cfb_Timestamp]);

  const recruitingLocked = useMemo(() => {
    if (cfb_Timestamp) {
      return cfb_Timestamp.IsRecruitingLocked;
    }
    return false;
  }, [cfb_Timestamp]);

  const currentSpentPoints = useMemo(() => {
    if (
      !teamTransferPortalProfiles ||
      teamTransferPortalProfiles.length === 0
    ) {
      return 0;
    }
    return teamTransferPortalProfiles.reduce(
      (acc, profile) => acc + profile.CurrentWeeksPoints,
      0,
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
    if (cfbTeam && teamProfileMap) {
      return teamProfileMap[Number(cfbTeam.ID)];
    }
    return new RecruitingTeamProfile();
  }, [cfbTeam, teamProfileMap]);

  const filteredPlayers = useFilteredFootballTransferPlayers({
    portalPlayers,
    positions,
    archetype,
    regions,
    stars,
    years,
    previousTeams,
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

  const SelectYearOptions = (opts: any) => {
    const options = [...opts.map((x: any) => Number(x.value))];
    setYears(options);
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
    player: HockeyPlayer | FootballPlayer | BasketballPlayer,
  ) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  const openPromiseModal = (
    player: HockeyPlayer | FootballPlayer | BasketballPlayer,
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
    portalPlayerMap,
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
    SelectYearOptions,
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
    cfbTeamOptions,
    SelectPrevTeamOptions,
    isPortalOpen,
  };
};

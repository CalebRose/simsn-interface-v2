import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import {
  Attributes,
  ModalAction,
  Overview,
  RecruitInfoType,
  RecruitingCategory,
  USARegionOptions,
} from "../../../_constants/constants";
import {
  Croot as FootballCroot,
  RecruitingTeamProfile,
} from "../../../models/footballModels";
import { Croot as BasketballCroot } from "../../../models/basketballModels";
import { Croot as HockeyCroot } from "../../../models/hockeyModels";
import { useFilteredFootballRecruits } from "../../../_helper/recruitingHelper";
import { usePagination } from "../../../_hooks/usePagination";
export const useCFBRecruiting = () => {
  const fbStore = useSimFBAStore();
  const {
    recruits,
    teamProfileMap,
    cfbTeam,
    cfbTeams,
    cfbTeamMap,
    recruitProfiles,
    cfb_Timestamp,
    getBootstrapRecruitingData,
  } = fbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [recruitingCategory, setRecruitingCategory] =
    useState<RecruitingCategory>(Overview);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
  const [country, setCountry] = useState<string>("");
  const [stars, setStars] = useState<number[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [selectedClassView, setSelectedClassView] = useState<number>(
    cfbTeam!.ID
  );
  const [conferences, setConferences] = useState<any[]>([]);
  const [attribute, setAttribute] = useState<string>("");
  const [modalPlayer, setModalPlayer] = useState<
    HockeyCroot | FootballCroot | BasketballCroot
  >({} as FootballCroot);
  const [modalAction, setModalAction] = useState<ModalAction>(RecruitInfoType);

  useEffect(() => {
    getBootstrapRecruitingData();
  }, []);

  const recruitingLocked = useMemo(() => {
    if (cfb_Timestamp) {
      return cfb_Timestamp.IsRecruitingLocked;
    }
    return false;
  }, [cfb_Timestamp]);

  const recruitOnBoardMap = useMemo(() => {
    const boardMap: Record<number, boolean> = {};
    recruitProfiles.forEach((profile) => {
      boardMap[profile.RecruitID] = true;
    });
    return boardMap;
  }, [recruitProfiles]);

  const sortedCrootProfiles = useMemo(() => {
    return recruitProfiles.sort((a, b) => {
      const aVal = a.IsSigned || a.IsLocked ? 1 : 0;
      const bVal = b.IsSigned || b.IsLocked ? 1 : 0;
      return aVal - bVal;
    });
  }, [recruitProfiles]);

  const regionOptions = useMemo(() => {
    return USARegionOptions;
  }, [country]);

  const teamProfile = useMemo(() => {
    if (cfbTeam && teamProfileMap) {
      return teamProfileMap[Number(cfbTeam.ID)];
    }
    return null;
  }, [cfbTeam, teamProfileMap]);

  const recruitMap = useMemo(() => {
    const rMap: any = {};
    for (let i = 0; i < recruits.length; i++) {
      rMap[recruits[i].ID] = recruits[i];
    }
    return rMap;
  }, [recruits]);

  const filteredRecruits = useFilteredFootballRecruits({
    recruits,
    positions,
    archetype,
    regions,
    statuses,
    stars,
  });

  const filteredClass = useMemo(() => {
    return recruits.filter((croot) => croot.TeamID === selectedClassView);
  }, [recruits, selectedClassView]);

  const pageSize = 100;

  const teamRankList = useMemo(() => {
    const teamsList = [...cfbTeams];
    let profileList: RecruitingTeamProfile[] = [];
    teamsList.forEach((team) => {
      profileList.push(teamProfileMap![team.ID]);
    });
    return profileList
      .sort((a, b) => b.CompositeScore - a.CompositeScore)
      .filter((team) => {
        if (conferences.length === 0 && selectedTeams.length === 0) {
          return true;
        }
        if (
          conferences.length > 0 &&
          conferences.includes(cfbTeamMap![team.ID].ConferenceID)
        ) {
          return true;
        }
        if (
          selectedTeams.length > 0 &&
          selectedTeams.includes(cfbTeamMap![team.ID].ID)
        ) {
          return true;
        }
        return false;
      });
  }, [conferences, selectedTeams, cfbTeams, cfbTeamMap, teamProfileMap]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredRecruits.length, pageSize);

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

  const SelectRegionOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setRegions(options);
    setCurrentPage(0);
  };

  const SelectStatusOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setStatuses(options);
    setCurrentPage(0);
  };

  const SelectConferences = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setConferences(() => opts);
  };

  const SelectTeams = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedTeams(() => opts);
  };

  const SelectClass = (options: any) => {
    const opts = Number(options.value);
    setSelectedClassView(() => opts);
  };

  const openModal = (
    action: ModalAction,
    player: HockeyCroot | FootballCroot | BasketballCroot
  ) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  return {
    teamProfile,
    recruitMap,
    recruitingCategory,
    setRecruitingCategory,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    openModal,
    modalAction,
    modalPlayer,
    regionOptions,
    SelectArchetypeOptions,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    SelectStarOptions,
    SelectStatusOptions,
    tableViewType,
    setTableViewType,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    filteredRecruits,
    recruitOnBoardMap,
    teamRankList,
    SelectConferences,
    SelectTeams,
    attribute,
    setAttribute,
    recruitingLocked,
    sortedCrootProfiles,
    filteredClass,
    SelectClass,
  };
};

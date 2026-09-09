import { useEffect, useMemo, useState, useRef } from "react";
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
import {
  useFilteredCrootProfiles,
  useFilteredFootballRecruits,
  useFilteredFootballRecruitsByTeam,
} from "../../../_helper/recruitingHelper";
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
  const [stars, setStars] = useState<any[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [selectedClassView, setSelectedClassView] = useState<number>(
    cfbTeam!.ID,
  );
  const [conferences, setConferences] = useState<any[]>([]);
  const [attribute, setAttribute] = useState<string>("");
  const [modalPlayer, setModalPlayer] = useState<
    HockeyCroot | FootballCroot | BasketballCroot
  >({} as FootballCroot);
  const [modalAction, setModalAction] = useState<ModalAction>(RecruitInfoType);

  // Default to 1 so the page loads pre-sorted by default
  const [sortVersion, setSortVersion] = useState<number>(1);

  const triggerSort = () => {
    setSortVersion((prev) => prev + 1);
  };

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
    if (!recruitProfiles) return {};
    const boardMap: Record<number, boolean> = {};
    recruitProfiles.forEach((profile) => {
      boardMap[profile.RecruitID] = true;
    });
    return boardMap;
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

  const filteredClass = useFilteredFootballRecruitsByTeam({
    recruits,
    positions,
    archetype,
    selectedClassView,
  });

  // Bypass pre-sorted wrapper so filtering handles raw live profiles cleanly
  const rawFilteredCrootProfiles = useFilteredCrootProfiles({
    recruitProfiles: recruitProfiles || [],
    recruitMap,
    positions,
    archetype,
    regions,
    statuses,
    stars,
  });

  const [filteredCrootProfiles, setFilteredCrootProfiles] = useState<any[]>([]);
  const prevFiltersRef = useRef({ positions, archetype, regions, statuses, stars });
  const prevSortVersionRef = useRef(sortVersion);

  // Dynamic sort: Default sorted on load, frozen while typing, fully re-sorted on click of triggerSort() or list changes
  useEffect(() => {
    if (!rawFilteredCrootProfiles) {
      setFilteredCrootProfiles([]);
      return;
    }

    const filtersChanged =
      JSON.stringify(prevFiltersRef.current.positions) !== JSON.stringify(positions) ||
      JSON.stringify(prevFiltersRef.current.archetype) !== JSON.stringify(archetype) ||
      JSON.stringify(prevFiltersRef.current.regions) !== JSON.stringify(regions) ||
      JSON.stringify(prevFiltersRef.current.statuses) !== JSON.stringify(statuses) ||
      JSON.stringify(prevFiltersRef.current.stars) !== JSON.stringify(stars);

    const sortTriggered = prevSortVersionRef.current !== sortVersion;
    const lengthChanged = rawFilteredCrootProfiles.length !== filteredCrootProfiles.length;

    if (filtersChanged || sortTriggered || lengthChanged || filteredCrootProfiles.length === 0) {
      prevFiltersRef.current = { positions, archetype, regions, statuses, stars };
      prevSortVersionRef.current = sortVersion;

      // Sort directly using current live points values
      const sorted = [...rawFilteredCrootProfiles].sort((a: any, b: any) => {
        const aSigned = a.IsSigned || a.IsLocked ? 1 : 0;
        const bSigned = b.IsSigned || b.IsLocked ? 1 : 0;
        if (aSigned !== bSigned) return aSigned - bSigned;

        const aPoints = a.CurrentWeeksPoints ?? 0;
        const bPoints = b.CurrentWeeksPoints ?? 0;
        if (aPoints !== bPoints) {
          return bPoints - aPoints;
        }
        return 0;
      });
      setFilteredCrootProfiles(sorted);
    } else {
      // While typing numbers, update values in-place so rows stay completely still, filtering out any removed profiles
      setFilteredCrootProfiles((prevList) => {
        const rawMap = new Map(
          rawFilteredCrootProfiles.map((item: any) => [item.ID || item.RecruitID, item])
        );
        return prevList
          .filter((item) => rawMap.has(item.ID || item.RecruitID))
          .map((item) => {
            const id = item.ID || item.RecruitID;
            return rawMap.get(id);
          });
      });
    }
  }, [rawFilteredCrootProfiles, sortVersion, positions, archetype, regions, statuses, stars]);

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
    setPositions([]);
    setArchetype([]);
  };

  const SelectCategory = (category: RecruitingCategory) => {
    setRecruitingCategory(category);
    setPositions([]);
    setArchetype([]);
    setStars([]);
    setRegions([]);
    setStatuses([]);
  };

  const openModal = (
    action: ModalAction,
    player: HockeyCroot | FootballCroot | BasketballCroot,
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
    filteredCrootProfiles,
    filteredClass,
    SelectClass,
    SelectCategory,
    triggerSort,
  };
};
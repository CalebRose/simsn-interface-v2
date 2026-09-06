import { useMemo, useState } from "react";
import {
  GameType,
  InfoType,
  ModalAction,
  PLAYER_VIEW,
  REGULAR_SEASON,
  SEASON_VIEW,
  SimCBB,
  SimNBA,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import { useModal } from "../../../_hooks/useModal";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { NBAPlayer, CollegePlayer } from "../../../models/basketballModels";
import {
  GetBBACollegeStats,
  GetBBAProStats,
  getFBAWeekID,
  GetFilteredNBAConferenceOptions,
  GetFilteredNBATeamOptions,
  MakeBBASeasonsOptionList,
  MakeBBAWeeksOptionList,
  MakeFBASeasonsOptionList,
  useFilteredBasketballStats,
} from "../../../_helper/statsPageHelper";
import { usePagination } from "../../../_hooks/usePagination";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SingleValue } from "react-select";

export const useBasketballStats = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    cbbTeam,
    cbbTeams,
    cbbTeamMap,
    nbaTeam,
    nbaTeams,
    nbaTeamMap,
    cbbTeamOptions,
    cbbConferenceOptions,
    nbaTeamOptions,
    nbaConferenceOptions,
    cbbPlayerGameStatsMap,
    cbbPlayerSeasonStatsMap,
    cbbTeamGameStatsMap,
    cbbTeamSeasonStatsMap,
    nbaPlayerGameStatsMap,
    nbaPlayerSeasonStatsMap,
    nbaTeamGameStatsMap,
    nbaTeamSeasonStatsMap,
    cbb_Timestamp,
    cbbPlayerMap,
    proPlayerMap,
    SearchBasketballStats,
    ExportBasketballStats,
    collegeInjuryReport,
    proInjuryReport,
  } = useSimBBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);
  const [modalPlayer, setModalPlayer] = useState<NBAPlayer | CollegePlayer>(
    {} as NBAPlayer,
  );
  const [statsView, setStatsView] = useState<StatsView>(SEASON_VIEW);
  const [statsType, setStatsType] = useState<StatsType>(PLAYER_VIEW);
  const [basketballStatsType, setBasketballStatsType] =
    useState<string>("Total"); // Total or Average. Only for season view only
  const [gameType, setGameType] = useState<GameType>(REGULAR_SEASON);
  const leagueOptions = useMemo(() => {
    return [
      { label: "All Leagues", value: "1" },
      { label: "NBA", value: "2" },
      { label: "ISL", value: "3" },
    ];
  }, []);
  const [selectedLeagueOption, setSelectedLeagueOption] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(2501);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    cbb_Timestamp?.SeasonID ?? 0,
  );
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<string[]>([]);

  const team = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbTeam;
    }
    return nbaTeam;
  }, [selectedLeague, cbbTeam, nbaTeam]);
  const seasonOptions = useMemo(() => {
    if (!cbb_Timestamp) {
      return [{ label: "2022", value: "2" }];
    }
    return MakeBBASeasonsOptionList(cbb_Timestamp);
  }, [cbb_Timestamp]);

  const weekOptions = useMemo(() => {
    return MakeBBAWeeksOptionList(selectedSeason);
  }, [selectedSeason]);

  const playerMap = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbPlayerMap;
    } else if (selectedLeague === SimNBA) {
      return proPlayerMap;
    }
    return [];
  }, [selectedLeague, cbbPlayerMap, proPlayerMap]);

  const teamMap = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbTeamMap!!;
    }
    return nbaTeamMap!!;
  }, [selectedLeague, cbbTeamMap, nbaTeamMap]);

  const selectedStats = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return GetBBACollegeStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        cbbPlayerGameStatsMap,
        cbbPlayerSeasonStatsMap,
        cbbTeamGameStatsMap,
        cbbTeamSeasonStatsMap,
      );
    }
    if (selectedLeague === SimNBA) {
      return GetBBAProStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        nbaPlayerGameStatsMap,
        nbaPlayerSeasonStatsMap,
        nbaTeamGameStatsMap,
        nbaTeamSeasonStatsMap,
      );
    }
    return [];
  }, [
    selectedLeague,
    statsView,
    statsType,
    selectedSeason,
    selectedWeek,
    cbbPlayerGameStatsMap,
    cbbPlayerSeasonStatsMap,
    cbbTeamGameStatsMap,
    cbbTeamSeasonStatsMap,
    nbaPlayerGameStatsMap,
    nbaPlayerSeasonStatsMap,
    nbaTeamGameStatsMap,
    nbaTeamSeasonStatsMap,
  ]);

  const filteredStats = useFilteredBasketballStats({
    selectedStats,
    selectedTeams,
    selectedConferences,
    teamMap,
    playerMap,
    statsType,
    selectedLeague,
    selectedLeagueOption,
  });

  const pageSize = 100;
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredStats.length, pageSize);

  const teamOptions = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbTeamOptions;
    }
    return GetFilteredNBATeamOptions(
      selectedLeagueOption,
      nbaTeamOptions,
      nbaTeamMap!!,
    );
  }, [selectedLeague, selectedLeagueOption, cbbTeamMap]);

  const conferenceOptions = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbConferenceOptions;
    }
    return GetFilteredNBAConferenceOptions(
      selectedLeagueOption,
      nbaConferenceOptions,
      nbaTeams,
    );
  }, [selectedLeague, selectedLeagueOption, cbbConferenceOptions, cbbTeams]);

  const ChangeStatsView = (newView: StatsView) => {
    setStatsView(newView);
    setCurrentPage(0);
  };

  const ChangeStatsType = (newView: StatsType) => {
    setStatsType(newView);
    setCurrentPage(0);
  };
  const ChangeBasketballStatsType = (newType: string) => {
    setBasketballStatsType(newType);
    setCurrentPage(0);
  };

  const ChangeGameType = (newView: GameType) => {
    setGameType(newView);
    setCurrentPage(0);
  };
  const SelectTeamOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setSelectedTeams(options);
    setCurrentPage(0);
  };

  const SelectConferenceOptions = (opts: any) => {
    const options = [...opts.map((x: any) => x.value)];
    setSelectedConferences(options);
    setCurrentPage(0);
  };

  const SelectLeagueOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedLeagueOption(num);
    setCurrentPage(0);
  };

  const SelectSeasonOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    const newWeekID = getFBAWeekID(1, num);
    setSelectedSeason(num);
    setSelectedWeek(newWeekID);
  };

  const SelectWeekOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedWeek(num);
  };

  const handlePlayerModal = (
    action: ModalAction,
    player: CollegePlayer | NBAPlayer,
  ) => {
    setModalPlayer(player);
    setModalAction(action);
    handleOpenModal();
  };

  const Search = async () => {
    const selectedGameType = gameType === REGULAR_SEASON ? "2" : "1";
    const dto = {
      League: selectedLeague,
      ViewType: statsView,
      WeekID: selectedWeek,
      SeasonID: selectedSeason,
      GameType: selectedGameType,
    };

    return await SearchBasketballStats(dto);
  };

  const Export = async () => {
    const selectedGameType = gameType === REGULAR_SEASON ? "2" : "1";
    const dto = {
      League: selectedLeague,
      ViewType: statsView,
      WeekID: selectedWeek,
      SeasonID: selectedSeason,
      GameType: selectedGameType,
    };
    return await ExportBasketballStats(dto);
  };

  const injuryReport = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return collegeInjuryReport;
    }
    return proInjuryReport;
  }, [collegeInjuryReport, proInjuryReport, selectedLeague]);

  return {
    team,
    teamMap,
    modalAction,
    modalPlayer,
    isModalOpen,
    playerMap,
    filteredStats,
    weekOptions,
    seasonOptions,
    teamOptions,
    conferenceOptions,
    totalPages,
    statsType,
    statsView,
    gameType,
    currentPage,
    leagueOptions,
    SelectLeagueOption,
    goToPreviousPage,
    goToNextPage,
    handleCloseModal,
    ChangeStatsType,
    ChangeGameType,
    ChangeStatsView,
    handlePlayerModal,
    SelectConferenceOptions,
    SelectTeamOptions,
    SelectWeekOption,
    SelectSeasonOption,
    Search,
    Export,
    injuryReport,
    basketballStatsType,
    ChangeBasketballStatsType,
  };
};

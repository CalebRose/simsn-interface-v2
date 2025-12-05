import { useMemo, useState } from "react";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  ADay,
  GameDay,
  GameType,
  InfoType,
  ModalAction,
  PLAYER_VIEW,
  REGULAR_SEASON,
  SEASON_VIEW,
  SimCHL,
  SimPHL,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import {
  GetHCKCollegeStats,
  GetHCKProStats,
  getHCKWeekID,
  MakeCHLPlayerMapFromRosterMap,
  MakeHCKSeasonsOptionList,
  MakeHCKWeeksOptionList,
  MakePHLPlayerMapFromRosterMap,
  useFilteredHockeyStats,
} from "../../../_helper/statsPageHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useModal } from "../../../_hooks/useModal";
import {
  CollegePlayer as CHLPlayer,
  CollegeTeamGameStats,
  CollegeTeamSeasonStats,
  ProfessionalPlayer as PHLPlayer,
  ProfessionalTeamGameStats,
  ProfessionalTeamSeasonStats,
} from "../../../models/hockeyModels";
import { usePagination } from "../../../_hooks/usePagination";

export const useHockeyStats = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    chlTeam,
    chlTeamMap,
    phlTeamMap,
    chlTeamOptions,
    chlConferenceOptions,
    chlTeams,
    phlTeam,
    phlTeams,
    phlTeamOptions,
    phlConferenceOptions,
    chlRosterMap,
    proRosterMap,
    chlPlayerGameStatsMap,
    chlPlayerSeasonStatsMap,
    chlTeamGameStatsMap,
    chlTeamSeasonStatsMap,
    phlPlayerGameStatsMap,
    phlPlayerSeasonStatsMap,
    phlTeamGameStatsMap,
    phlTeamSeasonStatsMap,
    hck_Timestamp,
    SearchHockeyStats,
    ExportHockeyStats,
  } = useSimHCKStore();

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);
  const [modalPlayer, setModalPlayer] = useState<PHLPlayer | CHLPlayer>(
    {} as PHLPlayer
  );
  const [statsView, setStatsView] = useState<StatsView>(SEASON_VIEW);
  const [statsType, setStatsType] = useState<StatsType>(PLAYER_VIEW);
  const [gameDay, setGameDay] = useState<GameDay>(ADay);
  const [gameType, setGameType] = useState<GameType>(REGULAR_SEASON);
  const [viewGoalieStats, setViewGoalieStats] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(2501);
  const [selectedSeason, setSelectedSeason] = useState<number>(1); // SEASON ID
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<string[]>([]);

  const team = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return chlTeam;
    }
    return phlTeam;
  }, [selectedLeague, chlTeam, phlTeam]);

  const seasonOptions = useMemo(() => {
    if (!hck_Timestamp) {
      return [{ label: "2025", value: "1" }];
    }
    return MakeHCKSeasonsOptionList(hck_Timestamp);
  }, [hck_Timestamp]);

  const weekOptions = useMemo(() => {
    return MakeHCKWeeksOptionList(selectedSeason);
  }, [selectedSeason]);

  const playerMap = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return MakeCHLPlayerMapFromRosterMap(chlTeams, chlRosterMap);
    } else if (selectedLeague === SimPHL) {
      return MakePHLPlayerMapFromRosterMap(phlTeams, proRosterMap);
    }
    return [];
  }, [selectedLeague, chlTeams, phlTeams, chlRosterMap, proRosterMap]);

  const teamMap = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return chlTeamMap;
    }
    return phlTeamMap;
  }, [selectedLeague, chlTeamMap, phlTeamMap]);

  const ChangeStatsView = (newView: StatsView) => {
    setStatsView(newView);
    setCurrentPage(0);
  };

  const ChangeStatsType = (newView: StatsType) => {
    setStatsType(newView);
    setCurrentPage(0);
  };

  const ChangeGameType = (newView: GameType) => {
    setGameType(newView);
    setCurrentPage(0);
  };

  const SelectSeasonOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    const newWeekID = getHCKWeekID(1, num);
    setSelectedSeason(num);
    setSelectedWeek(newWeekID);
  };

  const SelectWeekOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedWeek(num);
  };

  const selectedStats = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return GetHCKCollegeStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        chlPlayerGameStatsMap,
        chlPlayerSeasonStatsMap,
        chlTeamGameStatsMap,
        chlTeamSeasonStatsMap,
        gameDay
      );
    }
    if (selectedLeague === SimPHL) {
      return GetHCKProStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        phlPlayerGameStatsMap,
        phlPlayerSeasonStatsMap,
        phlTeamGameStatsMap,
        phlTeamSeasonStatsMap,
        gameDay
      );
    }
    return [];
  }, [
    selectedLeague,
    statsView,
    statsType,
    selectedSeason,
    selectedWeek,
    chlPlayerGameStatsMap,
    chlPlayerSeasonStatsMap,
    chlTeamGameStatsMap,
    chlTeamSeasonStatsMap,
    phlPlayerGameStatsMap,
    phlPlayerSeasonStatsMap,
    phlTeamGameStatsMap,
    phlTeamSeasonStatsMap,
    gameDay,
  ]);
  // Make a Hockey Award title Modal. Heisman, but for hockey
  // Fighter award title?

  // Search Logic
  const Search = async () => {
    const selectedGameType = gameType === REGULAR_SEASON ? "2" : "1";
    const dto = {
      League: selectedLeague,
      ViewType: statsView,
      WeekID: selectedWeek,
      SeasonID: selectedSeason,
      GameType: selectedGameType,
    };

    return await SearchHockeyStats(dto);
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
    return await ExportHockeyStats(dto);
  };

  const filteredStats = useFilteredHockeyStats({
    selectedStats,
    selectedTeams,
    selectedConferences,
    teamMap,
    playerMap,
    statsType,
    viewGoalieStats,
  });

  const pageSize = 100;
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredStats.length, pageSize);

  // Filter Options by team & conference
  const teamOptions = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return chlTeamOptions;
    }
    return phlTeamOptions;
  }, [selectedLeague]);

  const conferenceOptions = useMemo(() => {
    if (selectedLeague === SimCHL) {
      return chlConferenceOptions;
    }
    return phlConferenceOptions;
  }, [selectedLeague]);

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

  const ChangeGoalieView = () => {
    setViewGoalieStats((prev) => !prev);
    setCurrentPage(0);
  };

  const ChangeGameDay = (day: GameDay) => {
    setGameDay(day);
    setCurrentPage(0);
  };

  // Return filtered pages, all functions, team & player maps

  const handlePlayerModal = (
    action: ModalAction,
    player: CHLPlayer | PHLPlayer
  ) => {
    setModalPlayer(player);
    setModalAction(action);
    handleOpenModal();
  };

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
    viewGoalieStats,
    gameDay,
    currentPage,
    ChangeGameDay,
    ChangeGoalieView,
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
  };
};

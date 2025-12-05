import { useMemo, useState } from "react";
import {
  FootballStatsType,
  GameDay,
  GameType,
  InfoType,
  ModalAction,
  OVERALL,
  PASSING,
  PLAYER_VIEW,
  REGULAR_SEASON,
  SEASON_VIEW,
  SimCFB,
  SimNFL,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import { useModal } from "../../../_hooks/useModal";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { CollegePlayer, NFLPlayer } from "../../../models/footballModels";
import {
  GetFBACollegeStats,
  GetFBAProStats,
  getFBAWeekID,
  GetFilteredCFBConferenceOptions,
  GetFilteredCFBTeamOptions,
  MakeFBASeasonsOptionList,
  MakeFBAWeeksOptionList,
  useFilteredFootballStats,
} from "../../../_helper/statsPageHelper";
import { usePagination } from "../../../_hooks/usePagination";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";

export const useFootballStats = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    cfbTeam,
    cfbTeams,
    cfbTeamMap,
    nflTeam,
    proTeamMap,
    cfbTeamOptions,
    cfbConferenceOptions,
    nflTeamOptions,
    nflConferenceOptions,
    cfbPlayerGameStatsMap,
    cfbPlayerSeasonStatsMap,
    cfbTeamGameStatsMap,
    cfbTeamSeasonStatsMap,
    nflPlayerGameStatsMap,
    nflPlayerSeasonStatsMap,
    nflTeamGameStatsMap,
    nflTeamSeasonStatsMap,
    cfb_Timestamp,
    cfbPlayerMap,
    nflPlayerMap,
    SearchFootballStats,
    ExportFootballStats,
  } = useSimFBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(InfoType);
  const [modalPlayer, setModalPlayer] = useState<NFLPlayer | CollegePlayer>(
    {} as NFLPlayer
  );
  const [statsView, setStatsView] = useState<StatsView>(SEASON_VIEW);
  const [statsType, setStatsType] = useState<StatsType>(PLAYER_VIEW);
  const [footballStatsType, setFBStatsType] =
    useState<FootballStatsType>(PASSING);
  const [gameType, setGameType] = useState<GameType>(REGULAR_SEASON);
  const leagueOptions = useMemo(() => {
    return [
      { label: "All Leagues", value: "1" },
      { label: "FBS", value: "2" },
      { label: "FCS", value: "3" },
    ];
  }, []);
  const [selectedLeagueOption, setSelectedLeagueOption] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(2501);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    cfb_Timestamp!.CollegeSeasonID
  ); // SEASON ID
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<string[]>([]);

  const team = useMemo(() => {
    if (selectedLeague === SimCFB) {
      return cfbTeam;
    }
    return nflTeam;
  }, [selectedLeague, cfbTeam, nflTeam]);

  const seasonOptions = useMemo(() => {
    if (!cfb_Timestamp) {
      return [{ label: "2025", value: "1" }];
    }
    return MakeFBASeasonsOptionList(cfb_Timestamp);
  }, [cfb_Timestamp]);

  const weekOptions = useMemo(() => {
    return MakeFBAWeeksOptionList(selectedSeason);
  }, [selectedSeason]);

  const playerMap = useMemo(() => {
    if (selectedLeague === SimCFB) {
      return cfbPlayerMap;
    } else if (selectedLeague === SimNFL) {
      return nflPlayerMap;
    }
    return [];
  }, [selectedLeague, cfbPlayerMap, nflPlayerMap]);

  const teamMap = useMemo(() => {
    if (selectedLeague === SimCFB) {
      return cfbTeamMap!!;
    }
    return proTeamMap!!;
  }, [selectedLeague, cfbTeamMap, proTeamMap]);

  const selectedStats = useMemo(() => {
    if (selectedLeague === SimCFB) {
      return GetFBACollegeStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        cfbPlayerGameStatsMap,
        cfbPlayerSeasonStatsMap,
        cfbTeamGameStatsMap,
        cfbTeamSeasonStatsMap
      );
    }
    if (selectedLeague === SimNFL) {
      return GetFBAProStats(
        statsView,
        statsType,
        selectedWeek,
        selectedSeason,
        nflPlayerGameStatsMap,
        nflPlayerSeasonStatsMap,
        nflTeamGameStatsMap,
        nflTeamSeasonStatsMap
      );
    }
    return [];
  }, [
    selectedLeague,
    statsView,
    statsType,
    selectedSeason,
    selectedWeek,
    cfbPlayerGameStatsMap,
    cfbPlayerSeasonStatsMap,
    cfbTeamGameStatsMap,
    cfbTeamSeasonStatsMap,
    nflPlayerGameStatsMap,
    nflPlayerSeasonStatsMap,
    nflTeamGameStatsMap,
    nflTeamSeasonStatsMap,
  ]);

  const filteredStats = useFilteredFootballStats({
    selectedStats,
    selectedTeams,
    selectedConferences,
    teamMap,
    playerMap,
    statsType,
    footballStatsType,
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
    if (selectedLeague === SimCFB) {
      return GetFilteredCFBTeamOptions(
        selectedLeagueOption,
        cfbTeamOptions,
        cfbTeamMap!!
      );
    }
    return nflTeamOptions;
  }, [selectedLeague, selectedLeagueOption, cfbTeamMap]);

  const conferenceOptions = useMemo(() => {
    if (selectedLeague === SimCFB) {
      return GetFilteredCFBConferenceOptions(
        selectedLeagueOption,
        cfbConferenceOptions,
        cfbTeams
      );
    }
    return nflConferenceOptions;
  }, [selectedLeague, selectedLeagueOption, cfbConferenceOptions, cfbTeams]);

  const ChangeStatsView = (newView: StatsView) => {
    setStatsView(newView);
    setCurrentPage(0);
  };

  const ChangeStatsType = (newView: StatsType) => {
    setStatsType(newView);
    if (newView === PLAYER_VIEW) {
      setFBStatsType(PASSING);
    } else {
      setFBStatsType(OVERALL);
    }
    setCurrentPage(0);
  };

  const ChangeFBStatsType = (newView: FootballStatsType) => {
    setFBStatsType(newView);
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
    player: CollegePlayer | NFLPlayer
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

    return await SearchFootballStats(dto);
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
    return await ExportFootballStats(dto);
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
    currentPage,
    footballStatsType,
    leagueOptions,
    SelectLeagueOption,
    goToPreviousPage,
    goToNextPage,
    handleCloseModal,
    ChangeStatsType,
    ChangeFBStatsType,
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

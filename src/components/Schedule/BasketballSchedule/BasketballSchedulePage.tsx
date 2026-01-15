import { FC, useEffect, useMemo, useState } from "react";
import {
  League,
  SimCBB,
  SimNBA,
  Overview,
  TeamGames,
  WeeklyGames,
  Standings,
  FootballSeasons,
  AdminRole,
} from "../../../_constants/constants";
import { useAuthStore } from "../../../context/AuthContext";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { ActionModal } from "../../Common/ActionModal";
import { useResponsive } from "../../../_hooks/useMobile";
import { GetCurrentWeek } from "../../../_helper/teamHelper";
import { NonFBAExportOptions } from "../HockeySchedule/hockeyScheduleHelper";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { darkenColor } from "../../../_utility/getDarkerColor";
import {
  getScheduleCBBData,
  getScheduleNBAData,
  processSchedule,
  processWeeklyGames,
} from "../Common/SchedulePageHelper";
import { useModal } from "../../../_hooks/useModal";
import { getFBAWeekID } from "../../../_helper/statsPageHelper";
import {
  LeagueStandings,
  TeamSchedule,
  TeamStandings,
  WeeklySchedule,
} from "../Common/SchedulePageComponents";
import { SelectDropdown } from "../../../_design/Select";
import { ToggleSwitch } from "../../../_design/Inputs";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { CollegePollModal } from "../Common/CollegePollModal";
import { SubmitPollModal } from "../Common/SubmitPollModal";

interface SchedulePageProps {
  league: League;
  ts: any;
}

export const CBBSchedulePage = ({ league, ts }: SchedulePageProps) => {
  const { currentUser } = useAuthStore();
  const bbStore = useSimBBAStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.Season;
  const {
    cbbTeam,
    cbbTeams,
    cbbTeamMap,
    cbbRosterMap,
    cbbTeamOptions,
    allCBBStandings,
    allCollegeGames: allCBBGames,
    isLoading,
    collegePollSubmission,
    submitCollegePoll,
    ExportBasketballSchedule,
    getBootstrapScheduleData,
  } = bbStore;

  const [selectedTeam, setSelectedTeam] = useState(cbbTeam);
  const [category, setCategory] = useState(Overview);
  const [view, setView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const bbaExportOptions = useMemo(() => NonFBAExportOptions(), []);
  const selectedWeekOption = useMemo(() => {
    let numVal = selectedWeek.toString();
    return {
      label: numVal,
      value: numVal,
    };
  }, [selectedWeek]);

  const selectedSeasonOption = useMemo(() => {
    let numVal = selectedSeason.toString();
    return {
      label: numVal,
      value: numVal,
    };
  }, [selectedSeason]);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );

  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const playerMap = useMemo(() => {
    if (!cbbRosterMap) return {};

    const map: Record<
      number,
      Record<
        number,
        {
          FirstName: string;
          LastName: string;
          Position: string;
          TeamID: number;
          Team: string;
        }
      >
    > = {};

    Object.entries(cbbRosterMap).forEach(([teamId, roster]) => {
      map[Number(teamId)] = roster.reduce((acc, player) => {
        acc[player.ID] = {
          FirstName: player.FirstName,
          LastName: player.LastName,
          Position: player.Position,
          TeamID: player.TeamID,
          Team: player.TeamAbbr,
        };
        return acc;
      }, {} as Record<number, { FirstName: string; LastName: string; Position: string; TeamID: number; Team: string }>);
    });

    return map;
  }, [cbbRosterMap]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cbbTeamMap ? cbbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const { teamStandings, teamSchedule, groupedWeeklyGames } = useMemo(() => {
    return getScheduleCBBData(
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      allCBBStandings,
      allCBBGames,
      cbbTeams
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    allCBBStandings,
    allCBBGames,
    cbbTeams,
  ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(
        teamSchedule,
        selectedTeam,
        ts,
        league,
        resultsOverride
      ).sort((a, b) => {
        if (a.Week !== b.Week) {
          return a.Week < b.Week;
        }
        if (a.GameDay && b.GameDay) {
          return a.GameDay.localeCompare(b.GameDay);
        }
        return true;
      }),
    [teamSchedule, selectedTeam, ts, league, resultsOverride]
  );

  const weeklyGames = useMemo(() => {
    if (!selectedWeek) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeek] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeek, ts, league, resultsOverride]);

  const submitPollModal = useModal();
  const collegePollModal = useModal();

  const handleScheduleExport = async (opts: any) => {
    const dto = {
      SeasonID: selectedSeason - 2020,
      WeekID: getFBAWeekID(selectedWeek, selectedSeason - 2020),
      Timeslot: opts.value,
    };
    await ExportBasketballSchedule(dto);
  };

  useEffect(() => {
    getBootstrapScheduleData();
  }, []);

  return (
    <>
      <CollegePollModal
        league={SimCBB}
        isOpen={collegePollModal.isModalOpen}
        onClose={collegePollModal.handleCloseModal}
        timestamp={ts}
      />
      <SubmitPollModal
        league={SimCBB}
        isOpen={submitPollModal.isModalOpen}
        onClose={submitPollModal.handleCloseModal}
        pollSubmission={collegePollSubmission}
        submitPoll={submitCollegePoll}
        timestamp={ts}
      />
      <div className="flex flex-col w-full">
        <div className="sm:grid sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 sm:gap-4 w-full h-[82vh]">
          <div className="flex flex-col w-full sm:col-span-1 md:col-span-2 lg:col-span-1 items-center gap-4 pb-2">
            <div className="flex gap-4 justify-center items-center sm:w-full">
              <ButtonGroup classes="flex justify-center w-full">
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setCategory(Overview)}
                  isSelected={category === Overview}
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                >
                  <Text variant="small">Overview</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setCategory(Standings)}
                  isSelected={category === Standings}
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                >
                  <Text variant="small">Standings</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[92%] sm:max-w-[350px]"
                  onClick={submitPollModal.handleOpenModal}
                >
                  <Text variant="small">Submit Poll</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[92%] sm:max-w-[350px]"
                  onClick={collegePollModal.handleOpenModal}
                >
                  <Text variant="small">College Poll</Text>
                </Button>
              </ButtonGroup>
            </div>
            <div className="flex flex-col gap-2 sm:gap-4 items-center">
              {category === Overview && (
                <>
                  <div className="flex justify-center items-center gap-2">
                    <ToggleSwitch
                      onChange={(checked) => {
                        setView(checked ? WeeklyGames : TeamGames);
                        setIsChecked(checked);
                      }}
                      checked={isChecked}
                    />
                    <Text variant="small">Weekly Games</Text>
                  </div>
                  {currentUser?.roleID && currentUser.roleID === AdminRole && (
                    <div className="flex justify-center items-center gap-2">
                      <ToggleSwitch
                        onChange={() => {
                          setResultsOverride((res) => !res);
                        }}
                        checked={resultsOverride}
                      />
                      <Text variant="small">Show Results</Text>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-2 justify-around sm:flex-col">
                <div className="flex flex-col items-center gap-2 justify-center">
                  {view === TeamGames ? (
                    <>
                      <Text variant="body">Teams</Text>
                      <SelectDropdown
                        options={cbbTeamOptions}
                        placeholder="Select Team..."
                        onChange={selectTeamOption}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            borderColor: state.isFocused
                              ? "#4A90E2"
                              : "#4A5568",
                            color: "#ffffff",
                            minWidth: isMobile ? "10rem" : "15rem",
                            maxWidth: "100%",
                            padding: "0.3rem",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            flexGrow: 1,
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #4A90E2"
                              : "none",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            borderRadius: "8px",
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            padding: "0",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            color: "#ffffff",
                            padding: "10px",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            cursor: "pointer",
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Text variant="body">Week</Text>
                      <SelectDropdown
                        value={selectedWeekOption}
                        options={Array.from({ length: 22 }, (_, i) => ({
                          label: `${i + 1}`,
                          value: (i + 1).toString(),
                        }))}
                        placeholder="Select Week..."
                        onChange={(selectedOption) => {
                          const selectedWeek = Number(selectedOption?.value);
                          setSelectedWeek(selectedWeek);
                        }}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            borderColor: state.isFocused
                              ? "#4A90E2"
                              : "#4A5568",
                            color: "#ffffff",
                            minWidth: isMobile ? "10rem" : "15rem",
                            maxWidth: "100%",
                            padding: "0.3rem",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            flexGrow: 1,
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #4A90E2"
                              : "none",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            borderRadius: "8px",
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            padding: "0",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            color: "#ffffff",
                            padding: "10px",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            cursor: "pointer",
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Seasons</Text>
                  <SelectDropdown
                    value={selectedSeasonOption}
                    options={FootballSeasons}
                    placeholder="Select Season..."
                    onChange={(selectedOption) => {
                      const selectedSeason = Number(selectedOption?.value);
                      setSelectedSeason(selectedSeason);
                    }}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                        color: "#ffffff",
                        minWidth: isMobile ? "10.5rem" : "15rem",
                        maxWidth: "100%",
                        padding: "0.3rem",
                        flexGrow: 1,
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #4A90E2"
                          : "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        borderRadius: "8px",
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        padding: "0",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        color: "#ffffff",
                        padding: "10px",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        cursor: "pointer",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                    }}
                  />
                </div>
              </div>
              {!isMobile && (
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Export Day of Week</Text>
                  <SelectDropdown
                    options={bbaExportOptions}
                    placeholder="Select Timeslot..."
                    onChange={handleScheduleExport}
                    isDisabled={view === TeamGames}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                        color: "#ffffff",
                        minWidth: isMobile ? "10.5rem" : "15rem",
                        maxWidth: "100%",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        flexGrow: 1,
                        padding: "0.3rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #4A90E2"
                          : "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        borderRadius: "8px",
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        padding: "0",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        color: "#ffffff",
                        padding: "10px",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        cursor: "pointer",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {category === Standings && (
            <div className="flex flex-col h-full col-span-5">
              <LeagueStandings
                currentUser={currentUser}
                league={league}
                standings={allCBBStandings}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
                isLoading={isLoading}
              />
            </div>
          )}
          {category === Overview && (
            <div className="flex flex-col pb-4 sm:pb-0 h-full col-span-2 overflow-auto">
              {view === TeamGames && (
                <TeamSchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbr}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={cbbTeamMap}
                  week={currentWeek}
                  league={league}
                  ts={ts}
                  processedSchedule={processedSchedule}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoading={isLoading}
                />
              )}
              {view === WeeklyGames && (
                <WeeklySchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbr}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={cbbTeamMap}
                  week={selectedWeek}
                  league={league}
                  ts={ts}
                  processedSchedule={weeklyGames}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
          {category === Overview && (
            <div className="flex flex-col h-full col-span-2 md:col-span-3 lg:col-span-2">
              <TeamStandings
                team={selectedTeam}
                currentUser={currentUser}
                league={league}
                standings={teamStandings}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const NBASchedulePage = ({ league, ts }: SchedulePageProps) => {
  const { currentUser } = useAuthStore();
  const bbStore = useSimBBAStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.Season;
  const {
    nbaTeam,
    nbaTeams,
    nbaTeamMap,
    proRosterMap,
    nbaTeamOptions,
    allProStandings: allNBAStandings,
    allProGames: allNBAGames,
    isLoading,
    ExportBasketballSchedule,
  } = bbStore;

  const [selectedTeam, setSelectedTeam] = useState(nbaTeam);
  const [category, setCategory] = useState(Overview);
  const [view, setView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const bbaExportOptions = useMemo(() => NonFBAExportOptions(), []);
  const selectedWeekOption = useMemo(() => {
    let numVal = selectedWeek.toString();
    return {
      label: numVal,
      value: numVal,
    };
  }, [selectedWeek]);

  const selectedSeasonOption = useMemo(() => {
    let numVal = selectedSeason.toString();
    return {
      label: numVal,
      value: numVal,
    };
  }, [selectedSeason]);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );

  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const playerMap = useMemo(() => {
    if (!proRosterMap) return {};

    const map: Record<
      number,
      Record<
        number,
        {
          FirstName: string;
          LastName: string;
          Position: string;
          TeamID: number;
          Team: string;
        }
      >
    > = {};

    Object.entries(proRosterMap).forEach(([teamId, roster]) => {
      map[Number(teamId)] = roster.reduce((acc, player) => {
        acc[player.ID] = {
          FirstName: player.FirstName,
          LastName: player.LastName,
          Position: player.Position,
          TeamID: player.TeamID,
          Team: player.TeamAbbr,
        };
        return acc;
      }, {} as Record<number, { FirstName: string; LastName: string; Position: string; TeamID: number; Team: string }>);
    });

    return map;
  }, [proRosterMap]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = nbaTeamMap ? nbaTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const { teamStandings, teamSchedule, groupedWeeklyGames } = useMemo(() => {
    return getScheduleNBAData(
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      allNBAStandings,
      allNBAGames,
      nbaTeams
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    allNBAStandings,
    allNBAGames,
    nbaTeams,
  ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(
        teamSchedule,
        selectedTeam,
        ts,
        league,
        resultsOverride
      ).sort((a, b) => {
        if (a.Week !== b.Week) {
          return a.Week < b.Week;
        }
        if (a.GameDay && b.GameDay) {
          return a.GameDay.localeCompare(b.GameDay);
        }
        return true;
      }),
    [teamSchedule, selectedTeam, ts, league, resultsOverride]
  );

  const weeklyGames = useMemo(() => {
    if (!selectedWeek) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeek] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeek, ts, league, resultsOverride]);

  const handleScheduleExport = async (opts: any) => {
    const dto = {
      SeasonID: selectedSeason - 2020,
      WeekID: getFBAWeekID(selectedWeek, selectedSeason - 2020),
      Timeslot: opts.value,
    };
    await ExportBasketballSchedule(dto);
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="sm:grid sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 sm:gap-4 w-full h-[82vh]">
          <div className="flex flex-col w-full sm:col-span-1 md:col-span-2 lg:col-span-1 items-center gap-4 pb-2">
            <div className="flex gap-4 justify-center items-center sm:w-full">
              <ButtonGroup classes="flex justify-center w-full">
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setCategory(Overview)}
                  isSelected={category === Overview}
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                >
                  <Text variant="small">Overview</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setCategory(Standings)}
                  isSelected={category === Standings}
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                >
                  <Text variant="small">Standings</Text>
                </Button>
              </ButtonGroup>
            </div>
            <div className="flex flex-col gap-2 sm:gap-4 items-center">
              {category === Overview && (
                <>
                  <div className="flex justify-center items-center gap-2">
                    <ToggleSwitch
                      onChange={(checked) => {
                        setView(checked ? WeeklyGames : TeamGames);
                        setIsChecked(checked);
                      }}
                      checked={isChecked}
                    />
                    <Text variant="small">Weekly Games</Text>
                  </div>
                  {currentUser?.roleID && currentUser.roleID === AdminRole && (
                    <div className="flex justify-center items-center gap-2">
                      <ToggleSwitch
                        onChange={() => {
                          setResultsOverride((res) => !res);
                        }}
                        checked={resultsOverride}
                      />
                      <Text variant="small">Show Results</Text>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-2 justify-around sm:flex-col">
                <div className="flex flex-col items-center gap-2 justify-center">
                  {view === TeamGames ? (
                    <>
                      <Text variant="body">Teams</Text>
                      <SelectDropdown
                        options={nbaTeamOptions}
                        placeholder="Select Team..."
                        onChange={selectTeamOption}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            borderColor: state.isFocused
                              ? "#4A90E2"
                              : "#4A5568",
                            color: "#ffffff",
                            minWidth: isMobile ? "10rem" : "15rem",
                            maxWidth: "100%",
                            padding: "0.3rem",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            flexGrow: 1,
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #4A90E2"
                              : "none",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            borderRadius: "8px",
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            padding: "0",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            color: "#ffffff",
                            padding: "10px",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            cursor: "pointer",
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Text variant="body">Week</Text>
                      <SelectDropdown
                        value={selectedWeekOption}
                        options={Array.from({ length: 22 }, (_, i) => ({
                          label: `${i + 1}`,
                          value: (i + 1).toString(),
                        }))}
                        placeholder="Select Week..."
                        onChange={(selectedOption) => {
                          const selectedWeek = Number(selectedOption?.value);
                          setSelectedWeek(selectedWeek);
                        }}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            borderColor: state.isFocused
                              ? "#4A90E2"
                              : "#4A5568",
                            color: "#ffffff",
                            minWidth: isMobile ? "10rem" : "15rem",
                            maxWidth: "100%",
                            padding: "0.3rem",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            flexGrow: 1,
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #4A90E2"
                              : "none",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            borderRadius: "8px",
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            backgroundColor: "#1a202c",
                            padding: "0",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#2d3748"
                              : "#1a202c",
                            color: "#ffffff",
                            padding: "10px",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            cursor: "pointer",
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: "#ffffff",
                          }),
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Seasons</Text>
                  <SelectDropdown
                    value={selectedSeasonOption}
                    options={FootballSeasons}
                    placeholder="Select Season..."
                    onChange={(selectedOption) => {
                      const selectedSeason = Number(selectedOption?.value);
                      setSelectedSeason(selectedSeason);
                    }}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                        color: "#ffffff",
                        minWidth: isMobile ? "10.5rem" : "15rem",
                        maxWidth: "100%",
                        padding: "0.3rem",
                        flexGrow: 1,
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #4A90E2"
                          : "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        borderRadius: "8px",
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        padding: "0",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        color: "#ffffff",
                        padding: "10px",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        cursor: "pointer",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                    }}
                  />
                </div>
              </div>
              {!isMobile && (
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Export Day of Week</Text>
                  <SelectDropdown
                    options={bbaExportOptions}
                    placeholder="Select Timeslot..."
                    onChange={handleScheduleExport}
                    isDisabled={view === TeamGames}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                        color: "#ffffff",
                        minWidth: isMobile ? "10.5rem" : "15rem",
                        maxWidth: "100%",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        flexGrow: 1,
                        padding: "0.3rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #4A90E2"
                          : "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        borderRadius: "8px",
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: "#1a202c",
                        padding: "0",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        color: "#ffffff",
                        padding: "10px",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        cursor: "pointer",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#ffffff",
                      }),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {category === Standings && (
            <div className="flex flex-col h-full col-span-5">
              <LeagueStandings
                currentUser={currentUser}
                league={league}
                standings={allNBAStandings}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
                isLoading={isLoading}
              />
            </div>
          )}
          {category === Overview && (
            <div className="flex flex-col pb-4 sm:pb-0 h-full col-span-2 overflow-auto">
              {view === TeamGames && (
                <TeamSchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbr}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={nbaTeamMap}
                  week={currentWeek}
                  league={league}
                  ts={ts}
                  processedSchedule={processedSchedule}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoading={isLoading}
                />
              )}
              {view === WeeklyGames && (
                <WeeklySchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbr}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={nbaTeamMap}
                  week={selectedWeek}
                  league={league}
                  ts={ts}
                  processedSchedule={weeklyGames}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
          {category === Overview && (
            <div className="flex flex-col h-full col-span-2 md:col-span-3 lg:col-span-2">
              <TeamStandings
                team={selectedTeam}
                currentUser={currentUser}
                league={league}
                standings={teamStandings}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

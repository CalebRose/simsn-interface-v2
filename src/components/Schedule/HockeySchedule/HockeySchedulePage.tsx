import { FC, useMemo, useState } from "react";
import {
  League,
  Overview,
  Standings,
  WeeklyGames,
  TeamGames,
  HockeySeasons,
  Divisions,
  Conferences,
  AdminRole,
  SimCHL,
} from "../../../_constants/constants";
import { useAuthStore } from "../../../context/AuthContext";
import { SelectDropdown } from "../../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { useResponsive } from "../../../_hooks/useMobile";
import { GetCurrentWeek } from "../../../_helper/teamHelper";
import {
  getScheduleCHLData,
  getSchedulePHLData,
  processSchedule,
  processWeeklyGames,
} from "../Common/SchedulePageHelper";
import {
  TeamSchedule,
  TeamStandings,
  LeagueStandings,
  WeeklySchedule,
} from "../Common/SchedulePageComponents";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { darkenColor } from "../../../_utility/getDarkerColor";
import { ToggleSwitch } from "../../../_design/Inputs";
import { NonFBAExportOptions } from "./hockeyScheduleHelper";
import { useModal } from "../../../_hooks/useModal";
import { SubmitPollModal } from "../Common/SubmitPollModal";
import { CollegePollModal } from "../Common/CollegePollModal";
import { getHCKWeekID } from "../../../_helper/statsPageHelper";

interface SchedulePageProps {
  league: League;
  ts: any;
}

export const CHLSchedulePage: FC<SchedulePageProps> = ({ league, ts }) => {
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.SeasonID;
  const {
    chlTeam,
    chlTeams,
    chlTeamMap,
    chlRosterMap,
    chlTeamOptions,
    collegeStandingsMapBySeason,
    collegeGamesMapBySeason,
    isLoading,
    collegePollSubmission,
    submitCollegePoll,
    ExportHockeySchedule,
  } = hkStore;

  const [selectedTeam, setSelectedTeam] = useState(chlTeam);
  const [category, setCategory] = useState(Overview);
  const [view, setView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{
    label: string;
    value: string;
  }>({ label: "1", value: "1" });
  const [selectedSeason, setSelectedSeason] = useState<{
    label: string;
    value: string;
  }>({ label: ts.Season.toString(), value: ts.SeasonID.toString() });
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const hckExportOptions = useMemo(() => NonFBAExportOptions(), []);
  const selectedWeekValue = useMemo(() => {
    return Number(selectedWeek.value);
  }, [selectedWeek]);

  const selectedSeasonValue = useMemo(() => {
    return Number(selectedSeason.value);
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

  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const playerMap = useMemo(() => {
    if (!chlRosterMap) return {};

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

    Object.entries(chlRosterMap).forEach(([teamId, roster]) => {
      map[Number(teamId)] = roster.reduce((acc, player) => {
        acc[player.ID] = {
          FirstName: player.FirstName,
          LastName: player.LastName,
          Position: player.Position,
          TeamID: player.TeamID,
          Team: player.Team,
        };
        return acc;
      }, {} as Record<number, { FirstName: string; LastName: string; Position: string; TeamID: number; Team: string }>);
    });

    return map;
  }, [chlRosterMap]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = chlTeamMap ? chlTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const collegeGamesBySelectedSeason = useMemo(() => {
    return collegeGamesMapBySeason[selectedSeasonValue] || [];
  }, [collegeGamesMapBySeason, selectedSeasonValue]);

  const collegeStandingsBySelectedSeason = useMemo(() => {
    return collegeStandingsMapBySeason[selectedSeasonValue] || [];
  }, [collegeStandingsMapBySeason, selectedSeasonValue]);

  const { teamStandings, teamSchedule, groupedWeeklyGames } = useMemo(() => {
    return getScheduleCHLData(
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      collegeStandingsBySelectedSeason,
      collegeGamesBySelectedSeason,
      chlTeams
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    collegeStandingsMapBySeason,
    collegeGamesMapBySeason,
    chlTeams,
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
    const gamesForWeek = groupedWeeklyGames[selectedWeekValue] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeekValue, ts, league, resultsOverride]);

  const submitPollModal = useModal();
  const collegePollModal = useModal();

  const handleScheduleExport = async (opts: any) => {
    const dto = {
      SeasonID: selectedSeasonValue,
      WeekID: getHCKWeekID(
        selectedWeekValue,
        Number(selectedSeason.label) - 2024
      ),
      Timeslot: opts.value,
    };
    await ExportHockeySchedule(dto);
  };

  return (
    <>
      <CollegePollModal
        league={SimCHL}
        isOpen={collegePollModal.isModalOpen}
        onClose={collegePollModal.handleCloseModal}
        timestamp={ts}
      />
      <SubmitPollModal
        league={SimCHL}
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
                        options={chlTeamOptions}
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
                        value={selectedWeek}
                        options={Array.from({ length: 22 }, (_, i) => ({
                          label: `${i + 1}`,
                          value: (i + 1).toString(),
                        }))}
                        placeholder="Select Week..."
                        onChange={(selectedOption) => {
                          const opt = {
                            label: selectedOption!.label,
                            value: selectedOption!.value,
                          };
                          setSelectedWeek(opt);
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
                    value={selectedSeason}
                    options={HockeySeasons}
                    placeholder="Select Season..."
                    onChange={(selectedOption) => {
                      const opt = {
                        label: selectedOption!.label,
                        value: selectedOption!.value,
                      };
                      setSelectedSeason(opt);
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
                    options={hckExportOptions}
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
                standings={collegeStandingsBySelectedSeason}
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
                  Abbr={selectedTeam?.Abbreviation}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={chlTeamMap}
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
                  Abbr={selectedTeam?.Abbreviation}
                  category={view}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={chlTeamMap}
                  week={selectedWeek.value}
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

export const PHLSchedulePage: FC<SchedulePageProps> = ({ league, ts }) => {
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.Season;
  const {
    phlTeam,
    phlTeams,
    phlTeamMap,
    proRosterMap: phlRosterMap,
    phlTeamOptions,
    proStandingsMapBySeason,
    proGamesMapBySeason,
    isLoading,
    ExportHockeySchedule,
  } = hkStore;

  const [selectedTeam, setSelectedTeam] = useState(phlTeam);
  const [category, setCategory] = useState(Overview);
  const [scheduleView, setScheduleView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{
    label: string;
    value: string;
  }>({ label: "1", value: "1" });
  const [selectedSeason, setSelectedSeason] = useState<{
    label: string;
    value: string;
  }>({ label: ts.Season.toString(), value: ts.SeasonID.toString() });
  const [standingsView, setStandingsView] = useState(Conferences);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const hckExportOptions = useMemo(() => NonFBAExportOptions(), []);
  const selectedWeekValue = useMemo(() => {
    return Number(selectedWeek.value);
  }, [selectedWeek]);

  const selectedSeasonValue = useMemo(() => {
    return Number(selectedSeason.value);
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

  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const playerMap = useMemo(() => {
    if (!phlRosterMap) return {};

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

    Object.entries(phlRosterMap).forEach(([teamId, roster]) => {
      map[Number(teamId)] = roster.reduce((acc, player) => {
        acc[player.ID] = {
          FirstName: player.FirstName,
          LastName: player.LastName,
          Position: player.Position,
          TeamID: player.TeamID,
          Team: player.Team,
        };
        return acc;
      }, {} as Record<number, { FirstName: string; LastName: string; Position: string; TeamID: number; Team: string }>);
    });

    return map;
  }, [phlRosterMap]);

  const proGamesBySelectedSeason = useMemo(() => {
    return proGamesMapBySeason[selectedSeasonValue] || [];
  }, [proGamesMapBySeason, selectedSeasonValue]);

  const proStandingsBySelectedSeason = useMemo(() => {
    return proStandingsMapBySeason[selectedSeasonValue] || [];
  }, [proStandingsMapBySeason, selectedSeasonValue]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = phlTeamMap ? phlTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const { teamStandings, teamSchedule, groupedWeeklyGames } = useMemo(() => {
    return getSchedulePHLData(
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      proStandingsBySelectedSeason,
      proGamesBySelectedSeason,
      phlTeams
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    proStandingsBySelectedSeason,
    proGamesBySelectedSeason,
    phlTeams,
  ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(teamSchedule, selectedTeam, ts, league, resultsOverride),
    [teamSchedule, selectedTeam, ts, league, resultsOverride]
  );

  const weeklyGames = useMemo(() => {
    if (!selectedWeek) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeekValue] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeekValue, ts, league, resultsOverride]);

  const handleScheduleExport = async (opts: any) => {
    const dto = {
      SeasonID: selectedSeason,
      WeekID: getHCKWeekID(
        selectedWeekValue,
        Number(selectedSeason.label) - 2024
      ),
      Timeslot: opts.value,
    };
    await ExportHockeySchedule(dto);
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="sm:grid sm:grid-cols-6 sm:gap-4 w-full h-[82vh]">
          <div className="flex flex-col w-full sm:col-span-1 items-center gap-4 pb-2">
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
            {category === Overview && (
              <>
                <div className="flex justify-center items-center gap-2">
                  <ToggleSwitch
                    onChange={(checked) => {
                      setScheduleView(checked ? WeeklyGames : TeamGames);
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
            {category === Standings && (
              <div className="flex justify-center items-center gap-2">
                <ToggleSwitch
                  onChange={(checked) => {
                    setStandingsView(checked ? Divisions : Conferences);
                    setIsChecked(checked);
                  }}
                  checked={isChecked}
                />
                <Text variant="small">Divisions</Text>
              </div>
            )}
            <div className="flex items-center gap-2 justify-around sm:flex-col">
              <div className="flex flex-col items-center gap-2 justify-center">
                {scheduleView === TeamGames ? (
                  <>
                    <Text variant="body">Teams</Text>
                    <SelectDropdown
                      options={phlTeamOptions}
                      placeholder="Select Team..."
                      onChange={selectTeamOption}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused
                            ? "#2d3748"
                            : "#1a202c",
                          borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
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
                          cursor: "pointer",
                          fontSize: isMobile ? "0.9rem" : "1rem",
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
                      options={Array.from({ length: 22 }, (_, i) => ({
                        label: `${i + 1}`,
                        value: (i + 1).toString(),
                      }))}
                      placeholder="Select Week..."
                      onChange={(selectedOption) => {
                        const opt = {
                          label: selectedOption!.label,
                          value: selectedOption!.value,
                        };
                        setSelectedWeek(opt);
                      }}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused
                            ? "#2d3748"
                            : "#1a202c",
                          borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
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
                          cursor: "pointer",
                          fontSize: isMobile ? "0.9rem" : "1rem",
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
                  options={HockeySeasons}
                  placeholder="Select Season..."
                  onChange={(selectedOption) => {
                    const opt = {
                      label: selectedOption!.label,
                      value: selectedOption!.value,
                    };
                    setSelectedSeason(opt);
                  }}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                      borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                      color: "#ffffff",
                      minWidth: isMobile ? "10rem" : "15rem",
                      maxWidth: "100%",
                      padding: "0.3rem",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      flexGrow: 1,
                      boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
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
                      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                      color: "#ffffff",
                      padding: "10px",
                      cursor: "pointer",
                      fontSize: isMobile ? "0.9rem" : "1rem",
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
                  options={hckExportOptions}
                  placeholder="Select Timeslot..."
                  onChange={handleScheduleExport}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                      borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                      color: "#ffffff",
                      minWidth: isMobile ? "10rem" : "15rem",
                      maxWidth: "100%",
                      padding: "0.3rem",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      flexGrow: 1,
                      boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
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
                      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                      color: "#ffffff",
                      padding: "10px",
                      cursor: "pointer",
                      fontSize: isMobile ? "0.9rem" : "1rem",
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
          {category === Standings && (
            <div className="flex flex-col h-full col-span-5">
              <LeagueStandings
                currentUser={currentUser}
                league={league}
                category={standingsView}
                standings={proStandingsBySelectedSeason}
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
              {category === Overview && scheduleView === TeamGames && (
                <TeamSchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbreviation}
                  category={scheduleView}
                  currentUser={currentUser}
                  playerMap={playerMap}
                  teamMap={phlTeamMap}
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
              {category === Overview && scheduleView === WeeklyGames && (
                <WeeklySchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.Abbreviation}
                  category={scheduleView}
                  currentUser={currentUser}
                  week={selectedWeek.value}
                  league={league}
                  ts={ts}
                  playerMap={playerMap}
                  teamMap={phlTeamMap}
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
            <div className="flex flex-col h-full col-span-2">
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

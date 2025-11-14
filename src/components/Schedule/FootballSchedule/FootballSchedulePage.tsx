import { FC, useEffect, useMemo, useState } from "react";
import {
  League,
  Overview,
  Standings,
  WeeklyGames,
  TeamGames,
  FootballSeasons,
  FootballWeeks as Weeks,
  Divisions,
  Conferences,
  AdminRole,
  SimCFB,
} from "../../../_constants/constants";
import { useAuthStore } from "../../../context/AuthContext";
import { SelectDropdown } from "../../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { useResponsive } from "../../../_hooks/useMobile";
import { GetCurrentWeek } from "../../../_helper/teamHelper";
import {
  getScheduleCFBData,
  getScheduleNFLData,
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
import { CollegePollModal } from "../Common/CollegePollModal";
import { SubmitPollModal } from "../Common/SubmitPollModal";
import { useModal } from "../../../_hooks/useModal";
import { getFBAWeekID } from "../../../_helper/statsPageHelper";

interface SchedulePageProps {
  league: League;
  ts: any;
}

export const CFBSchedulePage: FC<SchedulePageProps> = ({ league, ts }) => {
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.Season;
  const {
    cfbTeam,
    cfbTeams,
    cfbTeamMap,
    cfbTeamOptions,
    allCFBStandings,
    allCollegeGames: allCFBGames,
    isLoading,
    collegePollSubmission,
    submitCollegePoll,
    getBootstrapScheduleData,
    ExportFootballSchedule,
  } = fbStore;

  const [selectedTeam, setSelectedTeam] = useState(cfbTeam);
  const [category, setCategory] = useState(Overview);
  const [view, setView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const submitPollModal = useModal();
  const collegePollModal = useModal();
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  useEffect(() => {
    getBootstrapScheduleData();
  }, [getBootstrapScheduleData]);

  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cfbTeamMap ? cfbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const { teamStandings, teamSchedule, groupedWeeklyGames } = useMemo(() => {
    return getScheduleCFBData(
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      allCFBStandings,
      allCFBGames,
      cfbTeams
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    allCFBStandings,
    allCFBGames,
    cfbTeams,
  ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(teamSchedule, selectedTeam, ts, league, resultsOverride),
    [teamSchedule, selectedTeam, ts, league, resultsOverride]
  );

  const weeklyGames = useMemo(() => {
    if (selectedWeek === null || selectedTeam === undefined) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeek] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeek, ts, league, resultsOverride]);

  const teamRecordMap = useMemo(() => {
    const map: Record<number, string> = {};
    (allCFBStandings || []).forEach((s: any) => {
      if (s?.TeamID != null) {
        map[s.TeamID] = `${s.TotalWins}-${s.TotalLosses}`;
      }
    });
    return map;
  }, [allCFBStandings]);

  const onExportSchedule = async (weekID: SingleValue<SelectOption>) => {
    const numericWeekID = getFBAWeekID(
      Number(weekID?.value),
      selectedSeason - 2020
    );
    const dto = { SeasonID: selectedSeason - 2020, WeekID: numericWeekID };
    await ExportFootballSchedule(dto);
  };

  return (
    <>
      <CollegePollModal
        league={SimCFB}
        isOpen={collegePollModal.isModalOpen}
        onClose={collegePollModal.handleCloseModal}
        timestamp={ts}
      />
      <SubmitPollModal
        league={SimCFB}
        isOpen={submitPollModal.isModalOpen}
        onClose={submitPollModal.handleCloseModal}
        pollSubmission={collegePollSubmission}
        submitPoll={submitCollegePoll}
        timestamp={ts}
      />
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
              <div className="flex w-[95vw] items-center gap-2 justify-around sm:flex-col">
                <div className="flex flex-col items-center gap-2 justify-center">
                  {view === TeamGames ? (
                    <>
                      <Text variant="body">Teams</Text>
                      <SelectDropdown
                        options={cfbTeamOptions}
                        placeholder="Select Team..."
                        onChange={selectTeamOption}
                      />
                    </>
                  ) : (
                    <>
                      <Text variant="body">Week</Text>
                      <SelectDropdown
                        options={Weeks}
                        placeholder="Select Week..."
                        onChange={(selectedOption) => {
                          const selectedWeek = Number(selectedOption?.value);
                          setSelectedWeek(selectedWeek);
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Seasons</Text>
                  <SelectDropdown
                    options={FootballSeasons}
                    placeholder="Select Season..."
                    onChange={(selectedOption) => {
                      const selectedSeason = Number(selectedOption?.value);
                      setSelectedWeek(selectedSeason);
                    }}
                  />
                </div>
              </div>
              {!isMobile && (
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Text variant="body">Export Day of Week</Text>
                  <SelectDropdown
                    options={Weeks}
                    placeholder="Select Timeslot..."
                    onChange={onExportSchedule}
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
                standings={allCFBStandings}
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
                  Abbr={selectedTeam?.TeamAbbr}
                  category={view}
                  currentUser={currentUser}
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
                  teamMap={cfbTeamMap}
                  teamRecordMap={teamRecordMap}
                />
              )}
              {view === WeeklyGames && (
                <WeeklySchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.TeamAbbr}
                  category={view}
                  currentUser={currentUser}
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
                  teamMap={cfbTeamMap}
                  teamRecordMap={teamRecordMap}
                />
              )}
            </div>
          )}
          {category === Overview && (
            <div className="flex flex-col pb-4 sm:pb-0 h-full col-span-2">
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

export const NFLSchedulePage: FC<SchedulePageProps> = ({ league, ts }) => {
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const currentSeason = ts.Season;
  const {
    nflTeam,
    nflTeams,
    proTeamMap: nflTeamMap,
    nflTeamOptions,
    allProStandings: allNFLStandings,
    allProGames: allNFLGames,
    isLoading,
    ExportFootballSchedule,
  } = fbStore;

  const [selectedTeam, setSelectedTeam] = useState(nflTeam);
  const [category, setCategory] = useState(Overview);
  const [scheduleView, setScheduleView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [standingsView, setStandingsView] = useState(Conferences);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);

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

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = nflTeamMap ? nflTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const { teamStandings, teamSchedule, groupedWeeklyGames, teamAbbrMap } =
    useMemo(() => {
      return getScheduleNFLData(
        selectedTeam,
        currentWeek,
        selectedWeek,
        selectedSeason,
        league,
        allNFLStandings,
        allNFLGames,
        nflTeams
      );
    }, [
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      allNFLStandings,
      allNFLGames,
      nflTeams,
    ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(teamSchedule, selectedTeam, ts, league, resultsOverride),
    [teamSchedule, selectedTeam, ts, league, resultsOverride]
  );

  const weeklyGames = useMemo(() => {
    if (selectedWeek === null || selectedTeam === undefined) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeek] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeek, ts, league, resultsOverride]);
  const onExportSchedule = async (weekID: SingleValue<SelectOption>) => {
    const numericWeekID = getFBAWeekID(
      Number(weekID?.value),
      selectedSeason - 2020
    );
    const dto = { SeasonID: selectedSeason - 2020, WeekID: numericWeekID };
    await ExportFootballSchedule(dto);
  };

  const teamRecordMap = useMemo(() => {
    const map: Record<number, string> = {};
    (allNFLStandings || []).forEach((s: any) => {
      if (s?.TeamID != null) {
        const ties = typeof s.TotalTies === "number" && s.TotalTies > 0 ? `-${s.TotalTies}` : "";
        map[s.TeamID] = `${s.TotalWins}-${s.TotalLosses}${ties}`;
      }
    });
    return map;
  }, [allNFLStandings]);
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
            <div className="flex w-[95vw] items-center gap-2 justify-around sm:flex-col">
              <div className="flex flex-col items-center gap-2 justify-center">
                {scheduleView === TeamGames ? (
                  <>
                    <Text variant="body">Teams</Text>
                    <SelectDropdown
                      options={nflTeamOptions}
                      placeholder="Select Team..."
                      onChange={selectTeamOption}
                    />
                  </>
                ) : (
                  <>
                    <Text variant="body">Week</Text>
                    <SelectDropdown
                      options={Weeks}
                      placeholder="Select Week..."
                      onChange={(selectedOption) => {
                        const selectedWeek = Number(selectedOption?.value);
                        setSelectedWeek(selectedWeek);
                      }}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 justify-center">
                <Text variant="body">Seasons</Text>
                <SelectDropdown
                  options={FootballSeasons}
                  placeholder="Select Season..."
                  onChange={(selectedOption) => {
                    const selectedSeason = Number(selectedOption?.value);
                    setSelectedWeek(selectedSeason);
                  }}
                />
              </div>
            </div>
            {!isMobile && (
              <div className="flex flex-col items-center gap-2 justify-center">
                <Text variant="body">Export Day of Week</Text>
                <SelectDropdown
                  options={Weeks}
                  placeholder="Select Week..."
                  onChange={onExportSchedule}
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
                standings={allNFLStandings}
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
              {scheduleView === TeamGames && (
                <TeamSchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.TeamAbbr}
                  category={scheduleView}
                  currentUser={currentUser}
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
                  teamMap={nflTeamMap}
                  teamRecordMap={teamRecordMap}
                />
              )}
              {scheduleView === WeeklyGames && (
                <WeeklySchedule
                  team={selectedTeam}
                  Abbr={selectedTeam?.TeamAbbr}
                  category={scheduleView}
                  currentUser={currentUser}
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
                  teamMap={nflTeamMap}
                  teamRecordMap={teamRecordMap}
                />
              )}
            </div>
          )}
          {category === Overview && (
            <div className="flex pb-4 sm:pb-0 flex-col h-full col-span-2">
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

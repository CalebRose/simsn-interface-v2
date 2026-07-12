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
import FBAScheduleService from "../../../_services/scheduleService";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import GameRequestModal from "../Common/GameRequestModal";
import { Refresh } from "../../../_design/Icons";

interface SchedulePageProps {
  league: League;
  ts: any;
}

export const CFBSchedulePage: FC<SchedulePageProps> = ({ league, ts }) => {
  const { currentUser } = useAuthStore();
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
  } = useSimFBAStore();

  const [selectedTeam, setSelectedTeam] = useState(cfbTeam);
  const [category, setCategory] = useState(Overview);
  const [view, setView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const [isSpringGames, setIsSpringGames] = useState<boolean>(false);
  const [seasonCFBGames, setSeasonCFBGames] = useState<any[]>([]);
  const submitPollModal = useModal();
  const collegePollModal = useModal();
  const gameRequestModal = useModal();
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree,
  );
  const { backgroundColor } = useBackgroundColor();
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  useEffect(() => {
    getBootstrapScheduleData();
  }, []);

  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  useEffect(() => {
    const seasonID = (selectedSeason ?? 0) - 2020;
    if (!selectedSeason || seasonID <= 0) return;
    const availableSeasons = new Set(
      (allCFBGames || []).map((g: any) => g.SeasonID),
    );
    if (availableSeasons.has(seasonID)) {
      const filtered = (allCFBGames || []).filter(
        (g: any) => g.SeasonID === seasonID,
      );
      setSeasonCFBGames(filtered);
      return;
    }
    const load = async () => {
      try {
        const service = new FBAScheduleService();
        const res = await service.GetAllCollegeGamesInASeason(seasonID);
        const games = res?.AllCollegeGames ?? res ?? [];
        setSeasonCFBGames(games);
      } catch (e) {
        setSeasonCFBGames([]);
      }
    };
    load();
  }, [selectedSeason, allCFBGames]);

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
      seasonCFBGames.length > 0 ? seasonCFBGames : allCFBGames,
      cfbTeams,
      isSpringGames,
    );
  }, [
    selectedTeam,
    currentWeek,
    selectedWeek,
    selectedSeason,
    league,
    allCFBStandings,
    allCFBGames,
    seasonCFBGames,
    cfbTeams,
    isSpringGames,
  ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(teamSchedule, selectedTeam, ts, league, resultsOverride),
    [teamSchedule, selectedTeam, ts, league, resultsOverride],
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
      selectedSeason - 2020,
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
      <GameRequestModal
        title="Request a CFB OOC Game"
        isOpen={gameRequestModal.isModalOpen}
        onClose={gameRequestModal.handleCloseModal}
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
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                  onClick={submitPollModal.handleOpenModal}
                >
                  <Text variant="small">Submit Poll</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[45%] sm:max-w-[175px]"
                  onClick={collegePollModal.handleOpenModal}
                >
                  <Text variant="small">Official Poll</Text>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[13%] sm:max-w-[100px]"
                  onClick={getBootstrapScheduleData}
                >
                  <div className="flex text-center items-center justify-center">
                    <Text
                      variant="small"
                      classes="text-center items-center justify-center"
                    >
                      <Refresh />
                    </Text>
                  </div>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[75%] sm:max-w-[250px]"
                  onClick={gameRequestModal.handleOpenModal}
                  disabled={ts.CollegeWeek > 0}
                >
                  <Text variant="small">Request Game</Text>
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

                  <div className="flex justify-center items-center gap-2">
                    <ToggleSwitch
                      onChange={() => {
                        setIsSpringGames((res) => !res);
                      }}
                      checked={isSpringGames}
                    />
                    <Text variant="small">Spring Games</Text>
                  </div>
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
                        options={Weeks}
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
                    options={FootballSeasons}
                    placeholder="Select Season..."
                    onChange={(selectedOption) => {
                      const newSeason = Number(selectedOption?.value);
                      setSelectedSeason(newSeason);
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
    getBootstrapScheduleData,
  } = fbStore;

  const gameRequestModal = useModal();

  const [selectedTeam, setSelectedTeam] = useState(nflTeam);
  const [category, setCategory] = useState(Overview);
  const [scheduleView, setScheduleView] = useState(TeamGames);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 1);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason ?? 2025);
  const [standingsView, setStandingsView] = useState(Conferences);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);
  const [seasonNFLGames, setSeasonNFLGames] = useState<any[]>([]);
  const [isPreseason, setIsPreseason] = useState<boolean>(false);

  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree,
  );
  const { backgroundColor } = useBackgroundColor();
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }

  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);

  useEffect(() => {
    getBootstrapScheduleData();
  }, [getBootstrapScheduleData]);

  useEffect(() => {
    const seasonID = (selectedSeason ?? 0) - 2020;
    if (!selectedSeason || seasonID <= 0) return;
    const availableSeasons = new Set(
      (allNFLGames || []).map((g: any) => g.SeasonID),
    );
    if (availableSeasons.has(seasonID)) {
      const filtered = (allNFLGames || []).filter(
        (g: any) => g.SeasonID === seasonID,
      );
      setSeasonNFLGames(filtered);
      return;
    }
    const load = async () => {
      try {
        const service = new FBAScheduleService();
        const res = await service.GetAllNFLGamesInASeason(seasonID);
        const games = res?.AllProGames ?? res ?? [];
        setSeasonNFLGames(games);
      } catch (e) {
        setSeasonNFLGames([]);
      }
    };
    load();
  }, [selectedSeason, allNFLGames]);

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
        seasonNFLGames.length > 0 ? seasonNFLGames : allNFLGames,
        nflTeams,
        isPreseason,
      );
    }, [
      selectedTeam,
      currentWeek,
      selectedWeek,
      selectedSeason,
      league,
      allNFLStandings,
      allNFLGames,
      seasonNFLGames,
      nflTeams,
      isPreseason,
    ]);

  const processedSchedule = useMemo(
    () =>
      processSchedule(teamSchedule, selectedTeam, ts, league, resultsOverride),
    [teamSchedule, selectedTeam, ts, league, resultsOverride],
  );

  const weeklyGames = useMemo(() => {
    if (selectedWeek === null || selectedTeam === undefined) return [];
    const gamesForWeek = groupedWeeklyGames[selectedWeek] || [];
    return processWeeklyGames(gamesForWeek, ts, league, resultsOverride);
  }, [groupedWeeklyGames, selectedWeek, ts, league, resultsOverride]);
  const onExportSchedule = async (weekID: SingleValue<SelectOption>) => {
    const numericWeekID = getFBAWeekID(
      Number(weekID?.value),
      selectedSeason - 2020,
    );
    const dto = { SeasonID: selectedSeason - 2020, WeekID: numericWeekID };
    await ExportFootballSchedule(dto);
  };

  const teamRecordMap = useMemo(() => {
    const map: Record<number, string> = {};
    (allNFLStandings || []).forEach((s: any) => {
      if (s?.TeamID != null) {
        const ties =
          typeof s.TotalTies === "number" && s.TotalTies > 0
            ? `-${s.TotalTies}`
            : "";
        map[s.TeamID] = `${s.TotalWins}-${s.TotalLosses}${ties}`;
      }
    });
    return map;
  }, [allNFLStandings]);

  return (
    <>
      <GameRequestModal
        title="Request an NFL Preseason Game"
        isOpen={gameRequestModal.isModalOpen}
        onClose={gameRequestModal.handleCloseModal}
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
                  classes="px-5 py-2 sm:w-[13%] sm:max-w-[100px]"
                  onClick={getBootstrapScheduleData}
                >
                  <div className="flex text-center items-center justify-center">
                    <Text
                      variant="small"
                      classes="text-center items-center justify-center"
                    >
                      <Refresh />
                    </Text>
                  </div>
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  classes="px-5 py-2 sm:w-[75%] sm:max-w-[250px]"
                  onClick={gameRequestModal.handleOpenModal}
                  disabled={ts.NFLWeek > 0}
                >
                  <Text variant="small">Request Game</Text>
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
            <div className="flex justify-center items-center gap-2">
              <ToggleSwitch
                onChange={() => {
                  setIsPreseason((res) => !res);
                }}
                checked={isPreseason}
              />
              <Text variant="small">Preseason</Text>
            </div>
            <div className="flex w-[95vw] items-center gap-2 justify-around sm:flex-col">
              <div className="flex flex-col items-center gap-2 justify-center">
                {scheduleView === TeamGames ? (
                  <>
                    <Text variant="body">Teams</Text>
                    <SelectDropdown
                      options={nflTeamOptions}
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
                      options={Weeks}
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
                  options={FootballSeasons}
                  placeholder="Select Season..."
                  onChange={(selectedOption) => {
                    const newSeason = Number(selectedOption?.value);
                    setSelectedSeason(newSeason);
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

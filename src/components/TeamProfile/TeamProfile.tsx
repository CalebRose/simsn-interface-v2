import { FC, useEffect, useMemo, useState } from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  statsOptions,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { SelectDropdown } from "../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
  CollegeStandings as CFBStandings,
  FlexComparisonModel as CFBFlexComparisonModel,
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  CollegeTeamProfileData as CFBTeamProfileData,
} from "../../models/footballModels";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { isBrightColor } from "../../_utility/isBrightColor";
import { useResponsive } from "../../_hooks/useMobile";
import { darkenColor } from "../../_utility/getDarkerColor";
import { useParams } from "react-router-dom";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import {
  TeamRivalry,
  TeamPlayerCareerStats,
  TeamSeasonHistory,
  TeamTrophyCabinet,
  TeamBowlResults,
} from "./Common/TeamProfileComponents";
import { LoadSpinner } from "../../_design/LoadSpinner";
import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import {
  processRivalries,
  processSeasonHistory,
  processTeamTrophies,
  processBowlGames,
  FBATrophies,
} from "./Common/TeamProfileHelper";
import { Text } from "../../_design/Typography";
import { useBackgroundColor } from "../../_hooks/useBackgroundColor";

interface TeamProfilePageProps {
  league: League;
}

export const TeamProfilePage: FC<TeamProfilePageProps> = ({ league }) => {
  const { currentUser } = useAuthStore();
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague, ts } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return false;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimCFB && cfbTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    return true;
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, cbbTeam, nbaTeam, selectedLeague]);
  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Team Profile">
        {selectedLeague === SimCFB && cfbTeam && (
          <CFBTeamProfilePage league={league} />
        )}
      </PageContainer>
    </>
  );
};

const CFBTeamProfilePage = ({ league }: TeamProfilePageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const { cfbTeam, cfbTeamMap, cfbTeamOptions, allCFBTeamHistory, isLoading } =
    fbStore;
  const [careerStats, setCareerStats] = useState<CFBPlayerSeasonStats[]>([]);
  const [collegeStandings, setCollegeStandings] = useState<CFBStandings[]>([]);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);
  const [rivalries, setRivalries] = useState<any[]>([]);
  const [teamTrophies, setTeamTrophies] = useState<FBATrophies | null>(null);
  const [bowlGames, setBowlGames] = useState<any[]>([]);
  const [playerMap, setPlayerMap] = useState<{ [key: number]: CFBPlayer }>({});
  let selectedTeamLogo = "";
  const [statsCategory, setStatsCategory] = useState("Passing");
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && cfbTeamMap) {
      const id = Number(teamId);
      return cfbTeamMap[id];
    }
    return cfbTeam;
  });
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  const { backgroundColor } = useBackgroundColor();
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);
  let textColorClass = getTextColorBasedOnBg(backgroundColor);

  const { isDesktop } = useResponsive();

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cfbTeamMap ? cfbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
  };

  if (selectedTeam) {
    selectedTeamLogo = getLogo(league, selectedTeam?.ID, currentUser?.isRetro);
  }

  const teamHistoryProfile = useMemo(() => {
    if (
      !selectedTeam ||
      !allCFBTeamHistory ||
      Object.keys(allCFBTeamHistory).length === 0
    ) {
      return null;
    }
    const teamProfile = allCFBTeamHistory[selectedTeam.ID];
    if (!teamProfile) return null;

    const { processedSeasonHistory, totalWins, totalLosses } =
      processSeasonHistory(teamProfile.CollegeStandings);
    const processedRivalries = processRivalries(
      teamProfile,
      selectedTeam,
      cfbTeamMap
    );
    const processedTrophies = processTeamTrophies(
      teamProfile.CollegeGames || [],
      selectedTeam.ID
    );
    const processedBowlGames = processBowlGames(
      teamProfile.CollegeGames || [],
      selectedTeam.ID,
      cfbTeamMap
    );

    return {
      careerStats: Array.isArray(teamProfile.CareerStats)
        ? teamProfile.CareerStats
        : [],
      processedSeasonHistory,
      totalWins,
      totalLosses,
      playerMap: teamProfile.PlayerMap || {},
      processedRivalries,
      processedTrophies,
      processedBowlGames,
    };
  }, [selectedTeam, allCFBTeamHistory, cfbTeamMap]);

  useEffect(() => {
    if (!teamHistoryProfile) {
      setCareerStats([]);
      setCollegeStandings([]);
      setPlayerMap({});
      setRivalries([]);
      setTeamTrophies(null);
      setBowlGames([]);
      return;
    }
    setCareerStats(teamHistoryProfile.careerStats);
    setCollegeStandings(teamHistoryProfile.processedSeasonHistory);
    setTotalWins(teamHistoryProfile.totalWins);
    setTotalLosses(teamHistoryProfile.totalLosses);
    setPlayerMap(teamHistoryProfile.playerMap);
    setRivalries(teamHistoryProfile.processedRivalries);
    setTeamTrophies(teamHistoryProfile.processedTrophies);
    setBowlGames(teamHistoryProfile.processedBowlGames);
  }, [teamHistoryProfile]);

  return (
    <>
      <div className="flex w-full">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full pt-40">
            <LoadSpinner />
          </div>
        ) : (
          <div
            className="flex flex-col 
            md:grid md:grid-cols-3 
            gap-2 md:gap-4 w-[95vw] max-w-[95vw] 
            md:max-w-full md:w-full 
            md:min-h-[40em] md:max-h-[95vh] 
            h-full"
          >
            {isDesktop && (
              <div className="flex flex-col md:col-span-1 w-full items-center h-full gap-4">
                <div className="w-full h-full max-h-full overflow-y-auto">
                  <TeamSeasonHistory
                    league={league}
                    team={selectedTeam}
                    data={collegeStandings}
                    teamTrophies={teamTrophies}
                    wins={totalWins}
                    losses={totalLosses}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
                <div className="w-full h-full max-h-full overflow-y-auto">
                  <TeamBowlResults
                    league={league}
                    team={selectedTeam}
                    data={bowlGames}
                    wins={totalWins}
                    losses={totalLosses}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col w-full md:min-w-[35em] h-full items-center md:col-span-1 gap-2 md:gap-2">
              <Border
                direction="col"
                classes="w-full p-2 gap-2 items-center justify-center mb-0"
                styles={{
                  backgroundColor: backgroundColor,
                  borderColor: headerColor,
                }}
              >
                <Logo
                  url={selectedTeamLogo}
                  variant="large"
                  classes="md:h-[6em]"
                />
                <div className="flex flex-col items-center justify-center">
                  <Text variant="body" classes="font-semibold">
                    {selectedTeam?.TeamName}
                  </Text>
                  <Text variant="h2-alt" classes="font-semibold">
                    {selectedTeam?.Mascot}
                  </Text>
                </div>
                <div className="flex justify-center w-full">
                  <SelectDropdown
                    options={cfbTeamOptions}
                    placeholder="Select a team..."
                    onChange={selectTeamOption}
                  />
                </div>
              </Border>
              <div className="flex flex-col w-full h-full gap-2 md:gap-4">
                <div className="w-full h-[30em] max-h-full overflow-y-auto">
                  <TeamRivalry
                    league={league}
                    team={selectedTeam}
                    data={rivalries}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
                <div className="w-full max-h-full overflow-y-auto">
                  <TeamTrophyCabinet
                    league={league}
                    team={selectedTeam}
                    data={teamTrophies}
                    wins={totalWins}
                    losses={totalLosses}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
              </div>
            </div>
            {!isDesktop && (
              <div className="flex flex-col gap-2 md:col-span-1 w-full items-center h-full overflow-y-auto">
                <div className="w-full h-full max-h-full overflow-y-auto">
                  <TeamSeasonHistory
                    league={league}
                    team={selectedTeam}
                    data={collegeStandings}
                    teamTrophies={teamTrophies}
                    wins={totalWins}
                    losses={totalLosses}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
                <div className="w-full h-full max-h-full overflow-y-auto">
                  <TeamBowlResults
                    league={league}
                    team={selectedTeam}
                    data={bowlGames}
                    wins={totalWins}
                    losses={totalLosses}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    headerColor={headerColor}
                    darkerBackgroundColor={darkerBackgroundColor}
                    textColorClass={textColorClass}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col w-full md:col-span-1 items-center gap-2 md:gap-4 h-full">
              <div className="w-full h-full max-h-[85vh] overflow-y-auto">
                <TeamPlayerCareerStats
                  league={league}
                  team={selectedTeam}
                  data={careerStats}
                  playerMap={playerMap}
                  backgroundColor={backgroundColor}
                  borderColor={borderColor}
                  headerColor={headerColor}
                  darkerBackgroundColor={darkerBackgroundColor}
                  textColorClass={textColorClass}
                />
              </div>
              {/* <div className="w-full">
              <TeamJerseys
                league={league}
                team={selectedTeam}
                teamColors={teamColors}
                data={playerMap}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
                headerColor={headerColor}
                darkerBackgroundColor={darkerBackgroundColor}
                textColorClass={textColorClass}
              />
            </div> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

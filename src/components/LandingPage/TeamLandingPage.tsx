import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { Border } from "../../_design/Borders";
import {
  getLandingCFBData,
  getLandingNFLData,
  getLandingCBBData,
  getLandingNBAData,
  getLandingCHLData,
  getLandingPHLData,
} from "./TeamLandingPageHelper";
import * as Titles from "./TeamLandingPageTitles";
import { GetCurrentWeek } from "../../_helper/teamHelper";
import { LeagueType } from "./TeamLandingPageTitles";
import {
  GamesBar,
  TeamOverview,
  TeamStandings,
  TeamMatchUp,
  TeamMailbox,
  TeamStats,
  TeamNews,
  TeamQuickLinks,
  TeamInjuries,
} from "./TeamLandingPageComponents";
import { isBrightColor } from "../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import {
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { useResponsive } from "../../_hooks/useMobile";
import { useMemo } from "react";

interface TeamLandingPageProps {
  team: any;
  league: any;
  ts: any;
}

export const TeamLandingPage = ({ team, league, ts }: TeamLandingPageProps) => {
  const { currentUser } = useAuthStore();
  let backgroundColor = "#1f2937";
  let headerColor = team?.ColorOne || "#4B5563";
  let borderColor = team?.ColorTwo || "#4B5563";
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const {
    collegeNotifications,
    proNotifications,
    allCFBStandings,
    allProStandings,
    cfbRosterMap,
    proRosterMap,
    allCollegeGames,
    allProGames,
    collegeNews,
    proNews,
    cfbTeams,
    nflTeams,
    topNFLPassers,
    topNFLRushers,
    topNFLReceivers,
    topCFBPassers,
    topCFBReceivers,
    topCFBRushers,
    isLoadingTwo,
    playerFaces,
  } = useSimFBAStore();
  const {
    collegeNotifications: cbbNotifications,
    proNotifications: nbaNotifications,
    allCBBStandings,
    allProStandings: allNBAStandings,
    cbbRosterMap,
    proRosterMap: nbaRosterMap,
    allCollegeGames: allCBBGames,
    allProGames: allNBAGames,
    collegeNews: cbbNews,
    proNews: nbaNews,
    cbbTeams,
    nbaTeams,
    topCBBPoints,
    topCBBAssists,
    topCBBRebounds,
    topNBAPoints,
    topNBAAssists,
    topNBARebounds,
    isLoadingTwo: isLoadingBB,
  } = useSimBBAStore();
  const {
    collegeNotifications: chlNotifications,
    proNotifications: phlNotifications,
    allCHLStandings,
    allProStandings: allPHLStandings,
    chlRosterMap,
    proRosterMap: phlRosterMap,
    allCollegeGames: allCHLGames,
    allProGames: allPHLGames,
    collegeNews: chlNews,
    proNews: phlNews,
    chlTeams,
    phlTeams,
    topCHLGoals,
    topCHLAssists,
    topCHLSaves,
    topPHLGoals,
    topPHLAssists,
    topPHLSaves,
  } = useSimHCKStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const headers = Titles.headersMapping[league as LeagueType];
  const { isMobile } = useResponsive();

  const playerMap = useMemo(() => {
    let rMap: Record<number, any[]> = {};
    if (league === SimCFB && cfbRosterMap) {
      rMap = cfbRosterMap;
    } else if (league === SimNFL && proRosterMap) {
      rMap = proRosterMap;
    } else if (league === SimCBB && cbbRosterMap) {
      rMap = cbbRosterMap;
    } else if (league === SimNBA && nbaRosterMap) {
      rMap = nbaRosterMap;
    } else if (league === SimCHL && chlRosterMap) {
      rMap = chlRosterMap;
    } else if (league === SimPHL && phlRosterMap) {
      rMap = phlRosterMap;
    }

    if (!rMap) return {};
    const map: Record<
      number,
      Record<number, { FirstName: string; LastName: string; Position: string }>
    > = {};

    Object.entries(rMap).forEach(([teamId, roster]) => {
      map[Number(teamId)] = roster.reduce(
        (
          acc: {
            [x: string]: { FirstName: any; LastName: any; Position: any };
          },
          player: {
            ID: string | number;
            FirstName: any;
            LastName: any;
            Position: any;
          }
        ) => {
          acc[player.ID] = {
            FirstName: player.FirstName,
            LastName: player.LastName,
            Position: player.Position,
          };
          return acc;
        },
        {} as Record<
          number,
          { FirstName: string; LastName: string; Position: string }
        >
      );
    });

    return map;
  }, [
    league,
    chlRosterMap,
    phlRosterMap,
    cfbRosterMap,
    proRosterMap,
    cbbRosterMap,
    nbaRosterMap,
  ]);

  let teamStandings: any[] = [],
    teamNotifications: any[] = [],
    teamMatchUp: any[] = [],
    teamSchedule: any[] = [],
    homeLogo: string = "",
    awayLogo: string = "",
    homeLabel: string = "",
    awayLabel: string = "",
    teamStats: any = {},
    teamNews: any[] = [],
    gameWeek: number = 0,
    teamInjuries: any = {};

  switch (league) {
    case SimCFB:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        teamStats,
        gameWeek,
        teamInjuries,
      } = getLandingCFBData(
        team,
        currentWeek,
        league,
        currentUser,
        allCFBStandings,
        collegeNotifications,
        allCollegeGames,
        cfbTeams,
        topCFBPassers,
        topCFBRushers,
        topCFBReceivers,
        collegeNews,
        cfbRosterMap
      ));
      break;

    case SimNFL:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        teamStats,
        gameWeek,
        teamInjuries,
      } = getLandingNFLData(
        team,
        currentWeek,
        league,
        currentUser,
        allProStandings,
        proNotifications,
        allProGames,
        nflTeams,
        topNFLPassers,
        topNFLRushers,
        topNFLReceivers,
        proNews,
        proRosterMap
      ));
      break;

    case SimCBB:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        teamStats,
        gameWeek,
        teamInjuries,
      } = getLandingCBBData(
        team,
        currentWeek,
        league,
        currentUser,
        allCBBStandings,
        cbbNotifications,
        allCBBGames,
        cbbTeams,
        topCBBPoints,
        topCBBAssists,
        topCBBRebounds,
        cbbNews,
        cbbRosterMap
      ));
      break;

    case SimNBA:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        teamStats,
        gameWeek,
        teamInjuries,
      } = getLandingNBAData(
        team,
        currentWeek,
        league,
        currentUser,
        allNBAStandings,
        nbaNotifications,
        allNBAGames,
        nbaTeams,
        topNBAPoints,
        topNBAAssists,
        topNBARebounds,
        nbaNews,
        nbaRosterMap
      ));
      break;

    case SimCHL:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        teamStats,
        gameWeek,
        teamInjuries,
      } = getLandingCHLData(
        team,
        currentWeek,
        ts,
        league,
        currentUser,
        allCHLStandings,
        chlNotifications,
        allCHLGames,
        chlTeams,
        chlNews,
        topCHLGoals,
        topCHLAssists,
        topCHLSaves,
        chlRosterMap
      ));
      break;

    case SimPHL:
      ({
        teamStandings,
        teamNotifications,
        teamMatchUp,
        teamSchedule,
        homeLogo,
        awayLogo,
        homeLabel,
        awayLabel,
        teamNews,
        gameWeek,
        teamStats,
        teamInjuries,
      } = getLandingPHLData(
        team,
        currentWeek,
        ts,
        league,
        currentUser,
        allPHLStandings,
        phlNotifications,
        allPHLGames,
        phlTeams,
        phlNews,
        topPHLGoals,
        topPHLAssists,
        topPHLSaves,
        phlRosterMap
      ));
      break;

    default:
      break;
  }

  return (
    <>
      <div className="flex-col w-[90vw] md:w-full md:mb-6">
        <GamesBar
          games={teamSchedule}
          league={league}
          team={team}
          ts={ts}
          currentUser={currentUser}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
        <div className="flex-col md:flex md:flex-row gap-4 items-start w-full justify-center">
          <div className="flex md:gap-4 flex-col-reverse md:flex-row">
            <Border
              classes="border-4 py-0 px-0 h-[90vw] max-h-[90vh] w-full md:max-w-[30rem] md:h-auto"
              styles={{
                backgroundColor: borderColor,
                borderColor: backgroundColor,
              }}
            >
              {currentUser && (
                <TeamStandings
                  standings={teamStandings}
                  team={team}
                  league={league}
                  currentUser={currentUser}
                  isLoadingTwo={isLoadingTwo}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                />
              )}
            </Border>
            <div className="flex flex-col items-center md:h-auto w-full md:w-[32em] 3xl:w-[40em]">
              <Border
                classes="border-4 py-[0px] px-[0px] w-full md:h-auto md:max-h-[24em] 3xl:max-h-[36em]"
                styles={{
                  backgroundColor: borderColor,
                  borderColor: backgroundColor,
                }}
              >
                <TeamMatchUp
                  team={team}
                  week={gameWeek}
                  league={league}
                  ts={ts}
                  matchUp={teamMatchUp}
                  homeLogo={homeLogo}
                  awayLogo={awayLogo}
                  homeLabel={homeLabel}
                  awayLabel={awayLabel}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoadingTwo={isLoadingTwo}
                  playerMap={playerMap}
                />
              </Border>
              {isMobile && (
                <Border
                  classes="border-4 h-full md:h-auto py-[0px] px-[0px] w-[70%] w-full md:min-w-[18em] md:max-w-[30em] md:max-h-[40em]"
                  styles={{
                    backgroundColor: borderColor,
                    borderColor: backgroundColor,
                  }}
                >
                  <TeamInjuries
                    team={team}
                    league={league}
                    teamInjuries={teamInjuries}
                    backgroundColor={backgroundColor}
                    headerColor={headerColor}
                    borderColor={borderColor}
                    textColorClass={textColorClass}
                    darkerBackgroundColor={darkerBackgroundColor}
                    isLoadingTwo={isLoadingTwo}
                  />
                </Border>
              )}
              {isMobile && (
                <Border
                  classes="border-4 h-full md:h-auto py-[0px] px-[0px] w-[70%] w-full max-w-full md:w-full md:min-w-[18em] md:max-w-[30em] md:max-h-[35em]"
                  styles={{
                    backgroundColor: borderColor,
                    borderColor: backgroundColor,
                  }}
                >
                  <TeamQuickLinks
                    team={team}
                    league={league}
                    backgroundColor={backgroundColor}
                    headerColor={headerColor}
                    borderColor={borderColor}
                    textColorClass={textColorClass}
                    darkerBackgroundColor={darkerBackgroundColor}
                  />
                </Border>
              )}
              <div className="flex flex-row gap-2 h-[14em] w-full max-h-[14em] md:max-h-max md:gap-0 md:flex-col">
                <Border
                  classes="border-4 py-[0px] px-[0px] w-full md:min-w-[32em] md:max-h-[12em] 3xl:max-h-[16em]"
                  styles={{
                    backgroundColor: borderColor,
                    borderColor: backgroundColor,
                  }}
                >
                  <TeamMailbox
                    team={team}
                    notifications={teamNotifications}
                    backgroundColor={backgroundColor}
                    headerColor={headerColor}
                    borderColor={borderColor}
                    textColorClass={textColorClass}
                    darkerBackgroundColor={darkerBackgroundColor}
                    isLoadingTwo={isLoadingTwo}
                  />
                </Border>
                <Border
                  classes="border-4 py-[0px] px-[0px] w-full md:min-w-[32em] md:h-[22em] md:max-h-[22em] 3xl:h-[30em] 3xl:max-h-[30em]"
                  styles={{
                    backgroundColor: borderColor,
                    borderColor: backgroundColor,
                  }}
                >
                  <TeamNews
                    team={team}
                    teamNews={teamNews}
                    backgroundColor={backgroundColor}
                    headerColor={headerColor}
                    borderColor={borderColor}
                    textColorClass={textColorClass}
                    darkerBackgroundColor={darkerBackgroundColor}
                    isLoadingTwo={isLoadingTwo}
                  />
                </Border>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start pt-1 md:pt-0 h-full md:h-auto md:w-[32em] md:min-w-[20em] md:max-w-[30em] 3xl:min-w-[20em] 3xl:max-w-[42em] justify-center">
            {!isMobile && (
              <Border
                classes="border-4 h-full md:h-auto py-[0px] px-[0px] w-[70%] w-full max-w-full md:w-full md:min-w-[18em] md:max-w-[30em] md:max-h-[35em]"
                styles={{
                  backgroundColor: borderColor,
                  borderColor: backgroundColor,
                }}
              >
                <TeamQuickLinks
                  team={team}
                  league={league}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                />
              </Border>
            )}
            {!isMobile && (
              <Border
                classes="border-4 h-full md:h-auto py-[0px] px-[0px] w-[70%] md:w-full md:min-w-[18em] md:max-w-[30em] md:max-h-[40em]"
                styles={{
                  backgroundColor: borderColor,
                  borderColor: backgroundColor,
                }}
              >
                <TeamInjuries
                  team={team}
                  league={league}
                  teamInjuries={teamInjuries}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoadingTwo={isLoadingTwo}
                />
              </Border>
            )}
            <div className="flex flex-row md:flex-none md:flex-col w-full">
              <Border
                classes="border-4 h-full md:h-auto py-[0px] px-[0px] w-full md:min-w-[18em] md:max-w-[30em] md:max-h-[40em]"
                styles={{
                  backgroundColor: borderColor,
                  borderColor: backgroundColor,
                }}
              >
                <TeamStats
                  team={team}
                  league={league}
                  header="Team Statistics"
                  teamStats={teamStats}
                  titles={headers}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                  isLoadingTwo={isLoadingTwo}
                />
              </Border>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

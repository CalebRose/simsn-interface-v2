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
  TeamStandings,
  TeamMatchUp,
  TeamMailbox,
  TeamStats,
  TeamNews,
  TeamQuickLinks,
  TeamInjuries,
  ForumPortal,
} from "./TeamLandingPageComponents";
import { isBrightColor } from "../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { getThemeAwareDarkenColor } from "../../_utility/getDarkerColor";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { useCallback, useMemo } from "react";
import { getThemeColors } from "../../_utility/themeHelpers";

interface TeamLandingPageProps {
  team: any;
  league: any;
  ts: any;
}

export const TeamLandingPage = ({ team, league, ts }: TeamLandingPageProps) => {
  const { currentUser, isDarkMode } = useAuthStore();

  // Theme-aware background colors
  const themeColors = getThemeColors(isDarkMode);
  let backgroundColor = themeColors.background;

  let headerColor = team?.ColorOne || themeColors.border;
  let borderColor = team?.ColorTwo || themeColors.border;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  let darkerBackgroundColor = getThemeAwareDarkenColor(backgroundColor, -5);
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
    isLoading,
    playerFaces,
    toggleNotificationAsRead: toggleFBANotification,
    deleteNotification: deleteFBANotification,
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
    toggleNotificationAsRead: toggleBBANotification,
    deleteNotification: deleteBBANotification,
  } = useSimBBAStore();
  const {
    collegeNotifications: chlNotifications,
    proNotifications: phlNotifications,
    currentCHLStandings,
    currentProStandings,
    currentCollegeSeasonGames,
    currentProSeasonGames,
    chlRosterMap,
    proRosterMap: phlRosterMap,
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
    toggleNotificationAsRead: toggleHCKNotification,
    deleteNotification: deleteHCKNotification,
  } = useSimHCKStore();
  const currentWeek = GetCurrentWeek(league, ts);
  const headers = Titles.headersMapping[league as LeagueType];

  const toggleNotificationAsRead = useCallback(
    (league: League, id: number) => {
      switch (league) {
        case SimCFB:
          toggleFBANotification(id, false);
          break;
        case SimNFL:
          toggleFBANotification(id, true);
          break;
        case SimCBB:
          toggleBBANotification(id, false);
          break;
        case SimNBA:
          toggleBBANotification(id, true);
          break;
        case SimCHL:
          toggleHCKNotification(id, false);
          break;
        case SimPHL:
          toggleHCKNotification(id, true);
          break;
        default:
          break;
      }
    },
    [
      league,
      toggleFBANotification,
      toggleBBANotification,
      toggleHCKNotification,
    ],
  );

  const deleteNotification = useCallback(
    (league: League, id: number) => {
      switch (league) {
        case SimCFB:
          deleteFBANotification(id, false);
          break;
        case SimNFL:
          deleteFBANotification(id, true);
          break;
        case SimCBB:
          deleteBBANotification(id, false);
          break;
        case SimNBA:
          deleteBBANotification(id, true);
          break;
        case SimCHL:
          deleteHCKNotification(id, false);
          break;
        case SimPHL:
          deleteHCKNotification(id, true);
          break;
        default:
          break;
      }
    },
    [
      league,
      deleteFBANotification,
      deleteBBANotification,
      deleteHCKNotification,
    ],
  );

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
          },
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
        >,
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

  const {
    teamStandings = [],
    teamNotifications = [],
    teamMatchUp = [],
    teamSchedule = [],
    homeLogo = "",
    awayLogo = "",
    homeLabel = "",
    awayLabel = "",
    teamStats = {},
    teamNews = [],
    gameWeek = 0,
    teamInjuries = {},
  } = useMemo((): Record<string, any> => {
    switch (league) {
      case SimCFB:
        return getLandingCFBData(
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
          cfbRosterMap,
        );

      case SimNFL:
        return getLandingNFLData(
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
          proRosterMap,
        );

      case SimCBB:
        if (!ts) return {};
        return getLandingCBBData(
          team,
          currentWeek,
          ts,
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
          cbbRosterMap,
        );

      case SimNBA:
        if (!ts) return {};
        return getLandingNBAData(
          team,
          currentWeek,
          ts,
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
          nbaRosterMap,
        );

      case SimCHL:
        if (!ts) return {};
        return getLandingCHLData(
          team,
          currentWeek,
          ts,
          league,
          currentUser,
          currentCHLStandings || [],
          chlNotifications,
          currentCollegeSeasonGames || [],
          chlTeams,
          chlNews,
          topCHLGoals,
          topCHLAssists,
          topCHLSaves,
          chlRosterMap,
        );

      case SimPHL:
        if (!ts) return {};
        return getLandingPHLData(
          team,
          currentWeek,
          ts,
          league,
          currentUser,
          currentProStandings || [],
          phlNotifications,
          currentProSeasonGames || [],
          phlTeams,
          phlNews,
          topPHLGoals,
          topPHLAssists,
          topPHLSaves,
          phlRosterMap,
        );

      default:
        return {};
    }
  }, [
    league,
    ts,
    team,
    currentWeek,
    currentUser,
    allCFBStandings,
    collegeNotifications,
    allCollegeGames,
    cfbTeams,
    topCFBPassers,
    topCFBRushers,
    topCFBReceivers,
    collegeNews,
    cfbRosterMap,
    allProStandings,
    proNotifications,
    allProGames,
    nflTeams,
    topNFLPassers,
    topNFLRushers,
    topNFLReceivers,
    proNews,
    proRosterMap,
    allCBBStandings,
    cbbNotifications,
    allCBBGames,
    cbbTeams,
    topCBBPoints,
    topCBBAssists,
    topCBBRebounds,
    cbbNews,
    cbbRosterMap,
    allNBAStandings,
    nbaNotifications,
    allNBAGames,
    nbaTeams,
    topNBAPoints,
    topNBAAssists,
    topNBARebounds,
    nbaNews,
    nbaRosterMap,
    currentCHLStandings,
    chlNotifications,
    currentCollegeSeasonGames,
    chlTeams,
    topCHLGoals,
    topCHLAssists,
    topCHLSaves,
    chlNews,
    chlRosterMap,
    currentProStandings,
    phlNotifications,
    currentProSeasonGames,
    phlTeams,
    topPHLGoals,
    topPHLAssists,
    topPHLSaves,
    phlNews,
    phlRosterMap,
  ]);

  return (
    <>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:w-[85vw] items-start">
          {/* Column 1: Standings */}
          <div className="flex flex-col gap-4">
            {currentUser && (
              <Border
                classes="border-4 py-0 px-0 w-full h-[50vh] md:h-full"
                styles={{
                  backgroundColor: borderColor,
                  borderColor: backgroundColor,
                }}
              >
                <TeamStandings
                  standings={teamStandings}
                  team={team}
                  league={league}
                  currentUser={currentUser}
                  isLoading={isLoading}
                  backgroundColor={backgroundColor}
                  headerColor={headerColor}
                  borderColor={borderColor}
                  textColorClass={textColorClass}
                  darkerBackgroundColor={darkerBackgroundColor}
                />
              </Border>
            )}
          </div>

          {/* Column 2: MatchUp, Forum, News */}
          <div className="flex flex-col gap-4">
            <Border
              classes="border-4 py-0 px-0 w-full"
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
                isLoading={isLoading}
                playerMap={playerMap}
              />
            </Border>
            <Border
              classes="border-4 py-0 px-0 w-full h-[35vh] max-h-[35vh]"
              styles={{
                backgroundColor: borderColor,
                borderColor: backgroundColor,
              }}
            >
              <ForumPortal
                team={team}
                league={league}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
              />
            </Border>
            <Border
              classes="border-4 py-0 px-0 w-full"
              styles={{
                backgroundColor: borderColor,
                borderColor: backgroundColor,
              }}
            >
              <TeamNews
                team={team}
                teamNews={teamNews}
                isLoading={isLoading}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
              />
            </Border>
          </div>

          {/* Column 3: QuickLinks, Injuries, Stats */}
          <div className="flex flex-col gap-4">
            <Border
              classes="border-4 py-0 px-0 w-full"
              styles={{
                backgroundColor: borderColor,
                borderColor: backgroundColor,
              }}
            >
              <TeamQuickLinks
                team={team}
                league={league}
                ts={ts}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                textColorClass={textColorClass}
                darkerBackgroundColor={darkerBackgroundColor}
              />
            </Border>
            <Border
              classes="border-4 py-0 px-0 w-full"
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
                isLoading={isLoading}
              />
            </Border>
            <Border
              classes="border-4 py-0 px-0 w-full"
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
                isLoading={isLoading}
              />
            </Border>
          </div>
        </div>
      </div>
    </>
  );
};

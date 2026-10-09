import { FC, ReactNode, useMemo, useState } from "react";
import { useResponsive } from "../../../_hooks/useMobile";
import { getLogo } from "../../../_utility/getLogo";
import { Text } from "../../../_design/Typography";
import { Logo } from "../../../_design/Logo";
import { Button } from "../../../_design/Buttons";
import {
  League,
  SimCBB,
  SimCHL,
  SimNBA,
  SimPHL,
  TeamGames,
} from "../../../_constants/constants";
import { SectionCards } from "../../../_design/SectionCards";
import { InformationCircle } from "../../../_design/Icons";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import {
  getSimNBADivision,
  getSimNFLDivision,
  processLeagueStandings,
} from "./SchedulePageHelper";
import {
  ClickableGameLabel,
  ClickableTeamLabel,
  ClickableUserLabel,
  TeamLabel,
} from "../../Common/Labels";
import { useModal } from "../../../_hooks/useModal";
import { SchedulePageGameModal } from "./GameModal";
import { SimCFB, SimNFL } from "../../../_constants/constants";
import {
  CollegeTeam as CFBTeam,
  CollegeGame as CFBGame,
  CollegeStandings as CFBStandings,
  NFLTeam,
  NFLGame,
  NFLStandings,
} from "../../../models/footballModels";
import {
  CollegeTeam as CHLTeam,
  CollegeGame as CHLGame,
  ProfessionalGame as PHLGame,
  CollegeStandings as CHLStandings,
  ProfessionalStandings as PHLStandings,
  ProfessionalTeam,
} from "../../../models/hockeyModels";
import {
  Team as CBBTeam,
  Match as CBBGame,
  NBAMatch as NBAGame,
  NBATeam,
  NBAStandings,
  CollegeStandings as CBBStandings,
} from "../../../models/basketballModels";
import { useAdvancedSchedule } from "./useAdvancedSchedule";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { Table, TableCell } from "../../../_design/Table";
import { Span } from "../../../_design/Span";
import { Player } from "../../../models/baseball/baseballModels";
import { useAdvancedStandings } from "./useAdvancedStandings";
import {
  getSimCHLConference,
  getSimPHLDivision,
  getSimPHLConference,
} from "./SchedulePageHelper";

interface TeamScheduleProps {
  team: any;
  Abbr?: string;
  category?: string;
  playerMap?: any;
  teamMap?: any;
  teamRecordMap?: Record<number, string>;
  week: any;
  currentUser: any;
  league: League;
  ts: any;
  processedSchedule: any[];
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
  isLoading: boolean;
}

export const TeamSchedule = ({
  team,
  Abbr,
  category,
  currentUser,
  playerMap,
  teamMap,
  teamRecordMap,
  week,
  league,
  ts,
  processedSchedule,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoading: isLoading,
}: TeamScheduleProps) => {
  const gameModal = useModal();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const isFootball = league === SimCFB || league === SimNFL ? true : false;
  const { isUltraWide } = useResponsive();
  let gridColumns = useMemo(() => {
    if (isFootball) {
      return isUltraWide ? "grid-cols-9" : "grid-cols-7";
    } else {
      return isUltraWide ? "grid-cols-7" : "grid-cols-5";
    }
  }, [isFootball, isUltraWide]);

  return (
    <>
      <SectionCards
        header={`${Abbr}${
          team && teamRecordMap && teamRecordMap[team?.ID]
            ? ` (${teamRecordMap[team.ID]})`
            : ""
        } Schedule`}
        team={team}
        classes={`w-full ${textColorClass}`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        textColorClass={textColorClass}
        darkerBackgroundColor={darkerBackgroundColor}
      >
        {isLoading ? (
          <div className="flex justify-center items-center pb-2">
            <Text variant="small" classes={`${textColorClass}`}>
              Loading...
            </Text>
          </div>
        ) : (
          <div className="grid">
            <div
              className={`grid ${gridColumns} font-semibold border-b-2 pb-2`}
              style={{
                borderColor,
              }}
            >
              <div className="text-left col-span-1">
                <Text variant="xs" className={`${textColorClass}`}>
                  Week
                </Text>
              </div>
              {isFootball && (
                <div className="text-left col-span-2">
                  <Text variant="xs" className={`${textColorClass}`}>
                    Timeslot
                  </Text>
                </div>
              )}
              <div className="text-left col-span-2">
                <Text variant="xs" className={`${textColorClass}`}>
                  Opponent
                </Text>
              </div>
              {isUltraWide && (
                <div className="text-left col-span-1">
                  <Text variant="xs" className={`${textColorClass}`}>
                    Location
                  </Text>
                </div>
              )}
              {isUltraWide && (
                <div className="text-left col-span-1">
                  <Text variant="xs" className={`${textColorClass}`}>
                    Attendance
                  </Text>
                </div>
              )}
              <div className="text-center col-span-1">
                <Text variant="xs" className={`${textColorClass}`}>
                  Result
                </Text>
              </div>
              <div className="text-center col-span-1">
                <Text variant="xs" className={`${textColorClass}`}>
                  Actions
                </Text>
              </div>
            </div>
            <SchedulePageGameModal
              isOpen={gameModal.isModalOpen}
              onClose={gameModal.handleCloseModal}
              league={league}
              game={selectedGame}
              title={`${selectedGame?.HomeTeamAbbr} vs ${selectedGame?.AwayTeamAbbr}`}
              playerMap={playerMap}
              teamMap={teamMap}
            />
            {processedSchedule &&
              processedSchedule.map((game, index) => (
                <div
                  key={`${game.ID}-${game.Week}-${index}`}
                  className={`grid ${
                    gridColumns
                  } border-b border-b-[#34455d] items-center`}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? darkerBackgroundColor : backgroundColor,
                    order: index, // Force display order for Safari mobile
                  }}
                >
                  <div className="text-left col-span-1">
                    <Text variant="xs" className="font-semibold">
                      {game.weekLabel}
                    </Text>
                  </div>
                  {isFootball && (
                    <div className="text-left col-span-2">
                      <Text variant="xs" className="font-semibold opacity-70">
                        {game.TimeSlot &&
                          game.TimeSlot.split(" ").slice(0, 2).join(" ")}
                      </Text>
                    </div>
                  )}
                  <div className="flex items-center col-span-2 justify-start text-center">
                    <Text variant="xs" className="font-semibold text-center">
                      {game.gameLocation}
                    </Text>
                    <Logo
                      variant="xs"
                      classes="w-4 h-4"
                      containerClass="shrink-0 p-2"
                      url={game.opponentLogo}
                    />
                    <ClickableTeamLabel
                      textVariant="xs"
                      label={`${game.opponentLabel}${
                        teamRecordMap && teamRecordMap[game.opponentID]
                          ? ` (${teamRecordMap[game.opponentID]})`
                          : ""
                      }${game.IsNeutralSite || game.IsNeutral ? " (N)" : ""}`}
                      teamID={game.opponentID}
                      textColorClass={textColorClass}
                      league={league}
                    />
                  </div>
                  {isUltraWide && (
                    <div className="text-left col-span-1">
                      <Text variant="xs" className="font-semibold opacity-70">
                        {!isFootball ? game.Arena : game.Stadium}
                      </Text>
                    </div>
                  )}
                  {isUltraWide && (
                    <div className="text-left col-span-1">
                      <Text variant="xs" className="font-semibold opacity-70">
                        {game.AttendanceCount || "?"}
                      </Text>
                    </div>
                  )}
                  <div className="text-center col-span-1">
                    <ClickableGameLabel
                      textColorClass={`${
                        game.userWin
                          ? "text-green-500"
                          : game.userLoss
                            ? "text-red-500"
                            : textColorClass
                      } ${
                        game.gameScore === "TBC"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disable={game.gameScore === "TBC"}
                      openModal={() => {
                        setSelectedGame(game);
                        gameModal.handleOpenModal();
                      }}
                      label={game.headerGameScore}
                    />
                  </div>
                  <div className="flex text-center justify-center col-span-1">
                    <Button
                      size="sm"
                      classes={`flex bg-transparent rounded-full size-10 items-center ${
                        game.gameScore === "TBC"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={game.gameScore === "TBC"}
                      onClick={() => {
                        setSelectedGame(game);
                        gameModal.handleOpenModal();
                      }}
                    >
                      <InformationCircle />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </SectionCards>
    </>
  );
};

export const WeeklySchedule = ({
  team,
  Abbr,
  category,
  currentUser,
  playerMap,
  teamMap,
  teamRecordMap,
  week,
  league,
  ts,
  processedSchedule,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoading: isLoading,
}: TeamScheduleProps) => {
  const gameModal = useModal();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const isFootball = league === SimCFB || league === SimNFL ? true : false;

  return (
    <SectionCards
      header={`Week ${week}`}
      team={team}
      classes={`w-full ${textColorClass}`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      textColorClass={textColorClass}
      darkerBackgroundColor={darkerBackgroundColor}
    >
      {isLoading ? (
        <div className="flex justify-center items-center pb-2">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : (
        <div className="grid">
          <div
            className={`grid ${
              isFootball ? "grid-cols-9" : "grid-cols-7"
            } font-semibold border-b-2 pb-2`}
            style={{
              borderColor,
            }}
          >
            <div className="text-left col-span-1">
              <Text variant="xs" className={`${textColorClass}`}>
                Week
              </Text>
            </div>
            {isFootball && (
              <div className="text-left col-span-2">
                <Text variant="xs" className={`${textColorClass}`}>
                  Timeslot
                </Text>
              </div>
            )}
            <div className="text-left col-span-2 pl-4">
              <Text variant="xs" className={`${textColorClass}`}>
                Home
              </Text>
            </div>
            <div className="text-left col-span-2 pl-4">
              <Text variant="xs" className={`${textColorClass}`}>
                Away
              </Text>
            </div>
            <div className="text-center col-span-1">
              <Text variant="xs" className={`${textColorClass}`}>
                Result
              </Text>
            </div>
            <div className="text-center col-span-1">
              <Text variant="xs" className={`${textColorClass}`}>
                Actions
              </Text>
            </div>
          </div>
          <SchedulePageGameModal
            isOpen={gameModal.isModalOpen}
            onClose={gameModal.handleCloseModal}
            league={league}
            game={selectedGame}
            title={`${selectedGame?.HomeTeamAbbr} vs ${selectedGame?.AwayTeamAbbr}`}
            playerMap={playerMap}
            teamMap={teamMap}
          />
          {processedSchedule.map((game, index) => {
            const homeTeam = teamMap[game.HomeTeamID];
            const awayTeam = teamMap[game.AwayTeamID];
            const homeTeamLabel = homeTeam
              ? homeTeam.TeamName || homeTeam.Team
              : "N/A";
            const awayTeamLabel = awayTeam
              ? awayTeam.TeamName || awayTeam.Team
              : "N/A";
            const homeRecord = teamRecordMap?.[game.HomeTeamID];
            const awayRecord = teamRecordMap?.[game.AwayTeamID];

            return (
              <div
                key={`${game.ID}-${game.Week}-${index}`}
                className={`grid ${
                  isFootball ? "grid-cols-9" : "grid-cols-7"
                } border-b border-b-[#34455d] items-center`}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? darkerBackgroundColor : backgroundColor,
                  order: index, // Force display order for Safari mobile
                }}
              >
                <div className="text-left col-span-1">
                  <Text variant="xs" className="font-semibold">
                    {week}
                    {game.GameDay || game.MatchOfWeek}
                  </Text>
                </div>
                {isFootball && (
                  <div className="text-left col-span-2">
                    <Text variant="xs" className="font-semibold opacity-70">
                      {game.TimeSlot.split(" ").slice(0, 2).join(" ")}
                    </Text>
                  </div>
                )}
                <div className="flex items-center col-span-2 text-left">
                  <Logo
                    variant="xs"
                    classes="w-4 h-4"
                    containerClass="shrink-0 p-2"
                    url={getLogo(league, game.HomeTeamID, currentUser?.IsRetro)}
                  />
                  <ClickableTeamLabel
                    textVariant="xs"
                    label={`${homeTeamLabel}${
                      homeRecord ? ` (${homeRecord})` : ""
                    }`}
                    teamID={game.HomeTeamID}
                    textColorClass={textColorClass}
                    league={league}
                  />
                </div>
                <div className="flex items-center col-span-2 text-left">
                  <Logo
                    variant="xs"
                    classes="w-4 h-4"
                    containerClass="shrink-0 p-2"
                    url={getLogo(league, game.AwayTeamID, currentUser?.IsRetro)}
                  />
                  <ClickableTeamLabel
                    textVariant="xs"
                    label={`${awayTeamLabel}${
                      awayRecord ? ` (${awayRecord})` : ""
                    }`}
                    teamID={game.AwayTeamID}
                    textColorClass={textColorClass}
                    league={league}
                  />
                </div>
                <div className="text-center col-span-1">
                  <ClickableGameLabel
                    textColorClass={`${
                      game.gameScore === "TBC" ? "opacity-50" : ""
                    }`}
                    disable={game.gameScore === "TBC"}
                    openModal={() => {
                      setSelectedGame(game);
                      gameModal.handleOpenModal();
                    }}
                    label={`${game.headerGameScore}${game.IsNeutralSite || game.IsNeutral ? " (N)" : ""}`}
                  />
                </div>
                <div className="flex text-center justify-center col-span-1">
                  <Button
                    size="sm"
                    classes={`flex bg-transparent rounded-full size-10 items-center ${
                      game.gameScore === "TBC"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={game.gameScore === "TBC"}
                    onClick={() => {
                      setSelectedGame(game);
                      gameModal.handleOpenModal();
                    }}
                  >
                    <InformationCircle />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCards>
  );
};

interface TeamStandingsProps {
  standings: any[];
  team: any;
  league: League;
  currentUser: any;
  isLoading: boolean;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
  teamStandingsRecordThatSeason?: any | null;
}

export const TeamStandings = ({
  standings,
  team,
  league,
  currentUser,
  isLoading,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  teamStandingsRecordThatSeason,
}: TeamStandingsProps) => {
  return (
    <SectionCards
      team={team}
      header={`${teamStandingsRecordThatSeason?.ConferenceName || team.Conference} Standings`}
      classes={`${textColorClass}, h-full`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : (
        <div className="grid">
          <div
            className={`grid ${league === SimCHL || league === SimPHL ? "grid-cols-9" : "grid-cols-7"} font-semibold border-b-2 pb-2`}
            style={{
              borderColor,
            }}
          >
            <div className="text-left col-span-1 ">
              <Text variant="xs" className={`${textColorClass}`}>
                Rank
              </Text>
            </div>
            <div className="text-center col-span-2 ">
              <Text variant="xs" className={`${textColorClass}`}>
                Team
              </Text>
            </div>
            <div className="text-center col-span-1 ">
              <Text variant="xs" className={`${textColorClass}`}>
                C.W
              </Text>
            </div>
            <div className="text-center col-span-1 ">
              <Text variant="xs" className={`${textColorClass}`}>
                C.L
              </Text>
            </div>
            {(league === SimCHL || league === SimPHL) && (
              <div className="text-center col-span-1 ">
                <Text variant="xs" className={`${textColorClass}`}>
                  C.OT.L
                </Text>
              </div>
            )}
            <div className="text-center col-span-1 ">
              <Text variant="xs" className={`${textColorClass}`}>
                T.W
              </Text>
            </div>
            <div className="text-center col-span-1 ">
              <Text variant="xs" className={`${textColorClass}`}>
                T.L
              </Text>
            </div>
            {(league === SimCHL || league === SimPHL) && (
              <div className="text-center col-span-1 ">
                <Text variant="xs" className={`${textColorClass}`}>
                  OT.L
                </Text>
              </div>
            )}
          </div>
          {standings.map((standing, index) => (
            <div
              key={index}
              className={`grid ${league === SimCHL || league === SimPHL ? "grid-cols-9" : "grid-cols-7"} border-b border-b-[#34455d] items-center`}
              style={{
                backgroundColor:
                  index % 2 === 0 ? darkerBackgroundColor : backgroundColor,
              }}
            >
              <div className="text-left pl-1 col-span-1 flex items-center">
                <Text variant="xs" className="font-semibold">
                  {standing.Rank}
                </Text>
              </div>
              <div className="flex text-left w-full mx-auto justify-start col-span-2 pl-1 items-center">
                <Logo
                  variant="xs"
                  classes="w-4 h-4 p-0"
                  containerClass="shrink-0 p-2"
                  url={getLogo(league, standing.TeamID, currentUser?.IsRetro)}
                />
                <ClickableTeamLabel
                  textVariant="xs"
                  label={standing.TeamAbbr}
                  teamID={standing.TeamID}
                  textColorClass={textColorClass}
                  league={league}
                />
              </div>
              <div className="text-center flex col-span-1 items-center justify-center">
                <Text variant="xs" className="font-semibold">
                  {standing.ConferenceWins}
                </Text>
              </div>
              <div className="text-center flex col-span-1 items-center justify-center">
                <Text variant="xs" className="font-semibold">
                  {standing.ConferenceLosses}
                </Text>
              </div>
              {(league === SimCHL || league === SimPHL) && (
                <div className="text-center col-span-1 ">
                  <Text variant="xs" className={`font-semibold`}>
                    {standing.ConferenceOTLosses}
                  </Text>
                </div>
              )}
              <div className="text-center flex col-span-1 items-center justify-center">
                <Text variant="xs" className="font-semibold">
                  {standing.TotalWins}
                </Text>
              </div>
              <div className="text-center flex col-span-1 items-center justify-center">
                <Text variant="xs" className="font-semibold">
                  {standing.TotalLosses}
                </Text>
              </div>
              {(league === SimCHL || league === SimPHL) && (
                <div className="text-center col-span-1 ">
                  <Text variant="xs" className={`font-semibold`}>
                    {standing.TotalOTLosses}
                  </Text>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCards>
  );
};

interface LeagueStandingsProps {
  standings: any[];
  conferenceNames?: any[];
  league: League;
  category?: string;
  currentUser: any;
  isLoading: boolean;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
}

export const LeagueStandings = ({
  standings,
  conferenceNames,
  league,
  category,
  currentUser,
  isLoading,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
}: LeagueStandingsProps) => {
  const { groupedStandings, sortedGroupNames } = useMemo(() => {
    let customOrder =
      category === "Divisions"
        ? ["Atlantic", "Metropolitan", "Central", "Pacific"]
        : [
            "ACC",
            "Big Ten",
            "Big 12",
            "SEC",
            "Pac-12",
            "Independent",
            "American",
            "C-USA",
            "MAC",
            "Mountain West",
            "SunBelt",
          ];
    if (league === SimNBA) {
      customOrder = [
        "Western",
        "Eastern",
        "Euroleague",
        "Liga Mediterranea",
        "Northern Europa",
        "AsiaLeague",
        "Oceania League",
        "Liga das Americas",
        "LeagueAfrica",
        "The Gulf League",
      ];
    }

    return processLeagueStandings(standings, customOrder, league, category);
  }, [standings, league, category]);

  return (
    <div className="flex flex-wrap gap-4">
      {isLoading ? (
        <div className="flex justify-center items-center w-full">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : (
        sortedGroupNames.map((groupName) => {
          const groupStandings = groupedStandings[groupName].map(
            (team: any, index: number) => ({
              ...team,
              Rank: index + 1,
            }),
          );

          return (
            <div key={groupName} className="flex flex-row sm:items-stretch">
              <SectionCards
                team={null}
                header={`${groupName} Standings`}
                classes={`${textColorClass}, h-full w-[95vw] sm:w-[40em]`}
                backgroundColor={backgroundColor}
                headerColor={headerColor}
                borderColor={borderColor}
                darkerBackgroundColor={darkerBackgroundColor}
                textColorClass={textColorClass}
              >
                <div className="grid">
                  <div
                    className={`grid ${league === SimCHL || league === SimPHL ? "grid-cols-9" : "grid-cols-7"} font-semibold border-b-2 pb-2`}
                    style={{
                      borderColor,
                    }}
                  >
                    <div className="text-left col-span-1 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        Rank
                      </Text>
                    </div>
                    <div className="text-center col-span-2 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        Team
                      </Text>
                    </div>
                    <div className="text-center col-span-1 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        C.W
                      </Text>
                    </div>
                    <div className="text-center col-span-1 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        C.L
                      </Text>
                    </div>
                    {(league === SimCHL || league === SimPHL) && (
                      <div className="text-center col-span-1 ">
                        <Text variant="xs" className={`${textColorClass}`}>
                          C.OT.L
                        </Text>
                      </div>
                    )}
                    <div className="text-center col-span-1 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        T.W
                      </Text>
                    </div>
                    <div className="text-center col-span-1 ">
                      <Text variant="xs" className={`${textColorClass}`}>
                        T.L
                      </Text>
                    </div>
                    {(league === SimCHL || league === SimPHL) && (
                      <div className="text-center col-span-1 ">
                        <Text variant="xs" className={`${textColorClass}`}>
                          OT.L
                        </Text>
                      </div>
                    )}
                  </div>
                  {groupStandings.map((standing: any, index: number) => (
                    <div
                      key={index}
                      className={`grid ${league === SimCHL || league === SimPHL ? "grid-cols-9" : "grid-cols-7"} border-b border-b-[#34455d] items-center`}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? darkerBackgroundColor
                            : backgroundColor,
                      }}
                    >
                      <div className="text-left pl-1 col-span-1 flex items-center">
                        <Text variant="xs" className="font-semibold">
                          {standing.Rank}
                        </Text>
                      </div>
                      <div className="flex text-left w-full mx-auto justify-start col-span-2 pl-1 items-center">
                        <Logo
                          variant="xs"
                          classes="w-4 h-4 p-0"
                          containerClass="shrink-0 p-2"
                          url={getLogo(
                            league,
                            standing.TeamID,
                            currentUser?.IsRetro,
                          )}
                        />
                        <ClickableTeamLabel
                          textVariant="xs"
                          label={standing.TeamAbbr}
                          teamID={standing.TeamID}
                          textColorClass={textColorClass}
                          league={league}
                        />
                      </div>
                      <div className="text-center flex col-span-1 items-center justify-center">
                        <Text variant="xs" className="font-semibold">
                          {standing.ConferenceWins}
                        </Text>
                      </div>
                      <div className="text-center flex col-span-1 items-center justify-center">
                        <Text variant="xs" className="font-semibold">
                          {standing.ConferenceLosses}
                        </Text>
                      </div>
                      {(league === SimCHL || league === SimPHL) && (
                        <div className="text-center col-span-1 ">
                          <Text variant="xs" className={`font-semibold`}>
                            {standing.ConferenceOTLosses}
                          </Text>
                        </div>
                      )}
                      <div className="text-center flex col-span-1 items-center justify-center">
                        <Text variant="xs" className="font-semibold">
                          {standing.TotalWins}
                        </Text>
                      </div>
                      <div className="text-center flex col-span-1 items-center justify-center">
                        <Text variant="xs" className="font-semibold">
                          {standing.TotalLosses}
                        </Text>
                      </div>
                      {(league === SimCHL || league === SimPHL) && (
                        <div className="text-center col-span-1 ">
                          <Text variant="xs" className={`font-semibold`}>
                            {standing.TotalOTLosses}
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCards>
            </div>
          );
        })
      )}
    </div>
  );
};

interface LeagueStatsProps {
  league: League;
  topPassers: any[];
  topRushers: any[];
  topReceivers: any[];
  titles: string[];
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
  isLoading: boolean;
}

export const LeagueStats = ({
  league,
  topPassers,
  topRushers,
  topReceivers,
  titles,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoading,
}: LeagueStatsProps) => {
  const renderStatCard = (title: string, stats: any[]) => (
    <SectionCards
      team={null}
      header={title}
      classes={`${textColorClass}`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      textColorClass={textColorClass}
      darkerBackgroundColor={darkerBackgroundColor}
    >
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[5em] w-full">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : stats.length > 0 ? (
        <div className="flex items-center justify-center pt-2 gap-2">
          {stats.map((player, index) => (
            <div
              key={index}
              className="flex flex-col justify-center items-center p-2 rounded-lg border w-[14em]"
              style={{
                borderColor: headerColor,
                backgroundColor: darkerBackgroundColor,
              }}
            >
              <div
                className={`flex my-1 items-center justify-center 
                                    px-3 h-12 min-h-12 md:h-24 w-24 max-w-20 rounded-lg border-2`}
                style={{ borderColor: borderColor, backgroundColor: "white" }}
              >
                <PlayerPicture
                  player={player}
                  playerID={player.id}
                  league={league}
                  team={player.team}
                />
              </div>
              <div className="flex flex-col text-center items-center w-full">
                <Text variant="xs" classes={`${textColorClass} font-semibold`}>
                  {player.name}, {player.teamAbbr}
                </Text>
                <Text variant="xs" classes={`${textColorClass}`}>
                  {player.stat1}: {player.stat1Value}
                </Text>
                <Text variant="xs" classes={`${textColorClass}`}>
                  {player.stat2}: {player.stat2Value}
                </Text>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Text variant="small" classes={`${textColorClass} pt-2`}>
          No stats available.
        </Text>
      )}
    </SectionCards>
  );

  return (
    <div className="flex flex-col space-y-4">
      {renderStatCard(titles[0], topPassers)}
      {renderStatCard(titles[1], topRushers)}
      {renderStatCard(titles[2], topReceivers)}
    </div>
  );
};

interface AdvancedScheduleProps {
  team: any;
  processedSchedule:
    | CFBGame[]
    | NFLGame[]
    | CHLGame[]
    | PHLGame[]
    | CBBGame[]
    | NBAGame[];
  league: League;
  currentWeek: number;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
  isLoading: boolean;
  view: string;
  isPreseason?: boolean;
  resultsOverride?: boolean;
  currentUser: any;
}

interface HCKAdvancedGameRowProps {
  league: League;
  game: CHLGame | PHLGame;
  idx: number;
  bg: string;
  setSelectedGame: (game: CHLGame | PHLGame) => void;
  openModal: () => void;
  playerMap: Record<number, any>;
  resultsOverride: boolean;
  currentUser: any;
}

const HCKAdvancedGameRow: FC<HCKAdvancedGameRowProps> = ({
  league,
  game,
  idx,
  bg,
  setSelectedGame,
  openModal,
  playerMap,
  resultsOverride,
  currentUser,
}) => {
  const handleClick = () => {
    if (!game.GameComplete || !game.IsRevealed || resultsOverride) return;
    setSelectedGame(game);
    openModal();
  };
  const homeTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.HomeTeamScore > game.AwayTeamScore) return "text-green-500";
    if (game.HomeTeamScore < game.AwayTeamScore) return "text-red-500";
    if (game.HomeTeamShootoutScore > game.AwayTeamShootoutScore)
      return "text-green-500";
    if (game.HomeTeamShootoutScore < game.AwayTeamShootoutScore)
      return "text-red-500";
    return "text-gray-500";
  })();

  const awayTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.AwayTeamScore > game.HomeTeamScore) return "text-green-500";
    if (game.AwayTeamScore < game.HomeTeamScore) return "text-red-500";
    if (game.AwayTeamShootoutScore > game.HomeTeamShootoutScore)
      return "text-green-500";
    if (game.AwayTeamShootoutScore < game.HomeTeamShootoutScore)
      return "text-red-500";
    return "text-gray-500";
  })();
  const starOneLabel = (() => {
    const player = playerMap[game.StarOne];
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  })();
  const starTwoLabel = (() => {
    const player = playerMap[game.StarTwo];
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  })();
  const starThreeLabel = (() => {
    const player = playerMap[game.StarThree];
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  })();
  const homeTeamLogo = (() => {
    let logo = getLogo(league, game.HomeTeamID, currentUser?.IsRetro);
    return logo;
  })();
  const awayTeamLogo = (() => {
    let logo = getLogo(league, game.AwayTeamID, currentUser?.IsRetro);
    return logo;
  })();

  const homeScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.HomeTeamScore}${game.IsShootout ? ` (${game.HomeTeamShootoutScore})` : ""}`;
  })();
  const awayScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.AwayTeamScore}${game.IsShootout ? ` (${game.AwayTeamShootoutScore})` : ""}`;
  })();
  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <Span onClick={handleClick}>{game.ID}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>
          {game.Week}
          {game.GameDay}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.GameTitle}</Span>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.AwayTeamCoach || "AI"}
          label={game.AwayTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <Logo url={awayTeamLogo} variant="tiny" />
          <ClickableTeamLabel
            label={game.AwayTeam}
            textVariant="xs"
            teamID={game.AwayTeamID}
            league={league}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.AwayTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${awayTeamColor}`}>
          {awayScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${homeTeamColor}`}>
          {homeScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.HomeTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <ClickableTeamLabel
            label={game.HomeTeam}
            textVariant="xs"
            teamID={game.HomeTeamID}
            league={league}
          />
          <Logo url={homeTeamLogo} variant="tiny" />
        </div>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.HomeTeamCoach || "AI"}
          label={game.HomeTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Arena}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.City}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.State}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Country}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.AttendanceCount}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{starOneLabel}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{starTwoLabel}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{starThreeLabel}</Span>
      </TableCell>
    </div>
  );
};

interface FBAdvancedGameRowProps {
  game: CFBGame | NFLGame;
  idx: number;
  bg: string;
  setSelectedGame: (game: CFBGame | NFLGame) => void;
  openModal: () => void;
  playerMap: Record<number, any>;
  league: League;
  resultsOverride: boolean;
  currentUser: any;
}

const FBAdvancedGameRow: FC<FBAdvancedGameRowProps> = ({
  game,
  idx,
  bg,
  setSelectedGame,
  openModal,
  playerMap,
  league,
  resultsOverride,
  currentUser,
}) => {
  const handleClick = () => {
    if (!game.GameComplete || !game.IsRevealed) return;
    setSelectedGame(game);
    openModal();
  };
  const homeTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.HomeTeamScore > game.AwayTeamScore) return "text-green-500";
    if (game.HomeTeamScore < game.AwayTeamScore) return "text-red-500";
    return "text-gray-500";
  })();

  const awayTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.AwayTeamScore > game.HomeTeamScore) return "text-green-500";
    if (game.AwayTeamScore < game.HomeTeamScore) return "text-red-500";
    return "text-gray-500";
  })();
  const mvpLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "";
    const player = playerMap[game.MVP];
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  })();
  const homeTeamLogo = (() => {
    let logo = getLogo(league, game.HomeTeamID, currentUser?.IsRetro);
    return logo;
  })();
  const awayTeamLogo = (() => {
    let logo = getLogo(league, game.AwayTeamID, currentUser?.IsRetro);
    return logo;
  })();

  const homeScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.HomeTeamScore}`;
  })();
  const awayScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.AwayTeamScore}`;
  })();

  const homeTeamRank = (() => {
    if (league === SimNFL) return 0;
    const g = game as CFBGame;
    return g.HomeTeamRank;
  })();
  const awayTeamRank = (() => {
    if (league === SimNFL) return 0;
    const g = game as CFBGame;
    return g.AwayTeamRank;
  })();
  const timeSlotLabel = (() => {
    switch (game.TimeSlot) {
      case "Thursday Night":
        return "Thursday";
      case "Thursday Night Football":
        return "TNF";
      case "Friday Night":
        return "Friday";
      case "Saturday Morning":
        return "Sat. Morning";
      case "Saturday Afternoon":
        return "Sat. Afternoon";
      case "Saturday Evening":
        return "Sat. Evening";
      case "Saturday Night":
        return "Sat. Night";
      case "Sunday Noon":
        return "Sun. Noon";
      case "Sunday Afternoon":
        return "Sun. Afternoon";
      case "Sunday Night Football":
        return "SNF";
      case "Monday Night Football":
        return "Monday";
      default:
        return `${game.TimeSlot}`;
    }
  })();
  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <Span onClick={handleClick}>{game.ID}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Week}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{timeSlotLabel}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.GameTitle}</Span>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.AwayTeamCoach || "AI"}
          label={game.AwayTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <Logo url={awayTeamLogo} variant="tiny" />
          <ClickableTeamLabel
            label={game.AwayTeam}
            textVariant="xs"
            teamID={game.AwayTeamID}
            league={league}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{awayTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${awayTeamColor}`}>
          {awayScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${homeTeamColor}`}>
          {homeScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{homeTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <ClickableTeamLabel
            label={game.HomeTeam}
            textVariant="xs"
            teamID={game.HomeTeamID}
            league={league}
          />
          <Logo url={homeTeamLogo} variant="tiny" />
        </div>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.HomeTeamCoach || "AI"}
          label={game.HomeTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Stadium}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.City}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.State}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{0}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{mvpLabel}</Span>
      </TableCell>
    </div>
  );
};

interface BBAdvancedGameRowProps {
  game: CBBGame | NBAGame;
  idx: number;
  bg: string;
  setSelectedGame: (game: CBBGame | NBAGame) => void;
  openModal: () => void;
  playerMap: Record<number, any>;
  league: League;
  resultsOverride: boolean;
  currentUser: any;
}

const BBAdvancedGameRow: FC<BBAdvancedGameRowProps> = ({
  game,
  idx,
  bg,
  setSelectedGame,
  openModal,
  playerMap,
  league,
  resultsOverride,
  currentUser,
}) => {
  const handleClick = () => {
    if (!game.GameComplete || !game.IsRevealed || resultsOverride) return;
    setSelectedGame(game);
    openModal();
  };

  const homeTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.HomeTeamScore > game.AwayTeamScore) return "text-green-500";
    if (game.HomeTeamScore < game.AwayTeamScore) return "text-red-500";
    return "text-gray-500";
  })();

  const awayTeamColor = (() => {
    if (!game.IsRevealed && !resultsOverride) return "text-gray-500";
    if (game.AwayTeamScore > game.HomeTeamScore) return "text-green-500";
    if (game.AwayTeamScore < game.HomeTeamScore) return "text-red-500";
    return "text-gray-500";
  })();
  const mvpLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "";
    const player = playerMap[game.MVP];
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  })();
  const homeTeamLogo = (() => {
    let logo = getLogo(league, game.HomeTeamID, currentUser?.IsRetro);
    return logo;
  })();
  const awayTeamLogo = (() => {
    let logo = getLogo(league, game.AwayTeamID, currentUser?.IsRetro);
    return logo;
  })();

  const homeScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.HomeTeamScore}`;
  })();
  const awayScoreLabel = (() => {
    if (!game.IsRevealed && !resultsOverride) return "-";
    return `${game.AwayTeamScore}`;
  })();
  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <Span onClick={handleClick}>{game.ID}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>
          {game.Week}
          {game.MatchOfWeek}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.MatchName}</Span>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.AwayTeamCoach || "AI"}
          label={game.AwayTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <Logo url={awayTeamLogo} variant="tiny" />
          <ClickableTeamLabel
            label={game.AwayTeam}
            textVariant="xs"
            teamID={game.AwayTeamID}
            league={league}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.AwayTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${awayTeamColor}`}>
          {awayScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick} classes={`${homeTeamColor}`}>
          {homeScoreLabel}
        </Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.HomeTeamRank || "NR"}</Span>
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2 items-center">
          <ClickableTeamLabel
            label={game.HomeTeam}
            textVariant="xs"
            teamID={game.HomeTeamID}
            league={league}
          />
          <Logo url={homeTeamLogo} variant="tiny" />
        </div>
      </TableCell>
      <TableCell>
        <ClickableUserLabel
          coach={game.HomeTeamCoach || "AI"}
          label={game.HomeTeamCoach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Arena}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.City}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.State}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.Country}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{game.AttendanceCount || 0}</Span>
      </TableCell>
      <TableCell>
        <Span onClick={handleClick}>{mvpLabel}</Span>
      </TableCell>
    </div>
  );
};

export const AdvancedSchedule: FC<AdvancedScheduleProps> = ({
  view,
  team,
  processedSchedule,
  league,
  currentWeek,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoading,
  isPreseason,
  resultsOverride = false,
  currentUser,
}) => {
  const {
    leagueTeamOptions,
    leagueConferenceOptions,
    leagueTeamMap,
    leaguePlayerMap,
    selectedTeamIDs,
    selectedConferenceIDs,
    filteredGames,
    standingsBySeason,
    isFootball,
    isBasketball,
    isHockey,
    selectedGame,
    setSelectedGame,
    SelectConferences,
    SelectTeams,
    tableColumns,
    gamePlayerMap,
  } = useAdvancedSchedule(
    league,
    currentWeek,
    processedSchedule,
    view,
    team?.ID,
    isPreseason,
  );
  const { isMobile } = useResponsive();
  const gameModal = useModal();
  const rowRenderer = (
    league: League,
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL || league === SimPHL) {
      return (game: CHLGame | PHLGame, idx: number, bg: string) => {
        return (
          <HCKAdvancedGameRow
            league={league}
            game={game}
            idx={idx}
            bg={bg}
            setSelectedGame={setSelectedGame}
            openModal={gameModal.handleOpenModal}
            playerMap={leaguePlayerMap}
            resultsOverride={resultsOverride}
            currentUser={currentUser}
          />
        );
      };
    }
    if (league === SimCFB || league === SimNFL) {
      return (game: CFBGame | NFLGame, idx: number, bg: string) => {
        return (
          <FBAdvancedGameRow
            game={game}
            idx={idx}
            bg={bg}
            setSelectedGame={setSelectedGame}
            openModal={gameModal.handleOpenModal}
            playerMap={leaguePlayerMap}
            league={league}
            resultsOverride={resultsOverride}
            currentUser={currentUser}
          />
        );
      };
    }
    return (game: CBBGame | NBAGame, idx: number, bg: string) => {
      return (
        <BBAdvancedGameRow
          game={game}
          idx={idx}
          bg={bg}
          setSelectedGame={setSelectedGame}
          openModal={gameModal.handleOpenModal}
          playerMap={leaguePlayerMap}
          league={league}
          resultsOverride={resultsOverride}
          currentUser={currentUser}
        />
      );
    };
  };

  const schedulePageModalTitle = useMemo(() => {
    if (!selectedGame) return "";
    return `${selectedGame.ID} ${selectedGame?.HomeTeam} vs ${selectedGame?.AwayTeam}`;
  }, [selectedGame, league]);

  return (
    <>
      <div className="w-full col-span-5">
        <SectionCards
          header={`Advanced Schedule View | Week ${currentWeek}`}
          team={team}
          classes={`w-full ${textColorClass}`}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
          textColorClass={textColorClass}
          darkerBackgroundColor={darkerBackgroundColor}
        >
          <SchedulePageGameModal
            isOpen={gameModal.isModalOpen}
            onClose={gameModal.handleCloseModal}
            league={league}
            game={selectedGame}
            title={schedulePageModalTitle}
            playerMap={gamePlayerMap}
            teamMap={leagueTeamMap}
          />
          {view !== TeamGames && (
            <div className="grid grid-cols-2 space-x-4 py-4 px-2">
              <CategoryDropdown
                label="Conferences"
                options={leagueConferenceOptions}
                change={SelectConferences}
                isMulti={true}
                isMobile={isMobile}
              />
              <CategoryDropdown
                label="Teams"
                options={leagueTeamOptions}
                change={SelectTeams}
                isMulti={true}
                isMobile={isMobile}
              />
            </div>
          )}
          <Table
            columns={tableColumns}
            data={filteredGames}
            rowRenderer={rowRenderer(league)}
            page={`${league}AdvancedSchedule`}
            team={team}
          />
        </SectionCards>
      </div>
    </>
  );
};

interface AdvancedStandingsProps {
  team: any;
  league: League;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
  isLoading: boolean;
  view: string;
  selectedSeasonID: number;
  currentUser: any;
}

interface HCKAdvancedStandingsRowProps {
  league: League;
  standings: CHLStandings | PHLStandings;
  idx: number;
  bg: string;
  teamMap: Record<number, CHLTeam> | Record<number, ProfessionalTeam>;
  currentUser: any;
}

const HCKAdvancedStandingsRow: FC<HCKAdvancedStandingsRowProps> = ({
  league,
  standings,
  idx,
  bg,
  teamMap,
  currentUser,
}) => {
  const teamLogo = (() => {
    let logo = getLogo(league, standings.TeamID, currentUser?.IsRetro);
    return logo;
  })();

  const team = useMemo(() => {
    if (league === SimCHL) {
      return teamMap ? (teamMap[standings.TeamID] as CHLTeam) : null;
    }
    if (league === SimPHL) {
      return teamMap ? teamMap[standings.TeamID] : null;
    }
    return teamMap ? teamMap[standings.TeamID] : null;
  }, [teamMap, standings.TeamID]);

  const conference = useMemo(() => {
    if (league === SimCHL) {
      return getSimCHLConference((standings as CHLStandings).ConferenceID);
    }
    if (league === SimPHL) {
      return getSimPHLConference((standings as PHLStandings).ConferenceID);
    }
    return "";
  }, [standings]);

  const division = useMemo(() => {
    if (league === SimPHL) {
      return getSimPHLDivision((standings as PHLStandings).DivisionID);
    }
    return "";
  }, [standings, league]);

  const rank = useMemo(() => {
    if (league === SimCHL) {
      return (standings as CHLStandings).Rank;
    }
    return 0;
  }, [standings, league]);

  const chlRankingStats = useMemo(() => {
    if (league === SimPHL) return null;
    if (league === SimCHL) {
      return {
        PreseasonRank: (standings as CHLStandings).PreseasonRank,
        PairwiseRank: (standings as CHLStandings).PairwiseRank,
        RPIRank: (standings as CHLStandings).RPIRank,
        RPI: (standings as CHLStandings).RPI,
        SOS: (standings as CHLStandings).SOS,
        SOR: (standings as CHLStandings).SOR,
        Tier1Wins: (standings as CHLStandings).Tier1Wins,
        Tier2Wins: (standings as CHLStandings).Tier2Wins,
        BadLosses: (standings as CHLStandings).BadLosses,
        ConferenceStrengthAdj: (standings as CHLStandings)
          .ConferenceStrengthAdj,
      };
    }
    return null;
  }, [league, standings]);

  const teamLabel = useMemo(() => {
    if (league === SimCHL && teamMap) {
      const t = teamMap[standings.TeamID] as CHLTeam;
      return t?.TeamName || "";
    }
    if (league === SimPHL && teamMap) {
      const t = teamMap[standings.TeamID] as ProfessionalTeam;
      return `${t.TeamName} ${t.Mascot}`;
    }
    return standings.TeamName || "";
  }, [league, standings, teamMap]);

  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <div className="flex items-center space-x-4">
          <Logo url={teamLogo} variant="tiny" />
          <ClickableTeamLabel
            teamID={standings.TeamID}
            league={league}
            label={teamLabel}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span>{conference}</Span>
      </TableCell>
      {league === SimPHL && (
        <TableCell>
          <Span>{division}</Span>
        </TableCell>
      )}
      <TableCell>
        <ClickableUserLabel
          coach={standings.Coach || "AI"}
          label={standings.Coach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span>{standings.Points}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalOTWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalOTLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ShootoutWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ShootoutLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceOTWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceOTLosses}</Span>
      </TableCell>
      {league === SimCHL && (
        <>
          <TableCell>
            <Span>{rank}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedWins}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedLosses}</Span>
          </TableCell>
        </>
      )}
      <TableCell>
        <Span>{standings.GoalsFor}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.GoalsAgainst}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.GoalsFor - standings.GoalsAgainst}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.Streak}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.HomeWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.AwayWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PostSeasonStatus}</Span>
      </TableCell>
      {league === SimCHL && (
        <>
          <TableCell>
            <Span>{chlRankingStats?.PreseasonRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.PairwiseRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.RPIRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.RPI.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.SOS.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.SOR.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.Tier1Wins}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.Tier2Wins}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.BadLosses}</Span>
          </TableCell>
          <TableCell>
            <Span>{chlRankingStats?.ConferenceStrengthAdj.toFixed(3)}</Span>
          </TableCell>
        </>
      )}
    </div>
  );
};

interface FBAdvancedStandingsRowProps {
  standings: CFBStandings | NFLStandings;
  idx: number;
  bg: string;
  league: League;
  teamMap: Record<number, CFBTeam> | Record<number, NFLTeam>;
  currentUser: any;
}

const FBAdvancedStandingsRow: FC<FBAdvancedStandingsRowProps> = ({
  standings,
  idx,
  bg,
  teamMap,
  league,
  currentUser,
}) => {
  const teamLogo = (() => {
    let logo = getLogo(league, standings.TeamID, currentUser?.IsRetro);
    return logo;
  })();

  const team = useMemo(() => {
    if (league === SimCFB) {
      return teamMap ? (teamMap[standings.TeamID] as CFBTeam) : null;
    }
    if (league === SimNFL) {
      return teamMap ? teamMap[standings.TeamID] : null;
    }
    return teamMap ? teamMap[standings.TeamID] : null;
  }, [teamMap, standings.TeamID]);

  const division = useMemo(() => {
    if (league === SimNFL) {
      return getSimNFLDivision((standings as NFLStandings).DivisionID);
    }
    return "";
  }, [standings, league]);

  const rank = useMemo(() => {
    if (league === SimCFB) {
      return (standings as CFBStandings).Rank;
    }
    return 0;
  }, [standings, league]);

  const cfbRankingStats = useMemo(() => {
    if (league === SimNFL) return null;
    if (league === SimCFB) {
      return {
        TotalWinPercentage: (standings as CFBStandings).TotalWinPercentage,
        ConfWinPercentage: (standings as CFBStandings).ConfWinPercentage,
        PreseasonRank: (standings as CFBStandings).PreseasonRank,
        ToucanRank: (standings as CFBStandings).ToucanRank,
        RPI: (standings as CFBStandings).RPI,
        SOS: (standings as CFBStandings).SOS,
        SOR: (standings as CFBStandings).SOR,
        Tier1Wins: (standings as CFBStandings).Tier1Wins,
        Tier2Wins: (standings as CFBStandings).Tier2Wins,
        BadLosses: (standings as CFBStandings).BadLosses,
        ConferenceStrengthAdj: (standings as CFBStandings)
          .ConferenceStrengthAdj,
      };
    }
    return null;
  }, [league, standings]);

  const teamLabel = useMemo(() => {
    if (league === SimCFB && teamMap) {
      const t = teamMap[standings.TeamID] as CFBTeam;
      return t?.TeamName || "";
    }
    if (league === SimNFL && teamMap) {
      const t = teamMap[standings.TeamID] as NFLTeam;
      return `${t.TeamName} ${t.Mascot}`;
    }
    return standings.TeamName || "";
  }, [league, standings, teamMap]);

  const nflStandingsData = useMemo(() => {
    if (league === SimNFL) {
      const s = standings as NFLStandings;
      return {
        TotalTies: s.TotalTies,
        ConferenceTies: s.ConferenceTies,
        DivisionWins: s.DivisionWins,
        DivisionLosses: s.DivisionLosses,
        DivisionTies: s.DivisionTies,
      };
    }
    return {
      TotalTies: 0,
      ConferenceTies: 0,
      DivisionWins: 0,
      DivisionLosses: 0,
      DivisionTies: 0,
    };
  }, [league, standings]);
  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <div className="flex items-center space-x-4">
          <Logo url={teamLogo} variant="tiny" />
          <ClickableTeamLabel
            teamID={standings.TeamID}
            league={league}
            label={teamLabel}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceName}</Span>
      </TableCell>
      {league === SimNFL && (
        <TableCell>
          <Span>{division}</Span>
        </TableCell>
      )}
      <TableCell>
        <ClickableUserLabel
          coach={standings.Coach || "AI"}
          label={standings.Coach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span>{standings.TotalWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalLosses}</Span>
      </TableCell>
      {league === SimNFL && (
        <>
          <TableCell>
            <Span>{nflStandingsData.TotalTies}</Span>
          </TableCell>
        </>
      )}
      <TableCell>
        <Span>{standings.ConferenceWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceLosses}</Span>
      </TableCell>
      {league === SimNFL && (
        <>
          <TableCell>
            <Span>{nflStandingsData.ConferenceTies}</Span>
          </TableCell>
          <TableCell>
            <Span>{nflStandingsData.DivisionWins}</Span>
          </TableCell>
          <TableCell>
            <Span>{nflStandingsData.DivisionLosses}</Span>
          </TableCell>
          <TableCell>
            <Span>{nflStandingsData.DivisionTies}</Span>
          </TableCell>
        </>
      )}
      {league === SimCFB && (
        <>
          <TableCell>
            <Span>{rank}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedWins}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedLosses}</Span>
          </TableCell>
        </>
      )}
      <TableCell>
        <Span>{standings.PointsFor}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PointsAgainst}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PointsFor - standings.PointsAgainst}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.Streak}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.HomeWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.AwayWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PostSeasonStatus}</Span>
      </TableCell>
      {league === SimNFL && (
        <>
          <TableCell>
            <Span>{standings.TotalWinPercentage.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.ConfWinPercentage.toFixed(3)}</Span>
          </TableCell>
        </>
      )}
      {league === SimCFB && (
        <>
          <TableCell>
            <Span>{cfbRankingStats?.TotalWinPercentage.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.ConfWinPercentage.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.PreseasonRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.ToucanRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.RPI.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.SOS.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.SOR.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.Tier1Wins}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.Tier2Wins}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.BadLosses}</Span>
          </TableCell>
          <TableCell>
            <Span>{cfbRankingStats?.ConferenceStrengthAdj.toFixed(3)}</Span>
          </TableCell>
        </>
      )}
    </div>
  );
};

interface BBAdvancedStandingsRowProps {
  standings: CBBStandings | NBAStandings;
  idx: number;
  bg: string;
  league: League;
  teamMap: Record<number, CBBTeam> | Record<number, NBATeam>;
  currentUser: any;
}

const BBAdvancedStandingsRow: FC<BBAdvancedStandingsRowProps> = ({
  standings,
  idx,
  bg,
  league,
  teamMap,
  currentUser,
}) => {
  const teamLogo = (() => {
    let logo = getLogo(league, standings.TeamID, currentUser?.IsRetro);
    return logo;
  })();

  const team = useMemo(() => {
    if (league === SimCBB) {
      return teamMap ? (teamMap[standings.TeamID] as CBBTeam) : null;
    }
    if (league === SimNBA) {
      return teamMap ? teamMap[standings.TeamID] : null;
    }
    return teamMap ? teamMap[standings.TeamID] : null;
  }, [teamMap, standings.TeamID]);

  const division = useMemo(() => {
    if (league === SimNBA) {
      return getSimNBADivision((standings as NBAStandings).DivisionID);
    }
    return "";
  }, [standings, league]);

  const rank = useMemo(() => {
    if (league === SimCBB) {
      return (standings as CBBStandings).Rank;
    }
    return 0;
  }, [standings, league]);

  const cbbRankingStats = useMemo(() => {
    if (league === SimNBA) return null;
    if (league === SimCBB) {
      return {
        TotalWinPercentage: (standings as CBBStandings).TotalWinPercentage,
        ConfWinPercentage: (standings as CBBStandings).ConfWinPercentage,
        PreseasonRank: (standings as CBBStandings).PreseasonRank,
        ToucanRank: (standings as CBBStandings).ToucanRank,
        KenPomRank: (standings as CBBStandings).KenPomRank,
        KP: (standings as CBBStandings).KenPomRating,
        RPI: (standings as CBBStandings).RPIRating,
        RPIRank: (standings as CBBStandings).RPIRank,
        SOS: (standings as CBBStandings).SOS,
        SOR: (standings as CBBStandings).SOR,
        Q1Wins: (standings as CBBStandings).Q1Wins,
        Q1Losses: (standings as CBBStandings).Q1Losses,
        Q2Wins: (standings as CBBStandings).Q2Wins,
        Q2Losses: (standings as CBBStandings).Q2Losses,
        Q3Wins: (standings as CBBStandings).Q3Wins,
        Q3Losses: (standings as CBBStandings).Q3Losses,
        Q4Wins: (standings as CBBStandings).Q4Wins,
        Q4Losses: (standings as CBBStandings).Q4Losses,
        QR: (standings as CBBStandings).QuadrantRating,
        ConferenceStrengthAdj: (standings as CBBStandings)
          .ConferenceStrengthAdj,
      };
    }
    return null;
  }, [league, standings]);

  const teamLabel = useMemo(() => {
    if (league === SimCBB && teamMap) {
      const t = teamMap[standings.TeamID] as CBBTeam;
      return t?.Team || "";
    }
    if (league === SimNBA && teamMap) {
      const t = teamMap[standings.TeamID] as NBATeam;
      return `${t.Team} ${t.Nickname}`;
    }
    return standings.TeamName || "";
  }, [league, standings, teamMap]);

  return (
    <div
      key={idx}
      className="table-row border-b dark:border-gray-700 text-start"
      style={{ backgroundColor: bg }}
    >
      <TableCell>
        <div className="flex items-center space-x-4">
          <Logo url={teamLogo} variant="tiny" />
          <ClickableTeamLabel
            teamID={standings.TeamID}
            league={league}
            label={teamLabel}
          />
        </div>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceName}</Span>
      </TableCell>
      {league === SimNBA && (
        <TableCell>
          <Span>{division}</Span>
        </TableCell>
      )}
      <TableCell>
        <ClickableUserLabel
          coach={standings.Coach || "AI"}
          label={standings.Coach || "AI"}
          textVariant="xs"
        />
      </TableCell>
      <TableCell>
        <Span>{standings.TotalWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.TotalLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.ConferenceLosses}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PointsFor}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PointsAgainst}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PointsDifferential}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.Streak}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.HomeWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.AwayWins}</Span>
      </TableCell>
      <TableCell>
        <Span>{standings.PostSeasonStatus}</Span>
      </TableCell>
      {league === SimCBB && (
        <>
          <TableCell>
            <Span>{rank}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedWins}</Span>
          </TableCell>
          <TableCell>
            <Span>{standings.RankedLosses}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.PreseasonRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.ToucanRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.KenPomRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.KP.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.RPIRank}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.RPI.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.SOS.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.SOR.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>
              {cbbRankingStats?.Q1Wins}-{cbbRankingStats?.Q1Losses}
            </Span>
          </TableCell>
          <TableCell>
            <Span>
              {cbbRankingStats?.Q2Wins}-{cbbRankingStats?.Q2Losses}
            </Span>
          </TableCell>
          <TableCell>
            <Span>
              {cbbRankingStats?.Q3Wins}-{cbbRankingStats?.Q3Losses}
            </Span>
          </TableCell>
          <TableCell>
            <Span>
              {cbbRankingStats?.Q4Wins}-{cbbRankingStats?.Q4Losses}
            </Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.QR.toFixed(3)}</Span>
          </TableCell>
          <TableCell>
            <Span>{cbbRankingStats?.ConferenceStrengthAdj.toFixed(3)}</Span>
          </TableCell>
        </>
      )}
    </div>
  );
};

export const AdvancedStandings: FC<AdvancedStandingsProps> = ({
  view,
  team,
  league,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoading,
  selectedSeasonID,
  currentUser,
}) => {
  const {
    filteredStandings,
    tableColumns,
    seasonID,
    standingsBySeason,
    leagueTeamMap,
    hockeyTeamMap,
    footballTeamMap,
    basketballTeamMap,
    leagueTeamOptions,
    leagueConferenceOptions,
    leagueOptions,
    leagueDivisionOptions,
    SelectDivisions,
    SelectTeams,
    SelectConferences,
    SelectLeague,
  } = useAdvancedStandings(league, view, team?.ID, selectedSeasonID);
  const { isMobile } = useResponsive();
  const gameModal = useModal();
  const rowRenderer = (
    league: League,
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL || league === SimPHL) {
      return (
        standings: CHLStandings | PHLStandings,
        idx: number,
        bg: string,
      ) => {
        return (
          <HCKAdvancedStandingsRow
            standings={standings}
            idx={idx}
            bg={bg}
            league={league}
            teamMap={hockeyTeamMap}
            currentUser={currentUser}
          />
        );
      };
    }
    if (league === SimCFB || league === SimNFL) {
      return (
        standings: CFBStandings | NFLStandings,
        idx: number,
        bg: string,
      ) => {
        return (
          <FBAdvancedStandingsRow
            standings={standings}
            idx={idx}
            bg={bg}
            league={league}
            teamMap={footballTeamMap!!}
            currentUser={currentUser}
          />
        );
      };
    }
    return (
      standings: CBBStandings | NBAStandings,
      idx: number,
      bg: string,
    ) => {
      return (
        <BBAdvancedStandingsRow
          standings={standings}
          idx={idx}
          bg={bg}
          league={league}
          teamMap={basketballTeamMap!!}
          currentUser={currentUser}
        />
      );
    };
  };

  const dropdownColumns = useMemo(() => {
    if (league === SimCHL || league === SimNFL) {
      return "grid-cols-3";
    }
    if (league === SimNBA || league === SimPHL) {
      return "grid-cols-4";
    }
    return "grid-cols-2";
  }, [league]);

  return (
    <>
      <div className="w-full col-span-5">
        <SectionCards
          header={`Advanced Standings View`}
          team={team}
          classes={`w-full ${textColorClass}`}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
          textColorClass={textColorClass}
          darkerBackgroundColor={darkerBackgroundColor}
        >
          <div className={`grid ${dropdownColumns} space-x-4 py-4 px-2`}>
            {league === SimCHL && (
              <CategoryDropdown
                label="Leagues"
                options={leagueOptions}
                change={SelectLeague}
                isMulti={false}
                isMobile={isMobile}
              />
            )}
            <CategoryDropdown
              label="Conferences"
              options={leagueConferenceOptions}
              change={SelectConferences}
              isMulti={true}
              isMobile={isMobile}
            />
            {(league === SimNFL || league === SimPHL || league === SimNBA) && (
              <CategoryDropdown
                label="Divisions"
                options={leagueDivisionOptions}
                change={SelectDivisions}
                isMulti={true}
                isMobile={isMobile}
              />
            )}
            <CategoryDropdown
              label="Teams"
              options={leagueTeamOptions}
              change={SelectTeams}
              isMulti={true}
              isMobile={isMobile}
            />
          </div>
          <Table
            columns={tableColumns}
            data={filteredStandings}
            rowRenderer={rowRenderer(league)}
            page={`${league}AdvancedStandings`}
            team={team}
            freezeFirstColumn
          />
        </SectionCards>
      </div>
    </>
  );
};

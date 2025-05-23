import { useMemo, useState } from "react";
import { getLogo } from "../../../_utility/getLogo";
import { Text } from "../../../_design/Typography";
import { Logo } from "../../../_design/Logo";
import { Button } from "../../../_design/Buttons";
import { League } from "../../../_constants/constants";
import { SectionCards } from "../../../_design/SectionCards";
import { InformationCircle } from "../../../_design/Icons";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { processLeagueStandings } from "./SchedulePageHelper";
import { ClickableTeamLabel } from "../../Common/Labels";
import { useModal } from "../../../_hooks/useModal";
import { SchedulePageGameModal } from "./GameModal";
import { SimCFB, SimNFL } from "../../../_constants/constants";

interface TeamScheduleProps {
  team: any;
  Abbr?: string;
  category?: string;
  playerMap?: any;
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
  isLoadingTwo: boolean;
}

export const TeamSchedule = ({
  team,
  Abbr,
  category,
  currentUser,
  playerMap,
  week,
  league,
  ts,
  processedSchedule,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoadingTwo,
}: TeamScheduleProps) => {
  const gameModal = useModal();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const isFootball = league === SimCFB || league === SimNFL ? true : false;

  return (
    <>
      <SectionCards
        header={`${Abbr} Schedule`}
        team={team}
        classes={`w-full ${textColorClass}`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        textColorClass={textColorClass}
        darkerBackgroundColor={darkerBackgroundColor}
      >
        {isLoadingTwo ? (
          <div className="flex justify-center items-center pb-2">
            <Text variant="small" classes={`${textColorClass}`}>
              Loading...
            </Text>
          </div>
        ) : (
          <div className="grid">
            <div
              className={`grid ${
                isFootball ? "grid-cols-7" : "grid-cols-5"
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
              <div className="text-left col-span-2">
                <Text variant="xs" className={`${textColorClass}`}>
                  Opponent
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
            />
            {processedSchedule.map((game, index) => (
              <div
                key={index}
                className={`grid ${
                  isFootball ? "grid-cols-7" : "grid-cols-5"
                } border-b border-b-[#34455d] items-center`}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? darkerBackgroundColor : backgroundColor,
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
                      {game.TimeSlot.split(" ").slice(0, 2).join(" ")}
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
                    containerClass="flex-shrink-0 p-2"
                    url={game.opponentLogo}
                  />
                  <ClickableTeamLabel
                    textVariant="xs"
                    label={game.opponentLabel}
                    teamID={game.opponentID}
                    textColorClass={textColorClass}
                    league={league}
                  />
                </div>
                <div className="text-center col-span-1">
                  <Text
                    variant="xs"
                    className={`font-semibold ${
                      game.userWin
                        ? "text-green-500"
                        : game.userLoss
                        ? "text-red-500"
                        : textColorClass
                    } ${game.gameScore === "TBC" ? "opacity-50" : ""}`}
                  >
                    {game.headerGameScore}
                  </Text>
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
  week,
  league,
  ts,
  processedSchedule,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
  isLoadingTwo,
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
      {isLoadingTwo ? (
        <div className="flex justify-center items-center pb-2">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : (
        <div className="grid">
          <div
            className={`grid ${
              isFootball ? "grid-cols-7" : "grid-cols-5"
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
            <div className="text-left col-span-1 pl-4">
              <Text variant="xs" className={`${textColorClass}`}>
                Home
              </Text>
            </div>
            <div className="text-left col-span-1 pl-4">
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
          />
          {processedSchedule.map((game, index) => (
            <div
              key={index}
              className={`grid ${
                isFootball ? "grid-cols-7" : "grid-cols-5"
              } border-b border-b-[#34455d] items-center`}
              style={{
                backgroundColor:
                  index % 2 === 0 ? darkerBackgroundColor : backgroundColor,
              }}
            >
              <div className="text-left col-span-1">
                <Text variant="xs" className="font-semibold">
                  {week}
                  {game.GameDay}
                </Text>
              </div>
              {isFootball && (
                <div className="text-left col-span-2">
                  <Text variant="xs" className="font-semibold opacity-70">
                    {game.TimeSlot.split(" ").slice(0, 2).join(" ")}
                  </Text>
                </div>
              )}
              <div className="flex items-center col-span-1 text-left">
                <Logo
                  variant="xs"
                  classes="w-4 h-4"
                  containerClass="flex-shrink-0 p-2"
                  url={getLogo(league, game.HomeTeamID, currentUser?.isRetro)}
                />
                <ClickableTeamLabel
                  textVariant="xs"
                  label={game.HomeTeamAbbr}
                  teamID={game.HomeTeamID}
                  textColorClass={textColorClass}
                  league={league}
                />
              </div>
              <div className="flex items-center col-span-1 text-left">
                <Logo
                  variant="xs"
                  classes="w-4 h-4"
                  containerClass="flex-shrink-0 p-2"
                  url={getLogo(league, game.AwayTeamID, currentUser?.isRetro)}
                />
                <ClickableTeamLabel
                  textVariant="xs"
                  label={game.AwayTeamAbbr}
                  teamID={game.AwayTeamID}
                  textColorClass={textColorClass}
                  league={league}
                />
              </div>
              <div className="text-center col-span-1">
                <Text
                  variant="xs"
                  className={`font-semibold ${
                    game.userWin
                      ? "text-green-500"
                      : game.userLoss
                      ? "text-red-500"
                      : textColorClass
                  } ${game.gameScore === "TBC" ? "opacity-50" : ""}`}
                >
                  {game.headerGameScore}
                </Text>
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
  );
};

interface TeamStandingsProps {
  standings: any[];
  team: any;
  league: League;
  currentUser: any;
  isLoadingTwo: boolean;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  darkerBackgroundColor: string;
}

export const TeamStandings = ({
  standings,
  team,
  league,
  currentUser,
  isLoadingTwo,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
}: TeamStandingsProps) => {
  return (
    <SectionCards
      team={team}
      header={`${team.Conference} Standings`}
      classes={`${textColorClass}, h-full`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      {isLoadingTwo ? (
        <div className="flex justify-center items-center">
          <Text variant="small" classes={`${textColorClass}`}>
            Loading...
          </Text>
        </div>
      ) : (
        <div className="grid">
          <div
            className="grid grid-cols-7 font-semibold border-b-2 pb-2"
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
          </div>
          {standings.map((standing, index) => (
            <div
              key={index}
              className="grid grid-cols-7 border-b border-b-[#34455d] items-center"
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
                  containerClass="flex-shrink-0 p-2"
                  url={getLogo(league, standing.TeamID, currentUser?.isRetro)}
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
  isLoadingTwo: boolean;
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
  isLoadingTwo,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
  darkerBackgroundColor,
}: LeagueStandingsProps) => {
  const { groupedStandings, sortedGroupNames } = useMemo(() => {
    const customOrder =
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

    return processLeagueStandings(standings, customOrder, league, category);
  }, [standings, league, category]);

  return (
    <div className="flex flex-wrap gap-4">
      {isLoadingTwo ? (
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
            })
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
                    className="grid grid-cols-7 font-semibold border-b-2 pb-2"
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
                  </div>
                  {groupStandings.map((standing: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-7 border-b border-b-[#34455d] items-center"
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
                      <div className="flex text-left w-1/2 mx-auto justify-start col-span-2 pl-1 items-center">
                        <Logo
                          variant="xs"
                          classes="w-4 h-4 p-0"
                          containerClass="flex-shrink-0 p-2"
                          url={getLogo(
                            league,
                            standing.TeamID,
                            currentUser?.isRetro
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
  isLoadingTwo: boolean;
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
  isLoadingTwo,
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
      {isLoadingTwo ? (
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
                                    px-3 h-[3rem] min-h-[3rem] md:h-[6rem] w-[6rem] max-w-[5rem] rounded-lg border-2`}
                style={{ borderColor: borderColor, backgroundColor: "white" }}
              >
                <PlayerPicture
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

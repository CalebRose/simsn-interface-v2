import { useState } from "react";
import { getLogo } from "../../../_utility/getLogo";
import { Text } from "../../../_design/Typography";
import { Logo } from "../../../_design/Logo";
import {
  League,
  statsOptions,
  StatsCategory,
} from "../../../_constants/constants";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { TeamProfileCards } from "./TeamProfileCards";
import { Table, TableCell } from "../../../_design/Table";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SingleValue } from "react-select";
import {
  getFBAStatColumns,
  processTopPlayers,
  getFBAPastSeasonColumns,
  getFBAPastBowlGamesColumns,
  FBATrophies,
} from "./TeamProfileHelper";
import { Trophy, Ribbon, TrophyTwo, Medal } from "../../../_design/Icons";

interface TeamProfileComponentsProps {
  league: League;
  team: any;
  data: any;
  teamColors?: any;
  teamTrophies?: any;
  teamMap?: any;
  wins?: number;
  losses?: number;
  playerMap?: any;
  title?: string;
  backgroundColor: string;
  borderColor: string;
  headerColor: string;
  darkerBackgroundColor: string;
  textColorClass: string;
}

export const TeamRivalry = ({
  league,
  team,
  data,
  backgroundColor,
  borderColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
}: TeamProfileComponentsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const rivalsArray = Array.isArray(data) ? data : Object.values(data ?? {});
  const rivals = rivalsArray.length;
  const rival = rivalsArray[currentIndex] || {};

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? rivals - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === rivals - 1 ? 0 : prev + 1));
  const winsColor = "#189E5B";
  if (!rivals || rivals === 0) {
    return (
      <TeamProfileCards
        team={team}
        header="Rivalries"
        classes={`${textColorClass} h-full`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        darkerBackgroundColor={darkerBackgroundColor}
        textColorClass={textColorClass}
      >
        <Text variant="small" classes={textColorClass}>
          No rivalries found.
        </Text>
      </TeamProfileCards>
    );
  }

  return (
    <TeamProfileCards
      team={team}
      header="Rivalries"
      classes={`${textColorClass} h-full`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="flex w-full items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            aria-label="Previous Rival"
            className="flex size-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: darkerBackgroundColor,
              borderColor: headerColor,
              color: borderColor,
            }}
          >
            {"<"}
          </button>
          <Logo
            url={getLogo(league, rival.opponentTeamId, false)}
            variant="large"
          />
          <button
            onClick={handleNext}
            aria-label="Next Rival"
            className="flex size-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: darkerBackgroundColor,
              borderColor: headerColor,
              color: borderColor,
            }}
          >
            {">"}
          </button>
        </div>
        <Text variant="h4" classes={textColorClass}>
          vs {rival.opponentTeamName}
        </Text>
        <div className="flex justify-around items-center w-full">
          <div className="flex flex-col pl-4">
            <Text
              variant="h1-alt"
              classes={
                rival.selectedTeamWins > rival.selectedTeamLosses
                  ? `text-[${winsColor}] w-1/3`
                  : rival.selectedTeamWins < rival.selectedTeamLosses
                    ? `text-red-500 w-1/3`
                    : `${textColorClass}`
              }
            >
              {rival.selectedTeamWins}
            </Text>
            <Text variant="small">Wins</Text>
          </div>
          <div className="flex flex-col">
            <Text
              variant="body"
              classes={
                rival.selectedTeamWins > rival.selectedTeamLosses
                  ? `text-[${winsColor}] font-semibold`
                  : rival.selectedTeamWins < rival.selectedTeamLosses
                    ? `text-red-500 font-semibold`
                    : `${textColorClass} font-semibold`
              }
            >
              {rival.rivalryTie
                ? "Tied"
                : rival.selectedTeamLeads
                  ? `${rival.selectedTeamName} leads`
                  : `${rival.opponentTeamName} leads`}
            </Text>
          </div>
          <div className="flex flex-col pr-4">
            <Text
              variant="h1-alt"
              classes={
                rival.selectedTeamWins > rival.selectedTeamLosses
                  ? `text-[${winsColor}] w-1/3`
                  : rival.selectedTeamWins < rival.selectedTeamLosses
                    ? `text-red-500 w-1/3`
                    : `${textColorClass}`
              }
            >
              {rival.selectedTeamLosses}
            </Text>
            <Text variant="small">Losses</Text>
          </div>
        </div>
        <div
          className="flex justify-between w-full border-t border-b"
          style={{ borderColor }}
        >
          <div className="flex w-[40%] flex-col items-center justify-center py-2">
            <Text
              variant="h3-alt"
              classes={`font-semibold ${rival.latestResultColor}`}
            >
              {rival.latestResultScore}
            </Text>
            <Text variant="small">
              Latest Result ({rival.latestResultSeason})
            </Text>
          </div>
          <div className="flex justify-center w-[20%]">
            <div className="border" style={{ borderColor }} />
          </div>
          <div className="flex flex-col w-[40%] items-center justify-center py-2">
            <Text
              variant="h3-alt"
              classes={
                rival.CurrentStreak > 0
                  ? `${rival.streakColor} font-semibold`
                  : `${textColorClass}`
              }
            >
              {rival.streakText}
            </Text>
            <Text variant="small" classes={``}>
              Current Streak
            </Text>
          </div>
        </div>
        <Text variant="xs" classes={textColorClass}>
          Rival {currentIndex + 1} of {rivals}
        </Text>
      </div>
    </TeamProfileCards>
  );
};

export const TeamPlayerCareerStats = ({
  league,
  team,
  data,
  playerMap,
  title,
  backgroundColor,
  borderColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
}: TeamProfileComponentsProps) => {
  const [statsCategory, setStatsCategory] = useState<StatsCategory>("Passing");
  const selectStatsOption = (opts: SingleValue<SelectOption>) => {
    if (opts?.value) setStatsCategory(opts.value as StatsCategory);
  };
  const statColumns = getFBAStatColumns(statsCategory);
  const {
    topPassing,
    topRushing,
    topReceiving,
    topTackles,
    topSacks,
    topINTs,
  } = processTopPlayers(data, playerMap);

  let stats: any[] = [];
  switch (statsCategory) {
    case "Passing":
      stats = topPassing;
      break;
    case "Rushing":
      stats = topRushing;
      break;
    case "Receiving":
      stats = topReceiving;
      break;
    case "Tackles":
      stats = topTackles;
      break;
    case "Sacks":
      stats = topSacks;
      break;
    case "Interceptions":
      stats = topINTs;
      break;
    default:
      stats = [];
  }

  const statsLength = stats.length;
  const topThree = stats.slice(0, 3);

  const borderColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  if (!stats || statsLength === 0) {
    return (
      <TeamProfileCards
        team={team}
        header={title || "All-Time Stats Leaders"}
        classes={`${textColorClass} h-full`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        darkerBackgroundColor={darkerBackgroundColor}
        textColorClass={textColorClass}
      >
        <Text variant="small" classes={textColorClass}>
          No stats leader found.
        </Text>
      </TeamProfileCards>
    );
  }

  return (
    <TeamProfileCards
      team={team}
      header={title || "All-Time Stats Leaders"}
      classes={`${textColorClass} overflow-y-auto`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-row justify-center items-end gap-8 mb-4 w-full">
          {topThree.map((player, idx) => (
            <div
              key={player.CollegePlayerID || idx}
              className="flex flex-col items-center pt-2 w-1/4"
            >
              <div
                className="rounded-lg mb-2 border h-[7em] w-[5em]"
                style={{
                  border: `4px solid ${borderColors[idx]}`,
                  background: "#242424",
                }}
              >
                <Text variant="xs" classes="font-semibold">
                  {idx === 0 ? "1st" : idx === 1 ? "2nd" : "3rd"}
                </Text>
                <PlayerPicture
                  playerID={player.CollegePlayerID}
                  team={team}
                  league={league}
                  classes="max-h-[5em]"
                />
              </div>
              <Text variant="xs" classes="text-center">
                {player.FirstName}
              </Text>
              <Text variant="h3-alt" classes="text-center font-semibold">
                {player.LastName}
              </Text>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <SelectDropdown
            options={statsOptions}
            onChange={selectStatsOption}
            placeholder="Passing"
            className=""
          />
        </div>
        <Table
          columns={statColumns}
          data={stats}
          team={team}
          rowRenderer={(item, index, bg) => (
            <div
              className="table-row text-left text-lg"
              style={{ backgroundColor: bg }}
            >
              {statColumns.map((col) => (
                <TableCell key={col.accessor}>
                  {col.render ? col.render(item, index) : item[col.accessor]}
                </TableCell>
              ))}
            </div>
          )}
          rowBgColor={backgroundColor}
          darkerRowBgColor={darkerBackgroundColor}
          league={league}
        />
      </div>
    </TeamProfileCards>
  );
};

export const TeamSeasonHistory = ({
  league,
  team,
  data,
  teamTrophies,
  wins,
  losses,
  backgroundColor,
  borderColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
}: TeamProfileComponentsProps) => {
  const winsColor = "#189E5B";
  if (!data || data === 0) {
    return (
      <TeamProfileCards
        team={team}
        header="Seasons History"
        classes={`${textColorClass} h-full`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        darkerBackgroundColor={darkerBackgroundColor}
        textColorClass={textColorClass}
      >
        <Text variant="small" classes={textColorClass}>
          No season data found.
        </Text>
      </TeamProfileCards>
    );
  }

  const columns = getFBAPastSeasonColumns(
    winsColor,
    textColorClass,
    teamTrophies,
  );

  return (
    <TeamProfileCards
      team={team}
      header="Past Seasons"
      classes={`${textColorClass} w-full overflow-y-auto`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      <div className="flex flex-col justify-center gap-4 items-center py-2">
        <div className="flex flex-col gap-2 font-semibold">
          <Text variant="h3-alt" classes={textColorClass}>
            Overall Record
          </Text>
        </div>
        {wins !== undefined && losses !== undefined && (
          <div className="flex gap-2 font-semibold pb-2">
            <Text
              variant="h2-alt"
              classes={
                wins > losses
                  ? `text-[${winsColor}]`
                  : wins < losses
                    ? `text-red-500`
                    : textColorClass
              }
            >
              {wins}
            </Text>
            <Text
              variant="h2-alt"
              classes={
                wins > losses
                  ? `text-[${winsColor}]`
                  : wins < losses
                    ? `text-red-500`
                    : textColorClass
              }
            >
              -
            </Text>
            <Text
              variant="h2-alt"
              classes={
                wins > losses
                  ? `text-[${winsColor}]`
                  : wins < losses
                    ? `text-red-500`
                    : textColorClass
              }
            >
              {losses}
            </Text>
          </div>
        )}
      </div>
      <div className="overflow-x-auto w-full">
        <Table
          columns={columns}
          data={data}
          team={team}
          rowRenderer={(item: any, index: number, bg: string) => (
            <div
              className="table-row text-left text-lg"
              style={{ backgroundColor: bg }}
            >
              {columns.map((col) => (
                <TableCell key={col.accessor}>
                  {col.render ? col.render(item) : item[col.accessor]}
                </TableCell>
              ))}
            </div>
          )}
          rowBgColor={backgroundColor}
          darkerRowBgColor={darkerBackgroundColor}
          league={league}
        />
      </div>
    </TeamProfileCards>
  );
};

export const TeamTrophyCabinet = ({
  league,
  team,
  data,
  wins,
  losses,
  backgroundColor,
  borderColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
}: TeamProfileComponentsProps) => {
  const winsColor = "#189E5B";
  if (!data || data === 0) {
    return (
      <TeamProfileCards
        team={team}
        header="Trophy Cabinet"
        classes={`${textColorClass} h-full`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        darkerBackgroundColor={darkerBackgroundColor}
        textColorClass={textColorClass}
      >
        <Text variant="small" classes={textColorClass}>
          No trophy data found.
        </Text>
      </TeamProfileCards>
    );
  }

  return (
    <TeamProfileCards
      team={team}
      header="Trophy Cabinet"
      classes={`${textColorClass} w-full`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      <div className="flex justify-between">
        <div className="flex flex-col justify-center gap-4 items-center py-2">
          <div className="flex flex-col gap-2 font-semibold">
            <Text variant="alternate" classes={textColorClass}>
              National Champion
            </Text>
          </div>
          <div className="flex gap-2">
            <TrophyTwo textColorClass="text-yellow-500 w-12 h-12" />
            <div className="flex flex-col justify-center">
              <div className="flex gap-2">
                <Text
                  variant="alternate"
                  classes="text-right w-full font-semibold"
                >
                  Wins:{" "}
                </Text>
                <Text variant="alternate" classes="font-semibold">
                  {data.NationalChampionshipWins.length > 0
                    ? data.NationalChampionshipWins.length
                    : "0"}
                </Text>
              </div>
              <div className="flex gap-2 opacity-80">
                <Text variant="xs" classes="text-right w-full">
                  Losses:{" "}
                </Text>
                <Text variant="xs" classes="">
                  {data.NationalChampionshipLosses.length > 0
                    ? data.NationalChampionshipLosses.length
                    : "0"}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 items-center py-2">
          <div className="flex flex-col gap-2 font-semibold">
            <Text variant="alternate" classes={textColorClass}>
              Conference Champion
            </Text>
          </div>
          <div className="flex gap-2">
            <Trophy textColorClass="text-gray-400 w-12 h-12" />
            <div className="flex flex-col justify-center">
              <div className="flex gap-2">
                <Text
                  variant="alternate"
                  classes="text-right w-full font-semibold"
                >
                  Wins:{" "}
                </Text>
                <Text variant="alternate" classes="font-semibold">
                  {data.ConferenceChampionshipWins.length > 0
                    ? data.ConferenceChampionshipWins.length
                    : "0"}
                </Text>
              </div>
              <div className="flex gap-2 opacity-80">
                <Text variant="xs" classes="text-right w-full">
                  Losses:{" "}
                </Text>
                <Text variant="xs" classes="">
                  {data.ConferenceChampionshipLosses.length > 0
                    ? data.ConferenceChampionshipLosses.length
                    : "0"}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 items-center py-2">
          <div className="flex flex-col gap-2 font-semibold">
            <Text variant="alternate" classes={textColorClass}>
              Bowl Winner
            </Text>
          </div>
          <div className="flex gap-2">
            <Medal textColorClass="text-purple-500 w-12 h-12" />
            <div className="flex flex-col justify-center">
              <div className="flex gap-2">
                <Text
                  variant="alternate"
                  classes="text-right w-full font-semibold"
                >
                  Wins:{" "}
                </Text>
                <Text variant="alternate" classes="font-semibold">
                  {data.BowlWins.length > 0 ? data.BowlWins.length : "0"}
                </Text>
              </div>
              <div className="flex gap-2 opacity-80">
                <Text variant="xs" classes="text-right w-full">
                  Losses:{" "}
                </Text>
                <Text variant="xs" classes="">
                  {data.BowlLosses.length > 0 ? data.BowlLosses.length : "0"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeamProfileCards>
  );
};

export const TeamBowlResults = ({
  league,
  team,
  data,
  teamMap,
  wins,
  losses,
  backgroundColor,
  borderColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
}: TeamProfileComponentsProps) => {
  const winsColor = "#189E5B";
  if (!data || data === 0) {
    return (
      <TeamProfileCards
        team={team}
        header="Bowl Results"
        classes={`${textColorClass}`}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        borderColor={borderColor}
        darkerBackgroundColor={darkerBackgroundColor}
        textColorClass={textColorClass}
      >
        <Text variant="small" classes={textColorClass}>
          No season data found.
        </Text>
      </TeamProfileCards>
    );
  }

  const columns = getFBAPastBowlGamesColumns(
    winsColor,
    textColorClass,
    data,
    teamMap,
  );

  return (
    <TeamProfileCards
      team={team}
      header="Bowl Results"
      classes={`${textColorClass} w-full max-h-[30em] overflow-y-auto`}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      darkerBackgroundColor={darkerBackgroundColor}
      textColorClass={textColorClass}
    >
      <div className="overflow-x-auto w-full">
        <Table
          columns={columns}
          data={data}
          team={team}
          rowRenderer={(item: any, index: number, bg: string) => (
            <div
              className="table-row text-left text-lg"
              style={{ backgroundColor: bg }}
            >
              {columns.map((col) => (
                <TableCell key={col.accessor}>
                  {col.render ? col.render(item) : item[col.accessor]}
                </TableCell>
              ))}
            </div>
          )}
          rowBgColor={backgroundColor}
          darkerRowBgColor={darkerBackgroundColor}
          league={league}
        />
      </div>
    </TeamProfileCards>
  );
};

// export const TeamJerseys = ({
//   league,
//   team,
//   data,
//   teamColors,
//   backgroundColor,
//   borderColor,
//   headerColor,
//   darkerBackgroundColor,
//   textColorClass
// }: TeamProfileComponentsProps) => {

//   const [playerID, setPlayerID] = useState<number | null>(null);

//   useEffect(() => {
//     const playerIds = data ? Object.keys(data) : [];
//     if (playerIds.length > 0) {
//       const randomId = Number(playerIds[Math.floor(Math.random() * playerIds.length)]);
//       setPlayerID(randomId);
//     } else {
//       setPlayerID(10);
//     }
//   }, [team]);

//   return (
//     <TeamProfileCards
//       team={team}
//       header="Team Jerseys"
//       classes={`${textColorClass} w-full h-[10em]`}
//       backgroundColor={backgroundColor}
//       headerColor={headerColor}
//       borderColor={borderColor}
//       darkerBackgroundColor={darkerBackgroundColor}
//       textColorClass={textColorClass}
//     >
//       <div className="flex h-full">
//         <div className="">
//         {playerID !== null && (
//           <PlayerPicture playerID={playerID} league={league} team={team} />
//         )}
//         </div>
//       </div>
//     </TeamProfileCards>
//   );
// };

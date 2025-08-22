import React from "react";
import { Table } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import { Logo } from "../../_design/Logo";
import { getLogo } from "../../_utility/getLogo";
import {
  GetBKCurrentWeek,
  GetCurrentWeek,
  GetGameIndex,
  RevealBBAResults,
} from "../../_helper/teamHelper";
import { League, SimCBB, SimNBA } from "../../_constants/constants";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { ClickableTeamLabel } from "./Labels";

// ✅ Standings Table Component
interface StandingsTableProps {
  standings: any[];
  league: League;
  team: any;
  currentUser: CurrentUser;
  rowBgColor: string;
  darkerRowBgColor: string;
  textColorClass: string;
}

export const StandingsTable = ({
  standings,
  league,
  team,
  currentUser,
  rowBgColor,
  darkerRowBgColor,
  textColorClass,
}: StandingsTableProps) => {
  if (!standings || standings.length === 0) {
    return <div>No standings available</div>;
  }
  const columns = [
    { header: "Rank", accessor: "rank" },
    { header: "Team", accessor: "TeamName" },
    { header: "C.W", accessor: "ConferenceWins" },
    { header: "C.L", accessor: "ConferenceLosses" },
    { header: "T.W", accessor: "TotalWins" },
    { header: "T.L", accessor: "TotalLosses" },
  ];
  const rowRenderer = (item: any, index: number, backgroundColor: string) => {
    const logoUrl = getLogo(league, item.TeamID, currentUser.isRetro);
    return (
      <div
        key={index}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div
          className={`table-cell px-2 align-middle w-[16%] ${textColorClass}`}
        >
          {item.Rank}
        </div>
        <div className="table-cell align-middle w-[40%]">
          <div className="flex flex-row items-center">
            <Logo
              variant="normal"
              classes="max-h-[2em] max-w-[2em] sm:max-h-full sm:max-w-full sm:ml-[-0.5em] sm:my-[-0.5em]"
              containerClass="py-4 max-w-[4em] max-h-[4em] sm:max-w-[60px] sm:max-h-[60px] p-4"
              url={logoUrl}
            />
            <ClickableTeamLabel
              label={item.TeamName}
              teamID={item.TeamID}
              league={league}
              textVariant="xs"
            />
          </div>
        </div>
        <div
          className={`table-cell px-3 align-middle w-[16%] ${textColorClass}`}
        >
          {item.ConferenceWins}
        </div>
        <div
          className={`table-cell px-2 align-middle w-[16%] ${textColorClass}`}
        >
          {item.ConferenceLosses}
        </div>
        <div
          className={`table-cell px-2 align-middle w-[16%] ${textColorClass}`}
        >
          {item.TotalWins}
        </div>
        <div
          className={`table-cell px-1 align-middle w-[16%] ${textColorClass}`}
        >
          {item.TotalLosses}
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      data={standings}
      rowRenderer={rowRenderer}
      team={team}
    />
  );
};

// ✅ Games Table Component
interface GamesTableProps {
  games: any[];
  league: League;
  team: any;
  currentUser: CurrentUser;
  ts: any;
}

export const GamesTable = ({
  games,
  league,
  team,
  currentUser,
  ts,
}: GamesTableProps) => {
  const columns = [
    { header: "", accessor: "" },
    { header: "Opponent", accessor: "opp" },
    { header: "Week", accessor: "Week" },
    { header: "Day", accessor: "Day" },
    { header: "Home", accessor: "Home" },
    { header: "Away", accessor: "Away" },
  ];
  const { ID } = team;
  const rowRenderer = (item: any, index: number) => {
    const currentWeek = GetCurrentWeek(league, ts) || 0;
    const opposingTeam = item.HomeTeamID === ID ? item.AwayTeam : item.HomeTeam;
    const opposingTeamID =
      item.HomeTeamID === ID ? item.AwayTeamID : item.HomeTeamID;
    const opposingRank = item.HomeTeamID === ID ? item.AwayRank : item.HomeRank;
    const wonTheMatch =
      item.GameComplete &&
      ((item.HomeTeamID === ID && item.HomeTeamWin) ||
        (item.AwayTeamID === ID && item.AwayTeamWin));
    const awayGame = item.HomeTeamID === ID || item.IsNeutral ? false : true;
    const gameWeek = item.Week;
    const logoUrl = getLogo(league, opposingTeamID, currentUser.isRetro);
    const showResults = [SimCBB, SimNBA].includes(league)
      ? RevealBBAResults(item, ts, false)
      : false;
    return (
      <tr
        key={index}
        className={`border-t text-left bg ${
          showResults ? (wonTheMatch ? "bg-green-700" : "bg-red-700") : ""
        }`}
      >
        <td className="pl-3 py-1">
          <Logo variant="tiny" url={logoUrl} containerClass="p-4" />
        </td>
        <td className="flex px-2 py-3">
          <span className="">
            {awayGame ? "At " : ""}
            {opposingRank > 0 && `(${opposingRank}) `}
            {opposingTeam}
          </span>
        </td>
        <td>{gameWeek}</td>
        <td>{item.MatchOfWeek}</td>

        <td className={`py-2 px-2`}>
          <Text variant="alternate">
            {showResults ? item.HomeTeamScore : "?"}
          </Text>
        </td>
        <td className={`py-2 px-1`}>
          <Text variant="alternate">
            {showResults ? item.AwayTeamScore : "?"}
          </Text>
        </td>
      </tr>
    );
  };

  const currentIdx = GetGameIndex(ts, games);
  let gs = [];
  if (currentIdx > -1) {
    let prevIdx = currentIdx - 4;
    let nextIdx = currentIdx + 4;
    if (prevIdx < 0) {
      prevIdx = 0;
    }
    if (nextIdx >= games.length) {
      nextIdx = games.length - 1;
    }
    gs = games.slice(prevIdx, nextIdx + 1);
  }

  return (
    <Table columns={columns} data={gs} rowRenderer={rowRenderer} team={team} />
  );
};

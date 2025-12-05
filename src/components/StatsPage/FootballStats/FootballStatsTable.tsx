import { FC, ReactNode } from "react";
import {
  FootballStatsType,
  InfoType,
  League,
  ModalAction,
  PLAYER_VIEW,
  SimCFB,
  SimNFL,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import {
  CollegePlayer,
  CollegePlayerSeasonStats,
  CollegePlayerStats,
  CollegeTeam,
  CollegeTeamSeasonStats,
  CollegeTeamStats,
  NFLPlayer,
  NFLPlayerSeasonStats,
  NFLPlayerStats,
  NFLTeam,
  NFLTeamSeasonStats,
  NFLTeamStats,
} from "../../../models/footballModels";
import {
  GetFootballPlayerStatsValues,
  GetFootballStatsColumns,
  GetFootballTeamStatsValues,
} from "../Common/StatsPageHelper";
import { getLogo } from "../../../_utility/getLogo";
import { Table, TableCell } from "../../../_design/Table";
import { Logo } from "../../../_design/Logo";
import { Text } from "../../../_design/Typography";
import { getYear } from "../../../_utility/getYear";
import { getPlayerOverallRating } from "../../Gameplan/FootballGameplan/Utils/GameplanPlayerUtils";

interface FootballStatsTableProps {
  teamColors: any;
  teamMap: any;
  team: any;
  playerMap: any;
  league: League;
  isMobile?: boolean;
  openModal: (action: ModalAction, player: CollegePlayer | NFLPlayer) => void;
  stats: any[];
  statsView: StatsView;
  statsType: StatsType;
  footballStatsType: FootballStatsType;
  currentPage: number;
}

export const FootballStatsTable: FC<FootballStatsTableProps> = ({
  teamColors,
  teamMap,
  team,
  playerMap,
  league,
  isMobile,
  openModal,
  stats,
  statsView,
  statsType,
  footballStatsType,
  currentPage,
}) => {
  const backgroundColor = teamColors.One;
  const columns = GetFootballStatsColumns(
    league,
    statsType,
    footballStatsType,
    statsView,
    isMobile!!
  );

  // Get Row Renderer
  const CFBPlayerRowRenderer = (
    item: CollegePlayerStats | CollegePlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.CollegePlayerID] as CollegePlayer;
    if (!player) return <></>;
    item.Player = player;
    const team = teamMap[item.TeamID] as CollegeTeam;
    const logo = getLogo(league, team.ID, false);
    const values = GetFootballPlayerStatsValues(
      item,
      statsView,
      footballStatsType
    );
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell>
          <div className="flex flex-row items-center justify-center">
            <Logo variant="small" url={logo} containerClass="mr-2" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-start">
            <Text variant="xs">{team.TeamName}</Text>
          </div>
        </TableCell>
        <TableCell
          classes={`min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
                text-wrap sm:max-w-full`}
        >
          <span
            className={`cursor-pointer font-semibold`}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "#fcd53f";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "";
            }}
            onClick={() => openModal(InfoType, player)}
          >
            <Text variant="small">
              {player.FirstName} {player.LastName}
            </Text>
          </span>
        </TableCell>
        <TableCell>
          <Text variant="small">{player.Position}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">{player.Archetype}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">{getYear(item.Year, player.IsRedshirt)}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">
            {getPlayerOverallRating(player, SimCFB, true)}
          </Text>
        </TableCell>
        {values!.map((stat: any, idx: number) => {
          return (
            <TableCell key={stat.label + idx}>
              <Text variant="small">{stat.value}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };

  const CFBTeamRowRenderer = (
    item: CollegeTeamStats | CollegeTeamSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const team = teamMap[item.TeamID] as CollegeTeam;
    if (!team) return <></>;
    item.Team = team;
    const logo = getLogo(league, team.ID, false);
    const values = GetFootballTeamStatsValues(
      item,
      statsView,
      footballStatsType
    );

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell>
          <div className="flex flex-row items-center justify-center">
            <Logo variant="small" url={logo} containerClass="mr-2" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-start">
            <Text variant="xs">{team.TeamName}</Text>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-center">
            <Text variant="xs">{team.Conference}</Text>
          </div>
        </TableCell>
        {values.map((stat: any, idx: number) => {
          return (
            <TableCell key={stat.label + idx}>
              <Text variant="small">{stat.value}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };

  const NFLPlayerRowRenderer = (
    item: NFLPlayerStats | NFLPlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.NFLPlayerID] as NFLPlayer;
    if (!player) return <></>;
    const team = teamMap[item.TeamID] as NFLTeam;
    const logo = getLogo(league, team.ID, false);
    const values = GetFootballPlayerStatsValues(
      item,
      statsView,
      footballStatsType
    );

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell>
          <div className="flex flex-row items-center  justify-center">
            <Logo variant="small" url={logo} containerClass="mr-2" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-start">
            <Text variant="xs">{team.TeamName}</Text>
          </div>
        </TableCell>
        <TableCell
          classes={`min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
            text-wrap sm:max-w-full`}
        >
          <span
            className={`cursor-pointer font-semibold`}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "#fcd53f";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "";
            }}
            onClick={() => openModal(InfoType, player)}
          >
            <Text variant="small">
              {player.FirstName} {player.LastName}
            </Text>
          </span>
        </TableCell>
        <TableCell>
          <Text variant="small">{player.Position}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">{player.Archetype}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">{item.Year}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">
            {getPlayerOverallRating(player, SimNFL, item.ShowLetterGrade)}
          </Text>
        </TableCell>
        {values.map((stat: any, idx) => {
          return (
            <TableCell key={stat.label + idx}>
              <Text variant="small">{stat.value}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };

  const NFLTeamRowRenderer = (
    item: NFLTeamStats | NFLTeamSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const team = teamMap[item.TeamID] as NFLTeam;
    if (!team) return <></>;
    item.Team = team;
    const logo = getLogo(league, team.ID, false);
    const values = GetFootballTeamStatsValues(
      item,
      statsView,
      footballStatsType
    );
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell>
          <div className="flex flex-row items-center  justify-center">
            <Logo variant="small" url={logo} containerClass="mr-2" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-start">
            <Text variant="xs">{team.TeamName}</Text>
          </div>
        </TableCell>
        {values.map((stat: any, idx) => {
          return (
            <TableCell key={stat.label + idx}>
              <Text variant="small">{stat.value}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimNFL) {
      if (statsType === PLAYER_VIEW) {
        return NFLPlayerRowRenderer;
      }
      return NFLTeamRowRenderer;
    }
    if (statsType === PLAYER_VIEW) {
      return CFBPlayerRowRenderer;
    }
    return CFBTeamRowRenderer;
  };
  return (
    <Table
      columns={columns}
      data={stats}
      rowRenderer={rowRenderer(league)}
      backgroundColor={backgroundColor}
      team={team}
      currentPage={currentPage}
      enablePagination
      page={`Stats${statsType}`}
    />
  );
};

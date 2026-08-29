import { FC, ReactNode, useMemo } from "react";
import {
  InfoType,
  League,
  ModalAction,
  PLAYER_VIEW,
  SimCBB,
  SimNBA,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import {
  CollegePlayer,
  NBAPlayer,
  NBATeamStats,
  NBATeamSeasonStats,
  NBATeam,
  NBAPlayerSeasonStats,
  NBAPlayerStats,
  TeamSeasonStats,
  Team,
  TeamStats,
  CollegePlayerStats,
  CollegePlayerSeasonStats,
} from "../../../models/basketballModels";
import {
  GetBasketballPlayerStatsValues,
  GetBasketballStatsColumns,
  GetBasketballTeamStatsValues,
} from "../Common/StatsPageHelper";
import { Table, TableCell } from "../../../_design/Table";
import { Text } from "../../../_design/Typography";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";
import { getYear } from "../../../_utility/getYear";
import { getCBBOverall } from "../../../_utility/getLetterGrade";

interface BasketballStatsTableProps {
  teamColors: any;
  teamMap: any;
  team: any;
  playerMap: any;
  league: League;
  isMobile?: boolean;
  openModal: (action: ModalAction, player: CollegePlayer | NBAPlayer) => void;
  stats: any[];
  statsView: StatsView;
  statsType: StatsType;
  currentPage: number;
  basketballStatsType: string;
}

export const BasketballStatsTable: FC<BasketballStatsTableProps> = ({
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
  currentPage,
  basketballStatsType,
}) => {
  const backgroundColor = teamColors.One;
  const columns = GetBasketballStatsColumns(
    league,
    statsType,
    statsView,
    basketballStatsType,
    isMobile!!,
  );

  // Get Row Renderer
  const CBBPlayerRowRenderer = (
    item: CollegePlayerStats | CollegePlayerSeasonStats,
    index: number,
    backgroundColor: string,
  ) => {
    const player = playerMap[item.CollegePlayerID] as CollegePlayer;
    if (!player) return <></>;
    item.Player = player;
    const team = teamMap[item.TeamID] as Team;
    if (!team) return <></>;
    const logo = getLogo(league, team.ID, false);
    const values = GetBasketballPlayerStatsValues(
      item,
      statsView,
      basketballStatsType,
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
            <Text variant="xs">{team.Team}</Text>
          </div>
        </TableCell>
        <TableCell
          classes={`360px:max-w-[6em] 380px:max-w-[8em] 430px:max-w-[10em] 
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
            {getCBBOverall(player.Overall, player.Year)}
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

  const CBBTeamRowRenderer = (
    item: TeamStats | TeamSeasonStats | NBATeamStats | NBATeamSeasonStats,
    index: number,
    backgroundColor: string,
  ) => {
    const team = teamMap[item.TeamID] as Team;
    if (!team) return <></>;
    item.Team = team;
    const logo = getLogo(league, team.ID, false);
    const values = GetBasketballTeamStatsValues(
      item,
      statsView,
      basketballStatsType,
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
            <Text variant="xs">{team.Team}</Text>
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

  const NBAPlayerRowRenderer = (
    item: NBAPlayerStats | NBAPlayerSeasonStats,
    index: number,
    backgroundColor: string,
  ) => {
    const player = playerMap[item.NBAPlayerID] as NBAPlayer;
    if (!player) return <></>;
    const team = teamMap[item.TeamID] as NBATeam;
    if (!team) return <></>;
    const logo = getLogo(league, team.ID, false);
    const values = GetBasketballPlayerStatsValues(
      item,
      statsView,
      basketballStatsType,
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
            <Text variant="xs">{team.Team}</Text>
          </div>
        </TableCell>
        <TableCell
          classes={`360px:max-w-[6em] 380px:max-w-[8em] 430px:max-w-[10em] 
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
          <Text variant="small">{player.Overall}</Text>
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

  const NBATeamRowRenderer = (
    item: NBATeamStats | NBATeamSeasonStats,
    index: number,
    backgroundColor: string,
  ) => {
    const team = teamMap[item.TeamID] as NBATeam;
    if (!team) return <></>;
    item.Team = team;
    const logo = getLogo(league, team.ID, false);
    const values = GetBasketballTeamStatsValues(
      item,
      statsView,
      basketballStatsType,
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
            <Text variant="xs">{team.Team}</Text>
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
  const augmentedStats = useMemo(() => {
    return stats.map((item: any) => {
      if (statsType === PLAYER_VIEW) {
        if (!item.Player) {
          const playerKey =
            league === SimNBA ? item.NBAPlayerID : item.CollegePlayerID;
          const player = playerMap[playerKey];
          if (player) item.Player = player;
        }
      } else {
        if (!item.Team) {
          const team = teamMap[item.TeamID];
          if (team) item.Team = team;
        }
      }
      return item;
    });
  }, [stats, statsType, playerMap, teamMap, league]);

  const rowRenderer = (
    league: League,
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimNBA) {
      if (statsType === PLAYER_VIEW) {
        return NBAPlayerRowRenderer;
      }
      return NBATeamRowRenderer;
    }
    if (statsType === PLAYER_VIEW) {
      return CBBPlayerRowRenderer;
    }
    return CBBTeamRowRenderer;
  };
  return (
    <Table
      columns={columns}
      data={augmentedStats}
      rowRenderer={rowRenderer(league)}
      backgroundColor={backgroundColor}
      team={team}
      currentPage={currentPage}
      enablePagination
      page={`Stats${statsType}`}
    />
  );
};

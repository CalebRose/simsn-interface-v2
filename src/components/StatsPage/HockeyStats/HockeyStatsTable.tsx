import { FC, ReactNode } from "react";
import {
  InfoType,
  League,
  ModalAction,
  PLAYER_VIEW,
  SEASON_VIEW,
  SimPHL,
  StatsType,
  StatsView,
} from "../../../_constants/constants";
import {
  CollegePlayer,
  CollegePlayerGameStats,
  CollegePlayerSeasonStats,
  CollegeTeamGameStats,
  CollegeTeamSeasonStats,
  ProfessionalPlayerGameStats,
  ProfessionalPlayerSeasonStats,
  ProfessionalTeamGameStats,
  ProfessionalTeamSeasonStats,
  ProfessionalPlayer,
  CollegeTeam,
  ProfessionalTeam,
} from "../../../models/hockeyModels";
import {
  GetHockeyPlayerStatsValues,
  GetHockeyTeamStatsValues,
  GetStatsColumns,
} from "../Common/StatsPageHelper";
import { Table, TableCell } from "../../../_design/Table";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import { Text } from "../../../_design/Typography";
import { getYear } from "../../../_utility/getYear";
import { getHockeyLetterGrade } from "../../../_utility/getLetterGrade";

interface HockeyStatsTableProps {
  teamColors: any;
  teamMap: any;
  team: any;
  playerMap: any;
  league: League;
  isMobile?: boolean;
  openModal: (
    action: ModalAction,
    player: CollegePlayer | ProfessionalPlayer
  ) => void;
  stats: any[];
  statsView: StatsView;
  statsType: StatsType;
  isGoalie: boolean;
  currentPage: number;
}

export const HockeyStatsTable: FC<HockeyStatsTableProps> = ({
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
  isGoalie,
  currentPage,
}) => {
  const backgroundColor = teamColors.One;
  const columns = GetStatsColumns(
    league,
    statsType,
    statsView,
    isMobile!!,
    isGoalie
  );

  // Get Row Renderer
  const CHLPlayerRowRenderer = (
    item: CollegePlayerGameStats | CollegePlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.PlayerID] as CollegePlayer;
    if (!player) return <></>;
    item.Player = player;
    const team = teamMap[item.TeamID] as CollegeTeam;
    const logo = getLogo(league, team.ID, false);
    const values = GetHockeyPlayerStatsValues(item, statsView, isGoalie);
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
          <Text variant="small">{getYear(player.Year, player.IsRedshirt)}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">
            {getHockeyLetterGrade(player.Overall, player.Year)}
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

  const CHLTeamRowRenderer = (
    item: CollegeTeamGameStats | CollegeTeamSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const collegeTeam = teamMap[item.TeamID] as CollegeTeam;
    if (!collegeTeam) return <></>;
    item.Team = collegeTeam;
    const logo = getLogo(league, collegeTeam.ID, false);
    const values = GetHockeyTeamStatsValues(item, statsView);

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

  const PHLPlayerRowRenderer = (
    item: ProfessionalPlayerGameStats | ProfessionalPlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.PlayerID] as ProfessionalPlayer;
    if (!player) return <></>;
    const team = teamMap[item.TeamID] as ProfessionalTeam;
    const logo = getLogo(league, team.ID, false);
    const values = GetHockeyPlayerStatsValues(item, statsView, isGoalie);

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
          <Text variant="small">{getYear(player.Year, player.IsRedshirt)}</Text>
        </TableCell>
        <TableCell>
          <Text variant="small">
            {getHockeyLetterGrade(player.Overall, player.Year)}
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

  const PHLTeamRowRenderer = (
    item: ProfessionalTeamGameStats | ProfessionalTeamSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const team = teamMap[item.TeamID] as ProfessionalTeam;
    if (!team) return <></>;
    item.Team = team;
    const logo = getLogo(league, team.ID, false);
    const values = GetHockeyTeamStatsValues(item, statsView);
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
    if (league === SimPHL) {
      if (statsType === PLAYER_VIEW) {
        return PHLPlayerRowRenderer;
      }
      return PHLTeamRowRenderer;
    }
    if (statsType === PLAYER_VIEW) {
      return CHLPlayerRowRenderer;
    }
    return CHLTeamRowRenderer;
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

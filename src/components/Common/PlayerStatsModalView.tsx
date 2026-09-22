import React, { useMemo } from "react";
import {
  CollegePlayer as CFBPlayer,
  NFLDraftee,
  NFLPlayer,
} from "../../models/footballModels";
import { League, SEASON_VIEW, SimCBB } from "../../_constants/constants";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import {
  calculateFBCareerStats,
  calculateHCKCareerStats,
} from "../../_utility/footballStatsUtils";
import { FBPlayerStatsRow, HCKPlayerStatsRow } from "./PlayerStatsRow";
import {
  CollegePlayer as CHLPlayer,
  DraftablePlayer,
  ProfessionalPlayer,
} from "../../models/hockeyModels";
import {
  CollegePlayer,
  CollegePlayerSeasonStats,
  NBAPlayer,
  NBAPlayerSeasonStats,
} from "../../models/basketballModels";
import {
  useFootballPlayerStatsData,
  useHockeyPlayerStatsData,
  useBasketballPlayerStatsData,
} from "../../_hooks/usePlayerStatsData";
import { useSimBBAStore } from "../../context/SimBBAContext";
import {
  useFBStatsConfiguration,
  useHCKStatsConfiguration,
} from "../../_hooks/useStatsConfiguration";
import {
  useFBValueLabels,
  useHCKValueLabels,
} from "../../_hooks/useValueLabels";

type BasketballSeasonStats = CollegePlayerSeasonStats | NBAPlayerSeasonStats;

const basketballModalStatLabels = [
  "GP",
  "MPG",
  "PPG",
  "FG%",
  "3PT%",
  "REB",
  "AST",
  "STL",
  "BLK",
];

const basketballCareerStatKeys = [
  "GamesPlayed",
  "Minutes",
  "Possessions",
  "FGM",
  "FGA",
  "ThreePointsMade",
  "ThreePointAttempts",
  "FTM",
  "FTA",
  "Points",
  "TotalRebounds",
  "OffRebounds",
  "DefRebounds",
  "Assists",
  "Steals",
  "Blocks",
  "Turnovers",
  "Fouls",
  "FoulOuts",
] as const;

const getBasketballSeasonLabel = (seasonID: number) => 2020 + seasonID;

const getBasketballModalStatsValues = (stats: BasketballSeasonStats) => {
  const gamesPlayed = stats.GamesPlayed || 0;
  const perGame = (value: number) =>
    gamesPlayed > 0 ? (value / gamesPlayed).toFixed(1) : "0.0";
  const percentage = (made: number, attempts: number) =>
    attempts > 0 ? `${((made / attempts) * 100).toFixed(1)}%` : "0.0%";

  return [
    gamesPlayed,
    perGame(stats.Minutes),
    perGame(stats.Points),
    percentage(stats.FGM, stats.FGA),
    percentage(stats.ThreePointsMade, stats.ThreePointAttempts),
    stats.TotalRebounds,
    stats.Assists,
    stats.Steals,
    stats.Blocks,
  ];
};

const calculateBasketballCareerStats = (
  playerStats: BasketballSeasonStats[],
): BasketballSeasonStats | null => {
  if (playerStats.length === 0) return null;

  const career = playerStats.reduce((total, stat) => {
    basketballCareerStatKeys.forEach((key) => {
      total[key] = (total[key] ?? 0) + (stat[key] ?? 0);
    });
    return total;
  }, {} as Record<string, number>);

  career.SeasonID = 0;
  career.isCareer = 1;
  career.FGPercent = career.FGA > 0 ? career.FGM / career.FGA : 0;
  career.ThreePointPercent =
    career.ThreePointAttempts > 0
      ? career.ThreePointsMade / career.ThreePointAttempts
      : 0;
  career.FTPercent = career.FTA > 0 ? career.FTM / career.FTA : 0;

  return career as BasketballSeasonStats;
};

interface FootballPlayerStatsModalViewProps {
  player: CFBPlayer | NFLPlayer | NFLDraftee;
  league: League;
}

export const FootballPlayerStatsModalView: React.FC<
  FootballPlayerStatsModalViewProps
> = ({ player, league }) => {
  const statsView = SEASON_VIEW;
  const { playerStats, isLoading, error } = useFootballPlayerStatsData(
    player,
    league,
  );
  const { statsConfig, footballStatsType } = useFBStatsConfiguration(player);
  const valueLabels = useFBValueLabels(
    playerStats,
    footballStatsType,
    statsView,
    statsConfig,
  );

  const columns = useMemo(
    () => [
      { header: "Season", accessor: "SeasonID" },
      ...valueLabels.map((label, index) => ({
        header: label,
        accessor: `stat-${index}`,
      })),
    ],
    [valueLabels],
  );

  const careerStats = useMemo(
    () => calculateFBCareerStats(playerStats, league),
    [playerStats, league],
  );

  const rowRenderer = (item: any, index: number, backgroundColor: string) => (
    <FBPlayerStatsRow
      item={item}
      index={index}
      backgroundColor={backgroundColor}
      valueLabels={valueLabels}
      footballStatsType={footballStatsType}
      statsView={statsView}
    />
  );

  return (
    <div className="flex flex-col w-full overflow-x-auto">
      {isLoading && playerStats.length === 0 && (
        <div className="p-4 text-center">
          <Text variant="body-small">Loading stats...</Text>
        </div>
      )}
      {!isLoading && error && (
        <div className="p-4 text-center">
          <Text variant="body-small">{error}</Text>
        </div>
      )}
      {!isLoading && !error && playerStats.length === 0 && (
        <div className="p-4 text-center">
          <Text variant="body-small">No stats available for this player.</Text>
        </div>
      )}
      {playerStats.length > 0 && (
        <Table
          columns={columns}
          data={careerStats ? [...playerStats, careerStats] : playerStats}
          rowRenderer={rowRenderer}
          team={null as any}
          page="PlayerStatsModal"
        />
      )}
    </div>
  );
};

interface HockeyPlayerStatsModalViewProps {
  player: CHLPlayer | ProfessionalPlayer | DraftablePlayer;
  league: League;
}

export const HockeyPlayerStatsModalView: React.FC<
  HockeyPlayerStatsModalViewProps
> = ({ player, league }) => {
  const statsView = SEASON_VIEW;
  const { playerStats, isLoading, error } = useHockeyPlayerStatsData(
    player,
    league,
  );
  const { statsConfig } = useHCKStatsConfiguration(player);
  const valueLabels = useHCKValueLabels(
    playerStats,
    statsView,
    player.Position === "G",
    statsConfig,
  );

  const columns = useMemo(
    () => [
      { header: "Season", accessor: "SeasonID" },
      ...valueLabels.map((label, index) => ({
        header: label,
        accessor: `stat-${index}`,
      })),
    ],
    [valueLabels],
  );

  const careerStats = useMemo(
    () => calculateHCKCareerStats(playerStats, league),
    [playerStats, league],
  );

  const rowRenderer = (item: any, index: number, backgroundColor: string) => (
    <HCKPlayerStatsRow
      item={item}
      index={index}
      backgroundColor={backgroundColor}
      valueLabels={valueLabels}
      isGoalie={player.Position === "G"}
      statsView={statsView}
    />
  );

  return (
    <div className="flex flex-col w-full">
      {isLoading && playerStats.length === 0 && (
        <div className="p-4 text-center w-full">
          <Text variant="body-small">Loading stats...</Text>
        </div>
      )}
      {!isLoading && error && (
        <div className="p-4 text-center w-full">
          <Text variant="body-small">{error}</Text>
        </div>
      )}
      {!isLoading && !error && playerStats.length === 0 && (
        <div className="p-4 text-center w-full">
          <Text variant="body-small">No stats available for this player.</Text>
        </div>
      )}
      {playerStats.length > 0 && (
        <Table
          columns={columns}
          data={careerStats ? [...playerStats, careerStats] : playerStats}
          rowRenderer={rowRenderer}
          team={null as any}
          page="PlayerStatsModal"
        />
      )}
    </div>
  );
};

interface BasketballPlayerStatsModalViewProps {
  player: CollegePlayer | NBAPlayer;
  league: League;
  statsPlayerID?: number;
  alternateStatsPlayerID?: number;
  hideWhenEmpty?: boolean;
  title?: string;
}

export const BasketballPlayerStatsModalView: React.FC<
  BasketballPlayerStatsModalViewProps
> = ({
  player,
  league,
  statsPlayerID,
  alternateStatsPlayerID,
  hideWhenEmpty = false,
  title,
}) => {
  const { cbbTeamMap, nbaTeamMap } = useSimBBAStore();
  const { playerStats, isLoading, error } = useBasketballPlayerStatsData(
    player,
    league,
    statsPlayerID,
    alternateStatsPlayerID,
  );
  const careerStats = useMemo(
    () => calculateBasketballCareerStats(playerStats),
    [playerStats],
  );
  const columns = useMemo(
    () => [
      { header: "Season", accessor: "SeasonID" },
      { header: "Team", accessor: "TeamID" },
      ...basketballModalStatLabels.map((label, index) => ({
        header: label,
        accessor: `stat-${index}`,
      })),
    ],
    [],
  );

  const rowRenderer = (
    item: BasketballSeasonStats,
    index: number,
    backgroundColor: string,
  ) => {
    const isCareerRow = Boolean((item as any).isCareer);
    const values = getBasketballModalStatsValues(item);
    const team =
      league === SimCBB
        ? cbbTeamMap?.[item.TeamID]
        : nbaTeamMap?.[item.TeamID];
    const teamLabel = team?.Abbr || team?.Team || "—";
    return (
      <div
        key={index}
        className={`table-row border-b dark:border-gray-700 text-left ${
          isCareerRow ? "font-semibold" : ""
        }`}
        style={{ backgroundColor }}
      >
        <TableCell>
          <Text variant="small">
            {isCareerRow ? "Career" : getBasketballSeasonLabel(item.SeasonID)}
          </Text>
        </TableCell>
        <TableCell>
          <Text variant="small">{isCareerRow ? "—" : teamLabel}</Text>
        </TableCell>
        {values.map((value, valueIndex) => (
          <TableCell key={basketballModalStatLabels[valueIndex]}>
            <Text variant="small">{value}</Text>
          </TableCell>
        ))}
      </div>
    );
  };

  if (hideWhenEmpty && playerStats.length === 0) return null;

  return (
    <div className="flex flex-col w-full overflow-x-auto">
      {title && playerStats.length > 0 && (
        <Text variant="body" classes="mb-2 font-semibold">
          {title}
        </Text>
      )}
      {isLoading && playerStats.length === 0 && (
        <div className="p-4 text-center">
          <Text variant="body-small">Loading stats...</Text>
        </div>
      )}
      {!isLoading && error && (
        <div className="p-4 text-center">
          <Text variant="body-small">{error}</Text>
        </div>
      )}
      {!isLoading && !error && playerStats.length === 0 && (
        <div className="p-4 text-center">
          <Text variant="body-small">No stats available for this player.</Text>
        </div>
      )}
      {playerStats.length > 0 && (
        <Table
          columns={columns}
          data={careerStats ? [...playerStats, careerStats] : playerStats}
          rowRenderer={rowRenderer}
          team={null as any}
          page="PlayerStatsModal"
        />
      )}
    </div>
  );
};

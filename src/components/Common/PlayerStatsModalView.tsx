import React, { useMemo } from "react";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../../models/footballModels";
import { League, SEASON_VIEW } from "../../_constants/constants";
import { Table } from "../../_design/Table";
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
import { CollegePlayer, NBAPlayer } from "../../models/basketballModels";
import {
  useFootballPlayerStatsData,
  useHockeyPlayerStatsData,
} from "../../_hooks/usePlayerStatsData";
import {
  useFBStatsConfiguration,
  useHCKStatsConfiguration,
} from "../../_hooks/useStatsConfiguration";
import {
  useFBValueLabels,
  useHCKValueLabels,
} from "../../_hooks/useValueLabels";

interface FootballPlayerStatsModalViewProps {
  player: CFBPlayer | NFLPlayer;
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
}

export const BasketballPlayerStatsModalView: React.FC<
  BasketballPlayerStatsModalViewProps
> = ({ player, league }) => {
  return (
    <div className="p-4 text-center">
      <Text variant="body-small">Basketball stats coming soon!</Text>
    </div>
  );
};

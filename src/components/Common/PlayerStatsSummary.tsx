import React from "react";
import { CollegePlayer, NFLPlayer } from "../../models/footballModels";
import { League } from "../../_constants/constants";
import {
  usePlayerStatsData,
  useStatsConfiguration,
} from "../../_hooks/footballStatsHooks";
import { calculateFBCareerStats } from "../../_utility/footballStatsUtils";
import { Text } from "../../_design/Typography";

interface PlayerStatsSummaryProps {
  player: CollegePlayer | NFLPlayer;
  league: League;
}

/**
 * Example component showing how the refactored hooks and utilities
 * can be reused to create a simplified stats summary view
 */
export const PlayerStatsSummary: React.FC<PlayerStatsSummaryProps> = ({
  player,
  league,
}) => {
  const { playerStats, isLoading, error } = usePlayerStatsData(player, league);
  const { footballStatsType } = useStatsConfiguration(player);

  if (isLoading) return <Text variant="small">Loading stats...</Text>;
  if (error) return <Text variant="small">{error}</Text>;
  if (playerStats.length === 0)
    return <Text variant="small">No stats available</Text>;

  const careerStats = calculateFBCareerStats(playerStats, league);

  if (!careerStats) return null;

  // Simple summary based on position
  const getSummaryStats = () => {
    switch (footballStatsType) {
      case "PASSING":
        return {
          "Passing Yards": careerStats.PassingYards,
          Touchdowns: careerStats.PassingTDs,
          Completions: `${careerStats.PassCompletions}/${careerStats.PassAttempts}`,
        };
      case "RUSHING":
        return {
          "Rushing Yards": careerStats.RushingYards,
          Touchdowns: careerStats.RushingTDs,
          Attempts: careerStats.RushAttempts,
        };
      case "RECEIVING":
        return {
          "Receiving Yards": careerStats.ReceivingYards,
          Touchdowns: careerStats.ReceivingTDs,
          Catches: careerStats.Catches,
        };
      default:
        return {
          "Games Played": careerStats.GamesPlayed,
          "Total Tackles":
            careerStats.SoloTackles + careerStats.AssistedTackles,
        };
    }
  };

  const summary = getSummaryStats();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
      <Text variant="h4" className="mb-2">
        Career Stats Summary
      </Text>
      {Object.entries(summary).map(([label, value]) => (
        <div key={label} className="flex justify-between">
          <Text variant="small">{label}:</Text>
          <Text variant="small" className="font-semibold">
            {value}
          </Text>
        </div>
      ))}
    </div>
  );
};

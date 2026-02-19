import { useMemo } from "react";
import {
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  NFLPlayerSeasonStats,
} from "../models/footballModels";
import {
  FootballStatsType,
  StatsType,
  StatsView,
} from "../_constants/constants";
import {
  GetFootballPlayerStatsValues,
  GetHockeyPlayerStatsValues,
} from "../components/StatsPage/Common/StatsPageHelper";
import {
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  ProfessionalPlayerSeasonStats,
} from "../models/hockeyModels";

export const useFBValueLabels = (
  playerStats: (CFBPlayerSeasonStats | NFLPlayerSeasonStats)[],
  footballStatsType: FootballStatsType,
  statsView: StatsView,
  statsConfig?: { labels?: string[] },
) => {
  return useMemo(() => {
    if (statsConfig) {
      return ["GP", ...(statsConfig.labels || [])];
    }

    if (playerStats.length === 0) return [];

    const values = GetFootballPlayerStatsValues(
      playerStats[0],
      statsView,
      footballStatsType,
    );
    const baseLabels = values.map((v) => v.label);
    const otherLabels = baseLabels.filter((l) => l !== "GP");

    return ["GP", ...otherLabels.slice(0, 4)];
  }, [playerStats, footballStatsType, statsConfig, statsView]);
};

export const useHCKValueLabels = (
  playerStats: (CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats)[],
  statsView: StatsView,
  isGoalie: boolean,
  statsConfig?: { labels?: string[] },
) => {
  return useMemo(() => {
    if (statsConfig) {
      return ["GP", ...(statsConfig.labels || [])];
    }

    if (playerStats.length === 0) return [];

    const values = GetHockeyPlayerStatsValues(
      playerStats[0],
      statsView,
      isGoalie,
    );
    const baseLabels = values.map((v) => v.label);
    const otherLabels = baseLabels.filter((l) => l !== "GP");

    return ["GP", ...otherLabels.slice(0, 9)];
  }, [playerStats, statsConfig, statsView, isGoalie]);
};

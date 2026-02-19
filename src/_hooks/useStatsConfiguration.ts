import { useMemo } from "react";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../models/footballModels";
import {
  FootballStatsType,
  POSITION_STATS_CONFIG,
  ATH_ARCHETYPE_STATS_CONFIG,
} from "../_constants/constants";
import {
  getFootballStatsType,
  getArchetypeValue,
  ATH_VALUE,
} from "../_utility/footballPositionUtils";
import {
  CollegePlayer as CHLPlayer,
  DraftablePlayer,
  ProfessionalPlayer,
} from "../models/hockeyModels";

export const useFBStatsConfiguration = (player: CFBPlayer | NFLPlayer) => {
  const statsConfig = useMemo(() => {
    const positionKey = player.Position;
    if (positionKey === ATH_VALUE) {
      const archetypeKey = getArchetypeValue((player as any).Archetype);
      if (archetypeKey && ATH_ARCHETYPE_STATS_CONFIG[archetypeKey]) {
        return ATH_ARCHETYPE_STATS_CONFIG[archetypeKey];
      }
      return { statsType: "PASSING" as FootballStatsType, labels: [] };
    }
    return (
      POSITION_STATS_CONFIG[positionKey] || {
        statsType: "PASSING" as FootballStatsType,
        labels: [],
      }
    );
  }, [player]);

  const defaultStatsType = getFootballStatsType(player.Position);
  const footballStatsType: FootballStatsType =
    statsConfig?.statsType ?? defaultStatsType;

  return {
    statsConfig,
    footballStatsType,
  };
};

export const useHCKStatsConfiguration = (
  player: CHLPlayer | ProfessionalPlayer | DraftablePlayer,
) => {
  const statsConfig = useMemo(() => {
    // Hockey doesn't use the same position/archetype system as football
    // Return a simple config based on goalie vs skater
    const isGoalie = player.Position === "G";
    if (isGoalie) {
      return {
        labels: ["W", "L", "T", "SA", "SV", "GAA", "SV%", "SO"],
        statsType: "GOALIE" as any,
      };
    } else {
      if (player.Position === "F") {
        return {
          labels: ["G", "A", "Pts", "+/-", "PIM", "SOG", "S%", "PPP", "PPG"],
          statsType: "SKATER" as any,
        };
      }
      if (player.Position === "C") {
        return {
          labels: [
            "G",
            "A",
            "Pts",
            "+/-",
            "PIM",
            "SOG",
            "S%",
            "FO%",
            "FOW",
            "FOA",
            "PPP",
            "PPG",
          ],
          statsType: "SKATER" as any,
        };
      }
      if (player.Position === "D") {
        return {
          labels: [
            "G",
            "A",
            "Pts",
            "+/-",
            "PIM",
            "SOG",
            "S%",
            "PPP",
            "PPG",
            "BCHK",
            "SCHK",
            "SHB",
          ],
          statsType: "SKATER" as any,
        };
      }
    }
  }, [player.Position]);

  return {
    statsConfig,
  };
};

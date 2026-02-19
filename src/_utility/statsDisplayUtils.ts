import {
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  NFLPlayerSeasonStats,
} from "../models/footballModels";
import {
  FootballStatsType,
  PASSING,
  RUSHING,
  RECEIVING,
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

export const getFBStatsDisplayValue = (
  item: CFBPlayerSeasonStats | NFLPlayerSeasonStats,
  label: string,
  footballStatsType: FootballStatsType,
  statsView: StatsView,
): string | number => {
  const values = GetFootballPlayerStatsValues(
    item,
    statsView,
    footballStatsType,
  );
  const valueMap = new Map(values.map((v) => [v.label, v.value]));

  if (label === "GP") {
    return (item as any).GamesPlayed ?? valueMap.get("GP") ?? "";
  } else if (label === "TotTck") {
    const solo = (item as any).SoloTackles ?? 0;
    const ast = (item as any).AssistedTackles ?? 0;
    return solo + ast;
  } else if (label === "Cmp/Att") {
    const comp = valueMap.get("PC") ?? 0;
    const att = valueMap.get("PA") ?? 0;
    return `${comp} / ${att}`;
  } else if (label === "Cmp%" || label === "Cmp %") {
    const comp = Number(valueMap.get("PC") ?? 0);
    const att = Number(valueMap.get("PA") ?? 0);
    if (att > 0) {
      const pct = (comp / att) * 100;
      return pct.toFixed(1);
    } else {
      return "0.0";
    }
  } else if (label === "Yds") {
    if (footballStatsType === PASSING) {
      return valueMap.get("PY") ?? "";
    } else if (footballStatsType === RUSHING) {
      return valueMap.get("RY") ?? "";
    } else if (footballStatsType === RECEIVING) {
      return valueMap.get("RcY") ?? "";
    }
  } else if (label === "TD") {
    if (footballStatsType === PASSING) {
      return valueMap.get("PTDs") ?? "";
    } else if (footballStatsType === RUSHING) {
      return valueMap.get("RuTD") ?? "";
    } else if (footballStatsType === RECEIVING) {
      return valueMap.get("RcTDs") ?? "";
    }
  } else if (label === "Att") {
    if (footballStatsType === RUSHING) {
      return valueMap.get("RA") ?? "";
    }
  } else if (label === "YPC") {
    if (footballStatsType === RUSHING) {
      const raw = valueMap.get("RAvg");
      if (raw === undefined || raw === null) {
        return "";
      } else {
        const num = Number(raw);
        return Number.isFinite(num) ? num.toFixed(1) : "";
      }
    }
  } else if (label === "INT") {
    if (footballStatsType === PASSING) {
      // Passing interceptions thrown
      return valueMap.get("INTs") ?? "";
    } else {
      // Defensive INTs already use "INT" in the helper
      return valueMap.get("INT") ?? "";
    }
  } else if (label === "FF/FR") {
    const ff = (item as any).ForcedFumbles ?? 0;
    const fr = (item as any).RecoveredFumbles ?? 0;
    return `${ff}/${fr}`;
  } else {
    const found = valueMap.get(label);
    return found !== undefined ? found : "";
  }

  return "";
};

export const getHCKStatsDisplayValue = (
  item: CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats,
  label: string,
  isGoalie: boolean,
  statsView: StatsView,
): string | number => {
  const values = GetHockeyPlayerStatsValues(item, statsView, isGoalie);
  const valueMap = new Map(values.map((v) => [v.label, v.value]));

  if (label === "GP") {
    return (item as any).GamesPlayed ?? valueMap.get("GP") ?? "";
  } else if (label === "GS") {
    return (item as any).GamesStarted ?? valueMap.get("GS") ?? "";
  } else if (label === "G") {
    return (item as any).Goals ?? valueMap.get("G") ?? "";
  } else if (label === "A") {
    return (item as any).Assists ?? valueMap.get("A") ?? "";
  } else if (label === "Pts") {
    return (item as any).Points ?? valueMap.get("Pts") ?? "";
  } else if (label === "+/-") {
    const plusMinus = (item as any).PlusMinus ?? valueMap.get("+/-") ?? 0;
    return plusMinus >= 0 ? `+${plusMinus}` : `${plusMinus}`;
  } else if (label === "PIM") {
    return (item as any).PenaltyMinutes ?? valueMap.get("PIM") ?? "";
  } else if (label === "SOG") {
    return (item as any).Shots ?? valueMap.get("SOG") ?? "";
  } else if (label === "S%") {
    const pct = (item as any).ShootingPercentage ?? valueMap.get("S%") ?? 0;
    return Number.isFinite(pct) ? pct.toFixed(1) : "0.0";
  } else if (label === "TOI") {
    const toi = (item as any).TimeOnIce ?? valueMap.get("TOI") ?? "";
    return Number.isFinite(toi) ? toi.toFixed(1) : toi;
  } else if (label === "FO%") {
    const pct = (item as any).FaceOffWinPercentage ?? valueMap.get("FO%") ?? 0;
    return Number.isFinite(pct) ? pct.toFixed(1) : "0.0";
  } else if (label === "FO") {
    const won = (item as any).FaceOffsWon ?? 0;
    const total = (item as any).FaceOffs ?? 0;
    return total > 0 ? `${won}/${total}` : "0/0";
  } else if (label === "PPG") {
    return (item as any).PowerPlayGoals ?? valueMap.get("PPG") ?? "";
  } else if (label === "SHG") {
    return (item as any).ShorthandedGoals ?? valueMap.get("SHG") ?? "";
  } else if (label === "GWG") {
    return (item as any).GameWinningGoals ?? valueMap.get("GWG") ?? "";
  } else if (label === "Blk") {
    return (item as any).ShotsBlocked ?? valueMap.get("Blk") ?? "";
  } else if (label === "Hit") {
    return (item as any).BodyChecks ?? valueMap.get("Hit") ?? "";
  } else if (label === "TkA") {
    return (item as any).StickChecks ?? valueMap.get("TkA") ?? "";
  } else if (isGoalie) {
    // Goalie-specific stats
    if (label === "W") {
      return (item as any).GoalieWins ?? valueMap.get("W") ?? "";
    } else if (label === "L") {
      return (item as any).GoalieLosses ?? valueMap.get("L") ?? "";
    } else if (label === "T") {
      return (item as any).GoalieTies ?? valueMap.get("T") ?? "";
    } else if (label === "OTL") {
      return (item as any).OvertimeLosses ?? valueMap.get("OTL") ?? "";
    } else if (label === "SA") {
      return (item as any).ShotsAgainst ?? valueMap.get("SA") ?? "";
    } else if (label === "SV") {
      return (item as any).Saves ?? valueMap.get("SV") ?? "";
    } else if (label === "GA") {
      return (item as any).GoalsAgainst ?? valueMap.get("GA") ?? "";
    } else if (label === "SV%") {
      const pct = (item as any).SavePercentage ?? valueMap.get("SV%") ?? 0;
      return Number.isFinite(pct) ? pct.toFixed(3) : "0.000";
    } else if (label === "SO") {
      return (item as any).Shutouts ?? valueMap.get("SO") ?? "";
    } else if (label === "GAA") {
      const ga = (item as any).GoalsAgainst ?? 0;
      const gp = (item as any).GamesPlayed ?? 0;
      if (gp > 0) {
        const gaa = ga / gp;
        return gaa.toFixed(2);
      }
      return "0.00";
    }
  }

  // Fallback to value map or empty string
  const found = valueMap.get(label);
  return found !== undefined ? found : "";
};

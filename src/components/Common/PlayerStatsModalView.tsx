import React, { useContext, useEffect, useMemo, useState } from "react";
import { SimFBAContext, useSimFBAStore } from "../../context/SimFBAContext";
import {
  CollegePlayer,
  NFLPlayer,
  CollegePlayerSeasonStats,
  NFLPlayerSeasonStats
} from "../../models/footballModels";
import {
  League,
  SimCFB,
  SimNFL,
  StatsView,
  FootballStatsType,
  PASSING,
  RUSHING,
  RECEIVING,
  RETURN,
  DEFENSE,
  SPECIAL_TEAMS,
  OLINE,
  SEASON_VIEW,
  BASE_FBA_SEASON,
  POSITION_STATS_CONFIG,
  ATH_ARCHETYPE_STATS_CONFIG,
  FootballPositionOptions,
  FootballArchetypeOptions,
} from "../../_constants/constants";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import { GetFootballPlayerStatsValues } from "../StatsPage/Common/StatsPageHelper";
import { getFBAWeekID } from "../../_helper/statsPageHelper";
import { getPasserRating } from "../../_utility/getPasserRating";

const getPositionValue = (label: string, fallback: string) =>
  FootballPositionOptions.find((option) => option.label === label)?.value ??
  fallback;

const QB_VALUE = getPositionValue("Quarterbacks", "QB");
const RB_VALUE = getPositionValue("Runningbacks", "RB");
const FB_VALUE = getPositionValue("Fullbacks", "FB");
const WR_VALUE = getPositionValue("Wide Receivers", "WR");
const TE_VALUE = getPositionValue("Tightends", "TE");
const OT_VALUE = getPositionValue("Offensive Tackles", "OT");
const OG_VALUE = getPositionValue("Offensive Guards", "OG");
const C_VALUE = getPositionValue("Centers", "C");
const DE_VALUE = getPositionValue("Defensive Ends", "DE");
const DT_VALUE = getPositionValue("Defensive Tackles", "DT");
const OLB_VALUE = getPositionValue("Outside Linebackers", "OLB");
const ILB_VALUE = getPositionValue("Inside Linebackers", "ILB");
const CB_VALUE = getPositionValue("Cornerbacks", "CB");
const FS_VALUE = getPositionValue("Free Safeties", "FS");
const SS_VALUE = getPositionValue("Strong Safeties", "SS");
const K_VALUE = getPositionValue("Kickers", "K");
const P_VALUE = getPositionValue("Punters", "P");
const ATH_VALUE = getPositionValue("Athletes", "ATH");

const getArchetypeValue = (archetype: string) =>
  FootballArchetypeOptions.find(
    (option) => option.value === archetype || option.label === archetype
  )?.value ?? archetype;

interface PlayerStatsModalViewProps {
  player: CollegePlayer | NFLPlayer;
  league: League;
}

export const PlayerStatsModalView: React.FC<PlayerStatsModalViewProps> = ({
  player,
  league
}) => {
  const {
    cfbPlayerSeasonStatsMap,
    nflPlayerSeasonStatsMap,
    SearchFootballStats,
    cfb_Timestamp,
  } = useSimFBAStore();

  const statsView: StatsView = SEASON_VIEW;
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedStats, setHasRequestedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFootballStatsType = (position: string): FootballStatsType => {
    switch (position) {
      case QB_VALUE:
        return PASSING;
      case RB_VALUE:
      case FB_VALUE:
        return RUSHING;
      case WR_VALUE:
      case TE_VALUE:
        return RECEIVING;
      case OT_VALUE:
      case OG_VALUE:
      case C_VALUE:
        return OLINE;
      case DE_VALUE:
      case DT_VALUE:
      case OLB_VALUE:
      case ILB_VALUE:
      case CB_VALUE:
      case FS_VALUE:
      case SS_VALUE:
        return DEFENSE;
      case K_VALUE:
      case P_VALUE:
        return SPECIAL_TEAMS;
      default:
        return PASSING;
    }
  };

  const statsConfig = useMemo(() => {
    const positionKey = player.Position;
    if (positionKey === ATH_VALUE) {
      const archetypeKey = getArchetypeValue((player as any).Archetype);
      if (archetypeKey && ATH_ARCHETYPE_STATS_CONFIG[archetypeKey]) {
        return ATH_ARCHETYPE_STATS_CONFIG[archetypeKey];
      }
      return undefined;
    }
    return POSITION_STATS_CONFIG[positionKey] || undefined;
  }, [player]);

  const defaultStatsType = getFootballStatsType(player.Position);
  const footballStatsType: FootballStatsType =
    statsConfig?.statsType ?? defaultStatsType;

  const playerStats = useMemo(() => {
    let allStats: (CollegePlayerSeasonStats | NFLPlayerSeasonStats)[] = [];
    if (league === SimCFB && cfbPlayerSeasonStatsMap) {
      allStats = Object.values(cfbPlayerSeasonStatsMap).flat();
    } else if (league === SimNFL && nflPlayerSeasonStatsMap) {
      allStats = Object.values(nflPlayerSeasonStatsMap).flat();
    }

    const filtered = allStats.filter((stat) => {
      if (league === SimCFB) {
        return (stat as CollegePlayerSeasonStats).CollegePlayerID === player.ID;
      } else {
        return (stat as NFLPlayerSeasonStats).NFLPlayerID === player.ID;
      }
    });

    return filtered.sort((a, b) => b.SeasonID - a.SeasonID);
  }, [cfbPlayerSeasonStatsMap, nflPlayerSeasonStatsMap, league, player.ID]);

  useEffect(() => {
    if (!SearchFootballStats || !cfb_Timestamp || hasRequestedStats) return;

    const seasonStatsMap =
      league === SimCFB ? cfbPlayerSeasonStatsMap : nflPlayerSeasonStatsMap;

    const hasAnySeasonLoaded =
      seasonStatsMap && Object.keys(seasonStatsMap).length > 0;
    if (hasAnySeasonLoaded) {
      setHasRequestedStats(true);
      return;
    }

    let isMounted = true;
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasRequestedStats(true);

        const maxSeasonId = cfb_Timestamp.CollegeSeasonID;
        const gameTypeRegularSeason = "2";
        const promises: Promise<void>[] = [];

        for (let seasonId = 1; seasonId <= maxSeasonId; seasonId++) {
          const weekId = getFBAWeekID(1, seasonId);
          promises.push(
            SearchFootballStats({
              League: league,
              ViewType: SEASON_VIEW,
              WeekID: weekId,
              SeasonID: seasonId,
              GameType: gameTypeRegularSeason,
            })
          );
        }

        await Promise.all(promises);
      } catch {
        if (isMounted) {
          setError("Unable to load stats for this player.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [
    SearchFootballStats,
    cfb_Timestamp,
    league,
    cfbPlayerSeasonStatsMap,
    nflPlayerSeasonStatsMap,
    hasRequestedStats,
  ]);

  const valueLabels = useMemo(() => {
    if (statsConfig) {
      return ["GP", ...statsConfig.labels];
    }

    if (playerStats.length === 0) return [];

    const values = GetFootballPlayerStatsValues(
      playerStats[0],
      statsView,
      footballStatsType
    );
    const baseLabels = values.map((v) => v.label);
    const otherLabels = baseLabels.filter((l) => l !== "GP");

    return ["GP", ...otherLabels.slice(0, 4)];
  }, [playerStats, footballStatsType, statsConfig, statsView]);

  const columns = useMemo(
    () => [
      { header: "Season", accessor: "SeasonID" },
      ...valueLabels.map((label) => ({
        header: label,
        accessor: "",
      })),
    ],
    [valueLabels]
  );

  const careerStats = useMemo(() => {
    if (playerStats.length === 0) return null;

    const total: any = {
      SeasonID: 0,
      GamesPlayed: 0,
      PassCompletions: 0,
      PassAttempts: 0,
      PassingYards: 0,
      PassingTDs: 0,
      Interceptions: 0,
      Sacks: 0,
      RushAttempts: 0,
      RushingYards: 0,
      RushingTDs: 0,
      Fumbles: 0,
      Targets: 0,
      Catches: 0,
      ReceivingYards: 0,
      ReceivingTDs: 0,
      SoloTackles: 0,
      AssistedTackles: 0,
      TacklesForLoss: 0,
      SacksMade: 0,
      ForcedFumbles: 0,
      RecoveredFumbles: 0,
      PassDeflections: 0,
      InterceptionsCaught: 0,
      Safeties: 0,
      DefensiveTDs: 0,
      FGMade: 0,
      FGAttempts: 0,
      LongestFG: 0,
      ExtraPointsMade: 0,
      ExtraPointsAttempted: 0,
      KickoffTouchbacks: 0,
      Punts: 0,
      GrossPuntDistance: 0,
      NetPuntDistance: 0,
      PuntTouchbacks: 0,
      PuntsInside20: 0,
      KickReturns: 0,
      KickReturnYards: 0,
      KickReturnTDs: 0,
      PuntReturns: 0,
      PuntReturnYards: 0,
      PuntReturnTDs: 0,
      Snaps: 0,
      Pancakes: 0,
      SacksAllowed: 0,
    };

    for (const s of playerStats as any[]) {
      total.GamesPlayed += s.GamesPlayed ?? 0;
      total.PassCompletions += s.PassCompletions ?? 0;
      total.PassAttempts += s.PassAttempts ?? 0;
      total.PassingYards += s.PassingYards ?? 0;
      total.PassingTDs += s.PassingTDs ?? 0;
      total.Interceptions += s.Interceptions ?? 0;
      total.Sacks += s.Sacks ?? 0;
      total.RushAttempts += s.RushAttempts ?? 0;
      total.RushingYards += s.RushingYards ?? 0;
      total.RushingTDs += s.RushingTDs ?? 0;
      total.Fumbles += s.Fumbles ?? 0;
      total.Targets += s.Targets ?? 0;
      total.Catches += s.Catches ?? 0;
      total.ReceivingYards += s.ReceivingYards ?? 0;
      total.ReceivingTDs += s.ReceivingTDs ?? 0;
      total.SoloTackles += s.SoloTackles ?? 0;
      total.AssistedTackles += s.AssistedTackles ?? 0;
      total.TacklesForLoss += s.TacklesForLoss ?? 0;
      total.SacksMade += s.SacksMade ?? 0;
      total.ForcedFumbles += s.ForcedFumbles ?? 0;
      total.RecoveredFumbles += s.RecoveredFumbles ?? 0;
      total.PassDeflections += s.PassDeflections ?? 0;
      total.InterceptionsCaught += s.InterceptionsCaught ?? 0;
      total.Safeties += s.Safeties ?? 0;
      total.DefensiveTDs += s.DefensiveTDs ?? 0;
      total.FGMade += s.FGMade ?? 0;
      total.FGAttempts += s.FGAttempts ?? 0;
      total.LongestFG = Math.max(total.LongestFG, s.LongestFG ?? 0);
      total.ExtraPointsMade += s.ExtraPointsMade ?? 0;
      total.ExtraPointsAttempted += s.ExtraPointsAttempted ?? 0;
      total.KickoffTouchbacks += s.KickoffTouchbacks ?? 0;
      total.Punts += s.Punts ?? 0;
      total.GrossPuntDistance += s.GrossPuntDistance ?? 0;
      total.NetPuntDistance += s.NetPuntDistance ?? 0;
      total.PuntTouchbacks += s.PuntTouchbacks ?? 0;
      total.PuntsInside20 += s.PuntsInside20 ?? 0;
      total.KickReturns += s.KickReturns ?? 0;
      total.KickReturnYards += s.KickReturnYards ?? 0;
      total.KickReturnTDs += s.KickReturnTDs ?? 0;
      total.PuntReturns += s.PuntReturns ?? 0;
      total.PuntReturnYards += s.PuntReturnYards ?? 0;
      total.PuntReturnTDs += s.PuntReturnTDs ?? 0;
      total.Snaps += s.Snaps ?? 0;
      total.Pancakes += s.Pancakes ?? 0;
      total.SacksAllowed += s.SacksAllowed ?? 0;
    }

    if (total.RushAttempts > 0) {
      total.RushAvg = total.RushingYards / total.RushAttempts;
    }

    if (total.PassAttempts > 0) {
      const qbrStr = getPasserRating(
        league === SimNFL,
        total.PassCompletions,
        total.PassAttempts,
        total.PassingYards,
        total.PassingTDs,
        total.Interceptions
      );
      total.QBRating = Number(qbrStr);
    }

    return { ...total, isCareer: true };
  }, [playerStats, league]);

  const rowRenderer = (
    item: CollegePlayerSeasonStats | NFLPlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const isCareerRow = (item as any).isCareer;
    const values = GetFootballPlayerStatsValues(
      item,
      statsView,
      footballStatsType
    );
    const valueMap = new Map(values.map((v) => [v.label, v.value]));
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
            {(item as any).isCareer
              ? "Career"
              : BASE_FBA_SEASON + item.SeasonID}
          </Text>
        </TableCell>

        {valueLabels.map((label, vIdx) => {
          let display: number | string = "";

          if (label === "GP") {
            display = (item as any).GamesPlayed ?? valueMap.get("GP") ?? "";
          } else if (label === "TotTck") {
            const solo = (item as any).SoloTackles ?? 0;
            const ast = (item as any).AssistedTackles ?? 0;
            display = solo + ast;
          } else if (label === "Cmp/Att") {
            const comp = valueMap.get("PC") ?? 0;
            const att = valueMap.get("PA") ?? 0;
            display = `${comp} / ${att}`;
          } else if (label === "Cmp%" || label === "Cmp %") {
            const comp = Number(valueMap.get("PC") ?? 0);
            const att = Number(valueMap.get("PA") ?? 0);
            if (att > 0) {
              const pct = (comp / att) * 100;
              display = pct.toFixed(1);
            } else {
              display = "0.0";
            }
          } else if (label === "Yds") {
            if (footballStatsType === PASSING) {
              display = valueMap.get("PY") ?? "";
            } else if (footballStatsType === RUSHING) {
              display = valueMap.get("RY") ?? "";
            } else if (footballStatsType === RECEIVING) {
              display = valueMap.get("RcY") ?? "";
            }
          } else if (label === "TD") {
            if (footballStatsType === PASSING) {
              display = valueMap.get("PTDs") ?? "";
            } else if (footballStatsType === RUSHING) {
              display = valueMap.get("RuTD") ?? "";
            } else if (footballStatsType === RECEIVING) {
              display = valueMap.get("RcTDs") ?? "";
            }
          } else if (label === "Att") {
            if (footballStatsType === RUSHING) {
              display = valueMap.get("RA") ?? "";
            }
          } else if (label === "YPC") {
            if (footballStatsType === RUSHING) {
              const raw = valueMap.get("RAvg");
              if (raw === undefined || raw === null) {
                display = "";
              } else {
                const num = Number(raw);
                display = Number.isFinite(num) ? num.toFixed(1) : "";
              }
            }
          } else if (label === "INT") {
            if (footballStatsType === PASSING) {
              // Passing interceptions thrown
              display = valueMap.get("INTs") ?? "";
            } else {
              // Defensive INTs already use "INT" in the helper
              display = valueMap.get("INT") ?? "";
            }
          } else if (label === "FF/FR") {
            const ff = (item as any).ForcedFumbles ?? 0;
            const fr = (item as any).RecoveredFumbles ?? 0;
            display = `${ff}/${fr}`;
          } else {
            const found = valueMap.get(label);
            display = found !== undefined ? found : "";
          }

          return (
            <TableCell key={label + vIdx}>
              <Text variant="small">{display}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
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
          <Text variant="body-small">
            No stats available for this player.
          </Text>
        </div>
      )}
      {playerStats.length > 0 && (
        <Table
          columns={columns}
          data={
            careerStats
              ? [...playerStats, careerStats]
              : playerStats
          }
          rowRenderer={rowRenderer}
          team={null as any}
          page="PlayerStatsModal"
        />
      )}
    </div>
  );
};

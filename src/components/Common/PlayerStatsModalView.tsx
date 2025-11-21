import React, { useContext, useEffect, useMemo, useState } from "react";
import { SimFBAContext } from "../../context/SimFBAContext";
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
} from "../../_constants/constants";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import { GetFootballPlayerStatsValues } from "../StatsPage/Common/StatsPageHelper";
import { getFBAWeekID } from "../../_helper/statsPageHelper";

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
  } = useContext(SimFBAContext);

  const statsView: StatsView = SEASON_VIEW;
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedStats, setHasRequestedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFootballStatsType = (position: string): FootballStatsType => {
    switch (position) {
      case "QB":
        return PASSING;
      case "RB":
      case "FB":
        return RUSHING;
      case "WR":
      case "TE":
        return RECEIVING;
      case "KR":
      case "PR":
        return RETURN;
      case "OT":
      case "OG":
      case "C":
        return OLINE;
      case "DE":
      case "DT":
      case "OLB":
      case "ILB":
      case "CB":
      case "FS":
      case "SS":
        return DEFENSE;
      case "K":
      case "P":
        return SPECIAL_TEAMS;
      default:
        return PASSING;
    }
  };

  const statsConfig = useMemo(() => {
    const positionKey = player.Position;
    if (positionKey === "ATH") {
      const archetypeKey = (player as any).Archetype;
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

    return filtered.sort((a, b) => a.SeasonID - b.SeasonID);
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

  const rowRenderer = (
    item: CollegePlayerSeasonStats | NFLPlayerSeasonStats,
    index: number,
    backgroundColor: string
  ) => {
    const values = GetFootballPlayerStatsValues(
      item,
      statsView,
      footballStatsType
    );
    const valueMap = new Map(values.map((v) => [v.label, v.value]));
    return (
      <div
        key={index}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <TableCell>
          <Text variant="small">
            {BASE_FBA_SEASON + item.SeasonID}
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
          } else if (label === "CMP/ATT") {
            const comp = valueMap.get("PC") ?? 0;
            const att = valueMap.get("PA") ?? 0;
            display = `${comp}/${att}`;
          } else if (label === "Comp%" || label === "Comp %") {
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
          data={playerStats}
          rowRenderer={rowRenderer}
          team={null as any}
          page="PlayerStatsModal"
        />
      )}
    </div>
  );
};

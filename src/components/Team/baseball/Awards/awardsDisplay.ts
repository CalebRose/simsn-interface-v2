import { useEffect, useMemo, useState } from "react";
import { BaseballService } from "../../../../_services/baseballService";
import type {
  AwardsHistoryParams,
  AwardsHistoryResponse,
  AwardType,
} from "../../../../models/baseball/baseballStatsModels";

// Shared by the player modal's Awards tab and the MLB Awards page.

/**
 * The one history query both views use, so they share the service's session
 * cache: every season, every award, uncapped leaderboards. Small (~50 winners
 * and 3 champion teams per season without the include_* flags).
 */
export const FULL_AWARDS_HISTORY: AwardsHistoryParams = { leaders_limit: 0 };

/** Tailwind classes per award category, for badges. */
const CATEGORY_BADGE: Record<string, string> = {
  major: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  pitching: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  batting: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  fielding:
    "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  championship: "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  selection: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
};

export const awardCategoryClass = (category: string) =>
  CATEGORY_BADGE[category] ?? CATEGORY_BADGE.selection;

/** Fixed display order for per-position awards; unknown codes go last. */
export const POSITION_ORDER = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "P"];

export const comparePositions = (a: string, b: string) => {
  const ia = POSITION_ORDER.indexOf(a);
  const ib = POSITION_ORDER.indexOf(b);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
};

/** "AL Silver Slugger (3B)", "NL Cy Young Award", "World Series Champion". */
export const awardQualifiedLabel = (a: {
  award_name: string;
  sub_league: string | null;
  position_code: string | null;
}) => {
  const prefix = a.sub_league ? `${a.sub_league} ` : "";
  const suffix = a.position_code ? ` (${a.position_code})` : "";
  return `${prefix}${a.award_name}${suffix}`;
};

/** Short names for tight table headers; falls back to the catalog name. */
const SHORT_NAMES: Record<string, string> = {
  mvp: "MVP",
  cy_young: "Cy Young",
  roy: "ROY",
  reliever: "Reliever",
  comeback: "Comeback",
  silver_slugger: "Silver Slugger",
  gold_glove: "Gold Glove",
  pennant: "Pennant",
  world_series: "World Series",
  all_star: "All-Star",
};

export const awardShortName = (t: Pick<AwardType, "code" | "name">) =>
  SHORT_NAMES[t.code] ?? t.name;

/** "kind" from the history response, or derived for /awards/types rows. */
export const awardKind = (t: AwardType) =>
  t.kind ??
  (t.category === "selection"
    ? "selection"
    : t.category === "championship"
      ? "championship"
      : "individual");

interface AwardsHistoryState {
  data: AwardsHistoryResponse | null;
  loading: boolean;
  error: string | null;
}

/** The full awards history, fetched once per session (see FULL_AWARDS_HISTORY). */
export const useAwardsHistory = (enabled = true): AwardsHistoryState => {
  const [state, setState] = useState<AwardsHistoryState>({
    data: null,
    loading: enabled,
    error: null,
  });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    BaseballService.GetAwardsHistory(FULL_AWARDS_HISTORY)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: err?.message || "Awards history is not available.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return state;
};

/** league_year_id → league_year (e.g. 3 → 2028) from the cached history. */
export const useLeagueYearLabels = (enabled = true) => {
  const { data } = useAwardsHistory(enabled);
  return useMemo(() => {
    const map = new Map<number, number>();
    for (const s of data?.seasons ?? []) map.set(s.league_year_id, s.league_year);
    return map;
  }, [data]);
};

import { ScheduleGame, ScheduleSeries } from "../../../models/baseball/baseballModels";

export const SUBWEEK_ORDER = ["a", "b", "c", "d"];
export const SUBWEEK_LABELS: Record<string, string> = {
  a: "Day A", b: "Day B", c: "Day C", d: "Day D",
};

export type ScheduleViewMode = "daily" | "weekly" | "monthly" | "season";

/** Month structure: 12 months of 4–5 weeks (pattern 4,4,5 × 4 = 52 weeks). */
export const MONTH_WEEKS = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
export const TOTAL_WEEKS = MONTH_WEEKS.reduce((s, w) => s + w, 0); // 52

/** Inclusive week range [start, end] for a 1-indexed month. */
export const getWeekRangeForMonth = (month: number): [number, number] => {
  let start = 1;
  for (let i = 0; i < month - 1; i++) start += MONTH_WEEKS[i];
  return [start, start + MONTH_WEEKS[month - 1] - 1];
};

/** Month number (1–12) containing a given week. */
export const getMonthForWeek = (week: number): number => {
  let cumulative = 0;
  for (let i = 0; i < MONTH_WEEKS.length; i++) {
    cumulative += MONTH_WEEKS[i];
    if (week <= cumulative) return i + 1;
  }
  return 12;
};

/**
 * Group games into series. Games sharing season_week + home_team_id + away_team_id
 * form a series, distinguished by season_subweek.
 */
export const groupGamesIntoSeries = (games: ScheduleGame[]): ScheduleSeries[] => {
  const map = new Map<string, ScheduleSeries>();

  for (const g of games) {
    const key = `${g.season_week}-${g.home_team_id}-${g.away_team_id}`;
    if (!map.has(key)) {
      map.set(key, {
        season_week: g.season_week,
        home_team_id: g.home_team_id,
        home_team_abbrev: g.home_team_abbrev,
        home_team_name: g.home_team_name,
        away_team_id: g.away_team_id,
        away_team_abbrev: g.away_team_abbrev,
        away_team_name: g.away_team_name,
        games: [],
      });
    }
    map.get(key)!.games.push(g);
  }

  for (const series of map.values()) {
    series.games.sort(
      (a, b) => SUBWEEK_ORDER.indexOf(a.season_subweek) - SUBWEEK_ORDER.indexOf(b.season_subweek),
    );
  }

  return Array.from(map.values()).sort((a, b) => a.season_week - b.season_week);
};

/** Group games by week number. */
export const groupGamesByWeek = (games: ScheduleGame[]): Map<number, ScheduleGame[]> => {
  const map = new Map<number, ScheduleGame[]>();
  for (const g of games) {
    if (!map.has(g.season_week)) map.set(g.season_week, []);
    map.get(g.season_week)!.push(g);
  }
  return map;
};

/** Determine game result relative to a specific team. */
export const getGameResult = (
  game: ScheduleGame,
  teamId: number,
): { won: boolean; lost: boolean; tied: boolean; cancelled: boolean; pending: boolean } => {
  // Check if game is completed — use scores as primary indicator
  const hasScores = game.home_score !== null && game.away_score !== null;

  if (!game.game_outcome && !hasScores) return { won: false, lost: false, tied: false, cancelled: false, pending: true };
  if (game.game_outcome === "CANCELLED") return { won: false, lost: false, tied: false, cancelled: true, pending: false };

  // Use score comparison (matches dashboard logic) — more reliable than game_outcome field
  if (hasScores) {
    const isHome = game.home_team_id === teamId;
    const teamScore = isHome ? game.home_score! : game.away_score!;
    const oppScore = isHome ? game.away_score! : game.home_score!;
    if (teamScore > oppScore) return { won: true, lost: false, tied: false, cancelled: false, pending: false };
    if (teamScore < oppScore) return { won: false, lost: true, tied: false, cancelled: false, pending: false };
    return { won: false, lost: false, tied: true, cancelled: false, pending: false };
  }

  // Fallback to game_outcome / winning_team_id
  if (game.game_outcome === "TIE") return { won: false, lost: false, tied: true, cancelled: false, pending: false };
  const won = game.winning_team_id === teamId;
  return { won, lost: !won, tied: false, cancelled: false, pending: false };
};

/** Compute series record for a team: { wins, losses, label } e.g. "W 2-1". */
export const getSeriesRecord = (
  series: ScheduleSeries,
  teamId: number,
): { wins: number; losses: number; label: string } => {
  let wins = 0, losses = 0;
  for (const g of series.games) {
    const r = getGameResult(g, teamId);
    if (r.won) wins++;
    else if (r.lost) losses++;
  }
  const allPending = series.games.every((g) => !g.game_outcome);
  if (allPending) return { wins, losses, label: "—" };
  const leader = wins > losses ? "W" : wins < losses ? "L" : "S";
  return { wins, losses, label: `${leader} ${wins}-${losses}` };
};

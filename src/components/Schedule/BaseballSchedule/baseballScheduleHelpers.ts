import { ScheduleGame, ScheduleSeries } from "../../../models/baseball/baseballModels";
import { BoxScoreResponse } from "../../../models/baseball/baseballStatsModels";

// ─── Lineup display helpers ───────────────────────────────────────────────────

export const LINEUP_POSITION_ORDER = ["SP", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"] as const;
export type LineupPosition = typeof LINEUP_POSITION_ORDER[number];
export type StartingLineup = Partial<Record<LineupPosition, string>>;

// Maps defense dict / batting line position codes → display positions
// (same codes used by BaseballBoxScoreModal POS_DISPLAY)
const POS_CODE_MAP: Record<string, LineupPosition> = {
  c: "C", fb: "1B", sb: "2B", tb: "3B", ss: "SS",
  lf: "LF", cf: "CF", rf: "RF", dh: "DH",
};

function extractLineupForSide(
  pitching: BoxScoreResponse["pitching"]["home"],
  batting: BoxScoreResponse["batting"]["home"],
  defense?: Record<string, number>,
): StartingLineup {
  const lineup: StartingLineup = {};

  // SP: starting pitcher (gs === 1)
  const sp = pitching.find((p) => p.gs === 1);
  if (sp) lineup["SP"] = sp.name;

  // Build player_id → name lookup from batting lines
  const nameById: Record<number, string> = {};
  for (const b of batting) nameById[b.player_id] = b.name;

  const starters = batting.filter((b) => (b.batting_order ?? 0) >= 1 && (b.batting_order ?? 0) <= 9);

  if (defense && Object.keys(defense).length > 0) {
    // Primary: use defense dict (position_code → player_id) for the 8 fielding positions
    const defendingIds = new Set(Object.values(defense));
    for (const [code, pid] of Object.entries(defense)) {
      const pos = POS_CODE_MAP[code.toLowerCase()];
      if (pos) lineup[pos] = nameById[pid] ?? `#${pid}`;
    }
    // DH is never in the defense dict — find the starter whose player_id isn't a fielder
    // (mirrors boxscore modal: if no pos and not in posMap → DH)
    const dh = starters.find((b) => !defendingIds.has(b.player_id));
    if (dh) lineup["DH"] = dh.name;
  } else {
    // Fallback: batting lines filtered to starters (batting_order 1–9)
    // A starter with no pos (or pos "dh") is the DH — same logic as boxscore modal line 335
    for (const b of starters) {
      const raw = b.pos?.toLowerCase() ?? "";
      const pos: LineupPosition = raw ? (POS_CODE_MAP[raw] ?? "DH") : "DH";
      if (!lineup[pos]) lineup[pos] = b.name;
    }
  }

  return lineup;
}

export function extractStartingLineups(boxScore: BoxScoreResponse): { home: StartingLineup; away: StartingLineup } {
  return {
    home: extractLineupForSide(boxScore.pitching.home, boxScore.batting.home, boxScore.defense?.home),
    away: extractLineupForSide(boxScore.pitching.away, boxScore.batting.away, boxScore.defense?.away),
  };
}

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

import { useEffect, useRef, useState } from "react";
import { ScheduleSeries } from "../../../models/baseball/baseballModels";
import { BoxScoreResponse } from "../../../models/baseball/baseballStatsModels";
import { BaseballService } from "../../../_services/baseballService";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";

import {
  SUBWEEK_LABELS,
  LINEUP_POSITION_ORDER,
  StartingLineup,
  extractStartingLineups,
  getSeriesRecord,
  getGameResult,
} from "./baseballScheduleHelpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamColors { colorOne: string; colorTwo: string; }

interface SeriesDetailCardProps {
  series: ScheduleSeries;
  teamId: number;
  league: string;
  isRetro?: boolean;
  accentColor?: string;
  teamColorsById?: Record<number, TeamColors>;
  onGameClick: (gameId: number) => void;
}

// ─── TeamLineupColumn ─────────────────────────────────────────────────────────

const TeamLineupColumn = ({
  abbrev,
  logo,
  lineup,
  colors,
}: {
  abbrev: string;
  logo: string | null;
  lineup: StartingLineup;
  colors?: TeamColors;
}) => {
  const primary = colors?.colorOne ?? "#4B5563";
  const secondary = colors?.colorTwo ?? "#6B7280";
  const headerBg = `${primary}35`;
  const headerBorder = `${primary}88`;
  const abbrevTextColor = getTextColorBasedOnBg(primary);
  // Light bg → pick the darker of the two; dark bg → pick the lighter of the two.
  // Compare relative brightness so we always use a real team color, never a fallback.
  const brightness = (c: string) => { const h = c.replace("#",""); const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16); return (r*299+g*587+b*114)/1000; };
  const pb = brightness(primary), sb = brightness(secondary);
  const lightModePos = pb <= sb ? primary : secondary;  // darker on light bg
  const darkModePos  = pb >= sb ? primary : secondary;  // lighter on dark bg

  return (
    <div className="flex-1 px-2 min-w-0">
      {/* Mini header */}
      <div
        className="flex items-center gap-1 mb-1.5 pb-1"
        style={{ borderBottom: `1px solid ${headerBorder}`, backgroundColor: headerBg }}
      >
        {logo && (
          <img
            src={logo}
            className="w-4 h-4 object-contain shrink-0"
            alt={abbrev}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <span className="text-xs font-bold truncate" style={{ color: abbrevTextColor }}>
          {abbrev}
        </span>
      </div>
      {/* Position rows */}
      {LINEUP_POSITION_ORDER.map((pos) => (
        <div key={pos} className="flex items-baseline gap-1 py-[2px] text-xs leading-4">
          <span
            className="font-mono w-7 shrink-0 text-right text-[12px] [paint-order:stroke_fill] [-webkit-text-stroke:.4px_rgba(0,0,0,0)] dark:[-webkit-text-stroke:.3px_rgba(155,155,155,0)] [color:var(--pos-light)] dark:[color:var(--pos-dark)]"
            style={{ "--pos-light": lightModePos, "--pos-dark": darkModePos } as React.CSSProperties}
          >
            {pos}
          </span>
          <span className="truncate text-gray-700 dark:text-gray-200">
            {lineup[pos] ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── GameColumn ───────────────────────────────────────────────────────────────

const GameColumn = ({
  game,
  teamId,
  awayLogo,
  homeLogo,
  awayColors,
  homeColors,
  boxScore,
  isLoading,
  hasFailed,
  onGameClick,
}: {
  game: ScheduleSeries["games"][0];
  teamId: number;
  awayLogo: string | null;
  homeLogo: string | null;
  awayColors?: TeamColors;
  homeColors?: TeamColors;
  boxScore?: BoxScoreResponse;
  isLoading: boolean;
  hasFailed: boolean;
  onGameClick: (gameId: number) => void;
}) => {
  const isCompleted = !!game.game_outcome && game.game_outcome !== "CANCELLED";
  const isCancelled = game.game_outcome === "CANCELLED";
  const result = getGameResult(game, teamId);
  const awayWon = game.winning_team_id === game.away_team_id;
  const homeWon = game.winning_team_id === game.home_team_id;
  const lineups = boxScore ? extractStartingLineups(boxScore) : null;

  return (
    <div className="flex-1 min-w-[280px] flex flex-col">
      {/* Row 1: day label */}
      <div className="px-3 pt-2 pb-1 bg-gray-50/70 dark:bg-gray-800/40">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {SUBWEEK_LABELS[game.season_subweek] ?? game.season_subweek}
        </span>
      </div>

      {/* Row 2: score — full-width, no rounding */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
        {isCancelled ? (
          <div className="px-3 pb-2 text-xs text-gray-400 text-center">Cancelled</div>
        ) : isCompleted ? (
          <button
            className="w-full px-4 pb-2.5 rounded-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
            onClick={() => onGameClick(game.id)}
            title="View box score"
          >
            <div className="flex items-center justify-center gap-4">
              <span className={`text-xl font-bold tabular-nums leading-none ${awayWon ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                {game.away_score}
              </span>
              <div className="flex flex-col items-center shrink-0">
                <span className="text-gray-300 dark:text-gray-600 text-sm leading-none">–</span>
                <span className={`text-[10px] font-bold leading-none mt-1 ${result.won ? "text-green-600 dark:text-green-400" : result.lost ? "text-red-500 dark:text-red-400" : result.tied ? "text-gray-400" : "text-transparent"}`}>
                  {result.won ? "W" : result.lost ? "L" : result.tied ? "T" : "·"}
                </span>
              </div>
              <span className={`text-xl font-bold tabular-nums leading-none ${homeWon ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                {game.home_score}
              </span>
            </div>
          </button>
        ) : (
          <div className="px-3 pb-2 text-xs text-gray-400 dark:text-gray-500 text-center">—</div>
        )}
      </div>

      {/* Lineup body */}
      {isCompleted ? (
        isLoading ? (
          <div className="flex-1 flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-500 animate-pulse">
            Loading lineup...
          </div>
        ) : hasFailed || !lineups ? (
          <div className="flex-1 flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-500">
            Lineup unavailable
          </div>
        ) : (
          <div className="flex flex-1 divide-x divide-gray-100 dark:divide-gray-700/50 px-1 py-2">
            <TeamLineupColumn
              abbrev={game.away_team_abbrev}
              logo={awayLogo}
              lineup={lineups.away}
              colors={awayColors}
            />
            <TeamLineupColumn
              abbrev={game.home_team_abbrev}
              logo={homeLogo}
              lineup={lineups.home}
              colors={homeColors}
            />
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-500 italic">
          Not yet played
        </div>
      )}
    </div>
  );
};

// ─── SeriesDetailCard ─────────────────────────────────────────────────────────

export const SeriesDetailCard = ({
  series,
  teamId,
  league,
  isRetro,
  accentColor,
  teamColorsById,
  onGameClick,
}: SeriesDetailCardProps) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const isHome = series.home_team_id === teamId;
  const oppId = isHome ? series.away_team_id : series.home_team_id;
  const oppAbbrev = isHome ? series.away_team_abbrev : series.home_team_abbrev;
  const oppName = isHome ? series.away_team_name : series.home_team_name;
  const oppLogo = getLogo(leagueType, oppId, isRetro);
  const record = getSeriesRecord(series, teamId);

  const awayLogo = getLogo(leagueType, series.away_team_id, isRetro);
  const homeLogo = getLogo(leagueType, series.home_team_id, isRetro);
  const awayColors = teamColorsById?.[series.away_team_id];
  const homeColors = teamColorsById?.[series.home_team_id];

  const [boxScores, setBoxScores] = useState<Record<number, BoxScoreResponse>>({});
  const [loadingGames, setLoadingGames] = useState<Set<number>>(new Set());
  const [failedGames, setFailedGames] = useState<Set<number>>(new Set());
  const [hasLoaded, setHasLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const completedGameIds = series.games
      .filter((g) => g.game_outcome && g.game_outcome !== "CANCELLED")
      .map((g) => g.id);

    if (completedGameIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasLoaded) {
          setHasLoaded(true);
          completedGameIds.forEach((gameId) => {
            setLoadingGames((prev) => new Set(prev).add(gameId));
            BaseballService.GetBoxScore(gameId, false)
              .then((data) => {
                setBoxScores((prev) => ({ ...prev, [gameId]: data }));
              })
              .catch(() => {
                setFailedGames((prev) => new Set(prev).add(gameId));
              })
              .finally(() => {
                setLoadingGames((prev) => {
                  const next = new Set(prev);
                  next.delete(gameId);
                  return next;
                });
              });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [series, hasLoaded]);

  return (
    <div
      ref={cardRef}
      className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full"
    >
      {/* Series header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        {oppLogo && (
          <img
            src={oppLogo}
            className="w-7 h-7 object-contain shrink-0"
            alt={oppAbbrev}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {isHome ? "vs" : "@"} {oppName}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Week {series.season_week} · {series.games.length}-game series
          </p>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded shrink-0 dark:!text-white"
          style={
            accentColor && record.label !== "—"
              ? { backgroundColor: `${accentColor}15`, color: accentColor }
              : undefined
          }
        >
          {record.label}
        </span>
      </div>

      {/* Game columns */}
      <div className="flex divide-x divide-gray-200 dark:divide-gray-700 overflow-x-auto">
        {series.games.map((game) => (
          <GameColumn
            key={game.id}
            game={game}
            teamId={teamId}
            awayLogo={awayLogo}
            homeLogo={homeLogo}
            awayColors={awayColors}
            homeColors={homeColors}
            boxScore={boxScores[game.id]}
            isLoading={loadingGames.has(game.id)}
            hasFailed={failedGames.has(game.id)}
            onGameClick={onGameClick}
          />
        ))}
      </div>
    </div>
  );
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { BaseballScoutingModal } from "../../Team/baseball/BaseballScouting/BaseballScoutingModal";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import {
  BaseballOrganization, BaseballSeasonContext,
  ScheduleGame, ScheduleResponse,
} from "../../../models/baseball/baseballModels";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { BaseballService } from "../../../_services/baseballService";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  type ScheduleViewMode,
  groupGamesIntoSeries, getGameResult, getSeriesRecord,
  SUBWEEK_ORDER, SUBWEEK_LABELS,
  TOTAL_WEEKS, MONTH_WEEKS, getWeekRangeForMonth, getMonthForWeek,
} from "./baseballScheduleHelpers";
import { BaseballBoxScoreModal } from "./BaseballBoxScoreModal";
import { SeriesDetailCard } from "./SeriesDetailCard";

// ═══════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════

interface BaseballScheduleViewProps {
  league: string;
  organization: BaseballOrganization;
  seasonContext: BaseballSeasonContext;
}

// ═══════════════════════════════════════════════
// Result badge
// ═══════════════════════════════════════════════

const GAME_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  playoff: { label: "PO", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  allstar: { label: "ASG", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  wbc: { label: "WBC", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
};

const GameTypeBadge = ({ gameType }: { gameType?: string }) => {
  if (!gameType || gameType === "regular") return null;
  const badge = GAME_TYPE_BADGES[gameType];
  if (!badge) return null;
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>;
};

const ResultBadge = ({ game, teamId, onClick }: { game: ScheduleGame; teamId: number; onClick?: (gameId: number) => void }) => {
  const r = getGameResult(game, teamId);
  if (r.pending) return <span className="text-xs text-gray-400">—</span>;
  if (r.cancelled) return <span className="text-xs text-gray-400">CAN</span>;
  const isHome = game.home_team_id === teamId;
  const teamScore = isHome ? game.home_score : game.away_score;
  const oppScore = isHome ? game.away_score : game.home_score;
  const label = r.won ? "W" : r.lost ? "L" : "T";
  const color = r.won ? "text-green-600 dark:text-green-400" : r.lost ? "text-red-600 dark:text-red-400" : "text-gray-500";
  const clickable = onClick && game.game_outcome && game.game_outcome !== "CANCELLED";
  return (
    <span
      className={`text-xs font-semibold ${color} ${clickable ? "cursor-pointer hover:underline" : ""}`}
      onClick={clickable ? () => onClick(game.id) : undefined}
    >
      {label} {teamScore}-{oppScore}
    </span>
  );
};

// ═══════════════════════════════════════════════
// Series card (weekly view)
// ═══════════════════════════════════════════════

const SeriesCard = ({ series, teamId, league, isRetro, accentColor, compact, onGameClick }: {
  series: ReturnType<typeof groupGamesIntoSeries>[0];
  teamId: number;
  league: string;
  isRetro?: boolean;
  accentColor?: string;
  compact?: boolean;
  onGameClick?: (gameId: number) => void;
}) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const isHome = series.home_team_id === teamId;
  const oppId = isHome ? series.away_team_id : series.home_team_id;
  const oppAbbrev = isHome ? series.away_team_abbrev : series.home_team_abbrev;
  const oppName = isHome ? series.away_team_name : series.home_team_name;
  const oppLogo = getLogo(leagueType, oppId, isRetro);
  const record = getSeriesRecord(series, teamId);

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${compact ? "" : "max-w-lg"}`}>
      {/* Series header */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        {oppLogo && (
          <img src={oppLogo} className="w-6 h-6 object-contain" alt={oppAbbrev}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        <div className="flex-1 min-w-0">
          <Text variant="small" classes="font-semibold truncate">
            {isHome ? "vs" : "@"} {oppName}
          </Text>
          <Text variant="small" classes="text-gray-400 dark:text-gray-500 text-xs">
            Week {series.season_week} · {series.games.length}-game series
          </Text>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded dark:!text-white"
          style={accentColor && record.label !== "—" ? { backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
        >
          {record.label}
        </span>
      </div>
      {/* Individual games */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {series.games.map((g) => {
          const isGameHome = g.home_team_id === teamId;
          return (
            <div key={g.id} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm">
              <span className="text-xs text-gray-400 w-12">{SUBWEEK_LABELS[g.season_subweek] ?? g.season_subweek}</span>
              <span className="flex-1 text-gray-600 dark:text-gray-300">
                {isGameHome ? g.away_team_abbrev : `@ ${g.home_team_abbrev}`}
              </span>
              <ResultBadge game={g} teamId={teamId} onClick={onGameClick} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Game row (daily view)
// ═══════════════════════════════════════════════

const GameRow = ({ game, teamId, league, isRetro, onGameClick }: {
  game: ScheduleGame; teamId: number | null; league: string; isRetro?: boolean; onGameClick?: (gameId: number) => void;
}) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const homeLogo = getLogo(leagueType, game.home_team_id, isRetro);
  const awayLogo = getLogo(leagueType, game.away_team_id, isRetro);
  const completed = !!game.game_outcome;

  const clickable = completed && onGameClick && game.game_outcome !== "CANCELLED";

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 ${clickable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}`}
      onClick={clickable ? () => onGameClick(game.id) : undefined}
    >
      {/* Away team */}
      <div className="flex items-center gap-2 w-40 min-w-0">
        {awayLogo && <img src={awayLogo} className="w-5 h-5 object-contain shrink-0" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
        <span className={`text-sm truncate ${game.winning_team_id === game.away_team_id ? "font-bold" : ""}`}>{game.away_team_abbrev}</span>
      </div>
      {/* Score or vs */}
      <div className="w-20 text-center">
        {completed ? (
          <span className="text-sm font-semibold">{game.away_score} - {game.home_score}</span>
        ) : (
          <span className="text-xs text-gray-400">vs</span>
        )}
      </div>
      {/* Home team */}
      <div className="flex items-center gap-2 w-40 min-w-0">
        {homeLogo && <img src={homeLogo} className="w-5 h-5 object-contain shrink-0" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
        <span className={`text-sm truncate ${game.winning_team_id === game.home_team_id ? "font-bold" : ""}`}>{game.home_team_abbrev}</span>
      </div>
      {/* Game type badge */}
      <GameTypeBadge gameType={game.game_type} />
      {/* Result badge (when filtered to a team) */}
      {teamId && <ResultBadge game={game} teamId={teamId} onClick={onGameClick} />}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Calendar cell (monthly view)
// ═══════════════════════════════════════════════

const CalendarCell = ({ game, teamId, onGameClick }: {
  game?: ScheduleGame;
  teamId: number | null;
  onGameClick?: (gameId: number) => void;
}) => {
  if (!game) {
    return (
      <td className="px-2 py-3 text-center text-gray-300 dark:text-gray-600 text-xs border border-gray-100 dark:border-gray-700">
        —
      </td>
    );
  }

  if (!teamId) {
    return (
      <td className="px-2 py-3 text-center text-xs border border-gray-100 dark:border-gray-700">
        {game.away_team_abbrev} @ {game.home_team_abbrev}
      </td>
    );
  }

  const isHome = game.home_team_id === teamId;
  const oppAbbrev = isHome ? game.away_team_abbrev : game.home_team_abbrev;
  const prefix = isHome ? "vs" : "@";
  const r = getGameResult(game, teamId);
  const teamScore = isHome ? game.home_score : game.away_score;
  const oppScore = isHome ? game.away_score : game.home_score;

  let bgColor = "";
  let textColor = "";
  if (r.won) { bgColor = "bg-green-50 dark:bg-green-900/20"; textColor = "text-green-700 dark:text-green-400"; }
  else if (r.lost) { bgColor = "bg-red-50 dark:bg-red-900/20"; textColor = "text-red-700 dark:text-red-400"; }
  else if (r.cancelled) { bgColor = "bg-gray-100 dark:bg-gray-800"; textColor = "text-gray-400"; }

  const clickable = onGameClick && !r.pending && !r.cancelled;

  return (
    <td
      className={`px-2 py-2 text-center border border-gray-100 dark:border-gray-700 ${bgColor} ${clickable ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={clickable ? () => onGameClick(game.id) : undefined}
    >
      <div className="text-xs font-medium">{prefix} {oppAbbrev}</div>
      {game.game_type && game.game_type !== "regular" && (
        <GameTypeBadge gameType={game.game_type} />
      )}
      {r.pending ? (
        <div className="text-xs text-gray-400 mt-0.5">—</div>
      ) : (
        <div className={`text-xs font-semibold mt-0.5 ${textColor}`}>
          {r.cancelled ? "CAN" : `${r.won ? "W" : r.lost ? "L" : "T"} ${teamScore}-${oppScore}`}
        </div>
      )}
    </td>
  );
};

// ═══════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════

export const BaseballScheduleView = ({ league, organization, seasonContext }: BaseballScheduleViewProps) => {
  const { currentUser } = useAuthStore();
  const { allTeams } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const primaryTeam = getPrimaryBaseballTeam(organization);
  const defaultTeamId = primaryTeam?.team_id ?? null;

  // --- Player modal ---
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);
  const orgId = organization.id;
  const leagueYearId = seasonContext.current_league_year_id;

  const refreshBudget = useCallback(() => {
    if (orgId && leagueYearId) {
      BaseballService.GetScoutingBudget(orgId, leagueYearId)
        .then(setScoutingBudget).catch(() => {});
    }
  }, [orgId, leagueYearId]);

  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  const openPlayerModal = useCallback((playerId: number) => {
    setModalPlayerId(playerId);
    handleOpenModal();
  }, [handleOpenModal]);

  // --- Team color theming ---
  const teamColorsById = useMemo(() => {
    const map: Record<number, { colorOne: string; colorTwo: string }> = {};
    for (const t of allTeams ?? []) {
      map[t.team_id] = { colorOne: t.color_one ?? "#4B5563", colorTwo: t.color_two ?? "#4B5563" };
    }
    return map;
  }, [allTeams]);

  const teamColors = useTeamColors(primaryTeam?.color_one ?? undefined, primaryTeam?.color_two ?? undefined, primaryTeam?.color_three ?? undefined);
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  // --- State ---
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("weekly");
  const [selectedWeek, setSelectedWeek] = useState(seasonContext.current_week_index);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(defaultTeamId);
  const [selectedSubweek, setSelectedSubweek] = useState<string>("a");
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthForWeek(seasonContext.current_week_index));
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [boxScoreGameId, setBoxScoreGameId] = useState<number | null>(null);

  // --- League level ---
  const defaultLevel = isCollege ? 3 : 9;

  // --- Team options ---
  const teamOptions = useMemo(() => {
    const leagueLevel = defaultLevel;
    const teams = (allTeams ?? []).filter((t) => t.team_level === leagueLevel);
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) => a.team_full_name.localeCompare(b.team_full_name))) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [allTeams, defaultLevel]);

  const selectedTeamOption = useMemo(() => {
    if (!selectedTeamId) return teamOptions.find((o) => o.value === "__all__") ?? null;
    return teamOptions.find((o) => o.value === String(selectedTeamId)) ?? null;
  }, [teamOptions, selectedTeamId]);

  // --- Fetch schedule ---
  const fetchSchedule = useCallback(async (weekStart?: number, weekEnd?: number) => {
    setIsLoading(true);
    try {
      const data = await BaseballService.GetSchedule({
        season_year: seasonContext.league_year,
        league_level: defaultLevel,
        team_id: selectedTeamId ?? undefined,
        week_start: weekStart,
        week_end: weekEnd,
        page_size: 500,
      });
      setScheduleData(data);
    } catch (e) {
      console.error("Failed to load schedule", e);
    }
    setIsLoading(false);
  }, [seasonContext.league_year, defaultLevel, selectedTeamId]);

  // Refetch when view/week/month/team changes
  useEffect(() => {
    if (viewMode === "weekly" || viewMode === "daily") {
      fetchSchedule(selectedWeek, selectedWeek);
    } else if (viewMode === "monthly") {
      const [start, end] = getWeekRangeForMonth(selectedMonth);
      fetchSchedule(start, end);
    } else {
      // season: fetch everything
      fetchSchedule(1, TOTAL_WEEKS);
    }
  }, [viewMode, selectedWeek, selectedMonth, fetchSchedule]);

  // --- Derived data ---
  const games = scheduleData?.games ?? [];

  const weeklySeriesList = useMemo(() => {
    const weekGames = games.filter((g) => g.season_week === selectedWeek);
    return groupGamesIntoSeries(weekGames);
  }, [games, selectedWeek]);

  const dailyGames = useMemo(() => {
    return games.filter((g) => g.season_week === selectedWeek && g.season_subweek === selectedSubweek);
  }, [games, selectedWeek, selectedSubweek]);

  // --- Logo ---
  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(league === SimMLB ? SimMLB : SimCollegeBaseball, primaryTeam.team_id, currentUser?.isRetro);
  }, [primaryTeam, league, currentUser?.isRetro]);

  const pageTitle = primaryTeam?.team_full_name ?? organization.org_abbrev;
  const seasonLabel = `Season ${seasonContext.league_year}`;

  // --- Available subweeks for the current week ---
  const availableSubweeks = useMemo(() => {
    const subs = new Set(games.filter((g) => g.season_week === selectedWeek).map((g) => g.season_subweek));
    // Always show all 4 days so navigation is consistent
    return SUBWEEK_ORDER.filter((s) => subs.has(s));
  }, [games, selectedWeek]);

  // Reset subweek when week changes
  useEffect(() => {
    setSelectedSubweek("a");
  }, [selectedWeek]);

  // --- Navigation helpers ---
  const navigateDay = (direction: 1 | -1) => {
    const currentIdx = SUBWEEK_ORDER.indexOf(selectedSubweek);
    const newIdx = currentIdx + direction;
    if (newIdx >= 0 && newIdx < SUBWEEK_ORDER.length) {
      setSelectedSubweek(SUBWEEK_ORDER[newIdx]);
    } else if (direction === -1 && selectedWeek > 1) {
      setSelectedWeek((w) => w - 1);
      setSelectedSubweek(SUBWEEK_ORDER[SUBWEEK_ORDER.length - 1]);
    } else if (direction === 1 && selectedWeek < TOTAL_WEEKS) {
      setSelectedWeek((w) => w + 1);
      setSelectedSubweek(SUBWEEK_ORDER[0]);
    }
  };

  const navigatorLabel = viewMode === "daily" ? "Day" : viewMode === "monthly" ? "Month" : viewMode === "season" ? "Season" : "Week";

  // --- Calendar grid data for monthly + season views ---
  const calendarGameMap = useMemo(() => {
    if (viewMode !== "monthly" && viewMode !== "season") return new Map<string, ScheduleGame>();
    const map = new Map<string, ScheduleGame>();
    for (const g of games) {
      const key = `${g.season_week}-${g.season_subweek}`;
      if (selectedTeamId) {
        if (g.home_team_id === selectedTeamId || g.away_team_id === selectedTeamId) {
          map.set(key, g);
        }
      } else {
        if (!map.has(key)) map.set(key, g);
      }
    }
    return map;
  }, [games, selectedTeamId, viewMode]);

  const monthWeekRange = useMemo(() => {
    const [start, end] = getWeekRangeForMonth(selectedMonth);
    const weeks: number[] = [];
    for (let w = start; w <= end; w++) weeks.push(w);
    return weeks;
  }, [selectedMonth]);

  // --- Render ---
  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Team-colored header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{ backgroundColor: headerColor, borderBottom: `3px solid ${borderColor}` }}
        >
          {logo && <img src={logo} className="w-10 h-10 object-contain" alt={organization.org_abbrev} />}
          <div>
            <Text variant="h4" classes={headerTextClass}>{pageTitle}</Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>Schedule · {seasonLabel}</Text>
          </div>
          <div className="ml-auto min-w-[14rem]">
            <SelectDropdown
              options={teamOptions} value={selectedTeamOption}
              onChange={(opt) => {
                if (!opt) return;
                const v = (opt as SelectOption).value;
                setSelectedTeamId(v === "__all__" ? null : Number(v));
              }}
              isSearchable placeholder="Filter by team..."
              styles={{ control: (base: any, state: any) => ({ ...base, minWidth: "14rem", backgroundColor: state.isFocused ? "#2d3748" : "#1a202c", borderColor: state.isFocused ? borderColor : "#4A5568" }) }}
            />
          </div>
        </div>

        {/* Controls */}
        <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
          <div className="flex flex-wrap items-center gap-4">
            {/* View mode */}
            <div>
              <Text variant="small" classes="font-semibold mb-1">View</Text>
              <ButtonGroup>
                <PillButton variant="primaryOutline" isSelected={viewMode === "daily"} onClick={() => setViewMode("daily")}>
                  <Text variant="small">Daily</Text>
                </PillButton>
                <PillButton variant="primaryOutline" isSelected={viewMode === "weekly"} onClick={() => setViewMode("weekly")}>
                  <Text variant="small">Weekly</Text>
                </PillButton>
                <PillButton variant="primaryOutline" isSelected={viewMode === "monthly"} onClick={() => setViewMode("monthly")}>
                  <Text variant="small">Monthly</Text>
                </PillButton>
                <PillButton variant="primaryOutline" isSelected={viewMode === "season"} onClick={() => setViewMode("season")}>
                  <Text variant="small">Season</Text>
                </PillButton>
              </ButtonGroup>
            </div>

            {/* Navigator (hidden for season — shows everything) */}
            {viewMode !== "season" && <div className="flex items-center gap-2">
              <Text variant="small" classes="font-semibold">{navigatorLabel}</Text>

              {/* Daily: sequential day navigation across weeks */}
              {viewMode === "daily" && (
                <>
                  <button
                    onClick={() => navigateDay(-1)}
                    disabled={selectedWeek <= 1 && selectedSubweek === "a"}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >←</button>
                  <span className="text-sm font-semibold min-w-[8rem] text-center">
                    Week {selectedWeek} · {SUBWEEK_LABELS[selectedSubweek]}
                  </span>
                  <button
                    onClick={() => navigateDay(1)}
                    disabled={selectedWeek >= TOTAL_WEEKS && selectedSubweek === "d"}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >→</button>
                </>
              )}

              {/* Weekly: week-by-week navigation */}
              {viewMode === "weekly" && (
                <>
                  <button
                    onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                    disabled={selectedWeek <= 1}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >←</button>
                  <span className="text-sm font-semibold min-w-[3rem] text-center">{selectedWeek}</span>
                  <button
                    onClick={() => setSelectedWeek((w) => Math.min(TOTAL_WEEKS, w + 1))}
                    disabled={selectedWeek >= TOTAL_WEEKS}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >→</button>
                </>
              )}

              {/* Monthly: month-by-month navigation */}
              {viewMode === "monthly" && (
                <>
                  <button
                    onClick={() => setSelectedMonth((m) => Math.max(1, m - 1))}
                    disabled={selectedMonth <= 1}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >←</button>
                  <span className="text-sm font-semibold min-w-[5rem] text-center">
                    Month {selectedMonth}
                  </span>
                  <button
                    onClick={() => setSelectedMonth((m) => Math.min(12, m + 1))}
                    disabled={selectedMonth >= 12}
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >→</button>
                </>
              )}

              {/* Current week indicator */}
              {viewMode === "weekly" && selectedWeek === seasonContext.current_week_index && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Current</span>
              )}
              {viewMode === "monthly" && selectedMonth === getMonthForWeek(seasonContext.current_week_index) && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Current</span>
              )}
            </div>}

            {/* Day selector pills (daily view) */}
            {viewMode === "daily" && (
              <div>
                <Text variant="small" classes="font-semibold mb-1">Jump to</Text>
                <ButtonGroup>
                  {SUBWEEK_ORDER.map((sw) => (
                    <PillButton key={sw} variant="primaryOutline" isSelected={selectedSubweek === sw} onClick={() => setSelectedSubweek(sw)}>
                      <Text variant="small">{SUBWEEK_LABELS[sw]}</Text>
                    </PillButton>
                  ))}
                </ButtonGroup>
              </div>
            )}
          </div>
        </Border>

        {/* Content */}
        <Border classes="p-4" styles={{ borderTop: `3px solid ${headerColor}` }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">Loading schedule...</Text>
            </div>
          ) : (
            <>
              {/* Weekly view */}
              {viewMode === "weekly" && (
                weeklySeriesList.length === 0 ? (
                  <Text variant="body-small" classes="text-gray-400 py-8 text-center">No games found for Week {selectedWeek}.</Text>
                ) : (
                  <div className="flex flex-col gap-4">
                    {weeklySeriesList.map((series) => (
                      <SeriesDetailCard
                        key={`${series.season_week}-${series.home_team_id}-${series.away_team_id}`}
                        series={series}
                        teamId={selectedTeamId ?? series.home_team_id}
                        league={league}
                        isRetro={currentUser?.isRetro}
                        accentColor={headerColor}
                        teamColorsById={teamColorsById}
                        onGameClick={setBoxScoreGameId}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Daily view */}
              {viewMode === "daily" && (
                dailyGames.length === 0 ? (
                  <Text variant="body-small" classes="text-gray-400 py-8 text-center">
                    No games on {SUBWEEK_LABELS[selectedSubweek]} of Week {selectedWeek}.
                  </Text>
                ) : (
                  <div className="flex flex-col gap-4">
                    {dailyGames.map((g) => (
                      <SeriesDetailCard
                        key={g.id}
                        series={{
                          season_week: g.season_week,
                          home_team_id: g.home_team_id,
                          home_team_abbrev: g.home_team_abbrev,
                          home_team_name: g.home_team_name,
                          away_team_id: g.away_team_id,
                          away_team_abbrev: g.away_team_abbrev,
                          away_team_name: g.away_team_name,
                          games: [g],
                        }}
                        teamId={selectedTeamId ?? g.home_team_id}
                        league={league}
                        isRetro={currentUser?.isRetro}
                        accentColor={headerColor}
                        teamColorsById={teamColorsById}
                        onGameClick={setBoxScoreGameId}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Monthly / Season calendar grid */}
              {(viewMode === "monthly" || viewMode === "season") && (
                <div className="overflow-x-auto space-y-6">
                  {(viewMode === "season" ? Array.from({ length: 12 }, (_, i) => i + 1) : [selectedMonth]).map((monthNum) => {
                    const [mStart, mEnd] = getWeekRangeForMonth(monthNum);
                    const weeks: number[] = [];
                    for (let w = mStart; w <= mEnd; w++) weeks.push(w);

                    // Month record
                    let monthW = 0, monthL = 0;
                    if (selectedTeamId) {
                      for (const wk of weeks) {
                        for (const sw of SUBWEEK_ORDER) {
                          const g = calendarGameMap.get(`${wk}-${sw}`);
                          if (g) {
                            const r = getGameResult(g, selectedTeamId);
                            if (r.won) monthW++;
                            else if (r.lost) monthL++;
                          }
                        }
                      }
                    }

                    return (
                      <div key={monthNum}>
                        {/* Month header (always show in season view, show as footer summary in monthly) */}
                        {viewMode === "season" && (
                          <div
                            className="flex items-center justify-between px-3 py-2 rounded-t-lg"
                            style={{ backgroundColor: `${headerColor}15` }}
                          >
                            <Text variant="body" classes="font-bold">Month {monthNum}</Text>
                            {selectedTeamId && (monthW > 0 || monthL > 0) && (
                              <span className="text-sm font-semibold dark:!text-white" style={{ color: headerColor }}>{monthW}-{monthL}</span>
                            )}
                          </div>
                        )}
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Week</th>
                              {SUBWEEK_ORDER.map((sw) => (
                                <th key={sw} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase text-center min-w-[5rem]">
                                  {SUBWEEK_LABELS[sw]}
                                </th>
                              ))}
                              {selectedTeamId && (
                                <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase text-center">Record</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {weeks.map((weekNum) => {
                              const isCurrent = weekNum === seasonContext.current_week_index;
                              let weekRecord = "";
                              if (selectedTeamId) {
                                let w = 0, l = 0;
                                for (const sw of SUBWEEK_ORDER) {
                                  const g = calendarGameMap.get(`${weekNum}-${sw}`);
                                  if (g) {
                                    const r = getGameResult(g, selectedTeamId);
                                    if (r.won) w++;
                                    else if (r.lost) l++;
                                  }
                                }
                                if (w > 0 || l > 0) weekRecord = `${w}-${l}`;
                              }
                              return (
                                <tr key={weekNum} className={isCurrent ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                                  <td className="px-3 py-2 text-sm font-medium whitespace-nowrap border border-gray-100 dark:border-gray-700">
                                    Wk {weekNum}
                                    {isCurrent && <span className="ml-1 text-xs text-green-600 dark:text-green-400">●</span>}
                                  </td>
                                  {SUBWEEK_ORDER.map((sw) => (
                                    <CalendarCell key={sw} game={calendarGameMap.get(`${weekNum}-${sw}`)} teamId={selectedTeamId} onGameClick={setBoxScoreGameId} />
                                  ))}
                                  {selectedTeamId && (
                                    <td className="px-3 py-2 text-sm text-center font-medium border border-gray-100 dark:border-gray-700">
                                      {weekRecord || "—"}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                          {/* Month summary footer */}
                          {selectedTeamId && (
                            <tfoot>
                              <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                                <td className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase" colSpan={SUBWEEK_ORDER.length + 1}>
                                  Month {monthNum} Total
                                </td>
                                <td className="px-3 py-2 text-sm text-center font-bold">
                                  {monthW > 0 || monthL > 0 ? `${monthW}-${monthL}` : "—"}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    );
                  })}

                  {/* Season totals (season view only) */}
                  {viewMode === "season" && selectedTeamId && (
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-lg"
                      style={{ backgroundColor: `${headerColor}20`, border: `2px solid ${headerColor}` }}
                    >
                      <Text variant="body" classes="font-bold">Season Total</Text>
                      <span className="text-base font-bold dark:!text-white" style={{ color: headerColor }}>
                        {(() => {
                          let w = 0, l = 0;
                          for (let wk = 1; wk <= TOTAL_WEEKS; wk++) {
                            for (const sw of SUBWEEK_ORDER) {
                              const g = calendarGameMap.get(`${wk}-${sw}`);
                              if (g && selectedTeamId) {
                                const r = getGameResult(g, selectedTeamId);
                                if (r.won) w++;
                                else if (r.lost) l++;
                              }
                            }
                          }
                          return w > 0 || l > 0 ? `${w}-${l}` : "—";
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Border>

        {/* Box Score Modal */}
        <BaseballBoxScoreModal
          gameId={boxScoreGameId}
          isOpen={boxScoreGameId !== null}
          onClose={() => setBoxScoreGameId(null)}
          league={league}
          isRetro={currentUser?.isRetro}
          onPlayerClick={openPlayerModal}
        />

        {/* Player Modal */}
        {modalPlayerId != null && (
          <BaseballScoutingModal
            isOpen={isModalOpen}
            onClose={() => { setModalPlayerId(null); handleCloseModal(); }}
            playerId={modalPlayerId}
            orgId={orgId}
            leagueYearId={leagueYearId}
            scoutingBudget={scoutingBudget}
            onBudgetChanged={refreshBudget}
            league={league === SimMLB ? SimMLB : SimCollegeBaseball}
          />
        )}
      </div>
    </PageContainer>
  );
};

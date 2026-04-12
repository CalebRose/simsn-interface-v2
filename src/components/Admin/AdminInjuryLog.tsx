import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { BaseballService } from "../../_services/baseballService";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import {
  AdminInjuryLogResponse,
  AdminInjuryLogEvent,
} from "../../models/baseball/baseballStatsModels";
import { displayLevelFromId, NUMERIC_LEVEL_MAP } from "../../_utility/baseballHelpers";
import { enqueueSnackbar } from "notistack";
import "../../components/Team/baseball/baseballMobile.css";

// ── Helpers ──────────────────────────────────────────────────────

const EFFECTS_LABELS: Record<string, string> = {
  contact: "CON", power: "POW", speed: "SPD", eye: "EYE",
  discipline: "DISC", fieldreact: "FLD", fieldcatch: "CATCH",
  throwpower: "THRP", throwacc: "THRA", basereaction: "BRCTN",
  baserunning: "BRUN", pendurance: "END", pgencontrol: "CTRL",
  psequencing: "SEQ", pthrowpower: "VELO", pickoff: "PKO",
  stamina_pct: "STA",
};

function formatEffects(effects: Record<string, number> | undefined): string {
  if (!effects) return "";
  return Object.entries(effects)
    .filter(([, v]) => v < 1.0)
    .map(([k, v]) => `${EFFECTS_LABELS[k] ?? k} -${Math.round((1 - v) * 100)}%`)
    .join(", ");
}

// ── Filter option builders ───────────────────────────────────────

const LEVEL_OPTIONS: SelectOption[] = Object.entries(NUMERIC_LEVEL_MAP)
  .sort(([a], [b]) => Number(b) - Number(a))
  .map(([num]) => ({
    value: num,
    label: displayLevelFromId(Number(num)),
  }));

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "pregame", label: "Pregame" },
  { value: "ingame", label: "In-Game" },
];

const PAGE_SIZE = 50;

// ── Component ────────────────────────────────────────────────────

interface AdminInjuryLogProps {
  leagueYearId: number;
}

export const AdminInjuryLog: FC<AdminInjuryLogProps> = ({ leagueYearId }) => {
  const { allTeams } = useSimBaseballStore();

  // Filters
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);
  const [teamFilter, setTeamFilter] = useState<SelectOption | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SelectOption | null>(null);
  const [weekFilter, setWeekFilter] = useState<SelectOption | null>(null);

  // Data
  const [data, setData] = useState<AdminInjuryLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);

  // Team options (MLB orgs only, level >= 4)
  const teamOptions = useMemo<SelectOption[]>(() => {
    if (!allTeams) return [];
    const seen = new Set<number>();
    return allTeams
      .filter((t) => t.team_level >= 4 && !seen.has(t.team_id) && seen.add(t.team_id))
      .sort((a, b) => a.team_abbrev.localeCompare(b.team_abbrev))
      .map((t) => ({ value: String(t.team_id), label: `${t.team_abbrev} — ${t.team_full_name}` }));
  }, [allTeams]);

  // Week options derived from the response summary
  const weekOptions = useMemo<SelectOption[]>(() => {
    if (!data?.summary.by_week) return [];
    return data.summary.by_week.map((w) => ({
      value: String(w.week),
      label: `Week ${w.week} (${w.count})`,
    }));
  }, [data?.summary.by_week]);

  // Fetch
  const fetchLog = useCallback(async () => {
    if (!leagueYearId) return;
    setIsLoading(true);
    try {
      const res = await BaseballService.GetAdminInjuryLog({
        league_year_id: leagueYearId,
        league_level: levelFilter ? Number(levelFilter.value) : undefined,
        team_id: teamFilter ? Number(teamFilter.value) : undefined,
        source: sourceFilter?.value as "pregame" | "ingame" | undefined,
        season_week: weekFilter ? Number(weekFilter.value) : undefined,
        limit: 500,
      });
      setData(res);
      setPage(0);
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to load injury log", { variant: "error" });
    }
    setIsLoading(false);
  }, [leagueYearId, levelFilter, teamFilter, sourceFilter, weekFilter]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  // Paginate events locally
  const events: AdminInjuryLogEvent[] = data?.events ?? [];
  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pageEvents = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const summary = data?.summary;

  return (
    <Border classes="w-full mt-4">
      <div className="p-4">
        <Text variant="h6" classes="mb-3">
          Injury Log (Analytics)
        </Text>

        {/* Summary counters */}
        {summary && (
          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
              <strong>{summary.total}</strong> total
            </span>
            <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
              <strong>{summary.pregame}</strong> pregame
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
              <strong>{summary.ingame}</strong> in-game
            </span>
            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
              <strong>{summary.active}</strong> active
            </span>
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              <strong>{summary.healed}</strong> healed
            </span>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="w-36">
            <SelectDropdown
              isClearable
              placeholder="Level"
              options={LEVEL_OPTIONS}
              value={levelFilter}
              onChange={(opt) => setLevelFilter(opt)}
            />
          </div>
          <div className="w-56">
            <SelectDropdown
              isClearable
              placeholder="Team"
              options={teamOptions}
              value={teamFilter}
              onChange={(opt) => setTeamFilter(opt)}
            />
          </div>
          <div className="w-36">
            <SelectDropdown
              isClearable
              placeholder="Source"
              options={SOURCE_OPTIONS}
              value={sourceFilter}
              onChange={(opt) => setSourceFilter(opt)}
            />
          </div>
          <div className="w-44">
            <SelectDropdown
              isClearable
              placeholder="Week"
              options={weekOptions}
              value={weekFilter}
              onChange={(opt) => setWeekFilter(opt)}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <Text variant="small" classes="text-gray-400 py-8 text-center">
            Loading injury log...
          </Text>
        ) : (
          <div className="baseball-table-wrapper overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                  <th className="px-3 py-2">Week</th>
                  <th className="px-3 py-2 min-w-[10rem]">Player</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2">Injury</th>
                  <th className="px-3 py-2 text-center">Source</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Duration</th>
                  <th className="px-3 py-2">Effects</th>
                </tr>
              </thead>
              <tbody>
                {pageEvents.map((evt, idx) => (
                  <tr
                    key={evt.event_id}
                    className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                  >
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {evt.season_week}{evt.season_subweek ?? ""}
                    </td>
                    <td className="px-3 py-2 font-medium">{evt.player_name}</td>
                    <td className="px-3 py-2 text-xs">
                      {evt.player_team_abbrev}
                      {evt.player_league_level != null && (
                        <span className="ml-1 text-gray-400">
                          ({displayLevelFromId(evt.player_league_level)})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{evt.injury_name}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          evt.source === "pregame"
                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {evt.source === "pregame" ? "Pregame" : "In-Game"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={
                          evt.status === "active"
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-green-600 dark:text-green-400"
                        }
                      >
                        {evt.status === "active" ? "Active" : "Healed"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {evt.weeks_remaining > 0
                        ? `${evt.weeks_remaining}/${evt.weeks_assigned}w`
                        : `${evt.weeks_assigned}w`}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 max-w-[180px] truncate" title={formatEffects(evt.effects)}>
                      {formatEffects(evt.effects) || "\u2014"}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      No injury events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3 text-sm">
            <button
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Border>
  );
};

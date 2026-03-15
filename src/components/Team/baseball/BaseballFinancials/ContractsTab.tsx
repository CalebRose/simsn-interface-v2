import { useState, useEffect, useMemo } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import {
  PayrollProjectionResponse,
  PayrollProjectionPlayer,
  DeadMoneyEntry,
} from "../../../../models/baseball/baseballModels";
import {
  formatMoney,
  PHASE_CONFIG,
  LEVEL_NAMES,
  MINOR_SALARY,
  PRE_ARB_SALARY,
  ARB_ESTIMATED_SALARY,
} from "./financialConstants";
import "../baseballMobile.css";

interface ContractsTabProps {
  orgId: number;
}

export const ContractsTab = ({ orgId }: ContractsTabProps) => {
  const [data, setData] = useState<PayrollProjectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await BaseballService.GetPayrollProjection(orgId);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError("Payroll projection data is not available yet.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orgId]);

  if (isLoading) {
    return (
      <Text variant="body-small" classes="text-gray-400 py-4">
        Loading payroll projection...
      </Text>
    );
  }

  if (error || !data) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
          {error ?? "No payroll data available."}
        </Text>
      </Border>
    );
  }

  return <PayrollProjectionView data={data} />;
};

// --- Main View ---

const PayrollProjectionView = ({ data }: { data: PayrollProjectionResponse }) => {
  const currentYear = data.current_league_year;

  // Build year columns: current + next 4
  const yearColumns = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) years.push(currentYear + i);
    return years;
  }, [currentYear]);

  // Group players by level (descending — MLB first)
  const levelGroups = useMemo(() => {
    const groups = new Map<number, PayrollProjectionPlayer[]>();
    for (const p of data.players) {
      const level = p.current_level;
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level)!.push(p);
    }
    // Sort by level descending
    return [...groups.entries()]
      .sort(([a], [b]) => b - a)
      .map(([level, players]) => ({
        level,
        levelName: LEVEL_NAMES[level] ?? `Level ${level}`,
        players: players.sort((a, b) => {
          // Sort by current year salary descending
          const aSal = getPlayerYearSalary(a, currentYear);
          const bSal = getPlayerYearSalary(b, currentYear);
          return bSal - aSal;
        }),
      }));
  }, [data.players, currentYear]);

  // Projected year totals (committed + auto-renewal/arb estimates)
  const projectedYearTotals = useMemo(() => {
    const totals: Record<number, { committed: number; projected: number }> = {};
    for (const yr of yearColumns) {
      let committed = data.year_totals[String(yr)]?.total_salary ?? 0;
      // Add dead money
      committed += data.dead_money.reduce(
        (sum, d) => sum + (d.remaining.find((r) => r.league_year === yr)?.team_owes ?? 0),
        0,
      );
      let projected = committed;
      for (const p of data.players) {
        const committedSal = getPlayerYearSalary(p, yr);
        if (committedSal === 0) {
          projected += getProjectedSalary(p, yr);
        }
      }
      totals[yr] = { committed, projected };
    }
    return totals;
  }, [data, yearColumns]);

  // Summary cards
  const summary = useMemo(() => {
    const currentYearTotal = projectedYearTotals[currentYear]?.projected ?? 0;
    const futureProjected = yearColumns
      .slice(1)
      .reduce((sum, yr) => sum + (projectedYearTotals[yr]?.projected ?? 0), 0);
    const futureCommitted = yearColumns
      .slice(1)
      .reduce((sum, yr) => sum + (projectedYearTotals[yr]?.committed ?? 0), 0);
    const deadMoneyTotal = data.dead_money.reduce(
      (sum, d) => sum + d.remaining.reduce((s, r) => s + r.team_owes, 0),
      0,
    );
    const expiringCount = data.players.filter((p) => {
      const lastEntry = p.salary_schedule[p.salary_schedule.length - 1];
      return lastEntry && lastEntry.league_year === currentYear;
    }).length;

    return { currentYearTotal, futureProjected, futureCommitted, deadMoneyTotal, expiringCount };
  }, [data, currentYear, yearColumns, projectedYearTotals]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Projected Payroll" value={formatMoney(summary.currentYearTotal)} subtitle="Current year incl. renewals" />
        <SummaryCard
          label="Projected Future"
          value={formatMoney(summary.futureProjected)}
          subtitle={summary.futureCommitted !== summary.futureProjected ? `${formatMoney(summary.futureCommitted)} committed` : undefined}
        />
        <SummaryCard
          label="Dead Money"
          value={formatMoney(summary.deadMoneyTotal)}
          color={summary.deadMoneyTotal > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
        <SummaryCard
          label="Expiring After This Season"
          value={String(summary.expiringCount)}
          color={summary.expiringCount > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
        />
      </div>

      {/* Payroll Table */}
      <Border classes="p-4">
        <Text variant="h5" classes="mb-3 font-semibold">
          Payroll Projection
        </Text>
        <div className="baseball-table-wrapper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-3 py-2 text-left sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 min-w-[200px]">
                  Player
                </th>
                <th className="px-2 py-2 text-center w-20">Phase</th>
                <th className="px-2 py-2 text-center w-14">SVC</th>
                <th className="px-2 py-2 text-center w-20">Contract</th>
                {yearColumns.map((yr) => (
                  <th key={yr} className={`px-3 py-2 text-right w-28 ${yr === currentYear ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                    {yr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levelGroups.map((group) => (
                <LevelGroup
                  key={group.level}
                  levelName={group.levelName}
                  players={group.players}
                  yearColumns={yearColumns}
                  currentYear={currentYear}
                />
              ))}

              {/* Dead Money */}
              {data.dead_money.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={4 + yearColumns.length}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/10 font-semibold text-red-700 dark:text-red-400 text-xs uppercase tracking-wide"
                    >
                      Dead Money
                    </td>
                  </tr>
                  {data.dead_money.map((dm) => (
                    <DeadMoneyRow key={dm.contract_id} entry={dm} yearColumns={yearColumns} currentYear={currentYear} />
                  ))}
                </>
              )}

              {/* Totals Row */}
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold text-sm">
                <td colSpan={4} className="px-3 py-2 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                  Projected Total
                </td>
                {yearColumns.map((yr) => {
                  const totals = projectedYearTotals[yr];
                  const projected = totals?.projected ?? 0;
                  const committed = totals?.committed ?? 0;
                  const hasProjections = projected !== committed;
                  return (
                    <td key={yr} className={`px-3 py-2 text-right ${yr === currentYear ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                      {projected > 0 ? (
                        <div>
                          <div>{formatMoney(projected)}</div>
                          {hasProjections && (
                            <div className="text-[10px] font-normal text-gray-500 dark:text-gray-400 italic">
                              {formatMoney(committed)} committed
                            </div>
                          )}
                        </div>
                      ) : "—"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Border>
    </div>
  );
};

// --- Level Group ---

const LevelGroup = ({
  levelName,
  players,
  yearColumns,
  currentYear,
}: {
  levelName: string;
  players: PayrollProjectionPlayer[];
  yearColumns: number[];
  currentYear: number;
}) => (
  <>
    <tr>
      <td
        colSpan={4 + yearColumns.length}
        className="px-3 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300"
      >
        {levelName}
      </td>
    </tr>
    {players.map((p) => (
      <PlayerRow key={p.contract_id} player={p} yearColumns={yearColumns} currentYear={currentYear} />
    ))}
  </>
);

// --- Player Row ---

const PlayerRow = ({
  player,
  yearColumns,
  currentYear,
}: {
  player: PayrollProjectionPlayer;
  yearColumns: number[];
  currentYear: number;
}) => {
  const phase = PHASE_CONFIG[player.contract_phase];
  const scheduleMap = useMemo(() => {
    const m = new Map<number, { team_owes: number; gross_salary: number; team_share: number }>();
    for (const s of player.salary_schedule) {
      m.set(s.league_year, { team_owes: s.team_owes, gross_salary: s.gross_salary, team_share: s.team_share });
    }
    return m;
  }, [player.salary_schedule]);

  // Determine the last contracted year
  const lastContractYear = player.salary_schedule.length > 0
    ? Math.max(...player.salary_schedule.map((s) => s.league_year))
    : currentYear;

  // Can project renewals for minor/pre_arb/arb_eligible (FA-eligible players leave)
  const canProjectRenewal = player.contract_phase === "minor"
    || player.contract_phase === "pre_arb"
    || player.contract_phase === "arb_eligible";
  const renewalSalary = player.contract_phase === "minor"
    ? MINOR_SALARY
    : player.contract_phase === "pre_arb"
      ? PRE_ARB_SALARY
      : ARB_ESTIMATED_SALARY;
  const renewalLabel = player.contract_phase === "arb_eligible"
    ? "Estimated arb salary"
    : "Projected auto-renewal";

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      {/* Player info - sticky left */}
      <td className="px-3 py-1.5 sticky left-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center gap-2">
          <span className="font-medium whitespace-nowrap">{player.player_name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{player.position}</span>
        </div>
      </td>
      {/* Phase badge */}
      <td className="px-2 py-1.5 text-center">
        {phase && (
          <span className={`px-1.5 py-0.5 text-xs rounded whitespace-nowrap ${phase.classes}`}>
            {phase.label}
          </span>
        )}
      </td>
      {/* Service years */}
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400 text-xs">
        {player.mlb_service_years}
      </td>
      {/* Contract info */}
      <td className="px-2 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {player.salary_schedule.length > 0
          ? `${player.salary_schedule.findIndex((s) => s.is_current) + 1} of ${player.salary_schedule.length}`
          : "—"}
      </td>
      {/* Year columns */}
      {yearColumns.map((yr) => {
        const entry = scheduleMap.get(yr);
        if (entry) {
          const hasRetention = entry.team_share < 1;
          return (
            <td
              key={yr}
              className={`px-3 py-1.5 text-right whitespace-nowrap ${yr === currentYear ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
              title={hasRetention ? `Gross: ${formatMoney(entry.gross_salary)} (${(entry.team_share * 100).toFixed(0)}% share)` : undefined}
            >
              {formatMoney(entry.team_owes)}
              {hasRetention && <span className="text-amber-500 ml-0.5">*</span>}
            </td>
          );
        }

        // Projected renewal/arb salary past contract end
        if (canProjectRenewal && yr > lastContractYear) {
          return (
            <td
              key={yr}
              className={`px-3 py-1.5 text-right italic text-gray-400 dark:text-gray-500 ${yr === currentYear ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
              title={renewalLabel}
            >
              {formatMoney(renewalSalary)}
              <span className="text-xs ml-0.5">&dagger;</span>
            </td>
          );
        }

        return (
          <td key={yr} className={`px-3 py-1.5 text-right text-gray-400 ${yr === currentYear ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
            —
          </td>
        );
      })}
    </tr>
  );
};

// --- Dead Money Row ---

const DeadMoneyRow = ({
  entry,
  yearColumns,
  currentYear,
}: {
  entry: DeadMoneyEntry;
  yearColumns: number[];
  currentYear: number;
}) => {
  const remainingMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of entry.remaining) m.set(r.league_year, r.team_owes);
    return m;
  }, [entry.remaining]);

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-red-700 dark:text-red-400">
      <td className="px-3 py-1.5 sticky left-0 bg-white dark:bg-gray-800 z-10">
        <span className="font-medium whitespace-nowrap">{entry.player_name}</span>
      </td>
      <td className="px-2 py-1.5 text-center">
        <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          Dead
        </span>
      </td>
      <td className="px-2 py-1.5" />
      <td className="px-2 py-1.5" />
      {yearColumns.map((yr) => {
        const amount = remainingMap.get(yr);
        return (
          <td key={yr} className={`px-3 py-1.5 text-right ${yr === currentYear ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
            {amount ? formatMoney(amount) : "—"}
          </td>
        );
      })}
    </tr>
  );
};

// --- Summary Card ---

const SummaryCard = ({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
}) => (
  <Border classes="p-3">
    <Text variant="small" classes="text-gray-500 dark:text-gray-400">
      {label}
    </Text>
    <Text variant="body" classes={`font-bold ${color ?? ""}`}>
      {value}
    </Text>
    {subtitle && (
      <Text variant="small" classes="text-gray-400 dark:text-gray-500 text-xs">
        {subtitle}
      </Text>
    )}
  </Border>
);

// --- Helpers ---

function getPlayerYearSalary(p: PayrollProjectionPlayer, year: number): number {
  const entry = p.salary_schedule.find((s) => s.league_year === year);
  return entry?.team_owes ?? 0;
}

/** Get the projected salary for a player in a given year, including auto-renewal/arb estimates. */
function getProjectedSalary(p: PayrollProjectionPlayer, year: number): number {
  // First check committed salary
  const entry = p.salary_schedule.find((s) => s.league_year === year);
  if (entry) return entry.team_owes;

  // If year is past contract end, project based on phase
  const lastYear = p.salary_schedule.length > 0
    ? Math.max(...p.salary_schedule.map((s) => s.league_year))
    : year - 1;
  if (year <= lastYear) return 0;

  switch (p.contract_phase) {
    case "minor": return MINOR_SALARY;
    case "pre_arb": return PRE_ARB_SALARY;
    case "arb_eligible": return ARB_ESTIMATED_SALARY;
    default: return 0; // FA-eligible players leave
  }
}

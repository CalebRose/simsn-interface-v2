import { useState, useEffect, useMemo } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import {
  PayrollProjectionResponse,
  PayrollProjectionPlayer,
  DeadMoneyEntry,
  ContractOverviewPlayer,
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
  leagueYearId: number;
}

type SubView = "payroll" | "roster";

export const ContractsTab = ({ orgId, leagueYearId }: ContractsTabProps) => {
  const [subView, setSubView] = useState<SubView>("payroll");

  // Signing budget
  const [signingBudget, setSigningBudget] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (orgId && leagueYearId) {
      BaseballService.GetSigningBudget(orgId, leagueYearId)
        .then((res) => { if (!cancelled) setSigningBudget(res.available_budget); })
        .catch(() => { if (!cancelled) setSigningBudget(null); });
    }
    return () => { cancelled = true; };
  }, [orgId, leagueYearId]);

  return (
    <div className="space-y-4">
      {/* Signing Budget Card */}
      {signingBudget != null && (
        <Border classes="p-3">
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Available Signing Budget
          </Text>
          <Text variant="body" classes="font-bold text-green-600 dark:text-green-400">
            {formatMoney(signingBudget)}
          </Text>
        </Border>
      )}

      {/* Sub-view toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubView("payroll")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            subView === "payroll"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Payroll Projection
        </button>
        <button
          onClick={() => setSubView("roster")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            subView === "roster"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Roster Contracts
        </button>
      </div>

      {subView === "payroll" && <PayrollSubView orgId={orgId} />}
      {subView === "roster" && <RosterContractsSubView orgId={orgId} />}
    </div>
  );
};

// ============================================================
// PAYROLL PROJECTION SUB-VIEW
// ============================================================

const PayrollSubView = ({ orgId }: { orgId: number }) => {
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

const PayrollProjectionView = ({ data }: { data: PayrollProjectionResponse }) => {
  const currentYear = data.current_league_year;

  const yearColumns = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) years.push(currentYear + i);
    return years;
  }, [currentYear]);

  const levelGroups = useMemo(() => {
    const groups = new Map<number, PayrollProjectionPlayer[]>();
    for (const p of data.players) {
      const level = p.current_level;
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level)!.push(p);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b - a)
      .map(([level, players]) => ({
        level,
        levelName: LEVEL_NAMES[level] ?? `Level ${level}`,
        players: players.sort((a, b) => {
          const aSal = getPlayerYearSalary(a, currentYear);
          const bSal = getPlayerYearSalary(b, currentYear);
          return bSal - aSal;
        }),
      }));
  }, [data.players, currentYear]);

  const projectedYearTotals = useMemo(() => {
    const totals: Record<number, { committed: number; projected: number }> = {};
    for (const yr of yearColumns) {
      let committed = data.year_totals[String(yr)]?.total_salary ?? 0;
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
        <PayrollSummaryCard label="Projected Payroll" value={formatMoney(summary.currentYearTotal)} subtitle="Current year incl. renewals" />
        <PayrollSummaryCard
          label="Projected Future"
          value={formatMoney(summary.futureProjected)}
          subtitle={summary.futureCommitted !== summary.futureProjected ? `${formatMoney(summary.futureCommitted)} committed` : undefined}
        />
        <PayrollSummaryCard
          label="Dead Money"
          value={formatMoney(summary.deadMoneyTotal)}
          color={summary.deadMoneyTotal > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
        <PayrollSummaryCard
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
                <PayrollLevelGroup
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

// --- Payroll Level Group ---

const PayrollLevelGroup = ({
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
      <PayrollPlayerRow key={p.contract_id} player={p} yearColumns={yearColumns} currentYear={currentYear} />
    ))}
  </>
);

// --- Payroll Player Row ---

const PayrollPlayerRow = ({
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

  const lastContractYear = player.salary_schedule.length > 0
    ? Math.max(...player.salary_schedule.map((s) => s.league_year))
    : currentYear;

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
      <td className="px-3 py-1.5 sticky left-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center gap-2">
          <span className="font-medium whitespace-nowrap">{player.player_name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{player.position}</span>
        </div>
      </td>
      <td className="px-2 py-1.5 text-center">
        {phase && (
          <span className={`px-1.5 py-0.5 text-xs rounded whitespace-nowrap ${phase.classes}`}>
            {phase.label}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400 text-xs">
        {player.mlb_service_years}
      </td>
      <td className="px-2 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {player.salary_schedule.length > 0
          ? `${player.salary_schedule.findIndex((s) => s.is_current) + 1} of ${player.salary_schedule.length}`
          : "—"}
      </td>
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

// --- Payroll Summary Card ---

const PayrollSummaryCard = ({
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

// ============================================================
// ROSTER CONTRACTS SUB-VIEW (formerly ServiceTimeTab)
// ============================================================

type SortKey = "salary" | "service" | "phase" | "level" | "name";
type FilterLevel = "all" | "mlb" | "minor";
type FilterPhase = "all" | "minor" | "pre_arb" | "arb_eligible" | "fa_eligible" | "expiring" | "under_contract";

const PHASE_ORDER: Record<string, number> = {
  minor: 0,
  pre_arb: 1,
  arb_eligible: 2,
  fa_eligible: 3,
};

const RosterContractsSubView = ({ orgId }: { orgId: number }) => {
  const [data, setData] = useState<ContractOverviewPlayer[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await BaseballService.GetContractOverview(orgId);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError("Contract data is not available yet.");
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
        Loading contract data...
      </Text>
    );
  }

  if (error || !data) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
          {error ?? "No contract data available."}
        </Text>
      </Border>
    );
  }

  return <RosterContractsView players={data} />;
};

const RosterContractsView = ({ players }: { players: ContractOverviewPlayer[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>("level");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [filterPhase, setFilterPhase] = useState<FilterPhase>("all");

  const phaseCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    let expiring = 0;
    let underContract = 0;
    for (const p of players) {
      counts[p.contract_phase] = (counts[p.contract_phase] ?? 0) + 1;
      if (p.is_expiring) expiring++;
      if (p.contract_phase === "fa_eligible" && !p.is_expiring) underContract++;
    }
    counts.expiring = expiring;
    counts.under_contract = underContract;
    return counts;
  }, [players]);

  const filtered = useMemo(() => {
    let result = [...players];
    if (filterLevel === "mlb") result = result.filter((p) => p.current_level >= 9);
    if (filterLevel === "minor") result = result.filter((p) => p.current_level < 9);
    if (filterPhase === "expiring") {
      result = result.filter((p) => p.is_expiring);
    } else if (filterPhase === "under_contract") {
      result = result.filter((p) => p.contract_phase === "fa_eligible" && !p.is_expiring);
    } else if (filterPhase !== "all") {
      result = result.filter((p) => p.contract_phase === filterPhase);
    }
    return result;
  }, [players, filterLevel, filterPhase]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortAsc ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "salary": return (a.salary - b.salary) * dir;
        case "service": return (a.mlb_service_years - b.mlb_service_years) * dir;
        case "phase": return ((PHASE_ORDER[a.contract_phase] ?? 0) - (PHASE_ORDER[b.contract_phase] ?? 0)) * dir;
        case "level": return (a.current_level - b.current_level) * dir;
        case "name": return a.player_name.localeCompare(b.player_name) * dir;
        default: return 0;
      }
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);

  const levelGroups = useMemo(() => {
    const groups = new Map<number, ContractOverviewPlayer[]>();
    for (const p of sorted) {
      if (!groups.has(p.current_level)) groups.set(p.current_level, []);
      groups.get(p.current_level)!.push(p);
    }
    return [...groups.entries()].sort(([a], [b]) => b - a);
  }, [sorted]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortAsc ? " \u25B2" : " \u25BC";
  };

  return (
    <div className="space-y-4">
      {/* Phase Summary Bar */}
      <div className="flex flex-wrap gap-2">
        {(["minor", "pre_arb", "arb_eligible", "fa_eligible"] as const).map((phase) => {
          const config = PHASE_CONFIG[phase];
          const count = phaseCounts[phase] ?? 0;
          if (!config) return null;
          return (
            <button
              key={phase}
              onClick={() => setFilterPhase(filterPhase === phase ? "all" : phase)}
              className={`px-2.5 py-1 text-xs rounded-full transition-opacity ${config.classes} ${
                filterPhase !== "all" && filterPhase !== phase ? "opacity-40" : ""
              }`}
            >
              {count} {config.label}
            </button>
          );
        })}
        <button
          onClick={() => setFilterPhase(filterPhase === "expiring" ? "all" : "expiring")}
          className={`px-2.5 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 transition-opacity ${
            filterPhase !== "all" && filterPhase !== "expiring" ? "opacity-40" : ""
          }`}
        >
          {phaseCounts.expiring ?? 0} Expiring
        </button>
        {(phaseCounts.under_contract ?? 0) > 0 && (
          <button
            onClick={() => setFilterPhase(filterPhase === "under_contract" ? "all" : "under_contract")}
            className={`px-2.5 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 transition-opacity ${
              filterPhase !== "all" && filterPhase !== "under_contract" ? "opacity-40" : ""
            }`}
          >
            {phaseCounts.under_contract} Under Contract
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Text variant="small" classes="text-gray-500 dark:text-gray-400">Level:</Text>
        {(["all", "mlb", "minor"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterLevel(opt)}
            className={`px-2 py-0.5 text-xs rounded ${
              filterLevel === opt
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {opt === "all" ? "All" : opt === "mlb" ? "MLB" : "Minor Leagues"}
          </button>
        ))}
      </div>

      {/* Roster Table */}
      <Border classes="p-4">
        <Text variant="h5" classes="mb-3 font-semibold">
          Roster Contracts
        </Text>
        <div className="baseball-table-wrapper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <RosterSortHeader label="Player" sortKey="name" currentKey={sortKey} icon={sortIcon("name")} onClick={handleSort} />
                <th className="px-2 py-2 text-center w-14">Pos</th>
                <RosterSortHeader label="Level" sortKey="level" currentKey={sortKey} icon={sortIcon("level")} onClick={handleSort} center />
                <RosterSortHeader label="Phase" sortKey="phase" currentKey={sortKey} icon={sortIcon("phase")} onClick={handleSort} center />
                <RosterSortHeader label="SVC Yrs" sortKey="service" currentKey={sortKey} icon={sortIcon("service")} onClick={handleSort} center />
                <th className="px-2 py-2 text-center w-16">To Arb</th>
                <th className="px-2 py-2 text-center w-16">To FA</th>
                <RosterSortHeader label="Salary" sortKey="salary" currentKey={sortKey} icon={sortIcon("salary")} onClick={handleSort} right />
                <th className="px-2 py-2 text-center w-20">Contract</th>
                <th className="px-2 py-2 text-left w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {levelGroups.map(([level, groupPlayers]) => (
                <RosterLevelSection
                  key={level}
                  level={level}
                  players={groupPlayers}
                />
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    No players match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Border>
    </div>
  );
};

// --- Roster Sort Header ---

const RosterSortHeader = ({
  label,
  sortKey,
  currentKey,
  icon,
  onClick,
  center,
  right,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  icon: string;
  onClick: (key: SortKey) => void;
  center?: boolean;
  right?: boolean;
}) => (
  <th
    className={`px-2 py-2 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 ${
      center ? "text-center" : right ? "text-right" : "text-left"
    } ${currentKey === sortKey ? "text-blue-600 dark:text-blue-400" : ""}`}
    onClick={() => onClick(sortKey)}
  >
    {label}{icon}
  </th>
);

// --- Roster Level Section ---

const RosterLevelSection = ({
  level,
  players,
}: {
  level: number;
  players: ContractOverviewPlayer[];
}) => (
  <>
    <tr>
      <td
        colSpan={10}
        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 font-semibold text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300"
      >
        {LEVEL_NAMES[level] ?? `Level ${level}`}
      </td>
    </tr>
    {players.map((p) => (
      <RosterPlayerRow key={p.contract_id} player={p} />
    ))}
  </>
);

// --- Roster Player Row ---

const RosterPlayerRow = ({ player }: { player: ContractOverviewPlayer }) => {
  const phase = PHASE_CONFIG[player.contract_phase];

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-medium whitespace-nowrap">{player.player_name}</span>
          {player.on_ir && (
            <span className="px-1 py-0.5 text-[10px] rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
              IR
            </span>
          )}
        </div>
      </td>
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.position}
      </td>
      <td className="px-2 py-1.5 text-center text-xs">
        {LEVEL_NAMES[player.current_level] ?? player.current_level}
      </td>
      <td className="px-2 py-1.5 text-center">
        {phase && (
          <span className={`px-1.5 py-0.5 text-xs rounded whitespace-nowrap ${phase.classes}`}>
            {phase.label}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center">
        {player.mlb_service_years}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.years_to_arb != null ? player.years_to_arb : "—"}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.years_to_fa != null ? player.years_to_fa : "—"}
      </td>
      <td className="px-2 py-1.5 text-right font-medium">
        {formatMoney(player.salary)}
      </td>
      <td className="px-2 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        Yr {player.current_year} of {player.years}
        {player.years_remaining <= 1 && (
          <span className="ml-1 text-amber-600 dark:text-amber-400">!</span>
        )}
      </td>
      <td className="px-2 py-1.5">
        <ExpiringStatus player={player} />
      </td>
    </tr>
  );
};

// --- Expiring Status Badge ---

const ExpiringStatus = ({ player }: { player: ContractOverviewPlayer }) => {
  if (player.is_expiring) {
    if (player.contract_phase === "minor" || player.contract_phase === "pre_arb") {
      return (
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          Auto-renew
        </span>
      );
    }
    if (player.contract_phase === "arb_eligible") {
      return (
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Arb eligible
        </span>
      );
    }
    if (player.contract_phase === "fa_eligible") {
      return (
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Will become FA
        </span>
      );
    }
  }

  if (player.contract_phase === "fa_eligible") {
    return (
      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        Under contract
      </span>
    );
  }

  return null;
};

// --- Helpers ---

function getPlayerYearSalary(p: PayrollProjectionPlayer, year: number): number {
  const entry = p.salary_schedule.find((s) => s.league_year === year);
  return entry?.team_owes ?? 0;
}

function getProjectedSalary(p: PayrollProjectionPlayer, year: number): number {
  const entry = p.salary_schedule.find((s) => s.league_year === year);
  if (entry) return entry.team_owes;

  const lastYear = p.salary_schedule.length > 0
    ? Math.max(...p.salary_schedule.map((s) => s.league_year))
    : year - 1;
  if (year <= lastYear) return 0;

  switch (p.contract_phase) {
    case "minor": return MINOR_SALARY;
    case "pre_arb": return PRE_ARB_SALARY;
    case "arb_eligible": return ARB_ESTIMATED_SALARY;
    default: return 0;
  }
}

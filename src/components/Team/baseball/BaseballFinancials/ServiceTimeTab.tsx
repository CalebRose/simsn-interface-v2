import { useState, useEffect, useMemo } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import { ContractOverviewPlayer } from "../../../../models/baseball/baseballModels";
import {
  formatMoney,
  PHASE_CONFIG,
  LEVEL_NAMES,
} from "./financialConstants";

interface ServiceTimeTabProps {
  orgId: number;
}

type SortKey = "salary" | "service" | "phase" | "level" | "name";
type FilterLevel = "all" | "mlb" | "minor";
type FilterPhase = "all" | "minor" | "pre_arb" | "arb_eligible" | "fa_eligible" | "expiring" | "under_contract";

const PHASE_ORDER: Record<string, number> = {
  minor: 0,
  pre_arb: 1,
  arb_eligible: 2,
  fa_eligible: 3,
};

export const ServiceTimeTab = ({ orgId }: ServiceTimeTabProps) => {
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
        if (!cancelled) setError("Service time data is not available yet.");
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
        Loading service time data...
      </Text>
    );
  }

  if (error || !data) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
          {error ?? "No service time data available."}
        </Text>
      </Border>
    );
  }

  return <ServiceTimeView players={data} />;
};

// --- Main View ---

const ServiceTimeView = ({ players }: { players: ContractOverviewPlayer[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>("level");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [filterPhase, setFilterPhase] = useState<FilterPhase>("all");

  // Phase summary counts
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

  // Filter
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

  // Sort
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

  // Group by level
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
          Service Time Overview
        </Text>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <SortHeader label="Player" sortKey="name" currentKey={sortKey} icon={sortIcon("name")} onClick={handleSort} />
                <th className="px-2 py-2 text-center w-14">Pos</th>
                <SortHeader label="Level" sortKey="level" currentKey={sortKey} icon={sortIcon("level")} onClick={handleSort} center />
                <SortHeader label="Phase" sortKey="phase" currentKey={sortKey} icon={sortIcon("phase")} onClick={handleSort} center />
                <SortHeader label="SVC Yrs" sortKey="service" currentKey={sortKey} icon={sortIcon("service")} onClick={handleSort} center />
                <th className="px-2 py-2 text-center w-16">To Arb</th>
                <th className="px-2 py-2 text-center w-16">To FA</th>
                <SortHeader label="Salary" sortKey="salary" currentKey={sortKey} icon={sortIcon("salary")} onClick={handleSort} right />
                <th className="px-2 py-2 text-center w-20">Contract</th>
                <th className="px-2 py-2 text-left w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {levelGroups.map(([level, groupPlayers]) => (
                <LevelSection
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

// --- Sort Header ---

const SortHeader = ({
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

// --- Level Section ---

const LevelSection = ({
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
      <PlayerRow key={p.contract_id} player={p} />
    ))}
  </>
);

// --- Player Row ---

const PlayerRow = ({ player }: { player: ContractOverviewPlayer }) => {
  const phase = PHASE_CONFIG[player.contract_phase];

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      {/* Name */}
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
      {/* Position */}
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.position}
      </td>
      {/* Level */}
      <td className="px-2 py-1.5 text-center text-xs">
        {LEVEL_NAMES[player.current_level] ?? player.current_level}
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
      <td className="px-2 py-1.5 text-center">
        {player.mlb_service_years}
      </td>
      {/* To Arb */}
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.years_to_arb != null ? player.years_to_arb : "—"}
      </td>
      {/* To FA */}
      <td className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">
        {player.years_to_fa != null ? player.years_to_fa : "—"}
      </td>
      {/* Salary */}
      <td className="px-2 py-1.5 text-right font-medium">
        {formatMoney(player.salary)}
      </td>
      {/* Contract */}
      <td className="px-2 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        Yr {player.current_year} of {player.years}
        {player.years_remaining <= 1 && (
          <span className="ml-1 text-amber-600 dark:text-amber-400">!</span>
        )}
      </td>
      {/* Status */}
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

  // Non-expiring FA-eligible player — still under contract
  if (player.contract_phase === "fa_eligible") {
    return (
      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        Under contract
      </span>
    );
  }

  return null;
};

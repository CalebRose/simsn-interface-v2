import { useState, useEffect, useMemo } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { BaseballService } from "../../../../_services/baseballService";
import { LedgerEntry } from "../../../../models/baseball/baseballModels";
import { formatMoney, signedMoney, ENTRY_TYPE_LABELS } from "./financialConstants";
import "../baseballMobile.css";

interface LedgerTabProps {
  orgAbbrev: string;
  leagueYear: number;
}

const ALL_TYPES_VALUE = "__all__";

const entryTypeOptions: SelectOption[] = [
  { value: ALL_TYPES_VALUE, label: "All Types" },
  ...Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export const LedgerTab = ({ orgAbbrev, leagueYear }: LedgerTabProps) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(ALL_TYPES_VALUE);

  const entryType = selectedType === ALL_TYPES_VALUE ? undefined : selectedType;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await BaseballService.GetLedgerEntries(orgAbbrev, leagueYear, entryType);
        if (!cancelled) setEntries(res.entries);
      } catch {
        if (!cancelled) setError("Ledger data is not available yet.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orgAbbrev, leagueYear, entryType]);

  const selectedOption = useMemo(
    () => entryTypeOptions.find((o) => o.value === selectedType) ?? null,
    [selectedType],
  );

  // Summary totals
  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const e of entries) {
      if (e.amount >= 0) income += e.amount;
      else expenses += Math.abs(e.amount);
    }
    return { income, expenses, net: income - expenses };
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Filter + summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-full sm:min-w-[200px] sm:max-w-[280px]">
          <SelectDropdown
            options={entryTypeOptions}
            value={selectedOption}
            onChange={(opt) => {
              if (opt) setSelectedType((opt as SelectOption).value);
            }}
            isSearchable={false}
            placeholder="Filter by type..."
          />
        </div>
        {!isLoading && !error && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">
              Income: {formatMoney(totals.income)}
            </span>
            <span className="text-red-600 dark:text-red-400 font-medium">
              Expenses: {formatMoney(totals.expenses)}
            </span>
            <span className={`font-semibold ${totals.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              Net: {signedMoney(totals.net)}
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <Text variant="body-small" classes="text-gray-400 py-4">
          Loading ledger entries...
        </Text>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Border classes="p-4">
          <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
            {error}
          </Text>
        </Border>
      )}

      {/* Entries table */}
      {!isLoading && !error && (
        <Border classes="p-4">
          <Text variant="h5" classes="mb-3 font-semibold">
            Transactions ({entries.length})
          </Text>
          {entries.length === 0 ? (
            <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
              No ledger entries found.
            </Text>
          ) : (
            <div className="baseball-table-wrapper overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Week</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <LedgerRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      )}
    </div>
  );
};

// --- Entry Type Badge ---

const TYPE_BADGE_COLORS: Record<string, string> = {
  media:             "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  salary:            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  performance:       "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  bonus:             "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  buyout:            "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  interest_income:   "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  interest_expense:  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  playoff_gate:      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  playoff_media:     "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
};

const LedgerRow = ({ entry }: { entry: LedgerEntry }) => {
  const typeLabel = ENTRY_TYPE_LABELS[entry.entry_type] ?? entry.entry_type;
  const badgeColor = TYPE_BADGE_COLORS[entry.entry_type] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  const isPositive = entry.amount >= 0;

  return (
    <tr className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-3 py-1.5 font-medium">
        {entry.week_index != null ? `Week ${entry.week_index}` : "Year-level"}
      </td>
      <td className="px-3 py-1.5">
        <span className={`px-1.5 py-0.5 text-xs rounded whitespace-nowrap ${badgeColor}`}>
          {typeLabel}
        </span>
      </td>
      <td className={`px-3 py-1.5 text-right font-semibold ${
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}>
        {signedMoney(entry.amount)}
      </td>
      <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
        {formatDate(entry.created_at)}
      </td>
    </tr>
  );
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import {
  OrgFinancialSummaryResponse,
  FinancialWeek,
} from "../../../../models/baseball/baseballModels";
import { useAuthStore } from "../../../../context/AuthContext";
import { formatMoney, signedMoney } from "./financialConstants";
import "../baseballMobile.css";

interface OverviewTabProps {
  orgAbbrev: string;
  leagueYear: number;
}

export const OverviewTab = ({ orgAbbrev, leagueYear }: OverviewTabProps) => {
  const [data, setData] = useState<OrgFinancialSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await BaseballService.GetOrgFinancialSummary(orgAbbrev, leagueYear);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError("Financial summary data is not available yet.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orgAbbrev, leagueYear]);

  if (isLoading) {
    return (
      <Text variant="body-small" classes="text-gray-400 py-4">
        Loading financial summary...
      </Text>
    );
  }

  if (error || !data) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
          {error ?? "No financial data available."}
        </Text>
      </Border>
    );
  }

  return (
    <div className="space-y-2">
      <SeasonPnLSection data={data} />
      <CumulativeBalanceChart weeks={data.weeks} />
      <WeeklyCashflowSection weeks={data.weeks} />
    </div>
  );
};

// --- Season P&L Summary ---

const SeasonPnLSection = ({ data }: { data: OrgFinancialSummaryResponse }) => {
  const netChange = data.ending_balance - data.starting_balance;
  const yearStartEntries = data.year_start_events
    ? Object.entries(data.year_start_events)
    : [];
  const interestEntries = data.interest_events
    ? Object.entries(data.interest_events)
    : [];

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Season Profit & Loss
      </Text>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Starting Balance"
          value={formatMoney(data.starting_balance)}
        />
        <SummaryCard
          label="Season Revenue"
          value={signedMoney(data.season_revenue)}
          color="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          label="Season Expenses"
          value={`-${formatMoney(data.season_expenses)}`}
          color="text-red-600 dark:text-red-400"
        />
        {yearStartEntries.map(([name, amount]) => (
          <SummaryCard
            key={name}
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            value={signedMoney(amount)}
            color={amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
          />
        ))}
        {interestEntries.map(([name, amount]) => (
          <SummaryCard
            key={name}
            label={name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            value={signedMoney(amount)}
            color={amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
          />
        ))}
        <SummaryCard
          label="Ending Balance"
          value={formatMoney(data.ending_balance)}
          bold
        />
        <SummaryCard
          label="Net Change"
          value={signedMoney(netChange)}
          color={
            netChange >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
          bold
        />
      </div>
    </Border>
  );
};

const SummaryCard = ({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) => (
  <div className="p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
    <Text variant="small" classes="text-gray-500 dark:text-gray-400">
      {label}
    </Text>
    <Text
      variant="body"
      classes={`${bold ? "font-bold" : "font-semibold"} ${color ?? ""}`}
    >
      {value}
    </Text>
  </div>
);

// --- Cumulative Balance Line Chart ---

const CumulativeBalanceChart = ({ weeks }: { weeks: FinancialWeek[] }) => {
  const { isDarkMode } = useAuthStore();

  if (!weeks || weeks.length === 0) return null;

  // Find the last week with any activity, only chart up through that point
  let lastPlayedIdx = -1;
  for (let i = weeks.length - 1; i >= 0; i--) {
    const w = weeks[i];
    if (w.salary_out !== 0 || w.performance_in !== 0 || w.other_in !== 0 || w.other_out !== 0 || w.net !== 0) {
      lastPlayedIdx = i;
      break;
    }
  }
  if (lastPlayedIdx < 0) return null;

  const chartData = weeks.slice(0, lastPlayedIdx + 1).map((w) => ({
    week: w.week_index,
    balance: w.cumulative_balance,
  }));

  const gridColor = isDarkMode ? "#374151" : "#e5e7eb";
  const textColor = isDarkMode ? "#9ca3af" : "#6b7280";
  const lineColor = "#10b981";

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Cumulative Balance
      </Text>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="week"
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              label={{ value: "Week", position: "insideBottom", offset: -2, fill: textColor, fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`}
            />
            <Tooltip
              formatter={(value) => [formatMoney(value as number), "Balance"]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                border: `1px solid ${gridColor}`,
                borderRadius: 8,
                color: isDarkMode ? "#e5e7eb" : "#111827",
              }}
            />
            <ReferenceLine y={0} stroke={isDarkMode ? "#4b5563" : "#d1d5db"} strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Border>
  );
};

// --- Weekly Cashflow Table ---

const WeeklyCashflowSection = ({ weeks }: { weeks: FinancialWeek[] }) => {
  if (!weeks || weeks.length === 0) return null;

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Weekly Cashflow
      </Text>
      <div className="baseball-table-wrapper overflow-x-auto max-h-[50vh] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Week</th>
              <th className="px-3 py-2 text-right">Salary Out</th>
              <th className="px-3 py-2 text-right">Performance In</th>
              <th className="px-3 py-2 text-right">Other In</th>
              <th className="px-3 py-2 text-right">Other Out</th>
              <th className="px-3 py-2 text-right">Net</th>
              <th className="px-3 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr
                key={w.week_index}
                className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-3 py-1.5 font-medium">{w.week_index}</td>
                <td className="px-3 py-1.5 text-right text-red-600 dark:text-red-400">
                  {w.salary_out > 0 ? `-${formatMoney(w.salary_out)}` : "—"}
                </td>
                <td className="px-3 py-1.5 text-right text-green-600 dark:text-green-400">
                  {w.performance_in > 0
                    ? `+${formatMoney(w.performance_in)}`
                    : "—"}
                </td>
                <td className="px-3 py-1.5 text-right text-green-600 dark:text-green-400">
                  {w.other_in > 0 ? `+${formatMoney(w.other_in)}` : "—"}
                </td>
                <td className="px-3 py-1.5 text-right text-red-600 dark:text-red-400">
                  {w.other_out > 0 ? `-${formatMoney(w.other_out)}` : "—"}
                </td>
                <td
                  className={`px-3 py-1.5 text-right font-semibold ${
                    w.net >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {signedMoney(w.net)}
                </td>
                <td className="px-3 py-1.5 text-right font-medium">
                  {formatMoney(w.cumulative_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Border>
  );
};

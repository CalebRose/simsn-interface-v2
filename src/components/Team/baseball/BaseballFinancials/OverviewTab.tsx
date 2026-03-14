import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import {
  BaseballFinancials,
  FinancialSummary,
  FinancialObligations,
  FinancialWeek,
  ObligationItem,
} from "../../../../models/baseball/baseballModels";
import { formatMoney, signedMoney } from "./financialConstants";

interface OverviewTabProps {
  financials: BaseballFinancials;
}

export const OverviewTab = ({ financials }: OverviewTabProps) => (
  <div className="space-y-2">
    <SeasonPnLSection summary={financials.summary} />
    <WeeklyCashflowSection weeks={financials.summary.weeks} />
    <ObligationsSection obligations={financials.obligations} />
    <FutureCommitmentsSection futureObligations={financials.future_obligations} />
  </div>
);

// --- Season P&L Summary ---

const SeasonPnLSection = ({ summary }: { summary: FinancialSummary }) => {
  const netChange = summary.ending_balance - summary.starting_balance;
  const yearStartEntries = summary.year_start_events
    ? Object.entries(summary.year_start_events)
    : [];
  const interestEntries = summary.interest_events
    ? Object.entries(summary.interest_events)
    : [];

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Season Profit & Loss
      </Text>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Starting Balance"
          value={formatMoney(summary.starting_balance)}
        />
        <SummaryCard
          label="Season Revenue"
          value={signedMoney(summary.season_revenue)}
          color="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          label="Season Expenses"
          value={`-${formatMoney(summary.season_expenses)}`}
          color="text-red-600 dark:text-red-400"
        />
        {yearStartEntries.map(([name, amount]) => (
          <SummaryCard
            key={name}
            label={name}
            value={signedMoney(amount)}
            color={amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
          />
        ))}
        {interestEntries.map(([name, amount]) => (
          <SummaryCard
            key={name}
            label={name}
            value={signedMoney(amount)}
            color={amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
          />
        ))}
        <SummaryCard
          label="Ending Balance"
          value={formatMoney(summary.ending_balance)}
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

// --- Weekly Cashflow Table ---

const WeeklyCashflowSection = ({ weeks }: { weeks: FinancialWeek[] }) => {
  if (!weeks || weeks.length === 0) return null;

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Weekly Cashflow
      </Text>
      <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
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

// --- Current Year Obligations ---

const ObligationsSection = ({
  obligations,
}: {
  obligations: FinancialObligations;
}) => {
  const { totals, items } = obligations;

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        {obligations.league_year} Obligations
      </Text>

      {/* Totals bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <TotalCard label="Active Salary" amount={totals.active_salary} />
        <TotalCard label="Inactive Salary" amount={totals.inactive_salary} />
        <TotalCard label="Buyouts" amount={totals.buyout} />
        <TotalCard label="Signing Bonus" amount={totals.signing_bonus} />
        <TotalCard label="Overall" amount={totals.overall} bold />
      </div>

      {/* Detail table */}
      {items && items.length > 0 && (
        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Year</th>
                <th className="px-3 py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: ObligationItem, idx: number) => (
                <tr
                  key={idx}
                  className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-3 py-1.5 font-medium whitespace-nowrap">
                    {item.player.firstname} {item.player.lastname}
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded ${
                        item.type === "salary"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                    {item.category}
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold">
                    {formatMoney(item.amount)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400">
                    {item.year_index != null ? `Yr ${item.year_index + 1}` : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400">
                    {item.salary_share != null
                      ? `${(item.salary_share * 100).toFixed(0)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Border>
  );
};

const TotalCard = ({
  label,
  amount,
  bold,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) => (
  <div
    className={`p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-800 ${
      bold ? "border-blue-500 dark:border-blue-400" : ""
    }`}
  >
    <Text variant="small" classes="text-gray-500 dark:text-gray-400">
      {label}
    </Text>
    <Text
      variant="body"
      classes={bold ? "font-bold" : "font-semibold"}
    >
      {formatMoney(amount)}
    </Text>
  </div>
);

// --- Future Commitments ---

const FutureCommitmentsSection = ({
  futureObligations,
}: {
  futureObligations: Record<string, number>;
}) => {
  const entries = futureObligations
    ? Object.entries(futureObligations).sort(([a], [b]) => a.localeCompare(b))
    : [];

  if (entries.length === 0) return null;

  return (
    <Border classes="p-4">
      <Text variant="h5" classes="mb-3 font-semibold">
        Future Commitments
      </Text>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2 text-right">Total Committed</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([year, amount]) => (
              <tr
                key={year}
                className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-3 py-1.5 font-medium">{year}</td>
                <td className="px-3 py-1.5 text-right font-semibold">
                  {formatMoney(amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Border>
  );
};

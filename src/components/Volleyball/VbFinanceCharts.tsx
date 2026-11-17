import { FC, ReactElement, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SportButton } from "../Common/SportKit";
import { SportSegmented, SportSelect } from "../Common/SportKit";
import { useAuthStore } from "../../context/AuthContext";
import {
  VbLeagueFinanceSeason,
  VbLeagueKind,
  VbMoneyStat,
  VolleyballFinanceService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  VbLoad,
  vbNum,
  VbPanel,
  vbRowClass,
  vbTableClass,
} from "./VbCommon";
import { vbLabel, vbMoney, vbShare } from "./vbFormatting";

// Money over time, from the API's history routes: a team's every season in
// one response, and the league's (or a conference's) total, mean and median.

/** One point on a chart. `x` is the season or the step's label. */
type Row = { x: string | number } & Record<string, number | string>;

interface Series {
  key: string;
  label: string;
  color: string;
}

// A category keeps one colour on every chart. Keys carry "r:" (raised) or
// "s:" (spent), since both sides have an "Other".
const raised: Record<VbLeagueKind, Series[]> = {
  college: [
    { key: "r:MajorGifts", label: "Major gifts", color: "#3b82f6" },
    { key: "r:GateAndSmallDollar", label: "Gate and small donations", color: "#10b981" },
    { key: "r:MediaPayout", label: "Media payout", color: "#f59e0b" },
    { key: "r:InstitutionalBase", label: "Institutional base", color: "#8b5cf6" },
    { key: "r:Other", label: "Other", color: "#9ca3af" },
  ],
  pro: [
    { key: "r:LeagueShare", label: "League share", color: "#3b82f6" },
    { key: "r:Other", label: "Other", color: "#9ca3af" },
  ],
};
const spent: Record<VbLeagueKind, Series[]> = {
  college: [
    { key: "s:NIL", label: "NIL", color: "#ef4444" },
    { key: "s:Payroll", label: "Staff payroll", color: "#f59e0b" },
    { key: "s:FacilitiesTraining", label: "Training facility", color: "#3b82f6" },
    { key: "s:FacilitiesArena", label: "Arena", color: "#10b981" },
    { key: "s:FacilitiesRecruiting", label: "Recruiting facility", color: "#8b5cf6" },
    { key: "s:Other", label: "Other", color: "#9ca3af" },
  ],
  pro: [
    { key: "s:PlayerSalaries", label: "Player salaries", color: "#ef4444" },
    { key: "s:StaffSalaries", label: "Staff salaries", color: "#f59e0b" },
    { key: "s:Other", label: "Other", color: "#9ca3af" },
  ],
};
const flow: Series[] = [
  { key: "Raised", label: "Raised", color: "#10b981" },
  { key: "Spent", label: "Spent", color: "#ef4444" },
  { key: "EndCash", label: "Cash at season's end", color: "#3b82f6" },
];

/** A season's categories as one chart row. */
const moneyRow = (
  x: string | number,
  revenue: Record<string, number>,
  spending: Record<string, number>,
  extra: Record<string, number> = {},
): Row => {
  const row: Row = { x, Raised: revenue.Total ?? 0, Spent: spending.Total ?? 0 };
  Object.entries(revenue).forEach(([key, value]) => {
    if (key !== "Total") row[`r:${key}`] = value;
  });
  Object.entries(spending).forEach(([key, value]) => {
    if (key !== "Total") row[`s:${key}`] = value;
  });
  return { ...row, ...extra };
};

/** Only the series that have any money in them: an all-zero "Other" is noise. */
const used = (rows: Row[], series: Series[]) =>
  series.filter((item) => rows.some((row) => Number(row[item.key] ?? 0) !== 0));

const short = (value: number) =>
  Math.abs(value) >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(1)}M`
    : Math.abs(value) >= 1_000
      ? `$${Math.round(value / 1_000)}K`
      : `$${Math.round(value)}`;

const Chart: FC<{
  title: string;
  rows: Row[];
  series: Series[];
  kind: "stacked" | "lines";
  /** What the bottom axis counts in, for the tooltip. */
  unit?: string;
  format?: (value: number) => string;
  note?: string;
  /** The top of the scale, when it must match another chart's. */
  yMax?: number;
}> = ({ title, rows, series, kind, unit = "season", format, note, yMax }) => {
  const { isDarkMode } = useAuthStore();
  const text = isDarkMode ? "#d1d5db" : "#524e45";
  const grid = isDarkMode ? "#6b7280" : "#ccc8b8";
  const axis = {
    tick: { fill: text, fontSize: 12 },
    tickLine: { stroke: grid },
    axisLine: { stroke: grid },
  };
  const shown = used(rows, series);
  const shared: ReactElement = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
      <XAxis dataKey="x" {...axis} />
      <YAxis
        {...axis}
        tickFormatter={format ?? short}
        width={64}
        domain={yMax ? [0, yMax] : undefined}
        allowDataOverflow={false}
      />
      <Tooltip
        formatter={(value, name) => [
          format ? format(Number(value)) : vbMoney(Math.round(Number(value))),
          name,
        ]}
        labelFormatter={(label) =>
          unit === "season" ? `${label} season` : String(label)
        }
        contentStyle={{
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          border: `1px solid ${grid}`,
          borderRadius: 8,
          color: isDarkMode ? "#e5e7eb" : "#111827",
        }}
      />
      <Legend wrapperStyle={{ fontSize: 12, color: text }} />
    </>
  );
  return (
    <VbPanel title={title}>
      <div className="p-2" style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          {kind === "stacked" ? (
            <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {shared}
              {shown.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  stackId="money"
                  fill={item.color}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {shared}
              {shown.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={rows.length > 20 ? false : { r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {note && (
        <div className="px-3 pb-2 text-left text-xs text-(--text-muted)">
          {note}
        </div>
      )}
    </VbPanel>
  );
};

/** A round number at or above `value`, so two charts can share one scale. */
const niceMax = (value: number) => {
  if (value <= 0) return 1;
  const unit = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  return (steps.find((step) => step * unit >= value) ?? 10) * unit;
};

/** The largest season total, raised or spent: the top of both stacked charts. */
const sharedMax = (rows: Row[]) =>
  niceMax(
    Math.max(
      0,
      ...rows.flatMap((row) => [Number(row.Raised ?? 0), Number(row.Spent ?? 0)]),
    ),
  );

/**
 * What a program's supporters gave back, step by step: arena fill and donor
 * conversion with the gifts and gate each step produced. The latest season
 * shows first; the rest open on request.
 */
export const VbSupportersReport: FC<{ teamId: number }> = ({ teamId }) => {
  const report = useVbResource(`finance-supporters:${teamId}`, () =>
    VolleyballFinanceService.getSupporters(teamId),
  );
  const [open, setOpen] = useState(false);
  const steps = [...(report.data?.Steps ?? [])].sort(
    (a, b) => b.Season - a.Season || b.Step - a.Step,
  );
  const latest = steps[0]?.Season;
  const shown = open ? steps : steps.filter((step) => step.Season === latest);
  const bySeason = new Map<number, { gifts: number; gate: number }>();
  steps.forEach((step) => {
    const sum = bySeason.get(step.Season) ?? { gifts: 0, gate: 0 };
    sum.gifts += step.Gifts;
    sum.gate += step.Gate;
    bySeason.set(step.Season, sum);
  });
  const season = latest !== undefined ? bySeason.get(latest) : undefined;

  return (
    <VbPanel title="Supporters">
      <VbLoad loading={report.loading} error={report.error} rows={4}>
        {steps.length ? (
          <>
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
              {(
                [
                  ["Arena fill", vbShare(steps[0].Fill)],
                  ["Donor conversion", vbShare(steps[0].Conversion)],
                  [`Gifts in ${latest}`, vbMoney(Math.round(season?.gifts ?? 0))],
                  [`Gate in ${latest}`, vbMoney(Math.round(season?.gate ?? 0))],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-(--sport-surface-2) p-2 text-left"
                >
                  <div className="text-xs uppercase text-(--text-muted)">
                    {label}
                  </div>
                  <div className="text-lg font-bold tabular-nums">{value}</div>
                </div>
              ))}
            </div>
            <table data-keep-table className={`${vbTableClass} min-w-[760px]`}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>Season</th>
                  <th className={`${vbCell} text-right`}>Step</th>
                  <th className={`${vbCell} text-right`}>Arena fill</th>
                  <th className={`${vbCell} text-right`}>Donor conversion</th>
                  <th className={`${vbCell} text-right`}>Gifts</th>
                  <th className={`${vbCell} text-right`}>Gate</th>
                  <th className={vbCell}>What changed</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((step) => (
                  <tr key={`${step.Season}:${step.Step}`} className={vbRowClass}>
                    <td className={vbCell}>{step.Season}</td>
                    <td className={vbNum}>{step.Step}</td>
                    <td className={vbNum}>{vbShare(step.Fill)}</td>
                    <td className={vbNum}>{vbShare(step.Conversion)}</td>
                    <td className={vbNum}>{vbMoney(Math.round(step.Gifts))}</td>
                    <td className={vbNum}>{vbMoney(Math.round(step.Gate))}</td>
                    <td className="px-2 py-1.5 text-left text-(--text-muted)">
                      {step.Explanation ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-3 py-2 text-xs text-(--text-muted)">
              <span>
                Gifts are credited at each step; gate is what was earned since
                the step before.
              </span>
              {bySeason.size > 1 && (
                <SportButton
                  size="xs"
                  variant="secondary"
                  onClick={() => setOpen(!open)}
                >
                  {open ? `Show ${latest} only` : `Show all ${bySeason.size} seasons`}
                </SportButton>
              )}
            </div>
          </>
        ) : (
          <VbEmpty>No supporter history is on record yet.</VbEmpty>
        )}
      </VbLoad>
    </VbPanel>
  );
};

const TooLittle: FC = () => (
  <VbPanel>
    <VbEmpty>No finished season has books to chart yet.</VbEmpty>
  </VbPanel>
);

/** A team's money by season, its league ranks, and one season step by step. */
export const VbTeamFinanceTrends: FC<{ kind: VbLeagueKind; teamId: number }> = ({
  kind,
  teamId,
}) => {
  const pro = kind === "pro";
  const history = useVbResource(`finance-history:${teamId}`, () =>
    VolleyballFinanceService.getHistory(teamId),
  );
  // A season with no money moved has not been played: leave it off.
  const seasons = (history.data?.Seasons ?? [])
    .filter((season) => season.Revenue.Total > 0 || season.Spending.Total > 0)
    .sort((a, b) => a.Season - b.Season);
  const [pickedSeason, setPickedSeason] = useState<number | null>(null);
  const stepSeason = pickedSeason ?? seasons[seasons.length - 1]?.Season ?? null;
  const steps = useVbResource(
    stepSeason ? `finance-steps:${teamId}:${stepSeason}` : null,
    () => VolleyballFinanceService.getSteps(teamId, stepSeason!),
  );

  const rows = seasons.map((season) =>
    moneyRow(season.Season, season.Revenue, season.Spending, {
      EndCash: season.EndCash,
      PayrollBudget: season.PayrollBudget ?? 0,
      Fill: season.Supporters?.Fill ?? 0,
      Conversion: season.Supporters?.Conversion ?? 0,
    }),
  );
  const stepRows: Row[] = (steps.data?.Steps ?? []).map((step) => ({
    x: step.Label,
    Balance: step.Balance,
    Raised: step.Revenue.Total ?? 0,
    Spent: step.Spending.Total ?? 0,
  }));
  const rankKeys = seasons.length ? Object.keys(seasons[0].Ranks) : [];
  const top = sharedMax(rows);
  const seasonOptions = [...seasons]
    .reverse()
    .map((season) => ({ value: String(season.Season), label: String(season.Season) }));

  return (
    <VbLoad loading={history.loading} error={history.error} rows={8}>
      {seasons.length ? (
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-2">
            <Chart
              title="Money raised by source"
              rows={rows}
              series={raised[kind]}
              kind="stacked"
              yMax={top}
            />
            <Chart
              title="Money spent by category"
              rows={rows}
              series={spent[kind]}
              kind="stacked"
              yMax={top}
            />
            <Chart
              title="Raised, spent and cash"
              rows={rows}
              series={flow}
              kind="lines"
            />
            {pro ? (
              <Chart
                title="Player salaries against the payroll budget"
                rows={rows}
                series={[
                  { key: "s:PlayerSalaries", label: "Player salaries booked", color: "#ef4444" },
                  { key: "PayrollBudget", label: "Payroll budget", color: "#3b82f6" },
                ]}
                kind="lines"
                note="Salaries as booked in each season, against the club's fixed budget for player pay."
              />
            ) : (
              <Chart
                title="Supporters"
                rows={rows}
                series={[
                  { key: "Fill", label: "Arena fill", color: "#10b981" },
                  { key: "Conversion", label: "Donor conversion", color: "#3b82f6" },
                ]}
                kind="lines"
                format={vbShare}
                note="Where each stood at the end of the season."
              />
            )}
          </div>

          <VbPanel title="Place in the league">
            <table data-keep-table className={vbTableClass}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>Season</th>
                  {rankKeys.map((key) => (
                    <th key={key} className={`${vbCell} text-right`}>
                      {key === "EndCash" ? "Cash" : vbLabel(key)}
                    </th>
                  ))}
                  <th className={`${vbCell} text-right`}>Net</th>
                </tr>
              </thead>
              <tbody>
                {[...seasons].reverse().map((season) => (
                  <tr key={season.Season} className={vbRowClass}>
                    <td className={vbCell}>{season.Season}</td>
                    {rankKeys.map((key) => (
                      <td key={key} className={vbNum}>
                        {season.Ranks[key] ?? "—"}
                        <span className="text-(--text-muted)">
                          {" "}
                          of {season.Teams}
                        </span>
                      </td>
                    ))}
                    <td
                      className={`${vbNum} ${season.Net < 0 ? "text-(--accent-error)" : ""}`}
                    >
                      {vbMoney(Math.round(season.Net))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
              1 is the largest in the league that season.
            </div>
          </VbPanel>

          <div className="w-full sm:w-44">
            <SportSelect
              options={seasonOptions}
              value={
                seasonOptions.find(
                  (option) => option.value === String(stepSeason),
                ) ?? null
              }
              onChange={(option) => option && setPickedSeason(Number(option.value))}
            />
          </div>
          <VbLoad loading={steps.loading} error={steps.error} rows={6}>
            {stepRows.length ? (
              <Chart
                title={`Cash through the ${stepSeason} season`}
                rows={stepRows}
                series={[
                  { key: "Balance", label: "Cash", color: "#3b82f6" },
                  { key: "Raised", label: "Raised that step", color: "#10b981" },
                  { key: "Spent", label: "Spent that step", color: "#ef4444" },
                ]}
                kind="lines"
                unit="step"
                note={
                  steps.data
                    ? `Opened the season with ${vbMoney(Math.round(steps.data.OpeningCash))}.`
                    : undefined
                }
              />
            ) : (
              <VbPanel>
                <VbEmpty>No money was booked in {stepSeason}.</VbEmpty>
              </VbPanel>
            )}
          </VbLoad>
        </div>
      ) : (
        <TooLittle />
      )}
    </VbLoad>
  );
};

type Stat = keyof VbMoneyStat;

const stats: Array<[Stat, string]> = [
  ["Mean", "Average team"],
  ["Median", "Middle team"],
  ["Total", "Whole group"],
];

const pick = (values: Record<string, VbMoneyStat>, stat: Stat) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value[stat]]),
  );

/** The league's money by season, or one conference's. */
export const VbLeagueFinanceTrends: FC<{
  kind: VbLeagueKind;
  leagueId: number;
}> = ({ kind, leagueId }) => {
  const college = kind === "college";
  const history = useVbResource(`league-finance-history:${leagueId}`, () =>
    VolleyballFinanceService.getLeagueHistory(leagueId, college),
  );
  const [stat, setStat] = useState<Stat>("Mean");
  const [conferenceId, setConferenceId] = useState<number | null>(null);
  const conferences = history.data?.Conferences ?? [];
  const options = [
    { value: "", label: "Whole league" },
    ...conferences
      .map((conference) => ({
        value: String(conference.ConferenceID),
        label: conference.Name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const source: VbLeagueFinanceSeason[] =
    (conferenceId === null
      ? history.data?.League
      : conferences.find((item) => item.ConferenceID === conferenceId)
          ?.Seasons) ?? [];
  const rows = source
    .filter((season) => season.Revenue.Total?.Total || season.Spending.Total?.Total)
    .sort((a, b) => a.Season - b.Season)
    .map((season) =>
      moneyRow(
        season.Season,
        pick(season.Revenue, stat),
        pick(season.Spending, stat),
        { EndCash: season.EndCash[stat] },
      ),
    );
  const scope = stats.find(([key]) => key === stat)![1].toLowerCase();
  const top = sharedMax(rows);

  return (
    <VbLoad loading={history.loading} error={history.error} rows={8}>
      <div className="space-y-3">
        {/* The picker has a row to itself: a dropdown beside buttons can cover them. */}
        <div className="space-y-2">
          {college && conferences.length > 0 && (
            <div className="w-full sm:w-80">
              <SportSelect
                options={options}
                value={
                  options.find(
                    (option) => option.value === String(conferenceId ?? ""),
                  ) ?? null
                }
                onChange={(option) =>
                  setConferenceId(option?.value ? Number(option.value) : null)
                }
              />
            </div>
          )}
          <SportSegmented
            label="Measure"
            value={stat}
            onChange={setStat}
            options={stats}
          />
        </div>
        {rows.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            <Chart
              title={`Money raised by source · ${scope}`}
              rows={rows}
              series={raised[kind]}
              kind="stacked"
              yMax={top}
            />
            <Chart
              title={`Money spent by category · ${scope}`}
              rows={rows}
              series={spent[kind]}
              kind="stacked"
              yMax={top}
            />
            <div className="xl:col-span-2">
              <Chart
                title={`Raised, spent and cash · ${scope}`}
                rows={rows}
                series={flow}
                kind="lines"
              />
            </div>
          </div>
        ) : (
          <TooLittle />
        )}
      </div>
    </VbLoad>
  );
};

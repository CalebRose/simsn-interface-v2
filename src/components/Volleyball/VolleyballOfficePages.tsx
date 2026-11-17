import { FC, useState } from "react";
import { SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import routes from "../../_constants/routes";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbCarousel,
  VbFinance,
  VbLeague,
  VbLeagueKind,
  VbProFinance,
  VbTeamFinance,
  VolleyballFinanceService,
  VolleyballStaffService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons, useVbTeams } from "./useVbData";
import {
  useVbSort,
  vbCell,
  VbEmpty,
  vbHeadClass,
  VbLoad,
  vbNum,
  VbPanel,
  vbRowClass,
  VbSortHeader,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import { vbLabel, vbMoney, vbShare } from "./vbFormatting";
import { VbChoice } from "./VbManage";
import { VbPageShell } from "./VbPageShell";
import { useVbTeamPicker } from "./VbTeamPicker";
import { VbCoachLink } from "./VbCoachLink";
import {
  VbLeagueFinanceTrends,
  VbSupportersReport,
  VbTeamFinanceTrends,
} from "./VbFinanceCharts";

type Move = VbCarousel["Moves"][number];

const cameFrom = (
  from: Move["From"],
  teamName: (teamId: number) => string,
) => {
  if (!from) return "—";
  if (typeof from === "string") return vbLabel(from);
  return `${teamName(from.TeamID)} (${vbLabel(from.Role).toLowerCase()})`;
};

const CarouselBody: FC<{ league: VbLeague }> = ({ league }) => {
  const { vbTeamsById } = useSimVBStore();
  useVbTeams("college");
  const { seasons } = useVbSeasons("college");
  const [picked, setPicked] = useState<number | null>(null);
  const [type, setType] = useState("all");
  // With no season the API picks: this one in the offseason, else the last.
  const carousel = useVbResource(
    `carousel:${league.LeagueID}:${picked ?? "latest"}`,
    () => VolleyballStaffService.getCarousel(league.LeagueID, picked ?? undefined),
  );
  const season = picked ?? carousel.data?.Season;
  const options = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  const moves = carousel.data?.Moves ?? [];
  const types = ["all", ...new Set(moves.map((move) => move.Type))];
  const shown = moves.filter((move) => type === "all" || move.Type === type);
  const teamName = (teamId: number) =>
    vbTeamsById[teamId]?.Name ?? `Team ${teamId}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full shrink-0 sm:w-44">
          <SportSelect
            options={options}
            value={
              options.find((option) => option.value === String(season)) ?? null
            }
            onChange={(option) => option && setPicked(Number(option.value))}
          />
        </div>
        <VbChoice
          label="Kind of move"
          value={type}
          options={types}
          format={vbLabel}
          onChange={setType}
        />
      </div>
      <VbLoad loading={carousel.loading} error={carousel.error} rows={12}>
        {(carousel.data?.HotSeat.length ?? 0) > 0 && (
          <VbPanel title="Hot seat">
            <table data-keep-table className={vbTableClass}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>Program</th>
                  <th className={vbCell}>Head coach</th>
                  <th className={vbCell}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {carousel.data!.HotSeat.map((seat) => (
                  <tr key={seat.PersonID} className={vbRowClass}>
                    <td className={vbCell}>
                      <VbTeamLink
                        kind="college"
                        teamId={seat.TeamID}
                        name={seat.Team}
                      />
                    </td>
                    <td className={vbCell}>
                      <VbCoachLink personId={seat.PersonID} name={seat.Name} />
                    </td>
                    <td className={vbCell}>{vbLabel(seat.Outcome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </VbPanel>
        )}
        <VbPanel title={`Moves · ${season ?? ""}`}>
          <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Move</th>
                <th className={vbCell}>Coach</th>
                <th className={vbCell}>Program</th>
                <th className={vbCell}>Role</th>
                <th className={`${vbCell} text-right`}>Salary</th>
                <th className={`${vbCell} text-right`}>Years</th>
                <th className={vbCell}>From</th>
                <th className={`${vbCell} text-right`}>Payout</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((move, index) => (
                <tr key={index} className={vbRowClass}>
                  <td className={vbCell}>{vbLabel(move.Type)}</td>
                  <td className={vbCell}>
                    <VbCoachLink personId={move.PersonID} name={move.Name} />
                  </td>
                  <td className={vbCell}>
                    {move.TeamID && move.Team ? (
                      <VbTeamLink
                        kind="college"
                        teamId={move.TeamID}
                        name={move.Team}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={vbCell}>
                    {move.Role ? vbLabel(move.Role) : "—"}
                  </td>
                  <td className={vbNum}>
                    {move.Salary === null ? "—" : vbMoney(move.Salary)}
                  </td>
                  <td className={vbNum}>
                    {move.Years ?? (move.Through ? `thru ${move.Through}` : "—")}
                  </td>
                  <td className={vbCell}>{cameFrom(move.From, teamName)}</td>
                  <td className={vbNum}>
                    {move.Payout === null ? "—" : vbMoney(move.Payout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shown.length && (
            <VbEmpty>No coaching moves on record for {season}.</VbEmpty>
          )}
        </VbPanel>
      </VbLoad>
    </div>
  );
};

export const VolleyballCarouselPage: FC = () => (
  <VbPageShell kind="college" title="Coaching Changes">
    {(league) => <CarouselBody league={league} />}
  </VbPageShell>
);

const Line: FC<{ label: string; value: string; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div
    className={`flex justify-between gap-4 px-3 py-1 text-sm ${strong ? "border-t border-(--sport-divider) font-semibold" : ""}`}
  >
    <span className={strong ? "" : "text-(--text-muted)"}>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const money = (value: number) => vbMoney(Math.round(value));

const TeamFinance: FC<{ finance: VbTeamFinance }> = ({ finance }) => {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <VbPanel title={`Revenue · ${finance.Season} to date`}>
          <Line label="Institutional base" value={money(finance.Revenue.InstitutionalBase)} />
          <Line label="Media payout" value={money(finance.Revenue.MediaPayout)} />
          <Line label="Gate and small donations" value={money(finance.Revenue.GateAndSmallDollar)} />
          <Line label="Major gifts" value={money(finance.Revenue.MajorGifts)} />
          <Line label="Total" value={money(finance.Revenue.Total)} strong />
        </VbPanel>
        <VbPanel title={`Spending · ${finance.Season} to date`}>
          <Line label="Staff payroll" value={money(finance.Spending.Payroll)} />
          <Line label="Training facility" value={money(finance.Spending.Facilities.Training)} />
          <Line label="Arena" value={money(finance.Spending.Facilities.Arena)} />
          <Line label="Recruiting facility" value={money(finance.Spending.Facilities.Recruiting)} />
          <Line label="NIL (all players)" value={money(finance.Spending.NIL)} />
          <Line label="Total" value={money(finance.Spending.Total)} strong />
        </VbPanel>
        <VbPanel title="Position">
          <Line label="Cash" value={money(finance.Cash)} />
          <Line label="Projected revenue next year" value={money(finance.NextYear.ProjectedRevenue)} />
          <Line label="of which major gifts" value={money(finance.NextYear.MajorGifts)} />
          <Line label="of which gate" value={money(finance.NextYear.Gate)} />
          <div className="flex justify-between gap-4 px-3 py-1 text-sm">
            <span className="text-(--text-muted)">Facilities</span>
            <span>
              Training {finance.Facilities.Training} · Arena{" "}
              {finance.Facilities.Arena} · Recruiting{" "}
              {finance.Facilities.Recruiting}
            </span>
          </div>
          {finance.HoardingPenalty > 0 && (
            <div className="px-3 py-1 text-left text-sm text-(--accent-warning)">
              Donors are holding back about {vbShare(finance.HoardingPenalty)}{" "}
              of major gifts over unspent cash.
            </div>
          )}
        </VbPanel>
      </div>
    </div>
  );
};

type LeagueKey = "name" | "cash" | "revenue" | "spending" | "next" | "fill";

const leagueValue = (program: VbFinance, key: LeagueKey) => {
  switch (key) {
    case "name":
      return program.Name;
    case "cash":
      return program.Cash;
    case "revenue":
      return program.Revenue.Total;
    case "spending":
      return program.Spending.Total;
    case "next":
      return program.NextYear.ProjectedRevenue;
    case "fill":
      return program.Supporters.Fill;
  }
};

const LeagueFinance: FC<{ league: VbLeague }> = ({ league }) => {
  const finances = useVbResource(`league-finances:${league.LeagueID}`, () =>
    VolleyballFinanceService.getLeague(league.LeagueID),
  );
  const sort = useVbSort<VbFinance, LeagueKey>(
    finances.data?.Programs ?? [],
    leagueValue,
    "next",
    "desc",
  );
  return (
    <VbPanel title={`Every program · ${finances.data?.Season ?? ""}`}>
      <VbLoad loading={finances.loading} error={finances.error} rows={12}>
        <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <VbSortHeader label="Program" column="name" sort={sort} />
              <VbSortHeader label="Cash" column="cash" sort={sort} numeric />
              <VbSortHeader label="Revenue to date" column="revenue" sort={sort} numeric />
              <VbSortHeader label="Spending to date" column="spending" sort={sort} numeric />
              <VbSortHeader label="Projected next year" column="next" sort={sort} numeric />
              <VbSortHeader label="Arena fill" column="fill" sort={sort} numeric />
              <th className={vbCell}>Facilities</th>
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((program) => (
              <tr key={program.TeamID} className={vbRowClass}>
                <td className={vbCell}>
                  <VbTeamLink
                    kind="college"
                    teamId={program.TeamID}
                    name={program.Name}
                  />
                </td>
                <td className={vbNum}>{money(program.Cash)}</td>
                <td className={vbNum}>{money(program.Revenue.Total)}</td>
                <td className={vbNum}>{money(program.Spending.Total)}</td>
                <td className={vbNum}>
                  {money(program.NextYear.ProjectedRevenue)}
                </td>
                <td className={vbNum}>{vbShare(program.Supporters.Fill)}</td>
                <td className={vbCell}>
                  {program.Facilities.Training} / {program.Facilities.Arena} /{" "}
                  {program.Facilities.Recruiting}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          Facilities are training / arena / recruiting, graded A to F.
        </div>
      </VbLoad>
    </VbPanel>
  );
};

const ClubFinance: FC<{ finance: VbProFinance }> = ({ finance }) => (
  <div className="space-y-3">
    <div className="grid gap-3 lg:grid-cols-3">
      <VbPanel title={`Revenue · ${finance.Season} to date`}>
        <Line label="League share" value={money(finance.Revenue.LeagueShare)} />
        <Line label="Other" value={money(finance.Revenue.Other)} />
        <Line label="Total" value={money(finance.Revenue.Total)} strong />
      </VbPanel>
      <VbPanel title={`Spending · ${finance.Season} to date`}>
        <Line label="Player salaries" value={money(finance.Spending.PlayerSalaries)} />
        <Line label="Staff salaries" value={money(finance.Spending.StaffSalaries)} />
        <Line label="Other" value={money(finance.Spending.Other)} />
        <Line label="Total" value={money(finance.Spending.Total)} strong />
      </VbPanel>
      <VbPanel title="Position">
        <Line label="Cash" value={money(finance.Cash)} />
        <Line label="Net this season" value={money(finance.Net)} />
        <Line
          label={`Payroll committed (${finance.Payroll.Players} players)`}
          value={money(finance.Payroll.Committed)}
        />
        <Line label="Payroll budget" value={money(finance.Payroll.Budget)} />
        <div className="px-3 py-1 text-left text-xs text-(--text-muted)">
          Committed is the active contracts now. The budget is the club's
          share of league revenue meant for player pay.
        </div>
      </VbPanel>
    </div>
    {finance.Lines.length > 0 && (
      <VbPanel title="Ledger">
        {finance.Lines.map((line, index) => (
          <Line key={index} label={vbLabel(line.Kind)} value={money(line.Amount)} />
        ))}
      </VbPanel>
    )}
  </div>
);

type ProLeagueKey =
  | "name"
  | "cash"
  | "revenue"
  | "spending"
  | "net"
  | "committed"
  | "budget";

const proLeagueValue = (club: VbProFinance, key: ProLeagueKey) => {
  switch (key) {
    case "name":
      return club.Name;
    case "cash":
      return club.Cash;
    case "revenue":
      return club.Revenue.Total;
    case "spending":
      return club.Spending.Total;
    case "net":
      return club.Net;
    case "committed":
      return club.Payroll.Committed;
    case "budget":
      return club.Payroll.Budget;
  }
};

const ProLeagueFinance: FC<{ league: VbLeague }> = ({ league }) => {
  const finances = useVbResource(`pro-league-finances:${league.LeagueID}`, () =>
    VolleyballFinanceService.getProLeague(league.LeagueID),
  );
  const sort = useVbSort<VbProFinance, ProLeagueKey>(
    finances.data?.Clubs ?? [],
    proLeagueValue,
    "committed",
    "desc",
  );
  return (
    <VbPanel title={`Every club · ${finances.data?.Season ?? ""}`}>
      <VbLoad loading={finances.loading} error={finances.error} rows={12}>
        <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <VbSortHeader label="Club" column="name" sort={sort} />
              <VbSortHeader label="Cash" column="cash" sort={sort} numeric />
              <VbSortHeader label="Revenue to date" column="revenue" sort={sort} numeric />
              <VbSortHeader label="Spending to date" column="spending" sort={sort} numeric />
              <VbSortHeader label="Net" column="net" sort={sort} numeric />
              <VbSortHeader label="Payroll committed" column="committed" sort={sort} numeric />
              <VbSortHeader label="Payroll budget" column="budget" sort={sort} numeric />
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((club) => (
              <tr key={club.ClubID} className={vbRowClass}>
                <td className={vbCell}>
                  <VbTeamLink kind="pro" teamId={club.ClubID} name={club.Name} />
                </td>
                <td className={vbNum}>{money(club.Cash)}</td>
                <td className={vbNum}>{money(club.Revenue.Total)}</td>
                <td className={vbNum}>{money(club.Spending.Total)}</td>
                <td className={vbNum}>{money(club.Net)}</td>
                <td
                  className={`${vbNum} ${
                    club.Payroll.Committed > club.Payroll.Budget
                      ? "text-(--accent-warning)"
                      : ""
                  }`}
                >
                  {money(club.Payroll.Committed)}
                </td>
                <td className={vbNum}>{money(club.Payroll.Budget)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          Committed payroll is the active contracts now; it is marked where it
          is above the club's budget for player pay.
        </div>
      </VbLoad>
    </VbPanel>
  );
};

type FinanceTab = "team" | "league";

const FinancesBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const pro = kind === "pro";
  useVbTeams(kind);
  const financeTabs: Array<readonly [FinanceTab, string]> = [
    ["team", pro ? "Club" : "Program"],
    ["league", "League"],
  ];
  const [tab, setTab] = useSportSectionTab(financeTabs, "team");
  const { team, picker, nothingSelected, waiting } = useVbTeamPicker(
    kind,
    (teamId) =>
      (pro ? routes.PVB_FINANCES : routes.CVB_FINANCES).replace(
        ":teamId?",
        String(teamId),
      ),
  );
  const teamId = team.data?.TeamID;
  // The two leagues keep different books, on different routes.
  const finance = useVbResource(
    teamId && !pro ? `finances:${teamId}` : null,
    () => VolleyballFinanceService.getTeam(teamId!),
  );
  const clubFinance = useVbResource(
    teamId && pro ? `pro-finances:${teamId}` : null,
    () => VolleyballFinanceService.getProClub(teamId!),
  );
  return (
    <div className="space-y-3">
      <SportBannerSections tabs={financeTabs} value={tab} onChange={setTab} />
      {tab === "league" ? (
        pro ? (
          <>
            <ProLeagueFinance league={league} />
            <VbLeagueFinanceTrends kind="pro" leagueId={league.LeagueID} />
          </>
        ) : (
          <>
            <VbLeagueFinanceTrends kind="college" leagueId={league.LeagueID} />
            <LeagueFinance league={league} />
          </>
        )
      ) : (
        <>
          {picker}
          {nothingSelected ? (
            <VbEmpty>
              Pick a {pro ? "club" : "program"} to see its finances.
            </VbEmpty>
          ) : (
            <VbLoad
              loading={
                waiting || team.loading || finance.loading || clubFinance.loading
              }
              error={team.error ?? finance.error ?? clubFinance.error}
            >
              {/* The charts lead; this season's books and the supporters
                  report follow. */}
              {teamId && (finance.data || clubFinance.data) && (
                <div className="mb-3">
                  <VbTeamFinanceTrends kind={kind} teamId={teamId} />
                </div>
              )}
              {finance.data && <TeamFinance finance={finance.data} />}
              {clubFinance.data && <ClubFinance finance={clubFinance.data} />}
              {teamId && finance.data && (
                <div className="mt-3">
                  <VbSupportersReport teamId={teamId} />
                </div>
              )}
            </VbLoad>
          )}
        </>
      )}
    </div>
  );
};

// Everything here is public; a team's own coach sees the same page. The
// college ledger and per-player NIL are not served.
export const VolleyballFinancesPage: FC<{ kind?: VbLeagueKind }> = ({
  kind = "college",
}) => (
  <VbPageShell kind={kind} title="Finances">
    {(league) => <FinancesBody kind={kind} league={league} />}
  </VbPageShell>
);

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "../../_design/Tags";
import { VbCoachLink } from "./VbCoachLink";
import { vbMatchTab } from "./VbMatchTile";
import { useVbAiringRefresh, vbAiring, vbAiringLabel } from "./VbBroadcast";
import { LiveBadge } from "../Common/sportTheme";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbMatch,
  VbPhase,
  VbStaff,
  VbTeam,
  VolleyballFinanceService,
  VolleyballService,
} from "../../_services/volleyballService";
import { VbRecordBook } from "./VbRecords";
import { vbFamilies, VbGrade } from "./VbGrades";
import { useVbResource } from "./useVbData";
import { VbPlayerLink } from "./VbPlayerCard";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbLinkClass,
  vbLinkProps,
  VbLoad,
  vbNum,
  VbPanel,
  vbRowClass,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import {
  vbLabel,
  vbMatchKindLabel,
  vbMatchWhen,
  vbMoney,
  vbPaths,
  vbResult,
  vbRoleLabel,
  vbSetScores,
} from "./vbFormatting";
import { SportChip } from "../Common/SportKit";

interface TeamTabProps {
  kind: VbLeagueKind;
  team: VbTeam;
}

const phaseOrder: VbPhase[] = [
  "preseason",
  "regular_season",
  "conference_tournament",
  "national_tournament",
  "offseason",
];

/** Matches in the order they are played. */
export const vbChronological = (matches: VbMatch[]) =>
  [...matches].sort(
    (a, b) =>
      (a.LeagueTime.Order ?? 0) - (b.LeagueTime.Order ?? 0) ||
      phaseOrder.indexOf(a.LeagueTime.Phase) -
        phaseOrder.indexOf(b.LeagueTime.Phase) ||
      a.LeagueTime.Week - b.LeagueTime.Week ||
      a.LeagueTime.Day - b.LeagueTime.Day ||
      a.MatchID - b.MatchID,
  );

export const VbTeamScheduleTab: FC<TeamTabProps & { season: number }> = ({
  kind,
  team,
  season,
}) => {
  const navigate = useNavigate();
  const schedule = useVbResource(
    `team-schedule:${team.TeamID}:${season}`,
    () => VolleyballService.getTeamSchedule(team.TeamID, season),
    { keepWhileReloading: true },
  );
  const matches = vbChronological(schedule.data?.Matches ?? []);
  const now = useVbAiringRefresh(
    `team-schedule:${team.TeamID}:${season}`,
    matches,
    () => VolleyballService.getTeamSchedule(team.TeamID, season),
  );
  const { cvbTeam, pvbTeam } = useSimVBStore();
  const ownsTeam =
    cvbTeam?.TeamID === team.TeamID || pvbTeam?.TeamID === team.TeamID;

  return (
    <VbPanel color={team.ColorTwo}>
      <VbLoad loading={schedule.loading} error={schedule.error} rows={12}>
        <table data-keep-table className={`${vbTableClass} min-w-[640px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>When</th>
              <th className={vbCell}>Opponent</th>
              <th className={vbCell}>Type</th>
              <th className={vbCell}>Result</th>
              <th className={vbCell}>Sets</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const home = match.HomeTeamID === team.TeamID;
              const result = vbResult(match);
              const airing = vbAiring(match, now);
              const won = result?.WinnerTeamID === team.TeamID;
              const ours = result && (home ? result.SetsHome : result.SetsAway);
              const theirs = result && (home ? result.SetsAway : result.SetsHome);
              return (
                <tr key={match.MatchID} className={vbRowClass}>
                  <td className={vbCell}>{vbMatchWhen(match)}</td>
                  <td className={vbCell}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-(--text-muted)">
                        {match.NeutralSite ? "vs" : home ? "vs" : "at"}
                      </span>
                      <VbTeamLink
                        kind={kind}
                        teamId={home ? match.AwayTeamID : match.HomeTeamID}
                        name={home ? match.AwayName : match.HomeName}
                      />
                    </div>
                  </td>
                  <td className={vbCell}>
                    {vbMatchKindLabel(match.Kind)}
                    {match.NeutralSite ? " (neutral)" : ""}
                  </td>
                  <td className={vbCell}>
                    <span
                      {...vbLinkProps(() =>
                        navigate(vbPaths(kind).match(match.MatchID)),
                      )}
                      className={vbLinkClass}
                    >
                      {result ? (
                        <>
                          <span
                            className={
                              won
                                ? "text-(--accent-success)"
                                : "text-(--accent-error)"
                            }
                          >
                            {won ? "W" : "L"}
                          </span>{" "}
                          {ours}-{theirs}
                        </>
                      ) : airing?.state === "live" ? (
                        <LiveBadge label="Watch live" />
                      ) : airing ? (
                        vbAiringLabel(airing)
                      ) : (
                        "Preview"
                      )}
                    </span>
                    {result && (
                      <>
                        <span
                          {...vbLinkProps(() =>
                            navigate(vbMatchTab(kind, match.MatchID, "box")),
                          )}
                          className={`ml-3 text-xs ${vbLinkClass}`}
                        >
                          Box score
                        </span>
                        <span
                          {...vbLinkProps(() =>
                            navigate(vbMatchTab(kind, match.MatchID, "replay")),
                          )}
                          className={`ml-3 text-xs ${vbLinkClass}`}
                        >
                          ▶ Watch
                        </span>
                      </>
                    )}
                    {!result && ownsTeam && (
                      <span
                        {...vbLinkProps(() =>
                          navigate(
                            `${vbPaths(kind).tactics}?tab=plans&opponent=${
                              home ? match.AwayTeamID : match.HomeTeamID
                            }`,
                          ),
                        )}
                        className={`ml-3 ${vbLinkClass}`}
                      >
                        Game plan
                      </span>
                    )}
                  </td>
                  <td className={`${vbCell} tabular-nums text-(--text-muted)`}>
                    {vbSetScores(match, team.TeamID)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!matches.length && (
          <VbEmpty>No matches are scheduled for {season} yet.</VbEmpty>
        )}
      </VbLoad>
    </VbPanel>
  );
};

// Coach attributes in the order the staff table shows them.
export const vbStaffGrades: Array<[key: string, short: string]> = [
  ["practiceCoaching", "PRA"],
  ["offenseInstruction", "OFF"],
  ["defenseInstruction", "DEF"],
  ["servingInstruction", "SRV"],
  ["physicalDevelopment", "PHY"],
  ["sportsMedicine", "MED"],
  ["filmScouting", "FLM"],
  ["gameManagement", "GAM"],
  ["recruiting", "REC"],
  ["fundraising", "FND"],
  ["staffManagement", "STF"],
];

/**
 * What a team pays its staff: the total, where that ranks in the league,
 * and each person's share of it.
 */
const StaffCompensation: FC<{
  kind: VbLeagueKind;
  team: VbTeam;
  staff: VbStaff;
}> = ({ kind, team, staff }) => {
  // The books say what staff pay came to each season, and its league rank.
  const books = useVbResource(`finance-history:${team.TeamID}`, () =>
    VolleyballFinanceService.getHistory(team.TeamID),
  );
  const key = kind === "college" ? "Payroll" : "StaffSalaries";
  const seasons = [...(books.data?.Seasons ?? [])]
    .filter((season) => (season.Spending[key] ?? 0) > 0)
    .sort((a, b) => b.Season - a.Season);
  const last = seasons[0];
  const before = seasons[1];
  const members = [...staff.Staff].sort((a, b) => b.Salary - a.Salary);
  const total = members.reduce((sum, member) => sum + member.Salary, 0);
  const top = members[0];
  const change =
    last && before ? (last.Spending[key] ?? 0) - (before.Spending[key] ?? 0) : null;
  const tiles: Array<[label: string, value: string, detail: string]> = [
    [
      "Staff payroll now",
      vbMoney(staff.Payroll),
      `${members.length} on staff`,
    ],
    [
      "Highest paid",
      top ? vbMoney(top.Salary) : "—",
      top ? `${top.Name}, ${vbLabel(top.Role).toLowerCase()}` : "",
    ],
    [
      last ? `Paid in ${last.Season}` : "Paid last season",
      last ? vbMoney(Math.round(last.Spending[key] ?? 0)) : "—",
      change === null
        ? ""
        : `${change >= 0 ? "Up" : "Down"} ${vbMoney(Math.abs(Math.round(change)))} on ${before!.Season}`,
    ],
    // Only the college books rank staff pay on its own; a pro club's payroll
    // rank is its players'.
    ...(kind === "college" && last?.Ranks.Payroll
      ? ([
          [
            "League rank",
            `${last.Ranks.Payroll} of ${last.Teams}`,
            `Staff pay in ${last.Season}; 1 is the largest`,
          ],
        ] as Array<[string, string, string]>)
      : []),
  ];

  return (
    <VbPanel color={team.ColorTwo} title="Compensation">
      <div className="grid grid-cols-2 gap-2 p-3 lg:grid-cols-4">
        {tiles.map(([label, value, detail]) => (
          <div
            key={label}
            className="rounded-lg bg-(--sport-surface-2) p-2 text-left"
          >
            <div className="text-xs uppercase text-(--text-muted)">{label}</div>
            <div className="text-lg font-bold tabular-nums">{value}</div>
            <div className="truncate text-xs text-(--text-muted)">{detail}</div>
          </div>
        ))}
      </div>
      <table data-keep-table className={vbTableClass}>
        <thead className={vbHeadClass}>
          <tr>
            <th className={vbCell}>Name</th>
            <th className={vbCell}>Role</th>
            <th className={`${vbCell} text-right`}>Salary</th>
            <th className={`${vbCell} w-1/3`}>Share of payroll</th>
            <th className={`${vbCell} text-right`}>Contract through</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const share = total > 0 ? member.Salary / total : 0;
            return (
              <tr key={member.PersonID} className={vbRowClass}>
                <td className={vbCell}>
                  <VbCoachLink personId={member.PersonID} name={member.Name} />
                </td>
                <td className={vbCell}>
                  {vbLabel(member.Role)}
                  {member.Interim ? " (interim)" : ""}
                </td>
                <td className={vbNum}>{vbMoney(member.Salary)}</td>
                <td className={vbCell}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded bg-(--text-primary)/15">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: `${share * 100}%`,
                          backgroundColor: team.ColorOne,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-(--text-muted)">
                      {Math.round(share * 100)}%
                    </span>
                  </div>
                </td>
                <td className={vbNum}>{member.ContractThrough ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
        Salaries are per season. Payroll now is the contracts in force; the
        season figures are what the books show was paid.
      </div>
    </VbPanel>
  );
};

export const VbStaffTab: FC<TeamTabProps> = ({ kind, team }) => {
  const staff = useVbResource(`staff:${team.TeamID}`, () =>
    VolleyballService.getStaff(team.TeamID),
  );
  const members = staff.data?.Staff ?? [];

  return (
    <>
    {staff.data && members.length > 0 && (
      <StaffCompensation kind={kind} team={team} staff={staff.data} />
    )}
    <VbPanel color={team.ColorTwo} title="Staff and abilities">
      <VbLoad loading={staff.loading} error={staff.error}>
        <table data-keep-table className={`${vbTableClass} min-w-[1100px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Role</th>
              <th className={vbCell}>Name</th>
              <th className={`${vbCell} text-right`}>Since</th>
              <th className={`${vbCell} text-right`}>Salary</th>
              <th className={`${vbCell} text-right`}>Thru</th>
              {vbStaffGrades.map(([key, short]) => (
                <th key={key} className={`${vbCell} text-center`} title={vbLabel(key)}>
                  {short}
                </th>
              ))}
              <th className={vbCell}>Traits</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.PersonID} className={vbRowClass}>
                <td className={vbCell}>
                  {vbRoleLabel(member.Role)}
                  {member.Interim ? " (interim)" : ""}
                </td>
                <td className={vbCell}>
                  <VbCoachLink personId={member.PersonID} name={member.Name} />
                  {/* A user's coach: their username marks them out. */}
                  {member.Username && (
                    <span className="ml-2" title="Coached by this user">
                      <SportChip>{member.Username}</SportChip>
                    </span>
                  )}
                </td>
                <td className={vbNum}>{member.Since}</td>
                <td className={vbNum}>{vbMoney(member.Salary)}</td>
                <td className={vbNum}>{member.ContractThrough ?? "—"}</td>
                {vbStaffGrades.map(([key]) => (
                  <td key={key} className={`${vbCell} text-center`}>
                    {member.Grades[key] ?? "—"}
                  </td>
                ))}
                <td className={vbCell}>
                  <div className="flex gap-1">
                    {member.Traits.map((trait) => (
                      <Tag key={trait}>{vbLabel(trait)}</Tag>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members.length && <VbEmpty>No staff on record.</VbEmpty>}
        {staff.data && (
          <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
            Payroll {vbMoney(staff.data.Payroll)}
            {staff.data.Philosophy
              ? ` · Head coach prefers a ${staff.data.Philosophy.OffensiveSystem} offense`
              : ""}
            . Grades are public estimates from each coach's track record; a
            range narrows the longer they have coached.
          </div>
        )}
      </VbLoad>
    </VbPanel>
    </>
  );
};

const seeded = (seed: number | null, result: string | null) =>
  result ? `${vbLabel(result)}${seed ? ` (${seed} seed)` : ""}` : "—";

export const VbTeamHistoryTab: FC<TeamTabProps> = ({ kind, team }) => {
  const history = useVbResource(`team-history:${team.TeamID}`, () =>
    VolleyballService.getTeamHistory(team.TeamID),
  );
  const seasons = [...(history.data?.Seasons ?? [])].sort(
    (a, b) => b.Season - a.Season,
  );
  const coaches = seasons.some((season) => season.HeadCoaches?.length);
  const classes =
    kind === "college" &&
    seasons.some((season) => season.RecruitingClassRank != null);

  return (
    <div className="space-y-3">
    <VbPanel color={team.ColorTwo}>
      <VbLoad loading={history.loading} error={history.error}>
        <table data-keep-table className={`${vbTableClass} min-w-[720px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Season</th>
              {coaches && <th className={vbCell}>Head Coach</th>}
              <th className={vbCell}>Record</th>
              {kind === "college" && <th className={vbCell}>Conf</th>}
              {kind === "college" && (
                <th className={`${vbCell} text-right`}>Conf Rank</th>
              )}
              <th className={`${vbCell} text-right`}>Elo Rank</th>
              <th className={`${vbCell} text-right`}>RPI Rank</th>
              {classes && (
                <th
                  className={`${vbCell} text-right`}
                  title="Where the class that arrived that season ranked. It signed during the season before."
                >
                  Recruiting Class
                </th>
              )}
              {kind === "college" && <th className={vbCell}>Conf Tournament</th>}
              <th className={vbCell}>
                {kind === "college" ? "National Tournament" : "Playoffs"}
              </th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((season) => (
              <tr key={season.Season} className={vbRowClass}>
                <td className={vbCell}>
                  {season.Season}
                  {season.InProgress && (
                    <span
                      className="ml-1 text-xs text-(--text-muted)"
                      title="The season being played: the record and ranks are as they stand now"
                    >
                      so far
                    </span>
                  )}
                </td>
                {coaches && (
                  <td className={vbCell}>
                    {season.HeadCoaches?.length
                      ? season.HeadCoaches.map((coach, index) => (
                          <div
                            key={`${coach.PersonID}:${index}`}
                            className="flex items-center gap-1"
                          >
                            <VbCoachLink
                              personId={coach.PersonID}
                              name={coach.Name}
                            />
                            {coach.Interim && (
                              <span className="text-xs text-(--text-muted)">
                                (interim)
                              </span>
                            )}
                            {coach.Username && (
                              <span className="text-xs text-(--text-muted)">
                                · {coach.Username}
                              </span>
                            )}
                          </div>
                        ))
                      : "—"}
                  </td>
                )}
                <td className={`${vbCell} tabular-nums`}>
                  {season.Wins}-{season.Losses}
                </td>
                {kind === "college" && (
                  <td className={`${vbCell} tabular-nums`}>
                    {season.ConfWins}-{season.ConfLosses}
                  </td>
                )}
                {kind === "college" && (
                  <td className={vbNum}>{season.ConfRank ?? "—"}</td>
                )}
                <td className={vbNum}>{season.EloRank ?? "—"}</td>
                <td className={vbNum}>{season.RPIRank ?? "—"}</td>
                {classes && (
                  <td className={vbNum}>
                    {season.RecruitingClassRank != null
                      ? `#${season.RecruitingClassRank}`
                      : "—"}
                  </td>
                )}
                {kind === "college" && (
                  <td className={vbCell}>
                    {seeded(season.ConfTourneySeed, season.ConfTourneyResult)}
                  </td>
                )}
                <td className={vbCell}>
                  {seeded(season.NationalSeed, season.NationalResult)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!seasons.length && <VbEmpty>No seasons yet.</VbEmpty>}
      </VbLoad>
    </VbPanel>
    <div className="text-left text-sm font-semibold">Team records</div>
    <VbRecordBook kind={kind} leagueId={team.LeagueID} teamId={team.TeamID} />
    </div>
  );
};

export const VbInjuriesTab: FC<TeamTabProps> = ({ team }) => {
  const report = useVbResource(`injuries:${team.TeamID}`, () =>
    VolleyballService.getInjuries(team.TeamID),
  );
  const injuries = report.data?.Injuries ?? [];

  return (
    <VbPanel color={team.ColorTwo}>
      <VbLoad loading={report.loading} error={report.error} rows={3}>
        {injuries.length ? (
          <table data-keep-table className={`${vbTableClass} min-w-[560px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>#</th>
                <th className={vbCell}>Player</th>
                <th className={vbCell}>Injury</th>
                <th className={vbCell}>Status</th>
                <th className={vbCell}>Expected Back</th>
                <th className={vbCell}>Hurt In</th>
              </tr>
            </thead>
            <tbody>
              {injuries.map((injury) => (
                <tr key={injury.PlayerID} className={vbRowClass}>
                  <td className={vbCell}>{injury.Jersey ?? "—"}</td>
                  <td className={vbCell}>
                    <VbPlayerLink
                      playerId={injury.PlayerID}
                      name={injury.Name}
                      team={team}
                    />
                  </td>
                  <td className={vbCell}>{vbLabel(injury.BodyPart)}</td>
                  <td className={vbCell}>{injury.Status}</td>
                  <td className={vbCell}>{injury.ExpectedReturn.Label}</td>
                  <td className={vbCell}>{vbLabel(injury.Source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <VbEmpty>No one is on the injury report.</VbEmpty>
        )}
      </VbLoad>
    </VbPanel>
  );
};

export const VbCommitmentsTab: FC<TeamTabProps> = ({ team }) => {
  const commitments = useVbResource(`commitments:${team.TeamID}`, () =>
    VolleyballService.getCommitments(team.TeamID),
  );
  const rows = commitments.data?.Commitments ?? [];

  return (
    <VbPanel color={team.ColorTwo}>
      <VbLoad loading={commitments.loading} error={commitments.error} rows={3}>
        {rows.length ? (
          <table data-keep-table className={`${vbTableClass} min-w-[860px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Recruit</th>
                <th className={vbCell}>Pos</th>
                <th className={`${vbCell} text-right`}>Stars</th>
                <th className={`${vbCell} text-right`}>Rank</th>
                <th className={`${vbCell} text-right`} title="Overall at her position">
                  Ovr
                </th>
                {vbFamilies.map(([key, short, label]) => (
                  <th key={key} className={`${vbCell} text-right`} title={label}>
                    {short}
                  </th>
                ))}
                <th className={vbCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.PersonID} className={vbRowClass}>
                  <td className={vbCell}>
                    <VbPlayerLink
                      playerId={row.PersonID}
                      name={row.Name}
                      team={team}
                    />
                  </td>
                  <td className={vbCell}>{row.Position}</td>
                  <td className={vbNum}>{row.Stars}</td>
                  <td className={vbNum}>{row.Rank}</td>
                  <td className={`${vbNum} font-semibold`}>
                    <VbGrade value={row.AbilityGrades?.Overall} />
                  </td>
                  {vbFamilies.map(([key]) => (
                    <td key={key} className={vbNum}>
                      <VbGrade value={row.AbilityGrades?.Families?.[key]} />
                    </td>
                  ))}
                  <td className={vbCell}>{vbLabel(row.Status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <VbEmpty>
            No commitments yet for the {commitments.data?.Season} class.
          </VbEmpty>
        )}
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          Stars, rank and grades are public scouting, and deliberately
          imprecise.
        </div>
      </VbLoad>
    </VbPanel>
  );
};

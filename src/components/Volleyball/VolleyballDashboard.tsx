import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { VbCoachLink } from "./VbCoachLink";
import { useSimVBStore } from "../../context/SimVBContext";
import { SportForumPanel } from "../Common/SportForumPanel";
import {
  VbLeagueKind,
  VbTeam,
  VolleyballManageService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbClock } from "./useVbClock";
import { useVbResource, useVbTeams } from "./useVbData";
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
  vbLeagueConstant,
  vbMatchWhen,
  vbMoney,
  vbPaths,
  vbResult,
  vbSetScores,
} from "./vbFormatting";
import { VbGamesBar } from "./VbGamesBar";
import { VbInboxPanel } from "./VbInbox";
import { vbChronological } from "./VolleyballTeamTabs";
import { useVbAiringRefresh, vbAiring, vbAiringLabel } from "./VbBroadcast";
import { LiveBadge, sportStatePill } from "../Common/sportTheme";

const NEXT_MATCHES = 3;

interface VbTeamDashboardProps {
  team: VbTeam;
  kind: VbLeagueKind;
}

// The coach's part of the league home, which is the same page on the site's
// Home and at /cvb or /pvb: their games, the inbox, what is next and how the
// last match went. Their team's name and pages are on the banner above. It loads in the background; a slow or missing
// volleyball API never holds up the rest of the site.
export const VbTeamDashboard: FC<VbTeamDashboardProps> = ({ team, kind }) => {
  const navigate = useNavigate();
  const { vbTeamsById } = useSimVBStore();
  const clock = useVbClock(kind);
  const paths = vbPaths(kind);
  useVbTeams(kind); // opponents' names and logos
  const schedule = useVbResource(
    clock ? `team-schedule:${team.TeamID}:${clock.Season}` : null,
    () => VolleyballService.getTeamSchedule(team.TeamID, clock!.Season),
    { keepWhileReloading: true },
  );
  // While a match of theirs is on air, its result is watched for.
  const now = useVbAiringRefresh(
    clock ? `team-schedule:${team.TeamID}:${clock.Season}` : null,
    schedule.data?.Matches ?? [],
    () => VolleyballService.getTeamSchedule(team.TeamID, clock!.Season),
  );
  // Before a season has a schedule, the bar shows the one just played.
  const lastYear = useVbResource(
    clock && schedule.data && !schedule.data.Matches.length
      ? `team-schedule:${team.TeamID}:${clock.Season - 1}`
      : null,
    () => VolleyballService.getTeamSchedule(team.TeamID, clock!.Season - 1),
  );
  const season = vbChronological(
    schedule.data?.Matches.length
      ? schedule.data.Matches
      : (lastYear.data?.Matches ?? []),
  );
  // The next matches straight from the season, in the order they are played.
  const nextMatches = vbChronological(schedule.data?.Matches ?? [])
    .filter((match) => !vbResult(match))
    .slice(0, NEXT_MATCHES);
  const lastMatch = vbChronological(schedule.data?.Matches ?? [])
    .filter((match) => vbResult(match))
    .pop();
  const lastResult = lastMatch ? vbResult(lastMatch) : null;
  const opponent = (homeId: number, awayId: number) => {
    const home = homeId === team.TeamID;
    const otherId = home ? awayId : homeId;
    return (
      <div className="flex items-center gap-2">
        <span className="w-5 text-(--text-muted)">{home ? "vs" : "at"}</span>
        <VbTeamLink
          kind={kind}
          teamId={otherId}
          name={vbTeamsById[otherId]?.Name ?? `Team ${otherId}`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <VbGamesBar kind={kind} team={team} matches={season} now={now} />
      {/* The inbox beside the team's schedule: the last result, then what is next. */}
      <div className="grid items-start gap-3 lg:grid-cols-[3fr_2fr]">
        <VbInboxPanel kind={kind} color={team.ColorOne} />
        <VbPanel title="Schedule" color={team.ColorOne}>
          <VbLoad loading={schedule.loading} error={schedule.error} rows={4}>
            <table data-keep-table className={vbTableClass}>
              <tbody>
                {lastMatch && lastResult && (
                  <tr className={vbRowClass}>
                    <td className={`${vbCell} text-(--text-muted)`}>
                      {vbMatchWhen(lastMatch)}
                    </td>
                    <td className={vbCell}>
                      {opponent(lastMatch.HomeTeamID, lastMatch.AwayTeamID)}
                    </td>
                    <td className={`${vbCell} text-right`}>
                      <span
                        {...vbLinkProps(() =>
                          navigate(paths.match(lastMatch.MatchID)),
                        )}
                        className={`inline-flex items-center gap-1.5 ${vbLinkClass}`}
                        title={vbSetScores(lastMatch, team.TeamID)}
                      >
                        <span
                          className={`rounded-sm px-1.5 py-px text-[0.6rem] font-bold ${sportStatePill[lastResult.WinnerTeamID === team.TeamID ? "win" : "loss"]}`}
                        >
                          {lastResult.WinnerTeamID === team.TeamID ? "W" : "L"}
                        </span>
                        <span className="tabular-nums">
                          {lastMatch.HomeTeamID === team.TeamID
                            ? `${lastResult.SetsHome}–${lastResult.SetsAway}`
                            : `${lastResult.SetsAway}–${lastResult.SetsHome}`}
                        </span>
                      </span>
                    </td>
                  </tr>
                )}
                {nextMatches.map((match) => {
                  const airing = vbAiring(match, now);
                  return (
                    <tr key={match.MatchID} className={vbRowClass}>
                      <td className={vbCell}>{vbMatchWhen(match)}</td>
                      <td className={vbCell}>
                        {opponent(match.HomeTeamID, match.AwayTeamID)}
                      </td>
                      <td className={`${vbCell} text-right`}>
                        <span
                          {...vbLinkProps(() =>
                            navigate(paths.match(match.MatchID)),
                          )}
                          className={vbLinkClass}
                        >
                          {airing?.state === "live" ? (
                            <LiveBadge label="Watch live" />
                          ) : airing ? (
                            vbAiringLabel(airing)
                          ) : (
                            "Preview"
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!lastMatch && !nextMatches.length && (
              <VbEmpty>No matches are scheduled yet.</VbEmpty>
            )}
            {lastMatch && !nextMatches.length && (
              <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
                No more matches are scheduled this season.
              </div>
            )}
          </VbLoad>
        </VbPanel>
      </div>
    </div>
  );
};

/** The coach's own office, below the league's news: the forum and the staff. */
export const VbTeamOffice: FC<VbTeamDashboardProps> = ({ team, kind }) => {
  const overview = useVbResource(`overview:${team.TeamID}`, () =>
    VolleyballManageService.getOverview(team.TeamID),
  );
  return (
    <div className="space-y-2">
      {/* The league's own board: the newest threads in its media forum. */}
      <SportForumPanel league={vbLeagueConstant(kind)} accent={team.ColorOne} />

      <VbPanel title="Staff" color={team.ColorOne}>
        <VbLoad loading={overview.loading} error={overview.error} rows={4}>
          <table data-keep-table className={`${vbTableClass} min-w-[480px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Role</th>
                <th className={vbCell}>Name</th>
                <th className={`${vbCell} text-right`}>Salary</th>
                <th className={`${vbCell} text-right`}>Thru</th>
              </tr>
            </thead>
            <tbody>
              {(overview.data?.Staff ?? []).map((member) => (
                <tr key={member.PersonID} className={vbRowClass}>
                  <td className={vbCell}>
                    {vbLabel(member.Role)}
                    {member.Interim ? " (interim)" : ""}
                  </td>
                  <td className={vbCell}>
                    <VbCoachLink personId={member.PersonID} name={member.Name} />
                  </td>
                  <td className={vbNum}>{vbMoney(member.Salary)}</td>
                  <td className={vbNum}>{member.ContractEnd ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </VbLoad>
      </VbPanel>
    </div>
  );
};

import { FC, useMemo } from "react";
import {
  VbLeagueKind,
  VbMatch,
  VbTacticsReportTeam,
  VbTeam,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons } from "./useVbData";
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
import { vbLabel, vbPct, vbResult, vbShare } from "./vbFormatting";
import { vbChronological } from "./VolleyballTeamTabs";

// How many of the opponent's latest matches the summary adds up.
const MATCHES = 5;

// Zones as they sit on the receiving half, net at the top.
const zoneLayout = [4, 3, 2, 5, 6, 1];

const sum = <Row,>(rows: Row[], value: (row: Row) => number) =>
  rows.reduce((total, row) => total + value(row), 0);

/** A mean of `value` weighted by `weight`; 0 with nothing to weigh. */
const weighted = <Row,>(
  rows: Row[],
  value: (row: Row) => number,
  weight: (row: Row) => number,
) => {
  const total = sum(rows, weight);
  return total > 0 ? sum(rows, (row) => value(row) * weight(row)) / total : 0;
};

const summarize = (reports: VbTacticsReportTeam[]) => {
  const tempos = new Map<
    string,
    { Attempts: number; Kills: number; Errors: number; Blocked: number }
  >();
  reports.forEach((report) =>
    report.Attack.ByTempo.forEach((row) => {
      const total = tempos.get(row.Tempo) ?? {
        Attempts: 0,
        Kills: 0,
        Errors: 0,
        Blocked: 0,
      };
      total.Attempts += row.Attempts;
      total.Kills += row.Kills;
      total.Errors += row.Errors;
      total.Blocked += row.Blocked;
      tempos.set(row.Tempo, total);
    }),
  );
  const attempts = sum(reports, (report) => report.Attack.Attempts);
  const serves = sum(reports, (report) => report.Serve.Serves);
  const zones: Record<string, number> = {};
  reports.forEach((report) =>
    Object.entries(report.Serve.ByZone).forEach(([zone, count]) => {
      zones[zone] = (zones[zone] ?? 0) + count;
    }),
  );
  return {
    attempts,
    tempos: [...tempos.entries()]
      .map(([tempo, total]) => ({
        tempo,
        ...total,
        share: attempts > 0 ? total.Attempts / attempts : 0,
        // The same sum the match report uses: blocked attacks count against.
        efficiency:
          total.Attempts > 0
            ? (total.Kills - total.Errors - total.Blocked) / total.Attempts
            : null,
      }))
      .sort((a, b) => b.Attempts - a.Attempts),
    efficiency: weighted(
      reports,
      (report) => report.Attack.Efficiency,
      (report) => report.Attack.Attempts,
    ),
    offSpeed: weighted(
      reports,
      (report) => report.Attack.OffSpeedShare,
      (report) => report.Attack.Attempts,
    ),
    serves,
    aceShare: serves > 0 ? sum(reports, (r) => r.Serve.Aces) / serves : 0,
    serveErrorShare:
      serves > 0 ? sum(reports, (r) => r.Serve.Errors) / serves : 0,
    jumpShare: weighted(
      reports,
      (report) => report.Serve.JumpShare,
      (report) => report.Serve.Serves,
    ),
    zones,
    zoneTotal: sum(Object.values(zones), (count) => count),
    passGrade: weighted(
      reports,
      (report) => report.Receive.AverageGrade,
      (report) => report.Receive.Receptions,
    ),
    perfectShare: weighted(
      reports,
      (report) => report.Receive.PerfectShare,
      (report) => report.Receive.Receptions,
    ),
    passers: sum(reports, (r) => r.Receive.Passers) / reports.length,
    blockersUp: weighted(
      reports,
      (report) => report.Block.AverageBlockersUp,
      (report) => report.Block.Touches,
    ),
    stuffs: sum(reports, (r) => r.Block.Stuffs) / reports.length,
    allowed: sum(reports, (r) => r.OpponentEfficiency) / reports.length,
  };
};

const Fact: FC<{ label: string; value: string; title?: string }> = ({
  label,
  value,
  title,
}) => (
  <div className="text-left" title={title}>
    <div className="text-xs uppercase text-(--text-muted)">{label}</div>
    <div className="font-semibold tabular-nums">{value}</div>
  </div>
);

/**
 * What an opponent has been doing: the public tactics reports of its latest
 * matches, added up. Everything here is what anyone can read match by match.
 */
export const VbOpponentScout: FC<{ kind: VbLeagueKind; opponent: VbTeam }> = ({
  kind,
  opponent,
}) => {
  const id = opponent.TeamID;
  const { seasons, currentSeason } = useVbSeasons(kind);
  const thisYear = useVbResource(
    currentSeason ? `team-schedule:${id}:${currentSeason}` : null,
    () => VolleyballService.getTeamSchedule(id, currentSeason!),
  );
  const played = (matches: VbMatch[] | undefined) =>
    vbChronological(matches ?? []).filter((match) => vbResult(match));
  const recentNow = played(thisYear.data?.Matches);
  // Early in a season there is too little to go on, so last season fills in.
  const lastSeason =
    currentSeason && seasons.includes(currentSeason - 1)
      ? currentSeason - 1
      : null;
  const needMore = Boolean(thisYear.data) && recentNow.length < MATCHES;
  const lastYear = useVbResource(
    needMore && lastSeason ? `team-schedule:${id}:${lastSeason}` : null,
    () => VolleyballService.getTeamSchedule(id, lastSeason!),
  );
  const matches = useMemo(
    () => [...played(lastYear.data?.Matches), ...recentNow].slice(-MATCHES),
    // The lists are rebuilt each render; their sources say when they change.
    [thisYear.data, lastYear.data],
  );
  const matchIds = matches.map((match) => match.MatchID);
  const reports = useVbResource(
    matchIds.length ? `scout:${id}:${matchIds.join(",")}` : null,
    () =>
      Promise.all(
        matchIds.map((matchId) => VolleyballService.getTacticsReport(matchId)),
      ),
  );
  const own = (reports.data ?? []).flatMap((report) =>
    report.Teams.filter((team) => team.TeamId === id),
  );
  const summary = useMemo(
    () => (own.length ? summarize(own) : null),
    [reports.data, id],
  );
  const waiting =
    thisYear.loading || lastYear.loading || reports.loading || !currentSeason;
  const spans = [...new Set(matches.map((match) => match.LeagueTime.Season))];

  return (
    <VbPanel
      title={`${opponent.Name}: what they have been doing${
        matches.length
          ? ` · last ${matches.length} ${matches.length === 1 ? "match" : "matches"}`
          : ""
      }`}
    >
      <VbLoad
        loading={waiting}
        error={thisYear.error ?? lastYear.error ?? reports.error}
        rows={5}
      >
        {summary ? (
          <div className="grid gap-4 p-3 lg:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <table data-keep-table className={vbTableClass}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={vbCell}>Their attack</th>
                    <th className={`${vbCell} text-right`}>Share</th>
                    <th className={`${vbCell} text-right`}>Attempts</th>
                    <th
                      className={`${vbCell} text-right`}
                      title="(kills − errors − blocked) ÷ attempts"
                    >
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.tempos.map((row) => (
                    <tr key={row.tempo} className={vbRowClass}>
                      <td className={vbCell}>{vbLabel(row.tempo)}</td>
                      <td className={vbNum}>{vbShare(row.share)}</td>
                      <td className={vbNum}>{row.Attempts}</td>
                      <td className={vbNum}>{vbPct(row.efficiency)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className={vbCell}>All attacks</td>
                    <td className={vbNum} />
                    <td className={vbNum}>{summary.attempts}</td>
                    <td className={vbNum}>{vbPct(summary.efficiency)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Fact
                  label="Off-speed shots"
                  value={vbShare(summary.offSpeed)}
                  title="Tips and roll shots as a share of their attacks"
                />
                <Fact
                  label="Pass grade"
                  value={summary.passGrade.toFixed(2)}
                  title="Their average serve-receive pass, on a 0–3 scale"
                />
                <Fact
                  label="Perfect passes"
                  value={vbShare(summary.perfectShare)}
                />
                <Fact
                  label="Passers"
                  value={summary.passers.toFixed(1)}
                  title="How many players they receive serve with"
                />
                <Fact
                  label="Blockers up"
                  value={summary.blockersUp.toFixed(2)}
                  title="Average blockers on each attack they faced"
                />
                <Fact
                  label="Stuffs a match"
                  value={summary.stuffs.toFixed(1)}
                />
                <Fact
                  label="Aces"
                  value={vbShare(summary.aceShare)}
                  title="Aces as a share of their serves"
                />
                <Fact
                  label="Service errors"
                  value={vbShare(summary.serveErrorShare)}
                />
                <Fact label="Jump serves" value={vbShare(summary.jumpShare)} />
                <Fact
                  label="Hitting allowed"
                  value={vbPct(summary.allowed)}
                  title="Their opponents' attack efficiency against them"
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-left text-xs uppercase text-(--text-muted)">
                Where they serve
              </div>
              <div className="grid w-44 grid-cols-3 border-t-4 border-(--text-primary)">
                {zoneLayout.map((zone) => {
                  const share = summary.zoneTotal
                    ? (summary.zones[zone] ?? 0) / summary.zoneTotal
                    : 0;
                  return (
                    <div
                      key={zone}
                      className="relative flex h-14 flex-col items-center justify-center border border-(--border-primary) text-sm"
                    >
                      <div
                        className="absolute inset-0 bg-(--accent-primary)"
                        style={{ opacity: share * 0.8 }}
                      />
                      <span className="relative font-semibold tabular-nums">
                        {vbShare(share)}
                      </span>
                      <span className="relative text-xs text-(--text-muted)">
                        zone {zone}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 w-44 text-left text-xs text-(--text-muted)">
                Your half of the court, net at the top.
              </div>
            </div>
          </div>
        ) : (
          <VbEmpty>
            {opponent.Name} has no published match to go on yet.
          </VbEmpty>
        )}
        {summary && (
          <div className="px-3 pb-2 text-left text-xs text-(--text-muted)">
            Added up from the public tactics reports of their latest matches
            {spans.length ? ` (${spans.join(" and ")})` : ""}. It shows what
            they did, not what they will do: a coach can change their system
            before you meet.
          </div>
        )}
      </VbLoad>
    </VbPanel>
  );
};

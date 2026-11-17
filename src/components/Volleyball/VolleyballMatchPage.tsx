import { SportSegmented } from "../Common/SportKit";
import { FC, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { SportButton } from "../Common/SportKit";
import { Logo } from "../../_design/Logo";
import { Tag } from "../../_design/Tags";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbBoxLine,
  VbBoxScore,
  VbFaces,
  VbLeague,
  VbLeagueKind,
  VbMatch,
  VbTacticsReportTeam,
  VbTeam,
  VolleyballReplayService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbTeams } from "./useVbData";
import {
  useVbSort,
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbLinkClass,
  vbLinkProps,
  VbLoad,
  vbNum,
  VbPanel,
  VbPlayerFace,
  vbRowClass,
  VbSortHeader,
  vbStickyCell,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import {
  vbLabel,
  vbMatchKindLabel,
  vbMatchWhen,
  vbPaths,
  vbPct,
  vbResult,
  vbShare,
  vbTeamLogo,
} from "./vbFormatting";
import { VbPlayerLink } from "./VbPlayerCard";
import { VbPageShell } from "./VbPageShell";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { VbReplayViewer } from "./VbReplayViewer";
import { LiveBadge, sportTeamColors } from "../Common/sportTheme";
import {
  useVbAiringRefresh,
  VbAiring,
  vbAirTime,
  vbCountdown,
  VbLiveMatch,
  useVbNow,
  vbAiring,
} from "./VbBroadcast";

interface MatchTabProps {
  kind: VbLeagueKind;
  match: VbMatch;
}

const teamName = (match: VbMatch, teamId: number) =>
  teamId === match.HomeTeamID ? match.HomeName : match.AwayName;

/** A team colour usable as a strip: a very bright primary gives way to the secondary. */
const stripOf = (team: VbTeam | undefined) =>
  sportTeamColors(team?.ColorOne, team?.ColorTwo).color;

const MatchHeader: FC<
  MatchTabProps & {
    league: VbLeague;
    onWatch?: () => void;
    airing: VbAiring | null;
  }
> = ({ kind, match, league, onWatch, airing }) => {
  // Counts down to the start, a second at a time.
  const now = useVbNow(airing?.state === "upcoming" ? 1_000 : 60_000);
  const { vbTeamsById } = useSimVBStore();
  const result = vbResult(match);
  const side = (teamId: number, name: string, sets: number | undefined) => {
    const won = result?.WinnerTeamID === teamId;
    const color = stripOf(vbTeamsById[teamId]);
    return (
      <div
        className="flex flex-1 flex-col items-center gap-1 px-2 py-4"
        style={{
          borderTop: `6px solid ${color}`,
          // The team's colour, faint, behind its side of the scoreboard.
          backgroundColor: `${color}22`,
        }}
      >
        <Logo
          url={vbTeamLogo(vbTeamsById[teamId], kind, league)}
          variant="normal"
        />
        <div className={won ? "font-bold" : ""}>
          <VbTeamLink kind={kind} teamId={teamId} name={name} showLogo={false} />
        </div>
        {result && (
          <div
            className={`text-5xl tabular-nums ${won ? "font-bold" : "text-(--text-muted)"}`}
          >
            {sets}
          </div>
        )}
        {won && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--accent-success)">
            Winner
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl bg-(--sport-surface) [box-shadow:var(--sport-shadow)]">
      <div className="flex items-stretch">
        {side(match.AwayTeamID, match.AwayName, result?.SetsAway)}
        <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 px-2 text-center text-xs text-(--text-muted)">
          <div className="font-semibold uppercase text-(--text-primary)">
            {result ? (
              "Final"
            ) : airing?.state === "live" ? (
              <LiveBadge />
            ) : airing?.state === "upcoming" ? (
              `Airs ${vbAirTime(airing.startsAt)}`
            ) : airing ? (
              "Ended"
            ) : (
              "Not played"
            )}
          </div>
          <div>{match.NeutralSite ? "Neutral site" : "Away at home"}</div>
          <div>{vbMatchWhen(match)}</div>
          <div>
            {match.LeagueTime.Season} · {vbMatchKindLabel(match.Kind)}
          </div>
        </div>
        {side(match.HomeTeamID, match.HomeName, result?.SetsHome)}
      </div>
      {result ? (
        <div className="overflow-x-auto border-t border-(--sport-divider) py-2">
          <table data-keep-table className="mx-auto text-sm tabular-nums">
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Set</th>
                {result.Sets.map((set) => (
                  <th key={set.SetNumber} className={`${vbCell} text-right`}>
                    {set.SetNumber}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["Away", "Home"] as const).map((sideKey) => (
                <tr key={sideKey}>
                  <td className={`${vbCell} text-left`}>
                    {sideKey === "Away" ? match.AwayName : match.HomeName}
                  </td>
                  {result.Sets.map((set) => {
                    const other = sideKey === "Away" ? "Home" : "Away";
                    return (
                      <td
                        key={set.SetNumber}
                        className={`${vbNum} ${set[sideKey] > set[other] ? "font-bold" : "text-(--text-muted)"}`}
                      >
                        {set[sideKey]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {onWatch && (
            <div className="mt-2 flex justify-center">
              <SportButton size="sm" onClick={onWatch}>
                ▶ Watch the match
              </SportButton>
            </div>
          )}
        </div>
      ) : airing?.state === "upcoming" ? (
        <div className="border-t border-(--sport-divider) p-3 text-center text-sm">
          <div className="text-2xl font-bold tabular-nums">
            {vbCountdown(airing.startsAt - now)}
          </div>
          <div className="text-(--text-muted)">
            Airs {new Date(airing.startsAt).toLocaleString([], {
              weekday: "long",
              hour: "numeric",
              minute: "2-digit",
            })}
            . It is shown live on this page, and no result appears anywhere
            until it has aired.
          </div>
        </div>
      ) : airing ? null : (
        <div className="border-t border-(--sport-divider) p-3 text-center text-sm text-(--text-muted)">
          This match has not been played yet.
        </div>
      )}
    </div>
  );
};

const SummaryTab: FC<MatchTabProps> = ({ match }) => {
  const summary = useVbResource(`match-summary:${match.MatchID}`, () =>
    VolleyballService.getMatchSummary(match.MatchID),
  );
  return (
    <VbPanel>
      <VbLoad loading={summary.loading} error={summary.error} rows={4}>
        <div className="space-y-3 p-4 text-left text-sm">
          {summary.data?.Match && <p>{summary.data.Match}</p>}
          {summary.data?.Sets.map((set) => (
            <p key={set.SetNumber}>
              <span className="mr-2 font-semibold">Set {set.SetNumber}</span>
              {set.Text}
            </p>
          ))}
        </div>
      </VbLoad>
    </VbPanel>
  );
};

// Volleyball's standard box score line.
const boxColumns: Array<[key: keyof VbBoxLine, label: string, title: string]> = [
  ["K", "K", "Kills"],
  ["E", "E", "Attack errors"],
  ["TA", "TA", "Total attempts"],
  ["PCT", "PCT", "Hitting percentage: (kills − errors) ÷ attempts"],
  ["A", "A", "Assists"],
  ["SA", "SA", "Service aces"],
  ["SE", "SE", "Service errors"],
  ["RE", "RE", "Reception errors"],
  ["DIG", "DIG", "Digs"],
  ["BS", "BS", "Solo blocks"],
  ["BA", "BA", "Block assists"],
  ["BHE", "BHE", "Ball-handling errors"],
  ["PassRating", "PASS", "Average pass rating, 0 to 3"],
];

const boxCell = (line: VbBoxLine, key: keyof VbBoxLine) => {
  const value = line[key];
  if (key === "PCT") return vbPct(value);
  if (key === "PassRating") return value === null ? "—" : value.toFixed(2);
  return value;
};

type BoxPlayer = VbBoxScore["Players"][number];
type BoxKey = keyof VbBoxLine | "Name" | "S" | "PTS" | "Jersey" | "Position";

const boxValue = (player: BoxPlayer, key: BoxKey) => {
  if (key === "Jersey") {
    return player.Jersey ? Number(player.Jersey) : null;
  }
  if (key === "Position") return player.Position ?? null;
  return player[key];
};

const leaderStats: Array<[key: "K" | "A" | "DIG" | "SA", label: string]> = [
  ["K", "Kills"],
  ["A", "Assists"],
  ["DIG", "Digs"],
  ["SA", "Aces"],
];

const TeamBox: FC<{
  kind: VbLeagueKind;
  team: VbBoxScore["Teams"][number];
  players: BoxPlayer[];
  faces: VbFaces | undefined;
}> = ({ kind, team, players, faces }) => {
  const { vbTeamsById, vbLeagues } = useSimVBStore();
  const club = vbTeamsById[team.TeamID];
  const strip = stripOf(club);
  const sort = useVbSort<BoxPlayer, BoxKey>(players, boxValue, "PTS", "desc");
  // Whoever led the team in each of the headline numbers.
  const leaders = leaderStats.flatMap(([key, label]) => {
    const best = [...players].sort((a, b) => b[key] - a[key])[0];
    return best && best[key] > 0 ? [{ key, label, player: best }] : [];
  });

  return (
    <div className="mb-3 overflow-hidden rounded-xl bg-(--sport-surface) [box-shadow:var(--sport-shadow)]">
      <div
        className={`flex flex-wrap items-center gap-3 px-3 py-2 ${getTextColorBasedOnBg(strip)}`}
        style={{ backgroundColor: strip }}
      >
        <Logo url={vbTeamLogo(club, kind, vbLeagues[kind])} variant="small" />
        <div className="text-left">
          <div className="text-lg font-bold">{team.Name}</div>
          <div className="text-xs">
            {team.K} kills · {vbPct(team.PCT)} hitting · {team.SA} aces ·{" "}
            {team.BS + team.BA / 2} blocks · {team.DIG} digs
          </div>
        </div>
      </div>
      {leaders.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-b border-(--sport-divider) p-2 lg:grid-cols-4">
          {leaders.map(({ key, label, player }) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg bg-(--sport-surface-2) p-2 text-left"
              style={{ borderLeft: `4px solid ${strip}` }}
            >
              <VbPlayerFace
                face={faces?.[player.PlayerID]}
                team={club ?? null}
                variant="avatar"
                classes="h-12 w-12"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-(--text-muted)">
                  {label}
                </div>
                <div className="truncate text-sm">
                  <VbPlayerLink
                    playerId={player.PlayerID}
                    name={player.Name}
                    face={false}
                  />
                </div>
                <div className="text-lg font-bold tabular-nums">{player[key]}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table data-keep-table className={`${vbTableClass} min-w-[880px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <VbSortHeader label="#" column="Jersey" sort={sort} title="Jersey" />
              <VbSortHeader label="Player" column="Name" sort={sort} />
              <VbSortHeader label="Pos" column="Position" sort={sort} title="The role she started in; blank for a substitute" />
              <VbSortHeader label="S" column="S" sort={sort} numeric title="Sets played" />
              {boxColumns.map(([key, label, title]) => (
                <VbSortHeader key={key} label={label} column={key} sort={sort} numeric title={title} />
              ))}
              <VbSortHeader label="PTS" column="PTS" sort={sort} numeric title="Points: kills + aces + blocks, a block assist counting half" />
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((player) => (
              <tr key={player.PlayerID} className={vbRowClass}>
                <td className={`${vbCell} text-(--text-muted)`}>
                  {player.Jersey ?? ""}
                </td>
                <td className={`${vbCell} ${vbStickyCell}`}>
                  <div className="flex items-center gap-2">
                    <VbPlayerFace
                      face={faces?.[player.PlayerID]}
                      team={club ?? null}
                      variant="avatar"
                      classes="h-7 w-7"
                    />
                    <VbPlayerLink
                      playerId={player.PlayerID}
                      name={player.Name}
                      face={false}
                    />
                  </div>
                </td>
                <td className={vbCell}>{player.Position ?? ""}</td>
                <td className={vbNum}>{player.S}</td>
                {boxColumns.map(([key]) => (
                  <td key={key} className={vbNum}>
                    {boxCell(player, key)}
                  </td>
                ))}
                <td className={`${vbNum} font-semibold`}>{player.PTS}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold" style={{ borderTop: `2px solid ${strip}` }}>
              <td className={vbCell} />
              <td className={vbCell}>Team</td>
              <td className={vbCell} />
              <td className={vbNum} />
              {boxColumns.map(([key]) => (
                <td key={key} className={vbNum}>
                  {boxCell(team, key)}
                </td>
              ))}
              <td className={vbNum} title="Rally points won">
                {team.Points}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const BoxScoreTab: FC<MatchTabProps> = ({ kind, match }) => {
  const box = useVbResource(`box-score:${match.MatchID}`, () =>
    VolleyballService.getBoxScore(match.MatchID),
  );
  // Everyone who played, in one request.
  const ids = (box.data?.Players ?? [])
    .filter((player) => player.S > 0)
    .map((player) => player.PlayerID);
  const faces = useVbResource(
    ids.length ? `faces:match:${match.MatchID}` : null,
    () => VolleyballService.getFaces(ids),
  );
  return (
    <VbLoad loading={box.loading} error={box.error} rows={12}>
      {/* Away first, like the header. Players who did not play are left out. */}
      {[match.AwayTeamID, match.HomeTeamID].map((teamId) => {
        const team = box.data?.Teams.find((item) => item.TeamID === teamId);
        return team ? (
          <TeamBox
            key={teamId}
            kind={kind}
            team={team}
            faces={faces.data}
            players={
              box.data?.Players.filter(
                (player) => player.TeamID === teamId && player.S > 0,
              ) ?? []
            }
          />
        ) : null;
      })}
      <div className="text-left text-xs text-(--text-muted)">
        The team row's PTS is every rally point won, opponent errors included.
        Select a player for her profile.
      </div>
    </VbLoad>
  );
};

const PlayByPlayTab: FC<MatchTabProps> = ({ match }) => {
  const plays = useVbResource(`play-by-play:${match.MatchID}`, () =>
    VolleyballService.getPlayByPlay(match.MatchID),
  );
  const [set, setSet] = useState(1);
  const lines = plays.data?.Lines ?? [];
  const sets = [...new Set(lines.map((line) => line.Set))];
  const shown = lines.filter((line) => line.Set === set);

  return (
    <VbLoad loading={plays.loading} error={plays.error} rows={12}>
      {/* A whole match arrives in one response; one set is shown at a time. */}
      <SportSegmented
        classes="mb-2"
        label="Set"
        value={set}
        onChange={setSet}
        options={sets.map((n) => [n, `Set ${n}`] as const)}
      />
      <VbPanel>
        <table data-keep-table className={vbTableClass}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={`${vbCell} text-right`}>{match.AwayName}</th>
              <th className={`${vbCell} text-right`}>{match.HomeName}</th>
              <th className={vbCell}>Rally</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((line) => {
              const homeWon = line.WinnerTeamID === match.HomeTeamID;
              return (
                <tr key={line.Rally} className={vbRowClass}>
                  <td className={`${vbNum} align-top ${homeWon ? "" : "font-bold"}`}>
                    {line.Away}
                  </td>
                  <td className={`${vbNum} align-top ${homeWon ? "font-bold" : ""}`}>
                    {line.Home}
                  </td>
                  {/* The text opens with the score; the columns already show it. */}
                  <td className="px-2 py-1.5 text-left">
                    {line.Text.replace(/^\d+–\d+\.\s*/, "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </VbPanel>
    </VbLoad>
  );
};

const Stat: FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-(--text-muted)">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
  </div>
);

// Zones 1-6 as they sit on the receiving team's half, net at the top:
// front row 4-3-2, back row 5-6-1.
const zoneLayout = ["4", "3", "2", "5", "6", "1"];

const ServeZones: FC<{ byZone: Record<string, number> }> = ({ byZone }) => {
  const most = Math.max(1, ...Object.values(byZone));
  return (
    <div>
      <div className="mb-1 text-xs text-(--text-muted)">
        Serve targets by zone (net at top)
      </div>
      <div className="grid w-40 grid-cols-3 border-t-4 border-(--text-primary)">
        {zoneLayout.map((zone) => {
          const count = byZone[zone] ?? 0;
          return (
            <div
              key={zone}
              className="relative flex h-12 items-center justify-center border border-(--border-primary) text-sm font-semibold tabular-nums"
              title={`Zone ${zone}: ${count} serves`}
            >
              <div
                className="absolute inset-0 bg-(--accent-primary)"
                style={{ opacity: (count / most) * 0.5 }}
              />
              <span className="absolute left-1 top-0 text-[10px] font-normal text-(--text-muted)">
                {zone}
              </span>
              <span className="relative">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TeamTactics: FC<{
  kind: VbLeagueKind;
  name: string;
  report: VbTacticsReportTeam;
}> = ({ kind, name, report }) => (
  <VbPanel classes="flex-1">
    <div className="border-b border-(--sport-divider) px-3 py-2">
      <VbTeamLink kind={kind} teamId={report.TeamId} name={name} />
    </div>
    <div className="space-y-4 p-3 text-left">
      <div>
        <div className="mb-1 text-xs uppercase text-(--text-muted)">Attack</div>
        <table data-keep-table className={vbTableClass}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Set tempo</th>
              <th className={`${vbCell} text-right`}>Share</th>
              <th className={`${vbCell} text-right`}>Att</th>
              <th className={`${vbCell} text-right`}>K</th>
              <th className={`${vbCell} text-right`}>E</th>
              <th className={`${vbCell} text-right`} title="Blocked">Blk</th>
              <th className={`${vbCell} text-right`} title="Efficiency">Eff</th>
            </tr>
          </thead>
          <tbody>
            {report.Attack.ByTempo.map((row) => (
              <tr key={row.Tempo} className={vbRowClass}>
                <td className={vbCell}>{vbLabel(row.Tempo)}</td>
                <td className={vbNum}>{vbShare(row.Share)}</td>
                <td className={vbNum}>{row.Attempts}</td>
                <td className={vbNum}>{row.Kills}</td>
                <td className={vbNum}>{row.Errors}</td>
                <td className={vbNum}>{row.Blocked}</td>
                <td className={vbNum}>{vbPct(row.Efficiency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 space-y-1">
          <Stat label="Attack efficiency" value={vbPct(report.Attack.Efficiency)} />
          <Stat label="Off-speed shots" value={vbShare(report.Attack.OffSpeedShare)} />
          <Stat label="Setters used" value={report.Attack.Setters} />
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs uppercase text-(--text-muted)">Serve</div>
        <div className="flex flex-wrap gap-4">
          <ServeZones byZone={report.Serve.ByZone} />
          <div className="min-w-40 flex-1 space-y-1">
            <Stat label="Serves" value={report.Serve.Serves} />
            <Stat label="Aces" value={report.Serve.Aces} />
            <Stat label="Errors" value={report.Serve.Errors} />
            <Stat label="Jump serves" value={vbShare(report.Serve.JumpShare)} />
          </div>
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs uppercase text-(--text-muted)">
          Serve receive
        </div>
        <div className="space-y-1">
          <Stat label="Receptions" value={report.Receive.Receptions} />
          <Stat label="Passers used" value={report.Receive.Passers} />
          <Stat label="Average pass (0–3)" value={report.Receive.AverageGrade.toFixed(2)} />
          <Stat label="Perfect passes" value={vbShare(report.Receive.PerfectShare)} />
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs uppercase text-(--text-muted)">Block</div>
        <div className="space-y-1">
          <Stat label="Stuffs" value={report.Block.Stuffs} />
          <Stat label="Touches" value={report.Block.Touches} />
          <Stat label="Average blockers up" value={report.Block.AverageBlockersUp.toFixed(2)} />
          <Stat label="Opponent attack efficiency" value={vbPct(report.OpponentEfficiency)} />
        </div>
      </div>
    </div>
  </VbPanel>
);

const TacticsTab: FC<MatchTabProps> = ({ kind, match }) => {
  const report = useVbResource(`tactics-report:${match.MatchID}`, () =>
    VolleyballService.getTacticsReport(match.MatchID),
  );
  return (
    <VbLoad loading={report.loading} error={report.error} rows={10}>
      <div className="flex flex-col gap-3 lg:flex-row">
        {[match.AwayTeamID, match.HomeTeamID].map((teamId) => {
          const team = report.data?.Teams.find((item) => item.TeamId === teamId);
          return team ? (
            <TeamTactics
              key={teamId}
              kind={kind}
              name={teamName(match, teamId)}
              report={team}
            />
          ) : null;
        })}
      </div>
      <div className="text-left text-xs text-(--text-muted)">
        This is what each team did in the match. The settings behind it stay
        private to its coach.
      </div>
    </VbLoad>
  );
};

const HighlightsTab: FC<
  MatchTabProps & { onWatch: (set: number, rally: number) => void }
> = ({ match, onWatch }) => {
  const highlights = useVbResource(`highlights:${match.MatchID}`, () =>
    VolleyballService.getHighlights(match.MatchID),
  );
  const list = highlights.data?.Highlights ?? [];
  // After a season only some rallies keep their replays. A highlight is still
  // listed either way, so only offer to play one that can be played.
  const manifest = useVbResource(`replay-manifest:${match.MatchID}`, () =>
    VolleyballReplayService.getManifest(match.MatchID),
  );
  const kept = new Set(
    (manifest.data?.Sets ?? []).flatMap((set) =>
      set.Rallies.filter((rally) => rally.Retained).map(
        (rally) => `${set.SetNumber}:${rally.Rally}`,
      ),
    ),
  );
  return (
    <VbPanel>
      <VbLoad loading={highlights.loading} error={highlights.error} rows={4}>
        {list.length ? (
          <ul className="divide-y divide-(--border-primary)/40 text-left text-sm">
            {list.map((item) => (
              <li key={`${item.Set}:${item.Rally}`} className="space-y-1 p-3">
                <div className="text-xs text-(--text-muted)">
                  Set {item.Set} · Rally {item.Rally}
                  {kept.has(`${item.Set}:${item.Rally}`) ? (
                    <>
                      {" · "}
                      <span
                        {...vbLinkProps(() => onWatch(item.Set, item.Rally))}
                        className={vbLinkClass}
                      >
                        Watch
                      </span>
                    </>
                  ) : manifest.data ? (
                    " · replay not kept"
                  ) : null}
                </div>
                <div>{item.Title}</div>
                <div className="flex flex-wrap gap-1">
                  {item.Tags.map((tag) => (
                    <Tag key={tag}>{vbLabel(tag)}</Tag>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <VbEmpty>No highlights were picked from this match.</VbEmpty>
        )}
      </VbLoad>
    </VbPanel>
  );
};

type MatchTab =
  | "summary"
  | "box"
  | "plays"
  | "tactics"
  | "highlights"
  | "replay";

const tabs: Array<readonly [MatchTab, string]> = [
  ["summary", "Summary"],
  ["box", "Box Score"],
  ["plays", "Play-by-Play"],
  ["tactics", "Tactics"],
  ["highlights", "Highlights"],
  ["replay", "Replay"],
];

const rallyFrom = (set?: string, rally?: string) => {
  const numbers = { set: Number(set), rally: Number(rally) };
  return Number.isInteger(numbers.set) &&
    Number.isInteger(numbers.rally) &&
    numbers.set > 0 &&
    numbers.rally > 0
    ? numbers
    : undefined;
};

const MatchPageBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const { matchId, set, rally } = useParams<{
    matchId: string;
    set?: string;
    rally?: string;
  }>();
  const id = Number(matchId);
  const validId = Number.isInteger(id) && id > 0;
  useVbTeams(kind); // logos for the header and links
  const match = useVbResource(validId ? `match:${id}` : null, () =>
    VolleyballService.getMatch(id),
  );
  const { vbLeagues } = useSimVBStore();
  // A rally link (as Discord posts carry) opens straight on the replay.
  const [watching, setWatching] = useState(() => rallyFrom(set, rally));
  // A "Watch" link from a schedule names the tab to open on (?tab=); a rally
  // link opens on the replay.
  const [tab, setTab] = useSportSectionTab(
    tabs,
    watching ? "replay" : "summary",
  );
  // Whether any rally of this match can still be watched.
  const published = match.data?.Status === "published";
  const manifest = useVbResource(
    validId && published ? `replay-manifest:${id}` : null,
    () => VolleyballReplayService.getManifest(id),
  );
  const hasReplay = (manifest.data?.Sets ?? []).some((set) =>
    set.Rallies.some((rally) => rally.Retained),
  );
  // While the match is on air, its result is watched for; `refresh` reads
  // it at once when the broadcast says it is over.
  const { setVbResource } = useSimVBStore();
  const refresh = () => {
    VolleyballService.getMatch(id)
      .then((next) => setVbResource(`match:${id}`, next))
      .catch(() => {
        // The regular read below tries again.
      });
  };
  const now = useVbAiringRefresh(
    validId ? `match:${id}` : null,
    match.data ? [match.data] : [],
    () => VolleyballService.getMatch(id),
    20_000,
  );
  const airing = match.data ? vbAiring(match.data, now) : null;
  if (!validId) return <VbEmpty tone="error">That is not a match.</VbEmpty>;

  // A link can carry a match of the other league; send it to the right pages.
  const otherKind: VbLeagueKind = kind === "college" ? "pro" : "college";
  if (match.data && match.data.LeagueID === vbLeagues[otherKind]?.LeagueID) {
    return <Navigate to={vbPaths(otherKind).match(id)} replace />;
  }

  return (
    <VbLoad loading={match.loading} error={match.error}>
      {match.data && (
        <div className="space-y-2">
          <MatchHeader
            kind={kind}
            match={match.data}
            league={league}
            airing={airing}
            onWatch={
              hasReplay && tab !== "replay" ? () => setTab("replay") : undefined
            }
          />
          {airing && airing.state !== "upcoming" && (
            <VbLiveMatch match={match.data} onEnded={refresh} />
          )}
          {vbResult(match.data) && (
            <>
              <SportBannerSections
                // A match whose replays were not kept has no Replay tab, unless
                // a link asked for it: then the tab explains.
                tabs={tabs.filter(
                  ([key]) =>
                    key !== "replay" ||
                    hasReplay ||
                    tab === "replay" ||
                    !manifest.data,
                )}
                value={tab}
                onChange={setTab}
              />
              {tab === "summary" && <SummaryTab kind={kind} match={match.data} />}
              {tab === "box" && <BoxScoreTab kind={kind} match={match.data} />}
              {tab === "plays" && <PlayByPlayTab kind={kind} match={match.data} />}
              {tab === "tactics" && <TacticsTab kind={kind} match={match.data} />}
              {tab === "highlights" && (
                <HighlightsTab
                  kind={kind}
                  match={match.data}
                  onWatch={(watchSet, watchRally) => {
                    setWatching({ set: watchSet, rally: watchRally });
                    setTab("replay");
                  }}
                />
              )}
              {tab === "replay" && (
                // Keyed so a different highlight opens on its own rally.
                <VbReplayViewer
                  key={watching ? `${watching.set}:${watching.rally}` : "start"}
                  match={match.data}
                  start={watching}
                  linkFor={(ref) => vbPaths(kind).rally(id, ref.set, ref.rally)}
                />
              )}
            </>
          )}
        </div>
      )}
    </VbLoad>
  );
};

export const VolleyballMatchPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Match">
    {(league) => <MatchPageBody kind={kind} league={league} />}
  </VbPageShell>
);

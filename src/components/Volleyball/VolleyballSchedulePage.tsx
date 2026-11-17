import { FC, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SportSegmented, SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportBannerFacts,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeague,
  VbLeagueKind,
  VbLeagueSchedule,
  VbMatch,
  VbTeam,
  VbTeamSchedule,
  VbTournament,
  vbPollRows,
  VolleyballService,
} from "../../_services/volleyballService";
import {
  useVbResource,
  useVbSeasons,
  useVbStandingsById,
  useVbTeams,
  useVbTop25,
} from "./useVbData";
import { vbChronological } from "./VolleyballTeamTabs";
import {
  VbBannerSeason,
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
  vbMatchKindLabel,
  vbMatchWhen,
  vbPaths,
  vbRecord,
  vbResult,
  vbSetScores,
} from "./vbFormatting";
import { VbPageShell } from "./VbPageShell";
import { VbMatchTile } from "./VbMatchTile";
import { useVbAiringRefresh, vbAiring } from "./VbBroadcast";
import { VbClassRankings } from "./VbClassRankings";
import { LiveBadge } from "../Common/sportTheme";

interface SeasonTabProps {
  kind: VbLeagueKind;
  league: VbLeague;
  season: number;
}

// Used only until the clock's calendar has loaded.
const REGULAR_SEASON_WEEKS = 15;

// A part of the season to list: a regular-season week or a tournament. The
// pro playoffs are filed under the conference-tournament phase.
type SeasonPart = number | "conference_tournament" | "national_tournament";

const tournamentParts = (kind: VbLeagueKind): Array<[SeasonPart, string]> =>
  kind === "college"
    ? [
        ["conference_tournament", "Conference tournaments"],
        ["national_tournament", "National tournament"],
      ]
    : [["conference_tournament", "Playoffs"]];

const WeekMatches: FC<SeasonTabProps> = ({ kind, league, season }) => {
  const navigate = useNavigate();
  const { clock } = useVbSeasons(kind);
  const liveWeek =
    clock && clock.Season === season && clock.Phase === "regular_season"
      ? clock.Week
      : null;
  const [pickedPart, setPickedPart] = useState<SeasonPart | null>(null);
  const tournaments = tournamentParts(kind);
  // During a tournament the clock's phase is the part being played.
  const livePart: SeasonPart | null =
    liveWeek ??
    (clock && clock.Season === season
      ? (tournaments.find(([part]) => part === clock.Phase)?.[0] ?? null)
      : null);
  const week = pickedPart ?? livePart ?? 1;
  const isWeek = typeof week === "number";
  const partLabel = isWeek
    ? `Week ${week}`
    : (tournaments.find(([part]) => part === week)?.[1] ?? "");
  // One team's whole season instead of a week, kept in the address (?team=)
  // so it can be linked to.
  const [search, setSearch] = useSearchParams();
  const askedTeam = Number(search.get("team"));
  const teamId =
    Number.isInteger(askedTeam) && askedTeam > 0 ? askedTeam : null;
  const pickTeam = (id: number | null) =>
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        if (id) next.set("team", String(id));
        else next.delete("team");
        return next;
      },
      { replace: true },
    );
  const teams = useVbTeams(kind);
  const team = teamId ? teams?.find((item) => item.TeamID === teamId) : undefined;
  // Kept on screen while the league moves on (a slate publishing empties
  // the cache), so tiles do not blink back to loading mid-broadcast. Only
  // the one being shown is read.
  const weekKey = `league-schedule:${league.LeagueID}:${season}:${week}`;
  const teamKey = teamId ? `team-schedule:${teamId}:${season}` : null;
  const readWeek = () =>
    VolleyballService.getLeagueSchedule(league.LeagueID, season, week);
  const readTeam = () => VolleyballService.getTeamSchedule(teamId!, season);
  const weekSchedule = useVbResource(teamId ? null : weekKey, readWeek, {
    keepWhileReloading: true,
  });
  // The same key as the Team page's schedule, so the two share it.
  const teamSchedule = useVbResource(teamKey, readTeam, {
    keepWhileReloading: true,
  });
  const schedule = teamId ? teamSchedule : weekSchedule;
  const shownMatches = teamId
    ? vbChronological(teamSchedule.data?.Matches ?? [])
    : (weekSchedule.data?.Matches ?? []);
  // While any of these matches is on air, results are watched for.
  const now = useVbAiringRefresh<VbLeagueSchedule | VbTeamSchedule>(
    teamKey ?? weekKey,
    shownMatches,
    teamId ? readTeam : readWeek,
  );
  const weeks = Math.max(
    clock?.Calendar?.RegularSeasonWeeks ?? REGULAR_SEASON_WEEKS,
    liveWeek ?? 0,
  );
  // Every rally is kept while its season is being played. Afterwards only a
  // few are, so a finished season's tiles offer the box score; the match
  // page itself knows whether its replay survived.
  const watchable = (match: VbMatch) =>
    Boolean(clock && clock.Season === match.LeagueTime.Season);
  const { vbTeamsById } = useSimVBStore();
  // Each team's record beside its name, and a college team's top-25 rank.
  const standings = useVbStandingsById(league, season);
  const top25 = useVbTop25(kind === "college" ? league : null, season);
  const conferences = useVbResource(
    kind === "college" ? `conferences:${league.LeagueID}` : null,
    () => VolleyballService.getConferences(league.LeagueID),
  );
  const [conferenceId, setConferenceId] = useState<number | null>(null);
  const [liveOnly, setLiveOnly] = useState(false);
  const isLive = (match: VbMatch) => vbAiring(match, now)?.state === "live";
  const liveCount = shownMatches.filter(isLive).length;
  const showLiveOnly = liveOnly && liveCount > 0;
  const listed = shownMatches.filter(
    (match) =>
      (!showLiveOnly || isLive(match)) &&
      // A conference's matches: any with at least one of its teams. A
      // team's own season ignores the conference choice.
      (teamId !== null ||
        conferenceId === null ||
        vbTeamsById[match.HomeTeamID]?.ConferenceID === conferenceId ||
        vbTeamsById[match.AwayTeamID]?.ConferenceID === conferenceId),
  );
  // A week's matches on air come first, the rest in the API's date order; a
  // team's season stays in the order it is played.
  const matches = teamId
    ? listed
    : [...listed.filter(isLive), ...listed.filter((match) => !isLive(match))];
  // Every team to pick from; a college's grouped by conference.
  const teamOptions = useMemo(() => {
    const sorted = [...(teams ?? [])].sort((a, b) => a.Name.localeCompare(b.Name));
    const option = (item: VbTeam) => ({ value: String(item.TeamID), label: item.Name });
    if (kind !== "college") return sorted.map(option);
    const groups = new Map<string, VbTeam[]>();
    for (const item of sorted) {
      const name = item.Conference ?? "Independent";
      groups.set(name, [...(groups.get(name) ?? []), item]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, members]) => ({ label, options: members.map(option) }));
  }, [teams, kind]);
  const teamStanding = teamId ? standings.get(teamId) : undefined;
  const teamName = team?.Name ?? shownMatches.find((match) => match.HomeTeamID === teamId)?.HomeName ??
    shownMatches.find((match) => match.AwayTeamID === teamId)?.AwayName;
  const heading = teamId ? `${teamName ?? "Team"} · ${season} season` : partLabel;
  // What the page is showing, on the banner.
  useSportBannerFacts([
    heading,
    liveCount > 0 && `${liveCount} live`,
  ]);

  return (
    <>
      {/* The week being played carries a dot. A team's whole season needs
          no week. */}
      {!teamId && (
        <SportSegmented
          classes="mb-2"
          label="Part of the season"
          value={week}
          onChange={setPickedPart}
          options={[
            ...Array.from({ length: weeks }, (_, index) => index + 1).map(
              (n) =>
                [n, n === liveWeek ? `Wk ${n} •` : `Wk ${n}`] as const,
            ),
            ...tournaments.map(
              ([part, label]) =>
                [part, part === livePart ? `${label} •` : label] as const,
            ),
          ]}
        />
      )}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-72">
          <SportSelect
            aria-label="A team's whole season"
            placeholder="A team's whole season..."
            isClearable
            options={teamOptions}
            value={
              teamId
                ? { value: String(teamId), label: teamName ?? `Team ${teamId}` }
                : null
            }
            onChange={(option) => pickTeam(option ? Number(option.value) : null)}
          />
        </div>
        {kind === "college" && !teamId && (
          <select
            value={conferenceId ?? ""}
            onChange={(event) =>
              setConferenceId(event.target.value ? Number(event.target.value) : null)
            }
            aria-label="Conference"
            className="w-full rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) sm:w-72"
          >
            <option value="">All conferences</option>
            {[...(conferences.data ?? [])]
              .sort((a, b) => a.Name.localeCompare(b.Name))
              .map((conference) => (
                <option key={conference.ConferenceID} value={conference.ConferenceID}>
                  {conference.Name}
                </option>
              ))}
          </select>
        )}
        <span className="text-sm text-(--text-muted)">
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
        {liveCount > 0 && (
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={(event) => setLiveOnly(event.target.checked)}
            />
            <LiveBadge label={`${liveCount} live`} />
            <span className="text-(--text-muted)">· show only these</span>
          </label>
        )}
      </div>
      <div className="text-left text-sm font-semibold">
        {heading}
        {teamStanding && (
          <span className="ml-2 font-normal text-(--text-muted)">
            {vbRecord(teamStanding)}
            {kind === "college" && teamStanding.ConferenceID != null
              ? ` (${vbRecord({ Wins: teamStanding.ConfWins, Losses: teamStanding.ConfLosses })} conf)`
              : ""}
          </span>
        )}
      </div>
      <VbLoad loading={schedule.loading} error={schedule.error} rows={12}>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <VbMatchTile
              key={match.MatchID}
              kind={kind}
              match={match}
              watchable={watchable(match)}
              now={now}
              standings={standings}
              ranks={top25}
            />
          ))}
        </div>
        {!matches.length && (
          <VbEmpty>
            {teamId
              ? `${teamName ?? "This team"} has no matches in ${season}.`
              : conferenceId !== null
                ? "No match here involves a team from that conference."
              : isWeek
                ? `No matches are scheduled for week ${week} of ${season}.`
                : `No ${partLabel.toLowerCase()} matches for ${season} yet.`}
          </VbEmpty>
        )}
        {matches.some((match) => vbResult(match)) && (
          <div className="text-left text-xs text-(--text-muted)">
            {clock && clock.Season === season
              ? "Every rally of this season's matches can be watched."
              : "After a season only a few replays are kept. A match page offers its replay when it has one."}
          </div>
        )}
      </VbLoad>
      {!isWeek && !teamId && (
        <div className="text-left text-xs text-(--text-muted)">
          In date order. The same matches are drawn as brackets under Brackets.
        </div>
      )}
    </>
  );
};

const Standings: FC<SeasonTabProps> = ({ kind, league, season }) => {
  const { cvbTeam } = useSimVBStore();
  const college = kind === "college";
  const conferences = useVbResource(
    college ? `conferences:${league.LeagueID}` : null,
    () => VolleyballService.getConferences(league.LeagueID),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const conferenceId = college
    ? (picked ??
      cvbTeam?.ConferenceID ??
      conferences.data?.[0]?.ConferenceID ??
      null)
    : undefined;
  const standings = useVbResource(
    conferenceId === null
      ? null
      : `standings:${league.LeagueID}:${season}:${conferenceId ?? "all"}`,
    () => VolleyballService.getStandings(league.LeagueID, season, conferenceId!),
  );
  const options = (conferences.data ?? []).map((conference) => ({
    value: String(conference.ConferenceID),
    label: conference.Name,
  }));
  const rows = standings.data?.Standings ?? [];

  return (
    <>
      {college && (
        <div className="mb-2 w-full sm:w-80">
          <SportSelect
            options={options}
            value={
              options.find((option) => option.value === String(conferenceId)) ??
              null
            }
            placeholder="Select a conference..."
            onChange={(option) => option && setPicked(Number(option.value))}
          />
        </div>
      )}
      <VbPanel>
        <VbLoad
          loading={standings.loading || conferences.loading}
          error={standings.error ?? conferences.error}
          rows={10}
        >
          <table data-keep-table className={`${vbTableClass} min-w-[760px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbCell} text-right`}>#</th>
                <th className={vbCell}>Team</th>
                {college && <th className={`${vbCell} text-right`}>Conf</th>}
                <th className={`${vbCell} text-right`}>Overall</th>
                <th className={`${vbCell} text-right`}>Home</th>
                <th className={`${vbCell} text-right`}>Road</th>
                <th className={`${vbCell} text-right`}>Sets</th>
                <th className={`${vbCell} text-right`}>Points</th>
                <th className={`${vbCell} text-right`}>Streak</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.TeamID} className={vbRowClass}>
                  <td className={vbNum}>{row.Rank}</td>
                  <td className={vbCell}>
                    <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                  </td>
                  {college && (
                    <td className={vbNum}>
                      {row.ConfWins}-{row.ConfLosses}
                    </td>
                  )}
                  <td className={vbNum}>
                    {row.Wins}-{row.Losses}
                  </td>
                  <td className={vbNum}>
                    {row.HomeWins}-{row.HomeLosses}
                  </td>
                  <td className={vbNum}>
                    {row.RoadWins}-{row.RoadLosses}
                  </td>
                  <td className={vbNum}>
                    {row.SetsWon}-{row.SetsLost}
                  </td>
                  <td className={vbNum}>
                    {row.PointsFor}-{row.PointsAgainst}
                  </td>
                  <td className={vbNum}>{row.Streak || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <VbEmpty>No standings for {season} yet.</VbEmpty>}
        </VbLoad>
      </VbPanel>
    </>
  );
};

const Rankings: FC<SeasonTabProps> = ({ kind, league, season }) => {
  const [measure, setMeasure] = useState<"poll" | "elo" | "rpi">("poll");
  // Every team: the route's default is the top 25.
  const poll = useVbResource(
    measure === "poll" ? `poll:${league.LeagueID}:${season}:all` : null,
    () => VolleyballService.getPollRankings(league.LeagueID, season, 400),
  );
  const pollRows = vbPollRows(poll.data?.Rankings);
  const elo = useVbResource(
    measure === "elo" ? `elo:${league.LeagueID}:${season}` : null,
    () => VolleyballService.getEloRankings(league.LeagueID, season),
  );
  const rpi = useVbResource(
    measure === "rpi" ? `rpi:${league.LeagueID}:${season}` : null,
    () => VolleyballService.getRpiRankings(league.LeagueID, season),
  );
  // A season with no RPI yet comes back with every team at zero games (the
  // pro league's always does, 05-backend-gaps-and-open-decisions.md).
  const rpiRows = rpi.data?.Rankings.some((row) => row.Games)
    ? rpi.data.Rankings
    : [];
  // Records as the standings have them; the rankings routes' own can be wrong.
  const standings = useVbStandingsById(league, season);
  const record = (row: { TeamID: number; Wins: number; Losses: number }) => {
    return vbRecord(standings.get(row.TeamID) ?? row);
  };
  const active = measure === "poll" ? poll : measure === "elo" ? elo : rpi;
  const [showAll, setShowAll] = useState(false);
  const total =
    measure === "poll"
      ? pollRows.length
      : measure === "elo"
        ? (elo.data?.Rankings.length ?? 0)
        : rpiRows.length;
  const cap = showAll ? Infinity : 25;

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <SportSegmented
          label="Ranking"
          value={measure}
          onChange={setMeasure}
          options={[
            ["poll", "Poll"],
            ["elo", "Elo"],
            ["rpi", "RPI"],
          ]}
        />
        <span className="text-left text-xs text-(--text-muted)">
          {measure === "poll"
            ? "The league's poll, ranked the way a panel of voters would."
            : measure === "elo"
              ? "Elo rates every team by its results and its opponents' strength."
              : "RPI is the measure used to select and seed the tournament field."}
        </span>
      </div>
      <VbPanel>
        <VbLoad loading={active.loading} error={active.error} rows={12}>
          <table data-keep-table className={`${vbTableClass} min-w-[520px]`}>
            <thead className={vbHeadClass}>
              {measure === "poll" ? (
                <tr>
                  <th className={`${vbCell} text-right`}>#</th>
                  <th className={vbCell}>Team</th>
                  <th className={`${vbCell} text-right`}>Record</th>
                  <th
                    className={`${vbCell} text-right`}
                    title="The poll's own score: higher is better"
                  >
                    Score
                  </th>
                </tr>
              ) : measure === "elo" ? (
                <tr>
                  <th className={`${vbCell} text-right`}>#</th>
                  <th className={vbCell}>Team</th>
                  <th className={`${vbCell} text-right`}>Record</th>
                  <th className={`${vbCell} text-right`}>Elo</th>
                </tr>
              ) : (
                <tr>
                  <th className={`${vbCell} text-right`}>#</th>
                  <th className={vbCell}>Team</th>
                  <th className={`${vbCell} text-right`}>Games</th>
                  <th className={`${vbCell} text-right`}>RPI</th>
                  <th className={`${vbCell} text-right`} title="Winning percentage">WP</th>
                  <th className={`${vbCell} text-right`} title="Opponents' winning percentage">OWP</th>
                  <th className={`${vbCell} text-right`} title="Opponents' opponents' winning percentage">OOWP</th>
                </tr>
              )}
            </thead>
            <tbody>
              {measure === "poll"
                ? pollRows.slice(0, cap).map((row) => (
                    <tr key={row.TeamID} className={vbRowClass}>
                      <td className={vbNum}>{row.Rank}</td>
                      <td className={vbCell}>
                        <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                      </td>
                      <td className={vbNum}>{record(row)}</td>
                      <td className={vbNum}>{row.Score.toFixed(3)}</td>
                    </tr>
                  ))
                : measure === "elo"
                ? (elo.data?.Rankings ?? []).slice(0, cap).map((row) => (
                    <tr key={row.TeamID} className={vbRowClass}>
                      <td className={vbNum}>{row.Rank}</td>
                      <td className={vbCell}>
                        <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                      </td>
                      <td className={vbNum}>{record(row)}</td>
                      <td className={vbNum}>{row.Elo.toFixed(1)}</td>
                    </tr>
                  ))
                : rpiRows.slice(0, cap).map((row) => (
                    <tr key={row.TeamID} className={vbRowClass}>
                      <td className={vbNum}>{row.Rank}</td>
                      <td className={vbCell}>
                        <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                      </td>
                      <td className={vbNum}>{row.Games}</td>
                      <td className={vbNum}>{row.RPI.toFixed(4)}</td>
                      <td className={vbNum}>{row.WP.toFixed(3)}</td>
                      <td className={vbNum}>{row.OWP.toFixed(3)}</td>
                      <td className={vbNum}>{row.OOWP.toFixed(3)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {active.data && !total && (
            <VbEmpty>
              {measure === "poll"
                ? `No poll for ${season}.`
                : `No rankings for ${season} yet.`}
            </VbEmpty>
          )}
          {total > 25 && (
            <div className="px-3 py-2 text-center text-sm">
              <span
                {...vbLinkProps(() => setShowAll(!showAll))}
                className={vbLinkClass}
              >
                {showAll ? "Show the top 25 only" : `Show all ${total} teams`}
              </span>
            </div>
          )}
        </VbLoad>
      </VbPanel>
    </>
  );
};

const tournamentLabel = (tournament: VbTournament) =>
  tournament.Kind === "national"
    ? "National Tournament"
    : tournament.Kind === "pro_playoff"
      ? "Playoffs"
      : (tournament.Conference ?? "Conference Tournament");

const roundLabel = (round: number, rounds: number) =>
  ["Final", "Semifinals", "Quarterfinals"][rounds - round] ?? `Round ${round}`;

const Bracket: FC<{ kind: VbLeagueKind; tournament: VbTournament }> = ({
  kind,
  tournament,
}) => {
  const navigate = useNavigate();
  const names = useMemo(
    () =>
      Object.fromEntries(
        tournament.Seeds.map((seed) => [seed.TeamID, seed.Name]),
      ),
    [tournament],
  );
  const rounds = tournament.Bracket?.rounds ?? [];
  if (!rounds.length) return <VbEmpty>The bracket has not been drawn.</VbEmpty>;

  const side = (
    teamId: number | null,
    seed: number | null,
    winner: number | null,
  ) =>
    teamId === null ? (
      <div className="h-6 text-(--text-muted)">—</div>
    ) : (
      <div className={`h-6 ${winner === teamId ? "font-bold" : ""}`}>
        <VbTeamLink
          kind={kind}
          teamId={teamId}
          name={names[teamId] ?? `Team ${teamId}`}
          seed={seed}
        />
      </div>
    );

  return (
    <div className="flex gap-4 overflow-x-auto p-3">
      {rounds.map((slots, index) => (
        <div key={index} className="flex w-56 shrink-0 flex-col">
          <div className="mb-2 text-left text-xs uppercase text-(--text-muted)">
            {roundLabel(index + 1, rounds.length)}
          </div>
          <div className="flex flex-1 flex-col justify-around gap-2">
            {slots.map((slot) => (
              <div
                key={slot.slot}
                className="rounded-lg bg-(--sport-surface-2) p-2 text-sm"
              >
                {side(slot.teamA, slot.seedA, slot.winner)}
                {slot.bye ? (
                  <div className="h-6 text-left text-(--text-muted)">Bye</div>
                ) : (
                  side(slot.teamB, slot.seedB, slot.winner)
                )}
                {slot.matchId !== null && (
                  <div className="mt-1 text-right text-xs">
                    <span
                      {...vbLinkProps(() =>
                        navigate(vbPaths(kind).match(slot.matchId!)),
                      )}
                      className={vbLinkClass}
                    >
                      Match
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Brackets: FC<SeasonTabProps> = ({ kind, league, season }) => {
  const tournaments = useVbResource(
    `tournaments:${league.LeagueID}:${season}`,
    () => VolleyballService.getTournaments(league.LeagueID, season),
  );
  const [picked, setPicked] = useState<number | null>(null);
  // The national tournament (or the pro playoffs) first, then conferences.
  const list = useMemo(
    () =>
      [...(tournaments.data?.Tournaments ?? [])].sort(
        (a, b) =>
          Number(a.Kind === "conference") - Number(b.Kind === "conference") ||
          tournamentLabel(a).localeCompare(tournamentLabel(b)),
      ),
    [tournaments.data],
  );
  const tournament =
    list.find((item) => item.TournamentID === picked) ?? list[0];
  const options = list.map((item) => ({
    value: String(item.TournamentID),
    label: tournamentLabel(item),
  }));

  return (
    <VbLoad loading={tournaments.loading} error={tournaments.error}>
      {tournament ? (
        <>
          {list.length > 1 && (
            <div className="mb-2 w-full sm:w-80">
              <SportSelect
                options={options}
                value={
                  options.find(
                    (option) =>
                      option.value === String(tournament.TournamentID),
                  ) ?? null
                }
                onChange={(option) => option && setPicked(Number(option.value))}
              />
            </div>
          )}
          <VbPanel
            title={`${tournamentLabel(tournament)} · ${
              tournament.Champion
                ? `Champion: ${tournament.Champion}`
                : tournament.Status === "in_progress"
                  ? "In progress"
                  : "Not started"
            }`}
          >
            <Bracket kind={kind} tournament={tournament} />
          </VbPanel>
        </>
      ) : (
        <VbEmpty>No tournament field has been set for {season} yet.</VbEmpty>
      )}
    </VbLoad>
  );
};

type ScheduleTab =
  | "matches"
  | "standings"
  | "rankings"
  | "brackets"
  | "classes";

const allTabs: Array<readonly [ScheduleTab, string]> = [
  ["matches", "Matches"],
  ["standings", "Standings"],
  ["rankings", "Rankings"],
  ["brackets", "Brackets"],
  // College only: the pro league drafts.
  ["classes", "Recruiting Classes"],
];

const SchedulePageBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const { seasons, currentSeason } = useVbSeasons(kind);
  const tabs = allTabs.filter(
    ([key]) => key !== "classes" || kind === "college",
  );
  const [picked, setPicked] = useState<number | null>(null);
  // In the address: "Full rankings" on the league home opens on Rankings.
  const [tab, setTab] = useSportSectionTab(tabs, "matches");
  const season = picked ?? currentSeason;
  if (season === null) return <VbLoad loading error={null}>{null}</VbLoad>;

  return (
    <div className="space-y-2">
      <VbBannerSeason seasons={seasons} season={season} onChange={setPicked} />
      <SportBannerSections tabs={tabs} value={tab} onChange={setTab} />
      {/* Keyed by season so week and conference choices start fresh. */}
      {tab === "matches" && (
        <WeekMatches key={season} kind={kind} league={league} season={season} />
      )}
      {tab === "standings" && (
        <Standings kind={kind} league={league} season={season} />
      )}
      {tab === "rankings" && (
        <Rankings kind={kind} league={league} season={season} />
      )}
      {tab === "brackets" && (
        <Brackets key={season} kind={kind} league={league} season={season} />
      )}
      {tab === "classes" && <VbClassRankings league={league} season={season} />}
    </div>
  );
};

export const VolleyballSchedulePage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Schedule">
    {(league) => <SchedulePageBody kind={kind} league={league} />}
  </VbPageShell>
);

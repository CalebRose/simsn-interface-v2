import { SportSegmented } from "../Common/SportKit";
import { FC, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Logo } from "../../_design/Logo";
import { Tag } from "../../_design/Tags";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeague,
  VbLeagueKind,
  VbStatPhase,
  VbTeam,
  vbPollRows,
  VolleyballRecruitingService,
  VolleyballService,
} from "../../_services/volleyballService";
import {
  useVbResource,
  useVbSeasons,
  useVbStandingsById,
  useVbTeams,
} from "./useVbData";
import {
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
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import {
  vbHeight,
  vbLabel,
  vbMoney,
  vbPaths,
  vbRecord,
  vbTeamLogo,
} from "./vbFormatting";
import { VbLeagueFrame, VbPageShell } from "./VbPageShell";
import { VbRatingsGrid } from "./VbRatings";
import { VbGradeCard, vbGradeNote, vbGradesFor } from "./VbGrades";
import { VbPlayerStatsTable, VbStatToggles } from "./VbStats";
import { VbAwardList, VbFact } from "./VolleyballPlayerModal";
import { VbNewsPanel } from "./VolleyballStatsPages";
import { useVbRequestTeam } from "./VbClaimButton";
import { VbTeamDashboard, VbTeamOffice } from "./VolleyballDashboard";

const HOME_ROWS = 10;

const HomeBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const navigate = useNavigate();
  const { cvbTeam, pvbTeam } = useSimVBStore();
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  const { currentSeason } = useVbSeasons(kind);
  useVbTeams(kind);
  // The league's poll leads; standings place every team.
  const poll = useVbResource(
    currentSeason ? `poll:${league.LeagueID}:${currentSeason}:25` : null,
    () => VolleyballService.getPollRankings(league.LeagueID, currentSeason!, 25),
  );
  const pollRows = vbPollRows(poll.data?.Rankings);
  // The poll's own records can be wrong (the pro poll's are all 0-0); the
  // standings' are the league's.
  const records = useVbStandingsById(league, currentSeason);
  // The pro league's whole table fits here; a college coach sees their
  // whole conference. Someone without a college program gets the poll alone.
  const conferenceId =
    kind === "college" ? (ownTeam?.ConferenceID ?? null) : undefined;
  const standings = useVbResource(
    currentSeason && conferenceId !== null
      ? `standings:${league.LeagueID}:${currentSeason}:${conferenceId ?? "all"}`
      : null,
    () =>
      VolleyballService.getStandings(
        league.LeagueID,
        currentSeason!,
        conferenceId ?? undefined,
      ),
  );
  const showStandings = kind === "pro" || conferenceId != null;
  const paths = vbPaths(kind);
  const [rankRows, setRankRows] = useState(HOME_ROWS);

  return (
    <div className="space-y-3">
      {/* A coach's own team first: the same on the site's Home page. */}
      {ownTeam && <VbTeamDashboard kind={kind} team={ownTeam} />}
      <div className={`grid gap-3 ${showStandings ? "lg:grid-cols-2" : ""}`}>
        <VbPanel
          title={`Poll · ${currentSeason ?? ""}`}
          actions={
            <>
              <SportSegmented
                label="Rows shown"
                value={rankRows}
                onChange={setRankRows}
                options={[
                  [10, "Top 10"],
                  [25, "Top 25"],
                ]}
              />
              <span
                {...vbLinkProps(() =>
                  navigate(`${paths.schedule}?tab=rankings`),
                )}
                className={`text-sm ${vbLinkClass}`}
              >
                Full rankings →
              </span>
            </>
          }
        >
          <VbLoad loading={poll.loading} error={poll.error} rows={HOME_ROWS}>
            <table data-keep-table className={vbTableClass}>
              <thead className={vbHeadClass}>
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
              </thead>
              <tbody>
                {pollRows.slice(0, rankRows).map((row) => (
                  <tr key={row.TeamID} className={vbRowClass}>
                    <td className={vbNum}>{row.Rank}</td>
                    <td className={vbCell}>
                      <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                    </td>
                    <td className={vbNum}>
                      {vbRecord(records.get(row.TeamID) ?? row)}
                    </td>
                    <td className={vbNum}>{row.Score.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {poll.data && !pollRows.length && (
              <VbEmpty>No poll yet this season.</VbEmpty>
            )}
          </VbLoad>
        </VbPanel>
        {showStandings && (
          <VbPanel
            title={`${kind === "college" ? (ownTeam?.Conference ?? "Conference") : "Standings"} · ${currentSeason ?? ""}`}
          >
            <VbLoad
              loading={standings.loading}
              error={standings.error}
              rows={HOME_ROWS}
            >
              <table data-keep-table className={vbTableClass}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={`${vbCell} text-right`}>#</th>
                    <th className={vbCell}>
                      {kind === "college" ? "Team" : "Club"}
                    </th>
                    {kind === "college" && (
                      <th className={`${vbCell} text-right`}>Conf</th>
                    )}
                    <th className={`${vbCell} text-right`}>Record</th>
                    <th className={`${vbCell} text-right`}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Every team, however big the conference; yours marked. */}
                  {(standings.data?.Standings ?? []).map((row) => (
                      <tr
                        key={row.TeamID}
                        className={`${vbRowClass} ${
                          row.TeamID === ownTeam?.TeamID
                            ? "bg-(--sport-surface-2) font-semibold"
                            : ""
                        }`}
                        aria-current={
                          row.TeamID === ownTeam?.TeamID ? "true" : undefined
                        }
                      >
                        <td className={vbNum}>{row.Rank}</td>
                        <td className={vbCell}>
                          <VbTeamLink kind={kind} teamId={row.TeamID} name={row.Name} />
                        </td>
                        {kind === "college" && (
                          <td className={vbNum}>
                            {row.ConfWins}-{row.ConfLosses}
                          </td>
                        )}
                        <td className={vbNum}>
                          {row.Wins}-{row.Losses}
                        </td>
                        <td className={vbNum}>{row.Streak || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </VbLoad>
          </VbPanel>
        )}
      </div>
      <VbNewsPanel kind={kind} league={league} />
      {ownTeam && <VbTeamOffice kind={kind} team={ownTeam} />}
    </div>
  );
};

/**
 * The league's home. The site's Home page shows the same page for a league
 * the user coaches in (VolleyballHomeSection), so both have the same panels
 * and the same links.
 */
export const VolleyballLeagueHome: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Home" home>
    {(league) => <HomeBody kind={kind} league={league} />}
  </VbPageShell>
);

/** The league home inside the site's Home page, which has its own container. */
export const VolleyballHomeSection: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbLeagueFrame kind={kind} title="Home" home>
    {(league) => <HomeBody kind={kind} league={league} />}
  </VbLeagueFrame>
);

const TeamsBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const navigate = useNavigate();
  const { vbCoaches, cvbTeam, pvbTeam, vbLoading } = useSimVBStore();
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  const teams = useVbTeams(kind);
  const requestTeam = useVbRequestTeam();
  const [search, setSearch] = useState("");
  const [conference, setConference] = useState("");
  const needle = search.trim().toLowerCase();
  const conferenceNames = useMemo(
    () =>
      [...new Set((teams ?? []).map((team) => team.Conference ?? ""))]
        .filter(Boolean)
        .sort(),
    [teams],
  );
  const groups = useMemo(() => {
    const byConference = new Map<string, VbTeam[]>();
    [...(teams ?? [])]
      .filter(
        (team) =>
          (!conference || team.Conference === conference) &&
          (!needle ||
            team.Name.toLowerCase().includes(needle) ||
            team.Nickname.toLowerCase().includes(needle)),
      )
      .sort((a, b) => a.Name.localeCompare(b.Name))
      .forEach((team) => {
        const name = team.Conference ?? "";
        byConference.set(name, [...(byConference.get(name) ?? []), team]);
      });
    return [...byConference.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [teams, conference, needle]);

  return (
    <VbLoad loading={!teams} error={null} rows={12}>
      <div className="space-y-3">
        {/* Stays in reach while scrolling a long list on a phone. */}
        <div className="sticky top-16 z-10 flex flex-wrap gap-2 rounded-xl bg-(--sport-surface) p-2 [box-shadow:var(--sport-shadow)]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a team"
            aria-label="Find a team"
            className="min-w-0 flex-1 rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)"
          />
          {conferenceNames.length > 1 && (
            <select
              value={conference}
              onChange={(event) => setConference(event.target.value)}
              aria-label="Conference"
              className="w-full rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) sm:w-64"
            >
              <option value="">All conferences</option>
              {conferenceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        {teams && !groups.length && (
          <VbEmpty>No team matches that.</VbEmpty>
        )}
        {!vbLoading && !ownTeam && (
          <VbPanel>
            <div className="p-3 text-left text-sm">
              Want to coach?{" "}
              <span
                {...vbLinkProps(() => requestTeam(kind))}
                className={vbLinkClass}
              >
                Request a team on the Available Teams page
              </span>
              {vbCoaches[kind]
                ? ". "
                : "; you build your coach as part of the application. "}
              Any team without a Coached tag is open. You can coach one
              college program and one pro club at once, each with its own
              coach.
            </div>
          </VbPanel>
        )}
        {groups.map(([conference, members]) => (
          <VbPanel key={conference} title={conference || undefined}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((team) => (
                <div key={team.TeamID} className="flex items-center gap-2 text-sm">
                  <Logo
                    url={vbTeamLogo(team, kind, league)}
                    variant="tiny"
                    containerClass="shrink-0"
                  />
                  <span
                    {...vbLinkProps(() => navigate(vbPaths(kind).team(team.TeamID)))}
                    className={`truncate ${vbLinkClass}`}
                  >
                    {team.Name}
                  </span>
                  {team.Controller === "human" && (
                    <Tag variant="green">Coached</Tag>
                  )}
                </div>
              ))}
            </div>
          </VbPanel>
        ))}
      </div>
    </VbLoad>
  );
};

export const VolleyballTeamsPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Teams">
    {(league) => <TeamsBody kind={kind} league={league} />}
  </VbPageShell>
);

const positionNotes: Record<string, string> = {
  started: "The role she started in most in her latest season with starts",
  best_fit: "Her best-fit role: she has no starts on record",
  recruiting: "Her listed role as a recruit",
};

const PlayerBody: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const { playerId } = useParams<{ playerId: string }>();
  const id = Number(playerId);
  const validId = Number.isInteger(id) && id > 0;
  const profile = useVbResource(validId ? `player:${id}` : null, () =>
    VolleyballService.getPlayer(id),
  );
  const [phase, setPhase] = useState<VbStatPhase>("all");
  const [perSet, setPerSet] = useState(false);
  const stats = useVbResource(
    validId ? `player-stats:${id}:${phase}` : null,
    () =>
      VolleyballService.getPlayerStats(id, phase === "all" ? undefined : phase),
  );
  const awards = useVbResource(validId ? `player-awards:${id}` : null, () =>
    VolleyballService.getPlayerAwards(id),
  );
  const faces = useVbResource(validId ? `face:${id}` : null, () =>
    VolleyballService.getFaces([id]),
  );
  const { vbTeamsById } = useSimVBStore();
  const player = profile.data;
  const home = player ? (player.Team ?? player.LastTeam) : null;
  // A college coach sees their own staff's estimate of a college player.
  const { cvbTeam } = useSimVBStore();
  const scoutId =
    player && !player.ProRatings && cvbTeam ? cvbTeam.TeamID : undefined;
  const estimate = useVbResource(
    scoutId ? `estimate:${scoutId}:${id}` : null,
    () => VolleyballRecruitingService.getEstimates(scoutId!, [id]),
  );
  const grades = player
    ? vbGradesFor(
        player.AbilityGrades,
        estimate.data?.Athletes.find((athlete) => athlete.PlayerID === id),
      )
    : null;
  useVbTeams(home?.LeagueKind ?? kind);
  if (!validId) return <VbEmpty tone="error">That is not a player.</VbEmpty>;
  if (profile.error?.status === 404) {
    return <VbEmpty>There is no player with that id.</VbEmpty>;
  }
  // A player belongs under her own league's address.
  if (home && home.LeagueKind !== kind) {
    return <Navigate to={vbPaths(home.LeagueKind).player(id)} replace />;
  }

  return (
    <div className="space-y-3">
      <VbPanel>
        <VbLoad loading={profile.loading} error={profile.error} rows={4}>
          {player && (
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <VbPlayerFace
                face={faces.data?.[id]}
                team={home ? vbTeamsById[home.TeamID] : null}
              />
              <div className="flex-1 space-y-3 text-left">
                <div>
                  <div className="text-lg font-bold">{player.Name}</div>
                  {player.Team ? (
                    <VbTeamLink
                      kind={player.Team.LeagueKind}
                      teamId={player.Team.TeamID}
                      name={player.Team.Name}
                    />
                  ) : player.LastTeam ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-(--text-muted)">Last team</span>
                      <VbTeamLink
                        kind={player.LastTeam.LeagueKind}
                        teamId={player.LastTeam.TeamID}
                        name={player.LastTeam.Name}
                      />
                      {player.LastTeam.ToSeason && (
                        <span className="text-(--text-muted)">
                          through {player.LastTeam.ToSeason}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <VbFact
                    label="Position"
                    value={player.Position ?? "—"}
                    title={
                      player.PositionSource
                        ? positionNotes[player.PositionSource]
                        : undefined
                    }
                  />
                  <VbFact label="Jersey" value={player.Jersey ?? "—"} />
                  {player.Class && <VbFact label="Class" value={player.Class} />}
                  <VbFact label="Age" value={player.Age ?? "—"} />
                  <VbFact label="Height" value={vbHeight(player.HeightCm)} />
                  <VbFact
                    label="Standing Reach"
                    value={vbHeight(player.StandingReachCm)}
                  />
                  {player.Hometown && (
                    <VbFact label="Hometown" value={player.Hometown} />
                  )}
                  <VbFact label="Status" value={vbLabel(player.Status)} />
                  {player.Contract && (
                    <VbFact
                      label="Contract"
                      value={`${vbMoney(player.Contract.Salary)} thru ${player.Contract.Through}`}
                      title={vbLabel(player.Contract.Kind)}
                    />
                  )}
                </div>
                {player.Tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.Tags.map((tag) => (
                      <Tag key={tag}>{vbLabel(tag)}</Tag>
                    ))}
                  </div>
                )}
                {player.Injury && (
                  <div className="text-sm text-(--accent-error)">
                    {player.Injury.Status}: {vbLabel(player.Injury.BodyPart)} ·
                    expected back {player.Injury.ExpectedReturn}
                  </div>
                )}
              </div>
            </div>
          )}
        </VbLoad>
      </VbPanel>
      {grades && (
        <VbPanel title="Ability">
          <div className="p-3">
            <VbGradeCard grades={grades} position={player?.Position} />
            <div className="mt-2 text-left text-xs text-(--text-muted)">
              {vbGradeNote(grades, Boolean(player?.ProRatings))}
            </div>
          </div>
        </VbPanel>
      )}
      {player?.ProRatings && (
        <VbPanel title="Ratings">
          <div className="p-3">
            <VbRatingsGrid values={player.ProRatings} />
            <div className="mt-3 text-left text-xs text-(--text-muted)">
              Pro ratings are true values on a 0–50 scale.
            </div>
          </div>
        </VbPanel>
      )}
      <VbPanel title="Statistics">
        <div className="px-3 pt-2">
          <VbStatToggles
            perSet={perSet}
            onPerSet={setPerSet}
            phase={phase}
            onPhase={setPhase}
          />
        </div>
        <VbLoad loading={stats.loading} error={stats.error} rows={4}>
          {stats.data && (
            <VbPlayerStatsTable stats={stats.data} perSet={perSet} />
          )}
        </VbLoad>
      </VbPanel>
      <VbPanel title="Awards">
        <VbLoad loading={awards.loading} error={awards.error} rows={2}>
          <div className="p-3">
            <VbAwardList awards={awards.data?.Awards ?? []} />
          </div>
        </VbLoad>
      </VbPanel>
    </div>
  );
};

export const VolleyballPlayerPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Player">
    {() => <PlayerBody kind={kind} />}
  </VbPageShell>
);

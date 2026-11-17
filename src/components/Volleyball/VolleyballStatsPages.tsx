import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "../../_design/Logo";
import { SportChip, SportSegmented, SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeague,
  VbLeagueKind,
  VbNews,
  VbNewsType,
  VbStatPhase,
  VbStatSort,
  VbTeamStats,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons, useVbTeams } from "./useVbData";
import {
  useVbSort,
  VbBannerSeason,
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbLinkClass,
  vbLinkProps,
  VbLoad,
  vbNum,
  VbPager,
  VbPanel,
  vbRowClass,
  VbSortHeader,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import { vbLabel, vbPaths, vbPhaseLabel, vbTeamLogo } from "./vbFormatting";
import { VbPlayerLink } from "./VbPlayerCard";
import { VbPageShell } from "./VbPageShell";
import { VbGrade } from "./VbGrades";
import { VbCoachLink } from "./VbCoachLink";
import {
  vbStatCell,
  vbStatColumns,
  vbStatIsRate,
  VbStatToggles,
  vbStatValue,
} from "./VbStats";

const fieldClass =
  "rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)";

interface SeasonProps {
  kind: VbLeagueKind;
  league: VbLeague;
  season: number;
}

/** A season picker shared by the statistics, top plays and news views. */
const SeasonSelect: FC<{
  seasons: number[];
  season: number;
  onChange: (season: number) => void;
}> = ({ seasons, season, onChange }) => {
  const options = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  return (
    <div className="w-full shrink-0 sm:w-44">
      <SportSelect
        options={options}
        value={options.find((option) => option.value === String(season)) ?? null}
        onChange={(option) => option && onChange(Number(option.value))}
      />
    </div>
  );
};

/** All conferences, or one. College only: the pro league has none. */
const useConferencePicker = (kind: VbLeagueKind, league: VbLeague) => {
  const conferences = useVbResource(
    kind === "college" ? `conferences:${league.LeagueID}` : null,
    () => VolleyballService.getConferences(league.LeagueID),
  );
  const [conferenceId, setConferenceId] = useState<number | null>(null);
  const options = [
    { value: "", label: "All conferences" },
    ...(conferences.data ?? [])
      .map((conference) => ({
        value: String(conference.ConferenceID),
        label: conference.Name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const picker =
    kind === "college" ? (
      <div className="w-full sm:w-64">
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
    ) : null;
  return { conferenceId, picker };
};

const LEADER_ROWS = 50;
const minSetChoices = [0, 10, 25, 50, 75];

// The API sorts and pages this list: a college season has thousands of
// players. Clicking a column asks for that order.
const PlayerLeaders: FC<SeasonProps & { past: boolean }> = ({
  kind,
  league,
  season,
  past,
}) => {
  const navigate = useNavigate();
  const [sort, setSort] = useState<VbStatSort>("Points");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [perSet, setPerSet] = useState(false);
  const [phase, setPhase] = useState<VbStatPhase>("all");
  const [pickedMin, setPickedMin] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const { conferenceId, picker } = useConferencePicker(kind, league);
  const column = vbStatColumns.find((item) => item.key === sort)!;
  const sortsPerSet = perSet && Boolean(column.perSet);
  // A rate or per-set board needs a floor, or one-set players top it.
  const needsFloor = vbStatIsRate(sort) || sortsPerSet;
  const minSets = pickedMin ?? (needsFloor ? (past ? 50 : 10) : 0);
  const leaders = useVbResource(
    `leaders:${league.LeagueID}:${season}:${sort}:${order}:${sortsPerSet}:${phase}:${minSets}:${conferenceId}:${offset}`,
    () =>
      VolleyballService.getLeaders(league.LeagueID, {
        Season: season,
        Sort: sort,
        Order: order,
        PerSet: sortsPerSet || undefined,
        Phase: phase === "all" ? undefined : phase,
        MinSets: minSets || undefined,
        ConferenceID: conferenceId ?? undefined,
        Limit: LEADER_ROWS,
        Offset: offset,
      }),
  );
  const sortBy = (key: VbStatSort) => {
    if (key === sort) {
      setOrder((current) => (current === "desc" ? "asc" : "desc"));
    } else {
      setSort(key);
      setOrder("desc");
    }
    setOffset(0);
  };
  const rows = leaders.data?.Players ?? [];

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <VbStatToggles
          perSet={perSet}
          onPerSet={(value) => {
            setPerSet(value);
            setOffset(0);
          }}
          phase={phase}
          onPhase={(value) => {
            setPhase(value);
            setOffset(0);
          }}
        />
        <label className="flex items-center gap-1 text-sm">
          <span className="text-(--text-muted)">Min sets</span>
          <select
            className={fieldClass}
            value={minSets}
            onChange={(event) => {
              setPickedMin(Number(event.target.value));
              setOffset(0);
            }}
          >
            {minSetChoices.map((choice) => (
              <option key={choice} value={choice}>
                {choice || "Any"}
              </option>
            ))}
          </select>
        </label>
        {picker}
      </div>
      <VbPanel>
        <VbLoad loading={leaders.loading} error={leaders.error} rows={15}>
          <table data-keep-table className={`${vbTableClass} min-w-[1100px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbCell} text-right`}>#</th>
                <th className={vbCell}>Player</th>
                <th className={vbCell} title="The role she started in most">
                  Pos
                </th>
                <th className={vbCell}>Team</th>
                <th
                  className={`${vbCell} text-right`}
                  title="Overall at her position: the public read on a college player, a pro's true grade"
                >
                  Ovr
                </th>
                {vbStatColumns.map((item) => (
                  <th
                    key={item.key}
                    className={`${vbCell} cursor-pointer select-none text-right ${
                      item.key === sort ? "text-(--text-primary)" : ""
                    }`}
                    title={item.title}
                    tabIndex={0}
                    aria-sort={
                      item.key === sort
                        ? order === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    onClick={() => sortBy(item.key)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        sortBy(item.key);
                      }
                    }}
                  >
                    {item.label}
                    {item.key === sort ? (order === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.PlayerID} className={vbRowClass}>
                  <td className={vbNum}>{row.Rank}</td>
                  <td className={vbCell}>
                    <VbPlayerLink playerId={row.PlayerID} name={row.Name} teamId={row.TeamID} />
                  </td>
                  <td className={vbCell}>{row.Position ?? "—"}</td>
                  <td className={vbCell}>
                    <VbTeamLink
                      kind={kind}
                      teamId={row.TeamID}
                      name={row.TeamName}
                    />
                  </td>
                  <td className={`${vbNum} font-semibold`}>
                    <VbGrade value={row.AbilityGrades?.Overall} />
                  </td>
                  {vbStatColumns.map((item) => (
                    <td
                      key={item.key}
                      className={`${vbNum} ${item.key === sort ? "font-semibold" : ""}`}
                    >
                      {vbStatCell(row, item, perSet)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <VbEmpty>
              {minSets
                ? `No one has played ${minSets} sets in ${season} yet. Lower the minimum to see more.`
                : `No statistics for ${season} yet.`}
            </VbEmpty>
          )}
          <VbPager
            offset={offset}
            pageSize={LEADER_ROWS}
            total={leaders.data?.Total ?? 0}
            onChange={setOffset}
          />
        </VbLoad>
      </VbPanel>
      <div className="text-left text-xs text-(--text-muted)">
        Select a column to sort by it. Only published, non-exhibition matches
        count. Position is the role she started in most this season.
      </div>
    </>
  );
};

type TeamRow = VbTeamStats["Teams"][number];
type TeamSortKey = VbStatSort | "team";

const TeamTotals: FC<SeasonProps> = ({ kind, league, season }) => {
  const [perSet, setPerSet] = useState(false);
  const [phase, setPhase] = useState<VbStatPhase>("all");
  const { conferenceId, picker } = useConferencePicker(kind, league);
  const totals = useVbResource(
    `team-stats:${league.LeagueID}:${season}:${phase}:${conferenceId}`,
    () =>
      VolleyballService.getTeamStats(league.LeagueID, {
        Season: season,
        Phase: phase === "all" ? undefined : phase,
        ConferenceID: conferenceId ?? undefined,
      }),
  );
  const sort = useVbSort<TeamRow, TeamSortKey>(
    totals.data?.Teams ?? [],
    (row, key) => {
      if (key === "team") return row.TeamName;
      const column = vbStatColumns.find((item) => item.key === key)!;
      return vbStatValue(row, column, perSet);
    },
    "Points",
    "desc",
  );

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <VbStatToggles
          perSet={perSet}
          onPerSet={setPerSet}
          phase={phase}
          onPhase={setPhase}
        />
        {picker}
      </div>
      <VbPanel>
        <VbLoad loading={totals.loading} error={totals.error} rows={15}>
          <table data-keep-table className={`${vbTableClass} min-w-[1000px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <VbSortHeader label="Team" column="team" sort={sort} />
                {vbStatColumns.map((item) => (
                  <VbSortHeader
                    key={item.key}
                    label={item.label}
                    column={item.key}
                    sort={sort}
                    title={item.title}
                    numeric
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sort.sorted.map((row) => (
                <tr key={row.TeamID} className={vbRowClass}>
                  <td className={vbCell}>
                    <VbTeamLink
                      kind={kind}
                      teamId={row.TeamID}
                      name={row.TeamName}
                    />
                  </td>
                  {vbStatColumns.map((item) => (
                    <td
                      key={item.key}
                      className={`${vbNum} ${item.key === sort.sortKey ? "font-semibold" : ""}`}
                    >
                      {vbStatCell(row, item, perSet)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {totals.data && !totals.data.Teams.length && (
            <VbEmpty>No statistics for {season} yet.</VbEmpty>
          )}
        </VbLoad>
      </VbPanel>
      <div className="text-left text-xs text-(--text-muted)">
        Counts are the sum of a team's players; matches and sets are the team's
        own.
      </div>
    </>
  );
};

type StatsTab = "players" | "teams";

const statsTabs: Array<readonly [StatsTab, string]> = [
  ["players", "Players"],
  ["teams", "Teams"],
];

const StatisticsBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const { seasons, currentSeason, playedSeason } = useVbSeasons(kind);
  useVbTeams(kind);
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useSportSectionTab(statsTabs, "players");
  const season = picked ?? playedSeason;
  if (season === null || currentSeason === null) {
    return (
      <VbLoad loading error={null}>
        {null}
      </VbLoad>
    );
  }

  return (
    <div className="space-y-2">
      <VbBannerSeason seasons={seasons} season={season} onChange={setPicked} />
      <SportBannerSections tabs={statsTabs} value={tab} onChange={setTab} />
      {/* Keyed by season so sorting and paging start fresh. */}
      {tab === "players" && (
        <PlayerLeaders
          key={season}
          kind={kind}
          league={league}
          season={season}
          past={season < currentSeason}
        />
      )}
      {tab === "teams" && (
        <TeamTotals key={season} kind={kind} league={league} season={season} />
      )}
    </div>
  );
};

export const VolleyballStatisticsPage: FC<{ kind: VbLeagueKind }> = ({
  kind,
}) => (
  <VbPageShell kind={kind} title="Statistics">
    {(league) => <StatisticsBody kind={kind} league={league} />}
  </VbPageShell>
);

const PLAY_ROWS = 25;

// The same pick as the Discord top-plays post: each match's best-scored
// rally, best first.
const TopPlaysBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const navigate = useNavigate();
  const params = useParams<{ season: string; week?: string }>();
  const { seasons, clock } = useVbSeasons(kind);
  const { vbTeamsById } = useSimVBStore();
  useVbTeams(kind);
  const paths = vbPaths(kind);
  const season = Number(params.season);
  const weekParam = params.week === undefined ? null : Number(params.week);
  const validSeason = Number.isInteger(season) && season > 0;
  const validWeek =
    weekParam === null || (Number.isInteger(weekParam) && weekParam > 0);
  const week = validWeek ? weekParam : null;
  const plays = useVbResource(
    validSeason && validWeek
      ? `top-plays:${league.LeagueID}:${season}:${week ?? "season"}`
      : null,
    () =>
      VolleyballService.getTopPlays(league.LeagueID, {
        Season: season,
        Week: week ?? undefined,
        Limit: PLAY_ROWS,
      }),
  );
  if (!validSeason || !validWeek) {
    return <VbEmpty tone="error">That is not a season or week.</VbEmpty>;
  }
  const weeks = clock?.Calendar?.RegularSeasonWeeks ?? 15;
  const rows = plays.data?.Plays ?? [];
  const past = clock ? season < clock.Season : false;

  return (
    <div className="space-y-2">
      <VbBannerSeason
        seasons={seasons.includes(season) ? seasons : [season, ...seasons]}
        season={season}
        onChange={(year) => navigate(paths.topPlays(year))}
      />
      <SportSegmented
        label="Week"
        value={week ?? 0}
        onChange={(n) =>
          navigate(n ? paths.topPlays(season, n) : paths.topPlays(season))
        }
        options={[
          [0, "Season"] as const,
          ...Array.from(
            { length: weeks },
            (_, index) => [index + 1, `Wk ${index + 1}`] as const,
          ),
        ]}
      />
      <VbLoad loading={plays.loading} error={plays.error} rows={8}>
        <div className="space-y-2">
          {rows.map((play) => (
            <VbPanel key={`${play.MatchID}:${play.Set}:${play.Rally}`}>
              <div className="flex gap-3 p-3 text-left">
                <div className="w-8 shrink-0 text-right text-lg font-bold tabular-nums text-(--text-muted)">
                  {play.Rank}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <Logo
                      url={
                        play.HomeLogoURL ??
                        vbTeamLogo(vbTeamsById[play.HomeTeamID], kind, league)
                      }
                      variant="tiny"
                      containerClass="shrink-0"
                    />
                    <Logo
                      url={
                        play.AwayLogoURL ??
                        vbTeamLogo(vbTeamsById[play.AwayTeamID], kind, league)
                      }
                      variant="tiny"
                      containerClass="shrink-0"
                    />
                    <span className="font-semibold">{play.Matchup}</span>
                    <span className="text-(--text-muted)">
                      {play.Week
                        ? `Week ${play.Week}`
                        : vbPhaseLabel(play.Phase)}{" "}
                      · Set {play.Set}, {play.HomeScore}-{play.AwayScore}
                    </span>
                  </div>
                  <div className="font-semibold">{play.Title}</div>
                  <div className="text-sm">{play.Text}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    {play.Tags.map((tag) => (
                      <SportChip key={tag}>{vbLabel(tag)}</SportChip>
                    ))}
                    <span
                      {...vbLinkProps(() =>
                        navigate(
                          paths.rally(play.MatchID, play.Set, play.Rally),
                        ),
                      )}
                      className={`ml-auto ${vbLinkClass}`}
                      title={
                        week !== null && past
                          ? "A finished season keeps only some replays; this one may be gone."
                          : undefined
                      }
                    >
                      Watch
                    </span>
                    <span
                      {...vbLinkProps(() => navigate(paths.match(play.MatchID)))}
                      className={`ml-3 ${vbLinkClass}`}
                    >
                      Match
                    </span>
                  </div>
                </div>
              </div>
            </VbPanel>
          ))}
        </div>
        {!rows.length && (
          <VbEmpty>
            {week
              ? `No top plays for week ${week} of ${season}.`
              : `No top plays for ${season}.`}{" "}
            {week === null &&
              "A season's list only holds rallies whose replays were kept, so a finished season can show fewer than one of its weeks did."}
          </VbEmpty>
        )}
      </VbLoad>
      {week === null && rows.length > 0 && (
        <div className="text-left text-xs text-(--text-muted)">
          The season list only holds rallies whose replays were kept after the
          season ended. Pick a week for that week's own list.
        </div>
      )}
    </div>
  );
};

export const VolleyballTopPlaysPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Top Plays">
    {(league) => <TopPlaysBody kind={kind} league={league} />}
  </VbPageShell>
);

type NewsGroup = [label: string, types: VbNewsType[], includePro?: boolean];

const collegeNews: NewsGroup[] = [
  ["All", []],
  ["Champions & awards", ["champion", "award"]],
  ["Coaches", ["coach_hired", "coach_departed"]],
  ["Recruiting", ["commitment", "transfer"]],
  [
    "Pro transactions",
    ["drafted", "pro_signed", "pro_released", "pro_retired", "overseas", "traded"],
    true,
  ],
];

const proNews: NewsGroup[] = [
  ["All", []],
  ["Champions & awards", ["champion", "award"]],
  ["Coaches", ["coach_hired", "coach_departed"]],
  ["Draft", ["drafted"]],
  ["Signings", ["pro_signed", "pro_released", "pro_retired", "overseas"]],
  ["Trades", ["traded"]],
];

const newsLabels: Record<VbNewsType, string> = {
  champion: "Champion",
  award: "Award",
  coach_hired: "Hired",
  coach_departed: "Departed",
  commitment: "Commit",
  transfer: "Transfer",
  drafted: "Drafted",
  pro_signed: "Signed",
  pro_released: "Released",
  pro_retired: "Retired",
  overseas: "Overseas",
  traded: "Trade",
};

type NewsItem = VbNews["Items"][number];

const newsWhen = (item: NewsItem) => {
  if (item.Week) return `Week ${item.Week}`;
  if (item.Round) return `Round ${item.Round}`;
  if (!item.At) return "";
  const date = new Date(item.At);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// The player an item is about, if she has a player page. A coach has none:
// coach items carry CoachID instead, and are linked by their team. The type
// check covers an API that still sends the coach as PlayerID; a coach award
// names a coach too.
const newsPlayerId = (item: NewsItem) =>
  item.PlayerID === null ||
  item.CoachID ||
  item.Type === "coach_hired" ||
  item.Type === "coach_departed" ||
  item.Type === "champion" ||
  /coach of the year/i.test(item.Message)
    ? null
    : item.PlayerID;

const NEWS_ROWS = 15;

/** A season's news, newest first, built by the API from league records. */
export const VbNewsPanel: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const navigate = useNavigate();
  const { seasons, playedSeason } = useVbSeasons(kind);
  const groups = kind === "college" ? collegeNews : proNews;
  const [picked, setPicked] = useState<number | null>(null);
  const [groupIndex, setGroupIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [teamId, setTeamId] = useState<number | null>(null);
  const { conferenceId, picker: conferencePicker } = useConferencePicker(
    kind,
    league,
  );
  const teams = useVbTeams(kind);
  const teamOptions = [
    { value: "", label: kind === "college" ? "All schools" : "All clubs" },
    ...(teams ?? [])
      .filter(
        (team) => conferenceId === null || team.ConferenceID === conferenceId,
      )
      .map((team) => ({ value: String(team.TeamID), label: team.Name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  // A school outside the chosen conference would match nothing.
  const shownTeamId = teamOptions.some(
    (option) => option.value === String(teamId),
  )
    ? teamId
    : null;
  useEffect(() => setOffset(0), [conferenceId]);
  const season = picked ?? playedSeason;
  const [, types, includePro] = groups[groupIndex];
  const news = useVbResource(
    season === null
      ? null
      : `news:${league.LeagueID}:${season}:${groupIndex}:${conferenceId}:${shownTeamId}:${offset}`,
    () =>
      VolleyballService.getNews(league.LeagueID, {
        Season: season!,
        Type: types.join(",") || undefined,
        IncludePro: includePro || undefined,
        ConferenceID: conferenceId ?? undefined,
        TeamID: shownTeamId ?? undefined,
        Limit: NEWS_ROWS,
        Offset: offset,
      }),
  );
  const items = news.data?.Items ?? [];

  return (
    <VbPanel title="News">
      <div className="flex flex-wrap items-center gap-2 px-3 pt-2">
        {season !== null && (
          <SeasonSelect
            seasons={seasons}
            season={season}
            onChange={(year) => {
              setPicked(year);
              setOffset(0);
            }}
          />
        )}
        {conferencePicker}
        <div className="w-full shrink-0 sm:w-64">
          <SportSelect
            options={teamOptions}
            value={
              teamOptions.find(
                (option) => option.value === String(shownTeamId ?? ""),
              ) ?? null
            }
            onChange={(option) => {
              setTeamId(option?.value ? Number(option.value) : null);
              setOffset(0);
            }}
          />
        </div>
      </div>
      <div className="px-3 pt-2">
        <SportSegmented
          label="Kind of news"
          value={groupIndex}
          onChange={(index) => {
            setGroupIndex(index);
            setOffset(0);
          }}
          options={groups.map(([label], index) => [index, label] as const)}
        />
      </div>
      <VbLoad
        loading={news.loading || season === null}
        error={news.error}
        rows={8}
      >
        <table data-keep-table className={`${vbTableClass} mt-2`}>
          <tbody>
            {items.map((item) => {
              const playerId = newsPlayerId(item);
              return (
                <tr key={item.ID} className={vbRowClass}>
                  <td className={`${vbCell} w-20 text-(--text-muted)`}>
                    {newsWhen(item)}
                  </td>
                  <td className={`${vbCell} w-24`}>
                    <SportChip>
                      {newsLabels[item.Type] ?? vbLabel(item.Type)}
                    </SportChip>
                  </td>
                  <td className="px-2 py-1.5">
                    {item.CoachID ? (
                      <VbCoachLink
                        personId={item.CoachID}
                        name={item.Message}
                        classes="font-normal"
                      />
                    ) : playerId === null ? (
                      item.Message
                    ) : (
                      <VbPlayerLink
                        playerId={playerId}
                        name={item.Message}
                        teamId={item.TeamID}
                        classes="font-normal"
                      />
                    )}
                  </td>
                  <td className={`${vbCell} hidden sm:table-cell`}>
                    {item.TeamID !== null && (
                      <VbTeamLink
                        kind={item.LeagueKind}
                        teamId={item.TeamID}
                        name={item.TeamName ?? ""}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!items.length && (
          <VbEmpty>
            No news of this kind for {season}
            {includePro && conferenceId !== null
              ? ". Pro transactions belong to no conference, so clear the conference to see them"
              : ""}
            .
          </VbEmpty>
        )}
        <VbPager
          offset={offset}
          pageSize={NEWS_ROWS}
          total={news.data?.Total ?? 0}
          onChange={setOffset}
        />
      </VbLoad>
    </VbPanel>
  );
};

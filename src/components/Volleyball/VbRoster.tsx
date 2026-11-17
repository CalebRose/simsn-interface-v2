import { SportSegmented, SportSurface } from "../Common/SportKit";
import { FC, ReactNode, useState } from "react";
import { PillButton } from "../../_design/Buttons";
import { Tag } from "../../_design/Tags";
import { Text } from "../../_design/Typography";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbTeam,
  VolleyballManageService,
  VolleyballService,
} from "../../_services/volleyballService";
import { exportToCsv } from "../../_utility/csvExport";
// The phone layout is baseball's: below 900px each row becomes a card with
// the name as its title and labelled values in two columns.
import "../Team/baseball/baseballMobile.css";
import { useVbResource, useVbSeasons } from "./useVbData";
import {
  useVbSort,
  vbCell,
  VbEmpty,
  vbGroupHead,
  vbHeadClass,
  VbLoad,
  vbNum,
  vbRowClass,
  VbSortHeader,
  vbStickyCell,
  vbTableClass,
} from "./VbCommon";
import { vbHeight, vbLabel, vbMoney } from "./vbFormatting";
import {
  vbFamilies,
  VbGrade,
  vbGradeNote,
  vbGradeRank,
  vbGradesFor,
  vbPositions,
} from "./VbGrades";
import { useVbOpenPlayer, VbPlayerLink } from "./VbPlayerCard";
import { VbRatingsTable, VbRatingValues } from "./VbRatings";
import { vbStatCell, vbStatColumns, vbStatValue } from "./VbStats";
import { isVbProPlayer, VbAnyPlayer } from "./VolleyballPlayerModal";

type RosterView = "overview" | "ratings" | "contracts" | "stats";

const classOrder = ["FR", "SO", "JR", "SR", "GR"];

type RosterKey =
  | "jersey"
  | "name"
  | "position"
  | "class"
  | "age"
  | "height"
  | "reach"
  | "salary"
  | "contract"
  | "overall"
  | `family:${string}`
  | `stat:${string}`;

const bioValue = (player: VbAnyPlayer, key: RosterKey) => {
  const pro = isVbProPlayer(player);
  switch (key) {
    case "jersey":
      return player.Jersey === null ? null : Number(player.Jersey);
    case "name":
      return player.Name;
    case "position":
      return player.Position ?? null;
    case "class":
      return pro ? null : classOrder.indexOf(player.Class);
    case "age":
      return pro ? player.Age : null;
    case "height":
      return player.HeightCm;
    case "reach":
      return player.StandingReachCm;
    case "salary":
      return pro ? player.Salary : null;
    case "contract":
      return pro ? player.ContractThrough : null;
    default:
      return null;
  }
};

const Pills = <Value extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<readonly [Value, string]>;
  value: Value;
  onChange: (value: Value) => void;
}) => (
  <div>
    <Text variant="small" classes="mb-1 text-left font-semibold">
      {label}
    </Text>
    <SportSegmented
      label={label}
      value={value}
      onChange={onChange}
      options={options}
    />
  </div>
);

/**
 * A team's roster, laid out like the baseball roster: one controls panel,
 * then a table whose columns follow the chosen view. Selecting a row opens
 * the player window. A college coach sees their own staff's estimates
 * wherever ability is shown; everyone else sees the public grades.
 */
export const VbRosterTab: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({
  kind,
  team,
}) => {
  const pro = kind === "pro";
  const openPlayer = useVbOpenPlayer();
  const { cvbTeam, vbLeagues } = useSimVBStore();
  const { playedSeason } = useVbSeasons(kind);
  const roster = useVbResource<{ Players: VbAnyPlayer[] }>(
    `${pro ? "pro-roster" : "roster"}:${team.TeamID}`,
    () =>
      pro
        ? VolleyballService.getProRoster(team.TeamID)
        : VolleyballService.getRoster(team.TeamID),
  );
  const viewerId = !pro ? cvbTeam?.TeamID : undefined;
  const estimates = useVbResource(
    viewerId ? `estimates:${viewerId}:${team.TeamID}` : null,
    () => VolleyballManageService.getTeamEstimates(viewerId!, team.TeamID),
  );
  const [view, setView] = useState<RosterView>("overview");
  const [position, setPosition] = useState("All");
  const [availability, setAvailability] = useState<"all" | "healthy" | "injured">(
    "all",
  );
  const [search, setSearch] = useState("");
  // The season's line for each player, from the league's statistics.
  const leagueId = vbLeagues[kind]?.LeagueID;
  const stats = useVbResource(
    view === "stats" && leagueId && playedSeason
      ? `team-player-stats:${team.TeamID}:${playedSeason}`
      : null,
    () =>
      VolleyballService.getLeaders(leagueId!, {
        Season: playedSeason!,
        TeamID: team.TeamID,
        Limit: 100,
      }),
  );
  const statLines = Object.fromEntries(
    (stats.data?.Players ?? []).map((line) => [line.PlayerID, line]),
  );

  const athletes = Object.fromEntries(
    (estimates.data?.Athletes ?? []).map((athlete) => [
      athlete.PlayerID,
      athlete,
    ]),
  );
  const gradesOf = (player: VbAnyPlayer) =>
    vbGradesFor(player.AbilityGrades, athletes[player.PlayerID]);
  const ratings: Record<number, VbRatingValues | undefined> =
    Object.fromEntries(
      (roster.data?.Players ?? []).map((player) => [
        player.PlayerID,
        isVbProPlayer(player)
          ? player.ProRatings
          : athletes[player.PlayerID]?.Grades,
      ]),
    );
  const hasRatings = pro || Boolean(viewerId);
  const injured = (player: VbAnyPlayer) =>
    !isVbProPlayer(player) && Boolean(player.Injury);

  const needle = search.trim().toLowerCase();
  const all = roster.data?.Players ?? [];
  const players = all.filter(
    (player) =>
      (position === "All" || player.Position === position) &&
      (availability === "all" ||
        (availability === "injured") === injured(player)) &&
      (!needle || player.Name.toLowerCase().includes(needle)),
  );
  const sort = useVbSort<VbAnyPlayer, RosterKey>(
    players,
    (player, key) => {
      if (key === "overall") return vbGradeRank(gradesOf(player)?.Overall);
      if (key.startsWith("family:")) {
        return vbGradeRank(gradesOf(player)?.Families?.[key.slice(7)]);
      }
      if (key.startsWith("stat:")) {
        const line = statLines[player.PlayerID];
        const column = vbStatColumns.find((item) => item.key === key.slice(5));
        return line && column ? vbStatValue(line, column, false) : null;
      }
      return bioValue(player, key);
    },
    "jersey",
  );
  const shownGrades = all.length ? gradesOf(all[0]) : null;

  const exportRoster = () =>
    exportToCsv(
      `${team.Name.replace(/[^a-zA-Z0-9]+/g, "_")}_roster`,
      [
        "Jersey",
        "Name",
        "Position",
        pro ? "Age" : "Class",
        "Height (cm)",
        "Reach (cm)",
        "Overall",
        ...vbFamilies.map(([, , label]) => label),
        "Tags",
        ...(pro ? ["Salary", "Contract Through"] : ["Injury"]),
      ],
      sort.sorted.map((player) => [
        player.Jersey,
        player.Name,
        player.Position ?? "",
        isVbProPlayer(player) ? player.Age : player.Class,
        player.HeightCm,
        player.StandingReachCm,
        gradesOf(player)?.Overall ?? "",
        ...vbFamilies.map(([key]) => gradesOf(player)?.Families?.[key] ?? ""),
        player.Tags.map(vbLabel).join("; "),
        ...(isVbProPlayer(player)
          ? [player.Salary, player.ContractThrough || ""]
          : [player.Injury?.Status ?? ""]),
      ]),
    );

  const views: Array<readonly [RosterView, string]> = [
    ["overview", "Overview"],
    ...(hasRatings ? [["ratings", "Ratings"] as const] : []),
    ...(pro ? [["contracts", "Contracts"] as const] : []),
    ["stats", "Stats"],
  ];

  // The columns every view starts with. On a phone the name is the card's
  // title.
  const infoHead = (
    <>
      <VbSortHeader label="#" column="jersey" sort={sort} />
      <th className={`${vbCell} ${vbStickyCell} cursor-pointer`}>
        <span
          role="button"
          tabIndex={0}
          onClick={() => sort.sortBy("name")}
          onKeyDown={(event) => {
            if (event.key === "Enter") sort.sortBy("name");
          }}
        >
          Name
          {sort.sortKey === "name" ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
        </span>
      </th>
      <VbSortHeader
        label="Pos"
        column="position"
        sort={sort}
        title="The role she started in most, or her best fit"
      />
      {pro ? (
        <VbSortHeader label="Age" column="age" sort={sort} numeric />
      ) : (
        <VbSortHeader label="Class" column="class" sort={sort} />
      )}
    </>
  );
  const infoCells = (player: VbAnyPlayer) => (
    <>
      <td className={vbCell} data-label="#">
        {player.Jersey ?? "—"}
      </td>
      <td className={`${vbCell} ${vbStickyCell} bb-cell-name`} data-label="Name">
        <VbPlayerLink playerId={player.PlayerID} name={player.Name} team={team} />
        {injured(player) && (
          <span className="ml-2 rounded-sm bg-(--accent-error)/20 px-1 text-[10px] font-bold text-(--accent-error)">
            INJ
          </span>
        )}
      </td>
      <td
        className={vbCell}
        data-label="Pos"
        title={
          player.PositionSource === "best_fit"
            ? "Her best-fit role: she has not started yet"
            : undefined
        }
      >
        {player.Position ?? "—"}
      </td>
      {isVbProPlayer(player) ? (
        <td className={vbNum} data-label="Age">
          {player.Age ?? "—"}
        </td>
      ) : (
        <td className={vbCell} data-label="Class">
          {player.Class}
        </td>
      )}
    </>
  );
  const row = (player: VbAnyPlayer, cells: ReactNode) => (
    <tr
      key={player.PlayerID}
      className={`${vbRowClass} cursor-pointer`}
      onClick={() => openPlayer(player.PlayerID)}
    >
      {infoCells(player)}
      {cells}
    </tr>
  );
  const infoGroup = (
    <th className={`${vbGroupHead} border-l-0`} colSpan={4}>
      PLAYER
    </th>
  );

  return (
    <>
      <SportSurface
        classes="mb-2 p-4"
        styles={{ borderTop: `3px solid ${team.ColorOne}` }}
      >
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Pills label="View" options={views} value={view} onChange={setView} />
          <Pills
            label="Position"
            options={[
              ["All", "All"] as const,
              ...vbPositions.map((item) => [item, item] as const),
            ]}
            value={position}
            onChange={setPosition}
          />
          {!pro && (
            <Pills
              label="Availability"
              options={[
                ["all", "All"],
                ["healthy", "Healthy"],
                ["injured", "Injured"],
              ]}
              value={availability}
              onChange={setAvailability}
            />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a player"
            aria-label="Find a player"
            className="w-full rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) sm:w-56"
          />
          <Text variant="small" classes="text-(--text-muted)">
            {players.length} of {all.length} players
          </Text>
          <PillButton
            variant="primaryOutline"
            size="sm"
            classes="ml-auto"
            onClick={exportRoster}
            disabled={!all.length}
          >
            <Text variant="small">Export</Text>
          </PillButton>
        </div>
      </SportSurface>

      <SportSurface
        classes="p-0 overflow-hidden"
        styles={{ borderTop: `3px solid ${team.ColorOne}` }}
      >
        <VbLoad
          loading={roster.loading || (view === "ratings" && estimates.loading)}
          error={roster.error ?? (view === "ratings" ? estimates.error : null)}
          rows={12}
        >
          {view === "overview" && (
            <div className="baseball-table-wrapper max-h-[70vh] overflow-auto">
              <table className={`${vbTableClass} min-w-[1040px]`}>
                <thead className={`${vbHeadClass} sticky top-0 z-[2] bg-(--sport-surface)`}>
                  <tr>
                    {infoGroup}
                    <th className={vbGroupHead} colSpan={2}>
                      SIZE
                    </th>
                    <th className={vbGroupHead} colSpan={1 + vbFamilies.length}>
                      {shownGrades?.estimate ? "ABILITY · YOUR STAFF" : "ABILITY"}
                    </th>
                    <th className={vbGroupHead} colSpan={2}>
                      NOTES
                    </th>
                  </tr>
                  <tr>
                    {infoHead}
                    <VbSortHeader label="Ht" column="height" sort={sort} numeric title="Height" />
                    <VbSortHeader label="Reach" column="reach" sort={sort} numeric title="Standing reach" />
                    <VbSortHeader label="Ovr" column="overall" sort={sort} numeric title="Overall at her position" />
                    {vbFamilies.map(([key, short, label]) => (
                      <VbSortHeader
                        key={key}
                        label={short}
                        column={`family:${key}`}
                        sort={sort}
                        title={label}
                        numeric
                      />
                    ))}
                    <th className={vbCell}>Tags</th>
                    <th className={vbCell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sort.sorted.map((player) =>
                    row(
                      player,
                      <>
                        <td className={vbNum} data-label="Height">
                          {vbHeight(player.HeightCm)}
                        </td>
                        <td className={vbNum} data-label="Reach">
                          {vbHeight(player.StandingReachCm)}
                        </td>
                        <td className={`${vbNum} bb-cell-ovr font-semibold`} data-label="Overall">
                          <VbGrade value={gradesOf(player)?.Overall} />
                        </td>
                        {vbFamilies.map(([key, , label]) => (
                          <td key={key} className={vbNum} data-label={label}>
                            <VbGrade value={gradesOf(player)?.Families?.[key]} />
                          </td>
                        ))}
                        <td className={vbCell} data-label="Tags">
                          <div className="flex flex-wrap gap-1">
                            {player.Tags.map((tag) => (
                              <Tag key={tag}>{vbLabel(tag)}</Tag>
                            ))}
                          </div>
                        </td>
                        <td className={vbCell} data-label="Status">
                          {!isVbProPlayer(player) && player.Injury ? (
                            <span
                              className="text-(--accent-error)"
                              title={`${player.Injury.BodyPart} · expected back ${player.Injury.ExpectedReturn}`}
                            >
                              {player.Injury.Status}
                            </span>
                          ) : (
                            "Healthy"
                          )}
                        </td>
                      </>,
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {view === "ratings" && (
            <div className="max-h-[70vh] overflow-auto">
              <VbRatingsTable
                players={sort.sorted}
                values={ratings}
                lead={{
                  heading: "Pos",
                  cell: (playerId) =>
                    all.find((player) => player.PlayerID === playerId)
                      ?.Position ?? "—",
                }}
              />
            </div>
          )}

          {view === "contracts" && (
            <div className="baseball-table-wrapper max-h-[70vh] overflow-auto">
              <table className={vbTableClass}>
                <thead className={`${vbHeadClass} sticky top-0 z-[2] bg-(--sport-surface)`}>
                  <tr>
                    {infoHead}
                    <VbSortHeader label="Salary" column="salary" sort={sort} numeric />
                    <VbSortHeader label="Through" column="contract" sort={sort} numeric title="Contract through" />
                  </tr>
                </thead>
                <tbody>
                  {sort.sorted.map((player) =>
                    row(
                      player,
                      isVbProPlayer(player) && (
                        <>
                          <td className={vbNum} data-label="Salary">
                            {player.ContractThrough
                              ? vbMoney(player.Salary)
                              : "—"}
                          </td>
                          <td className={vbNum} data-label="Through">
                            {player.ContractThrough || "—"}
                          </td>
                        </>
                      ),
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {view === "stats" && (
            <VbLoad loading={stats.loading} error={stats.error} rows={12}>
              <div className="max-h-[70vh] overflow-auto">
                <table data-keep-table className={`${vbTableClass} min-w-[1100px]`}>
                  <thead className={`${vbHeadClass} sticky top-0 z-[2] bg-(--sport-surface)`}>
                    <tr>
                      {infoGroup}
                      <th className={vbGroupHead} colSpan={vbStatColumns.length}>
                        {playedSeason ?? ""} SEASON
                      </th>
                    </tr>
                    <tr>
                      {infoHead}
                      {vbStatColumns.map((column) => (
                        <VbSortHeader
                          key={column.key}
                          label={column.label}
                          column={`stat:${column.key}`}
                          sort={sort}
                          title={column.title}
                          numeric
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sort.sorted.map((player) => {
                      const line = statLines[player.PlayerID];
                      return row(
                        player,
                        vbStatColumns.map((column) => (
                          <td key={column.key} className={vbNum}>
                            {line ? vbStatCell(line, column, false) : "—"}
                          </td>
                        )),
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </VbLoad>
          )}

          {!players.length && (
            <VbEmpty>
              {all.length
                ? "No player matches those filters."
                : "This team has no players."}
            </VbEmpty>
          )}
          <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
            {view === "ratings"
              ? pro
                ? "Pro ratings are true values on a 0–50 scale."
                : "Your staff's estimate of each rating. Grades run F to A+; a range means they are not sure. Estimates of other teams' players are wider and go stale."
              : view === "stats"
                ? "Only published, non-exhibition matches count. A player who has not played shows dashes."
                : `Select a player for her full profile. ${vbGradeNote(shownGrades, pro)}`}
          </div>
        </VbLoad>
      </SportSurface>
    </>
  );
};

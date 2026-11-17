import { FC, useMemo, useState } from "react";
import { SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbAward,
  VbLeague,
  VbLeagueKind,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbTeams } from "./useVbData";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  VbLoad,
  vbNum,
  VbPanel,
  vbRowClass,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import { vbAwardLabel } from "./vbFormatting";
import { VbPageShell } from "./VbPageShell";
import { VbRecordBook } from "./VbRecords";

const Awards: FC<{ league: VbLeague; seasons: number[] }> = ({
  league,
  seasons,
}) => {
  const [picked, setPicked] = useState<number | null>(null);
  // With no season the API picks the latest one whose awards are due.
  const awards = useVbResource(
    `league-awards:${league.LeagueID}:${picked ?? "latest"}`,
    () => VolleyballService.getLeagueAwards(league.LeagueID, picked ?? undefined),
  );
  const season = picked ?? awards.data?.Season;
  // The pro league keeps its own awards; show them for the same season.
  const { vbLeagues } = useSimVBStore();
  const proId = vbLeagues.pro?.LeagueID;
  const proAwards = useVbResource(
    proId && season ? `league-awards:${proId}:${season}` : null,
    () => VolleyballService.getLeagueAwards(proId!, season),
  );
  const options = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  // Individual awards first, then the selection teams, college before pro.
  // The all-conference teams are left out: there are over thirty of them.
  const list = [
    ...(awards.data?.Awards ?? []),
    ...(proAwards.data?.Awards ?? []),
  ].filter((award) => award.Award !== "all_conference");
  const single = list.filter((award) => !award.Slot);
  const teams = list.filter((award) => award.Slot);
  const row = (award: VbAward, index: number) => (
    <tr key={index} className={vbRowClass}>
      <td className={vbCell}>{vbAwardLabel(award)}</td>
      <td className={`${vbCell} font-semibold`}>{award.Name}</td>
      <td className={vbCell}>
        <VbTeamLink
          kind={award.Award.includes("pro") ? "pro" : "college"}
          teamId={award.TeamID}
          name={award.Team}
        />
      </td>
    </tr>
  );

  return (
    <VbPanel title="Awards">
      <div className="w-full shrink-0 p-2 sm:w-48">
        <SportSelect
          options={options}
          value={options.find((option) => option.value === String(season)) ?? null}
          onChange={(option) => option && setPicked(Number(option.value))}
        />
      </div>
      <VbLoad loading={awards.loading} error={awards.error} rows={4}>
        {list.length ? (
          <table data-keep-table className={`${vbTableClass} min-w-[560px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Award</th>
                <th className={vbCell}>Winner</th>
                <th className={vbCell}>Team</th>
              </tr>
            </thead>
            <tbody>{[...single, ...teams].map(row)}</tbody>
          </table>
        ) : (
          <VbEmpty>The {season} awards have not been announced yet.</VbEmpty>
        )}
      </VbLoad>
    </VbPanel>
  );
};

const HistoryBody: FC<{ league: VbLeague }> = ({ league }) => {
  useVbTeams("college"); // logos for the champions and award winners
  useVbTeams("pro");
  const welcome = useVbResource(`history-welcome:${league.LeagueID}`, () =>
    VolleyballService.getHistoryWelcome(league.LeagueID),
  );
  // The story carries names only; this second call has the ids for links.
  const history = useVbResource(`league-history:${league.LeagueID}`, () =>
    VolleyballService.getLeagueHistory(league.LeagueID),
  );
  const ids = useMemo(
    () =>
      Object.fromEntries(
        (history.data?.Seasons ?? []).map((season) => [season.Season, season]),
      ),
    [history.data],
  );
  const story = welcome.data;
  // The rounds the API counts, fewest teams first. Only Final Fours came
  // with the first version of the route, so the rest show once they are sent.
  const rounds = (
    [
      ["Finals", "Finals", "Times in the final"],
      ["FinalFours", "Final Fours", "Times in the final four"],
      ["EliteEights", "Elite 8", "Times in the elite eight"],
      ["Sweet16s", "Sweet 16", "Times in the sweet sixteen"],
      ["Appearances", "Apps", "Times in the tournament field"]
    ] as const
  ).filter(
    ([key]) =>
      key === "FinalFours" ||
      story?.Programs.some((program) => program[key] != null),
  );
  const seasons = [...(story?.Seasons ?? [])].sort(
    (a, b) => b.Season - a.Season,
  );
  const team = (name: string | null, teamId?: number | null) =>
    !name ? (
      "—"
    ) : teamId ? (
      <VbTeamLink kind="college" teamId={teamId} name={name} />
    ) : (
      name
    );

  return (
    <VbLoad loading={welcome.loading} error={welcome.error} rows={10}>
      {story && (
        <div className="space-y-3">
          {story.Story.length > 0 && (
            <VbPanel
              title={
                story.From && story.To
                  ? `The story so far, ${story.From}–${story.To}`
                  : "The story so far"
              }
            >
              <div className="space-y-2 p-4 text-left text-sm">
                {story.Story.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </VbPanel>
          )}

          <VbPanel title="Champions">
            <table data-keep-table className={`${vbTableClass} min-w-[860px]`}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>Season</th>
                  <th className={vbCell}>Champion</th>
                  <th className={vbCell}>Final</th>
                  <th className={vbCell}>Runner-up</th>
                  <th className={vbCell}>Final Four</th>
                  <th className={vbCell}>Pro Champion</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => (
                  <tr key={season.Season} className={vbRowClass}>
                    <td className={vbCell}>{season.Season}</td>
                    <td className={`${vbCell} font-semibold`}>
                      {team(season.Champion, ids[season.Season]?.ChampionTeamID)}
                    </td>
                    <td className={vbCell}>{season.FinalScore ?? "—"}</td>
                    <td className={vbCell}>
                      {team(season.RunnerUp, ids[season.Season]?.RunnerUpTeamID)}
                    </td>
                    <td className="px-2 py-1.5">
                      {season.FinalFour.join(", ") || "—"}
                    </td>
                    <td className={vbCell}>{season.ProChampion ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!seasons.length && (
              <VbEmpty>No season has been completed yet.</VbEmpty>
            )}
          </VbPanel>

          <Awards
            league={league}
            seasons={seasons.map((season) => season.Season)}
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <VbPanel title="Most successful programs">
              {/* Every count is each time the round was reached: a champion
                  also counts in the final, the final four and so on. */}
              <table data-keep-table className={vbTableClass}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={vbCell}>Program</th>
                    <th className={`${vbCell} text-right`}>Titles</th>
                    {rounds.map(([key, label, title]) => (
                      <th
                        key={key}
                        className={`${vbCell} text-right`}
                        title={title}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {story.Programs.map((program) => (
                    <tr key={program.Team} className={vbRowClass}>
                      <td className={`${vbCell} font-semibold`}>
                        {program.Team}
                      </td>
                      <td className={vbNum}>{program.Titles}</td>
                      {rounds.map(([key]) => (
                        <td key={key} className={vbNum}>
                          {program[key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </VbPanel>
            <VbPanel title="Coaches">
              <table data-keep-table className={vbTableClass}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={vbCell}>Coach</th>
                    <th className={`${vbCell} text-right`}>Record</th>
                    <th className={`${vbCell} text-right`}>Titles</th>
                    <th className={vbCell}>Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {story.Coaches.map((coach) => (
                    <tr key={coach.Name} className={vbRowClass}>
                      <td className={`${vbCell} font-semibold`}>{coach.Name}</td>
                      <td className={vbNum}>
                        {coach.Wins}-{coach.Losses}
                      </td>
                      <td className={vbNum}>{coach.Titles}</td>
                      <td className="px-2 py-1.5">{coach.Teams.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </VbPanel>
          </div>

          {story.Players.length > 0 && (
            <VbPanel title="Notable players">
              <ul className="divide-y divide-(--border-primary)/40 text-left text-sm">
                {story.Players.map((player) => (
                  <li key={`${player.Name}:${player.Team}`} className="p-3">
                    <span className="font-semibold">{player.Name}</span>
                    <span className="text-(--text-muted)"> · {player.Team}</span>
                    <div className="text-(--text-muted)">
                      {player.Highlights.join("; ")}
                    </div>
                  </li>
                ))}
              </ul>
            </VbPanel>
          )}

          {story.Headlines.length > 0 && (
            <VbPanel title="Headlines">
              <ul className="space-y-1 p-4 text-left text-sm">
                {story.Headlines.map((headline, index) => (
                  <li key={index}>{headline}</li>
                ))}
              </ul>
            </VbPanel>
          )}
        </div>
      )}
    </VbLoad>
  );
};

type HistoryTab = "story" | "records";

const historyTabs: Array<readonly [HistoryTab, string]> = [
  ["story", "Story"],
  ["records", "Record Book"],
];

// Both leagues show the same story: it is the college league's, and it
// carries the pro champions and pro awards with it. The record book is each
// league's own.
export const VolleyballHistoryPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const { vbLeagues } = useSimVBStore();
  const [tab, setTab] = useSportSectionTab(historyTabs, "story");
  return (
    <VbPageShell kind={kind} title="History">
      {(league) => (
        <div className="space-y-2">
          <SportBannerSections tabs={historyTabs} value={tab} onChange={setTab} />
          {tab === "story" &&
            (vbLeagues.college ? (
              <HistoryBody league={vbLeagues.college} />
            ) : null)}
          {tab === "records" && (
            <VbRecordBook kind={kind} leagueId={league.LeagueID} />
          )}
        </div>
      )}
    </VbPageShell>
  );
};

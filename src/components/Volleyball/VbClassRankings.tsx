import { FC } from "react";
import { useSimVBStore } from "../../context/SimVBContext";
import { VbLeague, VolleyballService } from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
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

const STARS = ["5", "4", "3", "2", "1"];

/**
 * Every program's recruiting class, ranked by the league's own scoring.
 * `season` is the season of the recruiting window the class signed in; left
 * out, the latest class.
 */
export const VbClassRankings: FC<{ league: VbLeague; season?: number }> = ({
  league,
  season,
}) => {
  const { cvbTeam } = useSimVBStore();
  const rankings = useVbResource(
    `class-rankings:${league.LeagueID}:${season ?? "latest"}`,
    () => VolleyballService.getClassRankings(league.LeagueID, season),
  );
  const data = rankings.data;
  // Only the star counts some program has, so the table stays narrow.
  const stars = STARS.filter((star) =>
    data?.Teams.some((team) => team.Stars[star]),
  );

  return (
    <VbPanel
      title={
        data
          ? `Recruiting classes · signed in ${data.Season}${data.InProgress ? " · so far" : ""}`
          : "Recruiting classes"
      }
    >
      <VbLoad loading={rankings.loading} error={rankings.error} rows={10}>
        {data && (
          <>
            <table data-keep-table className={`${vbTableClass} min-w-[640px]`}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={`${vbCell} text-right`}>#</th>
                  <th className={vbCell}>Program</th>
                  <th className={`${vbCell} text-right`}>Points</th>
                  <th className={`${vbCell} text-right`}>Commits</th>
                  {stars.map((star) => (
                    <th key={star} className={`${vbCell} text-right`}>
                      {star}★
                    </th>
                  ))}
                  <th
                    className={`${vbCell} text-right`}
                    title="The average public rank of the class's recruits"
                  >
                    Avg Rank
                  </th>
                  <th
                    className={`${vbCell} text-right`}
                    title="Portal transfers: shown, not scored"
                  >
                    Transfers
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.Teams.map((team) => (
                  <tr
                    key={team.TeamID}
                    className={`${vbRowClass} ${team.TeamID === cvbTeam?.TeamID ? "bg-(--accent-primary)/15 font-semibold" : ""}`}
                  >
                    <td className={vbNum}>{team.Rank}</td>
                    <td className={vbCell}>
                      <VbTeamLink
                        kind="college"
                        teamId={team.TeamID}
                        name={team.Name}
                      />
                    </td>
                    <td className={vbNum}>{team.Points}</td>
                    <td className={vbNum}>{team.Commits}</td>
                    {stars.map((star) => (
                      <td key={star} className={vbNum}>
                        {team.Stars[star] ?? ""}
                      </td>
                    ))}
                    <td className={vbNum}>
                      {team.AverageRank != null
                        ? team.AverageRank.toFixed(1)
                        : "—"}
                    </td>
                    <td className={vbNum}>{team.Transfers || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.Teams.length && (
              <VbEmpty>No program has a commitment in this class yet.</VbEmpty>
            )}
            <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
              {data.Scoring}
              {data.InProgress
                ? " The window is still open, so this moves as commitments land."
                : ""}{" "}
              The class arrives in {data.Season + 1}.
            </div>
          </>
        )}
      </VbLoad>
    </VbPanel>
  );
};

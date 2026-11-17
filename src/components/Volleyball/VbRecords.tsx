import { SportSegmented } from "../Common/SportKit";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VbLeagueKind,
  VbRecords,
  VbRecordScope,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
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
import { vbPaths, vbPct } from "./vbFormatting";
import { VbPlayerLink } from "./VbPlayerCard";

const scopes: Array<[VbRecordScope, string, string]> = [
  ["match", "Player · match", "A player's best single match."],
  [
    "season",
    "Player · season",
    "A player's best season. Hitting percentage needs 250 attempts; pass rating needs 200 receptions.",
  ],
  [
    "career",
    "Player · career",
    "A player's career in this league. Hitting percentage needs 800 attempts; pass rating needs 600 receptions.",
  ],
  ["team_match", "Team · match", "A team's best single match."],
  ["team_season", "Team · season", "A team's best season."],
  ["program", "All time", "Championships, wins and tournament titles."],
];

type Entry = VbRecords["Records"][number]["Entries"][number];

/** A count as it is; a rate the way volleyball writes it. */
const recordValue = (stat: string, value: number) => {
  if (/pct$/i.test(stat)) return vbPct(value);
  return Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toFixed(2);
};

interface VbRecordBookProps {
  kind: VbLeagueKind;
  leagueId: number;
  /** One program's own record book, in place of the league's. */
  teamId?: number;
}

/** Record lists by scope: the league's, or one team's when `teamId` is given. */
export const VbRecordBook: FC<VbRecordBookProps> = ({
  kind,
  leagueId,
  teamId,
}) => {
  const navigate = useNavigate();
  const [scope, setScope] = useState<VbRecordScope>("season");
  const top = teamId ? 5 : 10;
  const records = useVbResource(
    `records:${leagueId}:${scope}:${teamId ?? "league"}:${top}`,
    () =>
      VolleyballService.getRecords(leagueId, scope, { Top: top, TeamID: teamId }),
  );
  const paths = vbPaths(kind);
  const note = scopes.find(([key]) => key === scope)?.[2];
  const list = (records.data?.Records ?? []).filter(
    (record) => record.Entries.length,
  );

  const holder = (entry: Entry) => (
    <div className="flex min-w-0 flex-col">
      {entry.PlayerID !== null && (
        <VbPlayerLink
          playerId={entry.PlayerID}
            teamId={entry.TeamID}
          name={entry.Name ?? `Player ${entry.PlayerID}`}
          classes="truncate"
        />
      )}
      {/* A team's own book has no need to name the team on every row. */}
      {(entry.PlayerID === null || !teamId) && (
        <span className={entry.PlayerID === null ? "" : "text-xs"}>
          <VbTeamLink
            kind={kind}
            teamId={entry.TeamID}
            name={entry.TeamName}
            showLogo={entry.PlayerID === null}
          />
        </span>
      )}
    </div>
  );

  const when = (entry: Entry) => {
    const parts = [
      entry.Season === null ? null : String(entry.Season),
      entry.OpponentName ? `vs ${entry.OpponentName}` : null,
    ].filter(Boolean);
    if (!parts.length) return entry.Detail ?? "";
    const text = parts.join(" ");
    return (
      <>
        {entry.MatchID !== null ? (
          <span
            {...vbLinkProps(() => navigate(paths.match(entry.MatchID!)))}
            className={vbLinkClass}
          >
            {text}
          </span>
        ) : (
          text
        )}
        {entry.Detail && (
          <span className="text-(--text-muted)"> · {entry.Detail}</span>
        )}
      </>
    );
  };

  return (
    <div className="space-y-2">
      <SportSegmented
        label="Records for"
        value={scope}
        onChange={setScope}
        options={scopes}
      />
      {note && (
        <div className="text-left text-xs text-(--text-muted)">{note}</div>
      )}
      <VbLoad loading={records.loading} error={records.error} rows={10}>
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((record) => (
            <VbPanel key={record.Stat} title={record.Label}>
              <table data-keep-table className={vbTableClass}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={`${vbCell} w-8 text-right`}>#</th>
                    <th className={vbCell}>Holder</th>
                    <th className={vbCell}>When</th>
                    <th className={`${vbCell} text-right`}>Record</th>
                  </tr>
                </thead>
                <tbody>
                  {record.Entries.map((entry, index) => (
                    <tr key={index} className={vbRowClass}>
                      <td className={vbNum}>{entry.Rank}</td>
                      <td className="max-w-48 px-2 py-1.5">{holder(entry)}</td>
                      <td className="px-2 py-1.5 text-left">{when(entry)}</td>
                      <td className={`${vbNum} font-semibold`}>
                        {recordValue(record.Stat, entry.Value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </VbPanel>
          ))}
        </div>
        {!list.length && <VbEmpty>No records of this kind yet.</VbEmpty>}
      </VbLoad>
    </div>
  );
};

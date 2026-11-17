import { SportSegmented } from "../Common/SportKit";
import { FC } from "react";
import {
  VbLeagueKind,
  VbPlayerStats,
  VbStatLine,
  VbStatPhase,
  VbStatSort,
} from "../../_services/volleyballService";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbNum,
  vbRowClass,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import { vbLeagueLabel, vbPct } from "./vbFormatting";

type PerSetKey = keyof NonNullable<VbStatLine["PerSet"]>;

export interface VbStatColumn {
  key: VbStatSort;
  label: string;
  title: string;
  /** Set on the six totals the API also serves per set. */
  perSet?: PerSetKey;
}

// The statistics line in box-score order. Every key is one the leaders route
// can sort by.
export const vbStatColumns: VbStatColumn[] = [
  { key: "Matches", label: "M", title: "Matches played" },
  { key: "Sets", label: "S", title: "Sets played" },
  { key: "Kills", label: "K", title: "Kills", perSet: "Kills" },
  { key: "Errors", label: "E", title: "Attack errors" },
  { key: "Attempts", label: "TA", title: "Attack attempts" },
  {
    key: "HittingPct",
    label: "PCT",
    title: "Hitting percentage: (kills − errors) ÷ attempts",
  },
  { key: "Assists", label: "A", title: "Assists", perSet: "Assists" },
  { key: "Aces", label: "SA", title: "Service aces", perSet: "Aces" },
  { key: "ServiceErrors", label: "SE", title: "Service errors" },
  { key: "ReceptionErrors", label: "RE", title: "Reception errors" },
  { key: "Digs", label: "DIG", title: "Digs", perSet: "Digs" },
  { key: "BlockSolos", label: "BS", title: "Solo blocks" },
  { key: "BlockAssists", label: "BA", title: "Block assists" },
  { key: "Blocks", label: "BLK", title: "Total blocks", perSet: "Blocks" },
  {
    key: "Points",
    label: "PTS",
    title: "Kills + aces + solo blocks + half of block assists",
    perSet: "Points",
  },
  {
    key: "PassRating",
    label: "PASS",
    title: "Average serve-receive pass, on a 0–3 scale",
  },
];

/** A rate cannot be shown per set; a total with a per-set value can. */
export const vbStatIsRate = (key: VbStatSort) =>
  key === "HittingPct" || key === "PassRating";

/** One cell of a statistics line, as text. */
export const vbStatCell = (
  line: VbStatLine,
  column: VbStatColumn,
  perSet: boolean,
) => {
  if (column.key === "HittingPct") return vbPct(line.HittingPct);
  if (column.key === "PassRating") {
    return line.PassRating === null ? "—" : line.PassRating.toFixed(2);
  }
  if (perSet && column.perSet) {
    return line.PerSet ? line.PerSet[column.perSet].toFixed(2) : "—";
  }
  return line[column.key].toLocaleString("en-US");
};

/** The number behind a cell, for sorting a table already on the page. */
export const vbStatValue = (
  line: VbStatLine,
  column: VbStatColumn,
  perSet: boolean,
): number | null =>
  perSet && column.perSet
    ? (line.PerSet?.[column.perSet] ?? null)
    : line[column.key];

const phases: Array<[VbStatPhase, string]> = [
  ["all", "All matches"],
  ["regular", "Regular season"],
  ["postseason", "Postseason"],
];

/** Totals or per set, and which part of the season counts. */
export const VbStatToggles: FC<{
  perSet: boolean;
  onPerSet: (perSet: boolean) => void;
  phase: VbStatPhase;
  onPhase: (phase: VbStatPhase) => void;
}> = ({ perSet, onPerSet, phase, onPhase }) => (
  <div className="flex flex-wrap items-center gap-2">
    <SportSegmented
      label="Totals or per set"
      value={perSet ? "per" : "total"}
      onChange={(value) => onPerSet(value === "per")}
      options={[
        ["total", "Totals"],
        ["per", "Per set"],
      ]}
    />
    <SportSegmented
      label="Part of the season"
      value={phase}
      onChange={onPhase}
      options={phases}
    />
  </div>
);

/**
 * A player's seasons, oldest first, then one career line for each league she
 * has played in. A pro traded during a season has a row for each club.
 */
export const VbPlayerStatsTable: FC<{
  stats: VbPlayerStats;
  perSet: boolean;
}> = ({ stats, perSet }) => {
  const seasons = [...stats.Seasons].sort((a, b) => a.Season - b.Season);
  if (!seasons.length) {
    return <VbEmpty>She has not played in a published match.</VbEmpty>;
  }
  const kinds = new Set<VbLeagueKind>(seasons.map((row) => row.LeagueKind));
  return (
    <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
      <thead className={vbHeadClass}>
        <tr>
          <th className={vbCell}>Season</th>
          <th className={vbCell}>Team</th>
          {vbStatColumns.map((column) => (
            <th
              key={column.key}
              className={`${vbCell} text-right`}
              title={column.title}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {seasons.map((row) => (
          <tr
            key={`${row.LeagueID}:${row.Season}:${row.TeamID}`}
            className={vbRowClass}
          >
            <td className={`${vbCell} tabular-nums`}>{row.Season}</td>
            <td className={vbCell}>
              <VbTeamLink
                kind={row.LeagueKind}
                teamId={row.TeamID}
                name={row.TeamName}
                showLogo={false}
              />
            </td>
            {vbStatColumns.map((column) => (
              <td key={column.key} className={vbNum}>
                {vbStatCell(row, column, perSet)}
              </td>
            ))}
          </tr>
        ))}
        {stats.Careers.map((row) => (
          <tr key={row.LeagueKind} className={`${vbRowClass} font-semibold`}>
            <td className={vbCell} colSpan={2}>
              {kinds.size > 1 || stats.Careers.length > 1
                ? `${vbLeagueLabel(row.LeagueKind)} career`
                : "Career"}
              <span className="font-normal text-(--text-muted)">
                {" "}
                · {row.SeasonsPlayed}{" "}
                {row.SeasonsPlayed === 1 ? "season" : "seasons"}
              </span>
            </td>
            {vbStatColumns.map((column) => (
              <td key={column.key} className={vbNum}>
                {vbStatCell(row, column, perSet)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import { FC, ReactNode } from "react";
import { ratingColor } from "../Team/baseball/baseballColorConfig";
import { VbGrade } from "./VbGrades";
import { VbPlayerLink } from "./VbPlayerCard";
import {
  vbCell,
  vbHeadClass,
  vbStickyCell,
  vbRowClass,
  vbTableClass,
} from "./VbCommon";
import { vbLabel, vbRatingGroups } from "./vbFormatting";

// Column headings for the 26 ratings.
const short: Record<string, string> = {
  vertical: "VRT",
  quickness: "QCK",
  lateralMovement: "LAT",
  power: "PWR",
  reflexes: "RFX",
  stamina: "STA",
  servePower: "SPW",
  servePlacement: "SPL",
  serveMovement: "SMV",
  serveReceive: "RCV",
  ballControl: "BCT",
  digging: "DIG",
  pursuit: "PUR",
  settingHands: "HND",
  tempo: "TMP",
  setterVision: "SVI",
  attackPower: "APW",
  attackPlacement: "APL",
  approachTiming: "APP",
  attackVision: "AVI",
  blockTechnique: "BTE",
  blockFootwork: "BFT",
  blockRead: "BRD",
  defensiveRead: "DRD",
  consistency: "CON",
  composure: "CMP",
};

/** One player's ratings: true numbers for a pro, grades or ranges otherwise. */
export type VbRatingValues = Record<string, string | number>;

// Values are shown exactly as given. A grade range ("B-–A-") stays a range:
// it is never averaged or turned into a number.
// A true rating runs 0-50; the site's rating colours are laid out on the
// 20-80 scouting scale, so the number is placed on that scale for its colour
// only. A grade or range takes the grade colours.
const shown = (value: string | number | undefined) =>
  value === undefined ? (
    <span className="text-(--text-muted)">—</span>
  ) : typeof value === "number" ? (
    <span className={ratingColor(20 + value * 1.2)}>{value.toFixed(1)}</span>
  ) : (
    <VbGrade value={value} />
  );

/** The 26 ratings of one player, in their groups. For a modal. */
export const VbRatingsGrid: FC<{ values: VbRatingValues }> = ({ values }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
    {vbRatingGroups.map(([group, keys]) => (
      <div key={group} className="text-left">
        <div className="mb-1 text-xs uppercase text-(--text-muted)">{group}</div>
        {keys.map((key) => (
          <div key={key} className="flex justify-between text-sm">
            <span>{vbLabel(key)}</span>
            <span className="font-semibold tabular-nums">
              {shown(values[key])}
            </span>
          </div>
        ))}
      </div>
    ))}
  </div>
);

interface VbRatingsTableProps {
  players: Array<{ PlayerID: number; Name: string }>;
  values: Record<number, VbRatingValues | undefined>;
  /** Extra leading cells for a row, such as a role or a jersey. */
  lead?: { heading: string; cell: (playerId: number) => ReactNode };
}

/** A whole roster's ratings, one row per player; scrolls sideways. */
export const VbRatingsTable: FC<VbRatingsTableProps> = ({
  players,
  values,
  lead,
}) => (
  <table data-keep-table className={`${vbTableClass} min-w-[1500px]`}>
    <thead className={vbHeadClass}>
      <tr>
        <th className={vbCell} colSpan={lead ? 2 : 1} />
        {vbRatingGroups.map(([group, keys]) => (
          <th
            key={group}
            colSpan={keys.length}
            className={`${vbCell} border-l border-(--sport-divider) text-center`}
          >
            {group}
          </th>
        ))}
      </tr>
      <tr>
        <th className={`${vbCell} ${vbStickyCell}`}>Player</th>
        {lead && <th className={vbCell}>{lead.heading}</th>}
        {vbRatingGroups.map(([, keys]) =>
          keys.map((key, index) => (
            <th
              key={key}
              title={vbLabel(key)}
              className={`${vbCell} text-center ${index === 0 ? "border-l border-(--sport-divider)" : ""}`}
            >
              {short[key] ?? key}
            </th>
          )),
        )}
      </tr>
    </thead>
    <tbody>
      {players.map((player) => (
        <tr key={player.PlayerID} className={vbRowClass}>
          <td className={`${vbCell} ${vbStickyCell}`}>
            <VbPlayerLink playerId={player.PlayerID} name={player.Name} />
          </td>
          {lead && <td className={vbCell}>{lead.cell(player.PlayerID)}</td>}
          {vbRatingGroups.map(([, keys]) =>
            keys.map((key, index) => (
              <td
                key={key}
                className={`${vbCell} text-center tabular-nums ${index === 0 ? "border-l border-(--sport-divider)" : ""}`}
              >
                {shown(values[player.PlayerID]?.[key])}
              </td>
            )),
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

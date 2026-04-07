import { ReactNode, useMemo, useState } from "react";
import { IFAAuctionEntry, IFAEligiblePlayer, IFA_PHASE_COLORS, type IFAAuctionPhase } from "../../../../models/baseball/baseballIFAModels";
import { DisplayValue } from "../../../../models/baseball/baseballModels";
import { resolveDisplayValue } from "../../../../_utility/baseballHelpers";
import { potColor } from "../baseballColorConfig";
import "../baseballMobile.css";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

export type IFACategory = "Attributes" | "Potentials" | "IFA Info";

// Common fields shared by both auction entries and eligible players
type IFAPlayerLike = (IFAAuctionEntry | IFAEligiblePlayer) & {
  [key: string]: any;
};

interface ColumnDef { label: string; sortKey: string }
interface ColumnGroup { groupLabel: string; columns: ColumnDef[] }

// ═══════════════════════════════════════════════
// Column definitions
// ═══════════════════════════════════════════════

const INFO_COLS: ColumnDef[] = [
  { label: "Stars", sortKey: "star_rating" },
  { label: "Name", sortKey: "lastName" },
  { label: "Pos", sortKey: "" },
  { label: "Age", sortKey: "age" },
  { label: "Type", sortKey: "" },
  { label: "Country", sortKey: "" },
];

const HITTING_ATTR_COLS: ColumnDef[] = [
  { label: "Contact", sortKey: "contact_base" },
  { label: "Power", sortKey: "power_base" },
  { label: "Eye", sortKey: "eye_base" },
  { label: "Disc", sortKey: "discipline_base" },
];

const SPEED_ATTR_COLS: ColumnDef[] = [
  { label: "Speed", sortKey: "speed_base" },
];

const DEFENSE_ATTR_COLS: ColumnDef[] = [
  { label: "FldCatch", sortKey: "fieldcatch_base" },
  { label: "FldReact", sortKey: "fieldreact_base" },
  { label: "ThrowAcc", sortKey: "throwacc_base" },
  { label: "ThrowPow", sortKey: "throwpower_base" },
];

const PITCHING_ATTR_COLS: ColumnDef[] = [
  { label: "Endurance", sortKey: "pendurance_base" },
  { label: "Control", sortKey: "pgencontrol_base" },
  { label: "Velocity", sortKey: "pthrowpower_base" },
  { label: "Sequence", sortKey: "psequencing_base" },
  { label: "Pickoff", sortKey: "pickoff_base" },
];

const ARSENAL_COLS: ColumnDef[] = [
  { label: "P1", sortKey: "" }, { label: "P2", sortKey: "" },
  { label: "P3", sortKey: "" }, { label: "P4", sortKey: "" },
  { label: "P5", sortKey: "" },
];

const HITTING_POT_COLS: ColumnDef[] = [
  { label: "Contact", sortKey: "contact_pot" },
  { label: "Power", sortKey: "power_pot" },
  { label: "Eye", sortKey: "eye_pot" },
  { label: "Disc", sortKey: "discipline_pot" },
];

const SPEED_POT_COLS: ColumnDef[] = [
  { label: "Speed", sortKey: "speed_pot" },
];

const DEFENSE_POT_COLS: ColumnDef[] = [
  { label: "FldCatch", sortKey: "fieldcatch_pot" },
  { label: "FldReact", sortKey: "fieldreact_pot" },
  { label: "ThrowAcc", sortKey: "throwacc_pot" },
  { label: "ThrowPow", sortKey: "throwpower_pot" },
];

const PITCHING_POT_COLS: ColumnDef[] = [
  { label: "Endurance", sortKey: "pendurance_pot" },
  { label: "Control", sortKey: "pgencontrol_pot" },
  { label: "Velocity", sortKey: "pthrowpower_pot" },
  { label: "Sequence", sortKey: "psequencing_pot" },
  { label: "Pickoff", sortKey: "pickoff_pot" },
];

const AUCTION_INFO_COLS: ColumnDef[] = [
  { label: "Slot", sortKey: "slot_value" },
  { label: "Phase", sortKey: "" },
  { label: "Offers", sortKey: "" },
  { label: "Competing", sortKey: "" },
  { label: "My Offer", sortKey: "" },
];

const ELIGIBLE_INFO_COLS: ColumnDef[] = [
  { label: "Slot Value", sortKey: "slot_value" },
];

const ACTIONS_GROUP: ColumnGroup = { groupLabel: "", columns: [{ label: "", sortKey: "" }] };

function buildGroups(category: IFACategory, filterType: string, isAuction: boolean): ColumnGroup[] {
  const infoGroup: ColumnGroup = { groupLabel: "", columns: INFO_COLS };

  if (category === "IFA Info") {
    return [
      infoGroup,
      { groupLabel: isAuction ? "Auction" : "Prospect", columns: isAuction ? AUCTION_INFO_COLS : ELIGIBLE_INFO_COLS },
      ACTIONS_GROUP,
    ];
  }

  const isPotentials = category === "Potentials";
  const showPitchers = filterType === "Pitcher";
  const showPosition = filterType === "Position";

  const groups: ColumnGroup[] = [infoGroup];

  if (!showPitchers) {
    groups.push({ groupLabel: "Hitting", columns: isPotentials ? HITTING_POT_COLS : HITTING_ATTR_COLS });
    groups.push({ groupLabel: "Speed", columns: isPotentials ? SPEED_POT_COLS : SPEED_ATTR_COLS });
    groups.push({ groupLabel: "Defense", columns: isPotentials ? DEFENSE_POT_COLS : DEFENSE_ATTR_COLS });
  }

  if (!showPosition) {
    groups.push({ groupLabel: "Pitching", columns: isPotentials ? PITCHING_POT_COLS : PITCHING_ATTR_COLS });
    if (!isPotentials) groups.push({ groupLabel: "Arsenal", columns: ARSENAL_COLS });
  }

  groups.push(ACTIONS_GROUP);
  return groups;
}

// ═══════════════════════════════════════════════
// Shared cell helpers
// ═══════════════════════════════════════════════

const td = "px-2 py-2.5 sm:py-1.5";
const thBase = "px-2 py-2 text-center text-xs";

const AttrCell = ({ value, isFuzzed, label }: { value: DisplayValue; isFuzzed?: boolean; label?: string }) => {
  if (value == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = resolveDisplayValue(value);
  return (
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>{text}</td>
  );
};

const PotCell = ({ pot, isFuzzed, label }: { pot: string | null | undefined; isFuzzed?: boolean; label?: string }) => {
  if (!pot || pot === "N") return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  if (pot === "?") return <td data-label={label} className={`${td} text-center text-gray-400`}>?</td>;
  return (
    <td data-label={label} className={`${td} text-center font-semibold ${potColor(pot)}`} title={isFuzzed ? "Estimated" : undefined}>{pot}</td>
  );
};

const PitchOvrCell = ({ name, ovr, label }: { name: string | null; ovr: DisplayValue; label?: string }) => {
  if (!name && ovr == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = ovr != null ? resolveDisplayValue(ovr) : { text: "—", colorClass: "" };
  return (<td data-label={label} className={`${td} text-center ${colorClass}`} title={name || undefined}>{text}</td>);
};

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

const phaseBadge = (phase: IFAAuctionPhase) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = IFA_PHASE_COLORS[phase] ?? "gray";
  return (<span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${colorMap[color]}`}>{phase}</span>);
};

const starDisplay = (stars: number) => (
  <span className="text-yellow-400" title={`${stars} stars`}>
    {"★".repeat(stars)}<span className="text-gray-600">{"★".repeat(5 - stars)}</span>
  </span>
);

// ═══════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════

const IFAGroupedHeader = ({ groups, sortKey, sortDir, onSort }: {
  groups: ColumnGroup[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}) => (
  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
    <tr className="border-b dark:border-gray-600">
      {groups.map((g, gi) => (
        <th key={gi} colSpan={g.columns.length}
          className={`px-1 py-1 text-center text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400
            ${gi > 0 && g.groupLabel ? "border-l dark:border-gray-500" : ""}`}>
          {g.groupLabel}
        </th>
      ))}
    </tr>
    <tr>
      {groups.map((g, gi) =>
        g.columns.map((col, ci) => {
          const isActive = sortKey === col.sortKey && col.sortKey !== "";
          const isFirstInGroup = ci === 0 && gi > 0 && g.groupLabel !== "";
          const isName = col.sortKey === "lastName";
          const canSort = col.sortKey !== "";
          return (
            <th key={`${gi}-${ci}`}
              className={`${thBase}
                ${isName ? "text-left sticky left-0 bg-gray-50 dark:bg-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]" : ""}
                ${isFirstInGroup ? "border-l dark:border-gray-500" : ""}
                ${canSort ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600" : ""}`}
              onClick={canSort ? () => onSort(col.sortKey) : undefined}>
              {col.label}
              {isActive && <span className="ml-0.5 text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
            </th>
          );
        })
      )}
    </tr>
  </thead>
);

// ═══════════════════════════════════════════════
// Row renderers
// ═══════════════════════════════════════════════

const InfoCells = ({ p }: { p: IFAPlayerLike }) => (
  <>
    <td data-label="Stars" className={`${td} text-center`}>{starDisplay(p.star_rating)}</td>
    <td data-label="Name" className={`${td} bb-cell-name font-medium whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
      {p.firstName} {p.lastName}
      {p.scouting?.attrs_precise && <span className="ml-1 text-blue-400 text-[10px]" title="Attrs scouted">*</span>}
    </td>
    <td data-label="Pos" className={`${td} text-center text-xs font-semibold`}>{p.listed_position ?? "—"}</td>
    <td data-label="Age" className={`${td} text-center`}>{p.age}</td>
    <td data-label="Type" className={`${td} text-center`}>
      <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
        {p.ptype === "Pitcher" ? "P" : "Pos"}
      </span>
    </td>
    <td data-label="Country" className={`${td} text-center text-xs`}>{p.area}</td>
  </>
);

const AttrCells = ({ p, fuzzed, filterType }: { p: IFAPlayerLike; fuzzed: boolean; filterType: string }) => {
  const showPos = filterType !== "Pitcher";
  const showPitch = filterType !== "Position";
  return (
    <>
      {showPos && (
        <>
          <AttrCell value={p.contact_base} isFuzzed={fuzzed} label="Contact" />
          <AttrCell value={p.power_base} isFuzzed={fuzzed} label="Power" />
          <AttrCell value={p.eye_base} isFuzzed={fuzzed} label="Eye" />
          <AttrCell value={p.discipline_base} isFuzzed={fuzzed} label="Disc" />
          <AttrCell value={p.speed_base} isFuzzed={fuzzed} label="Speed" />
          <AttrCell value={p.fieldcatch_base} isFuzzed={fuzzed} label="FldCatch" />
          <AttrCell value={p.fieldreact_base} isFuzzed={fuzzed} label="FldReact" />
          <AttrCell value={p.throwacc_base} isFuzzed={fuzzed} label="ThrowAcc" />
          <AttrCell value={p.throwpower_base} isFuzzed={fuzzed} label="ThrowPow" />
        </>
      )}
      {showPitch && (
        <>
          <AttrCell value={p.pendurance_base} isFuzzed={fuzzed} label="Endurance" />
          <AttrCell value={p.pgencontrol_base} isFuzzed={fuzzed} label="Control" />
          <AttrCell value={p.pthrowpower_base} isFuzzed={fuzzed} label="Velocity" />
          <AttrCell value={p.psequencing_base} isFuzzed={fuzzed} label="Sequence" />
          <AttrCell value={p.pickoff_base} isFuzzed={fuzzed} label="Pickoff" />
          <PitchOvrCell name={p.pitch1_name} ovr={p.pitch1_ovr} label="P1" />
          <PitchOvrCell name={p.pitch2_name} ovr={p.pitch2_ovr} label="P2" />
          <PitchOvrCell name={p.pitch3_name} ovr={p.pitch3_ovr} label="P3" />
          <PitchOvrCell name={p.pitch4_name} ovr={p.pitch4_ovr} label="P4" />
          <PitchOvrCell name={p.pitch5_name} ovr={p.pitch5_ovr} label="P5" />
        </>
      )}
    </>
  );
};

const PotCells = ({ p, fuzzed, filterType }: { p: IFAPlayerLike; fuzzed: boolean; filterType: string }) => {
  const showPos = filterType !== "Pitcher";
  const showPitch = filterType !== "Position";
  return (
    <>
      {showPos && (
        <>
          <PotCell pot={p.contact_pot} isFuzzed={fuzzed} label="Contact" />
          <PotCell pot={p.power_pot} isFuzzed={fuzzed} label="Power" />
          <PotCell pot={p.eye_pot} isFuzzed={fuzzed} label="Eye" />
          <PotCell pot={p.discipline_pot} isFuzzed={fuzzed} label="Disc" />
          <PotCell pot={p.speed_pot} isFuzzed={fuzzed} label="Speed" />
          <PotCell pot={p.fieldcatch_pot} isFuzzed={fuzzed} label="FldCatch" />
          <PotCell pot={p.fieldreact_pot} isFuzzed={fuzzed} label="FldReact" />
          <PotCell pot={p.throwacc_pot} isFuzzed={fuzzed} label="ThrowAcc" />
          <PotCell pot={p.throwpower_pot} isFuzzed={fuzzed} label="ThrowPow" />
        </>
      )}
      {showPitch && (
        <>
          <PotCell pot={p.pendurance_pot} isFuzzed={fuzzed} label="Endurance" />
          <PotCell pot={p.pgencontrol_pot} isFuzzed={fuzzed} label="Control" />
          <PotCell pot={p.pthrowpower_pot} isFuzzed={fuzzed} label="Velocity" />
          <PotCell pot={p.psequencing_pot} isFuzzed={fuzzed} label="Sequence" />
          <PotCell pot={p.pickoff_pot} isFuzzed={fuzzed} label="Pickoff" />
          <PitchOvrCell name={p.pitch1_name} ovr={p.pitch1_ovr} label="P1" />
          <PitchOvrCell name={p.pitch2_name} ovr={p.pitch2_ovr} label="P2" />
          <PitchOvrCell name={p.pitch3_name} ovr={p.pitch3_ovr} label="P3" />
          <PitchOvrCell name={p.pitch4_name} ovr={p.pitch4_ovr} label="P4" />
          <PitchOvrCell name={p.pitch5_name} ovr={p.pitch5_ovr} label="P5" />
        </>
      )}
    </>
  );
};

const AuctionInfoCells = ({ a }: { a: IFAAuctionEntry }) => (
  <>
    <td data-label="Slot" className={`${td} text-center`}>{formatCurrency(a.slot_value)}</td>
    <td data-label="Phase" className={`${td} text-center`}>{phaseBadge(a.phase)}</td>
    <td data-label="Offers" className={`${td} text-center`}>{a.active_offers}</td>
    <td data-label="Competing" className={`${td} text-center text-xs text-gray-400`}>
      {a.competitors.length > 0 ? a.competitors.join(", ") : "—"}
    </td>
    <td data-label="My Offer" className={`${td} text-center`}>
      {a.my_offer ? <span className="text-green-400 font-semibold">{formatCurrency(a.my_offer.bonus)}</span> : "—"}
    </td>
  </>
);

const EligibleInfoCells = ({ p }: { p: IFAEligiblePlayer }) => (
  <td data-label="Slot Value" className={`${td} text-center`}>{formatCurrency(p.slot_value)}</td>
);

// ═══════════════════════════════════════════════
// Client-side sort
// ═══════════════════════════════════════════════

function sortPlayers<T extends IFAPlayerLike>(players: T[], sortKey: string, sortDir: "asc" | "desc"): T[] {
  if (!sortKey) return players;
  const sorted = [...players];
  sorted.sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "number" && typeof vb === "number") {
      return sortDir === "asc" ? va - vb : vb - va;
    }
    const sa = String(va);
    const sb = String(vb);
    return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
  return sorted;
}

// ═══════════════════════════════════════════════
// Main table component — Auctions
// ═══════════════════════════════════════════════

export interface IFAAuctionTableProps {
  auctions: IFAAuctionEntry[];
  category: IFACategory;
  filterType: string;
  onRowClick: (auctionId: number) => void;
  renderActions: (auction: IFAAuctionEntry) => ReactNode;
}

export const IFAAuctionTable = ({ auctions, category, filterType, onRowClick, renderActions }: IFAAuctionTableProps) => {
  const [sortKey, setSortKey] = useState("star_rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const groups = useMemo(() => buildGroups(category, filterType, true), [category, filterType]);
  const sorted = useMemo(() => sortPlayers(auctions, sortKey, sortDir), [auctions, sortKey, sortDir]);

  return (
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <IFAGroupedHeader groups={groups} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        <tbody>
          {sorted.map((a) => {
            const fuzzed = !a.scouting?.attrs_precise;
            const potFuzzed = !a.scouting?.pots_precise;
            return (
              <tr key={a.auction_id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onRowClick(a.auction_id)}>
                <InfoCells p={a} />
                {category === "Attributes" && <AttrCells p={a} fuzzed={fuzzed} filterType={filterType} />}
                {category === "Potentials" && <PotCells p={a} fuzzed={potFuzzed} filterType={filterType} />}
                {category === "IFA Info" && <AuctionInfoCells a={a} />}
                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(a)}
                </td>
              </tr>
            );
          })}
          {auctions.length === 0 && (
            <tr>
              <td colSpan={groups.reduce((acc, g) => acc + g.columns.length, 0)} className="px-4 py-8 text-center text-gray-400">
                No active auctions.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Main table component — Eligible Prospects
// ═══════════════════════════════════════════════

export interface IFAEligibleTableProps {
  prospects: IFAEligiblePlayer[];
  category: IFACategory;
  filterType: string;
  renderActions: (prospect: IFAEligiblePlayer) => ReactNode;
}

export const IFAEligibleTable = ({ prospects, category, filterType, renderActions }: IFAEligibleTableProps) => {
  const [sortKey, setSortKey] = useState("star_rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const groups = useMemo(() => buildGroups(category, filterType, false), [category, filterType]);
  const sorted = useMemo(() => sortPlayers(prospects, sortKey, sortDir), [prospects, sortKey, sortDir]);

  return (
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <IFAGroupedHeader groups={groups} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        <tbody>
          {sorted.map((p) => {
            const fuzzed = !p.scouting?.attrs_precise;
            const potFuzzed = !p.scouting?.pots_precise;
            return (
              <tr key={p.player_id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <InfoCells p={p} />
                {category === "Attributes" && <AttrCells p={p} fuzzed={fuzzed} filterType={filterType} />}
                {category === "Potentials" && <PotCells p={p} fuzzed={potFuzzed} filterType={filterType} />}
                {category === "IFA Info" && <EligibleInfoCells p={p} />}
                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(p)}
                </td>
              </tr>
            );
          })}
          {prospects.length === 0 && (
            <tr>
              <td colSpan={groups.reduce((acc, g) => acc + g.columns.length, 0)} className="px-4 py-8 text-center text-gray-400">
                No prospects available matching filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


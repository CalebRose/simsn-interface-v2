import { ReactNode, useMemo } from "react";
import { FAPoolPlayer, FA_TYPE_LABELS, FAType, AuctionPhase, PHASE_COLORS } from "../../../../models/baseball/baseballFreeAgencyModels";
import { DisplayValue } from "../../../../models/baseball/baseballModels";
import { resolveDisplayValue } from "../../../../_utility/baseballHelpers";
import { potColor } from "../baseballColorConfig";
import "../baseballMobile.css";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

export type FACategory = "Attributes" | "Potentials" | "Auction";

interface ColumnDef {
  label: string;
  sortKey: string;  // maps to server-side sort key (e.g. "contact_base")
  bold?: boolean;
}

interface ColumnGroup {
  groupLabel: string;
  columns: ColumnDef[];
}

// ═══════════════════════════════════════════════
// Column definitions
// ═══════════════════════════════════════════════

const INFO_COLS: ColumnDef[] = [
  { label: "Name", sortKey: "lastname" },
  { label: "Pos", sortKey: "" },
  { label: "OVR", sortKey: "displayovr" },
  { label: "Age", sortKey: "age" },
  { label: "Type", sortKey: "ptype" },
  { label: "Tier", sortKey: "" },
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
  { label: "P1", sortKey: "" },
  { label: "P2", sortKey: "" },
  { label: "P3", sortKey: "" },
  { label: "P4", sortKey: "" },
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

const AUCTION_COLS: ColumnDef[] = [
  { label: "Demand", sortKey: "" },
  { label: "Phase", sortKey: "" },
  { label: "Offers", sortKey: "" },
  { label: "My Offer", sortKey: "" },
];

const ACTIONS_GROUP: ColumnGroup = { groupLabel: "", columns: [{ label: "", sortKey: "" }] };

function buildGroups(category: FACategory, filterType: string): ColumnGroup[] {
  const infoGroup: ColumnGroup = { groupLabel: "", columns: INFO_COLS };

  if (category === "Auction") {
    return [
      infoGroup,
      { groupLabel: "Auction", columns: AUCTION_COLS },
      ACTIONS_GROUP,
    ];
  }

  const isPotentials = category === "Potentials";
  const showPitchers = filterType === "Pitcher";
  const showPosition = filterType === "Position";

  const groups: ColumnGroup[] = [infoGroup];

  if (!showPitchers) {
    groups.push({
      groupLabel: "Hitting",
      columns: isPotentials ? HITTING_POT_COLS : HITTING_ATTR_COLS,
    });
    groups.push({
      groupLabel: "Speed",
      columns: isPotentials ? SPEED_POT_COLS : SPEED_ATTR_COLS,
    });
    groups.push({
      groupLabel: "Defense",
      columns: isPotentials ? DEFENSE_POT_COLS : DEFENSE_ATTR_COLS,
    });
  }

  if (!showPosition) {
    groups.push({
      groupLabel: "Pitching",
      columns: isPotentials ? PITCHING_POT_COLS : PITCHING_ATTR_COLS,
    });
    if (!isPotentials) {
      groups.push({ groupLabel: "Arsenal", columns: ARSENAL_COLS });
    }
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
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>
      {text}
    </td>
  );
};

const PotCell = ({ pot, isFuzzed, label }: { pot: string | null | undefined; isFuzzed?: boolean; label?: string }) => {
  if (!pot || pot === "N") return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  if (pot === "?") return <td data-label={label} className={`${td} text-center text-gray-400`}>?</td>;
  return (
    <td data-label={label} className={`${td} text-center font-semibold ${potColor(pot)}`} title={isFuzzed ? "Estimated" : undefined}>
      {pot}
    </td>
  );
};

const PitchOvrCell = ({ name, ovr, label }: { name: string | null; ovr: DisplayValue; label?: string }) => {
  if (!name && ovr == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = ovr != null ? resolveDisplayValue(ovr) : { text: "—", colorClass: "" };
  return (
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={name || undefined}>
      {text}
    </td>
  );
};

const phaseBadge = (phase: AuctionPhase) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = PHASE_COLORS[phase] ?? "gray";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${colorMap[color]}`}>
      {phase}
    </span>
  );
};

const tierBadge = (faType: FAType) => {
  const cls =
    faType === "mlb_fa" ? "bg-purple-600/20 text-purple-400"
    : faType === "arb" ? "bg-yellow-600/20 text-yellow-400"
    : faType === "pre_arb" ? "bg-blue-600/20 text-blue-400"
    : "bg-gray-600/20 text-gray-400";
  return (
    <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${cls}`}>
      {FA_TYPE_LABELS[faType] ?? faType}
    </span>
  );
};

// ═══════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════

const FAGroupedHeader = ({ groups, sortKey, sortDir, onSort }: {
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
          const isName = col.sortKey === "lastname";
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
// Row cell renderers
// ═══════════════════════════════════════════════

const InfoCells = ({ p }: { p: FAPoolPlayer }) => {
  const ovrResolved = p.displayovr != null ? resolveDisplayValue(p.displayovr) : null;
  return (
    <>
      <td data-label="Name" className={`${td} bb-cell-name font-medium whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
        {p.firstname} {p.lastname}
        {p.scouting.attrs_precise && <span className="ml-1 text-blue-400 text-[10px]" title="Attrs scouted">*</span>}
      </td>
      <td data-label="Pos" className={`${td} text-center text-xs font-semibold`}>
        {p.listed_position ?? "—"}
      </td>
      <td data-label="OVR" className={`${td} text-center font-semibold ${ovrResolved?.colorClass ?? ""}`}>
        {ovrResolved ? ovrResolved.text : "—"}
      </td>
      <td data-label="Age" className={`${td} text-center`}>{p.age}</td>
      <td data-label="Type" className={`${td} text-center`}>
        <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
          {p.ptype === "Pitcher" ? "P" : "Pos"}
        </span>
      </td>
      <td data-label="Tier" className={`${td} text-center`}>{tierBadge(p.fa_type)}</td>
    </>
  );
};

const HittingAttrCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <AttrCell value={p.contact_base} isFuzzed={fuzzed} label="Contact" />
    <AttrCell value={p.power_base} isFuzzed={fuzzed} label="Power" />
    <AttrCell value={p.eye_base} isFuzzed={fuzzed} label="Eye" />
    <AttrCell value={p.discipline_base} isFuzzed={fuzzed} label="Disc" />
  </>
);

const SpeedAttrCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <AttrCell value={p.speed_base} isFuzzed={fuzzed} label="Speed" />
);

const DefenseAttrCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <AttrCell value={p.fieldcatch_base} isFuzzed={fuzzed} label="FldCatch" />
    <AttrCell value={p.fieldreact_base} isFuzzed={fuzzed} label="FldReact" />
    <AttrCell value={p.throwacc_base} isFuzzed={fuzzed} label="ThrowAcc" />
    <AttrCell value={p.throwpower_base} isFuzzed={fuzzed} label="ThrowPow" />
  </>
);

const PitchingAttrCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <AttrCell value={p.pendurance_base} isFuzzed={fuzzed} label="Endurance" />
    <AttrCell value={p.pgencontrol_base} isFuzzed={fuzzed} label="Control" />
    <AttrCell value={p.pthrowpower_base} isFuzzed={fuzzed} label="Velocity" />
    <AttrCell value={p.psequencing_base} isFuzzed={fuzzed} label="Sequence" />
    <AttrCell value={p.pickoff_base} isFuzzed={fuzzed} label="Pickoff" />
  </>
);

const ArsenalCells = ({ p }: { p: FAPoolPlayer }) => (
  <>
    <PitchOvrCell name={p.pitch1_name} ovr={p.pitch1_ovr} label="P1" />
    <PitchOvrCell name={p.pitch2_name} ovr={p.pitch2_ovr} label="P2" />
    <PitchOvrCell name={p.pitch3_name} ovr={p.pitch3_ovr} label="P3" />
    <PitchOvrCell name={p.pitch4_name} ovr={p.pitch4_ovr} label="P4" />
    <PitchOvrCell name={p.pitch5_name} ovr={p.pitch5_ovr} label="P5" />
  </>
);

const HittingPotCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <PotCell pot={p.contact_pot} isFuzzed={fuzzed} label="Contact" />
    <PotCell pot={p.power_pot} isFuzzed={fuzzed} label="Power" />
    <PotCell pot={p.eye_pot} isFuzzed={fuzzed} label="Eye" />
    <PotCell pot={p.discipline_pot} isFuzzed={fuzzed} label="Disc" />
  </>
);

const SpeedPotCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <PotCell pot={p.speed_pot} isFuzzed={fuzzed} label="Speed" />
);

const DefensePotCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <PotCell pot={p.fieldcatch_pot} isFuzzed={fuzzed} label="FldCatch" />
    <PotCell pot={p.fieldreact_pot} isFuzzed={fuzzed} label="FldReact" />
    <PotCell pot={p.throwacc_pot} isFuzzed={fuzzed} label="ThrowAcc" />
    <PotCell pot={p.throwpower_pot} isFuzzed={fuzzed} label="ThrowPow" />
  </>
);

const PitchingPotCells = ({ p, fuzzed }: { p: FAPoolPlayer; fuzzed: boolean }) => (
  <>
    <PotCell pot={p.pendurance_pot} isFuzzed={fuzzed} label="Endurance" />
    <PotCell pot={p.pgencontrol_pot} isFuzzed={fuzzed} label="Control" />
    <PotCell pot={p.pthrowpower_pot} isFuzzed={fuzzed} label="Velocity" />
    <PotCell pot={p.psequencing_pot} isFuzzed={fuzzed} label="Sequence" />
    <PotCell pot={p.pickoff_pot} isFuzzed={fuzzed} label="Pickoff" />
  </>
);

const AuctionCells = ({ p }: { p: FAPoolPlayer }) => (
  <>
    <td data-label="Demand" className={`${td} text-center`}>
      {p.demand ? `$${(parseFloat(p.demand.min_aav) / 1_000_000).toFixed(1)}M` : "—"}
    </td>
    <td data-label="Phase" className={`${td} text-center`}>
      {p.auction ? phaseBadge(p.auction.phase) : <span className="text-gray-600">—</span>}
    </td>
    <td data-label="Offers" className={`${td} text-center`}>
      {p.auction ? p.auction.offer_count : "—"}
    </td>
    <td data-label="My Offer" className={`${td} text-center`}>
      {p.auction?.my_offer
        ? <span className="text-green-400">${(p.auction.my_offer.aav / 1_000_000).toFixed(1)}M</span>
        : "—"
      }
    </td>
  </>
);

// ═══════════════════════════════════════════════
// Main table component
// ═══════════════════════════════════════════════

export interface FAPoolTableProps {
  players: FAPoolPlayer[];
  category: FACategory;
  filterType: string;  // "all" | "Pitcher" | "Position"
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  onPlayerClick: (playerId: number) => void;
  renderActions: (player: FAPoolPlayer) => ReactNode;
}

export const FAPoolTable = ({
  players,
  category,
  filterType,
  sortKey,
  sortDir,
  onSort,
  onPlayerClick,
  renderActions,
}: FAPoolTableProps) => {
  const groups = useMemo(() => buildGroups(category, filterType), [category, filterType]);
  const showPitchers = filterType === "Pitcher";
  const showPosition = filterType === "Position";

  return (
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <FAGroupedHeader groups={groups} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <tbody>
          {players.map((p, idx) => {
            const attrFuzzed = !p.scouting.attrs_precise;
            const potFuzzed = !p.scouting.pots_precise;
            return (
              <tr
                key={p.id}
                className={`border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                onClick={() => onPlayerClick(p.id)}
              >
                <InfoCells p={p} />

                {category === "Attributes" && (
                  <>
                    {!showPitchers && (
                      <>
                        <HittingAttrCells p={p} fuzzed={attrFuzzed} />
                        <SpeedAttrCells p={p} fuzzed={attrFuzzed} />
                        <DefenseAttrCells p={p} fuzzed={attrFuzzed} />
                      </>
                    )}
                    {!showPosition && (
                      <>
                        <PitchingAttrCells p={p} fuzzed={attrFuzzed} />
                        <ArsenalCells p={p} />
                      </>
                    )}
                  </>
                )}

                {category === "Potentials" && (
                  <>
                    {!showPitchers && (
                      <>
                        <HittingPotCells p={p} fuzzed={potFuzzed} />
                        <SpeedPotCells p={p} fuzzed={potFuzzed} />
                        <DefensePotCells p={p} fuzzed={potFuzzed} />
                      </>
                    )}
                    {!showPosition && (
                      <>
                        <PitchingPotCells p={p} fuzzed={potFuzzed} />
                        <ArsenalCells p={p} />
                      </>
                    )}
                  </>
                )}

                {category === "Auction" && <AuctionCells p={p} />}

                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(p)}
                </td>
              </tr>
            );
          })}
          {players.length === 0 && (
            <tr>
              <td colSpan={groups.reduce((acc, g) => acc + g.columns.length, 0)} className="px-4 py-8 text-center text-gray-400">
                No free agents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

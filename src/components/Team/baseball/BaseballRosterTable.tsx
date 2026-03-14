import { ReactNode, useRef, useState, useEffect } from "react";
import { DisplayValue, Player, PlayerRatings } from "../../../models/baseball/baseballModels";
import { BattingLeaderRow, PitchingLeaderRow } from "../../../models/baseball/baseballStatsModels";
import { Attributes, Potentials, Contracts } from "../../../_constants/constants";
import { displayLevel, displayPlayerTeam, LEVEL_ORDER, getClassYear, numericToLetterGrade, resolveDisplayValue, letterGradeToNumeric } from "../../../_utility/baseballHelpers";
import { ratingColor, potColor } from "./baseballColorConfig";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

const Stats = "Stats";
export type BaseballCategory = typeof Attributes | typeof Potentials | typeof Contracts | typeof Stats;

export type SortConfig = { key: string; dir: "asc" | "desc" } | null;

export interface ColumnDef { label: string; sortKey: string }
export interface ColumnGroup { groupLabel: string; columns: ColumnDef[] }

// ═══════════════════════════════════════════════
// Column group definitions
// ═══════════════════════════════════════════════

export const INFO_COLS: ColumnDef[] = [
  { label: "Name", sortKey: "name" },
  { label: "Pos", sortKey: "pos" },
  { label: "OVR", sortKey: "ovr" },
  { label: "Level", sortKey: "level" },
  { label: "Team", sortKey: "" },
  { label: "Age", sortKey: "age" },
];

const ACTIONS_GROUP: ColumnGroup = { groupLabel: "Quick Actions", columns: [{ label: "", sortKey: "" }] };

// Variants without actions column (for pages that don't need it)
const NO_ACTIONS: ColumnGroup[] = [];

export const ALL_ATTR_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: [...INFO_COLS, { label: "Type", sortKey: "ptype" }, { label: "B/T", sortKey: "" }] },
  { groupLabel: "Hitting", columns: [
    { label: "Contact", sortKey: "contact" }, { label: "Power", sortKey: "power" },
    { label: "Eye", sortKey: "eye" }, { label: "Disc", sortKey: "disc" },
  ]},
  { groupLabel: "Speed", columns: [{ label: "Speed", sortKey: "speed" }] },
  { groupLabel: "Defense", columns: [
    { label: "FldCatch", sortKey: "fldcatch" }, { label: "FldReact", sortKey: "fldreact" },
    { label: "ThrowAcc", sortKey: "throwacc" }, { label: "ThrowPow", sortKey: "throwpow" },
  ]},
  { groupLabel: "Misc", columns: [{ label: "Durability", sortKey: "durability" }] },
  ACTIONS_GROUP,
];

export const ALL_POT_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: [...INFO_COLS, { label: "Type", sortKey: "ptype" }, { label: "B/T", sortKey: "" }] },
  { groupLabel: "Hitting", columns: [
    { label: "Contact", sortKey: "pot_contact" }, { label: "Power", sortKey: "pot_power" },
    { label: "Eye", sortKey: "pot_eye" }, { label: "Disc", sortKey: "pot_disc" },
  ]},
  { groupLabel: "Speed", columns: [{ label: "Speed", sortKey: "pot_speed" }] },
  { groupLabel: "Defense", columns: [
    { label: "FldCatch", sortKey: "pot_fldcatch" }, { label: "FldReact", sortKey: "pot_fldreact" },
    { label: "ThrowAcc", sortKey: "pot_throwacc" }, { label: "ThrowPow", sortKey: "pot_throwpow" },
  ]},
  { groupLabel: "Misc", columns: [{ label: "Durability", sortKey: "durability" }] },
  ACTIONS_GROUP,
];

export const POS_ATTR_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Hitting", columns: [
    { label: "Contact", sortKey: "contact" }, { label: "Power", sortKey: "power" },
    { label: "Eye", sortKey: "eye" }, { label: "Disc", sortKey: "disc" },
  ]},
  { groupLabel: "Speed / Base", columns: [
    { label: "Speed", sortKey: "speed" }, { label: "BaseRun", sortKey: "baserun" },
  ]},
  { groupLabel: "Fielding", columns: [
    { label: "FldCatch", sortKey: "fldcatch" }, { label: "FldReact", sortKey: "fldreact" },
    { label: "FldSpot", sortKey: "fldspot" }, { label: "ThrowAcc", sortKey: "throwacc" },
    { label: "ThrowPow", sortKey: "throwpow" },
  ]},
  { groupLabel: "Catcher", columns: [
    { label: "CatchFrm", sortKey: "catchfrm" }, { label: "CatchSeq", sortKey: "catchseq" },
  ]},
  { groupLabel: "Position", columns: [{ label: "Rtg", sortKey: "posrtg" }] },
  ACTIONS_GROUP,
];

export const POS_POT_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Hitting", columns: [
    { label: "Contact", sortKey: "pot_contact" }, { label: "Power", sortKey: "pot_power" },
    { label: "Eye", sortKey: "pot_eye" }, { label: "Disc", sortKey: "pot_disc" },
  ]},
  { groupLabel: "Speed / Base", columns: [
    { label: "Speed", sortKey: "pot_speed" }, { label: "BaseRun", sortKey: "pot_baserun" },
  ]},
  { groupLabel: "Fielding", columns: [
    { label: "FldCatch", sortKey: "pot_fldcatch" }, { label: "FldReact", sortKey: "pot_fldreact" },
    { label: "FldSpot", sortKey: "pot_fldspot" }, { label: "ThrowAcc", sortKey: "pot_throwacc" },
    { label: "ThrowPow", sortKey: "pot_throwpow" },
  ]},
  { groupLabel: "Catcher", columns: [
    { label: "CatchFrm", sortKey: "pot_catchfrm" }, { label: "CatchSeq", sortKey: "pot_catchseq" },
  ]},
  { groupLabel: "Position", columns: [{ label: "Rtg", sortKey: "posrtg" }] },
  ACTIONS_GROUP,
];

export const PITCH_ATTR_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: [...INFO_COLS, { label: "Throw", sortKey: "" }] },
  { groupLabel: "Pitching", columns: [
    { label: "Endurance", sortKey: "endurance" }, { label: "Control", sortKey: "control" },
    { label: "Velocity", sortKey: "velocity" }, { label: "Sequence", sortKey: "sequence" },
    { label: "Pickoff", sortKey: "pickoff" },
  ]},
  { groupLabel: "Roles", columns: [{ label: "SP", sortKey: "sp" }, { label: "RP", sortKey: "rp" }] },
  { groupLabel: "Arsenal", columns: [
    { label: "P1", sortKey: "p1ovr" }, { label: "P2", sortKey: "p2ovr" },
    { label: "P3", sortKey: "p3ovr" }, { label: "P4", sortKey: "p4ovr" },
    { label: "P5", sortKey: "p5ovr" },
  ]},
  ACTIONS_GROUP,
];

export const PITCH_POT_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: [...INFO_COLS, { label: "Throw", sortKey: "" }] },
  { groupLabel: "Pitching", columns: [
    { label: "Endurance", sortKey: "pot_endurance" }, { label: "Control", sortKey: "pot_control" },
    { label: "Velocity", sortKey: "pot_velocity" }, { label: "Sequence", sortKey: "pot_sequence" },
    { label: "Pickoff", sortKey: "pot_pickoff" },
  ]},
  { groupLabel: "Roles", columns: [{ label: "SP", sortKey: "sp" }, { label: "RP", sortKey: "rp" }] },
  { groupLabel: "Arsenal", columns: [
    { label: "P1", sortKey: "p1ovr" }, { label: "P2", sortKey: "p2ovr" },
    { label: "P3", sortKey: "p3ovr" }, { label: "P4", sortKey: "p4ovr" },
    { label: "P5", sortKey: "p5ovr" },
  ]},
  ACTIONS_GROUP,
];

export const CONTRACT_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Contract", columns: [
    { label: "Years", sortKey: "contractYears" }, { label: "Yr", sortKey: "contractCurrentYear" },
    { label: "Salary", sortKey: "contractSalary" }, { label: "Share", sortKey: "contractShare" },
    { label: "Bonus", sortKey: "contractBonus" }, { label: "Status", sortKey: "" },
  ]},
  ACTIONS_GROUP,
];

export const BATTING_STATS_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Batting", columns: [
    { label: "G", sortKey: "stat_g" }, { label: "AB", sortKey: "stat_ab" },
    { label: "H", sortKey: "stat_h" }, { label: "HR", sortKey: "stat_hr" },
    { label: "RBI", sortKey: "stat_rbi" }, { label: "BB", sortKey: "stat_bb" },
    { label: "SO", sortKey: "stat_so" }, { label: "SB", sortKey: "stat_sb" },
    { label: "AVG", sortKey: "stat_avg" }, { label: "OBP", sortKey: "stat_obp" },
    { label: "SLG", sortKey: "stat_slg" }, { label: "OPS", sortKey: "stat_ops" },
  ]},
  ACTIONS_GROUP,
];

export const PITCHING_STATS_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Pitching", columns: [
    { label: "G", sortKey: "stat_g" }, { label: "GS", sortKey: "stat_gs" },
    { label: "W", sortKey: "stat_w" }, { label: "L", sortKey: "stat_l" },
    { label: "SV", sortKey: "stat_sv" }, { label: "IP", sortKey: "stat_ip" },
    { label: "SO", sortKey: "stat_so" }, { label: "BB", sortKey: "stat_bb" },
    { label: "ERA", sortKey: "stat_era" }, { label: "WHIP", sortKey: "stat_whip" },
  ]},
  ACTIONS_GROUP,
];

// Variants without actions column
export const ALL_ATTR_GROUPS_NO_ACTIONS: ColumnGroup[] = ALL_ATTR_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const ALL_POT_GROUPS_NO_ACTIONS: ColumnGroup[] = ALL_POT_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const POS_ATTR_GROUPS_NO_ACTIONS: ColumnGroup[] = POS_ATTR_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const POS_POT_GROUPS_NO_ACTIONS: ColumnGroup[] = POS_POT_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const PITCH_ATTR_GROUPS_NO_ACTIONS: ColumnGroup[] = PITCH_ATTR_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const PITCH_POT_GROUPS_NO_ACTIONS: ColumnGroup[] = PITCH_POT_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const CONTRACT_GROUPS_NO_ACTIONS: ColumnGroup[] = CONTRACT_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const BATTING_STATS_GROUPS_NO_ACTIONS: ColumnGroup[] = BATTING_STATS_GROUPS.filter((g) => g !== ACTIONS_GROUP);
export const PITCHING_STATS_GROUPS_NO_ACTIONS: ColumnGroup[] = PITCHING_STATS_GROUPS.filter((g) => g !== ACTIONS_GROUP);

// ═══════════════════════════════════════════════
// Sort helpers
// ═══════════════════════════════════════════════

const POS_TO_RATING_KEY: Record<string, keyof PlayerRatings> = {
  C: "c_rating", "1B": "fb_rating", "2B": "sb_rating", "3B": "tb_rating",
  SS: "ss_rating", LF: "lf_rating", CF: "cf_rating", RF: "rf_rating", DH: "dh_rating",
};

export const getPrimaryPositionRating = (p: Player): number | null => {
  if (!p.listed_position) return null;
  const rKey = POS_TO_RATING_KEY[p.listed_position];
  if (!rKey) return null;
  return (p.ratings as any)[rKey] ?? null;
};

export const resolveSortValue = (p: Player, key: string, statsMap?: PlayerStatsMap): string | number | null => {
  if (key.startsWith("stat_")) {
    const s = statsMap?.get(p.id);
    if (!s) return null;
    const field = key.slice(5);
    const val = (s as any)[field];
    return val != null ? (typeof val === "string" ? parseFloat(val) || 0 : val) : null;
  }
  switch (key) {
    case "name":          return p.lastname;
    case "pos":           return p.listed_position ?? "";
    case "ptype":         return p.ptype;
    case "level":         return LEVEL_ORDER.indexOf(p.league_level);
    case "age":           return p.age;
    case "ovr":           return p.displayovr != null ? Number(p.displayovr) : null;
    case "durability":    return p.durability;
    case "contact":       return p.ratings.contact_display;
    case "power":         return p.ratings.power_display;
    case "eye":           return p.ratings.eye_display;
    case "disc":          return p.ratings.discipline_display;
    case "speed":         return p.ratings.speed_display;
    case "baserun":       return p.ratings.baserunning_display;
    case "fldcatch":      return p.ratings.fieldcatch_display;
    case "fldreact":      return p.ratings.fieldreact_display;
    case "fldspot":       return p.ratings.fieldspot_display;
    case "throwacc":      return p.ratings.throwacc_display;
    case "throwpow":      return p.ratings.throwpower_display;
    case "catchfrm":      return p.ratings.catchframe_display;
    case "catchseq":      return p.ratings.catchsequence_display;
    case "c": return p.ratings.c_rating; case "1b": return p.ratings.fb_rating;
    case "2b": return p.ratings.sb_rating; case "3b": return p.ratings.tb_rating;
    case "ss": return p.ratings.ss_rating; case "lf": return p.ratings.lf_rating;
    case "cf": return p.ratings.cf_rating; case "rf": return p.ratings.rf_rating;
    case "dh": return p.ratings.dh_rating;
    case "posrtg": return getPrimaryPositionRating(p);
    case "endurance":     return p.ratings.pendurance_display;
    case "control":       return p.ratings.pgencontrol_display;
    case "velocity":      return p.ratings.pthrowpower_display;
    case "sequence":      return p.ratings.psequencing_display;
    case "pickoff":       return p.ratings.pickoff_display;
    case "sp": return p.ratings.sp_rating; case "rp": return p.ratings.rp_rating;
    case "p1ovr": return p.ratings.pitch1_ovr; case "p2ovr": return p.ratings.pitch2_ovr;
    case "p3ovr": return p.ratings.pitch3_ovr; case "p4ovr": return p.ratings.pitch4_ovr;
    case "p5ovr": return p.ratings.pitch5_ovr;
    case "p1": return p.pitch1_name; case "p2": return p.pitch2_name;
    case "p3": return p.pitch3_name; case "p4": return p.pitch4_name;
    case "p5": return p.pitch5_name;
    // Potentials
    case "pot_contact":   return p.potentials.contact_pot;
    case "pot_power":     return p.potentials.power_pot;
    case "pot_eye":       return p.potentials.eye_pot;
    case "pot_disc":      return p.potentials.discipline_pot;
    case "pot_speed":     return p.potentials.speed_pot;
    case "pot_baserun":   return p.potentials.baserunning_pot;
    case "pot_fldcatch":  return p.potentials.fieldcatch_pot;
    case "pot_fldreact":  return p.potentials.fieldreact_pot;
    case "pot_fldspot":   return p.potentials.fieldspot_pot;
    case "pot_throwacc":  return p.potentials.throwacc_pot;
    case "pot_throwpow":  return p.potentials.throwpower_pot;
    case "pot_catchfrm":  return p.potentials.catchframe_pot;
    case "pot_catchseq":  return p.potentials.catchsequence_pot;
    case "pot_endurance": return p.potentials.pendurance_pot;
    case "pot_control":   return p.potentials.pgencontrol_pot;
    case "pot_velocity":  return p.potentials.pthrowpower_pot;
    case "pot_sequence":  return p.potentials.psequencing_pot;
    case "pot_pickoff":   return p.potentials.pickoff_pot;
    // Contracts
    case "contractYears":       return p.contract?.years ?? null;
    case "contractCurrentYear": return p.contract?.current_year ?? null;
    case "contractSalary":      return p.contract?.current_year_detail?.base_salary ?? null;
    case "contractShare":       return p.contract?.current_year_detail?.salary_share ?? null;
    case "contractBonus":       return p.contract?.bonus ?? null;
    default: return null;
  }
};

const STRING_KEYS = new Set(["name", "ptype", "p1", "p2", "p3", "p4", "p5"]);

const BOTTOM_SORT_VALUES = new Set(["?", "N", ""]);
const bottomRank = (v: string | number | null): number => {
  if (v == null) return 2;           // — (null) always last
  if (BOTTOM_SORT_VALUES.has(v as string)) return 1; // ? / N / empty just above null
  return 0;                          // real value
};

export const comparePlayers = (a: Player, b: Player, sort: SortConfig, statsMap?: PlayerStatsMap): number => {
  if (!sort) return 0;
  const { key, dir } = sort;
  const av = resolveSortValue(a, key, statsMap);
  const bv = resolveSortValue(b, key, statsMap);
  // Push null / "?" / "N" / "" to the bottom regardless of sort direction
  const aRank = bottomRank(av);
  const bRank = bottomRank(bv);
  if (aRank !== bRank) return aRank - bRank;
  if (aRank > 0) return 0; // both are bottom-tier, keep stable
  const mul = dir === "asc" ? 1 : -1;
  if (STRING_KEYS.has(key)) return mul * String(av).localeCompare(String(bv));
  // Handle letter grades (strings) mixed with numeric values
  const aNum = typeof av === "string" ? letterGradeToNumeric(av) : Number(av);
  const bNum = typeof bv === "string" ? letterGradeToNumeric(bv) : Number(bv);
  return mul * (aNum - bNum);
};

// ═══════════════════════════════════════════════
// Styling helpers
// ═══════════════════════════════════════════════

const thBase = "px-2 py-2 text-center text-xs";
export const td = "px-2 py-1.5";

// ═══════════════════════════════════════════════
// Shared cell components
// ═══════════════════════════════════════════════

export const StatCell = ({ value, isFuzzed }: { value: DisplayValue; isFuzzed?: boolean }) => {
  if (value == null) return <td className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = resolveDisplayValue(value);
  return (
    <td className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>
      {text}
    </td>
  );
};

export const PotentialCell = ({ pot, isFuzzed }: { pot: string | null; isFuzzed?: boolean }) => {
  if (!pot || pot === "N") return <td className={`${td} text-center text-gray-400`}>—</td>;
  if (pot === "?") return <td className={`${td} text-center text-gray-400`}>?</td>;
  return (
    <td className={`${td} text-center font-semibold ${potColor(pot)}`} title={isFuzzed ? "Estimated" : undefined}>
      {pot}
    </td>
  );
};

export const RatingCell = ({ value, isFuzzed }: { value: DisplayValue; isFuzzed?: boolean }) => {
  if (value == null) return <td className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = resolveDisplayValue(value);
  return (
    <td className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>
      {text}
    </td>
  );
};

const PitchCell = ({ name }: { name: string | null }) => (
  <td className={`${td} text-center text-xs whitespace-nowrap`}>{name || "—"}</td>
);

const PitchOvrCell = ({ name, ovr }: { name: string | null; ovr: DisplayValue }) => {
  if (!name && ovr == null) return <td className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = ovr != null ? resolveDisplayValue(ovr) : { text: "—", colorClass: "" };
  return (
    <td className={`${td} text-center ${colorClass}`} title={name || undefined}>
      {text}
    </td>
  );
};

export const NameCell = ({ p }: { p: Player }) => (
  <td className={`${td} font-medium whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
    {p.firstname} {p.lastname}
    {p.contract?.on_ir && (
      <span className="ml-1 px-1 py-0.5 text-[10px] font-bold rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">IR</span>
    )}
  </td>
);

// Position options for override dropdown
const POS_OPTIONS = [
  { code: "c", display: "C" }, { code: "fb", display: "1B" }, { code: "sb", display: "2B" },
  { code: "tb", display: "3B" }, { code: "ss", display: "SS" }, { code: "lf", display: "LF" },
  { code: "cf", display: "CF" }, { code: "rf", display: "RF" }, { code: "dh", display: "DH" },
  { code: "sp", display: "SP" }, { code: "rp", display: "RP" },
];

export const PositionCell = ({ p, onOverride }: {
  p: Player;
  onOverride?: (playerId: number, positionCode: string | null) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const pos = p.listed_position;
  const canEdit = !!onOverride;

  return (
    <td className={`${td} text-center relative`} onClick={(e) => { if (canEdit) { e.stopPropagation(); setIsOpen(!isOpen); } }}>
      <span className={`text-xs font-semibold ${canEdit ? "cursor-pointer hover:underline" : ""}`}>
        {pos ?? "—"}
      </span>
      {isOpen && canEdit && (
        <div ref={ref} className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg py-1 min-w-[4rem]">
          {POS_OPTIONS.map((opt) => (
            <button key={opt.code}
              className={`block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${pos === opt.display ? "font-bold text-blue-600 dark:text-blue-400" : ""}`}
              onClick={(e) => { e.stopPropagation(); onOverride(p.id, opt.code); setIsOpen(false); }}
            >
              {opt.display}
            </button>
          ))}
          {pos && (
            <button
              className="block w-full text-left px-3 py-1 text-xs text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t dark:border-gray-600"
              onClick={(e) => { e.stopPropagation(); onOverride(p.id, null); setIsOpen(false); }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </td>
  );
};

// ═══════════════════════════════════════════════
// Grouped table header
// ═══════════════════════════════════════════════

export const GroupedTableHeader = ({ groups, sortConfig, onSort }: {
  groups: ColumnGroup[];
  sortConfig: SortConfig;
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
          const isActive = sortConfig?.key === col.sortKey && col.sortKey !== "";
          const isFirstInGroup = ci === 0 && gi > 0 && g.groupLabel !== "";
          const isName = col.sortKey === "name";
          const canSort = col.sortKey !== "";
          return (
            <th key={`${gi}-${ci}`}
              className={`${thBase}
                ${isName ? "text-left sticky left-0 bg-gray-50 dark:bg-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]" : ""}
                ${isFirstInGroup ? "border-l dark:border-gray-500" : ""}
                ${canSort ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600" : ""}`}
              onClick={canSort ? () => onSort(col.sortKey) : undefined}>
              {col.label}
              {isActive && <span className="ml-0.5 text-[10px]">{sortConfig!.dir === "asc" ? "▲" : "▼"}</span>}
            </th>
          );
        })
      )}
    </tr>
  </thead>
);

// ═══════════════════════════════════════════════
// Category-specific cell groups
// ═══════════════════════════════════════════════

export const InfoCells = ({ p, orgAbbrev, isCollege, ageOverride, onPositionOverride }: {
  p: Player; orgAbbrev: string; isCollege?: boolean; ageOverride?: ReactNode;
  onPositionOverride?: (playerId: number, positionCode: string | null) => void;
}) => {
  const classYear = isCollege ? getClassYear(p.contract) : null;
  // OVR: if displayovr is already a string grade, show as-is; if numeric + college, convert
  const ovrResolved = p.displayovr != null ? resolveDisplayValue(
    isCollege && !isNaN(Number(p.displayovr)) ? numericToLetterGrade(Number(p.displayovr)) : p.displayovr
  ) : null;
  return (
    <>
      <NameCell p={p} />
      <PositionCell p={p} onOverride={onPositionOverride} />
      <td className={`${td} text-center font-semibold ${ovrResolved?.colorClass ?? ""}`}>
        {ovrResolved ? ovrResolved.text : "—"}
      </td>
      <td className={`${td} text-center`}>{displayLevel(p.league_level)}</td>
      <td className={`${td} text-center`}>{displayPlayerTeam(p.league_level, p.team_abbrev, orgAbbrev)}</td>
      {ageOverride ? (
        <td className={`${td} text-center`}>{ageOverride}</td>
      ) : isCollege && classYear?.abbrev ? (
        <td className={`${td} text-center`}>
          <span className="font-medium">{classYear.abbrev}</span>
          <span className="text-xs text-gray-400 ml-1">({p.age})</span>
        </td>
      ) : (
        <td className={`${td} text-center`}>{p.age}</td>
      )}
    </>
  );
};

export const AllAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <td className={`${td} text-center`}>
        <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
          {p.ptype === "Pitcher" ? "P" : "Pos"}
        </span>
      </td>
      <td className={`${td} text-center`}>{p.bat_hand}/{p.pitch_hand}</td>
      <StatCell value={p.ratings.contact_display} isFuzzed={af} />
      <StatCell value={p.ratings.power_display} isFuzzed={af} />
      <StatCell value={p.ratings.eye_display} isFuzzed={af} />
      <StatCell value={p.ratings.discipline_display} isFuzzed={af} />
      <StatCell value={p.ratings.speed_display} isFuzzed={af} />
      <StatCell value={p.ratings.fieldcatch_display} isFuzzed={af} />
      <StatCell value={p.ratings.fieldreact_display} isFuzzed={af} />
      <StatCell value={p.ratings.throwacc_display} isFuzzed={af} />
      <StatCell value={p.ratings.throwpower_display} isFuzzed={af} />
      <td className={`${td} text-center text-xs`}>{p.durability}</td>
    </>
  );
};

export const AllPotCells = ({ p }: { p: Player }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : false;
  return (
    <>
      <td className={`${td} text-center`}>
        <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
          {p.ptype === "Pitcher" ? "P" : "Pos"}
        </span>
      </td>
      <td className={`${td} text-center`}>{p.bat_hand}/{p.pitch_hand}</td>
      <PotentialCell pot={p.potentials.contact_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.power_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.eye_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.discipline_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.speed_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.fieldcatch_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.fieldreact_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.throwacc_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.throwpower_pot} isFuzzed={pf} />
      <td className={`${td} text-center text-xs`}>{p.durability}</td>
    </>
  );
};

export const PosAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <StatCell value={p.ratings.contact_display} isFuzzed={af} />
      <StatCell value={p.ratings.power_display} isFuzzed={af} />
      <StatCell value={p.ratings.eye_display} isFuzzed={af} />
      <StatCell value={p.ratings.discipline_display} isFuzzed={af} />
      <StatCell value={p.ratings.speed_display} isFuzzed={af} />
      <StatCell value={p.ratings.baserunning_display} isFuzzed={af} />
      <StatCell value={p.ratings.fieldcatch_display} isFuzzed={af} />
      <StatCell value={p.ratings.fieldreact_display} isFuzzed={af} />
      <StatCell value={p.ratings.fieldspot_display} isFuzzed={af} />
      <StatCell value={p.ratings.throwacc_display} isFuzzed={af} />
      <StatCell value={p.ratings.throwpower_display} isFuzzed={af} />
      <StatCell value={p.ratings.catchframe_display} isFuzzed={af} />
      <StatCell value={p.ratings.catchsequence_display} isFuzzed={af} />
      <RatingCell value={getPrimaryPositionRating(p)} isFuzzed={af} />
    </>
  );
};

export const PosPotCells = ({ p, isFuzzed, potFuzzed }: { p: Player; isFuzzed?: boolean; potFuzzed?: boolean }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : potFuzzed;
  return (
    <>
      <PotentialCell pot={p.potentials.contact_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.power_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.eye_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.discipline_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.speed_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.baserunning_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.fieldcatch_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.fieldreact_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.fieldspot_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.throwacc_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.throwpower_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.catchframe_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.catchsequence_pot} isFuzzed={pf} />
      <RatingCell value={getPrimaryPositionRating(p)} isFuzzed={isFuzzed} />
    </>
  );
};

export const PitchAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <td className={`${td} text-center`}>{p.pitch_hand}</td>
      <StatCell value={p.ratings.pendurance_display} isFuzzed={af} />
      <StatCell value={p.ratings.pgencontrol_display} isFuzzed={af} />
      <StatCell value={p.ratings.pthrowpower_display} isFuzzed={af} />
      <StatCell value={p.ratings.psequencing_display} isFuzzed={af} />
      <StatCell value={p.ratings.pickoff_display} isFuzzed={af} />
      <RatingCell value={p.ratings.sp_rating} isFuzzed={af} />
      <RatingCell value={p.ratings.rp_rating} isFuzzed={af} />
      <PitchOvrCell name={p.pitch1_name} ovr={p.ratings.pitch1_ovr} />
      <PitchOvrCell name={p.pitch2_name} ovr={p.ratings.pitch2_ovr} />
      <PitchOvrCell name={p.pitch3_name} ovr={p.ratings.pitch3_ovr} />
      <PitchOvrCell name={p.pitch4_name} ovr={p.ratings.pitch4_ovr} />
      <PitchOvrCell name={p.pitch5_name} ovr={p.ratings.pitch5_ovr} />
    </>
  );
};

export const PitchPotCells = ({ p, isFuzzed, potFuzzed }: { p: Player; isFuzzed?: boolean; potFuzzed?: boolean }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : potFuzzed;
  return (
    <>
      <td className={`${td} text-center`}>{p.pitch_hand}</td>
      <PotentialCell pot={p.potentials.pendurance_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.pgencontrol_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.pthrowpower_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.psequencing_pot} isFuzzed={pf} />
      <PotentialCell pot={p.potentials.pickoff_pot} isFuzzed={pf} />
      <RatingCell value={p.ratings.sp_rating} isFuzzed={isFuzzed} />
      <RatingCell value={p.ratings.rp_rating} isFuzzed={isFuzzed} />
      <PitchOvrCell name={p.pitch1_name} ovr={p.ratings.pitch1_ovr} />
      <PitchOvrCell name={p.pitch2_name} ovr={p.ratings.pitch2_ovr} />
      <PitchOvrCell name={p.pitch3_name} ovr={p.ratings.pitch3_ovr} />
      <PitchOvrCell name={p.pitch4_name} ovr={p.ratings.pitch4_ovr} />
      <PitchOvrCell name={p.pitch5_name} ovr={p.ratings.pitch5_ovr} />
    </>
  );
};

export const ContractCells = ({ p, isCollege }: { p: Player; isCollege?: boolean }) => {
  const c = p.contract;
  if (!c) {
    return <><td className={`${td} text-center text-gray-400`} colSpan={6}>No contract</td></>;
  }
  const salary = c.current_year_detail?.base_salary;
  const share = c.current_year_detail?.salary_share;
  const badges: string[] = [];
  if (c.is_buyout) badges.push("Buyout");
  if (c.on_ir) badges.push("IR");
  if (isCollege) {
    const classYear = getClassYear(c);
    if (classYear.abbrev) badges.push(classYear.abbrev);
  } else {
    if (c.is_extension) badges.push("Ext");
  }
  return (
    <>
      <td className={`${td} text-center`}>{c.years}</td>
      <td className={`${td} text-center`}>{c.current_year}</td>
      <td className={`${td} text-center`}>{salary != null ? `$${(salary / 1_000_000).toFixed(2)}M` : "—"}</td>
      <td className={`${td} text-center`}>{share != null ? `${(share * 100).toFixed(1)}%` : "—"}</td>
      <td className={`${td} text-center`}>{c.bonus > 0 ? `$${(c.bonus / 1_000_000).toFixed(2)}M` : "—"}</td>
      <td className={`${td} text-center text-xs`}>{badges.length > 0 ? badges.join(", ") : "Active"}</td>
    </>
  );
};

// Stats data type for roster table
export type PlayerStatsMap = Map<number, BattingLeaderRow | PitchingLeaderRow>;

export const BattingStatsCells = ({ p, statsMap }: { p: Player; statsMap?: PlayerStatsMap }) => {
  const s = statsMap?.get(p.id) as BattingLeaderRow | undefined;
  if (!s) return <td className={`${td} text-center text-gray-400`} colSpan={12}>—</td>;
  return (
    <>
      <td className={`${td} text-center`}>{s.g}</td>
      <td className={`${td} text-center`}>{s.ab}</td>
      <td className={`${td} text-center`}>{s.h}</td>
      <td className={`${td} text-center font-semibold`}>{s.hr}</td>
      <td className={`${td} text-center`}>{s.rbi}</td>
      <td className={`${td} text-center`}>{s.bb}</td>
      <td className={`${td} text-center`}>{s.so}</td>
      <td className={`${td} text-center`}>{s.sb}</td>
      <td className={`${td} text-center font-semibold`}>{s.avg}</td>
      <td className={`${td} text-center font-semibold`}>{s.obp}</td>
      <td className={`${td} text-center font-semibold`}>{s.slg}</td>
      <td className={`${td} text-center font-semibold`}>{s.ops}</td>
    </>
  );
};

export const PitchingStatsCells = ({ p, statsMap }: { p: Player; statsMap?: PlayerStatsMap }) => {
  const s = statsMap?.get(p.id) as PitchingLeaderRow | undefined;
  if (!s) return <td className={`${td} text-center text-gray-400`} colSpan={10}>—</td>;
  return (
    <>
      <td className={`${td} text-center`}>{s.g}</td>
      <td className={`${td} text-center`}>{s.gs}</td>
      <td className={`${td} text-center`}>{s.w}</td>
      <td className={`${td} text-center`}>{s.l}</td>
      <td className={`${td} text-center`}>{s.sv}</td>
      <td className={`${td} text-center`}>{s.ip}</td>
      <td className={`${td} text-center`}>{s.so}</td>
      <td className={`${td} text-center`}>{s.bb}</td>
      <td className={`${td} text-center font-semibold`}>{s.era}</td>
      <td className={`${td} text-center font-semibold`}>{s.whip}</td>
    </>
  );
};

// ═══════════════════════════════════════════════
// Reusable table components
// ═══════════════════════════════════════════════

export interface RosterTableProps {
  players: Player[];
  orgAbbrev: string;
  onPlayerClick: (p: Player) => void;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  category: BaseballCategory;
  isCollege?: boolean;
  isFuzzed?: boolean;
  potFuzzed?: boolean;
  renderActions?: (p: Player) => ReactNode;
  ageOverride?: (p: Player) => ReactNode;
  onPositionOverride?: (playerId: number, positionCode: string | null) => void;
  playerStatsMap?: PlayerStatsMap;
}

export const AllPlayersTable = ({ players, orgAbbrev, onPlayerClick, sortConfig, onSort, category, isCollege, isFuzzed, potFuzzed, renderActions, ageOverride, onPositionOverride, playerStatsMap }: RosterTableProps) => {
  const hasActions = !!renderActions;
  const groups = category === Contracts
    ? (hasActions ? CONTRACT_GROUPS : CONTRACT_GROUPS_NO_ACTIONS)
    : category === Stats
    ? (hasActions ? BATTING_STATS_GROUPS : BATTING_STATS_GROUPS_NO_ACTIONS)
    : category === Potentials
    ? (hasActions ? ALL_POT_GROUPS : ALL_POT_GROUPS_NO_ACTIONS)
    : (hasActions ? ALL_ATTR_GROUPS : ALL_ATTR_GROUPS_NO_ACTIONS);
  return (
    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <AllAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <AllPotCells p={p} />}
              {category === Contracts && <ContractCells p={p} isCollege={isCollege} />}
              {category === Stats && <BattingStatsCells p={p} statsMap={playerStatsMap} />}
              {renderActions && (
                <td className={`${td} text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(p)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const PositionTable = ({ players, orgAbbrev, onPlayerClick, sortConfig, onSort, category, isCollege, isFuzzed, potFuzzed, renderActions, ageOverride, onPositionOverride, playerStatsMap }: RosterTableProps) => {
  const hasActions = !!renderActions;
  const groups = category === Contracts
    ? (hasActions ? CONTRACT_GROUPS : CONTRACT_GROUPS_NO_ACTIONS)
    : category === Stats
    ? (hasActions ? BATTING_STATS_GROUPS : BATTING_STATS_GROUPS_NO_ACTIONS)
    : category === Potentials
    ? (hasActions ? POS_POT_GROUPS : POS_POT_GROUPS_NO_ACTIONS)
    : (hasActions ? POS_ATTR_GROUPS : POS_ATTR_GROUPS_NO_ACTIONS);
  return (
    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <PosAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <PosPotCells p={p} isFuzzed={isFuzzed} potFuzzed={potFuzzed} />}
              {category === Contracts && <ContractCells p={p} isCollege={isCollege} />}
              {category === Stats && <BattingStatsCells p={p} statsMap={playerStatsMap} />}
              {renderActions && (
                <td className={`${td} text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(p)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const PitcherTable = ({ players, orgAbbrev, onPlayerClick, sortConfig, onSort, category, isCollege, isFuzzed, potFuzzed, renderActions, ageOverride, onPositionOverride, playerStatsMap }: RosterTableProps) => {
  const hasActions = !!renderActions;
  const groups = category === Contracts
    ? (hasActions ? CONTRACT_GROUPS : CONTRACT_GROUPS_NO_ACTIONS)
    : category === Stats
    ? (hasActions ? PITCHING_STATS_GROUPS : PITCHING_STATS_GROUPS_NO_ACTIONS)
    : category === Potentials
    ? (hasActions ? PITCH_POT_GROUPS : PITCH_POT_GROUPS_NO_ACTIONS)
    : (hasActions ? PITCH_ATTR_GROUPS : PITCH_ATTR_GROUPS_NO_ACTIONS);
  return (
    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <PitchAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <PitchPotCells p={p} isFuzzed={isFuzzed} potFuzzed={potFuzzed} />}
              {category === Contracts && <ContractCells p={p} isCollege={isCollege} />}
              {category === Stats && <PitchingStatsCells p={p} statsMap={playerStatsMap} />}
              {renderActions && (
                <td className={`${td} text-center`} onClick={(e) => e.stopPropagation()}>
                  {renderActions(p)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import { ReactNode, useRef, useState, useEffect } from "react";
import "./baseballMobile.css";
import { DisplayValue, Player, PlayerRatings } from "../../../models/baseball/baseballModels";
import { BattingLeaderRow, PitchingLeaderRow } from "../../../models/baseball/baseballStatsModels";
import { Attributes, Potentials, Contracts } from "../../../_constants/constants";
import { displayLevel, displayPlayerTeam, LEVEL_ORDER, getClassYear, numericToLetterGrade, resolveDisplayValue, letterGradeToNumeric } from "../../../_utility/baseballHelpers";
import { ratingColor, potColor, staminaColor } from "./baseballColorConfig";
import { isPlayerBenched, injuryTooltip } from "../../../_utility/injuryUtils";

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
  { groupLabel: "Misc", columns: [{ label: "Durability", sortKey: "durability" }, { label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "Misc", columns: [{ label: "Durability", sortKey: "durability" }, { label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
  ACTIONS_GROUP,
];

export const CONTRACT_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Contract", columns: [
    { label: "Years", sortKey: "contractYears" }, { label: "Yr", sortKey: "contractCurrentYear" },
    { label: "Salary", sortKey: "contractSalary" }, { label: "Share", sortKey: "contractShare" },
    { label: "Bonus", sortKey: "contractBonus" }, { label: "Status", sortKey: "contractStatus" },
  ]},
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
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
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
  ACTIONS_GROUP,
];

export const PITCHING_STATS_GROUPS: ColumnGroup[] = [
  { groupLabel: "", columns: INFO_COLS },
  { groupLabel: "Pitching", columns: [
    { label: "G", sortKey: "stat_g" }, { label: "GS", sortKey: "stat_gs" },
    { label: "W", sortKey: "stat_w" }, { label: "L", sortKey: "stat_l" },
    { label: "SV", sortKey: "stat_sv" }, { label: "HLD", sortKey: "stat_hld" },
    { label: "BS", sortKey: "stat_bs" }, { label: "QS", sortKey: "stat_qs" },
    { label: "IP", sortKey: "stat_ip" },
    { label: "SO", sortKey: "stat_so" }, { label: "BB", sortKey: "stat_bb" },
    { label: "ERA", sortKey: "stat_era" }, { label: "WHIP", sortKey: "stat_whip" },
  ]},
  { groupLabel: "", columns: [{ label: "Stamina", sortKey: "stamina" }] },
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

const POS_SORT_ORDER = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "SP", "RP", "P"];
const DURABILITY_SORT_ORDER: Record<string, number> = {
  // Cover all possible API string formats (case-insensitive lookup used below)
  "fragile": 1, "frail": 2, "injury prone": 3, "below average": 4,
  "normal": 5, "average": 5, "durable": 6, "above average": 6,
  "very durable": 7, "iron man": 8,
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
    case "pos": {
      const pos = (p.listed_position ?? "").toUpperCase();
      const idx = POS_SORT_ORDER.indexOf(pos);
      return idx >= 0 ? idx : 99;
    }
    case "ptype":         return p.ptype;
    case "level":         return LEVEL_ORDER.indexOf(p.league_level);
    case "age":           return p.age;
    case "ovr":           return p.displayovr != null ? Number(p.displayovr) : null;
    case "durability":    return DURABILITY_SORT_ORDER[(p.durability || "").toLowerCase()] ?? 5;
    case "stamina":       return p.stamina ?? null;
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
    case "contractStatus": {
      if (!p.contract) return 0;
      // Sort: IR first, then Buyout, Extension, then Active last
      if (p.contract.on_ir) return 3;
      if (p.contract.is_buyout) return 2;
      if (p.contract.is_extension) return 1;
      return 0;
    }
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
export const td = "px-2 py-2.5 sm:py-1.5";

// ═══════════════════════════════════════════════
// Shared cell components
// ═══════════════════════════════════════════════

export const StatCell = ({ value, isFuzzed, label }: { value: DisplayValue; isFuzzed?: boolean; label?: string }) => {
  if (value == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = resolveDisplayValue(value);
  return (
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>
      {text}
    </td>
  );
};

export const PotentialCell = ({ pot, isFuzzed, label }: { pot: string | null; isFuzzed?: boolean; label?: string }) => {
  if (!pot || pot === "N") return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  if (pot === "?") return <td data-label={label} className={`${td} text-center text-gray-400`}>?</td>;
  return (
    <td data-label={label} className={`${td} text-center font-semibold ${potColor(pot)}`} title={isFuzzed ? "Estimated" : undefined}>
      {pot}
    </td>
  );
};

export const RatingCell = ({ value, isFuzzed, label }: { value: DisplayValue; isFuzzed?: boolean; label?: string }) => {
  if (value == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = resolveDisplayValue(value);
  return (
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={isFuzzed ? "Estimated" : undefined}>
      {text}
    </td>
  );
};

const staminaBarBg = (v: number): string => {
  if (v >= 90) return "bg-green-500";
  if (v >= 70) return "bg-green-400";
  if (v >= 50) return "bg-yellow-500";
  if (v >= 30) return "bg-orange-500";
  return "bg-red-500";
};

const StaminaBarCell = ({ value: rawValue, isInjured }: { value: number | undefined; isInjured?: boolean }) => {
  const value = rawValue ?? 100;
  if (isInjured && value === 0) {
    return (
      <div className="flex items-center min-w-[48px]">
        <span className="text-[10px] font-bold text-red-500 dark:text-red-400">OUT</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 min-w-[48px]">
      <div className="flex-1 h-2.5 rounded-full bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full ${staminaBarBg(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[10px] font-semibold w-5 text-right ${staminaColor(value)}`}>{value}</span>
    </div>
  );
};

const PitchCell = ({ name, label }: { name: string | null; label?: string }) => (
  <td data-label={label} className={`${td} text-center text-xs whitespace-nowrap`}>{name || "—"}</td>
);

const PitchOvrCell = ({ name, ovr, label }: { name: string | null; ovr: DisplayValue; label?: string }) => {
  if (!name && ovr == null) return <td data-label={label} className={`${td} text-center text-gray-400`}>—</td>;
  const { text, colorClass } = ovr != null ? resolveDisplayValue(ovr) : { text: "—", colorClass: "" };
  return (
    <td data-label={label} className={`${td} text-center ${colorClass}`} title={name || undefined}>
      {text}
    </td>
  );
};

export const NameCell = ({ p }: { p: Player }) => (
  <td data-label="Name" className={`${td} bb-cell-name font-medium whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
    {p.firstname} {p.lastname}
    {p.contract?.on_ir && (
      <span className="ml-1 px-1 py-0.5 text-[10px] font-bold rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">IR</span>
    )}
    {p.is_injured && (
      <span
        className="ml-1 px-1 py-0.5 text-[10px] font-bold rounded bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
        title={injuryTooltip(p) ?? undefined}
      >
        INJ
      </span>
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
    <td data-label="Pos" className={`${td} text-center relative`} onClick={(e) => { if (canEdit) { e.stopPropagation(); setIsOpen(!isOpen); } }}>
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
  // OVR: displayovr may arrive as a numeric string ("75") — always parse to number first so
  // resolveDisplayValue uses the numeric color path rather than the letter-grade fallback (red).
  const ovrNumeric = p.displayovr != null && !isNaN(Number(p.displayovr)) ? Number(p.displayovr) : null;
  const ovrResolved = ovrNumeric != null ? resolveDisplayValue(
    isCollege ? numericToLetterGrade(ovrNumeric) : ovrNumeric
  ) : null;
  return (
    <>
      <NameCell p={p} />
      <PositionCell p={p} onOverride={onPositionOverride} />
      <td data-label="OVR" className={`${td} bb-cell-ovr text-center font-semibold ${ovrResolved?.colorClass ?? ""}`}>
        {ovrResolved ? ovrResolved.text : "—"}
      </td>
      <td data-label="Level" className={`${td} text-center`}>{displayLevel(p.league_level)}</td>
      <td data-label="Team" className={`${td} text-center`}>{displayPlayerTeam(p.league_level, p.team_abbrev, orgAbbrev)}</td>
      {ageOverride ? (
        <td data-label="Age" className={`${td} text-center`}>{ageOverride}</td>
      ) : isCollege && classYear?.abbrev ? (
        <td data-label="Age" className={`${td} text-center`}>
          <span className="font-medium">{classYear.abbrev}</span>
          <span className="text-xs text-gray-400 ml-1">({p.age})</span>
        </td>
      ) : (
        <td data-label="Age" className={`${td} text-center`}>{p.age}</td>
      )}
    </>
  );
};

export const AllAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <td data-label="Type" className={`${td} text-center`}>
        <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
          {p.ptype === "Pitcher" ? "P" : "Pos"}
        </span>
      </td>
      <td data-label="B/T" className={`${td} text-center`}>{p.bat_hand}/{p.pitch_hand}</td>
      <StatCell value={p.ratings.contact_display} isFuzzed={af} label="Contact" />
      <StatCell value={p.ratings.power_display} isFuzzed={af} label="Power" />
      <StatCell value={p.ratings.eye_display} isFuzzed={af} label="Eye" />
      <StatCell value={p.ratings.discipline_display} isFuzzed={af} label="Disc" />
      <StatCell value={p.ratings.speed_display} isFuzzed={af} label="Speed" />
      <StatCell value={p.ratings.fieldcatch_display} isFuzzed={af} label="FldCatch" />
      <StatCell value={p.ratings.fieldreact_display} isFuzzed={af} label="FldReact" />
      <StatCell value={p.ratings.throwacc_display} isFuzzed={af} label="ThrowAcc" />
      <StatCell value={p.ratings.throwpower_display} isFuzzed={af} label="ThrowPow" />
      <td data-label="Durability" className={`${td} text-center text-xs`}>{p.durability}</td>
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const AllPotCells = ({ p }: { p: Player }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : false;
  return (
    <>
      <td data-label="Type" className={`${td} text-center`}>
        <span className={`px-1.5 py-0.5 text-xs rounded ${p.ptype === "Pitcher" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
          {p.ptype === "Pitcher" ? "P" : "Pos"}
        </span>
      </td>
      <td data-label="B/T" className={`${td} text-center`}>{p.bat_hand}/{p.pitch_hand}</td>
      <PotentialCell pot={p.potentials.contact_pot} isFuzzed={pf} label="Contact" />
      <PotentialCell pot={p.potentials.power_pot} isFuzzed={pf} label="Power" />
      <PotentialCell pot={p.potentials.eye_pot} isFuzzed={pf} label="Eye" />
      <PotentialCell pot={p.potentials.discipline_pot} isFuzzed={pf} label="Disc" />
      <PotentialCell pot={p.potentials.speed_pot} isFuzzed={pf} label="Speed" />
      <PotentialCell pot={p.potentials.fieldcatch_pot} isFuzzed={pf} label="FldCatch" />
      <PotentialCell pot={p.potentials.fieldreact_pot} isFuzzed={pf} label="FldReact" />
      <PotentialCell pot={p.potentials.throwacc_pot} isFuzzed={pf} label="ThrowAcc" />
      <PotentialCell pot={p.potentials.throwpower_pot} isFuzzed={pf} label="ThrowPow" />
      <td data-label="Durability" className={`${td} text-center text-xs`}>{p.durability}</td>
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const PosAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <StatCell value={p.ratings.contact_display} isFuzzed={af} label="Contact" />
      <StatCell value={p.ratings.power_display} isFuzzed={af} label="Power" />
      <StatCell value={p.ratings.eye_display} isFuzzed={af} label="Eye" />
      <StatCell value={p.ratings.discipline_display} isFuzzed={af} label="Disc" />
      <StatCell value={p.ratings.speed_display} isFuzzed={af} label="Speed" />
      <StatCell value={p.ratings.baserunning_display} isFuzzed={af} label="BaseRun" />
      <StatCell value={p.ratings.fieldcatch_display} isFuzzed={af} label="FldCatch" />
      <StatCell value={p.ratings.fieldreact_display} isFuzzed={af} label="FldReact" />
      <StatCell value={p.ratings.fieldspot_display} isFuzzed={af} label="FldSpot" />
      <StatCell value={p.ratings.throwacc_display} isFuzzed={af} label="ThrowAcc" />
      <StatCell value={p.ratings.throwpower_display} isFuzzed={af} label="ThrowPow" />
      <StatCell value={p.ratings.catchframe_display} isFuzzed={af} label="CatchFrm" />
      <StatCell value={p.ratings.catchsequence_display} isFuzzed={af} label="CatchSeq" />
      <RatingCell value={getPrimaryPositionRating(p)} isFuzzed={af} label="Pos Rtg" />
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const PosPotCells = ({ p, isFuzzed, potFuzzed }: { p: Player; isFuzzed?: boolean; potFuzzed?: boolean }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : potFuzzed;
  return (
    <>
      <PotentialCell pot={p.potentials.contact_pot} isFuzzed={pf} label="Contact" />
      <PotentialCell pot={p.potentials.power_pot} isFuzzed={pf} label="Power" />
      <PotentialCell pot={p.potentials.eye_pot} isFuzzed={pf} label="Eye" />
      <PotentialCell pot={p.potentials.discipline_pot} isFuzzed={pf} label="Disc" />
      <PotentialCell pot={p.potentials.speed_pot} isFuzzed={pf} label="Speed" />
      <PotentialCell pot={p.potentials.baserunning_pot} isFuzzed={pf} label="BaseRun" />
      <PotentialCell pot={p.potentials.fieldcatch_pot} isFuzzed={pf} label="FldCatch" />
      <PotentialCell pot={p.potentials.fieldreact_pot} isFuzzed={pf} label="FldReact" />
      <PotentialCell pot={p.potentials.fieldspot_pot} isFuzzed={pf} label="FldSpot" />
      <PotentialCell pot={p.potentials.throwacc_pot} isFuzzed={pf} label="ThrowAcc" />
      <PotentialCell pot={p.potentials.throwpower_pot} isFuzzed={pf} label="ThrowPow" />
      <PotentialCell pot={p.potentials.catchframe_pot} isFuzzed={pf} label="CatchFrm" />
      <PotentialCell pot={p.potentials.catchsequence_pot} isFuzzed={pf} label="CatchSeq" />
      <RatingCell value={getPrimaryPositionRating(p)} isFuzzed={isFuzzed} label="Pos Rtg" />
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const PitchAttrCells = ({ p, isFuzzed }: { p: Player; isFuzzed?: boolean }) => {
  const af = p.visibility_context ? !p.visibility_context.attributes_precise : isFuzzed;
  return (
    <>
      <td data-label="Throw" className={`${td} text-center`}>{p.pitch_hand}</td>
      <StatCell value={p.ratings.pendurance_display} isFuzzed={af} label="Endurance" />
      <StatCell value={p.ratings.pgencontrol_display} isFuzzed={af} label="Control" />
      <StatCell value={p.ratings.pthrowpower_display} isFuzzed={af} label="Velocity" />
      <StatCell value={p.ratings.psequencing_display} isFuzzed={af} label="Sequence" />
      <StatCell value={p.ratings.pickoff_display} isFuzzed={af} label="Pickoff" />
      <RatingCell value={p.ratings.sp_rating} isFuzzed={af} label="SP" />
      <RatingCell value={p.ratings.rp_rating} isFuzzed={af} label="RP" />
      <PitchOvrCell name={p.pitch1_name} ovr={p.ratings.pitch1_ovr} label="P1" />
      <PitchOvrCell name={p.pitch2_name} ovr={p.ratings.pitch2_ovr} label="P2" />
      <PitchOvrCell name={p.pitch3_name} ovr={p.ratings.pitch3_ovr} label="P3" />
      <PitchOvrCell name={p.pitch4_name} ovr={p.ratings.pitch4_ovr} label="P4" />
      <PitchOvrCell name={p.pitch5_name} ovr={p.ratings.pitch5_ovr} label="P5" />
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const PitchPotCells = ({ p, isFuzzed, potFuzzed }: { p: Player; isFuzzed?: boolean; potFuzzed?: boolean }) => {
  const pf = p.visibility_context ? !p.visibility_context.potentials_precise : potFuzzed;
  return (
    <>
      <td data-label="Throw" className={`${td} text-center`}>{p.pitch_hand}</td>
      <PotentialCell pot={p.potentials.pendurance_pot} isFuzzed={pf} label="Endurance" />
      <PotentialCell pot={p.potentials.pgencontrol_pot} isFuzzed={pf} label="Control" />
      <PotentialCell pot={p.potentials.pthrowpower_pot} isFuzzed={pf} label="Velocity" />
      <PotentialCell pot={p.potentials.psequencing_pot} isFuzzed={pf} label="Sequence" />
      <PotentialCell pot={p.potentials.pickoff_pot} isFuzzed={pf} label="Pickoff" />
      <RatingCell value={p.ratings.sp_rating} isFuzzed={isFuzzed} label="SP" />
      <RatingCell value={p.ratings.rp_rating} isFuzzed={isFuzzed} label="RP" />
      <PitchOvrCell name={p.pitch1_name} ovr={p.ratings.pitch1_ovr} label="P1" />
      <PitchOvrCell name={p.pitch2_name} ovr={p.ratings.pitch2_ovr} label="P2" />
      <PitchOvrCell name={p.pitch3_name} ovr={p.ratings.pitch3_ovr} label="P3" />
      <PitchOvrCell name={p.pitch4_name} ovr={p.ratings.pitch4_ovr} label="P4" />
      <PitchOvrCell name={p.pitch5_name} ovr={p.ratings.pitch5_ovr} label="P5" />
      <td data-label="Stamina" className={`${td} text-center text-xs`}>
        {<StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
        }
      </td>
    </>
  );
};

export const ContractCells = ({ p, isCollege }: { p: Player; isCollege?: boolean }) => {
  const c = p.contract;
  if (!c) {
    return <><td data-label="Contract" className={`${td} text-center text-gray-400`} colSpan={6}>No contract</td></>;
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
      <td data-label="Years" className={`${td} text-center`}>{c.years}</td>
      <td data-label="Yr" className={`${td} text-center`}>{c.current_year}</td>
      <td data-label="Salary" className={`${td} text-center`}>{salary != null ? `$${(salary / 1_000_000).toFixed(2)}M` : "—"}</td>
      <td data-label="Share" className={`${td} text-center`}>{share != null ? `${(share * 100).toFixed(1)}%` : "—"}</td>
      <td data-label="Bonus" className={`${td} text-center`}>{c.bonus > 0 ? `$${(c.bonus / 1_000_000).toFixed(2)}M` : "—"}</td>
      <td data-label="Status" className={`${td} text-center text-xs`}>{badges.length > 0 ? badges.join(", ") : "Active"}</td>
    </>
  );
};

// Stats data type for roster table
export type PlayerStatsMap = Map<number, BattingLeaderRow | PitchingLeaderRow>;

export const BattingStatsCells = ({ p, statsMap }: { p: Player; statsMap?: PlayerStatsMap }) => {
  const s = statsMap?.get(p.id) as BattingLeaderRow | undefined;
  if (!s) return <td data-label="Stats" className={`${td} text-center text-gray-400`} colSpan={12}>—</td>;
  return (
    <>
      <td data-label="G" className={`${td} text-center`}>{s.g}</td>
      <td data-label="AB" className={`${td} text-center`}>{s.ab}</td>
      <td data-label="H" className={`${td} text-center`}>{s.h}</td>
      <td data-label="HR" className={`${td} text-center font-semibold`}>{s.hr}</td>
      <td data-label="RBI" className={`${td} text-center`}>{s.rbi}</td>
      <td data-label="BB" className={`${td} text-center`}>{s.bb}</td>
      <td data-label="SO" className={`${td} text-center`}>{s.so}</td>
      <td data-label="SB" className={`${td} text-center`}>{s.sb}</td>
      <td data-label="AVG" className={`${td} text-center font-semibold`}>{s.avg}</td>
      <td data-label="OBP" className={`${td} text-center font-semibold`}>{s.obp}</td>
      <td data-label="SLG" className={`${td} text-center font-semibold`}>{s.slg}</td>
      <td data-label="OPS" className={`${td} text-center font-semibold`}>{s.ops}</td>
    </>
  );
};

export const PitchingStatsCells = ({ p, statsMap }: { p: Player; statsMap?: PlayerStatsMap }) => {
  const s = statsMap?.get(p.id) as PitchingLeaderRow | undefined;
  if (!s) return <td data-label="Stats" className={`${td} text-center text-gray-400`} colSpan={13}>—</td>;
  return (
    <>
      <td data-label="G" className={`${td} text-center`}>{s.g}</td>
      <td data-label="GS" className={`${td} text-center`}>{s.gs}</td>
      <td data-label="W" className={`${td} text-center`}>{s.w}</td>
      <td data-label="L" className={`${td} text-center`}>{s.l}</td>
      <td data-label="SV" className={`${td} text-center`}>{s.sv}</td>
      <td data-label="HLD" className={`${td} text-center`}>{s.hld}</td>
      <td data-label="BS" className={`${td} text-center`}>{s.bs}</td>
      <td data-label="QS" className={`${td} text-center`}>{s.qs}</td>
      <td data-label="IP" className={`${td} text-center`}>{s.ip}</td>
      <td data-label="SO" className={`${td} text-center`}>{s.so}</td>
      <td data-label="BB" className={`${td} text-center`}>{s.bb}</td>
      <td data-label="ERA" className={`${td} text-center font-semibold`}>{s.era}</td>
      <td data-label="WHIP" className={`${td} text-center font-semibold`}>{s.whip}</td>
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
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className={`border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer${isPlayerBenched(p) ? " opacity-50" : ""}`} onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <AllAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <AllPotCells p={p} />}
              {category === Contracts && <><ContractCells p={p} isCollege={isCollege} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {category === Stats && <><BattingStatsCells p={p} statsMap={playerStatsMap} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {renderActions && (
                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
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
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className={`border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer${isPlayerBenched(p) ? " opacity-50" : ""}`} onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <PosAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <PosPotCells p={p} isFuzzed={isFuzzed} potFuzzed={potFuzzed} />}
              {category === Contracts && <><ContractCells p={p} isCollege={isCollege} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {category === Stats && <><BattingStatsCells p={p} statsMap={playerStatsMap} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {renderActions && (
                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
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
    <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <GroupedTableHeader groups={groups} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className={`border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer${isPlayerBenched(p) ? " opacity-50" : ""}`} onClick={() => onPlayerClick(p)}>
              <InfoCells p={p} orgAbbrev={orgAbbrev} isCollege={isCollege} ageOverride={ageOverride?.(p)} onPositionOverride={onPositionOverride} />
              {category === Attributes && <PitchAttrCells p={p} isFuzzed={isFuzzed} />}
              {category === Potentials && <PitchPotCells p={p} isFuzzed={isFuzzed} potFuzzed={potFuzzed} />}
              {category === Contracts && <><ContractCells p={p} isCollege={isCollege} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {category === Stats && <><PitchingStatsCells p={p} statsMap={playerStatsMap} /><td data-label="Stamina" className={`${td} text-center text-xs`}><StaminaBarCell value={p.stamina} isInjured={p.is_injured} /></td></>}
              {renderActions && (
                <td data-label="Actions" className={`${td} bb-cell-actions text-center`} onClick={(e) => e.stopPropagation()}>
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

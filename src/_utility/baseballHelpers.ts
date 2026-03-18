import { BaseballOrganization, BaseballTeam, DisplayValue, Player, PlayerContract, PlayerRatings, PlayerPotentials, VisibilityContext } from "../models/baseball/baseballModels";
import type { PoolPlayer } from "../models/baseball/baseballScoutingModels";
import type { ScoutingActionType } from "../models/baseball/baseballScoutingModels";

// Canonical display order for MLB organization levels
export const LEVEL_ORDER = ["mlb", "aaa", "aa", "higha", "a", "scraps"];

/**
 * Get the "primary" team from a baseball organization for display purposes.
 * MLB orgs → the "mlb"-level team; college orgs → the first (only) team.
 */
export const getPrimaryBaseballTeam = (org: BaseballOrganization): BaseballTeam | undefined => {
  if (!org.teams) return undefined;
  if (org.league === "mlb") {
    return org.teams["mlb"] ?? Object.values(org.teams).find((t) => t.team_level === 9);
  }
  // College orgs typically have one team keyed as "college"
  return org.teams["college"] ?? Object.values(org.teams)[0];
};

// Numeric team_level values from the API → string level keys
export const NUMERIC_LEVEL_MAP: Record<number, string> = {
  9: "mlb",
  8: "aaa",
  7: "aa",
  6: "higha",
  5: "a",
  4: "scraps",
};

// Reverse: string level key → numeric team_level
export const LEVEL_TO_NUMERIC: Record<string, number> = Object.fromEntries(
  Object.entries(NUMERIC_LEVEL_MAP).map(([num, str]) => [str, Number(num)]),
);

// Display labels for each level
const LEVEL_LABELS: Record<string, string> = {
  mlb: "MLB",
  aaa: "AAA",
  aa: "AA",
  higha: "High-A",
  a: "A",
  scraps: "Unassigned",
  college: "Roster",
  hs: "High School",
};

/** Convert an internal level key to its display label. */
export const displayLevel = (level: string | undefined | null): string => {
  if (!level) return "";
  return LEVEL_LABELS[level] ?? level.toUpperCase();
};

/**
 * Return the display name for a team entry.
 * Scraps teams show as "{orgAbbrev} Unassigned" instead of the raw DB name.
 */
export const displayTeamName = (
  level: string,
  team: BaseballTeam,
  orgAbbrev: string,
): string => {
  if (level === "scraps") return `${orgAbbrev} Unassigned`;
  return team.team_full_name;
};

/**
 * Return a display-safe team name for a player row.
 * If the player is on the scraps level, show "{orgAbbrev} Unassigned".
 */
export const displayPlayerTeam = (
  playerLevel: string,
  playerTeam: string,
  orgAbbrev: string,
): string => {
  if (playerLevel === "scraps") return `${orgAbbrev} Unassigned`;
  return playerTeam;
};

/**
 * Normalize a contract from the API shape into the canonical PlayerContract.
 * Returns null if no contract data is present.
 */
const normalizeContract = (raw: any): PlayerContract | null => {
  // New shape: contract sub-object
  if (raw.contract && typeof raw.contract === "object") {
    return raw.contract as PlayerContract;
  }
  // Old flat shape: salary + onIR at top level — build a minimal contract
  if (raw.salary !== undefined || raw.onIR !== undefined) {
    return {
      id: 0,
      years: 0,
      current_year: 0,
      league_year_signed: 0,
      is_active: true,
      is_buyout: false,
      is_extension: false,
      is_finished: false,
      on_ir: raw.onIR ?? false,
      bonus: 0,
      current_year_detail: {
        id: 0,
        year_index: 0,
        base_salary: raw.salary ?? 0,
        salary_share: 1.0,
        salary_for_org: raw.salary ?? 0,
      },
    };
  }
  return null;
};

// Fields that may appear as either _display or _base in the ratings sub-object
const RATING_DISPLAY_FIELDS = [
  "power", "contact", "eye", "discipline", "speed", "basereaction", "baserunning",
  "throwacc", "throwpower", "fieldcatch", "fieldreact", "fieldspot",
  "catchframe", "catchsequence", "pendurance", "pgencontrol", "psequencing",
  "pthrowpower", "pickoff",
  "pitch1_consist", "pitch1_pacc", "pitch1_pbrk", "pitch1_pcntrl",
  "pitch2_consist", "pitch2_pacc", "pitch2_pbrk", "pitch2_pcntrl",
  "pitch3_consist", "pitch3_pacc", "pitch3_pbrk", "pitch3_pcntrl",
  "pitch4_consist", "pitch4_pacc", "pitch4_pbrk", "pitch4_pcntrl",
  "pitch5_consist", "pitch5_pacc", "pitch5_pbrk", "pitch5_pcntrl",
];

/** Ensure ratings sub-object has _display fields.
 *  Bootstrap now returns visibility-aware _display values (fuzzed or precise),
 *  so we must NOT fall back to raw/base values — that would leak precise data.
 *  Only populate _display if the key is completely absent from the response. */
const normalizeRatings = (r: any): any => {
  const result = { ...r };
  for (const field of RATING_DISPLAY_FIELDS) {
    const displayKey = `${field}_display`;
    if (!(displayKey in result)) {
      // Field missing entirely — use raw value as last resort (pre-visibility bootstrap compat)
      result[displayKey] = r[field] ?? r[`${field}_base`] ?? null;
    }
  }
  return result;
};

/** Map position codes from the API to the canonical Ptype enum values. */
const normalizePtype = (raw: string | undefined | null): string => {
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (upper === "PITCHER" || upper === "POSITION") return raw; // already canonical
  // Pitching positions
  if (["SP", "RP", "CL", "MR", "LR", "SU"].includes(upper)) return "Pitcher";
  return "Position";
};

/**
 * Normalize a player object from either the old flat shape (from /rosters)
 * or the new nested shape (from bootstrap) into the canonical Player interface.
 *
 * Detects old shape by checking for `ratings` sub-object.
 */
let _normalizePlayerLogged = false;
export const normalizePlayer = (raw: any): Player => {
  // DEBUG: log first player to verify stamina data in API response
  if (raw.id && !_normalizePlayerLogged) {
    _normalizePlayerLogged = true;
    console.log("[normalizePlayer] sample raw player:", {
      id: raw.id,
      stamina: raw.stamina,
      has_fatigue_data: raw.has_fatigue_data,
      hasBio: !!raw.bio,
      hasRatings: !!raw.ratings,
      keys: Object.keys(raw).filter((k: string) => k.includes("stam") || k.includes("fatigue")),
    });
  }
  // New roster shape — has bio wrapper with firstName/lastName
  if (raw.bio && typeof raw.bio === "object") {
    const bio = raw.bio;
    return {
      id:            raw.id,
      firstname:     bio.firstName ?? bio.firstname ?? "",
      lastname:      bio.lastName ?? bio.lastname ?? "",
      ptype:         normalizePtype(bio.ptype),
      listed_position: raw.listed_position ?? bio.listed_position ?? null,
      age:           bio.age ?? 0,
      displayovr:    raw.displayovr ?? null,
      current_level: raw.current_level,
      league_level:  raw.league_level ?? "",
      team_abbrev:   raw.team_abbrev ?? "",
      contract:      normalizeContract(raw),
      bat_hand:      bio.bats ?? bio.bat_hand ?? null,
      pitch_hand:    bio.throws ?? bio.pitch_hand ?? null,
      height:        bio.height ?? 0,
      weight:        bio.weight ?? 0,
      durability:    bio.durability ?? "",
      injury_risk:   bio.injury_risk ?? "",
      pitch1_name:   bio.pitch1_name ?? null,
      pitch2_name:   bio.pitch2_name ?? null,
      pitch3_name:   bio.pitch3_name ?? null,
      pitch4_name:   bio.pitch4_name ?? null,
      pitch5_name:   bio.pitch5_name ?? null,
      ratings:       normalizeRatings(raw.ratings ?? {}),
      potentials:    raw.potentials ?? {},
      visibility_context: raw.visibility_context,
      stamina:          raw.stamina,
      has_fatigue_data: raw.has_fatigue_data,
      is_injured:       raw.is_injured ?? false,
      injury_details:   raw.injury_details ?? [],
    } as Player;
  }

  // Bootstrap shape — has ratings sub-object directly
  if (raw.ratings && typeof raw.ratings === "object") {
    return {
      ...raw,
      ratings: normalizeRatings(raw.ratings),
      contract: normalizeContract(raw),
      bat_hand:    raw.bat_hand ?? null,
      pitch_hand:  raw.pitch_hand ?? raw.throw_hand ?? null,
      visibility_context: raw.visibility_context,
    } as Player;
  }

  // Old flat shape — convert to new nested structure
  // Prefer _display (20-80 scale) over _base (raw) when available
  const ratings: PlayerRatings = {
    power_display:          raw.power_display ?? raw.power_base ?? null,
    contact_display:        raw.contact_display ?? raw.contact_base ?? null,
    eye_display:            raw.eye_display ?? raw.eye_base ?? null,
    discipline_display:     raw.discipline_display ?? raw.discipline_base ?? null,
    speed_display:          raw.speed_display ?? raw.speed_base ?? null,
    basereaction_display:   raw.basereaction_display ?? raw.basereaction_base ?? null,
    baserunning_display:    raw.baserunning_display ?? raw.baserunning_base ?? null,
    throwacc_display:       raw.throwacc_display ?? raw.throwacc_base ?? null,
    throwpower_display:     raw.throwpower_display ?? raw.throwpower_base ?? null,
    fieldcatch_display:     raw.fieldcatch_display ?? raw.fieldcatch_base ?? null,
    fieldreact_display:     raw.fieldreact_display ?? raw.fieldreact_base ?? null,
    fieldspot_display:      raw.fieldspot_display ?? raw.fieldspot_base ?? null,
    catchframe_display:     raw.catchframe_display ?? raw.catchframe_base ?? null,
    catchsequence_display:  raw.catchsequence_display ?? raw.catchsequence_base ?? null,
    pendurance_display:     raw.pendurance_display ?? raw.pendurance_base ?? null,
    pgencontrol_display:    raw.pgencontrol_display ?? raw.pgencontrol_base ?? null,
    psequencing_display:    raw.psequencing_display ?? raw.psequencing_base ?? null,
    pthrowpower_display:    raw.pthrowpower_display ?? raw.pthrowpower_base ?? null,
    pickoff_display:        raw.pickoff_display ?? raw.pickoff_base ?? null,
    pitch1_consist_display: raw.pitch1_consist_display ?? raw.pitch1_consist_base ?? null,
    pitch1_pacc_display:    raw.pitch1_pacc_display ?? raw.pitch1_pacc_base ?? null,
    pitch1_pbrk_display:    raw.pitch1_pbrk_display ?? raw.pitch1_pbrk_base ?? null,
    pitch1_pcntrl_display:  raw.pitch1_pcntrl_display ?? raw.pitch1_pcntrl_base ?? null,
    pitch2_consist_display: raw.pitch2_consist_display ?? raw.pitch2_consist_base ?? null,
    pitch2_pacc_display:    raw.pitch2_pacc_display ?? raw.pitch2_pacc_base ?? null,
    pitch2_pbrk_display:    raw.pitch2_pbrk_display ?? raw.pitch2_pbrk_base ?? null,
    pitch2_pcntrl_display:  raw.pitch2_pcntrl_display ?? raw.pitch2_pcntrl_base ?? null,
    pitch3_consist_display: raw.pitch3_consist_display ?? raw.pitch3_consist_base ?? null,
    pitch3_pacc_display:    raw.pitch3_pacc_display ?? raw.pitch3_pacc_base ?? null,
    pitch3_pbrk_display:    raw.pitch3_pbrk_display ?? raw.pitch3_pbrk_base ?? null,
    pitch3_pcntrl_display:  raw.pitch3_pcntrl_display ?? raw.pitch3_pcntrl_base ?? null,
    pitch4_consist_display: raw.pitch4_consist_display ?? raw.pitch4_consist_base ?? null,
    pitch4_pacc_display:    raw.pitch4_pacc_display ?? raw.pitch4_pacc_base ?? null,
    pitch4_pbrk_display:    raw.pitch4_pbrk_display ?? raw.pitch4_pbrk_base ?? null,
    pitch4_pcntrl_display:  raw.pitch4_pcntrl_display ?? raw.pitch4_pcntrl_base ?? null,
    pitch5_consist_display: raw.pitch5_consist_display ?? raw.pitch5_consist_base ?? null,
    pitch5_pacc_display:    raw.pitch5_pacc_display ?? raw.pitch5_pacc_base ?? null,
    pitch5_pbrk_display:    raw.pitch5_pbrk_display ?? raw.pitch5_pbrk_base ?? null,
    pitch5_pcntrl_display:  raw.pitch5_pcntrl_display ?? raw.pitch5_pcntrl_base ?? null,
    c_rating:               raw.c_rating ?? null,
    fb_rating:              raw.fb_rating ?? null,
    sb_rating:              raw.sb_rating ?? null,
    tb_rating:              raw.tb_rating ?? null,
    ss_rating:              raw.ss_rating ?? null,
    lf_rating:              raw.lf_rating ?? null,
    cf_rating:              raw.cf_rating ?? null,
    rf_rating:              raw.rf_rating ?? null,
    dh_rating:              raw.dh_rating ?? null,
    sp_rating:              raw.sp_rating ?? null,
    rp_rating:              raw.rp_rating ?? null,
    pitch1_ovr:             raw.pitch1_ovr ?? null,
    pitch2_ovr:             raw.pitch2_ovr ?? null,
    pitch3_ovr:             raw.pitch3_ovr ?? null,
    pitch4_ovr:             raw.pitch4_ovr ?? null,
    pitch5_ovr:             raw.pitch5_ovr ?? null,
  };

  const potentials: PlayerPotentials = {
    power_pot:              raw.power_pot ?? null,
    contact_pot:            raw.contact_pot ?? null,
    eye_pot:                raw.eye_pot ?? null,
    discipline_pot:         raw.discipline_pot ?? null,
    speed_pot:              raw.speed_pot ?? null,
    basereaction_pot:       raw.basereaction_pot ?? null,
    baserunning_pot:        raw.baserunning_pot ?? null,
    throwacc_pot:           raw.throwacc_pot ?? null,
    throwpower_pot:         raw.throwpower_pot ?? null,
    fieldcatch_pot:         raw.fieldcatch_pot ?? null,
    fieldreact_pot:         raw.fieldreact_pot ?? null,
    fieldspot_pot:          raw.fieldspot_pot ?? null,
    catchframe_pot:         raw.catchframe_pot ?? null,
    catchsequence_pot:      raw.catchsequence_pot ?? null,
    pendurance_pot:         raw.pendurance_pot ?? null,
    pgencontrol_pot:        raw.pgencontrol_pot ?? null,
    psequencing_pot:        raw.psequencing_pot ?? null,
    pthrowpower_pot:        raw.pthrowpower_pot ?? null,
    pickoff_pot:            raw.pickoff_pot ?? null,
    pitch1_consist_pot:     raw.pitch1_consist_pot ?? null,
    pitch1_pacc_pot:        raw.pitch1_pacc_pot ?? null,
    pitch1_pbrk_pot:        raw.pitch1_pbrk_pot ?? null,
    pitch1_pcntrl_pot:      raw.pitch1_pcntrl_pot ?? null,
    pitch2_consist_pot:     raw.pitch2_consist_pot ?? null,
    pitch2_pacc_pot:        raw.pitch2_pacc_pot ?? null,
    pitch2_pbrk_pot:        raw.pitch2_pbrk_pot ?? null,
    pitch2_pcntrl_pot:      raw.pitch2_pcntrl_pot ?? null,
    pitch3_consist_pot:     raw.pitch3_consist_pot ?? null,
    pitch3_pacc_pot:        raw.pitch3_pacc_pot ?? null,
    pitch3_pbrk_pot:        raw.pitch3_pbrk_pot ?? null,
    pitch3_pcntrl_pot:      raw.pitch3_pcntrl_pot ?? null,
    pitch4_consist_pot:     raw.pitch4_consist_pot ?? null,
    pitch4_pacc_pot:        raw.pitch4_pacc_pot ?? null,
    pitch4_pbrk_pot:        raw.pitch4_pbrk_pot ?? null,
    pitch4_pcntrl_pot:      raw.pitch4_pcntrl_pot ?? null,
    pitch5_consist_pot:     raw.pitch5_consist_pot ?? null,
    pitch5_pacc_pot:        raw.pitch5_pacc_pot ?? null,
    pitch5_pbrk_pot:        raw.pitch5_pbrk_pot ?? null,
    pitch5_pcntrl_pot:      raw.pitch5_pcntrl_pot ?? null,
  };

  return {
    id:            raw.id,
    firstname:     raw.firstname,
    lastname:      raw.lastname,
    ptype:         raw.ptype,
    listed_position: raw.listed_position ?? null,
    age:           raw.age,
    displayovr:    raw.displayovr ?? null,
    current_level: raw.current_level,
    league_level:  raw.league_level ?? raw.level ?? "",
    team_abbrev:   raw.team_abbrev ?? raw.team ?? "",
    contract:      normalizeContract(raw),
    bat_hand:      raw.bat_hand ?? null,
    pitch_hand:    raw.pitch_hand ?? raw.throw_hand ?? null,
    height:        raw.height ?? 0,
    weight:        raw.weight ?? 0,
    durability:    raw.durability ?? "",
    injury_risk:   raw.injury_risk ?? "",
    pitch1_name:   raw.pitch1_name ?? null,
    pitch2_name:   raw.pitch2_name ?? null,
    pitch3_name:   raw.pitch3_name ?? null,
    pitch4_name:   raw.pitch4_name ?? null,
    pitch5_name:   raw.pitch5_name ?? null,
    ratings,
    potentials,
    visibility_context: raw.visibility_context,
    stamina:          raw.stamina,
    has_fatigue_data: raw.has_fatigue_data,
    is_injured:       raw.is_injured ?? false,
    injury_details:   raw.injury_details ?? [],
  };
};

// ── Class year derivation ───────────────────────────────────

const CLASS_MAP: Record<number, [string, string]> = {
  1: ["Freshman", "FR"],
  2: ["Sophomore", "SO"],
  3: ["Junior", "JR"],
  4: ["Senior", "SR"],
  5: ["Senior", "SR"],
};

/**
 * Derive a college player's class year from their contract.
 * current_year: 1=FR, 2=SO, 3=JR, 4+=SR
 * is_extension = redshirt → prefix "RS "
 */
export const getClassYear = (contract: PlayerContract | null): { label: string; abbrev: string } => {
  if (!contract) return { label: "", abbrev: "" };
  // For redshirt players, current_year includes the redshirt year,
  // so subtract 1 to get the actual class year (year 4 of 5 = Junior, not Senior).
  const classIdx = contract.is_extension
    ? Math.max(contract.current_year - 1, 1)
    : contract.current_year;
  const [label, abbrev] = CLASS_MAP[Math.min(classIdx, 5)] ?? ["Senior", "SR"];
  const prefix = contract.is_extension ? "RS " : "";
  return { label: prefix + label, abbrev: prefix + abbrev };
};

/** Canonical ordering of class year abbreviations for display. */
export const CLASS_YEAR_ORDER = ["FR", "SO", "JR", "SR", "RS FR", "RS SO", "RS JR", "RS SR"];

/**
 * Determine if a college player is draft-eligible this season.
 * A player is eligible when current_year >= years (final year)
 * OR age >= 21 (college juniors and older are draft-eligible).
 */
export const isDraftEligible = (contract: PlayerContract | null, age?: number): boolean => {
  if (!contract) return false;
  if (age != null && age >= 21) return true;
  return contract.current_year >= contract.years;
};

const HS_CLASS_MAP: Record<number, [string, string]> = {
  15: ["Freshman", "FR"],
  16: ["Sophomore", "SO"],
  17: ["Junior", "JR"],
  18: ["Senior", "SR"],
};

/**
 * Map a high school player's age to their class year.
 * 15=FR, 16=SO, 17=JR, 18+=SR
 */
export const getHSClassYear = (age: number): { label: string; abbrev: string } => {
  const [label, abbrev] = HS_CLASS_MAP[age] ?? (age < 15 ? ["Freshman", "FR"] : ["Senior", "SR"]);
  return { label, abbrev };
};

// ── 20-80 to letter grade conversion ────────────────────────

const GRADE_MAP: [number, string][] = [
  [80, "A+"], [75, "A"], [70, "A-"], [65, "B+"], [60, "B"], [55, "B-"],
  [50, "C+"], [45, "C"], [40, "C-"], [35, "D+"], [30, "D"], [25, "D-"], [20, "F"],
];

/** Convert a 20-80 numeric rating to a letter grade (for college display). */
export const numericToLetterGrade = (value: number): string => {
  let closest = GRADE_MAP[0];
  for (const entry of GRADE_MAP) {
    if (Math.abs(value - entry[0]) < Math.abs(value - closest[0])) closest = entry;
  }
  return closest[1];
};

/** Inverse of numericToLetterGrade — map letter grade to 20-80 numeric (for sorting). */
const LETTER_TO_NUMERIC: Record<string, number> = Object.fromEntries(
  GRADE_MAP.map(([num, grade]) => [grade, num]),
);

export const letterGradeToNumeric = (grade: string): number => {
  return LETTER_TO_NUMERIC[grade] ?? 50;
};

// ── Fog-of-war display helpers ──────────────────────────────

const numericRatingColor = (v: number): string => {
  if (v == 80) return "text-blue-600 dark:text-blue-400 font-semibold";
  if (v >= 70) return "text-green-600 dark:text-green-400";
  if (v >= 60) return "text-green-600 dark:text-green-400";
  if (v >= 50) return "text-yellow-600 dark:text-yellow-400";
  if (v >= 40) return "text-orange-600 dark:text-orange-400";
  if (v >= 30) return "text-orange-600 dark:text-orange-400";
  if (v >= 20) return "text-red-600 dark:text-red-400";
  return "text-red-600 dark:text-red-400";
};

const gradeColorClass = (grade: string): string => {
  if (grade.startsWith("A")) return "text-blue-600 dark:text-blue-400";
  if (grade.startsWith("B")) return "text-green-600 dark:text-green-400";
  if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-600 dark:text-orange-400";
  if (grade.startsWith("F")) return "text-red-600 dark:text-red-400";
  if (grade.startsWith("?")) return "";
  if (grade.startsWith("—")) return "";
  return "text-red-600 dark:text-red-400";
};

/**
 * Central resolver for fog-of-war display values.
 * Handles numeric (20-80), letter grade (string), or hidden (null).
 */
export const resolveDisplayValue = (value: DisplayValue): {
  text: string;
  sortValue: number | null;
  colorClass: string;
  isGrade: boolean;
} => {
  if (value == null) return { text: "—", sortValue: null, colorClass: "text-gray-400", isGrade: false };
  if (typeof value === "string") {
    return {
      text: value,
      sortValue: letterGradeToNumeric(value),
      colorClass: gradeColorClass(value),
      isGrade: true,
    };
  }
  return {
    text: String(Math.round(value)),
    sortValue: value,
    colorClass: numericRatingColor(value),
    isGrade: false,
  };
};

// ── Scouting action constants ───────────────────────────────

export const SCOUTING_ACTION_LABELS: Record<string, string> = {
  hs_report: "Scout Report",
  recruit_potential_fuzzed: "Potential Estimate",
  recruit_potential_precise: "Precise Potentials",
  college_potential_precise: "Precise College Potentials",
  draft_attrs_fuzzed: "Scout Attributes (Estimate)",
  draft_attrs_precise: "Scout Attributes (Precise)",
  draft_potential_precise: "Precise Draft Potentials",
  pro_attrs_precise: "Precise Attributes",
  pro_potential_precise: "Precise Potentials",
};

export const SCOUTING_ACTION_COSTS: Record<string, number> = {
  hs_report: 10,
  recruit_potential_fuzzed: 15,
  recruit_potential_precise: 25,
  college_potential_precise: 15,
  draft_attrs_fuzzed: 10,
  draft_attrs_precise: 20,
  draft_potential_precise: 15,
  pro_attrs_precise: 15,
  pro_potential_precise: 15,
};

// ── Pool → Player adapter ────────────────────────────────────

/**
 * Convert a flat PoolPlayer from pool endpoints into the nested Player
 * shape expected by roster table components (AllPlayersTable, etc.).
 *
 * poolContext: "hs" | "college" | "intam" | "pro"
 */
export const normalizePoolPlayer = (
  raw: PoolPlayer,
  poolContext: string,
): Player => {
  // Build ratings from _base fields → _display fields
  const ratings: PlayerRatings = {
    power_display:            raw.power_base ?? null,
    contact_display:          raw.contact_base ?? null,
    eye_display:              raw.eye_base ?? null,
    discipline_display:       raw.discipline_base ?? null,
    speed_display:            raw.speed_base ?? null,
    basereaction_display:     raw.basereaction_base ?? null,
    baserunning_display:      raw.baserunning_base ?? null,
    throwacc_display:         raw.throwacc_base ?? null,
    throwpower_display:       raw.throwpower_base ?? null,
    fieldcatch_display:       raw.fieldcatch_base ?? null,
    fieldreact_display:       raw.fieldreact_base ?? null,
    fieldspot_display:        raw.fieldspot_base ?? null,
    catchframe_display:       raw.catchframe_base ?? null,
    catchsequence_display:    raw.catchsequence_base ?? null,
    pendurance_display:       raw.pendurance_base ?? null,
    pgencontrol_display:      raw.pgencontrol_base ?? null,
    psequencing_display:      raw.psequencing_base ?? null,
    pthrowpower_display:      raw.pthrowpower_base ?? null,
    pickoff_display:          raw.pickoff_base ?? null,
    pitch1_consist_display:   raw.pitch1_consist_base ?? null,
    pitch1_pacc_display:      raw.pitch1_pacc_base ?? null,
    pitch1_pbrk_display:      raw.pitch1_pbrk_base ?? null,
    pitch1_pcntrl_display:    raw.pitch1_pcntrl_base ?? null,
    pitch2_consist_display:   raw.pitch2_consist_base ?? null,
    pitch2_pacc_display:      raw.pitch2_pacc_base ?? null,
    pitch2_pbrk_display:      raw.pitch2_pbrk_base ?? null,
    pitch2_pcntrl_display:    raw.pitch2_pcntrl_base ?? null,
    pitch3_consist_display:   raw.pitch3_consist_base ?? null,
    pitch3_pacc_display:      raw.pitch3_pacc_base ?? null,
    pitch3_pbrk_display:      raw.pitch3_pbrk_base ?? null,
    pitch3_pcntrl_display:    raw.pitch3_pcntrl_base ?? null,
    pitch4_consist_display:   raw.pitch4_consist_base ?? null,
    pitch4_pacc_display:      raw.pitch4_pacc_base ?? null,
    pitch4_pbrk_display:      raw.pitch4_pbrk_base ?? null,
    pitch4_pcntrl_display:    raw.pitch4_pcntrl_base ?? null,
    pitch5_consist_display:   raw.pitch5_consist_base ?? null,
    pitch5_pacc_display:      raw.pitch5_pacc_base ?? null,
    pitch5_pbrk_display:      raw.pitch5_pbrk_base ?? null,
    pitch5_pcntrl_display:    raw.pitch5_pcntrl_base ?? null,
    c_rating:                 raw.c_rating ?? null,
    fb_rating:                raw.fb_rating ?? null,
    sb_rating:                raw.sb_rating ?? null,
    tb_rating:                raw.tb_rating ?? null,
    ss_rating:                raw.ss_rating ?? null,
    lf_rating:                raw.lf_rating ?? null,
    cf_rating:                raw.cf_rating ?? null,
    rf_rating:                raw.rf_rating ?? null,
    dh_rating:                raw.dh_rating ?? null,
    sp_rating:                raw.sp_rating ?? null,
    rp_rating:                raw.rp_rating ?? null,
    pitch1_ovr:               raw.pitch1_ovr ?? null,
    pitch2_ovr:               raw.pitch2_ovr ?? null,
    pitch3_ovr:               raw.pitch3_ovr ?? null,
    pitch4_ovr:               raw.pitch4_ovr ?? null,
    pitch5_ovr:               raw.pitch5_ovr ?? null,
  };

  // Build potentials from _pot fields (direct 1:1 copy)
  const potentials: PlayerPotentials = {
    power_pot:                raw.power_pot ?? null,
    contact_pot:              raw.contact_pot ?? null,
    eye_pot:                  raw.eye_pot ?? null,
    discipline_pot:           raw.discipline_pot ?? null,
    speed_pot:                raw.speed_pot ?? null,
    basereaction_pot:         raw.basereaction_pot ?? null,
    baserunning_pot:          raw.baserunning_pot ?? null,
    throwacc_pot:             raw.throwacc_pot ?? null,
    throwpower_pot:           raw.throwpower_pot ?? null,
    fieldcatch_pot:           raw.fieldcatch_pot ?? null,
    fieldreact_pot:           raw.fieldreact_pot ?? null,
    fieldspot_pot:            raw.fieldspot_pot ?? null,
    catchframe_pot:           raw.catchframe_pot ?? null,
    catchsequence_pot:        raw.catchsequence_pot ?? null,
    pendurance_pot:           raw.pendurance_pot ?? null,
    pgencontrol_pot:          raw.pgencontrol_pot ?? null,
    psequencing_pot:          raw.psequencing_pot ?? null,
    pthrowpower_pot:          raw.pthrowpower_pot ?? null,
    pickoff_pot:              raw.pickoff_pot ?? null,
    pitch1_consist_pot:       raw.pitch1_consist_pot ?? null,
    pitch1_pacc_pot:          raw.pitch1_pacc_pot ?? null,
    pitch1_pbrk_pot:          raw.pitch1_pbrk_pot ?? null,
    pitch1_pcntrl_pot:        raw.pitch1_pcntrl_pot ?? null,
    pitch2_consist_pot:       raw.pitch2_consist_pot ?? null,
    pitch2_pacc_pot:          raw.pitch2_pacc_pot ?? null,
    pitch2_pbrk_pot:          raw.pitch2_pbrk_pot ?? null,
    pitch2_pcntrl_pot:        raw.pitch2_pcntrl_pot ?? null,
    pitch3_consist_pot:       raw.pitch3_consist_pot ?? null,
    pitch3_pacc_pot:          raw.pitch3_pacc_pot ?? null,
    pitch3_pbrk_pot:          raw.pitch3_pbrk_pot ?? null,
    pitch3_pcntrl_pot:        raw.pitch3_pcntrl_pot ?? null,
    pitch4_consist_pot:       raw.pitch4_consist_pot ?? null,
    pitch4_pacc_pot:          raw.pitch4_pacc_pot ?? null,
    pitch4_pbrk_pot:          raw.pitch4_pbrk_pot ?? null,
    pitch4_pcntrl_pot:        raw.pitch4_pcntrl_pot ?? null,
    pitch5_consist_pot:       raw.pitch5_consist_pot ?? null,
    pitch5_pacc_pot:          raw.pitch5_pacc_pot ?? null,
    pitch5_pbrk_pot:          raw.pitch5_pbrk_pot ?? null,
    pitch5_pcntrl_pot:        raw.pitch5_pcntrl_pot ?? null,
  };

  return {
    id:            raw.id,
    firstname:     raw.firstname,
    lastname:      raw.lastname,
    ptype:         raw.ptype,
    listed_position: null,
    age:           raw.age,
    displayovr:    raw.displayovr ?? null,
    current_level: raw.current_level ?? 0,
    league_level:  poolContext,
    team_abbrev:   raw.area ?? "",
    contract:      null,
    bat_hand:      raw.bat_hand ?? null,
    pitch_hand:    raw.pitch_hand ?? null,
    height:        raw.height ?? 0,
    weight:        raw.weight ?? 0,
    durability:    raw.durability ?? "",
    injury_risk:   raw.injury_risk ?? "",
    pitch1_name:   raw.pitch1_name ?? null,
    pitch2_name:   raw.pitch2_name ?? null,
    pitch3_name:   raw.pitch3_name ?? null,
    pitch4_name:   raw.pitch4_name ?? null,
    pitch5_name:   raw.pitch5_name ?? null,
    ratings,
    potentials,
  } as Player;
};

export { ScoutingActionType };

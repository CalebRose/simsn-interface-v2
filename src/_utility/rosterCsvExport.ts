import { Player } from "../models/baseball/baseballModels";
import { BattingLeaderRow, PitchingLeaderRow } from "../models/baseball/baseballStatsModels";
import { resolveDisplayValue } from "./baseballHelpers";

// ─── PlayerStatsMap type (mirrors the one in BaseballRosterTable) ─────────────
export interface StatsMapForExport {
  batting: Map<number, BattingLeaderRow>;
  pitching: Map<number, PitchingLeaderRow>;
}

// ─── Headers ─────────────────────────────────────────────────────────────────

export const INFO_HEADERS = ["Name", "Pos", "Type", "Level", "Team", "Age", "OVR"];

export const HITTER_ATTR_HEADERS = [
  "Contact", "Power", "Eye", "Discipline",
  "Speed", "BaseRctn", "Baserunning",
  "ThrowAcc", "ThrowPow",
  "FldCatch", "FldReact", "FldSpot",
  "CatchFrame", "CatchSeq",
];

export const PITCHER_ATTR_HEADERS = [
  "pEndurance", "pGenCtrl", "pSeq", "pThrowPow", "Pickoff",
];

export const ALL_ATTR_HEADERS = [...HITTER_ATTR_HEADERS, ...PITCHER_ATTR_HEADERS];

export const POT_HEADERS = [
  "Contact Pot", "Power Pot", "Eye Pot", "Disc Pot",
  "Speed Pot", "BaseRctn Pot", "Baserunning Pot",
  "ThrowAcc Pot", "ThrowPow Pot",
  "FldCatch Pot", "FldReact Pot", "FldSpot Pot",
  "CatchFrame Pot", "CatchSeq Pot",
  "pEndurance Pot", "pGenCtrl Pot", "pSeq Pot", "pThrowPow Pot", "Pickoff Pot",
];

export const CONTRACT_HEADERS = ["Yrs", "Yr", "Salary", "Share", "Bonus", "IR", "Status"];

export const BATTING_STAT_HEADERS = [
  "G", "PA", "AB", "H", "2B", "3B", "HR", "ITPHR",
  "RBI", "R", "BB", "HBP", "SO", "SB", "CS",
  "AVG", "OBP", "SLG", "OPS",
  "wOBA", "wRC+", "OPS+", "ISO", "BABIP", "BB%", "K%",
  "SF", "GIDP", "RC", "SecA", "PSS",
  "GB%", "FB%", "HR/FB", "Barrel%", "HardHit%", "Soft%", "Med%", "LD%", "Contact%",
  "bWAR",
];

export const PITCHING_STAT_HEADERS = [
  "G", "GS", "W", "L", "SV", "HLD", "BS", "QS",
  "IP", "H", "R", "ER", "BB", "HBP", "SO", "HR",
  "ERA", "WHIP", "FIP", "xFIP",
  "K/9", "BB/9", "K%", "BB%", "K-BB%", "BABIP",
  "ERA-", "FIP-",
  "Pitches", "Str%", "P/IP", "WP", "WP/9", "BF",
  "GB%", "FB%", "HR/FB", "Barrel%", "HardHit%", "Soft%", "LD%", "LOB%",
  "IR", "IRS", "IR%", "GIDP Ind",
  "pWAR",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a DisplayValue field to its display text. */
const rv = (val: any): string => {
  if (val == null) return "—";
  return resolveDisplayValue(val).text;
};

// ─── Row builders ─────────────────────────────────────────────────────────────

export function playerInfoRow(p: Player): string[] {
  const ovrNum =
    p.displayovr != null && !isNaN(Number(p.displayovr)) ? Number(p.displayovr) : null;
  return [
    `${p.firstname} ${p.lastname}`,
    p.listed_position ?? p.ptype ?? "",
    p.ptype ?? "",
    p.league_level ?? "",
    p.team_abbrev ?? "",
    String(p.age ?? ""),
    ovrNum != null ? String(ovrNum) : "—",
  ];
}

export function playerHitterAttrRow(p: Player): string[] {
  const r = p.ratings;
  return [
    rv(r.contact_display),
    rv(r.power_display),
    rv(r.eye_display),
    rv(r.discipline_display),
    rv(r.speed_display),
    rv(r.basereaction_display),
    rv(r.baserunning_display),
    rv(r.throwacc_display),
    rv(r.throwpower_display),
    rv(r.fieldcatch_display),
    rv(r.fieldreact_display),
    rv(r.fieldspot_display),
    rv(r.catchframe_display),
    rv(r.catchsequence_display),
  ];
}

export function playerPitcherAttrRow(p: Player): string[] {
  const r = p.ratings;
  return [
    rv(r.pendurance_display),
    rv(r.pgencontrol_display),
    rv(r.psequencing_display),
    rv(r.pthrowpower_display),
    rv(r.pickoff_display),
  ];
}

export function playerAllAttrRow(p: Player): string[] {
  return [...playerHitterAttrRow(p), ...playerPitcherAttrRow(p)];
}

export function playerPotRow(p: Player): string[] {
  const pot = p.potentials;
  return [
    pot.contact_pot ?? "—",
    pot.power_pot ?? "—",
    pot.eye_pot ?? "—",
    pot.discipline_pot ?? "—",
    pot.speed_pot ?? "—",
    pot.basereaction_pot ?? "—",
    pot.baserunning_pot ?? "—",
    pot.throwacc_pot ?? "—",
    pot.throwpower_pot ?? "—",
    pot.fieldcatch_pot ?? "—",
    pot.fieldreact_pot ?? "—",
    pot.fieldspot_pot ?? "—",
    pot.catchframe_pot ?? "—",
    pot.catchsequence_pot ?? "—",
    pot.pendurance_pot ?? "—",
    pot.pgencontrol_pot ?? "—",
    pot.psequencing_pot ?? "—",
    pot.pthrowpower_pot ?? "—",
    pot.pickoff_pot ?? "—",
  ];
}

export function playerContractRow(p: Player): string[] {
  const c = p.contract;
  if (!c) return Array(CONTRACT_HEADERS.length).fill("—");
  const salary = c.current_year_detail?.base_salary;
  const share = c.current_year_detail?.salary_share;
  return [
    String(c.years),
    String(c.current_year),
    salary != null ? String(salary) : "—",
    share != null ? (share * 100).toFixed(0) + "%" : "—",
    String(c.bonus ?? 0),
    c.on_ir ? "Y" : "",
    c.is_buyout
      ? "Buyout"
      : c.is_extension
      ? "Extension"
      : c.is_finished
      ? "Finished"
      : "Active",
  ];
}

export function playerBattingStatsRow(stats: BattingLeaderRow | undefined): string[] {
  if (!stats) return Array(BATTING_STAT_HEADERS.length).fill("");
  return [
    String(stats.g),
    String(stats.pa),
    String(stats.ab),
    String(stats.h),
    String(stats["2b"]),
    String(stats["3b"]),
    String(stats.hr),
    String(stats.itphr),
    String(stats.rbi),
    String(stats.r),
    String(stats.bb),
    String(stats.hbp),
    String(stats.so),
    String(stats.sb),
    String(stats.cs),
    stats.avg,
    stats.obp,
    stats.slg,
    stats.ops,
    stats.woba,
    String(stats.wrc_plus),
    String(stats.ops_plus),
    stats.iso,
    stats.babip,
    stats.bb_pct,
    stats.k_pct,
    String(stats.sf),
    String(stats.gidp),
    stats.rc,
    stats.sec_a,
    stats.pss,
    stats.gb_pct,
    stats.fb_pct,
    stats.hr_fb,
    stats.barrel_pct,
    stats.hard_hit_pct,
    stats.soft_pct,
    stats.med_pct,
    stats.ld_pct,
    stats.contact_pct,
    stats.bwar != null ? stats.bwar.toFixed(1) : "",
  ];
}

export function playerPitchingStatsRow(stats: PitchingLeaderRow | undefined): string[] {
  if (!stats) return Array(PITCHING_STAT_HEADERS.length).fill("");
  return [
    String(stats.g),
    String(stats.gs),
    String(stats.w),
    String(stats.l),
    String(stats.sv),
    String(stats.hld),
    String(stats.bs),
    String(stats.qs),
    stats.ip,
    String(stats.h),
    String(stats.r),
    String(stats.er),
    String(stats.bb),
    String(stats.hbp),
    String(stats.so),
    String(stats.hr),
    stats.era,
    stats.whip,
    stats.fip,
    stats.xfip,
    stats.k9,
    stats.bb9,
    stats.k_pct,
    stats.bb_pct,
    stats.k_bb_pct,
    stats.babip,
    String(stats.era_minus),
    String(stats.fip_minus),
    String(stats.pitches),
    stats.str_pct,
    stats.p_ip,
    String(stats.wp),
    stats.wp9,
    String(stats.bf),
    stats.gb_pct,
    stats.fb_pct,
    stats.hr_fb,
    stats.barrel_pct,
    stats.hard_hit_pct,
    stats.soft_pct,
    stats.ld_pct,
    stats.lob_pct,
    String(stats.ir),
    String(stats.irs),
    stats.ir_pct,
    String(stats.gidp_induced),
    stats.pwar != null ? stats.pwar.toFixed(1) : "",
  ];
}

/**
 * Build a complete combined row for bulk / full-roster export.
 * Position players get batting stat columns; pitchers get pitching stat columns.
 * The other column group is left empty so every row has the same schema.
 */
export function buildFullExportRow(p: Player, statsMap: StatsMapForExport): string[] {
  const battingStats = playerBattingStatsRow(statsMap.batting.get(p.id));
  const pitchingStats = playerPitchingStatsRow(statsMap.pitching.get(p.id));

  return [
    ...playerInfoRow(p),
    ...playerAllAttrRow(p),
    ...playerPotRow(p),
    ...playerContractRow(p),
    ...battingStats,
    ...pitchingStats,
  ];
}

/** Combined headers for the full-roster export (matches buildFullExportRow column order). */
export const FULL_EXPORT_HEADERS = [
  ...INFO_HEADERS,
  ...ALL_ATTR_HEADERS,
  ...POT_HEADERS,
  ...CONTRACT_HEADERS,
  ...BATTING_STAT_HEADERS.map((h) => `B_${h}`),
  ...PITCHING_STAT_HEADERS.map((h) => `P_${h}`),
];

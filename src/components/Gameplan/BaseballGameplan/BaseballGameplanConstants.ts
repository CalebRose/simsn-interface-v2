import { SelectOption } from "../../../_hooks/useSelectStyles";
import { PlayerRatings } from "../../../models/baseball/baseballModels";
import { PositionCode } from "../../../models/baseball/baseballGameplanModels";

// Tab names
export const DEFENSE_LINEUP_TAB = "Defense & Lineup";
export const SAMPLE_LINEUPS_TAB = "Sample Lineups";
export const PITCHING_TAB = "Pitching";
export const PLAYER_STRATEGY_TAB = "Player Settings";

export const GAMEPLAN_TABS = [
  DEFENSE_LINEUP_TAB,
  SAMPLE_LINEUPS_TAB,
  PITCHING_TAB,
  PLAYER_STRATEGY_TAB,
];

// Backend evaluation order for defensive positions
export const DEFENSE_POSITION_ORDER: PositionCode[] = [
  "c", "ss", "cf", "tb", "sb", "lf", "rf", "fb",
];

// Dropdown options

export const PlateApproachOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "patient", label: "Patient" },
  { value: "contact", label: "Contact" },
  { value: "power", label: "Power" },
];

export const PitchingApproachOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "finesse", label: "Finesse" },
  { value: "power", label: "Power" },
  { value: "location", label: "Location" },
];

export const BaserunningApproachOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "cautious", label: "Cautious" },
  { value: "conservative", label: "Conservative" },
];

export const UsagePreferenceOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "only_fully_rested", label: "Only Fully Rested" },
  { value: "play_tired", label: "Play Tired" },
  { value: "desperation", label: "Desperation" },
];

export const PullTendencyOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "quick", label: "Quick" },
  { value: "long", label: "Long" },
];

export const OutfieldSpacingOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "deep", label: "Deep" },
  { value: "shallow", label: "Shallow" },
  { value: "shift_pull", label: "Shift Pull" },
  { value: "shift_oppo", label: "Shift Opposite" },
];

export const InfieldSpacingOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "in", label: "In" },
  { value: "double_play", label: "Double Play" },
  { value: "shift_pull", label: "Shift Pull" },
  { value: "shift_oppo", label: "Shift Opposite" },
];

export const BullpenPriorityOptions: SelectOption[] = [
  { value: "rest", label: "Rest" },
  { value: "matchup", label: "Matchup" },
  { value: "best_available", label: "Best Available" },
];

export const LineupRoleOptions: SelectOption[] = [
  { value: "table_setter", label: "Table Setter" },
  { value: "on_base", label: "On-Base" },
  { value: "balanced", label: "Balanced" },
  { value: "slugger", label: "Slugger" },
  { value: "bottom", label: "Bottom" },
  { value: "speed", label: "Speed" },
];

export const LineupRoleDescriptions: Record<string, string> = {
  table_setter: "High eye + discipline + contact. Gets on base to start innings.",
  on_base: "Prioritizes OBP skills. Similar to table setter.",
  slugger: "High power. Your 3/4 hitters.",
  speed: "High speed rating. Steal threat, bunt-for-hit potential.",
  balanced: "Overall offense rating. Versatile middle-of-order.",
  bottom: "Weakest hitters placed here.",
};

export const PositionCodeOptions: SelectOption[] = [
  { value: "c", label: "C" },
  { value: "fb", label: "1B" },
  { value: "sb", label: "2B" },
  { value: "tb", label: "3B" },
  { value: "ss", label: "SS" },
  { value: "lf", label: "LF" },
  { value: "cf", label: "CF" },
  { value: "rf", label: "RF" },
  { value: "dh", label: "DH" },
];

export const PositionDisplayMap: Record<string, string> = {
  c: "Catcher",
  fb: "First Base",
  sb: "Second Base",
  tb: "Third Base",
  ss: "Shortstop",
  lf: "Left Field",
  cf: "Center Field",
  rf: "Right Field",
  dh: "Designated Hitter",
  p: "Pitcher",
};

export const PositionShortMap: Record<string, string> = {
  c: "C", fb: "1B", sb: "2B", tb: "3B", ss: "SS",
  lf: "LF", cf: "CF", rf: "RF", dh: "DH", p: "P",
};

export const PositionRatingKey: Record<string, string> = {
  c: "c_rating", fb: "fb_rating", sb: "sb_rating", tb: "tb_rating",
  ss: "ss_rating", lf: "lf_rating", cf: "cf_rating", rf: "rf_rating",
  dh: "dh_rating", p: "sp_rating",
};

export const VsHandOptions: SelectOption[] = [
  { value: "both", label: "Both" },
  { value: "L", label: "vs LHP" },
  { value: "R", label: "vs RHP" },
];

export const BullpenRoleOptions: SelectOption[] = [
  { value: "closer", label: "Closer" },
  { value: "setup", label: "Setup" },
  { value: "middle", label: "Middle" },
  { value: "long", label: "Long" },
  { value: "mop_up", label: "Mop Up" },
];

export const BullpenRoleDescriptions: Record<string, string> = {
  closer: "Enters in the 9th to protect a lead.",
  setup: "7th/8th inning bridge to the closer.",
  middle: "General-purpose middle relief.",
  long: "Can pitch multiple innings in relief.",
  mop_up: "Low-leverage situations, blowouts.",
};

// Default lineup slots
export const DEFAULT_LINEUP_SLOTS = [
  { slot: 1, role: "table_setter" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 2, role: "on_base" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 3, role: "slugger" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 4, role: "slugger" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 5, role: "balanced" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 6, role: "balanced" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 7, role: "balanced" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 8, role: "speed" as const, locked_player_id: null, min_order: null, max_order: null },
  { slot: 9, role: "bottom" as const, locked_player_id: null, min_order: null, max_order: null },
];

// Diamond layout — groups positions into visual rows
export const DIAMOND_LAYOUT = {
  outfield: ["lf", "cf", "rf"] as PositionCode[],
  infield:  ["tb", "ss", "sb", "fb"] as PositionCode[],
  battery:  ["c"] as PositionCode[],
  dh:       ["dh"] as PositionCode[],
};

// Contextual attribute display maps — which PlayerRatings keys to show in each context
type AttrDef = { key: keyof PlayerRatings; label: string };

export const DEFENSE_DISPLAY_ATTRS: Record<string, AttrDef[]> = {
  c:  [{ key: "c_rating", label: "C" }, { key: "catchframe_display", label: "Frm" }, { key: "catchsequence_display", label: "Seq" }, { key: "throwacc_display", label: "TAcc" }],
  fb: [{ key: "fb_rating", label: "1B" }, { key: "fieldcatch_display", label: "FCat" }, { key: "fieldreact_display", label: "FRct" }],
  sb: [{ key: "sb_rating", label: "2B" }, { key: "fieldreact_display", label: "FRct" }, { key: "throwacc_display", label: "TAcc" }, { key: "fieldspot_display", label: "FSpt" }],
  tb: [{ key: "tb_rating", label: "3B" }, { key: "fieldreact_display", label: "FRct" }, { key: "throwacc_display", label: "TAcc" }, { key: "throwpower_display", label: "TPow" }],
  ss: [{ key: "ss_rating", label: "SS" }, { key: "fieldreact_display", label: "FRct" }, { key: "throwacc_display", label: "TAcc" }, { key: "fieldspot_display", label: "FSpt" }],
  lf: [{ key: "lf_rating", label: "LF" }, { key: "fieldcatch_display", label: "FCat" }, { key: "speed_display", label: "Spd" }, { key: "throwpower_display", label: "TPow" }],
  cf: [{ key: "cf_rating", label: "CF" }, { key: "fieldcatch_display", label: "FCat" }, { key: "speed_display", label: "Spd" }, { key: "fieldreact_display", label: "FRct" }],
  rf: [{ key: "rf_rating", label: "RF" }, { key: "fieldcatch_display", label: "FCat" }, { key: "throwpower_display", label: "TPow" }, { key: "throwacc_display", label: "TAcc" }],
  dh: [{ key: "dh_rating", label: "DH" }, { key: "contact_display", label: "Con" }, { key: "power_display", label: "Pow" }, { key: "eye_display", label: "Eye" }],
};

export const BATTING_DISPLAY_ATTRS: AttrDef[] = [
  { key: "contact_display", label: "Cont" },
  { key: "power_display", label: "Power" },
  { key: "eye_display", label: "Eye" },
  { key: "discipline_display", label: "Disc" },
];

export const ALL_DEFENSE_ATTRS: AttrDef[] = [
  { key: "speed_display", label: "Speed" },
  { key: "fieldcatch_display", label: "F_Catch" },
  { key: "fieldreact_display", label: "F_React" },
  { key: "fieldspot_display", label: "F_Spot" },
  { key: "throwacc_display", label: "T_Acc" },
  { key: "throwpower_display", label: "T_Power" },
  { key: "catchframe_display", label: "C_Frame" },
  { key: "catchsequence_display", label: "C_Seq" },
];

export const SP_DISPLAY_ATTRS: AttrDef[] = [
  { key: "sp_rating", label: "SP" },
  { key: "pendurance_display", label: "End" },
  { key: "pgencontrol_display", label: "Ctrl" },
  { key: "pthrowpower_display", label: "Vel" },
];

export const RP_DISPLAY_ATTRS: AttrDef[] = [
  { key: "rp_rating", label: "RP" },
  { key: "pgencontrol_display", label: "Ctrl" },
  { key: "pthrowpower_display", label: "Vel" },
];

// ---- Type unions matching API exactly ----

export type PlateApproach = "normal" | "aggressive" | "patient" | "contact" | "power";
export type PitchingApproach = "normal" | "aggressive" | "finesse" | "power" | "location";
export type BaserunningApproach = "normal" | "aggressive" | "cautious" | "conservative";
export type UsagePreference = "normal" | "only_fully_rested" | "play_tired" | "desperation";
export type PullTendency = "normal" | "quick" | "long";
export type OutfieldSpacing = "normal" | "deep" | "shallow" | "shift_pull" | "shift_oppo";
export type InfieldSpacing = "normal" | "in" | "double_play" | "shift_pull" | "shift_oppo";
export type BullpenPriorityType = "rest" | "matchup" | "best_available";
export type LineupRole = "table_setter" | "on_base" | "balanced" | "slugger" | "bottom" | "speed";
export type PositionCode = "c" | "fb" | "sb" | "tb" | "ss" | "lf" | "cf" | "rf" | "dh" | "p";
export type VsHand = "L" | "R" | "both";
export type BullpenRole = "closer" | "setup" | "middle" | "long" | "mop_up";

// ---- API data shapes ----

export interface PlayerStrategy {
  id: number | null;
  org_id: number;
  player_id: number;
  user_id?: number;
  plate_approach: PlateApproach;
  pitching_approach: PitchingApproach;
  baserunning_approach: BaserunningApproach;
  usage_preference: UsagePreference;
  stealfreq: number;
  pickofffreq: number;
  pitchchoices: number[];
  pitchpull: number | null;
  pulltend: PullTendency | null;
}

export interface OrgPlayerStrategiesResponse {
  org_id: number;
  strategies: PlayerStrategy[];
}

// Per-row error returned by the bulk player-strategies PUT.
// Backend returns 400 with { error: "validation_failed", details: [...] }
// for both validation failures and ownership rejections.
export interface PlayerStrategyValidationDetail {
  player_id: number;
  field: string;
  message: string;
}

export interface PlayerStrategyBatchSaveRequest {
  strategies: Array<Partial<PlayerStrategy> & { player_id: number }>;
}

export interface TeamStrategy {
  team_id: number;
  outfield_spacing: OutfieldSpacing;
  infield_spacing: InfieldSpacing;
  bullpen_cutoff: number;
  bullpen_priority: BullpenPriorityType;
  intentional_walk_list: number[];
}

export interface LineupSlot {
  slot: number;
  role: LineupRole;
  locked_player_id: number | null;
  min_order: number | null;
  max_order: number | null;
}

export interface LineupConfig {
  team_id?: number;
  slots: LineupSlot[];
}

export interface DefenseAssignment {
  position_code: PositionCode;
  vs_hand: VsHand;
  player_id: number;
  target_weight: number;
  priority: number;
  locked: boolean;
  lineup_role: LineupRole;
  min_order: number | null;
  max_order: number | null;
}

export interface DefenseConfig {
  team_id?: number;
  assignments: DefenseAssignment[];
}

export interface RotationSlot {
  slot: number;
  player_id: number;
}

export interface RotationConfig {
  team_id?: number;
  rotation_size: number | null;
  current_slot: number;
  last_game_id: number | null;
  slots: RotationSlot[];
}

export interface BullpenEntry {
  slot: number;
  player_id: number;
  role: BullpenRole;
}

export interface BullpenConfig {
  team_id?: number;
  pitchers: BullpenEntry[];
  emergency_pitcher_id: number | null;
}

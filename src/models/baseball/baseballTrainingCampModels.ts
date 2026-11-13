// ── Training Camp ────────────────────────────────────────────
// One focus skill + intensity per player per season. Applied by the
// end-season progression pass; see docs/training camp frontend guide.

export type TrainingCampIntensity = "regular" | "intense" | "max";

export interface TrainingCampSkill {
    attr: string;
    label: string;
    kind: "ability" | "pitch";
}

export interface TrainingCampIntensityOption {
    intensity: TrainingCampIntensity;
    steps_up: number;
    steps_down: number;
    backfire_pct: number;
    description: string;
}

export interface TrainingCampOptionsResponse {
    skills: TrainingCampSkill[];
    intensities: TrainingCampIntensityOption[];
    grade_ladder: string[];
}

export interface TrainingCampPlayer {
    player_id: number;
    name: string;
    age: number;
    ptype: "Pitcher" | "Position";
    level: number;
    pitches: (string | null)[];
    focus_attr: string | null;
    focus_label: string | null;
    intensity: TrainingCampIntensity | null;
    locked: boolean;
}

export interface TrainingCampFocusResponse {
    org_id: number;
    league_year_id: number;
    with_focus: number;
    players: TrainingCampPlayer[];
}

export interface TrainingCampFocusItem {
    player_id: number;
    attr: string;
    intensity: TrainingCampIntensity;
}

export interface TrainingCampSetFocusRequest {
    org_id: number;
    league_year_id?: number;
    items: TrainingCampFocusItem[];
    set_by?: string;
}

export interface TrainingCampSetFocusResponse {
    success: boolean;
    league_year_id: number;
    set: {
        player_id: number;
        attr: string;
        label: string;
        intensity: TrainingCampIntensity;
        league_year_id: number;
    }[];
}

export interface TrainingCampClearFocusRequest {
    org_id: number;
    league_year_id?: number;
    player_id: number;
}

export interface TrainingCampClearFocusResponse {
    success: boolean;
    removed: boolean;
    league_year_id: number;
}

export interface TrainingCampResult {
    player_id: number;
    name: string;
    attr: string;
    label: string;
    intensity: TrainingCampIntensity;
    steps: number;
    backfired: boolean;
}

export interface TrainingCampResultsResponse {
    league_year_id: number;
    results: TrainingCampResult[];
}

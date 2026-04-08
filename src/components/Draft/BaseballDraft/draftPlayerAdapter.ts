import type { Player, PlayerRatings, PlayerPotentials } from "../../../models/baseball/baseballModels";
import type { BaseballDraftee } from "../../../models/baseball/baseballDraftModels";

/**
 * Player extended with draft-specific fields.
 */
export interface DraftPlayer extends Player {
  draft_rank: number | null;
  college_team: string;
  college_abbrev: string;
  overall_grade: string | null;
  is_draft_eligible: boolean;
  player_id: number;
  scouting_state?: {
    attrs_precise: boolean;
    pots_precise: boolean;
    available_actions: string[];
  };
}

/**
 * Adapt a BaseballDraftee (new unified shape) to the Player shape
 * expected by roster table components, with draft-specific fields preserved.
 */
export function adaptDraftee(d: BaseballDraftee): DraftPlayer {
  const bio = d.bio;
  const hasBio = !!bio;

  return {
    id: d.player_id,
    player_id: d.player_id,
    firstname: hasBio ? bio!.firstname : d.first_name,
    lastname: hasBio ? bio!.lastname : d.last_name,
    ptype: (hasBio ? bio!.ptype : (d.position === "SP" || d.position === "RP" ? "Pitcher" : "Position")) as any,
    listed_position: d.position,
    age: hasBio ? bio!.age : d.age,
    displayovr: d.overall_grade,
    height: hasBio ? bio!.height : d.height,
    weight: hasBio ? bio!.weight : d.weight,
    bat_hand: (hasBio ? bio!.bat_hand : d.bat_hand) as any,
    pitch_hand: (hasBio ? bio!.pitch_hand : d.throw_hand) as any,
    durability: (hasBio ? bio!.durability : "") as any,
    injury_risk: (hasBio ? bio!.injury_risk : "") as any,
    pitch1_name: hasBio ? bio!.pitch1_name : null,
    pitch2_name: hasBio ? bio!.pitch2_name : null,
    pitch3_name: hasBio ? bio!.pitch3_name : null,
    pitch4_name: hasBio ? bio!.pitch4_name : null,
    pitch5_name: hasBio ? bio!.pitch5_name : null,
    current_level: 0,
    league_level: "",
    team_abbrev: d.college_abbrev ?? "",
    contract: null,
    ratings: (d.ratings ?? {}) as PlayerRatings,
    potentials: (d.potentials ?? {}) as PlayerPotentials,
    // Draft-specific
    draft_rank: d.draft_rank,
    college_team: d.college_team ?? "",
    college_abbrev: d.college_abbrev ?? "",
    overall_grade: d.overall_grade,
    is_draft_eligible: d.is_draft_eligible,
    scouting_state: d.scouting,
  };
}

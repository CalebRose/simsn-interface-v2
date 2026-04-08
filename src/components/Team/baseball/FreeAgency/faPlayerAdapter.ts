import type { Player, PlayerRatings, PlayerPotentials } from "../../../../models/baseball/baseballModels";
import type {
  FAPoolPlayer,
  FAPlayerAuction,
  FAPlayerDemand,
  FAPlayerScouting,
  FAType,
} from "../../../../models/baseball/baseballFreeAgencyModels";

/**
 * Player extended with FA-specific fields.
 * The roster table accepts Player[]; since FAPlayer extends Player,
 * FAPlayer[] is assignable to Player[]. In renderActions callbacks,
 * cast the Player back to FAPlayer to access FA-specific fields.
 */
export interface FAPlayer extends Player {
  fa_type: FAType;
  auction: FAPlayerAuction | null;
  demand: FAPlayerDemand | null;
  scouting: FAPlayerScouting;
  last_level: number;
  last_org_abbrev: string | null;
}

/**
 * Adapt the new unified FA pool API response shape into the Player shape
 * expected by roster table components, with FA-specific fields preserved.
 */
export function adaptFAPoolPlayer(fa: FAPoolPlayer): FAPlayer {
  const bio = fa.bio;
  const r = fa.ratings ?? {};
  const p = fa.potentials ?? {};

  return {
    // Top-level Player fields
    id: fa.id,
    firstname: bio.firstname,
    lastname: bio.lastname,
    ptype: bio.ptype as any,
    listed_position: fa.listed_position,
    age: bio.age,
    displayovr: fa.displayovr as any,
    height: bio.height,
    weight: bio.weight,
    bat_hand: bio.bat_hand as any,
    pitch_hand: bio.pitch_hand as any,
    durability: bio.durability as any,
    injury_risk: bio.injury_risk as any,
    pitch1_name: bio.pitch1_name,
    pitch2_name: bio.pitch2_name,
    pitch3_name: bio.pitch3_name,
    pitch4_name: bio.pitch4_name,
    pitch5_name: bio.pitch5_name,

    // Roster-only fields — defaults for FA context
    current_level: fa.last_level ?? 0,
    league_level: "",
    team_abbrev: fa.last_org_abbrev ?? "",
    contract: null,

    // Pass through ratings and potentials directly
    ratings: r as PlayerRatings,
    potentials: p as PlayerPotentials,

    // FA-specific fields
    fa_type: fa.fa_type,
    auction: fa.auction,
    demand: fa.demand,
    scouting: fa.scouting,
    last_level: fa.last_level,
    last_org_abbrev: fa.last_org_abbrev,
  };
}

import type { Player, PlayerRatings, PlayerPotentials } from "../../../../models/baseball/baseballModels";
import type {
  IFAEligiblePlayer,
  IFAAuctionEntry,
  IFAPlayerScouting,
  IFAAuctionPhase,
  IFAMyOffer,
} from "../../../../models/baseball/baseballIFAModels";

/**
 * Player extended with IFA-specific fields.
 * Assignable to Player[] for roster table reuse.
 */
export interface IFAPlayer extends Player {
  star_rating: number;
  slot_value: number;
  scouting: IFAPlayerScouting;
  // Auction-only fields (null on eligible prospects)
  auction_id?: number;
  ifa_phase?: IFAAuctionPhase;
  active_offers?: number;
  competitors?: string[];
  my_offer?: IFAMyOffer | null;
  entered_week?: number;
  area: string;
}

/**
 * Adapt an IFA eligible player to the Player shape.
 */
export function adaptIFAEligiblePlayer(p: IFAEligiblePlayer): IFAPlayer {
  const bio = p.bio;
  return {
    id: p.player_id,
    firstname: bio.firstname,
    lastname: bio.lastname,
    ptype: bio.ptype as any,
    listed_position: p.listed_position,
    age: bio.age,
    displayovr: null,
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
    current_level: 0,
    league_level: "",
    team_abbrev: "",
    contract: null,
    ratings: (p.ratings ?? {}) as PlayerRatings,
    potentials: (p.potentials ?? {}) as PlayerPotentials,
    // IFA-specific
    star_rating: p.star_rating,
    slot_value: p.slot_value,
    scouting: p.scouting,
    area: bio.area,
  };
}

/**
 * Adapt an IFA auction entry to the Player shape.
 */
export function adaptIFAAuctionEntry(a: IFAAuctionEntry): IFAPlayer {
  const bio = a.bio;
  return {
    id: a.player_id,
    firstname: bio.firstname,
    lastname: bio.lastname,
    ptype: bio.ptype as any,
    listed_position: a.listed_position,
    age: bio.age,
    displayovr: null,
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
    current_level: 0,
    league_level: "",
    team_abbrev: "",
    contract: null,
    ratings: (a.ratings ?? {}) as PlayerRatings,
    potentials: (a.potentials ?? {}) as PlayerPotentials,
    // IFA-specific
    star_rating: a.star_rating,
    slot_value: a.slot_value,
    scouting: a.scouting,
    area: bio.area,
    auction_id: a.auction_id,
    ifa_phase: a.phase,
    active_offers: a.active_offers,
    competitors: a.competitors,
    my_offer: a.my_offer,
    entered_week: a.entered_week,
  };
}

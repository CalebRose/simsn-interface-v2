import { DraftLeague, Draftee, isNFLDraftee, isNFLLeague } from "./types";
import {
  getScoutableAttributes as getNFLScoutableAttributes,
  getAttributeFieldName as getNFLAttributeFieldName,
  getAttributeShowProperty as getNFLAttributeShowProperty,
  getScoutingCost as getNFLScoutingCost,
} from "../NFLDraft/utils/draftHelpers";
import {
  getHockeyScoutableAttributes,
  getHockeyAttributeFieldName,
  getHockeyAttributeShowProperty,
  getHockeyScoutingCost,
} from "../PHLDraft/utils/draftHelpers";

export const getScoutableAttributes = (
  position: string,
  archetype: string,
  league: DraftLeague,
): string[] => {
  if (isNFLLeague(league)) {
    return getNFLScoutableAttributes(position, archetype);
  }
  return getHockeyScoutableAttributes(position, archetype);
};

export const getAttributeFieldName = (
  displayName: string,
  league: DraftLeague,
): string => {
  if (isNFLLeague(league)) {
    return getNFLAttributeFieldName(displayName);
  }
  return getHockeyAttributeFieldName(displayName);
};

export const getAttributeShowProperty = (
  displayName: string,
  league: DraftLeague,
  showPotentialGrade: boolean,
  index: number,
): string => {
  if (isNFLLeague(league)) {
    return getNFLAttributeShowProperty(displayName);
  }
  return getHockeyAttributeShowProperty(displayName, showPotentialGrade, index);
};

export const getScoutingCost = (
  attributeName: string,
  league: DraftLeague,
): number => {
  if (isNFLLeague(league)) {
    return getNFLScoutingCost(attributeName);
  }
  return getHockeyScoutingCost(attributeName);
};

export const getOverallGrade = (player: Draftee): string => {
  if (isNFLDraftee(player)) {
    return player.OverallGrade || "C";
  }
  const overall = (player as any).Overall || 0;
  if (overall >= 27) return "A+";
  if (overall >= 25) return "A";
  if (overall >= 23) return "A-";
  if (overall >= 21) return "B+";
  if (overall >= 19) return "B";
  if (overall >= 17) return "B-";
  if (overall >= 15) return "C+";
  if (overall >= 13) return "C";
  if (overall >= 11) return "C-";
  if (overall >= 9) return "D+";
  if (overall >= 5) return "D";
  return "F";
};

export const getPotentialGrade = (
  player: Draftee,
  league: DraftLeague,
): string => {
  if (isNFLLeague(league)) {
    return (player as any).PotentialGrade || "?";
  }
  const potential = (player as any).Potential || (player as any).PrimeAge || 0;
  if (potential >= 90) return "A+";
  if (potential >= 85) return "A";
  if (potential >= 80) return "A-";
  if (potential >= 75) return "B+";
  if (potential >= 70) return "B";
  if (potential >= 65) return "B-";
  if (potential >= 60) return "C+";
  if (potential >= 55) return "C";
  return "C-";
};

export const getTimeForPick = (
  pickNumber: number,
  league: DraftLeague,
  picksPerRound?: number,
): number => {
  if (isNFLLeague(league)) {
    if (pickNumber <= 32) return 300;
    if (pickNumber <= 130) return 180;
    return 120;
  }
  const round = Math.ceil(pickNumber / (picksPerRound || 24));
  if (round === 1) return 300;
  if (round <= 4) return 180;
  return 120;
};

import { DraftLeague, Draftee, isNFLDraftee, isNFLLeague, isPHLLeague } from "./types";
import {
  getScoutableAttributes as getNFLScoutableAttributes,
  getAttributeFieldName as getNFLAttributeFieldName,
  getAttributeShowProperty as getNFLAttributeShowProperty,
  getScoutingCost as getNFLScoutingCost,
  getNBAAttributeFieldName,
  getNBAAttributeShowProperty,
  getNBAScoutableAttributes,
} from "../NFLDraft/utils/draftHelpers";
import {
  getHockeyScoutableAttributes,
  getHockeyAttributeFieldName,
  getHockeyAttributeShowProperty,
  getHockeyScoutingCost,
} from "../PHLDraft/utils/draftHelpers";
import { League, SimNBA, SimNFL, SimPHL } from "../../../_constants/constants";
import { NBADraftee } from "../../../models/basketballModels";

export const GRADE_SCALE = [
  "F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"
];

export const getGradeValue = (grade: string): number => {
  const idx = GRADE_SCALE.indexOf(grade);
  return idx === -1 ? -1 : idx;
};

export const fnv1a32 = (str: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export const fuzzGrade = (playerId: number, key: string, trueGrade: string): string => {
  const idx = GRADE_SCALE.indexOf(trueGrade);
  if (idx === -1) return trueGrade;
  const roll = fnv1a32(`${playerId}:${key}`) % 100;
  if (roll < 15) {
    return GRADE_SCALE[Math.min(idx + 1, GRADE_SCALE.length - 1)];
  }
  if (roll < 30) {
    return GRADE_SCALE[Math.max(idx - 1, 0)];
  }
  return trueGrade;
};

export const getTrueHockeyOverallGrade = (overall: number): string => {
  if (overall >= 24) return "A+";
  if (overall >= 22) return "A";
  if (overall >= 20) return "A-";
  if (overall >= 18) return "B+";
  if (overall >= 16) return "B";
  if (overall >= 14) return "B-";
  if (overall >= 12) return "C+";
  if (overall >= 10) return "C";
  if (overall >= 8) return "C-";
  if (overall >= 6) return "D";
  return "F";
};

export const getDrafteeAttributeGrade = (attr: number): string => {
  if (attr > 22) return "A+";
  if (attr > 20) return "A";
  if (attr > 18) return "A-";
  if (attr > 16) return "B+";
  if (attr > 14) return "B";
  if (attr > 12) return "B-";
  if (attr > 10) return "C+";
  if (attr > 8) return "C";
  if (attr > 6) return "C-";
  if (attr > 4) return "D";
  return "F";
};

export const getHockeyAttributeGrade = (
  player: Draftee,
  fieldName: string,
): string => {
  const p = player as any;
  if (p[fieldName] !== undefined && typeof p[fieldName] === "number") {
    const trueGrade = getDrafteeAttributeGrade(p[fieldName]);
    return fuzzGrade(player.ID, fieldName, trueGrade);
  }
  const existingGrade = p[`${fieldName}Grade`];
  if (existingGrade && existingGrade !== "?") {
    return fuzzGrade(player.ID, fieldName, existingGrade);
  }
  return existingGrade || "?";
};

export const getScoutableAttributes = (
  position: string,
  archetype: string,
  league: DraftLeague,
): string[] => {
  if (isNFLLeague(league)) {
    return getNFLScoutableAttributes(position, archetype);
  }
  if (league === SimNBA) {
    return getNBAScoutableAttributes(position, archetype);
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
  if (league === SimNBA) {
    return getNBAAttributeFieldName(displayName);
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
    return getNFLAttributeShowProperty(displayName, index);
  }
  if (league === SimNBA) {
    return getNBAAttributeShowProperty(displayName, index);
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

export const getOverallGrade = (player: Draftee, league: League): string => {
  if (league === SimNFL) {
    return player.OverallGrade || "C";
  }
  if (league === SimNBA) {
    return (player as NBADraftee).OverallGrade || "C";
  }
  if (player.OverallGrade) {
    return player.OverallGrade;
  }
  const overall = (player as any).Overall || 0;
  const trueGrade = getTrueHockeyOverallGrade(overall);
  return fuzzGrade(player.ID, "Overall", trueGrade);
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
  const defaultPicks = isPHLLeague(league) ? 28 : 32;
  const round = Math.ceil(pickNumber / (picksPerRound || defaultPicks));
  if (round === 1) return 300;
  if (round <= 4) return 180;
  return 120;
};

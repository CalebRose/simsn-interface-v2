import { NFLDraftPick, NFLDraftee, ScoutingProfile as NFLScoutingProfile } from '../../../models/footballModels';
import { DraftPick as PHLDraftPick, DraftablePlayer as PHLDraftee, ScoutingProfile as PHLScoutingProfile } from '../../../models/hockeyModels';
import { SimNFL, SimPHL, SimCFB, SimCHL, League } from '../../../_constants/constants';

export type DraftPick = NFLDraftPick | PHLDraftPick;
export type Draftee = NFLDraftee | PHLDraftee;
export type ScoutingProfile = NFLScoutingProfile | PHLScoutingProfile;
export type DraftLeague = League;

export const isNFLLeague = (league: DraftLeague | League): boolean => {
  return league === SimNFL;
};

export const isPHLLeague = (league: DraftLeague | League): boolean => {
  return league === SimPHL;
};

export interface TeamColors {
  primary: string;
  secondary: string;
}

export const NFL_POSITIONS = [
  { value: 'QB', label: 'Quarterback' },
  { value: 'RB', label: 'Running Back' },
  { value: 'WR', label: 'Wide Receiver' },
  { value: 'TE', label: 'Tight End' },
  { value: 'OT', label: 'Offensive Tackle' },
  { value: 'OG', label: 'Offensive Guard' },
  { value: 'C', label: 'Center' },
  { value: 'DE', label: 'Defensive End' },
  { value: 'DT', label: 'Defensive Tackle' },
  { value: 'ILB', label: 'Inside Linebacker' },
  { value: 'OLB', label: 'Outside Linebacker' },
  { value: 'CB', label: 'Cornerback' },
  { value: 'S', label: 'Safety' },
  { value: 'K', label: 'Kicker' },
  { value: 'P', label: 'Punter' },
];

export const PHL_POSITIONS = [
  { value: 'C', label: 'Center' },
  { value: 'F', label: 'Forward' },
  { value: 'D', label: 'Defenseman' },
  { value: 'G', label: 'Goalie' },
];

export const getPositionsByLeague = (league: DraftLeague) => {
  return isNFLLeague(league) ? NFL_POSITIONS : PHL_POSITIONS;
};

export const getLeagueConstant = (league: DraftLeague): DraftLeague => {
  return isNFLLeague(league) ? SimNFL : SimPHL;
};

export const getCollegeLeagueConstant = (league: DraftLeague): League => {
  return isNFLLeague(league) ? SimCFB : SimCHL;
};

export const isNFLDraftee = (draftee: Draftee): draftee is NFLDraftee => {
  return 'FootballIQ' in draftee;
};

export const isPHLDraftee = (draftee: Draftee): draftee is PHLDraftee => {
  return 'Faceoffs' in draftee || 'Goalkeeping' in draftee;
};

export const isNFLDraftPick = (pick: DraftPick): pick is NFLDraftPick => {
  return !('SelectedPlayerType' in pick);
};

export const isNFLScoutingProfile = (profile: ScoutingProfile): profile is NFLScoutingProfile => {
  return 'Draftee' in profile;
};

export const getPlayerCollege = (player: Draftee, league: DraftLeague): string => {
  if (isNFLLeague(league)) {
    return (player as NFLDraftee).College || '';
  }
  return (player as PHLDraftee).Team || '';
};

export const formatPlayerHeight = (height: number, league: DraftLeague): string => {
  if (isNFLLeague(league)) {
    return `${Math.floor(height / 12)}'${height % 12}"`;
  }
  return `${Math.floor(height / 12)}'${height % 12}"`;
};

export const DepthChartPositionList = [
  { name: 'Quarterbacks', abbr: 'QB' },
  { name: 'Runningbacks', abbr: 'RB' },
  { name: 'Fullbacks', abbr: 'FB' },
  { name: 'Tight Ends', abbr: 'TE' },
  { name: 'Wide Receivers', abbr: 'WR' },
  { name: 'Left Tackles', abbr: 'LT' },
  { name: 'Left Guards', abbr: 'LG' },
  { name: 'Centers', abbr: 'C' },
  { name: 'Right Guards', abbr: 'RG' },
  { name: 'Right Tackles', abbr: 'RT' },
  { name: 'Left Ends', abbr: 'LE' },
  { name: 'Defensive Tackles', abbr: 'DT' },
  { name: 'Right Ends', abbr: 'RE' },
  { name: 'Left Outside Linebackers', abbr: 'LOLB' },
  { name: 'Middle Linebackers', abbr: 'MLB' },
  { name: 'Right Outside Linebackers', abbr: 'ROLB' },
  { name: 'Cornerbacks', abbr: 'CB' },
  { name: 'Free Safeties', abbr: 'FS' },
  { name: 'Strong Safeties', abbr: 'SS' },
  { name: 'Punters', abbr: 'P' },
  { name: 'Punt Returners', abbr: 'PR' },
  { name: 'Kickers', abbr: 'K' },
  { name: 'Kick Returners', abbr: 'KR' },
  { name: 'Field Goal Placekickers', abbr: 'FG' },
  { name: 'Special Teams Unit', abbr: 'STU' }
];

export const GeneralAttributes = [
  { label: 'Name' },
  { label: 'Position' },
  { label: 'String' },
  { label: 'Archetype' },
  { label: 'Overall' },
  { label: 'Year' }
];

export const OFFENSIVE_POSITIONS = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
export const DEFENSIVE_POSITIONS = ['LE', 'DT', 'RE', 'LOLB', 'MLB', 'ROLB', 'CB', 'FS', 'SS'];
export const SPECIAL_TEAMS_POSITIONS = ['P', 'PR', 'K', 'KR', 'FG', 'STU'];

export const POSITION_LIMITS = {
  QB: 3,
  RB: 3,
  FB: 2,
  TE: 3,
  WR: 7,
  LT: 2,
  LG: 2,
  C: 2,
  RG: 2,
  RT: 2,
  LE: 2,
  DT: 4,
  RE: 2,
  LOLB: 2,
  MLB: 4,
  ROLB: 2,
  CB: 5,
  FS: 2,
  SS: 2,
  P: 2,
  PR: 2,
  K: 2,
  KR: 2,
  FG: 2,
  STU: 15
};

export const OFFENSE_POSITIONS_EXTENDED = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'OT', 'OG'];
export const DEFENSE_POSITIONS_EXTENDED = ['LE', 'DT', 'RE', 'LOLB', 'MLB', 'ROLB', 'CB', 'FS', 'SS', 'DE', 'OLB', 'ILB'];
export const SPECIAL_TEAMS_POSITIONS_EXTENDED = ['P', 'PR', 'K', 'KR', 'FG', 'STU'];

export const POSITION_ELIGIBILITY: Record<string, string[]> = {
  QB: ['QB', 'RB', 'FB', 'WR', 'TE', 'K', 'P', 'ATH'],
  RB: ['RB', 'FB', 'QB', 'WR', 'ATH'],
  FB: ['FB', 'RB', 'TE', 'ATH'],
  TE: ['TE', 'RB', 'FB', 'WR', 'ATH'],
  WR: ['WR', 'TE', 'RB', 'FB', 'QB', 'ATH'],
  LT: ['OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 'FB', 'TE', 'ATH'],
  LG: ['OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 'FB', 'TE', 'ATH'],
  C: ['OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 'FB', 'TE', 'ATH'],
  RG: ['OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 'FB', 'TE', 'ATH'],
  RT: ['OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 'FB', 'TE', 'ATH'],
  LE: ['DE', 'ATH', 'DT', 'OLB', 'ILB', 'SS', 'FS'],
  RE: ['DE', 'ATH', 'DT', 'OLB', 'ILB', 'SS', 'FS'],
  DT: ['DT', 'ATH', 'DE', 'OLB', 'ILB'],
  LOLB: ['OLB', 'ATH', 'ILB', 'DE', 'SS', 'DT', 'FS', 'CB'],
  ROLB: ['OLB', 'ATH', 'ILB', 'DE', 'SS', 'DT', 'FS', 'CB'],
  MLB: ['ILB', 'ATH', 'OLB', 'SS', 'FS', 'CB', 'DT', 'DE'],
  CB: ['CB', 'ATH', 'FS', 'SS', 'OLB', 'ILB'],
  FS: ['FS', 'ATH', 'CB', 'SS', 'OLB', 'ILB'],
  SS: ['SS', 'ATH', 'FS', 'CB', 'OLB', 'ILB'],
  P: ['P', 'K', 'ATH', 'QB'],
  PR: ['RB', 'WR', 'ATH', 'FB', 'CB', 'FS'],
  K: ['K', 'P', 'ATH', 'QB'],
  KR: ['RB', 'WR', 'ATH', 'FB', 'CB', 'FS'],
  FG: ['K', 'P', 'ATH', 'QB'],
  STU: ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'LT', 'LG', 'C', 'RG', 'RT', 
        'DE', 'DT', 'OLB', 'ILB', 'CB', 'FS', 'SS', 'ATH']
};

export const OVERARCHING_POSITIONS: Record<string, string> = {
  LT: 'OT',
  RT: 'OT',
  LG: 'OG',
  RG: 'OG',
  C: 'C',
  LE: 'DE',
  RE: 'DE',
  DT: 'DT',
  MLB: 'ILB',
  LOLB: 'OLB',
  ROLB: 'OLB',
  CB: 'CB',
  FS: 'FS',
  SS: 'SS'
};

export const SPECIAL_POSITION_SORTING = {
  PR: 'Speed',
  KR: 'Speed',
  STU: 'Strength'
} as const;

export const UNDER_CENTER = 'under-center';
export const GUN = 'gun';
export const PISTOL = 'pistol';
export const SPREAD = 'spread';
export const TIGHT = 'tight';
export const WING = 'wing';
export const EMPTY = 'empty';
export const FLEXBONE_GUN = 'flexbone-gun';
export const WING_SPLIT_BACK_GUN = 'wing-split-back-gun';
export const WING_T = 'wing-t';
export const WING_T_DOUBLE_TIGHT = 'wing-t-double-tight';
export const DOUBLE_WING_SPLIT = 'double-wing-split';
export const DOUBLE_WING_TIGHT = 'double-wing-tight';
export const DOUBLE_WING_SPREAD = 'double-wing-spread';
export const DOUBLE_WING_STRONG = 'double-wing-strong';
export const DOUBLE_WING = 'double-wing';
export const SPLIT_BACK_GUN = 'split-back-gun';
export const SINGLEBACK = 'singleback';

export const FOUR_THREE_BASE = '4-3-base';
export const FOUR_THREE_OVER = '4-3-over';
export const FOUR_THREE_UNDER = '4-3-under';
export const FOUR_THREE_LIGHT = '4-3-light';
export const FOUR_THREE_HEAVY = '4-3-heavy';
export const THREE_FOUR_BASE = '3-4-base';
export const THREE_FOUR_OVER = '3-4-over';
export const THREE_FOUR_UNDER = '3-4-under';
export const THREE_FOUR_OKIE = '3-4-okie';
export const THREE_FOUR_BRONCO = '3-4-bronco';
export const THREE_FOUR_EAGLE = '3-4-eagle';
export const THREE_FOUR_FOUR_HEAVY = '3-4-4-heavy';
export const FOUR_FOUR_BASE = '4-4-base';
export const FOUR_FOUR_OVER = '4-4-over';
export const FOUR_FOUR_UNDER = '4-4-under';
export const FOUR_FOUR_JUMBO = '4-4-jumbo';
export const FOUR_FOUR_HEAVY = '4-4-heavy';
export const FOUR_TWO_FIVE_BASE = '4-2-5-base';
export const FOUR_TWO_FIVE_NICKEL = '4-2-5-nickel';
export const THREE_THREE_FIVE_BASE = '3-3-5-base';
export const THREE_THREE_FIVE_OVER = '3-3-5-over';
export const THREE_THREE_FIVE_NICKEL = '3-3-5-nickel';
export const DIME_FOUR_ONE_SIX = 'dime-4-1-6';
export const DIME_THREE_TWO_SIX = 'dime-3-2-6';
export const FOUR_ONE_SIX_DIME = '4-1-6-dime';
export const FOUR_ONE_SIX_BIG_DIME = '4-1-6-big-dime';
export const THREE_TWO_SIX_DIME = '3-2-6-dime';
export const THREE_TWO_SIX_BIG_PENNY = '3-2-6-big-penny';
export const THREE_TWO_SIX_PENNY = '3-2-6-penny';
export const QUARTER = 'quarter';
export const GOAL_LINE = 'goal-line';

export const POSITION_PREFIXES = {
  QB: 'QB',
  WR: 'WR',
  TE: 'TE',
  RB: 'RB',
  FB: 'FB',
  LT: 'LT',
  LG: 'LG',
  C: 'C',
  RG: 'RG',
  RT: 'RT',
  RE: 'RE',
  DT: 'DT',
  LE: 'LE',
  DE: 'DE',
  LOLB: 'LOLB',
  MLB: 'MLB',
  ROLB: 'ROLB',
  OLB: 'OLB',
  ILB: 'ILB',
  CB: 'CB',
  FS: 'FS',
  SS: 'SS'
} as const;

export const FORMATION_KEYWORDS = {
  GUN: 'gun',
  SINGLEBACK: 'singleback',
  PISTOL: 'pistol',
  SPREAD: 'spread',
  EMPTY: 'empty',
  TIGHT: 'tight',
  WING: 'wing',
  WINGT: 'wing-t',
  DOUBLE: 'double',
  STRONG: 'strong',
  FLEXBONE: 'flexbone',
  HEAVY: 'heavy',
  LIGHT: 'light',
  OVER: 'over',
  UNDER: 'under',
  BASE: 'base',
  NICKEL: 'nickel',
  DIME: 'dime',
  QUARTER: 'quarter',
  GOAL: 'goal',
  LINE: 'line',
  SPLIT: 'split',
  BACK: 'back',
  OKIE: 'okie',
  BRONCO: 'bronco',
  EAGLE: 'eagle',
  JUMBO: 'jumbo',
  BIG: 'big',
  PENNY: 'penny'
} as const;

export const GRID_POSITIONS = {
  COLUMNS: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13
  },
  ROWS: {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9
  }
} as const;
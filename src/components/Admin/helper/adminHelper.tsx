import {
  League,
  SimCBB,
  SimCFB,
  SimNBA,
  SimNFL,
  SimCHL,
  SimPHL,
} from "../../../_constants/constants";

const footballPhaseDictionary: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 4,
  15: 5,
  16: 6,
  17: 7,
  18: 8,
  19: 9,
  20: 10,
  21: 11,
  22: 12,
  23: 13,
  24: 14,
  25: 15,
  26: 16,
  27: 17,
  28: 18,
  29: 19,
  30: 20,
  31: 21,
  32: 22,
  33: 23,
  34: 24,
};

const basketballPhaseDictionary: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 4,
  15: 5,
  16: 6,
  17: 7,
  18: 8,
  19: 9,
  20: 10,
  21: 11,
  22: 12,
  23: 13,
  24: 14,
  25: 15,
  26: 16,
  27: 17,
  28: 18,
  29: 19,
  30: 20,
  31: 21,
  32: 22,
  33: 23,
  34: 24,
  35: 25,
  36: 26,
  37: 27,
  38: 28,
};

const hockeyPhaseDictionary: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 1,
  16: 2,
  17: 3,
  18: 4,
  19: 5,
  20: 6,
  21: 7,
  22: 8,
  23: 9,
  24: 10,
  25: 11,
  26: 12,
  27: 13,
  28: 14,
  29: 15,
  30: 16,
  31: 17,
  32: 18,
  33: 19,
  34: 20,
  35: 21,
  36: 22,
  37: 23,
  38: 24,
  39: 25,
};

export const phaseCountByLeague = (league: League): number => {
  switch (league) {
    case SimCFB:
    case SimNFL:
      return Object.keys(footballPhaseDictionary).length;
    case SimCBB:
    case SimNBA:
      return Object.keys(basketballPhaseDictionary).length;
    case SimCHL:
    case SimPHL:
      return Object.keys(hockeyPhaseDictionary).length;
    default:
      return 0;
  }
};

export const weekByPhase = (phase: number, league: League): number => {
  switch (league) {
    case SimCFB:
      return footballPhaseDictionary[phase];
    case SimNFL:
      return footballPhaseDictionary[phase];
    case SimCBB:
      return basketballPhaseDictionary[phase];
    case SimNBA:
      return basketballPhaseDictionary[phase];
    case SimCHL:
      return hockeyPhaseDictionary[phase];
    case SimPHL:
      return hockeyPhaseDictionary[phase];
    default:
      return 0;
  }
};

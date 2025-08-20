import { FormationMap, SchemeData } from '../Constants/GameplanConstants';

export interface GameplanData {
  ID: number;
  OffensiveScheme: string;
  DefensiveScheme: string;
  DefaultOffense: boolean;
  DefaultDefense: boolean;
  DefaultSpecialTeams: boolean;
  OffForm1Weight?: number;
  OffForm2Weight?: number;
  OffForm3Weight?: number;
  OffForm4Weight?: number;
  OffForm5Weight?: number;
  OffForm1TraditionalRun: number;
  OffForm1OptionRun: number;
  OffForm1RPO: number;
  OffForm1Pass: number;
  OffForm2TraditionalRun: number;
  OffForm2OptionRun: number;
  OffForm2RPO: number;
  OffForm2Pass: number;
  OffForm3TraditionalRun: number;
  OffForm3OptionRun: number;
  OffForm3RPO: number;
  OffForm3Pass: number;
  OffForm4TraditionalRun: number;
  OffForm4OptionRun: number;
  OffForm4RPO: number;
  OffForm4Pass: number;
  OffForm5TraditionalRun: number;
  OffForm5OptionRun: number;
  OffForm5RPO: number;
  OffForm5Pass: number;
  RunnerDistributionQB: number;
  RunnerDistributionRB1: number;
  RunnerDistributionRB2: number;
  RunnerDistributionRB3: number;
  RunnerDistributionFB1: number;
  RunnerDistributionFB2: number;
  RunnerDistributionWR: number;
  RunnerDistributionWRPosition?: string;
  TargetingWR1: number;
  TargetingWR2: number;
  TargetingWR3: number;
  TargetingWR4: number;
  TargetingWR5: number;
  TargetingTE1: number;
  TargetingTE2: number;
  TargetingTE3: number;
  TargetingRB1: number;
  TargetingRB2: number;
  TargetingFB1: number;
  TargetDepthWR1?: string;
  TargetDepthWR2?: string;
  TargetDepthWR3?: string;
  TargetDepthWR4?: string;
  TargetDepthWR5?: string;
  TargetDepthTE1?: string;
  TargetDepthTE2?: string;
  TargetDepthTE3?: string;
  TargetDepthRB1?: string;
  TargetDepthRB2?: string;
  TargetDepthFB1?: string;
  RunOutsideLeft: number;
  RunOutsideRight: number;
  RunInsideLeft: number;
  RunInsideRight: number;
  RunPowerLeft: number;
  RunPowerRight: number;
  RunDrawLeft: number;
  RunDrawRight: number;
  ReadOptionLeft: number;
  ReadOptionRight: number;
  SpeedOptionLeft: number;
  SpeedOptionRight: number;
  InvertedOptionLeft: number;
  InvertedOptionRight: number;
  TripleOptionLeft: number;
  TripleOptionRight: number;
  PassQuick: number;
  PassShort: number;
  PassLong: number;
  PassScreen: number;
  PassPAShort: number;
  PassPALong: number;
  ChoiceOutside: number;
  ChoiceInside: number;
  ChoicePower: number;
  PeekOutside: number;
  PeekInside: number;
  PeekPower: number;
  DefFormation1: string;
  DefFormation2: string;
  DefFormation3: string;
  DefFormation4: string;
  DefFormation5: string;
  DefFormation1RunToPass: number;
  DefFormation1BlitzWeight: number;
  DefFormation1BlitzAggression: string;
  DefFormation2RunToPass: number;
  DefFormation2BlitzWeight: number;
  DefFormation2BlitzAggression: string;
  DefFormation3RunToPass: number;
  DefFormation3BlitzWeight: number;
  DefFormation3BlitzAggression: string;
  DefFormation4RunToPass: number;
  DefFormation4BlitzWeight: number;
  DefFormation4BlitzAggression: string;
  DefFormation5RunToPass: number;
  DefFormation5BlitzWeight: number;
  DefFormation5BlitzAggression: string;
  BlitzSafeties: boolean;
  BlitzCorners: boolean;
  LinebackerCoverage: string;
  CornersCoverage: string;
  SafetiesCoverage: string;
  DoubleTeam: string | number;
  PitchFocus: number;
  DiveFocus: number;
  MaximumFGDistance: number;
  GoFor4AndShort: number;
  GoFor4AndLong: number;
  PrimaryHB: number;
  FocusPlays?: string;
  OffFormation1Name?: string;
  OffFormation2Name?: string;
  OffFormation3Name?: string;
  OffFormation4Name?: string;
  OffFormation5Name?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const getMaxForPassPlays = (scheme: string, playTypeIndex: number): number => {
  switch (playTypeIndex) {
    case 0:
      return scheme === 'Pro' ? 45 : 50;
    case 1:
      return scheme === 'Pro' ? 45 : 50;
    case 2:
      if (scheme === 'Pro') return 45;
      if (scheme === 'Air Raid') return 50;
      return 35;
    case 3:
      return 20;
    case 4:
      return scheme === 'Double Wing Option' ? 30 : 20;
    case 5:
      return scheme === 'Double Wing Option' ? 30 : 20;
    default:
      return 20;
  }
};

export const validateRunPlayDistribution = (gameplan: GameplanData): boolean => {
  const maxNormalRun = 80;
  const maxDraw = 15;
  
  const runPlays = [
    gameplan.RunOutsideLeft,
    gameplan.RunOutsideRight,
    gameplan.RunInsideLeft,
    gameplan.RunInsideRight,
    gameplan.RunPowerLeft,
    gameplan.RunPowerRight
  ];
  
  const drawPlays = [
    gameplan.RunDrawLeft,
    gameplan.RunDrawRight
  ];
  
  const optionPlays = [
    gameplan.ReadOptionLeft,
    gameplan.ReadOptionRight,
    gameplan.SpeedOptionLeft,
    gameplan.SpeedOptionRight,
    gameplan.InvertedOptionLeft,
    gameplan.InvertedOptionRight,
    gameplan.TripleOptionLeft,
    gameplan.TripleOptionRight
  ];
  
  for (const play of runPlays) {
    if (play > maxNormalRun) return false;
  }
  
  for (const play of drawPlays) {
    if (play > maxDraw) return false;
  }
  
  for (const play of optionPlays) {
    if (play > maxNormalRun) return false;
  }
  
  return true;
};

export const validatePassPlayDistribution = (gameplan: GameplanData): boolean => {
  const scheme = gameplan.OffensiveScheme;
  
  switch (scheme) {
    case 'Air Raid':
    case 'Vertical':
    case 'West Coast':
    case 'Run and Shoot':
      if (gameplan.PassQuick > 50) return false;
      if (gameplan.PassShort + gameplan.PassPAShort > 50) return false;
      if (gameplan.PassLong + gameplan.PassPALong > 50) return false;
      if (gameplan.PassScreen > 20) return false;
      break;
      
    case 'Pro':
    case 'Power Run':
    case 'I Option':
      if (gameplan.PassQuick > 45) return false;
      if (gameplan.PassShort > 45) return false;
      if (gameplan.PassLong > 45) return false;
      if (gameplan.PassScreen > 20) return false;
      if (gameplan.PassPAShort > 20) return false;
      if (gameplan.PassPALong > 20) return false;
      break;
      
    case 'Double Wing Option':
    case 'Wing-T':
    case 'Flexbone':
    case 'Wishbone':
      if (gameplan.PassQuick > 50) return false;
      if (gameplan.PassShort > 50) return false;
      if (gameplan.PassLong > 50) return false;
      if (gameplan.PassScreen > 20) return false;
      if (gameplan.PassPAShort > 30) return false;
      if (gameplan.PassPALong > 30) return false;
      break;
      
    case 'Spread Option':
    case 'Pistol':
      if (gameplan.PassQuick > 50) return false;
      if (gameplan.PassShort > 50) return false;
      if (gameplan.PassLong > 50) return false;
      if (gameplan.PassScreen > 20) return false;
      if (gameplan.PassPAShort > 25) return false;
      if (gameplan.PassPALong > 25) return false;
      break;
      
    default:
      break;
  }
  
  return true;
};

export const getDefensivePositions = (positions: string[]): string[] => {
  const lines: string[] = [];
  let currentLine: string[] = [];
  
  positions.forEach(item => {
    if (item === '\n') {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
    } else {
      currentLine.push(item);
    }
  });
  
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }
  
  return lines;
};

export const validateWeightDistribution = (weight: number): boolean => {
  return weight >= 0 && weight <= 10;
};

export const validatePlayTypeDistribution = (
  weight: number, 
  min: number, 
  max: number
): boolean => {
  return weight >= min && weight <= max;
};

export const validateFormationWeight = (weight: number): boolean => {
  return weight >= 0 && weight <= 50;
};

export const checkDistributionInUnusedWeight = (
  formationWeight: number,
  traditionalRun: number,
  optionRun: number,
  rpo: number,
  pass: number
): boolean => {
  if (formationWeight === 0 && (traditionalRun > 0 || optionRun > 0 || rpo > 0 || pass > 0)) {
    return false;
  }
  return true;
};

export const validateTotalDistribution = (total: number): boolean => {
  return total === 100;
};

export const getSchemeRanges = (schemeName: string): SchemeData['Ranges'] | null => {
  const scheme = FormationMap[schemeName];
  return scheme ? scheme.Ranges : null;
};

export const validateGameplan = (gameplan: GameplanData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const scheme = FormationMap[gameplan.OffensiveScheme];
  
  if (!scheme) {
    errors.push({
      field: 'OffensiveScheme',
      message: 'Invalid offensive scheme selected',
      severity: 'error'
    });
    return errors;
  }
  
  const { Ranges } = scheme;
  
  const formationWeights = [
    gameplan.OffForm1TraditionalRun + gameplan.OffForm1OptionRun + gameplan.OffForm1RPO + gameplan.OffForm1Pass,
    gameplan.OffForm2TraditionalRun + gameplan.OffForm2OptionRun + gameplan.OffForm2RPO + gameplan.OffForm2Pass,
    gameplan.OffForm3TraditionalRun + gameplan.OffForm3OptionRun + gameplan.OffForm3RPO + gameplan.OffForm3Pass,
    gameplan.OffForm4TraditionalRun + gameplan.OffForm4OptionRun + gameplan.OffForm4RPO + gameplan.OffForm4Pass,
    gameplan.OffForm5TraditionalRun + gameplan.OffForm5OptionRun + gameplan.OffForm5RPO + gameplan.OffForm5Pass
  ];
  
  const usedFormations = formationWeights.filter(weight => weight > 0).length;
  if (usedFormations < 2) {
    errors.push({
      field: 'formations',
      message: `You're currently weighted to use ${usedFormations} formations when the minimum is 2. Please increase the weight of unused formations.`,
      severity: 'error'
    });
  }
  
  formationWeights.forEach((weight, index) => {
    if (weight > 50) {
      errors.push({
        field: `OffForm${index + 1}`,
        message: `Offensive Formation ${index + 1} has a weight greater than 50. Please reduce to 50 or less.`,
        severity: 'error'
      });
    }
  });
  
  const totalFormationWeight = formationWeights.reduce((sum, weight) => sum + weight, 0);
  if (totalFormationWeight !== 100) {
    errors.push({
      field: 'formations',
      message: `Total Offensive Formation Ratio is ${totalFormationWeight}. Please make sure your allocation equals 100.`,
      severity: 'error'
    });
  }
  
  const tradRunTotal = gameplan.OffForm1TraditionalRun + gameplan.OffForm2TraditionalRun + 
                      gameplan.OffForm3TraditionalRun + gameplan.OffForm4TraditionalRun + 
                      gameplan.OffForm5TraditionalRun;
  const optRunTotal = gameplan.OffForm1OptionRun + gameplan.OffForm2OptionRun + 
                     gameplan.OffForm3OptionRun + gameplan.OffForm4OptionRun + 
                     gameplan.OffForm5OptionRun;
  const rpoTotal = gameplan.OffForm1RPO + gameplan.OffForm2RPO + 
                   gameplan.OffForm3RPO + gameplan.OffForm4RPO + 
                   gameplan.OffForm5RPO;
  const passTotal = gameplan.OffForm1Pass + gameplan.OffForm2Pass + 
                    gameplan.OffForm3Pass + gameplan.OffForm4Pass + 
                    gameplan.OffForm5Pass;
  
  if (!validatePlayTypeDistribution(tradRunTotal, Ranges.TraditionalRun.Min, Ranges.TraditionalRun.Max)) {
    errors.push({
      field: 'traditionalRun',
      message: `Traditional Run total is ${tradRunTotal}. Must be between ${Ranges.TraditionalRun.Min} and ${Ranges.TraditionalRun.Max}.`,
      severity: 'error'
    });
  }
  
  if (!validatePlayTypeDistribution(optRunTotal, Ranges.OptionRun.Min, Ranges.OptionRun.Max)) {
    errors.push({
      field: 'optionRun',
      message: `Option Run total is ${optRunTotal}. Must be between ${Ranges.OptionRun.Min} and ${Ranges.OptionRun.Max}.`,
      severity: 'error'
    });
  }
  
  if (!validatePlayTypeDistribution(rpoTotal, Ranges.RPO.Min, Ranges.RPO.Max)) {
    errors.push({
      field: 'rpo',
      message: `RPO total is ${rpoTotal}. Must be between ${Ranges.RPO.Min} and ${Ranges.RPO.Max}.`,
      severity: 'error'
    });
  }
  
  if (!validatePlayTypeDistribution(passTotal, Ranges.Pass.Min, Ranges.Pass.Max)) {
    errors.push({
      field: 'pass',
      message: `Pass total is ${passTotal}. Must be between ${Ranges.Pass.Min} and ${Ranges.Pass.Max}.`,
      severity: 'error'
    });
  }
  
  const playTypeSum = tradRunTotal + optRunTotal + rpoTotal + passTotal;
  if (playTypeSum !== 100) {
    errors.push({
      field: 'playTypes',
      message: `The sum of all Play Types across all formations is ${playTypeSum}. Please set this to 100.`,
      severity: 'error'
    });
  }
  
  if (!validateRunPlayDistribution(gameplan)) {
    errors.push({
      field: 'runPlays',
      message: 'Run Play Distribution is out of range. Please change ranges for all inside, outside, and power plays (50 max) and all draw plays (15 max)',
      severity: 'error'
    });
  }
  
  if (!validatePassPlayDistribution(gameplan)) {
    errors.push({
      field: 'passPlays',
      message: `Pass play distribution is invalid for ${gameplan.OffensiveScheme} scheme. Please check play type limits.`,
      severity: 'error'
    });
  }
  
  if (gameplan.OffensiveScheme === 'Air Raid' && gameplan.OffForm3TraditionalRun > 0) {
    errors.push({
      field: 'OffForm3TraditionalRun',
      message: 'The Empty Gun formation does not have a runningback and thus cannot support traditional run plays. Please set this value to 0.',
      severity: 'error'
    });
  }
  
  const runDistTotal = gameplan.RunOutsideLeft + gameplan.RunOutsideRight + 
                       gameplan.RunInsideLeft + gameplan.RunInsideRight + 
                       gameplan.RunPowerLeft + gameplan.RunPowerRight + 
                       gameplan.RunDrawLeft + gameplan.RunDrawRight;
  if (!validateTotalDistribution(runDistTotal)) {
    errors.push({
      field: 'runDistribution',
      message: `Total Run Play Distribution is ${runDistTotal}. Please make sure your allocation equals 100.`,
      severity: 'error'
    });
  }

  const passDistTotal = gameplan.PassQuick + gameplan.PassShort + gameplan.PassLong + 
                        gameplan.PassScreen + gameplan.PassPAShort + gameplan.PassPALong;
  if (!validateTotalDistribution(passDistTotal)) {
    errors.push({
      field: 'passDistribution',
      message: `Total Pass Play Distribution is ${passDistTotal}. Please make sure your allocation equals 100.`,
      severity: 'error'
    });
  }
  
  if (optRunTotal > 0) {
    const optionDistTotal = gameplan.ReadOptionLeft + gameplan.ReadOptionRight + 
                           gameplan.SpeedOptionLeft + gameplan.SpeedOptionRight + 
                           gameplan.InvertedOptionLeft + gameplan.InvertedOptionRight + 
                           gameplan.TripleOptionLeft + gameplan.TripleOptionRight;
    if (!validateTotalDistribution(optionDistTotal)) {
      errors.push({
        field: 'optionDistribution',
        message: `Total Option Run Distribution is ${optionDistTotal}. Please make sure your allocation equals 100.`,
        severity: 'error'
      });
    }
  }
  
  if (rpoTotal > 0) {
    const rpoDistTotal = gameplan.ChoiceOutside + gameplan.ChoiceInside + gameplan.ChoicePower + 
                         gameplan.PeekOutside + gameplan.PeekInside + gameplan.PeekPower;
    if (!validateTotalDistribution(rpoDistTotal)) {
      errors.push({
        field: 'rpoDistribution',
        message: `Total RPO Distribution is ${rpoDistTotal}. Please make sure your allocation equals 100.`,
        severity: 'error'
      });
    }
  }
  
  const defFormations = [
    gameplan.DefFormation1,
    gameplan.DefFormation2,
    gameplan.DefFormation3,
    gameplan.DefFormation4,
    gameplan.DefFormation5
  ];
  
  defFormations.forEach((formation, index) => {
    if (!formation || formation.length === 0) {
      errors.push({
        field: `DefFormation${index + 1}`,
        message: `Defensive Formation ${index + 1} was not selected. Please select a defensive formation.`,
        severity: 'error'
      });
    }
  });
  
  return errors;
};

export const parseFocusPlays = (focusPlaysString: string): string[] => {
  if (!focusPlaysString) return [];
  return focusPlaysString.split(',').filter(play => play.trim().length > 0);
};

export const stringifyFocusPlays = (focusPlays: string[]): string => {
  return focusPlays.join(',');
};

export const applyDefaultScheme = (
  gameplan: GameplanData, 
  schemeType: 'offense' | 'defense',
  defaultSchemes: any,
  opponentScheme?: string
): GameplanData => {
  const updatedGameplan = { ...gameplan };
  
  if (schemeType === 'offense') {
    const defaults = defaultSchemes[gameplan.OffensiveScheme];
    if (defaults) {
      Object.assign(updatedGameplan, defaults);
      updatedGameplan.PrimaryHB = 75;
    }
  } else if (schemeType === 'defense' && opponentScheme) {
    const defaults = defaultSchemes[gameplan.DefensiveScheme];
    const defaultsByOppScheme = defaults?.[opponentScheme];
    if (defaultsByOppScheme) {
      Object.assign(updatedGameplan, defaultsByOppScheme);
    }
  }
  
  return updatedGameplan;
};
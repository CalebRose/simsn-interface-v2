import { GameplanData } from '../Gameplan/GameplanHelper';

export interface PlayTypeTotals {
  traditionalRun: number;
  optionRun: number;
  rpo: number;
  pass: number;
}

interface MemoizedCalculations {
  playTypeTotals: PlayTypeTotals;
  formationWeights: number[];
  runDistribution: number;
  passDistribution: number;
  optionDistribution: number;
  rpoDistribution: number;
  targetingDistribution: number;
  runnerDistribution: number;
  totalFormationWeight: number;
  usedFormationsCount: number;
  totalPlayTypeWeight: number;
}

const memoCache = new Map<string, MemoizedCalculations>();

const createCacheKey = (gameplan: GameplanData): string => {
  const keyProps = [
    gameplan.OffForm1TraditionalRun, gameplan.OffForm1OptionRun, gameplan.OffForm1RPO, gameplan.OffForm1Pass,
    gameplan.OffForm2TraditionalRun, gameplan.OffForm2OptionRun, gameplan.OffForm2RPO, gameplan.OffForm2Pass,
    gameplan.OffForm3TraditionalRun, gameplan.OffForm3OptionRun, gameplan.OffForm3RPO, gameplan.OffForm3Pass,
    gameplan.OffForm4TraditionalRun, gameplan.OffForm4OptionRun, gameplan.OffForm4RPO, gameplan.OffForm4Pass,
    gameplan.OffForm5TraditionalRun, gameplan.OffForm5OptionRun, gameplan.OffForm5RPO, gameplan.OffForm5Pass,
    gameplan.RunOutsideLeft, gameplan.RunOutsideRight, gameplan.RunInsideLeft, gameplan.RunInsideRight,
    gameplan.RunPowerLeft, gameplan.RunPowerRight, gameplan.RunDrawLeft, gameplan.RunDrawRight,
    gameplan.PassQuick, gameplan.PassShort, gameplan.PassLong, gameplan.PassScreen, gameplan.PassPAShort, gameplan.PassPALong,
    gameplan.ReadOptionLeft, gameplan.ReadOptionRight, gameplan.SpeedOptionLeft, gameplan.SpeedOptionRight,
    gameplan.InvertedOptionLeft, gameplan.InvertedOptionRight, gameplan.TripleOptionLeft, gameplan.TripleOptionRight,
    gameplan.ChoiceOutside, gameplan.ChoiceInside, gameplan.ChoicePower, gameplan.PeekOutside, gameplan.PeekInside, gameplan.PeekPower,
    gameplan.TargetingWR1, gameplan.TargetingWR2, gameplan.TargetingWR3, gameplan.TargetingWR4, gameplan.TargetingWR5,
    gameplan.TargetingTE1, gameplan.TargetingTE2, gameplan.TargetingTE3, gameplan.TargetingRB1, gameplan.TargetingRB2, gameplan.TargetingFB1,
    gameplan.RunnerDistributionQB, gameplan.RunnerDistributionRB1, gameplan.RunnerDistributionRB2, gameplan.RunnerDistributionRB3,
    gameplan.RunnerDistributionFB1, gameplan.RunnerDistributionFB2, gameplan.RunnerDistributionWR
  ];
  return keyProps.join('|');
};

const getMemoizedCalculations = (gameplan: GameplanData): MemoizedCalculations => {
  const cacheKey = createCacheKey(gameplan);
  const cached = memoCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const formationWeights = [
    gameplan.OffForm1TraditionalRun + gameplan.OffForm1OptionRun + gameplan.OffForm1RPO + gameplan.OffForm1Pass,
    gameplan.OffForm2TraditionalRun + gameplan.OffForm2OptionRun + gameplan.OffForm2RPO + gameplan.OffForm2Pass,
    gameplan.OffForm3TraditionalRun + gameplan.OffForm3OptionRun + gameplan.OffForm3RPO + gameplan.OffForm3Pass,
    gameplan.OffForm4TraditionalRun + gameplan.OffForm4OptionRun + gameplan.OffForm4RPO + gameplan.OffForm4Pass,
    gameplan.OffForm5TraditionalRun + gameplan.OffForm5OptionRun + gameplan.OffForm5RPO + gameplan.OffForm5Pass
  ];
  
  const playTypeTotals = {
    traditionalRun: 
      gameplan.OffForm1TraditionalRun + gameplan.OffForm2TraditionalRun + 
      gameplan.OffForm3TraditionalRun + gameplan.OffForm4TraditionalRun + 
      gameplan.OffForm5TraditionalRun,
    optionRun: 
      gameplan.OffForm1OptionRun + gameplan.OffForm2OptionRun + 
      gameplan.OffForm3OptionRun + gameplan.OffForm4OptionRun + 
      gameplan.OffForm5OptionRun,
    rpo: 
      gameplan.OffForm1RPO + gameplan.OffForm2RPO + 
      gameplan.OffForm3RPO + gameplan.OffForm4RPO + 
      gameplan.OffForm5RPO,
    pass: 
      gameplan.OffForm1Pass + gameplan.OffForm2Pass + 
      gameplan.OffForm3Pass + gameplan.OffForm4Pass + 
      gameplan.OffForm5Pass
  };
  
  const calculations: MemoizedCalculations = {
    playTypeTotals,
    formationWeights,
    runDistribution: gameplan.RunOutsideLeft + gameplan.RunOutsideRight + 
                    gameplan.RunInsideLeft + gameplan.RunInsideRight + 
                    gameplan.RunPowerLeft + gameplan.RunPowerRight + 
                    gameplan.RunDrawLeft + gameplan.RunDrawRight,
    passDistribution: gameplan.PassQuick + gameplan.PassShort + gameplan.PassLong + 
                     gameplan.PassScreen + gameplan.PassPAShort + gameplan.PassPALong,
    optionDistribution: gameplan.ReadOptionLeft + gameplan.ReadOptionRight + 
                       gameplan.SpeedOptionLeft + gameplan.SpeedOptionRight + 
                       gameplan.InvertedOptionLeft + gameplan.InvertedOptionRight + 
                       gameplan.TripleOptionLeft + gameplan.TripleOptionRight,
    rpoDistribution: gameplan.ChoiceOutside + gameplan.ChoiceInside + gameplan.ChoicePower + 
                    gameplan.PeekOutside + gameplan.PeekInside + gameplan.PeekPower,
    targetingDistribution: gameplan.TargetingWR1 + gameplan.TargetingWR2 + gameplan.TargetingWR3 + 
                          gameplan.TargetingWR4 + gameplan.TargetingWR5 + gameplan.TargetingTE1 + 
                          gameplan.TargetingTE2 + gameplan.TargetingTE3 + gameplan.TargetingRB1 + 
                          gameplan.TargetingRB2 + gameplan.TargetingFB1,
    runnerDistribution: gameplan.RunnerDistributionQB + gameplan.RunnerDistributionRB1 + 
                       gameplan.RunnerDistributionRB2 + gameplan.RunnerDistributionRB3 + 
                       gameplan.RunnerDistributionFB1 + gameplan.RunnerDistributionFB2 + 
                       gameplan.RunnerDistributionWR,
    totalFormationWeight: formationWeights.reduce((sum, weight) => sum + weight, 0),
    usedFormationsCount: formationWeights.filter(weight => weight > 0).length,
    totalPlayTypeWeight: playTypeTotals.traditionalRun + playTypeTotals.optionRun + playTypeTotals.rpo + playTypeTotals.pass
  };
  
  memoCache.set(cacheKey, calculations);
  
  if (memoCache.size > 100) {
    const firstKey = memoCache.keys().next().value;
    memoCache.delete(firstKey);
  }
  
  return calculations;
};

export const calculatePlayTypeTotals = (gameplan: GameplanData): PlayTypeTotals => {
  return getMemoizedCalculations(gameplan).playTypeTotals;
};

export const calculateFormationWeights = (gameplan: GameplanData): number[] => {
  return getMemoizedCalculations(gameplan).formationWeights;
};

export const calculateRunDistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).runDistribution;
};

export const calculatePassDistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).passDistribution;
};

export const calculateOptionDistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).optionDistribution;
};

export const calculateRPODistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).rpoDistribution;
};

export const calculateTargetingDistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).targetingDistribution;
};

export const calculateRunnerDistributionTotal = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).runnerDistribution;
};

export const calculateTotalFormationWeight = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).totalFormationWeight;
};

export const calculateUsedFormationsCount = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).usedFormationsCount;
};

export const calculateTotalPlayTypeWeight = (gameplan: GameplanData): number => {
  return getMemoizedCalculations(gameplan).totalPlayTypeWeight;
};

export const calculateAllDistributionTotals = (gameplan: GameplanData) => {
  const memoized = getMemoizedCalculations(gameplan);
  return {
    playTypes: memoized.playTypeTotals,
    formationWeights: memoized.formationWeights,
    runDistribution: memoized.runDistribution,
    passDistribution: memoized.passDistribution,
    optionDistribution: memoized.optionDistribution,
    rpoDistribution: memoized.rpoDistribution,
    targetingDistribution: memoized.targetingDistribution,
    runnerDistribution: memoized.runnerDistribution,
    totalFormationWeight: memoized.totalFormationWeight,
    usedFormationsCount: memoized.usedFormationsCount,
    totalPlayTypeWeight: memoized.totalPlayTypeWeight
  };
};

export const getPassTypeRanges = (passType: string): { scheme: string; max: number; note?: string }[] => {
  const ranges = [];
  
  switch (passType) {
    case 'Quick':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 50 },
        { scheme: 'Pro, Power Run, I Option', max: 45 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 50 },
        { scheme: 'Spread Option, Pistol', max: 50 }
      );
      break;
    case 'Short':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 50, note: 'Combined with Play Action Short: max 50' },
        { scheme: 'Pro, Power Run, I Option', max: 45 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 50 },
        { scheme: 'Spread Option, Pistol', max: 50 }
      );
      break;
    case 'Long':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 50, note: 'Combined with Play Action Long: max 50' },
        { scheme: 'Pro, Power Run, I Option', max: 45 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 50 },
        { scheme: 'Spread Option, Pistol', max: 50 }
      );
      break;
    case 'Screen':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 20 },
        { scheme: 'Pro, Power Run, I Option', max: 20 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 20 },
        { scheme: 'Spread Option, Pistol', max: 20 }
      );
      break;
    case 'PlayActionShort':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 50, note: 'Combined with Short: max 50' },
        { scheme: 'Pro, Power Run, I Option', max: 20 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 30 },
        { scheme: 'Spread Option, Pistol', max: 25 }
      );
      break;
    case 'PlayActionLong':
      ranges.push(
        { scheme: 'Air Raid, Vertical, West Coast, Run and Shoot', max: 50, note: 'Combined with Long: max 50' },
        { scheme: 'Pro, Power Run, I Option', max: 20 },
        { scheme: 'Double Wing Option, Wing-T, Flexbone, Wishbone', max: 30 },
        { scheme: 'Spread Option, Pistol', max: 25 }
      );
      break;
    default:
      break;
  }
  
  return ranges;
};
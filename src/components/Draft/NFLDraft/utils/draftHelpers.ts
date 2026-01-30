import { NFLDraftPick, NFLDraftee } from '../../../../models/footballModels';

export interface DraftState {
  currentPick: number;
  currentRound: number;
  isPaused: boolean;
  timeLeft: number;
  allDraftPicks: { [round: number]: NFLDraftPick[] };
  draftedPlayers: Set<number>;
}

export const getCurrentPickFromState = (
  allDraftPicks: { [round: number]: NFLDraftPick[] },
  currentPick: number,
  currentRound: number
): NFLDraftPick | null => {
  const roundPicks = allDraftPicks[currentRound];
  if (!roundPicks) return null;
  
  return roundPicks.find(pick => pick.DraftNumber === currentPick) || null;
};

export const getUpcomingPicks = (
  allDraftPicks: { [round: number]: NFLDraftPick[] },
  currentPick: number,
  count: number = 10
): NFLDraftPick[] => {
  const upcomingPicks: NFLDraftPick[] = [];
  let pickNumber = currentPick;
  let round = 1;

  for (let r = 1; r <= 7; r++) {
    const roundPicks = allDraftPicks[r] || [];
    if (roundPicks.some(p => p.DraftNumber === currentPick)) {
      round = r;
      break;
    }
  }

  while (upcomingPicks.length < count && round <= 7) {
    const roundPicks = allDraftPicks[round] || [];
    for (const pick of roundPicks) {
      if (pick.DraftNumber >= pickNumber) {
        upcomingPicks.push(pick);
        if (upcomingPicks.length >= count) break;
      }
    }
    round++;
  }

  return upcomingPicks;
};

export const getRecentPicks = (
  allDraftPicks: { [round: number]: NFLDraftPick[] },
  currentPick: number,
  count: number = 15
): NFLDraftPick[] => {
  const recentPicks: NFLDraftPick[] = [];
  
  for (let round = 1; round <= 7; round++) {
    const roundPicks = allDraftPicks[round] || [];
    for (const pick of roundPicks) {
      if (pick.DraftNumber < currentPick && pick.SelectedPlayerID) {
        recentPicks.push(pick);
      }
    }
  }

  return recentPicks
    .sort((a, b) => b.DraftNumber - a.DraftNumber)
    .slice(0, count);
};

export const getTimeForPick = (pickNumber: number): number => {
  if (pickNumber <= 32) return 300;
  if (pickNumber <= 130) return 180;
  return 120;
};

export const getDraftedPlayerIds = (
  allDraftPicks: { [round: number]: NFLDraftPick[] }
): Set<number> => {
  const draftedIds = new Set<number>();
  
  for (let round = 1; round <= 7; round++) {
    const roundPicks = allDraftPicks[round] || [];
    for (const pick of roundPicks) {
      if (pick.SelectedPlayerID) {
        draftedIds.add(pick.SelectedPlayerID);
      }
    }
  }
  
  return draftedIds;
};

export const getPicksByTeam = (
  allDraftPicks: { [round: number]: NFLDraftPick[] },
  teamId: number
): NFLDraftPick[] => {
  const teamPicks: NFLDraftPick[] = [];
  
  for (let round = 1; round <= 7; round++) {
    const roundPicks = allDraftPicks[round] || [];
    teamPicks.push(...roundPicks.filter(pick => pick.TeamID === teamId));
  }
  
  return teamPicks.sort((a, b) => a.DraftNumber - b.DraftNumber);
};

export const formatDraftPosition = (pick: NFLDraftPick): string => {
  const round = pick.DraftRound;
  const pickInRound = pick.DraftNumber - ((round - 1) * 32);
  
  const suffix = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'st';
    if (n % 10 === 2 && n % 100 !== 12) return 'nd';
    if (n % 10 === 3 && n % 100 !== 13) return 'rd';
    return 'th';
  };
  
  return `${round}${suffix(round)} Round, ${pickInRound}${suffix(pickInRound)} Pick (#${pick.DraftNumber} Overall)`;
};

export const isPickTradeable = (pick: NFLDraftPick, currentPick: number): boolean => {
  if (pick.SelectedPlayerID) return false;
  if (pick.DraftNumber <= currentPick) return false;
  
  return true;
};

export const calculateDraftValue = (pick: NFLDraftPick): number => {
  const baseValues = [
    3000, 2600, 2200, 1800, 1700, 1600, 1500, 1400, 1350, 1300,
    1250, 1200, 1150, 1100, 1050, 1000, 950, 900, 875, 850,
    800, 780, 760, 740, 720, 700, 680, 660, 640, 620,
    600, 590
  ];
  
  const round = pick.DraftRound;
  const pickInRound = pick.DraftNumber - ((round - 1) * 32);
  
  if (round === 1 && pickInRound <= 32) {
    return baseValues[pickInRound - 1] || 580;
  }
  
  const roundMultiplier = Math.max(0.1, 1 - (round - 1) * 0.15);
  const baseValue = Math.max(100, 600 - (pick.DraftNumber - 33) * 8);
  
  return Math.round(baseValue * roundMultiplier);
};

export const sortPlayersByDraftRank = (players: NFLDraftee[]): NFLDraftee[] => {
  return [...players].sort((a, b) => {
    if (b.Overall !== a.Overall) {
      return b.Overall - a.Overall;
    }
    
    const positionOrder: { [key: string]: number } = {
      'QB': 1, 'WR': 2, 'RB': 3, 'TE': 4, 'OT': 5, 'OG': 6, 'C': 7,
      'DE': 8, 'DT': 9, 'OLB': 10, 'ILB': 11, 'CB': 12, 'S': 13,
      'K': 14, 'P': 15
    };
    
    const aOrder = positionOrder[a.Position] || 99;
    const bOrder = positionOrder[b.Position] || 99;
    
    return aOrder - bOrder;
  });
};

export const getScoutableAttributes = (position: string, archetype: string): string[] => {
  switch (position) {
    case 'QB':
      return [
        'Throw Power',
        'Throw Accuracy',
        'Football IQ',
        'Agility',
        'Speed',
        'Stamina',
        'Potential Grade'
      ];
    case 'RB':
      return [
        'Speed',
        'Agility',
        'Carrying',
        'Strength',
        'Football IQ',
        'Catching',
        'Potential Grade'
      ];
    case 'FB':
      return [
        'Speed',
        'Agility',
        'Carrying',
        'Strength',
        'Pass Block',
        'Run Block',
        'Potential Grade'
      ];
    case 'TE':
      return [
        'Speed',
        'Agility',
        'Carrying',
        'Catching',
        'Route Running',
        'Strength',
        'Pass Block',
        'Run Block',
        'Potential Grade'
      ];
    case 'WR':
      return [
        'Speed',
        'Agility',
        'Carrying',
        'Catching',
        'Route Running',
        'Potential Grade'
      ];
    case 'OG':
    case 'OT':
    case 'C':
      return [
        'Agility',
        'Strength',
        'Pass Block',
        'Run Block',
        'Football IQ',
        'Potential Grade'
      ];
    case 'DT':
    case 'DE':
      return [
        'Speed',
        'Agility',
        'Tackle',
        'Strength',
        'Pass Rush',
        'Run Defense',
        'Football IQ',
        'Potential Grade'
      ];
    case 'OLB':
    case 'ILB':
      return [
        'Speed',
        'Agility',
        'Tackle',
        'Pass Rush',
        'Run Defense',
        'Man Coverage',
        'Zone Coverage',
        'Football IQ',
        'Potential Grade'
      ];
    case 'CB':
    case 'FS':
    case 'SS':
    case 'S':
      return [
        'Speed',
        'Agility',
        'Tackle',
        'Strength',
        'Man Coverage',
        'Zone Coverage',
        'Catching',
        'Football IQ',
        'Potential Grade'
      ];
    case 'P':
    case 'K':
      return [
        'Punt Power',
        'Punt Accuracy',
        'Kick Power',
        'Kick Accuracy',
        'Football IQ',
        'Potential Grade'
      ];
    case 'ATH':
      if (archetype === 'Field General') {
        return [
          'Football IQ',
          'Throw Power',
          'Throw Accuracy',
          'Speed',
          'Agility',
          'Man Coverage',
          'Zone Coverage',
          'Potential Grade'
        ];
      } else if (archetype === 'Triple-Threat') {
        return [
          'Football IQ',
          'Throw Power',
          'Throw Accuracy',
          'Speed',
          'Agility',
          'Carrying',
          'Catching',
          'Route Running',
          'Potential Grade'
        ];
      } else if (archetype === 'Wingback') {
        return [
          'Football IQ',
          'Speed',
          'Agility',
          'Carrying',
          'Catching',
          'Route Running',
          'Man Coverage',
          'Zone Coverage',
          'Potential Grade'
        ];
      } else if (archetype === 'Slotback') {
        return [
          'Football IQ',
          'Strength',
          'Agility',
          'Carrying',
          'Catching',
          'Route Running',
          'Pass Block',
          'Run Block',
          'Potential Grade'
        ];
      } else if (archetype === 'Lineman') {
        return [
          'Football IQ',
          'Strength',
          'Agility',
          'Pass Block',
          'Run Block',
          'Tackle',
          'Pass Rush',
          'Run Defense',
          'Potential Grade'
        ];
      } else if (
        archetype === 'Strongside' ||
        archetype === 'Weakside' ||
        archetype === 'Bandit'
      ) {
        return [
          'Football IQ',
          'Speed',
          'Agility',
          'Tackle',
          'Pass Rush',
          'Run Defense',
          'Man Coverage',
          'Zone Coverage',
          'Potential Grade'
        ];
      } else if (archetype === 'Return Specialist') {
        return [
          'Football IQ',
          'Speed',
          'Agility',
          'Catching',
          'Carrying',
          'Route Running',
          'Tackle',
          'Potential Grade'
        ];
      } else if (archetype === 'Soccer Player') {
        return [
          'Football IQ',
          'Speed',
          'Agility',
          'Catching',
          'Punt Power',
          'Punt Accuracy',
          'Kick Power',
          'Kick Accuracy',
          'Potential Grade'
        ];
      }
      return [];

    default:
      return [];
  }
};

export const getAttributeFieldName = (displayName: string): string => {
  const attributeMap: { [key: string]: string } = {
    'Football IQ': 'FootballIQ',
    'Throw Power': 'ThrowPower',
    'Throw Accuracy': 'ThrowAccuracy',
    'Route Running': 'RouteRunning',
    'Pass Block': 'PassBlock',
    'Run Block': 'RunBlock',
    'Pass Rush': 'PassRush',
    'Run Defense': 'RunDefense',
    'Man Coverage': 'ManCoverage',
    'Zone Coverage': 'ZoneCoverage',
    'Punt Power': 'PuntPower',
    'Punt Accuracy': 'PuntAccuracy',
    'Kick Power': 'KickPower',
    'Kick Accuracy': 'KickAccuracy',
    'Potential Grade': 'PotentialGrade'
  };
  
  return attributeMap[displayName] || displayName;
};

export const getAttributeShowProperty = (displayName: string): string => {
  const showAttributeMap: { [key: string]: string } = {
    'Football IQ': 'ShowAttribute1',
    'Speed': 'ShowAttribute2',
    'Agility': 'ShowAttribute3',
    'Strength': 'ShowAttribute4',
    'Stamina': 'ShowAttribute5',
    'Injury': 'ShowAttribute6',
    'Potential Grade': 'ShowPotential'
  };
  
  const fieldName = getAttributeFieldName(displayName);

  if (showAttributeMap[displayName]) {
    return showAttributeMap[displayName];
  }
  
  const positionSpecificAttributes = [
    'ThrowPower', 'ThrowAccuracy', 'Carrying', 'Catching', 'RouteRunning',
    'PassBlock', 'RunBlock', 'Tackle', 'PassRush', 'RunDefense',
    'ManCoverage', 'ZoneCoverage', 'PuntPower', 'PuntAccuracy',
    'KickPower', 'KickAccuracy'
  ];
  
  const index = positionSpecificAttributes.indexOf(fieldName);
  if (index !== -1) {
    return `ShowAttribute${7 + index}`;
  }
  
  return 'ShowAttribute7';
};

export const getScoutingCost = (attributeName: string): number => {
  return attributeName === 'Potential Grade' ? 10 : 4;
};
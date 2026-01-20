import { DraftablePlayer } from '../../../../models/hockeyModels';

export const getHockeyScoutableAttributes = (position: string, archetype: string): string[] => {
  switch (position) {
    case 'C': // Center
      return [
        'Faceoffs',
        'Passing',
        'Puck Handling',
        'Close Shot Accuracy',
        'Close Shot Power',
        'Strength',
        'Agility',
        'Potential Grade'
      ];
    case 'LW': // Left Wing
    case 'RW': // Right Wing
      return [
        'Long Shot Accuracy',
        'Long Shot Power',
        'Close Shot Accuracy',
        'Close Shot Power',
        'One Timer',
        'Puck Handling',
        'Agility',
        'Potential Grade'
      ];
    case 'LD': // Left Defenseman
    case 'RD': // Right Defenseman
      return [
        'Body Checking',
        'Stick Checking',
        'Shot Blocking',
        'Passing',
        'Long Shot Accuracy',
        'Long Shot Power',
        'Strength',
        'Potential Grade'
      ];
    case 'G': // Goalie
      return [
        'Goalkeeping',
        'Goalie Vision',
        'Goalie Rebound Control',
        'Goalie Stamina',
        'Agility',
        'Potential Grade'
      ];
    default:
      return [
        'Agility',
        'Strength',
        'Passing',
        'Puck Handling',
        'Close Shot Accuracy',
        'Long Shot Accuracy',
        'Potential Grade'
      ];
  }
};

export const getHockeyAttributeFieldName = (displayName: string): string => {
  const attributeMap: { [key: string]: string } = {
    'Faceoffs': 'Faceoffs',
    'Long Shot Accuracy': 'LongShotAccuracy',
    'Long Shot Power': 'LongShotPower',
    'Close Shot Accuracy': 'CloseShotAccuracy',
    'Close Shot Power': 'CloseShotPower',
    'One Timer': 'OneTimer',
    'Passing': 'Passing',
    'Puck Handling': 'PuckHandling',
    'Strength': 'Strength',
    'Body Checking': 'BodyChecking',
    'Stick Checking': 'StickChecking',
    'Shot Blocking': 'ShotBlocking',
    'Goalkeeping': 'Goalkeeping',
    'Goalie Vision': 'GoalieVision',
    'Goalie Rebound Control': 'GoalieReboundControl',
    'Goalie Stamina': 'GoalieStamina',
    'Discipline': 'Discipline',
    'Aggression': 'Aggression',
    'Stamina': 'Stamina',
    'Agility': 'Agility',
    'Potential Grade': 'PotentialGrade'
  };

  return attributeMap[displayName] || displayName;
};

export const getHockeyAttributeShowProperty = (displayName: string): string => {
  const showAttributeMap: { [key: string]: string } = {
    'Agility': 'ShowAttribute1',
    'Strength': 'ShowAttribute2',
    'Stamina': 'ShowAttribute3',
    'Discipline': 'ShowAttribute4',
    'Aggression': 'ShowAttribute5',
    'Potential Grade': 'ShowPotential'
  };

  if (showAttributeMap[displayName]) {
    return showAttributeMap[displayName];
  }

  const positionSpecificAttributes = [
    'Faceoffs', 'LongShotAccuracy', 'LongShotPower', 'CloseShotAccuracy',
    'CloseShotPower', 'OneTimer', 'Passing', 'PuckHandling',
    'BodyChecking', 'StickChecking', 'ShotBlocking',
    'Goalkeeping', 'GoalieVision', 'GoalieReboundControl', 'GoalieStamina'
  ];

  const fieldName = getHockeyAttributeFieldName(displayName);
  const index = positionSpecificAttributes.indexOf(fieldName);

  if (index !== -1) {
    return `ShowAttribute${6 + (index % 3)}`;
  }

  return 'ShowAttribute6';
};

export const getHockeyScoutingCost = (attributeName: string): number => {
  if (attributeName === 'Potential Grade') return 10;

  const keyAttributes = [
    'Faceoffs', 'Goalkeeping', 'Body Checking', 'Long Shot Power'
  ];
  if (keyAttributes.includes(attributeName)) return 6;

  return 4;
};

export const sortHockeyPlayersByDraftRank = (players: DraftablePlayer[]): DraftablePlayer[] => {
  return [...players].sort((a, b) => {
    if (b.Overall !== a.Overall) {
      return b.Overall - a.Overall;
    }

    const positionOrder: { [key: string]: number } = {
      'C': 1, 'LW': 2, 'RW': 3, 'LD': 4, 'RD': 5, 'G': 6
    };

    const aOrder = positionOrder[a.Position] || 99;
    const bOrder = positionOrder[b.Position] || 99;

    return aOrder - bOrder;
  });
};

export const getHockeyTimeForPick = (pickNumber: number, picksPerRound: number = 24): number => {
  const round = Math.ceil(pickNumber / picksPerRound);
  if (round === 1) return 300;
  if (round <= 4) return 180;
  return 120;
};

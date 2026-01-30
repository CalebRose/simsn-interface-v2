import { DraftablePlayer } from "../../../../models/hockeyModels";

export const getHockeyScoutableAttributes = (
  position: string,
  archetype: string,
): string[] => {
  switch (position) {
    case "C": // Center
      return [
        "Faceoffs",
        "Passing",
        "Puck Handling",
        "Close Shot Accuracy",
        "Close Shot Power",
        "Strength",
        "Agility",
        "Faceoffs Potential",
        "Passing Potential",
        "Puck Handling Potential",
        "Close Shot Accuracy Potential",
        "Close Shot Power Potential",
        "Strength Potential",
        "Agility Potential",
      ];
    case "LW": // Left Wing
    case "RW": // Right Wing
    case "F": // Forward
      return [
        "Long Shot Accuracy",
        "Long Shot Power",
        "Close Shot Accuracy",
        "Close Shot Power",
        "One Timer",
        "Puck Handling",
        "Agility",
        "Long Shot Accuracy Potential",
        "Long Shot Power Potential",
        "Close Shot Accuracy Potential",
        "Close Shot Power Potential",
        "Puck Handling Potential",
        "Agility Potential",
      ];
    case "LD": // Left Defenseman
    case "RD": // Right Defenseman
    case "D":
      return [
        "Body Checking",
        "Stick Checking",
        "Shot Blocking",
        "Passing",
        "Long Shot Accuracy",
        "Long Shot Power",
        "Strength",
        "Body Checking Potential",
        "Stick Checking Potential",
        "Shot Blocking Potential",
        "Passing Potential",
        "Long Shot Accuracy Potential",
        "Long Shot Power Potential",
        "Strength Potential",
      ];
    case "G": // Goalie
      return [
        "Goalkeeping",
        "Goalie Vision",
        "Agility",
        "Strength",
        "Goalkeeping Potential",
        "Goalie Vision Potential",
        "Agility Potential",
        "Strength Potential",
      ];
    default:
      return [
        "Agility",
        "Strength",
        "Passing",
        "Puck Handling",
        "Close Shot Accuracy",
        "Long Shot Accuracy",
        "Potential Grade",
      ];
  }
};

export const getHockeyAttributeFieldName = (displayName: string): string => {
  const attributeMap: { [key: string]: string } = {
    Faceoffs: "Faceoffs",
    "Long Shot Accuracy": "LongShotAccuracy",
    "Long Shot Power": "LongShotPower",
    "Close Shot Accuracy": "CloseShotAccuracy",
    "Close Shot Power": "CloseShotPower",
    "One Timer": "OneTimer",
    Passing: "Passing",
    "Puck Handling": "PuckHandling",
    Strength: "Strength",
    "Body Checking": "BodyChecking",
    "Stick Checking": "StickChecking",
    "Shot Blocking": "ShotBlocking",
    Goalkeeping: "Goalkeeping",
    "Goalie Vision": "GoalieVision",
    "Goalie Rebound Control": "GoalieReboundControl",
    "Goalie Stamina": "GoalieStamina",
    Discipline: "Discipline",
    Aggression: "Aggression",
    Stamina: "Stamina",
    Agility: "Agility",
    "Potential Grade": "PotentialGrade",
    "Faceoffs Potential": "FaceoffsPotential",
    "Long Shot Accuracy Potential": "LongShotAccuracyPotential",
    "Long Shot Power Potential": "LongShotPowerPotential",
    "Close Shot Accuracy Potential": "CloseShotAccuracyPotential",
    "Close Shot Power Potential": "CloseShotPowerPotential",
    "One Timer Potential": "OneTimerPotential",
    "Passing Potential": "PassingPotential",
    "Puck Handling Potential": "PuckHandlingPotential",
    "Strength Potential": "StrengthPotential",
    "Body Checking Potential": "BodyCheckingPotential",
    "Stick Checking Potential": "StickCheckingPotential",
    "Shot Blocking Potential": "ShotBlockingPotential",
    "Goalkeeping Potential": "GoalkeepingPotential",
    "Goalie Vision Potential": "GoalieVisionPotential",
    "Goalie Rebound Control Potential": "GoalieReboundControlPotential",
    "Goalie Stamina Potential": "GoalieStaminaPotential",
  };

  return attributeMap[displayName] || displayName;
};

export const getHockeyAttributeShowProperty = (
  displayName: string,
  showPotentialGrade: boolean,
  index: number,
): string => {
  const num = index + 1;
  if (showPotentialGrade) {
    return `ShowPotAttribute${num}`;
  }
  return `ShowAttribute${num}`;
};

export const getHockeyScoutingCost = (attributeName: string): number => {
  if (attributeName.includes("Potential")) return 6;

  const keyAttributes = [
    "Faceoffs",
    "Goalkeeping",
    "Goalie Vision",
    "Body Checking",
    "Long Shot Power",
    "Close Shot Power",
  ];
  if (keyAttributes.includes(attributeName)) return 5;

  return 4;
};

export const sortHockeyPlayersByDraftRank = (
  players: DraftablePlayer[],
): DraftablePlayer[] => {
  return [...players].sort((a, b) => {
    if (b.Overall !== a.Overall) {
      return b.Overall - a.Overall;
    }

    const positionOrder: { [key: string]: number } = {
      C: 1,
      F: 2,
      LW: 2,
      RW: 3,
      LD: 4,
      RD: 5,
      D: 4,
      G: 6,
    };

    const aOrder = positionOrder[a.Position] || 99;
    const bOrder = positionOrder[b.Position] || 99;

    return aOrder - bOrder;
  });
};

export const getHockeyTimeForPick = (
  pickNumber: number,
  picksPerRound: number = 24,
): number => {
  const round = Math.ceil(pickNumber / picksPerRound);
  if (round === 1) return 300;
  if (round <= 4) return 180;
  return 120;
};

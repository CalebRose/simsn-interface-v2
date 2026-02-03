import { DocumentData } from "firebase/firestore";
import { DraftablePlayer } from "../../../../models/hockeyModels";
import { useMemo } from "react";
import { DraftPick } from "../../common";
import {
  League,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../../../_constants/constants";

export const getDraftRoundOptions = () => {
  const options: { label: string; value: string }[] = [];
  const totalNumberOfRounds = 7; // 7 rounds × 24 teams
  for (let i = 1; i <= totalNumberOfRounds; i++) {
    options.push({ label: `Round ${i}`, value: i.toString() });
  }

  return options;
};

export const getDraftPickOptions = () => {
  const options: { label: string; value: string }[] = [];
  const totalNumberOfPicks = 24; // 1 round × 24 teams
  for (let i = 1; i <= totalNumberOfPicks; i++) {
    options.push({ label: `Pick ${i}`, value: i.toString() });
  }

  return options;
};

export const GetPicksByCurrentRound = (
  draftList: Record<number, DraftPick[]>,
  currentRound: number,
) => {
  return useMemo(() => {
    if (draftList && currentRound > 0) {
      const round = draftList[currentRound];
      if (round) return round;
    }
    return [];
  }, [draftList, currentRound]);
};

export const GetCurrentDraftPickIdx = (
  allDraftPicks: Record<number, DraftPick[]>,
  currentPick: number,
  currentRound: number,
  league: League,
) => {
  return useMemo(() => {
    if (allDraftPicks) {
      const roundOfPicks = allDraftPicks[currentRound];
      const idx = roundOfPicks.findIndex((x) => x.DraftNumber === currentPick);
      if (idx > -1) return idx;

      switch (league) {
        case SimPHL:
        case SimNFL:
          if (currentRound + 1 < 8) {
            const nextRoundOfPicks = allDraftPicks[currentRound + 1];
            return nextRoundOfPicks.findIndex(
              (x) => x.DraftNumber === currentPick,
            );
          }
          break;
        case SimNBA:
          if (currentRound + 1 < 3) {
            const nextRoundOfPicks = allDraftPicks[currentRound + 1];
            return nextRoundOfPicks.findIndex(
              (x) => x.DraftNumber === currentPick,
            );
          }
          break;
        default:
          break;
      }
      if (currentRound + 1 < 8) {
        const nextRoundOfPicks = allDraftPicks[currentRound + 1];
        return nextRoundOfPicks.findIndex((x) => x.DraftNumber === currentPick);
      }
    }
    return -1;
  }, [allDraftPicks, currentPick, currentRound, league]);
};

export const GetCurrentDraftPick = (
  allDraftPicks: Record<number, DraftPick[]>,
  currentDraftPickIdx: number,
  currentPick: number,
  currentRound: number,
) => {
  return useMemo(() => {
    if (allDraftPicks && currentRound > 0 && currentDraftPickIdx >= 0) {
      const roundOfPicks = allDraftPicks[currentRound];
      let indexCheck = roundOfPicks.findIndex(
        (x) => x.DraftNumber === currentPick,
      );
      if (indexCheck > -1) {
        return roundOfPicks[currentDraftPickIdx];
      }
      const nextRoundOfPicks = allDraftPicks[currentRound + 1];
      return nextRoundOfPicks[currentDraftPickIdx];
    }
    return null;
  }, [allDraftPicks, currentDraftPickIdx, currentRound]);
};

export const GetPauseTimer = (
  data: any,
  timeLeft: number,
  updateData: (newData: Partial<DocumentData>) => Promise<void>,
) => {
  const newData = { ...data, isPaused: true, seconds: timeLeft };
  updateData(newData);
};

export const GetResetTimer = (
  data: any,
  updateData: (newData: Partial<DocumentData>) => Promise<void>,
) => {
  const { currentPick } = data;
  let seconds = 0;
  if (currentPick < 33) {
    seconds = 300;
  } else if (currentPick < 131) {
    seconds = 180;
  } else {
    seconds = 120;
  }

  // Current time + 4 minutes/3 minutes/2 minutes
  const endTime = new Date(Date.now() + seconds * 1000);
  const newData = {
    ...data,
    endTime,
    isPaused: true,
    seconds,
  };
  updateData(newData);
};

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

export const getNextState = (draftState: any, picksPerRound: number) => {
  let round = draftState.currentRound;
  let curr = draftState.currentPick;
  let next = draftState.nextPick;
  let draftComplete = draftState.isDraftComplete();
  if (next > 24 && draftState.currentRound < 7) {
    // Move up to next round
    round += 1;
    curr = 1;
    next = 2;
  } else if (next > 24 && draftState.currentRound === 7) {
    // Draft is complete
    curr = 25; // Set to an invalid pick number to indicate completion
  } else {
    curr = next;
    next += 1;
  }

  return { curr, next, round, draftComplete };
};

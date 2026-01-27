import {
  AttackingGoalZone,
  AttackingZone,
  DefendingGoalZone,
  DefendingZone,
  Lineup,
  LineupD1,
  LineupD2,
  LineupD3,
  LineupF1,
  LineupF2,
  LineupF3,
  LineupF4,
  LineupG1,
  LineupG2,
  NeutralZone,
} from "../../../_constants/constants";
import {
  CollegePlayer,
  ProfessionalPlayer,
} from "../../../models/hockeyModels";

export const getZoneInputList = (zoneCategory: string) => {
  if (zoneCategory === DefendingGoalZone) {
    return [
      { label: "Pass", key: "DGZPass" },
      { label: "Long Pass", key: "DGZLongPass" },
      { label: "Agility", key: "DGZAgility" },
      { label: "Body Check", key: "DGZBodyCheck" },
      { label: "Stick Check", key: "DGZStickCheck" },
    ];
  }
  if (zoneCategory === DefendingZone) {
    return [
      { label: "Pass", key: "DZPass" },
      { label: "Agility", key: "DZAgility" },
      { label: "Body Check", key: "DZBodyCheck" },
      { label: "Stick Check", key: "DZStickCheck" },
    ];
  }
  if (zoneCategory === NeutralZone) {
    return [
      { label: "Pass", key: "NPass" },
      { label: "Agility", key: "NAgility" },
      { label: "Body Check", key: "NBodyCheck" },
      { label: "Stick Check", key: "NStickCheck" },
    ];
  }
  if (zoneCategory === AttackingZone) {
    return [
      { label: "Shot", key: "AZShot" },
      { label: "Pass", key: "AZPass" },
      { label: "Long Pass", key: "AZLongPass" },
      { label: "Agility", key: "AZAgility" },
      { label: "Body Check", key: "AZBodyCheck" },
      { label: "Stick Check", key: "AZStickCheck" },
    ];
  }
  if (zoneCategory === AttackingGoalZone) {
    return [
      { label: "Shot", key: "AGZShot" },
      { label: "Pass", key: "AGZPass" },
      { label: "Pass Back", key: "AGZPassBack" },
      { label: "Agility", key: "AGZAgility" },
      { label: "Body Check", key: "AGZBodyCheck" },
      { label: "Stick Check", key: "AGZStickCheck" },
    ];
  }

  return [];
};

export const getShootoutOptionList = () => {
  return [
    { label: "Close", value: "1" },
    { label: "Long", value: "2" },
  ];
};

export const getShootoutPlaceholder = (value: string): string => {
  if (value === "1") return "Close";
  return "Long";
};

export const getLineupIdx = (lineCategory: string) => {
  if (lineCategory === LineupF1) {
    return 0;
  }
  if (lineCategory === LineupF2) {
    return 1;
  }
  if (lineCategory === LineupF3) {
    return 2;
  }
  if (lineCategory === LineupF4) {
    return 3;
  }
  if (lineCategory === LineupD1) {
    return 4;
  }
  if (lineCategory === LineupD2) {
    return 5;
  }
  if (lineCategory === LineupD3) {
    return 6;
  }
  if (lineCategory === LineupG1) {
    return 7;
  }
  if (lineCategory === LineupG2) {
    return 8;
  }
  return 0;
};

export const getLineup = (index: number): Lineup => {
  if (index === 0) {
    return LineupF1;
  }
  if (index === 1) {
    return LineupF2;
  }
  if (index === 2) {
    return LineupF3;
  }
  if (index === 3) {
    return LineupF4;
  }
  if (index === 4) {
    return LineupD1;
  }
  if (index === 5) {
    return LineupD2;
  }
  if (index === 6) {
    return LineupD3;
  }
  if (index === 7) {
    return LineupG1;
  }
  return LineupG2;
};

export const getLineupDropdownOptions = (
  roster: CollegePlayer[] | ProfessionalPlayer[]
) => {
  const centerOptions = roster
    .filter((x) => x.Position === "C")
    .map((x) => {
      return {
        label: `${x.Position} ${x.FirstName} ${x.LastName}`,
        value: x.ID.toString(),
      };
    });
  const forwardOptions = roster
    .filter((x) => x.Position === "F")
    .map((x) => {
      return {
        label: `${x.Position} ${x.FirstName} ${x.LastName}`,
        value: x.ID.toString(),
      };
    });
  const defenderOptions = roster
    .filter((x) => x.Position === "D")
    .map((x) => {
      return {
        label: `${x.Position} ${x.FirstName} ${x.LastName}`,
        value: x.ID.toString(),
      };
    });
  const goalieOptions = roster
    .filter((x) => x.Position === "G")
    .map((x) => {
      return {
        label: `${x.Position} ${x.FirstName} ${x.LastName}`,
        value: x.ID.toString(),
      };
    });

  const shootoutOptions = roster.map((x) => {
    return {
      label: `${x.Position} ${x.FirstName} ${x.LastName}`,
      value: x.ID.toString(),
    };
  });

  return {
    centerOptions,
    forwardOptions,
    defenderOptions,
    goalieOptions,
    shootoutOptions,
  };
};

export function updateLineupFieldWithClass<T extends Record<string, any>>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  ClassConstructor: new (data: T) => T,
  key: keyof T,
  value: T[keyof T]
) {
  setState((prevState) => {
    const updated = new ClassConstructor({ ...prevState });
    updated[key] = value;
    return updated;
  });
}

export const getHCKAIGameplanOptionsOptions = () => {
  const shotPreferenceOptions = [
    { label: "Close", value: "1" },
    { label: "Balanced", value: "2" },
    { label: "Long", value: "3" },
  ];

  const playerSortPreferenceOptions = [
    { label: "Overall", value: "1" },
    { label: "Close Shot", value: "2" },
    { label: "Long Shot", value: "3" },
    { label: "Agility", value: "4" },
    { label: "Puck Handling", value: "5" },
    { label: "Strength", value: "6" },
    { label: "Body Check", value: "7" },
    { label: "Stick Check", value: "8" },
    { label: "Faceoff", value: "9" },
    { label: "Passing", value: "10" },
  ];

  const goalieSortPreferenceOptions = [
    { label: "Overall", value: "1" },
    { label: "Goalkeeping", value: "2" },
    { label: "Goalie Vision", value: "3" },
  ];

  const defensePreferenceOptions = [
    { label: "Body Check", value: "1" },
    { label: "Balanced", value: "2" },
    { label: "Stick Check", value: "3" },
  ];

  const offensiveSystemOptions = [
    { label: "1-2-2 Forecheck", value: "1" },
    { label: "2-1-2 Forecheck", value: "2" },
    { label: "1-3-1 Forecheck", value: "3" },
    { label: "Cycle Game", value: "4" },
    { label: "Quick Transition", value: "5" },
    { label: "Umbrella", value: "6" },
    { label: "East West Motion", value: "7" },
    { label: "Crash the Net", value: "8" },
  ];

  const defensiveSystemOptions = [
    { label: "Balanced", value: "1" },
    { label: "Man to Man", value: "2" },
    { label: "Zone", value: "3" },
    { label: "Neutral Trap", value: "4" },
    { label: "Left Wing Lock", value: "5" },
    { label: "Aggressive Forecheck", value: "6" },
    { label: "Collapsing", value: "7" },
    { label: "Box", value: "8" },
  ];

  return {
    shotPreferenceOptions,
    playerSortPreferenceOptions,
    goalieSortPreferenceOptions,
    defensePreferenceOptions,
    offensiveSystemOptions,
    defensiveSystemOptions,
  };
};

import { useMemo } from "react";
import {
  CollegeLineup,
  CollegePlayer,
  CollegeTeam,
  ProfessionalLineup,
  ProfessionalPlayer,
  ProfessionalTeam,
} from "../../../models/hockeyModels";
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
  LineupSO,
  NeutralZone,
} from "../../../_constants/constants";
import { getLineup } from "./lineupHelper";

export const useCHLLineupUtils = (
  chlTeam?: CollegeTeam,
  chlRosterMap?: Record<number, CollegePlayer[]>,
  currentLineups?: CollegeLineup[]
) => {
  const chlTeamRoster = useMemo(() => {
    if (chlTeam && chlRosterMap) {
      return chlRosterMap[chlTeam.ID];
    }
    return null;
  }, [chlRosterMap, chlTeam]);

  const chlTeamRosterMap = useMemo(() => {
    if (chlTeamRoster) {
      const dict = {} as Record<number, CollegePlayer | ProfessionalPlayer>;
      for (let i = 0; i < chlTeamRoster.length; i++) {
        const player = chlTeamRoster[i];
        dict[player.ID] = player;
      }
      return dict;
    }
    return null;
  }, [chlTeamRoster]);

  const lineupCategories = useMemo(() => {
    return [
      LineupF1,
      LineupF2,
      LineupF3,
      LineupF4,
      LineupD1,
      LineupD2,
      LineupD3,
      LineupG1,
      LineupG2,
      LineupSO,
    ];
  }, []);

  const zoneCategories = useMemo(() => {
    return [
      DefendingGoalZone,
      DefendingZone,
      NeutralZone,
      AttackingZone,
      AttackingGoalZone,
    ];
  }, []);

  const errors = useMemo(() => {
    if (!currentLineups || !chlTeamRosterMap) return [];
    let errList: string[] = [];
    let playerMap: any = {};
    const zoneLimits = {
      DGZ: { min: 0, max: 45 },
      DZ: { min: 0, max: 45 },
      N: { min: 0, max: 30 },
      AZ: { min: 0, max: 60 },
      AGZ: { min: 0, max: 60 },
    };
    const individualLimits = { min: 0, max: 25 };

    const playerLimits = { min: -10, max: 10 };
    // Generalized validation function
    const checkAgainstLimits = (
      value: number,
      key: string,
      min: number,
      max: number
    ) => {
      if (value > max)
        errList.push(
          `${key} is set to ${value}, whereas the max allowed is ${max}.`
        );
      if (value < min)
        errList.push(
          `${key} is set to ${value}, whereas the minimum allowed is ${min}.`
        );
    };

    // Function to validate a player's zone allocations
    const validatePlayerInputs = (playerID: number, lineupLabel: string) => {
      if (playerID === 0) return;

      const player = chlTeamRosterMap[playerID];
      if (!player || player.ID === 0) return;
      if (player.IsInjured) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is currently injured and will be out for approximately ${player.DaysOfRecovery} days.`
        );
      }

      if (player.IsRedshirting) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is currently redshirting and cannot play.`
        );
      }
      const playerLabel = `${lineupLabel}: ${player.Position} ${player.FirstName} ${player.LastName}`;

      if (playerMap[playerID] === true) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is already on an existing line.`
        );
      }
      playerMap[playerID] = true;

      Object.entries(zoneLimits).forEach(([zone, limits]) => {
        if (player[`${zone}Agility`]) {
          checkAgainstLimits(
            player[`${zone}Agility`],
            `${playerLabel} ${zone} Agility`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}Pass`]) {
          checkAgainstLimits(
            player[`${zone}Pass`],
            `${playerLabel} ${zone} Pass`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}PassBack`]) {
          checkAgainstLimits(
            player[`${zone}PassBack`],
            `${playerLabel} ${zone} Pass Back`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}LongPass`]) {
          checkAgainstLimits(
            player[`${zone}LongPass`],
            `${playerLabel} ${zone} Long Pass`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            player[`${zone}BodyCheck`],
            `${playerLabel} ${zone} Body Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}StickCheck`]) {
          checkAgainstLimits(
            player[`${zone}StickCheck`],
            `${playerLabel} ${zone} Stick Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}Shot`]) {
          checkAgainstLimits(
            player[`${zone}Shot`],
            `${playerLabel} ${zone} Shot`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            player[`${zone}BodyCheck`],
            `${playerLabel} ${zone} Body Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}StickCheck`]) {
          checkAgainstLimits(
            player[`${zone}StickCheck`],
            `${playerLabel} ${zone} Stick Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
      });
    };

    currentLineups.forEach((lineup, i) => {
      const lineupLabel = getLineup(i);

      Object.entries(zoneLimits).forEach(([zone, limits]) => {
        const zoneValue =
          Number(lineup[`${zone}Agility`] || 0) +
          Number(lineup[`${zone}Pass`] || 0) +
          Number(lineup[`${zone}LongPass`] || 0) +
          Number(lineup[`${zone}PassBack`] || 0) +
          Number(lineup[`${zone}Shot`] || 0);
        checkAgainstLimits(
          zoneValue,
          `${zone} Lineup Allocations`,
          limits.min,
          limits.max
        );
        const defenseValue =
          Number(lineup[`${zone}BodyCheck`] || 0) +
          Number(lineup[`${zone}StickCheck`] || 0);
        checkAgainstLimits(defenseValue, `${zone} Defense Allocations`, 0, 20);
        if (lineup[`${zone}Agility`]) {
          checkAgainstLimits(
            lineup[`${zone}Agility`],
            `${zone} Agility Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}Pass`]) {
          checkAgainstLimits(
            lineup[`${zone}Pass`],
            `${zone} Pass Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}PassBack`]) {
          checkAgainstLimits(
            lineup[`${zone}PassBack`],
            `${zone} Pass Back Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}LongPass`]) {
          checkAgainstLimits(
            lineup[`${zone}LongPass`],
            `${zone} Long Pass Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}Shot`]) {
          checkAgainstLimits(
            lineup[`${zone}Shot`],
            `${zone} Shot Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            lineup[`${zone}BodyCheck`],
            `${zone} Body Check Allocation`,
            0,
            15
          );
        }
        if (lineup[`${zone}StickCheck`]) {
          checkAgainstLimits(
            lineup[`${zone}StickCheck`],
            `${zone} Stick Check Allocation`,
            0,
            15
          );
        }
      });

      // Validate each player in the lineup
      [
        lineup.CenterID,
        lineup.Forward1ID,
        lineup.Forward2ID,
        lineup.Defender1ID,
        lineup.Defender2ID,
        lineup.GoalieID,
      ].forEach((playerID) => validatePlayerInputs(playerID, lineupLabel));
    });
    return errList;
  }, [currentLineups, chlTeamRosterMap]);

  return {
    chlTeamRoster,
    chlTeamRosterMap,
    lineupCategories,
    zoneCategories,
    errors,
  };
};

export const usePHLLineupUtils = (
  phlTeam?: ProfessionalTeam,
  phlRosterMap?: Record<number, ProfessionalPlayer[]>,
  currentLineups?: ProfessionalLineup[]
) => {
  const phlTeamRoster = useMemo(() => {
    if (phlTeam && phlRosterMap) {
      return phlRosterMap[phlTeam.ID];
    }
    return null;
  }, [phlRosterMap, phlTeam]);

  const phlTeamRosterMap = useMemo(() => {
    if (phlTeamRoster) {
      const dict = {} as Record<number, ProfessionalPlayer>;
      for (let i = 0; i < phlTeamRoster.length; i++) {
        const player = phlTeamRoster[i];
        dict[player.ID] = player;
      }
      return dict;
    }
    return null;
  }, [phlTeamRoster]);

  const lineupCategories = useMemo(() => {
    return [
      LineupF1,
      LineupF2,
      LineupF3,
      LineupF4,
      LineupD1,
      LineupD2,
      LineupD3,
      LineupG1,
      LineupG2,
      LineupSO,
    ];
  }, []);

  const zoneCategories = useMemo(() => {
    return [
      DefendingGoalZone,
      DefendingZone,
      NeutralZone,
      AttackingZone,
      AttackingGoalZone,
    ];
  }, []);

  const errors = useMemo(() => {
    if (!currentLineups || !phlTeamRosterMap) return [];
    let errList: string[] = [];
    let playerMap: any = {};
    const zoneLimits = {
      DGZ: { min: 0, max: 45 },
      DZ: { min: 0, max: 45 },
      N: { min: 0, max: 30 },
      AZ: { min: 0, max: 60 },
      AGZ: { min: 0, max: 60 },
    };
    const individualLimits = { min: 0, max: 25 };

    const playerLimits = { min: -10, max: 10 };
    // Generalized validation function
    const checkAgainstLimits = (
      value: number,
      key: string,
      min: number,
      max: number
    ) => {
      if (value > max)
        errList.push(
          `${key} is set to ${value}, whereas the max allowed is ${max}.`
        );
      if (value < min)
        errList.push(
          `${key} is set to ${value}, whereas the minimum allowed is ${min}.`
        );
    };

    // Function to validate a player's zone allocations
    const validatePlayerInputs = (playerID: number, lineupLabel: string) => {
      if (playerID === 0) return;

      const player = phlTeamRosterMap[playerID];
      if (!player) return;
      const playerLabel = `${lineupLabel}: ${player.Position} ${player.FirstName} ${player.LastName}`;

      if (player.IsInjured) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is currently injured and will be out for approximately ${player.DaysOfRecovery} days.`
        );
      }

      if (player.IsAffiliatePlayer) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is currently on the affiliate team and cannot play.`
        );
      }

      if (playerMap[playerID] === true) {
        errList.push(
          `${player.Position} ${player.FirstName} ${player.LastName} is already on an existing line.`
        );
      }
      playerMap[playerID] = true;

      Object.entries(zoneLimits).forEach(([zone, limits]) => {
        if (player[`${zone}Agility`]) {
          checkAgainstLimits(
            player[`${zone}Agility`],
            `${playerLabel} ${zone} Agility`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}Pass`]) {
          checkAgainstLimits(
            player[`${zone}Pass`],
            `${playerLabel} ${zone} Pass`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}PassBack`]) {
          checkAgainstLimits(
            player[`${zone}PassBack`],
            `${playerLabel} ${zone} Pass Back`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}LongPass`]) {
          checkAgainstLimits(
            player[`${zone}LongPass`],
            `${playerLabel} ${zone} Long Pass`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            player[`${zone}BodyCheck`],
            `${playerLabel} ${zone} Body Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}StickCheck`]) {
          checkAgainstLimits(
            player[`${zone}StickCheck`],
            `${playerLabel} ${zone} Stick Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}Shot`]) {
          checkAgainstLimits(
            player[`${zone}Shot`],
            `${playerLabel} ${zone} Shot`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            player[`${zone}BodyCheck`],
            `${playerLabel} ${zone} Body Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
        if (player[`${zone}StickCheck`]) {
          checkAgainstLimits(
            player[`${zone}StickCheck`],
            `${playerLabel} ${zone} Stick Check`,
            playerLimits.min,
            playerLimits.max
          );
        }
      });
    };

    currentLineups.forEach((lineup, i) => {
      const lineupLabel = getLineup(i);

      Object.entries(zoneLimits).forEach(([zone, limits]) => {
        const zoneValue =
          Number(lineup[`${zone}Agility`] || 0) +
          Number(lineup[`${zone}Pass`] || 0) +
          Number(lineup[`${zone}LongPass`] || 0) +
          Number(lineup[`${zone}PassBack`] || 0) +
          Number(lineup[`${zone}Shot`] || 0);
        checkAgainstLimits(
          zoneValue,
          `${zone} Lineup Allocations`,
          limits.min,
          limits.max
        );
        const defenseValue =
          Number(lineup[`${zone}BodyCheck`] || 0) +
          Number(lineup[`${zone}StickCheck`] || 0);
        checkAgainstLimits(defenseValue, `${zone} Defense Allocations`, 0, 20);
        if (lineup[`${zone}Agility`]) {
          checkAgainstLimits(
            lineup[`${zone}Agility`],
            `${zone} Agility Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}Pass`]) {
          checkAgainstLimits(
            lineup[`${zone}Pass`],
            `${zone} Pass Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}PassBack`]) {
          checkAgainstLimits(
            lineup[`${zone}PassBack`],
            `${zone} Pass Back Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}LongPass`]) {
          checkAgainstLimits(
            lineup[`${zone}LongPass`],
            `${zone} Long Pass Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}Shot`]) {
          checkAgainstLimits(
            lineup[`${zone}Shot`],
            `${zone} Shot Allocation`,
            individualLimits.min,
            individualLimits.max
          );
        }
        if (lineup[`${zone}BodyCheck`]) {
          checkAgainstLimits(
            lineup[`${zone}BodyCheck`],
            `${zone} Body Check Allocation`,
            0,
            15
          );
        }
        if (lineup[`${zone}StickCheck`]) {
          checkAgainstLimits(
            lineup[`${zone}StickCheck`],
            `${zone} Stick Check Allocation`,
            0,
            15
          );
        }
      });

      // Validate each player in the lineup
      [
        lineup.CenterID,
        lineup.Forward1ID,
        lineup.Forward2ID,
        lineup.Defender1ID,
        lineup.Defender2ID,
        lineup.GoalieID,
      ].forEach((playerID) => validatePlayerInputs(playerID, lineupLabel));
    });
    return errList;
  }, [currentLineups, phlTeamRosterMap]);

  return {
    phlTeamRoster,
    phlTeamRosterMap,
    lineupCategories,
    zoneCategories,
    errors,
  };
};

export const getHCKAISortObject = (value: number): any => {
  const sortMap: any = {
    1: { label: "Overall", value: "1" },
    2: { label: "Close Shot", value: "2" },
    3: { label: "Long Shot", value: "3" },
    4: { label: "Agility", value: "4" },
    5: { label: "Puck Handling", value: "5" },
    6: { label: "Strength", value: "6" },
    7: { label: "Body Check", value: "7" },
    8: { label: "Stick Check", value: "8" },
    9: { label: "Faceoff", value: "9" },
    10: { label: "Passing", value: "10" },
  };
  return sortMap[value];
};

export const getHCKGoalieSortObject = (value: number): any => {
  const goalieSortMap: any = {
    1: { label: "Overall", value: 1 },
    2: { label: "Goalkeeping", value: 2 },
    3: { label: "GoalieVision", value: 3 },
  };
  return goalieSortMap[value];
};

export const getHCKAIShotPreferenceObject = (value: number): any => {
  const shotPrefMap: any = {
    1: { label: "Close", value: 1 },
    2: { label: "Balanced", value: 2 },
    3: { label: "Long", value: 3 },
  };
  return shotPrefMap[value];
};

export const getHCKAICheckPreferenceObject = (value: number): any => {
  const shotPrefMap: any = {
    1: { label: "Body Check", value: 1 },
    2: { label: "Balanced", value: 2 },
    3: { label: "Stick Check", value: 3 },
  };
  return shotPrefMap[value];
};

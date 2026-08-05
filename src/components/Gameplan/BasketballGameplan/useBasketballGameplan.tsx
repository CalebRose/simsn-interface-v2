import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../../context/AuthContext";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { SimCBB, SimNBA } from "../../../_constants/constants";
import {
  CollegeLineup,
  CollegePlayer,
  NBALineup,
  NBAPlayer,
} from "../../../models/basketballModels";

export const useBasketballGameplan = () => {
  const { currentUser } = useAuthStore();
  const { selectedLeague } = useLeagueStore();
  const {
    getBootstrapGameplanData,
    cbbRosterMap,
    cbbLineupMap,
    nbaLineupMap,
    proRosterMap,
    cbbTeamOptions,
    nbaTeamOptions,
    cbbTeam,
    nbaTeam,
    cbbTeamMap,
    nbaTeamMap,
    updateCBBLineupMap,
    updateNBALineupMap,
    saveCBBGameplan,
    saveNBAGameplan,
    collegeGameplanMap,
    nbaGameplanMap,
    collegeTeamsGames,
    proTeamsGames,
  } = useSimBBAStore();

  const [selectedTeamID, setSelectedTeamID] = useState<number>(0);
  const [selectedString, setSelectedString] = useState<string>("First");
  const [selectedStringAbbr, setSelectedStringAbbr] = useState<string>("FS");
  const [pace, setPace] = useState<string>("");
  const [offensiveSystem, setOffensiveSystem] = useState<string>("");
  const [defensiveSystem, setDefensiveSystem] = useState<string>("");

  const paceOptions = useMemo(() => {
    return [
      { label: "Very Fast", value: "Very Fast" },
      { label: "Fast", value: "Fast" },
      { label: "Balanced", value: "Balanced" },
      { label: "Slow", value: "Slow" },
      { label: "Very Slow", value: "Very Slow" },
    ];
  }, []);

  const offensiveSystemOptions = useMemo(() => {
    return [
      { label: "Balanced", value: "Balanced" },
      { label: "Motion", value: "Motion" },
      { label: "Pick-and-Roll", value: "Pick-and-Roll" },
      { label: "Post-Up", value: "Post-Up" },
      { label: "Space-and-Post", value: "Space-and-Post" },
    ];
  }, []);

  const defensiveSystemOptions = useMemo(() => {
    return [
      { label: "Man-to-Man", value: "Man-to-Man" },
      { label: "1-3-1 Zone", value: "1-3-1 Zone" },
      { label: "3-2 Zone", value: "3-2 Zone" },
      { label: "2-3 Zone", value: "2-3 Zone" },
      { label: "Box-and-One Zone", value: "Box-and-One Zone" },
    ];
  }, []);

  const selectedTeam = useMemo(() => {
    if (selectedLeague === SimCBB && cbbTeamMap) {
      let t = cbbTeamMap[selectedTeamID] || null;
      if (!t) return cbbTeam;
      return t;
    }
    if (selectedLeague === SimNBA && nbaTeamMap) {
      let t = nbaTeamMap[selectedTeamID] || null;
      if (!t) return nbaTeam;
      return t;
    }
    return null;
  }, [selectedLeague, selectedTeamID, cbbTeamMap, nbaTeamMap]);

  const selectedLeagueTeamOptions = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbTeamOptions || [];
    }
    if (selectedLeague === SimNBA) {
      return nbaTeamOptions || [];
    }
    return [];
  }, [selectedLeague, cbbTeamOptions, nbaTeamOptions]);

  const userTeam = useMemo(() => {
    if (selectedLeague === SimCBB) {
      return cbbTeam;
    }
    if (selectedLeague === SimNBA) {
      return nbaTeam;
    }
    return null;
  }, [selectedLeague, cbbTeam, nbaTeam]);

  const userLineups = useMemo(() => {
    if (!currentUser || !selectedLeague) return [];
    if (selectedLeague === SimCBB) {
      const SimCBBTeamID = currentUser.cbb_id || 0;
      if (!SimCBBTeamID) return [];
      if (!cbbLineupMap) return [];
      const cbbLineup = cbbLineupMap[SimCBBTeamID];
      if (!cbbLineup) return [];
      return cbbLineup;
    }
    const SimNBATeamID = currentUser.NBATeamID || 0;
    if (!SimNBATeamID && selectedLeague === SimNBA) return [];
    if (!nbaLineupMap) return [];
    const nbaLineup = nbaLineupMap[SimNBATeamID];
    if (selectedLeague === SimNBA && !nbaLineup) return [];
    return nbaLineup;
  }, [currentUser, selectedLeague, cbbLineupMap, nbaLineupMap]);

  const userGameplan = useMemo(() => {
    if (!currentUser || !selectedLeague) return null;
    if (selectedLeague === SimCBB) {
      const SimCBBTeamID = currentUser.cbb_id || 0;
      if (!SimCBBTeamID) return null;
      if (!collegeGameplanMap) return null;
      const cbbGameplan = collegeGameplanMap[SimCBBTeamID];
      if (!cbbGameplan) return null;
      return cbbGameplan;
    }
    const SimNBATeamID = currentUser.NBATeamID || 0;
    if (!SimNBATeamID && selectedLeague === SimNBA) return null;
    if (!nbaGameplanMap) return null;
    const nbaGameplan = nbaGameplanMap[SimNBATeamID];
    if (selectedLeague === SimNBA && !nbaGameplan) return null;
    return nbaGameplan;
  }, [currentUser, selectedLeague, collegeGameplanMap, nbaGameplanMap]);

  const selectedTeamRoster = useMemo(() => {
    if (selectedTeamID === 0) {
      return userTeam
        ? selectedLeague === SimCBB
          ? cbbRosterMap![userTeam.ID] || []
          : proRosterMap![userTeam.ID] || []
        : [];
    }
    if (selectedLeague === SimCBB) {
      return cbbRosterMap![selectedTeamID] || [];
    }
    if (selectedLeague === SimNBA) {
      return proRosterMap![selectedTeamID] || [];
    }
    return [];
  }, [selectedLeague, selectedTeamID, cbbRosterMap, proRosterMap]);

  const selectedRosterMap = useMemo(() => {
    const map: Record<number, CollegePlayer | NBAPlayer> = {};
    selectedTeamRoster.forEach((player) => {
      map[player.ID] = player;
    });
    return map;
  }, [selectedTeamRoster]);

  const selectedTeamLineups = useMemo(() => {
    if (selectedTeamID === 0) {
      return userLineups;
    }
    if (selectedLeague === SimCBB && cbbLineupMap) {
      return cbbLineupMap[selectedTeamID] || [];
    }
    if (selectedLeague === SimNBA && nbaLineupMap) {
      return nbaLineupMap[selectedTeamID] || [];
    }
    return [];
  }, [selectedLeague, selectedTeamID, cbbLineupMap, nbaLineupMap]);

  const lineupFormation = useMemo(() => {
    return ["C", "F", "F", "G", "G"];
  }, []);

  const selectedGuardOptions = useMemo(() => {
    if (!selectedTeamRoster) return [];
    const options = selectedTeamRoster
      .filter((player) => player.Position === "G" || player.Position === "F")
      .map((player) => ({
        value: player.ID.toString(),
        label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
      }));
    options.unshift({ value: "0", label: "None" });
    return options;
  }, [selectedTeamRoster]);

  const selectedForwardOptions = useMemo(() => {
    if (!selectedTeamRoster) return [];
    const options = selectedTeamRoster
      .filter((player) => player.Position === "G" || player.Position === "F")
      .map((player) => ({
        value: player.ID.toString(),
        label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
      }));
    options.unshift({ value: "0", label: "None" });
    return options;
  }, [selectedTeamRoster]);

  const selectedCenterOptions = useMemo(() => {
    if (!selectedTeamRoster) return [];
    const options = selectedTeamRoster
      .filter((player) => player.Position === "C" || player.Position === "F")
      .map((player) => ({
        value: player.ID.toString(),
        label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
      }));
    options.unshift({ value: "0", label: "None" });
    return options;
  }, [selectedTeamRoster]);

  useEffect(() => {
    if (userGameplan) {
      setPace(userGameplan.Pace || "");
      setOffensiveSystem(userGameplan.OffensiveFormation || "");
      setDefensiveSystem(userGameplan.DefensiveFormation || "");
    }
  }, [userGameplan]);

  useEffect(() => {
    getBootstrapGameplanData();
  }, [getBootstrapGameplanData]);

  const SelectString = (level: string) => {
    setSelectedString(level);
    if (level === "First") {
      setSelectedStringAbbr("FS");
    } else if (level === "Second") {
      setSelectedStringAbbr("SS");
    } else if (level === "Third") {
      setSelectedStringAbbr("TS");
    }
  };

  const SelectTeam = (options: any) => {
    const opts = Number(options.value);
    setSelectedTeamID(() => opts);
  };

  const SelectPace = (options: any) => {
    const opts = options.value;
    setPace(() => opts);
  };

  const SelectOffensiveSystem = (options: any) => {
    const opts = options.value;
    setOffensiveSystem(() => opts);
  };

  const SelectDefensiveSystem = (options: any) => {
    const opts = options.value;
    setDefensiveSystem(() => opts);
  };

  const ChangeLineupInput = useCallback(
    (playerID: number, key: string, value: number, index: number) => {
      if (selectedLeague === SimCBB) {
        const updatedLineupMap = { ...cbbLineupMap };
        updatedLineupMap[cbbTeam!.ID] = [...updatedLineupMap[cbbTeam!.ID]];
        updatedLineupMap[cbbTeam!.ID][index] = new CollegeLineup({
          ...updatedLineupMap[cbbTeam!.ID][index],
          [key]: value,
        });
        updateCBBLineupMap(updatedLineupMap);
      } else {
        const updatedLineupMap = { ...nbaLineupMap };
        updatedLineupMap[nbaTeam!.ID] = [...updatedLineupMap[nbaTeam!.ID]];
        updatedLineupMap[nbaTeam!.ID][index] = new NBALineup({
          ...updatedLineupMap[nbaTeam!.ID][index],
          [key]: value,
        });
        updateNBALineupMap(updatedLineupMap);
      }
    },
    [
      cbbRosterMap,
      updateCBBLineupMap,
      cbbTeam,
      selectedLeague,
      nbaLineupMap,
      nbaTeam,
      updateNBALineupMap,
      selectedString,
    ],
  );

  const viewingUserTeam = useMemo(() => {
    if (!userTeam || !currentUser || !selectedTeam) return false;
    if (selectedTeam?.ID === userTeam.ID) return true;
    return (
      selectedTeam?.ID ===
      (selectedLeague === SimCBB ? currentUser.cbb_id : currentUser.NBATeamID)
    );
  }, [userTeam, currentUser, selectedTeamID, selectedLeague]);

  const getPlayerName = (
    id: number,
    rosterMap: Record<number, CollegePlayer | NBAPlayer>,
  ) => {
    const player = rosterMap?.[id];
    return player ? `${player.FirstName} ${player.LastName}` : `Player #${id}`;
  };

  const errors = useMemo(() => {
    const errorList: string[] = [];
    if (!selectedTeamLineups || selectedTeamLineups.length === 0) {
      return errorList;
    }
    const firstStringPlayers = new Set<number>();
    const secondStringPlayers = new Set<number>();
    let requiredMinutes = 40;
    let requiredShotTotal = 100;
    if (selectedLeague === SimNBA) {
      requiredMinutes = 48;
      requiredShotTotal = 100;
    }

    const firstStringPositionCounts: Record<string, number> = {
      F: 0,
      G: 0,
      C: 0,
    };

    const secondStringPositionCounts: Record<string, number> = {
      F: 0,
      G: 0,
      C: 0,
    };

    for (const lineup of selectedTeamLineups) {
      const position = lineup.Position;

      // --- 1. First & second string filled ---
      if (!lineup.FirstStringID) {
        errorList.push(`${position}: First string is empty.`);
      }
      if (!lineup.SecondStringID) {
        errorList.push(`${position}: Second string is empty.`);
      }

      // --- 2. No duplicate players within first string / second string across positions ---
      if (lineup.FirstStringID) {
        const p = selectedRosterMap[lineup.FirstStringID];
        if (p) {
          firstStringPositionCounts[p.Position] =
            (firstStringPositionCounts[p.Position] || 0) + 1;
        }
        if (
          firstStringPlayers.has(lineup.FirstStringID) ||
          secondStringPlayers.has(lineup.FirstStringID)
        ) {
          errorList.push(
            `${getPlayerName(lineup.FirstStringID, selectedRosterMap)} is assigned as first string at more than one position.`,
          );
        } else {
          firstStringPlayers.add(lineup.FirstStringID);
        }
      }
      if (lineup.SecondStringID) {
        const p = selectedRosterMap[lineup.SecondStringID];
        if (p) {
          secondStringPositionCounts[p.Position] =
            (secondStringPositionCounts[p.Position] || 0) + 1;
        }
        if (
          secondStringPlayers.has(lineup.SecondStringID) ||
          firstStringPlayers.has(lineup.SecondStringID)
        ) {
          errorList.push(
            `${getPlayerName(lineup.SecondStringID, selectedRosterMap)} is assigned as second string at more than one position.`,
          );
        } else {
          secondStringPlayers.add(lineup.SecondStringID);
        }
      }

      // --- Same player can't occupy two strings at the same position ---
      if (
        lineup.FirstStringID &&
        lineup.FirstStringID === lineup.SecondStringID
      ) {
        errorList.push(
          `${position}: ${getPlayerName(lineup.FirstStringID, selectedRosterMap)} can't be both first and second string.`,
        );
      }
      if (
        lineup.FirstStringID &&
        lineup.FirstStringID === lineup.ThirdStringID
      ) {
        errorList.push(
          `${position}: ${getPlayerName(lineup.FirstStringID, selectedRosterMap)} can't be both first and third string.`,
        );
      }
      if (
        lineup.SecondStringID &&
        lineup.SecondStringID === lineup.ThirdStringID
      ) {
        errorList.push(
          `${position}: ${getPlayerName(lineup.SecondStringID, selectedRosterMap)} can't be both second and third string.`,
        );
      }

      // --- 3. Shot allocation must sum to 100 per string ---
      const checkShotAllocation = (
        label: string,
        playerId: number,
        inside: number,
        mid: number,
        three: number,
      ) => {
        if (!playerId) return; // nothing assigned, nothing to validate
        const total = (inside || 0) + (mid || 0) + (three || 0);
        if (total !== requiredShotTotal) {
          errorList.push(
            `${position} ${label}: Shot allocation totals ${total}%, must equal ${requiredShotTotal}%.`,
          );
        }
        if (inside < 0 || mid < 0 || three < 0) {
          errorList.push(
            `${position} ${label}: Shot allocation cannot be negative.`,
          );
        }
        if (inside > 50 || mid > 50 || three > 50) {
          errorList.push(
            `${position} ${label}: Shot allocation cannot exceed 50%.`,
          );
        }
      };

      checkShotAllocation(
        `1st String (${getPlayerName(lineup.FirstStringID, selectedRosterMap)})`,
        lineup.FirstStringID,
        lineup.FSInsideProportion,
        lineup.FSMidProportion,
        lineup.FSThreeProportion,
      );
      checkShotAllocation(
        `2nd String (${getPlayerName(lineup.SecondStringID, selectedRosterMap)})`,
        lineup.SecondStringID,
        lineup.SSInsideProportion,
        lineup.SSMidProportion,
        lineup.SSThreeProportion,
      );
      checkShotAllocation(
        `3rd String (${getPlayerName(lineup.ThirdStringID, selectedRosterMap)})`,
        lineup.ThirdStringID,
        lineup.TSInsideProportion,
        lineup.TSMidProportion,
        lineup.TSThreeProportion,
      );

      if (lineup.FSMinutes < 0.5) {
        errorList.push(
          `First string must have at least 0.5 usage allocated, currently has ${lineup.FSMinutes}.`,
        );
      }
      if (lineup.SSMinutes < 0.5) {
        errorList.push(
          `Second string must have at least 0.5 usage allocated, currently has ${lineup.SSMinutes}.`,
        );
      }
      if (lineup.TSMinutes < 0.5) {
        errorList.push(
          `Third string must have at least 0.5 usage allocated, currently has ${lineup.TSMinutes}.`,
        );
      }
      if (lineup.FSMinutes > 10) {
        errorList.push(
          `First string must have at most 10 usage allocated, currently has ${lineup.FSMinutes}.`,
        );
      }
      if (lineup.SSMinutes > 10) {
        errorList.push(
          `Second string must have at most 10 usage allocated, currently has ${lineup.SSMinutes}.`,
        );
      }
      if (lineup.TSMinutes > 10) {
        errorList.push(
          `Third string must have at most 10 usage allocated, currently has ${lineup.TSMinutes}.`,
        );
      }
    }

    if (firstStringPositionCounts["G"] === 0) {
      errorList.push(
        `First string must have at least one guard, currently has ${firstStringPositionCounts["G"]}.`,
      );
    }
    if (firstStringPositionCounts["F"] === 0) {
      errorList.push(
        `First string must have at least one forward, currently has ${firstStringPositionCounts["F"]}.`,
      );
    }

    if (secondStringPositionCounts["G"] === 0) {
      errorList.push(
        `Second string must have at least one guard, currently has ${secondStringPositionCounts["G"]}.`,
      );
    }
    if (secondStringPositionCounts["F"] === 0) {
      errorList.push(
        `Second string must have at least one forward, currently has ${secondStringPositionCounts["F"]}.`,
      );
    }

    return errorList;
  }, [selectedLeague, selectedRosterMap, selectedTeamLineups]);

  const totalMinutesAllocated = useMemo(() => {
    let total = 0;
    selectedTeamLineups.forEach((lineup) => {
      total += lineup.FSMinutes + lineup.SSMinutes + lineup.TSMinutes;
    });
    return total;
  }, [selectedTeamLineups]);

  const totalInsideProportionWeighted = useMemo(() => {
    let total = 0;
    selectedTeamLineups.forEach((lineup) => {
      total +=
        lineup.FSInsideProportion +
        lineup.SSInsideProportion +
        lineup.TSInsideProportion;
    });
    return total / 15;
  }, [selectedTeamLineups]);

  const totalMidrangeProportionWeighted = useMemo(() => {
    let total = 0;
    selectedTeamLineups.forEach((lineup) => {
      total +=
        lineup.FSMidProportion +
        lineup.SSMidProportion +
        lineup.TSMidProportion;
    });
    return total / 15;
  }, [selectedTeamLineups]);

  const totalThreePointProportionWeighted = useMemo(() => {
    let total = 0;
    selectedTeamLineups.forEach((lineup) => {
      total +=
        lineup.FSThreeProportion +
        lineup.SSThreeProportion +
        lineup.TSThreeProportion;
    });
    return total / 15;
  }, [selectedTeamLineups]);

  const saveLineupChanges = useCallback(() => {
    let dto: any = {
      TeamID: selectedTeam?.ID || 0,
      Pace: pace,
      OffensiveFormation: offensiveSystem,
      DefensiveFormation: defensiveSystem,
    };
    if (selectedLeague === SimCBB) {
      dto.CollegeLineups = selectedTeamLineups;
      saveCBBGameplan(dto);
    } else if (selectedLeague === SimNBA) {
      dto.NBALineups = selectedTeamLineups;
      saveNBAGameplan(dto);
    }
  }, [
    selectedLeague,
    selectedTeam,
    selectedTeamLineups,
    saveCBBGameplan,
    saveNBAGameplan,
  ]);

  return {
    selectedTeamID,
    setSelectedTeamID,
    userLineups,
    selectedTeamRoster,
    selectedRosterMap,
    selectedTeamLineups,
    lineupFormation,
    selectedLeagueTeamOptions,
    userTeam,
    selectedTeam,
    SelectTeam,
    viewingUserTeam,
    SelectString,
    selectedString,
    selectedStringAbbr,
    ChangeLineupInput,
    selectedGuardOptions,
    selectedForwardOptions,
    selectedCenterOptions,
    errors,
    totalMinutesAllocated,
    totalInsideProportionWeighted,
    totalMidrangeProportionWeighted,
    totalThreePointProportionWeighted,
    saveLineupChanges,
    pace,
    paceOptions,
    SelectPace,
    SelectOffensiveSystem,
    offensiveSystem,
    offensiveSystemOptions,
    SelectDefensiveSystem,
    defensiveSystem,
    defensiveSystemOptions,
  };
};

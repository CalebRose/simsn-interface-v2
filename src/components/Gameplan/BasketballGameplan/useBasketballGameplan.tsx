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
  } = useSimBBAStore();

  const [selectedTeamID, setSelectedTeamID] = useState<number>(0);
  const [selectedString, setSelectedString] = useState<string>("First");
  const [selectedStringAbbr, setSelectedStringAbbr] = useState<string>("FS");

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
      .filter((player) => player.Position === "G")
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
      .filter((player) => player.Position === "F")
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
      .filter((player) => player.Position === "C")
      .map((player) => ({
        value: player.ID.toString(),
        label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
      }));
    options.unshift({ value: "0", label: "None" });
    return options;
  }, [selectedTeamRoster]);

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

      // --- 4. Minutes allocated per position ---
      const totalMinutes =
        (lineup.FSMinutes || 0) +
        (lineup.SSMinutes || 0) +
        (lineup.TSMinutes || 0);
      if (totalMinutes !== requiredMinutes) {
        errorList.push(
          `${position}: Total minutes allocated is ${totalMinutes}, must equal ${requiredMinutes}.`,
        );
      }
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
  };
};

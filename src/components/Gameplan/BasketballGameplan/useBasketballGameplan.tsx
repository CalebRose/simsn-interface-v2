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

  const errors = useMemo(() => {
    const errorList: string[] = [];
    const playersInLineup = {};

    // Check to ensure that first & second strings for each lineup are filled.

    // Check for players in lineup. There shouldn't be any duplicate players or selections within first string or 2nd string.

    // Check to ensure the shot allocations for each designated position (1st string Center, 2nd string center, 1st string Forward, etc.) adds up to 100

    // Will probably need to check for minutes allocated per position.

    //

    return errorList;
  }, [selectedRosterMap, selectedTeamLineups]);

  return {
    selectedTeamID,
    setSelectedTeamID,
    userLineups,
    selectedTeamRoster,
    selectedRosterMap,
    selectedTeamLineups,
    lineupFormation,
    cbbTeamOptions,
    nbaTeamOptions,
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
  };
};

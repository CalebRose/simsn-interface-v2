import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../../context/AuthContext";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { SimCBB, SimNBA } from "../../../_constants/constants";
import { CollegePlayer, NBAPlayer } from "../../../models/basketballModels";

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
  } = useSimBBAStore();

  const [selectedTeamID, setSelectedTeamID] = useState<number>(0);
  const [selectedString, setSelectedString] = useState<string>("First");
  const [selectedStringAbbr, setSelectedStringAbbr] = useState<string>("FS");

  const selectedTeam = useMemo(() => {
    if (selectedLeague === SimCBB && cbbTeamMap) {
      return cbbTeamMap[selectedTeamID] || null;
    }
    if (selectedLeague === SimNBA && nbaTeamMap) {
      return nbaTeamMap[selectedTeamID] || null;
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
    return ["G", "G", "F", "F", "C"];
  }, []);

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

  const viewingUserTeam = useMemo(() => {
    if (!userTeam || !currentUser) return false;
    if (selectedTeamID === userTeam.ID) return true;
    return (
      selectedTeamID ===
      (selectedLeague === SimCBB ? currentUser.cbb_id : currentUser.NBATeamID)
    );
  }, [userTeam, currentUser, selectedTeamID, selectedLeague]);

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
  };
};

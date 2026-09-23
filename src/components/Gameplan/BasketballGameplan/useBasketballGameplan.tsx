import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const lineupSnapshotKeys = [
  "FirstStringID",
  "SecondStringID",
  "ThirdStringID",
  "FSMinutes",
  "SSMinutes",
  "TSMinutes",
  "FSInsideProportion",
  "SSInsideProportion",
  "TSInsideProportion",
  "FSMidProportion",
  "SSMidProportion",
  "TSMidProportion",
  "FSThreeProportion",
  "SSThreeProportion",
  "TSThreeProportion",
] as const;

const lineupPositionOrder: Record<string, number> = { G: 0, F: 1, C: 2 };

// The API returns lineup rows in database/creation order (typically C, F, F, G, G).
// Within a position, the newest (highest-ID) row is the first chart slot.
const orderLineupsForDisplay = <T extends CollegeLineup | NBALineup>(
  lineups: T[],
): T[] =>
  lineups
    .map((lineup) => lineup)
    .sort(
      (left, right) =>
        (lineupPositionOrder[left.Position] ?? Number.MAX_SAFE_INTEGER) -
          (lineupPositionOrder[right.Position] ?? Number.MAX_SAFE_INTEGER) ||
        right.ID - left.ID,
    );
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
    allCollegeGames,
    allProGames,
    cbb_Timestamp,
  } = useSimBBAStore();

  const [selectedTeamID, setSelectedTeamID] = useState<number>(0);
  const [selectedString, setSelectedString] = useState<string>("First");
  const [selectedStringAbbr, setSelectedStringAbbr] = useState<string>("FS");
  const [pace, setPace] = useState<string>("");
  const [offensiveSystem, setOffensiveSystem] = useState<string>("");
  const [defensiveSystem, setDefensiveSystem] = useState<string>("");
  const [focusPlayer, setFocusPlayer] = useState(0);
  const [preserveTimeouts, setPreserveTimeouts] = useState(false);
  const [foulProtectionMode, setFoulProtectionMode] = useState(0);
  const [foulProtectionValue, setFoulProtectionValue] = useState(0);
  const [opponentLeadEnabled, setOpponentLeadEnabled] = useState(false);
  const [opponentLeadValue, setOpponentLeadValue] = useState(10);
  const [playerExhaustionEnabled, setPlayerExhaustionEnabled] = useState(false);
  const [playerExhaustionId, setPlayerExhaustionId] = useState(0);
  const [playerExhaustionValue, setPlayerExhaustionValue] = useState(50);
  const [teamExhaustionEnabled, setTeamExhaustionEnabled] = useState(false);
  const [teamExhaustionValue, setTeamExhaustionValue] = useState(50);
  const initialGameplanSnapshots = useRef<
    Record<
      string,
      {
        lineups: (CollegeLineup | NBALineup)[];
        pace: string;
        offensiveSystem: string;
        defensiveSystem: string;
        focusPlayer: number;
        preserveTimeouts: boolean;
        foulProtectionMode: number;
        foulProtectionValue: number;
        opponentLeadEnabled: boolean;
        opponentLeadValue: number;
        playerExhaustionEnabled: boolean;
        playerExhaustionId: number;
        playerExhaustionValue: number;
        teamExhaustionEnabled: boolean;
        teamExhaustionValue: number;
      }
    >
  >({});

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
      const cbbGameplan = collegeGameplanMap[selectedTeamID || SimCBBTeamID];
      if (!cbbGameplan) return null;
      return cbbGameplan;
    }
    const SimNBATeamID = currentUser.NBATeamID || 0;
    if (!SimNBATeamID && selectedLeague === SimNBA) return null;
    if (!nbaGameplanMap) return null;
    const nbaGameplan = nbaGameplanMap[selectedTeamID || SimNBATeamID];
    if (selectedLeague === SimNBA && !nbaGameplan) return null;
    return nbaGameplan;
  }, [
    currentUser,
    selectedLeague,
    selectedTeamID,
    collegeGameplanMap,
    nbaGameplanMap,
  ]);

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

  const nextGame = useMemo(() => {
    if (!selectedTeam) return null;
    const games = selectedLeague === SimCBB ? allCollegeGames : allProGames;
    const currentWeek =
      selectedLeague === SimCBB
        ? cbb_Timestamp?.CollegeWeek || 0
        : cbb_Timestamp?.NBAWeek || 0;
    return (
      games
        .filter(
          (game) =>
            !game.GameComplete &&
            game.Week >= currentWeek &&
            (game.HomeTeamID === selectedTeam.ID ||
              game.AwayTeamID === selectedTeam.ID),
        )
        .sort(
          (left, right) => left.Week - right.Week || left.ID - right.ID,
        )[0] || null
    );
  }, [
    selectedTeam,
    selectedLeague,
    allCollegeGames,
    allProGames,
    cbb_Timestamp,
  ]);

  const focusOpponentId = useMemo(() => {
    if (!nextGame || !selectedTeam) return 0;
    return nextGame.HomeTeamID === selectedTeam.ID
      ? nextGame.AwayTeamID
      : nextGame.HomeTeamID;
  }, [nextGame, selectedTeam]);

  const focusOpponentName = useMemo(() => {
    if (!nextGame || !selectedTeam) return "";
    return nextGame.HomeTeamID === selectedTeam.ID
      ? nextGame.AwayTeam
      : nextGame.HomeTeam;
  }, [nextGame, selectedTeam]);

  const focusOpponentRoster = useMemo(() => {
    if (!focusOpponentId) return [];
    return selectedLeague === SimCBB
      ? cbbRosterMap?.[focusOpponentId] || []
      : proRosterMap?.[focusOpponentId] || [];
  }, [selectedLeague, focusOpponentId, cbbRosterMap, proRosterMap]);

  const focusPlayerOptions = useMemo(
    () => [
      {
        label:
          defensiveSystem === "Box-and-One Zone"
            ? "Select a focus player"
            : "No double team",
        value: "0",
      },
      ...focusOpponentRoster.map((player) => ({
        label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
        value: String(player.ID),
      })),
    ],
    [defensiveSystem, focusOpponentRoster],
  );

  const selectedTeamLineups = useMemo(() => {
    if (selectedTeamID === 0) {
      return orderLineupsForDisplay(userLineups);
    }
    if (selectedLeague === SimCBB && cbbLineupMap) {
      return orderLineupsForDisplay(cbbLineupMap[selectedTeamID] || []);
    }
    if (selectedLeague === SimNBA && nbaLineupMap) {
      return orderLineupsForDisplay(nbaLineupMap[selectedTeamID] || []);
    }
    return [];
  }, [selectedLeague, selectedTeamID, cbbLineupMap, nbaLineupMap]);

  const lineupFormation = useMemo(() => {
    return ["G", "G", "F", "F", "C"];
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
    const options = selectedTeamRoster.map((player) => ({
      value: player.ID.toString(),
      label: `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`,
    }));
    options.unshift({ value: "0", label: "None" });
    return options;
  }, [selectedTeamRoster]);

  const isEligibleForLineupSlot = useCallback(
    (slotPosition: string, playerID: number) => {
      const player = selectedRosterMap[playerID];
      if (!player) return false;
      if (slotPosition === "G")
        return player.Position === "G" || player.Position === "F";
      if (slotPosition === "C")
        return player.Position === "C" || player.Position === "F";
      return true;
    },
    [selectedRosterMap],
  );

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
      setFocusPlayer(Number(userGameplan.FocusPlayer) || 0);
      setPreserveTimeouts(Boolean(userGameplan.PreserveTimeouts));
      setFoulProtectionMode(
        userGameplan.Trigger1Enabled ? userGameplan.Trigger1Type : 0,
      );
      setFoulProtectionValue(userGameplan.Trigger1Value || 0);
      setOpponentLeadEnabled(Boolean(userGameplan.Trigger2Enabled));
      setOpponentLeadValue(userGameplan.Trigger2Value || 10);
      setPlayerExhaustionEnabled(Boolean(userGameplan.Trigger3Enabled));
      setPlayerExhaustionId(userGameplan.Trigger3Value || 0);
      setPlayerExhaustionValue(userGameplan.Trigger3Exhaustion ?? 50);
      setTeamExhaustionEnabled(Boolean(userGameplan.Trigger4Enabled));
      setTeamExhaustionValue(userGameplan.Trigger4Value ?? 50);
    }
  }, [userGameplan]);

  const activeTeamID = selectedTeam?.ID || 0;
  const snapshotKey = `${selectedLeague}-${activeTeamID}`;

  useEffect(() => {
    if (
      !activeTeamID ||
      !userGameplan ||
      !selectedTeamLineups.length ||
      initialGameplanSnapshots.current[snapshotKey]
    )
      return;
    initialGameplanSnapshots.current[snapshotKey] = {
      lineups: selectedTeamLineups.map(
        (lineup) => ({ ...lineup }) as CollegeLineup | NBALineup,
      ),
      pace: userGameplan.Pace || "",
      offensiveSystem: userGameplan.OffensiveFormation || "",
      defensiveSystem: userGameplan.DefensiveFormation || "",
      focusPlayer: Number(userGameplan.FocusPlayer) || 0,
      preserveTimeouts: Boolean(userGameplan.PreserveTimeouts),
      foulProtectionMode: userGameplan.Trigger1Enabled
        ? userGameplan.Trigger1Type
        : 0,
      foulProtectionValue: userGameplan.Trigger1Value || 0,
      opponentLeadEnabled: Boolean(userGameplan.Trigger2Enabled),
      opponentLeadValue: userGameplan.Trigger2Value || 10,
      playerExhaustionEnabled: Boolean(userGameplan.Trigger3Enabled),
      playerExhaustionId: userGameplan.Trigger3Value || 0,
      playerExhaustionValue: userGameplan.Trigger3Exhaustion || 50,
      teamExhaustionEnabled: Boolean(userGameplan.Trigger4Enabled),
      teamExhaustionValue: userGameplan.Trigger4Value || 50,
    };
  }, [
    activeTeamID,
    selectedLeague,
    selectedTeamLineups,
    snapshotKey,
    userGameplan,
  ]);

  const resetGameplan = useCallback(() => {
    const snapshot = initialGameplanSnapshots.current[snapshotKey];
    if (!snapshot || !activeTeamID) return;

    setPace(snapshot.pace);
    setOffensiveSystem(snapshot.offensiveSystem);
    setDefensiveSystem(snapshot.defensiveSystem);
    setFocusPlayer(snapshot.focusPlayer);
    setPreserveTimeouts(snapshot.preserveTimeouts);
    setFoulProtectionMode(snapshot.foulProtectionMode);
    setFoulProtectionValue(snapshot.foulProtectionValue);
    setOpponentLeadEnabled(snapshot.opponentLeadEnabled);
    setOpponentLeadValue(snapshot.opponentLeadValue);
    setPlayerExhaustionEnabled(snapshot.playerExhaustionEnabled);
    setPlayerExhaustionId(snapshot.playerExhaustionId);
    setPlayerExhaustionValue(snapshot.playerExhaustionValue);
    setTeamExhaustionEnabled(snapshot.teamExhaustionEnabled);
    setTeamExhaustionValue(snapshot.teamExhaustionValue);

    if (selectedLeague === SimCBB) {
      const updatedLineupMap = {
        ...cbbLineupMap,
        [activeTeamID]: snapshot.lineups.map(
          (lineup) => new CollegeLineup(lineup),
        ),
      };
      updateCBBLineupMap(updatedLineupMap);
    } else {
      const updatedLineupMap = {
        ...nbaLineupMap,
        [activeTeamID]: snapshot.lineups.map((lineup) => new NBALineup(lineup)),
      };
      updateNBALineupMap(updatedLineupMap);
    }
  }, [
    activeTeamID,
    cbbLineupMap,
    nbaLineupMap,
    selectedLeague,
    snapshotKey,
    updateCBBLineupMap,
    updateNBALineupMap,
  ]);

  const hasGameplanChanges = useMemo(() => {
    const snapshot = initialGameplanSnapshots.current[snapshotKey];
    if (!snapshot) return false;
    const lineupsChanged =
      selectedTeamLineups.length !== snapshot.lineups.length ||
      selectedTeamLineups.some((lineup, index) =>
        lineupSnapshotKeys.some(
          (key) => lineup[key] !== snapshot.lineups[index]?.[key],
        ),
      );
    return (
      lineupsChanged ||
      pace !== snapshot.pace ||
      offensiveSystem !== snapshot.offensiveSystem ||
      defensiveSystem !== snapshot.defensiveSystem ||
      focusPlayer !== snapshot.focusPlayer ||
      preserveTimeouts !== snapshot.preserveTimeouts ||
      foulProtectionMode !== snapshot.foulProtectionMode ||
      foulProtectionValue !== snapshot.foulProtectionValue ||
      opponentLeadEnabled !== snapshot.opponentLeadEnabled ||
      opponentLeadValue !== snapshot.opponentLeadValue ||
      playerExhaustionEnabled !== snapshot.playerExhaustionEnabled ||
      playerExhaustionId !== snapshot.playerExhaustionId ||
      playerExhaustionValue !== snapshot.playerExhaustionValue ||
      teamExhaustionEnabled !== snapshot.teamExhaustionEnabled ||
      teamExhaustionValue !== snapshot.teamExhaustionValue
    );
  }, [
    defensiveSystem,
    focusPlayer,
    foulProtectionMode,
    foulProtectionValue,
    opponentLeadEnabled,
    opponentLeadValue,
    offensiveSystem,
    pace,
    playerExhaustionEnabled,
    playerExhaustionId,
    playerExhaustionValue,
    preserveTimeouts,
    selectedTeamLineups,
    snapshotKey,
    teamExhaustionEnabled,
    teamExhaustionValue,
  ]);

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
    if (opts !== "Man-to-Man" && opts !== "Box-and-One Zone") {
      setFocusPlayer(0);
    }
  };

  const ChangeLineupInput = useCallback(
    (playerID: number, key: string, value: number, index: number) => {
      if (
        key.endsWith("StringID") &&
        value !== 0 &&
        !isEligibleForLineupSlot(lineupFormation[index], value)
      ) {
        return;
      }
      if (selectedLeague === SimCBB) {
        const updatedLineupMap = { ...cbbLineupMap };
        const lineups = [...updatedLineupMap[cbbTeam!.ID]];
        const sourceIndex = lineups.findIndex(
          (lineup) => lineup.ID === selectedTeamLineups[index]?.ID,
        );
        if (sourceIndex < 0) return;
        lineups[sourceIndex] = new CollegeLineup({
          ...lineups[sourceIndex],
          [key]: value,
        });
        updatedLineupMap[cbbTeam!.ID] = lineups;
        updateCBBLineupMap(updatedLineupMap);
      } else {
        const updatedLineupMap = { ...nbaLineupMap };
        const lineups = [...updatedLineupMap[nbaTeam!.ID]];
        const sourceIndex = lineups.findIndex(
          (lineup) => lineup.ID === selectedTeamLineups[index]?.ID,
        );
        if (sourceIndex < 0) return;
        lineups[sourceIndex] = new NBALineup({
          ...lineups[sourceIndex],
          [key]: value,
        });
        updatedLineupMap[nbaTeam!.ID] = lineups;
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
      lineupFormation,
      isEligibleForLineupSlot,
      selectedTeamLineups,
    ],
  );

  const SwapLineupPlayers = useCallback(
    (index: number, firstKey: string, secondKey: string) => {
      if (selectedLeague === SimCBB) {
        const updatedLineupMap = { ...cbbLineupMap };
        const lineups = [...updatedLineupMap[cbbTeam!.ID]];
        const sourceIndex = lineups.findIndex(
          (lineup) => lineup.ID === selectedTeamLineups[index]?.ID,
        );
        if (sourceIndex < 0) return;
        const lineup = lineups[sourceIndex];
        lineups[sourceIndex] = new CollegeLineup({
          ...lineup,
          [firstKey]: lineup[secondKey],
          [secondKey]: lineup[firstKey],
        });
        updatedLineupMap[cbbTeam!.ID] = lineups;
        updateCBBLineupMap(updatedLineupMap);
      } else {
        const updatedLineupMap = { ...nbaLineupMap };
        const lineups = [...updatedLineupMap[nbaTeam!.ID]];
        const sourceIndex = lineups.findIndex(
          (lineup) => lineup.ID === selectedTeamLineups[index]?.ID,
        );
        if (sourceIndex < 0) return;
        const lineup = lineups[sourceIndex];
        lineups[sourceIndex] = new NBALineup({
          ...lineup,
          [firstKey]: lineup[secondKey],
          [secondKey]: lineup[firstKey],
        });
        updatedLineupMap[nbaTeam!.ID] = lineups;
        updateNBALineupMap(updatedLineupMap);
      }
    },
    [
      cbbLineupMap,
      cbbTeam,
      nbaLineupMap,
      nbaTeam,
      selectedLeague,
      selectedTeamLineups,
      updateCBBLineupMap,
      updateNBALineupMap,
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
    const supportsFocusPlayer =
      defensiveSystem === "Man-to-Man" ||
      defensiveSystem === "Box-and-One Zone";
    if (supportsFocusPlayer && !focusOpponentId) {
      errorList.push("No upcoming opponent is available for Focus Player.");
    }
    if (
      focusPlayer &&
      !focusOpponentRoster.some((player) => player.ID === focusPlayer)
    ) {
      errorList.push("Focus Player must be on the next opponent's roster.");
    }
    if (defensiveSystem === "Box-and-One Zone" && !focusPlayer) {
      errorList.push("Box-and-One Zone requires a Focus Player.");
    }
    if (!selectedTeamLineups || selectedTeamLineups.length === 0) {
      return errorList;
    }
    const firstStringPlayers = new Set<number>();
    let requiredShotTotal = 100;
    if (selectedLeague === SimNBA) {
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

    for (const [index, lineup] of selectedTeamLineups.entries()) {
      const position = lineupFormation[index] || lineup.Position;
      const slotLabel = `${position}${position === "G" ? index + 1 : position === "F" ? index - 1 : 1}`;

      for (const [stringLabel, playerID] of [
        ["First", lineup.FirstStringID],
        ["Second", lineup.SecondStringID],
        ["Third", lineup.ThirdStringID],
      ] as const) {
        if (playerID && !isEligibleForLineupSlot(position, playerID)) {
          errorList.push(
            `${slotLabel} ${stringLabel} string must use ${position === "G" ? "a Guard or Forward" : position === "C" ? "a Center or Forward" : "any roster player"}.`,
          );
        }
      }

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
        if (firstStringPlayers.has(lineup.FirstStringID)) {
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
      // Third string is optional; enforce usage limits only when a player is assigned.
      if (lineup.ThirdStringID && lineup.TSMinutes < 0.5) {
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
      if (lineup.ThirdStringID && lineup.TSMinutes > 10) {
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

    if (foulProtectionMode === 1 && !selectedRosterMap[foulProtectionValue])
      errorList.push("Select a protected player on this team.");
    if (
      foulProtectionMode === 2 &&
      (!Number.isInteger(foulProtectionValue) ||
        foulProtectionValue < 1 ||
        foulProtectionValue > 5)
    )
      errorList.push("Fouls per half must be 1–5.");
    if (
      opponentLeadEnabled &&
      (!Number.isInteger(opponentLeadValue) ||
        opponentLeadValue < 1 ||
        opponentLeadValue > 99)
    )
      errorList.push("Opponent lead must be 1–99 points.");
    if (playerExhaustionEnabled && !selectedRosterMap[playerExhaustionId])
      errorList.push("Select an exhaustion player on this team.");
    if (
      playerExhaustionEnabled &&
      (!Number.isInteger(playerExhaustionValue) ||
        playerExhaustionValue < 0 ||
        playerExhaustionValue > 100)
    )
      errorList.push("Player exhaustion must be 0–100.");
    if (
      teamExhaustionEnabled &&
      (!Number.isInteger(teamExhaustionValue) ||
        teamExhaustionValue < 0 ||
        teamExhaustionValue > 100)
    )
      errorList.push("Team exhaustion must be 0–100.");
    return errorList;
  }, [
    selectedLeague,
    selectedRosterMap,
    selectedTeamLineups,
    lineupFormation,
    isEligibleForLineupSlot,
    foulProtectionMode,
    foulProtectionValue,
    opponentLeadEnabled,
    opponentLeadValue,
    playerExhaustionEnabled,
    playerExhaustionId,
    playerExhaustionValue,
    teamExhaustionEnabled,
    teamExhaustionValue,
    defensiveSystem,
    focusOpponentId,
    focusOpponentRoster,
    focusPlayer,
  ]);

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
      FocusPlayer:
        defensiveSystem === "Man-to-Man" ||
        defensiveSystem === "Box-and-One Zone"
          ? String(focusPlayer || "")
          : "",
      TimeoutSettingsProvided: true,
      PreserveTimeouts: preserveTimeouts,
      Trigger1Enabled: foulProtectionMode !== 0,
      Trigger1Type: foulProtectionMode || 0,
      Trigger1Value: foulProtectionMode ? foulProtectionValue : 0,
      Trigger2Enabled: opponentLeadEnabled,
      Trigger2Value: opponentLeadEnabled ? opponentLeadValue : 0,
      Trigger3Enabled: playerExhaustionEnabled,
      Trigger3Value: playerExhaustionEnabled ? playerExhaustionId : 0,
      Trigger3Exhaustion: playerExhaustionEnabled ? playerExhaustionValue : 0,
      Trigger4Enabled: teamExhaustionEnabled,
      Trigger4Value: teamExhaustionEnabled ? teamExhaustionValue : 0,
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
    pace,
    offensiveSystem,
    defensiveSystem,
    focusPlayer,
    preserveTimeouts,
    foulProtectionMode,
    foulProtectionValue,
    opponentLeadEnabled,
    opponentLeadValue,
    playerExhaustionEnabled,
    playerExhaustionId,
    playerExhaustionValue,
    teamExhaustionEnabled,
    teamExhaustionValue,
  ]);

  return {
    selectedLeague,
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
    SwapLineupPlayers,
    selectedGuardOptions,
    selectedForwardOptions,
    selectedCenterOptions,
    errors,
    totalInsideProportionWeighted,
    totalMidrangeProportionWeighted,
    totalThreePointProportionWeighted,
    saveLineupChanges,
    resetGameplan,
    hasGameplanChanges,
    pace,
    paceOptions,
    SelectPace,
    SelectOffensiveSystem,
    offensiveSystem,
    offensiveSystemOptions,
    SelectDefensiveSystem,
    defensiveSystem,
    defensiveSystemOptions,
    focusPlayer,
    setFocusPlayer,
    focusOpponentName,
    focusPlayerOptions,
    preserveTimeouts,
    setPreserveTimeouts,
    foulProtectionMode,
    setFoulProtectionMode,
    foulProtectionValue,
    setFoulProtectionValue,
    opponentLeadEnabled,
    setOpponentLeadEnabled,
    opponentLeadValue,
    setOpponentLeadValue,
    playerExhaustionEnabled,
    setPlayerExhaustionEnabled,
    playerExhaustionId,
    setPlayerExhaustionId,
    playerExhaustionValue,
    setPlayerExhaustionValue,
    teamExhaustionEnabled,
    setTeamExhaustionEnabled,
    teamExhaustionValue,
    setTeamExhaustionValue,
  };
};

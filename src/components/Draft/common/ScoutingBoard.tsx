import React, { FC, useState, useMemo, useCallback } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import {
  DraftLeague,
  Draftee,
  ScoutingProfile,
  TeamColors,
  getPositionsByLeague,
  isNFLScoutingProfile,
  getCollegeLeagueConstant,
  isNFLLeague,
} from "./types";
import { ScoutingBoardRow } from "./ScoutingBoardRow";
import { getGradeValue, getOverallGrade } from "./draftHelpers";
import { Button } from "../../../_design/Buttons";
import {
  MAX_PRIVATE_WORKOUT_PLAYERS,
  PRIVATE_WORKOUT_COST_PER_PLAYER,
  isPrivateWorkoutCompleted,
} from "../NFLDraft/utils/privateWorkoutUtils";
import {
  NFLDraftPick,
  NFLDraftee,
  ScoutingProfile as NFLScoutingProfile,
} from "../../../models/footballModels";
import {
  DraftPick as PHLDraftPick,
  DraftablePlayer as PHLDraftee,
  ScoutingProfile as PHLScoutingProfile,
} from "../../../models/hockeyModels";
import { DrafteeInfoType, ModalAction, SimNFL } from "../../../_constants/constants";

interface ScoutingBoardProps {
  scoutProfiles: ScoutingProfile[];
  draftedPlayerIds: Set<number>;
  onRemoveFromBoard: (profile: ScoutingProfile) => void;
  onDraftPlayer?: (player: Draftee) => void;
  onViewDetails: (profile: ScoutingProfile) => void;
  handlePlayerModal?: (action: ModalAction, player: Draftee) => void;
  onRevealAttribute: (
    profileId: number,
    showAttribute: string,
    cost: number,
  ) => void;
  onRunPrivateWorkouts?: (profiles: NFLScoutingProfile[]) => Promise<boolean>;
  isPrivateWorkoutClosed?: boolean;
  onDownloadPrivateWorkoutReport?: (players: NFLDraftee[]) => void;
  isUserTurn?: boolean;
  teamColors: TeamColors;
  backgroundColor: string;
  teamScoutingPoints: number;
  spentPoints: number;
  league: DraftLeague;
  offensiveSystemsInformation?: any;
  defensiveSystemsInformation?: any;
  draftablePlayerMap: Record<number, Draftee>;
}

export const ScoutingBoard: FC<ScoutingBoardProps> = ({
  scoutProfiles,
  draftedPlayerIds,
  onRemoveFromBoard,
  onDraftPlayer,
  onViewDetails,
  onRevealAttribute,
  onRunPrivateWorkouts,
  isPrivateWorkoutClosed = false,
  onDownloadPrivateWorkoutReport,
  isUserTurn = false,
  teamColors,
  backgroundColor,
  teamScoutingPoints,
  spentPoints,
  league,
  offensiveSystemsInformation,
  defensiveSystemsInformation,
  draftablePlayerMap,
  handlePlayerModal,
}) => {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("overall-desc");
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<number[]>([]);
  const [isRunningWorkouts, setIsRunningWorkouts] = useState<boolean>(false);

  const sortOptions: SelectOption[] = [
    { label: "Overall (Highest First)", value: "overall-desc" },
    { label: "Overall (Lowest First)", value: "overall-asc" },
    { label: "Position", value: "position" },
    { label: "Name (A-Z)", value: "name" },
  ];

  const positions = useMemo(() => getPositionsByLeague(league), [league]);
  const collegeLeague = getCollegeLeagueConstant(league);

  const getPlayerFromProfile = (profile: ScoutingProfile): Draftee | null => {
    if (isNFLScoutingProfile(profile)) {
      return draftablePlayerMap[profile.PlayerID] || null;
    }
    return draftablePlayerMap[profile.PlayerID] || null;
  };

  const getRevealedCount = (profile: ScoutingProfile): number => {
    let count = 0;
    if (profile.ShowAttribute1) count++;
    if (profile.ShowAttribute2) count++;
    if (profile.ShowAttribute3) count++;
    if (profile.ShowAttribute4) count++;
    if (profile.ShowAttribute5) count++;
    if (profile.ShowAttribute6) count++;
    if (profile.ShowAttribute7) count++;
    if (profile.ShowAttribute8) count++;
    if (isNFLScoutingProfile(profile)) {
      profile = profile as NFLScoutingProfile;
      if (profile.ShowPotential) count++;
    } else if (profile as PHLScoutingProfile) {
      profile = profile as PHLScoutingProfile;
      if (profile.ShowPotAttribute1) count++;
      if (profile.ShowPotAttribute2) count++;
      if (profile.ShowPotAttribute3) count++;
      if (profile.ShowPotAttribute4) count++;
      if (profile.ShowPotAttribute5) count++;
      if (profile.ShowPotAttribute6) count++;
      if (profile.ShowPotAttribute7) count++;
      if (profile.ShowPotAttribute8) count++;
    }
    return count;
  };

  const filteredProfiles = useMemo(() => {
    let filtered = scoutProfiles.filter((profile) => {
      // if (draftedPlayerIds.has(profile.PlayerID)) return false;

      const player = getPlayerFromProfile(profile);
      if (!player) return false;

      if (
        selectedPositions.length > 0 &&
        !selectedPositions.includes(player.Position)
      ) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const playerA = getPlayerFromProfile(a);
      const playerB = getPlayerFromProfile(b);
      if (!playerA && !playerB) return 0;
      if (!playerA) return 1;
      if (!playerB) return -1;

      // Sort by the letter grade displayed on screen!
      const gradeA = getOverallGrade(playerA, league);
      const gradeB = getOverallGrade(playerB, league);
      const gradeValA = getGradeValue(gradeA);
      const gradeValB = getGradeValue(gradeB);

      if (selectedSort === "overall-asc") {
        if (gradeValA !== gradeValB) return gradeValA - gradeValB;
        const ovrA = (playerA as any)?.Overall || 0;
        const ovrB = (playerB as any)?.Overall || 0;
        if (ovrA !== ovrB) return ovrA - ovrB;
        return ((playerA as any)?.Age || 0) - ((playerB as any)?.Age || 0);
      }
      if (selectedSort === "position") {
        const posA = playerA?.Position || "";
        const posB = playerB?.Position || "";
        if (posA !== posB) return posA.localeCompare(posB);
        return gradeValB - gradeValA;
      }
      if (selectedSort === "name") {
        const nameA = `${playerA?.FirstName || ""} ${playerA?.LastName || ""}`.trim();
        const nameB = `${playerB?.FirstName || ""} ${playerB?.LastName || ""}`.trim();
        return nameA.localeCompare(nameB);
      }

      // Default: "overall-desc" based on the displayed letter grade!
      if (gradeValB !== gradeValA) {
        return gradeValB - gradeValA;
      }
      const ovrA = (playerA as any)?.Overall || 0;
      const ovrB = (playerB as any)?.Overall || 0;
      if (ovrB !== ovrA) {
        return ovrB - ovrA;
      }
      const ageA = (playerA as any)?.Age || 0;
      const ageB = (playerB as any)?.Age || 0;
      return ageB - ageA;
    });
  }, [
    scoutProfiles,
    draftedPlayerIds,
    selectedPositions,
    draftablePlayerMap,
    selectedSort,
    league,
  ]);

  const availablePoints = teamScoutingPoints - spentPoints;

  let pointsAvailableColor = useMemo(() => {
    let remaining = teamScoutingPoints - spentPoints;
    if (remaining / teamScoutingPoints > 0.75) {
      return "text-green-400";
    } else if (remaining / teamScoutingPoints > 0.5) {
      return "text-yellow-400";
    } else if (remaining / teamScoutingPoints > 0.25) {
      return "text-orange-400";
    }
    return "text-red-400";
  }, [teamScoutingPoints, spentPoints]);

  const viewPlayer = useCallback(
    (draftee: Draftee) => {
      if (handlePlayerModal) {
        handlePlayerModal(DrafteeInfoType, draftee!!);
      }
    },
    [handlePlayerModal],
  );

  const selectedWorkoutProfiles = useMemo(() => {
    if (league !== SimNFL) return [];
    const selectedSet = new Set(selectedWorkoutIds);
    return scoutProfiles.filter(
      (p) =>
        selectedSet.has(p.ID) &&
        !isPrivateWorkoutCompleted(p as NFLScoutingProfile),
    ) as NFLScoutingProfile[];
  }, [league, scoutProfiles, selectedWorkoutIds]);

  const workedOutPlayers = useMemo(() => {
    if (league !== SimNFL) return [];
    return scoutProfiles
      .filter((p) => isPrivateWorkoutCompleted(p as NFLScoutingProfile))
      .map((p) => draftablePlayerMap[p.PlayerID] as NFLDraftee | undefined)
      .filter((p): p is NFLDraftee => Boolean(p));
  }, [league, scoutProfiles, draftablePlayerMap]);

  const workoutCost =
    selectedWorkoutProfiles.length * PRIVATE_WORKOUT_COST_PER_PLAYER;
  const canAffordWorkouts = availablePoints >= workoutCost;

  const handleTogglePrivateWorkout = useCallback(
    (profile: ScoutingProfile) => {
      if (isPrivateWorkoutClosed) return;
      if (
        league === SimNFL &&
        isPrivateWorkoutCompleted(profile as NFLScoutingProfile)
      ) {
        return;
      }
      setSelectedWorkoutIds((prev) => {
        if (prev.includes(profile.ID)) {
          return prev.filter((id) => id !== profile.ID);
        }
        if (prev.length >= MAX_PRIVATE_WORKOUT_PLAYERS) {
          return prev;
        }
        return [...prev, profile.ID];
      });
    },
    [isPrivateWorkoutClosed, league],
  );

  const handleSubmitPrivateWorkouts = useCallback(async () => {
    if (!onRunPrivateWorkouts || selectedWorkoutProfiles.length === 0) return;
    setIsRunningWorkouts(true);
    try {
      const ok = await onRunPrivateWorkouts(selectedWorkoutProfiles);
      if (ok) {
        setSelectedWorkoutIds([]);
      }
    } finally {
      setIsRunningWorkouts(false);
    }
  }, [onRunPrivateWorkouts, selectedWorkoutProfiles]);

  return (
    <Border
      classes="p-4 border-2 w-full overflow-x-auto"
      styles={{ borderColor: teamColors.primary, backgroundColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text variant="h5" classes="text-white font-semibold">
          Scouting Board
        </Text>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <Text variant="xs" classes="text-gray-400">
              Points Available
            </Text>
            <Text variant="h6" classes={`${pointsAvailableColor} font-bold`}>
              {(teamScoutingPoints || 0) - (spentPoints || 0)}
            </Text>
          </div>
          <div className="text-center">
            <Text variant="xs" classes="text-gray-400">
              Points Spent
            </Text>
            <Text variant="h6" classes="text-white font-bold">
              {spentPoints}
            </Text>
          </div>
          <Text variant="xs" classes="text-gray-400">
            {filteredProfiles.length} players scouted
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <SelectDropdown
          options={positions}
          value={positions.filter((p) => selectedPositions.includes(p.value))}
          onChange={(selected) => {
            const values =
              (selected as SelectOption[])?.map((s) => s.value) || [];
            setSelectedPositions(values);
          }}
          placeholder="All Positions"
          isMulti
          className="text-sm max-w-xs"
        />
        <SelectDropdown
          options={sortOptions}
          value={sortOptions.find((s) => s.value === selectedSort)}
          onChange={(selected) => {
            const val = (selected as SelectOption)?.value || "overall-desc";
            setSelectedSort(val);
          }}
          placeholder="Sort By"
          className="text-sm max-w-xs"
        />
      </div>
      {league === SimNFL && onRunPrivateWorkouts && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-4 rounded border border-gray-700 bg-gray-800/60">
          <div className="flex flex-wrap items-center gap-3">
            <Text variant="small" classes="text-white font-semibold">
              Private Workouts
            </Text>
            <Text variant="xs" classes="text-gray-300">
              {selectedWorkoutProfiles.length}/{MAX_PRIVATE_WORKOUT_PLAYERS} selected
              {" · "}
              {workoutCost} pts ({PRIVATE_WORKOUT_COST_PER_PLAYER} pts/player)
            </Text>
            {isPrivateWorkoutClosed && (
              <Text variant="xs" classes="text-red-400 font-semibold">
                Closed (1st Pick is on the clock)
              </Text>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onDownloadPrivateWorkoutReport && (
              <Button
                variant="secondaryOutline"
                size="sm"
                onClick={() => onDownloadPrivateWorkoutReport(workedOutPlayers)}
                disabled={workedOutPlayers.length === 0}
              >
                Download Workout Report ({workedOutPlayers.length})
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitPrivateWorkouts}
              disabled={
                isPrivateWorkoutClosed ||
                selectedWorkoutProfiles.length === 0 ||
                !canAffordWorkouts ||
                isRunningWorkouts
              }
            >
              {isRunningWorkouts
                ? "Running Workouts..."
                : `Run Private Workouts (${workoutCost} pts)`}
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {filteredProfiles.map((profile, index) => {
          const player = getPlayerFromProfile(profile);
          if (!player) return null;

          const isDrafted = draftedPlayerIds.has(player.ID);
          const hasPrivateWorkout =
            league === SimNFL &&
            isPrivateWorkoutCompleted(profile as NFLScoutingProfile);
          const isPrivateWorkoutSelected = selectedWorkoutIds.includes(
            profile.ID,
          );
          const canSelectPrivateWorkout =
            !isPrivateWorkoutClosed &&
            !hasPrivateWorkout &&
            (isPrivateWorkoutSelected ||
              selectedWorkoutProfiles.length < MAX_PRIVATE_WORKOUT_PLAYERS);

          return (
            <ScoutingBoardRow
              key={profile.ID}
              profile={profile}
              player={player}
              viewPlayer={viewPlayer}
              index={index}
              isDrafted={isDrafted}
              backgroundColor={backgroundColor}
              teamColors={teamColors}
              league={league}
              availablePoints={availablePoints}
              offensiveSystemsInformation={offensiveSystemsInformation}
              defensiveSystemsInformation={defensiveSystemsInformation}
              isUserTurn={isUserTurn}
              onRemoveFromBoard={onRemoveFromBoard}
              onDraftPlayer={onDraftPlayer}
              onRevealAttribute={onRevealAttribute}
              getRevealedCount={getRevealedCount}
              hasPrivateWorkout={hasPrivateWorkout}
              isPrivateWorkoutSelected={isPrivateWorkoutSelected}
              canSelectPrivateWorkout={canSelectPrivateWorkout}
              isPrivateWorkoutClosed={isPrivateWorkoutClosed}
              onTogglePrivateWorkout={
                league === SimNFL && onRunPrivateWorkouts
                  ? handleTogglePrivateWorkout
                  : undefined
              }
            />
          );
        })}
      </div>
      {filteredProfiles.length === 0 && (
        <div className="text-center py-8">
          <Text variant="body" classes="text-gray-500">
            No players in your scouting board yet.
          </Text>
        </div>
      )}
    </Border>
  );
};

import { useMemo, useRef, useCallback } from "react";
import { useFirestore } from "../../../firebase/firebase";
import { DraftPick } from "../common";

interface DraftStateProps {
  CollectionName: string;
  DocName: string;
}

export class DraftStateObj {
  [key: string]: any;
  currentPick: number;
  currentRound: number;
  isPaused: boolean;
  seconds: number;
  endTime: Date;
  nextPick: number;
  exportComplete: boolean;
  recentlyDraftedPlayerID: number;
  allDraftPicks: Record<number, DraftPick[]>;

  constructor(
    currentPick: number = 1,
    currentRound: number = 1,
    isPaused: boolean = true,
    seconds: number = 300,
    endTime: Date = new Date(),
    nextPick: number = 2,
    recentlyDraftedPlayerID: number = 0,
    allDraftPicks: Record<number, DraftPick[]> = {},
    exportComplete: boolean = false,
  ) {
    this.currentPick = currentPick;
    this.currentRound = currentRound;
    this.isPaused = isPaused;
    this.seconds = seconds;
    this.endTime = endTime;
    this.nextPick = nextPick;
    this.recentlyDraftedPlayerID = recentlyDraftedPlayerID;
    this.allDraftPicks = allDraftPicks;
    this.exportComplete = exportComplete;
  }

  // Helper method to check if draft is complete
  isDraftComplete(): boolean {
    return this.currentPick > 168; // Assuming 7 rounds × 24 teams = 168 picks
  }

  // Helper method to get formatted time remaining
  getFormattedTimeRemaining(): string {
    const minutes = Math.floor(this.seconds / 60);
    const remainingSeconds = this.seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Helper method to update to next pick
  advanceToNextPick(): void {
    this.currentPick = this.nextPick;
    this.nextPick += 1;
    // Update round if needed (assuming 24 picks per round)
    this.currentRound = Math.ceil(this.currentPick / 24);

    // Reset timer based on round
    if (this.currentPick <= 24) {
      this.seconds = 300; // 5 minutes for round 1
    } else if (this.currentPick <= 96) {
      this.seconds = 180; // 3 minutes for rounds 2-4
    } else {
      this.seconds = 120; // 2 minutes for rounds 5-7
    }

    // Set new end time
    this.endTime = new Date(Date.now() + this.seconds * 1000);
  }
}

export const useDraftState = ({ CollectionName, DocName }: DraftStateProps) => {
  const [draftStateData, updateDraftState, isLoading] = useFirestore(
    CollectionName,
    DocName,
  );

  // Create a stable fallback instance that doesn't change on re-renders
  const fallbackDraftState = useRef(new DraftStateObj());

  // Memoize the draft state with better stability
  const draftState = useMemo(() => {
    // If no data and still loading, return stable fallback
    if (!draftStateData && isLoading) {
      return fallbackDraftState.current;
    }

    // If we have data, return it
    if (draftStateData) {
      return draftStateData as DraftStateObj;
    }

    // If not loading and no data, create new instance (first load complete)
    return new DraftStateObj();
  }, [draftStateData, isLoading]);

  // Memoize the update function to prevent unnecessary re-renders of consumers
  const memoizedUpdateDraftState = useCallback(
    (newState: any) => {
      updateDraftState(newState);
    },
    [updateDraftState],
  );

  // Memoize individual properties that are commonly used (excluding large objects)
  const draftStateProperties = useMemo(
    () => ({
      currentPick: draftState.currentPick,
      currentRound: draftState.currentRound,
      isPaused: draftState.isPaused,
      seconds: draftState.seconds,
      endTime: draftState.endTime,
      nextPick: draftState.nextPick,
      recentlyDraftedPlayerID: draftState.recentlyDraftedPlayerID,
      isDraftComplete: draftState.isDraftComplete?.() || false,
      formattedTime: draftState.getFormattedTimeRemaining?.() || "0:00",
      exportComplete: draftState.exportComplete,
    }),
    [
      draftState.currentPick,
      draftState.currentRound,
      draftState.isPaused,
      draftState.seconds,
      draftState.endTime,
      draftState.nextPick,
      draftState.recentlyDraftedPlayerID,
      draftState.exportComplete,
    ],
  );

  // Memoize allDraftPicks separately to avoid excessive re-renders
  const allDraftPicks = useMemo(() => {
    return draftState.allDraftPicks || {};
  }, [draftState.allDraftPicks]);

  return {
    draftState,
    updateDraftState: memoizedUpdateDraftState,
    isLoading,
    allDraftPicks,
    ...draftStateProperties,
  };
};

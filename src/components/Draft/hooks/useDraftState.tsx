import { useMemo, useRef, useCallback } from "react";
import { useFirestore } from "../../../firebase/firebase";
import { DraftPick } from "../common";
import { getSecondsByRound } from "../PHLDraft/utils/draftHelpers";

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
    return this.currentRound > 7; // 7 rounds total
  }

  // Helper method to get formatted time remaining
  getFormattedTimeRemaining(): string {
    const minutes = Math.floor(this.seconds / 60);
    const remainingSeconds = this.seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Helper method to update to next pick
  advanceToNextPick(): void {
    if (this.currentPick >= 24) {
      // End of round — advance to round N+1, pick 1
      this.currentRound += 1;
      this.currentPick = 1;
      this.nextPick = 2;
    } else {
      this.currentPick = this.nextPick;
      this.nextPick = this.currentPick + 1;
    }

    // Reset timer based on round
    this.seconds = getSecondsByRound(this.currentRound);

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

    // If we have data, create a proper DraftStateObj instance
    if (draftStateData) {
      return new DraftStateObj(
        draftStateData.currentPick,
        draftStateData.currentRound,
        draftStateData.isPaused,
        draftStateData.seconds,
        draftStateData.endTime,
        draftStateData.nextPick,
        draftStateData.recentlyDraftedPlayerID,
        draftStateData.allDraftPicks,
        draftStateData.exportComplete,
      );
    }

    // If not loading and no data, create new instance (first load complete)
    return new DraftStateObj();
  }, [draftStateData, isLoading]);

  // Memoize the update function to prevent unnecessary re-renders of consumers
  const memoizedUpdateDraftState = useCallback(
    async (newState: any) => {
      try {
        await updateDraftState(newState);
      } catch (error) {
        console.error("Failed to update draft state:", error);
        throw error; // Re-throw to allow caller to handle
      }
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

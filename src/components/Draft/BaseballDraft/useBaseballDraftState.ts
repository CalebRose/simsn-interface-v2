import { useState, useEffect, useRef, useCallback } from "react";
import { baseball_ws } from "../../../_constants/urls";
import { BaseballService } from "../../../_services/baseballService";
import {
  BaseballDraftState,
  BaseballDraftPick,
  BaseballDraftWSMessage,
  BaseballDraftSigningStatus,
  DraftPhase,
  DraftPickMadeData,
} from "../../../models/baseball/baseballDraftModels";

interface UseBaseballDraftStateReturn {
  draftState: BaseballDraftState | null;
  allPicks: BaseballDraftPick[];
  currentPick: BaseballDraftPick | null;
  phase: DraftPhase;
  isPaused: boolean;
  secondsRemaining: number;
  currentRound: number;
  currentPickNumber: number;
  currentOverall: number;
  draftedPlayerIds: Set<number>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refetchState: () => Promise<void>;
}

export const useBaseballDraftState = (
  leagueYearId: number | null,
): UseBaseballDraftStateReturn => {
  const [draftState, setDraftState] = useState<BaseballDraftState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<Date | null>(null);

  // Compute derived state
  const allPicks = draftState?.all_picks ?? [];
  const phase: DraftPhase = draftState?.phase ?? "pre_draft";
  const isPaused = draftState?.is_paused ?? true;
  const currentRound = draftState?.current_round ?? 1;
  const currentPickNumber = draftState?.current_pick ?? 1;
  const currentOverall = draftState?.current_overall ?? 1;

  const currentPick =
    allPicks.find((p) => p.overall_pick === currentOverall) ?? null;

  const draftedPlayerIds = new Set(
    allPicks
      .filter((p) => p.selected_player_id != null)
      .map((p) => p.selected_player_id!),
  );

  // Client-side countdown timer
  const startCountdown = useCallback((endTimeStr: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const endTime = new Date(endTimeStr);
    endTimeRef.current = endTime;

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setSecondsRemaining(diff);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Fetch initial state
  const refetchState = useCallback(async () => {
    if (!leagueYearId) return;
    try {
      setIsLoading(true);
      const state = await BaseballService.GetDraftState(leagueYearId);
      setDraftState(state);
      if (state.end_time && !state.is_paused && state.phase === "drafting") {
        startCountdown(state.end_time);
      } else {
        setSecondsRemaining(state.seconds_remaining ?? 0);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load draft state");
      console.error("Draft state fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [leagueYearId, startCountdown]);

  // Handle websocket messages
  const handleWSMessage = useCallback(
    (msg: BaseballDraftWSMessage) => {
      switch (msg.type) {
        case "draft_state":
          setDraftState(msg.data);
          if (msg.data.end_time && !msg.data.is_paused && msg.data.phase === "drafting") {
            startCountdown(msg.data.end_time);
          } else {
            setSecondsRemaining(msg.data.seconds_remaining ?? 0);
            stopCountdown();
          }
          break;

        case "draft_pick_made": {
          const d = msg.data as DraftPickMadeData;
          setDraftState((prev) => {
            if (!prev) return prev;
            const updatedPicks = prev.all_picks.map((p) =>
              p.id === d.pick.id ? d.pick : p,
            );
            return {
              ...prev,
              all_picks: updatedPicks,
              current_round: d.current_round,
              current_pick: d.current_pick,
              current_overall: d.current_overall,
              seconds_remaining: d.seconds_remaining,
              end_time: d.end_time,
            };
          });
          if (d.end_time) {
            startCountdown(d.end_time);
          }
          break;
        }

        case "draft_timer_update":
          setDraftState((prev) =>
            prev
              ? {
                  ...prev,
                  seconds_remaining: msg.data.seconds_remaining,
                  end_time: msg.data.end_time,
                }
              : prev,
          );
          if (msg.data.end_time) {
            startCountdown(msg.data.end_time);
          }
          break;

        case "draft_paused":
          setDraftState((prev) =>
            prev ? { ...prev, is_paused: msg.data.is_paused } : prev,
          );
          if (msg.data.is_paused) {
            stopCountdown();
          } else if (draftState?.end_time) {
            startCountdown(draftState.end_time);
          }
          break;

        case "draft_phase_change":
          setDraftState((prev) =>
            prev ? { ...prev, phase: msg.data.phase } : prev,
          );
          if (msg.data.phase !== "drafting") {
            stopCountdown();
          }
          break;

        case "draft_signing_update":
          // Signing updates are handled at the useBaseballDraft level
          break;
      }
    },
    [startCountdown, stopCountdown, draftState?.end_time],
  );

  // Connect websocket
  useEffect(() => {
    if (!leagueYearId) return;

    refetchState();

    const ws = new WebSocket(baseball_ws);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Baseball Draft WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Only handle draft-related messages
        if (data.type && data.type.startsWith("draft_")) {
          handleWSMessage(data as BaseballDraftWSMessage);
        }
      } catch {
        // Ignore non-JSON or non-draft messages (e.g., timestamp messages)
      }
    };

    ws.onerror = (err) => {
      console.error("Baseball Draft WebSocket error:", err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("Baseball Draft WebSocket closed");
    };

    return () => {
      ws.close();
      wsRef.current = null;
      stopCountdown();
    };
  }, [leagueYearId]);

  return {
    draftState,
    allPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    draftedPlayerIds,
    isConnected,
    isLoading,
    error,
    refetchState,
  };
};

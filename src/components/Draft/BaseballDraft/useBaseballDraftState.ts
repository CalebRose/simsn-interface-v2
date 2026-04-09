import { useState, useEffect, useRef, useCallback } from "react";
import { baseball_ws } from "../../../_constants/urls";
import { BaseballService } from "../../../_services/baseballService";
import {
  BaseballDraftState,
  BaseballDraftPick,
  BaseballDraftWSMessage,
  DraftPhase,
  RoundMode,
} from "../../../models/baseball/baseballDraftModels";

export interface UseBaseballDraftStateReturn {
  draftState: BaseballDraftState | null;
  boardPicks: BaseballDraftPick[];
  currentPick: BaseballDraftPick | null;
  phase: DraftPhase;
  isPaused: boolean;
  secondsRemaining: number;
  currentRound: number;
  currentPickNumber: number;
  currentOverall: number;
  currentRoundMode: RoundMode;
  autoRoundsLocked: boolean;
  totalRounds: number;
  picksPerRound: number;
  draftedPlayerIds: Set<number>;
  isAutoRoundsRunning: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refetchState: () => Promise<void>;
  refetchBoard: () => Promise<void>;
}

export const useBaseballDraftState = (
  leagueYearId: number | null,
): UseBaseballDraftStateReturn => {
  const [draftState, setDraftState] = useState<BaseballDraftState | null>(null);
  const [boardPicks, setBoardPicks] = useState<BaseballDraftPick[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isAutoRoundsRunning, setIsAutoRoundsRunning] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute derived state
  const phase: DraftPhase = draftState?.phase ?? "SETUP";
  const isPaused = phase === "PAUSED";
  const currentRound = draftState?.current_round ?? 1;
  const currentPickNumber = draftState?.current_pick ?? 1;
  const currentOverall = ((currentRound - 1) * (draftState?.picks_per_round ?? 30)) + currentPickNumber;
  const currentRoundMode: RoundMode = draftState?.current_round_mode ?? "live";
  const autoRoundsLocked = draftState?.auto_rounds_locked ?? false;
  const totalRounds = draftState?.total_rounds ?? 20;
  const picksPerRound = draftState?.picks_per_round ?? 30;

  const currentPick =
    boardPicks.find(
      (p) => p.round === currentRound && p.pick_in_round === currentPickNumber,
    ) ?? null;

  const draftedPlayerIds = new Set(
    boardPicks
      .filter((p) => p.player_id != null)
      .map((p) => p.player_id!),
  );

  // Client-side countdown timer using pick_deadline_at
  const startCountdown = useCallback((deadlineIso: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const deadline = new Date(deadlineIso);

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        // Server handles auto-pick on timer expiry; refetch state after short delay
        setTimeout(() => refetchState(), 2000);
      }
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

  // Manage timer based on state
  const syncTimer = useCallback(
    (state: BaseballDraftState) => {
      if (
        state.phase === "IN_PROGRESS" &&
        state.current_round_mode === "live" &&
        state.pick_deadline_at
      ) {
        startCountdown(state.pick_deadline_at);
      } else {
        stopCountdown();
        setSecondsRemaining(state.seconds_remaining ?? 0);
      }
    },
    [startCountdown, stopCountdown],
  );

  // Fetch state from API
  const refetchState = useCallback(async () => {
    if (!leagueYearId) return;
    try {
      const state = await BaseballService.GetDraftState(leagueYearId);
      setDraftState(state);
      syncTimer(state);
      setError(null);
    } catch (err) {
      setError("Failed to load draft state");
      console.error("Draft state fetch error:", err);
    }
  }, [leagueYearId, syncTimer]);

  // Fetch board (picks) from API
  const refetchBoard = useCallback(async () => {
    if (!leagueYearId) return;
    try {
      const res = await BaseballService.GetDraftBoard(leagueYearId);
      setBoardPicks(res.picks);
    } catch (err) {
      console.error("Draft board fetch error:", err);
    }
  }, [leagueYearId]);

  // Handle WebSocket messages
  const handleWSMessage = useCallback(
    (msg: BaseballDraftWSMessage) => {
      switch (msg.type) {
        case "draft_state_change": {
          // Refetch full state since phase/round changed
          refetchState();
          break;
        }

        case "draft_pick_made": {
          // Update the specific pick in the board
          setBoardPicks((prev) => {
            const idx = prev.findIndex((p) => p.pick_id === msg.pick_id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              player_id: msg.player_id,
              player_name: msg.player_name,
              is_auto_pick: msg.is_auto_pick,
              picked_at: new Date().toISOString(),
            };
            return updated;
          });

          // If draft is complete or auto round is next, refetch state
          if (msg.draft_complete || msg.auto_round_next) {
            refetchState();
          } else {
            // Advance state to next pick — refetch for accurate timer
            refetchState();
          }
          break;
        }

        case "draft_trade_completed": {
          // Pick ownership changed — refetch full board
          refetchBoard();
          break;
        }

        case "auto_rounds_started": {
          setIsAutoRoundsRunning(true);
          stopCountdown();
          break;
        }

        case "auto_rounds_completed": {
          setIsAutoRoundsRunning(false);
          refetchBoard();
          refetchState();
          break;
        }
      }
    },
    [refetchState, refetchBoard, stopCountdown],
  );

  // Initial load + WebSocket connection
  useEffect(() => {
    if (!leagueYearId) return;

    const init = async () => {
      setIsLoading(true);
      try {
        const [state, board] = await Promise.all([
          BaseballService.GetDraftState(leagueYearId),
          BaseballService.GetDraftBoard(leagueYearId),
        ]);
        setDraftState(state);
        setBoardPicks(board.picks);
        syncTimer(state);
        setError(null);
      } catch (err) {
        setError("Failed to load draft state");
        console.error("Draft init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Connect WebSocket
    const ws = new WebSocket(baseball_ws);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type.startsWith("draft_") || data.type === "auto_rounds_started" || data.type === "auto_rounds_completed") {
          handleWSMessage(data as BaseballDraftWSMessage);
        }
      } catch {
        // Ignore non-JSON or non-draft messages
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect after delay
      setTimeout(() => {
        if (wsRef.current === ws) {
          // Will reconnect on next effect cycle or manual reconnect
        }
      }, 3000);
    };

    return () => {
      ws.close();
      wsRef.current = null;
      stopCountdown();
    };
  }, [leagueYearId]);

  return {
    draftState,
    boardPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    currentRoundMode,
    autoRoundsLocked,
    totalRounds,
    picksPerRound,
    draftedPlayerIds,
    isAutoRoundsRunning,
    isConnected,
    isLoading,
    error,
    refetchState,
    refetchBoard,
  };
};

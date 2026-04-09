import React, { useState } from "react";
import {
  DraftPhase,
  BaseballDraftPick,
  RoundModeConfig,
  RoundMode,
  DraftInitializeParams,
  DraftInitializeResponse,
  AutoRoundsResponse,
  ROUNDS,
  PICKS_PER_ROUND,
  formatDraftTime,
} from "../../../models/baseball/baseballDraftModels";

interface BaseballAdminBoardProps {
  phase: DraftPhase;
  isPaused: boolean;
  currentRound: number;
  currentPickNumber: number;
  currentOverall: number;
  currentRoundMode: RoundMode;
  secondsRemaining: number;
  totalRounds: number;
  autoRoundsLocked: boolean;
  isAutoRoundsRunning: boolean;
  roundModes: RoundModeConfig[];
  leagueYearId: number | null;
  onInitializeDraft: (params: DraftInitializeParams) => Promise<DraftInitializeResponse>;
  onSetRoundModes: (modes: Record<string, string>) => Promise<void>;
  onStartDraft: () => Promise<void>;
  onPauseDraft: () => Promise<void>;
  onResumeDraft: () => Promise<void>;
  onResetTimer: () => Promise<void>;
  onRunAutoRounds: () => Promise<AutoRoundsResponse>;
  onAdvanceToSigning: () => Promise<void>;
  onExportDraft: () => Promise<void>;
  onCompleteDraft: () => Promise<void>;
  boardPicks: BaseballDraftPick[];
}

const phaseColors: Record<DraftPhase, string> = {
  SETUP: "bg-gray-600 text-gray-200",
  IN_PROGRESS: "bg-blue-600 text-blue-100",
  PAUSED: "bg-yellow-600 text-yellow-100",
  SIGNING: "bg-purple-600 text-purple-100",
  COMPLETE: "bg-green-600 text-green-100",
};

const BaseballAdminBoard: React.FC<BaseballAdminBoardProps> = ({
  phase,
  isPaused,
  currentRound,
  currentPickNumber,
  currentOverall,
  currentRoundMode,
  secondsRemaining,
  totalRounds,
  autoRoundsLocked,
  isAutoRoundsRunning,
  roundModes,
  leagueYearId,
  onInitializeDraft,
  onSetRoundModes,
  onStartDraft,
  onPauseDraft,
  onResumeDraft,
  onResetTimer,
  onRunAutoRounds,
  onAdvanceToSigning,
  onExportDraft,
  onCompleteDraft,
  boardPicks,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize form state
  const [initRounds, setInitRounds] = useState(20);
  const [initSecondsPerPick, setInitSecondsPerPick] = useState(60);
  const [initIsSnake, setInitIsSnake] = useState(false);
  const [initLiveRounds, setInitLiveRounds] = useState("1,2,3");

  // Round mode editor state
  const [editModes, setEditModes] = useState<Record<number, RoundMode>>({});

  // Sync round mode editor from props
  React.useEffect(() => {
    const modes: Record<number, RoundMode> = {};
    roundModes.forEach((r) => { modes[r.round] = r.mode; });
    setEditModes(modes);
  }, [roundModes]);

  const runAsync = async (key: string, fn: () => Promise<void>, msg?: string) => {
    setLoading(key);
    setError(null);
    setSuccessMsg(null);
    try {
      await fn();
      if (msg) setSuccessMsg(msg);
    } catch (err: any) {
      setError(err?.message || `Failed: ${key}`);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (key: string) => loading === key;

  const handleInitialize = () => {
    if (!leagueYearId) return;
    const liveRoundsArr = initLiveRounds
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    runAsync("init", async () => {
      const result = await onInitializeDraft({
        league_year_id: leagueYearId,
        total_rounds: initRounds,
        seconds_per_pick: initSecondsPerPick,
        is_snake: initIsSnake,
        live_rounds: liveRoundsArr,
      });
      setSuccessMsg(
        `Draft initialized: ${result.total_picks} picks, ${result.eligible_players} eligible players`,
      );
    });
  };

  const handleSaveRoundModes = () => {
    if (!leagueYearId) return;
    const modes: Record<string, string> = {};
    Object.entries(editModes).forEach(([round, mode]) => {
      modes[round] = mode;
    });
    runAsync("roundModes", () => onSetRoundModes(modes), "Round modes updated");
  };

  const handleRunAutoRounds = () => {
    runAsync("autoRounds", async () => {
      const result = await onRunAutoRounds();
      setSuccessMsg(`Auto rounds complete: ${result.picks_made} picks made`);
    });
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      <h2 className="text-xl font-bold">Draft Administration</h2>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">{error}</div>
      )}
      {successMsg && (
        <div className="rounded bg-green-900/50 px-4 py-2 text-sm text-green-300">{successMsg}</div>
      )}

      {/* Section 1: Draft Controls */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Draft Controls</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded px-3 py-1 text-sm font-medium ${phaseColors[phase]}`}>
            {phase.replace("_", " ")}
          </span>

          {phase === "SETUP" && (
            <button
              onClick={() => runAsync("start", onStartDraft)}
              disabled={isLoading("start")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading("start") ? "Starting..." : "Start Draft"}
            </button>
          )}

          {phase === "IN_PROGRESS" && (
            <>
              <button
                onClick={() => runAsync("pause", onPauseDraft)}
                disabled={isLoading("pause")}
                className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
              >
                {isLoading("pause") ? "Pausing..." : "Pause"}
              </button>
              {currentRoundMode === "live" && (
                <button
                  onClick={() => runAsync("resetTimer", onResetTimer)}
                  disabled={isLoading("resetTimer")}
                  className="rounded bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
                >
                  {isLoading("resetTimer") ? "Resetting..." : "Reset Timer"}
                </button>
              )}
            </>
          )}

          {phase === "PAUSED" && (
            <button
              onClick={() => runAsync("resume", onResumeDraft)}
              disabled={isLoading("resume")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading("resume") ? "Resuming..." : "Resume"}
            </button>
          )}
        </div>
      </section>

      {/* Section 2: Initialize Draft (SETUP only) */}
      {phase === "SETUP" && (
        <section className="rounded border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-300">Initialize Draft</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Total Rounds</label>
              <input
                type="number"
                min={1}
                max={50}
                value={initRounds}
                onChange={(e) => setInitRounds(Number(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Seconds Per Pick</label>
              <input
                type="number"
                min={15}
                max={600}
                value={initSecondsPerPick}
                onChange={(e) => setInitSecondsPerPick(Number(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Live Rounds (comma-separated)</label>
              <input
                type="text"
                value={initLiveRounds}
                onChange={(e) => setInitLiveRounds(e.target.value)}
                placeholder="1,2,3"
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initIsSnake}
                  onChange={(e) => setInitIsSnake(e.target.checked)}
                  className="accent-blue-500"
                />
                Snake Draft
              </label>
            </div>
          </div>
          <button
            onClick={handleInitialize}
            disabled={isLoading("init")}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading("init") ? "Initializing..." : "Initialize Draft"}
          </button>
        </section>
      )}

      {/* Section 3: Round Mode Editor (SETUP only) */}
      {phase === "SETUP" && roundModes.length > 0 && (
        <section className="rounded border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-300">Round Modes</h3>
          {autoRoundsLocked && (
            <div className="mb-3 rounded bg-red-900/30 px-3 py-2 text-xs text-red-300">
              Round modes are locked — auto rounds have started.
            </div>
          )}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((roundNum) => {
              const mode = editModes[roundNum] ?? "auto";
              const isLive = mode === "live";
              return (
                <button
                  key={roundNum}
                  onClick={() => {
                    if (!autoRoundsLocked) {
                      setEditModes((prev) => ({
                        ...prev,
                        [roundNum]: isLive ? "auto" : "live",
                      }));
                    }
                  }}
                  disabled={autoRoundsLocked}
                  className={`
                    flex flex-col items-center rounded p-2 text-xs font-medium transition-colors
                    ${isLive ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}
                    ${autoRoundsLocked ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}
                  `}
                >
                  <span className="font-bold">R{roundNum}</span>
                  <span className="text-[10px]">{isLive ? "Live" : "Auto"}</span>
                </button>
              );
            })}
          </div>
          {!autoRoundsLocked && (
            <button
              onClick={handleSaveRoundModes}
              disabled={isLoading("roundModes")}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading("roundModes") ? "Saving..." : "Save Round Modes"}
            </button>
          )}
        </section>
      )}

      {/* Section 4: Auto Rounds */}
      {phase === "IN_PROGRESS" && currentRoundMode === "auto" && (
        <section className="rounded border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-300">Auto Rounds</h3>
          <p className="text-sm text-gray-400 mb-3">
            Live rounds are complete. Trigger auto rounds to process remaining picks based on team preferences and BPA.
          </p>
          <button
            onClick={handleRunAutoRounds}
            disabled={isLoading("autoRounds") || isAutoRoundsRunning}
            className="rounded bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-500 disabled:opacity-50"
          >
            {isLoading("autoRounds") || isAutoRoundsRunning
              ? "Processing Auto Rounds..."
              : "Run Auto Rounds"}
          </button>
          {isAutoRoundsRunning && (
            <p className="mt-2 text-xs text-orange-400 animate-pulse">
              Auto rounds are being processed. This may take a few seconds...
            </p>
          )}
        </section>
      )}

      {/* Section 5: Current Pick Info */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Current Pick Info</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Round</p>
            <p className="text-2xl font-bold">{currentRound}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Pick</p>
            <p className="text-2xl font-bold">{currentPickNumber}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Overall</p>
            <p className="text-2xl font-bold">{currentOverall}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Mode</p>
            <p className={`text-lg font-bold ${currentRoundMode === "live" ? "text-blue-400" : "text-gray-400"}`}>
              {currentRoundMode === "live" ? "LIVE" : "AUTO"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Timer</p>
            <p className="text-2xl font-bold font-mono">
              {currentRoundMode === "live" ? formatDraftTime(secondsRemaining) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Phase Transitions */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Phase Transitions</h3>
        <div className="flex flex-wrap gap-3">
          {(phase === "IN_PROGRESS" || phase === "PAUSED") && (
            <button
              onClick={() => runAsync("signing", onAdvanceToSigning)}
              disabled={isLoading("signing")}
              className="rounded bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
            >
              {isLoading("signing") ? "Advancing..." : "Advance to Signing Phase"}
            </button>
          )}
          {(phase === "SIGNING" || phase === "COMPLETE") && (
            <button
              onClick={() => runAsync("export", onExportDraft)}
              disabled={isLoading("export")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading("export") ? "Exporting..." : "Export Draft"}
            </button>
          )}
          {phase === "SIGNING" && (
            <button
              onClick={() => runAsync("complete", onCompleteDraft)}
              disabled={isLoading("complete")}
              className="rounded bg-green-700 px-4 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading("complete") ? "Completing..." : "Complete Draft"}
            </button>
          )}
          {phase === "SETUP" && (
            <p className="text-sm text-gray-500">
              Initialize and start the draft before managing phase transitions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BaseballAdminBoard;

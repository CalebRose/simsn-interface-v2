import React, { useState } from "react";
import {
  DraftPhase,
  BaseballDraftPick,
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
  secondsRemaining: number;
  onStartDraft: () => Promise<void>;
  onPauseDraft: () => Promise<void>;
  onResumeDraft: () => Promise<void>;
  onResetTimer: () => Promise<void>;
  onSetPick: (round: number, pick: number) => Promise<void>;
  onRemovePlayer: (pickId: number) => Promise<void>;
  onAdvanceToSigning: () => Promise<void>;
  onExportDraft: () => Promise<void>;
  allPicks: BaseballDraftPick[];
}

const phaseColors: Record<DraftPhase, string> = {
  pre_draft: "bg-gray-600 text-gray-200",
  drafting: "bg-blue-600 text-blue-100",
  signing: "bg-yellow-600 text-yellow-100",
  complete: "bg-green-600 text-green-100",
};

const BaseballAdminBoard: React.FC<BaseballAdminBoardProps> = ({
  phase,
  isPaused,
  currentRound,
  currentPickNumber,
  currentOverall,
  secondsRemaining,
  onStartDraft,
  onPauseDraft,
  onResumeDraft,
  onResetTimer,
  onSetPick,
  onRemovePlayer,
  onAdvanceToSigning,
  onExportDraft,
  allPicks,
}) => {
  const [navRound, setNavRound] = useState(1);
  const [navPick, setNavPick] = useState(1);
  const [removePickId, setRemovePickId] = useState<number | "">("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const picksWithPlayers = allPicks.filter((p) => p.selected_player_id !== null);

  const runAsync = async (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    setError(null);
    try {
      await fn();
    } catch (err: any) {
      setError(err?.message || `Failed: ${key}`);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (key: string) => loading === key;

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      {/* Header */}
      <h2 className="text-xl font-bold">Draft Administration</h2>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Section 1: Draft Controls */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Draft Controls</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded px-3 py-1 text-sm font-medium ${phaseColors[phase]}`}>
            {phase.replace("_", " ").toUpperCase()}
          </span>

          {phase === "pre_draft" && (
            <button
              onClick={() => runAsync("start", onStartDraft)}
              disabled={isLoading("start")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading("start") ? "Starting..." : "Start Draft"}
            </button>
          )}

          {phase === "drafting" && (
            <>
              {isPaused ? (
                <button
                  onClick={() => runAsync("resume", onResumeDraft)}
                  disabled={isLoading("resume")}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
                >
                  {isLoading("resume") ? "Resuming..." : "Resume"}
                </button>
              ) : (
                <button
                  onClick={() => runAsync("pause", onPauseDraft)}
                  disabled={isLoading("pause")}
                  className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
                >
                  {isLoading("pause") ? "Pausing..." : "Pause"}
                </button>
              )}
              <button
                onClick={() => runAsync("resetTimer", onResetTimer)}
                disabled={isLoading("resetTimer")}
                className="rounded bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
              >
                {isLoading("resetTimer") ? "Resetting..." : "Reset Timer"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Section 2: Navigation */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Navigation</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Round</label>
            <select
              value={navRound}
              onChange={(e) => setNavRound(Number(e.target.value))}
              className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
            >
              {Array.from({ length: ROUNDS }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Pick</label>
            <select
              value={navPick}
              onChange={(e) => setNavPick(Number(e.target.value))}
              className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
            >
              {Array.from({ length: PICKS_PER_ROUND }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Pick {p}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => runAsync("setPick", () => onSetPick(navRound, navPick))}
            disabled={isLoading("setPick")}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading("setPick") ? "Going..." : "Go to Pick"}
          </button>
        </div>
      </section>

      {/* Section 3: Current Pick Info */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Current Pick Info</h3>
        <div className="grid grid-cols-4 gap-4">
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
            <p className="text-xs text-gray-400">Timer</p>
            <p className="text-2xl font-bold font-mono">
              {formatDraftTime(secondsRemaining)}
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Pick Management */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Pick Management</h3>
        {picksWithPlayers.length > 0 ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-400">Select Pick</label>
              <select
                value={removePickId}
                onChange={(e) =>
                  setRemovePickId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              >
                <option value="">Choose a pick...</option>
                {picksWithPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Rd {p.round} Pick {p.pick_number} — {p.selected_player_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (removePickId)
                  runAsync("remove", () => onRemovePlayer(removePickId as number));
              }}
              disabled={!removePickId || isLoading("remove")}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
            >
              {isLoading("remove") ? "Removing..." : "Remove Player"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No picks with selected players.</p>
        )}
      </section>

      {/* Section 5: Phase Transitions */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Phase Transitions</h3>
        <div className="flex flex-wrap gap-3">
          {phase === "drafting" && (
            <button
              onClick={() => runAsync("signing", onAdvanceToSigning)}
              disabled={isLoading("signing")}
              className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
            >
              {isLoading("signing")
                ? "Advancing..."
                : "Advance to Signing Phase"}
            </button>
          )}
          {(phase === "signing" || phase === "complete") && (
            <button
              onClick={() => runAsync("export", onExportDraft)}
              disabled={isLoading("export")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading("export")
                ? "Exporting..."
                : "Export & Finalize Draft"}
            </button>
          )}
          {phase === "pre_draft" && (
            <p className="text-sm text-gray-500">
              Start the draft before managing phase transitions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BaseballAdminBoard;

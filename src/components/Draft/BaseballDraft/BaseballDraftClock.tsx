import React from "react";
import {
  BaseballDraftPick,
  DraftPhase,
  RoundMode,
  formatDraftTime,
} from "../../../models/baseball/baseballDraftModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB } from "../../../_constants/constants";

interface BaseballDraftClockProps {
  currentPick: BaseballDraftPick | null;
  currentRound: number;
  currentPickNumber: number;
  secondsRemaining: number;
  phase: DraftPhase;
  currentRoundMode: RoundMode;
  isUserTurn: boolean;
  orgMap: Record<number, string>;
}

const BaseballDraftClock: React.FC<BaseballDraftClockProps> = ({
  currentPick,
  currentRound,
  currentPickNumber,
  secondsRemaining,
  phase,
  currentRoundMode,
  isUserTurn,
  orgMap,
}) => {
  const isPaused = phase === "PAUSED";
  const isAutoRound = currentRoundMode === "auto";

  const timerColor =
    secondsRemaining > 60
      ? "text-green-400"
      : secondsRemaining > 30
        ? "text-yellow-400"
        : "text-red-500";

  const timerPulse = secondsRemaining < 10 && !isAutoRound && !isPaused ? "animate-pulse" : "";

  const logoSrc = currentPick
    ? getLogo(SimMLB, currentPick.current_org_id, false)
    : "";

  const orgAbbrev = currentPick ? (orgMap[currentPick.current_org_id] ?? "") : "";

  return (
    <div className="relative flex flex-col items-center gap-3 rounded-lg bg-gray-800 p-4 text-white">
      {/* Header */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
        On the Clock
      </h3>

      {/* Org logo + abbrev */}
      {currentPick && (
        <div className="flex flex-col items-center gap-1">
          <img
            src={logoSrc}
            alt={orgAbbrev}
            className="h-14 w-14 object-contain"
          />
          <span className="text-sm font-semibold">
            {orgAbbrev}
          </span>
        </div>
      )}

      {/* Round / Pick */}
      <div className="text-center text-xs text-gray-400">
        Round {currentRound}, Pick {currentPickNumber}
      </div>

      {/* Timer or Auto indicator */}
      {isAutoRound ? (
        <div className="rounded bg-gray-600 px-4 py-2 text-lg font-bold uppercase tracking-wide text-gray-300">
          Auto Round
        </div>
      ) : (
        <div
          className={`text-4xl font-mono font-bold ${timerColor} ${timerPulse}`}
        >
          {formatDraftTime(secondsRemaining)}
        </div>
      )}

      {/* YOUR PICK indicator */}
      {isUserTurn && (
        <div className="rounded bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          Your Pick!
        </div>
      )}

      {/* PAUSED overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70">
          <span className="text-2xl font-bold uppercase tracking-widest text-yellow-400">
            Paused
          </span>
        </div>
      )}
    </div>
  );
};

export default BaseballDraftClock;

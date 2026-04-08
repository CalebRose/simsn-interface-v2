import React, { FC, useState, useEffect, useCallback } from "react";
import {
  BaseballDraftPick,
  RoundModeConfig,
} from "../../../models/baseball/baseballDraftModels";
import BaseballDraftPickCard from "./BaseballDraftPickCard";

interface BaseballBigBoardProps {
  boardPicks: BaseballDraftPick[];
  currentOverall: number;
  currentRound: number;
  totalRounds: number;
  userOrgId: number | null;
  orgMap: Record<number, string>;
  roundModes: RoundModeConfig[];
  showSignStatus?: boolean;
  onPickClick?: (pick: BaseballDraftPick) => void;
}

const BaseballBigBoard: FC<BaseballBigBoardProps> = ({
  boardPicks,
  currentOverall,
  currentRound,
  totalRounds,
  userOrgId,
  orgMap,
  roundModes,
  showSignStatus = false,
  onPickClick,
}) => {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([currentRound]));

  const modeMap = new Map(roundModes.map((r) => [r.round, r.mode]));

  // Keep current round expanded when it changes
  useEffect(() => {
    setExpandedRounds((prev) => {
      if (prev.has(currentRound)) return prev;
      const next = new Set(prev);
      next.add(currentRound);
      return next;
    });
  }, [currentRound]);

  const toggleRound = useCallback((roundNum: number) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(roundNum)) {
        next.delete(roundNum);
      } else {
        next.add(roundNum);
      }
      return next;
    });
  }, []);

  const jumpToCurrentRound = useCallback(() => {
    setExpandedRounds(new Set([currentRound]));
    // Scroll to current round element
    const el = document.getElementById(`draft-round-${currentRound}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentRound]);

  const expandAll = useCallback(() => {
    setExpandedRounds(new Set(Array.from({ length: totalRounds }, (_, i) => i + 1)));
  }, [totalRounds]);

  const collapseAll = useCallback(() => {
    setExpandedRounds(new Set());
  }, []);

  return (
    <div className="bg-gray-950 p-4 rounded-lg space-y-2">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={jumpToCurrentRound}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
        >
          Jump to Current Round
        </button>
        <button
          onClick={expandAll}
          className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Collapse All
        </button>
      </div>

      {/* Rounds */}
      {Array.from({ length: totalRounds }, (_, i) => i + 1).map((roundNum) => {
        const roundPicks = boardPicks.filter((p) => p.round === roundNum);
        const isExpanded = expandedRounds.has(roundNum);
        const isCurrent = roundNum === currentRound;
        const mode = modeMap.get(roundNum) ?? "auto";
        const isLive = mode === "live";
        const filledCount = roundPicks.filter((p) => p.player_id != null).length;

        return (
          <div key={roundNum} id={`draft-round-${roundNum}`}>
            {/* Round header — always visible */}
            <button
              onClick={() => toggleRound(roundNum)}
              className={`
                w-full flex items-center justify-between gap-3 p-2.5 rounded font-semibold text-white transition-colors
                ${isCurrent ? "bg-blue-700" : "bg-gray-800 hover:bg-gray-700"}
              `}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isExpanded ? "rotate-90" : ""} transition-transform`}>
                  ▶
                </span>
                <span>Round {roundNum}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    isLive ? "bg-blue-500/30 text-blue-300" : "bg-gray-600/50 text-gray-400"
                  }`}
                >
                  {isLive ? "Live" : "Auto"}
                </span>
                {isCurrent && (
                  <span className="rounded bg-yellow-500/30 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                    Current
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {filledCount}/{roundPicks.length} picks
              </span>
            </button>

            {/* Round picks — only rendered when expanded */}
            {isExpanded && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-2 pl-2">
                {roundPicks.map((pick) => (
                  <BaseballDraftPickCard
                    key={pick.pick_id}
                    pick={pick}
                    orgMap={orgMap}
                    isCurrent={pick.overall_pick === currentOverall}
                    isUserPick={pick.current_org_id === userOrgId}
                    showSignStatus={showSignStatus}
                    size="md"
                    onClick={() => onPickClick?.(pick)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BaseballBigBoard;

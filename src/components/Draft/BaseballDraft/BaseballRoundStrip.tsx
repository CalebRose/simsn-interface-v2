import React from "react";
import { RoundModeConfig } from "../../../models/baseball/baseballDraftModels";

interface BaseballRoundStripProps {
  roundModes: RoundModeConfig[];
  currentRound: number;
  totalRounds: number;
  onRoundClick?: (round: number) => void;
}

const BaseballRoundStrip: React.FC<BaseballRoundStripProps> = ({
  roundModes,
  currentRound,
  totalRounds,
  onRoundClick,
}) => {
  const modeMap = new Map(roundModes.map((r) => [r.round, r.mode]));

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 px-1">
      {Array.from({ length: totalRounds }, (_, i) => i + 1).map((roundNum) => {
        const mode = modeMap.get(roundNum) ?? "auto";
        const isCurrent = roundNum === currentRound;
        const isLive = mode === "live";

        return (
          <button
            key={roundNum}
            onClick={() => onRoundClick?.(roundNum)}
            className={`
              flex-shrink-0 flex items-center justify-center rounded
              w-8 h-8 text-xs font-bold transition-all
              ${isLive ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}
              ${isCurrent ? "ring-2 ring-yellow-400 scale-110" : ""}
              ${onRoundClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}
            `}
            title={`Round ${roundNum} (${isLive ? "Live" : "Auto"})${isCurrent ? " - Current" : ""}`}
          >
            {roundNum}
          </button>
        );
      })}
    </div>
  );
};

export default BaseballRoundStrip;

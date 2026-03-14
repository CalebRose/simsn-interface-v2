import React, { FC } from "react";
import {
  BaseballDraftPick,
  ROUNDS,
} from "../../../models/baseball/baseballDraftModels";
import BaseballDraftPickCard from "./BaseballDraftPickCard";

interface BaseballBigBoardProps {
  allPicks: BaseballDraftPick[];
  currentOverall: number;
  userOrgId: number | null;
  onPickClick?: (pick: BaseballDraftPick) => void;
}

const BaseballBigBoard: FC<BaseballBigBoardProps> = ({
  allPicks,
  currentOverall,
  userOrgId,
  onPickClick,
}) => {
  return (
    <div className="bg-gray-950 p-4 rounded-lg space-y-6">
      {Array.from({ length: ROUNDS }, (_, i) => i + 1).map((roundNum) => {
        const roundPicks = allPicks.filter((p) => p.round === roundNum);

        return (
          <div key={roundNum}>
            <div className="bg-gray-800 text-white p-2 rounded font-semibold mb-2">
              Round {roundNum}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {roundPicks.map((pick) => (
                <BaseballDraftPickCard
                  key={pick.id}
                  pick={pick}
                  isCurrent={pick.overall_pick === currentOverall}
                  isUserPick={pick.org_id === userOrgId}
                  size="md"
                  onClick={() => onPickClick?.(pick)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BaseballBigBoard;

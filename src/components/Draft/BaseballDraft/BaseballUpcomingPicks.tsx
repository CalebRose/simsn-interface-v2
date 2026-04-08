import React from "react";
import { BaseballDraftPick } from "../../../models/baseball/baseballDraftModels";
import BaseballDraftPickCard from "./BaseballDraftPickCard";

interface BaseballUpcomingPicksProps {
  upcomingPicks: BaseballDraftPick[];
  currentPick: BaseballDraftPick | null;
  userOrgId: number | null;
  orgMap: Record<number, string>;
}

const BaseballUpcomingPicks: React.FC<BaseballUpcomingPicksProps> = ({
  upcomingPicks,
  currentPick,
  userOrgId,
  orgMap,
}) => {
  const visiblePicks = upcomingPicks.slice(0, 5);

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2">
      {visiblePicks.map((pick) => {
        const isCurrent =
          currentPick !== null && pick.pick_id === currentPick.pick_id;
        const isUserPick =
          userOrgId !== null && pick.current_org_id === userOrgId;

        return (
          <BaseballDraftPickCard
            key={pick.pick_id}
            pick={pick}
            orgMap={orgMap}
            isCurrent={isCurrent}
            isUserPick={isUserPick}
            size="sm"
          />
        );
      })}
    </div>
  );
};

export default BaseballUpcomingPicks;

import React from "react";
import { Draftee, DraftPick } from "./types";
import { League } from "../../../_constants/constants";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { UpcomingPick } from "./DraftPick";

interface BigDraftBoardProps {
  league: League;
  backgroundColor: string;
  draftPicks: DraftPick[];
  selectedTeam: ProfessionalTeam | null;
  draftablePlayerMap: Record<number, Draftee>;
  currentPick: DraftPick | null;
}

export const BigDraftBoard: React.FC<BigDraftBoardProps> = ({
  league,
  backgroundColor,
  draftPicks,
  selectedTeam,
  draftablePlayerMap,
  currentPick,
}) => {
  return (
    <div
      className="w-full overflow-y-auto max-h-[85vh] p-4 shadow-md rounded-lg"
      style={{ backgroundColor }}
    >
      <div className="grid grid-cols-4 gap-4">
        {draftPicks.map((pick, index: number) => (
          <UpcomingPick
            pick={pick}
            index={index}
            userTeamId={selectedTeam?.ID}
            league={league}
            currentPick={currentPick}
            view="bigboard"
            draftablePlayerMap={draftablePlayerMap}
          />
        ))}
      </div>
    </div>
  );
};

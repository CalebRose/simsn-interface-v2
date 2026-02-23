import React from "react";
import { Draftee, DraftPick } from "./types";
import { League, ModalAction } from "../../../_constants/constants";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { DraftPickCard } from "./DraftPick";
import { NFLTeam } from "../../../models/footballModels";

interface BigDraftBoardProps {
  league: League;
  backgroundColor: string;
  draftPicks: DraftPick[];
  selectedTeam: ProfessionalTeam | NFLTeam | null;
  draftablePlayerMap: Record<number, Draftee>;
  currentPick: DraftPick | null;
  handlePlayerModal?: (action: ModalAction, player: Draftee) => void;
}

export const BigDraftBoard: React.FC<BigDraftBoardProps> = ({
  league,
  backgroundColor,
  draftPicks,
  selectedTeam,
  draftablePlayerMap,
  currentPick,
  handlePlayerModal,
}) => {
  return (
    <div
      className="w-full overflow-y-auto max-h-[85vh] p-4 shadow-md rounded-lg"
      style={{ backgroundColor }}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {draftPicks.map((pick, index: number) => (
          <DraftPickCard
            pick={pick}
            index={index}
            userTeamId={selectedTeam?.ID}
            league={league}
            currentPick={currentPick}
            view="bigboard"
            draftablePlayerMap={draftablePlayerMap}
            handlePlayerModal={handlePlayerModal}
          />
        ))}
      </div>
    </div>
  );
};

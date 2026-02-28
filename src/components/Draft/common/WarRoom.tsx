import React, { useMemo } from "react";
import { League, SimPHL } from "../../../_constants/constants";
import { Draftee, DraftPick as DraftPickType } from "./types";
import { Text } from "../../../_design/Typography";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { WarRoomDraftPick } from "./DraftPick";
import { NFLTeam } from "../../../models/footballModels";
import { AnyTradeProposal, WarRoomDoc } from "../hooks/useDraftTradeState";
import { Button } from "../../../_design/Buttons";

interface DraftWarRoomProps {
  league: League;
  backgroundColor: string;
  teamDraftPicks: DraftPickType[];
  selectedTeam: ProfessionalTeam | NFLTeam | null;
  draftablePlayerMap: Record<number, Draftee>;
  handleOpenProposeTradeModal: () => void;
  handleOpenReceiveTradeModal: () => void;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  league,
  backgroundColor,
  teamDraftPicks,
  selectedTeam,
  draftablePlayerMap,
  handleOpenProposeTradeModal,
  handleOpenReceiveTradeModal,
}) => {
  const teamLabel = useMemo(() => {
    if (!selectedTeam) return "No team selected";
    if (league === SimPHL) {
      return `${selectedTeam.TeamName}`;
    }
    return selectedTeam.TeamName;
  }, [selectedTeam, league]);

  const draftPickCount = useMemo(() => {
    return `Total Picks: ${teamDraftPicks.length}`;
  }, [teamDraftPicks]);

  return (
    <>
      <div className="w-full p-4" style={{ backgroundColor }}>
        <Text variant="h3" className="mb-4">
          War Room - {teamLabel}
        </Text>
        <Text variant="body-small" className="mb-4">
          {draftPickCount}
        </Text>
        <div className="grid grid-cols-1 xl:grid-cols-2 mb-4 gap-4">
          <div className="flex">
            <Text variant="body-small" className="mb-4">
              Propose Trade
            </Text>
            <Button onClick={handleOpenProposeTradeModal}>Propose</Button>
          </div>

          <div className="flex">
            <Text variant="body-small" className="mb-4">
              View Trades
            </Text>
            <Button onClick={handleOpenReceiveTradeModal}>View</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 mb-4 gap-4">
          {teamDraftPicks.map((pick) => (
            <WarRoomDraftPick
              key={pick.ID}
              pick={pick}
              league={league}
              draftablePlayerMap={draftablePlayerMap}
            />
          ))}
        </div>
      </div>
    </>
  );
};

import React, { useMemo } from "react";
import { League, SimNBA, SimPHL } from "../../../_constants/constants";
import { Draftee, DraftPick as DraftPickType } from "./types";
import { Text } from "../../../_design/Typography";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { WarRoomDraftPick } from "./DraftPick";
import { NFLTeam } from "../../../models/footballModels";
import { AnyTradeProposal, WarRoomDoc } from "../hooks/useDraftTradeState";
import { Button } from "../../../_design/Buttons";
import { NBATeam } from "../../../models/basketballModels";

interface DraftWarRoomProps {
  league: League;
  backgroundColor: string;
  teamDraftPicks: DraftPickType[];
  selectedTeam: ProfessionalTeam | NFLTeam | NBATeam | null;
  draftablePlayerMap: Record<number, Draftee>;
  canTrade?: boolean;
  handleOpenProposeTradeModal?: () => void;
  handleOpenReceiveTradeModal?: () => void;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  league,
  backgroundColor,
  teamDraftPicks,
  selectedTeam,
  draftablePlayerMap,
  canTrade = false,
  handleOpenProposeTradeModal,
  handleOpenReceiveTradeModal,
}) => {
  const teamLabel = useMemo(() => {
    if (!selectedTeam) return "No team selected";
    if (league === SimNBA) {
      const t = selectedTeam as NBATeam;
      return `${t.Team}`;
    }
    if (league === SimPHL) {
      const t = selectedTeam as ProfessionalTeam;
      return `${t.TeamName}`;
    }
    const t = selectedTeam as NFLTeam;
    return t.TeamName;
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
        {canTrade && (
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
        )}
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

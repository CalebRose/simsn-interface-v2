import React, { useMemo } from "react";
import { League, SimPHL } from "../../../_constants/constants";
import { Draftee, DraftPick as DraftPickType } from "./types";
import { Text } from "../../../_design/Typography";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { WarRoomDraftPick } from "./DraftPick";

interface DraftWarRoomProps {
  league: League;
  backgroundColor: string;
  teamDraftPicks: DraftPickType[];
  selectedTeam: ProfessionalTeam | null;
  draftablePlayerMap: Record<number, Draftee>;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  league,
  backgroundColor,
  teamDraftPicks,
  selectedTeam,
  draftablePlayerMap,
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

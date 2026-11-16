import React, { useMemo, useState } from "react";
import { League, SimNBA, SimNFL, SimPHL } from "../../../_constants/constants";
import { Draftee, DraftPick as DraftPickType } from "./types";
import { Text } from "../../../_design/Typography";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { WarRoomDraftPick } from "./DraftPick";
import { NFLTeam } from "../../../models/footballModels";
import { AnyTradeProposal, WarRoomDoc } from "../hooks/useDraftTradeState";
import { Button } from "../../../_design/Buttons";
import { NBATeam } from "../../../models/basketballModels";
import { DraftService } from "../../../_services/draftService";

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

  const [isDownloadingCombine, setIsDownloadingCombine] = useState(false);
  const [isDownloadingProDays, setIsDownloadingProDays] = useState(false);

  const handleDownloadCombine = async () => {
    setIsDownloadingCombine(true);
    try {
      await DraftService.ExportCombineResults();
    } catch (e) {
      console.error("Failed to download combine results", e);
    } finally {
      setIsDownloadingCombine(false);
    }
  };

  const handleDownloadProDays = async () => {
    setIsDownloadingProDays(true);
    try {
      await DraftService.ExportProDayResults();
    } catch (e) {
      console.error("Failed to download pro day results", e);
    } finally {
      setIsDownloadingProDays(false);
    }
  };

  return (
    <>
      <div className="w-full p-4" style={{ backgroundColor }}>
        <Text variant="h3" className="mb-4">
          War Room - {teamLabel}
        </Text>
        <Text variant="body-small" className="mb-4">
          {draftPickCount}
        </Text>

        {league === SimNFL && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button
              variant="secondaryOutline"
              onClick={handleDownloadCombine}
              disabled={isDownloadingCombine}
            >
              {isDownloadingCombine
                ? "Downloading Combine..."
                : "Download Combine Results"}
            </Button>
            <Button
              variant="secondaryOutline"
              onClick={handleDownloadProDays}
              disabled={isDownloadingProDays}
            >
              {isDownloadingProDays
                ? "Downloading Pro Days..."
                : "Download Pro Day Results"}
            </Button>
          </div>
        )}

        {canTrade && (
          <div className="grid grid-cols-1 xl:grid-cols-2 mb-4 gap-4">
            <div className="flex items-center gap-[10px]">
              <Text variant="body-small">
                Propose Trade
              </Text>
              <Button onClick={handleOpenProposeTradeModal}>Propose</Button>
            </div>

            <div className="flex items-center gap-[10px]">
              <Text variant="body-small">
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

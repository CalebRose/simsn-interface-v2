import React, { useState, useCallback } from "react";
import { CollegePlayer, NFLPlayer } from "../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import { Text } from "../../../../_design/Typography";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { useModal } from "../../../../_hooks/useModal";
import { Modal } from "../../../../_design/Modal";
import {
  CFBPlayerInfoModalBody,
  NFLDepthChartInfoModalBody,
} from "../../../Common/Modals";
import {
  POSITION_LIMITS,
  OFFENSIVE_POSITIONS,
  DEFENSIVE_POSITIONS,
  SPECIAL_TEAMS_POSITIONS,
} from "../Constants/DepthChartConstants";
import DepthChartModal from "./Modal/DepthChartModal";
import { GetNFLOverall } from "../../../Team/TeamPageUtils";
import { getCFBOverall } from "../../../../_utility/getLetterGrade";
import { getRatingBgColor } from "../Utils/GameplanPlayerUtils";
import { ArrowsUpDown } from "../../../../_design/Icons";

interface DepthChartManagerProps {
  players: (CollegePlayer | NFLPlayer)[];
  depthChart: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  selectedPosition: string;
  onPlayerMove: (
    playerId: number,
    position: string,
    positionLevel: number,
  ) => void;
  onPlayerSwap: (
    fromPlayerId: number,
    toPlayerId: number,
    position: string,
    fromLevel: number,
    toLevel: number,
  ) => void;
  onPositionChange: (position: string) => void;
  onFormationTypeChange?: (
    formationType: "offense" | "defense" | "specialteams",
  ) => void;
  canModify?: boolean;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  isValid: boolean;
  hasUnsavedChanges: boolean;
  borderColor?: string;
  backgroundColor?: string;
  accentColor?: string;
}

const DepthChartManager: React.FC<DepthChartManagerProps> = ({
  players,
  depthChart,
  team,
  league,
  selectedPosition,
  onPlayerMove,
  onPlayerSwap,
  onPositionChange,
  onFormationTypeChange,
  canModify = true,
  onSave,
  onReset,
  isSaving,
  isValid,
  hasUnsavedChanges,
  borderColor,
  backgroundColor,
  accentColor,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<"OFF" | "DEF" | "ST">(
    "OFF",
  );
  const [modalPosition, setModalPosition] = useState<string>("");
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayer, setModalPlayer] = useState<
    CollegePlayer | NFLPlayer | null
  >(null);
  const {
    isModalOpen: isPlayerModalOpen,
    handleOpenModal: handleOpenPlayerModal,
    handleCloseModal: handleClosePlayerModal,
  } = useModal();
  const getAssignedPlayersForPosition = (position: string) => {
    if (!depthChart?.DepthChartPlayers) return [];

    const filteredPlayers = depthChart.DepthChartPlayers.filter(
      (dcPlayer: any) => dcPlayer.Position === position,
    )
      .sort((a: any, b: any) => a.PositionLevel - b.PositionLevel)
      .map((dcPlayer: any) => {
        const player = players.find(
          (p: CollegePlayer | NFLPlayer) =>
            (p as any).PlayerID === dcPlayer.PlayerID ||
            (p as any).ID === dcPlayer.PlayerID,
        );
        return { ...dcPlayer, playerData: player };
      })
      .filter((item: any) => item.playerData);
    return filteredPlayers;
  };

  const getAssignedPlayersFromOtherLevels = (
    position: string,
    currentLevel: number,
  ) => {
    if (!depthChart?.DepthChartPlayers) return [];
    return depthChart.DepthChartPlayers.filter(
      (dcPlayer: any) =>
        dcPlayer.Position === position &&
        parseInt(dcPlayer.PositionLevel) !== currentLevel,
    )
      .sort((a: any, b: any) => a.PositionLevel - b.PositionLevel)
      .map((dcPlayer: any) => {
        const player = players.find(
          (p: CollegePlayer | NFLPlayer) =>
            (p as any).PlayerID === dcPlayer.PlayerID ||
            (p as any).ID === dcPlayer.PlayerID,
        );
        return { ...dcPlayer, playerData: player };
      })
      .filter((item: any) => item.playerData);
  };

  const handleSlotClick = (position: string, positionLevel: number) => {
    if (!canModify) return;
    setModalPosition(position);
    handleOpenModal();
  };

  const handleSwapClick = (position: string) => {
    if (!canModify) return;
    setModalPosition(position);
    handleOpenModal();
  };

  const openModal = (player: CollegePlayer | NFLPlayer) => {
    handleOpenPlayerModal();
    setModalPlayer(player);
  };

  const renderSelectedPosition = () => {
    const assignedPlayers = getAssignedPlayersForPosition(selectedPosition);
    const limit =
      POSITION_LIMITS[selectedPosition as keyof typeof POSITION_LIMITS];

    return (
      <div
        className="rounded-lg p-4 border-2"
        style={{ borderColor, backgroundColor }}
      >
        <div
          className="flex items-center justify-between mb-4 border-b pb-2"
          style={{ borderColor: accentColor }}
        >
          <Text variant="h4" classes="text-white font-semibold">
            {selectedPosition} Depth Chart ({assignedPlayers.length}/{limit})
          </Text>
          {canModify && (
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => handleSwapClick(selectedPosition)}
              className="flex items-center gap-2"
            >
              <ArrowsUpDown />
              Swap
            </Button>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[20em]">
          {[...Array(limit)].map((_, index) => {
            const positionLevel = index + 1;
            const assignedPlayer = assignedPlayers.find(
              (p: any) => parseInt(p.PositionLevel) === positionLevel,
            );

            let assignedPlayerOverall;
            let assignedPlayerBackground = "bg-gray-500";

            if (assignedPlayer?.playerData) {
              assignedPlayerOverall =
                league === SimNFL
                  ? GetNFLOverall(
                      assignedPlayer.playerData.Overall,
                      assignedPlayer.playerData.ShowLetterGrade,
                    )
                  : getCFBOverall(
                      assignedPlayer.playerData.Overall,
                      assignedPlayer.playerData.Year,
                    );
              assignedPlayerBackground = getRatingBgColor(
                assignedPlayerOverall,
              );
            }

            return (
              <div
                key={`${selectedPosition}-${positionLevel}`}
                className="flex items-center gap-3 p-3 bg-gray-700 bg-black/30 rounded-lg max-h-[3em]"
              >
                <Text
                  variant="body-small"
                  classes="text-gray-300 font-semibold min-w-12"
                >
                  {selectedPosition}
                  {positionLevel}
                </Text>

                {assignedPlayer?.playerData ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Text variant="body-small" classes="text-white">
                        {assignedPlayer.playerData.Archetype}{" "}
                        {assignedPlayer.playerData.Position}
                        {assignedPlayer.playerData.PositionTwo
                          ? `/${assignedPlayer.playerData.PositionTwo}`
                          : ""}
                      </Text>
                      <div
                        className="cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => openModal(assignedPlayer.playerData)}
                        onMouseEnter={(
                          e: React.MouseEvent<HTMLSpanElement>,
                        ) => {
                          (e.target as HTMLElement).style.color = "#fcd53f";
                        }}
                        onMouseLeave={(
                          e: React.MouseEvent<HTMLSpanElement>,
                        ) => {
                          (e.target as HTMLElement).style.color = "";
                        }}
                      >
                        <Text
                          variant="body-small"
                          classes="text-white font-semibold"
                        >
                          {assignedPlayer.playerData.FirstName}{" "}
                          {assignedPlayer.playerData.LastName}
                        </Text>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${assignedPlayerBackground}`}
                        style={{
                          textShadow:
                            "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                        }}
                      >
                        {assignedPlayerOverall}
                      </div>
                    </div>
                  </div>
                ) : assignedPlayer ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Text variant="body-small" classes="text-red-400">
                        Player not found (ID: {assignedPlayer.PlayerID})
                      </Text>
                    </div>
                    <div className="ml-auto">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-red-500">
                        !
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Text variant="body-small" classes="text-gray-500">
                      No player assigned
                    </Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getPositionsForGroup = (group: "OFF" | "DEF" | "ST") => {
    switch (group) {
      case "OFF":
        return OFFENSIVE_POSITIONS;
      case "DEF":
        return DEFENSIVE_POSITIONS;
      case "ST":
        return SPECIAL_TEAMS_POSITIONS;
      default:
        return OFFENSIVE_POSITIONS;
    }
  };

  const handlePositionSelect = (position: string) => {
    onPositionChange(position);
  };

  const handleGroupSelect = (group: "OFF" | "DEF" | "ST") => {
    setSelectedGroup(group);
    const positions = getPositionsForGroup(group);
    if (positions.length > 0) {
      onPositionChange(positions[0]);
    }

    if (onFormationTypeChange) {
      const formationType =
        group === "OFF"
          ? "offense"
          : group === "DEF"
            ? "defense"
            : "specialteams";
      onFormationTypeChange(formationType);
    }
  };

  React.useEffect(() => {
    if (OFFENSIVE_POSITIONS.includes(selectedPosition)) {
      setSelectedGroup("OFF");
    } else if (DEFENSIVE_POSITIONS.includes(selectedPosition)) {
      setSelectedGroup("DEF");
    } else if (SPECIAL_TEAMS_POSITIONS.includes(selectedPosition)) {
      setSelectedGroup("ST");
    }
  }, [selectedPosition]);

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg p-4 border-2"
        style={{ borderColor, backgroundColor }}
      >
        <div className="space-y-4">
          <div
            className="flex justify-center border-b pb-2"
            style={{ borderColor: accentColor }}
          >
            <ButtonGroup>
              <Button
                variant="secondaryOutline"
                size="xs"
                isSelected={selectedGroup === "OFF"}
                onClick={() => handleGroupSelect("OFF")}
              >
                OFF
              </Button>
              <Button
                variant="secondaryOutline"
                size="xs"
                isSelected={selectedGroup === "DEF"}
                onClick={() => handleGroupSelect("DEF")}
              >
                DEF
              </Button>
              <Button
                variant="secondaryOutline"
                size="xs"
                isSelected={selectedGroup === "ST"}
                onClick={() => handleGroupSelect("ST")}
              >
                ST
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex justify-center">
            <ButtonGroup>
              {getPositionsForGroup(selectedGroup).map((position) => (
                <Button
                  key={position}
                  variant="primaryOutline"
                  size="xs"
                  classes=""
                  isSelected={selectedPosition === position}
                  onClick={() => handlePositionSelect(position)}
                >
                  {position}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      </div>

      {renderSelectedPosition()}

      <DepthChartModal
        isOpen={isModalOpen}
        onClose={() => {
          handleCloseModal();
          setModalPosition("");
        }}
        modalPosition={modalPosition}
        players={players}
        depthChart={depthChart}
        team={team}
        league={league}
        onPlayerMove={onPlayerMove}
        onPlayerSwap={onPlayerSwap}
      />

      <Modal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          handleClosePlayerModal();
          setModalPlayer(null);
        }}
        title={
          modalPlayer
            ? `${
                modalPlayer.PositionTwo
                  ? `${modalPlayer.Position}/${modalPlayer.PositionTwo}`
                  : modalPlayer.Position
              } ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`
            : ""
        }
        maxWidth="max-w-4xl"
      >
        {modalPlayer &&
          (league === SimCFB ? (
            <CFBPlayerInfoModalBody player={modalPlayer as CollegePlayer} />
          ) : (
            <NFLDepthChartInfoModalBody player={modalPlayer as NFLPlayer} />
          ))}
      </Modal>
    </div>
  );
};

export default DepthChartManager;

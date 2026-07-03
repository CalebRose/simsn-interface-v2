import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
  CollegeDepthChartPosition,
  NFLDepthChartPosition,
} from "../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import { Text } from "../../../../_design/Typography";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { useSimFBAStore } from "../../../../context/SimFBAContext";
import { Button } from "../../../../_design/Buttons";
import { SingleValue } from "react-select";
import FormationView from "./FormationView";
import DepthChartManager from "./DepthChartManager";
import { useDepthChartValidation } from "./useDepthChartValidation";
import {
  DepthChartService,
  UpdateDepthChartDTO,
  UpdateNFLDepthChartDTO,
} from "../../../../_services/depthChartService";
import ValidationToast from "../Common/ValidationToast";
import {
  CFBPlayerInfoModalBody,
  NFLDepthChartInfoModalBody,
} from "../../../Common/Modals";
import { useModal } from "../../../../_hooks/useModal";
import { Modal } from "../../../../_design/Modal";
import { useResponsive } from "../../../../_hooks/useMobile";
import {
  findPlayerData,
  updatePlayerInfo,
  swapPlayersData,
  clearPlayerFromSlot,
  isPlayerOnTeam,
} from "./Modal/DepthChartModalHelper";

interface DepthChartViewProps {
  players: (CFBPlayer | NFLPlayer)[];
  depthChart: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  gameplan?: any;
  onDepthChartUpdate: (updatedDepthChart: any) => void;
  onTeamChange?: (team: any) => void;
  canModify?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  borderTextColor?: string;
  backgroundTextColor?: string;
  onHasUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

const DepthChartView: React.FC<DepthChartViewProps> = ({
  players,
  depthChart,
  team,
  league,
  gameplan,
  onDepthChartUpdate,
  onTeamChange,
  canModify = true,
  borderColor,
  backgroundColor,
  accentColor,
  borderTextColor,
  backgroundTextColor,
  onHasUnsavedChangesChange,
}) => {
  const [localDepthChart, setLocalDepthChart] = useState(depthChart);
  const [selectedPosition, setSelectedPosition] = useState<string>("QB");
  const [selectedFormationType, setSelectedFormationType] = useState<
    "offense" | "defense" | "specialteams"
  >("offense");
  const [isSaving, setIsSaving] = useState(false);
  const {
    cfbTeamOptions,
    nflTeamOptions,
    cfbTeamMap,
    proTeamMap,
    saveCFBDepthChart,
    saveNFLDepthChart,
  } = useSimFBAStore();
  const [modalPlayer, setModalPlayer] = useState<CFBPlayer | NFLPlayer | null>(
    null,
  );
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const { isDesktop } = useResponsive();

  const validation = useDepthChartValidation({
    depthChart: localDepthChart,
    players,
    league,
    canModify,
  });
  const teamOptions = league === SimCFB ? cfbTeamOptions : nflTeamOptions;
  const teamMap = league === SimCFB ? cfbTeamMap : proTeamMap;

  const handleTeamSelection = useCallback(
    (selectedOption: SingleValue<SelectOption>) => {
      if (selectedOption && teamMap && onTeamChange) {
        const teamId = Number(selectedOption.value);
        const selectedTeam = teamMap[teamId];
        if (selectedTeam) {
          onTeamChange(selectedTeam);
        }
      }
    },
    [teamMap, onTeamChange],
  );

  const handlePositionSelection = useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  const handleFormationTypeChange = useCallback(
    (formationType: "offense" | "defense" | "specialteams") => {
      setSelectedFormationType(formationType);
    },
    [],
  );

  const handlePlayerSwap = useCallback(
    (
      fromPlayerId: number,
      toPlayerId: number,
      position: string,
      fromLevel: number,
      toLevel: number,
    ) => {
      if (!localDepthChart?.DepthChartPlayers) return;

      let updatedPlayers = [...localDepthChart.DepthChartPlayers];

      const fromPlayerIndex = updatedPlayers.findIndex(
        (dcPlayer) =>
          dcPlayer.PlayerID === fromPlayerId &&
          dcPlayer.Position === position &&
          String(dcPlayer.PositionLevel) === String(fromLevel),
      );
      const toPlayerIndex = updatedPlayers.findIndex(
        (dcPlayer) =>
          dcPlayer.PlayerID === toPlayerId &&
          dcPlayer.Position === position &&
          String(dcPlayer.PositionLevel) === String(toLevel),
      );

      if (fromPlayerIndex !== -1 && toPlayerIndex !== -1) {
        const fromPlayerOnTeam = isPlayerOnTeam(fromPlayerId, players);
        const toPlayerOnTeam = isPlayerOnTeam(toPlayerId, players);

        if (fromPlayerOnTeam && toPlayerOnTeam) {
          const [swappedSlot1, swappedSlot2] = swapPlayersData(
            updatedPlayers[fromPlayerIndex],
            updatedPlayers[toPlayerIndex],
            league,
          );
          updatedPlayers[fromPlayerIndex] = swappedSlot1;
          updatedPlayers[toPlayerIndex] = swappedSlot2;
        } else if (fromPlayerOnTeam && !toPlayerOnTeam) {
          updatedPlayers[toPlayerIndex] = clearPlayerFromSlot(
            updatedPlayers[toPlayerIndex],
          );
          const updatedFromSlot = updatePlayerInfo(
            updatedPlayers[toPlayerIndex],
            findPlayerData(fromPlayerId, players),
            fromPlayerId,
            league,
          );
          updatedPlayers[toPlayerIndex] = updatedFromSlot;
          updatedPlayers[fromPlayerIndex] = clearPlayerFromSlot(
            updatedPlayers[fromPlayerIndex],
          );
        } else {
          console.warn("Cannot swap - from player is no longer on team");
          return;
        }
      }

      const updatedDepthChart = {
        ...localDepthChart,
        DepthChartPlayers: updatedPlayers,
      };

      setLocalDepthChart(updatedDepthChart);
    },
    [localDepthChart, league, players],
  );

  const handlePlayerMove = useCallback(
    (playerId: number, newPosition: string, newPositionLevel: number) => {
      if (!localDepthChart?.DepthChartPlayers) return;

      let updatedPlayers = [...localDepthChart.DepthChartPlayers];

      const existingPlayerIndex = updatedPlayers.findIndex(
        (dcPlayer) => dcPlayer.PlayerID === playerId,
      );
      const targetSlotIndex = updatedPlayers.findIndex(
        (dcPlayer) =>
          dcPlayer.Position === newPosition &&
          String(dcPlayer.PositionLevel) === String(newPositionLevel),
      );

      const playerData = findPlayerData(playerId, players);
      if (!playerData) return;

      if (existingPlayerIndex !== -1) {
        const existingPlayer = updatedPlayers[existingPlayerIndex];
        const isSamePosition = existingPlayer.Position === newPosition;

        if (targetSlotIndex !== -1 && targetSlotIndex !== existingPlayerIndex) {
          if (isSamePosition) {
            const [swappedSlot1, swappedSlot2] = swapPlayersData(
              updatedPlayers[existingPlayerIndex],
              updatedPlayers[targetSlotIndex],
              league,
            );
            updatedPlayers[existingPlayerIndex] = swappedSlot1;
            updatedPlayers[targetSlotIndex] = swappedSlot2;
          } else {
            updatedPlayers[targetSlotIndex] = updatePlayerInfo(
              updatedPlayers[targetSlotIndex],
              playerData,
              playerId,
              league,
            );
          }
        } else if (targetSlotIndex === -1) {
          if (isSamePosition) {
            updatedPlayers[existingPlayerIndex] = {
              ...existingPlayer,
              Position: newPosition,
              PositionLevel: String(newPositionLevel),
            };
          } else {
            const newEntry: any = {
              PlayerID: playerId,
              Position: newPosition,
              PositionLevel: String(newPositionLevel),
              FirstName: playerData.FirstName || "",
              LastName: playerData.LastName || "",
              OriginalPosition: playerData.Position || "",
              CollegePlayer: league === SimCFB ? playerData : null,
              NFLPlayer: league === SimNFL ? playerData : null,
            };
            updatedPlayers.push(newEntry);
          }
        }
      } else {
        if (targetSlotIndex !== -1) {
          updatedPlayers[targetSlotIndex] = updatePlayerInfo(
            updatedPlayers[targetSlotIndex],
            playerData,
            playerId,
            league,
          );
        } else {
          const newEntry: any = {
            PlayerID: playerId,
            Position: newPosition,
            PositionLevel: String(newPositionLevel),
            FirstName: playerData.FirstName || "",
            LastName: playerData.LastName || "",
            OriginalPosition: playerData.Position || "",
            CollegePlayer: league === SimCFB ? playerData : null,
            NFLPlayer: league === SimNFL ? playerData : null,
          };
          updatedPlayers.push(newEntry);
        }
      }

      const updatedDepthChart = {
        ...localDepthChart,
        DepthChartPlayers: updatedPlayers,
      };

      setLocalDepthChart(updatedDepthChart);
    },
    [localDepthChart, players, league],
  );

  const handleSaveDepthChart = useCallback(async () => {
    if (!validation.isValid || !canModify || isSaving || !localDepthChart) {
      return;
    }

    setIsSaving(true);
    try {
      const dto = {
        DepthChartID: localDepthChart.DepthChartPlayers[0].DepthChartID,
        UpdatedPlayerPositions:
          localDepthChart.DepthChartPlayers?.map((dcPlayer: any) => {
            const positionData = {
              ID: dcPlayer.ID,
              DepthChartID: dcPlayer.DepthChartID,
              PlayerID: dcPlayer.PlayerID,
              Position: dcPlayer.Position,
              PositionLevel: dcPlayer.PositionLevel,
              FirstName: dcPlayer.FirstName,
              LastName: dcPlayer.LastName,
              OriginalPosition:
                league === SimCFB
                  ? dcPlayer.CollegePlayer?.Position ||
                    dcPlayer.OriginalPosition
                  : dcPlayer.NFLPlayer?.Position || dcPlayer.OriginalPosition,
            };

            return positionData;
          }) || [],
      };

      if (league === SimCFB) {
        await saveCFBDepthChart(dto, localDepthChart);
      } else {
        await saveNFLDepthChart(dto, localDepthChart);
      }
      onDepthChartUpdate(localDepthChart);
    } catch (error) {
      console.error("Error saving depth chart:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    validation.isValid,
    canModify,
    isSaving,
    localDepthChart,
    players,
    league,
    saveCFBDepthChart,
    saveNFLDepthChart,
    onDepthChartUpdate,
  ]);

  const handleResetDepthChart = useCallback(() => {
    setLocalDepthChart(depthChart);
  }, [depthChart]);

  const hasUnsavedChanges = useMemo(() => {
    if (!localDepthChart || !depthChart) return false;

    const localPlayers = localDepthChart.DepthChartPlayers || [];
    const originalPlayers = depthChart.DepthChartPlayers || [];

    if (localPlayers.length !== originalPlayers.length) return true;

    return localPlayers.some((localPlayer: any, index: number) => {
      const originalPlayer = originalPlayers[index];
      return (
        localPlayer.PlayerID !== originalPlayer.PlayerID ||
        localPlayer.Position !== originalPlayer.Position ||
        localPlayer.PositionLevel !== originalPlayer.PositionLevel
      );
    });
  }, [localDepthChart, depthChart]);

  useEffect(() => {
    if (onHasUnsavedChangesChange) {
      onHasUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onHasUnsavedChangesChange]);

  useEffect(() => {
    setLocalDepthChart(depthChart);
  }, [depthChart]);

  const openModal = (player: CFBPlayer | NFLPlayer) => {
    handleOpenModal();
    setModalPlayer(player);
  };

  return (
    <div className="w-full">
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
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
            <CFBPlayerInfoModalBody player={modalPlayer as CFBPlayer} />
          ) : (
            <NFLDepthChartInfoModalBody player={modalPlayer as NFLPlayer} />
          ))}
      </Modal>
      <ValidationToast
        errors={validation.errors}
        warnings={validation.warnings}
        isValid={validation.isValid}
        contextName="Depth Chart"
      />
      <div className="grid grid-cols-1 gap-8 2xl:gap-6 items-start">
        {isDesktop && (
          <div className="relative min-w-0 z-0 w-full">
            <div className="text-center pb-4 flex justify-between">
              <div>
                <Text variant="h3" classes="text-white font-bold">
                  {selectedFormationType === "offense"
                    ? "Offensive Depth Chart"
                    : selectedFormationType === "defense"
                      ? "Defensive Depth Chart"
                      : "Special Teams Depth Chart"}
                </Text>
                <Text variant="body" classes="text-gray-400 mt-2">
                  Visual representation of the depth chart for {team.TeamName}
                </Text>
              </div>
              {!canModify && (
                <div className="text-center mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
                  <Text variant="body" classes="text-yellow-400">
                    Viewing {team?.TeamName || "Team"} Depth Chart (Read-Only)
                  </Text>
                </div>
              )}
              {canModify && (
                <div className="flex gap-2 justify-center mb-4">
                  <div
                    className={`border rounded-lg p-4 ${validation.isValid ? "bg-green-900 bg-black/50 border-green-500" : "bg-red-900 bg-black/50 border-red-500"}`}
                  >
                    <div className="flex flex-col items-center justify-between">
                      <div>
                        <Text
                          variant="body"
                          classes={`font-semibold ${validation.isValid ? "text-green-400" : "text-red-400"}`}
                        >
                          Depth Chart Status
                        </Text>
                        <Text
                          variant="small"
                          classes={
                            validation.isValid
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {validation.isValid
                            ? "Valid depth chart"
                            : "Invalid depth chart"}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-4 border-2"
                    style={{ borderColor, backgroundColor }}
                  >
                    <div className="flex gap-2">
                      <Button
                        variant={!validation.isValid ? "danger" : "primary"}
                        size="md"
                        onClick={handleSaveDepthChart}
                        disabled={
                          !validation.isValid || isSaving || !hasUnsavedChanges
                        }
                        className={`w-full ${!validation.isValid || isSaving ? "cursor-not-allowed" : "cursor-pointer"} ${!validation.isValid ? "bg-red-900 bg-black/50 border-red-500" : "cursor-pointer"}`}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleResetDepthChart}
                        disabled={isSaving || !hasUnsavedChanges}
                        className={`min-w-24 ${isSaving || !hasUnsavedChanges ? "cursor-not-allowed" : ""}`}
                      >
                        Reset
                      </Button>
                    </div>
                    {hasUnsavedChanges && (
                      <Text
                        variant="xs"
                        classes="text-yellow-400 mt-2 text-center"
                      >
                        You have unsaved changes
                      </Text>
                    )}
                  </div>
                </div>
              )}
            </div>
            <FormationView
              formationType={selectedFormationType}
              players={players}
              depthChart={localDepthChart}
              team={team}
              league={league}
              gameplan={gameplan}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              accentColor={accentColor}
              openModal={openModal}
              borderTextColor={borderTextColor}
            />
          </div>
        )}
        <div className="relative z-10 w-full max-w-[20rem] justify-self-center 2xl:max-w-none 2xl:justify-self-stretch">
          <div className="text-center">
            <Text variant="h3" classes="text-white font-bold mb-2">
              Depth Chart Management
            </Text>
            <Text variant="body" classes="text-gray-400 mb-4">
              Select a position below to manage its depth chart
            </Text>
          </div>
          <DepthChartManager
            players={players}
            depthChart={localDepthChart}
            team={team}
            league={league}
            selectedPosition={selectedPosition}
            onPlayerMove={handlePlayerMove}
            onPlayerSwap={handlePlayerSwap}
            onPositionChange={handlePositionSelection}
            onFormationTypeChange={handleFormationTypeChange}
            canModify={canModify}
            onSave={handleSaveDepthChart}
            onReset={handleResetDepthChart}
            isSaving={isSaving}
            isValid={validation.isValid}
            hasUnsavedChanges={hasUnsavedChanges}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
};

export default DepthChartView;

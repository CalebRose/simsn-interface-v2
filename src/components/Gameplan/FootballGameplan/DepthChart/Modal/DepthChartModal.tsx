import React, { useState } from "react";
import { CollegePlayer, NFLPlayer } from "../../../../../models/footballModels";
import {
  SimCFB,
  SimNFL,
  ManagementCard,
} from "../../../../../_constants/constants";
import { Text } from "../../../../../_design/Typography";
import { Modal } from "../../../../../_design/Modal";
import { Button } from "../../../../../_design/Buttons";
import DepthChartCard from "../../Common/DepthChartCard";
import PlayerAttributeCard from "../../Common/PlayerAttributeCard";
import {
  getUnassignedPlayersForPosition,
  getAllAssignedPlayersForPosition,
  getOverarchingPosition,
  isPlayerOnTeam,
} from "./DepthChartModalHelper";
import { ArrowsUpDown } from "../../../../../_design/Icons";

interface DepthChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalPosition: string;
  players: (CollegePlayer | NFLPlayer)[];
  depthChart: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
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
}

const DepthChartModal: React.FC<DepthChartModalProps> = ({
  isOpen,
  onClose,
  modalPosition,
  players,
  depthChart,
  team,
  league,
  onPlayerMove,
  onPlayerSwap,
}) => {
  const [showAttributes, setShowAttributes] = useState(false);
  const [swapTargetLevel, setSwapTargetLevel] = useState<number | null>(null);
  const [selectedAvailablePlayer, setSelectedAvailablePlayer] = useState<
    (CollegePlayer | NFLPlayer) | null
  >(null);

  const handlePlayerSelect = (player: CollegePlayer | NFLPlayer) => {
    if (swapTargetLevel !== null) {
      const playerId = (player as any).PlayerID || (player as any).ID;
      onPlayerMove(playerId, modalPosition, swapTargetLevel);
      setSwapTargetLevel(null);
      setSelectedAvailablePlayer(null);
    } else {
      setSelectedAvailablePlayer(player);
    }
  };

  const handleAvailablePlayerClick = (player: CollegePlayer | NFLPlayer) => {
    if (swapTargetLevel !== null) {
      const playerId = (player as any).PlayerID || (player as any).ID;
      onPlayerMove(playerId, modalPosition, swapTargetLevel);
      setSwapTargetLevel(null);
      setSelectedAvailablePlayer(null);
    } else {
      setSelectedAvailablePlayer(player);
    }
  };

  const handlePositionLevelClick = (level: number) => {
    if (selectedAvailablePlayer) {
      const playerId =
        (selectedAvailablePlayer as any).PlayerID ||
        (selectedAvailablePlayer as any).ID;
      onPlayerMove(playerId, modalPosition, level);
      setSelectedAvailablePlayer(null);
      setSwapTargetLevel(null);
    } else {
      setSwapTargetLevel(level);
    }
  };

  const handleSwapBetweenLevels = (fromLevel: number, toLevel: number) => {
    if (modalPosition) {
      const allAssigned = getAllAssignedPlayersForPosition(
        modalPosition,
        players,
        depthChart,
      );
      const fromPlayer = allAssigned.find((p) => p.PositionLevel === fromLevel);
      const toPlayer = allAssigned.find((p) => p.PositionLevel === toLevel);

      const hasFromPlayer = fromPlayer && fromPlayer.playerData;
      const hasToPlayer = toPlayer && toPlayer.playerData;

      if (hasFromPlayer && hasToPlayer) {
        const fromPlayerId =
          (fromPlayer.playerData as any).PlayerID ||
          (fromPlayer.playerData as any).ID;
        const toPlayerId =
          (toPlayer.playerData as any).PlayerID ||
          (toPlayer.playerData as any).ID;

        const fromPlayerOnTeam = isPlayerOnTeam(fromPlayerId, players);
        const toPlayerOnTeam = isPlayerOnTeam(toPlayerId, players);

        if (fromPlayerOnTeam && toPlayerOnTeam) {
          onPlayerSwap(
            fromPlayerId,
            toPlayerId,
            modalPosition,
            fromLevel,
            toLevel,
          );
        } else if (fromPlayerOnTeam && !toPlayerOnTeam) {
          onPlayerMove(fromPlayerId, modalPosition, toLevel);
        } else {
          console.warn("Cannot swap - from player is no longer on team");
        }
      } else if (hasFromPlayer && !hasToPlayer) {
        const fromPlayerId =
          (fromPlayer.playerData as any).PlayerID ||
          (fromPlayer.playerData as any).ID;
        if (isPlayerOnTeam(fromPlayerId, players)) {
          onPlayerMove(fromPlayerId, modalPosition, toLevel);
        }
      } else if (!hasFromPlayer && hasToPlayer) {
        const toPlayerId =
          (toPlayer.playerData as any).PlayerID ||
          (toPlayer.playerData as any).ID;
        if (isPlayerOnTeam(toPlayerId, players)) {
          onPlayerMove(toPlayerId, modalPosition, fromLevel);
        }
      }
    }
  };

  const handleClose = () => {
    setSwapTargetLevel(null);
    setSelectedAvailablePlayer(null);
    onClose();
  };

  if (!modalPosition) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Manage ${modalPosition} Depth Chart`}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4 bg-gray-800 bg-opacity-50 rounded-lg p-3">
          <Text variant="body" classes="text-white font-semibold">
            View:
          </Text>
          <div className="flex items-center gap-2">
            <Button
              variant={!showAttributes ? "primary" : "secondaryOutline"}
              size="xs"
              onClick={() => setShowAttributes(false)}
            >
              Player Cards
            </Button>
            <Button
              variant={showAttributes ? "primary" : "secondaryOutline"}
              size="xs"
              onClick={() => setShowAttributes(true)}
            >
              Key Attributes
            </Button>
          </div>
        </div>
      </div>
      <div className="max-h-[70vh] overflow-y-auto space-y-6">
        {(() => {
          const availablePlayers = getUnassignedPlayersForPosition(
            modalPosition,
            players,
            depthChart,
            league,
          );
          const allAssignedPlayers = getAllAssignedPlayersForPosition(
            modalPosition,
            players,
            depthChart,
          );

          return (
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Text variant="h5" classes="text-white font-semibold">
                    Current Position Levels
                  </Text>
                  <div className="flex items-center text-blue-400">
                    <ArrowsUpDown />
                  </div>
                </div>
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  {swapTargetLevel && selectedAvailablePlayer ? (
                    <Text variant="body" classes="text-green-300">
                      Ready to swap! {selectedAvailablePlayer.FirstName}{" "}
                      {selectedAvailablePlayer.LastName} → {modalPosition}
                      {swapTargetLevel}
                    </Text>
                  ) : swapTargetLevel ? (
                    <Text variant="body" classes="text-blue-300">
                      {modalPosition}
                      {swapTargetLevel} selected. Now select an available player
                      to swap.
                    </Text>
                  ) : selectedAvailablePlayer ? (
                    <Text variant="body" classes="text-blue-300">
                      {selectedAvailablePlayer.FirstName}{" "}
                      {selectedAvailablePlayer.LastName} selected. Now select a
                      position level.
                    </Text>
                  ) : (
                    <Text variant="body" classes="text-gray-300">
                      Select a position level or an available player to begin
                      swapping.
                    </Text>
                  )}
                </div>
                <div
                  className={`grid gap-3 ${
                    showAttributes
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                  }`}
                >
                  {allAssignedPlayers.map((assignedPlayer: any) => (
                    <div
                      key={`swap-${modalPosition}-${assignedPlayer.PositionLevel}`}
                      className={`relative cursor-pointer transform scale-90 hover:scale-95 transition-transform duration-200 ${
                        swapTargetLevel === assignedPlayer.PositionLevel
                          ? "animate-pulse rounded-lg scale-95"
                          : ""
                      }`}
                      onClick={() => {
                        if (swapTargetLevel === assignedPlayer.PositionLevel) {
                          setSwapTargetLevel(null);
                        } else if (swapTargetLevel !== null) {
                          handleSwapBetweenLevels(
                            swapTargetLevel,
                            assignedPlayer.PositionLevel,
                          );
                          setSwapTargetLevel(null);
                        } else {
                          handlePositionLevelClick(
                            assignedPlayer.PositionLevel,
                          );
                        }
                      }}
                    >
                      <div className="relative h-full">
                        {assignedPlayer.playerData ? (
                          showAttributes ? (
                            <PlayerAttributeCard
                              player={assignedPlayer.playerData}
                              team={team}
                              league={league}
                              position={getOverarchingPosition(modalPosition)}
                              size="sm"
                              classes="cursor-pointer hover:shadow-lg"
                              onPlayerSelect={() => {
                                if (swapTargetLevel !== null) {
                                  handlePlayerSelect(assignedPlayer.playerData);
                                }
                              }}
                            />
                          ) : (
                            <DepthChartCard
                              player={assignedPlayer.playerData}
                              team={team}
                              league={league}
                              depthChartManager={true}
                              position={getOverarchingPosition(modalPosition)}
                              size="sm"
                              classes="cursor-pointer hover:shadow-lg rounded-lg items-center justify-center"
                            />
                          )
                        ) : (
                          <div className="w-full h-32 sm:h-full bg-gray-700 bg-opacity-50 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <Text variant="small" classes="text-gray-400">
                              Empty
                            </Text>
                          </div>
                        )}
                        <div
                          className={`absolute -top-5 -left-1 text-white rounded-full w-6 h-6 p-4 flex items-center justify-center text-xs font-bold ${
                            swapTargetLevel === assignedPlayer.PositionLevel
                              ? "bg-blue-400"
                              : "bg-blue-500"
                          }`}
                        >
                          {modalPosition}
                          {assignedPlayer.PositionLevel}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {swapTargetLevel === assignedPlayer.PositionLevel
                            ? "SELECTED"
                            : "SWAP"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {availablePlayers.length > 0 && (
                <div>
                  <Text variant="h5" classes="text-white font-semibold mb-4">
                    Available Players
                  </Text>
                  <div
                    className={`grid gap-3 ${
                      showAttributes
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                    }`}
                  >
                    {availablePlayers.map((player) => {
                      const playerId =
                        (player as any).PlayerID || (player as any).ID;
                      const isSelected =
                        selectedAvailablePlayer &&
                        ((selectedAvailablePlayer as any).PlayerID ||
                          (selectedAvailablePlayer as any).ID) === playerId;

                      return (
                        <div
                          key={playerId}
                          className={`cursor-pointer transform scale-95 hover:scale-100 transition-transform duration-200 ${
                            isSelected
                              ? "animate-pulse rounded-lg scale-95"
                              : ""
                          }`}
                          onClick={() => handleAvailablePlayerClick(player)}
                        >
                          {showAttributes ? (
                            <PlayerAttributeCard
                              player={player}
                              team={team}
                              league={league}
                              position={getOverarchingPosition(modalPosition)}
                              category={ManagementCard}
                              size="sm"
                              classes="cursor-pointer hover:shadow-lg"
                              onPlayerSelect={() =>
                                handleAvailablePlayerClick(player)
                              }
                            />
                          ) : (
                            <DepthChartCard
                              player={player}
                              team={team}
                              league={league}
                              category={ManagementCard}
                              depthChartManager={true}
                              size="sm"
                              classes="cursor-pointer hover:shadow-lg"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {availablePlayers.length === 0 && (
                <div className="text-center py-8">
                  <Text variant="body" classes="text-gray-400">
                    No available players for this position
                  </Text>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </Modal>
  );
};

export default DepthChartModal;

import React, { useState } from 'react';
import { CollegePlayer as CFBPlayer, NFLPlayer } from '../../../../models/footballModels';
import DepthChartCard from '../Common/DepthChartCard';
import BackupPlayerCard from '../Common/BackupPlayerCard';
import { SimCFB, SimNFL, Formations } from '../../../../_constants/constants';
import { Text } from '../../../../_design/Typography';
import { 
  getEligiblePositionsForDepthPosition, 
  getUnassignedPlayersForPosition,
  getPlayerId 
} from '../Utils/PlayerUtils';

interface PositionSlotProps {
  position: string;
  positionLevels: number;
  players: (CFBPlayer | NFLPlayer)[];
  depthChart: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  startingLevel?: number;
  showBackupBelow?: boolean;
  onPlayerAssign?: (playerId: number, position: string, positionLevel: number) => void;
  openModal?: (player: CFBPlayer | NFLPlayer) => void;
  backgroundColor?: string;
}

const PositionSlot: React.FC<PositionSlotProps> = ({
  position,
  positionLevels,
  players,
  depthChart,
  team,
  league,
  size = 'md',
  label,
  startingLevel = 1,
  showBackupBelow = false,
  onPlayerAssign,
  openModal,
  backgroundColor,
}) => {
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedSlotLevel, setSelectedSlotLevel] = useState(1);

  const getAvailablePlayersForSelection = () => {
    return getUnassignedPlayersForPosition(position, players, depthChart, league);
  };

  const handleSlotClick = (positionLevel: number) => {
    if (onPlayerAssign) {
      setSelectedSlotLevel(positionLevel);
      setShowPlayerSelection(true);
    } else {
    }
  };

  const handlePlayerSelect = (player: CFBPlayer | NFLPlayer) => {
    if (onPlayerAssign) {
      const playerId = getPlayerId(player);
      onPlayerAssign(playerId, position, selectedSlotLevel);
      setShowPlayerSelection(false);
    }
  };

  const getPlayersForPosition = () => {
    if (!depthChart?.DepthChartPlayers) return [];
    if (label && label.match(/^[A-Z]+\d+$/)) {
      const filtered = depthChart.DepthChartPlayers
        .filter((dcPlayer: any) => {
          return dcPlayer.Position === position && parseInt(dcPlayer.PositionLevel) === startingLevel;
        });
      return filtered;
    }
    
    return depthChart.DepthChartPlayers
      .filter((dcPlayer: any) => dcPlayer.Position === position)
      .sort((a: any, b: any) => parseInt(a.PositionLevel) - parseInt(b.PositionLevel))
      .slice(startingLevel - 1, startingLevel - 1 + positionLevels);
  };

  const assignedPlayers = getPlayersForPosition();
  const sortedAssignedPlayers = assignedPlayers.sort((a: any, b: any) => parseInt(a.PositionLevel) - parseInt(b.PositionLevel));

  const slotSizes = {
    sm: 'w-28',
    md: 'w-32', 
    lg: 'w-28'
  };

  const minHeights = {
    sm: 'min-h-24',
    md: 'min-h-36',
    lg: 'min-h-36'
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <div className={`${slotSizes[size]} flex flex-col space-y-1`}>
        <div 
          className={`
            relative ${minHeights[size]} rounded-lg overflow-hidden
            ${sortedAssignedPlayers.length > 0 
              ? '' 
              : 'bg-gray-900 bg-black/50 border-2 border-gray-500 border-dashed'
            }
            ${onPlayerAssign ? 'cursor-pointer hover:border-blue-400' : ''}
            transition-all duration-200
          `}
          onClick={() => onPlayerAssign && handleSlotClick(startingLevel)}
        >
          {sortedAssignedPlayers.length > 0 && (() => {
            const starterPlayer = sortedAssignedPlayers[0];
            const player = players.find(p => 
              (p as any).PlayerID === starterPlayer.PlayerID || 
              (p as any).ID === starterPlayer.PlayerID
            );
            if (!player) return null;

            return (
              <div 
                className="absolute inset-0 flex items-center justify-center p-1"
                onClick={() => openModal && openModal(player)}
              >
                <DepthChartCard
                  player={player}
                  team={team}
                  league={league}
                  position={label}
                  size={size}
                  innerBackgroundColor={backgroundColor}
                  category={Formations}
                />
              </div>
            );
          })()}
          {sortedAssignedPlayers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 mx-auto mb-1" />
                <Text variant="xs" classes="text-gray-400">
                  {label || position}
                </Text>
              </div>
            </div>
          )}
        </div>
        {showBackupBelow && (() => {
          let backupPlayer;
          if (position === 'WR') {
            const targetLevel = startingLevel === 1 ? 3 : startingLevel === 2 ? 4 : startingLevel === 4 ? 5 : 4;
            backupPlayer = sortedAssignedPlayers.find((dcPlayer: any) => parseInt(dcPlayer.PositionLevel) === targetLevel);
          } else {
            const nextLevel = startingLevel + 1;
            backupPlayer = sortedAssignedPlayers.find((dcPlayer: any) => parseInt(dcPlayer.PositionLevel) === nextLevel);
          }
          
          if (!backupPlayer) return null;
          
          const player = players.find(p => 
            (p as any).PlayerID === backupPlayer.PlayerID || 
            (p as any).ID === backupPlayer.PlayerID
          );
          
          if (!player) return null;

          return (
            <div 
              key={`${backupPlayer.PlayerID}-backup`}
              onClick={() => openModal && openModal(player)}
              className="cursor-pointer"
            >
              <BackupPlayerCard
                player={player}
                team={team}
                league={league}
                position={position}
                positionLevel={`${position}${backupPlayer.PositionLevel}`}
              />
            </div>
          );
        })()}
      </div>
      {showPlayerSelection && onPlayerAssign && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPlayerSelection(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-600">
                <div className="flex justify-between items-center">
                  <Text variant="h4" classes="text-white font-semibold">
                    Select Player for {position}{selectedSlotLevel}
                  </Text>
                  <button
                    onClick={() => setShowPlayerSelection(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {getAvailablePlayersForSelection().map((player) => (
                    <div
                      key={(player as any).PlayerID || (player as any).ID}
                      className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <DepthChartCard
                        player={player}
                        team={team}
                        league={league}
                        size="sm"
                        classes="cursor-pointer hover:shadow-lg"
                      />
                    </div>
                  ))}
                </div>
                {getAvailablePlayersForSelection().length === 0 && (
                  <div className="text-center py-8">
                    <Text variant="body" classes="text-gray-400">
                      No available players for this position
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PositionSlot;
import React, { FC } from 'react';
import { Border } from '../../../../_design/Borders';
import { Text } from '../../../../_design/Typography';
import { getLogo } from '../../../../_utility/getLogo';
import { SimNFL } from '../../../../_constants/constants';
import { NFLDraftPick } from '../../../../models/footballModels';

interface UpcomingPicksProps {
  upcomingPicks: NFLDraftPick[];
  currentPick: NFLDraftPick | null;
  userTeamId?: number;
  teamColors: {
    primary: string;
    secondary: string;
  };
  backgroundColor: string;
}

export const UpcomingPicks: FC<UpcomingPicksProps> = ({
  upcomingPicks,
  currentPick,
  userTeamId,
  teamColors,
  backgroundColor
}) => {
  const getPickStatus = (pick: NFLDraftPick, index: number) => {
    if (currentPick && pick.ID === currentPick.ID) return 'current';
    if (pick.TeamID === userTeamId) return 'user';
    if (index === 0) return 'next';
    return 'upcoming';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400 scale-105 shadow-lg shadow-blue-500/25';
      case 'user':
        return 'bg-gradient-to-r from-green-600 to-green-500 border-green-400';
      case 'next':
        return 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500';
      default:
        return 'bg-gray-800 border-gray-600 opacity-75';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return { text: 'ON THE CLOCK', color: 'text-blue-300' };
      case 'user':
        return { text: 'YOUR PICK', color: 'text-green-300' };
      case 'next':
        return { text: 'NEXT UP', color: 'text-yellow-300' };
      default:
        return null;
    }
  };

  return (
    <Border 
      classes="p-4 border-2 h-full"
      styles={{ borderColor: teamColors.primary, backgroundColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text variant="h5" classes="text-white font-semibold">
          Upcoming Picks
        </Text>
        <Text variant="xs" classes="text-gray-400">
          Next {upcomingPicks.length} selections
        </Text>
      </div>

      <div className="space-y-2">
        {upcomingPicks.map((pick, index) => {
          const status = getPickStatus(pick, index);
          const statusLabel = getStatusLabel(status);
          const teamLogo = getLogo(SimNFL, pick.TeamID, false);
          const isTraded = pick.PreviousTeamID && pick.PreviousTeamID !== pick.TeamID;

          return (
            <div
              key={pick.ID}
              className={`
                relative rounded-lg border p-1 transition-all duration-300
                ${getStatusStyles(status)}
              `}
            >
              {statusLabel && (
                <div className="absolute -top-3 left-3 px-2 py-0.5 bg-gray-900 rounded">
                  <Text variant="small" classes={`font-bold ${statusLabel.color}`}>
                    {statusLabel.text}
                  </Text>
                </div>
              )}
              <div className={`flex items-center space-x-4 gap-2 ${status === 'current' ? 'pt-1' : ''}`}>
                <div className="flex-shrink-0">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${status === 'current' ? 'bg-blue-500/20 text-blue-200' : 'bg-gray-700 text-gray-300'}
                  `}>
                    {pick.DraftNumber}
                  </div>
                </div>
                <img 
                  src={teamLogo} 
                  alt={pick.Team}
                  className={`
                    w-8 h-8 object-contain transition-all duration-300
                    ${status === 'current' ? 'animate-pulse' : ''}
                  `}
                />
                <div className="flex-1">
                  <Text 
                    variant="body-small" 
                    classes={`
                      font-semibold text-left
                      ${status === 'current' || status === 'user' ? 'text-white' : 'text-gray-200'}
                    `}
                  >
                    {pick.Team}
                  </Text>
                  <div className="flex items-center justify-start space-x-2 text-xs">
                    <Text variant="small" className="text-gray-400">
                      Round {pick.DraftRound}
                    </Text>
                    {pick.PreviousTeamID > 0 && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-yellow-500">
                          via {pick.PreviousTeam}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {status === 'current' && (
                <div className="absolute inset-0 rounded-lg pointer-events-none">
                  <div className="absolute inset-0 rounded-lg animate-ping bg-blue-500 opacity-20" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-1">
          {upcomingPicks.slice(0, 10).map((pick, index) => {
            const status = getPickStatus(pick, index);
            return (
              <div
                key={pick.ID}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-300
                  ${status === 'current' ? 'bg-blue-500' : ''}
                  ${status === 'user' ? 'bg-green-500' : ''}
                  ${status === 'next' ? 'bg-yellow-500' : ''}
                  ${status === 'upcoming' ? 'bg-gray-600' : ''}
                `}
                title={`Pick ${pick.DraftNumber}: ${pick.Team}`}
              />
            );
          })}
        </div>
      </div>
    </Border>
  );
};
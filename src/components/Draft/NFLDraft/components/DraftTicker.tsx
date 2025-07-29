import React, { FC, useEffect, useRef, useState } from 'react';
import { Border } from '../../../../_design/Borders';
import { Text } from '../../../../_design/Typography';
import { getLogo } from '../../../../_utility/getLogo';
import { SimNFL } from '../../../../_constants/constants';
import { NFLDraftPick, NFLDraftee } from '../../../../models/footballModels';

interface DraftTickerProps {
  recentPicks: Array<{
    pick: NFLDraftPick;
    player?: NFLDraftee;
  }>;
  onPickClick?: (pick: NFLDraftPick) => void;
  teamColors: {
    primary: string;
    secondary: string;
  };
  backgroundColor: string;
}

export const DraftTicker: FC<DraftTickerProps> = ({
  recentPicks,
  onPickClick,
  teamColors,
  backgroundColor
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [hoveredPick, setHoveredPick] = useState<number | null>(null);

  useEffect(() => {
    if (isAutoScrolling && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const scrollAmount = 1;
      
      const scroll = () => {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += scrollAmount;
        }
      };

      const intervalId = setInterval(scroll, 50);
      return () => clearInterval(intervalId);
    }
  }, [isAutoScrolling]);

  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  const PickCard: FC<{ pickData: { pick: NFLDraftPick; player?: NFLDraftee }, index: number }> = ({ pickData, index }) => {
    const { pick, player } = pickData;
    const teamLogo = getLogo(SimNFL, pick.TeamID, false);
    const isNew = index === 0;

    return (
      <div
        className={`
          flex-shrink-0 w-80 mx-2 cursor-pointer transform transition-all duration-300
          ${hoveredPick === pick.ID ? 'scale-105' : 'scale-100'}
          ${isNew ? 'animate-slideIn' : ''}
        `}
        onClick={() => onPickClick?.(pick)}
        onMouseEnter={() => setHoveredPick(pick.ID)}
        onMouseLeave={() => setHoveredPick(null)}
      >
        <Border
          classes={`
            p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-2
            ${isNew ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
          styles={{ borderColor: hoveredPick === pick.ID ? teamColors.primary : '#374151' }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold
                ${isNew ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}
              `}>
                {pick.DraftNumber}
              </div>
            </div>

            {/* Team logo */}
            <img 
              src={teamLogo} 
              alt={pick.Team}
              className="w-10 h-10 object-contain"
            />
            <div className="flex-1 min-w-0">
              <Text variant="body" classes="text-white font-semibold truncate">
                {pick.SelectedPlayerName || 'Selecting...'}
              </Text>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">{pick.Team}</span>
                {pick.SelectedPlayerPosition && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-blue-400 font-semibold">{pick.SelectedPlayerPosition}</span>
                  </>
                )}
                {player?.College && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 truncate">{player.College}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500 uppercase">
                R{pick.DraftRound}
              </span>
            </div>
          </div>
          {pick.PreviousTeamID && pick.PreviousTeamID !== pick.TeamID && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <Text variant="xs" classes="text-yellow-500">
                Traded from {pick.PreviousTeam}
              </Text>
            </div>
          )}
        </Border>
      </div>
    );
  };

  return (
    <div className="relative rounded-lg p-4 border-2 h-full" style={{ backgroundColor, borderColor: teamColors.primary }}>
      <div className="flex items-center justify-between mb-2 px-4">
        <Text variant="h5" classes="text-white font-semibold">
          Recent Picks
        </Text>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Text variant="xs" classes="text-gray-400 uppercase">
            Live
          </Text>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ scrollBehavior: 'smooth' }}
        >
          {recentPicks.length > 0 ? (
            recentPicks.map((pickData, index) => (
              <PickCard key={pickData.pick.ID} pickData={pickData} index={index} />
            ))
          ) : (
            <div className="w-full text-center py-8">
              <Text variant="body" classes="text-gray-500">
                No picks have been made yet
              </Text>
            </div>
          )}
          {recentPicks.length > 0 && recentPicks.length < 10 && (
            recentPicks.map((pickData, index) => (
              <PickCard 
                key={`dup-${pickData.pick.ID}`} 
                pickData={pickData} 
                index={recentPicks.length + index} 
              />
            ))
          )}
        </div>
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
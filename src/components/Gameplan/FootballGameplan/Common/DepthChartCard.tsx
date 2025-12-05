import React from 'react';
import { Text } from '../../../../_design/Typography';
import { Border } from '../../../../_design/Borders';
import PlayerPicture from '../../../../_utility/usePlayerFaces';
import { useTeamColors } from '../../../../_hooks/useTeamColors';
import { getTextColorBasedOnBg } from '../../../../_utility/getBorderClass';
import { SimCFB, SimNFL, ManagementCard, Formations } from '../../../../_constants/constants';
import { getPlayerOverallRating } from '../Utils/GameplanPlayerUtils';
import { 
  getSizeClasses, 
  getTextSize, 
  getPictureSize, 
  getBackgroundPattern,
  generateCardGradient,
  BackgroundPatternType
} from '../Utils/ComponentStyleUtils';
import { getRatingColor } from '../Utils/UIUtils';
import { getYear } from '../../../../_utility/getYear';
import { isBrightColor } from '../../../../_utility/isBrightColor';

interface DepthChartCardProps {
  player: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  classes?: string;
  size?: 'sm' | 'md' | 'lg';
  showLetterGrade?: boolean;
  position?: string;
  category?: string;
  depthChartManager?: boolean;
  innerBackgroundColor?: string;
  backgroundPattern?: BackgroundPatternType;
}

export const DepthChartCard: React.FC<DepthChartCardProps> = ({
  player,
  team,
  league,
  classes = "",
  size = 'md',
  showLetterGrade,
  category,
  depthChartManager,
  innerBackgroundColor,
  position,
  backgroundPattern = 'texture'
}) => {
  const teamColors = useTeamColors(team?.ColorOne, team?.ColorTwo, team?.ColorThree);
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const accentColor = teamColors.Three;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const sizeClasses = getSizeClasses(size, 'depthChart');
  const pictureSize = getPictureSize(size, true);
  const overallRating = getPlayerOverallRating(player, league, showLetterGrade);
  const patternBg = isBrightColor(backgroundColor) ? "#000000" : "#FFFFFF";

  if (!player) {
    return (
      <div className={`${sizeClasses} w-full h-full ${classes}`}>
        <Border
          classes="h-full p-1 relative overflow-hidden opacity-50"
          styles={{
            backgroundColor: '#374151',
            borderColor: '#6B7280',
            background: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
          }}
        >
          <div className="flex flex-col h-full justify-center items-center">
            <Text variant="small" classes="text-gray-400 text-center">
              Player Not Found
            </Text>
          </div>
        </Border>
      </div>
    );
  }

  return (
    <>
      <div
        className={`
          relative cursor-pointer select-none transition-all duration-200 
          ${classes?.includes('!w-full !h-full') ? 'w-full h-full' : `${sizeClasses} w-full h-full`}
          ${classes}
          ${depthChartManager ? '' : ``}
        `}
      >
      <Border
        classes="h-full h-full p-2 relative overflow-hidden"
        styles={{
          backgroundColor,
          borderColor,
          background: generateCardGradient(backgroundColor),
        }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={getBackgroundPattern(backgroundPattern, patternBg)}
        />
      {category === ManagementCard && (
        <div 
          className="absolute top-0 left-0 px-1 py-0.5 rounded-br-md z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <Text 
            variant={getTextSize(size)} 
            classes={`font-bold`}
          >
             {player.Position}{player.PositionTwo ? `/${player.PositionTwo}` : ''}
          </Text>
        </div>
      )}
      {category === Formations && (
        <div 
          className="absolute top-0 left-0 px-1 py-0.5 rounded-br-md z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <Text 
            variant={getTextSize(size)} 
            classes={`font-bold`}
          >
             {position ? `${position}` : ''}
          </Text>
        </div>
      )}
        <div 
          className="absolute top-0 right-0 px-1 rounded-bl-md py-0.5 z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <Text 
            variant={getTextSize(size)} 
            classes={`font-bold ${getRatingColor(overallRating)}`}
          >
            {overallRating}
          </Text>
        </div>
        {league === SimCFB && (
          <div 
          className="absolute top-8 right-0 px-1 py-0.5 rounded-bl-lg rounded-tl-lg z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <Text 
            variant={getTextSize(size)} 
            classes={`font-semibold`}
          >
            {getYear(player.Year, player.IsRedshirt)}
          </Text>
        </div>
        )}
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className={`bg-white mx-auto mt-2 rounded-full overflow-hidden ${depthChartManager ? 'max-w-[2.5em] sm:max-w-[3em]' : `${pictureSize}`}`}>
            <PlayerPicture
              playerID={player?.PlayerID || player?.ID}
              team={team}
              league={league}
              classes="h-full w-full"
            />
          </div>
          <div className="text-center space-y-0.5 pb-1 px-1">
            <div className="max-w-full">
              <Text 
                variant={category === Formations ? (size === 'lg' ? 'small' : size === 'md' ? 'xs' : 'xs') : getTextSize(size)} 
                classes={`font-bold ${textColorClass} leading-tight truncate block`}
                style={{
                  textShadow: textColorClass.includes('white') 
                    ? '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black'
                    : '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'
                }}
              >
                {player?.FirstName || ''}
              </Text>
              <Text 
                variant={getTextSize(size)} 
                classes={`font-bold ${textColorClass} leading-tight truncate block`}
                style={{
                  textShadow: textColorClass.includes('white') 
                    ? '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black'
                    : '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'
                }}
              >
                {player?.LastName || ''}
              </Text>
            {depthChartManager && (
              <div 
                  className="px-1 py-0.5 rounded-lg z-10"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <Text 
                  variant="xs" 
                  classes={`font-semibold`}
                  style={{
                    textShadow: textColorClass.includes('white') 
                    ? '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black'
                    : '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'
                  }}
                >
                  {player.Archetype}
                </Text>
              </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
      </Border>
      </div>
    </>
  );
};

export default DepthChartCard;
import React from "react";
import { CollegePlayer, NFLPlayer } from "../../../../models/footballModels";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import PlayerPicture from "../../../../_utility/usePlayerFaces";
import { useTeamColors } from "../../../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../../../_utility/getBorderClass";
import {
  SimCFB,
  SimNFL,
  ManagementCard,
  ShotgunRatingAcronyms,
} from "../../../../_constants/constants";
import {
  setPriorityCFBAttributes,
  setPriorityNFLAttributes,
} from "../../../Team/TeamPageUtils";
import {
  getRatingColor,
  getPlayerOverallRating,
  getAttributeAcronym,
  getAttributeColor,
} from "../Utils/GameplanPlayerUtils";
import {
  getSizeClasses,
  getTextSize,
  generateBackgroundPattern,
  generateCardGradient,
} from "../Utils/ComponentStyleUtils";

interface PlayerAttributeCardProps {
  player: CollegePlayer | NFLPlayer;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  position: string;
  classes?: string;
  size?: "sm" | "md" | "lg";
  onPlayerSelect?: (player: CollegePlayer | NFLPlayer) => void;
  showLetterGrade?: boolean;
  category?: string;
}

export const PlayerAttributeCard: React.FC<PlayerAttributeCardProps> = ({
  player,
  team,
  league,
  position,
  classes = "",
  size = "sm",
  onPlayerSelect,
  showLetterGrade,
  category,
}) => {
  const teamColors = useTeamColors(
    team?.ColorOne,
    team?.ColorTwo,
    team?.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const accentColor = teamColors.Three;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const overallRating = getPlayerOverallRating(player, league, showLetterGrade);

  const getPositionAttributes = () => {
    if (league === SimCFB) {
      const tempPlayer = { ...player, Position: position } as CollegePlayer;
      return setPriorityCFBAttributes(tempPlayer);
    } else {
      const tempPlayer = { ...player, Position: position } as NFLPlayer;
      const nflPlayer = player as NFLPlayer;
      const shouldShowLetterGrade =
        showLetterGrade !== undefined
          ? showLetterGrade
          : nflPlayer.ShowLetterGrade;
      return setPriorityNFLAttributes(
        tempPlayer,
        shouldShowLetterGrade || false,
      );
    }
  };

  const attributes = getPositionAttributes();
  const displayAttributes = attributes;

  const handleClick = () => {
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const getAttributeDisplayValue = (attr: any): string => {
    const value = attr.Letter || attr.Value;
    if (attr.Name === "Shotgun Rating" && value in ShotgunRatingAcronyms) {
      return ShotgunRatingAcronyms[value as keyof typeof ShotgunRatingAcronyms];
    }
    return value;
  };

  return (
    <div
      className={`
        relative cursor-pointer select-none transition-all duration-200 
        ${getSizeClasses(size, "attribute")}
        ${classes}
        hover:scale-105
      `}
      onClick={handleClick}
    >
      <Border
        classes="h-full p-1 relative overflow-hidden"
        styles={{
          backgroundColor,
          borderColor,
          background: generateCardGradient(backgroundColor),
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={generateBackgroundPattern(accentColor)}
        />
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded z-10"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <Text
            variant={getTextSize(size)}
            classes={`font-bold ${getRatingColor(overallRating, league)}`}
          >
            {overallRating}
          </Text>
        </div>
        {category === ManagementCard && (
          <div
            className="absolute top-1 left-1 px-1.5 py-0.5 rounded z-10"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <Text variant="xs" classes={`font-bold text-white`}>
              {player.Position}
            </Text>
          </div>
        )}
        {(position === "STU" || position === "KR" || position === "PR") && (
          <div
            className="absolute top-3 left-0 px-1 py-0.5 rounded-bl-lg rounded-tl-lg z-10"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <Text variant={getTextSize(size)} classes={`font-semibold`}>
              {player.Position}
            </Text>
          </div>
        )}
        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center mb-1">
            <div className="flex-1 min-w-0">
              <Text
                variant="xs"
                classes={`font-bold ${textColorClass} leading-tight truncate`}
                style={{
                  textShadow: textColorClass.includes("white")
                    ? "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
                    : "1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
                }}
              >
                {player.FirstName}
              </Text>
              <Text
                variant="xs"
                classes={`font-bold ${textColorClass} leading-tight truncate`}
                style={{
                  textShadow: textColorClass.includes("white")
                    ? "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
                    : "1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
                }}
              >
                {player.LastName}
              </Text>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 h-full">
              {displayAttributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center bg-black bg-opacity-20 rounded text-center h-4/5 p-0.5"
                >
                  <Text
                    variant="xs"
                    classes={`${textColorClass} opacity-80 leading-tight text-xs`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {getAttributeAcronym(attr.Name)}
                  </Text>
                  <Text
                    variant="xs"
                    classes={`font-bold ${getAttributeColor(attr.Letter || attr.Value)} leading-tight text-xs`}
                    style={{
                      fontSize: "0.7rem",
                      textShadow: textColorClass.includes("white")
                        ? "0.5px 0.5px 0 black, -0.5px -0.5px 0 black, 0.5px -0.5px 0 black, -0.5px 0.5px 0 black"
                        : "0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white",
                    }}
                  >
                    {getAttributeDisplayValue(attr)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
      </Border>
    </div>
  );
};

export default PlayerAttributeCard;

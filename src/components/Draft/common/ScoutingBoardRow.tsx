import React, { FC, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { ScoutingAttributeBox } from "./ScoutingAttributeBox";
import {
  ActionLock,
  Handshake,
  TrashCan as Trash,
} from "../../../_design/Icons";
import { darkenColor } from "../../../_utility/getDarkerColor";
import {
  DraftLeague,
  Draftee,
  ScoutingProfile,
  TeamColors,
  getPlayerCollege,
  getCollegeLeagueConstant,
  isNFLLeague,
} from "./types";
import {
  getScoutableAttributes,
  getAttributeShowProperty,
  getScoutingCost,
  getOverallGrade,
} from "./draftHelpers";
import { Tag } from "../../../_design/Tags";
import { SimNFL, SimPHL } from "../../../_constants/constants";
import { ToggleSwitch } from "../../../_design/Inputs";

interface ScoutingBoardRowProps {
  profile: ScoutingProfile;
  player: Draftee;
  index: number;
  isDrafted: boolean;
  backgroundColor: string;
  teamColors: TeamColors;
  league: DraftLeague;
  availablePoints: number;
  offensiveSystemsInformation: any;
  defensiveSystemsInformation: any;
  isUserTurn: boolean;
  onRemoveFromBoard: (profile: ScoutingProfile) => void;
  onDraftPlayer?: (player: Draftee) => void;
  onRevealAttribute: (
    profileId: number,
    showAttribute: string,
    cost: number,
  ) => void;
  getRevealedCount: (profile: ScoutingProfile) => number;
  viewPlayer: (draftee: Draftee) => void;
}

export const ScoutingBoardRow: FC<ScoutingBoardRowProps> = ({
  profile,
  player,
  index,
  isDrafted,
  backgroundColor,
  teamColors,
  league,
  availablePoints,
  offensiveSystemsInformation,
  defensiveSystemsInformation,
  isUserTurn,
  onRemoveFromBoard,
  onDraftPlayer,
  onRevealAttribute,
  getRevealedCount,
  viewPlayer,
}) => {
  // SimPHL only
  const [showPotentialAttributes, setShowPotentialAttributes] = useState(false);

  const handleAttributeClick = (
    profile: ScoutingProfile,
    attributeName: string,
    index: number,
  ) => {
    const cost = getScoutingCost(attributeName, league);
    const showProperty = getAttributeShowProperty(
      attributeName,
      league,
      showPotentialAttributes,
      index,
    );
    const revealed = (profile as any)[showProperty];

    if (!revealed && availablePoints >= cost) {
      onRevealAttribute(profile.ID, showProperty, cost);
    }
  };

  const renderScoutingAttributeBox = (
    profile: ScoutingProfile,
    player: Draftee,
    attributeName: string,
    isClickable: boolean = true,
    showPotentialAttributes: boolean = false,
    index: number,
  ) => {
    const showProperty = getAttributeShowProperty(
      attributeName,
      league,
      showPotentialAttributes,
      index,
    );
    const revealed = (profile as any)[showProperty];
    const cost = getScoutingCost(attributeName, league);
    const canAfford = availablePoints >= cost;

    return (
      <ScoutingAttributeBox
        key={attributeName}
        attributeName={attributeName}
        player={player}
        cost={cost}
        revealed={revealed}
        canAfford={canAfford}
        onClick={() =>
          isClickable
            ? handleAttributeClick(profile, attributeName, index)
            : undefined
        }
        league={league}
      />
    );
  };

  const revealedCount = getRevealedCount(profile);
  const scoutableAttributes = getScoutableAttributes(
    player.Position,
    player.Archetype,
    league,
  ).filter((attr) => {
    if (league === SimNFL) {
      return attr !== "Potential Grade";
    }
    return showPotentialAttributes
      ? attr.includes("Potential")
      : !attr.includes("Potential");
  });
  const playerCollege = getPlayerCollege(player, league);
  const collegeLeague = getCollegeLeagueConstant(league);

  const picturePlayerId = isNFLLeague(league)
    ? (player as any).PlayerID
    : player.ID;
  const pictureTeamId = isNFLLeague(league)
    ? (player as any).CollegeID
    : (player as any).TeamID;

  const isGoodOffensiveFit = (() => {
    if (!player || !offensiveSystemsInformation) return false;
    const goodFits = offensiveSystemsInformation.GoodFits;
    const idx = goodFits.findIndex(
      (x: any) => x.archetype === player.Archetype,
    );
    if (idx > -1) {
      return true;
    }
    return false;
  })();

  const isBadOffensiveFit = (() => {
    if (!player || !offensiveSystemsInformation) return false;
    const badFits = offensiveSystemsInformation.BadFits;
    const idx = badFits.findIndex((x: any) => x.archetype === player.Archetype);
    if (idx > -1) {
      return true;
    }
    return false;
  })();

  const isGoodDefensiveFit = (() => {
    if (!player || !defensiveSystemsInformation) return false;
    const goodFits = defensiveSystemsInformation.GoodFits;
    const idx = goodFits.findIndex(
      (x: any) => x.archetype === player.Archetype,
    );
    if (idx > -1) {
      return true;
    }
    return false;
  })();

  const isBadDefensiveFit = (() => {
    if (!player || !defensiveSystemsInformation) return false;
    const badFits = defensiveSystemsInformation.BadFits;
    const idx = badFits.findIndex((x: any) => x.archetype === player.Archetype);
    if (idx > -1) {
      return true;
    }
    return false;
  })();

  const draftPlayerType = (() => {
    const typing = player.DraftablePlayerType;
    if (typing === 0) {
      return "College";
    }
    if (typing === 1) {
      return "Graduate";
    }
    if (typing === 2) {
      return "International";
    }
    if (typing === 3) {
      return "Canadian";
    }
    return "Unknown";
  })();

  const draftPlayerTypeVariant = (() => {
    const typing = player.DraftablePlayerType;
    if (typing === 0) {
      return "yellow";
    }
    if (typing === 1) {
      return "purple";
    }
    if (typing === 2) {
      return "indigo";
    }
    if (typing === 3) {
      return "red";
    }
    return "gray";
  })();

  return (
    <Border
      key={profile.ID}
      classes={`p-3 rounded-lg ${isDrafted ? "opacity-50" : ""}`}
      styles={{
        backgroundColor:
          index % 2 === 1 ? backgroundColor : darkenColor(backgroundColor, -5),
        borderColor: darkenColor(backgroundColor, 5),
      }}
    >
      <div className="flex flex-col space-y-4 md:grid md:grid-cols-4 md:gap-3 md:space-y-0">
        <div className="flex flex-row md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
            <PlayerPicture
              playerID={picturePlayerId}
              team={pictureTeamId}
              league={collegeLeague}
            />
          </div>
          <div className="flex-1 md:text-center">
            <Text variant="body-small" classes="text-white font-semibold">
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => viewPlayer(player)}
              >
                {player.FirstName} {player.LastName}
              </span>
            </Text>
            <div className="flex flex-wrap gap-1 items-start md:items-center md:justify-center max-w-xs md:max-w-none mt-1">
              <Tag variant="gray" size="xs">
                {playerCollege}
              </Tag>
              <Tag variant="blue" size="xs">
                {player.Position}
              </Tag>
              <Tag variant="blue" size="xs">
                {player.Archetype}
              </Tag>
              <Tag variant={draftPlayerTypeVariant} size="xs">
                {draftPlayerType}
              </Tag>
              {isGoodOffensiveFit && (
                <Tag variant="green" size="xs">
                  Off. Fit
                </Tag>
              )}
              {isGoodDefensiveFit && (
                <Tag variant="green" size="xs">
                  Def. Fit
                </Tag>
              )}
              {isBadOffensiveFit && (
                <Tag variant="red" size="xs">
                  Off. Misfit
                </Tag>
              )}
              {isBadDefensiveFit && (
                <Tag variant="red" size="xs">
                  Def. Misfit
                </Tag>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-3 md:space-y-2 md:items-center md:justify-center md:flex md:flex-col">
          <Text variant="xs" classes="text-gray-300 text-center md:text-center">
            Attributes
          </Text>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-row gap-2 justify-center md:justify-start">
              <div className="text-center">
                <Text variant="xs" classes="text-gray-300 text-[10px]">
                  Overall
                </Text>
                <div className="min-w-[50px] min-h-[50px] max-w-[80px] max-h-[80px] bg-gray-700 border border-gray-600 rounded flex items-center justify-center">
                  <Text variant="xs" classes="text-green-400 font-bold text-sm">
                    {getOverallGrade(player)}
                  </Text>
                </div>
              </div>
              <div className="text-center">
                <Text variant="xs" classes="text-gray-300 text-[10px]">
                  Potential
                </Text>
                {league !== SimPHL ? (
                  renderScoutingAttributeBox(
                    profile,
                    player,
                    "Potential Grade",
                    true,
                    showPotentialAttributes,
                    index,
                  )
                ) : (
                  <div className="mt-2">
                    <ToggleSwitch
                      checked={showPotentialAttributes}
                      onChange={() =>
                        setShowPotentialAttributes(!showPotentialAttributes)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-1">
                {scoutableAttributes.map((attributeName, idx) => {
                  return renderScoutingAttributeBox(
                    profile,
                    player,
                    attributeName,
                    true,
                    showPotentialAttributes,
                    idx,
                  );
                })}
              </div>
            </div>
          </div>
          <Text variant="xs" classes="text-gray-500 text-center text-[10px]">
            {revealedCount}/
            {
              getScoutableAttributes(player.Position, player.Archetype, league)
                .length
            }{" "}
            attributes revealed
          </Text>
        </div>
        <div className="flex flex-row md:flex-col gap-2 md:justify-center md:items-center">
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => onDraftPlayer && onDraftPlayer(player)}
            className={`flex-1 md:min-w-[10em] p-3 md:p-2 flex justify-center gap-2 items-center ${isUserTurn ? "bg-green-700" : "bg-red-800"}`}
            disabled={!isUserTurn || isDrafted}
          >
            {isDrafted ? (
              <>
                <ActionLock /> <span className="hidden sm:inline">Drafted</span>
              </>
            ) : (
              <>
                <Handshake />
                <span className="hidden sm:inline">Draft</span>{" "}
                {player.FirstName}
              </>
            )}
          </Button>

          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => onRemoveFromBoard(profile)}
            className="flex-1 md:min-w-[10em] p-3 md:p-2 flex justify-center gap-2 items-center"
          >
            <Trash />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </Border>
  );
};

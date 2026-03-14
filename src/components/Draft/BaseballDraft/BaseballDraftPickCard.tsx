import React from "react";
import { BaseballDraftPick } from "../../../models/baseball/baseballDraftModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB } from "../../../_constants/constants";

interface BaseballDraftPickCardProps {
  pick: BaseballDraftPick;
  isCurrent?: boolean;
  isUserPick?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  playerFace?: any;
}

const BaseballDraftPickCard: React.FC<BaseballDraftPickCardProps> = ({
  pick,
  isCurrent = false,
  isUserPick = false,
  size = "md",
  onClick,
  playerFace,
}) => {
  const isSm = size === "sm";
  const logoSrc = getLogo(SimMLB, pick.org_id, false);
  const isTraded = pick.org_id !== pick.original_org_id;
  const hasPlayer = pick.selected_player_id !== null;

  const borderColor = isCurrent
    ? "border-blue-500"
    : isUserPick
      ? "border-green-500"
      : "border-gray-700";

  const pulseClass = isCurrent ? "animate-pulse" : "";

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center rounded-lg border-2 bg-gray-800 text-white
        ${borderColor} ${pulseClass}
        ${isSm ? "w-28 p-2 gap-1" : "w-40 p-3 gap-2"}
        ${onClick ? "cursor-pointer hover:bg-gray-750" : ""}
      `}
    >
      {/* Round / Pick header */}
      <span className={`text-gray-400 ${isSm ? "text-[10px]" : "text-xs"}`}>
        Rd {pick.round} / Pick {pick.pick_number}
      </span>

      {/* Org logo */}
      <img
        src={logoSrc}
        alt={pick.org_abbrev}
        className={isSm ? "h-8 w-8 object-contain" : "h-12 w-12 object-contain"}
      />

      {/* Traded indicator */}
      {isTraded && (
        <span className={`text-yellow-400 italic ${isSm ? "text-[9px]" : "text-[11px]"}`}>
          via {pick.original_org_abbrev}
        </span>
      )}

      {/* Selected player info */}
      {hasPlayer ? (
        <div className="flex flex-col items-center gap-0.5">
          {playerFace && (
            <div className={isSm ? "h-6 w-6" : "h-10 w-10"}>
              {playerFace}
            </div>
          )}
          <span
            className={`font-semibold text-center leading-tight ${isSm ? "text-[10px]" : "text-sm"}`}
          >
            {pick.selected_player_name}
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`rounded bg-gray-700 px-1 font-mono ${isSm ? "text-[9px]" : "text-xs"}`}
            >
              {pick.selected_player_position}
            </span>
            {pick.selected_player_college_abbrev && (
              <span className={`text-gray-400 ${isSm ? "text-[9px]" : "text-xs"}`}>
                {pick.selected_player_college_abbrev}
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className={`text-gray-500 italic ${isSm ? "text-[10px]" : "text-xs"}`}>
          —
        </span>
      )}
    </div>
  );
};

export default BaseballDraftPickCard;

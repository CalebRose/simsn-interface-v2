import React from "react";
import { BaseballDraftPick, SignStatus } from "../../../models/baseball/baseballDraftModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB } from "../../../_constants/constants";

interface BaseballDraftPickCardProps {
  pick: BaseballDraftPick;
  orgMap: Record<number, string>;
  isCurrent?: boolean;
  isUserPick?: boolean;
  size?: "sm" | "md";
  showSignStatus?: boolean;
  onClick?: () => void;
}

const signStatusColors: Record<SignStatus, string> = {
  pending: "bg-gray-600",
  signed: "bg-green-600",
  passed: "bg-yellow-600",
  refused: "bg-red-600",
};

const BaseballDraftPickCard: React.FC<BaseballDraftPickCardProps> = ({
  pick,
  orgMap,
  isCurrent = false,
  isUserPick = false,
  size = "md",
  showSignStatus = false,
  onClick,
}) => {
  const isSm = size === "sm";
  const logoSrc = getLogo(SimMLB, pick.current_org_id, false);
  const isTraded = pick.current_org_id !== pick.original_org_id;
  const hasPlayer = pick.player_id !== null;
  const orgAbbrev = orgMap[pick.current_org_id] ?? "";
  const originalOrgAbbrev = orgMap[pick.original_org_id] ?? "";

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
        Rd {pick.round} / Pick {pick.pick_in_round}
      </span>

      {/* Org logo */}
      <img
        src={logoSrc}
        alt={orgAbbrev}
        className={isSm ? "h-8 w-8 object-contain" : "h-12 w-12 object-contain"}
      />

      {/* Traded indicator */}
      {isTraded && (
        <span className={`text-yellow-400 italic ${isSm ? "text-[9px]" : "text-[11px]"}`}>
          via {originalOrgAbbrev}
        </span>
      )}

      {/* Selected player info */}
      {hasPlayer ? (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`font-semibold text-center leading-tight ${isSm ? "text-[10px]" : "text-sm"}`}
          >
            {pick.player_name}
          </span>
          <div className="flex items-center gap-1">
            {pick.is_auto_pick && (
              <span
                className={`rounded bg-orange-600/30 text-orange-400 px-1 font-mono ${isSm ? "text-[8px]" : "text-[10px]"}`}
                title="Auto-drafted"
              >
                A
              </span>
            )}
            {showSignStatus && pick.sign_status && (
              <span
                className={`rounded px-1 text-white ${isSm ? "text-[8px]" : "text-[10px]"} ${signStatusColors[pick.sign_status]}`}
              >
                {pick.sign_status}
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className={`text-gray-500 italic ${isSm ? "text-[10px]" : "text-xs"}`}>
          {orgAbbrev || "—"}
        </span>
      )}
    </div>
  );
};

export default BaseballDraftPickCard;

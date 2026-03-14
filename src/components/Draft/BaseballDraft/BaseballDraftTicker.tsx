import React from "react";
import { BaseballDraftPick } from "../../../models/baseball/baseballDraftModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB } from "../../../_constants/constants";

interface BaseballDraftTickerProps {
  recentPicks: BaseballDraftPick[];
}

const BaseballDraftTicker: React.FC<BaseballDraftTickerProps> = ({
  recentPicks,
}) => {
  if (recentPicks.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto bg-gray-900 px-4 py-2">
      {recentPicks.map((pick, idx) => {
        const isNewest = idx === 0;
        const isTraded = pick.org_id !== pick.original_org_id;
        const logoSrc = getLogo(SimMLB, pick.org_id, false);

        return (
          <div
            key={pick.id}
            className={`
              flex shrink-0 items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5
              ${isNewest ? "ring-2 ring-blue-500 animate-pulse" : ""}
            `}
          >
            {/* Overall pick number */}
            <span className="text-[11px] font-mono text-gray-400">
              #{pick.overall_pick}
            </span>

            {/* Org logo */}
            <img
              src={logoSrc}
              alt={pick.org_abbrev}
              className="h-5 w-5 object-contain"
            />

            {/* Player name */}
            <span className="text-xs font-semibold text-white whitespace-nowrap">
              {pick.selected_player_name ?? "—"}
            </span>

            {/* Position badge */}
            {pick.selected_player_position && (
              <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-mono text-gray-300">
                {pick.selected_player_position}
              </span>
            )}

            {/* College abbrev */}
            {pick.selected_player_college_abbrev && (
              <span className="text-[10px] text-gray-500">
                {pick.selected_player_college_abbrev}
              </span>
            )}

            {/* Traded indicator */}
            {isTraded && (
              <span className="text-[9px] italic text-yellow-400">
                via {pick.original_org_abbrev}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BaseballDraftTicker;

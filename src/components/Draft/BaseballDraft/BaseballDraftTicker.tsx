import React from "react";
import { BaseballDraftPick } from "../../../models/baseball/baseballDraftModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB } from "../../../_constants/constants";

interface BaseballDraftTickerProps {
  recentPicks: BaseballDraftPick[];
  orgMap: Record<number, string>;
}

const BaseballDraftTicker: React.FC<BaseballDraftTickerProps> = ({
  recentPicks,
  orgMap,
}) => {
  if (recentPicks.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto bg-gray-900 px-4 py-2">
      {recentPicks.map((pick, idx) => {
        const isNewest = idx === recentPicks.length - 1;
        const isTraded = pick.current_org_id !== pick.original_org_id;
        const logoSrc = getLogo(SimMLB, pick.current_org_id, false);
        const orgAbbrev = orgMap[pick.current_org_id] ?? "";

        return (
          <div
            key={pick.pick_id}
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
              alt={orgAbbrev}
              className="h-5 w-5 object-contain"
            />

            {/* Player name */}
            <span className="text-xs font-semibold text-white whitespace-nowrap">
              {pick.player_name ?? "—"}
            </span>

            {/* Auto pick indicator */}
            {pick.is_auto_pick && (
              <span className="rounded bg-orange-600/30 text-orange-400 px-1 text-[9px] font-mono">
                A
              </span>
            )}

            {/* Traded indicator */}
            {isTraded && (
              <span className="text-[9px] italic text-yellow-400">
                via {orgMap[pick.original_org_id] ?? ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BaseballDraftTicker;

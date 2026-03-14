import React, { FC, useState, useEffect, useRef } from "react";
import {
  BaseballDraftee,
  BASEBALL_DRAFT_POSITIONS,
} from "../../../models/baseball/baseballDraftModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { BaseballScoutingModal } from "../../Team/baseball/BaseballScouting/BaseballScoutingModal";
import { SimCollegeBaseball } from "../../../_constants/constants";

interface BaseballScoutingViewProps {
  draftees: BaseballDraftee[];
  draftedPlayerIds: Set<number>;
  scoutingBudget: ScoutingBudget | null;
  scoutModalPlayerId: number | null;
  isScoutModalOpen: boolean;
  onOpenScoutModal: (playerId: number) => void;
  onCloseScoutModal: () => void;
  onBudgetChanged: () => void;
  orgId: number;
  leagueYearId: number;
  onFetchPage: (params: {
    position?: string;
    search?: string;
    page?: number;
  }) => void;
  drafteesTotal: number;
  drafteesPage: number;
  drafteesPages: number;
}

const BaseballScoutingView: FC<BaseballScoutingViewProps> = ({
  draftees,
  draftedPlayerIds,
  scoutingBudget,
  scoutModalPlayerId,
  isScoutModalOpen,
  onOpenScoutModal,
  onCloseScoutModal,
  onBudgetChanged,
  orgId,
  leagueYearId,
  onFetchPage,
  drafteesTotal,
  drafteesPage,
  drafteesPages,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFetchPage({
        search: searchText || undefined,
        position: selectedPosition || undefined,
        page: 1,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, selectedPosition]);

  const handlePositionToggle = (pos: string) => {
    setSelectedPosition((prev) => (prev === pos ? null : pos));
  };

  const handlePageChange = (page: number) => {
    onFetchPage({
      search: searchText || undefined,
      position: selectedPosition || undefined,
      page,
    });
  };

  const formatHeight = (inches: number): string => {
    const feet = Math.floor(inches / 12);
    const rem = inches % 12;
    return `${feet}'${rem}"`;
  };

  return (
    <div className="bg-gray-950 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Draft Scouting</h2>
          <p className="text-sm text-gray-400 mt-1">
            Scout draft-eligible players to reveal their attributes and
            potential grades.
          </p>
        </div>
        {scoutingBudget && (
          <div className="text-sm text-gray-400">
            Scouting:{" "}
            <span className="text-white font-semibold">
              {scoutingBudget.remaining_points}
            </span>
            /{scoutingBudget.total_points} pts
          </div>
        )}
      </div>

      {/* Search + position filter */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Search players..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2">
          {BASEBALL_DRAFT_POSITIONS.map((pos) => (
            <button
              key={pos.value}
              onClick={() => handlePositionToggle(pos.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPosition === pos.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {pos.value}
            </button>
          ))}
        </div>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {draftees.map((player) => {
          const isDrafted = draftedPlayerIds.has(player.player_id);
          return (
            <div
              key={player.player_id}
              className={`bg-gray-900 border border-gray-800 rounded-lg p-3 flex flex-col gap-2 ${
                isDrafted ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">
                  {player.first_name} {player.last_name}
                </span>
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                  {player.position}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-y-0.5">
                <div>{player.college_team}</div>
                <div>
                  Age {player.age} &middot; {formatHeight(player.height)},{" "}
                  {player.weight} lbs
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-sm text-gray-300">
                  OVR: {player.overall_grade ?? "—"}
                </span>
                <button
                  onClick={() => onOpenScoutModal(player.player_id)}
                  disabled={isDrafted}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Scout
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
        <span>
          Page {drafteesPage} of {drafteesPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={drafteesPage <= 1}
            onClick={() => handlePageChange(drafteesPage - 1)}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <button
            disabled={drafteesPage >= drafteesPages}
            onClick={() => handlePageChange(drafteesPage + 1)}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Scouting Modal */}
      {isScoutModalOpen && scoutModalPlayerId && (
        <BaseballScoutingModal
          isOpen={isScoutModalOpen}
          onClose={onCloseScoutModal}
          playerId={scoutModalPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={onBudgetChanged}
          league={SimCollegeBaseball}
        />
      )}
    </div>
  );
};

export default BaseballScoutingView;

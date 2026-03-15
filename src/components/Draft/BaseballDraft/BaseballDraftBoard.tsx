import React, { FC, useState, useEffect, useRef } from "react";
import {
  BaseballDraftee,
  BASEBALL_DRAFT_POSITIONS,
} from "../../../models/baseball/baseballDraftModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import "../../Team/baseball/baseballMobile.css";

interface BaseballDraftBoardProps {
  draftees: BaseballDraftee[];
  drafteesTotal: number;
  drafteesPage: number;
  drafteesPages: number;
  draftedPlayerIds: Set<number>;
  isUserTurn: boolean;
  onFetchPage: (params: {
    position?: string;
    search?: string;
    page?: number;
  }) => void;
  onDraftPlayer: (player: BaseballDraftee) => void;
  onScoutPlayer: (playerId: number) => void;
  scoutingBudget: ScoutingBudget | null;
}

const formatHeight = (inches: number): string => {
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
};

const BaseballDraftBoard: FC<BaseballDraftBoardProps> = ({
  draftees,
  drafteesTotal,
  drafteesPage,
  drafteesPages,
  draftedPlayerIds,
  isUserTurn,
  onFetchPage,
  onDraftPlayer,
  onScoutPlayer,
  scoutingBudget,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showDrafted, setShowDrafted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
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

  const visibleDraftees = showDrafted
    ? draftees
    : draftees.filter((d) => !draftedPlayerIds.has(d.player_id));

  return (
    <div className="bg-gray-950 rounded-lg p-4 space-y-4">
      {/* Top bar: search + scouting budget */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search players..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

      {/* Position filter buttons */}
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

      {/* Show/Hide drafted toggle */}
      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showDrafted}
          onChange={(e) => setShowDrafted(e.target.checked)}
          className="accent-blue-500"
        />
        Show drafted players
      </label>

      {/* Table */}
      <div className="baseball-table-wrapper overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Pos</th>
              <th className="px-2 py-2">Age</th>
              <th className="px-2 py-2">College</th>
              <th className="px-2 py-2">Ht</th>
              <th className="px-2 py-2">Wt</th>
              <th className="px-2 py-2">B/T</th>
              <th className="px-2 py-2">OVR</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleDraftees.map((player) => {
              const isDrafted = draftedPlayerIds.has(player.player_id);
              return (
                <tr
                  key={player.player_id}
                  className={`border-b border-gray-800 ${
                    isDrafted
                      ? "opacity-50"
                      : "hover:bg-gray-900 text-white"
                  }`}
                >
                  <td className="px-2 py-2 text-gray-400">
                    {player.draft_rank ?? "—"}
                  </td>
                  <td className="px-2 py-2 font-medium">
                    {player.first_name} {player.last_name}
                  </td>
                  <td className="px-2 py-2">{player.position}</td>
                  <td className="px-2 py-2">{player.age}</td>
                  <td className="px-2 py-2">{player.college_team}</td>
                  <td className="px-2 py-2">{formatHeight(player.height)}</td>
                  <td className="px-2 py-2">{player.weight}</td>
                  <td className="px-2 py-2">
                    {player.bat_hand}/{player.throw_hand}
                  </td>
                  <td className="px-2 py-2">
                    {player.overall_grade ?? "—"}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onScoutPlayer(player.player_id)}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                      >
                        Scout
                      </button>
                      {isUserTurn && !isDrafted && (
                        <button
                          onClick={() => onDraftPlayer(player)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                          Draft
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
    </div>
  );
};

export default BaseballDraftBoard;

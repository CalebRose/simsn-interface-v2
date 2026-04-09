import React, { FC, useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BaseballDraftee,
  BASEBALL_DRAFT_POSITIONS,
} from "../../../models/baseball/baseballDraftModels";
import type { Player } from "../../../models/baseball/baseballModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { adaptDraftee, type DraftPlayer } from "./draftPlayerAdapter";
import {
  AllPlayersTable,
  PositionTable,
  PitcherTable,
  type BaseballCategory,
  type SortConfig,
} from "../../Team/baseball/BaseballRosterTable";
import "../../Team/baseball/baseballMobile.css";

interface BaseballEligiblePlayersProps {
  eligiblePlayers: BaseballDraftee[];
  eligibleTotal: number;
  eligibleLimit: number;
  eligibleOffset: number;
  draftedPlayerIds: Set<number>;
  isUserTurn: boolean;
  onFetchPlayers: (params: {
    source?: "college" | "hs";
    search?: string;
    offset?: number;
    limit?: number;
  }) => void;
  onDraftPlayer: (player: BaseballDraftee) => void;
  onScoutPlayer: (playerId: number) => void;
  onAddToQueue?: (playerId: number) => void;
  scoutingBudget: ScoutingBudget | null;
  autoRoundsLocked?: boolean;
}

const BaseballEligiblePlayers: FC<BaseballEligiblePlayersProps> = ({
  eligiblePlayers,
  eligibleTotal,
  eligibleLimit,
  eligibleOffset,
  draftedPlayerIds,
  isUserTurn,
  onFetchPlayers,
  onDraftPlayer,
  onScoutPlayer,
  onAddToQueue,
  scoutingBudget,
  autoRoundsLocked = false,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<"college" | "hs" | null>(null);
  const [showDrafted, setShowDrafted] = useState(false);
  const [category, setCategory] = useState<BaseballCategory>("Attributes");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort state (client-side within the current page)
  const [sortKey, setSortKey] = useState("lastname");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const sortConfig: SortConfig = { key: sortKey, dir: sortDir };
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Pagination computed
  const currentPage = Math.floor(eligibleOffset / eligibleLimit) + 1;
  const totalPages = Math.ceil(eligibleTotal / eligibleLimit);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFetchPlayers({
        search: searchText || undefined,
        source: selectedSource ?? undefined,
        offset: 0,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, selectedSource]);

  const handlePositionToggle = (pos: string) => {
    setSelectedPosition((prev) => (prev === pos ? null : pos));
  };

  const handleSourceToggle = (src: "college" | "hs") => {
    setSelectedSource((prev) => (prev === src ? null : src));
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * eligibleLimit;
    onFetchPlayers({
      search: searchText || undefined,
      source: selectedSource ?? undefined,
      offset: newOffset,
    });
  };

  // Keep a map from player_id to raw draftee for the draft callback
  const drafteeMap = useMemo(() => {
    const map = new Map<number, BaseballDraftee>();
    eligiblePlayers.forEach((d) => map.set(d.player_id, d));
    return map;
  }, [eligiblePlayers]);

  // Adapt and filter
  const players: DraftPlayer[] = useMemo(() => {
    let visible = eligiblePlayers;
    if (!showDrafted) {
      visible = visible.filter((d) => !draftedPlayerIds.has(d.player_id));
    }
    if (selectedPosition) {
      visible = visible.filter((d) => d.position === selectedPosition);
    }
    return visible.map(adaptDraftee);
  }, [eligiblePlayers, draftedPlayerIds, showDrafted, selectedPosition]);

  // Action button styling
  const actionBtn =
    "px-2 py-1.5 sm:px-1.5 sm:py-0.5 rounded text-xs sm:text-[11px] min-h-[36px] sm:min-h-0 font-semibold leading-tight whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  const renderActions = useCallback((p: Player) => {
    const dp = p as DraftPlayer;
    const isDrafted = draftedPlayerIds.has(dp.player_id);
    const attrsScouted = dp.scouting_state?.attrs_precise;

    return (
      <div className="flex gap-1.5 sm:gap-0.5 items-center">
        <button
          className={`${actionBtn} ${attrsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-gray-600/20 text-gray-300 hover:bg-gray-600/40"}`}
          disabled={attrsScouted}
          onClick={attrsScouted ? undefined : () => onScoutPlayer(dp.player_id)}
        >
          Scout{attrsScouted ? " \u2713" : ""}
        </button>
        {isUserTurn && !isDrafted && (
          <button
            className={`${actionBtn} bg-blue-600/20 text-blue-400 hover:bg-blue-600/40`}
            onClick={() => {
              const raw = drafteeMap.get(dp.player_id);
              if (raw) onDraftPlayer(raw);
            }}
          >
            Draft
          </button>
        )}
        {onAddToQueue && !autoRoundsLocked && !isDrafted && (
          <button
            className={`${actionBtn} bg-purple-600/20 text-purple-400 hover:bg-purple-600/40`}
            onClick={() => onAddToQueue(dp.player_id)}
            title="Add to auto-draft queue"
          >
            + Queue
          </button>
        )}
      </div>
    );
  }, [actionBtn, draftedPlayerIds, isUserTurn, onScoutPlayer, onDraftPlayer, onAddToQueue, drafteeMap, autoRoundsLocked]);

  // Determine which table variant based on position filter
  const TableComponent = selectedPosition && (selectedPosition === "SP" || selectedPosition === "RP")
    ? PitcherTable
    : selectedPosition && selectedPosition !== "DH"
      ? PositionTable
      : AllPlayersTable;

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

      {/* Source filter */}
      <div className="flex gap-2">
        {(["college", "hs"] as const).map((src) => (
          <button
            key={src}
            onClick={() => handleSourceToggle(src)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedSource === src
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {src === "college" ? "College" : "High School"}
          </button>
        ))}
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

      {/* Category + Show drafted */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["Attributes", "Potentials"] as BaseballCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDrafted}
            onChange={(e) => setShowDrafted(e.target.checked)}
            className="accent-blue-500"
          />
          Show drafted players
        </label>
      </div>

      {/* Table */}
      <TableComponent
        players={players}
        orgAbbrev=""
        onPlayerClick={() => {}}
        sortConfig={sortConfig}
        onSort={handleSort}
        category={category}
        isCollege
        isFuzzed
        renderActions={renderActions}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
        <span>
          {eligibleTotal > 0
            ? `${eligibleOffset + 1}-${Math.min(eligibleOffset + eligibleLimit, eligibleTotal)} of ${eligibleTotal}`
            : "No players found"}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseballEligiblePlayers;

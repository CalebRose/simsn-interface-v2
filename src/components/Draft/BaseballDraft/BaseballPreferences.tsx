import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AutoDraftPreferences,
  AutoDraftQueueEntry,
  BaseballDraftee,
} from "../../../models/baseball/baseballDraftModels";

// ═══════════════════════════════════════════════
// Sortable queue item
// ═══════════════════════════════════════════════

interface SortableQueueItemProps {
  entry: AutoDraftQueueEntry;
  playerName: string;
  onRemove: (playerId: number) => void;
  disabled: boolean;
}

const SortableQueueItem: React.FC<SortableQueueItemProps> = ({
  entry,
  playerName,
  onRemove,
  disabled,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.player_id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded bg-gray-800 px-3 py-2 border border-gray-700"
    >
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-500 hover:text-gray-300 touch-none"
          title="Drag to reorder"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </button>
      )}
      <span className="text-xs text-gray-500 font-mono w-6 text-right">
        {entry.priority}
      </span>
      <span className="text-sm text-white flex-1">{playerName}</span>
      {!disabled && (
        <button
          onClick={() => onRemove(entry.player_id)}
          className="text-red-400 hover:text-red-300 text-xs font-medium"
        >
          Remove
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════

interface BaseballPreferencesProps {
  autoPrefs: AutoDraftPreferences | null;
  autoRoundsLocked: boolean;
  eligiblePlayers: BaseballDraftee[];
  draftedPlayerIds: Set<number>;
  onSave: (prefs: { pitcher_quota?: number; hitter_quota?: number; queue?: number[] }) => Promise<void>;
  onFetchPlayers: (params: { search?: string; offset?: number }) => void;
}

const BaseballPreferences: React.FC<BaseballPreferencesProps> = ({
  autoPrefs,
  autoRoundsLocked,
  eligiblePlayers,
  draftedPlayerIds,
  onSave,
  onFetchPlayers,
}) => {
  const [pitcherQuota, setPitcherQuota] = useState(0);
  const [hitterQuota, setHitterQuota] = useState(0);
  const [queue, setQueue] = useState<AutoDraftQueueEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const isLocked = autoRoundsLocked || (autoPrefs?.locked ?? false);

  // Sync from props
  useEffect(() => {
    if (autoPrefs) {
      setPitcherQuota(autoPrefs.pitcher_quota);
      setHitterQuota(autoPrefs.hitter_quota);
      setQueue(autoPrefs.queue);
    }
  }, [autoPrefs]);

  // Build player name lookup from eligible + queue
  const playerNameMap = new Map<number, string>();
  for (const p of eligiblePlayers) {
    playerNameMap.set(p.player_id, `${p.first_name} ${p.last_name}`);
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQueue((prev) => {
      const oldIndex = prev.findIndex((e) => e.player_id === active.id);
      const newIndex = prev.findIndex((e) => e.player_id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((e, i) => ({ ...e, priority: i + 1 }));
    });
  }, []);

  const removeFromQueue = useCallback((playerId: number) => {
    setQueue((prev) =>
      prev
        .filter((e) => e.player_id !== playerId)
        .map((e, i) => ({ ...e, priority: i + 1 })),
    );
  }, []);

  const addToQueue = useCallback((playerId: number) => {
    setQueue((prev) => {
      if (prev.some((e) => e.player_id === playerId)) return prev;
      return [...prev, { player_id: playerId, priority: prev.length + 1 }];
    });
    setSearchText("");
    setShowSearch(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await onSave({
        pitcher_quota: pitcherQuota,
        hitter_quota: hitterQuota,
        queue: queue.map((e) => e.player_id),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  // Filter eligible players for add-to-queue search
  const queuePlayerIds = new Set(queue.map((e) => e.player_id));
  const searchResults = searchText.length >= 2
    ? eligiblePlayers
        .filter(
          (p) =>
            !draftedPlayerIds.has(p.player_id) &&
            !queuePlayerIds.has(p.player_id) &&
            (`${p.first_name} ${p.last_name}`).toLowerCase().includes(searchText.toLowerCase()),
        )
        .slice(0, 10)
    : [];

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Auto-Draft Preferences</h2>
        {isLocked && (
          <span className="rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase">
            Locked
          </span>
        )}
      </div>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">{error}</div>
      )}
      {success && (
        <div className="rounded bg-green-900/50 px-4 py-2 text-sm text-green-300">Preferences saved!</div>
      )}

      {/* Quotas */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Position Quotas</h3>
        <p className="text-xs text-gray-500 mb-3">
          Target number of pitchers/hitters to auto-draft. These are soft targets — once both are filled, remaining picks use best player available.
        </p>
        <div className="flex gap-6">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Pitchers</label>
            <input
              type="number"
              min={0}
              max={20}
              value={pitcherQuota}
              onChange={(e) => setPitcherQuota(Number(e.target.value))}
              disabled={isLocked}
              className="w-20 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Hitters</label>
            <input
              type="number"
              min={0}
              max={20}
              value={hitterQuota}
              onChange={(e) => setHitterQuota(Number(e.target.value))}
              disabled={isLocked}
              className="w-20 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Queue */}
      <section className="rounded border border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-300">Priority Queue</h3>
          {!isLocked && (
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) onFetchPlayers({ offset: 0 });
              }}
              className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500"
            >
              + Add Player
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          During auto-rounds, the system picks the highest-priority available player from your queue first. Drag to reorder.
        </p>

        {/* Add player search */}
        {showSearch && !isLocked && (
          <div className="mb-4 rounded border border-gray-600 bg-gray-900 p-3">
            <input
              type="text"
              placeholder="Search for a player to add..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.player_id}
                    onClick={() => addToQueue(p.player_id)}
                    className="w-full flex items-center justify-between rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    <span>{p.first_name} {p.last_name}</span>
                    <span className="text-xs text-gray-400">
                      {p.position} | Rank #{p.draft_rank ?? "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchText.length >= 2 && searchResults.length === 0 && (
              <p className="text-xs text-gray-500">No matching players found</p>
            )}
          </div>
        )}

        {/* Sortable queue list */}
        {queue.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={queue.map((e) => e.player_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {queue.map((entry) => (
                  <SortableQueueItem
                    key={entry.player_id}
                    entry={entry}
                    playerName={playerNameMap.get(entry.player_id) ?? `Player #${entry.player_id}`}
                    onRemove={removeFromQueue}
                    disabled={isLocked}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No players in queue. Add players to set your auto-draft priority order.
          </p>
        )}
      </section>

      {/* Save */}
      {!isLocked && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 self-start"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      )}
    </div>
  );
};

export default BaseballPreferences;

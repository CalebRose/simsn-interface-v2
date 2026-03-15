import { useState, useEffect, useRef, useMemo } from "react";
import { Text } from "../../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { ToggleSwitch } from "../../../../_design/Inputs";
import { Player, PlayerRatings } from "../../../../models/baseball/baseballModels";
import {
  DefenseConfig,
  DefenseAssignment,
  LineupRole,
  PositionCode,
  VsHand,
} from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import {
  DEFENSE_POSITION_ORDER,
  DIAMOND_LAYOUT,
  BATTING_DISPLAY_ATTRS,
  ALL_DEFENSE_ATTRS,
  PositionDisplayMap,
  PositionShortMap,
  PositionRatingKey,
  LineupRoleOptions,
} from "../BaseballGameplanConstants";
import { PlayerAttributeRow, ratingColor } from "../ratingUtils";

interface DefenseAndLineupTabProps {
  teamId: number;
  players: Player[];
}

const ALL_POSITIONS: PositionCode[] = [...DEFENSE_POSITION_ORDER, "dh"];

/** Ensure assignments from older API responses have the new batting fields. */
function normalizeAssignment(a: DefenseAssignment): DefenseAssignment {
  return {
    ...a,
    lineup_role: a.lineup_role ?? "balanced",
    min_order: a.min_order ?? null,
    max_order: a.max_order ?? null,
  };
}

export const DefenseAndLineupTab = ({ teamId, players }: DefenseAndLineupTabProps) => {
  const [assignments, setAssignments] = useState<DefenseAssignment[]>([]);
  const baselineRef = useRef<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load defense config
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const defenseData = await BaseballService.GetDefensePlan(teamId).catch(
          () => ({ assignments: [] } as DefenseConfig),
        );
        if (!cancelled) {
          const loaded = (defenseData.assignments ?? []).map(normalizeAssignment);
          setAssignments(loaded);
          baselineRef.current = JSON.stringify(loaded);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  const isDirty = useMemo(() => {
    return JSON.stringify(assignments) !== baselineRef.current;
  }, [assignments]);

  // Group assignments by position
  const grouped = useMemo(() => {
    const map: Record<string, DefenseAssignment[]> = {};
    for (const pos of ALL_POSITIONS) {
      map[pos] = assignments
        .filter((a) => a.position_code === pos)
        .sort((a, b) => a.priority - b.priority);
    }
    return map;
  }, [assignments]);

  // Build player options per position, sorted by relevant rating
  const playerOptionsByPos = useMemo(() => {
    const result: Record<string, SelectOption[]> = {};
    for (const pos of ALL_POSITIONS) {
      const ratingKey = PositionRatingKey[pos] as keyof PlayerRatings;
      const sorted = [...players].sort(
        (a, b) =>
          ((b.ratings[ratingKey] as number) ?? 0) -
          ((a.ratings[ratingKey] as number) ?? 0),
      );
      result[pos] = sorted.map((p) => ({
        value: String(p.id),
        label: `${p.firstname} ${p.lastname} (${(p.ratings[ratingKey] as number) ?? "—"})`,
      }));
    }
    return result;
  }, [players]);

  // Player map for rating lookups
  const playerMap = useMemo(() => {
    const map: Record<number, Player> = {};
    for (const p of players) map[p.id] = p;
    return map;
  }, [players]);

  // --- Mutation helpers ---

  const updateAssignment = (index: number, updates: Partial<DefenseAssignment>) => {
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a)),
    );
  };

  const addAssignment = (positionCode: PositionCode) => {
    setAssignments((prev) => [
      ...prev,
      {
        position_code: positionCode,
        vs_hand: "both" as VsHand,
        player_id: 0,
        target_weight: 1.0,
        priority: (prev.filter((a) => a.position_code === positionCode).length) + 1,
        locked: false,
        lineup_role: "balanced" as LineupRole,
        min_order: null,
        max_order: null,
      },
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => {
      const removed = prev[index];
      const updated = prev.filter((_, i) => i !== index);
      let pri = 1;
      return updated.map((a) => {
        if (a.position_code === removed.position_code) {
          return { ...a, priority: pri++ };
        }
        return a;
      });
    });
  };

  const moveAssignment = (index: number, direction: -1 | 1) => {
    const entry = assignments[index];
    const posEntries = assignments
      .map((a, i) => ({ a, i }))
      .filter((x) => x.a.position_code === entry.position_code);
    const posIdx = posEntries.findIndex((x) => x.i === index);
    const targetPosIdx = posIdx + direction;
    if (targetPosIdx < 0 || targetPosIdx >= posEntries.length) return;
    const targetGlobalIdx = posEntries[targetPosIdx].i;

    setAssignments((prev) => {
      const updated = [...prev];
      [updated[index], updated[targetGlobalIdx]] = [updated[targetGlobalIdx], updated[index]];
      let pri = 1;
      return updated.map((a) => {
        if (a.position_code === entry.position_code) {
          return { ...a, priority: pri++ };
        }
        return a;
      });
    });
  };

  // --- Save ---

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const saved = await BaseballService.SaveDefensePlan(teamId, { assignments });
      const savedAssignments = (saved.assignments ?? assignments).map(normalizeAssignment);
      setAssignments(savedAssignments);
      baselineRef.current = JSON.stringify(savedAssignments);
      setMessage("Saved successfully");
    } catch (err: any) {
      const detail = err?.message && err.message !== "Failed to fetch"
        ? err.message
        : "Unknown error";
      setMessage(`Failed to save: ${detail}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (isLoading) {
    return <Text variant="body-small" classes="text-gray-400">Loading defense & lineup...</Text>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text variant="h5" classes="font-semibold">Defense & Lineup</Text>
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Build your depth chart: assign players to positions, set batting roles & platoon splits.
            The engine uses your chart to fill the starting lineup each game.
          </Text>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {message && (
            <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
              {message}
            </Text>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Depth Chart — Diamond Layout */}
      <div>
        {/* Outfield row: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto mb-3 items-start">
          {DIAMOND_LAYOUT.outfield.map((pos) => (
            <PositionCard
              key={pos}
              positionCode={pos}
              entries={grouped[pos] ?? []}
              allAssignments={assignments}
              playerOptions={playerOptionsByPos[pos] ?? []}
              playerMap={playerMap}
              onAdd={() => addAssignment(pos)}
              onUpdate={(globalIdx, updates) => updateAssignment(globalIdx, updates)}
              onRemove={(globalIdx) => removeAssignment(globalIdx)}
              onMove={(globalIdx, dir) => moveAssignment(globalIdx, dir)}
            />
          ))}
        </div>

        {/* Infield row: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-3 items-start">
          {DIAMOND_LAYOUT.infield.map((pos) => (
            <PositionCard
              key={pos}
              positionCode={pos}
              entries={grouped[pos] ?? []}
              allAssignments={assignments}
              playerOptions={playerOptionsByPos[pos] ?? []}
              playerMap={playerMap}
              onAdd={() => addAssignment(pos)}
              onUpdate={(globalIdx, updates) => updateAssignment(globalIdx, updates)}
              onRemove={(globalIdx) => removeAssignment(globalIdx)}
              onMove={(globalIdx, dir) => moveAssignment(globalIdx, dir)}
            />
          ))}
        </div>

        {/* Battery row: catcher centered */}
        <div className="flex justify-center mb-3">
          <div className="w-full md:w-[calc(33.333%-0.5rem)] max-w-sm">
            <PositionCard
              positionCode="c"
              entries={grouped["c"] ?? []}
              allAssignments={assignments}
              playerOptions={playerOptionsByPos["c"] ?? []}
              playerMap={playerMap}
              onAdd={() => addAssignment("c")}
              onUpdate={(globalIdx, updates) => updateAssignment(globalIdx, updates)}
              onRemove={(globalIdx) => removeAssignment(globalIdx)}
              onMove={(globalIdx, dir) => moveAssignment(globalIdx, dir)}
            />
          </div>
        </div>

        {/* DH — separated by a divider */}
        <div className="border-t border-gray-300 dark:border-gray-600 my-4" />
        <div className="flex justify-center">
          <div className="w-full md:w-[calc(33.333%-0.5rem)] max-w-sm">
            <PositionCard
              positionCode="dh"
              entries={grouped["dh"] ?? []}
              allAssignments={assignments}
              playerOptions={playerOptionsByPos["dh"] ?? []}
              playerMap={playerMap}
              onAdd={() => addAssignment("dh")}
              onUpdate={(globalIdx, updates) => updateAssignment(globalIdx, updates)}
              onRemove={(globalIdx) => removeAssignment(globalIdx)}
              onMove={(globalIdx, dir) => moveAssignment(globalIdx, dir)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Position Card Component ---

interface PositionCardProps {
  positionCode: PositionCode;
  entries: DefenseAssignment[];
  allAssignments: DefenseAssignment[];
  playerOptions: SelectOption[];
  playerMap: Record<number, Player>;
  onAdd: () => void;
  onUpdate: (globalIndex: number, updates: Partial<DefenseAssignment>) => void;
  onRemove: (globalIndex: number) => void;
  onMove: (globalIndex: number, direction: -1 | 1) => void;
}

const PositionCard = ({
  positionCode,
  entries,
  allAssignments,
  playerOptions,
  playerMap,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: PositionCardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700">
        <Text variant="small" classes="font-semibold">
          {PositionShortMap[positionCode] ?? positionCode.toUpperCase()} — {PositionDisplayMap[positionCode] ?? positionCode}
        </Text>
        <button
          onClick={onAdd}
          className="text-sm sm:text-xs px-2 py-1.5 sm:px-0 sm:py-0 rounded sm:rounded-none bg-blue-600/10 sm:bg-transparent text-blue-500 hover:text-blue-400 cursor-pointer font-medium"
          aria-label={`Add ${PositionShortMap[positionCode] ?? positionCode.toUpperCase()} assignment`}
        >
          + Add
        </button>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800">
          <Text variant="small" classes="text-gray-500 dark:text-gray-400 text-xs">
            No entries — engine will fallback to best available player by rating.
          </Text>
        </div>
      ) : (
        <div className="divide-y dark:divide-gray-600 bg-gray-50 dark:bg-gray-800">
          {entries.map((entry, posIdx) => {
            const globalIdx = allAssignments.indexOf(entry);
            const assignedPlayer = entry.player_id ? playerMap[entry.player_id] : null;
            return (
              <div key={globalIdx} className="px-3 py-2 space-y-2">
                {/* Player dropdown */}
                <div className="w-full">
                  <SelectDropdown
                    options={playerOptions}
                    value={playerOptions.find((o) => o.value === String(entry.player_id)) ?? null}
                    onChange={(opt) => {
                      if (opt) onUpdate(globalIdx, { player_id: Number((opt as SelectOption).value) });
                    }}
                    isSearchable
                    placeholder="Select player..."
                  />
                </div>

                {/* Rating chips when a player is assigned */}
                {assignedPlayer && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {assignedPlayer.bat_hand && (
                        <span className="text-xs px-1 py-0.5 rounded bg-gray-700/50 text-gray-300">
                          Bats: {assignedPlayer.bat_hand}
                        </span>
                      )}
                      {(() => {
                        const rKey = PositionRatingKey[positionCode] as keyof PlayerRatings;
                        const val = rKey ? (assignedPlayer.ratings[rKey] as number) ?? null : null;
                        return val != null ? (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ratingColor(val)} bg-gray-700/50`}>
                            {PositionShortMap[positionCode]}: {val}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <PlayerAttributeRow player={assignedPlayer} attributes={BATTING_DISPLAY_ATTRS} />
                    <PlayerAttributeRow player={assignedPlayer} attributes={ALL_DEFENSE_ATTRS} />
                  </div>
                )}

                {/* vs Hand pills + Lock toggle */}
                <div className="flex items-center justify-between gap-3 sm:gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs mr-1">vs:</Text>
                    <ButtonGroup>
                      {(["both", "L", "R"] as VsHand[]).map((hand) => (
                        <PillButton
                          key={hand}
                          variant="primaryOutline"
                          isSelected={entry.vs_hand === hand}
                          onClick={() => onUpdate(globalIdx, { vs_hand: hand })}
                        >
                          <Text variant="small">{hand === "both" ? "All" : hand}</Text>
                        </PillButton>
                      ))}
                    </ButtonGroup>
                  </div>

                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs">Lock:</Text>
                    <ToggleSwitch
                      checked={entry.locked}
                      onChange={(checked) => onUpdate(globalIdx, { locked: checked })}
                    />
                  </div>
                </div>

                {/* Batting role + preferred order */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 min-w-0">
                    <Text variant="small" classes="text-gray-500 text-xs shrink-0">Batting:</Text>
                    <div className="w-28">
                      <SelectDropdown
                        options={LineupRoleOptions}
                        value={LineupRoleOptions.find((o) => o.value === entry.lineup_role) ?? LineupRoleOptions.find((o) => o.value === "balanced")}
                        onChange={(opt) => {
                          if (opt) onUpdate(globalIdx, { lineup_role: (opt as SelectOption).value as LineupRole });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs shrink-0">Order:</Text>
                    <input
                      type="number"
                      min={1}
                      max={9}
                      value={entry.min_order ?? ""}
                      onChange={(e) => {
                        const v = e.target.value ? parseInt(e.target.value) : null;
                        onUpdate(globalIdx, { min_order: v && v >= 1 && v <= 9 ? v : null });
                      }}
                      placeholder="—"
                      className="w-14 sm:w-10 px-1 py-2 sm:py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                    />
                    <span className="text-gray-500 text-xs">-</span>
                    <input
                      type="number"
                      min={1}
                      max={9}
                      value={entry.max_order ?? ""}
                      onChange={(e) => {
                        const v = e.target.value ? parseInt(e.target.value) : null;
                        onUpdate(globalIdx, { max_order: v && v >= 1 && v <= 9 ? v : null });
                      }}
                      placeholder="—"
                      className="w-14 sm:w-10 px-1 py-2 sm:py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                    />
                  </div>
                </div>

                {/* Weight input + move/remove controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs">Weight:</Text>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={entry.target_weight}
                      onChange={(e) =>
                        onUpdate(globalIdx, { target_weight: parseFloat(e.target.value) || 1.0 })
                      }
                      className="w-16 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500"
                    />
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onMove(globalIdx, -1)}
                      disabled={posIdx === 0}
                      className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xs"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMove(globalIdx, 1)}
                      disabled={posIdx === entries.length - 1}
                      className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xs"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onRemove(globalIdx)}
                      className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-red-700 text-white border border-red-500 hover:bg-red-600 text-sm sm:text-xs"
                      title="Remove"
                      aria-label="Remove assignment"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

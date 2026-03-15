import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GroupBase } from "react-select";
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
import { PlayerAttributeRow, ratingColor, StaminaBar } from "../ratingUtils";
import {
  PlayerSelectOption,
  buildGroupedPlayerOptions,
  flattenGroups,
  ColoredOptionSimple,
  StyledGroupHeading,
  PlayerFilter,
  Tooltip,
} from "../playerDropdownUtils";

interface DefenseAndLineupTabProps {
  teamId: number;
  players: Player[];
}

const ALL_POSITIONS: PositionCode[] = [...DEFENSE_POSITION_ORDER, "dh"];

/** Order dropdown options: null + 1-9 */
const ORDER_OPTIONS: SelectOption[] = [
  { value: "", label: "—" },
  ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

/** Compact styles for small inline dropdowns (Role).
 *  These compose ON TOP of the themed base styles — `base` here is the raw
 *  react-select default, so we must re-apply dark-theme colors explicitly. */
const DK_BG = "#1a202c";
const DK_BG_FOCUS = "#2d3748";
const DK_BORDER = "#4A5568";
const DK_BORDER_FOCUS = "#4A90E2";

const compactSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "26px",
    fontSize: "0.7rem",
    padding: "0",
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG,
    borderColor: state.isFocused ? DK_BORDER_FOCUS : DK_BORDER,
    color: "#fff",
    boxShadow: state.isFocused ? `0 0 0 1px ${DK_BORDER_FOCUS}` : "none",
    borderRadius: "8px",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 4px" }),
  singleValue: (base: any) => ({ ...base, fontSize: "0.7rem", color: "#fff" }),
  input: (base: any) => ({ ...base, margin: "0", padding: "0", color: "#fff" }),
  indicatorsContainer: (base: any) => ({ ...base, "& > div": { padding: "2px" } }),
  option: (base: any, state: any) => ({
    ...base, fontSize: "0.7rem", padding: "4px 8px",
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG, color: "#fff", cursor: "pointer",
  }),
  menu: (base: any) => ({ ...base, minWidth: "100px", backgroundColor: DK_BG, borderRadius: "8px" }),
  menuList: (base: any) => ({ ...base, backgroundColor: DK_BG, padding: "0" }),
};

/** Even more compact for order dropdowns (just a single digit) */
const tinySelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "26px",
    fontSize: "0.7rem",
    padding: "0",
    width: "44px",
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG,
    borderColor: state.isFocused ? DK_BORDER_FOCUS : DK_BORDER,
    color: "#fff",
    boxShadow: state.isFocused ? `0 0 0 1px ${DK_BORDER_FOCUS}` : "none",
    borderRadius: "8px",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 2px", justifyContent: "center" }),
  singleValue: (base: any) => ({ ...base, fontSize: "0.7rem", textAlign: "center" as const, color: "#fff" }),
  input: (base: any) => ({ ...base, margin: "0", padding: "0", color: "#fff" }),
  indicatorsContainer: (base: any) => ({ ...base, "& > div": { padding: "1px" } }),
  dropdownIndicator: (base: any) => ({ ...base, padding: "2px" }),
  option: (base: any, state: any) => ({
    ...base, fontSize: "0.7rem", padding: "3px 6px", textAlign: "center" as const,
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG, color: "#fff", cursor: "pointer",
  }),
  menu: (base: any) => ({ ...base, minWidth: "44px", width: "44px", backgroundColor: DK_BG, borderRadius: "8px" }),
  menuList: (base: any) => ({ ...base, backgroundColor: DK_BG, padding: "0" }),
};

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

  // Filter state
  const [hiddenPlayerIds, setHiddenPlayerIds] = useState<Set<number>>(new Set());
  const [hideAssigned, setHideAssigned] = useState(false);

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

  // Set of all player IDs currently assigned on this tab
  const assignedPlayerIds = useMemo(() => {
    return new Set(assignments.filter((a) => a.player_id).map((a) => a.player_id));
  }, [assignments]);

  // Build grouped player options per position
  const groupedOptionsByPos = useMemo(() => {
    const result: Record<string, GroupBase<PlayerSelectOption>[]> = {};
    for (const pos of ALL_POSITIONS) {
      const ratingKey = PositionRatingKey[pos] as keyof PlayerRatings;
      result[pos] = buildGroupedPlayerOptions(
        players,
        ratingKey,
        hiddenPlayerIds,
        hideAssigned,
        assignedPlayerIds,
      );
    }
    return result;
  }, [players, hiddenPlayerIds, hideAssigned, assignedPlayerIds]);

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

  // --- Clear & Reset ---

  const handleClear = () => {
    setAssignments([]);
  };

  const handleReset = () => {
    const baseline = baselineRef.current;
    if (baseline) {
      setAssignments(JSON.parse(baseline));
    }
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <Text variant="h5" classes="font-semibold">Defense & Lineup</Text>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {message && (
            <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
              {message}
            </Text>
          )}
          <Button variant="secondaryOutline" size="sm" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear} disabled={assignments.length === 0}>
            Clear All
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Explainer */}
      <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <Text variant="small" classes="text-gray-400 leading-relaxed">
          Build your depth chart by assigning players to defensive positions. For each assignment you can set a
          <strong className="text-gray-300"> platoon split </strong> (vs LHP/RHP),
          <strong className="text-gray-300"> batting role </strong> (how the player is used in the lineup order),
          <strong className="text-gray-300"> order range </strong> (which lineup slots they can fill),
          and a <strong className="text-gray-300"> weight </strong> (how strongly the engine prefers this player). Explicit <strong className="text-gray-300">order range</strong>  overrides the <strong className="text-gray-300">batting roles</strong>. 
          Use <strong className="text-gray-300">Force Start</strong> to guarantee a player starts regardless of other settings.
          The engine uses this chart to generate a starting lineup each game. Positions without entries or with conflicting entries fall back to the best available player by rating. <strong className="text-gray-300">Priority</strong>  dictates which player is chosen first for subweek A of a week and then the engine decides how to distribute the rest of the starts. For best results, put your most frequent player at a position as the top priority. Below is the <strong className="text-gray-300"> Dropdown Filters</strong> section and it will allow you to reduce the pool of players to select for positions to ease selection. 
        </Text>
      </div>

      {/* Player Filter */}
      <PlayerFilter
        players={players}
        context="defense"
        hiddenPlayerIds={hiddenPlayerIds}
        onHiddenChange={setHiddenPlayerIds}
        hideAssigned={hideAssigned}
        onHideAssignedChange={setHideAssigned}
      />

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
              groupedOptions={groupedOptionsByPos[pos] ?? []}
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
              groupedOptions={groupedOptionsByPos[pos] ?? []}
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
              groupedOptions={groupedOptionsByPos["c"] ?? []}
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
              groupedOptions={groupedOptionsByPos["dh"] ?? []}
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
  groupedOptions: GroupBase<PlayerSelectOption>[];
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
  groupedOptions,
  playerMap,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: PositionCardProps) => {
  // Flatten groups so we can find the currently selected value
  const flatOptions = useMemo(() => flattenGroups(groupedOptions), [groupedOptions]);

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
            const currentValue = entry.player_id
              ? flatOptions.find((o) => o.value === String(entry.player_id))
                ?? (assignedPlayer ? {
                    value: String(assignedPlayer.id),
                    label: `${assignedPlayer.firstname} ${assignedPlayer.lastname}`,
                    ptype: assignedPlayer.ptype,
                    rating: null,
                    listedPos: null,
                    stamina: assignedPlayer.stamina ?? null,
                    hasFatigueData: assignedPlayer.has_fatigue_data ?? false,
                  } as PlayerSelectOption : null)
              : null;
            return (
              <div key={globalIdx} className="px-3 py-2 space-y-2">
                {/* Player dropdown */}
                <div className="w-full">
                  <SelectDropdown<false>
                    options={groupedOptions as any}
                    value={currentValue}
                    onChange={(opt) => {
                      if (opt) onUpdate(globalIdx, { player_id: Number((opt as SelectOption).value) });
                    }}
                    isSearchable
                    placeholder="Select player..."
                    components={{
                      Option: ColoredOptionSimple as any,
                      GroupHeading: StyledGroupHeading as any,
                    }}
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
                      <StaminaBar player={assignedPlayer} />
                    </div>
                    <PlayerAttributeRow player={assignedPlayer} attributes={BATTING_DISPLAY_ATTRS} />
                    <PlayerAttributeRow player={assignedPlayer} attributes={ALL_DEFENSE_ATTRS} />
                  </div>
                )}

                {/* vs Hand pills + Force Start toggle */}
                <div className="flex items-center justify-between gap-3 sm:gap-2 flex-wrap">
                  <Tooltip text="Filter when this player is eligible: vs all pitchers, only vs left-handed pitchers, or only vs right-handed pitchers.">
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
                  </Tooltip>

                  <Tooltip text="Force this player into the starting lineup every game, overriding order range and weight settings.">
                    <div className="flex items-center gap-1">
                      <Text variant="small" classes="text-gray-500 text-xs">Force Start:</Text>
                      <ToggleSwitch
                        checked={entry.locked}
                        onChange={(checked) => onUpdate(globalIdx, { locked: checked })}
                      />
                    </div>
                  </Tooltip>
                </div>
                {entry.locked && (
                  <Text variant="small" classes="text-yellow-500/80 text-xs italic">
                    Overrides order range and weight — this player will always start when eligible.
                  </Text>
                )}

                {/* Batting role — full width */}
                <Tooltip text="Determines where in the batting order this player fits. Table Setter and On-Base go early; Sluggers bat 3rd/4th; Bottom bats last.">
                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs shrink-0">Role:</Text>
                    <div className="flex-1 mr-1">
                      <SelectDropdown
                        options={LineupRoleOptions}
                        value={LineupRoleOptions.find((o) => o.value === entry.lineup_role) ?? LineupRoleOptions.find((o) => o.value === "balanced")}
                        onChange={(opt) => {
                          if (opt) onUpdate(globalIdx, { lineup_role: (opt as SelectOption).value as LineupRole });
                        }}
                        styles={compactSelectStyles}
                      />
                    </div>
                  </div>
                </Tooltip>

                {/* Preferred order */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tooltip text="Restrict which batting order slots (1-9) this player can be placed in. Leave blank for no restriction.">
                    <div className="flex items-center gap-1">
                      <Text variant="small" classes="text-gray-500 text-xs shrink-0">Order:</Text>
                      <div>
                        <SelectDropdown
                          options={ORDER_OPTIONS}
                          value={ORDER_OPTIONS.find((o) => o.value === String(entry.min_order ?? "")) ?? ORDER_OPTIONS[0]}
                          onChange={(opt) => {
                            const v = (opt as SelectOption)?.value;
                            onUpdate(globalIdx, { min_order: v ? parseInt(v) : null });
                          }}
                          styles={tinySelectStyles}
                        />
                      </div>
                      <span className="text-gray-500 text-xs">to</span>
                      <div>
                        <SelectDropdown
                          options={ORDER_OPTIONS}
                          value={ORDER_OPTIONS.find((o) => o.value === String(entry.max_order ?? "")) ?? ORDER_OPTIONS[0]}
                          onChange={(opt) => {
                            const v = (opt as SelectOption)?.value;
                            onUpdate(globalIdx, { max_order: v ? parseInt(v) : null });
                          }}
                          styles={tinySelectStyles}
                        />
                      </div>
                    </div>
                  </Tooltip>
                </div>

                {/* Weight with +/- buttons */}
                <Tooltip text="How strongly the engine prefers this player at this position. Higher weight = more likely to start. Range: 0 to 10.">
                  <div className="flex items-center gap-1">
                    <Text variant="small" classes="text-gray-500 text-xs">Weight:</Text>
                    <button
                      onClick={() => {
                        const next = Math.max(0, Math.round((entry.target_weight - 0.5) * 10) / 10);
                        onUpdate(globalIdx, { target_weight: next });
                      }}
                      disabled={entry.target_weight <= 0}
                      className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      aria-label="Decrease weight"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={entry.target_weight}
                      onChange={(e) =>
                        onUpdate(globalIdx, { target_weight: parseFloat(e.target.value) || 1.0 })
                      }
                      className="w-14 px-1 py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                    />
                    <button
                      onClick={() => {
                        const next = Math.min(10, Math.round((entry.target_weight + 0.5) * 10) / 10);
                        onUpdate(globalIdx, { target_weight: next });
                      }}
                      disabled={entry.target_weight >= 10}
                      className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      aria-label="Increase weight"
                    >
                      +
                    </button>
                  </div>
                </Tooltip>

                {/* Priority reorder + remove — own row */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
                  <Tooltip text="Change this player's priority within the position. Higher priority players are considered first by the engine.">
                    <div className="flex items-center gap-1">
                      <Text variant="small" classes="text-gray-500 text-xs mr-1">Priority:</Text>
                      <button
                        onClick={() => onMove(globalIdx, -1)}
                        disabled={posIdx === 0}
                        className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xs"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => onMove(globalIdx, 1)}
                        disabled={posIdx === entries.length - 1}
                        className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xs"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </Tooltip>
                  <button
                    onClick={() => onRemove(globalIdx)}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-red-700 text-white border border-red-500 hover:bg-red-600 text-sm sm:text-xs"
                    title="Remove this assignment"
                    aria-label="Remove assignment"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

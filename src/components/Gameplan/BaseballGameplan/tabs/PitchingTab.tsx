import { useState, useEffect, useRef, useMemo } from "react";
import { GroupBase } from "react-select";
import { Text } from "../../../../_design/Typography";
import { Button } from "../../../../_design/Buttons";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { Player, PlayerRatings } from "../../../../models/baseball/baseballModels";
import {
  RotationConfig,
  RotationSlot,
  BullpenConfig,
  BullpenEntry,
  BullpenRole,
  TeamStrategy,
  OutfieldSpacing,
  InfieldSpacing,
  BullpenPriorityType,
} from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import {
  BullpenRoleOptions,
  BullpenRoleDescriptions,
  OutfieldSpacingOptions,
  InfieldSpacingOptions,
  BullpenPriorityOptions,
  SP_DISPLAY_ATTRS,
  RP_DISPLAY_ATTRS,
} from "../BaseballGameplanConstants";
import { PlayerAttributeRow, PitchOverallChips, StaminaBar } from "../ratingUtils";
import {
  PlayerSelectOption,
  buildGroupedPlayerOptions,
  flattenGroups,
  ColoredOptionSimple,
  StyledGroupHeading,
  PlayerFilter,
  Tooltip,
} from "../playerDropdownUtils";

// Dark-theme compact styles for pitching dropdowns
const DK_BG = "#1a202c";
const DK_BG_FOCUS = "#2d3748";
const DK_BORDER = "#4A5568";
const DK_BORDER_FOCUS = "#4A90E2";

const pitcherSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "30px",
    fontSize: "0.75rem",
    padding: "0",
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG,
    borderColor: state.isFocused ? DK_BORDER_FOCUS : DK_BORDER,
    color: "#fff",
    boxShadow: state.isFocused ? `0 0 0 1px ${DK_BORDER_FOCUS}` : "none",
    borderRadius: "8px",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 6px" }),
  singleValue: (base: any) => ({ ...base, fontSize: "0.75rem", color: "#fff" }),
  input: (base: any) => ({ ...base, margin: "0", padding: "0", color: "#fff" }),
  placeholder: (base: any) => ({ ...base, fontSize: "0.75rem", color: "#A0AEC0" }),
  indicatorsContainer: (base: any) => ({ ...base, "& > div": { padding: "2px" } }),
  option: (base: any, state: any) => ({
    ...base, fontSize: "0.75rem", padding: "5px 8px",
    backgroundColor: state.isFocused ? DK_BG_FOCUS : DK_BG, color: "#fff", cursor: "pointer",
  }),
  menu: (base: any) => ({ ...base, minWidth: "180px", backgroundColor: DK_BG, borderRadius: "8px" }),
  menuList: (base: any) => ({ ...base, backgroundColor: DK_BG, padding: "0" }),
};

const roleSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "30px",
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
  menu: (base: any) => ({ ...base, minWidth: "90px", backgroundColor: DK_BG, borderRadius: "8px" }),
  menuList: (base: any) => ({ ...base, backgroundColor: DK_BG, padding: "0" }),
};

interface PitchingTabProps {
  teamId: number;
  players: Player[];
}

export const PitchingTab = ({ teamId, players }: PitchingTabProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    rotation: false,
    bullpen: false,
    strategy: false,
  });

  // Shared filter state across rotation + bullpen sections
  const [hiddenPlayerIds, setHiddenPlayerIds] = useState<Set<number>>(new Set());
  const [hideAssigned, setHideAssigned] = useState(false);

  // Collect assigned player IDs from both rotation and bullpen for hide-assigned
  const [rotationPlayerIds, setRotationPlayerIds] = useState<Set<number>>(new Set());
  const [bullpenPlayerIds, setBullpenPlayerIds] = useState<Set<number>>(new Set());
  const assignedPlayerIds = useMemo(() => {
    const combined = new Set<number>();
    for (const id of rotationPlayerIds) if (id) combined.add(id);
    for (const id of bullpenPlayerIds) if (id) combined.add(id);
    return combined;
  }, [rotationPlayerIds, bullpenPlayerIds]);

  const toggle = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <Text variant="h5" classes="font-semibold mb-2">Pitching</Text>

      {/* Explainer */}
      <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <Text variant="small" classes="text-gray-400 leading-relaxed">
          Configure your <strong className="text-gray-300">starting rotation</strong> order and size,
          set up your <strong className="text-gray-300">bullpen</strong> with roles for each reliever,
          and adjust <strong className="text-gray-300">team strategy</strong> settings like defensive positioning,
          pitch count limits, and reliever selection priority. The engine uses these settings to manage
          pitching decisions during simulated games.
        </Text>
      </div>

      {/* Player Filter — shared across rotation & bullpen */}
      <PlayerFilter
        players={players}
        context="pitching"
        hiddenPlayerIds={hiddenPlayerIds}
        onHiddenChange={setHiddenPlayerIds}
        hideAssigned={hideAssigned}
        onHideAssignedChange={setHideAssigned}
      />

      <div className="space-y-4">
        <AccordionSection title="Starting Rotation" isOpen={openSections.rotation} onToggle={() => toggle("rotation")}>
          <RotationSection
            teamId={teamId}
            players={players}
            hiddenPlayerIds={hiddenPlayerIds}
            hideAssigned={hideAssigned}
            assignedPlayerIds={assignedPlayerIds}
            onAssignedChange={setRotationPlayerIds}
          />
        </AccordionSection>

        <AccordionSection title="Bullpen" isOpen={openSections.bullpen} onToggle={() => toggle("bullpen")}>
          <BullpenSection
            teamId={teamId}
            players={players}
            hiddenPlayerIds={hiddenPlayerIds}
            hideAssigned={hideAssigned}
            assignedPlayerIds={assignedPlayerIds}
            onAssignedChange={setBullpenPlayerIds}
          />
        </AccordionSection>

        <AccordionSection title="Team Strategy" isOpen={openSections.strategy} onToggle={() => toggle("strategy")}>
          <TeamStrategySection teamId={teamId} />
        </AccordionSection>
      </div>
    </div>
  );
};

// ── Accordion wrapper ────────────────────────────────────────────────

const AccordionSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors cursor-pointer"
    >
      <Text variant="body-small" classes="font-semibold">{title}</Text>
      <span className="text-gray-500 text-sm">{isOpen ? "▼" : "▶"}</span>
    </button>
    {isOpen && <div className="p-4">{children}</div>}
  </div>
);

// ── Rotation Section ─────────────────────────────────────────────────

interface FilterableSectionProps {
  teamId: number;
  players: Player[];
  hiddenPlayerIds: Set<number>;
  hideAssigned: boolean;
  assignedPlayerIds: Set<number>;
  onAssignedChange: (ids: Set<number>) => void;
}

const RotationSection = ({
  teamId,
  players,
  hiddenPlayerIds,
  hideAssigned,
  assignedPlayerIds,
  onAssignedChange,
}: FilterableSectionProps) => {
  const [rotation, setRotation] = useState<RotationConfig>({
    rotation_size: 5,
    current_slot: 0,
    last_game_id: null,
    slots: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const baselineRef = useRef<string>("");

  const playerMap = useMemo(() => {
    const map: Record<number, Player> = {};
    for (const p of players) map[p.id] = p;
    return map;
  }, [players]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetRotation(teamId);
        if (!cancelled) {
          setRotation(data);
          baselineRef.current = JSON.stringify(data);
        }
      } catch {
        if (!cancelled) {
          const defaultRot: RotationConfig = { rotation_size: 5, current_slot: 0, last_game_id: null, slots: [] };
          setRotation(defaultRot);
          baselineRef.current = JSON.stringify(defaultRot);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  // Report assigned player IDs up to parent
  useEffect(() => {
    onAssignedChange(new Set(rotation.slots.filter((s) => s.player_id).map((s) => s.player_id)));
  }, [rotation.slots, onAssignedChange]);

  const isDirty = useMemo(() => {
    return JSON.stringify(rotation) !== baselineRef.current;
  }, [rotation]);

  // Build grouped options sorted by SP rating
  const groupedOptions = useMemo(() => {
    return buildGroupedPlayerOptions(
      players,
      "sp_rating" as keyof PlayerRatings,
      hiddenPlayerIds,
      hideAssigned,
      assignedPlayerIds,
    );
  }, [players, hiddenPlayerIds, hideAssigned, assignedPlayerIds]);

  const flatOptions = useMemo(() => flattenGroups(groupedOptions), [groupedOptions]);

  const rotSizeOptions: SelectOption[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}-man rotation`,
    }));
  }, []);

  const handleSizeChange = (newSize: number) => {
    const currentSlots = rotation.slots;
    let updated: RotationSlot[];
    if (newSize > currentSlots.length) {
      updated = [
        ...currentSlots,
        ...Array.from({ length: newSize - currentSlots.length }, (_, i) => ({
          slot: currentSlots.length + i + 1,
          player_id: 0,
        })),
      ];
    } else {
      updated = currentSlots.slice(0, newSize);
    }
    setRotation((prev) => ({ ...prev, rotation_size: newSize, slots: updated }));
  };

  const updateSlotPlayer = (index: number, playerId: number) => {
    setRotation((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) =>
        i === index ? { ...s, player_id: playerId } : s,
      ),
    }));
  };

  const moveSlot = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rotation.slots.length) return;
    setRotation((prev) => {
      const newSlots = [...prev.slots];
      [newSlots[index], newSlots[target]] = [newSlots[target], newSlots[index]];
      return {
        ...prev,
        slots: newSlots.map((s, i) => ({ ...s, slot: i + 1 })),
      };
    });
  };

  const handleClear = () => {
    setRotation((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => ({ ...s, player_id: 0 })),
    }));
  };

  const handleReset = () => {
    if (baselineRef.current) {
      setRotation(JSON.parse(baselineRef.current));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await BaseballService.SaveRotation(teamId, rotation);
      // Keep local state as source of truth — don't overwrite with response
      baselineRef.current = JSON.stringify(rotation);
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
    return <Text variant="body-small" classes="text-gray-400">Loading rotation...</Text>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip text="How many starting pitchers rotate through the lineup. The engine cycles through slots in order.">
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="small" classes="font-semibold">Rotation Size:</Text>
              <div className="w-full sm:w-[140px]">
                <SelectDropdown
                  options={rotSizeOptions}
                  value={rotSizeOptions.find((o) => o.value === String(rotation.rotation_size ?? 5)) ?? null}
                  onChange={(opt) => {
                    if (opt) handleSizeChange(Number((opt as SelectOption).value));
                  }}
                  styles={roleSelectStyles}
                />
              </div>
            </div>
          </Tooltip>
          {rotation.current_slot != null && (
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              Next up: Slot {rotation.current_slot + 1}
            </Text>
          )}
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
              {message}
            </Text>
          )}
          <Button variant="secondaryOutline" size="sm" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Rotation"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {rotation.slots.map((slot, idx) => {
          const isNext = idx === rotation.current_slot;
          const assignedPlayer = slot.player_id ? playerMap[slot.player_id] : null;
          const currentValue = slot.player_id
            ? flatOptions.find((o) => o.value === String(slot.player_id))
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
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                isNext
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Tooltip text={`Rotation slot ${slot.slot}. The engine cycles through these in order each game.`}>
                  <span className="font-bold text-lg w-8 text-center">{slot.slot}</span>
                </Tooltip>
                {isNext && (
                  <span className="text-xs font-bold text-blue-500 uppercase">Next</span>
                )}
                <div className="w-full sm:w-[200px]">
                  <SelectDropdown<false>
                    options={groupedOptions as any}
                    value={currentValue}
                    onChange={(opt) => {
                      if (opt) updateSlotPlayer(idx, Number((opt as SelectOption).value));
                    }}
                    isSearchable
                    placeholder="Select pitcher..."
                    styles={pitcherSelectStyles}
                    components={{
                      Option: ColoredOptionSimple as any,
                      GroupHeading: StyledGroupHeading as any,
                    }}
                  />
                </div>
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => moveSlot(idx, -1)}
                    disabled={idx === 0}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move this pitcher earlier in the rotation"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlot(idx, 1)}
                    disabled={idx === rotation.slots.length - 1}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move this pitcher later in the rotation"
                  >
                    ↓
                  </button>
                </div>
              </div>
              {/* Rating chips + pitch overalls when a pitcher is assigned */}
              {assignedPlayer && (
                <div className="mt-2 ml-11 flex flex-wrap items-center gap-3">
                  <PlayerAttributeRow player={assignedPlayer} attributes={SP_DISPLAY_ATTRS} />
                  <PitchOverallChips player={assignedPlayer} />
                  <StaminaBar player={assignedPlayer} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rotation.slots.length === 0 && (
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400 mt-2">
          No rotation configured. The engine will auto-pick the best available SP.
        </Text>
      )}
    </div>
  );
};

// ── Bullpen Section ──────────────────────────────────────────────────

const BullpenSection = ({
  teamId,
  players,
  hiddenPlayerIds,
  hideAssigned,
  assignedPlayerIds,
  onAssignedChange,
}: FilterableSectionProps) => {
  const [bullpen, setBullpen] = useState<BullpenConfig>({ pitchers: [], emergency_pitcher_id: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const baselineRef = useRef<string>("");

  const playerMap = useMemo(() => {
    const map: Record<number, Player> = {};
    for (const p of players) map[p.id] = p;
    return map;
  }, [players]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetBullpen(teamId);
        if (!cancelled) {
          setBullpen(data);
          baselineRef.current = JSON.stringify(data);
        }
      } catch {
        if (!cancelled) {
          const defaultBp: BullpenConfig = { pitchers: [], emergency_pitcher_id: null };
          setBullpen(defaultBp);
          baselineRef.current = JSON.stringify(defaultBp);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  // Report assigned player IDs up to parent
  useEffect(() => {
    const ids = new Set(bullpen.pitchers.filter((e) => e.player_id).map((e) => e.player_id));
    if (bullpen.emergency_pitcher_id) ids.add(bullpen.emergency_pitcher_id);
    onAssignedChange(ids);
  }, [bullpen.pitchers, bullpen.emergency_pitcher_id, onAssignedChange]);

  const isDirty = useMemo(() => {
    return JSON.stringify(bullpen) !== baselineRef.current;
  }, [bullpen]);

  // Build grouped options sorted by RP rating
  const groupedOptions = useMemo(() => {
    return buildGroupedPlayerOptions(
      players,
      "rp_rating" as keyof PlayerRatings,
      hiddenPlayerIds,
      hideAssigned,
      assignedPlayerIds,
    );
  }, [players, hiddenPlayerIds, hideAssigned, assignedPlayerIds]);

  const flatOptions = useMemo(() => flattenGroups(groupedOptions), [groupedOptions]);

  // Emergency pitcher uses all players (unfiltered, just with labels)
  const allPlayerGroupedOptions = useMemo(() => {
    return buildGroupedPlayerOptions(
      players,
      "rp_rating" as keyof PlayerRatings,
      new Set(), // no hiding for emergency
      false,
      new Set(),
    );
  }, [players]);

  const allPlayerFlatOptions = useMemo(() => flattenGroups(allPlayerGroupedOptions), [allPlayerGroupedOptions]);

  const noneOption: PlayerSelectOption = { value: "", label: "None", ptype: "Position" as any, rating: null, listedPos: null, stamina: null, hasFatigueData: false };

  const updateEntry = (index: number, updates: Partial<BullpenEntry>) => {
    setBullpen((prev) => ({
      ...prev,
      pitchers: prev.pitchers.map((e, i) =>
        i === index ? { ...e, ...updates } : e,
      ),
    }));
  };

  const addPitcher = () => {
    setBullpen((prev) => ({
      ...prev,
      pitchers: [
        ...prev.pitchers,
        { slot: prev.pitchers.length + 1, player_id: 0, role: "middle" as BullpenRole },
      ],
    }));
  };

  const removePitcher = (index: number) => {
    setBullpen((prev) => ({
      ...prev,
      pitchers: prev.pitchers
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, slot: i + 1 })),
    }));
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= bullpen.pitchers.length) return;
    setBullpen((prev) => {
      const newPitchers = [...prev.pitchers];
      [newPitchers[index], newPitchers[target]] = [newPitchers[target], newPitchers[index]];
      return {
        ...prev,
        pitchers: newPitchers.map((e, i) => ({ ...e, slot: i + 1 })),
      };
    });
  };

  const handleClear = () => {
    setBullpen({ pitchers: [], emergency_pitcher_id: null });
  };

  const handleReset = () => {
    if (baselineRef.current) {
      setBullpen(JSON.parse(baselineRef.current));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await BaseballService.SaveBullpen(teamId, bullpen);
      baselineRef.current = JSON.stringify(bullpen);
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
    return <Text variant="body-small" classes="text-gray-400">Loading bullpen...</Text>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div />
        <div className="flex items-center gap-2">
          {message && (
            <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
              {message}
            </Text>
          )}
          <Button variant="secondaryOutline" size="sm" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear} disabled={bullpen.pitchers.length === 0 && !bullpen.emergency_pitcher_id}>
            Clear All
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Bullpen"}
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {bullpen.pitchers.map((entry, idx) => {
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
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-lg w-8 text-center">{entry.slot}</span>

                <div className="w-full sm:w-[180px]">
                  <SelectDropdown<false>
                    options={groupedOptions as any}
                    value={currentValue}
                    onChange={(opt) => {
                      if (opt) updateEntry(idx, { player_id: Number((opt as SelectOption).value) });
                    }}
                    isSearchable
                    placeholder="Select pitcher..."
                    styles={pitcherSelectStyles}
                    components={{
                      Option: ColoredOptionSimple as any,
                      GroupHeading: StyledGroupHeading as any,
                    }}
                  />
                </div>

                <Tooltip text="The reliever's bullpen role determines when the engine brings them into the game.">
                  <div className="w-full sm:w-[100px]">
                    <SelectDropdown
                      options={BullpenRoleOptions}
                      value={BullpenRoleOptions.find((o) => o.value === entry.role) ?? null}
                      onChange={(opt) => {
                        if (opt) updateEntry(idx, { role: (opt as SelectOption).value as BullpenRole });
                      }}
                      styles={roleSelectStyles}
                    />
                  </div>
                </Tooltip>

                {BullpenRoleDescriptions[entry.role] && (
                  <span
                    className="text-xs text-gray-500 dark:text-gray-400 hidden xl:inline max-w-[200px] truncate"
                    title={BullpenRoleDescriptions[entry.role]}
                  >
                    {BullpenRoleDescriptions[entry.role]}
                  </span>
                )}

                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => moveEntry(idx, -1)}
                    disabled={idx === 0}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move this reliever up in priority"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveEntry(idx, 1)}
                    disabled={idx === bullpen.pitchers.length - 1}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move this reliever down in priority"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePitcher(idx)}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-red-700 text-white border border-red-500 hover:bg-red-600"
                    title="Remove this pitcher from the bullpen"
                    aria-label="Remove pitcher"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Rating chips + pitch overalls when a pitcher is assigned */}
              {assignedPlayer && (
                <div className="mt-2 ml-11 flex flex-wrap items-center gap-3">
                  <PlayerAttributeRow player={assignedPlayer} attributes={RP_DISPLAY_ATTRS} />
                  <PitchOverallChips player={assignedPlayer} />
                  <StaminaBar player={assignedPlayer} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="secondaryOutline" size="sm" onClick={addPitcher}>
        + Add Pitcher
      </Button>

      {bullpen.pitchers.length === 0 && (
        <Text variant="body-small" classes="text-gray-500 dark:text-gray-400 mt-2">
          No bullpen configured. Relievers will be used as fallback by rating.
        </Text>
      )}

      {/* Emergency Pitcher */}
      <Tooltip text="Last-resort pitcher used only when the entire bullpen is exhausted. Can be any player on the roster.">
        <div className="mt-6 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <Text variant="small" classes="font-semibold mb-1">Emergency Pitcher</Text>
          <Text variant="small" classes="text-gray-500 dark:text-gray-400 mb-2">
            Player who pitches if the entire bullpen is exhausted.
          </Text>
          <div className="w-full sm:w-[200px]">
            <SelectDropdown<false>
              options={[{ label: "", options: [noneOption] }, ...allPlayerGroupedOptions] as any}
              value={
                bullpen.emergency_pitcher_id
                  ? allPlayerFlatOptions.find((o) => o.value === String(bullpen.emergency_pitcher_id)) ?? null
                  : noneOption
              }
              onChange={(opt) => {
                const val = (opt as PlayerSelectOption)?.value;
                setBullpen((prev) => ({
                  ...prev,
                  emergency_pitcher_id: val ? Number(val) || null : null,
                }));
              }}
              isClearable
              isSearchable
              styles={pitcherSelectStyles}
              components={{
                Option: ColoredOptionSimple as any,
                GroupHeading: StyledGroupHeading as any,
              }}
            />
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

// ── Team Strategy Section ────────────────────────────────────────────

const DEFAULT_STRATEGY: TeamStrategy = {
  team_id: 0,
  outfield_spacing: "normal",
  infield_spacing: "normal",
  bullpen_cutoff: 100,
  bullpen_priority: "rest",
  intentional_walk_list: [],
};

const TeamStrategySection = ({ teamId }: { teamId: number }) => {
  const [strategy, setStrategy] = useState<TeamStrategy>({ ...DEFAULT_STRATEGY, team_id: teamId });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const baselineRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetTeamStrategy(teamId);
        if (!cancelled) {
          setStrategy(data);
          baselineRef.current = JSON.stringify(data);
        }
      } catch {
        if (!cancelled) {
          const def = { ...DEFAULT_STRATEGY, team_id: teamId };
          setStrategy(def);
          baselineRef.current = JSON.stringify(def);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  const isDirty = useMemo(() => {
    return JSON.stringify(strategy) !== baselineRef.current;
  }, [strategy]);

  const update = (updates: Partial<TeamStrategy>) => {
    setStrategy((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    if (baselineRef.current) {
      setStrategy(JSON.parse(baselineRef.current));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await BaseballService.SaveTeamStrategy(teamId, strategy);
      baselineRef.current = JSON.stringify(strategy);
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
    return <Text variant="body-small" classes="text-gray-400">Loading team strategy...</Text>;
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          {message && (
            <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
              {message}
            </Text>
          )}
          <Button variant="secondaryOutline" size="sm" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Strategy"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outfield Spacing */}
        <Tooltip text="Default outfield positioning. Deep plays back for power hitters; Shallow plays in for weak contact. Shifts overload one side.">
          <div className="space-y-1">
            <Text variant="small" classes="font-semibold">Outfield Spacing</Text>
            <SelectDropdown
              options={OutfieldSpacingOptions}
              value={OutfieldSpacingOptions.find((o) => o.value === strategy.outfield_spacing) ?? null}
              onChange={(opt) => {
                if (opt) update({ outfield_spacing: (opt as SelectOption).value as OutfieldSpacing });
              }}
            />
          </div>
        </Tooltip>

        {/* Infield Spacing */}
        <Tooltip text="Default infield positioning. 'In' brings infielders closer for plays at the plate. 'Double Play' optimizes for turning two.">
          <div className="space-y-1">
            <Text variant="small" classes="font-semibold">Infield Spacing</Text>
            <SelectDropdown
              options={InfieldSpacingOptions}
              value={InfieldSpacingOptions.find((o) => o.value === strategy.infield_spacing) ?? null}
              onChange={(opt) => {
                if (opt) update({ infield_spacing: (opt as SelectOption).value as InfieldSpacing });
              }}
            />
          </div>
        </Tooltip>

        {/* Bullpen Cutoff */}
        <Tooltip text="The pitch count threshold at which the engine considers pulling the starter. Lower values protect arms; higher values ride hot pitchers longer.">
          <div className="space-y-1">
            <Text variant="small" classes="font-semibold">Bullpen Cutoff (Pitch Count)</Text>
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              Pitch count at which the SP is considered for replacement
            </Text>
            <input
              type="number"
              min={50}
              max={150}
              value={strategy.bullpen_cutoff}
              onChange={(e) => update({ bullpen_cutoff: Number(e.target.value) || 100 })}
              className="w-full sm:w-24 px-3 py-2 text-sm border rounded bg-black text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </Tooltip>

        {/* Bullpen Priority */}
        <Tooltip text="How the engine picks which reliever to use. 'Rest' favors the most-rested arm. 'Matchup' favors handedness advantage. 'Best Available' picks by rating.">
          <div className="space-y-1">
            <Text variant="small" classes="font-semibold">Bullpen Priority</Text>
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              How relievers are selected
            </Text>
            <SelectDropdown
              options={BullpenPriorityOptions}
              value={BullpenPriorityOptions.find((o) => o.value === strategy.bullpen_priority) ?? null}
              onChange={(opt) => {
                if (opt) update({ bullpen_priority: (opt as SelectOption).value as BullpenPriorityType });
              }}
            />
          </div>
        </Tooltip>

        {/* Intentional Walk List */}
        <Tooltip text="Enter opposing player IDs (comma-separated) that your team should intentionally walk in high-leverage at-bats.">
          <div className="space-y-1">
            <Text variant="small" classes="font-semibold">Intentional Walk Targets</Text>
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              Opposing player IDs to intentionally walk in high-leverage situations
            </Text>
            <input
              type="text"
              value={strategy.intentional_walk_list?.join(", ") ?? ""}
              onChange={(e) => {
                const ids = e.target.value
                  .split(",")
                  .map((s) => parseInt(s.trim(), 10))
                  .filter((n) => !isNaN(n));
                update({ intentional_walk_list: ids });
              }}
              className="w-full px-3 py-2 text-sm border rounded bg-black text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 42, 55, 101"
            />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

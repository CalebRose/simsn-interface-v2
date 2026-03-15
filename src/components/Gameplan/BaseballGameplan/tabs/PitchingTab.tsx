import { useState, useEffect, useRef, useMemo } from "react";
import { Text } from "../../../../_design/Typography";
import { Button } from "../../../../_design/Buttons";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { Player } from "../../../../models/baseball/baseballModels";
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
import { PlayerAttributeRow, PitchOverallChips } from "../ratingUtils";

interface PitchingTabProps {
  teamId: number;
  players: Player[];
}

export const PitchingTab = ({ teamId, players }: PitchingTabProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    rotation: true,
    bullpen: true,
    strategy: true,
  });

  const toggle = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <Text variant="h5" classes="font-semibold mb-3">Pitching</Text>

      <div className="space-y-4">
        <AccordionSection title="Starting Rotation" isOpen={openSections.rotation} onToggle={() => toggle("rotation")}>
          <RotationSection teamId={teamId} players={players} />
        </AccordionSection>

        <AccordionSection title="Bullpen" isOpen={openSections.bullpen} onToggle={() => toggle("bullpen")}>
          <BullpenSection teamId={teamId} players={players} />
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

const RotationSection = ({ teamId, players }: { teamId: number; players: Player[] }) => {
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

  const isDirty = useMemo(() => {
    return JSON.stringify(rotation) !== baselineRef.current;
  }, [rotation]);

  const spPitchers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aVal = a.ratings.sp_rating;
      const bVal = b.ratings.sp_rating;
      const aNum = aVal == null ? 0 : typeof aVal === "string" ? 0 : aVal;
      const bNum = bVal == null ? 0 : typeof bVal === "string" ? 0 : bVal;
      return bNum - aNum;
    });
  }, [players]);

  const pitcherOptions: SelectOption[] = useMemo(() => {
    return spPitchers.map((p) => ({
      value: String(p.id),
      label: `${p.firstname} ${p.lastname} (SP: ${p.ratings.sp_rating ?? "—"})`,
    }));
  }, [spPitchers]);

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

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const saved = await BaseballService.SaveRotation(teamId, rotation);
      setRotation(saved);
      baselineRef.current = JSON.stringify(saved);
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
          <Text variant="small" classes="font-semibold">Rotation Size:</Text>
          <div className="w-full sm:w-[180px]">
            <SelectDropdown
              options={rotSizeOptions}
              value={rotSizeOptions.find((o) => o.value === String(rotation.rotation_size ?? 5)) ?? null}
              onChange={(opt) => {
                if (opt) handleSizeChange(Number((opt as SelectOption).value));
              }}
            />
          </div>
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
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Rotation"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {rotation.slots.map((slot, idx) => {
          const isNext = idx === rotation.current_slot;
          const assignedPlayer = slot.player_id ? playerMap[slot.player_id] : null;
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
                <span className="font-bold text-lg w-8 text-center">{slot.slot}</span>
                {isNext && (
                  <span className="text-xs font-bold text-blue-500 uppercase">Next</span>
                )}
                <div className="w-full sm:w-[280px]">
                  <SelectDropdown
                    options={pitcherOptions}
                    value={pitcherOptions.find((o) => o.value === String(slot.player_id)) ?? null}
                    onChange={(opt) => {
                      if (opt) updateSlotPlayer(idx, Number((opt as SelectOption).value));
                    }}
                    isSearchable
                    placeholder="Select pitcher..."
                  />
                </div>
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => moveSlot(idx, -1)}
                    disabled={idx === 0}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlot(idx, 1)}
                    disabled={idx === rotation.slots.length - 1}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
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

const BullpenSection = ({ teamId, players }: { teamId: number; players: Player[] }) => {
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

  const isDirty = useMemo(() => {
    return JSON.stringify(bullpen) !== baselineRef.current;
  }, [bullpen]);

  const sortedByRp = useMemo(() => {
    return [...players].sort((a, b) => {
      const aVal = a.ratings.rp_rating;
      const bVal = b.ratings.rp_rating;
      const aNum = aVal == null ? 0 : typeof aVal === "string" ? 0 : aVal;
      const bNum = bVal == null ? 0 : typeof bVal === "string" ? 0 : bVal;
      return bNum - aNum;
    });
  }, [players]);

  const pitcherOptions: SelectOption[] = useMemo(() => {
    return sortedByRp.map((p) => ({
      value: String(p.id),
      label: `${p.firstname} ${p.lastname} (RP: ${p.ratings.rp_rating ?? "—"})`,
    }));
  }, [sortedByRp]);

  const allPlayerOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "", label: "None" },
      ...players.map((p) => ({
        value: String(p.id),
        label: `${p.firstname} ${p.lastname}`,
      })),
    ];
  }, [players]);

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

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const saved = await BaseballService.SaveBullpen(teamId, bullpen);
      setBullpen(saved);
      baselineRef.current = JSON.stringify(saved);
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
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Bullpen"}
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {bullpen.pitchers.map((entry, idx) => {
          const assignedPlayer = entry.player_id ? playerMap[entry.player_id] : null;
          return (
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-lg w-8 text-center">{entry.slot}</span>

                <div className="w-full sm:w-[250px]">
                  <SelectDropdown
                    options={pitcherOptions}
                    value={pitcherOptions.find((o) => o.value === String(entry.player_id)) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEntry(idx, { player_id: Number((opt as SelectOption).value) });
                    }}
                    isSearchable
                    placeholder="Select pitcher..."
                  />
                </div>

                <div className="w-full sm:w-[140px]">
                  <SelectDropdown
                    options={BullpenRoleOptions}
                    value={BullpenRoleOptions.find((o) => o.value === entry.role) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEntry(idx, { role: (opt as SelectOption).value as BullpenRole });
                    }}
                  />
                </div>

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
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveEntry(idx, 1)}
                    disabled={idx === bullpen.pitchers.length - 1}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePitcher(idx)}
                    className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-red-700 text-white border border-red-500 hover:bg-red-600"
                    title="Remove"
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
      <div className="mt-6 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <Text variant="small" classes="font-semibold mb-1">Emergency Pitcher</Text>
        <Text variant="small" classes="text-gray-500 dark:text-gray-400 mb-2">
          Player who pitches if the entire bullpen is exhausted.
        </Text>
        <div className="w-full sm:w-[280px]">
          <SelectDropdown
            options={allPlayerOptions}
            value={
              bullpen.emergency_pitcher_id
                ? allPlayerOptions.find((o) => o.value === String(bullpen.emergency_pitcher_id)) ?? null
                : allPlayerOptions[0]
            }
            onChange={(opt) => {
              const val = (opt as SelectOption)?.value;
              setBullpen((prev) => ({
                ...prev,
                emergency_pitcher_id: val ? Number(val) || null : null,
              }));
            }}
            isClearable
            isSearchable
          />
        </div>
      </div>
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

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const saved = await BaseballService.SaveTeamStrategy(teamId, strategy);
      setStrategy(saved);
      baselineRef.current = JSON.stringify(saved);
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
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Strategy"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outfield Spacing */}
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

        {/* Infield Spacing */}
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

        {/* Bullpen Cutoff */}
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

        {/* Bullpen Priority */}
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

        {/* Intentional Walk List */}
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
      </div>
    </div>
  );
};

import { useState, useEffect, useMemo, useCallback } from "react";
import { Text } from "../../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { Player, PlayerRatings, DisplayValue } from "../../../../models/baseball/baseballModels";
import {
  PlayerStrategy,
  PlayerStrategyValidationDetail,
  PlateApproach,
  PitchingApproach,
  BaserunningApproach,
  UsagePreference,
  PullTendency,
} from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import { displayLevel } from "../../../../_utility/baseballHelpers";
import {
  PlateApproachOptions,
  PitchingApproachOptions,
  BaserunningApproachOptions,
  UsagePreferenceOptions,
  PullTendencyOptions,
  BATTING_DISPLAY_ATTRS,
  SP_DISPLAY_ATTRS,
  RP_DISPLAY_ATTRS,
} from "../BaseballGameplanConstants";
import { ratingColor, displayValueColor, PlayerAttributeRow, PitchOverallChips, StaminaBar } from "../ratingUtils";
import { Tooltip } from "../playerDropdownUtils";

interface PlayerStrategyTabProps {
  orgId: number;
  players: Player[];
  levelLabel: string;
}

const DEFAULT_STRATEGY: Omit<PlayerStrategy, "org_id" | "player_id"> = {
  id: null,
  plate_approach: "normal",
  pitching_approach: "normal",
  baserunning_approach: "normal",
  usage_preference: "normal",
  stealfreq: 1.87,
  pickofffreq: 1.0,
  pitchchoices: [3, 3, 3, 3, 3],
  pitchpull: null,
  pulltend: null,
};

// Position rating keys to check for best position badge
const POSITION_RATING_KEYS: { key: keyof PlayerRatings; label: string }[] = [
  { key: "c_rating", label: "C" },
  { key: "fb_rating", label: "1B" },
  { key: "sb_rating", label: "2B" },
  { key: "tb_rating", label: "3B" },
  { key: "ss_rating", label: "SS" },
  { key: "lf_rating", label: "LF" },
  { key: "cf_rating", label: "CF" },
  { key: "rf_rating", label: "RF" },
  { key: "dh_rating", label: "DH" },
  { key: "sp_rating", label: "SP" },
  { key: "rp_rating", label: "RP" },
];

// Pitch OVR rating keys for the weight UI
const PITCH_OVR_KEYS: (keyof PlayerRatings)[] = [
  "pitch1_ovr", "pitch2_ovr", "pitch3_ovr", "pitch4_ovr", "pitch5_ovr",
];

// Athletic/baserunning attributes for the player summary card
const ATHLETIC_DISPLAY_ATTRS: { key: keyof PlayerRatings; label: string }[] = [
  { key: "speed_display", label: "Speed" },
  { key: "baserunning_display", label: "BsRun" },
  { key: "basereaction_display", label: "BsRct" },
];

// ── Preset definitions ──

const STEAL_PRESETS = [
  { label: "None", value: 0 },
  { label: "Some", value: 0.95 },
  { label: "Normal", value: 1.87 },
  { label: "More", value: 3.8 },
  { label: "Frequent", value: 6 },
];

const PICKOFF_PRESETS = [
  { label: "None", value: 0 },
  { label: "Some", value: 0.5 },
  { label: "Normal", value: 1 },
  { label: "More", value: 2 },
  { label: "Frequent", value: 5 },
];

const PITCH_PULL_PRESETS: SelectOption[] = [
  { value: "", label: "Default" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const PITCH_WEIGHT_PRESETS = [
  { label: "None", value: 0 },
  { label: "Less", value: 1 },
  { label: "Normal", value: 3 },
  { label: "More", value: 5 },
];

// ── Bulk apply field metadata ──
// Every PlayerStrategy field applies to every player regardless of position;
// the engine handles relevance internally. `pitchchoices` is the lone exclusion
// because slot indices map to per-player pitches, so a uniform bulk value is
// meaningless across players.
type BulkKind = "enum" | "number" | "nullable_enum" | "nullable_number";
interface BulkFieldDef {
  key: keyof PlayerStrategy;
  label: string;
  kind: BulkKind;
}

const BULK_FIELDS: BulkFieldDef[] = [
  { key: "plate_approach",       label: "Plate Approach",       kind: "enum" },
  { key: "stealfreq",            label: "Steal Frequency",      kind: "number" },
  { key: "baserunning_approach", label: "Baserunning Approach", kind: "enum" },
  { key: "pitching_approach",    label: "Pitching Approach",    kind: "enum" },
  { key: "usage_preference",     label: "Usage Preference",     kind: "enum" },
  { key: "pickofffreq",          label: "Pickoff Frequency",    kind: "number" },
  { key: "pitchpull",            label: "Pull at Pitch #",      kind: "nullable_number" },
  { key: "pulltend",             label: "Pull Tendency",        kind: "nullable_enum" },
];

// Lookup tables used by the bulk value picker. Keyed by field key.
const BULK_ENUM_OPTIONS: Partial<Record<keyof PlayerStrategy, { value: string; label: string }[]>> = {
  plate_approach: PlateApproachOptions,
  baserunning_approach: BaserunningApproachOptions,
  pitching_approach: PitchingApproachOptions,
  usage_preference: UsagePreferenceOptions,
  pulltend: PullTendencyOptions,
};

const BULK_NUMBER_PRESETS: Partial<Record<keyof PlayerStrategy, { label: string; value: number | null }[]>> = {
  stealfreq: STEAL_PRESETS,
  pickofffreq: PICKOFF_PRESETS,
  pitchpull: [
    { label: "Default", value: null },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
  ],
};

export const PlayerStrategyTab = ({ orgId, players, levelLabel }: PlayerStrategyTabProps) => {
  const [strategies, setStrategies] = useState<PlayerStrategy[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  // Dirty-tracking: any player_id present here has unsaved changes.
  // Switching players preserves edits across the whole org until Save All / Discard All.
  const [pendingEdits, setPendingEdits] = useState<Map<number, PlayerStrategy>>(new Map());
  // Per-row validation errors from the most recent save attempt, keyed by player_id.
  const [rowErrors, setRowErrors] = useState<Map<number, PlayerStrategyValidationDetail[]>>(new Map());
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  // Multi-selection for bulk apply. Independent of `selectedPlayerId`
  // (which drives the right-pane single-edit view).
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkField, setBulkField] = useState<keyof PlayerStrategy | null>(null);
  // bulkValue is intentionally `unknown` — its concrete type depends on which
  // field is selected. The applyBulk path narrows it via the field def.
  const [bulkValue, setBulkValue] = useState<unknown>(undefined);
  const [bulkOnlyDefaults, setBulkOnlyDefaults] = useState(false);

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => filterType === "all" || p.ptype === filterType)
      .filter(
        (p) =>
          !searchTerm ||
          `${p.firstname} ${p.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => a.lastname.localeCompare(b.lastname));
  }, [players, filterType, searchTerm]);

  // Load all strategies on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetOrgPlayerStrategies(orgId);
        if (!cancelled) {
          setStrategies(data.strategies ?? []);
        }
      } catch {
        // API might not have data yet
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orgId]);

  // Resolves the strategy to display/edit for a given player:
  // pending edit > saved strategy > defaults. Always returns a fresh object
  // so callers can mutate without aliasing into state.
  const getDisplayedStrategy = useCallback(
    (playerId: number): PlayerStrategy => {
      const pending = pendingEdits.get(playerId);
      if (pending) return { ...pending };
      const saved = strategies.find((s) => s.player_id === playerId);
      if (saved) return { ...saved };
      return { ...DEFAULT_STRATEGY, org_id: orgId, player_id: playerId };
    },
    [pendingEdits, strategies, orgId],
  );

  const selectPlayer = useCallback((playerId: number) => {
    setSelectedPlayerId(playerId);
    setMessage("");
  }, []);

  const selectedPlayer = useMemo(() => {
    return players.find((p) => p.id === selectedPlayerId) ?? null;
  }, [players, selectedPlayerId]);

  // Derived form-state for the right-pane editor.
  const editing: PlayerStrategy | null = useMemo(() => {
    if (selectedPlayerId == null) return null;
    return getDisplayedStrategy(selectedPlayerId);
  }, [selectedPlayerId, getDisplayedStrategy]);

  const updateEditing = (updates: Partial<PlayerStrategy>) => {
    if (selectedPlayerId == null) return;
    const current = getDisplayedStrategy(selectedPlayerId);
    const next: PlayerStrategy = { ...current, ...updates };
    setPendingEdits((prev) => {
      const m = new Map(prev);
      m.set(selectedPlayerId, next);
      return m;
    });
    // Clear stale row errors for this player as soon as they edit again.
    if (rowErrors.has(selectedPlayerId)) {
      setRowErrors((prev) => {
        const m = new Map(prev);
        m.delete(selectedPlayerId);
        return m;
      });
    }
  };

  // Strip server-managed fields before sending. The backend ignores unknown
  // fields too, but we strip explicitly so the request stays small.
  const toPayloadEntry = (s: PlayerStrategy) => {
    const { id: _id, org_id: _oid, user_id: _uid, ...rest } = s;
    return rest;
  };

  // Shared save path used by both per-player Save and Save All. `playerIds`
  // is the set of pending rows to commit; everything else stays dirty.
  const saveBatch = async (playerIds: number[]) => {
    if (playerIds.length === 0) return;
    const entries = playerIds
      .map((pid) => pendingEdits.get(pid))
      .filter((s): s is PlayerStrategy => !!s)
      .map(toPayloadEntry);
    if (entries.length === 0) return;

    setIsSaving(true);
    setMessage("");
    try {
      const resp = await BaseballService.SaveOrgPlayerStrategiesBatch(orgId, entries);

      // Merge returned canonical rows back into `strategies`.
      setStrategies((prev) => {
        const byId = new Map(prev.map((s) => [s.player_id, s]));
        for (const s of resp.strategies) byId.set(s.player_id, s);
        return Array.from(byId.values());
      });

      // Drop just the rows we successfully saved from pending + their errors.
      const savedIds = new Set(resp.strategies.map((s) => s.player_id));
      // Fall back to the requested ids if backend returned an empty list
      // (shouldn't happen for non-empty input, but be defensive).
      if (savedIds.size === 0) for (const id of playerIds) savedIds.add(id);

      setPendingEdits((prev) => {
        const m = new Map(prev);
        for (const id of savedIds) m.delete(id);
        return m;
      });
      setRowErrors((prev) => {
        if (prev.size === 0) return prev;
        const m = new Map(prev);
        for (const id of savedIds) m.delete(id);
        return m;
      });

      const n = resp.strategies.length || playerIds.length;
      setMessage(`Saved ${n} player${n === 1 ? "" : "s"}`);
    } catch (err: any) {
      const status = err?.status;
      const details: PlayerStrategyValidationDetail[] | undefined = err?.body?.details;
      if (status === 400 && Array.isArray(details)) {
        const map = new Map<number, PlayerStrategyValidationDetail[]>();
        for (const d of details) {
          const arr = map.get(d.player_id) ?? [];
          arr.push(d);
          map.set(d.player_id, arr);
        }
        setRowErrors(map);
        setMessage(`Validation failed for ${map.size} player${map.size === 1 ? "" : "s"} — see highlighted rows`);
      } else if (status === 413) {
        setMessage("Too many changes to save at once (max 500). Save in smaller batches.");
      } else {
        const detail = err?.message && err.message !== "Failed to fetch" ? err.message : "Unknown error";
        setMessage(`Failed to save: ${detail}`);
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 6000);
    }
  };

  const handleSaveCurrent = () => {
    if (selectedPlayerId == null) return;
    if (!pendingEdits.has(selectedPlayerId)) return;
    void saveBatch([selectedPlayerId]);
  };

  const handleSaveAll = () => {
    void saveBatch(Array.from(pendingEdits.keys()));
  };

  const handleDiscardAll = () => {
    if (pendingEdits.size === 0) return;
    setPendingEdits(new Map());
    setRowErrors(new Map());
    setMessage("");
  };

  const handleDiscardCurrent = () => {
    if (selectedPlayerId == null) return;
    if (!pendingEdits.has(selectedPlayerId)) return;
    setPendingEdits((prev) => {
      const m = new Map(prev);
      m.delete(selectedPlayerId);
      return m;
    });
    setRowErrors((prev) => {
      if (!prev.has(selectedPlayerId)) return prev;
      const m = new Map(prev);
      m.delete(selectedPlayerId);
      return m;
    });
  };

  const dirtyCount = pendingEdits.size;
  const errorCount = rowErrors.size;
  const isCurrentDirty = selectedPlayerId != null && pendingEdits.has(selectedPlayerId);
  const currentRowErrors =
    selectedPlayerId != null ? rowErrors.get(selectedPlayerId) ?? [] : [];

  // ── Multi-selection / bulk apply ──

  const toggleSelection = (playerId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  // Additive — does NOT deselect players outside the current filter.
  const selectVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of filteredPlayers) next.add(p.id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectionCount = selectedIds.size;

  const pickBulkField = (key: keyof PlayerStrategy | null) => {
    setBulkField(key);
    setBulkValue(undefined);
  };

  // bulkValue is `undefined` until the user picks; `null` is a real value
  // (used by nullable_enum / nullable_number to mean "Default").
  const isBulkValueChosen = bulkValue !== undefined;

  const applyBulk = () => {
    if (!bulkField || !isBulkValueChosen) return;
    const def = BULK_FIELDS.find((f) => f.key === bulkField);
    if (!def) return;

    const defaultVal = (DEFAULT_STRATEGY as any)[bulkField];

    // Resolve target list. "Only override defaults" filters out any player
    // whose currently-displayed value for this field is non-default.
    const targets: number[] = [];
    for (const id of selectedIds) {
      if (bulkOnlyDefaults) {
        const current = getDisplayedStrategy(id);
        if ((current as any)[bulkField] !== defaultVal) continue;
      }
      targets.push(id);
    }

    if (targets.length === 0) {
      setMessage("No players matched (all selected players already have non-default values)");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    // Single setPendingEdits with all the new rows folded in. We re-resolve
    // each player's current strategy from the previous map snapshot to avoid
    // a stale-closure race if applyBulk is invoked rapidly.
    setPendingEdits((prev) => {
      const m = new Map(prev);
      for (const id of targets) {
        const pending = m.get(id);
        const base =
          pending ??
          strategies.find((s) => s.player_id === id) ??
          ({ ...DEFAULT_STRATEGY, org_id: orgId, player_id: id } as PlayerStrategy);
        m.set(id, { ...base, [bulkField]: bulkValue } as PlayerStrategy);
      }
      return m;
    });

    // Clear stale validation errors for players we just rewrote.
    setRowErrors((prev) => {
      if (prev.size === 0) return prev;
      const m = new Map(prev);
      for (const id of targets) m.delete(id);
      return m;
    });

    setMessage(`Applied ${def.label} to ${targets.length} player${targets.length === 1 ? "" : "s"}`);
    setTimeout(() => setMessage(""), 5000);
  };

  // Get the best position rating for player list badges
  const getBestRating = (p: Player): { label: string; value: number | string } | null => {
    if (p.ptype === "Pitcher") {
      const sp = p.ratings.sp_rating;
      if (sp != null) return { label: "SP", value: sp };
      return null;
    }
    let best: { label: string; value: number | string } | null = null;
    for (const { key, label } of POSITION_RATING_KEYS) {
      const val = p.ratings[key] as number | string | null;
      if (val == null) continue;
      if (best === null) {
        best = { label, value: val };
      } else {
        const numVal = typeof val === "string" ? 0 : val;
        const numBest = typeof best.value === "string" ? 0 : best.value;
        if (numVal > numBest) best = { label, value: val };
      }
    }
    return best;
  };

  if (isLoading) {
    return <Text variant="body-small" classes="text-gray-400">Loading player strategies...</Text>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <Text variant="h5" classes="font-semibold">
          Player Settings — {displayLevel(levelLabel)}
        </Text>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Text variant="small" classes="text-yellow-300">
              {dirtyCount} unsaved
            </Text>
          )}
          {errorCount > 0 && (
            <Text variant="small" classes="text-red-400">
              {errorCount} with errors
            </Text>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving || dirtyCount === 0}
          >
            {isSaving ? "Saving..." : `Save All${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
          </Button>
          <Button
            variant="primaryOutline"
            size="sm"
            onClick={handleDiscardAll}
            disabled={isSaving || dirtyCount === 0}
          >
            Discard All
          </Button>
        </div>
      </div>
      {message && (
        <div className="mb-2">
          <Text variant="small" classes={message.includes("Failed") || message.includes("Validation") || message.includes("Too many") ? "text-red-400" : "text-green-400"}>
            {message}
          </Text>
        </div>
      )}

      {/* Explainer */}
      <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <Text variant="small" classes="text-gray-400 leading-relaxed">
          Configure individual player strategies. Set each player's
          <strong className="text-gray-300"> plate approach </strong> and <strong className="text-gray-300">steal tendency</strong> at the plate,
          <strong className="text-gray-300"> pitching style</strong>, <strong className="text-gray-300">usage preference</strong>,
          and <strong className="text-gray-300">pitch selection weights</strong> on the mound,
          and <strong className="text-gray-300">baserunning aggression</strong> on the bases.
          These settings override the engine defaults for each individual player.
        </Text>
      </div>

      {/* Bulk apply panel — only visible when something is selected.
          Shares the Card / Subsection / OptionPill / NumericStepper system
          with the per-player editor; only the accent color (purple) and the
          OptionPill `variant` differ to telegraph "this is bulk mode." */}
      {selectedIds.size > 0 && (
        <Card accent="purple">
          <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
            <Text variant="small" classes="font-semibold text-purple-200">
              Bulk apply — {selectionCount} selected
            </Text>
            <SmallActionButton onClick={clearSelection}>
              Clear selection
            </SmallActionButton>
          </div>

          <Subsection label="Field">
            <div className="flex flex-wrap gap-1">
              {BULK_FIELDS.map((f) => (
                <OptionPill
                  key={f.key}
                  variant="purple"
                  selected={bulkField === f.key}
                  onClick={() => pickBulkField(f.key)}
                >
                  {f.label}
                </OptionPill>
              ))}
            </div>
          </Subsection>

          {bulkField && (() => {
            const def = BULK_FIELDS.find((f) => f.key === bulkField);
            if (!def) return null;

            if (def.kind === "enum" || def.kind === "nullable_enum") {
              const opts = BULK_ENUM_OPTIONS[def.key] ?? [];
              const allOpts: { value: string | null; label: string }[] =
                def.kind === "nullable_enum"
                  ? [{ value: null, label: "Default" }, ...opts]
                  : opts;
              return (
                <Subsection label="Value">
                  <div className="flex flex-wrap gap-1">
                    {allOpts.map((o) => (
                      <OptionPill
                        key={o.value === null ? "_default" : String(o.value)}
                        variant="purple"
                        selected={isBulkValueChosen && (bulkValue ?? null) === o.value}
                        onClick={() => setBulkValue(o.value)}
                      >
                        {o.label}
                      </OptionPill>
                    ))}
                  </div>
                </Subsection>
              );
            }

            // number / nullable_number
            const presets = BULK_NUMBER_PRESETS[def.key] ?? [];
            const isNullable = def.kind === "nullable_number";
            const stepperStep =
              def.key === "stealfreq" ? 0.5 :
              def.key === "pickofffreq" ? 0.25 :
              def.key === "pitchpull" ? 5 : 1;
            const stepperMin = def.key === "pitchpull" ? 1 : 0;
            const stepperMax = def.key === "pitchpull" ? 200 : 100;
            return (
              <Subsection label="Value">
                <div className="flex items-center gap-2 flex-wrap">
                  <NumericStepper
                    value={bulkValue == null ? null : (bulkValue as number)}
                    onChange={(v) => setBulkValue(isNullable ? v : (v ?? 0))}
                    min={stepperMin}
                    max={stepperMax}
                    step={stepperStep}
                    nullable={isNullable}
                    nullDefault={def.key === "pitchpull" ? 100 : undefined}
                    placeholder={isNullable ? "Default" : "0"}
                  />
                  <div className="flex flex-wrap gap-1">
                    {presets.map((p) => (
                      <OptionPill
                        key={p.label}
                        variant="purple"
                        selected={isBulkValueChosen && bulkValue === p.value}
                        onClick={() => setBulkValue(p.value)}
                      >
                        {p.label}
                      </OptionPill>
                    ))}
                  </div>
                </div>
              </Subsection>
            );
          })()}

          {/* Apply controls */}
          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkOnlyDefaults}
                onChange={(e) => setBulkOnlyDefaults(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-purple-500"
              />
              <Text variant="small" classes="text-gray-300">
                Only apply to players still on engine defaults
              </Text>
            </label>
            <Button
              variant="primary"
              size="sm"
              onClick={applyBulk}
              disabled={!bulkField || !isBulkValueChosen}
            >
              Apply to {selectionCount}
            </Button>
          </div>
          <Text variant="xs" classes="text-gray-500 mt-2 block">
            Bulk apply stages changes as unsaved edits — review the dirty rows in the list below, then Save All to commit.
          </Text>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Player List */}
        <div className="lg:w-[340px] shrink-0">
          <div className="flex gap-1 mb-2 items-center justify-between flex-wrap">
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={filterType === "all"} onClick={() => setFilterType("all")}>
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Pitcher"} onClick={() => setFilterType("Pitcher")}>
                <Text variant="small">P</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Position"} onClick={() => setFilterType("Position")}>
                <Text variant="small">Pos</Text>
              </PillButton>
            </ButtonGroup>
            <div className="flex gap-1">
              <SmallActionButton
                variant="purple"
                onClick={selectVisible}
                title="Add all currently visible players to the selection"
              >
                Select visible
              </SmallActionButton>
              <SmallActionButton
                onClick={clearSelection}
                disabled={selectedIds.size === 0}
                title="Deselect all players (across all filters)"
              >
                Clear
              </SmallActionButton>
            </div>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player..."
            className="w-full mb-2 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500 focus:ring-blue-500"
          />
          <div className="mb-1 px-1">
            <Text variant="xs" classes="text-gray-500">
              Click name to edit · Check ☐ for bulk apply
            </Text>
          </div>
          <div className="max-h-[50vh] overflow-y-auto border rounded dark:border-gray-600">
            {filteredPlayers.map((p) => {
              const best = getBestRating(p);
              const isDirty = pendingEdits.has(p.id);
              const hasError = rowErrors.has(p.id);
              const isSelected = selectedIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`flex items-stretch border-b dark:border-gray-700 transition-colors
                    ${hasError
                      ? "bg-red-900/20 border-l-2 border-l-red-500"
                      : isSelected
                        ? "bg-purple-900/20"
                        : p.id === selectedPlayerId
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  {/* Checkbox is OUTSIDE the navigation button so we don't
                      nest interactive elements. Label gives it a comfortable
                      click target without needing stopPropagation. The right
                      border visually splits the selection column from the
                      navigation column. */}
                  <label
                    className="flex items-center px-2 cursor-pointer shrink-0 border-r border-gray-700/60"
                    title="Select for bulk apply"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(p.id)}
                      className="w-4 h-4 cursor-pointer accent-purple-500"
                      aria-label={`Select ${p.firstname} ${p.lastname} for bulk apply`}
                    />
                  </label>
                  <button
                    onClick={() => selectPlayer(p.id)}
                    title="Click to edit this player's strategy"
                    className={`group flex-1 min-w-0 text-left px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between gap-2
                      ${p.id === selectedPlayerId ? "font-semibold text-blue-700 dark:text-blue-300" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {hasError ? (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 bg-red-500"
                          title="Validation error — see right pane"
                        />
                      ) : isDirty ? (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 bg-yellow-400"
                          title="Unsaved changes"
                        />
                      ) : null}
                      <span className="truncate">{p.firstname} {p.lastname}</span>
                      <span className={`text-xs px-1 py-0.5 rounded shrink-0 ${
                        p.ptype === "Pitcher"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}>
                        {p.ptype === "Pitcher" ? "P" : "Pos"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {best && (
                        <span className={`text-xs ${displayValueColor(best.value)}`}>
                          {best.label} {best.value}
                        </span>
                      )}
                      {/* Chevron telegraphs that the name is its own click
                          target that opens the per-player editor. */}
                      <span
                        aria-hidden="true"
                        className="text-gray-500 group-hover:text-gray-300 transition-colors text-base leading-none"
                      >
                        ›
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
            {filteredPlayers.length === 0 && (
              <div className="px-3 py-2">
                <Text variant="small" classes="text-gray-500">No players found.</Text>
              </div>
            )}
          </div>
        </div>

        {/* Right: Strategy Form */}
        <div className="flex-1 min-w-0">
          {!editing || !selectedPlayer ? (
            <div className="flex items-center justify-center h-40">
              <div className="max-w-sm space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="text-blue-400 text-xl leading-none mt-0.5 shrink-0"
                  >
                    ›
                  </span>
                  <Text variant="body-small" classes="text-gray-300">
                    <strong className="text-gray-100">Click a player's name</strong> in the list to edit
                    their individual strategy.
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="text-purple-400 text-base leading-none mt-1 shrink-0"
                  >
                    ☐
                  </span>
                  <Text variant="body-small" classes="text-gray-300">
                    <strong className="text-gray-100">Check the boxes</strong> to select multiple players,
                    then use the bulk apply panel to set the same value across all of them at once.
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Player header + per-player save */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Text variant="body" classes="font-semibold">
                    {selectedPlayer.firstname} {selectedPlayer.lastname}
                  </Text>
                  {isCurrentDirty && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                      Unsaved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primaryOutline"
                    size="sm"
                    onClick={handleDiscardCurrent}
                    disabled={isSaving || !isCurrentDirty}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCurrent}
                    disabled={isSaving || !isCurrentDirty}
                  >
                    {isSaving ? "Saving..." : "Save Player"}
                  </Button>
                </div>
              </div>

              {currentRowErrors.length > 0 && (
                <div className="mb-3 p-2 rounded border border-red-500/50 bg-red-900/20">
                  <Text variant="small" classes="font-semibold text-red-300 mb-1">
                    Validation errors:
                  </Text>
                  <ul className="list-disc list-inside space-y-0.5">
                    {currentRowErrors.map((e, i) => (
                      <li key={i}>
                        <Text variant="small" classes="text-red-300">
                          <span className="font-mono">{e.field}</span>: {e.message}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ─── Card 1: Player Summary ─── */}
              <Card>
                <div className="space-y-2 text-center">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      selectedPlayer.ptype === "Pitcher"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}>
                      {selectedPlayer.ptype}
                    </span>
                    <span className="text-xs text-gray-500">Age {selectedPlayer.age}</span>
                    {selectedPlayer.bat_hand && (
                      <span className="text-xs text-gray-500">Bats: {selectedPlayer.bat_hand}</span>
                    )}
                    {selectedPlayer.pitch_hand && (
                      <span className="text-xs text-gray-500">Throws: {selectedPlayer.pitch_hand}</span>
                    )}
                    {selectedPlayer.displayovr && (
                      <span className={`text-xs font-semibold ${ratingColor(Number(selectedPlayer.displayovr))}`}>
                        OVR: {selectedPlayer.displayovr}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <PlayerAttributeRow player={selectedPlayer} attributes={BATTING_DISPLAY_ATTRS} />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <PlayerAttributeRow player={selectedPlayer} attributes={ATHLETIC_DISPLAY_ATTRS} />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <PlayerAttributeRow player={selectedPlayer} attributes={SP_DISPLAY_ATTRS} />
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {POSITION_RATING_KEYS.map(({ key, label }) => {
                      const val = selectedPlayer.ratings[key] as number | string | null;
                      if (val == null) return null;
                      return (
                        <span
                          key={key}
                          className={`text-xs px-1.5 py-0.5 rounded bg-gray-700/50 ${displayValueColor(val)}`}
                        >
                          {label}: {val}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <PitchOverallChips player={selectedPlayer} />
                  </div>
                </div>
              </Card>

              {/* ─── Card 2: Strategy ─── */}
              <Card>
                {/* Availability — Usage Preference is universal (applies to
                    every player, not just pitchers), so it lives at the top
                    of the strategy card under its own heading rather than
                    being grouped under "On the Mound". */}
                <Subsection label="Availability">
                  <Tooltip text="When this player is available. 'Only Fully Rested' waits for full rest; 'Play Tired' allows use on short rest; 'Desperation' uses them regardless. This setting overrides lineup information, so if you want a literal interpretation of lineup, set Desperation.">
                    <div>
                      <FieldLabel label="Usage Preference" />
                      <div className="mb-2">
                        <StaminaBar player={selectedPlayer} label="Current Stamina:" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {UsagePreferenceOptions.map((o) => (
                          <OptionPill
                            key={o.value}
                            selected={editing.usage_preference === o.value}
                            onClick={() => updateEditing({ usage_preference: o.value as UsagePreference })}
                          >
                            {o.label}
                          </OptionPill>
                        ))}
                      </div>
                    </div>
                  </Tooltip>
                </Subsection>

                <Subsection label="At the Plate">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Tooltip text="How the player approaches at-bats. Aggressive swings more; Patient works counts; Contact focuses on putting the ball in play; Power sells out for extra bases.">
                      <div>
                        <FieldLabel label="Plate Approach" />
                        <div className="flex flex-wrap gap-1">
                          {PlateApproachOptions.map((o) => (
                            <OptionPill
                              key={o.value}
                              selected={editing.plate_approach === o.value}
                              onClick={() => updateEditing({ plate_approach: o.value as PlateApproach })}
                            >
                              {o.label}
                            </OptionPill>
                          ))}
                        </div>
                      </div>
                    </Tooltip>

                    <Tooltip text="Percentage chance this player attempts steal on a pitch action. League average is around 1.87. 100 would mean every single pitch attempt would have a steal opportunity until scoring or getting thrown out.">
                      <div>
                        <FieldLabel label="Steal Frequency" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <NumericStepper
                            value={editing.stealfreq}
                            onChange={(v) => updateEditing({ stealfreq: v ?? 0 })}
                            min={0}
                            max={100}
                            step={0.5}
                          />
                          <div className="flex flex-wrap gap-1">
                            {STEAL_PRESETS.map((p) => (
                              <OptionPill
                                key={p.label}
                                selected={editing.stealfreq === p.value}
                                onClick={() => updateEditing({ stealfreq: p.value })}
                              >
                                {p.label}
                              </OptionPill>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </Subsection>

                <Subsection label="On the Mound">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Tooltip text="How the pitcher approaches at-bats. Aggressive challenges hitters; Finesse nibbles at corners; Power throws heat; Location focuses on spot accuracy.">
                      <div>
                        <FieldLabel label="Pitching Approach" />
                        <div className="flex flex-wrap gap-1">
                          {PitchingApproachOptions.map((o) => (
                            <OptionPill
                              key={o.value}
                              selected={editing.pitching_approach === o.value}
                              onClick={() => updateEditing({ pitching_approach: o.value as PitchingApproach })}
                            >
                              {o.label}
                            </OptionPill>
                          ))}
                        </div>
                      </div>
                    </Tooltip>

                    <Tooltip text="How often this pitcher throws pickoff attempts. Higher values mean more pickoff throws per baserunner.">
                      <div>
                        <FieldLabel label="Pickoff Frequency" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <NumericStepper
                            value={editing.pickofffreq}
                            onChange={(v) => updateEditing({ pickofffreq: v ?? 0 })}
                            min={0}
                            max={100}
                            step={0.25}
                          />
                          <div className="flex flex-wrap gap-1">
                            {PICKOFF_PRESETS.map((p) => (
                              <OptionPill
                                key={p.label}
                                selected={editing.pickofffreq === p.value}
                                onClick={() => updateEditing({ pickofffreq: p.value })}
                              >
                                {p.label}
                              </OptionPill>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Tooltip>

                    <Tooltip text="The pitch count at which the engine considers pulling this pitcher. Leave as Default to use the team strategy setting.">
                      <div>
                        <FieldLabel label="Pull at Pitch #" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <NumericStepper
                            value={editing.pitchpull}
                            onChange={(v) => updateEditing({ pitchpull: v })}
                            min={1}
                            max={200}
                            step={5}
                            nullable
                            nullDefault={100}
                            placeholder="Default"
                          />
                          <div className="flex flex-wrap gap-1">
                            {PITCH_PULL_PRESETS.map((p) => {
                              const numericValue = p.value ? Number(p.value) : null;
                              return (
                                <OptionPill
                                  key={p.label}
                                  selected={(editing.pitchpull ?? null) === numericValue}
                                  onClick={() => updateEditing({ pitchpull: numericValue })}
                                >
                                  {p.label}
                                </OptionPill>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Tooltip>

                    <Tooltip text="How quickly the manager pulls this pitcher when they start struggling. 'Quick' pulls earlier; 'Long' gives a longer leash.">
                      <div>
                        <FieldLabel label="Pull Tendency" />
                        <div className="flex flex-wrap gap-1">
                          {[{ value: "", label: "Default" }, ...PullTendencyOptions].map((o) => (
                            <OptionPill
                              key={o.value || "_default"}
                              selected={(editing.pulltend ?? "") === o.value}
                              onClick={() => updateEditing({ pulltend: o.value ? (o.value as PullTendency) : null })}
                            >
                              {o.label}
                            </OptionPill>
                          ))}
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </Subsection>

                <Subsection label="On the Bases">
                  <Tooltip text="How aggressively this player runs the bases (separate from stealing). Aggressive takes extra bases and risks outs; Cautious will take extra bases when there's a decent gulf between their footspeed and the defense, and Conservative plays it very safe.">
                    <div>
                      <FieldLabel label="Baserunning Approach" />
                      <div className="flex flex-wrap gap-1">
                        {BaserunningApproachOptions.map((o) => (
                          <OptionPill
                            key={o.value}
                            selected={editing.baserunning_approach === o.value}
                            onClick={() => updateEditing({ baserunning_approach: o.value as BaserunningApproach })}
                          >
                            {o.label}
                          </OptionPill>
                        ))}
                      </div>
                    </div>
                  </Tooltip>
                </Subsection>
              </Card>

              {/* ─── Card 3: Pitch Selection Weights ─── */}
              <Card>
                <Subsection label="Pitch Selection Weights">
                  <Tooltip text="Control how often each pitch is thrown. Higher weight = more usage. Use the presets to quickly set values.">
                    {(() => {
                      const pitchNames = [
                        selectedPlayer.pitch1_name,
                        selectedPlayer.pitch2_name,
                        selectedPlayer.pitch3_name,
                        selectedPlayer.pitch4_name,
                        selectedPlayer.pitch5_name,
                      ];
                      const hasPitches = pitchNames.some((n) => !!n);
                      if (!hasPitches) {
                        return (
                          <Text variant="small" classes="text-gray-500 dark:text-gray-400 italic">
                            No pitches assigned to this player.
                          </Text>
                        );
                      }
                      return (
                        <div className="flex flex-col gap-2">
                          {pitchNames.map((name, i) => {
                            if (!name) return null;
                            const ovr = selectedPlayer.ratings[PITCH_OVR_KEYS[i]] as DisplayValue;
                            return (
                              <div key={i} className="flex items-center gap-3 flex-wrap py-1">
                                {/* Pitch name + rating */}
                                <div className="flex items-center gap-1.5 min-w-[120px]">
                                  <Text variant="small" classes="text-gray-300 font-medium truncate">{name}</Text>
                                  {ovr != null && (
                                    <span className={`text-xs px-1 py-0.5 rounded bg-gray-700/50 font-semibold ${displayValueColor(ovr)}`}>
                                      {ovr}
                                    </span>
                                  )}
                                </div>
                                <NumericStepper
                                  value={editing.pitchchoices[i] ?? 0}
                                  onChange={(v) => {
                                    const updated = [...editing.pitchchoices];
                                    updated[i] = v ?? 0;
                                    updateEditing({ pitchchoices: updated });
                                  }}
                                  min={0}
                                  max={10}
                                  step={1}
                                />
                                <div className="flex flex-wrap gap-1">
                                  {PITCH_WEIGHT_PRESETS.map((p) => (
                                    <OptionPill
                                      key={p.label}
                                      selected={editing.pitchchoices[i] === p.value}
                                      onClick={() => {
                                        const updated = [...editing.pitchchoices];
                                        updated[i] = p.value;
                                        updateEditing({ pitchchoices: updated });
                                      }}
                                    >
                                      {p.label}
                                    </OptionPill>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </Tooltip>
                </Subsection>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Shared visual primitives
// ─────────────────────────────────────────────────────────────────────────
// Used by both the per-player editor (blue accent) and the bulk apply panel
// (purple accent). The two modes share spacing, typography, and component
// structure; only the accent color differs to telegraph "individual edit"
// vs "bulk action."

type Accent = "default" | "purple";

// Card — the visual container shared by every section. Single neutral style
// by default; purple variant for the bulk apply panel.
const Card = ({
  accent = "default",
  classes = "",
  children,
}: {
  accent?: Accent;
  classes?: string;
  children: React.ReactNode;
}) => {
  const accentClasses =
    accent === "purple"
      ? "border-purple-500/40 bg-purple-900/10"
      : "border-gray-700 bg-gray-800/50";
  return (
    <div className={`p-3 mb-3 rounded-lg border ${accentClasses} ${classes}`}>
      {children}
    </div>
  );
};

// Subsection — gray uppercase label that groups related fields inside a Card.
// No colored accents — color cues live only on the Card border and on
// selected pill buttons.
const Subsection = ({
  label,
  classes = "",
  children,
}: {
  label: string;
  classes?: string;
  children: React.ReactNode;
}) => (
  <div className={`mb-4 last:mb-0 ${classes}`}>
    <Text
      variant="xs"
      classes="font-semibold text-gray-400 uppercase tracking-wide mb-2 block"
    >
      {label}
    </Text>
    {children}
  </div>
);

// FieldLabel — left-aligned label that sits above a single field's controls.
const FieldLabel = ({ label }: { label: string }) => (
  <Text variant="small" classes="font-semibold text-gray-300 mb-1 block">
    {label}
  </Text>
);

// OptionPill — selectable pill button used for every enum/preset choice
// across the editor and bulk panel. Accent variant differentiates
// individual-edit (blue) from bulk (purple).
const OptionPill = ({
  selected,
  onClick,
  variant = "blue",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  variant?: "blue" | "purple";
  children: React.ReactNode;
}) => {
  const selectedClasses =
    variant === "purple"
      ? "bg-purple-600/30 border-purple-400 text-purple-200"
      : "bg-blue-600/20 border-blue-500 text-blue-300";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
        selected
          ? selectedClasses
          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
      }`}
    >
      {children}
    </button>
  );
};

// NumericStepper — −/+ buttons + numeric input. Single uniform sizing across
// every numeric field in the tab. `nullable` allows the value to be cleared
// (used for Pull at Pitch # and similar Default-able fields); `nullDefault`
// is the value used as the increment/decrement base when the current value
// is null.
const NumericStepper = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  nullable = false,
  nullDefault,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  nullable?: boolean;
  nullDefault?: number;
  placeholder?: string;
}) => {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const base = value ?? nullDefault ?? min;
  const decrement = () => onChange(Math.max(min, round2(base - step)));
  const increment = () => onChange(Math.min(max, round2(base + step)));
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={decrement}
        disabled={value != null && value <= min}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(nullable ? null : min);
          } else {
            const n = parseFloat(raw);
            onChange(Number.isNaN(n) ? (nullable ? null : min) : n);
          }
        }}
        placeholder={placeholder}
        className="w-24 px-2 py-1 text-sm text-center border rounded bg-black text-white border-gray-500 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0"
      />
      <button
        type="button"
        onClick={increment}
        disabled={value != null && value >= max}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
      >
        +
      </button>
    </div>
  );
};

// SmallActionButton — compact secondary action button used in the filter row
// and bulk panel header. Distinct from OptionPill in that it represents an
// action (Clear, Select visible) rather than a selectable choice.
const SmallActionButton = ({
  onClick,
  disabled = false,
  variant = "default",
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "purple";
  title?: string;
  children: React.ReactNode;
}) => {
  const variantClasses =
    variant === "purple"
      ? "border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
      : "border-gray-600 text-gray-300 hover:bg-gray-700";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`text-xs px-2 py-1 rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${variantClasses}`}
    >
      {children}
    </button>
  );
};
